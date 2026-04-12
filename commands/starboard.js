const config = require("../config/configManager").default;

async function handleStarboard(message, formattedName, rarity) {
  const guildId = message.guildId;
  if (!guildId) return;

  const cfg = config.get(guildId);

  if (!cfg.starboard?.enabled) return;

  let channelId = null;

  if (rarity === "Rare") channelId = cfg.starboard.rare;
  else if (rarity === "Regional") channelId = cfg.starboard.regional;
  else if (rarity === "Event") channelId = cfg.starboard.event;
  else return;

  const channel = message.guild.channels.cache.get(channelId);
  if (!channel) return;

  await channel.send(`⭐ **${formattedName}** spawned (**${rarity}**)`);
}

module.exports = { handleStarboard };