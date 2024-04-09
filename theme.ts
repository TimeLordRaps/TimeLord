import { extendTheme, ThemeConfig } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';

// Color mode configuration
const config: ThemeConfig = {
  useSystemColorMode: true,
};

const styles = {
  global: (props) => ({
    body: {
      bg: mode('violet.50', 'gray.800')(props),
      color: mode('gray.800', 'whiteAlpha.900')(props),
    },
  }),
};

// Violet color scheme
const colors = {
  violet: {
    50: '#ede9fe', // very light violet
    100: '#ddd6fe', // light violet for backgrounds
    200: '#c4b5fd',
    300: '#a78bfa',
    400: '#8b5cf6', // medium violet for buttons and accents
    500: '#7c3aed', // base violet color
    600: '#6d28d9', // darker violet for hover states
    700: '#5b21b6',
    800: '#4c1d95',
    900: '#3c1e70', // very dark violet for text and such
  },
};

// Here we override the default styling of Chakra UI components
const components = {
  Button: {
    variants: {
      solid: (props) => ({
        bg: mode('violet.400', 'violet.500')(props),
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
        bg: mode('white', 'gray.700')(props),
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
        bg: mode('white', 'gray.800')(props),
      },
    }),
  },
  // You can add more components here based on what you use in your project.
};

const theme = extendTheme({ config, styles, colors, components });
export default theme;
