// send-receive.js - Send and Receive functionality with transaction history

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

// Transaction history (simulated for demo)
const TRANSACTION_HISTORY = [
  {
    id: 'tx1',
    type: 'send',
    token: 'SOL',
    amount: 0.5,
    recipient: '8ZUczUAUSLTNmzAeKLJ9PuWVJ4YyMvfi3s1JvtZK4vMW',
    timestamp: Date.now() - 3600000, // 1 hour ago
    status: 'confirmed',
    signature: '5UfDuX9A2vn9NGwTD2QSVBRHhT9yT4QpRJMzBiNLbJCT1JjNzf8UmzUGUHSfENooCvUVXUUNMsXbdSFfvUm9jdZs'
  },
  {
    id: 'tx2',
    type: 'receive',
    token: 'USDC',
    amount: 25,
    sender: '6s5sjaPDYXVzbBnDjfxWqbD4K5qi9yvdWchtgoqDESjJ',
    timestamp: Date.now() - 86400000, // 1 day ago
    status: 'confirmed',
    signature: '4KsMmKpGXS6RLTXcqMnCDhzPNBhMvnUHzCoYkQAYBBD1qgDzbs7QWhXJSs7GNqJH7U5Vq9fVoFMK6dMzxwF4TxBs'
  },
  {
    id: 'tx3',
    type: 'send',
    token: 'S-BYTE',
    amount: 100,
    recipient: 'DRtXHDgC312wpNdNCSb8vPXAJ8B4rZGcK6JQwzWrDNPu',
    timestamp: Date.now() - 172800000, // 2 days ago
    status: 'confirmed',
    signature: '3KsMmKpGXS6RLTXcqMnCDhzPNBhMvnUHzCoYkQAYBBD1qgDzbs7QWhXJSs7GNqJH7U5Vq9fVoFMK6dMzxwF4TxBs'
  },
  {
    id: 'tx4',
    type: 'receive',
    token: 'SOL',
    amount: 1.2,
    sender: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
    timestamp: Date.now() - 259200000, // 3 days ago
    status: 'confirmed',
    signature: '2KsMmKpGXS6RLTXcqMnCDhzPNBhMvnUHzCoYkQAYBBD1qgDzbs7QWhXJSs7GNqJH7U5Vq9fVoFMK6dMzxwF4TxBs'
  },
  {
    id: 'tx5',
    type: 'send',
    token: 'USDC',
    amount: 50,
    recipient: '6s5sjaPDYXVzbBnDjfxWqbD4K5qi9yvdWchtgoqDESjJ',
    timestamp: Date.now() - 345600000, // 4 days ago
    status: 'confirmed',
    signature: '1KsMmKpGXS6RLTXcqMnCDhzPNBhMvnUHzCoYkQAYBBD1qgDzbs7QWhXJSs7GNqJH7U5Vq9fVoFMK6dMzxwF4TxBs'
  }
];

// Send/Receive state
let sendReceiveState = {
  activeTab: 'send',
  selectedToken: SOLANA_TOKENS[0],
  amount: '',
  recipient: '',
  memo: '',
  transactionHistory: TRANSACTION_HISTORY,
  qrValue: ''
};

// Initialize send/receive page
function initSendReceivePage() {
  // Check if wallet is connected
  if (!window.walletFunctions || !publicKey) {
    showSendReceiveConnectPrompt();
    return;
  }
  
  // Render send/receive tabs
  renderSendReceiveTabs();
  
  // Render active tab content
  renderActiveTabContent();
  
  // Render transaction history
  renderTransactionHistory();
  
  // Add event listeners
  addSendReceiveEventListeners();
}

// Render send/receive tabs
function renderSendReceiveTabs() {
  const sendReceiveSection = document.getElementById('send-receive-section');
  
  if (!sendReceiveSection) {
    console.error('Send/Receive section not found');
    return;
  }
  
  // Clear section
  sendReceiveSection.innerHTML = '';
  
  // Create tabs
  const tabsContainer = document.createElement('div');
  tabsContainer.className = 'tabs-container';
  
  tabsContainer.innerHTML = `
    <div class="tabs">
      <button class="tab-btn ${sendReceiveState.activeTab === 'send' ? 'active' : ''}" data-tab="send">Send</button>
      <button class="tab-btn ${sendReceiveState.activeTab === 'receive' ? 'active' : ''}" data-tab="receive">Receive</button>
      <button class="tab-btn ${sendReceiveState.activeTab === 'history' ? 'active' : ''}" data-tab="history">History</button>
    </div>
    <div id="tab-content" class="tab-content"></div>
  `;
  
  sendReceiveSection.appendChild(tabsContainer);
}

// Render active tab content
function renderActiveTabContent() {
  const tabContent = document.getElementById('tab-content');
  
  if (!tabContent) {
    console.error('Tab content container not found');
    return;
  }
  
  // Clear tab content
  tabContent.innerHTML = '';
  
  // Render content based on active tab
  switch (sendReceiveState.activeTab) {
    case 'send':
      renderSendTab(tabContent);
      break;
    case 'receive':
      renderReceiveTab(tabContent);
      break;
    case 'history':
      renderHistoryTab(tabContent);
      break;
    default:
      renderSendTab(tabContent);
  }
}

