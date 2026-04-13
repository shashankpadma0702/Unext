const express = require("express");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");

const Parser = require("rss-parser");
const parser = new Parser({
  customFields: {
    item: ['image']
  }
});

const app = express();
app.use(cors()); // Allows all origins by default (good for simple deployment)
app.use(express.json()); // Parse incoming JSON request bodies

// Internal cache to prevent spamming the OK Surf API
// <... omitted cache logic for brevity as it remains unchanged ...>

// Internal cache to prevent spamming the OK Surf API
let newsCache = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache

let isFetchingNews = false;

async function fetchLiveNews() {
  const now = Date.now();
  
  // Stale-While-Revalidate pattern: deliver stale data instantly while fetching fresh data in background
  if (newsCache) {
    if (now - lastFetchTime >= CACHE_TTL_MS && !isFetchingNews) {
      isFetchingNews = true;
      axios.get("https://ok.surf/api/v1/cors/news-feed")
        .then(response => {
          newsCache = response.data;
          lastFetchTime = Date.now();
        })
        .catch(error => console.error("Background fetch error:", error.message))
        .finally(() => { isFetchingNews = false; });
    }
    return newsCache; // Returns instantly
  }
  
  // First load only: blocking wait
  try {
    const response = await axios.get("https://ok.surf/api/v1/cors/news-feed");
    newsCache = response.data;
    lastFetchTime = now;
    return newsCache;
  } catch (error) {
    console.error("Error fetching live news:", error.message);
    return newsCache;
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

let sportsNewsCache = null;
let lastSportsFetchTime = 0;

// SPORTS
app.get("/api/news/sports", async (req, res) => {
  const now = Date.now();
  if (sportsNewsCache && now - lastSportsFetchTime < CACHE_TTL_MS) {
    return res.json(sportsNewsCache);
  }

  try {
    const feed = await parser.parseURL("https://www.bing.com/news/search?q=India+Sports+News+Cricket+Olympics+Football&format=rss");
    const items = feed.items.slice(0, 10);

    const articles = await Promise.all(items.map(async (item) => {
      let realUrl = item.link;
      const match = item.link.match(/&url=([^&]+)/);
      if (match && match[1]) {
        realUrl = decodeURIComponent(match[1]);
      }

      let fetchedImage = "";
      try {
        const pageRes = await axios.get(realUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          timeout: 3000
        });
        const $ = cheerio.load(pageRes.data);
        fetchedImage = $('meta[property="og:image"]').attr('content') || "";
      } catch (err) {
        // Silently fail if site blocks scraping
      }

      return {
        title: item.title,
        url: realUrl,
        urlToImage: fetchedImage, 
        source: { name: "Bing News" },
        description: item.contentSnippet || item.title
      };
    }));

    sportsNewsCache = articles;
    lastSportsFetchTime = now;
    res.json(articles);
  } catch (error) {
    console.error("Error fetching Sports news:", error.message);
    if (sportsNewsCache && sportsNewsCache.length > 0) {
      return res.json(sportsNewsCache);
    }
    const fallbackData = await fetchLiveNews();
    res.json(formatArticles(fallbackData?.Sports));
  }
});

let iciciNewsCache = null;
let lastIciciFetchTime = 0;

let indiaNewsCache = null;
let lastIndiaFetchTime = 0;

// ICICI NEWS (Custom via Bing RSS + Cheerio Image Scraper)
app.get("/api/news/icici", async (req, res) => {
  const now = Date.now();
  if (iciciNewsCache && now - lastIciciFetchTime < CACHE_TTL_MS) {
    return res.json(iciciNewsCache);
  }

  try {
    const feed = await parser.parseURL("https://www.bing.com/news/search?q=ICICI+Bank&format=rss");
    
    // Strict Filter: Ensure "ICICI" is actually in the title or snippet so we don't accidentally get Axis Bank news
    const strictItems = feed.items.filter(item => 
      item.title.toLowerCase().includes('icici') || 
      (item.contentSnippet && item.contentSnippet.toLowerCase().includes('icici'))
    );
    
    const items = strictItems.slice(0, 10);

    const articles = await Promise.all(items.map(async (item) => {
      let realUrl = item.link;
      const match = item.link.match(/&url=([^&]+)/);
      if (match && match[1]) {
        realUrl = decodeURIComponent(match[1]);
      }

      let fetchedImage = "";
      try {
        const pageRes = await axios.get(realUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          timeout: 3000
        });
        const $ = cheerio.load(pageRes.data);
        fetchedImage = $('meta[property="og:image"]').attr('content') || "";
      } catch (err) {
        // Silently fail if site blocks scraping
      }

      return {
        title: item.title,
        url: realUrl,
        urlToImage: fetchedImage, 
        source: { name: "Bing News" },
        description: item.contentSnippet || item.title
      };
    }));

    iciciNewsCache = articles;
    lastIciciFetchTime = now;
    res.json(articles);
  } catch (error) {
    console.error("Error fetching ICICI news:", error.message);
    if (iciciNewsCache && iciciNewsCache.length > 0) {
      return res.json(iciciNewsCache);
    }
    // Fallback to OK.surf Business news if Bing RSS fails or rate-limits us
    const fallbackData = await fetchLiveNews();
    res.json(formatArticles(fallbackData?.Business));
  }
});

