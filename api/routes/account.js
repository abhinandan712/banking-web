const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get account balance
router.get('/balance', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ 
      balance: user.balance,
      accountNumber: user.accountNumber 
    });
  } catch (error) {
    console.error('Get balance error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Deposit money
router.post('/deposit', [
  auth,
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { amount } = req.body;
    const user = await User.findById(req.user._id);

    // Update balance
    user.balance += parseFloat(amount);
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: user._id,
      type: 'deposit',
      amount: parseFloat(amount),
      description: `Deposit of $${amount}`,
      balanceAfter: user.balance
    });
    await transaction.save();

    res.json({
      message: 'Deposit successful',
      balance: user.balance,
      transaction: {
        id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.createdAt
      }
    });

  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({ message: 'Server error during deposit' });
  }
});

// Withdraw money
router.post('/withdraw', [
  auth,
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { amount } = req.body;
    const user = await User.findById(req.user._id);

    // Check sufficient balance
    if (user.balance < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Update balance
    user.balance -= parseFloat(amount);
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
      userId: user._id,
      type: 'withdraw',
      amount: parseFloat(amount),
      description: `Withdrawal of $${amount}`,
      balanceAfter: user.balance
    });
    await transaction.save();

    res.json({
      message: 'Withdrawal successful',
      balance: user.balance,
      transaction: {
        id: transaction._id,
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.createdAt
      }
    });

  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ message: 'Server error during withdrawal' });
  }
});

// Transfer money
router.post('/transfer', [
  auth,
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('recipientEmail').isEmail().withMessage('Please provide a valid recipient email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { amount, recipientEmail } = req.body;
    const sender = await User.findById(req.user._id);

    // Check if trying to transfer to self
    if (sender.email === recipientEmail) {
      return res.status(400).json({ message: 'Cannot transfer to yourself' });
    }

    // Find recipient
    const recipient = await User.findOne({ email: recipientEmail });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Check if recipient is blocked
    if (recipient.isBlocked) {
      return res.status(400).json({ message: 'Recipient account is blocked' });
    }

    // Check sufficient balance
    if (sender.balance < parseFloat(amount)) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Perform transfer
    sender.balance -= parseFloat(amount);
    recipient.balance += parseFloat(amount);

    await sender.save();
    await recipient.save();

    // Create transaction records
    const senderTransaction = new Transaction({
      userId: sender._id,
      type: 'transfer_sent',
      amount: parseFloat(amount),
      description: `Transfer to ${recipient.name} (${recipient.email})`,
      recipientId: recipient._id,
      recipientEmail: recipient.email,
      balanceAfter: sender.balance
    });

    const recipientTransaction = new Transaction({
      userId: recipient._id,
      type: 'transfer_received',
      amount: parseFloat(amount),
      description: `Transfer from ${sender.name} (${sender.email})`,
      recipientId: sender._id,
      balanceAfter: recipient.balance
    });

    await senderTransaction.save();
    await recipientTransaction.save();

    res.json({
      message: 'Transfer successful',
      balance: sender.balance,
      transaction: {
        id: senderTransaction._id,
        type: senderTransaction.type,
        amount: senderTransaction.amount,
        recipient: recipient.name,
        date: senderTransaction.createdAt
      }
    });

  } catch (error) {
    console.error('Transfer error:', error);
    res.status(500).json({ message: 'Server error during transfer' });
  }
});

// Get transaction history
router.get('/transactions', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ userId: req.user._id })
      .populate('recipientId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ userId: req.user._id });

    res.json({
      transactions: transactions.map(t => ({
        id: t._id,
        type: t.type,
        amount: t.amount,
        description: t.description,
        recipient: t.recipientId ? {
          name: t.recipientId.name,
          email: t.recipientId.email
        } : null,
        balanceAfter: t.balanceAfter,
        date: t.createdAt,
        status: t.status
      })),
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;