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

  // SỬA LẠI Ở ĐÂY: Đưa setAuthTokens trở lại
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );

  const [favorites, setFavorites] = useState([]);

  // Logic đầy đủ cho hàm login
  const login = async (email, password) => {
    try {
      const { data } = await axiosClient.post("/api/users/token/", {
        email,
        password,
      });

      setAuthTokens(data);
      setUser(jwtDecode(data.access));
      localStorage.setItem("authTokens", JSON.stringify(data));
      toast.success("Đăng nhập thành công!");
      return { success: true };

    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        const message = error.response?.data?.detail || "Email hoặc mật khẩu không đúng.";
        toast.error(message);
        return { success: false, message: message };;
    }
  };

  // Logic đầy đủ cho hàm logout
  const logout = () => {
    setAuthTokens(null); // <-- SỬ DỤNG setAuthTokens
    setUser(null);
    localStorage.removeItem("authTokens");
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
  };

  return (
    <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
