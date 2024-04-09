import React, { useState } from 'react';
import { VStack, Input, Button, Box, useColorModeValue } from '@chakra-ui/react';

const Browser = () => {
  const [url, setUrl] = useState('');
  const [script, setScript] = useState('');
  const [video, setVideo] = useState('');

  const handleRunAutomation = async () => {
    const response = await fetch('/api/automate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, script })
    });
    const { videoUrl } = await response.json();
    setVideo(videoUrl);
  };

  const inputBg = useColorModeValue('white', 'gray.700');
  const buttonBg = useColorModeValue('violet.300', 'violet.500');
  const buttonHoverBg = useColorModeValue('violet.400', 'violet.600');

  return (
    <VStack spacing={4} align="stretch" h="100%" p={4}>
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter URL"
        bg={inputBg}
      />
      <Input
        value={script}
        onChange={(e) => setScript(e.target.value)}
        placeholder="Enter custom script"
        bg={inputBg}
      />
      <Button
        onClick={handleRunAutomation}
        bg={buttonBg}
        _hover={{ bg: buttonHoverBg }}
        color="white"
      >
        Go
      </Button>
      
      {video && (
        <Box as="video" src={video} controls width="100%" mt={4} />
      )}
    </VStack>
  );
};

export default Browser;