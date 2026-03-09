const Parser = require("rss-parser");
const parser = new Parser({
  customFields: {
    item: ['image']
  }
});

async function testBingRss() {
  try {
    const feed = await parser.parseURL("https://www.bing.com/news/search?q=banking+finance+RBI&format=rss");
    console.log(feed.items[0]);
  } catch (err) {
    console.error("Error", err.message);
  }
}
testBingRss();
