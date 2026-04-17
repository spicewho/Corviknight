const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const sharp = require("sharp");

const IMAGE_DIR = "C:\\Users\\Spice\\Desktop\\Corviknight\\official-artwork";
const OUTPUT_FILE = "../db/hashes.json";
const names = require("../pokemonNames.json");

async function normalizeImage(filePath) {
  return sharp(filePath)
    .resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function buildIndex() {
  const index = {};
  const files = fs.readdirSync(IMAGE_DIR);

  console.log(`Hashing\n`);

  for (const file of files) {
    if (!file.endsWith(".png")) continue;
    const dex = path.parse(file).name;
    const name = names[dex];

    if (!name) {
      console.log(`Missing: ${dex}`);
      continue;
    }

    const filePath = path.join(IMAGE_DIR, file);
    const normalized = await normalizeImage(filePath);
    const hash = sha256(normalized);

    index[hash] = {
      dex: Number(dex),
      name: name
    };

    console.log(`#${dex} ${name} -> ${hash.slice(0,16)}...`);
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(index, null, 2));

  console.log("\nIndex complete!");
  console.log(`Saved to ${OUTPUT_FILE}`);
}

buildIndex();