const fs = require("fs");

const FILE = "../db/wtpUsers.json";

function load() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "{}");
  return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = async (interaction) => {

  const state = interaction.options.getString("state");

  const db = load();

  db[interaction.user.id] = state === "enable";

  save(db);

  await interaction.reply({
    content: `WTP timer ${state}`,
    ephemeral: true
  });

};