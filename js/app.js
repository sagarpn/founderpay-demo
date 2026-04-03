// ── STATE ──
const S = {
  page: 'overview',
  view: 'focus',
  selectedStage: 0,
  reconChecked: new Set(),
  approvedActions: new Set(),
  liCount: 1
};

const CHECK = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ── PAGE CONFIG ──
const PAGES = {
  overview:  { title: 'Overview',             sub: 'Luna Inc · Day 23 · Mar 24, 2026' },
  getpaid:   { title: 'Get Paid',             sub: 'Invoices · Subscriptions · Revenue' },
  payments:  { title: 'Payments',             sub: 'Collect · Aggregate · Deposit' },
  capital:   { title: 'Capital',              sub: 'Funding · SAFE notes · Reg D · Preview' },
  payables:  { title: 'Pay Out',              sub: 'Bills · Vendors · Approvals' },
  payroll:   { title: 'Payroll',              sub: 'Preview · Launching Q3 2026' },
  treasury:  { title: 'Treasury',             sub: 'Cash · Runway · Yield' },
  stayclean: { title: 'Stay Clean',           sub: 'Licensing · Identity · Card security · Disclosure' },
  disputes:  { title: 'Disputes',             sub: '1 open · response due Mar 28' },
  numbers:   { title: 'Know Your Numbers',    sub: 'Books · Reconciliation · P&L' },
  legal:     { title: 'Legal',               sub: 'Contracts · Corporate docs · Preview' },
  reports:   { title: 'Reports',             sub: 'P&L · Investor updates · Preview' },
  settings:  { title: 'Settings',            sub: 'Luna Inc · Agent · Integrations' }
};

// ── FOCUS / FULL TOGGLE ──
function setView(mode) {
  S.view = mode;
  if (mode === 'full') {
    document.body.classList.add('full-view');
  } else {
    document.body.classList.remove('full-view');
  }
  document.getElementById('vt-focus').classList.toggle('active', mode === 'focus');
  document.getElementById('vt-full').classList.toggle('active', mode === 'full');
}

// ── HASH ROUTING ──
function nav(page) {
  if (!PAGES[page]) return;
  window.location.hash = page;
}

function activatePage(page) {
  if (!PAGES[page]) page = 'overview';
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pg = document.getElementById('pg-' + page);
  if (pg) pg.classList.add('active');
  const ni = document.querySelector(`[data-page="${page}"]`);
  if (ni) ni.classList.add('active');
  S.page = page;
  const cfg = PAGES[page];
  document.getElementById('tb-title').textContent = cfg.title;
  document.getElementById('tb-sub').textContent   = cfg.sub;
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', () => {
  const page = window.location.hash.replace('#', '') || 'overview';
  activatePage(page);
});

// ── TABS ──
function switchTab(group, tab) {
  document.querySelectorAll(`.${group}-tab-btn`).forEach(b => b.classList.remove('active'));
  document.querySelectorAll(`.${group}-tab-content`).forEach(c => c.style.display = 'none');
  const btn = document.querySelector(`[data-${group}tab="${tab}"]`);
  if (btn) btn.classList.add('active');
  const content = document.getElementById(`${group}tab-${tab}`);
  if (content) content.style.display = 'block';
}

// ── DISPUTE TABS ──
function switchDisputeTab(el, tab) {
  document.querySelectorAll('.dispute-tab-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  ['open','history','playbook'].forEach(t => {
    const d = document.getElementById('dtab-' + t);
    if (d) d.style.display = t === tab ? 'block' : 'none';
  });
}

// ── LOG EXPAND ──
function toggleLog(row) {
  const expand = row.nextElementSibling;
  const isOpen = expand && expand.classList.contains('visible');
  document.querySelectorAll('.log-expand').forEach(e => e.classList.remove('visible'));
  document.querySelectorAll('.log-item').forEach(r => r.classList.remove('open'));
  if (!isOpen && expand) {
    expand.classList.add('visible');
    row.classList.add('open');
  }
}

