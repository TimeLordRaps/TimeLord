import React from 'react';

const Terminal: React.FC = () => {
  return (
    <div className="flex flex-col border rounded p-4">
      <h3 className="text-lg font-semibold mb-4">Terminal</h3>
      <div className="flex-grow border rounded p-4 mb-4 overflow-y-auto">
        <p>Terminal output will be displayed here.</p>
      </div>
      <div className="flex">
        <input
          type="text"
          placeholder="Enter terminal commands"
          className="flex-grow border rounded px-2 py-1 mr-2"
        />
      </div>
    </div>
  );
};

export default Terminal;