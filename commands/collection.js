const collectionManager = require("../config/collectionManager");
const config = require("../config/configManager").default;
const pokemonNames = require("../db/pokemonNames.json");

function normalize(str) {
  let formatted = str.toLowerCase().trim().replace(/\s+/g, "-");

  const parts = formatted.split("-");
  const pname = parts[0];
  const string = parts.slice(1).join("-");

  if (
    pname === "hisuian" ||
    pname === "alolan" ||
    pname === "galarian" ||
    pname === "paldean"
  ) {
    const regionMap = {
      hisuian: "hisui",
      galarian: "galar",
      paldean: "paldea",
      alolan: "alola"
    };
    if (!string) return regionMap[pname];

    return `${string}-${regionMap[pname]}`;
  }

  return formatted;
}

function capitalize(str) {
  return str
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function parseList(input) {
  return input
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);
}

function findPokemon(input) {
  const normalized = normalize(input);
  for (const name of Object.values(pokemonNames)) {
    if (normalize(name) === normalized) {
      return name;
    }
  }
  return null;
}

module.exports = async (interaction) => {
  const sub = interaction.options.getSubcommand();
  const guildId = interaction.guildId;
  const userId = interaction.user.id;



  if (sub === "add") {
    const input = interaction.options.getString("pokemon");
    const list = parseList(input);

    const cfg = config.get(guildId);
    const limit = cfg.collection?.limit ?? 25;

    const current = collectionManager.list(userId);

    const added = [];
    const invalid = [];
    const exists = [];
    const skippedLimit = [];

    for (const entry of list) {
      const realName = findPokemon(entry);
      if (!realName) {
        invalid.push(entry);
        continue;
      }
      if (current.includes(realName)) {
        exists.push(entry);
        continue;
      }
      if (current.length >= limit) {
        skippedLimit.push(realName);
        continue;
      }
      current.push(realName);
      added.push(realName);
    }

    const currentLimit = current.length + "/" + limit;

    collectionManager.overwrite(userId, current);

    let msg = [];

    if (added.length)
      msg.push(`**Added to collection**: \`${added.map(capitalize).join("\`, \`")}\``);

    if (skippedLimit.length)
      msg.push(`**Server collection limit reached! Not added**: \`${skippedLimit.map(capitalize).join("\`, \`")}\``);

    if (exists.length)
      msg.push(`**Already in your collection**: \`${exists.map(capitalize).join("\`, \`")}\``);

    if (invalid.length)
      msg.push(`**Pokemon doesn't exist**: \`${invalid.map(capitalize).join("\`, \`")}\`\n-# Found a bug? Report it here - .gg/Yx2dMpfrGd`);

    msg.push("-# *Collecting " + currentLimit + " pokemon*");

    return interaction.reply({
      content: msg.join("\n") || "**Nothing was added.**",
      ephemeral: false
    });
  }



  if (sub === "remove") {
    const input = interaction.options.getString("pokemon");
    const list = parseList(input);

    const current = collectionManager.list(userId);

    const cfg = config.get(guildId);
    const limit = current.length + "/" + cfg.collection?.limit ?? 25;

    const removed = [];
    const notFound = [];

    for (const entry of list) {
      const realName = findPokemon(entry);

      if (!realName || !current.includes(realName)) {
        notFound.push(entry);
        continue;
      }

      removed.push(realName);
    }
    const currentLimit = limit;
    const updated = current.filter(p => !removed.includes(p));

    collectionManager.overwrite(userId, updated);

    let msg = [];

    if (removed.length)
      msg.push(`**Removed** \`${removed.map(capitalize).join("\`, \`")}\` **from your collection.**\n`);
    if (notFound.length) {
      msg.push(`Not in collection: \`${notFound.join("\`, \`")}\``);
    }
    msg.push(`-# Collection: ` + currentLimit);
    return interaction.reply({
      content: msg.join("\n") || "Nothing removed.",
      ephemeral: false
    });
  }



  if (sub === "list") {
    const items = collectionManager.list(userId);
    const cfg = config.get(guildId);
    const limit = items.length + "/" + cfg.collection?.limit ?? 25;

    return interaction.reply({
      content: items.length
        ? "**Collection pings enabled for**:\n\`" + items.map(capitalize).join("\`, \`") + "\`\n-# *You are currently collecting " + limit + " Pokemon.*"
        : "Your collection is empty.",
      ephemeral: false
    });
  }



  if (sub === "clear") {
    collectionManager.clear(userId);

    return interaction.reply({
      content: "Collection cleared.",
      ephemeral: true
    });
  }
};