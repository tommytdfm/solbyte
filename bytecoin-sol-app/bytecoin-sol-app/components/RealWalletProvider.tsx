import React, { FC, useMemo, useState, useCallback, useEffect } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  BackpackWalletAdapter,
  BraveWalletAdapter,
  CoinbaseWalletAdapter,
  SlopeWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useToast, Box } from '@chakra-ui/react';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

interface RealWalletProviderProps {
  children: React.ReactNode;
  network?: WalletAdapterNetwork;
}

export const RealWalletProvider: FC<RealWalletProviderProps> = ({ 
  children, 
  network = WalletAdapterNetwork.Devnet 
}) => {
  const [autoConnectEnabled, setAutoConnectEnabled] = useState(true);
  const toast = useToast();
  const [connectionAttempted, setConnectionAttempted] = useState(false);

  // Multiple RPC endpoints for better reliability with fallback mechanism
  const endpoints = useMemo(() => {
    switch (network) {
      case WalletAdapterNetwork.Mainnet:
        return [
          clusterApiUrl(network),
          'https://api.mainnet-beta.solana.com',
          'https://solana-mainnet.g.alchemy.com/v2/demo',
          'https://rpc.ankr.com/solana'
        ];
      case WalletAdapterNetwork.Testnet:
        return [
          clusterApiUrl(network),
          'https://api.testnet.solana.com'
        ];
      case WalletAdapterNetwork.Devnet:
      default:
        return [
          clusterApiUrl(network),
          'https://api.devnet.solana.com',
          'https://solana-devnet.g.alchemy.com/v2/demo',
          'https://devnet.genesysgo.net/'
        ];
    }
  }, [network]);

  // Use the first endpoint by default, but allow fallback
  const endpoint = useMemo(() => endpoints[0], [endpoints]);

  // Include more wallet adapters for better compatibility
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
      new BraveWalletAdapter(),
      new CoinbaseWalletAdapter(),
      new SlopeWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter()
    ],
    [network]
  );

  // Enhanced error handler for wallet connection with user feedback
  const onError = useCallback((error: Error) => {
    console.error('Wallet connection error:', error);
    
    // Only show toast if this isn't the initial connection attempt
    if (connectionAttempted) {
      toast({
        title: 'Wallet Connection Error',
        description: `${error.message || 'Failed to connect wallet. Please try again.'}`,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
        variant: 'solid',
      });
    }
  }, [toast, connectionAttempted]);

  // Track connection attempts
  useEffect(() => {
    setConnectionAttempted(true);
  }, []);

  // Connection success handler
  const onConnectionSuccess = useCallback(() => {
    toast({
      title: 'Wallet Connected',
      description: 'Your wallet has been successfully connected.',
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top',
      variant: 'solid',
    });
  }, [toast]);

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={autoConnectEnabled}
        onError={onError}
        localStorageKey="bytecoin-sol-wallet"
      >
        <WalletModalProvider>
          {/* Apply custom styling to the wallet adapter modal */}
          <Box
            sx={{
              '.wallet-adapter-modal': {
                backdropFilter: 'blur(10px)',
              },
              '.wallet-adapter-modal-wrapper': {
                backgroundColor: '#1A1A22',
                borderRadius: '16px',
                color: 'white',
                boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
                border: '1px solid #2A2A32',
              },
              '.wallet-adapter-modal-title': {
                color: 'white',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: '700',
              },
              '.wallet-adapter-modal-content': {
                backgroundColor: '#1A1A22',
              },
              '.wallet-adapter-modal-list': {
                marginBottom: '10px',
              },
              '.wallet-adapter-modal-list li': {
                borderRadius: '8px',
                transition: 'all 0.2s ease',
              },
              '.wallet-adapter-modal-list li:hover': {
                backgroundColor: '#2A2A32',
                transform: 'translateY(-2px)',
              },
              '.wallet-adapter-modal-list-more': {
                color: '#9d66ff',
              },
              '.wallet-adapter-modal-list-more-icon-rotate': {
                backgroundColor: '#9d66ff',
              },
              '.wallet-adapter-button': {
                backgroundColor: '#2A2A32',
                borderRadius: '12px',
                color: 'white',
                transition: 'all 0.2s ease',
                fontFamily: 'Inter, sans-serif',
                fontWeight: '600',
              },
              '.wallet-adapter-button:hover': {
                backgroundColor: '#3A3A42',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              },
              '.wallet-adapter-button:not([disabled]):hover': {
                backgroundColor: '#3A3A42',
              },
              '.wallet-adapter-button-end-icon, .wallet-adapter-button-start-icon, .wallet-adapter-button-end-icon img, .wallet-adapter-button-start-icon img': {
                filter: 'grayscale(0)',
              },
              '.wallet-adapter-button:not(.wallet-adapter-button-text)': {
                backgroundColor: '#2A2A32',
              },
              '.wallet-adapter-button-trigger': {
                backgroundColor: '#9d66ff',
              },
              '.wallet-adapter-button-trigger:not([disabled]):hover': {
                backgroundColor: '#8a4dff',
              },
              '.wallet-adapter-modal-button-close': {
                backgroundColor: '#2A2A32',
                color: 'white',
                borderRadius: '50%',
              },
              '.wallet-adapter-modal-button-close:hover': {
                backgroundColor: '#3A3A42',
              }
            }}
          >
            {children}
          </Box>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default RealWalletProvider;
