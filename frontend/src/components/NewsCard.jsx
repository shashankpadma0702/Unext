const fallbackImages = [
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf",
  "https://images.unsplash.com/photo-1559526324-593bc073d938",
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
  "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e"
]

const NewsCard = ({ article, index }) => {

  const image =
    article.image ||
    article.urlToImage ||
    fallbackImages[index % fallbackImages.length]

  return (

    <div className="card">

      <img
        src={image}
        alt="news"
        style={{
          width: "100%",
          height: "200px",
          objectFit: "cover"
        }}
      />

      <div className="card-content">

        <h3>{article.title}</h3>

        <p>{article.description}</p>

        <div className="card-footer">

          <span>{article.source?.name || "News"}</span>

          <a href={article.url} target="_blank">
            Read Full Article
          </a>

        </div>

      </div>

    </div>

  )

}

export default NewsCard