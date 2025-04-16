import React from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  Container, 
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Spinner,
  Center,
  useColorModeValue,
  Flex,
  Divider
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';
import { useToken } from '../contexts/TokenContext';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const PortfolioPage: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { 
    sByteToken, 
    sByteBalance, 
    solBalance, 
    isLoadingBalances,
    transactions
  } = useToken();
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Define other tokens (in a real app, this would come from the wallet)
  const otherTokens = [
    { name: 'USDC', amount: 500, value: 500 },
    { name: 'RAY', amount: 100, value: 150 }
  ];

  // S-BYTE price in USD (in a real app, this would come from an API)
  const sBytePrice = 0.05;
  const solPrice = 100;

  // Prepare chart data
  const pieChartData = {
    labels: ['S-BYTE', 'SOL', ...otherTokens.map(token => token.name)],
    datasets: [
      {
        data: [
          (sByteBalance || 0) * sBytePrice,
          (solBalance || 0) * solPrice,
          ...otherTokens.map(token => token.value)
        ],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Historical price data for S-BYTE
  const lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'S-BYTE Price (USD)',
        data: [0.02, 0.025, 0.03, 0.04, 0.045, 0.05],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
      },
    ],
  };

  if (!connected) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center p={8} borderRadius="lg" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <VStack spacing={4}>
            <Heading size="md">Connect Your Wallet</Heading>
            <Text>Please connect your Solana wallet to view your portfolio.</Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  if (isLoadingBalances) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center p={8}>
          <VStack spacing={4}>
            <Spinner size="xl" color="brand.500" />
            <Text>Loading your portfolio...</Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={6}>Your Portfolio</Heading>
      
      {/* Portfolio Summary */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Stat p={4} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <StatLabel>S-BYTE Balance</StatLabel>
          <StatNumber>{(sByteBalance || 0).toLocaleString()}</StatNumber>
          <StatHelpText>${((sByteBalance || 0) * sBytePrice).toLocaleString()}</StatHelpText>
        </Stat>
        
        <Stat p={4} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <StatLabel>SOL Balance</StatLabel>
          <StatNumber>{(solBalance || 0).toLocaleString()}</StatNumber>
          <StatHelpText>${((solBalance || 0) * solPrice).toLocaleString()}</StatHelpText>
        </Stat>
        
        <Stat p={4} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <StatLabel>Total Portfolio Value</StatLabel>
          <StatNumber>
            ${(
              (sByteBalance || 0) * sBytePrice + 
              (solBalance || 0) * solPrice + 
              otherTokens.reduce((acc, token) => acc + token.value, 0)
            ).toLocaleString()}
          </StatNumber>
          <StatHelpText>Across all tokens</StatHelpText>
        </Stat>
      </SimpleGrid>
      
      {/* Charts */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={8}>
        <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <Heading as="h3" size="md" mb={4}>Asset Distribution</Heading>
          <Box height="300px">
            <Pie data={pieChartData} options={{ maintainAspectRatio: false }} />
          </Box>
        </Box>
        
        <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <Heading as="h3" size="md" mb={4}>S-BYTE Price History</Heading>
          <Box height="300px">
            <Line 
              data={lineChartData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value;
                      }
                    }
                  }
                }
              }} 
            />
          </Box>
        </Box>
      </SimpleGrid>
      
      {/* Recent Transactions */}
      <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor} mb={8}>
        <Heading as="h3" size="md" mb={4}>Recent Transactions</Heading>
        {transactions.length > 0 ? (
          <VStack spacing={4} align="stretch">
            {transactions.map((tx, index) => (
              <React.Fragment key={tx.signature}>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="medium">{tx.type === 'send' ? 'Sent' : 'Received'}</Text>
                    <Text color="gray.500" fontSize="sm">
                      {new Date(tx.blockTime * 1000).toLocaleString()}
                    </Text>
                  </Box>
                  <Box textAlign="right">
                    <Text fontWeight={tx.type === 'receive' ? 'bold' : 'normal'} color={tx.type === 'receive' ? 'green.500' : 'inherit'}>
                      {tx.type === 'receive' ? '+' : '-'}{tx.amount.toLocaleString()} S-BYTE
                    </Text>
                    {tx.type === 'send' && (
                      <Text color="gray.500" fontSize="sm">Fee: {tx.fee} S-BYTE</Text>
                    )}
                  </Box>
                </Flex>
                {index < transactions.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </VStack>
        ) : (
          <Text>No recent transactions found.</Text>
        )}
      </Box>
      
      {/* Other Tokens */}
      <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <Heading as="h3" size="md" mb={4}>Other Tokens</Heading>
        {otherTokens.length > 0 ? (
          <VStack spacing={4} align="stretch">
            {otherTokens.map((token, index) => (
              <React.Fragment key={token.name}>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="medium">{token.name}</Text>
                  <Box>
                    <Text>{token.amount.toLocaleString()} tokens</Text>
                    <Text color="gray.500">${token.value.toLocaleString()}</Text>
                  </Box>
                </Flex>
                {index < otherTokens.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </VStack>
        ) : (
          <Text>No other tokens found in your wallet.</Text>
        )}
      </Box>
    </Container>
  );
};

export default PortfolioPage;