// ── PAYMENT FLOW STAGES ──
function selStage(n) {
  S.selectedStage = n;
  document.querySelectorAll('.flow-stage').forEach((s, i) => s.classList.toggle('active', i === n));
  document.querySelectorAll('.stage-detail').forEach((d, i) => d.style.display = i === n ? 'block' : 'none');
}

// ── RECONCILIATION ──
function toggleRecon(id) {
  if (S.reconChecked.has(id)) S.reconChecked.delete(id);
  else S.reconChecked.add(id);
  const box = document.getElementById('recon-' + id);
  if (box) {
    box.classList.toggle('checked', S.reconChecked.has(id));
    box.innerHTML = S.reconChecked.has(id) ? CHECK : '';
  }
  const cnt = document.getElementById('recon-count');
  if (cnt) cnt.textContent = S.reconChecked.size + ' confirmed';
}

// ── APPROVE ACTIONS ──
function approveAction(id) {
  S.approvedActions.add(id);
  const btn = document.getElementById('ab-' + id);
  if (btn) {
    btn.textContent = '✓ Done';
    btn.classList.add('done');
    btn.disabled = true;
  }
  const msgs = {
    dispute: 'Chargeback response submitted to Visa. You\'ll hear back in 7–10 business days.',
    ar:      'Follow-up sent to accounts@meridian.co with payment link. Escalation scheduled for Mar 31 if unpaid.',
    yield:   '$30,000 transfer to Mercury Treasury initiated at 4.8% APY. Earning $118/month starting now.'
  };
  if (msgs[id]) setTimeout(() => alert(msgs[id]), 100);
}

function approveVendor(name) {
  alert(`Payment to ${name} approved and scheduled. I'll remember this vendor — future payments will be auto-handled.`);
}

// ── DISPUTE SUBMIT ──
function submitDispute() {
  alert('Response submitted to Stripe. Confirmation sent to jordan@luna.inc.\n\nExpected decision: 7–10 business days.\n$6,500 held in Stripe escrow until resolved.');
}

// ── COPY DISCLOSURE ──
function copyRegE() {
  const t = '"In case of errors or questions about your electronic transfers, contact us within 60 days after the error appeared on your statement. We will investigate and correct any error within 10 business days. If we need more time, we may take up to 45 days, but will credit your account within 10 days while the investigation is ongoing."';
  navigator.clipboard.writeText(t).then(() => {
    alert('Payment disclosure copied.\n\nPaste this into your checkout page or payment terms. Once added, your compliance is fully green.');
  }).catch(() => alert('Disclosure text:\n\n' + t));
}

// ── INVOICE MODAL ──
function openInvoiceModal() {
  document.getElementById('invoice-modal').style.display = 'flex';
}
function closeInvoiceModal() {
  document.getElementById('invoice-modal').style.display = 'none';
}

// ── LINE ITEMS ──
function calcLineItem(n) {
  const qty  = parseFloat(document.getElementById('li-qty-' + n)?.value) || 0;
  const rate = parseFloat(document.getElementById('li-rate-' + n)?.value) || 0;
  const amt  = document.getElementById('li-amt-' + n);
  if (amt) amt.value = '$' + (qty * rate).toFixed(2);
  updateInvoiceTotal();
}

function updateInvoiceTotal() {
  let total = 0;
  document.querySelectorAll('[id^="li-amt-"]').forEach(el => {
    total += parseFloat(el.value.replace('$','')) || 0;
  });
  const el = document.getElementById('inv-total');
  if (el) el.textContent = '$' + total.toFixed(2);
}

let liCount = 1;
function addLineItem() {
  liCount++;
  const n = liCount;
  const row = document.createElement('div');
  row.className = 'line-item-row';
  row.innerHTML = `<input class="form-input" placeholder="Description" style="font-size:12px;height:34px;">
    <input class="form-input" value="1" style="font-size:12px;height:34px;text-align:center;" id="li-qty-${n}">
    <input class="form-input" placeholder="0.00" style="font-size:12px;height:34px;" id="li-rate-${n}" oninput="calcLineItem(${n})">
    <input class="form-input mono" id="li-amt-${n}" placeholder="$0.00" style="font-size:12px;height:34px;" readonly>
    <button class="li-remove" onclick="removeLineItem(this)">×</button>`;
  document.getElementById('line-items').appendChild(row);
}

