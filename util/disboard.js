const DISBOARD_ID = "302050872383242240";

module.exports = async function handleBump(message) {
  if (message.author.id !== DISBOARD_ID) return;
  if (!message.embeds.length) return;
  if (message.channel.id !== "1488414916238118964") return;

  const embed = message.embeds[0];

  if (!embed.description) return;
  // Detect successful bump
  if (embed.description.includes("Bump done")) {
    const user = message.interaction?.user;

    if (user) {
      setTimeout(() => {
        message.channel.send(`<@${user.id}> you may bump again!`);
    }, 7200000);
    }
  }
};