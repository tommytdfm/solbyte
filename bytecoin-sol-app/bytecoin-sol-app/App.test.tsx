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
import App from '../App';

// Mock the wallet adapter
jest.mock('@solana/wallet-adapter-react', () => ({
  useWallet: () => ({
    publicKey: { toString: () => 'TestWalletAddress' },
    connected: true,
    connect: jest.fn(),
    disconnect: jest.fn(),
    signMessage: jest.fn(),
    sendTransaction: jest.fn(),
  }),
  useConnection: () => ({
    connection: {
      getBalance: jest.fn().mockResolvedValue(1000000000),
      getLatestBlockhash: jest.fn().mockResolvedValue({ blockhash: 'test-blockhash' }),
      confirmTransaction: jest.fn().mockResolvedValue(true),
    },
  }),
  WalletAdapterNetwork: {
    Devnet: 'devnet',
  },
}));

// Mock the SPL token functions
jest.mock('@solana/spl-token', () => ({
  getAssociatedTokenAddress: jest.fn().mockResolvedValue({ toString: () => 'TestTokenAddress' }),
  createTransferCheckedInstruction: jest.fn(),
  getAccount: jest.fn().mockResolvedValue({ amount: BigInt(1000000000) }),
  getMint: jest.fn().mockResolvedValue({ decimals: 9, supply: BigInt(1000000000000) }),
  createWithdrawWithheldTokensFromAccountsInstruction: jest.fn(),
  TOKEN_PROGRAM_ID: 'token-program-id',
  TOKEN_2022_PROGRAM_ID: 'token-2022-program-id',
}));

// Mock the web3.js functions
jest.mock('@solana/web3.js', () => ({
  PublicKey: class {
    private keyValue: string;
    
    constructor(key: string) {
      this.keyValue = key;
    }
    toString() {
      return this.keyValue;
    }
  },
  Transaction: class {
    instructions: any[];
    constructor() {
      this.instructions = [];
    }
    add(instruction: any) {
      this.instructions.push(instruction);
      return this;
    }
  },
  SystemProgram: {
    transfer: jest.fn(),
  },
  LAMPORTS_PER_SOL: 1000000000,
  clusterApiUrl: jest.fn().mockReturnValue('https://api.devnet.solana.com'),
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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
  
  test('navigation works correctly', async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    // Check if navigation links are present
    await waitFor(() => {
      expect(screen.getByText(/Portfolio/i)).toBeInTheDocument();
      expect(screen.getByText(/Send\/Receive/i)).toBeInTheDocument();
      expect(screen.getByText(/Swap to ByteCoin/i)).toBeInTheDocument();
      expect(screen.getByText(/Games/i)).toBeInTheDocument();
      expect(screen.getByText(/Fees Raised/i)).toBeInTheDocument();
    });
    
    // Test navigation to Portfolio page
    fireEvent.click(screen.getByText(/Portfolio/i));
    await waitFor(() => {
      expect(screen.getByText(/Your Portfolio/i)).toBeInTheDocument();
    });
    
    // Test navigation to Send/Receive page
    fireEvent.click(screen.getByText(/Send\/Receive/i));
    await waitFor(() => {
      expect(screen.getByText(/Send & Receive Tokens/i)).toBeInTheDocument();
    });
    
    // Test navigation to Swap page
    fireEvent.click(screen.getByText(/Swap to ByteCoin/i));
    await waitFor(() => {
      expect(screen.getByText(/Swap to ByteCoin/i)).toBeInTheDocument();
      expect(screen.getByText(/Coming Soon/i)).toBeInTheDocument();
    });
    
    // Test navigation to Games page
    fireEvent.click(screen.getByText(/Games/i));
    await waitFor(() => {
      expect(screen.getByText(/Draughts \(Checkers\)/i)).toBeInTheDocument();
    });
    
    // Test navigation to Fees page
    fireEvent.click(screen.getByText(/Fees Raised/i));
    await waitFor(() => {
      expect(screen.getByText(/Total Fees Raised/i)).toBeInTheDocument();
    });
  });
  
  test('wallet connection status is displayed', async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    // Check if wallet address is displayed (truncated)
    await waitFor(() => {
      const walletAddressElement = screen.getByText(/Test...ress/i);
      expect(walletAddressElement).toBeInTheDocument();
    });
  });
  
  test('token balance is displayed on portfolio page', async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    // Navigate to Portfolio page
    fireEvent.click(screen.getByText(/Portfolio/i));
    
    // Check if token balance is displayed
    await waitFor(() => {
      expect(screen.getByText(/S-BYTE Balance/i)).toBeInTheDocument();
      expect(screen.getByText(/SOL Balance/i)).toBeInTheDocument();
      expect(screen.getByText(/Total Portfolio Value/i)).toBeInTheDocument();
    });
  });
  
  test('send token form works correctly', async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    // Navigate to Send/Receive page
    fireEvent.click(screen.getByText(/Send\/Receive/i));
    
    // Check if send form is displayed
    await waitFor(() => {
      expect(screen.getByText(/Send & Receive Tokens/i)).toBeInTheDocument();
      expect(screen.getByText(/Available Balance/i)).toBeInTheDocument();
    });
    
    // Fill in recipient address
    const recipientInput = screen.getByPlaceholderText(/Enter Solana wallet address/i);
    fireEvent.change(recipientInput, { target: { value: 'RecipientWalletAddress' } });
    
    // Fill in amount
    const amountInput = screen.getByPlaceholderText(/Amount of S-BYTE to send/i);
    fireEvent.change(amountInput, { target: { value: '10' } });
    
    // Check if fee calculation is displayed
    await waitFor(() => {
      expect(screen.getByText(/Fee \(3%\):/i)).toBeInTheDocument();
      expect(screen.getByText(/Recipient receives:/i)).toBeInTheDocument();
    });
  });
  
  test('games page displays draughts game', async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    // Navigate to Games page
    fireEvent.click(screen.getByText(/Games/i));
    
    // Check if draughts game is displayed
    await waitFor(() => {
      expect(screen.getByText(/Draughts \(Checkers\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Challenge other players to a game of draughts/i)).toBeInTheDocument();
      expect(screen.getByText(/Start a Game/i)).toBeInTheDocument();
    });
  });
  
  test('fees page displays fee information', async () => {
    render(
      <TestWrapper>
        <App />
      </TestWrapper>
    );
    
    // Navigate to Fees page
    fireEvent.click(screen.getByText(/Fees Raised/i));
    
    // Check if fee information is displayed
    await waitFor(() => {
      expect(screen.getByText(/Total Fees Raised/i)).toBeInTheDocument();
      expect(screen.getByText(/Fee Allocation/i)).toBeInTheDocument();
      expect(screen.getByText(/Weekly Fees Collected/i)).toBeInTheDocument();
      expect(screen.getByText(/ByteCoin Blockchain Development Progress/i)).toBeInTheDocument();
    });
  });
});
