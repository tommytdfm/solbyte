// admin.js - Admin panel with management tools

// Constants
const ADMIN_ADDRESS = '6s5sjaPDYXVzbBnDjfxWqbD4K5qi9yvdWchtgoqDESjJ';
const FEE_PERCENTAGE = 3; // 3%

// Admin state
let adminState = {
  isAdmin: false,
  isVerifying: false,
  verificationError: null,
  activeTab: 'dashboard',
  users: [],
  settings: {
    feePercentage: FEE_PERCENTAGE,
    minTransferAmount: 0.001,
    maxTransferAmount: 1000,
    enabledFeatures: {
      swap: true,
      games: true,
      staking: false
    }
  },
  announcements: [],
  newAnnouncement: {
    title: '',
    content: '',
    type: 'info'
  },
  isLoading: false
};

// Sample users (for demo purposes)
const SAMPLE_USERS = [
  {
    id: 'user1',
    address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
    joinDate: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    totalTransactions: 42,
    totalVolume: 156.75,
    status: 'active'
  },
  {
    id: 'user2',
    address: '8ZUczUAUSLTNmzAeKLJ9PuWVJ4YyMvfi3s1JvtZK4vMW',
    joinDate: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
    totalTransactions: 18,
    totalVolume: 67.25,
    status: 'active'
  },
  {
    id: 'user3',
    address: 'DRtXHDgC312wpNdNCSb8vPXAJ8B4rZGcK6JQwzWrDNPu',
    joinDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    totalTransactions: 5,
    totalVolume: 12.5,
    status: 'active'
  },
  {
    id: 'user4',
    address: '5UfDuX9A2vn9NGwTD2QSVBRHhT9yT4QpRJMzBiNLbJCT',
    joinDate: Date.now() - 45 * 24 * 60 * 60 * 1000, // 45 days ago
    totalTransactions: 67,
    totalVolume: 245.3,
    status: 'suspended'
  },
  {
    id: 'user5',
    address: '4KsMmKpGXS6RLTXcqMnCDhzPNBhMvnUHzCoYkQAYBBD1',
    joinDate: Date.now() - 60 * 24 * 60 * 60 * 1000, // 60 days ago
    totalTransactions: 103,
    totalVolume: 512.75,
    status: 'banned'
  }
];

// Sample announcements (for demo purposes)
const SAMPLE_ANNOUNCEMENTS = [
  {
    id: 'ann1',
    title: 'Welcome to ByteCoin on Sol',
    content: 'We\'re excited to launch our new platform. Enjoy trading with low fees and fast transactions!',
    date: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    type: 'info'
  },
  {
    id: 'ann2',
    title: 'New Feature: Games',
    content: 'We\'ve added a new Games section where you can play Draughts and win S-BYTE tokens!',
    date: Date.now() - 15 * 24 * 60 * 60 * 1000, // 15 days ago
    type: 'success'
  },
  {
    id: 'ann3',
    title: 'Maintenance Notice',
    content: 'We\'ll be performing maintenance on our servers tomorrow from 2-4 AM UTC. Some services may be temporarily unavailable.',
    date: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    type: 'warning'
  }
];

// Initialize admin page
function initAdminPage() {
  // Check if wallet is connected
  if (!window.walletFunctions || !publicKey) {
    showAdminConnectPrompt();
    return;
  }
  
  // Show loading state
  showAdminLoading();
  
  try {
    // Load admin data
    loadAdminData();
    
    // Render admin page
    renderAdminPage();
    
    // Add event listeners
    addAdminEventListeners();
    
    // Hide loading state
    hideAdminLoading();
  } catch (error) {
    console.error('Error initializing admin page:', error);
    showAdminError(error.message);
  }
}

// Load admin data
function loadAdminData() {
  // In a real app, you would fetch this data from the blockchain or a backend API
  // For demo purposes, we'll use sample data
  
  // Set users
  adminState.users = SAMPLE_USERS;
  
  // Set announcements
  adminState.announcements = SAMPLE_ANNOUNCEMENTS;
}

// Render admin page
function renderAdminPage() {
  const adminSection = document.getElementById('admin-section');
  
  if (!adminSection) {
    console.error('Admin section not found');
    return;
  }
  
  // Clear admin section
  adminSection.innerHTML = '';
  
  // Create admin content
  const adminContent = document.createElement('div');
  adminContent.className = 'admin-content';
  
  // Check if user is admin
  if (!adminState.isAdmin) {
    // Show admin verification
    adminContent.innerHTML = `
      <div class="admin-header">
        <h2>ByteCoin Admin Panel</h2>
        <p>Verify your admin status to access management tools</p>
      </div>
      
      <div class="admin-verification">
        <div class="verification-card">
          <h3>Admin Verification</h3>
          <p>To access the admin panel, you need to verify that you are the admin by signing a message with your wallet.</p>
          
          <div class="admin-address">
            <h4>Admin Address</h4>
            <div class="address-value">${ADMIN_ADDRESS}</div>
          </div>
          
          <div class="your-address">
            <h4>Your Address</h4>
            <div class="address-value">${formatAddress(publicKey)}</div>
          </div>
          
          <button id="verify-admin-btn" class="verify-admin-btn ${adminState.isVerifying ? 'loading' : ''}">
            ${adminState.isVerifying ? 'Verifying...' : 'Verify Admin Status'}
          </button>
          
          ${adminState.verificationError ? `<div class="verification-error">${adminState.verificationError}</div>` : ''}
        </div>
      </div>
    `;
  } else {
    // Show admin panel
    adminContent.innerHTML = `
      <div class="admin-header">
        <h2>ByteCoin Admin Panel</h2>
        <p>Manage your ByteCoin application</p>
      </div>
      
      <div class="admin-tabs">
        <button class="tab-btn ${adminState.activeTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">Dashboard</button>
        <button class="tab-btn ${adminState.activeTab === 'users' ? 'active' : ''}" data-tab="users">Users</button>
        <button class="tab-btn ${adminState.activeTab === 'settings' ? 'active' : ''}" data-tab="settings">Settings</button>
        <button class="tab-btn ${adminState.activeTab === 'announcements' ? 'active' : ''}" data-tab="announcements">Announcements</button>
      </div>
      
      <div class="admin-tab-content">
        ${renderAdminTabContent()}
      </div>
    `;
  }
  
  adminSection.appendChild(adminContent);
}

