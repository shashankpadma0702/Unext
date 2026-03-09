const axios = require('axios');

async function checkDates() {
  console.log("Checking current dates from Saurav.tech API...\n");
  try {
    const res = await axios.get('https://saurav.tech/NewsAPI/top-headlines/category/business/in.json');
    const articles = res.data.articles.slice(0, 5);
    
    articles.forEach((article, index) => {
      console.log(`${index + 1}. ${article.title}`);
      console.log(`   Published: ${new Date(article.publishedAt).toLocaleString()}`);
      console.log('---');
    });
  } catch (err) {
    console.error(err);
  }
}

checkDates();
