import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add auth token to requests and handle FormData
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Only add auth header if user exists and has token
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  
  // For FormData, let axios/browser handle Content-Type automatically
  // Remove any Content-Type header that might have been set
  if (config.data instanceof FormData) {
    // Delete Content-Type so axios will set it with the correct boundary
    delete config.headers['Content-Type'];
  } else {
    // For JSON data, explicitly set Content-Type
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
  }
  
  return config;
});

// Handle 401 errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;
