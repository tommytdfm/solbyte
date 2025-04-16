// app.js - Main application logic

document.addEventListener('DOMContentLoaded', function() {
  // Initialize Solana connection
  const connection = window.walletFunctions.initSolanaConnection();
  
  // DOM elements
  const connectWalletBtn = document.getElementById('connect-wallet-btn');
  const connectWalletBtnLarge = document.getElementById('connect-wallet-btn-large');
  const disconnectWalletBtn = document.getElementById('disconnect-wallet-btn');
  const refreshBalanceBtn = document.getElementById('refresh-balance-btn');
  const sendTransactionBtn = document.getElementById('send-transaction-btn');
  const verifyAdminBtn = document.getElementById('verify-admin-btn');
  const sendWithFeeBtn = document.getElementById('send-with-fee-btn');
  
  // Navigation elements
  const navLinks = document.querySelectorAll('.sidebar nav ul li a');
  const homeSection = document.getElementById('home-section');
  const walletTestSection = document.getElementById('wallet-test-section');
  const adminSection = document.getElementById('admin-section');
  
  // Fee calculation elements
  const feeAmountInput = document.getElementById('fee-amount');
  const transactionAmountDisplay = document.getElementById('transaction-amount');
  const feeAmountDisplay = document.getElementById('fee-amount-display');
  const recipientAmountDisplay = document.getElementById('recipient-amount');
  
  // Connect wallet button click event
  connectWalletBtn.addEventListener('click', async () => {
    await window.walletFunctions.initWalletAdapter();
  });
  
  // Connect wallet button (large) click event
  connectWalletBtnLarge.addEventListener('click', async () => {
    await window.walletFunctions.initWalletAdapter();
  });
  
  // Disconnect wallet button click event
  disconnectWalletBtn.addEventListener('click', async () => {
    await window.walletFunctions.disconnectWallet();
  });
  
  // Refresh balance button click event
  refreshBalanceBtn.addEventListener('click', async () => {
    await window.walletFunctions.refreshBalance();
  });
  
  // Send transaction button click event
  sendTransactionBtn.addEventListener('click', async () => {
    const recipientAddress = document.getElementById('recipient-address').value;
    const amount = parseFloat(document.getElementById('amount').value);
    
    if (!recipientAddress) {
      showNotification('Please enter a recipient address', 'error');
      return;
    }
    
    if (isNaN(amount) || amount <= 0) {
      showNotification('Please enter a valid amount', 'error');
      return;
    }
    
    const transactionResult = document.getElementById('transaction-result');
    transactionResult.textContent = 'Sending transaction...';
    
    const signature = await window.walletFunctions.sendTransaction(recipientAddress, amount);
    
    if (signature) {
      transactionResult.textContent = `Transaction successful!\nSignature: ${signature}\n\nView on Solana Explorer:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`;
    } else {
      transactionResult.textContent = 'Transaction failed. Please try again.';
    }
  });
  
  // Verify admin button click event
  verifyAdminBtn.addEventListener('click', () => {
    const adminStatus = document.getElementById('admin-status');
    const isAdmin = window.walletFunctions.verifyAdmin();
    
    if (isAdmin) {
      adminStatus.textContent = 'Verified as admin! You have full administrative privileges.';
      adminStatus.style.color = 'var(--success)';
    } else {
      adminStatus.textContent = 'Not authorized as admin. Your wallet address does not match the admin address.';
      adminStatus.style.color = 'var(--error)';
    }
  });
  
  // Send with fee button click event
  sendWithFeeBtn.addEventListener('click', async () => {
    const recipientAddress = document.getElementById('fee-recipient-address').value;
    const amount = parseFloat(document.getElementById('fee-amount').value);
    
    if (!recipientAddress) {
      showNotification('Please enter a recipient address', 'error');
      return;
    }
    
    if (isNaN(amount) || amount <= 0) {
      showNotification('Please enter a valid amount', 'error');
      return;
    }
    
    const feeTransactionResult = document.getElementById('fee-transaction-result');
    feeTransactionResult.textContent = 'Sending transaction with fee...';
    
    const signature = await window.walletFunctions.sendTransactionWithFee(recipientAddress, amount);
    
    if (signature) {
      feeTransactionResult.textContent = `Transaction with fee successful!\nSignature: ${signature}\n\nView on Solana Explorer:\nhttps://explorer.solana.com/tx/${signature}?cluster=devnet`;
    } else {
      feeTransactionResult.textContent = 'Transaction failed. Please try again.';
    }
  });
  
  // Fee amount input event
  feeAmountInput.addEventListener('input', () => {
    const amount = parseFloat(feeAmountInput.value);
    
    if (!isNaN(amount) && amount > 0) {
      const feeAmount = amount * 0.03; // 3% fee
      const recipientAmount = amount - feeAmount;
      
      transactionAmountDisplay.textContent = `${amount.toFixed(4)} SOL`;
      feeAmountDisplay.textContent = `${feeAmount.toFixed(4)} SOL`;
      recipientAmountDisplay.textContent = `${recipientAmount.toFixed(4)} SOL`;
    } else {
      transactionAmountDisplay.textContent = '0 SOL';
      feeAmountDisplay.textContent = '0 SOL';
      recipientAmountDisplay.textContent = '0 SOL';
    }
  });
  
  // Navigation click events
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Remove active class from all links
      navLinks.forEach(l => l.parentElement.classList.remove('active'));
      
      // Add active class to clicked link
      link.parentElement.classList.add('active');
      
      // Hide all sections
      homeSection.classList.add('hidden');
      walletTestSection.classList.add('hidden');
      adminSection.classList.add('hidden');
      
      // Show selected section
      const href = link.getAttribute('href');
      
      if (href === '#home') {
        homeSection.classList.remove('hidden');
      } else if (href === '#wallet-test') {
        walletTestSection.classList.remove('hidden');
      } else if (href === '#admin') {
        adminSection.classList.remove('hidden');
      }
    });
  });
  
  // Show notification
  function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Remove after delay
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
  }
  
  // Initialize fee calculation display
  feeAmountInput.dispatchEvent(new Event('input'));
  
  // Show welcome notification
  showNotification('Welcome to ByteCoin on Sol! Connect your wallet to get started.', 'info');
});
