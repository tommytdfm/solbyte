import React, { createContext, useContext, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useTokenAdmin } from '../hooks/useAdminHooks';
import { useToken } from './TokenContext';
import { useAdminAuth } from '../hooks/useWalletHooks';
import { useToast } from '@chakra-ui/react';

// Define the context type
interface AdminContextType {
  isAdmin: boolean;
  isAuthenticating: boolean;
  authenticate: () => Promise<boolean>;
  withdrawFees: () => Promise<boolean>;
  isWithdrawingFees: boolean;
  pendingFees: number;
  updateMintAddress: (address: string) => Promise<boolean>;
  updateGameSettings: (minWager: number, maxWager: number) => Promise<boolean>;
  isUpdatingSettings: boolean;
}

// Authorized admin wallet addresses
const AUTHORIZED_WALLETS = [
  '6s5sjaPDYXVzbBnDjfxWqbD4K5qi9yvdWchtgoqDESjJ'
];

// Create the context
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Provider component
export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey } = useWallet();
  const { sByteToken, updateMintAddress: updateTokenMint } = useToken();
  const toast = useToast();
  
  // Admin authentication
  const { isAuthorized: isAdmin, loading: isAuthenticating, authenticate } = 
    useAdminAuth(AUTHORIZED_WALLETS);
  
  // Admin functions
  const { 
    withdrawWithheldFees, 
    getWithheldFees,
    updateGameSettings: updateGameSettingsHook,
    loading: isUpdatingSettings 
  } = useTokenAdmin();
  
  // State for pending fees
  const [pendingFees, setPendingFees] = useState(2500); // Mock value
  const [isWithdrawingFees, setIsWithdrawingFees] = useState(false);
  
  // Function to withdraw fees
  const withdrawFees = async (): Promise<boolean> => {
    if (!isAdmin || !publicKey || !sByteToken.mint) {
      toast({
        title: 'Not authorized',
        description: 'You must be an admin to withdraw fees.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    
    try {
      setIsWithdrawingFees(true);
      
      // In a real implementation, this would get the list of accounts with withheld fees
      const accounts = ['Account1', 'Account2', 'Account3']; // Mock accounts
      
      await withdrawWithheldFees(
        sByteToken.mint,
        accounts,
        () => {
          // On success
          toast({
            title: 'Fees withdrawn',
            description: `Successfully withdrawn ${pendingFees} ${sByteToken.symbol} to the central fee account.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          
          // Reset pending fees
          setPendingFees(0);
          
          return true;
        },
        (error) => {
          // On error
          toast({
            title: 'Fee withdrawal failed',
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
      console.error('Error withdrawing fees:', error);
      
      toast({
        title: 'Fee withdrawal failed',
        description: 'An unexpected error occurred while withdrawing fees.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return false;
    } finally {
      setIsWithdrawingFees(false);
    }
  };
  
  // Function to update mint address
  const updateMintAddress = async (address: string): Promise<boolean> => {
    if (!isAdmin) {
      toast({
        title: 'Not authorized',
        description: 'You must be an admin to update the mint address.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    
    if (!address) {
      toast({
        title: 'Invalid address',
        description: 'Please enter a valid mint address.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    
    try {
      // Update mint address in TokenContext
      updateTokenMint(address);
      
      toast({
        title: 'Mint address updated',
        description: `Successfully updated the S-BYTE mint address.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating mint address:', error);
      
      toast({
        title: 'Update failed',
        description: 'An unexpected error occurred while updating the mint address.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return false;
    }
  };
  
  // Function to update game settings
  const updateGameSettings = async (minWager: number, maxWager: number): Promise<boolean> => {
    if (!isAdmin) {
      toast({
        title: 'Not authorized',
        description: 'You must be an admin to update game settings.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return false;
    }
    
    try {
      await updateGameSettingsHook(
        minWager,
        maxWager,
        () => {
          // On success
          toast({
            title: 'Game settings updated',
            description: `Successfully updated the game settings.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          
          return true;
        },
        (error) => {
          // On error
          toast({
            title: 'Update failed',
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
      console.error('Error updating game settings:', error);
      
      toast({
        title: 'Update failed',
        description: 'An unexpected error occurred while updating game settings.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      return false;
    }
  };
  
  // Context value
  const value = {
    isAdmin,
    isAuthenticating,
    authenticate,
    withdrawFees,
    isWithdrawingFees,
    pendingFees,
    updateMintAddress,
    updateGameSettings,
    isUpdatingSettings
  };
  
  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

// Hook to use the admin context
export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
