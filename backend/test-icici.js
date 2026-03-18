const Parser = require("rss-parser");
const axios = require("axios");
const cheerio = require("cheerio");

const parser = new Parser();

async function testAllScraping() {
  try {
    const feed = await parser.parseURL("https://www.bing.com/news/search?q=ICICI+Bank&format=rss");
    const items = feed.items.slice(0, 10);
    
    const results = await Promise.all(items.map(async (item) => {
      const match = item.link.match(/&url=([^&]+)/);
      if (!match) return { title: item.title, image: null };
      
      const realUrl = decodeURIComponent(match[1]);
      try {
        const res = await axios.get(realUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/114.0.0.0 Safari/537.36' },
          timeout: 4000
        });
        const $ = cheerio.load(res.data);
        const ogImage = $('meta[property="og:image"]').attr('content');
        return { title: item.title.substring(0,30), image: ogImage || "NOT FOUND" };
      } catch (err) {
        return { title: item.title.substring(0,30), image: 'FAILED ' + err.message };
      }
    }));
    
    console.log(results);
    const success = results.filter(r => r.image && r.image.startsWith('http')).length;
    console.log(`Success rate: ${success}/10`);
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}
testAllScraping();
