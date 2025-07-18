import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

instance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => response, // Trả về toàn bộ response
  (error) => {
    return Promise.reject(
      error?.response?.data ?? { message: "Unknown error", code: "UNKNOWN" }
    );
  }
);

export default instance;
