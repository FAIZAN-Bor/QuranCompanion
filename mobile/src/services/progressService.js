// Progress Service
import api from './apiConfig';

class ProgressService {
  // Get progress with filters
  async getProgress(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `/progress${queryParams ? `?${queryParams}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get progress summary (aggregated stats)
  async getProgressSummary() {
    try {
      const response = await api.get('/progress/summary');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update lesson progress
  async updateLessonProgress(progressData) {
    try {
      const response = await api.post('/progress/lesson', progressData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get specific lesson progress
  async getLessonProgress(module, levelId, lessonId) {
    try {
      const response = await api.get(`/progress/lesson/${module}/${levelId}/${lessonId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reset lesson progress
  async resetLessonProgress(lessonId) {
    try {
      const response = await api.delete(`/progress/lesson/${lessonId}`);
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

export default new ProgressService();
