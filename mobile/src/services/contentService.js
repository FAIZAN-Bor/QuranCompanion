// Content Service - For Quran, Qaida, and Dua content
import api from './apiConfig';

class ContentService {
  // Get content by type (quran, qaida, dua)
  async getContentByType(type, filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `/content/${type}${queryParams ? `?${queryParams}` : ''}`;
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get Quran surahs
  async getQuranSurahs(filters = {}) {
    return this.getContentByType('Quran', filters);
  }

  // Get Qaida lessons
  async getQaidaLessons(filters = {}) {
    return this.getContentByType('Qaida', filters);
  }

  // Get Duas
  async getDuas(filters = {}) {
    return this.getContentByType('Dua', filters);
  }

  // Get content by ID
  async getContentById(id) {
    try {
      const response = await api.get(`/content/detail/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get content by number (Surah number, Qaida lesson number)
  async getContentByNumber(type, number) {
    try {
      const response = await api.get(`/content/${type}/${number}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Search content
  async searchContent(searchQuery, filters = {}) {
    try {
      const params = { q: searchQuery, ...filters };
      const queryParams = new URLSearchParams(params).toString();
      const response = await api.get(`/content/search?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get duas by category
  async getDuasByCategory(category) {
    try {
      const response = await api.get(`/content/dua/category/${category}`);
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

export default new ContentService();
