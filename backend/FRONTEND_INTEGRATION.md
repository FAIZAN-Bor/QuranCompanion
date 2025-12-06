# Frontend Integration Guide

How to connect your React Native mobile app to the Quran Companion backend.

## Configuration

### 1. Create API Config File

Create `mobile/src/config/api.js`:

```javascript
// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:5000/api'  // Android emulator
  : 'http://your-production-url.com/api';

export default {
  BASE_URL: API_BASE_URL,
  
  // Endpoints
  AUTH: {
    SIGNUP: '/auth/signup',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    LOGIN: '/auth/login',
    ME: '/auth/me',
    LOGOUT: '/auth/logout'
  },
  
  USER: {
    PROFILE: '/users/profile',
    CHANGE_PASSWORD: '/users/change-password',
    SURVEY: '/users/survey',
    DASHBOARD: '/users/dashboard'
  },
  
  PROGRESS: {
    BASE: '/progress',
    SUMMARY: '/progress/summary',
    LESSON: '/progress/lesson'
  },
  
  QUIZ: {
    SUBMIT: '/quiz/submit',
    RESULTS: '/quiz/results',
    BEST: '/quiz/best',
    STATS: '/quiz/stats'
  },
  
  CONTENT: {
    BASE: '/content',
    SEARCH: '/content/search'
  },
  
  MISTAKES: {
    BASE: '/mistakes',
    STATS: '/mistakes/stats'
  },
  
  PARENT: {
    GENERATE_LINK: '/parent/generate-link',
    LINK: '/parent/link',
    CHILDREN: '/parent/children'
  },
  
  NOTIFICATIONS: {
    BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_ALL_READ: '/notifications/mark-all-read'
  },
  
  ACHIEVEMENTS: {
    BASE: '/achievements',
    COIN_HISTORY: '/achievements/coins/history',
    COIN_STATS: '/achievements/coins/stats'
  }
};
```

### 2. Create API Service

