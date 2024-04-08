import { Grid, GridItem } from '@chakra-ui/react';
import Chat from '../components/Chat';
import Browser from '../components/Browser';  
import Editor from '../components/Editor';
import Terminal from '../components/Terminal';

export default function Home() {
  return (
    <Grid templateColumns={{base: "1fr", md: "1fr 1fr"}} gap={4} h="100vh" p={4}>
      <GridItem>
        <Chat />
      </GridItem>
      <Grid templateRows="auto 1fr auto" gap={4}>
        <Browser />
        <Editor />  
        <Terminal />
      </Grid>
    </Grid>
  )
}