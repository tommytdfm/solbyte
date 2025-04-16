import React from 'react';
import { Box, Text, VStack, Button, useToast, Code, Heading, Container, Divider, HStack, Badge } from '@chakra-ui/react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletStatus, useSolBalance } from './useWalletHooks';

const WalletConnectionTest: React.FC = () => {
  const { connect, disconnect } = useWallet();
  const { connected, connecting, walletAddress, walletLabel, formattedAddress } = useWalletStatus();
  const { balance: solBalance, loading: solLoading, error: solError, refetch: refetchSolBalance } = useSolBalance();
  const toast = useToast();

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: 'Connection Error',
        description: (error as Error).message || 'Failed to connect wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Box bg="#1A1A22" p={6} borderRadius="xl" boxShadow="xl" border="1px solid" borderColor="#2A2A32">
          <Heading size="md" mb={4} color="white">Wallet Connection Test</Heading>
          <VStack spacing={4} align="stretch">
            <HStack justifyContent="space-between">
              <Text color="gray.300">Connection Status:</Text>
              <Badge colorScheme={connected ? 'green' : 'red'} px={2} py={1} borderRadius="md">
                {connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </HStack>
            
            {connected && (
              <>
                <HStack justifyContent="space-between">
                  <Text color="gray.300">Wallet Provider:</Text>
                  <Text color="white" fontWeight="medium">{walletLabel || 'Unknown'}</Text>
                </HStack>
                
                <HStack justifyContent="space-between">
                  <Text color="gray.300">Wallet Address:</Text>
                  <Code p={2} borderRadius="md" bg="#2A2A32" color="white">
                    {formattedAddress}
                  </Code>
                </HStack>
                
                <HStack justifyContent="space-between">
                  <Text color="gray.300">SOL Balance:</Text>
                  {solLoading ? (
                    <Text color="gray.400">Loading...</Text>
                  ) : solError ? (
                    <Text color="red.300">{solError}</Text>
                  ) : (
                    <Text color="white" fontWeight="medium">
                      {solBalance !== null ? `${solBalance.toFixed(6)} SOL` : 'Unknown'}
                    </Text>
                  )}
                </HStack>
              </>
            )}
            
            <Divider borderColor="#2A2A32" />
            
            <HStack spacing={4} justify="flex-end">
              {!connected ? (
                <Button 
                  onClick={handleConnect} 
                  isLoading={connecting}
                  variant="phantom"
                  size="md"
                >
                  Connect Wallet
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={refetchSolBalance} 
                    isLoading={solLoading}
                    variant="outline"
                    size="sm"
                    _hover={{ bg: '#2A2A32' }}
                    color="gray.300"
                    borderColor="#2A2A32"
                  >
                    Refresh Balance
                  </Button>
                  <Button 
                    onClick={handleDisconnect} 
                    variant="phantom"
                    size="md"
                    colorScheme="red"
                  >
                    Disconnect
                  </Button>
                </>
              )}
            </HStack>
          </VStack>
        </Box>
        
        <Box bg="#1A1A22" p={6} borderRadius="xl" boxShadow="xl" border="1px solid" borderColor="#2A2A32">
          <Heading size="md" mb={4} color="white">Connection Instructions</Heading>
          <VStack spacing={3} align="stretch" color="gray.300">
            <Text>1. Click the "Connect Wallet" button above</Text>
            <Text>2. Select Phantom or another Solana wallet from the modal</Text>
            <Text>3. Approve the connection request in your wallet</Text>
            <Text>4. Once connected, your wallet address and SOL balance will be displayed</Text>
            <Text>5. Test disconnecting and reconnecting to ensure functionality works properly</Text>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default WalletConnectionTest;
