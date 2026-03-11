// Recitation Service - Handles audio upload and AI analysis
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from './apiConfig';

// Longer timeout for AI processing (2 minutes)
const recitationApi = axios.create({
  baseURL: BASE_URL,
  timeout: 150000, // 2.5 min timeout
});

// Add auth token to requests
recitationApi.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Upload audio and get AI recitation analysis
 * @param {string} audioPath - Local file path of the recorded audio
 * @param {string} groundTruth - Expected Arabic text
 * @param {string} module - 'Qaida', 'Quran', or 'Dua'
 * @param {string} levelId - Level identifier
 * @param {string} lessonId - Lesson identifier (optional)
 * @returns {Promise<object>} Analysis results
 */
export const analyzeRecitation = async (audioPath, groundTruth, module, levelId, lessonId = null) => {
  try {
    const formData = new FormData();

    // Determine file extension and mime type
    const ext = audioPath.split('.').pop()?.toLowerCase() || 'mp4';
    const mimeMap = {
      wav: 'audio/wav',
      mp3: 'audio/mpeg',
      m4a: 'audio/m4a',
      mp4: 'audio/mp4',
      aac: 'audio/aac',
      ogg: 'audio/ogg',
      webm: 'audio/webm',
    };
    const mimeType = mimeMap[ext] || 'audio/mp4';

    formData.append('audio', {
      uri: audioPath.startsWith('file://') ? audioPath : `file://${audioPath}`,
      type: mimeType,
      name: `recitation.${ext}`,
    });
    formData.append('ground_truth', groundTruth);
    formData.append('module', module);
    formData.append('levelId', levelId);
    if (lessonId) {
      formData.append('lessonId', lessonId);
    }

    const response = await recitationApi.post('/recitation/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Recitation analysis error:', error?.response?.data || error.message);

    if (error?.response?.status === 503) {
      throw new Error('AI service is currently unavailable. Please try again later.');
    }
    if (error?.code === 'ECONNABORTED') {
      throw new Error('Analysis is taking too long. Please try with a shorter recording.');
    }
    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to analyze recitation. Please check your connection and try again.');
  }
};

/**
 * Get recitation history
 * @param {string} module - Filter by module (optional)
 * @param {number} page - Page number
 * @param {number} limit - Results per page
 */
export const getRecitationHistory = async (module = null, page = 1, limit = 20) => {
  try {
    const params = { page, limit };
    if (module) params.module = module;

    const response = await recitationApi.get('/recitation/history', { params });
    return response.data;
  } catch (error) {
    console.error('Get recitation history error:', error.message);
    throw new Error('Failed to load recitation history.');
  }
};

/**
 * Get single recitation detail
 * @param {string} recitationId 
 */
export const getRecitationDetail = async (recitationId) => {
  try {
    const response = await recitationApi.get(`/recitation/${recitationId}`);
    return response.data;
  } catch (error) {
    console.error('Get recitation detail error:', error.message);
    throw new Error('Failed to load recitation details.');
  }
};

export default {
  analyzeRecitation,
  getRecitationHistory,
  getRecitationDetail,
};
