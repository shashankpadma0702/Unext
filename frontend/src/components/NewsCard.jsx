import { useState, useEffect } from "react";
import { fetchSummary } from "../services/api";

export const fallbackImages = [
  "/finance-images/finance1.jpg",
  "/finance-images/finance2.jpg",
  "/finance-images/finance3.jpg",
  "/finance-images/finance4.jpg",
  "/finance-images/finance5.jpg",
  "/finance-images/finance6.jpg"
]

const NewsCard = ({ article, index }) => {
  const [summary, setSummary] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    let timer;
    if (summary) {
      // Automatically close it after 10 seconds of reading time
      timer = setTimeout(() => {
        setSummary(null);
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [summary]);

  const image =
    article.image ||
    article.urlToImage ||
    fallbackImages[index % fallbackImages.length];

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (summary) return; // already summarized

    setIsSummarizing(true);
    try {
      const result = await fetchSummary(article);
      setSummary(result);
    } catch (err) {
      console.error(err);
      setSummary("Failed to generate summary. Please ensure the backend is reachable.");
    }
    setIsSummarizing(false);
  };

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
        
        {summary && (
          <div style={{ 
            marginTop: '15px', 
            padding: '16px', 
            background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', 
            border: '1px solid #e0e0e0',
            borderLeft: '4px solid #0052cc',
            borderRadius: '8px', 
            boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '18px' }}>✨</span>
              <strong style={{ color: '#0052cc', fontSize: '14px', fontWeight: '700', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                AI Summary
              </strong>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#444', fontStyle: 'italic', margin: 0 }}>
              {summary}
            </p>
          </div>
        )}

        <div className="card-footer" style={{ marginTop: '20px' }}>
          <span>{article.source?.name || "News"}</span>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleSummarize} 
              disabled={isSummarizing || summary !== null}
              style={{
                background: isSummarizing ? '#d1d5db' : 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '16px',
                cursor: (isSummarizing || summary) ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: '700',
                color: isSummarizing ? '#4b5563' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isSummarizing ? 'none' : '0 4px 10px rgba(168, 85, 247, 0.35)',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit',
                letterSpacing: '0.4px'
              }}
            >
              {isSummarizing ? "⏳ Generating..." : "✨ AI Summary"}
            </button>

            <a href={article.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
              Read Full Article
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard