// utils/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "/api/v1",
  withCredentials: true // crucial for sending cookies
});

axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "Access token expired" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        await axiosInstance.post("users/refresh-token", {}, {
          withCredentials: true
        });

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("🔁 Refresh token failed:", refreshError.response?.data || refreshError.message);
        return Promise.reject(refreshError); // Let caller handle the error
      }
    }

    return Promise.reject(error); // Other errors
  }
);

export default axiosInstance;
