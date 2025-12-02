# Backend

Backend API for Quran Companion mobile app.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`

## Development

```bash
npm run dev
```

The API will run on `http://localhost:3000`

## API Endpoints

- `GET /` - API info
- `GET /api/health` - Health check

## Folder Structure

```
backend/
├── src/
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   └── index.js      # Entry point
├── .env              # Environment variables
└── package.json
```

## Technologies

- **Express.js** - Web framework
- **MongoDB** - Database (optional)
- **Mongoose** - ODM
- **dotenv** - Environment variables
