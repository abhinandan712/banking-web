const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth-json'));
app.use('/api/account', require('./routes/account-json'));

app.get('/', (req, res) => {
  res.json({ message: 'Banking API Server Running (JSON Storage)' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
