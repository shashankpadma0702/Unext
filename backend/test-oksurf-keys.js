const axios = require('axios');

async function testOkSurf() {
  try {
    const res = await axios.get('https://ok.surf/api/v1/cors/news-feed');
    const businessNews = res.data.Business.slice(0, 1);
    console.log(Object.keys(businessNews[0]));
    console.log(businessNews[0].og);
  } catch (err) {
    console.error(err);
  }
}
testOkSurf();
