import React, { useState, useEffect } from 'react';
import { IFile } from '../utils/types';

const FileEditor: React.FC = () => {
  const [files, setFiles] = useState<IFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<IFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [savedStatus, setSavedStatus] = useState<string>('');

  useEffect(() => {
    fetchFiles();
  }, []);

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

  const fetchFileContent = async (file: IFile) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/files?filename=${file.name}`);
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

  const handleFileClick = (file: IFile) => {
    setSelectedFile(file);
    fetchFileContent(file);
  };

  const handleFileContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFileContent(e.target.value);
  };

  const handleSaveFile = async () => {
    if (selectedFile) {
      setIsLoading(true);
      try {
        await fetch(`/api/files?filename=${selectedFile.name}`, {
          method: 'PUT',
          body: JSON.stringify({ content: fileContent }),
          headers: { 'Content-Type': 'application/json' },
        });
        setError('');
        setSavedStatus('File saved successfully');
        setTimeout(() => setSavedStatus(''), 3000);
      } catch (err: any) {
        setError(err.message);
      }
      setIsLoading(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop();
    switch (extension) {
      case 'txt':
        return '📝';
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
        return '💻';
      case 'css':
        return '🎨';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '🖼️';
      default:
        return '📄';
    }
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="w-1/4 bg-gray-100 border-r border-gray-200 p-4">
        <h2 className="text-2xl font-semibold mb-4">Files</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {isLoading ? (
          <p className="text-gray-500">Loading files...</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4">
            {files.map((file) => (
              <li
                key={file.name}
                className={`card cursor-pointer p-4 rounded-lg transition duration-300 ${
                  selectedFile?.name === file.name
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-white text-gray-800 hover:bg-gray-100 hover:shadow-md'
                }`}
                onClick={() => handleFileClick(file)}
              >
                <div className="flex items-center">
                  <span className="text-2xl">{getFileIcon(file.name)}</span>
                  <span className="ml-2 font-semibold">{file.name}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="w-3/4 p-8">
        {selectedFile ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">{selectedFile.name}</h2>
              <button
                className="btn-primary px-6 py-3 rounded-full shadow-md hover:shadow-lg transition duration-300"
                onClick={handleSaveFile}
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
            <textarea
              className="w-full h-[calc(100%-100px)] p-4 border border-gray-300 rounded-lg shadow-inner focus:outline-none focus:ring-2 focus:ring-primary resize-none transition duration-300"
              value={fileContent}
              onChange={handleFileContentChange}
            />
            {savedStatus && <p className="mt-2 text-green-500">{savedStatus}</p>}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p className="text-xl">Select a file to view its content</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileEditor;