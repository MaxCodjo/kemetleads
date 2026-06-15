import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Simple in-memory newsletter signup capture (demo). Swap for a real store later.
const subscribers = [];
app.post("/api/subscribe", (req, res) => {
  const email = (req.body?.email || "").trim();
  const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
  if (!ok) return res.status(400).json({ error: "Please enter a valid email address." });
  subscribers.push({ email, at: new Date().toISOString() });
  res.json({ ok: true, message: "You're on the list. Welcome to AfricaLeads." });
});

app.get("/healthz", (_req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`AfricaLeads running on port ${PORT}`);
});
