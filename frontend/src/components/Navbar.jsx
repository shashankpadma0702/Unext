const Navbar = ({ setCategory }) => {
  return (
    <div className="navbar">
      <div className="logo">
        ICICI <span>UNext</span> News
      </div>

      <div className="menu">
        <button onClick={() => setCategory("bfsi")}>BFSI</button>

        <button onClick={() => setCategory("markets")}>Markets</button>

        <button onClick={() => setCategory("commodities")}>Commodities</button>

        <button onClick={() => setCategory("world")}>World</button>

        <button onClick={() => setCategory("current")}>Current Affairs</button>

        <button onClick={() => setCategory("sports")}>Sports</button>
      </div>
    </div>
  );
};

export default Navbar;
