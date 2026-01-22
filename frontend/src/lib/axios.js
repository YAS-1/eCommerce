import axios from "axios";

//creating the axios instance to be used
const axiosInstance = axios.create({
    baseURL: import.meta.mode === "development" ? "http://localhost:5000/api" : "/api", // the baseUrl is set to localhost when in development
    withCredentials: true, //send cookies to the backend
});

export default axiosInstance;