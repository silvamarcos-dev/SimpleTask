import axios from "axios";

import { getToken } from "../lib/authStorage";

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  return config;
});