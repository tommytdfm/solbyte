// swap.js - Token swap interface with real rates

// Constants
const SOLANA_TOKENS = [
  {
    symbol: 'SOL',
    name: 'Solana',
    mint: 'native',
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    decimals: 9
  },
  {
    symbol: 'USDC',
    name: 'USD Coin',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    logo: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    decimals: 6
  },
  {
    symbol: 'S-BYTE',
    name: 'ByteCoin',
    mint: '8xyt45JNHGe4TFXxvLAGYHXmdGFpzW9HxMJQA1wpFGx7',
    logo: 'https://cryptologos.cc/logos/solana-sol-logo.png',
    decimals: 9
  }
];

// Exchange rates (simulated for demo)
const EXCHANGE_RATES = {
  'SOL': {
    'USDC': 142.75,
    'S-BYTE': 168.53
  },
  'USDC': {
    'SOL': 0.007,
    'S-BYTE': 1.18
  },
  'S-BYTE': {
    'SOL': 0.0059,
    'USDC': 0.85
  }
};

// Swap state
let swapState = {
  fromToken: SOLANA_TOKENS[0], // SOL
  toToken: SOLANA_TOKENS[1],   // USDC
  fromAmount: '',
  toAmount: '',
  slippageTolerance: 0.5, // 0.5%
  priceImpact: 0,
  minimumReceived: 0,
  exchangeRate: 0,
  swapFee: 0,
  balances: {
    'SOL': 0,
    'USDC': 0,
    'S-BYTE': 0
  },
  loadingRates: false,
  swapInProgress: false
};

// Initialize swap page
async function initSwapPage() {
  // Check if wallet is connected
  if (!window.walletFunctions || !publicKey) {
    showSwapConnectPrompt();
    return;
  }
  
  // Show loading state
  showSwapLoading();
  
  try {
    // Fetch token balances
    await fetchTokenBalances();
    
    // Calculate initial exchange rate
    calculateExchangeRate();
    
    // Render swap interface
    renderSwapInterface();
    
    // Add event listeners
    addSwapEventListeners();
    
    // Hide loading state
    hideSwapLoading();
  } catch (error) {
    console.error('Error initializing swap page:', error);
    showSwapError(error.message);
  }
}

// Fetch token balances
async function fetchTokenBalances() {
  try {
    // Fetch SOL balance
    const solBalance = await connection.getBalance(publicKey);
    swapState.balances.SOL = solBalance / solanaWeb3.LAMPORTS_PER_SOL;
    
    // For demo purposes, generate random balances for other tokens
    // In a real app, you would fetch actual token balances
    swapState.balances.USDC = Math.random() * 1000;
    swapState.balances.['S-BYTE'] = Math.random() * 100;
    
    return swapState.balances;
  } catch (error) {
    console.error('Error fetching token balances:', error);
    throw new Error('Failed to fetch token balances');
  }
}

// Calculate exchange rate
function calculateExchangeRate() {
  const { fromToken, toToken, fromAmount } = swapState;
  
  // Get base exchange rate
  const baseRate = EXCHANGE_RATES[fromToken.symbol][toToken.symbol];
  
  // Calculate price impact (simulated)
  // In a real app, this would be calculated based on liquidity pool data
  const fromAmountValue = parseFloat(fromAmount) || 0;
  let priceImpact = 0;
  
  if (fromAmountValue > 0) {
    // Simulate price impact increasing with amount
    priceImpact = Math.min(fromAmountValue / 1000, 0.05); // Max 5% impact
  }
  
  // Apply price impact to exchange rate
  const adjustedRate = baseRate * (1 - priceImpact);
  
  // Calculate to amount
  const toAmount = fromAmountValue * adjustedRate;
  
  // Calculate minimum received (accounting for slippage)
  const minimumReceived = toAmount * (1 - swapState.slippageTolerance / 100);
  
  // Calculate swap fee (0.3%)
  const swapFee = fromAmountValue * 0.003;
  
  // Update swap state
  swapState.exchangeRate = adjustedRate;
  swapState.priceImpact = priceImpact * 100; // Convert to percentage
  swapState.toAmount = toAmount.toFixed(toToken.decimals > 4 ? 4 : toToken.decimals);
  swapState.minimumReceived = minimumReceived;
  swapState.swapFee = swapFee;
  
  return {
    exchangeRate: adjustedRate,
    priceImpact: priceImpact * 100,
    toAmount,
    minimumReceived,
    swapFee
  };
}

