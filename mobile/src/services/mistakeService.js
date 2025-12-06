// Mistake Service
import api from './apiConfig';

class MistakeService {
  // Get user's mistakes with optional filters
  async getMistakes(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `/mistakes${queryParams ? `?${queryParams}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get mistake statistics
  async getMistakeStats() {
    try {
      const response = await api.get('/mistakes/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get a single mistake by ID
  async getMistakeById(mistakeId) {
    try {
      const response = await api.get(`/mistakes/${mistakeId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Log a new mistake
  async logMistake(mistakeData) {
    try {
      const response = await api.post('/mistakes', mistakeData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Resolve a mistake (mark as resolved)
  async resolveMistake(mistakeId, correctionNote = null) {
    try {
      const response = await api.put(`/mistakes/${mistakeId}/resolve`, { correctionNote });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Submit practice attempt for a mistake
  async submitPracticeAttempt(mistakeId, attemptData) {
    try {
      const response = await api.post(`/mistakes/${mistakeId}/practice`, attemptData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete a mistake
  async deleteMistake(mistakeId) {
    try {
      const response = await api.delete(`/mistakes/${mistakeId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'An error occurred',
        status: error.response.status,
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        status: 0,
      };
    } else {
      return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        status: 0,
      };
    }
  }
}

const mistakeService = new MistakeService();
export default mistakeService;
