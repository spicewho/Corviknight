module.exports = {
  data: {
    name: "shards",
  },

  async execute(interaction, client) {
      if (interaction.user.id === "560620271992700957") {
      const shard = interaction.guild.shardId ?? 0;

      const shardInfo = client.shard
        ? await client.shard.broadcastEval(c => ({
            guilds: c.guilds.cache.size,
            id: c.shard?.ids?.[0] ?? 0
          }))
        : [{ id: 0, guilds: client.guilds.cache.size }];

      const msg = shardInfo
        .map(s => `Shard ${s.id}: ${s.guilds} guilds`)
        .join("\n");

      return interaction.reply({
        content: `Shard Info:\n${msg}`,
        ephemeral: true
      });
    }
    return;
  }
};