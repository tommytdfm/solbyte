// wallet.js - Solana Wallet Connection Implementation

// Constants
const ADMIN_ADDRESS = '6s5sjaPDYXVzbBnDjfxWqbD4K5qi9yvdWchtgoqDESjJ';
const FEE_PERCENTAGE = 3;

// Solana connection
let connection;
let wallet = null;
let publicKey = null;
let balance = 0;

// Initialize Solana connection
function initSolanaConnection() {
  // Use devnet for testing
  const network = 'devnet';
  const endpoint = solanaWeb3.clusterApiUrl(network);
  connection = new solanaWeb3.Connection(endpoint);
  
  showNotification('Connected to Solana ' + network, 'info');
  return connection;
}

// Initialize wallet adapter
async function initWalletAdapter() {
  try {
    // Check if Phantom is installed
    const isPhantomInstalled = window.solana && window.solana.isPhantom;
    
    if (!isPhantomInstalled) {
      showNotification('Phantom wallet is not installed. Please install it from phantom.app', 'error');
      return false;
    }
    
    // Connect to wallet
    updateConnectionStatus('connecting');
    
    // Request connection to wallet
    await window.solana.connect();
    
    // Get public key
    publicKey = window.solana.publicKey;
    wallet = window.solana;
    
    // Update UI
    updateConnectionStatus('connected');
    updateWalletInfo();
    
    // Get balance
    await refreshBalance();
    
    // Add disconnect event listener
    wallet.on('disconnect', handleDisconnect);
    
    return true;
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    showNotification('Failed to connect to wallet: ' + error.message, 'error');
    updateConnectionStatus('disconnected');
    return false;
  }
}

// Disconnect wallet
async function disconnectWallet() {
  try {
    if (wallet) {
      await wallet.disconnect();
      handleDisconnect();
    }
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
    showNotification('Failed to disconnect wallet: ' + error.message, 'error');
  }
}

// Handle disconnect event
function handleDisconnect() {
  wallet = null;
  publicKey = null;
  balance = 0;
  
  // Update UI
  updateConnectionStatus('disconnected');
  updateWalletInfo();
  
  showNotification('Wallet disconnected', 'info');
}

// Refresh balance
async function refreshBalance() {
  try {
    if (!connection || !publicKey) return;
    
    balance = await connection.getBalance(publicKey);
    balance = balance / solanaWeb3.LAMPORTS_PER_SOL;
    
    // Update UI
    document.getElementById('sol-balance').textContent = `${balance.toFixed(6)} SOL`;
    
    return balance;
  } catch (error) {
    console.error('Error refreshing balance:', error);
    showNotification('Failed to refresh balance: ' + error.message, 'error');
  }
}

// Send transaction
async function sendTransaction(recipientAddress, amount) {
  try {
    if (!connection || !publicKey || !wallet) {
      showNotification('Please connect your wallet first', 'error');
      return null;
    }
    
    // Validate recipient address
    let recipientPublicKey;
    try {
      recipientPublicKey = new solanaWeb3.PublicKey(recipientAddress);
    } catch (error) {
      showNotification('Invalid recipient address', 'error');
      return null;
    }
    
    // Validate amount
    const lamports = amount * solanaWeb3.LAMPORTS_PER_SOL;
    if (lamports <= 0) {
      showNotification('Amount must be greater than 0', 'error');
      return null;
    }
    
    // Check if balance is sufficient
    if (balance < amount) {
      showNotification('Insufficient balance', 'error');
      return null;
    }
    
    // Create transaction
    const transaction = new solanaWeb3.Transaction().add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPublicKey,
        lamports: lamports
      })
    );
    
    // Set recent blockhash
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    transaction.feePayer = publicKey;
    
    // Sign transaction
    showNotification('Please approve the transaction in your wallet', 'info');
    
    // Send transaction
    const signed = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    
    // Confirm transaction
    await connection.confirmTransaction(signature);
    
    // Refresh balance
    await refreshBalance();
    
    showNotification('Transaction sent successfully!', 'success');
    
    return signature;
  } catch (error) {
    console.error('Error sending transaction:', error);
    showNotification('Failed to send transaction: ' + error.message, 'error');
    return null;
  }
}

