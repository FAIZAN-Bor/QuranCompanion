# Frontend Integration Checklist

## ✅ Completed

- [x] Install required packages (axios, AsyncStorage)
- [x] Create service layer (8 service files)
- [x] Create AuthContext for global auth state
- [x] Update App.js to use AuthProvider
- [x] Update SignUp.js to call API
- [x] Update Otp.js for 6-digit verification
- [x] Update Login.js with API integration
- [x] Update LearnerSurvey.js to submit to backend
- [x] Create comprehensive documentation

## 🔄 Pending (Manual Updates Needed)

### **Authentication & Profile**

- [ ] **EditProfile.js** - Use `userService.updateProfile()`
  ```javascript
  import userService from '../services/userService';
  const handleSave = async (profileData) => {
    await userService.updateProfile(profileData);
  };
  ```

- [ ] **ChangePasswordScreen.js** - Use `userService.changePassword()`
  ```javascript
  import userService from '../services/userService';
  await userService.changePassword(currentPassword, newPassword);
  ```

### **Home & Dashboard**

- [ ] **home.js** - Fetch dashboard data
  ```javascript
  import userService from '../services/userService';
  import { useAuth } from '../context/AuthContext';
  
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  
  useEffect(() => {
    fetchDashboard();
  }, []);
  
  const fetchDashboard = async () => {
    const response = await userService.getDashboard();
    setDashboardData(response.data);
    // Update dashboardCards with real data:
    // - Total Coins: response.data.coins.total
    // - Your Level: response.data.profile.currentLevel
    // - Accuracy: response.data.profile.accuracy
  };
  ```

### **Content Screens**

- [ ] **Quran.js** - Fetch Quran surahs from API
  ```javascript
  import contentService from '../services/contentService';
  
  const [quranData, setQuranData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchQuran();
  }, []);
  
  const fetchQuran = async () => {
    try {
      const response = await contentService.getQuranSurahs();
      setQuranData(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load Quran');
    } finally {
      setLoading(false);
    }
  };
  ```

- [ ] **Quaida.js** - Fetch Qaida lessons
  ```javascript
  import contentService from '../services/contentService';
  const response = await contentService.getQaidaLessons();
  setQaidaData(response.data);
  ```

- [ ] **DuaLearn.js** - Fetch Duas by category
  ```javascript
  import contentService from '../services/contentService';
  const response = await contentService.getDuas({ category: 'daily' });
  setDuaData(response.data);
  ```

- [ ] **QuidaTaqkti.js** - Update to use API data format

- [ ] **AllAya.js** - Ensure surah data matches API format

### **Progress & Learning**

- [ ] **ProgressMap.js** - Fetch user progress
  ```javascript
  import progressService from '../services/progressService';
  
  const [progressData, setProgressData] = useState([]);
  
  const fetchProgress = async () => {
    const response = await progressService.getProgress({
      module: 'qaida',
      status: 'completed'
    });
    setProgressData(response.data);
  };
  ```

- [ ] **LevelDetail.js** - Update lesson completion
  ```javascript
  import progressService from '../services/progressService';
  
  const handleLessonComplete = async (lessonData) => {
    await progressService.updateLessonProgress({
      module: 'qaida',
      levelId: currentLevel,
      lessonId: lesson.id,
      status: 'completed',
      completionPercentage: 100,
      timeSpent: timeSpent,
      accuracy: accuracy
    });
    // Refresh progress
    fetchProgress();
  };
  ```

- [ ] **QuizScreen.js** - Submit quiz results
  ```javascript
  import quizService from '../services/quizService';
  
  const handleQuizSubmit = async () => {
    await quizService.submitQuiz({
      quizId: `quiz_${levelId}`,
      module: 'qaida',
      levelId: currentLevel,
      questions: answers.map(a => ({
        questionId: a.id,
        userAnswer: a.selected,
        isCorrect: a.correct
      })),
      score: correctAnswers,
      totalQuestions: questions.length,
      timeSpent: timeElapsed
    });
  };
  ```

### **Analytics**

- [ ] **AnalyticsScreen.js** - Fetch real progress data
  ```javascript
  import progressService from '../services/progressService';
  import achievementService from '../services/achievementService';
  
  const [progressSummary, setProgressSummary] = useState(null);
  const [coinStats, setCoinStats] = useState(null);
  
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  const fetchAnalytics = async () => {
    const [progress, coins] = await Promise.all([
      progressService.getProgressSummary(),
      achievementService.getCoinStats()
    ]);
    setProgressSummary(progress.data);
    setCoinStats(coins.data);
    // Update charts with real data
  };
  ```

