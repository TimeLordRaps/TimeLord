// Interfaces
interface IFile {
    name: string;
    path: string;
    size?: number; // size in bytes
    lastModified?: string; // last modified date
  }
  
  interface IErrorResponse {
    message: string;
  }
  
  import React, { useState, useEffect } from 'react';
  
  const Workspace: React.FC = () => {
      const [files, setFiles] = useState<IFile[]>([]);
      const [error, setError] = useState<string>('');
  
      // Fetching files on component mount
      useEffect(() => {
          fetch('/api/files')
              .then(response => response.json())
              .then(data => {
                  if (data.files) {
                      setFiles(data.files);
                  } else {
                      throw new Error('Failed to load files');
                  }
              })
              .catch(err => setError(err.message));
      }, []);
  
      // Function to delete a file
      const deleteFile = (filename: string): void => {
          fetch(`/api/files/${filename}`, { method: 'DELETE' })
              .then(response => response.json())
              .then(data => {
                  if (data.message) {
                      setFiles(files.filter(file => file.name !== filename));
                  } else {
                      throw new Error('Failed to delete file');
                  }
              })
              .catch(err => setError(err.message));
      };
  
      return (
          <div>
              <h1>Workspace</h1>
              {error && <p className="error">{error}</p>}
              <ul>
                  {files.map(file => (
                      <li key={file.name}>
                          {file.name}
                          <button onClick={() => deleteFile(file.name)}>Delete</button>
                      </li>
                  ))}
              </ul>
          </div>
      );
  };
  
  export default Workspace;
  