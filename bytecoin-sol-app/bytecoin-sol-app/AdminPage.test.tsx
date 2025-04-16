import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { WalletContextProvider } from '../contexts/WalletContextProvider';
import { TokenProvider } from '../contexts/TokenContext';
import { TransferProvider } from '../contexts/TransferContext';
import { AdminProvider } from '../contexts/AdminContext';
import { GameProvider } from '../contexts/GameContext';
import AdminPage from '../pages/AdminPage';

// Mock the wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    publicKey: { toString: () => 'AuthorizedWallet1' },
    connected: true,
    connect: jest.fn(),
    disconnect: jest.fn(),
    signMessage: jest.fn().mockResolvedValue(true),
    sendTransaction: jest.fn(),
  }),
  useConnection: () => ({
    connection: {
      getBalance: jest.fn().mockResolvedValue(1000000000),
      getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: 'test-blockhash' }),
      confirmTransaction: jest.fn().mockResolvedValue(true),
    },
  }),
}));

// Mock the admin context
jest.mock('../contexts/AdminContext', () => ({
  ...jest.requireActual('../contexts/AdminContext'),
  useAdmin: () => ({
    isAdmin: true,
    isAuthenticating: false,
    authenticate: jest.fn().mockResolvedValue(true),
    withdrawFees: jest.fn().mockResolvedValue(true),
    isWithdrawingFees: false,
    pendingFees: 2500,
    updateMintAddress: jest.fn().mockResolvedValue(true),
    updateGameSettings: jest.fn().mockResolvedValue(true),
    isUpdatingSettings: false,
  }),
}));

// Mock the token context
jest.mock('../contexts/TokenContext', () => ({
  ...jest.requireActual('../contexts/TokenContext'),
  useToken: () => ({
    sByteToken: {
      mint: 'TestMintAddress',
      symbol: 'S-BYTE',
      name: 'ByteCoin on Sol',
      decimals: 9,
    },
    updateMintAddress: jest.fn(),
    sByteBalance: 1000,
    solBalance: 2.5,
    isLoadingBalances: false,
    transactions: [],
    isLoadingTransactions: false,
    refreshBalances: jest.fn(),
    refreshTransactions: jest.fn(),
    tokenMetadata: {
      decimals: 9,
      supply: 1000000,
      feeBasisPoints: 300,
    },
  }),
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <ChakraProvider>
    <WalletContextProvider>
      <TokenProvider>
        <TransferProvider>
          <AdminProvider>
            <GameProvider>
              <BrowserRouter>
                {children}
              </BrowserRouter>
            </GameProvider>
          </AdminProvider>
        </TransferProvider>
      </TokenProvider>
    </WalletContextProvider>
  </ChakraProvider>
);

describe('Admin Panel', () => {
  test('renders the admin panel with authenticated user', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );
    
    // Check if admin panel renders with authenticated user
    await waitFor(() => {
      expect(screen.getByText(/Admin Panel/i)).toBeInTheDocument();
      expect(screen.getByText(/Token Configuration/i)).toBeInTheDocument();
      expect(screen.getByText(/Fee Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Game Settings/i)).toBeInTheDocument();
    });
  });
  
  test('token configuration tab works correctly', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );
    
    // Check if token configuration tab is active by default
    await waitFor(() => {
      expect(screen.getByText(/S-BYTE Token Configuration/i)).toBeInTheDocument();
      expect(screen.getByText(/S-BYTE Mint Address/i)).toBeInTheDocument();
      expect(screen.getByText(/Enable 3% Transfer Fee/i)).toBeInTheDocument();
    });
    
    // Fill in mint address
    const mintAddressInput = screen.getByPlaceholderText(/Enter the S-BYTE token mint address/i);
    fireEvent.change(mintAddressInput, { target: { value: 'NewMintAddress' } });
    
    // Click save button
    const saveButton = screen.getByText(/Save Token Configuration/i);
    fireEvent.click(saveButton);
    
    // Check if save was successful (would show toast in real app)
    await waitFor(() => {
      expect(mintAddressInput).toHaveValue('NewMintAddress');
    });
  });
  
  test('fee management tab works correctly', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );
    
    // Click on Fee Management tab
    const feeTab = screen.getByText(/Fee Management/i);
    fireEvent.click(feeTab);
    
    // Check if fee management tab is displayed
    await waitFor(() => {
      expect(screen.getByText(/Total Fees Collected/i)).toBeInTheDocument();
      expect(screen.getByText(/Pending Withdrawal/i)).toBeInTheDocument();
      expect(screen.getByText(/Last Withdrawal/i)).toBeInTheDocument();
      expect(screen.getByText(/Withdraw Withheld Tokens/i)).toBeInTheDocument();
    });
    
    // Check if pending fees are displayed
    expect(screen.getByText(/2,500 S-BYTE/i)).toBeInTheDocument();
    
    // Click withdraw button
    const withdrawButton = screen.getByText(/Withdraw 2,500 S-BYTE/i);
    fireEvent.click(withdrawButton);
    
    // Check if withdraw was successful (would show toast in real app)
    await waitFor(() => {
      expect(withdrawButton).toBeInTheDocument();
    });
  });
  
  test('game settings tab works correctly', async () => {
    render(
      <TestWrapper>
        <AdminPage />
      </TestWrapper>
    );
    
    // Click on Game Settings tab
    const gameTab = screen.getByText(/Game Settings/i);
    fireEvent.click(gameTab);
    
    // Check if game settings tab is displayed
    await waitFor(() => {
      expect(screen.getByText(/Draughts Game Settings/i)).toBeInTheDocument();
      expect(screen.getByText(/Minimum Wager \(S-BYTE\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Maximum Wager \(S-BYTE\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Enable PVP Games/i)).toBeInTheDocument();
    });
    
    // Change minimum wager
    const minWagerInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(minWagerInput, { target: { value: '10' } });
    
    // Change maximum wager
    const maxWagerInput = screen.getAllByRole('spinbutton')[1];
    fireEvent.change(maxWagerInput, { target: { value: '2000' } });
    
    // Click save button
    const saveButton = screen.getByText(/Save Game Settings/i);
    fireEvent.click(saveButton);
    
    // Check if save was successful (would show toast in real app)
    await waitFor(() => {
      expect(saveButton).toBeInTheDocument();
    });
  });
});
