module.exports = {
    slash: async (interaction) => {
    await interaction.reply({
    content: `Invite Corviknight:\nhttps://discord.com/oauth2/authorize?client_id=1492680584198099094&permissions=52224&integration_type=0&scope=bot`,
    ephemeral: true
  });
  }
};