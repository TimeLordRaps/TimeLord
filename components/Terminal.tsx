import React from 'react';
import { VStack, HStack, Box, Input, Button } from '@chakra-ui/react';

const Terminal: React.FC = () => {
  return (
    <VStack align="stretch" h="100%">
      <Box borderWidth={1} borderRadius="md" p={4} flexGrow={1}>
        Terminal output will be displayed here.
      </Box>
      <HStack>
        <Input placeholder="Enter terminal commands" flexGrow={1} />
        <Button colorScheme="red" size="sm">Stop</Button>
        <Button colorScheme="blue" size="sm">Send</Button>
      </HStack>
    </VStack>
  );
};

export default Terminal;