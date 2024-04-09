import { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  List,
  ListItem,
  ListIcon,
  Link,
  Input,
  InputGroup,
  InputLeftElement,
  Icon,
} from '@chakra-ui/react';
import { FiFolder, FiFile, FiSearch } from 'react-icons/fi';

const FileManager = () => {
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
    // Implement file upload logic here
  };

  const renderFileTree = (files) => {
    return files.map((file) => (
      <AccordionItem key={file.path}>
        <AccordionButton
          onClick={() => toggleExpandedItem(file.path)}
          _expanded={{ bg: 'teal.500', color: 'white' }}
        >
          <Box flex="1" textAlign="left">
            <ListIcon as={file.isDirectory ? FiFolder : FiFile} />
            {file.name}
          </Box>
          {file.isDirectory && <AccordionIcon />}
        </AccordionButton>
        {file.isDirectory && (
          <AccordionPanel>
            <List>{renderFileTree(file.children)}</List>
          </AccordionPanel>
        )}
        {!file.isDirectory && (
          <Link href={`/api/files?file=${file.path}`} download>
            Download
          </Link>
        )}
      </AccordionItem>
    ));
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
        {renderFileTree(filteredFiles)}
      </Accordion>
    </Box>
  );
};