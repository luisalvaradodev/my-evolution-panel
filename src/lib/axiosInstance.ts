import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    apikey: "mude-me",
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
