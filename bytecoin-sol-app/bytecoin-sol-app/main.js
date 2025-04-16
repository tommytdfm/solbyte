// Main JavaScript for ByteCoin on Sol App

document.addEventListener('DOMContentLoaded', function() {
  // Wallet connection simulation
  const connectButtons = document.querySelectorAll('.connect-wallet-btn');
  let isConnected = false;
  let walletAddress = '';
  
  // Admin address
  const adminAddress = '6s5sjaPDYXVzbBnDjfxWqbD4K5qi9yvdWchtgoqDESjJ';
  const feePercentage = 3;
  
  // Connect wallet function
  function connectWallet() {
    if (isConnected) {
      // Disconnect wallet
      isConnected = false;
      walletAddress = '';
      updateWalletUI();
      showNotification('Wallet disconnected', 'info');
    } else {
      // Simulate connection delay
      showNotification('Connecting to wallet...', 'info');
      
      setTimeout(() => {
        // Generate random wallet address for demo
        isConnected = true;
        walletAddress = generateRandomWalletAddress();
        updateWalletUI();
        showNotification('Wallet connected successfully!', 'success');
      }, 1000);
    }
  }
  
  // Update wallet UI
  function updateWalletUI() {
    connectButtons.forEach(button => {
      if (isConnected) {
        button.textContent = formatWalletAddress(walletAddress);
        button.classList.add('connected');
      } else {
        button.textContent = 'Connect Wallet';
        button.classList.remove('connected');
      }
    });
  }
  
  // Format wallet address
  function formatWalletAddress(address) {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }
  
  // Generate random wallet address for demo
  function generateRandomWalletAddress() {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  // Show notification
  function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }
  
  // Add event listeners to connect buttons
  connectButtons.forEach(button => {
    button.addEventListener('click', connectWallet);
  });
  
  // Add notification styles
  const style = document.createElement('style');
  style.textContent = `
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.3s, transform 0.3s;
      z-index: 1000;
    }
    
    .notification.show {
      opacity: 1;
      transform: translateY(0);
    }
    
    .notification.info {
      background-color: #3182ce;
    }
    
    .notification.success {
      background-color: #38a169;
    }
    
    .notification.error {
      background-color: #e53e3e;
    }
    
    .connect-wallet-btn.connected {
      background-color: #38a169;
    }
  `;
  document.head.appendChild(style);
  
  // Add admin verification
  const adminNotice = document.querySelector('.admin-notice');
  if (adminNotice) {
    const verifyButton = document.createElement('button');
    verifyButton.className = 'connect-wallet-btn';
    verifyButton.textContent = 'Verify Admin';
    verifyButton.addEventListener('click', () => {
      if (!isConnected) {
        showNotification('Please connect your wallet first', 'error');
        return;
      }
      
      if (walletAddress === adminAddress) {
        showNotification('Admin verified successfully!', 'success');
      } else {
        showNotification('Not authorized as admin', 'error');
      }
    });
    
    adminNotice.appendChild(verifyButton);
  }
});
