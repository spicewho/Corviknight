const { ShardingManager } = require("discord.js");

require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
const manager = new ShardingManager("./bot.js", {
  token: token,
  totalShards: "auto",
});

manager.on("shardCreate", shard => {
  console.log(`Launched shard ${shard.id}`);
});

manager.spawn();