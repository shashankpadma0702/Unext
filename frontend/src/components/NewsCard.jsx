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
      // Automatically close it after 15 seconds of reading time
      timer = setTimeout(() => {
        setSummary(null);
      }, 15000);
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
                background: isSummarizing ? '#f3f4f6' : '#f3e8ff',
                border: '1px solid #d8b4fe',
                padding: '8px 14px',
                borderRadius: '20px',
                cursor: (isSummarizing || summary) ? 'not-allowed' : 'pointer',
                fontSize: '12px',
                fontWeight: '700',
                color: isSummarizing ? '#9ca3af' : '#7e22ce',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isSummarizing ? 'none' : '0 2px 8px rgba(243, 232, 255, 0.8)',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit',
                letterSpacing: '0.4px'
              }}
            >
              {isSummarizing ? "⏳ Generating..." : "✨ AI Summary"}
            </button>

            <a 
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this news on ICICI UNext! ${article.title} - ${article.url}`)}`} 
              target="_blank" 
              rel="noreferrer" 
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#25D366', 
                color: 'white',
                width: '40px',
                height: '40px',
                minWidth: '40px',
                minHeight: '40px',
                flexShrink: 0,
                borderRadius: '50%',
                textDecoration: 'none',
                boxShadow: '0 4px 10px rgba(37, 211, 102, 0.35)',
                transition: 'all 0.3s ease'
              }}
              title="Share on WhatsApp"
            >
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
              </svg>
            </a>

            <a href={article.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', marginLeft: '5px' }}>
              Read Full Article
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCard