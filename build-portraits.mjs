// Download the Wikimedia portraits referenced in public/images.js, convert them
// to optimized local WebP under public/portraits/, and rewrite images.js to point
// at the local files. Run: node build-portraits.mjs
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesFile = path.join(__dirname, "public", "images.js");
const outDir = path.join(__dirname, "public", "portraits");
mkdirSync(outDir, { recursive: true });

// Parse window.LEADER_IMAGES = {...};
const raw = readFileSync(imagesFile, "utf8")
  .replace(/^\/\/.*\n/, "")
  .replace(/^window\.LEADER_IMAGES\s*=\s*/, "")
  .replace(/;\s*$/, "");
const src = JSON.parse(raw);
const UA = "KemetLeads/1.0 (https://kemetleads.com)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Fetch with retry/back-off so Wikimedia rate limits (HTTP 429) don't drop images.
async function fetchBuf(url) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    if (res.status === 429 && attempt < 4) { await sleep(attempt * 2500); continue; }
    throw new Error(`HTTP ${res.status}`);
  }
}

const local = {};
for (const [id, url] of Object.entries(src)) {
  if (!/^https?:\/\//.test(url)) { local[id] = url; console.log(`= ${id}: déjà local`); continue; }
  try {
    const buf = await fetchBuf(url);
    const outName = `${id}.webp`;
    // Portrait 4:5 crop centered on the most salient region (the face), so the
    // full head AND neck/shoulders stay visible in the card frame.
    await sharp(buf)
      .resize({ width: 720, height: 900, fit: "cover", position: sharp.strategy.attention })
      .webp({ quality: 82 })
      .toFile(path.join(outDir, outName));
    local[id] = `portraits/${outName}`;
    console.log(`✓ ${id} → portraits/${outName}`);
    await sleep(250); // be gentle with Wikimedia
  } catch (e) {
    local[id] = url; // garde l'URL distante en secours
    console.log(`✗ ${id}: ${e.message} (conserve l'URL distante)`);
  }
}

const banner = "// KemetLeads — portraits auto-hébergés (WebP). Sources : Wikimedia Commons (licences libres).\n";
writeFileSync(imagesFile, banner + "window.LEADER_IMAGES = " + JSON.stringify(local, null, 2) + ";\n");
console.log(`\nÉcrit ${Object.keys(local).length} entrées dans public/images.js`);
