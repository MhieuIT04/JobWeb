// src/contexts/AuthContext.js

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import axiosClient from "../api/axiosClient";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [authTokens, setAuthTokens] = useState(() => {
    const tokens = localStorage.getItem("authTokens");
    try {
      return tokens ? JSON.parse(tokens) : null;
    } catch {
      localStorage.removeItem("authTokens");
      return null;
    }
  });

  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (authTokens) {
      try {
        const decoded = jwtDecode(authTokens.access);
        setUser(decoded);
      } catch (error) {
        console.error("Token decode error:", error);
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem("authTokens");
      }
    }
  }, [authTokens]);

  // Logic đầy đủ cho hàm login
  const login = async (email, password) => {
    try {
      const response = await axiosClient.post("/api/users/token/", {
        email,
        password,
      });

      if (response.data.access) {
        localStorage.setItem("authTokens", JSON.stringify(response.data));
        setAuthTokens(response.data);
        const decoded = jwtDecode(response.data.access);
        setUser(decoded);
        toast.success("Đăng nhập thành công!");
        return { success: true };
      } else {
        throw new Error("No access token received");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.detail || "Email hoặc mật khẩu không chính xác!";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logic đầy đủ cho hàm logout
  const logout = () => {
    // Clear all auth-related state
    setAuthTokens(null);
    setUser(null);
    setFavorites([]);
    setNotifications([]);
    
    // Clear localStorage
    localStorage.removeItem("authTokens");
    
    // Thêm một small delay để đảm bảo state đã được clear
    return new Promise(resolve => setTimeout(resolve, 50));
  };

  // Bọc fetchFavorites trong useCallback để tối ưu
  const fetchFavorites = useCallback(async () => {
    if (authTokens) {
      try {
        console.log("Fetching favorites...");
        const response = await axiosClient.get("/api/jobs/favorites/");
        console.log("Favorites response:", response.data);
        setFavorites(
          response.data.map((fav) => ({
            favoriteId: fav.id,
            jobId: fav.job.id,
          }))
        );
        console.log(
          "Favorites set:",
          response.data.map((fav) => ({
            favoriteId: fav.id,
            jobId: fav.job.id,
          }))
        );
      } catch (error) {
        console.error("Lỗi tải favorites:", error);
        console.error("Error details:", error.response?.data);
        setFavorites([]);
      }
    }
  }, [authTokens]);

  const toggleFavorite = async (jobId) => {
    const favoriteItem = favorites.find((fav) => fav.jobId === jobId);

    try {
      console.log(
        `Toggling favorite for job ${jobId}, current favorites:`,
        favorites
      );

      if (favoriteItem) {
        console.log(
          `Removing favorite ${favoriteItem.favoriteId} for job ${jobId}`
        );
        await axiosClient.delete(
          `/api/jobs/favorites/${favoriteItem.favoriteId}/`
        );
        setFavorites((prev) =>
          prev.filter((fav) => fav.favoriteId !== favoriteItem.favoriteId)
        );
        console.log(`Favorite removed successfully`);
      } else {
        console.log(`Adding favorite for job ${jobId}`);
        const response = await axiosClient.post("/api/jobs/favorites/", {
          job_id: jobId,
        });
        console.log(`Favorite response:`, response.data);
        setFavorites((prev) => [
          ...prev,
          { favoriteId: response.data.id, jobId: response.data.job.id },
        ]);
        console.log(`Favorite added successfully`);
      }
    } catch (error) {
      console.error("Lỗi khi toggle favorite:", error.response?.data);
      console.error("Error details:", error);
    }
  };
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const fetchNotifications = useCallback(async () => {
    if (localStorage.getItem("authTokens")) {
      try {
        const response = await axiosClient.get("/api/notifications/");
        setNotifications(response.data);
      } catch (error) {
        console.error("Lỗi tải thông báo:", error);
      }
    }
  }, []);

  // Đánh dấu một thông báo là đã đọc (cập nhật cả server và local state)
  const markNotificationRead = async (id) => {
    try {
      // Thử cập nhật trên server
      await axiosClient.patch(`/api/notifications/${id}/`, { is_read: true });
      // Cập nhật local state ngay lập tức
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error('Lỗi khi đánh dấu thông báo là đã đọc:', err);
      // Nếu server lỗi, vẫn cố gắng cập nhật local để UX mượt hơn
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    }
  };

  // Xóa một thông báo (xoá trên server nếu có, fallback là xóa local)
  const deleteNotification = async (id) => {
    try {
      await axiosClient.delete(`/api/notifications/${id}/`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Lỗi khi xóa thông báo:', err);
      // fallback: remove locally so user thấy thay đổi
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }
  };

  // Đánh dấu tất cả thông báo là đã đọc (cố gắng cập nhật server, nhưng cập nhật local ngay)
  const markAllNotificationsRead = async () => {
    try {
      // Cập nhật local ngay để UX mượt
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));

      // Cố gắng cập nhật trên server từng thông báo chưa đọc
      for (const n of notifications) {
        if (!n.is_read) {
          try {
            await axiosClient.patch(`/api/notifications/${n.id}/`, { is_read: true });
          } catch (err) {
            // nếu lỗi, bỏ qua và tiếp tục
            console.error('Không thể cập nhật thông báo trên server:', n.id, err);
          }
        }
      }
    } catch (err) {
      console.error('Lỗi khi đánh dấu tất cả thông báo là đã đọc:', err);
    }
  };

  // useEffect để quản lý trạng thái khi tải lại trang
  useEffect(() => {
    if (authTokens) {
      // 1. Cập nhật user state từ token
      setUser(jwtDecode(authTokens.access));

      // 2. Tải dữ liệu ban đầu cho user này
      fetchFavorites();
      fetchNotifications();

      // 3. (Tùy chọn) Thiết lập interval để tự động cập nhật
      const interval = setInterval(fetchNotifications, 60000); // 1 phút

      // 4. Dọn dẹp interval khi component unmount hoặc authTokens thay đổi
      return () => clearInterval(interval);
    } else {
      // Nếu không có token, reset mọi thứ
      setUser(null);
      setFavorites([]);
      setNotifications([]);
    }
    // 5. Mảng dependency đúng là [authTokens, fetchFavorites, fetchNotifications]
  }, [authTokens, fetchFavorites, fetchNotifications]);

  const contextData = {
    user,
    authTokens,
    isAuthenticated: !!user,
    login,
    logout,
    favorites,
    toggleFavorite,
    isJobFavorited: (jobId) => favorites.some((fav) => fav.jobId === jobId),
    notifications,
    unreadCount,
    markNotificationRead,
    deleteNotification,
    markAllNotificationsRead,
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
