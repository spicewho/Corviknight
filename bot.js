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

const disboardBump = require("./util/disboard");

const activeUsers = new Map();
const collectionTimeout = 2 * 60 * 60 * 1000;

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

const { EmbedBuilder, ChannelType, PermissionsBitField } = require("discord.js");

client.on("guildCreate", async (guild) => {
  let channel = guild.systemChannel;
  if (
    !channel ||
    !channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages)
  ) {
    channel = guild.channels.cache
      .filter(c =>
        c.type === ChannelType.GuildText &&
        c.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages)
      )
      .sort((a, b) => a.position - b.position)
      .first();
  }
  if (!channel) return;

  let tinkabotMessage;

  try {
    const tinkabot = await guild.members.fetch(TINKABOT_ID);

    if (tinkabot) {
      tinkabotMessage = "✅ Tinkabot is here! Need to hide...";
    }
  } catch {
    tinkabotMessage =
      "⚠️ I see Tinkabot isn't here. She is required for Corviknight's features to function.\n" +
      "You can still use `/setup` and `/collection` commands in the meantime!";
  }

  const now = new Date();
  const time =
    `${now.getMonth() + 1}/${now.getDate()} ` +
    `${now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  const embed = new EmbedBuilder()
    .setTitle("Touch down.")
    .setColor(0x5865F2)
    .setDescription(
      "Corviknight just landed. Thanks for inviting me!\n" +
      "Use `/help` for a list of commands.\n\n" +
      tinkabotMessage
    )
    .setFooter({
      text: `${time} | ${guild.name}`
    });

  try {
    await channel.send({ embeds: [embed] });
  } catch (err) {
    console.error("Failed to send join message:", err);
  }
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
  const base2 = parts[1];
  const base3 = parts[2];

  if (parts.length === 1) {
    return capitalize(base);
  }

  const formKey = base2.toLowerCase();

  if (formKey === "galar") return `Galarian ${capitalize(base)}`;
  if (base3 === "galar") return `Galarian ${capitalize(base) + " " + capitalize(base2)}`;
  if (formKey === "alola") return `Alolan ${capitalize(base)}`;
  if (formKey === "hisui") return `Hisuian ${capitalize(base)}`;
  if (formKey === "paldea") return `Paldean ${capitalize(base)}`;
  if (base === "founder" || base === "iron" || base === "great" || base === "scream" || base === "flutter" || base === "slither" || base === "roaring" || base === "walking" || base === "sandy" || base === "brute" || base === "raging" || base === "gouging") {
    return `${capitalize(base)} ${capitalize(base2)}`;
  }

  if (base3) { 
    return `${capitalize(base)} ${capitalize(base2)} ${capitalize(base3)}`;
  }
  else {
    return `${capitalize(base)} ${capitalize(base2)}`;
  }
}



function getRarity(name, data) {
  const normalized = name;

  if (data.Event.includes(normalized)) return "Event";
  if (data.Legendary.includes(normalized) || data.Mythical.includes(normalized)) return "Rare";
  if (data.Regionals.includes(normalized)) return "Regional";
  if (data.Paradox.includes(normalized)) return "Paradox";
  if (data.Ultrabeast.includes(normalized)) return "Ultrabeast";

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


  /* if (interaction.commandName === "shards") {
    return shardsCommand.execute(interaction, client);
  } */

  if (interaction.commandName === "config") {
    return configCommand(interaction);
  }
});




function isUserActive(userId) {
  const lastActive = activeUsers.get(userId);

  if (!lastActive) return false;

  if (Date.now() - lastActive > collectionTimeout) {
    activeUsers.delete(userId);
    return false;
  }

  return true;
}








const pendingWTP = new Map();
const activeWTP = new Map();

function extractUser(text) {
  const match = text.match(/<@!?(\d+)>/);
  return match ? match[1] : null;
}


client.on("messageCreate", async (message) => {
  await disboardBump(message);
  await starboard.handleMessage(message);

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
    const userMatch = message.content.match(/<@!?(\d+)>/);
    const catchMatch = message.content.includes("was caught.");

    if (userMatch && catchMatch) {
      const catchUserId = userMatch[1];

      activeUsers.set(catchUserId, Date.now());
    }
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
    const starboardc = cfg.starboard || {};
    const collection = cfg.collection || {};

    const isShiny = message.content.includes("✨");

    if (message.author.id !== TINKABOT_ID) return;
    if (!message.embeds.length) return;
    
    const embed = message.embeds[0];

    if (!embed.title?.includes("Tinkabot detected something")) return;

    const isAlpha = embed.description?.includes("ALPHA");
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
    let rarity = getRarity(formattedName, rarityData);

    if (isAlpha) {
      rarity = "Alpha";
    }

    console.log(`Spawn: ${formattedName} | ${rarity}`);

    const db = collections.getAllUsers();

    let pings = [];

    const normalizedSpawn = formattedName.toLowerCase();

    for (const [userId, list] of Object.entries(db)) {
      if (!isUserActive(userId)) continue;
      if (list.some(p => p.toLowerCase() === normalizedSpawn)) {
        pings.push(`<@${userId}>`);
      }
    }

    const rareRole = roles.rare;
    const regionalRole = roles.regional;
    const eventRole = roles.event;
    const paradoxRole = roles.paradox;
    const ubRole = roles.ub;
    const alphaRole = roles.alpha;


    if (rarity === "Rare") {
      if (pings.length > 0) {
        await message.channel.send(`<a:tinkaton:1492017092608921600> <@&${rareRole}> **${formattedName}** spawned\nCollection pings: ${pings.join(" ")}`);
      }
      else {
        await message.channel.send(`<a:tinkaton:1492017092608921600> <@&${rareRole}> **${formattedName}**`);
      }
      if (starboardc.enabled === true) {
        starboard.registerSpawn(message, formattedName, rarity, isShiny);
      }
    }
    else if (rarity === "Ultrabeast") {
      if (pings.length > 0) {
        await message.channel.send(`<a:tinkaton:1492017092608921600> <@&${ubRole}> **${formattedName}** spawned\nCollection pings: ${pings.join(" ")}`);
      }
      else {
        await message.channel.send(`<a:tinkaton:1492017092608921600> <@&${ubRole}> **${formattedName}**`);
      }
      if (starboardc.enabled === true) {
        starboard.registerSpawn(message, formattedName, rarity, isShiny);
      }
    }
    else if (rarity === "Regional") {
      if (pings.length > 0) {
        await message.channel.send(`<a:tinkatuff:1492016933124702218> <@&${regionalRole}> **${formattedName}** spawned\nCollection pings: ${pings.join(" ")}`);
      }
      else {
        await message.channel.send(`<a:tinkatuff:1492016933124702218> <@&${regionalRole}> **${formattedName}**`);
      }
      if (starboardc.enabled === true) {
        starboard.registerSpawn(message, formattedName, rarity, isShiny);
      }
    }
    else if (rarity === "Paradox") {
      if (pings.length > 0) {
        await message.channel.send(`<a:tinkatink:1492016783450837052> <@&${paradoxRole}> **${formattedName}** spawned\nCollection pings: ${pings.join(" ")}`);
      }
      else {
        await message.channel.send(`<a:tinkatink:1492016783450837052> <@&${paradoxRole}> **${formattedName}**`);
      }
      if (starboardc.enabled === true) { 
        starboard.registerSpawn(message, formattedName, rarity, isShiny);
      }
    }
    else if (rarity === "Event") {
      if (pings.length > 0) {
        await message.channel.send(`<a:tinkaton:1492017092608921600> <@&${eventRole}> **${formattedName}** spawned\nCollection pings: ${pings.join(" ")}`);
      }
      else {
        await message.channel.send(`<a:tinkaton:1492017092608921600> <@&${eventRole}> **${formattedName}**`);
      }
      if (starboardc.enabled === true) {
        starboard.registerSpawn(message, formattedName, rarity, isShiny);
      }
    }
    else if (rarity === "Alpha") {
      if (pings.length > 0) {
        await message.channel.send(
          `<@&${alphaRole}> **Alpha ${formattedName}** appeared!\nCollection pings: ${pings.join(" ")}`
        );
      } else {
        await message.channel.send(
          `<@&${alphaRole}> **Alpha ${formattedName}** appeared!`
        );
      }
      if (starboardc.enabled === true) { 
        starboard.registerSpawn(message, formattedName, rarity, isShiny);
      }
    }
    else if (rarity === "Normal" && pings.length > 0) {
      await message.channel.send(
        `**${formattedName}** spawned\nCollection pings: ${pings.join(" ")}`
      );
    }
  } catch (err) {
    console.error("Spawn detection error:", err);
  }
});

client.login(token);