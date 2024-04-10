import React, { useState, useRef } from 'react';
import { VStack, Box, Input, useToast } from '@chakra-ui/react';

const Terminal = () => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const toast = useToast();
  const terminalRef = useRef<HTMLDivElement>(null);

  const handleSendCommand = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && command.trim()) {
      try {
        const response = await fetch('/api/terminal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ command })
        });
        const result = await response.json();
        if (response.ok) {
          setOutput(prevOutput => `${prevOutput}\n$ ${command}\n${result.stdout}`);
        } else {
          setOutput(prevOutput => `${prevOutput}\n$ ${command}\nError: ${result.message}`);
        }
      } catch (error) {
        setOutput(prevOutput => `${prevOutput}\n$ ${command}\nError: Unable to connect to server.`);
      }
      setCommand('');
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
