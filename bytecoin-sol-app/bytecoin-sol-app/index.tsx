import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';
import theme from '../theme';
import WalletContextProvider from '../WalletContextProvider';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider theme={theme}>
        <WalletContextProvider>
          <App />
        </WalletContextProvider>
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
);
