import React from 'react';
import { Box, VStack, Input, Button, useColorModeValue } from '@chakra-ui/react';

const Chat = () => {
  const boxBg = useColorModeValue('violet.50', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.600');
  const buttonBg = useColorModeValue('violet.300', 'violet.500');
  const buttonHoverBg = useColorModeValue('violet.400', 'violet.600');

  return (
    <VStack spacing={4} align="stretch" h="100%" p={4}>
      <Box bg={boxBg} borderRadius="md" p={4} flexGrow={1}>
        <VStack align="stretch" spacing={2} flexGrow={1}>
          <Box>
            <Box fontWeight="bold">Contact 1:</Box>
            <Box>Last message</Box>  
          </Box>
          <Box>
            <Box fontWeight="bold">Contact 2:</Box>
            <Box>Last message</Box>
          </Box>
        </VStack>
      </Box>
      <Box>
        <Input placeholder="Search messages or contacts" bg={inputBg} size="sm" />
        <Button bg={buttonBg} _hover={{ bg: buttonHoverBg }} color="white" size="sm">
          Search
        </Button>
      </Box>
    </VStack>
  );
};

export default Chat;