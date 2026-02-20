const jwt = require('jsonwebtoken');
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

const auth = (req) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new Error('No token');
  const decoded = jwt.verify(token, 'secret-key');
  const db = readDB();
  const user = db.users.find(u => u.id === decoded.userId);
  if (!user) throw new Error('User not found');
  return user;
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const user = auth(req);
    const db = readDB();
    const { action } = req.query;

    if (action === 'balance' && req.method === 'GET') {
      return res.json({ balance: user.balance, accountNumber: user.accountNumber });
    }

    if (action === 'deposit' && req.method === 'POST') {
      const { amount } = req.body;
      const dbUser = db.users.find(u => u.id === user.id);
      dbUser.balance += parseFloat(amount);
      const transaction = { id: Date.now().toString(), userId: user.id, type: 'deposit', amount: parseFloat(amount), description: `Deposit of $${amount}`, balanceAfter: dbUser.balance, createdAt: new Date().toISOString() };
      db.transactions.push(transaction);
      writeDB(db);
      return res.json({ message: 'Deposit successful', balance: dbUser.balance, transaction });
    }

    if (action === 'withdraw' && req.method === 'POST') {
      const { amount } = req.body;
      const dbUser = db.users.find(u => u.id === user.id);
      if (dbUser.balance < parseFloat(amount)) return res.status(400).json({ message: 'Insufficient balance' });
      dbUser.balance -= parseFloat(amount);
      const transaction = { id: Date.now().toString(), userId: user.id, type: 'withdraw', amount: parseFloat(amount), description: `Withdrawal of $${amount}`, balanceAfter: dbUser.balance, createdAt: new Date().toISOString() };
      db.transactions.push(transaction);
      writeDB(db);
      return res.json({ message: 'Withdrawal successful', balance: dbUser.balance, transaction });
    }

    if (action === 'transactions' && req.method === 'GET') {
      const transactions = db.transactions.filter(t => t.userId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
      return res.json({ transactions });
    }

    res.status(404).json({ message: 'Not found' });
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
