import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect, useCallback } from 'react';
import { 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  TransactionInstruction
} from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferCheckedInstruction,
  getAccount,
  getMint
} from '@solana/spl-token';

export const useTokenBalance = (mintAddress: string | null) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const getTokenBalance = useCallback(async () => {
    if (!publicKey || !mintAddress) {
      setBalance(null);
      return;
    }

    try {
      setLoading(true);
      
      // Convert string to PublicKey
      const mint = new PublicKey(mintAddress);
      
      // Get associated token account
      const associatedTokenAddress = await getAssociatedTokenAddress(
        mint,
        publicKey
      );

      // Check if the token account exists
      try {
        const tokenAccount = await getAccount(connection, associatedTokenAddress);
        const mintInfo = await getMint(connection, mint);
        
        // Calculate balance with proper decimal places
        const tokenBalance = Number(tokenAccount.amount) / Math.pow(10, mintInfo.decimals);
        setBalance(tokenBalance);
      } catch (error) {
        // If account doesn't exist, balance is 0
        setBalance(0);
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey, mintAddress]);

  useEffect(() => {
    getTokenBalance();
    
    // Set up interval to refresh balance
    const intervalId = setInterval(getTokenBalance, 30000); // every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [getTokenBalance, connection, publicKey, mintAddress]);

  return { balance, loading, refetch: getTokenBalance };
};

export const useSolBalance = () => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const getSolBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    try {
      setLoading(true);
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    getSolBalance();
    
    // Set up interval to refresh balance
    const intervalId = setInterval(getSolBalance, 30000); // every 30 seconds
    
    return () => clearInterval(intervalId);
  }, [getSolBalance, connection, publicKey]);

  return { balance, loading, refetch: getSolBalance };
};

export const useTokenTransfer = (mintAddress: string | null) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [loading, setLoading] = useState(false);

  const transferToken = useCallback(
    async (
      recipientAddress: string,
      amount: number,
      onSuccess?: () => void,
      onError?: (error: Error) => void
    ) => {
      if (!publicKey || !mintAddress || !recipientAddress || amount <= 0) {
        onError && onError(new Error('Invalid transfer parameters'));
        return;
      }

      try {
        setLoading(true);
        
        // Convert string to PublicKey
        const mint = new PublicKey(mintAddress);
        const recipient = new PublicKey(recipientAddress);
        
        // Get associated token addresses
        const senderTokenAccount = await getAssociatedTokenAddress(
          mint,
          publicKey
        );
        
        const recipientTokenAccount = await getAssociatedTokenAddress(
          mint,
          recipient
        );

        // Get mint info to calculate the amount with proper decimals
        const mintInfo = await getMint(connection, mint);
        const adjustedAmount = Math.floor(amount * Math.pow(10, mintInfo.decimals));

        // Create transfer instruction
        const transferInstruction = createTransferCheckedInstruction(
          senderTokenAccount,
          mint,
          recipientTokenAccount,
          publicKey,
          adjustedAmount,
          mintInfo.decimals
        );

        // Create transaction
        const transaction = new Transaction().add(transferInstruction);
        
        // Set recent blockhash and fee payer
        transaction.feePayer = publicKey;
        transaction.recentBlockhash = (
          await connection.getLatestBlockhash()
        ).blockhash;

        // Send transaction
        const signature = await sendTransaction(transaction, connection);
        
        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed');
        
        onSuccess && onSuccess();
      } catch (error) {
        console.error('Error transferring token:', error);
        onError && onError(error as Error);
      } finally {
        setLoading(false);
      }
    },
    [connection, publicKey, sendTransaction, mintAddress]
  );

  return { transferToken, loading };
};

export const useAdminAuth = (authorizedWallets: string[]) => {
  const { publicKey, signMessage } = useWallet();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);

  const checkAuthorization = useCallback(async () => {
    if (!publicKey) {
      setIsAuthorized(false);
      return false;
    }

    const walletAddress = publicKey.toString();
    const isWalletAuthorized = authorizedWallets.includes(walletAddress);
    
    setIsAuthorized(isWalletAuthorized);
    return isWalletAuthorized;
  }, [publicKey, authorizedWallets]);

  const authenticate = useCallback(async () => {
    if (!publicKey || !signMessage) {
      return false;
    }

    try {
      setLoading(true);
      
      // Check if wallet is in authorized list
      const isWalletAuthorized = await checkAuthorization();
      
      if (!isWalletAuthorized) {
        return false;
      }
      
      // Create message to sign
      const message = new TextEncoder().encode(
        `ByteCoin Admin Authentication: ${new Date().toISOString()}`
      );
      
      // Sign message
      await signMessage(message);
      
      // If we get here, the signature was valid
      setIsAuthorized(true);
      return true;
    } catch (error) {
      console.error('Authentication error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [publicKey, signMessage, checkAuthorization]);

  useEffect(() => {
    checkAuthorization();
  }, [checkAuthorization, publicKey]);

  return { isAuthorized, loading, authenticate };
};
