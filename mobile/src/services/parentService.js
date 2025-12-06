// Parent Dashboard Service
import api from './apiConfig';

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
      const [progressRes, quizzesRes, mistakesRes, achievementsRes] = await Promise.all([
        api.get(`/parent/child/${childId}/progress`),
        api.get(`/parent/child/${childId}/quizzes`),
        api.get(`/parent/child/${childId}/mistakes`),
        api.get(`/parent/child/${childId}/achievements`)
      ]);

      return {
        success: true,
        data: {
          progress: progressRes.data.data,
          quizzes: quizzesRes.data.data.quizzes,
          mistakes: mistakesRes.data.data.mistakes,
          achievements: achievementsRes.data.data.achievements
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
    try {
      const response = await api.post('/parent/link', { linkCode: linkCode.toUpperCase() });
      return response.data;
    } catch (error) {
      console.error('Link to parent error:', error);
      throw error.response?.data || error;
    }
  }
};

export default parentService;
