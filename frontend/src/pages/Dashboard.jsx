import { useEffect, useState } from "react";
import { fetchNews } from "../services/api";
import NewsCard, { fallbackImages } from "../components/NewsCard";

const Dashboard = ({ category }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNews = async () => {
    setLoading(true);
    const data = await fetchNews(category);

    setNews(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
  }, [category]);

  if (loading) {
    return (
      <div className="loader-container">
        <div className="spinner"></div>
      </div>
    );
  }

  const hero = news[0];
  const others = news.slice(1);
  const heroImage = hero?.image || hero?.urlToImage || fallbackImages[0];

  return (
    <div className="dashboard">
      {hero && (
        <div className="hero">
          <img src={heroImage} alt="hero" />

          <div className="hero-text">
            <h1>{hero.title}</h1>

            <p>{hero.description}</p>

            <a href={hero.url} target="_blank">
              Read Full Story →
            </a>
          </div>
        </div>
      )}

      <div className="grid">
        {others.map((article, index) => (
          <NewsCard key={index} article={article} index={index} />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

// import { useEffect, useState } from "react";
// import { fetchNews } from "../services/api";
// import NewsCard from "../components/NewsCard";

// const Dashboard = ({ category }) => {
//   const [news, setNews] = useState([]);

//   const loadNews = async () => {
//     const data = await fetchNews(category || "home");

//     setNews(data || []);
//   };

//   useEffect(() => {
//     loadNews();
//   }, [category]);

//   return (
//     <div className="dashboard">
//       {news.length > 0 && (
//         <div className="hero">
//           <img src={news[0].image} alt="hero" />

//           <div className="hero-text">
//             <h1>{news[0].title}</h1>

//             <p>{news[0].description}</p>

//             <a href={news[0].url} target="_blank">
//               Read Full Story →
//             </a>
//           </div>
//         </div>
//       )}

//       <h2 className="section-title">Latest News</h2>

//       <div className="grid">
//         {news.slice(1).map((article, index) => (
//           <NewsCard key={index} article={article} index={index} />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
