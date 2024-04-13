import React, { useState, useRef, useEffect } from 'react';
import { VStack, Box, Input } from '@chakra-ui/react';

const Terminal = () => {
  const [command, setCommand] = useState('');
  const [output, setOutput] = useState('');
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventSource = new EventSource('/api/terminal');
  
    eventSource.onmessage = (event) => {
      // Update output based on the latest data received
      setOutput(event.data.replace(/^data: /, ''));
    };
  
    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close();
    };
  
    return () => {
      eventSource.close();
    };
  }, []);
  

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  const handleSendCommand = async () => {
    if (command.trim()) {
      setOutput((prevOutput) => `${prevOutput}$ ${command}\n`);
      try {
        const response = await fetch('/api/terminal', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ command }),
        });

        if (response.ok) {
          const data = await response.text();
          setOutput((prevOutput) => `${prevOutput}${data}\n`);
          setCommand('');
        } else {
          console.error('Error sending command:', response.statusText);
        }
      } catch (error) {
        console.error('Error sending command:', error);
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
        whiteSpace="pre"
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
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSendCommand();
            }
          }}
        />
      </Box>
    </VStack>
  );
};

export default Terminal;