import { Grid, GridItem } from '@chakra-ui/react';
import Chat from './Chat';
import Browser from './Browser';
import Editor from './Editor';
import Terminal from './Terminal';

const Workspace: React.FC = () => {
  return (
    <Grid templateColumns="1fr 1fr" h="100vh">
      <GridItem>
        <Chat />
      </GridItem>
      <GridItem>
        <Grid templateRows="30% 50% 20%" h="100%">
          <GridItem>
            <Browser />
          </GridItem>
          <GridItem>
            <Editor />
          </GridItem>
          <GridItem>
            <Terminal />
          </GridItem>
        </Grid>
      </GridItem>
    </Grid>
  );
};

export default Workspace;