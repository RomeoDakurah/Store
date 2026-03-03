import axios from "axios";

// --- Axios instance ---
const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// Request interceptor for private API calls
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      console.warn("Unauthorized API request");
    }
    return Promise.reject(error);
  }
);

// --- Public API for unauthenticated calls ---
const API_PUBLIC = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// --- Exported functions ---

// Auth
export const signup = (data) => API.post("/auth/signup", data);
export const login = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// Products & Variants
export const getProducts = () => API_PUBLIC.get("/products"); // public
export const getVariants = (productId) => API_PUBLIC.get(`/products/${productId}/variants`);
export const createProduct = (data) =>API.post("/products", data);

// Orders (private)
export const getOrders = () => API.get("/orders");
export const createOrder = (data) => API.post("/orders", data);

// Export API instances (keep names consistent)
export const api = () => API;
export default API;