### **Notifications**

- [ ] **NotificationScreen.js** - Load from API
  ```javascript
  import notificationService from '../services/notificationService';
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);
  
  const fetchNotifications = async () => {
    const response = await notificationService.getNotifications(1, 20);
    setNotifications(response.data.notifications);
  };
  
  const fetchUnreadCount = async () => {
    const response = await notificationService.getUnreadCount();
    setUnreadCount(response.data.count);
  };
  
  const handleMarkAsRead = async (id) => {
    await notificationService.markAsRead(id);
    fetchNotifications();
  };
  ```

### **Mistakes**

- [ ] **MistakeScreen.js** - Log and fetch mistakes
  ```javascript
  import mistakeService from '../services/mistakeService';
  
  // Create mistake service file first (copy from achievementService pattern)
  ```

### **Parent Features**

- [ ] **ParentLogin.js** - Use same login flow, check role
  ```javascript
  import { useAuth } from '../context/AuthContext';
  const { login } = useAuth();
  
  const handleLogin = async (email, password) => {
    const response = await login(email, password);
    if (response.data.user.role !== 'parent') {
      Alert.alert('Error', 'This is parent login only');
      return;
    }
    navigation.navigate('ParentMain');
  };
  ```

- [ ] **ParentDashboard.js** - Fetch children and their progress
  ```javascript
  // Create parentService.js first
  import parentService from '../services/parentService';
  
  const [children, setChildren] = useState([]);
  const fetchChildren = async () => {
    const response = await parentService.getChildren();
    setChildren(response.data);
  };
  ```

---

## 🆕 Additional Services Needed

Create these service files (copy pattern from existing services):

### **mistakeService.js**
```javascript
import api from './apiConfig';

class MistakeService {
  async logMistake(mistakeData) {
    const response = await api.post('/mistakes', mistakeData);
    return response.data;
  }

  async getMistakes(filters = {}) {
    const response = await api.get('/mistakes', { params: filters });
    return response.data;
  }

  async resolveMistake(mistakeId) {
    const response = await api.put(`/mistakes/${mistakeId}/resolve`);
    return response.data;
  }

  handleError(error) { /* same as other services */ }
}

export default new MistakeService();
```

### **parentService.js**
```javascript
import api from './apiConfig';

class ParentService {
  async generateLinkCode() {
    const response = await api.post('/parent/generate-link');
    return response.data;
  }

  async linkToParent(linkCode) {
    const response = await api.post('/parent/link', { linkCode });
    return response.data;
  }

  async getChildren() {
    const response = await api.get('/parent/children');
    return response.data;
  }

  async getChildProgress(childId) {
    const response = await api.get(`/parent/children/${childId}/progress`);
    return response.data;
  }

  async getChildQuizzes(childId) {
    const response = await api.get(`/parent/children/${childId}/quizzes`);
    return response.data;
  }

  handleError(error) { /* same pattern */ }
}

export default new ParentService();
```

---

## 🎯 Priority Order

1. **High Priority** (Core functionality):
   - [ ] home.js (dashboard)
   - [ ] Quran.js, Quaida.js (content loading)
   - [ ] ProgressMap.js (track learning)
   - [ ] NotificationScreen.js

2. **Medium Priority**:
   - [ ] AnalyticsScreen.js
   - [ ] QuizScreen.js
   - [ ] EditProfile.js
   - [ ] ChangePasswordScreen.js

3. **Lower Priority**:
   - [ ] Parent features
   - [ ] Mistake tracking
   - [ ] Advanced analytics

---

## 🧪 Testing Each Screen

After updating each screen:

1. **Check network tab** in React Native debugger
2. **Verify API responses** match expected format
3. **Test error scenarios** (no internet, wrong data)
4. **Add loading states** (spinner while fetching)
5. **Handle empty states** (no data available)

---

## 💡 Tips

- Use `useEffect` to fetch data on mount
- Add loading states with `useState`
- Use `try-catch` for error handling
- Show `Alert` or Toast for errors
- Refresh data after mutations (create/update/delete)
- Use `FlatList` `onRefresh` for pull-to-refresh

---

## 📝 Common Pattern

```javascript
import { useState, useEffect } from 'react';
import { Alert, ActivityIndicator } from 'react-native';
import someService from '../services/someService';

const MyScreen = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await someService.getData();
      setData(response.data);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0A7D4F" />;
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  );
};
```

---

## ✅ When You're Done

All screens should:
- Load data from backend API
- Show loading indicators
- Handle errors gracefully
- Support pull-to-refresh
- Update local state after mutations

Your app will be fully connected! 🚀
