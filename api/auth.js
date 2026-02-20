const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action } = req.query;

  if (action === 'register' && req.method === 'POST') {
    const { name, email, phone, password } = req.body;

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
      role: 'user'
    };

    db.users.push(user);

    const token = jwt.sign({ userId: user.id }, 'secret-key', { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, accountNumber: user.accountNumber, balance: user.balance } });
  }

  if (action === 'login' && req.method === 'POST') {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, 'secret-key', { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, accountNumber: user.accountNumber, balance: user.balance, role: user.role } });
  }

  res.status(404).json({ message: 'Not found' });
};
