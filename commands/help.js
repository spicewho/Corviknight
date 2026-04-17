const { EmbedBuilder } = require("discord.js");

const helpEmbed = new EmbedBuilder()
  .setTitle("Corviknight Commands")
  .addFields(
    {
      name: "Collection",
      value:
        "`/collection add <pokemon, ?pokemon>`\n" +
        "`/collection remove <pokemon, ?pokemon>`\n" +
        "`/collection list`\n" +
        "`/collection clear`",
      inline: false,
    },
    {
      name: "Server Setup",
      value:
        "`/config`\n" +
        "`/setup rarity <type> <role>`\n" +
        "`/setup starboard <type> <channel>`\n" +
        "`/setup collection ping <enable/disable>`\n" +
        "`/setup collection limit <amount>`\n" +
        "`/setup wtp <enable/disable> <daily_limit> (default: 8/8)`",
      inline: false,
    },
    {
      name: "Misc",
      value: "`/wtp timer <enable/disable>`",
      inline: false,
    },
    {
      name: "Utility",
      value: "`/invite`\n`/help`",
      inline: false
    }
  )
  .setColor(0x221583); // dark Discord-ish gray (optional)

module.exports = {
  slash: async (interaction) => {
    await interaction.reply({
      embeds: [helpEmbed],
      ephemeral: false,
    });
  },

  message: async (message) => {
    await message.channel.send({
      embeds: [helpEmbed],
    });
  },
};