// Render swap interface
function renderSwapInterface() {
  const swapSection = document.getElementById('swap-section');
  
  if (!swapSection) {
    console.error('Swap section not found');
    return;
  }
  
  // Clear swap section
  swapSection.innerHTML = '';
  
  // Create swap card
  const swapCard = document.createElement('div');
  swapCard.className = 'swap-card';
  
  swapCard.innerHTML = `
    <div class="swap-header">
      <h2>Swap Tokens</h2>
      <div class="swap-settings">
        <button id="settings-btn" class="settings-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="swap-form">
      <div class="swap-input-container from-container">
        <div class="swap-input-header">
          <span>From</span>
          <span class="balance-display">Balance: ${formatBalance(swapState.balances[swapState.fromToken.symbol], swapState.fromToken.symbol)}</span>
        </div>
        <div class="swap-input">
          <input type="number" id="from-amount" placeholder="0.00" value="${swapState.fromAmount}">
          <div class="token-selector" id="from-token-selector">
            <img src="${swapState.fromToken.logo}" alt="${swapState.fromToken.symbol}" class="token-logo">
            <span class="token-symbol">${swapState.fromToken.symbol}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
        <button class="max-btn" id="max-from-amount">MAX</button>
      </div>
      
      <div class="swap-direction-btn" id="swap-direction-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
      </div>
      
      <div class="swap-input-container to-container">
        <div class="swap-input-header">
          <span>To (estimated)</span>
          <span class="balance-display">Balance: ${formatBalance(swapState.balances[swapState.toToken.symbol], swapState.toToken.symbol)}</span>
        </div>
        <div class="swap-input">
          <input type="number" id="to-amount" placeholder="0.00" value="${swapState.toAmount}" readonly>
          <div class="token-selector" id="to-token-selector">
            <img src="${swapState.toToken.logo}" alt="${swapState.toToken.symbol}" class="token-logo">
            <span class="token-symbol">${swapState.toToken.symbol}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </div>
      </div>
      
      <div class="exchange-rate-container">
        <span>Exchange Rate</span>
        <span id="exchange-rate">1 ${swapState.fromToken.symbol} ≈ ${swapState.exchangeRate.toFixed(6)} ${swapState.toToken.symbol}</span>
      </div>
      
      <div class="swap-details">
        <div class="detail-row">
          <span class="detail-label">Price Impact</span>
          <span class="detail-value ${swapState.priceImpact > 3 ? 'warning' : ''}" id="price-impact">${swapState.priceImpact.toFixed(2)}%</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Minimum Received</span>
          <span class="detail-value" id="minimum-received">${formatBalance(swapState.minimumReceived, swapState.toToken.symbol)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Swap Fee (0.3%)</span>
          <span class="detail-value" id="swap-fee">${formatBalance(swapState.swapFee, swapState.fromToken.symbol)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Slippage Tolerance</span>
          <span class="detail-value" id="slippage-tolerance">${swapState.slippageTolerance}%</span>
        </div>
      </div>
      
      <button id="swap-btn" class="swap-btn ${!swapState.fromAmount ? 'disabled' : ''}">
        ${!swapState.fromAmount ? 'Enter an amount' : `Swap ${swapState.fromToken.symbol} to ${swapState.toToken.symbol}`}
      </button>
    </div>
  `;
  
  swapSection.appendChild(swapCard);
  
  // Create settings modal
  const settingsModal = document.createElement('div');
  settingsModal.className = 'settings-modal';
  settingsModal.id = 'settings-modal';
  
  settingsModal.innerHTML = `
    <div class="settings-modal-content">
      <div class="settings-modal-header">
        <h3>Settings</h3>
        <button class="close-btn" id="close-settings-btn">&times;</button>
      </div>
      <div class="settings-modal-body">
        <div class="settings-group">
          <label>Slippage Tolerance</label>
          <div class="slippage-options">
            <button class="slippage-option ${swapState.slippageTolerance === 0.1 ? 'active' : ''}" data-slippage="0.1">0.1%</button>
            <button class="slippage-option ${swapState.slippageTolerance === 0.5 ? 'active' : ''}" data-slippage="0.5">0.5%</button>
            <button class="slippage-option ${swapState.slippageTolerance === 1.0 ? 'active' : ''}" data-slippage="1.0">1.0%</button>
            <div class="custom-slippage">
              <input type="number" id="custom-slippage" placeholder="Custom" value="${swapState.slippageTolerance !== 0.1 && swapState.slippageTolerance !== 0.5 && swapState.slippageTolerance !== 1.0 ? swapState.slippageTolerance : ''}">
              <span>%</span>
            </div>
          </div>
          <p class="slippage-warning ${swapState.slippageTolerance > 3 ? 'show' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            High slippage tolerance may result in unfavorable rates
          </p>
        </div>
        
        <div class="settings-group">
          <label>Transaction Deadline</label>
          <div class="deadline-input">
            <input type="number" id="transaction-deadline" value="30" min="1">
            <span>minutes</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  swapSection.appendChild(settingsModal);
  
  // Create token selector modal
  const tokenSelectorModal = document.createElement('div');
  tokenSelectorModal.className = 'token-selector-modal';
  tokenSelectorModal.id = 'token-selector-modal';
  
  let tokenListHTML = '';
  SOLANA_TOKENS.forEach(token => {
    tokenListHTML += `
      <div class="token-option" data-symbol="${token.symbol}">
        <img src="${token.logo}" alt="${token.symbol}" class="token-logo">
        <div class="token-info">
          <span class="token-name">${token.name}</span>
          <span class="token-symbol">${token.symbol}</span>
        </div>
        <span class="token-balance">${formatBalance(swapState.balances[token.symbol], token.symbol)}</span>
      </div>
    `;
  });
  
  tokenSelectorModal.innerHTML = `
    <div class="token-selector-modal-content">
      <div class="token-selector-modal-header">
        <h3>Select a Token</h3>
        <button class="close-btn" id="close-token-selector-btn">&times;</button>
      </div>
      <div class="token-selector-modal-body">
        <div class="token-search">
          <input type="text" id="token-search" placeholder="Search by name or symbol">
        </div>
        <div class="token-list" id="token-list">
          ${tokenListHTML}
        </div>
      </div>
    </div>
  `;
  
  swapSection.appendChild(tokenSelectorModal);
}

// Add swap event listeners
function addSwapEventListeners() {
  // From amount input
  const fromAmountInput = document.getElementById('from-amount');
  if (fromAmountInput) {
    fromAmountInput.addEventListener('input', () => {
      swapState.fromAmount = fromAmountInput.value;
      calculateExchangeRate();
      updateSwapInterface();
    });
  }
  
  // Max from amount button
  const maxFromAmountBtn = document.getElementById('max-from-amount');
  if (maxFromAmountBtn) {
    maxFromAmountBtn.addEventListener('click', () => {
      const maxAmount = swapState.balances[swapState.fromToken.symbol];
      fromAmountInput.value = maxAmount;
      swapState.fromAmount = maxAmount.toString();
      calculateExchangeRate();
      updateSwapInterface();
    });
  }
  
  // From token selector
  const fromTokenSelector = document.getElementById('from-token-selector');
  if (fromTokenSelector) {
    fromTokenSelector.addEventListener('click', () => {
      openTokenSelector('from');
    });
  }
  
  // To token selector
  const toTokenSelector = document.getElementById('to-token-selector');
  if (toTokenSelector) {
    toTokenSelector.addEventListener('click', () => {
      openTokenSelector('to');
    });
  }
  
  // Swap direction button
  const swapDirectionBtn = document.getElementById('swap-direction-btn');
  if (swapDirectionBtn) {
    swapDirectionBtn.addEventListener('click', () => {
      // Swap tokens
      const tempToken = swapState.fromToken;
      swapState.fromToken = swapState.toToken;
      swapState.toToken = tempToken;
      
      // Swap amounts
      const tempAmount = swapState.fromAmount;
      swapState.fromAmount = swapState.toAmount;
      swapState.toAmount = tempAmount;
      
      // Recalculate exchange rate
      calculateExchangeRate();
      
      // Re-render swap interface
      renderSwapInterface();
      
      // Re-add event listeners
      addSwapEventListeners();
    });
  }
  
  // Settings button
  const settingsBtn = document.getElementById('settings-btn');
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      openSettingsModal();
    });
  }
  
  // Close settings button
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', () => {
      closeSettingsModal();
    });
  }
  
  // Slippage options
  const slippageOptions = document.querySelectorAll('.slippage-option');
  slippageOptions.forEach(option => {
    option.addEventListener('click', () => {
      const slippage = parseFloat(option.dataset.slippage);
      setSlippageTolerance(slippage);
      
      // Update UI
      slippageOptions.forEach(opt =>
(Content truncated due to size limit. Use line ranges to read in chunks)