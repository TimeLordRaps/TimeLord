import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  List,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { FiFolder, FiFile, FiSearch, FiChevronDown, FiChevronRight } from 'react-icons/fi';

const FileManager = ({ onFileClick }) => {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState([]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    const response = await fetch('/api/files');
    const { files } = await response.json();
    setFiles(files);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/files', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        fetchFiles();
      } else {
        console.error('File upload failed.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const searchFiles = (files, term) => {
    return files.reduce((result, file) => {
      if (file.name.toLowerCase().includes(term.toLowerCase())) {
        result.push(file);
      }
      if (file.isDirectory) {
        const nestedResults = searchFiles(file.children, term);
        result.push(...nestedResults);
      }
      return result;
    }, []);
  };

  const filteredFiles = searchTerm ? searchFiles(files, searchTerm) : files;

  const toggleExpandedItem = (path) => {
    setExpandedItems((prevExpandedItems) => {
      const itemIndex = prevExpandedItems.indexOf(path);
      if (itemIndex > -1) {
        return prevExpandedItems.filter((item) => item !== path);
      } else {
        return [...prevExpandedItems, path];
      }
    });
  };

  const isExpanded = (path) => {
    return expandedItems.includes(path);
  };

  const renderFileTree = (files) => {
    return files.map((file) => (
      <AccordionItem key={file.path}>
        <AccordionButton
          onClick={() => {
            toggleExpandedItem(file.path);
            if (!file.isDirectory) {
              onFileClick(file);
            }
          }}
          _hover={{ bg: 'gray.100' }}
          px={2}
          py={1}
        >
          <Icon as={file.isDirectory ? FiFolder : FiFile} color={file.isDirectory ? 'blue.500' : 'gray.500'} mr={2} />
          <Box flex="1" textAlign="left" fontSize="sm">
            {file.name}
          </Box>
          {file.isDirectory && <Icon as={isExpanded(file.path) ? FiChevronDown : FiChevronRight} />}
        </AccordionButton>
        {file.isDirectory && (
          <AccordionPanel pl={4}>
            <List spacing={1}>{renderFileTree(file.children)}</List>
          </AccordionPanel>
        )}
      </AccordionItem>
    ));
  };

  return (
    <Box>
      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none">
          <Icon as={FiSearch} />
        </InputLeftElement>
        <Input
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>
      <Input type="file" onChange={handleFileUpload} mb={4} />
      <Accordion allowMultiple index={expandedItems}>
        <List spacing={1}>{renderFileTree(filteredFiles)}</List>
      </Accordion>
    </Box>
  );
};

export default FileManager;