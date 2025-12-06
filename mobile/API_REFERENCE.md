# API Quick Reference

## Base URL
```
Android Emulator: http://10.0.2.2:5000/api
iOS Simulator: http://localhost:5000/api
Physical Device: http://YOUR_IP:5000/api
```

## Authentication Endpoints

### Signup
```javascript
POST /auth/signup
Body: { name, email, password, role }
Response: { success, message, data: { user } }
```

### Verify OTP
```javascript
POST /auth/verify-otp
Body: { email, otp }
Response: { success, data: { token, user } }
```

### Login
```javascript
POST /auth/login
Body: { email, password }
Response: { success, data: { token, user } }
```

### Logout
```javascript
POST /auth/logout
Headers: Authorization: Bearer {token}
Response: { success, message }
```

## User Endpoints

### Get Dashboard
```javascript
GET /users/dashboard
Headers: Authorization: Bearer {token}
Response: { profile, progress, achievements, coins }
```

### Update Profile
```javascript
PUT /users/profile
Headers: Authorization: Bearer {token}
Body: { name, age, gender, ... }
```

### Submit Survey
```javascript
POST /users/survey
Headers: Authorization: Bearer {token}
Body: { answers, proficiencyLevel, totalScore }
```

## Content Endpoints (Public - No Auth Required)

### Get Quran Surahs
```javascript
GET /content/quran
Response: { data: [{ name, arabicName, verses, ... }] }
```

### Get Qaida Lessons
```javascript
GET /content/qaida
Response: { data: [{ name, characters, ... }] }
```

### Get Duas
```javascript
GET /content/dua?category=daily
Response: { data: [{ name, dua, translation, ... }] }
```

### Search Content
```javascript
GET /content/search?q=fatiha
Response: { data: [...] }
```

## Progress Endpoints

### Get Progress
```javascript
GET /progress?module=qaida&status=completed
Headers: Authorization: Bearer {token}
Response: { data: [...] }
```

### Update Lesson Progress
```javascript
POST /progress/lesson
Headers: Authorization: Bearer {token}
Body: {
  module: 'qaida',
  levelId: 1,
  lessonId: 'lesson_1',
  status: 'completed',
  completionPercentage: 100,
  timeSpent: 300,
  accuracy: 85
}
```

## Quiz Endpoints

### Submit Quiz
```javascript
POST /quiz/submit
Headers: Authorization: Bearer {token}
Body: {
  quizId: 'quiz_1',
  module: 'qaida',
  questions: [{ questionId, userAnswer, isCorrect }],
  score: 8,
  totalQuestions: 10
}
```

### Get Quiz Results
```javascript
GET /quiz/results?module=qaida
Headers: Authorization: Bearer {token}
Response: { data: [...] }
```

## Notification Endpoints

### Get Notifications
```javascript
GET /notifications?page=1&limit=20
Headers: Authorization: Bearer {token}
Response: { data: { notifications, pagination } }
```

### Mark as Read
```javascript
PUT /notifications/:id/read
Headers: Authorization: Bearer {token}
```

## Achievement Endpoints

### Get Achievements
```javascript
GET /achievements
Headers: Authorization: Bearer {token}
Response: { data: [...] }
```

### Get Coin History
```javascript
GET /achievements/coins/history?page=1
Headers: Authorization: Bearer {token}
Response: { data: { transactions, pagination } }
```

---

## Service Usage Examples

### Import Services
```javascript
import authService from '../services/authService';
import userService from '../services/userService';
import contentService from '../services/contentService';
import progressService from '../services/progressService';
import quizService from '../services/quizService';
import notificationService from '../services/notificationService';
import achievementService from '../services/achievementService';
```

### Call Methods
```javascript
// Auth
await authService.signup({ name, email, password, role });
await authService.login(email, password);

// User
const dashboard = await userService.getDashboard();
await userService.updateProfile({ name, age });

// Content
const surahs = await contentService.getQuranSurahs();
const duas = await contentService.getDuas({ category: 'daily' });

// Progress
const progress = await progressService.getProgress({ module: 'qaida' });
await progressService.updateLessonProgress(lessonData);

// Quiz
await quizService.submitQuiz(quizData);
const results = await quizService.getQuizResults();

// Notifications
const notifs = await notificationService.getNotifications(1, 20);
await notificationService.markAsRead(notifId);

// Achievements
const achievements = await achievementService.getAchievements();
const coinHistory = await achievementService.getCoinHistory();
```

---

## Error Handling

All service methods throw errors with this structure:
```javascript
{
  message: "Error description",
  status: 400, // HTTP status code
  errors: [] // Validation errors (if any)
}
```

Use try-catch:
```javascript
try {
  const response = await authService.login(email, password);
  // Handle success
} catch (error) {
  Alert.alert('Error', error.message);
}
```

---

## Token Management

Tokens are automatically:
- Stored in AsyncStorage on login/signup
- Added to request headers by axios interceptor
- Removed on logout or 401 error
- Restored on app restart by AuthContext

No manual token handling needed! 🎉
