import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLog, setExpandedLog] = useState(null); // To track the expanded card
  const logsPerPage = 5; // Number of logs to display per page

  // Fetch logs from the backend with pagination and search
  useEffect(() => {
    setLoading(true); // Show loading indicator
    fetch(`https://webhook-logger-backend.herokuapp.com/logs?page=${currentPage}&limit=${logsPerPage}`)
      .then((response) => response.json())
      .then((data) => {
        setLogs(data);
        setLoading(false); // Hide loading indicator
      })
      .catch((error) => {
        console.error('Error fetching logs:', error);
        setLoading(false); // Hide loading indicator
      });
  }, [currentPage]);

  const openNgrokInspect = () => {
    window.open('http://localhost:4040', '_blank');
  };

  const handleSourceChange = (event) => {
    setSelectedSource(event.target.value);
    setCurrentPage(1); // Reset to page 1 when source changes
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value); // Update search query
  };

  // Filter logs by the selected source and search query
  const filteredLogs = logs
    .filter((log) =>
      selectedSource === 'All' ? true : log.source === selectedSource
    )
    .filter((log) =>
      log.body.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Get unique sources from the logs
  const sources = [...new Set(logs.map((log) => log.source)), 'All'];

  // Toggle card expansion
  const toggleExpand = (index) => {
    setExpandedLog(expandedLog === index ? null : index);
  };

  return (
    <div className="App">
      <h1>TunnelVision:</h1>
      <h2>Real-Time Webhook Logs with Ngrok</h2>

      <p className="info-text">
        View incoming webhook logs from various sources. You can filter by source, search logs, and more.
      </p>

      {/* Dropdown to select webhook source */}
      <div className="source-select">
        <label htmlFor="source-select">Filter by Source:</label>
        <select
          id="source-select"
          value={selectedSource}
          onChange={handleSourceChange}
        >
          {sources.map((source, index) => (
            <option key={index} value={source}>
              {source}
            </option>
          ))}
        </select>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>

      {/* Button to open Ngrok Inspect */}
      <button className="inspect-button" onClick={openNgrokInspect}>
        Open Ngrok Inspect Dashboard
      </button>

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
                <div
                  className={`log-item ${log.status}`}
                  onClick={() => toggleExpand(index)}
                >
                  {/* Log Header */}
                  <div className="log-header">
                    <span className="event-name">{log.event}</span>
                    <span className="source-label">{log.source}</span>
                    <span className="amount">${log.amount.toFixed(2)}</span>
                    <span className="expand-toggle">
                      {expandedLog === index ? '↓' : '→'}
                    </span>
                  </div>

                  {/* Log Body - Expandable */}
                  {expandedLog === index && (
                    <pre className="log-body">{JSON.stringify(JSON.parse(log.body), null, 2)}</pre>
                  )}
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
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>Page {currentPage}</span>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={filteredLogs.length < logsPerPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
