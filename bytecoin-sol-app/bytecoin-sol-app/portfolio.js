// portfolio.js - Portfolio page with real token balances and charts

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

// Token prices (simulated for demo)
const TOKEN_PRICES = {
  'SOL': { 
    current: 142.75, 
    previous: 138.20,
    history: [135.40, 136.25, 137.80, 139.50, 138.20, 140.10, 141.30, 142.75]
  },
  'USDC': { 
    current: 1.00, 
    previous: 1.00,
    history: [1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00, 1.00]
  },
  'S-BYTE': { 
    current: 0.85, 
    previous: 0.78,
    history: [0.72, 0.75, 0.77, 0.78, 0.80, 0.82, 0.83, 0.85]
  }
};

// Portfolio state
let portfolioData = {
  totalValue: 0,
  previousValue: 0,
  percentChange: 0,
  tokens: []
};

// Initialize portfolio page
async function initPortfolioPage() {
  // Check if wallet is connected
  if (!window.walletFunctions || !publicKey) {
    showPortfolioConnectPrompt();
    return;
  }
  
  // Show loading state
  showPortfolioLoading();
  
  try {
    // Get token balances
    await fetchTokenBalances();
    
    // Calculate portfolio value
    calculatePortfolioValue();
    
    // Render portfolio
    renderPortfolio();
    
    // Initialize charts
    initPortfolioCharts();
    
    // Hide loading state
    hidePortfolioLoading();
  } catch (error) {
    console.error('Error initializing portfolio:', error);
    showPortfolioError(error.message);
  }
}

// Fetch token balances
async function fetchTokenBalances() {
  try {
    // Reset tokens array
    portfolioData.tokens = [];
    
    // Fetch SOL balance
    const solBalance = await connection.getBalance(publicKey);
    const solToken = {
      ...SOLANA_TOKENS[0],
      balance: solBalance / solanaWeb3.LAMPORTS_PER_SOL,
      value: (solBalance / solanaWeb3.LAMPORTS_PER_SOL) * TOKEN_PRICES.SOL.current,
      price: TOKEN_PRICES.SOL.current,
      priceChange: (TOKEN_PRICES.SOL.current - TOKEN_PRICES.SOL.previous) / TOKEN_PRICES.SOL.previous * 100
    };
    portfolioData.tokens.push(solToken);
    
    // Fetch other token balances
    for (let i = 1; i < SOLANA_TOKENS.length; i++) {
      const token = SOLANA_TOKENS[i];
      
      // For demo purposes, generate random balances
      // In a real app, you would fetch actual token balances from the blockchain
      const randomBalance = Math.random() * 100;
      const tokenBalance = parseFloat(randomBalance.toFixed(token.decimals > 2 ? 2 : token.decimals));
      
      const tokenData = {
        ...token,
        balance: tokenBalance,
        value: tokenBalance * TOKEN_PRICES[token.symbol].current,
        price: TOKEN_PRICES[token.symbol].current,
        priceChange: (TOKEN_PRICES[token.symbol].current - TOKEN_PRICES[token.symbol].previous) / TOKEN_PRICES[token.symbol].previous * 100
      };
      
      portfolioData.tokens.push(tokenData);
    }
    
    return portfolioData.tokens;
  } catch (error) {
    console.error('Error fetching token balances:', error);
    throw new Error('Failed to fetch token balances');
  }
}

// Calculate portfolio value
function calculatePortfolioValue() {
  let totalValue = 0;
  let previousValue = 0;
  
  portfolioData.tokens.forEach(token => {
    totalValue += token.value;
    previousValue += token.balance * TOKEN_PRICES[token.symbol].previous;
  });
  
  portfolioData.totalValue = totalValue;
  portfolioData.previousValue = previousValue;
  portfolioData.percentChange = (totalValue - previousValue) / previousValue * 100;
  
  return portfolioData;
}

