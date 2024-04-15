import React, { useState, useEffect } from 'react';
import { VStack, Box, Input, Button, InputGroup, InputRightElement, useColorModeValue, Text, useToast, Spinner } from '@chakra-ui/react';
import { ArrowLeftIcon, ArrowRightIcon, EditIcon } from '@chakra-ui/icons';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageContent, setEditingMessageContent] = useState('');
  const [currentMessageId, setCurrentMessageId] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async (messageId = null) => {
    const url = messageId ? `/api/chat?messageId=${messageId}` : '/api/chat';
    const response = await fetch(url);
    const data = await response.json();
    if (Array.isArray(data)) {
      setMessages(data);
      if (data.length > 0 && !messageId) {
        setCurrentMessageId(data[data.length - 1].id);
      }
    } else {
      console.error('Fetched data is not an array:', data);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() && canSend) {
      setLoading(true);
      setCanSend(false);
      setTimeout(() => {
        if (!canSend) {
          setLoading(false);
          setCanSend(true);
          toast({
            title: "Timeout",
            description: "The request timed out. Please try again.",
            status: "error",
            duration: 9000,
            isClosable: true,
          });
        }
      }, 60000); // 60 seconds timeout

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user: 'User', content: message, parentId: currentMessageId })
        });
        if (!response.ok) throw new Error('Network response was not ok.');
        const newMessage = await response.json();
        // Check if the response is a message object before adding to messages array
        if (newMessage && typeof newMessage === 'object' && newMessage.id) {
          setMessages(prevMessages => [...prevMessages, newMessage]);
          setCurrentMessageId(newMessage.id);
        } else {
          console.error('Invalid message object:', newMessage);
        }
        setMessage('');
      } catch (error) {
        toast({
          title: "Error sending message.",
          description: error.message,
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
        setCanSend(true);
      }
    }
  };

  const handleEditMessage = async (messageId, content) => {
    try {
      const response = await fetch(`/api/chat?messageId=${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      if (!response.ok) throw new Error('Network response was not ok.');
      const updatedMessage = await response.json();
      setMessages(prevMessages => prevMessages.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg));
      setEditingMessageId(null);
      setEditingMessageContent('');
    } catch (error) {
      toast({
        title: "Error editing message.",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const handleJumpToMessage = async (messageId) => {
    try {
      await fetchMessages(messageId);
      setCurrentMessageId(messageId);
    } catch (error) {
      toast({
        title: "Error jumping to message.",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const renderMessages = (messages, parentId = null) => {
    return messages
      .filter(msg => msg.parentId === parentId)
      .map(msg => (
        <Box key={msg.id} display="flex" alignItems="center" mb={2}>
          <Box
            bg={msg.user === 'User' ? 'violet.500' : 'gray.200'}
            color={msg.user === 'User' ? 'white' : 'gray.800'}
            borderRadius="md"
            p={2}
            maxW="80%"
            ml={msg.user === 'User' ? 'auto' : 0}
            mr={msg.user === 'User' ? 0 : 'auto'}
          >
            {editingMessageId === msg.id ? (
              <InputGroup size="sm">
                <Input
                  value={editingMessageContent}
                  onChange={(e) => setEditingMessageContent(e.target.value)}
                  placeholder="Edit message"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleEditMessage(msg.id, editingMessageContent);
                    }
                  }}
                />
                <InputRightElement>
                  <Button
                    size="xs"
                    onClick={() => handleEditMessage(msg.id, editingMessageContent)}
                  >
                    Save
                  </Button>
                </InputRightElement>
              </InputGroup>
            ) : (
              <>
                <Text>{msg.content}</Text>
                <Box display="flex" justifyContent="space-between" mt={1}>
                  <Button
                    size="xs"
                    leftIcon={<EditIcon />}
                    onClick={() => {
                      setEditingMessageId(msg.id);
                      setEditingMessageContent(msg.content);
                    }}
                  >
                    Edit
                  </Button>
                  <Box display="flex" alignItems="center">
                    {msg.parentId && (
                      <Button
                        size="xs"
                        leftIcon={<ArrowLeftIcon />}
                        onClick={() => handleJumpToMessage(msg.parentId)}
                        mr={1}
                      >
                        Back
                      </Button>
                    )}
                    {msg.childrenIds.length > 0 && (
                      <Button
                        size="xs"
                        rightIcon={<ArrowRightIcon />}
                        onClick={() => handleJumpToMessage(msg.childrenIds[0])}
                        ml={1}
                      >
                        Next
                      </Button>
                    )}
                  </Box>
                </Box>
              </>
            )}
          </Box>
          {renderMessages(messages, msg.id)}
        </Box>
      ));
  };

  return (
    <VStack spacing={4} align="stretch" h="100%" p={4}>
      <Box bg={useColorModeValue('violet.50', 'gray.700')} borderRadius="md" p={4} flexGrow={1} overflowY="auto">
        {renderMessages(messages)}
      </Box>
      <InputGroup>
        <Input
          placeholder="Enter your message here"
          bg={useColorModeValue('white', 'gray.600')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && canSend && !loading) {
              handleSendMessage();
            }
          }}
          isDisabled={!canSend || loading}
        />
        <InputRightElement width="4.5rem">
          {loading ? (
            <Spinner size="sm" />
          ) : (
            <Button
              h="1.75rem"
              size="sm"
              onClick={handleSendMessage}
              bg={useColorModeValue('violet.300', 'violet.500')}
              _hover={{ bg: useColorModeValue('violet.400', 'violet.600') }}
              color="white"
              isDisabled={!canSend}
            >
              Send
            </Button>
          )}
        </InputRightElement>
      </InputGroup>
    </VStack>
  );
};

export default Chat;