// Send transaction with fee
async function sendTransactionWithFee(recipientAddress, amount) {
  try {
    if (!connection || !publicKey || !wallet) {
      showNotification('Please connect your wallet first', 'error');
      return null;
    }
    
    // Validate recipient address
    let recipientPublicKey;
    try {
      recipientPublicKey = new solanaWeb3.PublicKey(recipientAddress);
    } catch (error) {
      showNotification('Invalid recipient address', 'error');
      return null;
    }
    
    // Validate amount
    const lamports = amount * solanaWeb3.LAMPORTS_PER_SOL;
    if (lamports <= 0) {
      showNotification('Amount must be greater than 0', 'error');
      return null;
    }
    
    // Check if balance is sufficient
    if (balance < amount) {
      showNotification('Insufficient balance', 'error');
      return null;
    }
    
    // Calculate fee
    const feeAmount = amount * (FEE_PERCENTAGE / 100);
    const recipientAmount = amount - feeAmount;
    
    // Convert to lamports
    const feeLamports = feeAmount * solanaWeb3.LAMPORTS_PER_SOL;
    const recipientLamports = recipientAmount * solanaWeb3.LAMPORTS_PER_SOL;
    
    // Create admin public key
    const adminPublicKey = new solanaWeb3.PublicKey(ADMIN_ADDRESS);
    
    // Create transaction with two transfers
    const transaction = new solanaWeb3.Transaction();
    
    // Add recipient transfer
    transaction.add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPublicKey,
        lamports: recipientLamports
      })
    );
    
    // Add fee transfer
    transaction.add(
      solanaWeb3.SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: adminPublicKey,
        lamports: feeLamports
      })
    );
    
    // Set recent blockhash
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    transaction.feePayer = publicKey;
    
    // Sign transaction
    showNotification('Please approve the transaction in your wallet', 'info');
    
    // Send transaction
    const signed = await wallet.signTransaction(transaction);
    const signature = await connection.sendRawTransaction(signed.serialize());
    
    // Confirm transaction
    await connection.confirmTransaction(signature);
    
    // Refresh balance
    await refreshBalance();
    
    showNotification('Transaction with fee sent successfully!', 'success');
    
    return signature;
  } catch (error) {
    console.error('Error sending transaction with fee:', error);
    showNotification('Failed to send transaction: ' + error.message, 'error');
    return null;
  }
}

// Verify if connected wallet is admin
function verifyAdmin() {
  if (!publicKey) {
    showNotification('Please connect your wallet first', 'error');
    return false;
  }
  
  const isAdmin = publicKey.toString() === ADMIN_ADDRESS;
  
  if (isAdmin) {
    showNotification('Admin verified successfully!', 'success');
  } else {
    showNotification('Not authorized as admin', 'error');
  }
  
  return isAdmin;
}

// Update connection status in UI
function updateConnectionStatus(status) {
  const statusElement = document.getElementById('connection-status');
  const statusDot = statusElement.querySelector('.status-dot');
  const statusText = statusElement.querySelector('.status-text');
  
  statusDot.className = 'status-dot ' + status;
  
  switch (status) {
    case 'connected':
      statusText.textContent = 'Connected';
      statusText.style.color = 'var(--success)';
      break;
    case 'disconnected':
      statusText.textContent = 'Disconnected';
      statusText.style.color = 'var(--error)';
      break;
    case 'connecting':
      statusText.textContent = 'Connecting...';
      statusText.style.color = 'var(--warning)';
      break;
    default:
      statusText.textContent = 'Unknown';
      statusText.style.color = 'var(--text-muted)';
  }
  
  // Update connect wallet buttons
  const connectButtons = document.querySelectorAll('.connect-wallet-btn');
  connectButtons.forEach(button => {
    if (status === 'connected') {
      button.textContent = formatAddress(publicKey.toString());
      button.classList.add('connected');
    } else {
      button.textContent = 'Connect Wallet';
      button.classList.remove('connected');
    }
  });
}

// Update wallet info in UI
function updateWalletInfo() {
  const providerElement = document.getElementById('wallet-provider');
  const addressElement = document.getElementById('wallet-address');
  
  if (wallet && publicKey) {
    providerElement.textContent = 'Phantom';
    addressElement.textContent = publicKey.toString();
  } else {
    providerElement.textContent = 'Not connected';
    addressElement.textContent = 'Not connected';
    document.getElementById('sol-balance').textContent = '0 SOL';
  }
}

// Format address for display
function formatAddress(address) {
  if (!address) return 'Connect Wallet';
  return address.slice(0, 4) + '...' + address.slice(-4);
}

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

// Export functions
window.walletFunctions = {
  initSolanaConnection,
  initWalletAdapter,
  disconnectWallet,
  refreshBalance,
  sendTransaction,
  sendTransactionWithFee,
  verifyAdmin,
  formatAddress
};
