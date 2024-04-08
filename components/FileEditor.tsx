// components/FileEditor.tsx
import React, { useState, useEffect } from 'react';
import FileNavigator from 'react-file-manager';
import 'react-file-manager/dist/style.css';
import { IFile } from '../utils/types';
import CodeEditor from './CodeEditor';

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

  const handleFileClick = (file: IFile) => {
    setSelectedFile(file);
    fetchFileContent(file);
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

  const getLanguage = (fileName: string) => {
    const extension = fileName.split('.').pop();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'jsx':
        return 'javascript';
      case 'tsx':
        return 'typescript';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'json':
        return 'json';
      default:
        return 'plaintext';
    }
  };

  return (
    <div className="flex h-full bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="w-1/4 bg-gray-100 border-r border-gray-200 p-4">
        <FileNavigator files={files} onFileClick={handleFileClick} />
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
            <CodeEditor
              language={getLanguage(selectedFile.name)}
              code={fileContent}
              onChange={setFileContent}
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