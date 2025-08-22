import { authService } from './authService';

// This service makes the actual calls to our backend gateway.
export const apiService = {
  getHeaders: () => {
    const token = authService.getToken();
    if (!token) throw new Error("No authentication token found.");
    return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
  },

  fetchModels: async () => {
    const response = await fetch('http://localhost:9000/api/models', { headers: apiService.getHeaders() });
    if (response.status === 401) {
      authService.clearToken();
      window.location.reload();
      throw new Error('Session expired.');
    }
    if (!response.ok) throw new Error('Failed to fetch models');
    return response.json();
  },
};
