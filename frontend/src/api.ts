import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // or your API base URL
  withCredentials: true, // Always send cookies
});

export default axiosInstance;