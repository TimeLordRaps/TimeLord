import React from 'react';

const Chat: React.FC = () => {
  return (
    <div className="flex flex-col h-full border rounded p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4">Chat</h3>
      <div className="flex-grow mb-4 overflow-y-auto">
        <div className="mb-2">
          <strong>Contact 1:</strong>
          <p>Last message</p>
        </div>
        <div className="mb-2">
          <strong>Contact 2:</strong>
          <p>Last message</p>
        </div>
      </div>
      <div className="flex">
        <input
          type="text"
          placeholder="Search messages or contacts"
          className="flex-grow border rounded px-2 py-1 mr-2"
        />
        <button className="bg-blue-500 text-white px-4 py-1 rounded">Search</button>
      </div>
    </div>
  );
};

export default Chat;