import React from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  Container, 
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Flex,
  SimpleGrid,
  Icon
} from '@chakra-ui/react';
import { ArrowForwardIcon, InfoIcon } from '@chakra-ui/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToken } from '../contexts/TokenContext';

const SwapPage: React.FC = () => {
  const { connected } = useWallet();
  const { sByteBalance } = useToken();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={6}>Swap to ByteCoin</Heading>
      
      <Alert 
        status="info" 
        variant="subtle" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        textAlign="center" 
        borderRadius="lg"
        p={6}
        mb={8}
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Coming Soon
        </AlertTitle>
        <AlertDescription maxWidth="lg">
          Hold S-BYTE now and swap it for ByteCoin (N-BYTE) when our new blockchain launches! 
          Early adopters may receive bonus tokens during the transition.
        </AlertDescription>
      </Alert>
      
      {connected && sByteBalance !== null && (
        <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor} mb={8}>
          <Heading as="h3" size="md" mb={4}>Your S-BYTE Balance</Heading>
          <Text fontSize="2xl" fontWeight="bold">{sByteBalance.toLocaleString()} S-BYTE</Text>
          <Text color="gray.500">Available for future swap to ByteCoin</Text>
        </Box>
      )}
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={8}>
        <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <Heading as="h3" size="md" mb={4}>
            What is ByteCoin?
          </Heading>
          <Text mb={4}>
            ByteCoin (N-BYTE) is a new standalone blockchain where 1 ByteCoin is designed to be 8x the value of a bit, 
            reflecting the fact that 1 byte equals 8 bits in computing.
          </Text>
          <Text mb={4}>
            This positions ByteCoin as a higher-value cryptocurrency compared to bit-based coins like Bitcoin.
          </Text>
          <Text fontWeight="bold">
            1 Byte = 8 Bits, so ByteCoin = 8x the value!
          </Text>
        </Box>
        
        <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <Heading as="h3" size="md" mb={4}>
            Swap Details
          </Heading>
          <VStack spacing={4} align="stretch">
            <Flex>
              <Icon as={InfoIcon} mr={2} color="brand.500" />
              <Text>
                <strong>Swap Ratio:</strong> Users who hold S-BYTE will be able to swap it for N-BYTE at a 1:1 ratio.
              </Text>
            </Flex>
            <Flex>
              <Icon as={InfoIcon} mr={2} color="brand.500" />
              <Text>
                <strong>Early Adopter Bonus:</strong> Early adopters may receive bonus tokens during the transition.
              </Text>
            </Flex>
            <Flex>
              <Icon as={InfoIcon} mr={2} color="brand.500" />
              <Text>
                <strong>Timeline:</strong> The ByteCoin blockchain is currently in development. Stay tuned for announcements!
              </Text>
            </Flex>
          </VStack>
        </Box>
      </SimpleGrid>
      
      <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor} mb={8}>
        <Heading as="h3" size="md" mb={4}>
          Why Hold S-BYTE Now?
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
          <Box p={4} borderRadius="md" bg="gray.50" borderWidth="1px" borderColor="gray.200">
            <Heading as="h4" size="sm" mb={2}>
              Early Adoption Benefits
            </Heading>
            <Text>
              Early adopters of S-BYTE may receive bonus tokens when swapping to N-BYTE once the ByteCoin blockchain launches.
            </Text>
          </Box>
          <Box p={4} borderRadius="md" bg="gray.50" borderWidth="1px" borderColor="gray.200">
            <Heading as="h4" size="sm" mb={2}>
              Supporting Development
            </Heading>
            <Text>
              The 3% fee on S-BYTE transfers helps fund the development of the ByteCoin blockchain, creating value for all token holders.
            </Text>
          </Box>
          <Box p={4} borderRadius="md" bg="gray.50" borderWidth="1px" borderColor="gray.200">
            <Heading as="h4" size="sm" mb={2}>
              Future Ecosystem Access
            </Heading>
            <Text>
              Holding S-BYTE now gives you early access to the ByteCoin ecosystem, including games and other applications.
            </Text>
          </Box>
        </SimpleGrid>
      </Box>
      
      <Box 
        p={6} 
        borderRadius="md" 
        bg="brand.50" 
        borderWidth="1px" 
        borderColor="brand.100"
        textAlign="center"
      >
        <Heading as="h3" size="md" mb={4}>
          Get Notified When Swap is Available
        </Heading>
        <Text mb={6}>
          Want to be among the first to know when the ByteCoin blockchain launches and the swap becomes available?
        </Text>
        <Button 
          colorScheme="brand" 
          size="lg"
          isDisabled={!connected}
          rightIcon={<ArrowForwardIcon />}
        >
          {connected ? "Coming Soon: Sign Up for Updates" : "Connect Wallet to Sign Up"}
        </Button>
      </Box>
    </Container>
  );
};

export default SwapPage;
