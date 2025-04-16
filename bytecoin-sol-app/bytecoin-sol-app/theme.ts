/* Custom theme for ByteCoin on Sol App */

import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#f0f8ff',
      100: '#d0e6ff',
      200: '#a8d1ff',
      300: '#7ab9ff',
      400: '#4c9fff',
      500: '#1e85ff', // Primary brand color
      600: '#0066e6',
      700: '#0052b8',
      800: '#003d8a',
      900: '#00295c',
    },
    accent: {
      50: '#fff8e6',
      100: '#ffedb8',
      200: '#ffe28a',
      300: '#ffd75c',
      400: '#ffcc2e',
      500: '#ffc000', // Secondary accent color
      600: '#e6ac00',
      700: '#b38600',
      800: '#806100',
      900: '#4d3a00',
    },
    dark: {
      50: '#f2f2f2',
      100: '#d9d9d9',
      200: '#bfbfbf',
      300: '#a6a6a6',
      400: '#8c8c8c',
      500: '#737373',
      600: '#595959',
      700: '#404040',
      800: '#262626',
      900: '#0d0d0d',
    },
    gradient: {
      primary: 'linear-gradient(135deg, #1e85ff 0%, #0052b8 100%)',
      secondary: 'linear-gradient(135deg, #ffc000 0%, #e6ac00 100%)',
      dark: 'linear-gradient(135deg, #262626 0%, #0d0d0d 100%)',
    },
  },
  fonts: {
    heading: "'Montserrat', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'Roboto Mono', monospace",
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  fontWeights: {
    hairline: 100,
    thin: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },
  lineHeights: {
    normal: 'normal',
    none: 1,
    shorter: 1.25,
    short: 1.375,
    base: 1.5,
    tall: 1.625,
    taller: '2',
    '3': '.75rem',
    '4': '1rem',
    '5': '1.25rem',
    '6': '1.5rem',
    '7': '1.75rem',
    '8': '2rem',
    '9': '2.25rem',
    '10': '2.5rem',
  },
  letterSpacings: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
  space: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },
  sizes: {
    max: 'max-content',
    min: 'min-content',
    full: '100%',
    '3xs': '14rem',
    '2xs': '16rem',
    xs: '20rem',
    sm: '24rem',
    md: '28rem',
    lg: '32rem',
    xl: '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    '5xl': '64rem',
    '6xl': '72rem',
    '7xl': '80rem',
    '8xl': '90rem',
    container: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
  radii: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    outline: '0 0 0 3px rgba(30, 133, 255, 0.6)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none',
    'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    'premium-card': '0 8px 30px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)',
    'premium-button': '0 4px 14px rgba(30, 133, 255, 0.4)',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'lg',
        _focus: {
          boxShadow: 'outline',
        },
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
            _disabled: {
              bg: 'brand.500',
            },
          },
          _active: {
            bg: 'brand.700',
          },
        },
        outline: {
          border: '2px solid',
          borderColor: 'brand.500',
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
          },
          _active: {
            bg: 'brand.100',
          },
        },
        ghost: {
          color: 'brand.500',
          _hover: {
            bg: 'brand.50',
          },
          _active: {
            bg: 'brand.100',
          },
        },
        premium: {
          bg: 'gradient.primary',
          color: 'white',
          boxShadow: 'premium-button',
          _hover: {
            opacity: 0.9,
            _disabled: {
              opacity: 0.6,
            },
          },
          _active: {
            opacity: 0.8,
          },
        },
        accent: {
          bg: 'accent.500',
          color: 'dark.900',
          _hover: {
            bg: 'accent.600',
            _disabled: {
              bg: 'accent.500',
            },
          },
          _active: {
            bg: 'accent.700',
          },
        },
      },
      defaultProps: {
        variant: 'solid',
        size: 'md',
        colorScheme: 'brand',
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'xl',
          boxShadow: 'premium-card',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          _hover: {
            transform: 'translateY(-4px)',
            boxShadow: '2xl',
          },
        },
        header: {
          py: 4,
          px: 6,
        },
        body: {
          py: 4,
          px: 6,
        },
        footer: {
          py: 4,
          px: 6,
        },
      },
      variants: {
        elevated: {
          container: {
            bg: 'white',
            boxShadow: 'premium-card',
          },
        },
        outline: {
          container: {
            borderWidth: '1px',
            borderColor: 'gray.200',
          },
        },
        filled: {
          container: {
            bg: 'gray.50',
          },
        },
        premium: {
          container: {
            bg: 'white',
            boxShadow: 'premium-card',
            borderWidth: '1px',
            borderColor: 'brand.100',
          },
        },
      },
      defaultProps: {
        variant: 'elevated',
      },
    },
    Heading: {
      baseStyle: {
        fontFamily: 'heading',
        fontWeight: 'bold',
        lineHeight: 'shorter',
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'md',
          _focus: {
            boxShadow: 'outline',
            borderColor: 'brand.500',
          },
        },
      },
      variants: {
        outline: {
          field: {
            borderWidth: '2px',
            borderColor: 'gray.200',
            _hover: {
              borderColor: 'gray.300',
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: 'outline',
            },
          },
        },
        premium: {
          field: {
            borderWidth: '2px',
            borderColor: 'gray.200',
            borderRadius: 'lg',
            bg: 'white',
            _hover: {
              borderColor: 'brand.200',
            },
            _focus: {
              borderColor: 'brand.500',
              boxShadow: 'outline',
            },
          },
        },
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    Tabs: {
      variants: {
        premium: {
          tab: {
            fontWeight: 'semibold',
            color: 'gray.600',
            _selected: {
              color: 'brand.500',
              borderColor: 'brand.500',
              borderBottomWidth: '3px',
            },
            _hover: {
              color: 'brand.400',
            },
          },
          tablist: {
            borderBottomWidth: '1px',
            borderColor: 'gray.200',
          },
        },
      },
    },
    Table: {
      variants: {
        premium: {
          th: {
            bg: 'gray.50',
            fontWeight: 'semibold',
            textTransform: 'uppercase',
            letterSpacing: 'wider',
            fontSize: 'xs',
            color: 'gray.600',
            borderBottomWidth: '1px',
            borderColor: 'gray.200',
          },
          td: {
            borderBottomWidth: '1px',
            borderColor: 'gray.100',
          },
          tr: {
            _hover: {
              bg: 'gray.50',
            },
          },
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.800',
      },
      // Add custom scrollbar styling
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        bg: 'gray.100',
      },
      '::-webkit-scrollbar-thumb': {
        bg: 'gray.400',
        borderRadius: 'full',
      },
      '::-webkit-scrollbar-thumb:hover': {
        bg: 'gray.500',
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default theme;
