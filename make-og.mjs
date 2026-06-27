// One-shot: render the social share card. Run: node make-og.mjs
import sharp from "sharp";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#111111"/>
  <rect x="28" y="28" width="1144" height="574" fill="none" stroke="#b8924a" stroke-width="2"/>
  <g font-family="Georgia, 'Times New Roman', serif">
    <rect x="80" y="86" width="64" height="64" rx="6" fill="#b8924a"/>
    <text x="112" y="130" font-size="30" font-weight="700" fill="#111111" text-anchor="middle" font-family="Helvetica, Arial, sans-serif">KL</text>
    <text x="164" y="130" font-size="34" font-weight="700" fill="#f4ece0">KemetLeads</text>
    <text x="80" y="232" font-size="20" letter-spacing="6" fill="#b8924a" font-family="Helvetica, Arial, sans-serif">INTELLIGENCE · PROFILES · LEGACY</text>
    <text x="80" y="320" font-size="72" font-weight="700" fill="#ffffff">Understand Africa</text>
    <text x="80" y="404" font-size="72" font-weight="700" fill="#ffffff">before it makes the news.</text>
    <text x="80" y="500" font-size="26" fill="#b3aa9c" font-family="Helvetica, Arial, sans-serif">The great leaders of the continent — past and present.</text>
  </g>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile("public/og.png");
console.log("wrote public/og.png");
