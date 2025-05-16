import axios from "axios";
import { error } from "console";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL, // or your API base URL
  withCredentials: true, // Always send cookies
});

// let csrfToken: string | null = null;

// export async function fetchCsrfToken() {
//   const res = await axiosInstance.get("/csrf-token");
//   return res.data.csrfToken;
// }

// export async function ensureCsrfToken() {
//   if (!csrfToken) {
//     csrfToken = await fetchCsrfToken();
//   }
//   return csrfToken;
// }

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // const originalRequest = error.config;

    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("logout"));
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
    // if (error.response && error.response.status === 403 && !originalRequest._retry) {
    //   originalRequest._retry = true;
    //   csrfToken = await fetchCsrfToken();
    //   error.config.headers["X-CSRF-Token"] = csrfToken;
    //   return axiosInstance.request(error.config);

    // }
  }
);

// axiosInstance.interceptors.request.use(
//   async (config) => {
//     // Only attach CSRF token to state-changing requests
//     if (["post", "put", "delete", "patch"].includes(config.method || "")) {
//       if (!csrfToken) {
//         csrfToken = await fetchCsrfToken();
//       }
//       config.headers["X-CSRF-Token"] = csrfToken;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );


export default axiosInstance;