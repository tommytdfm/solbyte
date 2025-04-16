import React from 'react';
import { Box, Container, Flex, useColorModeValue } from '@chakra-ui/react';
import { RealWalletButton } from './RealWalletButton';

interface WalletHeaderProps {
  title?: string;
}

export const WalletHeader: React.FC<WalletHeaderProps> = ({ title = 'ByteCoin on Sol' }) => {
  // Colors
  const bgColor = useColorModeValue('white', '#1A1A22');
  const borderColor = useColorModeValue('gray.200', '#2A2A32');
  const textColor = useColorModeValue('gray.800', 'white');
  
  return (
    <Box
      as="header"
      position="sticky"
      top={0}
      zIndex={100}
      bg={bgColor}
      borderBottom="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      backdropFilter="blur(10px)"
    >
      <Container maxW="container.xl" py={3}>
        <Flex justify="space-between" align="center">
          <Box
            fontSize="xl"
            fontWeight="bold"
            fontFamily="Montserrat, sans-serif"
            bgGradient="linear(to-r, brand.500, accent.500)"
            bgClip="text"
          >
            {title}
          </Box>
          
          <RealWalletButton />
        </Flex>
      </Container>
    </Box>
  );
};

export default WalletHeader;
