const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.json');

const ensureDB = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], transactions: [] }, null, 2));
  }
};

const readDB = () => {
  ensureDB();
  const data = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(data);
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

module.exports = { readDB, writeDB, generateId, bcrypt };
