const express = require('express');
const jwt = require('jsonwebtoken');
const { readDB, writeDB, generateId } = require('../db');

const router = express.Router();

const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const db = readDB();
    req.user = db.users.find(u => u.id === decoded.userId);
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

router.get('/balance', auth, (req, res) => {
  res.json({ balance: req.user.balance, accountNumber: req.user.accountNumber });
});

router.post('/deposit', auth, (req, res) => {
  try {
    const { amount } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    
    user.balance += parseFloat(amount);
    
    const transaction = {
      id: generateId(),
      userId: user.id,
      type: 'deposit',
      amount: parseFloat(amount),
      description: `Deposit of $${amount}`,
      balanceAfter: user.balance,
      createdAt: new Date().toISOString()
    };
    
    db.transactions.push(transaction);
    writeDB(db);

    res.json({ message: 'Deposit successful', balance: user.balance, transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/withdraw', auth, (req, res) => {
  try {
    const { amount } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    
    if (user.balance < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    user.balance -= parseFloat(amount);
    
    const transaction = {
      id: generateId(),
      userId: user.id,
      type: 'withdraw',
      amount: parseFloat(amount),
      description: `Withdrawal of $${amount}`,
      balanceAfter: user.balance,
      createdAt: new Date().toISOString()
    };
    
    db.transactions.push(transaction);
    writeDB(db);

    res.json({ message: 'Withdrawal successful', balance: user.balance, transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/transfer', auth, (req, res) => {
  try {
    const { amount, recipientEmail } = req.body;
    const db = readDB();
    const sender = db.users.find(u => u.id === req.user.id);
    const recipient = db.users.find(u => u.email === recipientEmail);

    if (!recipient) return res.status(404).json({ message: 'Recipient not found' });
    if (sender.email === recipientEmail) return res.status(400).json({ message: 'Cannot transfer to yourself' });
    if (sender.balance < parseFloat(amount)) return res.status(400).json({ message: 'Insufficient balance' });

    sender.balance -= parseFloat(amount);
    recipient.balance += parseFloat(amount);

    const transaction = {
      id: generateId(),
      userId: sender.id,
      type: 'transfer_sent',
      amount: parseFloat(amount),
      description: `Transfer to ${recipient.name}`,
      recipientId: recipient.id,
      recipientEmail: recipient.email,
      balanceAfter: sender.balance,
      createdAt: new Date().toISOString()
    };

    db.transactions.push(transaction);
    writeDB(db);

    res.json({ message: 'Transfer successful', balance: sender.balance, transaction });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/transactions', auth, (req, res) => {
  try {
    const db = readDB();
    const transactions = db.transactions
      .filter(t => t.userId === req.user.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
