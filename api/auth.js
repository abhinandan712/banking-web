const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const dbPath = path.join('/tmp', 'database.json');

const initDB = () => {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ users: [], transactions: [] }));
  }
};

const readDB = () => {
  initDB();
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
};

const writeDB = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  if (action === 'register' && req.method === 'POST') {
    const { name, email, phone, password } = req.body;
    const db = readDB();

    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now().toString(),
      name, email, phone,
      password: hashedPassword,
      accountNumber: 'ACC' + Date.now(),
      balance: 1000,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    db.users.push(user);
    writeDB(db);

    const token = jwt.sign({ userId: user.id }, 'secret-key', { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, accountNumber: user.accountNumber, balance: user.balance } });
  }

  if (action === 'login' && req.method === 'POST') {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, 'secret-key', { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, accountNumber: user.accountNumber, balance: user.balance, role: user.role } });
  }

  res.status(404).json({ message: 'Not found' });
};
