const express = require('express');
const jwt = require('jsonwebtoken');
const { readDB, writeDB, generateId, bcrypt } = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const db = readDB();

    if (db.users.find(u => u.email === email)) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = {
      id: generateId(),
      name,
      email,
      phone,
      password: hashedPassword,
      accountNumber: 'ACC' + Date.now(),
      balance: 1000,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    db.users.push(user);
    writeDB(db);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, accountNumber: user.accountNumber, balance: user.balance }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, accountNumber: user.accountNumber, balance: user.balance, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/me', (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const db = readDB();
    const user = db.users.find(u => u.id === decoded.userId);
    
    if (!user) return res.status(401).json({ message: 'User not found' });

    res.json({ user: { id: user.id, name: user.name, email: user.email, accountNumber: user.accountNumber, balance: user.balance, role: user.role } });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