// INDIA NEWS (Custom via Bing RSS + Cheerio Image Web Scraper)
app.get("/api/news/india", async (req, res) => {
  const now = Date.now();
  if (indiaNewsCache && now - lastIndiaFetchTime < CACHE_TTL_MS) {
    return res.json(indiaNewsCache);
  }

  try {
    const feed = await parser.parseURL("https://www.bing.com/news/search?q=India+Central+Government+News&format=rss");
    const items = feed.items.slice(0, 10);

    // Fetch images in parallel
    const articles = await Promise.all(items.map(async (item) => {
      let realUrl = item.link;
      // Extract original URL if routed through Bing News proxy
      const match = item.link.match(/&url=([^&]+)/);
      if (match && match[1]) {
        realUrl = decodeURIComponent(match[1]);
      }

      let fetchedImage = "";
      try {
        const pageRes = await axios.get(realUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          timeout: 3000
        });
        const $ = cheerio.load(pageRes.data);
        fetchedImage = $('meta[property="og:image"]').attr('content') || "";
      } catch (err) {
        // Silently fail if site blocks scraping, will use fallback on frontend
      }

      return {
        title: item.title,
        url: realUrl,
        urlToImage: fetchedImage, 
        source: { name: "Bing News" },
        description: item.contentSnippet || item.title
      };
    }));

    indiaNewsCache = articles;
    lastIndiaFetchTime = now;
    res.json(articles);
  } catch (error) {
    console.error("Error fetching India news:", error.message);
    if (indiaNewsCache && indiaNewsCache.length > 0) {
      return res.json(indiaNewsCache);
    }
    // Fallback to World news if Bing RSS fails
    const fallbackData = await fetchLiveNews();
    res.json(formatArticles(fallbackData?.World));
  }
});

// --- DYNAMIC SEARCH ENDPOINT ---
app.get("/api/news/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json([]);

  try {
    const feed = await parser.parseURL(`https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss`);
    const items = feed.items.slice(0, 10);

    const articles = await Promise.all(items.map(async (item) => {
      let realUrl = item.link;
      const match = item.link.match(/&url=([^&]+)/);
      if (match && match[1]) {
        realUrl = decodeURIComponent(match[1]);
      }

      let fetchedImage = "";
      try {
        const pageRes = await axios.get(realUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          timeout: 3000
        });
        const $ = cheerio.load(pageRes.data);
        fetchedImage = $('meta[property="og:image"]').attr('content') || "";
      } catch (err) {
        // Silently fail
      }

      return {
        title: item.title,
        url: realUrl,
        urlToImage: fetchedImage, 
        source: { name: "Bing News Search" },
        description: item.contentSnippet || item.title
      };
    }));

    res.json(articles);
  } catch (error) {
    console.error("Error fetching Search news:", error.message);
    res.json([]);
  }
});

// --- NEW ARTIFICIAL INTELLIGENCE ENDPOINT ---
// Mock AI Summarization Endpoint for Testing Purposes
// You can replace the interior of this function with a real API call to Gemini or OpenAI later before deploying!
app.post("/api/summarize", async (req, res) => {
  const { title, description } = req.body;
  
  if (!title && !description) {
    return res.status(400).json({ error: "Missing article data" });
  }

  // Fast simulated delay for snappy UI UX
  await new Promise(resolve => setTimeout(resolve, 100));

  const mockSummary = `This article, titled "${title}", highlights key developments in the financial sector. The main takeaway is that recent market shifts could impact long-term corporate strategies and investor portfolios.`;

  return res.json({ summary: mockSummary });
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
  
  // SELF-PING MECHANISM: Prevent Render from sleeping
  // Render free tier sleeps after 15 mins of inactivity. We ping ourselves every 14 mins.
  const RENDER_URL = "https://unext-1.onrender.com";
  setInterval(() => {
    axios.get(`${RENDER_URL}/api/health`)
      .then(() => console.log("Self-ping successful. Keeping server awake 🚀"))
      .catch(err => console.error("Self-ping failed:", err.message));
  }, 14 * 60 * 1000); // 14 minutes
});