import React, { createContext, useContext, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTokenTransfer } from '../hooks/useWalletHooks';
import { useToken } from './TokenContext';
import { useToast } from '@chakra-ui/react';

// Define the context type
interface TransferContextType {
  sendTokens: (recipient: string, amount: number) => Promise<boolean>;
  isSending: boolean;
  calculateFee: (amount: number) => number;
  calculateReceivedAmount: (amount: number) => number;
}

// Create the context
const TransferContext = createContext<TransferContextType | undefined>(undefined);

// Provider component
export const TransferProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey } = useWallet();
  const { sByteToken, refreshBalances } = useToken();
  const toast = useToast();
  
  // Get token transfer hook
  const { transferToken, loading: isSending } = useTokenTransfer(sByteToken.mint || null);
  
  // Calculate fee (3% for S-BYTE)
  const calculateFee = (amount: number): number => {
    return amount * 0.03;
  };
  
  // Calculate amount recipient will receive
  const calculateReceivedAmount = (amount: number): number => {
    return amount - calculateFee(amount);
  };
  
  // Function to send tokens
  const sendTokens = async (recipient: string, amount: number): Promise<boolean> => {
    if (!publicKey || !sByteToken.mint) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to send tokens.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    
    if (!recipient) {
      toast({
        title: 'Recipient required',
        description: 'Please enter a recipient wallet address.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    
    if (!amount || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount to send.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    
    try {
      await transferToken(
        recipient,
        amount,
        () => {
          // On success
          toast({
            title: 'Transaction successful',
            description: `Successfully sent ${amount} ${sByteToken.symbol} to ${recipient.slice(0, 4)}...${recipient.slice(-4)}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          
          // Refresh balances
          refreshBalances();
          
          return true;
        },
        (error) => {
          // On error
          toast({
            title: 'Transaction failed',
            description: error.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          
          return false;
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error sending tokens:', error);
      
      toast({
        title: 'Transaction failed',
        description: 'An unexpected error occurred while sending tokens.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return false;
    }
  };
  
  // Context value
  const value = {
    sendTokens,
    isSending,
    calculateFee,
    calculateReceivedAmount
  };
  
  return (
    <TransferContext.Provider value={value}>
      {children}
    </TransferContext.Provider>
  );
};

// Hook to use the transfer context
export const useTransfer = () => {
  const context = useContext(TransferContext);
  if (context === undefined) {
    throw new Error('useTransfer must be used within a TransferProvider');
  }
  return context;
};
