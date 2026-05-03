import { useEffect, useState } from "react";
import { fetchNews } from "../services/api";
import NewsCard, { fallbackImages } from "../components/NewsCard";

const Dashboard = ({ category }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNews = async () => {
    try {
      setLoading(true);
      const data = await fetchNews(category);

      if (data && data.length > 0) {
        // Fisher-Yates shuffle algorithm to randomize news order so the newest looking content changes
        for (let i = data.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [data[i], data[j]] = [data[j], data[i]];
        }
        setNews(data);
      } else {
        setNews([]);
      }
    } catch (error) {
      console.error("Error loading news in Dashboard:", error);
      setNews([]);
    } finally {
      setLoading(false);
    }
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

  if (!news || news.length === 0) {
    return (
      <div className="dashboard" style={{ textAlign: "center", padding: "50px" }}>
        <h2>No news available.</h2>
        <p>Please check if your backend server is running and try again.</p>
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
          <img 
            src={heroImage} 
            alt="hero" 
            onError={(e) => { e.target.onerror = null; e.target.src = fallbackImages[0]; }} 
          />

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
