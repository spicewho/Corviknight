const { Client, GatewayIntentBits, ActivityType } = require("discord.js");
const crypto = require("crypto");
const sharp = require("sharp");
const axios = require("axios");

require('dotenv').config();
const token = process.env.DISCORD_TOKEN;

const hashIndex = require("./db/hashes.json");
const collections = require("./config/collectionManager.js");
const configManager = require("./config/configManager").default;
const rarityData = require("./db/rarity.json");

const newHashCommand = require("./commands/newhash.js");
const starboard = require("./commands/starboard.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const TINKABOT_ID = "1059162235747975208";

const statuses = [
  "Hiding from Tinkatuff",
  "Hiding from Tinkaton",
  "Resting",
  "Watching from above"
];

let statusIndex = 0;

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag} on shard ${client.shard?.ids?.[0] ?? "single"}`);

  setInterval(() => {
    client.user.setPresence({
      activities: [{ name: statuses[statusIndex], type: ActivityType.Custom }],
      status: "online",
    });

    statusIndex = (statusIndex + 1) % statuses.length;
  }, 50000);
});

async function detectPokemon(buffer) {
  const normalized = await sharp(buffer)
    .resize(256, 256, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();

  const hash = crypto.createHash("sha256").update(normalized).digest("hex");
  return hashIndex[hash] || null;
}

function formatPokemonName(name) {
  const parts = name.split("-");
  const base = parts[0];

  if (parts.length === 1) {
    return capitalize(base);
  }
  const form = parts.slice(1).join("-");
  const formKey = form.toLowerCase();

  if (formKey === "galar") return `Galarian ${capitalize(base)}`;
  if (formKey === "alola") return `Alolan ${capitalize(base)}`;
  if (formKey === "hisui") return `Hisuian ${capitalize(base)}`;
  if (formKey === "paldea") return `Paldean ${capitalize(base)}`;
  if (base === "iron" || base === "Great" || base === "Scream" || base === "Flutter" || base === "Slither" || base === "Roaring" || base === "Walking" || base === "Sandy" || base === "Brute" || base === "Raging" || base === "Gouging") {
    return `${capitalize(form)} ${capitalize(base)}`;
  }

  return `${capitalize(form.replace("-", " "))} ${capitalize(base)}`;
}

function getRarity(name, data) {
  const normalized = formatPokemonName(name);

  if (data.Event.includes(normalized)) return "Event";
  if (data.Legendary.includes(normalized) || data.Mythical.includes(normalized)) return "Rare";
  if (data.Regionals.includes(normalized)) return "Regional";
  if (data.Paradox.includes(normalized)) return "Paradox";

  return "Normal";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}







const wtpManager = require("./config/wtpManager");
const timers = wtpManager.load();

for (const [userId, data] of Object.entries(timers)) {

  if (!data?.end || !data?.channel) continue;
  const delay = data.end - Date.now();
  
  if (delay <= 0) {
    wtpManager.clearTimer(userId);
    continue;
  }

  setTimeout(async () => {
    try {
      const channel = await client.channels.fetch(data.channel);
      await channel.send(`<@${userId}> wtp timer ended, guess away!`);
      wtpManager.clearTimer(userId);
    } catch (err) {
      console.error("WTP timer error:", err);
    }
  }, delay);
}







const setupCommand = require("./commands/setup");
const collectionCommand = require("./commands/collection");
const helpCommand = require("./commands/help");
const inviteCommand = require("./commands/invite");
const wtpCommand = require("./commands/wtp");

const shardsCommand = require("./commands/shards");
const configCommand = require("./commands/config");

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "setup") {
    return setupCommand(interaction);
  }

  if (interaction.commandName === "collection") {
    return collectionCommand(interaction);
  }

  if (interaction.commandName === "help") {
    return helpCommand.slash(interaction);
  }

  if (interaction.commandName === "invite") {
    return inviteCommand.slash(interaction);
  }

  if (interaction.commandName === "wtp") {
    return wtpCommand(interaction);
  }

  if (interaction.commandName === "config") {
    return configCommand(interaction);
  }


  if (interaction.commandName === "shards") {
    return shardsCommand.execute(interaction, client);
  }

  if (interaction.commandName === "config") {
    return configCommand(interaction);
  }
});










const pendingWTP = new Map();
const activeWTP = new Map();

function extractUser(text) {
  const match = text.match(/<@!?(\d+)>/);
  return match ? match[1] : null;
}

client.on("messageCreate", async (message) => {
  if (message.author.id === "560620271992700957") {
    await newHashCommand(message, hashIndex);
  }
  if (message.content === "c!help") {
    return helpCommand.message(message);
  }
  const wtpRegex = /^(?:[a-zA-Z0-9]{0,2}[!.,-?;:]?)?wtp\b/i;
  
  if (wtpRegex.test(message.content)) {
    pendingWTP.set(message.channel.id, message.author.id);
  }
  if (message.author.id === TINKABOT_ID) {
    if (message.embeds[0]?.title?.includes("Who's that Pokémon")) {
      const userId = pendingWTP.get(message.channel.id);

      if (userId) {
        activeWTP.set(message.channel.id, userId);
      }
    }
  }
  if (message.author.id === TINKABOT_ID) {
    const embed = message.embeds[0];

    if (embed?.description?.includes("got it!")) {
      const userId = extractUser(embed.description);

      wtpManager.startTimer(userId, message.channel.id);
      pendingWTP.delete(message.channel.id);
      activeWTP.delete(message.channel.id);
    }
  }

  try {
    const cfg = configManager.get(message.guildId);
    const roles = cfg.roles || {};

    if (message.author.id !== TINKABOT_ID) return;
    if (!message.embeds.length) return;
    const embed = message.embeds[0];

    if (!embed.title?.includes("Tinkabot detected something")) return;
    const imageUrl = embed.image?.url;

    if (!imageUrl) return;
    const response = await axios({
      url: imageUrl,
      responseType: "arraybuffer",
      timeout: 10000
    });

    const buffer = Buffer.from(response.data);
    const result = await detectPokemon(buffer);

    if (!result) {
      console.log("Unknown spawn");
      return;
    }

    const formattedName = formatPokemonName(result.name);
    const rarity = getRarity(formattedName, rarityData);

    console.log(`Spawn: ${formattedName} | ${rarity}`);

    const db = collections.getAllUsers();

    let pings = [];

    const rareRole = roles.rare;
    const regionalRole = roles.regional;
    const eventRole = roles.event;
    const paradoxRole = roles.paradox;

    for (const [userId, list] of Object.entries(db)) {
      if (list.includes(formattedName)) {
        pings.push(`<@${userId}>`);
      }
    }

    if (rarity === "Rare") {
      if (pings.length > 0) {
        await message.channel.send(`<a:tinkaton:1492017092608921600> <@&${rareRole}> **${formattedName}** spawned\nCollection pings: ${pings.join(" ")}`);
      }
      else {
        await message.channel.send(`<a:tinkaton:1492017092608921600> <@&${rareRole}> **${formattedName}**`);
      }
      await starboard.handleStarboard(message, formattedName, rarity);
    }
    else if (rarity === "Regional") {
      if (pings.length > 0) {
        await message.channel.send(`<a:tinkatuff:1492016933124702218> <@&${regionalRole}> **${formattedName}** spawned\nCollection pings: ${pings.join(" ")}`);
      }
      else {
        await message.channel.send(`<a:tinkatuff:1492016933124702218> <@&${regionalRole}> **${formattedName}**`);
      }
      await starboard.handleStarboard(message, formattedName, rarity);
    }
    else if (rarity === "Paradox") {
      if (pings.length > 0) {
        await message.channel.send(`<a:tinkatink:1492016783450837052> <@&${paradoxRole}> **${formattedName}** spawned\nCollection pings: ${pings.join(" ")}`);
      }
      else {
        await message.channel.send(`<a:tinkatink:1492016783450837052> <@&${paradoxRole}> **${formattedName}**`);
      }
    }
    else if (rarity === "Event") {
      if (pings.length > 0) {
        await message.channel.send(`<a:tinkaton:1492017092608921600> <@&${eventRole}> **${formattedName}** spawned\nCollection pings: ${pings.join(" ")}`);
      }
      else {
        await message.channel.send(`<a:tinkaton:1492017092608921600> <@&${eventRole}> **${formattedName}**`);
      }
      await starboard.handleStarboard(message, formattedName, rarity);
    }
    if (pings.length > 0) {
      await message.channel.send(`${formattedName} spawned\nCollection pings: ${pings.join(" ")} `);
    }

  } catch (err) {
    console.error("Spawn detection error:", err);
  }

});

client.login(token);