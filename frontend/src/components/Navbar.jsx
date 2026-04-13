import { useState } from "react";

const Navbar = ({ setCategory, category }) => {
  const [searchQuery, setSearchQuery] = useState("");

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
            padding: '8px 15px', 
            borderRadius: '20px', 
            background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          🔍
        </button>
      </form>
    </div>
  );
};

export default Navbar;
