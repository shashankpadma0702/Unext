import axios from "axios";

// Automatically use the deployed backend URL if set in Vite environment variables, otherwise use localhost
const isDev = import.meta.env.MODE === 'development';
const BASE_URL = isDev ? "http://localhost:5000/api/news" : "/api/news";

export const fetchNews = async (category) => {
  const res = await axios.get(`${BASE_URL}/${category || "home"}`);

  return res.data;
};
