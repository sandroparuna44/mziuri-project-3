import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams, useSearchParams, Link } from "react-router-dom";

// როუთებს ანაწილებს ეს ფუნქცია
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<Navigate to="/entries" />} /> 
        <Route path="*" element={<Layout />}>
          <Route path="entries" element={<Entries />} /> 
          <Route path="entries/:topicId" element={<EntryDetail />} />
          <Route path="entries/search" element={<SearchResults />} />
          <Route path="bookmarks" element={<Bookmarks />} />
          <Route path="entries/new" element={<NewEntry />} /> 
          <Route path="*" element={<NotFound />} /> 
        </Route>
      </Routes>
    </Router>
  );
}

// navigation menuს ფუნქციები
function Layout() {
  const navigate = useNavigate();
  const handleSearch = (e) => {
    e.preventDefault(); // ფორმა რომ თავიდან არ გააგზავნოს
    const query = e.target.search.value.trim(); 
    if (query) navigate(`/entries/search?q=${query}`);
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <h1 className="logo">Wiki 📖</h1>
        <form onSubmit={handleSearch}>
          <input type="text" name="search" placeholder=" Search" className="search" />
        </form>
        <nav>
          <ul>
            <li><Link to="/entries">Home</Link></li>
            <li><Link to="/entries/new">Create new</Link></li>
            <li><Link to="/bookmarks">Bookmarks</Link></li>
          </ul>
        </nav>
      </aside>
      <main className="content">
        <Routes>
          <Route path="entries" element={<Entries />} />
          <Route path="entries/:topicId" element={<EntryDetail />} />
          <Route path="entries/search" element={<SearchResults />} />
          <Route path="bookmarks" element={<Bookmarks />} />
          <Route path="entries/new" element={<NewEntry />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

// სიახლეებს ჯსონ ფაილიდან გამოაჩენს ეკრანზე
function Entries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Wiki - Entries"; 
    fetch("http://localhost:3000/entries") 
      .then(res => res.json())
      .then(data => {
        setEntries(data); 
        setLoading(false); 
      })
      .catch(() => setLoading(false)); 
  }, []); 

  return (
    <div>
      <h2>Available entries</h2>
      <ul className="entries">
        {entries.map(entry => (
          <li key={entry.id}>
            <Link to={`/entries/${entry.id}`}>{entry.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// კონკრეტული სტატიების დეტალები
function EntryDetail() {
  const { topicId } = useParams(); 
  const navigate = useNavigate();
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/entries/${topicId}`) // კონკრეტული სტატიის მისაღებად მოთხოვნა fetch ით
      .then(res => res.json())
      .then(data => {
        setEntry(data); 
        document.title = `Wiki - ${data.title}`;
      })
      .catch(() => setEntry(null)); // შეცდომის შემთხვევაში არ წამოიღოს მონაცემები
  }, [topicId]);

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      fetch(`http://localhost:3000/entries/${topicId}`, { method: "DELETE" }) // სტატიის წაშლა
        .then(() => navigate("/entries")); // სიახლეების განახლება
    }
  };

  if (!entry) return <p>Topic not found with id: {topicId}</p>;

  return (
    <div>
      <h2>{entry.title}</h2>
      <p>{entry.content}</p>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}

// ძიების შედეგები
function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `Search: ${query}`; 
    fetch("http://localhost:3000/entries")
      .then(res => res.json())
      .then(data => {
        setResults(data.filter(entry =>
          entry.title.toLowerCase().includes(query.toLowerCase())
        ));
        setLoading(false); 
      })
      .catch(() => setLoading(false)); 
  }, [query]);

  if (loading) return <p>Loading...</p>;
  if (results.length === 0) return <p>No results found</p>; 

  return (
    <div>
      <h2>Search results for: "{query}"</h2>
      <ul>
        {results.map(entry => (
          <li key={entry.id}>
            <Link to={`/entries/${entry.id}`}>{entry.title}</Link> 
          </li>
        ))}
      </ul>
    </div>
  );
}

//  მხოლოდ აღნიშნულ სტატიებს იწერს ამ ფუნქციით
function Bookmarks() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/entries")
      .then(res => res.json())
      .then(data => setEntries(data.filter(entry => entry.bookmarked))) 
      .catch(() => {});
  }, []); 
  return (
    <div>
      <h2>Bookmarks</h2>
      <ul>
        {entries.length ? (
          entries.map(entry => (
            <li key={entry.id}>
              <Link to={`/entries/${entry.id}`}>{entry.title}</Link> 
            </li>
          ))
        ) : (
          <p>No bookmarks found</p> 
        )}
      </ul>
    </div>
  );
}

// ახალ სტატიას ამატებს
function NewEntry() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); 
    if (title.length < 5 || content.length < 10) return; // მინიმუმი ასოების რაოდენობა

    fetch("http://localhost:3000/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, bookmarked: false }) // ახალი სტატიის გაგზავნა jso ფაილში
    })
      .then(res => res.json())
      .then(data => navigate(`/entries/${data.id}`)); 
  };

  return (
    <div>
      <h2>Create New Entry</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required minLength={5} />
        <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} required minLength={10}></textarea>
        <button type="submit">Add Entry</button> 
      </form>
    </div>
  );
}

// არასწორი url ის შემთხევვაში ეს ფუნქცია ეშვება
function NotFound() {
  return <h2>not found</h2>;
}
