import React from "react";

export default function App() {
  return (
    <div className="container">
      <aside className="sidebar">
        <h1 className="logo">
          Wiki <span role="img" aria-label="book">📖</span>
        </h1>
        <input type="text" placeholder=" Search" className="search" />
        <nav>
          <ul>
            <li>Home</li>
            <li>Create new</li>
            <li>Bookmarks</li>
          </ul>
        </nav>
      </aside>
      <main className="content">
        <h2>Available entries</h2>
        <ul className="entries">
          <li><a href="#">The World's Largest Snowflake</a></li>
          <li><a href="#">Octopuses Have Three Hearts</a></li>
          <li><a href="#">Bananas Are Berries</a></li>
          <li><a href="#">Sharks Are Older Than Trees</a></li>
        </ul>
      </main>
    </div>
  );
}
