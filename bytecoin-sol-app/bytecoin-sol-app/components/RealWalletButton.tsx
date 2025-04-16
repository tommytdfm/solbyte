import React, { FC, useState, useEffect, useCallback } from 'react';
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
  Spinner,
  Avatar,
  Divider,
  Link
} from '@chakra-ui/react';
import { ChevronDownIcon, CopyIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { FaWallet, FaSignOutAlt, FaExternalLinkAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useWalletStatus, useSolBalance } from '../../../useWalletHooks';

// Motion components for animations
const MotionButton = motion(Button);
const MotionBox = motion(Box);

interface RealWalletButtonProps {
  variant?: 'default' | 'outline' | 'ghost' | 'solid' | 'link' | 'phantom';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const RealWalletButton: FC<RealWalletButtonProps> = ({ 
  variant = 'phantom',
  size = 'md'
}) => {
  const { disconnect } = useWallet();
  const { connected, connecting, walletAddress, walletLabel, formattedAddress } = useWalletStatus();
  const { balance: solBalance, loading: solLoading, refetch: refetchSolBalance } = useSolBalance();
  const toast = useToast();
  
  // Colors
  const menuBg = useColorModeValue('white', '#1A1A22');
  const menuBorderColor = useColorModeValue('gray.200', '#2A2A32');
  const menuItemHoverBg = useColorModeValue('brand.50', '#2A2A32');
  const textColor = useColorModeValue('gray.800', 'white');
  const disconnectColor = useColorModeValue('red.500', 'red.300');
  
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
        position: 'top',
        variant: 'solid',
      });
    } catch (error) {
      console.error('Disconnection error:', error);
    }
  };
  
  // Handle wallet address copy
  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: 'Address copied',
        description: 'Wallet address copied to clipboard',
        status: 'success',
        duration: 2000,
        isClosable: true,
        position: 'top',
        variant: 'solid',
      });
    }
  };
  
  // Handle view on explorer
  const handleViewOnExplorer = () => {
    if (walletAddress) {
      window.open(`https://explorer.solana.com/address/${walletAddress}?cluster=devnet`, '_blank');
    }
  };
  
  // If not connected, show WalletMultiButton from wallet adapter
  if (!connected) {
    return (
      <Box
        sx={{
          '.wallet-adapter-button': {
            backgroundColor: variant === 'phantom' ? '#9d66ff' : undefined,
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            boxShadow: variant === 'phantom' ? '0 4px 12px rgba(157, 102, 255, 0.3)' : undefined,
            height: size === 'lg' ? '48px' : size === 'md' ? '40px' : size === 'sm' ? '32px' : '24px',
            fontSize: size === 'lg' ? '16px' : size === 'md' ? '14px' : size === 'sm' ? '12px' : '10px',
          },
          '.wallet-adapter-button:hover': {
            backgroundColor: variant === 'phantom' ? '#8a4dff' : undefined,
            transform: 'translateY(-2px)',
            boxShadow: variant === 'phantom' ? '0 6px 20px rgba(157, 102, 255, 0.4)' : undefined,
          },
          '.wallet-adapter-button-start-icon': {
            marginRight: '8px',
          }
        }}
      >
        <WalletMultiButton />
      </Box>
    );
  }
  
  // If connected, show custom wallet menu
  return (
    <Menu variant="phantom">
      <Tooltip label="Wallet options" placement="bottom" hasArrow>
        <MenuButton
          as={Button}
          variant={variant}
          rightIcon={<ChevronDownIcon />}
          size={size}
          boxShadow="md"
          _hover={{
            boxShadow: 'lg',
            transform: 'translateY(-2px)',
          }}
        >
          <HStack spacing={2}>
            <MotionBox
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar 
                size="xs" 
                bg="brand.500" 
                icon={<Icon as={FaWallet} fontSize="0.8rem" />} 
              />
            </MotionBox>
            <Text>
              {formattedAddress}
            </Text>
          </HStack>
        </MenuButton>
      </Tooltip>
      
      <MenuList
        bg={menuBg}
        borderColor={menuBorderColor}
        boxShadow="dark-lg"
        borderRadius="xl"
        p={2}
        minW="240px"
      >
        {walletAddress && (
          <>
            <Box px={3} py={2} mb={2}>
              <Text fontSize="xs" color="gray.500" mb={1}>Connected Wallet</Text>
              <HStack justifyContent="space-between">
                <Text fontWeight="medium" color={textColor} fontSize="sm">
                  {walletLabel || 'Unknown'}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {solLoading ? 'Loading...' : solBalance !== null ? `${solBalance.toFixed(4)} SOL` : 'Unknown'}
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {formattedAddress}
              </Text>
            </Box>
            
            <Divider borderColor={menuBorderColor} mb={2} />
            
            <MenuItem
              onClick={handleCopyAddress}
              icon={<CopyIcon />}
              borderRadius="md"
              _hover={{ bg: menuItemHoverBg }}
              color={textColor}
              fontSize="sm"
            >
              Copy Address
            </MenuItem>
            
            <MenuItem
              onClick={handleViewOnExplorer}
              icon={<Icon as={FaExternalLinkAlt} />}
              borderRadius="md"
              _hover={{ bg: menuItemHoverBg }}
              color={textColor}
              fontSize="sm"
            >
              View on Explorer
            </MenuItem>
            
            <MenuItem
              onClick={refetchSolBalance}
              icon={<Icon as={FaWallet} />}
              borderRadius="md"
              _hover={{ bg: menuItemHoverBg }}
              color={textColor}
              fontSize="sm"
              isDisabled={solLoading}
            >
              {solLoading ? 'Refreshing...' : 'Refresh Balance'}
            </MenuItem>
          </>
        )}
        
        <MenuItem
          onClick={handleDisconnect}
          icon={<Icon as={FaSignOutAlt} />}
          color={disconnectColor}
          borderRadius="md"
          _hover={{ bg: menuItemHoverBg }}
          fontSize="sm"
          mt={2}
        >
          Disconnect
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default RealWalletButton;
