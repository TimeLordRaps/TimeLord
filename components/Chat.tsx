import React, { useState } from 'react';
import { Box, VStack, Input, Button, InputGroup, InputRightElement, useColorModeValue } from '@chakra-ui/react';

const Chat = () => {
  const [message, setMessage] = useState('');
  const boxBg = useColorModeValue('violet.50', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.600');
  const buttonBg = useColorModeValue('violet.300', 'violet.500');
  const buttonHoverBg = useColorModeValue('violet.400', 'violet.600');

  // Function to handle sending the message
  const handleSendMessage = () => {
    // Logic to send the message will go here
    setMessage(''); // Clear the message input after sending
  };

  return (
    <VStack spacing={4} align="stretch" h="100%" p={4}>
      <Box bg={boxBg} borderRadius="md" p={4} flexGrow={1} overflowY="auto">
        {/* Message list will be rendered here */}
      </Box>
      <InputGroup>
        <Input
          placeholder="Enter your message here"
          bg={inputBg}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage();
            }
          }}
        />
        <InputRightElement width="4.5rem">
          <Button
            h="1.75rem"
            size="sm"
            onClick={handleSendMessage}
            bg={buttonBg}
            _hover={{ bg: buttonHoverBg }}
            color="white"
          >
            Send
          </Button>
        </InputRightElement>
      </InputGroup>
    </VStack>
  );
};

export default Chat;
