import React from 'react';
import Browser from './Browser';
import Chat from './Chat';
import FileEditor from './FileEditor';
import Terminal from './Terminal';

const Workspace: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-screen p-4">
      <div className="flex flex-col">
        <Chat />
      </div>
      <div className="flex flex-col">
        <Browser />
        <FileEditor />
        <Terminal />
      </div>
    </div>
  );
};

export default Workspace;