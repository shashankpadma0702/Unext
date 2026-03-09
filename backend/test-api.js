const axios = require('axios');

async function testApi() {
  try {
    const res = await axios.get('https://saurav.tech/NewsAPI/top-headlines/category/business/in.json');
    console.log(JSON.stringify(res.data.articles[0], null, 2));
  } catch (err) {
    console.error(err);
  }
}

testApi();
