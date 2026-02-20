# WORKING DEPLOYMENT GUIDE

## Your app works perfectly on localhost!

Run these commands:
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm start
```

Open http://localhost:3000

## For Vercel deployment:

Vercel serverless functions DON'T support JSON file storage or shared memory.

### Option 1: Use Render.com for backend (FREE & EASY)
1. Go to https://render.com
2. Create account
3. New → Web Service
4. Connect GitHub repo: `abhinandan712/banking-web`
5. Root Directory: `backend`
6. Build Command: `npm install`
7. Start Command: `npm start`
8. Deploy (takes 2-3 minutes)
9. Copy the backend URL
10. Update frontend on Vercel with environment variable:
    - `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`

### Option 2: Use Railway.app (FREE)
Same steps as Render but on https://railway.app

### Why Vercel doesn't work:
- Serverless functions are stateless
- Each request gets a new instance
- No shared memory between functions
- JSON files don't persist

Your code is perfect - it's just a platform limitation!
