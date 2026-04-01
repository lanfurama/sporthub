import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sporthub_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sporthub_token');
      localStorage.removeItem('sporthub_auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
