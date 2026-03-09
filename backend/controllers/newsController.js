const axios = require("axios")

const API_KEY = "YOUR_NEWS_API_KEY"

exports.getNews = async (req,res)=>{

const category = req.params.category

let query=""

switch(category){

case "bfsi":
query="banking OR RBI OR finance OR fintech"
break

case "markets":
query="stock market OR sensex OR nifty"
break

case "commodities":
query="gold OR oil OR commodities trading"
break

case "world":
query="world economy OR global finance"
break

case "war":
query="war OR geopolitics"
break

case "sports":
query="sports"
break

case "current":
query="current affairs india"
break

default:
query="finance"

}

try{

const response = await axios.get(
`https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&apiKey=${API_KEY}`
)

res.json(response.data.articles)

}catch(error){

res.status(500).json({error:"News fetch failed"})

}

}