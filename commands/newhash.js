
const crypto = require("crypto");
const sharp = require("sharp");
const axios = require("axios");
const fs = require("fs");

const HASH_FILE = "./db/hashes.json";

module.exports = async function newHashCommand(message, hashIndex) {
  if (!message.content.startsWith("t!newhash")) return;
  const args = message.content.split(/\s+/);

  if (args.length < 3) {
    return message.reply("Usage: `t!newhash <pokemon_name> <dex_number>` with an image attached.");
  }

  const name = args[1].toLowerCase();
  const dex = Number(args[2]);

  if (Number.isNaN(dex)) {
    return message.reply("Dex number must be a valid number.");
  }
  const attachment = message.attachments.first();
  if (!attachment) {
    return message.reply("You must attach the Pokémon image.");
  }
  try {
    const response = await axios({
      url: attachment.url,
      responseType: "arraybuffer"
    });

    const normalized = await sharp(response.data)
      .resize(256, 256, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    const hash = crypto.createHash("sha256")
      .update(normalized)
      .digest("hex");

    const hashes = JSON.parse(fs.readFileSync(HASH_FILE));
    hashes[hash] = {
      name: name,
      dex: dex
    };
    fs.writeFileSync(HASH_FILE, JSON.stringify(hashes, null, 2));

    hashIndex[hash] = { name, dex };
    await message.reply(`✅ Added **${name} (#${dex})** to hash index.`);

    console.log(`New hash added: ${name} (#${dex})`);
  } catch (err) {
    console.error("Hash add error:", err);
    message.reply("Failed to add hash.");
  }

};