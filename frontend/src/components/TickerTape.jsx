import React, { useEffect, useRef, memo } from 'react';

function TickerTape() {
  const container = useRef();

  useEffect(() => {
    // Avoid appending multiple times in React strict mode
    if (container.current && container.current.querySelector("script")) return; 

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
      {
      "symbols": [
        {
          "proName": "BSE:HDFCBANK",
          "description": "HDFC BANK"
        },
        {
          "proName": "BSE:SENSEX",
          "description": "BSE SENSEX"
        },
        {
          "proName": "BSE:ICICIBANK",
          "description": "ICICI BANK"
        },
        {
          "proName": "BSE:RELIANCE",
          "description": "RELIANCE"
        },
        {
          "proName": "BSE:SBIN",
          "description": "SBI"
        },
        {
          "proName": "TVC:GOLD",
          "description": "GOLD"
        },
        {
          "proName": "TVC:SILVER",
          "description": "SILVER"
        }
      ],
      "showSymbolLogo": true,
      "colorTheme": "light",
      "isTransparent": false,
      "displayMode": "adaptive",
      "locale": "in"
    }`;
    
    if (container.current) {
        container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ width: '100%', borderBottom: '2px solid #e0e0e0', zIndex: 10 }}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
}

export default memo(TickerTape);
