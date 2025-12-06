# Frontend-Backend Integration Guide

## ✅ Completed Integration

### 1. **Packages Installed**
- `@react-native-async-storage/async-storage` - Token and data storage
- `axios` - HTTP client for API calls

### 2. **Service Layer Created** (`src/services/`)
All services handle errors and automatically include auth tokens:

- **`apiConfig.js`** - Base axios configuration with interceptors
  - Automatically adds auth token to requests
  - Handles 401 errors (token expiry)
  - Base URL: `http://10.0.2.2:5000/api` (Android emulator)

- **`authService.js`** - Authentication operations
  - signup(), verifyOTP(), resendOTP(), login(), logout()
  - getCurrentUser(), isAuthenticated(), getUserData()

- **`userService.js`** - User profile operations
  - updateProfile(), changePassword()
  - submitSurvey(), getSurvey(), getDashboard()

- **`contentService.js`** - Quran/Qaida/Dua content
  - getQuranSurahs(), getQaidaLessons(), getDuas()
  - getContentById(), searchContent()

- **`progressService.js`** - Learning progress
  - getProgress(), getProgressSummary()
  - updateLessonProgress(), getLessonProgress()

- **`quizService.js`** - Quiz operations
  - submitQuiz(), getQuizResults()
  - getBestScore(), getQuizStats()

- **`notificationService.js`** - Notifications
  - getNotifications(), markAsRead()
  - getUnreadCount(), deleteNotification()

- **`achievementService.js`** - Achievements & coins
  - getAchievements(), getCoinHistory()
  - getCoinStats()

### 3. **Auth Context** (`src/context/AuthContext.js`)
Global authentication state management:
- `user` - Current user data
- `isAuthenticated` - Auth status
- `login()`, `signup()`, `verifyOTP()`, `logout()`
- Automatic token restoration on app restart

### 4. **Updated Screens**

#### ✅ **SignUp.js**
- Calls `authService.signup()` with form data
- Stores pending email for OTP verification
- Shows loading indicator during signup
- Displays error alerts on failure

#### ✅ **Otp.js**
- 6-digit OTP input (changed from 4)
- Calls `authService.verifyOTP()` 
- Resend OTP functionality
- Displays email being verified
- Auto-navigates to survey on success

#### ✅ **Login.js**
- Calls `authService.login()` with credentials
- Checks verification status
- Role-based navigation (parent → ParentNavigator, child → BottomTabNavigator)
- Loading states and error handling

#### ✅ **LearnerSurvey.js**
- Submits survey to `userService.submitSurvey()`
- Auto-navigates to home after 3 seconds
- Error handling for submission

### 5. **App.js**
- Wrapped with `<AuthProvider>` for global auth state

---

## 🔧 Configuration Required

### **Update BASE_URL** (`src/services/apiConfig.js`)

Change based on your environment:

```javascript
// For Android Emulator
export const BASE_URL = 'http://10.0.2.2:5000/api';

// For iOS Simulator
export const BASE_URL = 'http://localhost:5000/api';

// For Physical Device (use your computer's IP)
export const BASE_URL = 'http://192.168.1.x:5000/api'; // Replace with your IP
```

To find your IP:
- Windows: `ipconfig` (look for IPv4)
- Mac/Linux: `ifconfig` (look for inet)

---

## 📱 Next Steps - Screens to Update

### **High Priority** (Core functionality)

#### 1. **home.js** - Dashboard
```javascript
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';

// In component:
const { user } = useAuth();
const [dashboard, setDashboard] = useState(null);

useEffect(() => {
  fetchDashboard();
}, []);

const fetchDashboard = async () => {
  try {
    const response = await userService.getDashboard();
    setDashboard(response.data);
  } catch (error) {
    console.error(error);
  }
};

// Use dashboard.coins, dashboard.currentLevel, dashboard.accuracy, etc.
```

#### 2. **Quran.js** - Fetch Quran content
```javascript
import contentService from '../services/contentService';

const [surahs, setSurahs] = useState([]);

useEffect(() => {
  fetchSurahs();
}, []);

const fetchSurahs = async () => {
  try {
    const response = await contentService.getQuranSurahs();
    setSurahs(response.data);
  } catch (error) {
    Alert.alert('Error', 'Failed to load Quran content');
  }
};
```

#### 3. **Quaida.js** - Fetch Qaida lessons
```javascript
const response = await contentService.getQaidaLessons();
```