Create `mobile/src/services/apiService.js`:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../config/api';

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.token = null;
  }

  // Initialize token from storage
  async init() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        this.token = token;
      }
    } catch (error) {
      console.error('Error loading token:', error);
    }
  }

  // Set auth token
  setToken(token) {
    this.token = token;
    AsyncStorage.setItem('authToken', token);
  }

  // Clear auth token
  clearToken() {
    this.token = null;
    AsyncStorage.removeItem('authToken');
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  // PUT request
  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export default new ApiService();
```

### 3. Create Auth Service

Create `mobile/src/services/authService.js`:

```javascript
import apiService from './apiService';
import API_CONFIG from '../config/api';

export const authService = {
  // Sign up
  async signup(name, email, password, role) {
    const response = await apiService.post(API_CONFIG.AUTH.SIGNUP, {
      name,
      email,
      password,
      role
    });
    return response;
  },

  // Verify OTP
  async verifyOTP(email, otp) {
    const response = await apiService.post(API_CONFIG.AUTH.VERIFY_OTP, {
      email,
      otp
    });
    
    if (response.success && response.data.token) {
      apiService.setToken(response.data.token);
    }
    
    return response;
  },

  // Resend OTP
  async resendOTP(email) {
    const response = await apiService.post(API_CONFIG.AUTH.RESEND_OTP, {
      email
    });
    return response;
  },

  // Login
  async login(email, password) {
    const response = await apiService.post(API_CONFIG.AUTH.LOGIN, {
      email,
      password
    });
    
    if (response.success && response.data.token) {
      apiService.setToken(response.data.token);
    }
    
    return response;
  },

  // Get current user
  async getCurrentUser() {
    const response = await apiService.get(API_CONFIG.AUTH.ME);
    return response;
  },

  // Logout
  async logout() {
    await apiService.post(API_CONFIG.AUTH.LOGOUT);
    apiService.clearToken();
  }
};
```

### 4. Create Progress Service

Create `mobile/src/services/progressService.js`:

```javascript
import apiService from './apiService';
import API_CONFIG from '../config/api';

export const progressService = {
  // Update lesson progress
  async updateLessonProgress(data) {
    const response = await apiService.post(API_CONFIG.PROGRESS.LESSON, data);
    return response;
  },

  // Get progress summary
  async getProgressSummary() {
    const response = await apiService.get(API_CONFIG.PROGRESS.SUMMARY);
    return response;
  },

  // Get all progress
  async getProgress(module = null) {
    const endpoint = module 
      ? `${API_CONFIG.PROGRESS.BASE}?module=${module}`
      : API_CONFIG.PROGRESS.BASE;
    
    const response = await apiService.get(endpoint);
    return response;
  }
};
```

### 5. Create Content Service

Create `mobile/src/services/contentService.js`:

```javascript
import apiService from './apiService';
import API_CONFIG from '../config/api';

export const contentService = {
  // Get content by type
  async getContentByType(type) {
    const response = await apiService.get(`${API_CONFIG.CONTENT.BASE}/${type}`);
    return response;
  },

  // Get Quran surahs
  async getQuranSurahs() {
    return this.getContentByType('Quran');
  },

  // Get Qaida lessons
  async getQaidaLessons() {
    return this.getContentByType('Qaida');
  },

  // Get Duas
  async getDuas() {
    return this.getContentByType('Dua');
  },

  // Search content
  async searchContent(query, type = null) {
    const endpoint = type
      ? `${API_CONFIG.CONTENT.SEARCH}?q=${query}&type=${type}`
      : `${API_CONFIG.CONTENT.SEARCH}?q=${query}`;
    
    const response = await apiService.get(endpoint);
    return response;
  }
};
```

## Usage Examples

### In SignUp Component

Update `mobile/src/auth/SignUp.js`:

```javascript
import { authService } from '../services/authService';

const SignUp = ({ navigation }) => {
  const handleSubmit = async (values) => {
    try {
      const response = await authService.signup(
        values.name,
        values.email,
        values.password,
        values.role
      );
      
      if (response.success) {
        // Navigate to OTP screen
        navigation.navigate('Otp', { email: values.email });
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  // ... rest of component
};
```

### In Login Component

Update `mobile/src/auth/Login.js`:

```javascript
import { authService } from '../services/authService';

const Login = ({ navigation }) => {
  const handleLogin = async (values) => {
    try {
      const response = await authService.login(
        values.email,
        values.password
      );
      
      if (response.success) {
        // Check if email is verified
        if (response.requiresVerification) {
          navigation.navigate('Otp', { email: values.email });
        } else {
          // Navigate to main app
          navigation.navigate('BottomTabNavigator');
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  // ... rest of component
};
```

### In Progress Tracking

Update lesson completion in `mobile/src/home/LevelDetail.js`:

```javascript
import { progressService } from '../services/progressService';

const LevelDetail = ({ route }) => {
  const handleLessonComplete = async (lesson) => {
    try {
      const response = await progressService.updateLessonProgress({
        module: level.module,
        levelId: level.id,
        lessonId: lesson.id,
        status: 'completed',
        completionPercentage: 100,
        timeSpent: lessonTimeSpent,
        accuracy: lessonAccuracy
      });
      
      if (response.success) {
        Alert.alert(
          'Lesson Complete!',
          `You earned ${response.data.progress.coinsEarned} coins!`
        );
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };
  
  // ... rest of component
};
```

### Loading Content

Update `mobile/src/home/home.js`:

```javascript
import { contentService } from '../services/contentService';

const Home = () => {
  const [quranData, setQuranData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await contentService.getQuranSurahs();
      if (response.success) {
        setQuranData(response.data.content);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
};
```

## Important Notes

### Network Configuration

1. **Android Emulator**: Use `http://10.0.2.2:5000`
2. **iOS Simulator**: Use `http://localhost:5000`
3. **Physical Device**: Use your computer's IP address (e.g., `http://192.168.1.100:5000`)

### Finding Your IP Address

Windows:
```bash
ipconfig
# Look for IPv4 Address
```

### Testing on Physical Device

1. Ensure phone and computer are on same Wi-Fi
2. Update `API_BASE_URL` with your computer's IP
3. Ensure backend server is accessible (check firewall)

### Error Handling

Always wrap API calls in try-catch:

```javascript
try {
  const response = await authService.login(email, password);
  // Handle success
} catch (error) {
  Alert.alert('Error', error.message || 'Something went wrong');
}
```

### AsyncStorage Setup

Install AsyncStorage:
```bash
npm install @react-native-async-storage/async-storage
cd ios && pod install
```

### Initialize API Service

In your root `App.js`:

```javascript
import apiService from './src/services/apiService';

useEffect(() => {
  apiService.init();
}, []);
```

## Next Steps

1. Replace static data in frontend with API calls
2. Implement loading states for all API calls
3. Add error handling and retry logic
4. Implement offline support with AsyncStorage caching
5. Add pull-to-refresh functionality
6. Implement real-time notifications (consider Socket.IO)
