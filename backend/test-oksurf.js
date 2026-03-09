const axios = require('axios');

async function testOkSurf() {
  try {
    const res = await axios.get('https://ok.surf/api/v1/cors/news-feed');
    const businessNews = res.data.Business.slice(0, 2);
    businessNews.forEach(article => {
      console.log(`Title: ${article.title}`);
      console.log(`Image: ${article.og_image}`);
      console.log(`Link: ${article.link}`);
      console.log(`Source: ${article.source}`);
      console.log('---');
    });
  } catch (err) {
    console.error(err);
  }
}
testOkSurf();
