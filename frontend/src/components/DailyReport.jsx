import { useEffect, useState } from "react";
import { fetchNews } from "../services/api";

const fallbackImage = "https://images.unsplash.com/photo-1611974789855-9c2a0a2236a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

const DailyReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generateReport = async () => {
      try {
        setLoading(true);
        // Fetch up to 5 parallel requests
        const [india, bfsi, icici, markets, world] = await Promise.all([
          fetchNews('india'),
          fetchNews('bfsi'),
          fetchNews('icici'),
          fetchNews('markets'),
          fetchNews('world')
        ]);

        const rawReport = {
          "India": india.slice(0, 2),
          "BFSI": bfsi.slice(0, 2),
          "ICICI Bank": icici.slice(0, 2),
          "Global Markets": markets.slice(0, 2),
          "World News": world.slice(0, 2)
        };

        // Deep Scrape: Enhance all articles to give detailed "Why" context
        const enhancedReport = {};
        for (const category in rawReport) {
          enhancedReport[category] = await Promise.all(
            rawReport[category].map(async (article) => {
              try {
                // If it already has a very long description, skip scraping
                if (article.description && article.description.length > 200) return article;
                const detailedSummary = await import("../services/api").then(m => m.fetchSummary(article));
                return { ...article, description: detailedSummary || article.description };
              } catch (e) {
                return article;
              }
            })
          );
        }

        // Creating an Investment Suggestion based on the top market news
        const topMarketNews = enhancedReport["Global Markets"][0]?.title || "Diversify your portfolio across stable sectors.";
        const isBearish = topMarketNews.toLowerCase().match(/(bankrupt|fall|crash|drop|loss|decline|crisis)/);

        let investmentSuggestion = "";
        if (isBearish) {
          investmentSuggestion = `🚨 WARNING: Market headlines indicate "${topMarketNews}". Reason: Sector-wide instability and shifting fiscal regulations. Strategic Suggestion: Liquidate risky volatile assets and hold capital in low-risk bonds until the current crisis stabilizes. Defensive positioning in BFSI is recommended.`;
        } else {
          investmentSuggestion = `📈 GROWTH INSIGHT: Based on current trends indicating "${topMarketNews}", our strategic suggestion is to maintain a growth-focused approach. Look for value opportunities in the banking sector and leverage upcoming quarterly reports for maximum yield.`;
        }

        setReportData({
          ...enhancedReport,
          suggestion: investmentSuggestion
        });
      } catch (error) {
        console.error("Error generating report", error);
      } finally {
        setLoading(false);
      }
    };

    generateReport();
  }, []);

  if (loading) {
    return (
      <div className="loader-container" style={{ height: '80vh' }}>
        <h2 style={{ color: '#B02A30', marginTop: '20px' }}>Analyzing global data for your briefing...</h2>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="daily-report">
      <button className="print-btn" onClick={() => window.print()}>
        🖨️ Export as PDF
      </button>

      <div className="report-header">
        <h1>ICICI UNext Financial Daily Briefing</h1>
        <p>Prepared on: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="investment-suggestion">
        <h3>💡 Today's Executive Investment Strategy</h3>
        <p>{reportData?.suggestion || "Unable to fetch report data. Please check your server connection."}</p>
      </div>

      <br />

      {reportData && Object.entries(reportData).map(([category, articles]) => {
        if (category === 'suggestion') return null;

        return (
          <div key={category} className="report-section">
            <h2>{category} Top Stories</h2>
            {articles.map((article, idx) => (
              <div key={idx} className="report-article">
                <img
                  src={article.urlToImage || fallbackImage}
                  alt={article.title}
                  onError={(e) => { e.target.onerror = null; e.target.src = fallbackImage; }}
                />
                <div className="report-article-content">
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default DailyReport;
