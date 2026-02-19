# Banking Web Application

A modern, secure, responsive banking web application built with React, Node.js, Express, and MongoDB.

## Features

- User authentication (Register/Login) with JWT
- Account balance management
- Deposit money
- Withdraw money
- Transfer money between accounts
- Transaction history
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React, Tailwind CSS, Axios, React Router
- **Backend**: Node.js, Express, MongoDB, JWT, bcryptjs
- **Security**: Password hashing, JWT authentication, input validation

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB (running locally or MongoDB Atlas)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Update `.env` file with your MongoDB URI and JWT secret

4. Start the server:
```bash
npm start
```

Backend will run on http://localhost:5000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

Frontend will run on http://localhost:3000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login user

### Account Operations
- GET `/api/account/balance` - Get account balance
- GET `/api/account/transactions` - Get transaction history
- POST `/api/account/deposit` - Deposit money
- POST `/api/account/withdraw` - Withdraw money
- POST `/api/account/transfer` - Transfer money

## Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Protected API routes
- Input validation
- CORS protection

## Deployment

### Backend Deployment (Vercel)
1. Create new project on Vercel
2. Import GitHub repo
3. Set Root Directory: `backend`
4. Deploy
5. Copy backend URL (e.g., `https://your-backend.vercel.app`)

### Frontend Deployment (Vercel)
1. Create another project on Vercel
2. Import same GitHub repo
3. Set Root Directory: `frontend`
4. Add Environment Variable:
   - Key: `REACT_APP_API_URL`
   - Value: `https://your-backend.vercel.app/api`
5. Deploy

## Default Account

New users start with $1000 balance and a unique account number.
