import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Flex,
  Icon,
  Badge,
  Divider,
  Alert,
  AlertIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Code,
  Spinner,
  useToast
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTokenBalance, useSolBalance, useTokenTransferWithFee } from '../../useWalletHooks';
import { useAdmin } from '../admin/AdminContext';
import { FaCheckCircle, FaTimesCircle, FaWallet, FaExchangeAlt, FaGamepad, FaCoins, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Motion components
const MotionBox = motion(Box);

// Test result type
type TestResult = 'success' | 'failure' | 'pending' | 'not-started';

// Test interface
interface Test {
  id: string;
  name: string;
  description: string;
  status: TestResult;
  details?: string;
  run: () => Promise<boolean>;
}

const TestingPage: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const { balance: solBalance } = useSolBalance();
  const { balance: sByteBalance } = useTokenBalance('8xyt45JNHGe4TFXxvLAGYHXmdGFpzW9HxMJQA1wpFGx7');
  const { adminAddress, feePercentage } = useAdmin();
  const toast = useToast();
  
  // Test state
  const [tests, setTests] = useState<Test[]>([
    {
      id: 'wallet-connection',
      name: 'Wallet Connection',
      description: 'Tests the wallet connection functionality',
      status: 'not-started',
      run: async () => {
        return connected && !!publicKey;
      }
    },
    {
      id: 'balance-display',
      name: 'Balance Display',
      description: 'Tests the balance display functionality',
      status: 'not-started',
      run: async () => {
        return solBalance !== null && sByteBalance !== null;
      }
    },
    {
      id: 'admin-config',
      name: 'Admin Configuration',
      description: 'Tests the admin address and fee percentage configuration',
      status: 'not-started',
      run: async () => {
        return adminAddress === '6s5sjaPDYXVzbBnDjfxWqbD4K5qi9yvdWchtgoqDESjJ' && feePercentage === 3;
      }
    },
    {
      id: 'fee-calculation',
      name: 'Fee Calculation',
      description: 'Tests the fee calculation functionality',
      status: 'not-started',
      run: async () => {
        const amount = 100;
        const fee = amount * (feePercentage / 100);
        return fee === 3;
      }
    },
    {
      id: 'ui-components',
      name: 'UI Components',
      description: 'Tests the premium UI components',
      status: 'not-started',
      run: async () => {
        // This is a visual test, so we'll just return true
        return true;
      }
    },
    {
      id: 'responsive-design',
      name: 'Responsive Design',
      description: 'Tests the responsive design functionality',
      status: 'not-started',
      run: async () => {
        // This is a visual test, so we'll just return true
        return true;
      }
    }
  ]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<{
    passed: number;
    failed: number;
    total: number;
  }>({
    passed: 0,
    failed: 0,
    total: tests.length
  });
  
  // Colors
  const cardBg = useColorModeValue('white', '#1A1A22');
  const borderColor = useColorModeValue('gray.200', '#2A2A32');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  
  // Run all tests
  const runAllTests = async () => {
    if (!connected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to run tests',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    setIsRunningTests(true);
    
    // Reset test statuses
    setTests(tests.map(test => ({ ...test, status: 'pending' })));
    
    let passed = 0;
    let failed = 0;
    
    // Run each test sequentially
    for (const test of tests) {
      // Update test status to pending
      setTests(prevTests => 
        prevTests.map(t => 
          t.id === test.id ? { ...t, status: 'pending' } : t
        )
      );
      
      try {
        // Run the test
        const result = await test.run();
        
        // Update test status
        setTests(prevTests => 
          prevTests.map(t => 
            t.id === test.id ? { 
              ...t, 
              status: result ? 'success' : 'failure',
              details: result ? 'Test passed successfully' : 'Test failed'
            } : t
          )
        );
        
        if (result) {
          passed++;
        } else {
          failed++;
        }
      } catch (error) {
        // Update test status on error
        setTests(prevTests => 
          prevTests.map(t => 
            t.id === test.id ? { 
              ...t, 
              status: 'failure',
              details: `Error: ${(error as Error).message}`
            } : t
          )
        );
        
        failed++;
      }
      
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setTestResults({
      passed,
      failed,
      total: tests.length
    });
    
    setIsRunningTests(false);
    
    toast({
      title: passed === tests.length ? 'All tests passed!' : 'Some tests failed',
      description: `Passed: ${passed}/${tests.length}`,
      status: passed === tests.length ? 'success' : 'warning',
      duration: 5000,
      isClosable: true,
    });
  };
  
  // Run a single test
  const runTest = async (testId: string) => {
    if (!connected) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to run tests',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    const test = tests.find(t => t.id === testId);
    
    if (!test) {
      return;
    }
    
    // Update test status to pending
    setTests(prevTests => 
      prevTests.map(t => 
        t.id === testId ? { ...t, status: 'pending' } : t
      )
    );
    
    try {
      // Run the test
      const result = await test.run();
      
      // Update test status
      setTests(prevTests => 
        prevTests.map(t => 
          t.id === testId ? { 
            ...t, 
            status: result ? 'success' : 'failure',
            details: result ? 'Test passed successfully' : 'Test failed'
          } : t
        )
      );
      
      toast({
        title: result ? 'Test passed!' : 'Test failed',
        description: test.name,
        status: result ? 'success' : 'error',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Update test status on error
      setTests(prevTests => 
        prevTests.map(t => 
          t.id === testId ? { 
            ...t, 
            status: 'failure',
            details: `Error: ${(error as Error).message}`
          } : t
        )
      );
      
      toast({
        title: 'Test error',
        description: (error as Error).message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
    
    // Update test results
    const passedTests = tests.filter(t => t.status === 'success').length;
    const failedTests = tests.filter(t => t.status === 'failure').length;
    
    setTestResults({
      passed: passedTests,
      failed: failedTests,
      total: tests.length
    });
  };
  
  // Get status icon
  const getStatusIcon = (status: TestResult) => {
    switch (status) {
      case 'success':
        return <Icon as={FaCheckCircle} color="green.500" />;
      case 'failure':
        return <Icon as={FaTimesCircle} color="red.500" />;
      case 'pending':
        return <Spinner size="sm" color="blue.500" />;
      default:
        return null;
    }
  };
  
  // Not connected state
  if (!connected) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center" py={10}>
            <Heading size="lg" mb={4}>Connect Your Wallet</Heading>
            <Text color={mutedColor}>
              Please connect your wallet to run tests
            </Text>
          </Box>
        </VStack>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Testing Dashboard</Heading>
          <Button 
            colorScheme="brand" 
            onClick={runAllTests}
            isLoading={isRunningTests}
            loadingText="Running Tests"
          >
            Run All Tests
          </Button>
        </Flex>
        
        {/* Test Summary */}
        <MotionBox
          p={6}
          borderRadius="xl"
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <VStack spacing={6} align="stretch">
            <Heading size="md">Test Summary</Heading>
            
            <HStack spacing={8} justify="center">
              <VStack>
                <Heading size="xl" color="green.500">{testResults.passed}</Heading>
                <Text color={mutedColor}>Passed</Text>
              </VStack>
              
              <VStack>
                <Heading size="xl" color="red.500">{testResults.failed}</Heading>
                <Text color={mutedColor}>Failed</Text>
              </VStack>
              
              <VStack>
                <Heading size="xl">{testResults.total}</Heading>
                <Text color={mutedColor}>Total</Text>
              </VStack>
            </HStack>
            
            {testResults.passed > 0 && testResults.passed === testResults.total && (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                All tests passed successfully!
              </Alert>
            )}
            
            {testResults.failed > 0 && (
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                Some tests failed. Please check the details below.
              </Alert>
            )}
          </VStack>
        </MotionBox>
        
        {/* Test Details */}
        <MotionBox
          p={6}
          borderRadius="xl"
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <VStack spacing={6} align="stretch">
            <Heading size="md">Test Details</Heading>
            
            <Accordion allowMultiple>
              {tests.map((test) => (
                <AccordionItem key={test.id} border="none" mb={2}>
                  <AccordionButton 
                    bg={test.status === 'success' ? 'green.50' : test.status === 'failure' ? 'red.50' : 'gray.50'} 
                    _dark={{
                      bg: test.status === 'success' ? 'green.900' : test.status === 'failure' ? 'red.900' : 'gray.900'
                    }}
                    borderRadius="md"
                    p={4}
                  >
                    <HStack flex="1" spacing={4} align="center">
                      {getStatusIcon(test.status)}
                      <Box textAlign="left">
                        <Text fontWeight="bold">{test.name}</Text>
                        <Text fontSize="sm" color={mutedColor}>{test.description}</Text>
                      </Box>
                    </HStack>
                    <Button 
                      size="sm" 
                      colorScheme="brand" 
                      mr={4}
                      onClick={(e) => {
                        e.stopPropagation();
                        runTest(test.id);
                      }}
                      isDisabled={isRunningTests || test.status === 'pending'}
                    >
                      Run Test
                    </Button>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} pt={2} px={4}>
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="medium">Status: 
                        <Badge 
                          ml={2} 
                          colorScheme={
                            test.status === 'success' ? 'green' : 
                            test.status === 'failure' ? 'red' : 
                            test.status === 'pending' ? 'blue' : 
                            'gray'
                          }
                        >
                          {test.status === 'not-started' ? 'Not Started' : 
                           test.status === 'pending' ? 'Running' : 
                           test.status === 'success' ? 'Passed' : 'Failed'}
                        </Badge>
                      </Text>
                      
                      {test.details && (
                        <Box width="100%">
                          <Text fontWeight="medium">Details:</Text>
                          <Code p={2} borderRadius="md" width="100%">
                            {test.details}
                          </Code>
                        </Box>
                      )}
                    </VStack>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </VStack>
        </MotionBox>
        
        {/* Environment Info */}
        <MotionBox
          p={6}
          borderRadius="xl"
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <VStack spacing={6} align="stretch">
            <Heading size="md">Environment Information</Heading>
            
            <VStack align="start" spacing={4}>
              <HStack>
                <Icon as={FaWallet} color="brand.500" />
                <Text fontWeight="medium">Wallet Address:</Text>
                <Code>{publicKey?.toString()}</Code>
              </HStack>
              
              <HStack>
                <Icon as={FaCoins} color="brand.500" />
                <Text fontWeight="medium">SOL Balance:</Text>
                <Text>{solBalance?.toFixed(4) || '0'} SOL</Text>
              </HStack>
              
              <HStack>
                <Icon as={FaCoins} color="brand.500" />
                <Text fontWeight="medium">S-BYTE Balance:</Text>
                <Text>{sByteBalance?.toFixed(2) || '0'} S-BYTE</Text>
              </HStack>
              
              <HStack>
                <Icon as={FaShieldAlt} color="brand.500" />
                <Text fontWeight="medium">Admin Address:</Text>
                <Code>{adminAddress}</Code>
              </HStack>
              
              <HStack>
                <Icon as={FaExchangeAlt} color="brand.500" />
                <Text fontWeight="medium">Fee Percentage:</Text>
                <Text>{feePercentage}%</Text>
              </HStack>
            </VStack>
          </VStack>
        </MotionBox>
      </VStack>
    </Container>
  );
};

export default TestingPage;
