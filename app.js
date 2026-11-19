const $ = (s) => document.querySelector(s);
let token = localStorage.getItem('cv_token') || '';
let currentUser = null;
let defaultCommissionBps = 1000;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = (n) => `GHS ${(Number(n || 0) / 100).toFixed(2)}`;
function toast(message) {
  const node = $('#toast'); node.textContent = message; node.style.display = 'block';
  clearTimeout(window.cvToastTimer); window.cvToastTimer = setTimeout(() => node.style.display = 'none', 3500);
}
async function api(path, options = {}) {
  const response = await fetch('/api' + path, {
    ...options,
    headers: {'Content-Type':'application/json', ...(token ? {Authorization:'Bearer ' + token} : {}), ...(options.headers || {})}
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Something went wrong.');
  return data;
}
function modal(html) { $('#modalContent').innerHTML = html; $('#modal').classList.remove('hidden'); }
function closeModal() { $('#modal').classList.add('hidden'); }
function logout() {
  token = ''; currentUser = null; localStorage.removeItem('cv_token');
  $('#accountBtn').textContent = 'Sign in'; closeModal(); toast('You have signed out.');
}
function logoutMarkup() { return '<button class="outline" id="logout" style="margin-top:20px">Sign out</button>'; }
function bindLogout() { $('#logout')?.addEventListener('click', logout); }

$('#closeModal').onclick = closeModal;
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
$('#year').textContent = new Date().getFullYear();

function showLogin() {
  modal(`<p class="eyebrow">YOUR CROWNVOTES ACCOUNT</p><h2>Welcome back.</h2>
    <div class="field"><label>Email address</label><input id="loginEmail" type="email" autocomplete="email" placeholder="you@example.com"></div>
    <div class="field"><label>Password</label><input id="loginPassword" type="password" autocomplete="current-password"></div>
    <button class="gold-btn form-btn" id="loginSubmit">Sign in</button>
    <p class="muted">New to CrownVotes? <a href="#" id="registerLink" style="color:#e2c47d">Create an account</a></p>`);
  $('#loginSubmit').onclick = async () => {
    try {
      const data = await api('/auth/login', {method:'POST', body:JSON.stringify({email:$('#loginEmail').value,password:$('#loginPassword').value})});
      token = data.token; currentUser = data.user; localStorage.setItem('cv_token', token);
      $('#accountBtn').textContent = currentUser.name.split(' ')[0]; closeModal(); toast('Welcome to CrownVotes.');
    } catch (error) { toast(error.message); }
  };
  $('#registerLink').onclick = e => { e.preventDefault(); showRegister(); };
}
function showRegister() {
  modal(`<p class="eyebrow">JOIN THE COMMUNITY</p><h2>Create your account.</h2>
    <div class="field"><label>Full name</label><input id="registerName" autocomplete="name"></div>
    <div class="field"><label>Email address</label><input id="registerEmail" type="email" autocomplete="email"></div>
    <div class="field"><label>Password (at least 10 characters)</label><input id="registerPassword" type="password" autocomplete="new-password"></div>
    <button class="gold-btn form-btn" id="registerSubmit">Create account</button>
    <p class="muted">Already registered? <a href="#" id="loginLink" style="color:#e2c47d">Sign in</a></p>`);
  $('#registerSubmit').onclick = async () => {
    try {
      const data = await api('/auth/register', {method:'POST', body:JSON.stringify({name:$('#registerName').value,email:$('#registerEmail').value,password:$('#registerPassword').value})});
      token = data.token; currentUser = data.user; localStorage.setItem('cv_token', token);
      $('#accountBtn').textContent = currentUser.name.split(' ')[0]; closeModal(); toast('Your account is ready.');
    } catch (error) { toast(error.message); }
  };
  $('#loginLink').onclick = e => { e.preventDefault(); showLogin(); };
}
async function refreshAccount() {
  if (!token) { $('#accountBtn').textContent = 'Sign in'; return; }
  try { currentUser = await api('/me'); $('#accountBtn').textContent = currentUser.name.split(' ')[0]; }
  catch { token = ''; currentUser = null; localStorage.removeItem('cv_token'); $('#accountBtn').textContent = 'Sign in'; }
}
async function dashboard() {
  await refreshAccount();
  if (!currentUser) return showLogin();
  if (currentUser.role === 'admin') return adminDashboard();
  if (currentUser.role === 'organiser') return organiserDashboard();
  return voterDashboard();
}
$('#accountBtn').onclick = () => token ? dashboard() : showLogin();
$('#organiseBtn').onclick = $('#ctaOrganise').onclick = () => token ? dashboard() : showLogin();

async function voterDashboard() {
  let application = null;
  try { application = await api('/organiser/application'); } catch {}
  modal(`<p class="eyebrow">MY CROWNVOTES</p><h2>Hello, ${esc(currentUser.name.split(' ')[0])}.</h2>
    <div class="actions" style="margin:12px 0"><button class="outline" id="historyTab">My votes</button><button class="outline" id="organiserTab">Become an organiser</button></div>
    <div id="voterPanel"><p class="muted">Check your voting history or apply to organise an award.</p></div>${logoutMarkup()}`);
  $('#historyTab').onclick = async () => {
    try {
      const rows = await api('/votes/mine');
      $('#voterPanel').innerHTML = rows.length ? rows.map(v => `<div class="nominee"><div><b>${esc(v.nominee)}</b><div class="muted">${v.quantity} votes · ${esc(v.created_at)}</div><small>${esc(v.reference)} · ${esc(v.payment_status)}</small></div><b>${money(v.amount)}</b></div>`).join('') : '<p class="muted">You have not cast any votes yet.</p>';
    } catch (error) { toast(error.message); }
  };
  $('#organiserTab').onclick = () => {
    if (application && application.status !== 'rejected') {
      $('#voterPanel').innerHTML = `<p><b>Application status: ${esc(application.status)}</b></p><p class="muted">${esc(application.admin_note || 'Your application is being handled by CrownVotes.')}</p>`;
      return;
    }
    $('#voterPanel').innerHTML = `<h3>Organiser application</h3>
      <div class="field"><label>Organisation / event brand</label><input id="orgName" placeholder="Your organisation"></div>
      <div class="field"><label>Contact phone</label><input id="orgPhone" inputmode="tel" placeholder="0240000000"></div>
      <div class="field"><label>Tell us about your award</label><textarea id="orgDetails" rows="4"></textarea></div>
      <button class="gold-btn" id="sendApplication">Submit application</button>`;
    $('#sendApplication').onclick = async () => {
      try {
        await api('/organiser/apply', {method:'POST',body:JSON.stringify({organisation:$('#orgName').value,phone:$('#orgPhone').value,details:$('#orgDetails').value})});
        toast('Organiser application submitted.'); voterDashboard();
      } catch (error) { toast(error.message); }
    };
  };
  bindLogout();
}

function eventForm() {
  const commission = currentUser?.role === 'admin'
    ? `<div class="field"><label>CrownVotes commission (%)</label><input id="commission" type="number" min="0" max="30" step="0.5" value="${(defaultCommissionBps/100).toFixed(1)}"></div>`
    : `<p class="muted">The platform administrator sets the commission rate for your event.</p>`;
  return `<h3>Create an award event</h3>
    <div class="field"><label>Event title</label><input id="eventTitle" placeholder="e.g. Ghana Excellence Awards"></div>
    <div class="field"><label>Description</label><textarea id="eventDesc" rows="3"></textarea></div>
    <div class="field"><label>Price per vote (GHS)</label><input id="votePrice" type="number" min="0.01" step="0.01" value="1.00"></div>
    <div class="field"><label>Start date and time (optional)</label><input id="eventStart" type="datetime-local"></div>
    <div class="field"><label>End date and time (optional)</label><input id="eventEnd" type="datetime-local"></div>
    <div class="field"><label>Prize structure</label><select id="prize"><option value="recognition">Recognition only</option><option value="cash">Cash prizes</option><option value="material">Material prizes</option><option value="mixed" selected>Mixed</option></select></div>
    ${commission}
    <p class="muted">New events are saved as drafts. Publish after adding at least one category and contestant. Paid voting requires separate payment-provider approval.</p>
    <button class="gold-btn form-btn" id="createEvent">Create event</button>`;
}
async function createEvent() {
  try {
    const payload = {
      title:$('#eventTitle').value, description:$('#eventDesc').value,
      vote_price:Math.round(Number($('#votePrice').value) * 100),
      starts_at:$('#eventStart').value || undefined, ends_at:$('#eventEnd').value || undefined,
      prize_structure:$('#prize').value, status:'draft'
    };
    if (currentUser?.role === 'admin') payload.commission_bps = Math.round(Number($('#commission').value) * 100);
    const event = await api('/organiser/events', {method:'POST',body:JSON.stringify(payload)});
    toast('Event created. Add categories and contestants next.'); manageEvent(event.id);
  } catch (error) { toast(error.message); }
}
async function organiserDashboard() {
  try {
    const data = await api('/organiser/dashboard');
    modal(`<p class="eyebrow">ORGANISER STUDIO</p><h2>Your event dashboard</h2>
      <div class="stats" style="padding:12px 0;grid-template-columns:repeat(2,1fr)">
        <div><b>${data.events.length}</b><small>Events</small></div><div><b>${money(data.gross)}</b><small>Gross paid votes</small></div>
        <div><b>${money(data.fees)}</b><small>CrownVotes commission</small></div><div><b>${money(data.available)}</b><small>Available organiser balance</small></div>
      </div>${eventForm()}<h3>Your events</h3>
      ${data.events.map(e => `<div class="nominee"><div><b>${esc(e.title)}</b><div class="muted">${esc(e.status)} · ${(e.commission_bps/100).toFixed(2)}% commission</div></div><button data-manage="${e.id}">Manage</button></div>`).join('') || '<p class="muted">No events created yet.</p>'}
      <h3>Request payout</h3><div class="field"><label>Amount (GHS)</label><input id="payoutAmount" type="number" min="0.01" step="0.01" max="${(data.available/100).toFixed(2)}" placeholder="100.00"></div>
      <div class="field"><label>Bank / Mobile Money destination</label><input id="payoutDestination" placeholder="Account name and MoMo number"></div><button class="outline" id="requestPayout">Request payout</button>
      <h3>Payout history</h3>${data.payouts.map(p => `<div class="nominee"><div><b>${money(p.amount)}</b><div class="muted">${esc(p.status)} · ${esc(p.reference)}</div></div></div>`).join('') || '<p class="muted">No payout requests yet.</p>'}
      <h3>Recent payments</h3>${data.recent_payments.map(p => `<div class="nominee"><div><b>${esc(p.event)}</b><div class="muted">${esc(p.reference)} · ${esc(p.status)}</div></div><div>${money(p.organiser_net)} net</div></div>`).join('') || '<p class="muted">No payments yet.</p>'}${logoutMarkup()}`);
    $('#createEvent').onclick = createEvent;
    document.querySelectorAll('[data-manage]').forEach(b => b.onclick = () => manageEvent(Number(b.dataset.manage)));
    $('#requestPayout').onclick = async () => {
      try {
        await api('/organiser/payouts',{method:'POST',body:JSON.stringify({amount:Math.round(Number($('#payoutAmount').value)*100),destination:$('#payoutDestination').value})});
        toast('Payout request submitted.'); organiserDashboard();
      } catch (error) { toast(error.message); }
    };
    bindLogout();
  } catch (error) { toast(error.message); }
}

async function manageEvent(id) {
  try {
    const event = await api('/organiser/events/' + id);
    modal(`<p class="eyebrow">EVENT MANAGEMENT</p><h2>${esc(event.title)}</h2>
      <p class="muted">Page: ${esc(event.status)} · Paid voting approval: ${esc(event.payment_approval)} · Commission: ${(event.commission_bps/100).toFixed(2)}%</p>
      <div class="field"><label>Event page status</label><select id="editStatus"><option value="draft" ${event.status==='draft'?'selected':''}>Draft</option><option value="published" ${event.status==='published'?'selected':''}>Published</option><option value="closed" ${event.status==='closed'?'selected':''}>Closed</option></select></div>
      <button class="outline" id="saveEvent">Save event status</button><h3>Categories & contestants</h3>
      ${event.categories.map(c => `<div class="nominee"><div><b>${esc(c.name)}</b><small>Category ID: ${c.id}</small>
        ${c.nominees.map(n => `<div class="nominee"><div><b>${esc(n.name)}</b><div class="muted">${esc(n.short_code)} · ${n.vote_count} votes</div></div><button data-editnom="${n.id}" data-name="${esc(n.name)}" data-bio="${esc(n.bio||'')}">Edit</button><button data-delnom="${n.id}">Delete</button></div>`).join('')}
      </div></div>`).join('') || '<p class="muted">No categories added yet.</p>'}
      <h3>Add category</h3><div class="field"><label>Category name</label><input id="catName" placeholder="e.g. Student of the Year"></div><button class="outline" id="addCat">Add category</button><div id="catFeedback"></div>
      <h3>Add contestant</h3><div class="field"><label>Category ID</label><input id="nomCategory" type="number" placeholder="Category ID"></div>
      <div class="field"><label>Contestant name</label><input id="nomName"></div><div class="field"><label>Short biography</label><textarea id="nomBio"></textarea></div><div class="field"><label>Photo URL (HTTPS, optional)</label><input id="nomImage" type="url"></div>
      <button class="gold-btn" id="addNom">Add contestant</button><div id="nomFeedback"></div>
      <p class="muted">Each contestant receives a unique code such as CV0001. These are contestant IDs, not an activated SMS/USSD shortcode.</p>
      <button class="outline" id="backDash">Back to dashboard</button>`);
    $('#saveEvent').onclick = async () => {
      try {
        const status = $('#editStatus').value;
        if (status === 'closed') await api('/organiser/events/' + id,{method:'PATCH',body:JSON.stringify({status})});
        else await api('/organiser/events/' + id + '/status',{method:'PATCH',body:JSON.stringify({status})});
        toast('Event status updated.'); manageEvent(id);
      } catch (error) { toast(error.message); }
    };
    document.querySelectorAll('[data-editnom]').forEach(b => b.onclick = async () => {
      const name = prompt('Contestant name:',b.dataset.name); if (name === null) return;
      const bio = prompt('Contestant biography:',b.dataset.bio || ''); if (bio === null) return;
      try { await api('/organiser/nominees/' + b.dataset.editnom,{method:'PATCH',body:JSON.stringify({name,bio})}); toast('Contestant updated.'); manageEvent(id); }
      catch (error) { toast(error.message); }
    });
    document.querySelectorAll('[data-delnom]').forEach(b => b.onclick = async () => {
      if (!confirm('Delete this contestant? A contestant with recorded votes cannot be deleted.')) return;
      try { await api('/organiser/nominees/' + b.dataset.delnom,{method:'DELETE'}); toast('Contestant deleted.'); manageEvent(id); }
      catch (error) { toast(error.message); }
    });
    $('#addCat').onclick = async () => {
      try { const category = await api(`/organiser/events/${id}/categories`,{method:'POST',body:JSON.stringify({name:$('#catName').value})});
        $('#catFeedback').innerHTML = `<p style="color:#e2c47d">Category created. ID: <b>${category.id}</b></p>`; $('#nomCategory').value = category.id; toast('Category created.');
      } catch (error) { toast(error.message); }
    };
    $('#addNom').onclick = async () => {
      try { const nominee = await api(`/organiser/categories/${Number($('#nomCategory').value)}/nominees`,{method:'POST',body:JSON.stringify({name:$('#nomName').value,bio:$('#nomBio').value,image_url:$('#nomImage').value})});
        $('#nomFeedback').innerHTML = `<p style="color:#e2c47d">Contestant added: <b>${esc(nominee.name)}</b><br>Voting code: <b>${esc(nominee.short_code)}</b> <button class="outline" id="copyCode">Copy code</button></p>`;
        $('#copyCode').onclick = () => navigator.clipboard?.writeText(nominee.short_code).then(() => toast('Contestant code copied.')).catch(() => toast('Copy is unavailable in this browser.'));
        toast('Contestant added.');
      } catch (error) { toast(error.message); }
    };
    $('#backDash').onclick = organiserDashboard;
  } catch (error) { toast(error.message); }
}

async function adminDashboard() {
  try {
    const [overview,finance,events,applications] = await Promise.all([api('/admin/overview'),api('/admin/finance'),api('/admin/events'),api('/admin/applications')]);
    defaultCommissionBps = overview.default_commission_bps ?? 1000;
    modal(`<p class="eyebrow">CROWNVOTES CONTROL CENTRE</p><h2>Administrator dashboard</h2>
      <div class="stats" style="padding:12px 0;grid-template-columns:repeat(2,1fr)">
        <div><b>${overview.users}</b><small>Users</small></div><div><b>${overview.organisers}</b><small>Organisers</small></div>
        <div><b>${overview.events}</b><small>Events</small></div><div><b>${overview.votes}</b><small>Votes</small></div>
        <div><b>${money(overview.platform_earnings)}</b><small>Platform earnings</small></div><div><b>${money(overview.organiser_earnings)}</b><small>Organiser earnings</small></div>
      </div>${eventForm()}<h3>Platform commission default</h3><div class="field"><label>Default commission (%)</label><input id="defaultCommission" type="number" min="0" max="30" step="0.5" value="${(defaultCommissionBps/100).toFixed(1)}"></div><button class="outline" id="saveCommission">Save default commission</button>
      <h3>Events & payment approval</h3>${events.map(e => `<div class="nominee"><div><b>${esc(e.title)}</b><div class="muted">${esc(e.organiser||'No organiser')} · ${esc(e.status)} · ${esc(e.prize_structure)} · ${esc(e.payment_approval)} · ${(e.commission_bps/100).toFixed(1)}%</div></div><button data-review="${e.id}">Approval</button><button data-fee="${e.id}" data-current="${e.commission_bps}">Fee</button></div>`).join('') || '<p class="muted">No events.</p>'}
      <h3>Organiser applications</h3>${applications.map(a => `<div class="nominee"><div><b>${esc(a.name)}</b><div class="muted">${esc(a.organisation)} · ${esc(a.phone)} · ${esc(a.status)}</div><small>${esc(a.details)}</small></div>${a.status==='pending'?`<button data-app="${a.id}">Review</button>`:''}</div>`).join('') || '<p class="muted">No applications.</p>'}
      <h3>Finance & payout requests</h3><p class="muted">Gross paid: ${money(finance.gross)} · CrownVotes commission: ${money(finance.platform_fees)} · Organiser share: ${money(finance.organiser_net)} · Requested payouts: ${money(finance.payouts_requested)} · Paid out: ${money(finance.payouts_paid)}</p>
      ${finance.payouts.map(p => `<div class="nominee"><div><b>${esc(p.organiser)}</b><div class="muted">${money(p.amount)} · ${esc(p.status)} · ${esc(p.reference)}</div><small>${esc(p.destination)}</small></div>${['requested','processing'].includes(p.status)?`<button data-payout="${p.id}">Update</button>`:''}</div>`).join('') || '<p class="muted">No payout requests.</p>'}
      <h3>Recent paid transactions</h3>${finance.transactions.slice(0,12).map(p => `<div class="nominee"><div><b>${esc(p.event)}</b><div class="muted">${esc(p.reference)} · ${esc(p.organiser||'')}</div></div><div>${money(p.amount)}<small class="muted">Fee ${money(p.platform_fee)}</small></div></div>`).join('') || '<p class="muted">No paid transactions.</p>'}${logoutMarkup()}`);
    $('#createEvent').onclick = createEvent;
    $('#saveCommission').onclick = async () => { try { await api('/admin/settings/commission',{method:'PATCH',body:JSON.stringify({default_commission_bps:Math.round(Number($('#defaultCommission').value)*100)})}); defaultCommissionBps = Math.round(Number($('#defaultCommission').value)*100); toast('Default commission saved.'); } catch (error) { toast(error.message); } };
    document.querySelectorAll('[data-review]').forEach(b => b.onclick = async () => {
      const status = prompt('Payment approval: enter pending, approved or rejected. Approve only after written gateway/compliance confirmation.','pending');
      if (!['pending','approved','rejected'].includes(status || '')) return;
      const note = prompt('Approval reference / review note:','') || '';
      try { await api(`/admin/events/${b.dataset.review}/payment-approval`,{method:'PATCH',body:JSON.stringify({payment_approval:status,approval_note:note})}); toast('Event payment approval updated.'); adminDashboard(); }
      catch (error) { toast(error.message); }
    });
    document.querySelectorAll('[data-fee]').forEach(b => b.onclick = async () => {
      const pct = prompt('Set this event commission (0–30%).',String(Number(b.dataset.current)/100)); if (pct === null) return;
      const value = Number(pct); if (!Number.isFinite(value) || value < 0 || value > 30) { toast('Enter a commission from 0 to 30%.'); return; }
      try { await api(`/admin/events/${b.dataset.fee}/commission`,{method:'PATCH',body:JSON.stringify({commission_bps:Math.round(value*100)})}); toast('Event commission updated.'); adminDashboard(); }
      catch (error) { toast(error.message); }
    });
    document.querySelectorAll('[data-app]').forEach(b => b.onclick = async () => {
      const status = confirm('Approve this organiser application? Cancel will reject it.') ? 'approved' : 'rejected';
      const note = prompt('Admin note (optional):','') || '';
      try { await api(`/admin/applications/${b.dataset.app}`,{method:'PATCH',body:JSON.stringify({status,admin_note:note})}); toast('Application updated.'); adminDashboard(); }
      catch (error) { toast(error.message); }
    });
    document.querySelectorAll('[data-payout]').forEach(b => b.onclick = async () => {
      const status = prompt('Enter processing, paid or rejected. Only mark paid after an actual transfer.','processing');
      if (!['processing','paid','rejected'].includes(status || '')) return;
      const note = prompt(status === 'paid' ? 'Enter the completed bank/MoMo transfer reference:' : 'Admin note (optional):','') || ''; if(status === 'paid' && note.trim().length < 5){toast('A transfer reference is required before marking a payout paid.');return;}
      try { await api(`/admin/payouts/${b.dataset.payout}`,{method:'PATCH',body:JSON.stringify({status,admin_note:note})}); toast('Payout status updated.'); adminDashboard(); }
      catch (error) { toast(error.message); }
    });
    bindLogout();
  } catch (error) { toast(error.message); }
}

async function loadEvents() {
  try {
    const events = await api('/events');
    $('#events').innerHTML = events.length ? events.map(e => `<article class="event-card"><div><span class="eyebrow">${esc(e.status.toUpperCase())} · ${e.category_count} CATEGORIES</span><h3>${esc(e.title)}</h3><p>${esc(e.description || 'Celebrate outstanding people and achievements.')}</p></div><a href="#" data-event="${esc(e.slug)}">VIEW NOMINEES ↗</a></article>`).join('') : '<div class="empty">No awards have been published yet. Check back soon.</div>';
    document.querySelectorAll('[data-event]').forEach(a => a.onclick = e => { e.preventDefault(); showEvent(a.dataset.event); });
  } catch { $('#events').innerHTML = '<div class="empty">Unable to load awards. Please refresh the page.</div>'; }
}
async function showEvent(slug) {
  try {
    const event = await api('/events/' + slug);
    modal(`<p class="eyebrow">CROWNVOTES AWARD EVENT</p><h2>${esc(event.title)}</h2><p class="muted">${esc(event.description)}</p>
      <p class="muted">Vote price: ${money(event.vote_price)} · Prize type: ${esc(event.prize_structure)} · Paid voting: ${esc(event.payment_approval || 'pending')}</p>
      ${event.categories.map(c => `<h3>${esc(c.name)}</h3>${c.nominees.map(n => `<div class="nominee">${n.image_url?`<img src="${esc(n.image_url)}" alt="" style="width:48px;height:48px;object-fit:cover;border-radius:50%">`:''}<div style="flex:1"><b>${esc(n.name)}</b><div class="muted">${esc(n.bio || 'Nominee')}</div><small class="muted">${n.vote_count} votes · Code ${esc(n.short_code || '')}</small></div><button data-vote="${n.id}" ${event.payment_approval !== 'approved' ? 'disabled' : ''}>${event.payment_approval === 'approved' ? 'Vote' : 'Pending approval'}</button></div>`).join('') || '<p class="muted">Nominees coming soon.</p>'}`).join('') || '<p class="muted">Categories coming soon.</p>'}
      <button class="outline" id="showResults">View results</button>`);
    $('#showResults').onclick = async () => {
      try { const results = await api('/events/' + slug + '/results'); modal(`<p class="eyebrow">LIVE RESULTS</p><h2>${esc(results.event)}</h2>${results.results.map(r => `<div class="nominee"><div><b>${esc(r.nominee)}</b><div class="muted">${esc(r.category)}</div></div><b>${r.vote_count}</b></div>`).join('') || '<p class="muted">No results yet.</p>'}`); }
      catch (error) { toast(error.message); }
    };
    document.querySelectorAll('[data-vote]').forEach(b => b.onclick = () => vote(Number(b.dataset.vote),event.vote_price));
  } catch (error) { toast(error.message); }
}
async function vote(nomineeId, price) {
  if (!token) { closeModal(); showLogin(); toast('Sign in before voting.'); return; }
  modal(`<p class="eyebrow">SUPPORT YOUR NOMINEE</p><h2>Cast your vote.</h2>
    <div class="field"><label>Number of votes · ${money(price)} each</label><input id="quantity" type="number" min="1" max="10000" value="1"></div>
    <div class="field"><label>Mobile Money number</label><input id="phone" inputmode="tel" placeholder="e.g. 0240000000"></div>
    <div class="field"><label>Network</label><select id="network"><option value="mtn">MTN MoMo</option><option value="vod">Telecel Cash</option><option value="atl">AT Money / AirtelTigo</option></select></div>
    <p class="muted">Votes are counted only after the payment provider verifies a successful transaction.</p><button class="gold-btn form-btn" id="pay">Continue to payment</button>`);
  $('#pay').onclick = async () => {
    try {
      const payment = await api('/payments/initialize',{method:'POST',body:JSON.stringify({nominee_id:nomineeId,quantity:Number($('#quantity').value),phone:$('#phone').value,provider:$('#network').value})});
      modal(`<p class="eyebrow">PAYMENT INITIALISED</p><h2>Payment details</h2><p class="muted">Reference: ${esc(payment.reference)}</p>
        <p>Total: <b style="color:#e2c47d">${money(payment.amount)}</b></p><p>CrownVotes commission: ${money(payment.platform_fee)}<br>Organiser share: ${money(payment.organiser_net)}</p>
        <p class="muted">${esc(payment.message || 'Approve the Mobile Money prompt. Votes count only after verification.')}</p>
        ${payment.message?.toLowerCase().includes('demo only') ? '<button class="outline" id="demoConfirm">Confirm demo payment (test only)</button>' : ''}<button class="outline" id="checkPayment">Check payment status</button>`);
      $('#demoConfirm')?.addEventListener('click',async()=>{try{await api('/payments/mock-confirm/'+encodeURIComponent(payment.reference),{method:'POST'});toast('Demo payment confirmed; votes recorded.');closeModal();loadEvents();}catch(error){toast(error.message);}});
      $('#checkPayment').onclick = async () => { try { const status = await api('/payments/status/'+encodeURIComponent(payment.reference)); if(status.status==='paid'){toast('Payment verified. Votes recorded.');closeModal();loadEvents();} else toast('Payment is still pending.'); } catch(error){toast(error.message);} };
    } catch (error) { toast(error.message); }
  };
}

refreshAccount();
loadEvents();
