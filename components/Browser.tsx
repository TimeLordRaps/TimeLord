import React from 'react';

const Browser: React.FC = () => {
  return (
    <div>
      <h3>Browser</h3>
      <input
        type="text"
        placeholder="Search website content"
      />
      <button>Search</button>
      <div>
        {/* Placeholder for website content */}
        <p>Website content will be displayed here.</p>
      </div>
    </div>
  );
};

export default Browser;