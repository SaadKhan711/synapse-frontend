// This service handles getting and storing the JWT token from Keycloak.
export const authService = {
  getToken: () => localStorage.getItem('synapse_token'),
  setToken: (token) => localStorage.setItem('synapse_token', token),
  clearToken: () => localStorage.removeItem('synapse_token'),
  
  login: async (username, password) => {
    const params = new URLSearchParams({ grant_type: 'password', client_id: 'synapse-frontend', username, password });
    const response = await fetch('http://localhost:8080/realms/synapse/protocol/openid-connect/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error_description || 'Authentication failed');
    }

    const data = await response.json();
    authService.setToken(data.access_token);
    return data.access_token;
  }
};
