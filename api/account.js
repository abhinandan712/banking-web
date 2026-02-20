const jwt = require('jsonwebtoken');

let db = {
  users: [
    {
      id: '1771506585030giz3cri2m',
      name: 'Abhi',
      email: 'abhikumbar636@gmail.com',
      phone: '1234567890',
      password: '$2a$10$l3wH3TorhDvomN0TPfrSxeS8cjSM4.dGzJHVD4unAjlHvdo.AydLW',
      accountNumber: 'ACC1771506585030',
      balance: 1000,
      role: 'user'
    }
  ],
  transactions: []
};

const auth = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const token = authHeader?.replace('Bearer ', '');
  if (!token) throw new Error('No token');
  const decoded = jwt.verify(token, 'secret-key');
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
      return res.json({ message: 'Deposit successful', balance: dbUser.balance, transaction });
    }

    if (action === 'withdraw' && req.method === 'POST') {
      const { amount } = req.body;
      const dbUser = db.users.find(u => u.id === user.id);
      if (dbUser.balance < parseFloat(amount)) return res.status(400).json({ message: 'Insufficient balance' });
      dbUser.balance -= parseFloat(amount);
      const transaction = { id: Date.now().toString(), userId: user.id, type: 'withdraw', amount: parseFloat(amount), description: `Withdrawal of $${amount}`, balanceAfter: dbUser.balance, createdAt: new Date().toISOString() };
      db.transactions.push(transaction);
      return res.json({ message: 'Withdrawal successful', balance: dbUser.balance, transaction });
    }

    if (action === 'transactions' && req.method === 'GET') {
      const transactions = db.transactions.filter(t => t.userId === user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
      return res.json({ transactions });
    }

    res.status(404).json({ message: 'Not found' });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
};
