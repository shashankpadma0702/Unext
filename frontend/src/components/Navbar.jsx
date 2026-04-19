import { useState, useEffect, useRef } from "react";

const Navbar = ({ setCategory, category, setShowReport }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const menu = menuRef.current;
    let scrollInterval;

    // We wait a tiny bit for the browser to calculate scrollWidth properly
    setTimeout(() => {
      if (menu && menu.scrollWidth > menu.clientWidth) {
        // Start the scroll at the absolute right edge so items can move visually Left-to-Right
        if (menu.scrollLeft === 0) {
          menu.scrollLeft = menu.scrollWidth;
        }
      }
    }, 100);

    const startScrolling = () => {
      if (menu && menu.scrollWidth > menu.clientWidth) {
        scrollInterval = setInterval(() => {
          menu.scrollLeft -= 1; // Decrease scrollLeft, making items visually move Right!
          
          // If we hit the left edge (0), instantly jump back to the right side
          if (menu.scrollLeft <= 0) {
            menu.scrollLeft = menu.scrollWidth;
          }
        }, 30); // Smooth steady speed
      }
    };

    const stopScrolling = () => {
      clearInterval(scrollInterval);
    };

    startScrolling();

    // Pause the animation if the user touches or hovers so they can click!
    if (menu) {
      menu.addEventListener('mouseenter', stopScrolling);
      menu.addEventListener('mouseleave', startScrolling);
      menu.addEventListener('touchstart', stopScrolling, { passive: true });
      menu.addEventListener('touchend', startScrolling, { passive: true });
    }

    return () => {
      clearInterval(scrollInterval);
      if (menu) {
        menu.removeEventListener('mouseenter', stopScrolling);
        menu.removeEventListener('mouseleave', startScrolling);
        menu.removeEventListener('touchstart', stopScrolling);
        menu.removeEventListener('touchend', startScrolling);
      }
    };
  }, []);


  const toggleDark = () => {
    setIsDark(!isDark);
    document.body.classList.toggle('dark');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCategory(`search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(""); // Clear the input field
    }
  };
  const navItems = [
    { id: "icici", label: "ICICI Daily" },
    { id: "bfsi", label: "BFSI" },
    { id: "markets", label: "Markets" },
    { id: "commodities", label: "Commodities" },
    { id: "world", label: "World" },
    { id: "india", label: "India" },
    { id: "current", label: "Current Affairs" },
    { id: "sports", label: "Sports" }
  ];

  return (
    <div className="navbar">
      <div className="logo">
        ICICI <span>UNext</span> News
      </div>

      <div className="menu" ref={menuRef}>
        {navItems.map((item) => (
          <button
            key={item.id}
            className={category === item.id ? "active" : ""}
            onClick={() => {
              setCategory(item.id);
              setShowReport(false);
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="navbar-actions">
        <form onSubmit={handleSearch} className="search-form">
          <input 
            type="text" 
            placeholder="Search topics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="action-btn search-btn">
            🔍
          </button>
        </form>
        
        <button
          onClick={() => setShowReport(true)}
          className="action-btn report-btn"
        >
          📄 Daily Report
        </button>

        <button 
          onClick={toggleDark}
          className="action-btn theme-btn"
          title="Toggle Dark Mode"
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
