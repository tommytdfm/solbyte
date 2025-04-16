import React, { FC, useMemo, useState, useCallback } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

interface WalletContextProviderProps {
  children: React.ReactNode;
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet;
  const [autoConnectEnabled, setAutoConnectEnabled] = useState(false);

  // Multiple RPC endpoints for better reliability
  const endpoints = useMemo(() => [
    clusterApiUrl(network),
    'https://api.devnet.solana.com',
    'https://solana-devnet.g.alchemy.com/v2/demo',
    'https://devnet.genesysgo.net/'
  ], [network]);

  // Use the first endpoint by default, but allow fallback
  const endpoint = useMemo(() => endpoints[0], [endpoints]);

  // Include more wallet adapters for better compatibility
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter()
    ],
    [network]
  );

  // Custom error handler for wallet connection
  const onError = useCallback((error: Error) => {
    console.error('Wallet connection error:', error);
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint} config={{ commitment: 'confirmed' }}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={autoConnectEnabled}
        onError={onError}
        localStorageKey="bytecoin-sol-wallet"
      >
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletContextProvider;
