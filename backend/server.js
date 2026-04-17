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

// A blacklist of deeply paywalled, inaccessible news domains
const PREMIUM_DOMAINS = [
  "bloomberg.com", 
  "wsj.com", 
  "ft.com", 
  "business-standard.com", 
  "seekingalpha.com",
  "barrons.com",
  "fortune.com",
  "thehindubusinessline.com",
  "livemint.com/premium",
  "economictimes.indiatimes.com/prime",
  "moneycontrol.com/pro"
];

function isFreeArticle(url) {
  if (!url) return true;
  const lowerUrl = url.toLowerCase();
  return !PREMIUM_DOMAINS.some(domain => lowerUrl.includes(domain));
}

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
        .catch(error => {
          console.error("Background fetch error:", error.message);
          lastFetchTime = Date.now(); // Back off on error instead of spamming
        })
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
  
  // Filter out premium/paywalled sites so users can easily read the news
  const freeArticles = articlesArray.filter(item => isFreeArticle(item.link));

  // Shuffle array to ensure fresh news layout on every refresh
  const shuffled = [...freeArticles].sort(() => 0.5 - Math.random());
  
  return shuffled.slice(0, 10).map(item => ({
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
    const shuffledCache = [...sportsNewsCache].sort(() => 0.5 - Math.random());
    return res.json(shuffledCache);
  }

  try {
    const feed = await parser.parseURL("https://www.bing.com/news/search?q=India+Sports+News+Cricket+Olympics+Football&format=rss");
    
    // Filter out premium articles
    const freeItems = feed.items.filter(item => {
      let realUrl = item.link;
      const match = item.link.match(/&url=([^&]+)/);
      if (match && match[1]) realUrl = decodeURIComponent(match[1]);
      return isFreeArticle(realUrl);
    });
    const items = freeItems.slice(0, 10);

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
    const shuffledArticles = [...articles].sort(() => 0.5 - Math.random());
    res.json(shuffledArticles);
  } catch (error) {
    console.error("Error fetching Sports news:", error.message);
    lastSportsFetchTime = now; // Add backoff
    if (sportsNewsCache && sportsNewsCache.length > 0) {
      const shuffledCache = [...sportsNewsCache].sort(() => 0.5 - Math.random());
      return res.json(shuffledCache);
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
    const shuffledCache = [...iciciNewsCache].sort(() => 0.5 - Math.random());
    return res.json(shuffledCache);
  }

  try {
    const feed = await parser.parseURL("https://www.bing.com/news/search?q=ICICI+Bank&format=rss");
    
    // Strict Filter: Ensure "ICICI" is actually in the title or snippet so we don't accidentally get Axis Bank news
    const strictItems = feed.items.filter(item => {
      let isMatch = item.title.toLowerCase().includes('icici') || (item.contentSnippet && item.contentSnippet.toLowerCase().includes('icici'));
      if(!isMatch) return false;
      let realUrl = item.link;
      const match = item.link.match(/&url=([^&]+)/);
      if (match && match[1]) realUrl = decodeURIComponent(match[1]);
      return isFreeArticle(realUrl);
    });
    
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
    const shuffledArticles = [...articles].sort(() => 0.5 - Math.random());
    res.json(shuffledArticles);
  } catch (error) {
    console.error("Error fetching ICICI news:", error.message);
    lastIciciFetchTime = now; // Add backoff
    if (iciciNewsCache && iciciNewsCache.length > 0) {
      const shuffledCache = [...iciciNewsCache].sort(() => 0.5 - Math.random());
      return res.json(shuffledCache);
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
    const shuffledCache = [...indiaNewsCache].sort(() => 0.5 - Math.random());
    return res.json(shuffledCache);
  }

  try {
    const feed = await parser.parseURL("https://www.bing.com/news/search?q=India+Central+Government+News&format=rss");
    
    const freeItems = feed.items.filter(item => {
      let realUrl = item.link;
      const match = item.link.match(/&url=([^&]+)/);
      if (match && match[1]) realUrl = decodeURIComponent(match[1]);
      return isFreeArticle(realUrl);
    });
    const items = freeItems.slice(0, 10);

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
    const shuffledArticles = [...articles].sort(() => 0.5 - Math.random());
    res.json(shuffledArticles);
  } catch (error) {
    console.error("Error fetching India news:", error.message);
    lastIndiaFetchTime = now; // Add backoff
    if (indiaNewsCache && indiaNewsCache.length > 0) {
      const shuffledCache = [...indiaNewsCache].sort(() => 0.5 - Math.random());
      return res.json(shuffledCache);
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
    
    const freeItems = feed.items.filter(item => {
      let realUrl = item.link;
      const match = item.link.match(/&url=([^&]+)/);
      if (match && match[1]) realUrl = decodeURIComponent(match[1]);
      return isFreeArticle(realUrl);
    });
    const items = freeItems.slice(0, 10);

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

// --- REAL DYNAMIC SCRAPING SUMMARY ENDPOINT ---
// Fetches the actual article URL to extract deep paragraphs for rich context
app.post("/api/summarize", async (req, res) => {
  const { title, description, url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: "Missing article url", summary: description });
  }

  try {
    const pageRes = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 4000
    });
    
    const $ = cheerio.load(pageRes.data);
    
    // Find meaningful paragraphs to explain the 'why'
    let paragraphs = [];
    $('p').each((i, el) => {
      let text = $(el).text().trim();
      // Skip very short generic UI texts
      if (text.length > 50 && !text.includes('cookie') && !text.includes('JavaScript')) {
        paragraphs.push(text);
      }
    });

    if (paragraphs.length > 0) {
      let richContext = paragraphs.slice(0, 2).join(" ");
      if (richContext.length > 500) richContext = richContext.substring(0, 500) + "...";
      return res.json({ summary: richContext });
    }
  } catch (err) {
    console.error("Unable to scrape article for summary:", err.message);
  }

  // Fallback context specifically addressing financial rationale if scraping fails
  const fallbackSummary = `Financial rationale: The core reason behind this event stems from internal sector restructuring, policy updates, or shifting market liabilities. Unfortunately, the full article is paywalled, but analysts suggest this move will heavily dictate upcoming quarterly trajectories for the involved entities.`;

  return res.json({ summary: description || fallbackSummary });
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