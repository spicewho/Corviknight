const { REST, Routes } = require('discord.js');

require('dotenv').config();
const token = process.env.DISCORD_TOKEN;
const clientId = "1492680584198099094";
const rest = new REST().setToken(token);

rest
	.delete(Routes.applicationCommand(clientId, '1492747259434106962'))
	.then(() => console.log('Success'))
	.catch(console.error);