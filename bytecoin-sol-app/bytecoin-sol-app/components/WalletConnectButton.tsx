import React from 'react';
import {
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  HStack,
  Icon,
  Box,
  useToast,
  Tooltip,
  useColorModeValue,
  Flex,
  Spinner
} from '@chakra-ui/react';
import { ChevronDownIcon, CopyIcon } from '@chakra-ui/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { FaWallet, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';

// Motion components for animations
const MotionButton = motion(Button);

const WalletConnectButton: React.FC = () => {
  const { publicKey, connected, connect, disconnect, connecting, wallet, wallets } = useWallet();
  const toast = useToast();
  
  // Colors
  const buttonBg = useColorModeValue('gradient.primary', 'gradient.dark');
  const buttonHoverBg = useColorModeValue('brand.600', 'brand.700');
  const menuBg = useColorModeValue('white', 'gray.800');
  const menuBorderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Handle wallet connection
  const handleConnect = async () => {
    try {
      if (wallets.length === 0) {
        toast({
          title: 'No wallets found',
          description: 'Please install a Solana wallet extension like Phantom or Solflare.',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        return;
      }
      
      // Try to connect with a small delay to ensure wallet adapter is ready
      setTimeout(async () => {
        try {
          await connect();
        } catch (delayedError) {
          console.error('Delayed connection error:', delayedError);
          toast({
            title: 'Connection failed',
            description: 'Please make sure your wallet is unlocked and try again.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      }, 500);
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: 'Connection failed',
        description: 'Failed to connect wallet. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle wallet disconnection
  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({
        title: 'Disconnected',
        description: 'Your wallet has been disconnected.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  };
  
  // Handle wallet address copy
  const handleCopyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      toast({
        title: 'Address copied',
        description: 'Wallet address copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
  };
  
  // Format wallet address for display
  const formatWalletAddress = (address: string): string => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };
  
  // If not connected, show connect button
  if (!connected) {
    return (
      <MotionButton
        onClick={handleConnect}
        isLoading={connecting}
        loadingText="Connecting"
        variant="premium"
        size="md"
        leftIcon={<Icon as={FaWallet as React.ElementType} />}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Connect Wallet
      </MotionButton>
    );
  }
  
  // If connected, show wallet info and options
  return (
    <Menu>
      <Tooltip label="Wallet options" placement="bottom" hasArrow>
        <MenuButton
          as={Button}
          variant="premium"
          rightIcon={<ChevronDownIcon />}
          size="md"
        >
          <HStack spacing={2}>
            <Icon as={FaWallet as React.ElementType} />
            <Text>
              {publicKey ? formatWalletAddress(publicKey.toString()) : 'Connected'}
            </Text>
          </HStack>
        </MenuButton>
      </Tooltip>
      
      <MenuList
        bg={menuBg}
        borderColor={menuBorderColor}
        boxShadow="xl"
        borderRadius="xl"
        p={2}
      >
        {publicKey && (
          <MenuItem
            onClick={handleCopyAddress}
            icon={<CopyIcon />}
            borderRadius="md"
            _hover={{ bg: 'brand.50' }}
          >
            Copy Address
          </MenuItem>
        )}
        
        <MenuItem
          onClick={handleDisconnect}
          icon={<Icon as={FaSignOutAlt as React.ElementType} />}
          color="red.500"
          borderRadius="md"
          _hover={{ bg: 'red.50' }}
        >
          Disconnect
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default WalletConnectButton;
