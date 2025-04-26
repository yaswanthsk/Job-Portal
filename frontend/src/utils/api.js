import axios from 'axios';

let logoutHandler = null;

export const setLogoutFunction = (fn) => {
  logoutHandler = fn;
};

const triggerLogout = () => {
  localStorage.removeItem('token');
  if (logoutHandler) {
    logoutHandler(); // Navigate to login page
  }
};

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      triggerLogout();
    }
    return Promise.reject(error);
  }
);

export default api;
