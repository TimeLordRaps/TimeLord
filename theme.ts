import { extendTheme, ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

const config: ThemeConfig = {
  useSystemColorMode: true,
};

const styles = {
  global: (props) => ({
    body: {
      bg: mode('violet.400', 'gray.800')(props),
      color: mode('gray.800', 'whiteAlpha.900')(props),
    },
  }),
};

const colors = {
  violet: {
    50: '#ede9fe', // very light violet for light mode
    100: '#ddd6fe',
    200: '#c4b5fd',
    300: '#a78bfa',
    400: '#8b5cf6',
    500: '#7c3aed', // primary violet
    600: '#6d28d9',
    700: '#5b21b6',
    800: '#4c1d95',
    900: '#3c1e70', // darker violet for dark mode backgrounds
  },
};

// Here we override the default styling of Chakra UI components
const components = {
  Button: {
    variants: {
      solid: (props) => ({
        bg: mode('violet.600', 'violet.500')(props),
        color: mode('white', 'gray.800')(props),
        _hover: {
          bg: mode('violet.600', 'violet.600')(props),
        },
      }),
    },
  },
  Input: {
    baseStyle: (props) => ({
      field: {
        bg: mode('gray.200', 'gray.700')(props),
        borderColor: mode('gray.300', 'gray.600')(props),
        _hover: {
          borderColor: mode('gray.400', 'gray.500')(props),
        },
        _focus: {
          borderColor: mode('violet.500', 'violet.300')(props),
          boxShadow: `0 0 0 1px ${mode('#8b5cf6', '#7c3aed')(props)}`,
        },
      },
    }),
  },
  Heading: {
    baseStyle: (props) => ({
      color: mode('gray.800', 'whiteAlpha.900')(props),
    }),
  },
  Box: {
    baseStyle: (props) => ({
      bg: mode('violet.100', 'gray.700')(props),
      borderColor: mode('gray.300', 'gray.600')(props),
    }),
  },
  Accordion: {
    baseStyle: (props) => ({
      container: {
        bg: mode('violet.50', 'gray.700')(props),
        borderColor: mode('gray.200', 'gray.600')(props),
      },
      button: {
        color: mode('gray.800', 'whiteAlpha.900')(props),
        _hover: {
          bg: mode('violet.100', 'gray.600')(props),
        },
      },
      panel: {
        bg: mode('violet.200', 'gray.800')(props),
      },
    }),
  },
  // You can add more components here based on what you use in your project.
};

const theme = extendTheme({ config, styles, colors, components });
export default theme;
