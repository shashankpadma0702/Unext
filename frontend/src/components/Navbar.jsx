import { useState } from "react";

const Navbar = ({ setCategory, category }) => {
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
            onClick={() => setCategory(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Search topics..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              padding: '8px 12px', 
              borderRadius: '20px', 
              border: '1px solid #ccc',
              outline: 'none',
              fontSize: '14px',
              width: '200px'
            }}
          />
          <button 
            type="submit" 
            style={{ 
              padding: '8px 18px', 
              borderRadius: '20px', 
              background: 'rgba(255, 255, 255, 0.2)', 
              color: 'white', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: '600',
              backdropFilter: 'blur(4px)',
              transition: 'background 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.35)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          >
            🔍
          </button>
        </form>
        
        <button 
          onClick={toggleDark}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '18px',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: '0.3s'
          }}
          title="Toggle Dark Mode"
        >
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
