const config = require("../config/configManager").default;

module.exports = async (interaction) => {
  if (!interaction.member.permissions.has("Manage_guild")) {
    return interaction.reply({ content: "This command requires memebers to have the \`Manage_Messages\` permission!", ephemeral: true });
  }
  const sub = interaction.options.getSubcommand();
  const type = interaction.options.getString("type");
  const channel = interaction.options.getChannel("channel");
  const role = interaction.options.getRole("role");
  const value = interaction.options.getString("value");
  const amount = interaction.options.getInteger("amount");

  const guildId = interaction.guildId;

  if (sub === "rarity") {
    if (!role) {
      return interaction.reply({ content: "A role is required...", ephemeral: true });
    }
    config.set(guildId, `roles.${type}`, role.id);

    return interaction.reply({
      content: `Set **${type}** role to \`${role.name}\``,
      ephemeral: true
    });
  }


  


  if (sub === "starboard") {
    if (type === "all") {
      config.set(guildId, "starboard.enabled", true);
      config.set(guildId, "starboard.rare", channel.id);
      config.set(guildId, "starboard.ub", channel.id);
      config.set(guildId, "starboard.regional", channel.id);
      config.set(guildId, "starboard.paradox", channel.id);
      config.set(guildId, "starboard.event", channel.id);
      config.set(guildId, "starboard.alpha", channel.id);

      return interaction.reply({
        content: `Starboard enabled in \`${channel.name}\``,
        ephemeral: true
      });
    }
    config.set(guildId, `starboard.${type}`, channel.id);
    config.set(guildId, "starboard.enabled", true);

    return interaction.reply({
      content: `Starboard for \`${type}\` enabled in <#${channel.id}>`,
      ephemeral: true
    });
  }


  


  if (sub === "ping") {
    const enabled = value === "enable";
    config.set(guildId, "collection.pingEnabled", enabled);

    return interaction.reply({
      content: `Collection pings \`${enabled ? "enabled" : "disabled"}\``,
      ephemeral: true
    });
  }





  if (sub === "limit") {
    if (amount < 1 || amount > 50) {
      return interaction.reply({
        content: "Limit must be between 1–25",
        ephemeral: true
      });
    }
    config.set(guildId, "collection.limit", amount);

    return interaction.reply({
      content: `Collection limit set to \`${amount}\`.`,
      ephemeral: true
    });
  }




  if (sub === "wtp") {
    const state = interaction.options.getString("state");
    const limit = interaction.options.getInteger("daily_limit") ?? 8;
    const cfg = config.get(interaction.guildId);

    cfg.wtp = {
      enabled: state === "enable",
      daily_limit: limit
    };
    config.set(interaction.guildId, "wtp", cfg.wtp);

    if (state === "enable") {
      return interaction.reply({
        content: `WTP \`${state}d\`, daily limit is set to \`${limit}\``,
        ephemeral: true
      });
    } else {
      return interaction.reply({
        content: `WTP \`${state}d\`.`,
        ephemeral: true
      });
    }
  }
};