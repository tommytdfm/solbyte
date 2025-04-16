import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  Container, 
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  Flex,
  Divider,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Code,
  Badge,
  Spinner,
  SimpleGrid
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useAdmin } from '../contexts/AdminContext';
import { useToken } from '../contexts/TokenContext';

const AdminPage: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { 
    isAdmin, 
    isAuthenticating, 
    authenticate, 
    withdrawFees, 
    isWithdrawingFees, 
    pendingFees,
    updateMintAddress,
    updateGameSettings,
    isUpdatingSettings
  } = useAdmin();
  const { sByteToken } = useToken();
  
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Form state
  const [mintAddressInput, setMintAddressInput] = useState(sByteToken.mint || '');
  const [minWager, setMinWager] = useState(5);
  const [maxWager, setMaxWager] = useState(1000);
  const [isAttemptingAuth, setIsAttemptingAuth] = useState(false);
  
  // Update mint address input when sByteToken changes
  useEffect(() => {
    if (sByteToken.mint) {
      setMintAddressInput(sByteToken.mint);
    }
  }, [sByteToken.mint]);
  
  // Handle authentication
  const handleAuthenticate = async () => {
    setIsAttemptingAuth(true);
    try {
      const success = await authenticate();
      if (!success) {
        toast({
          title: 'Authentication failed',
          description: 'Your wallet is not authorized to access the admin panel.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Authentication successful',
          description: 'You now have access to the admin panel.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast({
        title: 'Authentication error',
        description: 'An error occurred during authentication.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAttemptingAuth(false);
    }
  };
  
  // Handle save mint address
  const handleSaveMintAddress = async () => {
    if (!mintAddressInput) {
      toast({
        title: 'Invalid input',
        description: 'Please enter a valid S-BYTE mint address.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    const success = await updateMintAddress(mintAddressInput);
    if (success) {
      // Update was successful, handled by the context
      toast({
        title: 'Mint address updated',
        description: 'The S-BYTE mint address has been successfully updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle save game settings
  const handleSaveGameSettings = async () => {
    const success = await updateGameSettings(minWager, maxWager);
    if (success) {
      // Update was successful, handled by the context
      toast({
        title: 'Game settings updated',
        description: 'The game settings have been successfully updated.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle withdraw fees
  const handleWithdrawFees = async () => {
    const success = await withdrawFees();
    if (success) {
      // Withdrawal was successful, handled by the context
      toast({
        title: 'Fees withdrawn',
        description: 'The fees have been successfully withdrawn.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Mock fee data
  const feeData = {
    totalCollected: 15000,
    lastWithdrawal: {
      amount: 1200,
      timestamp: '2025-04-14 15:30:22',
      txId: '4Qr5...9Pqr'
    }
  };
  
  // Mock game statistics
  const gameStats = {
    totalGames: 128,
    totalWagered: 25600,
    feesGenerated: 768
  };
  
  if (!connected) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box p={8} borderRadius="lg" bg={cardBg} borderWidth="1px" borderColor={borderColor} textAlign="center">
          <Heading size="md" mb={4}>Connect Your Wallet</Heading>
          <Text>Please connect your Solana wallet to access the admin panel.</Text>
        </Box>
      </Container>
    );
  }
  
  if (isAuthenticating) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box p={8} borderRadius="lg" bg={cardBg} borderWidth="1px" borderColor={borderColor} textAlign="center">
          <VStack spacing={4}>
            <Spinner size="xl" color="brand.500" />
            <Heading size="md">Authenticating</Heading>
            <Text>Please wait while we verify your wallet...</Text>
          </VStack>
        </Box>
      </Container>
    );
  }
  
  if (!isAdmin) {
    return (
      <Container maxW="container.xl" py={8}>
        <Heading as="h1" size="xl" mb={6}>Admin Panel</Heading>
        
        <Box p={8} borderRadius="lg" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <VStack spacing={6} align="stretch">
            <Heading size="md">Authentication Required</Heading>
            <Text>
              This panel is restricted to authorized administrators only. Please authenticate your wallet to continue.
            </Text>
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Wallet Authentication</AlertTitle>
                <AlertDescription>
                  You will be asked to sign a message to verify your wallet ownership. Your wallet address will be checked against the list of authorized administrators.
                </AlertDescription>
              </Box>
            </Alert>
            <Text fontWeight="medium">Your wallet address:</Text>
            <Code p={2} borderRadius="md">
              {publicKey?.toString()}
            </Code>
            <Button 
              colorScheme="brand" 
              onClick={handleAuthenticate}
              isLoading={isAuthenticating || isAttemptingAuth}
              loadingText="Authenticating..."
            >
              Authenticate Wallet
            </Button>
          </VStack>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={6}>Admin Panel</Heading>
      
      <Tabs variant="enclosed" colorScheme="brand" mb={8}>
        <TabList>
          <Tab>Token Configuration</Tab>
          <Tab>Fee Management</Tab>
          <Tab>Game Settings</Tab>
        </TabList>
        
        <TabPanels>
          {/* Token Configuration Tab */}
          <TabPanel>
            <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <Heading as="h3" size="md" mb={6}>S-BYTE Token Configuration</Heading>
              
              <VStack spacing={6} align="stretch">
                <FormControl>
                  <FormLabel>S-BYTE Mint Address</FormLabel>
                  <Input 
                    placeholder="Enter the S-BYTE token mint address" 
                    value={mintAddressInput}
                    onChange={(e) => setMintAddressInput(e.target.value)}
                  />
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    This address will be used for all S-BYTE token operations in the app.
                  </Text>
                </FormControl>
                
                <Divider />
                
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">
                    Enable 3% Transfer Fee
                  </FormLabel>
                  <Switch colorScheme="brand" defaultChecked isDisabled />
                  <Text fontSize="sm" color="gray.500" ml={2}>
                    (Set during token creation)
                  </Text>
                </FormControl>
                
                <Alert status="warning" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Changing the mint address will affect all token operations. Make sure you enter the correct address.
                    </AlertDescription>
                  </Box>
                </Alert>
                
                <Button 
                  colorScheme="brand" 
                  onClick={handleSaveMintAddress}
                  isLoading={isUpdatingSettings}
                  loadingText="Saving..."
                >
                  Save Token Configuration
                </Button>
              </VStack>
            </Box>
          </TabPanel>
          
          {/* Fee Management Tab */}
          <TabPanel>
            <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <Heading as="h3" size="md" mb={6}>Fee Management</Heading>
              
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
                <Box p={4} borderRadius="md" bg="gray.50" borderWidth="1px" borderColor="gray.200">
                  <Heading as="h4" size="sm" mb={2}>Total Fees Collected</Heading>
                  <Text fontSize="2xl" fontWeight="bold">{feeData.totalCollected.toLocaleString()} S-BYTE</Text>
                </Box>
                
                <Box p={4} borderRadius="md" bg="gray.50" borderWidth="1px" borderColor="gray.200">
                  <Heading as="h4" size="sm" mb={2}>Pending Withdrawal</Heading>
                  <Text fontSize="2xl" fontWeight="bold">{pendingFees.toLocaleString()} S-BYTE</Text>
                </Box>
                
                <Box p={4} borderRadius="md" bg="gray.50" borderWidth="1px" borderColor="gray.200">
                  <Heading as="h4" size="sm" mb={2}>Last Withdrawal</Heading>
                  <Text fontSize="lg" fontWeight="bold">{feeData.lastWithdrawal.amount.toLocaleString()} S-BYTE</Text>
                  <Text fontSize="sm">{feeData.lastWithdrawal.timestamp}</Text>
                </Box>
              </SimpleGrid>
              
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading as="h4" size="sm" mb={4}>Withdraw Withheld Tokens</Heading>
                  <Text mb={4}>
                    This action will call the withdrawWithheldTokens instruction to aggregate fees from recipient accounts to the central fee account.
                  </Text>
                  <Button 
                    colorScheme="brand" 
                    onClick={handleWithdrawFees}
                    isLoading={isWithdrawingFees}
                    loadingText="Withdrawing..."
                    isDisabled={pendingFees === 0}
                  >
                    Withdraw {pendingFees.toLocaleString()} S-BYTE
                  </Button>
                </Box>
                
                <Divider />
                
                <Box>
                  <Heading as="h4" size="sm" mb={4}>Recent Fee Withdrawals</Heading>
                  <TableContainer>
                    <Table variant="simple" size="sm">
                      <Thead>
                        <Tr>
                          <Th>Transaction ID</Th>
                          <Th isNumeric>Amount</Th>
                          <Th>Timestamp</Th>
                          <Th>Status</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        <Tr>
                          <Td>{feeData.lastWithdrawal.txId}</Td>
                          <Td isNumeric>{feeData.lastWithdrawal.amount} S-BYTE</Td>
                          <Td>{feeData.lastWithdrawal.timestamp}</Td>
                          <Td><Badge colorScheme="green">Completed</Badge></Td>
                        </Tr>
                        <Tr>
                          <Td>2Jk9...6Ghi</Td>
                          <Td isNumeric>800 S-BYTE</Td>
                          <Td>2025-04-10 12:15:33</Td>
                          <Td><Badge colorScheme="green">Completed</Badge></Td>
                        </Tr>
                        <Tr>
                          <Td>7Gh8...4Def</Td>
                          <Td isNumeric>650 S-BYTE</Td>
                          <Td>2025-04-05 09:45:21</Td>
                          <Td><Badge colorScheme="green">Completed</Badge></Td>
                        </Tr>
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              </VStack>
            </Box>
          </TabPanel>
          
          {/* Game Settings Tab */}
          <TabPanel>
            <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <Heading as="h3" size="md" mb={6}>Game Settings</Heading>
              
              <VStack spacing={6} align="stretch">
                <Box>
                  <Heading as="h4" size="sm" mb={4}>Draughts Game Settings</Heading>
                  
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={6}>
                    <FormControl>
                      <FormLabel>Minimum Wager (S-BYTE)</FormLabel>
                      <NumberInput 
                        min={1} 
                        max={100} 
                        value={minWager}
                        onChange={(valueString) => setMinWager(Number(valueString))}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                    
                    <FormControl>
                      <FormLabel>Maximum Wager (S-BYTE)</FormLabel>
                      <NumberInput 
                        min={100} 
                        max={10000} 
                        value={maxWager}
                        onChange={(valueString) => setMaxWager(Number(valueString))}
                      >
                        <NumberInputField />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </SimpleGrid>
                  
                  <FormControl display="flex" alignItems="center" mb={4}>
                    <FormLabel mb="0">
                      Enable PVP Games
                    </FormLabel>
                    <Switch colorScheme="brand" defaultChecked />
                  </FormControl>
                  
                  <Button 
                    colorScheme="brand" 
                    onClick={handleSaveGameSettings}
                    isLoading={isUpdatingSettings}
                    loadingText="Saving..."
                  >
                    Save Game Settings
                  </Button>
                </Box>
                
                <Divider />
                
                <Box>
                  <Heading as="h4" size="sm" mb={4}>Game Statistics</Heading>
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                    <Box p={4} borderRadius="md" bg="gray.50" borderWidth="1px" borderColor="gray.200">
                      <Heading as="h5" size="xs" mb={2}>Total Games Played</Heading>
                      <Text fontSize="2xl" fontWeight="bold">{gameStats.totalGames}</Text>
                    </Box>
                    
                    <Box p={4} borderRadius="md" bg="gray.50" borderWidth="1px" borderColor="gray.200">
                      <Heading as="h5" size="xs" mb={2}>Total Wagered</Heading>
                      <Text fontSize="2xl" fontWeight="bold">{gameStats.totalWagered.toLocaleString()} S-BYTE</Text>
                    </Box>
                    
                    <Box p={4} borderRadius="md" bg="gray.50" borderWidth="1px" borderColor="gray.200">
                      <Heading as="h5" size="xs" mb={2}>Fees Generated</Heading>
                      <Text fontSize="2xl" fontWeight="bold">{gameStats.feesGenerated.toLocaleString()} S-BYTE</Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              </VStack>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      <Alert status="warning" borderRadius="md">
        <AlertIcon />
        <Box>
          <AlertTitle>Admin Access</AlertTitle>
          <AlertDescription>
            You are currently logged in as an administrator. Remember to disconnect your wallet when you're done to prevent unauthorized access.
          </AlertDescription>
        </Box>
      </Alert>
    </Container>
  );
};

export default AdminPage;