function removeLineItem(btn) {
  if (document.querySelectorAll('#line-items .line-item-row').length > 1) {
    btn.closest('.line-item-row').remove();
    updateInvoiceTotal();
  }
}

function sendInvoice() {
  const client = document.getElementById('inv-client').value || 'Client';
  const num    = document.getElementById('inv-num').value || 'INV-1044';
  const total  = document.getElementById('inv-total').textContent;
  closeInvoiceModal();
  alert(`Invoice ${num} sent to ${client} for ${total}.\n\n✓ Payment link generated\n✓ Disclosure embedded\n✓ Added to AR tracking\n✓ Reminders scheduled`);
}

function saveAsTemplate() {
  const name = document.getElementById('inv-client').value || 'New template';
  alert(`Saved as "${name} template". Available next time you create an invoice.`);
}

function openTemplateModal() {
  document.getElementById('template-modal').style.display = 'flex';
}

function useTemplate(type) {
  document.getElementById('template-modal').style.display = 'none';
  openInvoiceModal();
  const templates = {
    software:   { desc: 'Software development services', qty: 1, rate: 5000 },
    monthly:    { desc: 'Monthly retainer', qty: 1, rate: 3500 },
    consulting: { desc: 'Consulting — hourly', qty: 10, rate: 250 }
  };
  const t = templates[type];
  if (t) {
    setTimeout(() => {
      const descEl = document.querySelector('#line-items .line-item-row input:first-child');
      if (descEl) descEl.value = t.desc;
      const qtyEl  = document.getElementById('li-qty-1');
      const rateEl = document.getElementById('li-rate-1');
      if (qtyEl)  qtyEl.value  = t.qty;
      if (rateEl) { rateEl.value = t.rate; calcLineItem(1); }
    }, 100);
  }
}

// ── INVOICE DETAIL ──
function openInvoiceDetail(id) {
  const data = {
    meridian: {
      name: 'Meridian Co', num: 'INV-1041', amount: '$3,400', status: 'overdue',
      steps: [
        { label: 'Sent', time: 'Mar 10 · 9:00am', state: 'done' },
        { label: 'Viewed', time: 'Mar 11 · 2:14pm', state: 'done' },
        { label: 'Due', time: 'Mar 24 · Overdue', state: 'active' },
        { label: 'Paid', time: 'Waiting', state: 'pending' }
      ],
      note: '<div class="agent-box"><div class="agent-header"><div class="agent-pulse"></div><div class="agent-label">Agent</div></div><div class="agent-text">Meridian viewed the invoice Mar 11 but hasn\'t paid. Reminder sent Mar 23. Escalation scheduled for Mar 31 — final notice with payment link.</div></div>'
    },
    vertex: {
      name: 'Vertex Solutions', num: 'INV-1040', amount: '$12,000', status: 'viewed',
      steps: [
        { label: 'Sent', time: 'Mar 8 · 10:30am', state: 'done' },
        { label: 'Viewed', time: 'Mar 20 · 2:14pm', state: 'done' },
        { label: 'Due', time: 'Mar 30', state: 'active' },
        { label: 'Paid', time: 'Waiting', state: 'pending' }
      ],
      note: '<div class="alert alert-success"><svg class="alert-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg><div><div class="alert-title">Invoice viewed Mar 20 at 2:14pm</div><div class="alert-body">Payment expected before Mar 30. I\'ll send a gentle reminder in 3 days if it hasn\'t cleared.</div></div></div>'
    }
  };
  const inv = data[id];
  if (!inv) return;
  const stepsHtml = inv.steps.map(s => `
    <div class="tl-item">
      <div class="tl-dot ${s.state}">${s.state === 'done' ? '✓' : s.state === 'active' ? '→' : '○'}</div>
      <div class="tl-content"><div class="tl-title">${s.label}</div><div class="tl-sub">${s.time}</div></div>
    </div>`).join('');
  document.getElementById('inv-detail-content').innerHTML = `
    <div class="modal-title">${inv.num} — ${inv.name}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
      <div class="mono" style="font-size:28px;font-weight:700;">${inv.amount}</div>
      <span class="badge ${inv.status === 'overdue' ? 'badge-red' : 'badge-blue'}">${inv.status === 'overdue' ? '14 days overdue' : 'Viewed · Due Mar 30'}</span>
    </div>
    <div style="font-size:11px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:.4px;margin-bottom:10px;">Payment status</div>
    <div class="timeline" style="margin-bottom:16px;">${stepsHtml}</div>
    ${inv.note}
    <div class="modal-footer">
      <button class="btn btn-sm" onclick="document.getElementById('inv-detail-modal').style.display='none'">Close</button>
      ${inv.status === 'overdue' ? '<button class="btn btn-sm btn-primary" onclick="alert(\'Reminder sent to accounts@meridian.co\')">Send reminder →</button>' : ''}
    </div>`;
  document.getElementById('inv-detail-modal').style.display = 'flex';
}

