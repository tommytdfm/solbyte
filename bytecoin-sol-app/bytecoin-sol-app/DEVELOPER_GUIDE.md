# ByteCoin on Sol App - Developer Guide

## Development Environment Setup

### Prerequisites

- Node.js (v16+)
- npm (v7+)
- Git

### Setting Up the Project

1. Clone the repository:
```bash
git clone https://github.com/your-organization/bytecoin-sol-app.git
cd bytecoin-sol-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```
REACT_APP_SOLANA_NETWORK=devnet
REACT_APP_ADMIN_WALLETS=YourWalletAddress1,YourWalletAddress2
```

4. Start the development server:
```bash
npm start
```

## Project Structure

The project follows a modular structure:

```
bytecoin-sol-app/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Layout.tsx    # Main layout with sidebar
│   │   └── ...
│   ├── contexts/         # React context providers
│   │   ├── WalletContextProvider.tsx  # Wallet connection
│   │   ├── TokenContext.tsx           # Token management
│   │   ├── TransferContext.tsx        # Token transfers
│   │   ├── AdminContext.tsx           # Admin functionality
│   │   └── GameContext.tsx            # Game functionality
│   ├── hooks/            # Custom React hooks
│   │   ├── useWalletHooks.ts   # Wallet-related hooks
│   │   ├── useTokenHooks.ts    # Token-related hooks
│   │   └── useAdminHooks.ts    # Admin-related hooks
│   ├── pages/            # Page components
│   │   ├── HomePage.tsx
│   │   ├── PortfolioPage.tsx
│   │   ├── SendReceivePage.tsx
│   │   ├── SwapPage.tsx
│   │   ├── GamesPage.tsx
│   │   ├── FeesPage.tsx
│   │   └── AdminPage.tsx
│   └── ...
```

## Key Components and Features

### Wallet Integration

The wallet integration is handled by the `WalletContextProvider` component, which uses the Solana Wallet Adapter library to connect to various wallets.

```typescript
// src/contexts/WalletContextProvider.tsx
export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter()
    ],
    [network]
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
```

### Token Management

Token management is handled by the `TokenContext` provider, which manages token balances, metadata, and transaction history.

```typescript
// src/contexts/TokenContext.tsx (simplified)
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
```

### Token Transfers with Fee Calculation

Token transfers are handled by the `TransferContext` provider, which calculates the 3% fee for S-BYTE transfers.

```typescript
// src/contexts/TransferContext.tsx (simplified)
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
    // Implementation details...
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
```

### Admin Authentication

Admin authentication is handled by the `AdminContext` provider, which verifies if the connected wallet is in the list of authorized administrators.

```typescript
// src/contexts/AdminContext.tsx (simplified)
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
  
  // Function to withdraw fees
  const withdrawFees = async (): Promise<boolean> => {
    // Implementation details...
  };
  
  // Function to update mint address
  const updateMintAddress = async (address: string): Promise<boolean> => {
    // Implementation details...
  };
  
  // Function to update game settings
  const updateGameSettings = async (minWager: number, maxWager: number): Promise<boolean> => {
    // Implementation details...
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
```

### PVP Games (Draughts)

The draughts game is implemented in the `GamesPage` component, with game logic and wagering handled by the `GameContext` provider.

```typescript
// src/contexts/GameContext.tsx (simplified)
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey } = useWallet();
  const { sByteToken, refreshBalances } = useToken();
  const toast = useToast();
  
  // Game wager hooks
  const { createWager: createWagerHook, settleWager: settleWagerHook, loading: isProcessingWager } = useGameWager();
  
  // Game settings
  const [minWager, setMinWager] = useState(5);
  const [maxWager, setMaxWager] = useState(1000);
  
  // Function to create a wager
  const createWager = async (amount: number): Promise<string | null> => {
    // Implementation details...
  };
  
  // Function to settle a wager
  const settleWager = async (wagerId: string, winner: string): Promise<boolean> => {
    // Implementation details...
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
```

## Webpack Configuration

The application uses webpack configuration overrides to handle Node.js polyfills required by Solana libraries.

```javascript
// config-overrides.js
const webpack = require('webpack');

module.exports = function override(config) {
  // Add fallbacks for node modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "http": require.resolve("stream-http"),
    "https": require.resolve("https-browserify"),
    "crypto": require.resolve("crypto-browserify"),
    "stream": require.resolve("stream-browserify"),
    "buffer": require.resolve("buffer"),
    "url": require.resolve("url"),
    "process": require.resolve("process/browser"),
    "zlib": require.resolve("browserify-zlib")
  };

  // Add plugins
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process'
    })
  ];

  return config;
};
```

## Testing

The application includes tests for components and functionality using React Testing Library.

```typescript
// src/tests/App.test.tsx (simplified)
describe('ByteCoin on Sol App', () => {
  test('renders the app with wallet connected', async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    // Check if the app renders with wallet connected
    await waitFor(() => {
      expect(screen.getByText(/Welcome to ByteCoin on Sol!/i)).toBeInTheDocument();
    });
  });
  
  // More tests...
});
```

## Deployment

The application is deployed to Vercel with the following configuration:

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "build": {
    "env": {
      "REACT_APP_SOLANA_NETWORK": "devnet",
      "REACT_APP_ADMIN_WALLETS": "AuthorizedWallet1,AuthorizedWallet2,AuthorizedWallet3"
    }
  }
}
```

## Extending the Application

### Adding New Features

1. Create new components in the appropriate directories
2. Update the routing in `App.tsx` if adding new pages
3. Add new context providers if needed for state management
4. Update the sidebar navigation in `Layout.tsx`

### Modifying the Token Configuration

To change the S-BYTE token mint address:

1. Update the `defaultMint` value in `src/hooks/useTokenHooks.ts`
2. Or use the admin panel to update it at runtime

### Adding New Wallet Adapters

To add support for new wallets:

1. Install the required adapter package
2. Import the adapter in `src/contexts/WalletContextProvider.tsx`
3. Add the new adapter to the `wallets` array

## Troubleshooting Development Issues

### Common Build Errors

1. **Node.js Polyfill Errors**: If you encounter errors related to missing Node.js modules, ensure the webpack configuration in `config-overrides.js` includes the necessary polyfills.

2. **TypeScript Errors**: If you encounter TypeScript errors, check the type definitions and ensure all props are properly typed.

3. **Solana Connection Errors**: If you encounter errors connecting to the Solana network, ensure you're using the correct network endpoint and have the necessary permissions.

### Debugging Tips

1. Use the browser console to check for errors
2. Use React DevTools to inspect component state and props
3. Use the Solana Explorer to verify transactions on the blockchain
4. Check the Solana network status if transactions are failing
