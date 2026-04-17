const configManager = require("../config/configManager").default;
const { EmbedBuilder } = require("discord.js");

const now = new Date();
const date =
  `${now.getMonth()+1}/${now.getDate()}/${now.getFullYear()} ` +
  `${now.toLocaleTimeString([], {hour:"numeric",minute:"2-digit"})}`;

function formatConfig(cfg) {
  const cfgEmbed = new EmbedBuilder()
  .setColor(0xf5c542)
  .setTitle(`Server configuration`)
  .setDescription(
    `Use /setup for all config commands.`
  )
  .setFields(
    {
      name: "Roles",
      value: `Rare: ${cfg.roles?.rare ? `<@&${cfg.roles.rare}>` : "not set"}\n` +
        `- Ultra Beast: ${("<@&" + cfg.roles?.ub + ">")  ?? "not set"}\n` +
        `- Regional: ${("<@&" + cfg.roles?.regional + ">")  ?? "not set"}\n` +
        `- Paradox: ${("<@&" + cfg.roles?.paradox + ">")  ?? "not set"}\n` +
        `- Event: ${("<@&" + cfg.roles?.event + ">")  ?? "not set"}\n` +
        `- Alpha: ${("<@&" + cfg.roles?.alpha + ">")  ?? "not set"}`,
      inline: false
    },
    {
      name: "Starboard",
      value: `Enabled: ${cfg.starboard?.enabled ?? false}\n` +
        ` - Rare: ${("<#" + cfg.starboard?.rare + ">") ?? "not set"}\n` +
        ` - Ultra Beast: ${("<#" + cfg.starboard?.ub + ">")  ?? "not set"}\n` +
        ` - Regional: ${("<#" + cfg.starboard?.regional + ">")  ?? "not set"}\n` +
        ` - Paradox: ${("<#" + cfg.starboard?.paradox + ">")  ?? "not set"}\n` +
        ` - Event: ${("<#" + cfg.starboard?.event + ">") ?? "not set"}\n` +
        ` - Alpha: ${("<#" + cfg.starboard?.alpha + ">")  ?? "not set"}`,
      inline: false
    },
    {
      name: "Collections",
      value: `Ping Enabled: ${cfg.collection?.pingEnabled ?? false}\n` + 
        `- Limit: ${cfg.collection?.limit ?? 25}`,
      inline: false
    },
    {
      name: "WTP Pings",
      value: `Enabled: ${cfg.wtp?.enabled ?? false}\n` + 
        `- Daily Limit: ${cfg.wtp?.daily_limit ?? 8}`,
      inline: false
    }
  )
  .setFooter({
    text: `${date}`
  })

  return cfgEmbed;
}


module.exports = async (interaction) => {
  const cfg = configManager.get(interaction.guildId);
  const cfgEmbed = formatConfig(cfg);

  return interaction.reply({
    embeds: [cfgEmbed],
    ephemeral: false
  });
};