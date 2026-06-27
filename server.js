import express from "express";
import compression from "compression";
import helmet from "helmet";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.set("trust proxy", 1); // Railway terminates TLS; trust x-forwarded-proto for secure cookies
const PORT = process.env.PORT || 3000;

/* ---------- Persistent newsletter store (SQLite on a Railway volume) ---------- */
// DB lives on the mounted volume (default /app/data) so signups survive redeploys.
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "data", "subscribers.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.exec(
  "CREATE TABLE IF NOT EXISTS subscribers (" +
    "id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "email TEXT UNIQUE NOT NULL," +
    "created_at TEXT NOT NULL)"
);
const insertSub = db.prepare(
  "INSERT OR IGNORE INTO subscribers (email, created_at) VALUES (?, ?)"
);
const countSubs = db.prepare("SELECT COUNT(*) AS n FROM subscribers");

/* ---------- User accounts + sessions ---------- */
db.exec(
  "CREATE TABLE IF NOT EXISTS users (" +
    "id INTEGER PRIMARY KEY AUTOINCREMENT," +
    "email TEXT UNIQUE NOT NULL," +
    "pass_hash TEXT NOT NULL," +
    "created_at TEXT NOT NULL)"
);
db.exec(
  "CREATE TABLE IF NOT EXISTS sessions (" +
    "token TEXT PRIMARY KEY," +
    "user_id INTEGER NOT NULL," +
    "created_at TEXT NOT NULL," +
    "expires_at INTEGER NOT NULL)"
);
const insertUser = db.prepare("INSERT INTO users (email, pass_hash, created_at) VALUES (?, ?, ?)");
const getUserByEmail = db.prepare("SELECT * FROM users WHERE email = ?");
const getUserById = db.prepare("SELECT * FROM users WHERE id = ?");
const insertSession = db.prepare("INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)");
const getSession = db.prepare("SELECT * FROM sessions WHERE token = ?");
const delSession = db.prepare("DELETE FROM sessions WHERE token = ?");

const SESSION_DAYS = 30;
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString("hex");
  const dk = crypto.scryptSync(pw, salt, 64).toString("hex");
  return `${salt}:${dk}`;
}
function verifyPassword(pw, stored) {
  const [salt, key] = (stored || "").split(":");
  if (!salt || !key) return false;
  const dk = crypto.scryptSync(pw, salt, 64);
  const a = Buffer.from(key, "hex");
  return a.length === dk.length && crypto.timingSafeEqual(a, dk);
}
function createSession(userId) {
  const token = crypto.randomBytes(32).toString("hex");
  const now = Date.now();
  insertSession.run(token, userId, new Date(now).toISOString(), now + SESSION_DAYS * 86400000);
  return token;
}
function cookieToken(req) {
  const m = (req.headers.cookie || "").match(/(?:^|;\s*)kl_session=([a-f0-9]+)/);
  return m ? m[1] : null;
}
function sessionUser(req) {
  const tok = cookieToken(req);
  if (!tok) return null;
  const row = getSession.get(tok);
  if (!row) return null;
  if (row.expires_at < Date.now()) { delSession.run(tok); return null; }
  return getUserById.get(row.user_id) || null;
}
function setSessionCookie(req, res, token) {
  const secure = req.secure ? "; Secure" : "";
  res.setHeader("Set-Cookie", `kl_session=${token}; HttpOnly; Path=/; Max-Age=${SESSION_DAYS * 86400}; SameSite=Lax${secure}`);
}

/* ---------- Security headers (Helmet) + gzip compression ---------- */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://www.googletagmanager.com"],
        scriptSrcAttr: ["'unsafe-inline'"], // inline onerror image fallbacks
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://upload.wikimedia.org", "https://www.googletagmanager.com", "https://*.google-analytics.com"],
        connectSrc: ["'self'", "https://www.google-analytics.com", "https://*.google-analytics.com", "https://*.analytics.google.com", "https://www.googletagmanager.com"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        frameAncestors: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());
app.use(express.json());

/* ---------- Static assets with sensible caching ---------- */
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "1d",
    etag: true,
    setHeaders: (res, filePath) => {
      // Always revalidate HTML so content updates show immediately.
      if (filePath.endsWith(".html")) res.setHeader("Cache-Control", "no-cache");
      // Portraits change rarely — cache them hard.
      if (filePath.includes(`${path.sep}portraits${path.sep}`)) {
        res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
      }
    },
  })
);

/* ---------- Newsletter signup ---------- */
app.post("/api/subscribe", (req, res) => {
  const email = (req.body?.email || "").trim().toLowerCase();
  const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  if (!ok) return res.status(400).json({ error: "Please enter a valid email address." });
  try {
    insertSub.run(email, new Date().toISOString());
    res.json({ ok: true, message: "You're on the list. Welcome to KemetLeads." });
  } catch (e) {
    res.status(500).json({ error: "Could not save your subscription. Please try again." });
  }
});

/* ---------- Private subscriber export (CSV) ---------- */
// ponytail: query-string key guard — fine for a low-traffic admin link.
// Upgrade to a header/token + rate limit if the list ever gets sensitive.
const listSubs = db.prepare("SELECT email, created_at FROM subscribers ORDER BY created_at DESC");
app.get("/api/subscribers", (req, res) => {
  if (!process.env.ADMIN_KEY || req.query.key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const rows = listSubs.all();
  const csv = "email,created_at\n" + rows.map((r) => `${r.email},${r.created_at}`).join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=kemetleads-subscribers.csv");
  res.send(csv);
});

/* ---------- Auth ---------- */
// ponytail: no rate limiting yet — add a per-IP limiter if signup/login abuse appears.
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
app.post("/api/signup", (req, res) => {
  const email = (req.body?.email || "").trim().toLowerCase();
  const password = req.body?.password || "";
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: "Please enter a valid email address." });
  if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters." });
  if (getUserByEmail.get(email)) return res.status(409).json({ error: "An account with this email already exists." });
  const info = insertUser.run(email, hashPassword(password), new Date().toISOString());
  setSessionCookie(req, res, createSession(info.lastInsertRowid));
  res.json({ email });
});
app.post("/api/login", (req, res) => {
  const email = (req.body?.email || "").trim().toLowerCase();
  const password = req.body?.password || "";
  const user = getUserByEmail.get(email);
  if (!user || !verifyPassword(password, user.pass_hash)) return res.status(401).json({ error: "Wrong email or password." });
  setSessionCookie(req, res, createSession(user.id));
  res.json({ email: user.email });
});
app.post("/api/logout", (req, res) => {
  const tok = cookieToken(req);
  if (tok) delSession.run(tok);
  res.setHeader("Set-Cookie", "kl_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax");
  res.json({ ok: true });
});
app.get("/api/me", (req, res) => {
  const u = sessionUser(req);
  res.json({ email: u ? u.email : null });
});

app.get("/healthz", (_req, res) => {
  let subscribers = null;
  try { subscribers = countSubs.get().n; } catch (_e) {}
  res.json({ status: "ok", subscribers });
});

app.listen(PORT, () => {
  console.log(`KemetLeads running on port ${PORT} (db: ${DB_PATH})`);
});
