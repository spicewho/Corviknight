const config = require("../config/configManager").default;
const { EmbedBuilder } = require("discord.js");
const fs = require("fs");
const path = require("path");
const COUNTER_PATH = path.join(__dirname, "../db/starboardCounts.json");

function loadCounters() {
  try {
    return JSON.parse(fs.readFileSync(COUNTER_PATH, "utf8"));
  } catch {
    return {};
  }
}
function saveCounters(data) {
  fs.writeFileSync(COUNTER_PATH, JSON.stringify(data, null, 2));
}

const pendingSpawns = new Map();
const countersDB = loadCounters();

function getGuildCounter(guildId) {
  if (!countersDB[guildId]) {
    countersDB[guildId] = {
      Rare: 0,
      Ultrabeast: 0,
      Regional: 0,
      Paradox: 0,
      Event: 0,
      Alpha: 0,
      Shiny: 0
    };
    saveCounters(countersDB);
  }

  return countersDB[guildId];
}
function incrementCounter(guildId, type) {
  const data = getGuildCounter(guildId);

  if (!data[type]) data[type] = 0;

  data[type]++;

  saveCounters(countersDB);
}

const TINKABOT_ID = "1059162235747975208";

function registerSpawn(message, name, rarity, isShiny) {
  pendingSpawns.set(message.channel.id, {
    name,
    rarity,
    isShiny,
    spawnedAt: Date.now(),
    catcherId: null
  });

  setTimeout(() => {
    pendingSpawns.delete(message.channel.id);
  }, 120000);
}

function parseCatchEmbed(embed) {
  const text = [
    embed.title,
    embed.description,
    ...(embed.fields?.map(f => `${f.name}\n${f.value}`) ?? [])
  ].join("\n");

  const levelMatch = text.match(/Level\s+(\d+)/i);
  const level = levelMatch ? levelMatch[1] : "Unknown";
  const ivLines = text.split("\n").filter(l => l.includes("IV:"));
  const maxIVs = [];

  for (const line of ivLines) {
    const match = line.match(/([A-Za-z.* ]+)\s+\d+\s+—\s+IV:\s+(\d+)\/31/);

    if (!match) continue;

    let stat = match[1]
      .replace(/\*/g, "")
      .replace(/Sp\. /, "Sp.")
      .trim();

    const iv = parseInt(match[2]);

    if (iv === 31) {
      maxIVs.push(stat);
    }
  }
  const maxIVText = maxIVs.length ? maxIVs.join(", ") : "None";
  const totalMatch = text.match(/Total IV:\s+([\d.]+)%/i);
  const totalIV = totalMatch ? totalMatch[1] : "0.00";
  const nameMatch = text.match(/^Level \d+\s+(.+?)(♀|♂)?$/m);
  const pokemon = nameMatch ? nameMatch[1].trim() : "Unknown";

  return {
    pokemon,
    level,
    maxIVText,
    totalIV
  };
}

async function handleMessage(message) {

  if (message.author.id !== TINKABOT_ID) return;

  const spawn = pendingSpawns.get(message.channel.id);
  if (!spawn) return;

  if (message.content.includes("was caught")) {

    const idMatch = message.content.match(/<@!?(\d+)>/);

    if (idMatch) {
      spawn.catcherId = idMatch[1];
    }

    if (spawn.isShiny === true) {
      shinyMsg = "✨";
    } else {
      shinyMsg = "false";
    }

    spawn.caught = true;
    return;
  }

  if (!spawn.caught || !message.embeds.length) return;

  const embed = message.embeds[0];

  const guildId = message.guildId;
  const cfg = config.get(guildId);

  if (!cfg.starboard?.enabled) return;

  let channelId = null;

  if (spawn.rarity === "Rare") channelId = cfg.starboard.rare;
  else if (spawn.rarity === "Ultrabeast") channelId = cfg.starboard.ub;
  else if (spawn.rarity === "Regional") channelId = cfg.starboard.regional;
  else if (spawn.rarity === "Paradox") channelId = cfg.starboard.paradox;
  else if (spawn.rarity === "Event") channelId = cfg.starboard.event;
  else if (spawn.rarity === "Alpha") channelId = cfg.starboard.alpha;
  else return;

  const channel = message.guild.channels.cache.get(channelId);
  if (!channel) return;

  let otName = "Unknown";

  const footerText = embed.footer?.text;

  if (footerText) {
    const match = footerText.match(/OT:\s*([^.|\n]+)/i);
    if (match) {
      otName = match[1].trim();
    }
  }

  const counters = getGuildCounter(guildId);

  if (spawn.rarity === "Rare") incrementCounter(guildId, "Rare");
  if (spawn.rarity === "Ultrabeast") incrementCounter(guildId, "Ultrabeast");
  if (spawn.rarity === "Regional") incrementCounter(guildId, "Regional");
  if (spawn.rarity === "Paradox") incrementCounter(guildId, "Paradox");
  if (spawn.rarity === "Event") incrementCounter(guildId, "Event");
  if (spawn.rarity === "Alpha") incrementCounter(guildId, "Alpha");

  const jumpLink =
    `https://discord.com/channels/${guildId}/${message.channel.id}/${message.id}`;

  const now = new Date();

  const date =
    `${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()} ` +
    `${now.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}`;



  const data = parseCatchEmbed(embed);
  const count = counters[spawn.rarity];
  const shinycount = counters["Shiny"];

  if (shinyMsg === "false") {
    const starboardEmbed = new EmbedBuilder()
      .setColor(embed.color ?? 0xf5c542)
      .setTitle(`${spawn.rarity} Catch #${count}`)
      .setDescription(
        `**Pokémon**: ${data.pokemon}\n` +
        `**Max IVs**: ${data.maxIVText}\n` +
        `*[Jump to message](${jumpLink})*`
      )
      .setThumbnail(embed.thumbnail?.url ?? null)
      .setImage(embed.image?.url)
      .setFields(
        {
          name: "Trainer",
          value: `<@${spawn.catcherId}>`,
          inline: true
        },
        {
          name: "Level",
          value: `${data.level}`,
          inline: true
        },
        {
          name: "IV Total",
          value: `${data.totalIV}%`,
          inline: true
        }
      )
      .setFooter({
        text: `${date} | OT: ${otName}`
      })

    await channel.send({
      embeds: [starboardEmbed]
    });
  } else {
    const shinyEmbed = new EmbedBuilder()
      .setColor(embed.color ?? 0xf5c542)
      .setTitle(`Shiny Catch #${shinycount}!!!`)
      .setDescription(
        `**Pokémon**: ${data.pokemon}\n` +
        `**Max IVs**: ${data.maxIVText}\n` +
        `*[Jump to message](${jumpLink})*`
      )
      .setThumbnail(embed.thumbnail?.url ?? null)
      .setImage(embed.image?.url)
      .setFields(
        {
          name: "Trainer",
          value: `<@${spawn.catcherId}>`,
          inline: true
        },
        {
          name: "Level",
          value: `${data.level}`,
          inline: true
        },
        {
          name: "IV Total",
          value: `${data.totalIV}%`,
          inline: true
        }
      )
      .setFooter({
        text: `${date} | OT: ${otName}`
      })
    await channel.send({
      embeds: [shinyEmbed]
    });
  }
  
  pendingSpawns.delete(message.channel.id);
}

module.exports = {
  registerSpawn,
  handleMessage
};
