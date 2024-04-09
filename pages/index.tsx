import { Grid, GridItem } from '@chakra-ui/react';
import Chat from '../components/Chat';
import Browser from '../components/Browser';  
import Editor from '../components/Editor';
import Terminal from '../components/Terminal';

export default function Home() {
  return (
    <Grid
      templateColumns={{ base: "1fr", md: "1fr 1fr" }}
      templateRows="repeat(2, 1fr)"
      gap={4}
      h="100vh"
      p={4}
    >
      <GridItem colSpan={{ base: 1, md: 1 }}>
        <Chat />
      </GridItem>
      <GridItem colSpan={{ base: 1, md: 1 }}>
        <Browser />
      </GridItem>
      <GridItem colSpan={{ base: 1, md: 2 }}>
        <Editor />
      </GridItem>
      <GridItem colSpan={{ base: 1, md: 2 }}>
        <Terminal />
      </GridItem>
    </Grid>
  )
}
