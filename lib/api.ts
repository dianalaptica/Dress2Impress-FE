export const API_BASE = "http://10.0.2.2:5001";
export const LOGIN_URL = `${API_BASE}/Api/Auth/Login`;
export const REGISTER_URL = `${API_BASE}/Api/Auth/Register`;

import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_BASE_URL = "http://10.0.2.2:5001/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log("[API] Response:", res.status, res.config.url, res.data);
    return res;
  },
  (err) => {
    if (err.response) {
      console.log(
        "[API] Error:",
        err.response.status,
        err.config?.url,
        err.response.data
      );
    } else {
      console.log("[API] Error (no response):", err.message);
    }
    throw err;
  }
);
