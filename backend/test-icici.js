const Parser = require("rss-parser");

const parser = new Parser({ customFields: { item: ['image', 'enclosure', 'media:content'] } });

async function testMoneyControl() {
  try {
    const feed = await parser.parseURL("https://www.moneycontrol.com/rss/custom_rss.php?keyword=ICICI+Bank");
    const item = feed.items[0];
    console.log("MoneyControl RSS Article:", item?.title);
    console.log("Keys:", Object.keys(item || {}));
    console.log("Image/Enclosure:", item?.enclosure || item?.image || item?.['media:content']);
  } catch (error) {
    console.error("Error:", error.message);
  }
}
testMoneyControl();
