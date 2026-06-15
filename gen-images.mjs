// Fetch freely-licensed portrait thumbnails from Wikipedia REST API and
// write public/images.js as window.LEADER_IMAGES = { id: url, ... }.
import { writeFileSync } from "node:fs";

const MAP = {
  mandela: "Nelson Mandela",
  nkrumah: "Kwame Nkrumah",
  sankara: "Thomas Sankara",
  nyerere: "Julius Nyerere",
  lumumba: "Patrice Lumumba",
  selassie: "Haile Selassie",
  senghor: "Léopold Sédar Senghor",
  maathai: "Wangari Maathai",
  fela: "Fela Kuti",
  sirleaf: "Ellen Johnson Sirleaf",
  "okonjo-iweala": "Ngozi Okonjo-Iweala",
  kagame: "Paul Kagame",
  ramaphosa: "Cyril Ramaphosa",
  samia: "Samia Suluhu Hassan",
  adesina: "Akinwumi Adesina",
  dangote: "Aliko Dangote",
  adichie: "Chimamanda Ngozi Adichie",
  etoo: "Samuel Eto'o",
};

const UA = "KemetLeads/1.0 (https://kemetleads.com; contact@kemetleads.com)";

async function fetchThumb(title) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetch(url, { headers: { "User-Agent": UA, accept: "application/json" } });
  if (!res.ok) throw new Error(`${title}: HTTP ${res.status}`);
  const data = await res.json();
  let src = data?.thumbnail?.source || data?.originalimage?.source || null;
  // Upscale Wikimedia thumbnail to ~500px for a crisp portrait.
  if (src) src = src.replace(/\/\d+px-/, "/500px-");
  return src;
}

const out = {};
for (const [id, title] of Object.entries(MAP)) {
  try {
    const src = await fetchThumb(title);
    if (src) {
      out[id] = src;
      console.log(`✓ ${id}: ${src}`);
    } else {
      console.log(`– ${id}: no image`);
    }
  } catch (e) {
    console.log(`✗ ${id}: ${e.message}`);
  }
}

const banner = "// KemetLeads — portrait URLs (Wikimedia Commons / Wikipedia, freely licensed). Auto-generated.\n";
writeFileSync(
  new URL("./public/images.js", import.meta.url),
  banner + "window.LEADER_IMAGES = " + JSON.stringify(out, null, 2) + ";\n"
);
console.log(`\nWrote ${Object.keys(out).length}/${Object.keys(MAP).length} images to public/images.js`);
