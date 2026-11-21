<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>CrownVotes Admin</title>

<style>
* { box-sizing: border-box; }

body {
  font-family: Arial, sans-serif;
  background: #f4f5f9;
  margin: 0;
  padding: 15px;
  color: #222;
}

.container {
  max-width: 1200px;
  margin: 20px auto;
  background: white;
  padding: 22px;
  border-radius: 12px;
  box-shadow: 0 3px 15px #0001;
}

h1, h2, h3 { color: #35206d; }

.hidden { display: none !important; }

input, button, select, textarea {
  font: inherit;
}

input, select, textarea {
  width: 100%;
  padding: 11px;
  border: 1px solid #ccc;
  border-radius: 7px;
  margin: 5px 0;
}

button {
  background: #35206d;
  color: white;
  border: 0;
  border-radius: 7px;
  padding: 11px 14px;
  margin: 4px 2px;
  font-weight: bold;
  cursor: pointer;
}

button:hover { opacity: .88; }
button:disabled { opacity: .5; cursor: not-allowed; }

button.secondary { background: #666; }
button.success { background: #16834a; }
button.danger { background: #b52b37; }
button.warning { background: #a66b00; }

#message {
  color: #a12626;
  overflow-wrap: anywhere;
}

.panel {
  background: #f5f2fc;
  padding: 15px;
  margin: 14px 0;
  border-radius: 9px;
}

.menu {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.menu button {
  margin: 0;
  min-height: 45px;
}

.menu button.active {
  background: #6c4bb5;
  outline: 2px solid #35206d;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 15px 0;
}

.stat-card {
  background: white;
  border-left: 4px solid #35206d;
  padding: 16px;
  border-radius: 9px;
  box-shadow: 0 2px 8px #0001;
  min-width: 0;
}

.stat-card p {
  color: #666;
  font-size: 13px;
  margin: 0 0 10px;
}

.stat-card h2 {
  color: #35206d;
  margin: 0;
  font-size: 23px;
  overflow-wrap: anywhere;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  margin-top: 12px;
}

.data-table {
  width: 100%;
  min-width: 650px;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  background: #35206d;
  color: white;
  padding: 13px 10px;
  text-align: left;
  white-space: nowrap;
}

.data-table td {
  padding: 12px 10px;
  border-bottom: 1px solid #eee;
  overflow-wrap: anywhere;
  vertical-align: top;
}

.data-table tr:hover { background: #f5f2fc; }

.role-badge {
  display: inline-block;
  background: #eee8ff;
  color: #35206d;
  padding: 5px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: bold;
}

.status-pending { background: #fff1cc; color: #805600; }
.status-approved, .status-paid { background: #d9f5e4; color: #126b39; }
.status-rejected, .status-failed { background: #ffe0e0; color: #a12626; }
.status-processing { background: #dcecff; color: #174c87; }

.section-tools {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin: 10px 0;
}

.section-tools input {
  flex: 1;
  min-width: 180px;
}

.small-note {
  color: #666;
  font-size: 12px;
  line-height: 1.5;
}

.empty {
  background: white;
  padding: 20px;
  border-radius: 8px;
  color: #666;
  text-align: center;
}

.action-cell { min-width: 180px; }

.action-cell button {
  font-size: 11px;
  padding: 8px;
}

.finance-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.finance-card {
  background: white;
  padding: 14px;
  border-radius: 8px;
  border-left: 4px solid #35206d;
}

.finance-card span {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 7px;
}

.finance-card strong {
  color: #35206d;
  font-size: 20px;
}

#sectionContent {
  overflow-wrap: anywhere;
  line-height: 1.5;
}

@media (max-width: 700px) {
  .container { padding: 15px; margin: 5px auto; }
  .menu { grid-template-columns: repeat(2, 1fr); }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 400px) {
  .stats-grid, .finance-grid { grid-template-columns: 1fr; }
}
</style>
</head>

<body>
<div class="container">

  <h1>CrownVotes Admin</h1>
  <p>Administrator control panel</p>

  <!-- LOGIN -->
  <div id="login">
    <p id="message"></p>
    <h2>Admin Login</h2>

    <form id="loginForm">
      <input id="email" type="email" placeholder="Admin email" required>
      <input id="password" type="password" placeholder="Admin password" required>
      <button type="submit" id="loginButton">Login</button>
    </form>
  </div>

  <!-- DASHBOARD -->
  <div id="dashboard" class="hidden">

    <h2>Admin Control Centre</h2>
    <p id="welcome"></p>

    <!-- OVERVIEW CARDS -->
    <div id="statsGrid" class="stats-grid hidden">

      <div class="stat-card">
        <p>Total Users</p>
        <h2 id="statUsers">0</h2>
      </div>

      <div class="stat-card">
        <p>Total Organisers</p>
        <h2 id="statOrganisers">0</h2>
      </div>

      <div class="stat-card">
        <p>Total Events</p>
        <h2 id="statEvents">0</h2>
      </div>

      <div class="stat-card">
        <p>Total Votes</p>
        <h2 id="statVotes">0</h2>
      </div>

      <div class="stat-card">
        <p>Gross Revenue</p>
        <h2 id="statRevenue">GHS 0</h2>
      </div>

      <div class="stat-card">
        <p>Platform Earnings</p>
        <h2 id="statEarnings">GHS 0</h2>
      </div>

    </div>

    <!-- MANAGEMENT MENU -->
    <div class="panel">
      <h3>Management Menu</h3>

      <div class="menu" id="managementMenu">
        <button type="button" data-section="overview">Overview</button>
        <button type="button" data-section="users">Users</button>
        <button type="button" data-section="applications">Applications</button>
        <button type="button" data-section="events">Events</button>
        <button type="button" data-section="finance">Finance</button>
        <button type="button" data-section="payouts">Payouts</button>
        <button type="button" data-section="results">Results</button>
        <button type="button" data-section="audit-logs">Audit Logs</button>
      </div>
    </div>

    <!-- SECTION DISPLAY -->
    <div class="panel">
      <h3 id="sectionTitle">Overview</h3>

      <div id="sectionContent">Loading...</div>

      <button type="button" id="refresh">Refresh Section</button>
    </div>

    <button type="button" id="logout" class="danger">Logout</button>

  </div>
</div>

<script>
'use strict';

/* =========================
   GLOBAL VARIABLES
========================= */

const message = document.getElementById('message');

let token = localStorage.getItem('crownvotes_admin_token');
let currentSection = 'overview';
let requestId = 0;

const endpoints = {
  overview: '/api/admin/overview',
  users: '/api/admin/users',
  applications: '/api/admin/applications',
  events: '/api/admin/events',
  finance: '/api/admin/finance',
  payouts: '/api/admin/finance',
  results: '/api/admin/results',
  'audit-logs': '/api/admin/audit-logs'
};

const titles = {
  overview: 'Overview',
  users: 'Users',
  applications: 'Organiser Applications',
  events: 'Events',
  finance: 'Finance',
  payouts: 'Payouts',
  results: 'Election Results',
  'audit-logs': 'Audit Logs'
};


/* =========================
   HELPER FUNCTIONS
========================= */

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function money(value, currency = 'GHS') {
  return currency + ' ' + (Number(value || 0) / 100).toLocaleString(
    undefined,
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  );
}

function date(value) {
  if (!value) return '—';

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleString();
}

function badge(value) {
  const status = String(value || 'unknown');
  const css = 'status-' + status.toLowerCase().replace(/[^a-z0-9_-]/g, '');

  return `<span class="role-badge ${escapeHTML(css)}">${escapeHTML(status)}</span>`;
}

function emptyMessage(text) {
  return `<div class="empty">${escapeHTML(text)}</div>`;
}

function table(headers, rows) {
  return `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>${headers.map(h => `<th>${escapeHTML(h)}</th>`).join('')}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function searchBox(placeholder = 'Search this table...') {
  return `
    <div class="section-tools">
      <input type="search" class="table-search"
        placeholder="${escapeHTML(placeholder)}">
    </div>
  `;
}

function filterTable(input) {
  const panel = input.closest('#sectionContent');
  if (!panel) return;

  const query = input.value.toLowerCase();
  const rows = panel.querySelectorAll('.data-table tbody tr');

  rows.forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(query)
      ? ''
      : 'none';
  });
}


/* =========================
   API REQUEST FUNCTION
========================= */

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': 'Bearer ' + token } : {}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed. HTTP ' + response.status);
  }

  return data;
}


/* =========================
   OVERVIEW
========================= */

function renderOverview(data) {
  document.getElementById('statsGrid').classList.remove('hidden');

  document.getElementById('statUsers').textContent =
    Number(data.users || 0).toLocaleString();

  document.getElementById('statOrganisers').textContent =
    Number(data.organisers || 0).toLocaleString();

  document.getElementById('statEvents').textContent =
    Number(data.events || 0).toLocaleString();

  document.getElementById('statVotes').textContent =
    Number(data.votes || 0).toLocaleString();

  document.getElementById('statRevenue').textContent =
    money(data.revenue);

  document.getElementById('statEarnings').textContent =
    money(data.platform_earnings);

  const percent = Number(data.default_commission_bps || 0) / 100;

  document.getElementById('sectionContent').innerHTML = `
    <h3>Platform Summary</h3>
    <p>Your CrownVotes platform statistics are displayed above.</p>

    <div class="finance-grid">
      <div class="finance-card">
        <span>Organiser Earnings</span>
        <strong>${escapeHTML(money(data.organiser_earnings))}</strong>
      </div>

      <div class="finance-card">
        <span>Default Commission</span>
        <strong>${escapeHTML(percent)}%</strong>
      </div>
    </div>

    <div class="panel">
      <h3>Update Default Commission</h3>
      <p class="small-note">
        Enter a percentage between 0 and 30. This setting applies
        to newly created events unless a different commission is set.
      </p>

      <input id="defaultCommission" type="number"
        min="0" max="30" step="0.01"
        value="${escapeHTML(percent)}">

      <button type="button" data-action="save-default-commission">
        Save Commission
      </button>
    </div>
  `;
}


/* =========================
   USERS
========================= */

function renderUsers(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return emptyMessage('No registered users found.');
  }

  const rows = data.map(user => `
    <tr>
      <td>${escapeHTML(user.id)}</td>
      <td>${escapeHTML(user.name)}</td>
      <td>${escapeHTML(user.email)}</td>
      <td>${badge(user.role)}</td>
      <td>${escapeHTML(date(user.created_at))}</td>
    </tr>
  `).join('');

  return `
    <p>Registered users: <strong>${data.length}</strong></p>
    ${searchBox('Search users by name, email or role...')}
    ${table(
      ['ID', 'Name', 'Email', 'Role', 'Registration Date'],
      rows
    )}
  `;
}


/* =========================
   ORGANISER APPLICATIONS
========================= */

function renderApplications(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return emptyMessage('No organiser applications found.');
  }

  const rows = data.map(application => `
    <tr>
      <td>${escapeHTML(application.id)}</td>
      <td>${escapeHTML(application.name)}</td>
      <td>${escapeHTML(application.email)}</td>
      <td>${escapeHTML(application.organisation)}</td>
      <td>${escapeHTML(application.phone)}</td>
      <td>${badge(application.status || 'pending')}</td>
      <td>${escapeHTML(application.admin_note || '—')}</td>
      <td>${escapeHTML(date(application.created_at))}</td>

      <td class="action-cell">
        <button class="success" type="button"
          data-action="application-review"
          data-id="${escapeHTML(application.id)}"
          data-status="approved">Approve</button>

        <button class="danger" type="button"
          data-action="application-review"
          data-id="${escapeHTML(application.id)}"
          data-status="rejected">Reject</button>
      </td>
    </tr>
  `).join('');

  return `
    <p>Applications: <strong>${data.length}</strong></p>
    ${searchBox('Search applications...')}
    ${table(
      [
        'ID', 'Applicant', 'Email', 'Organisation',
        'Phone', 'Status', 'Admin Note', 'Submitted', 'Actions'
      ],
      rows
    )}
  `;
}


/* =========================
   EVENTS
========================= */

function renderEvents(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return emptyMessage('No events have been created yet.');
  }

  const rows = data.map(event => `
    <tr>
      <td>${escapeHTML(event.id)}</td>
      <td>
        <strong>${escapeHTML(event.title)}</strong>
        <br>
        <span class="small-note">${escapeHTML(event.slug)}</span>
      </td>
      <td>${escapeHTML(event.organiser || '—')}</td>
      <td>${badge(event.status)}</td>
      <td>${escapeHTML(event.payment_approval || 'pending')}</td>
      <td>${escapeHTML(money(event.vote_price, event.currency || 'GHS'))}</td>
      <td>${escapeHTML(Number(event.commission_bps || 0) / 100)}%</td>
      <td>${escapeHTML(date(event.created_at))}</td>

      <td class="action-cell">
        <button type="button" class="secondary"
          data-action="event-status"
          data-id="${escapeHTML(event.id)}"
          data-status="${event.status === 'published' ? 'draft' : 'published'}">
          ${event.status === 'published' ? 'Set Draft' : 'Publish'}
        </button>

        <button type="button" class="warning"
          data-action="event-payment"
          data-id="${escapeHTML(event.id)}">
          Payment Approval
        </button>

        <button type="button"
          data-action="event-commission"
          data-id="${escapeHTML(event.id)}"
          data-commission="${escapeHTML(Number(event.commission_bps || 0) / 100)}">
          Commission
        </button>

        <button type="button" class="danger"
          data-action="event-delete"
          data-id="${escapeHTML(event.id)}">
          Delete
        </button>
      </td>
    </tr>
  `).join('');

  return `
    <p>Total events: <strong>${data.length}</strong></p>
    <p class="small-note">
      Publishing requires at least one nominee. Events with voting or
      payment records cannot be permanently deleted.
    </p>
    ${searchBox('Search events by title, organiser or status...')}
    ${table(
      [
        'ID', 'Event', 'Organiser', 'Status',
        'Payment Approval', 'Vote Price', 'Commission',
        'Created', 'Management'
      ],
      rows
    )}
  `;
}


/* =========================
   FINANCE
========================= */

function renderFinance(data) {
  const transactions = Array.isArray(data.transactions)
    ? data.transactions
    : [];

  const rows = transactions.map(payment => `
    <tr>
      <td>${escapeHTML(payment.reference)}</td>
      <td>${escapeHTML(payment.event)}</td>
      <td>${escapeHTML(payment.organiser || '—')}</td>
      <td>${escapeHTML(money(payment.amount, payment.currency || 'GHS'))}</td>
      <td>${escapeHTML(payment.platform_fee == null ? '—' : money(payment.platform_fee, payment.currency || 'GHS'))}</td>
      <td>${escapeHTML(payment.organiser_net == null ? '—' : money(payment.organiser_net, payment.currency || 'GHS'))}</td>
      <td>${escapeHTML(payment.provider || '—')}</td>
      <td>${badge(payment.status)}</td>
      <td>${escapeHTML(date(payment.settled_at || payment.created_at))}</td>
    </tr>
  `).join('');

  return `
    <h3>Financial Summary</h3>

    <div class="finance-grid">
      <div class="finance-card">
        <span>Gross Revenue</span>
        <strong>${escapeHTML(money(data.gross))}</strong>
      </div>

      <div class="finance-card">
        <span>Platform Fees</span>
        <strong>${escapeHTML(money(data.platform_fees))}</strong>
      </div>

      <div class="finance-card">
        <span>Organiser Net Earnings</span>
        <strong>${escapeHTML(money(data.organiser_net))}</strong>
      </div>

      <div class="finance-card">
        <span>Payouts Requested</span>
        <strong>${escapeHTML(money(data.payouts_requested))}</strong>
      </div>

      <div class="finance-card">
        <span>Payouts Paid</span>
        <strong>${escapeHTML(money(data.payouts_paid))}</strong>
      </div>
    </div>

    <h3>Paid Transactions</h3>

    ${transactions.length
      ? searchBox('Search transactions...')
      : emptyMessage('No paid transactions yet.')}

    ${transactions.length
      ? table(
          [
            'Reference', 'Event', 'Organiser', 'Gross',
            'Platform Fee', 'Organiser Net', 'Provider',
            'Status', 'Settled'
          ],
          rows
        )
      : ''
    }
  `;
}


/* =========================
   PAYOUTS
========================= */

function renderPayouts(data) {
  const payouts = Array.isArray(data.payouts) ? data.payouts : [];

  if (payouts.length === 0) {
    return emptyMessage('No payout requests found.');
  }

  const rows = payouts.map(payout => `
    <tr>
      <td>${escapeHTML(payout.id)}</td>
      <td>${escapeHTML(payout.organiser || '—')}</td>
      <td>${escapeHTML(payout.email || '—')}</td>
      <td>${escapeHTML(money(payout.amount, payout.currency || 'GHS'))}</td>
      <td>${escapeHTML(payout.destination || '—')}</td>
      <td>${escapeHTML(payout.reference || '—')}</td>
      <td>${badge(payout.status)}</td>
      <td>${escapeHTML(payout.admin_note || '—')}</td>
      <td>${escapeHTML(date(payout.created_at))}</td>

      <td class="action-cell">
        <button type="button" class="secondary"
          data-action="payout-status"
          data-id="${escapeHTML(payout.id)}"
          data-status="processing">Processing</button>

        <button type="button" class="success"
          data-action="payout-status"
          data-id="${escapeHTML(payout.id)}"
          data-status="paid">Mark Paid</button>

        <button type="button" class="danger"
          data-action="payout-status"
          data-id="${escapeHTML(payout.id)}"
          data-status="rejected">Reject</button>
      </td>
    </tr>
  `).join('');

  return `
    <p>Total payout requests: <strong>${payouts.length}</strong></p>
    <p class="small-note">
      The payout destination is sensitive financial information.
      Mark a payout as paid only after completing the transfer and
      entering its bank or Mobile Money reference.
    </p>

    ${searchBox('Search payouts...')}

    ${table(
      [
        'ID', 'Organiser', 'Email', 'Amount', 'Destination',
        'Reference', 'Status', 'Admin Note', 'Requested', 'Actions'
      ],
      rows
    )}
  `;
}


/* =========================
   ELECTION RESULTS
========================= */

function renderResults(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return emptyMessage('No election results available yet.');
  }

  const rows = data.map(result => `
    <tr>
      <td>${escapeHTML(result.event)}</td>
      <td>${escapeHTML(result.category)}</td>
      <td>${escapeHTML(result.nominee_id)}</td>
      <td>${escapeHTML(result.nominee)}</td>
      <td><strong>${Number(result.vote_count || 0).toLocaleString()}</strong></td>
    </tr>
  `).join('');

  return `
    <p>Nominee result records: <strong>${data.length}</strong></p>
    ${searchBox('Search events, categories or nominees...')}
    ${table(
      ['Event', 'Category', 'Nominee ID', 'Nominee', 'Votes'],
      rows
    )}
  `;
}


/* =========================
   AUDIT LOGS
========================= */

function renderAuditLogs(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return emptyMessage('No administrator activity has been recorded yet.');
  }

  const rows = data.map(log => `
    <tr>
      <td>${escapeHTML(log.id)}</td>
      <td>${escapeHTML(log.actor_name || 'System')}</td>
      <td>${escapeHTML(log.actor_email || '—')}</td>
      <td>${escapeHTML(log.action)}</td>
      <td>${escapeHTML(log.target_type)}</td>
      <td>${escapeHTML(log.target_id)}</td>
      <td>${escapeHTML(log.details || '—')}</td>
      <td>${escapeHTML(date(log.created_at))}</td>
    </tr>
  `).join('');

  return `
    <p>Activity records: <strong>${data.length}</strong></p>
    ${searchBox('Search audit logs...')}
    ${table(
      [
        'ID', 'Administrator', 'Email', 'Action',
        'Target Type', 'Target ID', 'Details', 'Date'
      ],
      rows
    )}
  `;
}


/* =========================
   SECTION NAVIGATION
========================= */

async function showSection(section) {
  if (!endpoints[section]) return;

  currentSection = section;
  const thisRequest = ++requestId;

  const output = document.getElementById('sectionContent');
  const heading = document.getElementById('sectionTitle');
  const statsGrid = document.getElementById('statsGrid');

  heading.textContent = titles[section];
  output.textContent = 'Loading ' + titles[section] + '...';

  document.querySelectorAll('#managementMenu button').forEach(button => {
    button.classList.toggle(
      'active',
      button.dataset.section === section
    );
  });

  try {
    const data = await api(endpoints[section]);

    if (thisRequest !== requestId) return;

    if (section === 'overview') {
      renderOverview(data);
      return;
    }

    statsGrid.classList.add('hidden');

    switch (section) {
      case 'users':
        output.innerHTML = renderUsers(data);
        break;

      case 'applications':
        output.innerHTML = renderApplications(data);
        break;

      case 'events':
        output.innerHTML = renderEvents(data);
        break;

      case 'finance':
        output.innerHTML = renderFinance(data);
        break;

      case 'payouts':
        output.innerHTML = renderPayouts(data);
        break;

      case 'results':
        output.innerHTML = renderResults(data);
        break;

      case 'audit-logs':
        output.innerHTML = renderAuditLogs(data);
        break;

      default:
        output.textContent = 'Section not available.';
    }

  } catch (error) {
    if (thisRequest !== requestId) return;

    output.innerHTML = `
      <div class="empty">
        <strong>Unable to load ${escapeHTML(titles[section])}.</strong>
        <p>${escapeHTML(error.message)}</p>
      </div>
    `;
  }
}


/* =========================
   DASHBOARD LOGIN
========================= */

async function loadDashboard() {
  try {
    const user = await api('/api/me');

    if (!user || user.role !== 'admin') {
      throw new Error('This account is not an administrator account.');
    }

    document.getElementById('login').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');

    document.getElementById('welcome').textContent =
      'Logged in as ' + (user.email || 'Administrator');

    message.textContent = '';

    await showSection('overview');

  } catch (error) {
    token = null;
    localStorage.removeItem('crownvotes_admin_token');

    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');

    message.textContent = error.message;
  }
}


/* =========================
   LOGIN FORM
========================= */

document.getElementById('loginForm')
  .addEventListener('submit', async function(event) {
    event.preventDefault();

    const loginButton = document.getElementById('loginButton');

    loginButton.disabled = true;
    message.style.color = 'blue';
    message.textContent = 'Signing in...';

    try {
      const result = await api('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: document.getElementById('email').value,
          password: document.getElementById('password').value
        })
      });

      if (!result.token) {
        throw new Error('Login did not return a token.');
      }

      token = result.token;
      localStorage.setItem('crownvotes_admin_token', token);

      await loadDashboard();

    } catch (error) {
      message.style.color = '#a12626';
      message.textContent = error.message;

    } finally {
      loginButton.disabled = false;
    }
  });


/* =========================
   THIS CONNECTS ALL MENU BUTTONS
========================= */

document.getElementById('managementMenu')
  .addEventListener('click', function(event) {
    const button = event.target.closest('button[data-section]');

    if (!button) return;

    showSection(button.dataset.section);
  });


/* =========================
   TABLE SEARCH
========================= */

document.getElementById('sectionContent')
  .addEventListener('input', function(event) {
    if (event.target.classList.contains('table-search')) {
      filterTable(event.target);
    }
  });


/* =========================
   MANAGEMENT ACTIONS
========================= */

document.getElementById('sectionContent')
  .addEventListener('click', async function(event) {
    const button = event.target.closest('button[data-action]');

    if (!button) return;

    const action = button.dataset.action;
    const id = button.dataset.id;

    try {
      button.disabled = true;

      /* APPLICATION APPROVAL */

      if (action === 'application-review') {
        const status = button.dataset.status;

        const note = prompt(
          'Optional administrator note for this application:',
          ''
        );

        if (note === null) return;

        if (!confirm('Are you sure you want to ' + status + ' this application?')) {
          return;
        }

        await api('/api/admin/applications/' + encodeURIComponent(id), {
          method: 'PATCH',
          body: JSON.stringify({
            status,
            admin_note: note
          })
        });

        alert('Application ' + status + ' successfully.');
        await showSection('applications');
        return;
      }


      /* EVENT PUBLICATION STATUS */

      if (action === 'event-status') {
        const status = button.dataset.status;

        if (!confirm('Change this event status to ' + status + '?')) {
          return;
        }

        await api('/api/organiser/events/' + encodeURIComponent(id) + '/status', {
          method: 'PATCH',
          body: JSON.stringify({ status })
        });

        alert('Event status updated.');
        await showSection('events');
        return;
      }


      /* EVENT PAYMENT APPROVAL */

      if (action === 'event-payment') {
        const status = prompt(
          'Enter payment approval status: pending, approved or rejected',
          'pending'
        );

        if (status === null) return;

        const cleanStatus = status.trim().toLowerCase();

        if (!['pending', 'approved', 'rejected'].includes(cleanStatus)) {
          throw new Error('Enter pending, approved or rejected.');
        }

        let note = '';

        if (cleanStatus === 'approved') {
          note = prompt(
            'Enter the provider approval reference and compliance review note (at least 5 characters):'
          );

          if (note === null) return;
        } else {
          note = prompt('Optional approval note:', '') || '';
        }

        await api('/api/admin/events/' + encodeURIComponent(id) + '/payment-approval', {
          method: 'PATCH',
          body: JSON.stringify({
            payment_approval: cleanStatus,
            approval_note: note
          })
        });

        alert('Event payment approval updated.');
        await showSection('events');
        return;
      }


      /* EVENT COMMISSION */

      if (action === 'event-commission') {
        const current = button.dataset.commission || '10';

        const answer = prompt(
          'Enter event commission percentage (0 to 30):',
          current
        );

        if (answer === null) return;

        const percent = Number(answer);

        if (!Number.isFinite(percent) || percent < 0 || percent > 30) {
          throw new Error('Commission must be between 0 and 30 percent.');
        }

        await api('/api/admin/events/' + encodeURIComponent(id) + '/commission', {
          method: 'PATCH',
          body: JSON.stringify({
            commission_bps: Math.round(percent * 100)
          })
        });

        alert('Event commission updated.');
        await showSection('events');
        return;
      }


      /* EVENT DELETION */

      if (action === 'event-delete') {
        if (!confirm(
          'Permanently delete this event? This cannot be undone. Events with votes or payments cannot be deleted.'
        )) {
          return;
        }

        await api('/api/admin/events/' + encodeURIComponent(id), {
          method: 'DELETE'
        });

        alert('Event deleted successfully.');
        await showSection('events');
        return;
      }


      /* PAYOUT STATUS */

      if (action === 'payout-status') {
        const status = button.dataset.status;
        let note = '';

        if (status === 'paid') {
          note = prompt(
            'Enter the completed bank or Mobile Money transfer reference:'
          );

          if (note === null) return;

          if (note.trim().length < 5) {
            throw new Error('The transfer reference must contain at least 5 characters.');
          }

          if (!confirm('Confirm that this payout has actually been transferred?')) {
            return;
          }

        } else {
          note = prompt('Optional administrator note:', '') || '';

          if (!confirm('Change payout status to ' + status + '?')) {
            return;
          }
        }

        await api('/api/admin/payouts/' + encodeURIComponent(id), {
          method: 'PATCH',
          body: JSON.stringify({
            status,
            admin_note: note
          })
        });

        alert('Payout status updated.');
        await showSection('payouts');
        return;
      }


      /* DEFAULT PLATFORM COMMISSION */

      if (action === 'save-default-commission') {
        const input = document.getElementById('defaultCommission');
        const percent = Number(input.value);

        if (!Number.isFinite(percent) || percent < 0 || percent > 30) {
          throw new Error('Commission must be between 0 and 30 percent.');
        }

        if (!confirm('Save the default commission as ' + percent + '%?')) {
          return;
        }

        await api('/api/admin/settings/commission', {
          method: 'PATCH',
          body: JSON.stringify({
            default_commission_bps: Math.round(percent * 100)
          })
        });

        alert('Default commission updated.');
        await showSection('overview');
        return;
      }

    } catch (error) {
      alert(error.message || 'The requested action could not be completed.');

    } finally {
      button.disabled = false;
    }
  });


/* =========================
   REFRESH BUTTON
========================= */

document.getElementById('refresh')
  .addEventListener('click', function() {
    showSection(currentSection);
  });


/* =========================
   LOGOUT BUTTON
========================= */

document.getElementById('logout')
  .addEventListener('click', function() {
    token = null;
    localStorage.removeItem('crownvotes_admin_token');

    requestId++;

    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');

    document.getElementById('password').value = '';
    message.textContent = 'You have logged out.';
    message.style.color = '#a12626';
  });


/* =========================
   STARTUP
========================= */

if (token) {
  loadDashboard();
}
</script>
</body>
</html>
