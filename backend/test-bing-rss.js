const Parser = require("rss-parser");
const parser = new Parser();

async function test() {
  const feed = await parser.parseURL("https://www.bing.com/news/search?q=India+Central+Government+News&format=rss");
  console.log(JSON.stringify(feed.items[0], null, 2));
}

test();
