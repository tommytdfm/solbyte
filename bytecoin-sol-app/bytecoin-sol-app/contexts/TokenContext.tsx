import React, { createContext, useContext, useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useTokenBalance, useSolBalance } from '../hooks/useWalletHooks';
import { useTokenConfig, useTokenMetadata, useTokenTransactions } from '../hooks/useTokenHooks';

// Define the context type
interface TokenContextType {
  sByteToken: {
    mint: string;
    symbol: string;
    name: string;
    decimals: number;
  };
  updateMintAddress: (address: string) => void;
  sByteBalance: number | null;
  solBalance: number | null;
  isLoadingBalances: boolean;
  transactions: any[];
  isLoadingTransactions: boolean;
  refreshBalances: () => void;
  refreshTransactions: () => void;
  tokenMetadata: {
    decimals: number;
    supply: number;
    feeBasisPoints?: number;
  } | null;
}

// Create the context
const TokenContext = createContext<TokenContextType | undefined>(undefined);

// Provider component
export const TokenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey } = useWallet();
  const { sByteToken, updateMintAddress } = useTokenConfig();
  
  // Get token balances
  const { balance: sByteBalance, loading: loadingSByte, refetch: refetchSByte } = 
    useTokenBalance(sByteToken.mint || null);
  const { balance: solBalance, loading: loadingSol, refetch: refetchSol } = useSolBalance();
  
  // Get token metadata
  const { metadata: tokenMetadata, loading: loadingMetadata } = 
    useTokenMetadata(sByteToken.mint || null);
  
  // Get token transactions
  const { transactions, loading: loadingTransactions, refreshTransactions } = 
    useTokenTransactions(sByteToken.mint || null);
  
  // Combined loading state
  const isLoadingBalances = loadingSByte || loadingSol || loadingMetadata;
  
  // Function to refresh all balances
  const refreshBalances = () => {
    refetchSByte();
    refetchSol();
  };
  
  // Refresh balances when wallet or mint address changes
  useEffect(() => {
    if (publicKey && sByteToken.mint) {
      refreshBalances();
    }
  }, [publicKey, sByteToken.mint]);
  
  // Context value
  const value = {
    sByteToken,
    updateMintAddress,
    sByteBalance,
    solBalance,
    isLoadingBalances,
    transactions,
    isLoadingTransactions: loadingTransactions,
    refreshBalances,
    refreshTransactions,
    tokenMetadata
  };
  
  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
};

// Hook to use the token context
export const useToken = () => {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
};