// Render admin tab content
function renderAdminTabContent() {
  switch (adminState.activeTab) {
    case 'dashboard':
      return renderAdminDashboard();
    case 'users':
      return renderAdminUsers();
    case 'settings':
      return renderAdminSettings();
    case 'announcements':
      return renderAdminAnnouncements();
    default:
      return renderAdminDashboard();
  }
}

// Render admin dashboard
function renderAdminDashboard() {
  // Calculate dashboard statistics
  const totalUsers = adminState.users.length;
  const activeUsers = adminState.users.filter(user => user.status === 'active').length;
  const totalTransactions = adminState.users.reduce((sum, user) => sum + user.totalTransactions, 0);
  const totalVolume = adminState.users.reduce((sum, user) => sum + user.totalVolume, 0);
  
  return `
    <div class="admin-dashboard">
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-icon users-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3>Total Users</h3>
            <div class="stat-value">${totalUsers}</div>
            <div class="stat-subtext">${activeUsers} active</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon transactions-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3>Total Transactions</h3>
            <div class="stat-value">${totalTransactions}</div>
            <div class="stat-subtext">Across all users</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon volume-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
          <div class="stat-content">
            <h3>Total Volume</h3>
            <div class="stat-value">$${totalVolume.toFixed(2)}</div>
            <div class="stat-subtext">USD equivalent</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon fees-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
            </svg>
          </div>
          <div class="stat-content">
            <h3>Fee Rate</h3>
            <div class="stat-value">${adminState.settings.feePercentage}%</div>
            <div class="stat-subtext">Current fee rate</div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-charts">
        <div class="chart-card">
          <div class="chart-header">
            <h3>User Growth</h3>
          </div>
          <div class="chart-container">
            <canvas id="user-growth-chart"></canvas>
          </div>
        </div>
        
        <div class="chart-card">
          <div class="chart-header">
            <h3>Transaction Volume</h3>
          </div>
          <div class="chart-container">
            <canvas id="transaction-volume-chart"></canvas>
          </div>
        </div>
      </div>
      
      <div class="dashboard-recent">
        <div class="recent-card">
          <div class="recent-header">
            <h3>Recent Users</h3>
            <a href="#" class="view-all-link" data-tab="users">View All</a>
          </div>
          <div class="recent-list">
            ${adminState.users
              .sort((a, b) => b.joinDate - a.joinDate)
              .slice(0, 5)
              .map(user => `
                <div class="recent-item">
                  <div class="recent-icon user-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div class="recent-content">
                    <div class="recent-title">${formatAddress(user.address)}</div>
                    <div class="recent-subtitle">Joined ${formatDate(user.joinDate)}</div>
                  </div>
                  <div class="recent-status ${user.status}">
                    ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </div>
                </div>
              `).join('')}
          </div>
        </div>
        
        <div class="recent-card">
          <div class="recent-header">
            <h3>Recent Announcements</h3>
            <a href="#" class="view-all-link" data-tab="announcements">View All</a>
          </div>
          <div class="recent-list">
            ${adminState.announcements
              .sort((a, b) => b.date - a.date)
              .slice(0, 5)
              .map(announcement => `
                <div class="recent-item">
                  <div class="recent-icon announcement-icon ${announcement.type}">
                    ${getAnnouncementIcon(announcement.type)}
                  </div>
                  <div class="recent-content">
                    <div class="recent-title">${announcement.title}</div>
                    <div class="recent-subtitle">${formatDate(announcement.date)}</div>
                  </div>
                  <div class="recent-badge ${announcement.type}">
                    ${announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)}
                  </div>
                </div>
              `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// Render admin users
function renderAdminUsers() {
  return `
    <div class="admin-users">
      <div class="users-header">
        <h3>User Management</h3>
        <div class="users-search">
          <input type="text" placeholder="Search by address..." id="user-search-input">
          <button class="search-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        <div class="users-filter">
          <select id="user-status-filter">
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>
      
      <div class="users-table-container">
        <table class="users-table">
          <thead>
            <tr>
              <th>Address</th>
              <th>Join Date</th>
              <th>Transactions</th>
              <th>Volume</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="users-table-body">
            ${adminState.users.map(user => `
              <tr data-user-id="${user.id}">
                <td>${formatAddress(user.address)}</td>
                <td>${formatDate(user.joinDate)}</td>
                <td>${user.totalTransactions}</td>
                <td>$${user.totalVolume.toFixed(2)}</td>
                <td>
                  <span class="status-badge ${user.status}">
                    ${user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                  </span>
                </td>
                <td>
                  <div class="user-actions">
                    <button class="action-btn view-btn" data-action="view" data-user-id="${user.id}">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>
                    ${user.status === 'active' ? `
                      <button class="action-btn suspend-btn" data-action="suspend" data-user-id="${user.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                      </button>
                    ` : user.status === 'suspended' ? `
   
(Content truncated due to size limit. Use line ranges to read in chunks)