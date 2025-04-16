// fees.js - Comprehensive fees dashboard

// Constants
const ADMIN_ADDRESS = '6s5sjaPDYXVzbBnDjfxWqbD4K5qi9yvdWchtgoqDESjJ';
const FEE_PERCENTAGE = 3; // 3%

// Fee state
let feeState = {
  totalFeesCollected: 0,
  feeTransactions: [],
  feeDistribution: {
    development: 40, // 40% of fees go to development
    marketing: 30,   // 30% of fees go to marketing
    treasury: 20,    // 20% of fees go to treasury
    community: 10    // 10% of fees go to community rewards
  },
  timeFilter: 'all',
  tokenFilter: 'all',
  chartPeriod: 'week',
  isLoading: false
};

// Sample fee transactions (for demo purposes)
const SAMPLE_FEE_TRANSACTIONS = [
  {
    id: 'tx1',
    timestamp: Date.now() - 3600000 * 2, // 2 hours ago
    token: 'SOL',
    amount: 0.015,
    usdValue: 2.14,
    sender: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
    transactionType: 'swap',
    signature: '5UfDuX9A2vn9NGwTD2QSVBRHhT9yT4QpRJMzBiNLbJCT1JjNzf8UmzUGUHSfENooCvUVXUUNMsXbdSFfvUm9jdZs'
  },
  {
    id: 'tx2',
    timestamp: Date.now() - 3600000 * 5, // 5 hours ago
    token: 'USDC',
    amount: 0.75,
    usdValue: 0.75,
    sender: '8ZUczUAUSLTNmzAeKLJ9PuWVJ4YyMvfi3s1JvtZK4vMW',
    transactionType: 'transfer',
    signature: '4KsMmKpGXS6RLTXcqMnCDhzPNBhMvnUHzCoYkQAYBBD1qgDzbs7QWhXJSs7GNqJH7U5Vq9fVoFMK6dMzxwF4TxBs'
  },
  {
    id: 'tx3',
    timestamp: Date.now() - 3600000 * 24, // 1 day ago
    token: 'S-BYTE',
    amount: 3.0,
    usdValue: 3.6,
    sender: 'DRtXHDgC312wpNdNCSb8vPXAJ8B4rZGcK6JQwzWrDNPu',
    transactionType: 'swap',
    signature: '3KsMmKpGXS6RLTXcqMnCDhzPNBhMvnUHzCoYkQAYBBD1qgDzbs7QWhXJSs7GNqJH7U5Vq9fVoFMK6dMzxwF4TxBs'
  },
  {
    id: 'tx4',
    timestamp: Date.now() - 3600000 * 48, // 2 days ago
    token: 'SOL',
    amount: 0.036,
    usdValue: 5.14,
    sender: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
    transactionType: 'transfer',
    signature: '2KsMmKpGXS6RLTXcqMnCDhzPNBhMvnUHzCoYkQAYBBD1qgDzbs7QWhXJSs7GNqJH7U5Vq9fVoFMK6dMzxwF4TxBs'
  },
  {
    id: 'tx5',
    timestamp: Date.now() - 3600000 * 72, // 3 days ago
    token: 'USDC',
    amount: 1.5,
    usdValue: 1.5,
    sender: '6s5sjaPDYXVzbBnDjfxWqbD4K5qi9yvdWchtgoqDESjJ',
    transactionType: 'game',
    signature: '1KsMmKpGXS6RLTXcqMnCDhzPNBhMvnUHzCoYkQAYBBD1qgDzbs7QWhXJSs7GNqJH7U5Vq9fVoFMK6dMzxwF4TxBs'
  },
  {
    id: 'tx6',
    timestamp: Date.now() - 3600000 * 96, // 4 days ago
    token: 'S-BYTE',
    amount: 5.0,
    usdValue: 6.0,
    sender: 'DRtXHDgC312wpNdNCSb8vPXAJ8B4rZGcK6JQwzWrDNPu',
    transactionType: 'swap',
    signature: '0KsMmKpGXS6RLTXcqMnCDhzPNBhMvnUHzCoYkQAYBBD1qgDzbs7QWhXJSs7GNqJH7U5Vq9fVoFMK6dMzxwF4TxBs'
  },
  {
    id: 'tx7',
    timestamp: Date.now() - 3600000 * 120, // 5 days ago
    token: 'SOL',
    amount: 0.021,
    usdValue: 3.0,
    sender: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
    transactionType: 'transfer',
    signature: 'ZKsMmKpGXS6RLTXcqMnCDhzPNBhMvnUHzCoYkQAYBBD1qgDzbs7QWhXJSs7GNqJH7U5Vq9fVoFMK6dMzxwF4TxBs'
  },
  {
    id: 'tx8',
    timestamp: Date.now() - 3600000 * 144, // 6 days ago
    token: 'USDC',
    amount: 2.25,
    usdValue: 2.25,
    sender: '8ZUczUAUSLTNmzAeKLJ9PuWVJ4YyMvfi3s1JvtZK4vMW',
    transactionType: 'game',
    signature: 'YKsMmKpGXS6RLTXcqMnCDhzPNBhMvnUHzCoYkQAYBBD1qgDzbs7QWhXJSs7GNqJH7U5Vq9fVoFMK6dMzxwF4TxBs'
  },
  {
    id: 'tx9',
    timestamp: Date.now() - 3600000 * 168, // 7 days ago
    token: 'S-BYTE',
    amount: 7.5,
    usdValue: 9.0,
    sender: 'DRtXHDgC312wpNdNCSb8vPXAJ8B4rZGcK6JQwzWrDNPu',
    transactionType: 'swap',
    signature: 'XKsMmKpGXS6RLTXcqMnCDhzPNBhMvnUHzCoYkQAYBBD1qgDzbs7QWhXJSs7GNqJH7U5Vq9fVoFMK6dMzxwF4TxBs'
  },
  {
    id: 'tx10',
    timestamp: Date.now() - 3600000 * 192, // 8 days ago
    token: 'SOL',
    amount: 0.042,
    usdValue: 6.0,
    sender: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
    transactionType: 'transfer',
    signature: 'WKsMmKpGXS6RLTXcqMnCDhzPNBhMvnUHzCoYkQAYBBD1qgDzbs7QWhXJSs7GNqJH7U5Vq9fVoFMK6dMzxwF4TxBs'
  }
];

