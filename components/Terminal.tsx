// components/Terminal.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VStack, Box, Input, useToast } from '@chakra-ui/react';

const Terminal = () => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [socket, setSocket] = useState(null);
  const terminalRef = useRef(null);
  const toast = useToast();
  const toastIdRef = useRef();

  const showToast = useCallback((title, description, status) => {
    if (!toastIdRef.current) {
      toastIdRef.current = toast({
        title,
        description,
        status,
        duration: null,
        isClosable: true,
        onCloseComplete: () => {
          toastIdRef.current = undefined;
        },
      });
    }
  }, [toast]);

  useEffect(() => {
    const newSocket = new WebSocket('ws://localhost:3000/api/terminal');

    setSocket(newSocket);

    let retryCount = 0;
    const retryConnection = () => {
      if (retryCount < 5) {
        console.log(`Retrying connection (attempt ${retryCount + 1})...`);
        newSocket.close();
        newSocket.open();
        retryCount++;
      } else {
        console.error('Failed to establish connection after multiple attempts.');
        showToast(
          'Connection Error',
          'Unable to establish a stable connection to the terminal service.',
          'error'
        );
      }
    };

    newSocket.onopen = () => {
      console.log('Connected to the terminal service.');
      if (toastIdRef.current) {
        toast.close(toastIdRef.current);
        toastIdRef.current = undefined;
      }
      retryCount = 0;
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket connection error:', error);
      showToast(
        'Connection Error',
        'Unable to connect to the terminal service. Please ensure Docker is running.',
        'error'
      );
      setTimeout(retryConnection, 2000);
    };

    newSocket.onmessage = (event) => {
      setOutput((prevOutput) => prevOutput + '\n' + event.data);
    };

    newSocket.onclose = () => {
      console.log('Disconnected from the terminal service.');
      showToast(
        'Disconnected',
        'The connection to the terminal service has been lost.',
        'warning'
      );
    };

    return () => {
      newSocket.close();
    };
  }, [showToast]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const handleSendCommand = (e) => {
    if (e.key === 'Enter' && command.trim()) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(command);
        setOutput((prevOutput) => `${prevOutput}\n$ ${command}`);
        setCommand('');
      } else {
        showToast(
          'Disconnected',
          'The connection to the terminal service has been lost. Attempting to reconnect...',
          'warning'
        );
      }
    }
  };

  return (
    <VStack align="stretch" h="100%" spacing={0}>
      <Box
        ref={terminalRef}
        borderWidth={1}
        borderRadius="md"
        p={4}
        flexGrow={1}
        bg="#1a202c"
        color="white"
        fontFamily="monospace"
        overflowY="auto"
        whiteSpace="pre-wrap"
      >
        {output}
      </Box>
      <Box borderTopWidth={1} borderTopColor="#2d3748" p={2} bg="#2d3748">
        <Input
          placeholder="Enter terminal commands"
          color="white"
          fontFamily="monospace"
          border="none"
          _focus={{ boxShadow: 'none' }}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyPress={handleSendCommand}
        />
      </Box>
    </VStack>
  );
};

export default Terminal;