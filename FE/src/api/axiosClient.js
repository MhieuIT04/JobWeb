// src/api/axiosClient.js
import axios from 'axios';

// 1. Tạo một instance của axios KHÔNG có Content-Type mặc định
const axiosClient = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  timeout: 30000,
  // XÓA BỎ 'headers' mặc định khỏi đây
});

// 2. Thiết lập Interceptor để xử lý header một cách linh hoạt
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy tokens từ localStorage
    const authTokens = localStorage.getItem('authTokens')
      ? JSON.parse(localStorage.getItem('authTokens'))
      : null;

    // Luôn đính kèm token nếu có
    if (authTokens?.access) {
      config.headers['Authorization'] = `Bearer ${authTokens.access}`;
    }

    // Xử lý Content-Type
    if (config.data instanceof FormData) {
      // Nếu là FormData, XÓA header Content-Type
      // để trình duyệt tự động thiết lập đúng giá trị với 'boundary'
      delete config.headers['Content-Type'];
    } else {
      // Nếu không phải FormData, đặt là application/json
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để debug (giữ lại rất tốt)
axiosClient.interceptors.response.use(
  (response) => {
    // console.log('API Response:', response.config.url, response.data);
    return response;
  },
  (error) => {
    // console.error('API Error:', error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

export default axiosClient;