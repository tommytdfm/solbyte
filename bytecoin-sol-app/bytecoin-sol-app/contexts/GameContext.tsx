import React, { createContext, useContext, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useGameWager } from '../hooks/useAdminHooks';
import { useToken } from './TokenContext';
import { useToast } from '@chakra-ui/react';

// Define the context type
interface GameContextType {
  createWager: (amount: number) => Promise<string | null>;
  settleWager: (wagerId: string, winner: string) => Promise<boolean>;
  isProcessingWager: boolean;
  minWager: number;
  maxWager: number;
}

// Create the context
const GameContext = createContext<GameContextType | undefined>(undefined);

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey } = useWallet();
  const { sByteToken, refreshBalances } = useToken();
  const toast = useToast();
  
  // Game wager hooks
  const { createWager: createWagerHook, settleWager: settleWagerHook, loading: isProcessingWager } = useGameWager();
  
  // Game settings (in a real app, these would be fetched from a database or blockchain)
  const [minWager, setMinWager] = useState(5);
  const [maxWager, setMaxWager] = useState(1000);
  
  // Function to create a wager
  const createWager = async (amount: number): Promise<string | null> => {
    if (!publicKey || !sByteToken.mint) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to create a wager.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
    
    if (amount < minWager || amount > maxWager) {
      toast({
        title: 'Invalid wager amount',
        description: `Wager amount must be between ${minWager} and ${maxWager} S-BYTE.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return null;
    }
    
    let wagerId: string | null = null;
    
    try {
      await createWagerHook(
        sByteToken.mint,
        amount,
        null, // No specific opponent for now
        (id) => {
          // On success
          wagerId = id;
          
          toast({
            title: 'Wager created',
            description: `Successfully created a wager of ${amount} ${sByteToken.symbol}.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          
          // Refresh balances
          refreshBalances();
        },
        (error) => {
          // On error
          toast({
            title: 'Wager creation failed',
            description: error.message,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      );
      
      return wagerId;
    } catch (error) {
      console.error('Error creating wager:', error);
      
      toast({
        title: 'Wager creation failed',
        description: 'An unexpected error occurred while creating the wager.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return null;
    }
  };
  
  // Function to settle a wager
  const settleWager = async (wagerId: string, winner: string): Promise<boolean> => {
    if (!publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to settle a wager.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    
    try {
      await settleWagerHook(
        wagerId,
        winner,
        () => {
          // On success
          toast({
            title: 'Wager settled',
            description: `Successfully settled the wager. Winner: ${winner.slice(0, 4)}...${winner.slice(-4)}`,
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
            title: 'Wager settlement failed',
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
      console.error('Error settling wager:', error);
      
      toast({
        title: 'Wager settlement failed',
        description: 'An unexpected error occurred while settling the wager.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return false;
    }
  };
  
  // Context value
  const value = {
    createWager,
    settleWager,
    isProcessingWager,
    minWager,
    maxWager
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

// Hook to use the game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
