
const fs = require("fs");

const idDex = JSON.parse(fs.readFileSync("./db/pokemonNames.json", "utf8"));
const oldDex = JSON.parse(fs.readFileSync("../Hisuian Lilligant/dexFull.json", "utf8"));

function getBaseName(name) {
  name = name.replace(/(paldean)/, "paldea").replace(/(hisuian)/, "hisui").replace(/(alolan)/, "alola").replace(/(galarian)/, "galar").toLowerCase();
  split = name.split("-");


  realname = [];

  if (split[4]) {
    realname.push(split[4]);
  }
  else if (split[3]) {
    realname.push(split[3]);
  }
  else if (split[2]) {
    realname.push(split[2]);
  }
  else if (split[1]) {
    realname.push(split[1]);
    console.log(realname);
  }
  else {
    realname.push(split[0]);
  }

  return realname;
}

const merged = {};

for (const id in idDex) {
  const formName = idDex[id];
  const baseName = getBaseName(formName);

  const data = oldDex[baseName];

  if (!data) {
    console.warn(`Missing data for ${formName}`);
    merged[id] = { name: formName };
    continue;
  }

  merged[id] = {
    name: formName,
    base: baseName,
    region: data.region,
    types: data.types,
    jpName: data.jpName,
    gender: data.gender
  };
}

fs.writeFileSync(
  "./dex_merged.json",
  JSON.stringify(merged, null, 2)
);

console.log("Dex merged successfully.");