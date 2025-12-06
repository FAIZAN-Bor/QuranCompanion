# Quran Companion Backend API

Complete REST API for Quran Companion mobile application with MongoDB Atlas integration.

## 🚀 Features

- **Authentication System**: JWT-based auth with email OTP verification
- **User Management**: Learner profiles, survey responses, parent-child relationships
- **Progress Tracking**: Real-time lesson progress with gamification
- **Quiz System**: Quiz submission, scoring, and history
- **Content Management**: Quran, Qaida, and Dua content delivery
- **Mistake Logging**: Track and resolve learning mistakes
- **Achievement System**: Badges and rewards with coin transactions
- **Notifications**: Real-time notifications for achievements, reminders
- **Parent Dashboard**: Parents can monitor children's progress

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database & JWT configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helpers (coins, achievements, email)
│   └── index.js         # Server entry point
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Update `.env` with your MongoDB Atlas credentials:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/quran-companion
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=30d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
FRONTEND_URL=http://localhost:3000
```

### 3. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Create a database user
4. Whitelist your IP (or use 0.0.0.0/0 for development)
5. Copy connection string to `MONGODB_URI` in `.env`

### 4. Run the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Progress Tracking
- `POST /api/progress/lesson` - Update lesson progress
- `GET /api/progress/summary` - Get progress summary

### Quiz System
- `POST /api/quiz/submit` - Submit quiz
- `GET /api/quiz/results` - Get quiz results

### Content
- `GET /api/content/Quran` - Get Quran content
- `GET /api/content/Qaida` - Get Qaida content
- `GET /api/content/Dua` - Get Dua content

### Parent Features
- `POST /api/parent/generate-link` - Generate child link code
- `POST /api/parent/link` - Link child to parent
- `GET /api/parent/children` - Get linked children

## 🗄️ Database Models

1. **User** - Authentication & profiles
2. **SurveyResponse** - Learner assessments
3. **Progress** - Lesson tracking
4. **QuizResult** - Quiz scores
5. **Mistake** - Learning mistakes
6. **Achievement** - Badges & rewards
7. **ParentChild** - Parent-child links
8. **Content** - Quran/Qaida/Dua data
9. **Notification** - User notifications
10. **CoinTransaction** - Coin history

## 🎮 Gamification

- Coin rewards for lessons and quizzes
- Achievement badges (First lesson, Qaida complete, etc.)
- Streak tracking and bonuses
- Parent monitoring dashboard

## 🔐 Security

- JWT authentication
- Password hashing with bcrypt
- Input validation
- CORS protection

## Technologies

- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Nodemailer** - Email service
- **dotenv** - Environment variables
