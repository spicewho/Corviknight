const axios = require("axios");
const fs = require("fs");
require('dotenv').config();

const TOKEN = `${process.env.DBL_TOKEN}`;
const BOT_ID = "1492680584198099094";


const commands = JSON.parse(fs.readFileSync("./util/commands.json", "utf8"));

async function postCommands() {
  try {
    const res = await axios.post(
      `https://discordbotlist.com/api/v1/bots/${BOT_ID}/commands`,
      commands,
      {
        headers: {
          Authorization: `Bot ${TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Commands uploaded successfully");
    console.log(res.data);
  } catch (err) {
    console.error("Upload failed:", err.response?.data || err);
  }
}

postCommands();