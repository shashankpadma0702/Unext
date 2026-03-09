import axios from "axios";

// Automatically use the deployed backend URL if set in Vite environment variables, otherwise use localhost
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/news";

export const fetchNews = async (category) => {
  const res = await axios.get(`${BASE_URL}/${category || "home"}`);

  return res.data;
};
