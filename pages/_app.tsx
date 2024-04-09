// pages/_app.tsx
import { ChakraProvider } from '@chakra-ui/react';
import theme from '../theme'; // only if you have a custom theme

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}> {/* omit theme prop if not using a custom theme */}
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
