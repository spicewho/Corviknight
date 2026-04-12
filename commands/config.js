const configManager = require("../config/configManager").default;

function formatConfig(cfg) {
  return `
**Roles**
- Rare: ${("<@&" + cfg.roles?.rare + ">")  ?? "not set"}
- Regional: ${("<@&" + cfg.roles?.regional + ">")  ?? "not set"}
- Event: ${("<@&" + cfg.roles?.event + ">")  ?? "not set"}

**Starboard**
- Enabled: ${cfg.starboard?.enabled ?? false}
- Rare: ${("<#" + cfg.starboard?.rare + ">") ?? "none"}
- Regional: ${(`<#${cfg.starboard?.regional}>`) ?? "none"}
- Event: ${("<#" + cfg.starboard?.event + ">") ?? "none"}

**Collection**
- Ping Enabled: ${cfg.collection?.pingEnabled ?? false}
- Limit: ${cfg.collection?.limit ?? 25}

**WTP**
- Enabled: ${cfg.wtp?.enabled ?? false}
- Daily Limit: ${cfg.wtp?.daily_limit ?? 8}
`.replace(/(undefined)/g, "none");
}

module.exports = async (interaction) => {
  const cfg = configManager.get(interaction.guildId);

  return interaction.reply({
    content: formatConfig(cfg),
    ephemeral: false
  });
};