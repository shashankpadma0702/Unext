const Parser = require("rss-parser");
const parser = new Parser();

async function testRss() {
  const feed = await parser.parseURL("https://news.google.com/rss/search?q=banking+finance+RBI&hl=en-IN&gl=IN&ceid=IN:en");
  console.log(feed.items[0]);
}
testRss();
