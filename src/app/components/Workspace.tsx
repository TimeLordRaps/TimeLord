// src/app/components/Workspace.tsx

import React, { useState, useEffect } from 'react';

// Interfaces
interface IFile {
  name: string;
  path: string;
  size?: number;
  lastModified?: string;
}

const Workspace: React.FC = () => {
  const [files, setFiles] = useState<IFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<IFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savedStatus, setSavedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  // Fetch files from the API
  const fetchFiles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/files');
      const data = await response.json();
      if (data.files) {
        setFiles(data.files);
      } else {
        throw new Error('Failed to load files');
      }
    } catch (err: any) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  // Fetch content of a selected file
  const fetchFileContent = async (file: IFile) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/files/${file.name}`);
      const data = await response.json();
      if (data.content) {
        setFileContent(data.content);
      } else {
        throw new Error('Failed to load file content');
      }
    } catch (err: any) {
      setError(err.message);
    }
    setIsLoading(false);
  };

  // Handle file selection
  const handleFileClick = (file: IFile) => {
    setSelectedFile(file);
    fetchFileContent(file);
  };

  // Handle file content change
  const handleFileContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFileContent(e.target.value);
  };

  // Save file content
  const handleSaveFile = async () => {
    if (selectedFile) {
      setIsLoading(true);
      try {
        await fetch(`/api/files/${selectedFile.name}`, {
          method: 'PUT',
          body: JSON.stringify({ content: fileContent }),
          headers: { 'Content-Type': 'application/json' },
        });
        setError('');
        setSavedStatus('File saved successfully');
        setTimeout(() => setSavedStatus(''), 3000); // Clear saved status after 3 seconds
      } catch (err: any) {
        setError(err.message);
      }
      setIsLoading(false);
    }
  };

  // Create a new file
  const handleCreateFile = async () => {
    const fileName = prompt('Enter a name for the new file:');
    if (fileName) {
      setIsLoading(true);
      try {
        await fetch('/api/files', {
          method: 'POST',
          body: JSON.stringify({ name: fileName, content: '' }),
          headers: { 'Content-Type': 'application/json' },
        });
        setError('');
        fetchFiles(); // Refresh the file list
      } catch (err: any) {
        setError(err.message);
      }
      setIsLoading(false);
    }
  };

  // Delete a file
  const handleDeleteFile = async (file: IFile) => {
    if (window.confirm(`Are you sure you want to delete ${file.name}?`)) {
      setIsLoading(true);
      try {
        await fetch(`/api/files/${file.name}`, {
          method: 'DELETE',
        });
        setError('');
        setSelectedFile(null);
        setFileContent('');
        fetchFiles(); // Refresh the file list
      } catch (err: any) {
        setError(err.message);
      }
      setIsLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter files based on search term
  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex">
      <div className="w-1/4 p-4">
        <h2 className="text-xl font-bold mb-4">Files</h2>
        {error && <p className="text-red-500">{error}</p>}
        {isLoading ? (
          <p>Loading files...</p>
        ) : (
          <>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-2 py-1 border border-gray-300 rounded"
              />
            </div>
            <button
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleCreateFile}
            >
              New File
            </button>
            <ul>
              {filteredFiles.map((file) => (
                <li
                  key={file.name}
                  className={`flex justify-between items-center cursor-pointer p-2 ${
                    selectedFile?.name === file.name ? 'bg-gray-200' : ''
                  }`}
                >
                  <span onClick={() => handleFileClick(file)}>{file.name}</span>
                  <button
                    className="text-red-500"
                    onClick={() => handleDeleteFile(file)}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <div className="w-3/4 p-4">
        {selectedFile && (
          <>
            <h2 className="text-xl font-bold mb-4">{selectedFile.name}</h2>
            <textarea
              className="w-full h-96 p-2 border border-gray-300 rounded"
              value={fileContent}
              onChange={handleFileContentChange}
            />
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
              onClick={handleSaveFile}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            {savedStatus && <p className="mt-2 text-green-500">{savedStatus}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default Workspace;