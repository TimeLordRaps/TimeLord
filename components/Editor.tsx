import React, { useState, useEffect } from 'react';
import FileNavigator from '@nolesh/react-file-manager';
import { Box, VStack, HStack, Heading, Button } from '@chakra-ui/react';
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
      <Box borderWidth={1} borderRadius="md" p={4} h="100%" w="300px">
        <Heading size="md" mb={4}>Files</Heading>
        <FileNavigator 
          files={files}
          onFileClick={handleFileClick}
        />
      </Box>
      <VStack align="stretch" flexGrow={1} spacing={4}>
        {selectedFile ? (
          <>
            <HStack justify="space-between">
              <Heading size="md">{selectedFile.name}</Heading>
              <Button onClick={handleSaveFile} colorScheme="blue">Save</Button>
            </HStack>
            <Box borderWidth={1} borderRadius="md" p={4} h="100%">
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
          </>
        ) : (
          <Box>Select a file to view its content.</Box>
        )}
      </VStack>
    </HStack>
  );
};

export default EditorComponent;