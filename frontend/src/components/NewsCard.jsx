export const fallbackImages = [
  "/finance-images/finance1.jpg",
  "/finance-images/finance2.jpg",
  "/finance-images/finance3.jpg",
  "/finance-images/finance4.jpg",
  "/finance-images/finance5.jpg",
  "/finance-images/finance6.jpg"
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