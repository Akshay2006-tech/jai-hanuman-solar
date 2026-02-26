const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');

function readDB() {
  if (!fs.existsSync(dbPath)) {
    const initial = { users: [], panels: [], recyclers: [] };
    fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };
