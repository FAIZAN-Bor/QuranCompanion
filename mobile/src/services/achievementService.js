// Achievement Service
import api from './apiConfig';

class AchievementService {
  // Get achievements
  async getAchievements(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `/achievements${queryParams ? `?${queryParams}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get achievement by ID
  async getAchievementById(achievementId) {
    try {
      const response = await api.get(`/achievements/${achievementId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get coin transaction history
  async getCoinHistory(page = 1, limit = 20) {
    try {
      const response = await api.get(`/achievements/coins/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get coin statistics
  async getCoinStats() {
    try {
      const response = await api.get('/achievements/coins/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Handle errors
  handleError(error) {
    if (error.response) {
      return {
        message: error.response.data.message || 'An error occurred',
        status: error.response.status,
        errors: error.response.data.errors,
      };
    } else if (error.request) {
      return {
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
        status: 0,
      };
    }
  }
}

export default new AchievementService();
