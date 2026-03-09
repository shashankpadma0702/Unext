const express = require("express")
const router = express.Router()
const { getNews } = require("../controllers/newsController")

router.get("/:category", getNews)

module.exports = router