import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletContextProvider } from './contexts/WalletContextProvider';
import { TokenProvider } from './contexts/TokenContext';
import { TransferProvider } from './contexts/TransferContext';
import { AdminProvider } from './contexts/AdminContext';
import { GameProvider } from './contexts/GameContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import SendReceivePage from './pages/SendReceivePage';
import SwapPage from './pages/SwapPage';
import GamesPage from './pages/GamesPage';
import FeesPage from './pages/FeesPage';
import AdminPage from './pages/AdminPage';
import customTheme from './theme';

// Import fonts in index.html or via CSS import
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/roboto-mono/400.css';

function App() {
  return (
    <ChakraProvider theme={customTheme}>
      <WalletContextProvider>
        <TokenProvider>
          <TransferProvider>
            <AdminProvider>
              <GameProvider>
                <Router>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/portfolio" element={<PortfolioPage />} />
                      <Route path="/send-receive" element={<SendReceivePage />} />
                      <Route path="/swap" element={<SwapPage />} />
                      <Route path="/games" element={<GamesPage />} />
                      <Route path="/fees" element={<FeesPage />} />
                      <Route path="/admin" element={<AdminPage />} />
                    </Routes>
                  </Layout>
                </Router>
              </GameProvider>
            </AdminProvider>
          </TransferProvider>
        </TokenProvider>
      </WalletContextProvider>
    </ChakraProvider>
  );
}

export default App;
