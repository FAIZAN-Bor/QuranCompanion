// Quiz Service
import api from './apiConfig';

class QuizService {
  // Submit quiz
  async submitQuiz(quizData) {
    try {
      const response = await api.post('/quiz/submit', quizData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get quiz results
  async getQuizResults(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `/quiz/results${queryParams ? `?${queryParams}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get best score for a quiz
  async getBestScore(quizId) {
    try {
      const response = await api.get(`/quiz/best/${quizId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get quiz statistics
  async getQuizStats(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `/quiz/stats${queryParams ? `?${queryParams}` : ''}`;
      const response = await api.get(url);
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

export default new QuizService();
