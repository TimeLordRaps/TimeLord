import React from 'react';
import { VStack, Input, Button, Box } from '@chakra-ui/react';

const Terminal: React.FC = () => {
  return (
    <VStack align="stretch">
      <Box borderWidth={1} borderRadius="md" p={4} mb={4} minH={150}>
        Terminal output will be displayed here.
      </Box>
      <VStack align="stretch">
        <Input placeholder="Enter terminal commands" />
        <Button colorScheme="gray">Stop</Button>
        <Button colorScheme="blue">Send</Button>
      </VStack>
    </VStack>
  );
};

export default Terminal;