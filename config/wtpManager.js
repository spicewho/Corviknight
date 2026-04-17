const fs = require("fs");

const FILE = "./db/wtpTimers.json";

function load() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "{}");
  return JSON.parse(fs.readFileSync(FILE));
}

function save(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function startTimer(userId, channelId) {

  const db = load();

  const end = Date.now() + (60 * 60 * 1000);

  db[userId] = {
    channel: channelId,
    end
  };

  save(db);

}

function clearTimer(userId) {

  const db = load();

  delete db[userId];

  save(db);

}

module.exports = {
  startTimer,
  clearTimer,
  load
};