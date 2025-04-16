import React from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  Container, 
  Image, 
  SimpleGrid,
  Button,
  useColorModeValue,
  Flex,
  Icon,
  Divider
} from '@chakra-ui/react';
import { ArrowForwardIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

const HomePage: React.FC = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Container maxW="container.xl" py={8}>
      {/* Hero Section */}
      <Box 
        borderRadius="lg" 
        bg={useColorModeValue('brand.50', 'brand.900')} 
        p={8} 
        mb={10}
        textAlign="center"
      >
        <Heading as="h1" size="2xl" mb={4}>
          Welcome to ByteCoin on Sol!
        </Heading>
        <Text fontSize="xl" mb={6}>
          A byte is 8 bits, so ByteCoin is 8x the value—join the future of crypto!
        </Text>
        <Button 
          as={RouterLink} 
          to="/portfolio" 
          size="lg" 
          colorScheme="brand" 
          rightIcon={<ArrowForwardIcon />}
        >
          View Your Portfolio
        </Button>
      </Box>

      {/* Features Section */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8} mb={12}>
        <FeatureCard 
          title="Manage Your S-BYTE" 
          description="Connect your Solana wallet to view, send, and receive ByteCoin on Sol (S-BYTE) tokens."
          linkTo="/portfolio"
          linkText="View Portfolio"
        />
        <FeatureCard 
          title="Future ByteCoin Swap" 
          description="Hold S-BYTE now and swap it for ByteCoin (N-BYTE) when our new blockchain launches!"
          linkTo="/swap"
          linkText="Learn More"
        />
        <FeatureCard 
          title="Play & Earn" 
          description="Challenge other players to draughts games and wager your S-BYTE tokens."
          linkTo="/games"
          linkText="Play Games"
        />
      </SimpleGrid>

      {/* Value Proposition */}
      <Box mb={12}>
        <Heading as="h2" size="lg" mb={6} textAlign="center">
          Why ByteCoin?
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <Box 
            p={6} 
            borderRadius="md" 
            bg={cardBg} 
            borderWidth="1px" 
            borderColor={borderColor}
          >
            <Heading as="h3" size="md" mb={4}>
              8x the Value of a Bit
            </Heading>
            <Text>
              Just as 1 byte equals 8 bits in computing, ByteCoin (N-BYTE) is designed to be 8x the value of a bit. 
              This positions ByteCoin as a higher-value cryptocurrency compared to bit-based coins like Bitcoin.
            </Text>
          </Box>
          <Box 
            p={6} 
            borderRadius="md" 
            bg={cardBg} 
            borderWidth="1px" 
            borderColor={borderColor}
          >
            <Heading as="h3" size="md" mb={4}>
              Seamless Transition
            </Heading>
            <Text>
              Start with S-BYTE on Solana now, then easily swap to N-BYTE when the ByteCoin blockchain launches. 
              Early adopters may receive bonus tokens during the transition.
            </Text>
          </Box>
        </SimpleGrid>
      </Box>

      {/* Fee Transparency */}
      <Box 
        p={6} 
        borderRadius="md" 
        bg={cardBg} 
        borderWidth="1px" 
        borderColor={borderColor}
        mb={12}
      >
        <Heading as="h3" size="md" mb={4}>
          Fee Transparency
        </Heading>
        <Text mb={4}>
          A 3% fee is collected on S-BYTE transfers to raise capital for developing the new ByteCoin blockchain, 
          where 1 ByteCoin will be 8x the value of a bit.
        </Text>
        <Button 
          as={RouterLink} 
          to="/fees" 
          variant="outline" 
          colorScheme="brand" 
          size="sm"
        >
          View Fees Raised
        </Button>
      </Box>

      {/* FAQ Section */}
      <Box mb={8}>
        <Heading as="h2" size="lg" mb={6} textAlign="center">
          Frequently Asked Questions
        </Heading>
        <VStack spacing={4} align="stretch">
          <FAQItem 
            question="Why is there a 3% fee?" 
            answer="To fund the development of the ByteCoin blockchain, which will provide greater value and utility to all token holders."
          />
          <FAQItem 
            question="When can I swap S-BYTE for N-BYTE?" 
            answer="Soon—stay tuned! We're working hard on developing the ByteCoin blockchain. Early adopters of S-BYTE may receive bonus tokens during the transition."
          />
          <FAQItem 
            question="What is the value proposition of ByteCoin?" 
            answer="Just as 1 byte equals 8 bits in computing, ByteCoin (N-BYTE) is designed to be 8x the value of a bit, positioning it as a higher-value cryptocurrency compared to bit-based coins."
          />
        </VStack>
      </Box>
    </Container>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  linkTo: string;
  linkText: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, linkTo, linkText }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Box 
      p={6} 
      borderRadius="md" 
      bg={cardBg} 
      borderWidth="1px" 
      borderColor={borderColor}
      height="100%"
      display="flex"
      flexDirection="column"
    >
      <Heading as="h3" size="md" mb={4}>
        {title}
      </Heading>
      <Text flex="1" mb={4}>
        {description}
      </Text>
      <Button 
        as={RouterLink} 
        to={linkTo} 
        colorScheme="brand" 
        variant="outline" 
        size="sm" 
        alignSelf="flex-start"
        rightIcon={<ArrowForwardIcon />}
      >
        {linkText}
      </Button>
    </Box>
  );
};

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Box 
      p={5} 
      borderRadius="md" 
      bg={cardBg} 
      borderWidth="1px" 
      borderColor={borderColor}
    >
      <Heading as="h4" size="sm" mb={2}>
        {question}
      </Heading>
      <Text>
        {answer}
      </Text>
    </Box>
  );
};

export default HomePage;
