import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // or your API base URL
  withCredentials: true, // Always send cookies
});

axiosInstance.interceptors.response.use(
  (response) => {


    return response;
  },
  (error) => {
    console.log(error.response.status === 401 ? "--------------------------------------------------------------" : "")

    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("logout"));
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);


export default axiosInstance;