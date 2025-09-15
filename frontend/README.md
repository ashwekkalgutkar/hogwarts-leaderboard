# Hogwarts House Cup Leaderboard

Real-time leaderboard system with Node.js backend, React frontend, and MongoDB.

## Setup

### Prerequisites
- Node.js (v16+)
- Python 3
- MongoDB Atlas account

### Backend
```bash
mkdir hogwarts-leaderboard && cd hogwarts-leaderboard
mkdir backend && cd backend
npm init -y
npm install express mongoose cors dotenv socket.io uuid
npm install -g nodemon
```

Create `.env`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hogwarts-leaderboard
PORT=5000
NODE_ENV=development
```

### Frontend
```bash
cd ..
npx create-react-app frontend
cd frontend
npm install socket.io-client
```

## Running

**Terminal 1:**
```bash
cd backend
nodemon server.js
```

**Terminal 2:**
```bash
cd frontend
npm start
```

**Terminal 3:**
```bash
cd backend
python data_gen.py
```

Access at http://localhost:3000

## API Endpoints

- `GET /api/leaderboard?timeWindow=all|1hour|5min` - Get leaderboard
- `POST /api/events` - Add event
- `GET /api/stats` - Get statistics

## Deployment

### Backend (Render)
1. Push to GitHub
2. Connect repository on render.com
3. Build: `npm install`, Start: `node server.js`
4. Add environment variables

### Frontend (Netlify/Vercel)
1. Update API_URL in App.js to deployed backend URL
2. Deploy build folder or connect GitHub

## Files to Create

Copy the provided code into these files:

**Backend:**
- `package.json`
- `server.js` 
- `models/HousePoint.js`
- `routes/leaderboard.js`
- `data_gen.py`
- `.env`

**Frontend:**
- `package.json` (modify existing)
- `src/App.js`
- `src/App.css`
- `src/index.js`
- `src/index.css`
- `src/components/Leaderboard.js`
- `src/components/Leaderboard.css`
- `public/index.html`

## MongoDB Setup
1. Create cluster at mongodb.com/atlas
2. Create database user
3. Get connection string
4. Add to `.env` file

## Features
- Real-time WebSocket updates
- Time filtering (5min, 1hour, all)
- House-themed UI with rankings
- MongoDB data persistence
- Python data generator

## Troubleshooting
- MongoDB connection: Check `.env` connection string
- Port issues: Change PORT in `.env`
- API connection: Update API_URL in `App.js` for production