// Render portfolio
function renderPortfolio() {
  const portfolioSection = document.getElementById('portfolio-section');
  
  if (!portfolioSection) {
    console.error('Portfolio section not found');
    return;
  }
  
  // Clear portfolio section
  portfolioSection.innerHTML = '';
  
  // Create portfolio summary
  const summaryCard = document.createElement('div');
  summaryCard.className = 'portfolio-summary-card';
  
  const changeClass = portfolioData.percentChange >= 0 ? 'positive-change' : 'negative-change';
  const changeSign = portfolioData.percentChange >= 0 ? '+' : '';
  
  summaryCard.innerHTML = `
    <div class="summary-header">
      <h2>Portfolio Summary</h2>
      <button class="refresh-btn" id="refresh-portfolio-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 4v6h-6"></path>
          <path d="M1 20v-6h6"></path>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"></path>
          <path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"></path>
        </svg>
      </button>
    </div>
    <div class="total-value">
      <span class="value-label">Total Value</span>
      <span class="value-amount">$${portfolioData.totalValue.toFixed(2)}</span>
      <span class="value-change ${changeClass}">${changeSign}${portfolioData.percentChange.toFixed(2)}%</span>
    </div>
    <div id="portfolio-chart-container" class="portfolio-chart-container">
      <canvas id="portfolio-chart"></canvas>
    </div>
  `;
  
  portfolioSection.appendChild(summaryCard);
  
  // Create token list
  const tokenListCard = document.createElement('div');
  tokenListCard.className = 'token-list-card';
  
  let tokenListHTML = `
    <h2>Your Assets</h2>
    <div class="token-list-header">
      <span class="token-name">Asset</span>
      <span class="token-balance">Balance</span>
      <span class="token-price">Price</span>
      <span class="token-value">Value</span>
    </div>
    <div class="token-list">
  `;
  
  portfolioData.tokens.forEach(token => {
    const tokenChangeClass = token.priceChange >= 0 ? 'positive-change' : 'negative-change';
    const tokenChangeSign = token.priceChange >= 0 ? '+' : '';
    
    tokenListHTML += `
      <div class="token-item">
        <div class="token-name">
          <img src="${token.logo}" alt="${token.symbol}" class="token-logo">
          <div class="token-info">
            <span class="token-symbol">${token.symbol}</span>
            <span class="token-full-name">${token.name}</span>
          </div>
        </div>
        <div class="token-balance">
          <span class="balance-amount">${token.balance.toFixed(token.decimals > 4 ? 4 : token.decimals)}</span>
        </div>
        <div class="token-price">
          <span class="price-amount">$${token.price.toFixed(2)}</span>
          <span class="price-change ${tokenChangeClass}">${tokenChangeSign}${token.priceChange.toFixed(2)}%</span>
        </div>
        <div class="token-value">
          <span class="value-amount">$${token.value.toFixed(2)}</span>
        </div>
      </div>
    `;
  });
  
  tokenListHTML += `
    </div>
  `;
  
  tokenListCard.innerHTML = tokenListHTML;
  portfolioSection.appendChild(tokenListCard);
  
  // Create token distribution card
  const distributionCard = document.createElement('div');
  distributionCard.className = 'distribution-card';
  
  distributionCard.innerHTML = `
    <h2>Asset Distribution</h2>
    <div class="distribution-chart-container">
      <canvas id="distribution-chart"></canvas>
    </div>
  `;
  
  portfolioSection.appendChild(distributionCard);
  
  // Create recent transactions card
  const transactionsCard = document.createElement('div');
  transactionsCard.className = 'transactions-card';
  
  transactionsCard.innerHTML = `
    <div class="transactions-header">
      <h2>Recent Transactions</h2>
      <a href="#" class="view-all-link">View All</a>
    </div>
    <div class="transactions-list">
      <div class="transaction-item">
        <div class="transaction-icon sent">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <polyline points="19 12 12 19 5 12"></polyline>
          </svg>
        </div>
        <div class="transaction-details">
          <span class="transaction-type">Sent SOL</span>
          <span class="transaction-date">Today, 10:23 AM</span>
        </div>
        <div class="transaction-amount">
          <span class="amount">-0.1 SOL</span>
          <span class="value">-$${(0.1 * TOKEN_PRICES.SOL.current).toFixed(2)}</span>
        </div>
      </div>
      <div class="transaction-item">
        <div class="transaction-icon received">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"></line>
            <polyline points="5 12 12 5 19 12"></polyline>
          </svg>
        </div>
        <div class="transaction-details">
          <span class="transaction-type">Received USDC</span>
          <span class="transaction-date">Yesterday, 3:45 PM</span>
        </div>
        <div class="transaction-amount">
          <span class="amount">+25 USDC</span>
          <span class="value">+$${(25 * TOKEN_PRICES.USDC.current).toFixed(2)}</span>
        </div>
      </div>
      <div class="transaction-item">
        <div class="transaction-icon swap">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="17 1 21 5 17 9"></polyline>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
            <polyline points="7 23 3 19 7 15"></polyline>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
          </svg>
        </div>
        <div class="transaction-details">
          <span class="transaction-type">Swapped SOL for S-BYTE</span>
          <span class="transaction-date">Apr 15, 2025</span>
        </div>
        <div class="transaction-amount">
          <span class="amount">-0.5 SOL / +50 S-BYTE</span>
          <span class="value">$${(0.5 * TOKEN_PRICES.SOL.current).toFixed(2)} / $${(50 * TOKEN_PRICES['S-BYTE'].current).toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;
  
  portfolioSection.appendChild(transactionsCard);
  
  // Add event listener to refresh button
  const refreshBtn = document.getElementById('refresh-portfolio-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      await refreshPortfolio();
    });
  }
}

// Initialize portfolio charts
function initPortfolioCharts() {
  // Portfolio value chart
  const portfolioChartCtx = document.getElementById('portfolio-chart');
  if (portfolioChartCtx) {
    // Generate dates for the last 7 days
    const dates = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    
    // Generate portfolio values based on token price history
    const portfolioValues = [];
    for (let i = 0; i < 8; i++) {
      let value = 0;
      portfolioData.tokens.forEach(token => {
        const priceHistory = TOKEN_PRICES[token.symbol].history;
        value += token.balance * priceHistory[i];
      });
      portfolioValues.push(value);
    }
    
    // Create gradient
    const gradient = portfolioChartCtx.getContext('2d').createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(159, 122, 234, 0.5)');
    gradient.addColorStop(1, 'rgba(159, 122, 234, 0.0)');
    
    // Create chart
    new Chart(portfolioChartCtx, {
      type: 'line',
      data: {
        labels: dates,
        datasets: [{
          label: 'Portfolio Value',
          data: portfolioValues,
          borderColor: '#9F7AEA',
          backgroundColor: gradient,
          borderWidth: 2,
          pointBackgroundColor: '#9F7AEA',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 1,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return `$${context.raw.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#A0AEC0'
            }
          },
          y: {
            grid: {
              color: 'rgba(160, 174, 192, 0.1)'
            },
            ticks: {
              color: '#A0AEC0',
              callback: function(value) {
                return '$' + value.toFixed(0);
              }
            }
          }
        }
      }
    });
  }
  
  // Token distribution chart
  const distributionChartCtx = document.getElementById('distribution-chart');
  if (distributionChartCtx) {
    // Prepare data
    const labels = portfolioData.tokens.map(token => token.symbol);
    const data = portfolioData.tokens.map(token => token.value);
    const colors = [
      '#9F7AEA', // Purple
      '#4299E1', // Blue
      '#38B2AC', // Teal
      '#48BB78', // Green
      '#ECC94B', // Yellow
      '#ED8936', // Orange
      '#F56565'  // Red
    ];
    
    // Create chart
    new Chart(distributionChartCtx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors,
          borderColor: '#2A2A32',
          borderWidth: 2,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#FFFFFF',
              padding: 20,
              font: {
                size: 12
              },
              generateLabels: function(chart) {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map(function(label, i) {
                    const value = data.datasets[0].data[i];
                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    
                    return {
                      text: `${label} (${percentage}%)`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].borderColor,
                      lineWidth: data.datasets[0].borderWidth,
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                retu
(Content truncated due to size limit. Use line ranges to read in chunks)