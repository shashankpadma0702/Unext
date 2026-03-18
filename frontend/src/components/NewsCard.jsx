export const fallbackImages = [
  "https://picsum.photos/seed/news1/600/400",
  "https://picsum.photos/seed/news2/600/400",
  "https://picsum.photos/seed/news3/600/400",
  "https://picsum.photos/seed/news4/600/400",
  "https://picsum.photos/seed/news5/600/400",
  "https://picsum.photos/seed/news6/600/400"
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