// Parent Dashboard Service
import api from './apiConfig';
import { BASE_URL } from './apiConfig';

const LINK_FALLBACK_BASE_URLS = [
  BASE_URL,
  'http://10.0.2.2:5000/api',
  'http://localhost:5000/api',
].filter((url, index, arr) => url && arr.indexOf(url) === index);

const isNetworkError = (error) =>
  error?.message === 'Network Error' ||
  (error?.code && String(error.code).toUpperCase().includes('NETWORK'));

const parentService = {
  // Get linked children
  getChildren: async () => {
    try {
      const response = await api.get('/parent/children');
      return response.data;
    } catch (error) {
      console.error('Get children error:', error);
      throw error.response?.data || error;
    }
  },

  // Get child progress details
  getChildProgress: async (childId) => {
    try {
      const response = await api.get(`/parent/child/${childId}/progress`);
      return response.data;
    } catch (error) {
      console.error('Get child progress error:', error);
      throw error.response?.data || error;
    }
  },

  // Get child quiz results
  getChildQuizzes: async (childId) => {
    try {
      const response = await api.get(`/parent/child/${childId}/quizzes`);
      return response.data;
    } catch (error) {
      console.error('Get child quizzes error:', error);
      throw error.response?.data || error;
    }
  },

  // Get child mistakes
  getChildMistakes: async (childId) => {
    try {
      const response = await api.get(`/parent/child/${childId}/mistakes`);
      return response.data;
    } catch (error) {
      console.error('Get child mistakes error:', error);
      throw error.response?.data || error;
    }
  },

  // Get child achievements
  getChildAchievements: async (childId) => {
    try {
      const response = await api.get(`/parent/child/${childId}/achievements`);
      return response.data;
    } catch (error) {
      console.error('Get child achievements error:', error);
      throw error.response?.data || error;
    }
  },

  // Get child recitation attempts
  getChildRecitations: async (childId) => {
    try {
      const response = await api.get(`/parent/child/${childId}/recitations`);
      return response.data;
    } catch (error) {
      console.error('Get child recitations error:', error);
      throw error.response?.data || error;
    }
  },

  // Generate link code for adding a child
  generateLinkCode: async (childEmail) => {
    try {
      const response = await api.post('/parent/generate-link', { childEmail });
      return response.data;
    } catch (error) {
      console.error('Generate link code error:', error);
      throw error.response?.data || error;
    }
  },

  // Unlink a child
  unlinkChild: async (childId) => {
    try {
      const response = await api.delete(`/parent/child/${childId}`);
      return response.data;
    } catch (error) {
      console.error('Unlink child error:', error);
      throw error.response?.data || error;
    }
  },

  // Get comprehensive dashboard data for a child
  getChildDashboard: async (childId) => {
    try {
      const [progressRes, quizzesRes, mistakesRes, achievementsRes, recitationsRes] = await Promise.all([
        api.get(`/parent/child/${childId}/progress`),
        api.get(`/parent/child/${childId}/quizzes`),
        api.get(`/parent/child/${childId}/mistakes`),
        api.get(`/parent/child/${childId}/achievements`),
        api.get(`/parent/child/${childId}/recitations`),
      ]);

      return {
        success: true,
        data: {
          progress: progressRes.data.data,
          quizzes: quizzesRes.data.data.quizzes,
          mistakes: mistakesRes.data.data.mistakes,
          achievements: achievementsRes.data.data.achievements,
          recitations: recitationsRes.data.data.recitations,
        }
      };
    } catch (error) {
      console.error('Get child dashboard error:', error);
      throw error.response?.data || error;
    }
  },

  // Add child by email (generates link code)
  addChildByEmail: async (childEmail) => {
    try {
      const response = await api.post('/parent/generate-link', { childEmail });
      return response.data;
    } catch (error) {
      console.error('Add child error:', error);
      throw error.response?.data || error;
    }
  },

  // Update child details (limited - mainly for notes/nickname)
  updateChildNotes: async (childId, notes) => {
    try {
      const response = await api.put(`/parent/child/${childId}/notes`, { notes });
      return response.data;
    } catch (error) {
      console.error('Update child notes error:', error);
      throw error.response?.data || error;
    }
  },

  // Link learner to parent using link code (called by learner)
  linkToParent: async (linkCode) => {
    const payload = { linkCode: String(linkCode || '').trim().toUpperCase() };

    try {
      const response = await api.post('/parent/link', payload);
      return response.data;
    } catch (error) {
      if (!isNetworkError(error)) {
        console.error('Link to parent error:', error);
        throw error.response?.data || error;
      }

      // Retry once across common local dev hosts (LAN IP / Android emulator / iOS simulator).
      for (const fallbackBaseURL of LINK_FALLBACK_BASE_URLS) {
        try {
          const fallbackResponse = await api.post('/parent/link', payload, {
            baseURL: fallbackBaseURL,
            timeout: 20000,
          });
          return fallbackResponse.data;
        } catch (fallbackError) {
          if (!isNetworkError(fallbackError)) {
            throw fallbackError.response?.data || fallbackError;
          }
        }
      }

      throw {
        message: 'Cannot connect to server. Ensure backend is running and this device can reach the API host.',
        status: 0,
      };
    }
  }
};

export default parentService;
