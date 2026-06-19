import express from "express";
import compression from "compression";
import helmet from "helmet";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
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

/* ---------- Security headers (Helmet) + gzip compression ---------- */
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"], // inline onerror image fallbacks
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://upload.wikimedia.org"],
        connectSrc: ["'self'"],
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

app.get("/healthz", (_req, res) => {
  let subscribers = null;
  try { subscribers = countSubs.get().n; } catch (_e) {}
  res.json({ status: "ok", subscribers });
});

app.listen(PORT, () => {
  console.log(`KemetLeads running on port ${PORT} (db: ${DB_PATH})`);
});
