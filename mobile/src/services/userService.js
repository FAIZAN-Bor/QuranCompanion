// User Service
import api from './apiConfig';

class UserService {
  // Update profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/users/profile', profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Change password
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/users/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Submit survey
  async submitSurvey(surveyData) {
    try {
      const response = await api.post('/users/survey', surveyData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get survey response
  async getSurvey() {
    try {
      const response = await api.get('/users/survey');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get dashboard data
  async getDashboard() {
    try {
      const response = await api.get('/users/dashboard');
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

export default new UserService();
