# API Documentation - Quran Companion Backend

Base URL: `http://localhost:5000/api`

## Authentication Required

Most endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 📱 Authentication Endpoints

### 1. Register New User
```http
POST /auth/signup
```

**Body:**
```json
{
  "name": "Ahmed Khan",
  "email": "ahmed@example.com",
  "password": "password123",
  "role": "child"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please verify your email with the OTP sent.",
  "data": {
    "userId": "65abc123...",
    "email": "ahmed@example.com",
    "name": "Ahmed Khan",
    "role": "child"
  }
}
```

### 2. Verify OTP
```http
POST /auth/verify-otp
```

**Body:**
```json
{
  "email": "ahmed@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Login
```http
POST /auth/login
```

**Body:**
```json
{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "65abc123...",
      "name": "Ahmed Khan",
      "email": "ahmed@example.com",
      "role": "child",
      "coins": 150,
      "proficiencyLevel": "Beginner",
      "streakDays": 3,
      "accuracy": 85
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

---

## 👤 User Management

### 1. Submit Learner Survey
```http
POST /users/survey
Authorization: Bearer <token>
```

**Body:**
```json
{
  "answers": {
    "q1": "all_alphabets",
    "q2": "easily",
    "q3": "correctly"
  },
  "proficiencyLevel": "Intermediate",
  "totalScore": 35,
  "sectionScores": {
    "readingAbility": 8,
    "pronunciationAbility": 7,
    "wordSentenceReading": 8,
    "previousExperience": 7,
    "comprehension": 5
  }
}
```

### 2. Update Profile
```http
PUT /users/profile
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Ahmed Khan Updated",
  "profileImage": "https://example.com/image.jpg",
  "notificationSettings": {
    "dailyReminder": true,
    "achievements": true
  }
}
```

### 3. Get Dashboard Stats
```http
GET /users/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "coins": 250,
      "streakDays": 7,
      "accuracy": 88,
      "totalLessonsCompleted": 25
    },
    "progressStats": [...],
    "recentAchievements": [...],
    "recentTransactions": [...]
  }
}
```

---

## 📚 Progress Tracking

### 1. Update Lesson Progress
```http
POST /progress/lesson
Authorization: Bearer <token>
```

**Body:**
```json
{
  "module": "Qaida",
  "levelId": "qaida_1",
  "lessonId": "q1_l1",
  "contentId": "65abc...",
  "status": "completed",
  "completionPercentage": 100,
  "timeSpent": 300,
  "accuracy": 95
}
```

**Response:**
```json
{
  "success": true,
  "message": "Progress updated successfully",
  "data": {
    "progress": {
      "coinsEarned": 70,
      "status": "completed",
      "completionPercentage": 100
    }
  }
}
```

### 2. Get Progress Summary
```http
GET /progress/summary
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": [
      {
        "_id": "Qaida",
        "totalLessons": 10,
        "completedLessons": 6,
        "averageAccuracy": 87,
        "totalCoins": 420
      },
      {
        "_id": "Quran",
        "totalLessons": 8,
        "completedLessons": 3,
        "averageAccuracy": 82,
        "totalCoins": 180
      }
    ]
  }
}
```

---

## 📝 Quiz System

### 1. Submit Quiz
```http
POST /quiz/submit
Authorization: Bearer <token>
```

**Body:**
```json
{
  "quizId": "qaida_1_quiz",
  "module": "Qaida",
  "levelId": "qaida_1",
  "questions": [
    {
      "questionId": "q1",
      "question": "What is the first letter?",
      "selectedAnswer": "Alif",
      "correctAnswer": "Alif",
      "isCorrect": true,
      "timeSpent": 15
    }
  ],
  "score": 8,
  "totalQuestions": 10,
  "timeSpent": 120
}
```

**Response:**
```json
{
  "success": true,
  "message": "Quiz passed!",
  "data": {
    "quizResult": {
      "percentage": 80,
      "passed": true,
      "coinsEarned": 60
    }
  }
}
```

### 2. Get Quiz Results
```http
GET /quiz/results?module=Qaida
Authorization: Bearer <token>
```

### 3. Get Best Score
```http
GET /quiz/best/qaida_1_quiz
Authorization: Bearer <token>
```

---

## 📖 Content Management

### 1. Get Quran Surahs
```http
GET /content/Quran
```

**Response:**
```json
{
  "success": true,
  "count": 114,
  "data": {
    "content": [
      {
        "_id": "65abc...",
        "type": "Quran",
        "name": "Al-Fatiha",
        "nameArabic": "الفاتحة",
        "number": 1,
        "totalAyahs": 7,
        "revelation": "Makki",
        "verses": [...]
      }
    ]
  }
}
```

### 2. Get Specific Surah
```http
GET /content/Quran/number/1
```

### 3. Search Content
```http
GET /content/search?q=fatiha&type=Quran
```

### 4. Get Duas by Category
```http
GET /content/dua/category/Morning
```

---

## ❌ Mistake Logging

### 1. Log Mistake
```http
POST /mistakes
Authorization: Bearer <token>
```

**Body:**
```json
{
  "module": "Quran",
  "levelId": "quran_1",
  "lessonId": "qr1_l1",
  "mistakeType": "pronunciation",
  "title": "Mispronounced ق",
  "description": "Struggled with pronunciation of the letter ق in Surah Al-Ikhlas",
  "severity": "moderate"
}
```

### 2. Get Mistakes
```http
GET /mistakes?isResolved=false
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": {
    "mistakes": [...],
    "groupedByWeek": {
      "This Week": [...],
      "Last Week": [...]
    }
  }
}
```

### 3. Mark Mistake as Resolved
```http
PUT /mistakes/65abc123.../resolve
Authorization: Bearer <token>
```

**Body:**
```json
{
  "correctionNote": "Practiced correctly with teacher"
}
```

---

## 👨‍👩‍👧 Parent Features

### 1. Generate Link Code (Parent)
```http
POST /parent/generate-link
Authorization: Bearer <parent-token>
```

**Body:**
```json
{
  "childEmail": "child@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Link code generated",
  "data": {
    "linkCode": "ABC123",
    "expiresAt": "2025-12-11T...",
    "childEmail": "child@example.com"
  }
}
```

### 2. Link to Parent (Child)
```http
POST /parent/link
Authorization: Bearer <child-token>
```

**Body:**
```json
{
  "linkCode": "ABC123"
}
```

### 3. Get Children (Parent)
```http
GET /parent/children
Authorization: Bearer <parent-token>
```

### 4. Get Child Progress
```http
GET /parent/child/65abc.../progress
Authorization: Bearer <parent-token>
```

### 5. Get Child Quizzes
```http
GET /parent/child/65abc.../quizzes
Authorization: Bearer <parent-token>
```

---

## 🏆 Achievements

### 1. Get User Achievements
```http
GET /achievements
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": {
    "achievements": [
      {
        "badgeType": "first_lesson",
        "title": "First Steps",
        "description": "Completed your first lesson!",
        "coinsRewarded": 50,
        "earnedAt": "2025-12-04T..."
      }
    ]
  }
}
```

### 2. Get Coin History
```http
GET /achievements/coins/history?page=1&limit=20
Authorization: Bearer <token>
```

### 3. Get Coin Stats
```http
GET /achievements/coins/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "currentBalance": 450,
    "totalEarned": 500,
    "totalSpent": 50,
    "transactionCount": 25
  }
}
```

---

## 🔔 Notifications

### 1. Get Notifications
```http
GET /notifications?isRead=false&limit=10
Authorization: Bearer <token>
```

### 2. Get Unread Count
```http
GET /notifications/unread-count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 3
  }
}
```

### 3. Mark as Read
```http
PUT /notifications/65abc.../read
Authorization: Bearer <token>
```

### 4. Mark All as Read
```http
PUT /notifications/mark-all-read
Authorization: Bearer <token>
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error