// Render send tab
function renderSendTab(container) {
  const sendForm = document.createElement('div');
  sendForm.className = 'send-form';
  
  // Create token selector
  const tokenOptions = SOLANA_TOKENS.map(token => {
    const isSelected = token.symbol === sendReceiveState.selectedToken.symbol;
    return `<option value="${token.symbol}" ${isSelected ? 'selected' : ''}>${token.symbol}</option>`;
  }).join('');
  
  sendForm.innerHTML = `
    <div class="form-group">
      <label for="token-select">Select Token</label>
      <div class="token-select-container">
        <select id="token-select" class="token-select">
          ${tokenOptions}
        </select>
        <div class="token-balance">
          <span>Balance: </span>
          <span id="token-balance-display">Loading...</span>
        </div>
      </div>
    </div>
    
    <div class="form-group">
      <label for="recipient-address">Recipient Address</label>
      <input type="text" id="recipient-address" class="form-input" placeholder="Enter Solana address" value="${sendReceiveState.recipient}">
    </div>
    
    <div class="form-group">
      <label for="amount">Amount</label>
      <div class="amount-input-container">
        <input type="number" id="amount" class="form-input" placeholder="0.00" value="${sendReceiveState.amount}" step="0.000001" min="0">
        <button id="max-amount-btn" class="max-btn">MAX</button>
      </div>
      <div class="amount-usd" id="amount-usd">≈ $0.00</div>
    </div>
    
    <div class="form-group">
      <label for="memo">Memo (Optional)</label>
      <input type="text" id="memo" class="form-input" placeholder="Add a note to this transaction" value="${sendReceiveState.memo}">
      <div class="memo-info">Memo is stored on-chain and visible to everyone</div>
    </div>
    
    <div class="fee-info">
      <div class="fee-row">
        <span class="fee-label">Network Fee:</span>
        <span class="fee-value" id="network-fee">0.000005 SOL</span>
      </div>
      <div class="fee-row">
        <span class="fee-label">ByteCoin Fee (3%):</span>
        <span class="fee-value" id="bytecoin-fee">0.00 ${sendReceiveState.selectedToken.symbol}</span>
      </div>
      <div class="fee-row total">
        <span class="fee-label">Total Amount:</span>
        <span class="fee-value" id="total-amount">0.00 ${sendReceiveState.selectedToken.symbol}</span>
      </div>
    </div>
    
    <button id="send-btn" class="action-btn primary">Send ${sendReceiveState.selectedToken.symbol}</button>
  `;
  
  container.appendChild(sendForm);
  
  // Update token balance
  updateTokenBalance();
  
  // Update fee calculations
  updateFeeCalculations();
}

// Render receive tab
function renderReceiveTab(container) {
  const receiveForm = document.createElement('div');
  receiveForm.className = 'receive-form';
  
  // Create token selector
  const tokenOptions = SOLANA_TOKENS.map(token => {
    const isSelected = token.symbol === sendReceiveState.selectedToken.symbol;
    return `<option value="${token.symbol}" ${isSelected ? 'selected' : ''}>${token.symbol}</option>`;
  }).join('');
  
  // Generate QR code value
  sendReceiveState.qrValue = `solana:${publicKey.toString()}?amount=0&token=${sendReceiveState.selectedToken.mint}`;
  
  receiveForm.innerHTML = `
    <div class="form-group">
      <label for="receive-token-select">Select Token</label>
      <select id="receive-token-select" class="token-select">
        ${tokenOptions}
      </select>
    </div>
    
    <div class="wallet-address-container">
      <label>Your Wallet Address</label>
      <div class="wallet-address">
        <span id="wallet-address-display">${publicKey.toString()}</span>
        <button id="copy-address-btn" class="copy-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="qr-code-container">
      <div id="qr-code" class="qr-code">
        <!-- QR code will be generated here -->
        <img src="https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(sendReceiveState.qrValue)}&size=200x200" alt="QR Code" />
      </div>
      <p class="qr-info">Scan this QR code to receive ${sendReceiveState.selectedToken.symbol}</p>
    </div>
    
    <div class="receive-instructions">
      <h3>Instructions</h3>
      <ol>
        <li>Select the token you want to receive</li>
        <li>Share your wallet address or QR code with the sender</li>
        <li>The sender will need to initiate the transaction from their wallet</li>
        <li>Once the transaction is confirmed, the tokens will appear in your wallet</li>
      </ol>
    </div>
  `;
  
  container.appendChild(receiveForm);
}

