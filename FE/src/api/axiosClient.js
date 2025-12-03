// src/api/axiosClient.js
import axios from 'axios';

// 1. Tạo một instance của axios KHÔNG có Content-Type mặc định
const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000',
  timeout: 30000,
  // XÓA BỎ 'headers' mặc định khỏi đây
});

// 2. Thiết lập Interceptor để xử lý header một cách linh hoạt
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy tokens từ localStorage
    let authTokens = localStorage.getItem('authTokens');
    
    try {
      if (authTokens) {
        authTokens = JSON.parse(authTokens);
        if (authTokens?.access) {
          config.headers.Authorization = `Bearer ${authTokens.access}`;
        }
      }
    } catch (error) {
      console.error("Error parsing auth tokens:", error);
      localStorage.removeItem('authTokens'); // Clear invalid tokens
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

// Response interceptor với token refresh logic
axiosClient.interceptors.response.use(
  (response) => {
    // console.log('API Response:', response.config.url, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const authTokens = JSON.parse(localStorage.getItem('authTokens') || '{}');
        
        if (authTokens?.refresh) {
          // Thử refresh token
          const refreshResponse = await axios.post(
            `${process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000'}/api/users/token/refresh/`,
            { refresh: authTokens.refresh }
          );
          
          // Cập nhật token mới
          const newTokens = {
            ...authTokens,
            access: refreshResponse.data.access
          };
          
          localStorage.setItem('authTokens', JSON.stringify(newTokens));
          
          // Retry request với token mới
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.access}`;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh thất bại → logout
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('authTokens');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // console.error('API Error:', error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

export default axiosClient;