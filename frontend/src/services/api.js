import axios from "axios";

// Intelligently guess the local network IP or use relative path for production
const BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? `http://${window.location.hostname}:5000/api/news`
  : `/api/news`;

export const fetchNews = async (category) => {
  const cat = category || "icici";
  const separator = cat.includes("?") ? "&" : "?";
  // Adding timestamp to strictly avoid browser caching, ensuring fresh data on every refresh
  const res = await axios.get(`${BASE_URL}/${cat}${separator}t=${new Date().getTime()}`);

  return res.data;
};

export const fetchSummary = async (article) => {
  const URL = BASE_URL.replace('/news', '');
  const res = await axios.post(`${URL}/summarize`, {
    title: article.title,
    description: article.description,
    url: article.url
  });
  return res.data.summary;
};
