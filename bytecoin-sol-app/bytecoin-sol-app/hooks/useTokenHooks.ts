import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getAssociatedTokenAddress, getMint, getAccount } from '@solana/spl-token';

// Interface for token data
interface TokenData {
  mint: string;
  symbol: string;
  name: string;
  icon?: string;
  decimals: number;
}

// S-BYTE token data with default mint address for testing
const SBYTE_TOKEN: TokenData = {
  mint: '8xyt...F6x7', // Default value from the screenshot
  symbol: 'S-BYTE',
  name: 'ByteCoin on Sol',
  decimals: 9
};

export const useTokenConfig = () => {
  const [sByteToken, setSByteToken] = useState<TokenData>(SBYTE_TOKEN);
  
  // Function to update the S-BYTE mint address
  const updateMintAddress = (mintAddress: string) => {
    setSByteToken(prev => ({
      ...prev,
      mint: mintAddress
    }));
    
    // Save to localStorage
    localStorage.setItem('sbyte_mint_address', mintAddress);
  };
  
  // Load saved mint address on init
  useEffect(() => {
    const savedMintAddress = localStorage.getItem('sbyte_mint_address');
    if (savedMintAddress) {
      updateMintAddress(savedMintAddress);
    }
  }, []);
  
  return {
    sByteToken,
    updateMintAddress
  };
};

export const useTokenAccounts = (mintAddress: string | null) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [tokenAccount, setTokenAccount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const getTokenAccount = async () => {
    if (!publicKey || !mintAddress) {
      setTokenAccount(null);
      return null;
    }
    
    try {
      setLoading(true);
      
      // Convert string to PublicKey
      const mint = new PublicKey(mintAddress);
      
      // Get associated token address
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mint,
        publicKey
      );
      
      setTokenAccount(associatedTokenAddress.toString());
      return associatedTokenAddress.toString();
    } catch (error) {
      console.error('Error getting token account:', error);
      setTokenAccount(null);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    getTokenAccount();
  }, [publicKey, mintAddress, connection]);
  
  return {
    tokenAccount,
    loading,
    refreshTokenAccount: getTokenAccount
  };
};

export const useTokenMetadata = (mintAddress: string | null) => {
  const { connection } = useConnection();
  const [metadata, setMetadata] = useState<{
    decimals: number;
    supply: number;
    feeBasisPoints?: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const getTokenMetadata = async () => {
    if (!mintAddress) {
      setMetadata(null);
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert string to PublicKey
      const mint = new PublicKey(mintAddress);
      
      // Get mint info
      const mintInfo = await getMint(connection, mint);
      
      setMetadata({
        decimals: mintInfo.decimals,
        supply: Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals),
        feeBasisPoints: 300 // 3% fee (300 basis points)
      });
    } catch (error) {
      console.error('Error getting token metadata:', error);
      setMetadata(null);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    getTokenMetadata();
  }, [mintAddress, connection]);
  
  return {
    metadata,
    loading,
    refreshMetadata: getTokenMetadata
  };
};

export const useTokenTransactions = (mintAddress: string | null) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const getTokenTransactions = async () => {
    if (!publicKey || !mintAddress) {
      setTransactions([]);
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real implementation, this would query the Solana blockchain for token transactions
      // For now, we'll return mock data
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock transaction data
      const mockTransactions = [
        {
          signature: '5Rt6...1Abc',
          blockTime: Date.now() / 1000 - 3600,
          type: 'send',
          amount: 100,
          recipient: '9Lm2...7Pqr',
          fee: 3
        },
        {
          signature: '7Gh8...4Def',
          blockTime: Date.now() / 1000 - 7200,
          type: 'receive',
          amount: 500,
          sender: '2Jk9...6Ghi',
          fee: 0
        },
        {
          signature: '1Mn0...5Jkl',
          blockTime: Date.now() / 1000 - 86400,
          type: 'send',
          amount: 250,
          recipient: '6Op7...8Mno',
          fee: 7.5
        }
      ];
      
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Error getting token transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    getTokenTransactions();
  }, [publicKey, mintAddress, connection]);
  
  return {
    transactions,
    loading,
    refreshTransactions: getTokenTransactions
  };
};
