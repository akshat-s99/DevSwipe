import axios from 'axios';

/**
 * Configure Axios client instance with standard base URL.
 * Vite loads VITE_API_URL environment variable at build-time.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Before every outgoing API call, check if there's a token stored in localStorage.
 * If found, append it to the HTTP request's 'Authorization' header using the 'Bearer' scheme.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Evaluates responses returned from backend APIs.
 * If the response contains a 401 Unauthorized status (e.g. token expired, tampered, or missing),
 * clear the token from localStorage and dispatch a global 'auth-unauthorized' event
 * so that our AuthContext can immediately clean up the state and redirect the user.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Dispatch a custom event to notify React components to update auth state
      window.dispatchEvent(new Event('auth-unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
