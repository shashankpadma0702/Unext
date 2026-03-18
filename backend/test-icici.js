const Parser = require("rss-parser");
const parser = new Parser({
  customFields: {
    item: ['image']
  }
});

async function testICICI() {
  try {
    const feed = await parser.parseURL("https://www.bing.com/news/search?q=ICICI+Bank&format=rss");
    const articles = feed.items.slice(0, 10).map(item => ({
      title: item.title,
      url: item.link
    }));
    console.log("Success! Found", articles.length, "articles.");
    console.log(articles[0]);
  } catch (error) {
    console.error("Error fetching ICICI news:", error.message);
  }
}
testICICI();
