import React, { useEffect, useRef, useState, memo } from 'react';

// Reusable animated speedometer for a given stock symbol
const Speedometer = memo(({ symbol, title }) => {
  const container = useRef();

  useEffect(() => {
    // We clean up any existing scripts if this gets re-run, though React key should handle it
    if (container.current) {
      container.current.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
        "interval": "1m",
        "width": "100%",
        "isTransparent": true,
        "height": "340",
        "symbol": "${symbol}",
        "showIntervalTabs": true,
        "displayMode": "single",
        "locale": "in",
        "colorTheme": "light"
      }`;
    
    if (container.current) {
      container.current.appendChild(script);
    }
  }, [symbol]);

  return (
    <div style={{ flex: 1, minWidth: '300px', background: 'white', border: '1px solid #eee', borderRadius: '12px', padding: '15px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}>
      <h3 style={{ textAlign: 'center', marginBottom: '10px', color: '#B02A30' }}>{title} AI Signal</h3>
      <div className="tradingview-widget-container" ref={container} style={{ height: '340px', width: '100%' }}>
        <div className="tradingview-widget-container__widget"></div>
      </div>
    </div>
  );
});

const topStocks = [
  { symbol: "BSE:SENSEX", title: "Sensex Market" },
  { symbol: "BSE:ICICIBANK", title: "ICICI Bank" },
  { symbol: "BSE:RELIANCE", title: "Reliance Ind." },
  { symbol: "BSE:HDFCBANK", title: "HDFC Bank" },
  { symbol: "BSE:TCS", title: "TCS" },
  { symbol: "BSE:INFY", title: "Infosys" },
  { symbol: "BSE:SBIN", title: "State Bank of India" },
  { symbol: "BSE:BHARTIARTL", title: "Bharti Airtel" },
  { symbol: "BSE:ITC", title: "ITC Limited" }
];

function StockSuggestions() {
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    // Cycle every 2 minutes (120,000 milliseconds)
    const intervalId = setInterval(() => {
      setStartIndex((prevIndex) => {
        const nextIndex = prevIndex + 3;
        // Loop back to the beginning if we reached the end
        return nextIndex >= topStocks.length ? 0 : nextIndex;
      });
    }, 120000);

    return () => clearInterval(intervalId);
  }, []);

  const visibleStocks = topStocks.slice(startIndex, startIndex + 3);

  return (
    <div style={{ padding: '0 20px', marginTop: '30px', marginBottom: '30px' }}>
      <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '20px', marginLeft: '5px' }}>
        ⚡ Live Buy/Sell Signals <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#666', marginLeft: '10px' }}>(Cycling every 2 mins)</span>
      </h2>
      <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {visibleStocks.map(stock => (
          <Speedometer key={stock.symbol} symbol={stock.symbol} title={stock.title} />
        ))}
      </div>
    </div>
  );
}

export default memo(StockSuggestions);
