const Navbar = ({ setCategory, category }) => {
  const navItems = [
    { id: "icici", label: "ICICI Daily" },
    { id: "bfsi", label: "BFSI" },
    { id: "markets", label: "Markets" },
    { id: "commodities", label: "Commodities" },
    { id: "world", label: "World" },
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
    </div>
  );
};

export default Navbar;
