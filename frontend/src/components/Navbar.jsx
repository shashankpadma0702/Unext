import { useState } from "react";

const Navbar = ({ setCategory, category, setShowReport }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);

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

      <div className="menu">
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
