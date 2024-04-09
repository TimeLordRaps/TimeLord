import React, { useState, useEffect } from 'react';
import FileManager from './FileManager';
import { Box, VStack, HStack, Heading, Button, IconButton } from '@chakra-ui/react';
import { FaSave, FaUndo, FaRedo, FaFileCode } from 'react-icons/fa';
import Editor, { OnChange } from '@monaco-editor/react';

const EditorComponent: React.FC = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const response = await fetch('/api/files');
    const { files } = await response.json();
    setFiles(files);
  };

  const handleFileClick = async (file) => {
    setSelectedFile(file);
    const response = await fetch(`/api/files?file=${file.path}`);
    const { content } = await response.json();
    setFileContent(content);
  };

  const handleSaveFile = async () => {
    await fetch(`/api/files?file=${selectedFile.path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: fileContent }),
    });
  };

  const getLanguage = (fileName: string) => {
    const extension = fileName.split('.').pop();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'py':
        return 'python';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      default:
        return 'plaintext';
    }
  };

  const handleEditorChange: OnChange = (value, event) => {
    setFileContent(value);
  };

  return (
    <HStack align="stretch" spacing={4} h="100%">
      <Box borderWidth={1} borderRadius="md" p={4} h="100%" w="300px" bg="gray.50">
        <Heading size="md" mb={4}>Files</Heading>
        <FileManager onFileClick={handleFileClick} />
      </Box>
      <VStack align="stretch" flexGrow={1} spacing={0}>
        {selectedFile ? (
          <>
            <HStack justify="space-between" p={2} bg="gray.100">
              <Heading size="md">{selectedFile.name}</Heading>
              <HStack>
                <IconButton icon={<FaSave />} aria-label="Save" onClick={handleSaveFile} colorScheme="blue" size="sm" />
                <IconButton icon={<FaUndo />} aria-label="Undo" size="sm" />
                <IconButton icon={<FaRedo />} aria-label="Redo" size="sm" />
              </HStack>
            </HStack>
            <Box flexGrow={1}>
              <Editor
                height="100%"
                language={getLanguage(selectedFile.name)}
                theme="vs-dark"
                value={fileContent}
                onChange={handleEditorChange}
                options={{
                  selectOnLineNumbers: true,
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  formatOnPaste: true,
                  minimap: { enabled: false },
                }}
              />
            </Box>
            <HStack justify="space-between" p={1} bg="gray.900" color="white" fontSize="sm">
              <Box>Line 1, Column 1</Box>
              <Box>Spaces: 2</Box>
              <Box>UTF-8</Box>
            </HStack>
          </>
        ) : (
          <Box p={4}>Select a file to view its content.</Box>
        )}
      </VStack>
    </HStack>
  );
};

export default EditorComponent;