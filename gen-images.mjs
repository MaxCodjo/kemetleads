// Fetch HIGH-DEFINITION, freely-licensed portrait thumbnails from the Wikipedia
// pageimages API (pithumbsize) and write public/images.js as
// window.LEADER_IMAGES = { id: url, ... }.
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
  menelik: "Menelik II",
  nasser: "Gamal Abdel Nasser",
  biko: "Steve Biko",
  tutu: "Desmond Tutu",
  cabral: "Amílcar Cabral",
  mugabe: "Robert Mugabe",
  yaaasantewaa: "Yaa Asantewaa",
  abiy: "Abiy Ahmed",
  tinubu: "Bola Tinubu",
  weah: "George Weah",
  soyinka: "Wole Soyinka",
  moibrahim: "Mo Ibrahim",
  gaddafi: "Muammar Gaddafi",
  kerekou: "Mathieu Kérékou",
  kenyatta: "Jomo Kenyatta",
  sekoutoure: "Ahmed Sékou Touré",
  houphouet: "Félix Houphouët-Boigny",
  kaunda: "Kenneth Kaunda",
  machel: "Samora Machel",
  bourguiba: "Habib Bourguiba",
  benbella: "Ahmed Ben Bella",
  luthuli: "Albert Lutuli",
  diop: "Cheikh Anta Diop",
  makeba: "Miriam Makeba",
  ngugi: "Ngũgĩ wa Thiong'o",
  hatshepsut: "Hatshepsut",
  ruto: "William Ruto",
  faye: "Bassirou Diomaye Faye",
  museveni: "Yoweri Museveni",
  hichilema: "Hakainde Hichilema",
  kipchoge: "Eliud Kipchoge",
  elumelu: "Tony Elumelu",
  ndour: "Youssou N'Dour",
  gracamachel: "Graça Machel",
  mansamusa: "Mansa Musa",
  samori: "Samori Ture",
  piye: "Piye",
  nzinga: "Nzinga of Ndongo and Matamba",
  hannibal: "Hannibal",
  mondlane: "Eduardo Mondlane",
  tambo: "Oliver Tambo",
  kimathi: "Dedan Kimathi",
  funmilayo: "Funmilayo Ransome-Kuti",
  boganda: "Barthélemy Boganda",
  kidjo: "Angélique Kidjo",
  burnaboy: "Burna Boy",
  lupita: "Lupita Nyong'o",
  drogba: "Didier Drogba",
  salah: "Mohamed Salah",
  mane: "Sadio Mané",
  tedros: "Tedros Adhanom Ghebreyesus",
  bensouda: "Fatou Bensouda",
  motsepe: "Patrice Motsepe",
  masiyiwa: "Strive Masiyiwa",
};

const UA = "KemetLeads/1.0 (https://kemetleads.com; contact@kemetleads.com)";
const SIZE = 1000; // HD width

async function fetchThumb(title) {
  const u = new URL("https://en.wikipedia.org/w/api.php");
  u.search = new URLSearchParams({
    action: "query",
    format: "json",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: String(SIZE),
    titles: title,
    redirects: "1",
  }).toString();
  const res = await fetch(u, { headers: { "User-Agent": UA, accept: "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const pages = data?.query?.pages || {};
  const first = Object.values(pages)[0];
  return first?.thumbnail?.source || null;
}

const out = {};
for (const [id, title] of Object.entries(MAP)) {
  try {
    const src = await fetchThumb(title);
    if (src) {
      out[id] = src;
      const w = (src.match(/\/(\d+)px-/) || [])[1] || "orig";
      console.log(`✓ ${id}: ${w}px`);
    } else {
      console.log(`– ${id}: no image`);
    }
  } catch (e) {
    console.log(`✗ ${id}: ${e.message}`);
  }
}

const banner = "// KemetLeads — HD portrait URLs (Wikimedia Commons / Wikipedia, freely licensed). Auto-generated.\n";
writeFileSync(
  new URL("./public/images.js", import.meta.url),
  banner + "window.LEADER_IMAGES = " + JSON.stringify(out, null, 2) + ";\n"
);
console.log(`\nWrote ${Object.keys(out).length}/${Object.keys(MAP).length} HD images to public/images.js`);
