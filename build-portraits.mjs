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

const local = {};
for (const [id, url] of Object.entries(src)) {
  if (!/^https?:\/\//.test(url)) { local[id] = url; console.log(`= ${id}: déjà local`); continue; }
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    const outName = `${id}.webp`;
    await sharp(buf)
      .resize({ width: 700, height: 875, fit: "cover", position: "top" })
      .webp({ quality: 82 })
      .toFile(path.join(outDir, outName));
    local[id] = `portraits/${outName}`;
    console.log(`✓ ${id} → portraits/${outName}`);
  } catch (e) {
    local[id] = url; // garde l'URL distante en secours
    console.log(`✗ ${id}: ${e.message} (conserve l'URL distante)`);
  }
}

const banner = "// KemetLeads — portraits auto-hébergés (WebP). Sources : Wikimedia Commons (licences libres).\n";
writeFileSync(imagesFile, banner + "window.LEADER_IMAGES = " + JSON.stringify(local, null, 2) + ";\n");
console.log(`\nÉcrit ${Object.keys(local).length} entrées dans public/images.js`);
