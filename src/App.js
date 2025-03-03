import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [ngrokUrl, setNgrokUrl] = useState('');

  const logsPerPage = 5;

  useEffect(() => {
    // Fetch the ngrok URL from the backend
    fetch('http://localhost:8080/ngrok')
      .then(response => response.json())
      .then(data => {
        setNgrokUrl(data.ngrok_url); // Set ngrok URL dynamically
        fetchLogs(data.ngrok_url);
      })
      .catch(error => console.error('Error fetching ngrok URL:', error));
  }, []);

  const fetchLogs = (url) => {
    setLoading(true);
    fetch(`${url}/logs?page=${currentPage}&limit=${logsPerPage}`)
      .then((response) => response.json())
      .then((data) => {
        setLogs(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching logs:', error);
        setLoading(false);
      });
  };

  const handleSourceChange = (event) => {
    setSelectedSource(event.target.value);
    setCurrentPage(1);
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  // Filter logs by source and search query
  const filteredLogs = logs
    .filter((log) =>
      selectedSource === 'All' ? true : log.source === selectedSource
    )
    .filter((log) =>
      log.body.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const sources = [...new Set(logs.map((log) => log.source)), 'All'];

  return (
    <div className="App">
      <h1>TunnelVision:</h1>
      <h2>Real-Time Webhook Logs</h2>
      <p className="info-text">View incoming webhook logs from various sources. You can filter by source, search logs, and more.</p>

      {/* Dropdown to select webhook source */}
      <div className="source-select">
        <label htmlFor="source-select">Filter by Source:</label>
        <select id="source-select" value={selectedSource} onChange={handleSourceChange}>
          {sources.map((source, index) => (
            <option key={index} value={source}>
              {source}
            </option>
          ))}
        </select>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input type="text" placeholder="Search logs..." value={searchQuery} onChange={handleSearch} />
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="info-text">Loading logs...</p>
        </div>
      ) : (
        <div className="log-container">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log, index) => (
              <div key={index} className="log-card">
                <div className="log-item">
                  {/* Log Header */}
                  <div className="log-header">
                    <span className="event-name">{log.event}</span>
                    <span className="source-label">{log.source}</span>
                    <span className="amount">${log.amount.toFixed(2)}</span>
                  </div>
                  <pre className="log-body">{log.body}</pre>
                </div>
              </div>
            ))
          ) : (
            <p className="info-text">No logs available for the selected source.</p>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Prev
        </button>
        <span>Page {currentPage}</span>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={filteredLogs.length < logsPerPage}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
