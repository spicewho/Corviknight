import { existsSync, writeFileSync, readFileSync } from "fs";

const FILE = "./config/serverConfig.json";

function load() {
  if (!existsSync(FILE)) writeFileSync(FILE, "{}");
  return JSON.parse(readFileSync(FILE));
}

function save(data) {
  writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function ensureGuild(db, guildId) {
  if (!db[guildId]) {
    db[guildId] = {
      roles: {},
      starboard: { enabled: false },
      collection: { pingEnabled: true, limit: 25 }
    };
  }
}

function get(guildId) {
  const db = load();
  ensureGuild(db, guildId);
  return db[guildId];
}

function set(guildId, path, value) {
  const db = load();
  ensureGuild(db, guildId);

  const keys = path.split(".");
  let obj = db[guildId];

  for (let i = 0; i < keys.length - 1; i++) {
    obj[keys[i]] = obj[keys[i]] || {};
    obj = obj[keys[i]];
  }

  obj[keys[keys.length - 1]] = value;

  save(db);
}

export default { get, set };