#### 4. **DuaLearn.js** - Fetch Duas
```javascript
const response = await contentService.getDuas({ category: 'daily' });
```

#### 5. **AnalyticsScreen.js** - Fetch progress stats
```javascript
import progressService from '../services/progressService';

const response = await progressService.getProgressSummary();
// Use response.data for charts
```

#### 6. **NotificationScreen.js** - Load notifications
```javascript
import notificationService from '../services/notificationService';

const response = await notificationService.getNotifications();
setNotifications(response.data.notifications);
```

#### 7. **Progress Map** - Update lesson progress
```javascript
import progressService from '../services/progressService';

const handleLessonComplete = async (lessonData) => {
  await progressService.updateLessonProgress({
    module: 'qaida',
    levelId: 1,
    lessonId: 'lesson_1',
    status: 'completed',
    completionPercentage: 100,
    timeSpent: 300, // seconds
    accuracy: 85
  });
};
```

#### 8. **QuizScreen.js** - Submit quiz results
```javascript
import quizService from '../services/quizService';

const handleQuizSubmit = async (quizData) => {
  await quizService.submitQuiz({
    quizId: 'quiz_1',
    module: 'qaida',
    levelId: 1,
    questions: [
      { questionId: 'q1', userAnswer: 'a', isCorrect: true },
      // ...
    ],
    score: 8,
    totalQuestions: 10,
    timeSpent: 180
  });
};
```

---

## 🔐 Authentication Flow

```
1. User opens app → AuthContext checks for token
   └─ Token exists → Auto-login → Home
   └─ No token → Splash → Onboarding → SignUp/Login

2. SignUp → Enter details → Submit
   └─ Backend sends OTP email
   └─ Navigate to OTP screen

3. OTP → Enter 6 digits → Verify
   └─ Success → Store token → Navigate to Survey
   └─ Survey → Submit → Navigate to Home

4. Login → Enter credentials → Submit
   └─ Check role:
      └─ Parent → ParentNavigator
      └─ Child → BottomTabNavigator

5. Logout → Clear token → Navigate to Login
```

---

## 🧪 Testing

### **1. Start Backend**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### **2. Test API Endpoints (Postman/Thunder Client)**

**Signup:**
```http
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "role": "child"
}
```

**Login:**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}
```

### **3. Run Mobile App**
```bash
cd mobile
npx react-native run-android
# or
npx react-native run-ios
```

---

## 🐛 Common Issues

### **1. Network Error on Android Emulator**
- Ensure BASE_URL is `http://10.0.2.2:5000/api`
- Backend must be running on `localhost:5000`

### **2. Network Error on iOS Simulator**
- Use `http://localhost:5000/api`

### **3. Network Error on Physical Device**
- Use your computer's IP: `http://192.168.1.x:5000/api`
- Ensure phone and computer on same WiFi
- Disable firewall if blocking port 5000

### **4. "Cannot read property 'data' of undefined"**
- Check error handling in try-catch
- Verify backend is returning correct response format

### **5. Token Expired**
- AuthContext automatically clears expired tokens
- User redirected to login

---

## 📊 Response Format

All backend responses follow this structure:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* actual data */ }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ /* validation errors */ ]
}
```

---

## 🎯 Usage Examples

### **Fetch User Dashboard**
```javascript
import userService from '../services/userService';

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await userService.getDashboard();
      setData(response.data);
      // data.profile, data.progress, data.achievements, data.coins
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return <View>/* UI */</View>;
};
```

### **Update Profile**
```javascript
import userService from '../services/userService';

const updateProfile = async (name, age) => {
  try {
    await userService.updateProfile({ name, age });
    Alert.alert('Success', 'Profile updated!');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

### **Load Notifications**
```javascript
import notificationService from '../services/notificationService';

const [notifications, setNotifications] = useState([]);

const loadNotifications = async () => {
  try {
    const response = await notificationService.getNotifications(1, 20);
    setNotifications(response.data.notifications);
  } catch (error) {
    console.error(error);
  }
};
```

---

## 🚀 Ready to Use!

Your frontend is now connected to the backend. The authentication flow is complete and working. 

**Next steps:**
1. Update remaining screens to fetch data from API
2. Replace all static data with API calls
3. Test all functionality end-to-end
4. Add loading states and error handling to all screens

All services are ready to use - just import and call the methods! 🎉
