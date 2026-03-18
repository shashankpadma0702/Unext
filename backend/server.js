const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const Parser = require("rss-parser");
const parser = new Parser({
  customFields: {
    item: ['image']
  }
});

const app = express();
app.use(cors()); // Allows all origins by default (good for simple deployment)

// Internal cache to prevent spamming the OK Surf API
// <... omitted cache logic for brevity as it remains unchanged ...>

// Internal cache to prevent spamming the OK Surf API
let newsCache = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

async function fetchLiveNews() {
  const now = Date.now();
  if (newsCache && now - lastFetchTime < CACHE_TTL_MS) {
    return newsCache;
  }
  
  try {
    const response = await axios.get("https://ok.surf/api/v1/cors/news-feed");
    newsCache = response.data;
    lastFetchTime = now;
    return newsCache;
  } catch (error) {
    console.error("Error fetching live news:", error.message);
    return newsCache; // Fallback to stale cache if available
  }
}

// Convert OK.surf format to our Dashboard format
function formatArticles(articlesArray) {
  if (!articlesArray) return [];
  return articlesArray.slice(0, 10).map(item => ({
    title: item.title,
    url: item.link,
    // ok.surf provides the image URL directly in the 'og' string field
    urlToImage: item.og,
    source: { name: item.source },
    description: item.title // ok.surf doesn't have descriptions, title serves well enough
  }));
}

// BFSI - Business & Finance
app.get("/api/news/bfsi", async (req, res) => {
  const data = await fetchLiveNews();
  res.json(formatArticles(data?.Business));
});

// MARKETS - Markets & Finance overlap
app.get("/api/news/markets", async (req, res) => {
  const data = await fetchLiveNews();
  // We can pick different articles from Business to split Markets vs BFSI
  const articles = formatArticles(data?.Business?.slice(10, 20) || data?.Business);
  res.json(articles);
});

// COMMODITIES
app.get("/api/news/commodities", async (req, res) => {
  const data = await fetchLiveNews();
  // Using Science/Tech or generic if no commodity specific
  const articles = formatArticles(data?.Technology?.slice(0, 10) || data?.Business);
  res.json(articles);
});

// WORLD
app.get("/api/news/world", async (req, res) => {
  const data = await fetchLiveNews();
  res.json(formatArticles(data?.World));
});

// CURRENT AFFAIRS - General/US
app.get("/api/news/current", async (req, res) => {
  const data = await fetchLiveNews();
  res.json(formatArticles(data?.US));
});

// SPORTS
app.get("/api/news/sports", async (req, res) => {
  const data = await fetchLiveNews();
  res.json(formatArticles(data?.Sports));
});

// ICICI NEWS (Custom via Bing RSS)
app.get("/api/news/icici", async (req, res) => {
  try {
    const feed = await parser.parseURL("https://www.bing.com/news/search?q=ICICI+Bank&format=rss");
    const articles = feed.items.slice(0, 10).map(item => ({
      title: item.title,
      url: item.link,
      // Bing RSS usually doesn't have an easily extractable image in simple parsing
      urlToImage: item.image || "",
      source: { name: "Bing News (ICICI)" },
      description: item.contentSnippet || item.title
    }));
    res.json(articles);
  } catch (error) {
    console.error("Error fetching ICICI news:", error.message);
    res.json([]);
  }
});

// HEALTH CHECK (To keep Render awake)
app.get("/api/health", (req, res) => {
  res.status(200).send("OK. Server is awake.");
});

// --- PRODUCTION FULL STACK DEPLOYMENT ---
// Serve the built frontend static files
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Catch-all route to serve index.html for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`ICICI UNext News backend running on port ${PORT} (Live OK.surf API)`);
});