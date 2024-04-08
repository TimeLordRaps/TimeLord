import React, { useState } from 'react';
import { Input, Button, VStack, Box } from '@chakra-ui/react';

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

  return (
    <VStack spacing={2}>
      <Input
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="Enter URL"
      />
      <Input 
        value={script}
        onChange={e => setScript(e.target.value)}
        placeholder="Enter custom script"
      />
      <Button onClick={handleRunAutomation} colorScheme="blue">Run Automation</Button>
      
      {video && (
        <Box>
          <video src={video} controls width="100%" />
        </Box>
      )}

    </VStack>
  );
};

export default Browser;