// Initialize fees page
function initFeesPage() {
  // Check if wallet is connected
  if (!window.walletFunctions || !publicKey) {
    showFeesConnectPrompt();
    return;
  }
  
  // Show loading state
  showFeesLoading();
  
  try {
    // Load fee data
    loadFeeData();
    
    // Render fees page
    renderFeesPage();
    
    // Initialize charts
    initCharts();
    
    // Add event listeners
    addFeesEventListeners();
    
    // Hide loading state
    hideFeesLoading();
  } catch (error) {
    console.error('Error initializing fees page:', error);
    showFeesError(error.message);
  }
}

// Load fee data
function loadFeeData() {
  // In a real app, you would fetch this data from the blockchain or a backend API
  // For demo purposes, we'll use sample data
  
  // Set fee transactions
  feeState.feeTransactions = SAMPLE_FEE_TRANSACTIONS;
  
  // Calculate total fees collected
  feeState.totalFeesCollected = feeState.feeTransactions.reduce((total, tx) => total + tx.usdValue, 0);
}

// Render fees page
function renderFeesPage() {
  const feesSection = document.getElementById('fees-section');
  
  if (!feesSection) {
    console.error('Fees section not found');
    return;
  }
  
  // Clear fees section
  feesSection.innerHTML = '';
  
  // Create fees content
  const feesContent = document.createElement('div');
  feesContent.className = 'fees-content';
  
  feesContent.innerHTML = `
    <div class="fees-header">
      <h2>ByteCoin Fees</h2>
      <p>Track fee collection and distribution</p>
    </div>
    
    <div class="fees-overview">
      <div class="overview-card total-fees">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="card-content">
          <h3>Total Fees Collected</h3>
          <div class="card-value">$${feeState.totalFeesCollected.toFixed(2)}</div>
        </div>
      </div>
      
      <div class="overview-card fee-rate">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="8 12 12 16 16 12"></polyline>
            <line x1="12" y1="8" x2="12" y2="16"></line>
          </svg>
        </div>
        <div class="card-content">
          <h3>Fee Rate</h3>
          <div class="card-value">${FEE_PERCENTAGE}%</div>
        </div>
      </div>
      
      <div class="overview-card admin-address">
        <div class="card-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <div class="card-content">
          <h3>Admin Address</h3>
          <div class="card-value address">${formatAddress(ADMIN_ADDRESS)}</div>
        </div>
      </div>
    </div>
    
    <div class="fees-charts">
      <div class="chart-card">
        <div class="chart-header">
          <h3>Fee Collection Over Time</h3>
          <div class="chart-controls">
            <button class="chart-period-btn ${feeState.chartPeriod === 'week' ? 'active' : ''}" data-period="week">Week</button>
            <button class="chart-period-btn ${feeState.chartPeriod === 'month' ? 'active' : ''}" data-period="month">Month</button>
            <button class="chart-period-btn ${feeState.chartPeriod === 'year' ? 'active' : ''}" data-period="year">Year</button>
          </div>
        </div>
        <div class="chart-container">
          <canvas id="fee-collection-chart"></canvas>
        </div>
      </div>
      
      <div class="chart-card">
        <div class="chart-header">
          <h3>Fee Distribution</h3>
        </div>
        <div class="chart-container">
          <canvas id="fee-distribution-chart"></canvas>
        </div>
        <div class="distribution-legend">
          <div class="legend-item">
            <div class="legend-color development"></div>
            <div class="legend-label">Development (${feeState.feeDistribution.development}%)</div>
          </div>
          <div class="legend-item">
            <div class="legend-color marketing"></div>
            <div class="legend-label">Marketing (${feeState.feeDistribution.marketing}%)</div>
          </div>
          <div class="legend-item">
            <div class="legend-color treasury"></div>
            <div class="legend-label">Treasury (${feeState.feeDistribution.treasury}%)</div>
          </div>
          <div class="legend-item">
            <div class="legend-color community"></div>
            <div class="legend-label">Community (${feeState.feeDistribution.community}%)</div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="fees-transactions">
      <div class="transactions-header">
        <h3>Fee Transactions</h3>
        <div class="transactions-filters">
          <div class="filter-group">
            <label for="time-filter">Time</label>
            <select id="time-filter" class="filter-select">
              <option value="all" ${feeState.timeFilter === 'all' ? 'selected' : ''}>All Time</option>
              <option value="day" ${feeState.timeFilter === 'day' ? 'selected' : ''}>Last 24 Hours</option>
              <option value="week" ${feeState.timeFilter === 'week' ? 'selected' : ''}>Last Week</option>
              <option value="month" ${feeState.timeFilter === 'month' ? 'selected' : ''}>Last Month</option>
            </select>
          </div>
          <div class="filter-group">
            <label for="token-filter">Token</label>
            <select id="token-filter" class="filter-select">
              <option value="all" ${feeState.tokenFilter === 'all' ? 'selected' : ''}>All Tokens</option>
              <option value="SOL" ${feeState.tokenFilter === 'SOL' ? 'selected' : ''}>SOL</option>
              <option value="USDC" ${feeState.tokenFilter === 'USDC' ? 'selected' : ''}>USDC</option>
              <option value="S-BYTE" ${feeState.tokenFilter === 'S-BYTE' ? 'selected' : ''}>S-BYTE</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="transactions-table-container">
        <table class="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Token</th>
              <th>Amount</th>
              <th>USD Value</th>
              <th>Type</th>
              <th>Sender</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody id="fee-transactions-body">
            <!-- Fee transactions will be rendered here -->
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="fees-info">
      <div class="info-card">
        <h3>About ByteCoin Fees</h3>
        <p>ByteCoin charges a ${FEE_PERCENTAGE}% fee on all transactions, swaps, and games. These fees are automatically sent to the admin address and are used to support the development and growth of the ByteCoin ecosystem.</p>
        
        <h4>Fee Distribution</h4>
        <p>The collected fees are distributed as follows:</p>
        <ul>
          <li><strong>${feeState.feeDistribution.development}%</strong> goes to development to fund new features and improvements</li>
          <li><strong>${feeState.feeDistribution.marketing}%</strong> goes to marketing to increase adoption and awareness</li>
          <li><strong>${feeState.feeDistribution.treasury}%</strong> goes to the treasury to ensure long-term sustainability</li>
          <li><strong>${feeState.feeDistribution.community}%</strong> goes to community rewards and incentives</li>
        </ul>
        
        <h4>Transparency</h4>
        <p>All fee transactions are recorded on the Solana blockchain and can be verified using the Solana Explorer. The admin address is publicly available and all fee distributions are transparent.</p>
      </div>
    </div>
  `;
  
  feesSection.appendChild(feesContent);
  
  // Render fee transactions
  renderFeeTransactions();
}

