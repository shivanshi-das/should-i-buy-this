import { useState } from 'react';

function App() {
  const [productName, setProductName] = useState("");
  const [reviews, setReviews] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!productName.trim()) return;
    setLoading(true);
    setError("");
    setReviews([]);
    setAnalysis(null);

    try {
      const res = await fetch(`http://localhost:5000/api/reviews/analyze?product=${encodeURIComponent(productName)}`);
      console.log("Response status:", res.status);

      const contentType = res.headers.get("content-type");
      console.log("Content-Type:", contentType);

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Expected JSON but got something else.");
      }

      const data = await res.json();
      console.log("Data received:", data);

      const parsedReviews = [
        ...(Array.isArray(data.pros) ? data.pros : []),
        ...(Array.isArray(data.cons) ? data.cons : [])
      ];

      setReviews(parsedReviews);
      setAnalysis(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Something went wrong while fetching reviews.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Should I Buy This?</h1>

      <input
        type="text"
        placeholder="Enter product name"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        style={{ padding: "0.5rem", width: "300px" }}
      />
      <button onClick={handleSearch} style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}>
        Search
      </button>

      <div style={{ marginTop: "2rem" }}>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {!loading && reviews.length === 0 && !error && <p>No reviews found.</p>}

        {analysis?.verdict && (
          <div style={{ marginTop: "1rem", padding: "1rem", background: "#eef" }}>
            <strong>Verdict:</strong> {analysis.verdict} <br />
            <strong>Sentiment Score:</strong> {analysis.sentimentScore}
          </div>
        )}

        {reviews.map((comment, idx) => (
          <div key={idx} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem" }}>
            {comment}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
