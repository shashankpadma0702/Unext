import axios from "axios";

// Automatically use the deployed backend URL, or intelligently guess the local network IP instead of forcing localhost
const API_PORT = 5000;
const isDev = import.meta.env.DEV;
const defaultLocalUrl = isDev 
  ? `http://${window.location.hostname}:${API_PORT}/api/news`
  : `/api/news`; // Falls back to relative path in production

const BASE_URL = import.meta.env.VITE_API_URL || defaultLocalUrl;

export const fetchNews = async (category) => {
  const res = await axios.get(`${BASE_URL}/${category || "home"}`);

  return res.data;
};

export const fetchSummary = async (article) => {
  const URL = BASE_URL.replace('/news', '');
  const res = await axios.post(`${URL}/summarize`, {
    title: article.title,
    description: article.description
  });
  return res.data.summary;
};
