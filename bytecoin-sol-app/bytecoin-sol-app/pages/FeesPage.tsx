import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  Container, 
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  SimpleGrid,
  useColorModeValue,
  Flex,
  Divider,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Spinner,
  Center
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useToken } from '../contexts/TokenContext';
import { useTokenAdmin } from '../hooks/useAdminHooks';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement);

const FeesPage: React.FC = () => {
  const { connected } = useWallet();
  const { sByteToken } = useToken();
  const { getWithheldFees } = useTokenAdmin();
  const [isLoading, setIsLoading] = useState(true);
  const [feesData, setFeesData] = useState({
    totalFees: 0,
    totalFeesUSD: 0,
    weeklyFees: [] as {date: string, amount: number}[],
    recentTransactions: [] as {
      id: string;
      sender: string;
      recipient: string;
      amount: number;
      fee: number;
      timestamp: string;
    }[]
  });
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Fetch fees data
  useEffect(() => {
    const fetchFeesData = async () => {
      setIsLoading(true);
      
      try {
        // In a real implementation, this would fetch actual data from Solana
        // For now, we'll use the mock data but add a small delay to simulate network request
        
        // If we have a token mint address, we could try to get real withheld fees
        let totalFees = 15000; // Default mock value
        
        if (sByteToken.mint) {
          try {
            // This would get real withheld fees in a production environment
            // const realFees = await getWithheldFees(sByteToken.mint, []);
            // if (realFees > 0) {
            //   totalFees = realFees;
            // }
          } catch (error) {
            console.error("Error fetching withheld fees:", error);
          }
        }
        
        // Calculate USD value (assuming 1 S-BYTE = $0.05)
        const totalFeesUSD = totalFees * 0.05;
        
        // Generate weekly data based on total fees
        const weeklyFees = [
          { date: 'Apr 9', amount: Math.round(totalFees * 0.08) },
          { date: 'Apr 10', amount: Math.round(totalFees * 0.1) },
          { date: 'Apr 11', amount: Math.round(totalFees * 0.12) },
          { date: 'Apr 12', amount: Math.round(totalFees * 0.15) },
          { date: 'Apr 13', amount: Math.round(totalFees * 0.17) },
          { date: 'Apr 14', amount: Math.round(totalFees * 0.19) },
          { date: 'Apr 15', amount: Math.round(totalFees * 0.2) }
        ];
        
        setFeesData({
          totalFees,
          totalFeesUSD,
          weeklyFees,
          recentTransactions: [
            {
              id: 'tx1',
              sender: '8Kv5...3Ghj',
              recipient: '9Lm2...7Pqr',
              amount: 1000,
              fee: 30,
              timestamp: '2025-04-15 18:23:45'
            },
            {
              id: 'tx2',
              sender: '3Fk7...2Wxy',
              recipient: '5Rt6...1Abc',
              amount: 500,
              fee: 15,
              timestamp: '2025-04-15 17:45:12'
            },
            {
              id: 'tx3',
              sender: '7Gh8...4Def',
              recipient: '2Jk9...6Ghi',
              amount: 2000,
              fee: 60,
              timestamp: '2025-04-15 16:30:08'
            },
            {
              id: 'tx4',
              sender: '1Mn0...5Jkl',
              recipient: '6Op7...8Mno',
              amount: 750,
              fee: 22.5,
              timestamp: '2025-04-15 15:12:33'
            },
            {
              id: 'tx5',
              sender: '4Qr5...9Pqr',
              recipient: '0St1...2Tuv',
              amount: 1500,
              fee: 45,
              timestamp: '2025-04-15 14:05:21'
            }
          ]
        });
      } catch (error) {
        console.error("Error fetching fees data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFeesData();
  }, [sByteToken.mint]);

  // Prepare chart data for fee allocation
  const feeAllocationData = {
    labels: ['Development', 'Marketing', 'Operations', 'Reserve'],
    datasets: [
      {
        data: [60, 15, 15, 10], // Percentages
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare chart data for weekly fees
  const weeklyFeesData = {
    labels: feesData.weeklyFees.map(item => item.date),
    datasets: [
      {
        label: 'S-BYTE Fees Collected',
        data: feesData.weeklyFees.map(item => item.amount),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Center p={8}>
          <VStack spacing={4}>
            <Spinner size="xl" color="brand.500" />
            <Text>Loading fees data...</Text>
          </VStack>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={6}>Fees Raised</Heading>
      
      {/* Total Fees Raised */}
      <Box 
        p={6} 
        borderRadius="md" 
        bg="brand.50" 
        borderWidth="1px" 
        borderColor="brand.100"
        mb={8}
        textAlign="center"
      >
        <Heading as="h2" size="lg" mb={4}>Total Fees Raised</Heading>
        <Heading as="h3" size="2xl" color="brand.600" mb={2}>
          {feesData.totalFees.toLocaleString()} S-BYTE
        </Heading>
        <Text fontSize="xl" mb={4}>
          (${feesData.totalFeesUSD.toLocaleString()} USD)
        </Text>
        <Text>
          These fees help fund the creation of the ByteCoin blockchain, a new network where your S-BYTE will become even more valuable!
        </Text>
      </Box>
      
      {/* Fee Allocation and Weekly Fees */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} mb={8}>
        <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <Heading as="h3" size="md" mb={4}>Fee Allocation</Heading>
          <Box height="300px" display="flex" justifyContent="center">
            <Box width="80%" maxWidth="300px">
              <Doughnut 
                data={feeAllocationData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }} 
              />
            </Box>
          </Box>
          <VStack mt={4} spacing={2} align="stretch">
            <Text>
              <Badge colorScheme="blue">60%</Badge> Development of ByteCoin blockchain
            </Text>
            <Text>
              <Badge colorScheme="pink">15%</Badge> Marketing and community growth
            </Text>
            <Text>
              <Badge colorScheme="yellow">15%</Badge> Operations and infrastructure
            </Text>
            <Text>
              <Badge colorScheme="teal">10%</Badge> Reserve fund
            </Text>
          </VStack>
        </Box>
        
        <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <Heading as="h3" size="md" mb={4}>Weekly Fees Collected</Heading>
          <Box height="300px">
            <Bar 
              data={weeklyFeesData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'S-BYTE'
                    }
                  }
                }
              }} 
            />
          </Box>
        </Box>
      </SimpleGrid>
      
      {/* Development Progress */}
      <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor} mb={8}>
        <Heading as="h3" size="md" mb={4}>ByteCoin Blockchain Development Progress</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={4}>
          <Box>
            <Text mb={2}>Core Protocol</Text>
            <Progress value={75} colorScheme="blue" borderRadius="md" size="md" mb={1} />
            <Text fontSize="sm" textAlign="right">75% Complete</Text>
          </Box>
          <Box>
            <Text mb={2}>Wallet Development</Text>
            <Progress value={60} colorScheme="blue" borderRadius="md" size="md" mb={1} />
            <Text fontSize="sm" textAlign="right">60% Complete</Text>
          </Box>
          <Box>
            <Text mb={2}>Token Swap Mechanism</Text>
            <Progress value={40} colorScheme="blue" borderRadius="md" size="md" mb={1} />
            <Text fontSize="sm" textAlign="right">40% Complete</Text>
          </Box>
        </SimpleGrid>
        <Text>
          Your contributions through fees are directly funding the development of the ByteCoin blockchain. 
          We're making steady progress and will keep the community updated on major milestones.
        </Text>
      </Box>
      
      {/* Recent Fee Transactions */}
      <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <Heading as="h3" size="md" mb={4}>Recent Fee Transactions</Heading>
        <TableContainer>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Transaction ID</Th>
                <Th>Sender</Th>
                <Th>Recipient</Th>
                <Th isNumeric>Amount</Th>
                <Th isNumeric>Fee (3%)</Th>
                <Th>Timestamp</Th>
              </Tr>
            </Thead>
            <Tbody>
              {feesData.recentTransactions.map(tx => (
                <Tr key={tx.id}>
                  <Td>{tx.id}</Td>
                  <Td>{tx.sender}</Td>
                  <Td>{tx.recipient}</Td>
                  <Td isNumeric>{tx.amount} S-BYTE</Td>
                  <Td isNumeric>{tx.fee} S-BYTE</Td>
                  <Td>{tx.timestamp}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
};

export default FeesPage;
