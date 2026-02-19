import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout, updateUserBalance } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [amount, setAmount] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/account/transactions`);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error(err);
      setTransactions([]);
    }
  };

  const handleTransaction = async (type) => {
    try {
      const payload = type === 'transfer' ? { amount: parseFloat(amount), recipientEmail: recipientAccount } : { amount: parseFloat(amount) };
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/account/${type}`, payload);
      updateUserBalance(data.balance);
      setMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} successful!`);
      setAmount('');
      setRecipientAccount('');
      fetchTransactions();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Transaction failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">BankApp</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.fullName}</span>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2">Account Balance</h2>
          <p className="text-4xl font-bold text-blue-600">${user?.balance?.toFixed(2)}</p>
          <p className="text-gray-600 mt-2">Account: {user?.accountNumber}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex gap-4 mb-6 border-b">
            {['overview', 'deposit', 'withdraw', 'transfer'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 px-4 font-semibold ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded ${message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          {activeTab === 'overview' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
              <div className="space-y-2">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-semibold">{tx.description}</p>
                      <p className="text-sm text-gray-600">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`font-bold ${tx.type === 'deposit' || tx.type === 'transfer_received' ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.type === 'deposit' || tx.type === 'transfer_received' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'deposit' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Deposit Money</h3>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <button
                onClick={() => handleTransaction('deposit')}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Deposit
              </button>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Withdraw Money</h3>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <button
                onClick={() => handleTransaction('withdraw')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Withdraw
              </button>
            </div>
          )}

          {activeTab === 'transfer' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Transfer Money</h3>
              <input
                type="text"
                value={recipientAccount}
                onChange={(e) => setRecipientAccount(e.target.value)}
                placeholder="Recipient email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <button
                onClick={() => handleTransaction('transfer')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
              >
                Transfer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
