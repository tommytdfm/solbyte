import React, { useState } from 'react';
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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToken } from '../contexts/TokenContext';
import { useTokenTransfer } from '../hooks/useWalletHooks';

const SendReceivePage: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const { sByteToken, sByteBalance, solBalance, isLoadingBalances } = useToken();
  const { transferToken, loading: transferLoading } = useTokenTransfer(sByteToken.mint || null);
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // State for send form
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('S-BYTE');
  
  // Real balances from wallet
  const balances = {
    'S-BYTE': sByteBalance || 0,
    'SOL': solBalance || 0,
    'USDC': 500 // Mock USDC balance for demonstration
  };
  
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connected || !publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to send tokens.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!recipient) {
      toast({
        title: 'Recipient required',
        description: 'Please enter a recipient wallet address.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount to send.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    // Check if user has enough balance
    if (parseFloat(amount) > balances[selectedToken as keyof typeof balances]) {
      toast({
        title: 'Insufficient balance',
        description: `You don't have enough ${selectedToken} to complete this transaction.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    if (selectedToken === 'S-BYTE') {
      // Use the real token transfer function for S-BYTE
      try {
        await transferToken(
          recipient,
          parseFloat(amount),
          () => {
            toast({
              title: 'Transaction successful',
              description: `Successfully sent ${amount} ${selectedToken} to ${recipient.slice(0, 4)}...${recipient.slice(-4)}`,
              status: 'success',
              duration: 5000,
              isClosable: true,
            });
            
            // Reset form
            setRecipient('');
            setAmount('');
          },
          (error) => {
            toast({
              title: 'Transaction failed',
              description: error.message,
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }
        );
      } catch (error) {
        toast({
          title: 'Transaction failed',
          description: (error as Error).message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } else {
      // For other tokens, simulate a successful transaction
      setTimeout(() => {
        toast({
          title: 'Transaction sent',
          description: `Successfully sent ${amount} ${selectedToken} to ${recipient.slice(0, 4)}...${recipient.slice(-4)}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Reset form
        setRecipient('');
        setAmount('');
      }, 2000);
    }
  };
  
  // Calculate fee for S-BYTE transfers (3%)
  const calculateFee = () => {
    if (selectedToken === 'S-BYTE' && amount) {
      const amountValue = parseFloat(amount);
      if (!isNaN(amountValue)) {
        return amountValue * 0.03;
      }
    }
    return 0;
  };
  
  // Calculate amount recipient will receive
  const calculateReceivedAmount = () => {
    if (amount) {
      const amountValue = parseFloat(amount);
      if (!isNaN(amountValue)) {
        if (selectedToken === 'S-BYTE') {
          return amountValue - calculateFee();
        }
        return amountValue;
      }
    }
    return 0;
  };
  
  if (!connected) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box p={8} borderRadius="lg" bg={cardBg} borderWidth="1px" borderColor={borderColor} textAlign="center">
          <Heading size="md" mb={4}>Connect Your Wallet</Heading>
          <Text>Please connect your Solana wallet to send and receive tokens.</Text>
        </Box>
      </Container>
    );
  }
  
  if (isLoadingBalances) {
    return (
      <Container maxW="container.xl" py={8}>
        <Box p={8} borderRadius="lg" bg={cardBg} borderWidth="1px" borderColor={borderColor} textAlign="center">
          <Heading size="md" mb={4}>Loading Balances</Heading>
          <Text>Please wait while we load your token balances...</Text>
        </Box>
      </Container>
    );
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading as="h1" size="xl" mb={6}>Send & Receive Tokens</Heading>
      
      <Tabs variant="enclosed" colorScheme="brand" mb={8}>
        <TabList>
          <Tab>Send</Tab>
          <Tab>Receive</Tab>
        </TabList>
        
        <TabPanels>
          {/* Send Tab */}
          <TabPanel>
            <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <form onSubmit={handleSend}>
                <VStack spacing={6} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Token</FormLabel>
                    <HStack spacing={4}>
                      {Object.keys(balances).map((token) => (
                        <Button 
                          key={token}
                          variant={selectedToken === token ? 'solid' : 'outline'}
                          colorScheme="brand"
                          onClick={() => setSelectedToken(token)}
                        >
                          {token}
                        </Button>
                      ))}
                    </HStack>
                  </FormControl>
                  
                  <Stat>
                    <StatLabel>Available Balance</StatLabel>
                    <StatNumber>{balances[selectedToken as keyof typeof balances]} {selectedToken}</StatNumber>
                  </Stat>
                  
                  <FormControl isRequired>
                    <FormLabel>Recipient Address</FormLabel>
                    <Input 
                      placeholder="Enter Solana wallet address" 
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel>Amount</FormLabel>
                    <Input 
                      type="number" 
                      placeholder={`Amount of ${selectedToken} to send`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.000001"
                    />
                  </FormControl>
                  
                  {selectedToken === 'S-BYTE' && amount && parseFloat(amount) > 0 && (
                    <Box p={4} borderRadius="md" bg="gray.50" borderWidth="1px" borderColor="gray.200">
                      <Text fontWeight="medium" mb={2}>Transaction Details:</Text>
                      <HStack justify="space-between" mb={1}>
                        <Text>Amount:</Text>
                        <Text>{parseFloat(amount).toFixed(6)} S-BYTE</Text>
                      </HStack>
                      <HStack justify="space-between" mb={1}>
                        <Text>Fee (3%):</Text>
                        <Text>{calculateFee().toFixed(6)} S-BYTE</Text>
                      </HStack>
                      <Divider my={2} />
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Recipient receives:</Text>
                        <Text fontWeight="bold">{calculateReceivedAmount().toFixed(6)} S-BYTE</Text>
                      </HStack>
                      <Text fontSize="sm" mt={3} color="gray.600">
                        A 3% fee is collected on S-BYTE transfers to raise capital for developing the new ByteCoin blockchain, 
                        where 1 ByteCoin will be 8x the value of a bit.
                      </Text>
                    </Box>
                  )}
                  
                  <Button 
                    type="submit" 
                    colorScheme="brand" 
                    size="lg" 
                    isLoading={transferLoading}
                    loadingText="Sending..."
                  >
                    Send {selectedToken}
                  </Button>
                </VStack>
              </form>
            </Box>
          </TabPanel>
          
          {/* Receive Tab */}
          <TabPanel>
            <Box p={6} borderRadius="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <VStack spacing={6} align="stretch">
                <Heading as="h3" size="md">Your Wallet Address</Heading>
                <Box p={4} borderRadius="md" bg="gray.50" borderWidth="1px" borderColor="gray.200">
                  <Text fontFamily="mono" wordBreak="break-all">
                    {publicKey?.toString()}
                  </Text>
                </Box>
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <AlertDescription>
                    Share this address with others to receive S-BYTE, SOL, and other Solana tokens.
                  </AlertDescription>
                </Alert>
                <Button 
                  colorScheme="brand" 
                  onClick={() => {
                    navigator.clipboard.writeText(publicKey?.toString() || '');
                    toast({
                      title: 'Address copied',
                      description: 'Your wallet address has been copied to clipboard.',
                      status: 'success',
                      duration: 3000,
                      isClosable: true,
                    });
                  }}
                >
                  Copy Address
                </Button>
              </VStack>
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
};

export default SendReceivePage;
