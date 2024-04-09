// components/Terminal.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VStack, Box, Input, useToast } from '@chakra-ui/react';
import io from 'socket.io-client';

const Terminal = () => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [socket, setSocket] = useState(null);
  const terminalRef = useRef(null);
  const toast = useToast();
  const toastIdRef = useRef();

  const showToast = useCallback((title, description, status) => {
    // Only show one toast at a time
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
    const newSocket = io({
      path: '/api/terminal', // Ensure this path is correct
      transports: ['websocket'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to the terminal service.');
      if (toastIdRef.current) {
        toast.close(toastIdRef.current);
        toastIdRef.current = undefined;
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      showToast(
        'Connection Error',
        'Unable to connect to the terminal service. Please ensure Docker is running.',
        'error'
      );
    });

    newSocket.on('output', (data) => {
      setOutput((prevOutput) => prevOutput + '\n' + data);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from the terminal service.');
      showToast(
        'Disconnected',
        'The connection to the terminal service has been lost.',
        'warning'
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, [showToast]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const handleSendCommand = (e) => {
    if (e.key === 'Enter' && command.trim()) {
      if (socket && socket.connected) {
        socket.emit('command', command);
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
