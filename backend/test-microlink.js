const axios = require("axios");

async function testMicrolink() {
  try {
    const url = "https://news.google.com/rss/articles/CBMizgFBVV95cUxPcVlYSEljQlpTQUhHWWx5Q24tLTNXZlUzVWR1YmRtTUtjR1hBcFg1RkVnQmdXUWJ2Q2dIQThxb001UURpMWJ1bkl4cThidk4wcFpXQkp1RkhkNG5rOFRoelI1Z3NDaGlBVE1JOTR1UUhVNWcwQnpSRlFRNVBrdFlOTjd6bk84cmxPdmhCR3Noa3N5cFVZcXZmVE05WEp0aVFiT0lZOWZBSU9YUWpsRk9yWlpmdnlORzNTUm9sT09SSTQ0Sm91UldwYWVnaTllQmdv?oc=5";
    const res = await axios.get(`https://api.microlink.io?url=${encodeURIComponent(url)}`);
    console.log(res.data.data.image);
  } catch (err) {
    console.error("Microlink Error", err.message);
  }
}
testMicrolink();
