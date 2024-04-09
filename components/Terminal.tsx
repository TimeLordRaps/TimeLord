// components/Terminal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { VStack, Box, Input } from '@chakra-ui/react';
import io from 'socket.io-client';

const Terminal: React.FC = () => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const [socket, setSocket] = useState(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('output', (data) => {
      console.log('Received output:', data);
      setOutput((prevOutput) => prevOutput + '\n' + data);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const handleSendCommand = (e) => {
    if (e.key === 'Enter') {
      if (socket) {
        socket.emit('command', command);
        setOutput((prevOutput) => prevOutput + '\n$ ' + command);
        setCommand('');
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
        bg="#44337A"
        color="white"
        fontFamily="monospace"
        overflowY="auto"
        whiteSpace="pre-wrap"
      >
        {output}
      </Box>
      <Box borderTopWidth={1} borderTopColor="gray.700" p={2} bg="#322659">
        <Input
          placeholder="Enter terminal commands"
          color="white"
          fontFamily="monospace"
          border="none"
          _focus={{ boxShadow: 'none' }}
          px={0}
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyPress={handleSendCommand}
        />
      </Box>
    </VStack>
  );
};

export default Terminal;