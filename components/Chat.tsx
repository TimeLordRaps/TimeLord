import React from 'react';
import { Box, Heading, Text, Input, Button, VStack } from '@chakra-ui/react';

const Chat: React.FC = () => {
  return (
    <Box border="1px" borderRadius="md" p={4} mb={4}>
      <Heading size="lg" mb={4}>Chat</Heading>
      <VStack align="stretch" spacing={2} mb={4} overflowY="auto" flexGrow={1}>
        <Box>
          <Text fontWeight="bold">Contact 1:</Text>
          <Text>Last message</Text>  
        </Box>
        <Box>
          <Text fontWeight="bold">Contact 2:</Text>
          <Text>Last message</Text>
        </Box>
      </VStack>
      <Box display="flex">
        <Input placeholder="Search messages or contacts" size="sm" mr={2} flexGrow={1} />
        <Button colorScheme="blue" size="sm">Search</Button>
      </Box>
    </Box>
  );
};

export default Chat;