// ── ONBOARDING ──
function goStep(n) {
  document.querySelectorAll('.onboard-screen').forEach((s, i) => s.classList.toggle('active', i + 1 === n));
  document.querySelectorAll('.step-circle').forEach((c, i) => {
    c.className = 'step-circle';
    if (i + 1 < n)      { c.classList.add('done');   c.innerHTML = CHECK; }
    else if (i + 1 === n) { c.classList.add('active'); c.textContent = i + 1; }
    else                  { c.textContent = i + 1; }
  });
  document.querySelectorAll('.step-label').forEach((l, i) => {
    l.className = 'step-label' + (i + 1 < n ? ' done' : i + 1 === n ? ' active' : '');
  });
  document.querySelectorAll('.step-line').forEach((l, i) => {
    l.className = 'step-line' + (i + 1 < n ? ' done' : '');
  });
  const pf = document.getElementById('prog-fill');
  if (pf) pf.style.width = ((n - 1) / 3 * 100) + '%';
}

function selectRail(rail) {
  document.querySelectorAll('.rail-option').forEach(r => r.classList.remove('selected'));
  document.getElementById('rail-' + rail)?.classList.add('selected');
  const msgs = {
    rtp:    'RTP — bank-to-bank in under 5 seconds. No licensing exposure in 34 states.',
    fednow: 'FedNow — Federal Reserve instant rail. Final settlement. Same no-exposure profile as RTP.',
    ach:    'ACH — T+1 or T+2. Stripe holds the licensing coverage.',
    stripe: 'Stripe Instant — push to debit card in minutes. Best time-to-money.'
  };
  const el = document.getElementById('rail-agent');
  if (el) el.textContent = msgs[rail] || '';
}

function simIDUpload() {
  const z = document.getElementById('id-upload-zone');
  if (!z) return;
  z.innerHTML = '<div style="color:var(--amber);font-size:13px;font-weight:500;">Verifying...</div>';
  setTimeout(() => {
    z.innerHTML = '<div style="color:var(--sage);font-size:13px;font-weight:500;">✓ Identity verified · 98% confidence · OFAC clear · Watchlist clear</div>';
  }, 1800);
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  // Wire all nav items
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const page = el.dataset.page;
      nav(page);
    });
  });

  // Also wire the logo
  document.querySelector('.sb-logo')?.addEventListener('click', () => nav('overview'));
  document.querySelector('.sb-agent-strip')?.addEventListener('click', () => nav('overview'));

  // Initial page — handle both hash and no-hash
  const hash = window.location.hash.replace('#', '').trim();
  const initPage = (hash && PAGES[hash]) ? hash : 'overview';
  activatePage(initPage);

  // Init all tab groups
  switchTab('gp', 'invoices');
  switchTab('comp', 'overview');
  switchTab('recon', 'review');
  switchTab('settings', 'profile');
  selStage(0);
});
