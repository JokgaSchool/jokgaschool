import React, { useState } from 'react';
import '../styles/about.css';

function MainContent() {
  const [loading, setLoading] = useState(true);

  const handleLoad = () => {
    setLoading(false);
  };

  return (
    <section className="web_content">
      {loading && (
        <div className="post-detail">
          <div className="prs-message">
            <svg className="loader" viewBox="25 25 50 50">
              <circle r="20" cy="50" cx="50"></circle>
            </svg>
          </div>
        </div>
      )}
     
      <iframe
        src="https://info.louis1618.shop"
        title="Louis1618"
        className={`styled-iframe ${!loading ? 'loaded' : ''}`}
        width="100%"
        height="100%"
        frameBorder="0"
        onLoad={handleLoad}
      ></iframe>
    </section>
  );
}

export default MainContent;
