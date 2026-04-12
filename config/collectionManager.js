const fs = require("fs");

const FILE = "./db/collections.json";

let cache = null;

function load() {
  if (!cache) {
    if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, "{}");
    cache = JSON.parse(fs.readFileSync(FILE));
  }
  return cache;
}

function save(data) {
  cache = data;
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function add(userId, pokemonList) {
  const db = load();
  if (!db[userId]) db[userId] = [];

  for (const p of pokemonList) {
    const name = p.trim();
    if (!db[userId].includes(name)) {
      db[userId].push(name);
    }
  }

  save(db);
}

function remove(userId, pokemonList) {
  const db = load();
  if (!db[userId]) return;

  db[userId] = db[userId].filter(p => !pokemonList.includes(p));
  save(db);
}

function list(userId) {
  const db = load();
  return db[userId] || [];
}

function clear(userId) {
  const db = load();
  db[userId] = [];
  save(db);
}

function overwrite(userId, newList) {
  const db = load();
  db[userId] = [...new Set(newList.map(p => p.trim()))];
  save(db);
}

function getAllUsers() {
  return load();
}

module.exports = {
  add,
  remove,
  list,
  clear,
  overwrite,
  getAllUsers
};