// Render fee transactions
function renderFeeTransactions() {
  const transactionsBody = document.getElementById('fee-transactions-body');
  
  if (!transactionsBody) {
    console.error('Fee transactions body not found');
    return;
  }
  
  // Clear transactions body
  transactionsBody.innerHTML = '';
  
  // Filter transactions
  let filteredTransactions = [...feeState.feeTransactions];
  
  // Apply time filter
  if (feeState.timeFilter !== 'all') {
    const now = Date.now();
    let timeThreshold;
    
    switch (feeState.timeFilter) {
      case 'day':
        timeThreshold = now - 24 * 60 * 60 * 1000; // 24 hours
        break;
      case 'week':
        timeThreshold = now - 7 * 24 * 60 * 60 * 1000; // 7 days
        break;
      case 'month':
        timeThreshold = now - 30 * 24 * 60 * 60 * 1000; // 30 days
        break;
      default:
        timeThreshold = 0;
    }
    
    filteredTransactions = filteredTransactions.filter(tx => tx.timestamp >= timeThreshold);
  }
  
  // Apply token filter
  if (feeState.tokenFilter !== 'all') {
    filteredTransactions = filteredTransactions.filter(tx => tx.token === feeState.tokenFilter);
  }
  
  // Sort transactions by timestamp (newest first)
  filteredTransactions.sort((a, b) => b.timestamp - a.timestamp);
  
  // Check if there are any transactions
  if (filteredTransactions.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = `
      <td colspan="7" class="empty-message">No fee transactions found</td>
    `;
    transactionsBody.appendChild(emptyRow);
    return;
  }
  
  // Render transactions
  filteredTransactions.forEach(tx => {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${formatDate(tx.timestamp)}</td>
      <td>${tx.token}</td>
      <td>${tx.amount.toFixed(6)}</td>
      <td>$${tx.usdValue.toFixed(2)}</td>
      <td>${formatTransactionType(tx.transactionType)}</td>
      <td>${formatAddress(tx.sender)}</td>
      <td>
        <a href="https://explorer.solana.com/tx/${tx.signature}?cluster=devnet" target="_blank" class="view-tx-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          View
        </a>
      </td>
    `;
    
    transactionsBody.appendChild(row);
  });
}

// Initialize charts
function initCharts() {
  // Initialize fee collection chart
  initFeeCollectionChart();
  
  // Initialize fee distribution chart
  initFeeDistributionChart();
}

// Initialize fee collection chart
function initFeeCollectionChart() {
  const chartCanvas = document.getElementById('fee-collection-chart');
  
  if (!chartCanvas) {
    console.error('Fee collection chart canvas not found');
    return;
  }
  
  // Prepare data based on chart period
  const { labels, data } = prepareFeeCollectionData();
  
  // Create chart
  const ctx = chartCanvas.getContext('2d');
  
  // Check if chart already exists
  if (window.feeCollectionChart) {
    window.feeCollectionChart.destroy();
  }
  
  // Create new chart
  window.feeCollectionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Fee Collection (USD)',
        data: data,
        backgroundColor: 'rg
(Content truncated due to size limit. Use line ranges to read in chunks)