// Render history tab
function renderHistoryTab(container) {
  const historyContainer = document.createElement('div');
  historyContainer.className = 'history-container';
  
  // Create filter controls
  historyContainer.innerHTML = `
    <div class="history-filters">
      <div class="filter-group">
        <label for="history-filter">Filter</label>
        <select id="history-filter" class="filter-select">
          <option value="all">All Transactions</option>
          <option value="send">Sent</option>
          <option value="receive">Received</option>
        </select>
      </div>
      <div class="filter-group">
        <label for="token-filter">Token</label>
        <select id="token-filter" class="filter-select">
          <option value="all">All Tokens</option>
          ${SOLANA_TOKENS.map(token => `<option value="${token.symbol}">${token.symbol}</option>`).join('')}
        </select>
      </div>
    </div>
    
    <div id="transaction-list" class="transaction-list">
      <!-- Transaction history will be rendered here -->
    </div>
  `;
  
  container.appendChild(historyContainer);
  
  // Render transaction list
  renderTransactionList();
}

// Render transaction list
function renderTransactionList(filter = 'all', tokenFilter = 'all') {
  const transactionList = document.getElementById('transaction-list');
  
  if (!transactionList) {
    console.error('Transaction list container not found');
    return;
  }
  
  // Clear transaction list
  transactionList.innerHTML = '';
  
  // Filter transactions
  let filteredTransactions = [...sendReceiveState.transactionHistory];
  
  if (filter !== 'all') {
    filteredTransactions = filteredTransactions.filter(tx => tx.type === filter);
  }
  
  if (tokenFilter !== 'all') {
    filteredTransactions = filteredTransactions.filter(tx => tx.token === tokenFilter);
  }
  
  // Sort transactions by timestamp (newest first)
  filteredTransactions.sort((a, b) => b.timestamp - a.timestamp);
  
  // Check if there are any transactions
  if (filteredTransactions.length === 0) {
    transactionList.innerHTML = `
      <div class="no-transactions">
        <p>No transactions found</p>
      </div>
    `;
    return;
  }
  
  // Group transactions by date
  const groupedTransactions = groupTransactionsByDate(filteredTransactions);
  
  // Render grouped transactions
  for (const [date, transactions] of Object.entries(groupedTransactions)) {
    // Create date header
    const dateHeader = document.createElement('div');
    dateHeader.className = 'transaction-date-header';
    dateHeader.textContent = date;
    transactionList.appendChild(dateHeader);
    
    // Create transaction items
    transactions.forEach(tx => {
      const transactionItem = document.createElement('div');
      transactionItem.className = 'transaction-item';
      transactionItem.dataset.id = tx.id;
      
      const isSend = tx.type === 'send';
      const iconClass = isSend ? 'sent' : 'received';
      const amountPrefix = isSend ? '-' : '+';
      const addressLabel = isSend ? 'To:' : 'From:';
      const address = isSend ? tx.recipient : tx.sender;
      
      transactionItem.innerHTML = `
        <div class="transaction-icon ${iconClass}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${isSend 
              ? '<line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline>' 
              : '<line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline>'}
          </svg>
        </div>
        <div class="transaction-details">
          <span class="transaction-type">${isSend ? 'Sent' : 'Received'} ${tx.token}</span>
          <span class="transaction-address">${addressLabel} ${formatAddress(address)}</span>
          <span class="transaction-time">${formatTime(tx.timestamp)}</span>
        </div>
        <div class="transaction-amount">
          <span class="amount">${amountPrefix}${tx.amount} ${tx.token}</span>
          <span class="transaction-status ${tx.status}">${tx.status}</span>
        </div>
      `;
      
      // Add click event to show transaction details
      transactionItem.addEventListener('click', () => {
        showTransactionDetails(tx);
      });
      
      transactionList.appendChild(transactionItem);
    });
  }
}

// Group transactions by date
function groupTransactionsByDate(transactions) {
  const groups = {};
  
  transactions.forEach(tx => {
    const date = formatDate(tx.timestamp);
    
    if (!groups[date]) {
      groups[date] = [];
    }
    
    groups[date].push(tx);
  });
  
  return groups;
}

// Show transaction details
function showTransactionDetails(transaction) {
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'modal';
  
  const isSend = transaction.type === 'send';
  const addressLabel = isSend ? 'Recipient:' : 'Sender:';
  const address = isSend ? transaction.recipient : transaction.sender;
  
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Transaction Details</h2>
        <button class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div class="transaction-detail-row">
          <span class="detail-label">Type:</span>
          <span class="detail-value">${isSend ? 'Send' : 'Receive'}</span>
        </div>
        <div class="transaction-detail-row">
          <span class="detail-label">Token:</span>
          <span class="detail-value">${transaction.token}</span>
        </div>
        <div class="transaction-detail-row">
          <span class="detail-label">Amount:</span>
          <span class="detail-value">${transaction.amount} ${transaction.token}</span>
        </div>
        <div class="transaction-detail-row">
          <span class="detail-label">${addressLabel}</span>
          <span class="detail-value address">${address}</span>
        </div>
        <div class="transaction-detail-row">
          <span class="detail-label">Date:</span>
          <span class="detail-value">${formatDate(transaction.timestam
(Content truncated due to size limit. Use line ranges to read in chunks)