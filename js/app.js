// ── STATE ──
const S = {
  page: 'dashboard',
  selectedStage: 0,
  reconChecked: new Set(),
  approvedActions: new Set(),
  lineItemCount: 1,
  templates: []
};

const CHECK = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ── PAGE CONFIG ──
const PAGES = {
  dashboard:  { title: 'Dashboard',             sub: 'Luna Inc · Day 23 · Mar 24, 2026' },
  billing:    { title: 'Billing',               sub: 'Invoices · Subscriptions · Revenue' },
  payments:   { title: 'Payments',              sub: 'Collect · Aggregate · Deposit' },
  capital:    { title: 'Capital',               sub: 'Funding · SAFE notes · Reg D' },
  payables:   { title: 'Payables',              sub: 'Bills · Vendors · Approvals' },
  payroll:    { title: 'Payroll',               sub: 'Preview · Launching Q3 2026' },
  treasury:   { title: 'Treasury',              sub: 'Cash · Runway · Yield' },
  ledger:     { title: 'Ledger',                sub: 'Reconciliation · P&L' },
  compliance: { title: 'Compliance',            sub: 'MTL · KYC · PCI · NACHA · Reg E' },
  tax:        { title: 'Tax',                   sub: 'Preview · Launching Q3 2026' },
  legal:      { title: 'Legal',                 sub: 'Preview · Launching Q3 2026' },
  reports:    { title: 'Reports',               sub: 'Preview · Launching Q3 2026' },
  disputes:   { title: 'Disputes',              sub: '1 open · response due Mar 28' },
  settings:   { title: 'Settings',              sub: 'Luna Inc · Integrations · Agent' }
};

// ── HASH ROUTING ──
function nav(page) {
  if (!PAGES[page]) return;
  window.location.hash = page;
}

function activatePage(page) {
  if (!PAGES[page]) page = 'dashboard';
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
  const page = window.location.hash.replace('#', '') || 'dashboard';
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
function switchDisputeTab(tab) {
  document.querySelectorAll('.dispute-tab-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  ['open','history','playbook'].forEach(t => {
    const el = document.getElementById('dtab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
  });
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
  if (cnt) cnt.textContent = S.reconChecked.size + ' matched';
}

// ── APPROVE BRIEFING ACTION ──
function approveAction(id) {
  S.approvedActions.add(id);
  const btn = document.getElementById('ba-btn-' + id);
  if (btn) {
    btn.textContent = '✓ Done';
    btn.style.background = 'var(--sage-text)';
    btn.disabled = true;
  }
  const msgs = {
    dispute: 'Chargeback response submitted to Visa. You\'ll receive a decision in 7–10 business days.',
    ar:      'Follow-up email sent to accounts@meridian.co with payment link. Escalation scheduled for day 14 if unpaid.',
    yield:   '$30,000 transfer to Mercury Treasury initiated at 4.8% APY. Estimated return: $118/month.'
  };
  if (msgs[id]) {
    setTimeout(() => alert(msgs[id]), 100);
  }
}

// ── AP APPROVE ──
function approveVendor(name) {
  alert(`Payment to ${name} approved. Scheduled for next business day. I\'ll remember this vendor for future auto-approvals.`);
}

// ── DISPUTE SUBMIT ──
function submitDispute() {
  alert('Response submitted to Stripe dispute team. Confirmation sent to jordan@luna.inc.\n\nExpected decision: 7–10 business days.\nFunds held in Stripe escrow until resolved.');
}

// ── COPY REG E ──
function copyRegE() {
  const t = '"In case of errors or questions about your electronic transfers, contact us within 60 days after the error appeared on your statement. We will investigate and correct any error within 10 business days. If we need more time, we may take up to 45 days, but will credit your account within 10 days while the investigation is ongoing."';
  navigator.clipboard.writeText(t).then(() => {
    alert('Reg E disclosure copied to clipboard.\n\nPaste into your checkout page or payment terms before the next billing cycle.');
  }).catch(() => {
    alert('Reg E disclosure text:\n\n' + t);
  });
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
  const container = document.getElementById('line-items');
  const row = document.createElement('div');
  row.className = 'line-item-row';
  row.innerHTML = `<input class="form-input" placeholder="Description" style="font-size:12px;height:34px;">
    <input class="form-input" value="1" style="font-size:12px;height:34px;text-align:center;" id="li-qty-${n}">
    <input class="form-input" placeholder="0.00" style="font-size:12px;height:34px;" id="li-rate-${n}" oninput="calcLineItem(${n})">
    <input class="form-input mono" id="li-amt-${n}" placeholder="$0.00" style="font-size:12px;height:34px;" readonly>
    <button class="li-remove" onclick="removeLineItem(this)">×</button>`;
  container.appendChild(row);
}

function removeLineItem(btn) {
  const row = btn.closest('.line-item-row');
  if (document.querySelectorAll('#line-items .line-item-row').length > 1) {
    row.remove();
    updateInvoiceTotal();
  }
}

function sendInvoice() {
  const client = document.getElementById('inv-client').value || 'Client';
  const num    = document.getElementById('inv-num').value || 'INV-1044';
  const total  = document.getElementById('inv-total').textContent;
  closeInvoiceModal();
  alert(`Invoice ${num} sent to ${client} for ${total}.\n\n✓ Payment link generated\n✓ Reg E disclosure embedded\n✓ Added to AR tracking\n✓ Reminder scheduled for day 3 and day 7`);
}

function saveAsTemplate() {
  const client = document.getElementById('inv-client').value || 'New template';
  alert(`Template saved as "${client} template". Available next time you create an invoice.`);
}

function openTemplateModal() {
  document.getElementById('template-modal').style.display = 'flex';
}

function useTemplate(type) {
  document.getElementById('template-modal').style.display = 'none';
  openInvoiceModal();
  const templates = {
    software: { desc: 'Software development services', qty: 1, rate: 5000 },
    monthly:  { desc: 'Monthly retainer', qty: 1, rate: 3500 },
    consulting: { desc: 'Consulting — hourly', qty: 10, rate: 250 }
  };
  const t = templates[type];
  if (t) {
    setTimeout(() => {
      const descEl = document.querySelector('#line-items .line-item-row input:first-child');
      if (descEl) descEl.value = t.desc;
      const qtyEl = document.getElementById('li-qty-1');
      if (qtyEl) { qtyEl.value = t.qty; }
      const rateEl = document.getElementById('li-rate-1');
      if (rateEl) { rateEl.value = t.rate; calcLineItem(1); }
    }, 100);
  }
}

// ── INVOICE DETAIL ──
function openInvoiceDetail(id) {
  const invoices = {
    meridian: {
      name: 'Meridian Co',
      num: 'INV-1041',
      amount: '$3,400',
      status: 'overdue',
      steps: [
        { label: 'Sent', time: 'Mar 10 · 9:00am', state: 'done' },
        { label: 'Viewed', time: 'Mar 11 · 2:14pm', state: 'done', note: 'viewed' },
        { label: 'Due', time: 'Mar 24 · Overdue', state: 'active' },
        { label: 'Paid', time: 'Awaiting payment', state: 'pending' }
      ]
    },
    vertex: {
      name: 'Vertex Solutions',
      num: 'INV-1040',
      amount: '$12,000',
      status: 'sent',
      steps: [
        { label: 'Sent', time: 'Mar 8 · 10:30am', state: 'done' },
        { label: 'Viewed', time: 'Mar 20 · 2:14pm', state: 'done', note: 'viewed' },
        { label: 'Due', time: 'Mar 30', state: 'active' },
        { label: 'Paid', time: 'Awaiting payment', state: 'pending' }
      ]
    }
  };
  const inv = invoices[id];
  if (!inv) return;

  const stepsHtml = inv.steps.map(s => {
    const noteClass = s.note === 'viewed' ? ' tl-sub viewed' : s.note === 'paid' ? ' tl-sub paid' : ' tl-sub';
    return `<div class="tl-item">
      <div class="tl-dot ${s.state}">${s.state === 'done' ? '✓' : s.state === 'active' ? '→' : '○'}</div>
      <div class="tl-content">
        <div class="tl-title">${s.label}</div>
        <div class="${noteClass.trim()}">${s.time}</div>
      </div>
    </div>`;
  }).join('');

  document.getElementById('inv-detail-content').innerHTML = `
    <div class="modal-title">${inv.num} — ${inv.name}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
      <div style="font-family:var(--font-display);font-size:28px;font-weight:700;">${inv.amount}</div>
      <span class="badge ${inv.status === 'overdue' ? 'badge-red' : 'badge-blue'}">${inv.status === 'overdue' ? 'Overdue' : 'Viewed · Due Mar 30'}</span>
    </div>
    <div class="card-title" style="margin-bottom:12px;">Payment status</div>
    <div class="timeline" style="margin-bottom:18px;">${stepsHtml}</div>
    ${id === 'vertex' ? '<div class="alert alert-success" style="margin-bottom:0;"><svg class="alert-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2"/><path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg><div><div class="alert-title">Invoice viewed Mar 20 at 2:14pm</div><div class="alert-body">Vertex opened the invoice — payment expected before Mar 30. Agent will send a gentle reminder at T-3 days.</div></div></div>' : '<div class="agent-box" style="margin-top:0;"><div class="agent-header"><div class="agent-pulse"></div><div class="agent-label">CFO Agent</div></div><div class="agent-text">Meridian viewed the invoice Mar 11 but has not paid. Follow-up sent Mar 23. Next escalation scheduled for Mar 31 — final notice with payment link.</div></div>'}
    <div class="modal-footer">
      <button class="btn btn-sm" onclick="document.getElementById(\'inv-detail-modal\').style.display=\'none\'">Close</button>
      ${inv.status === 'overdue' ? '<button class="btn btn-sm btn-primary" onclick="alert(\'Reminder sent to accounts@meridian.co\')">Send reminder →</button>' : ''}
    </div>
  `;
  document.getElementById('inv-detail-modal').style.display = 'flex';
}

// ── ONBOARDING ──
function goStep(n) {
  document.querySelectorAll('.onboard-screen').forEach((s, i) => s.classList.toggle('active', i + 1 === n));
  document.querySelectorAll('.step-circle').forEach((c, i) => {
    c.className = 'step-circle';
    if (i + 1 < n) { c.classList.add('done'); c.innerHTML = CHECK; }
    else if (i + 1 === n) { c.classList.add('active'); c.textContent = i + 1; }
    else c.textContent = i + 1;
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
    rtp:    'RTP selected. Funds move bank-to-bank in under 5 seconds. No holding — satisfies the no-holding MTL doctrine in 34 states.',
    fednow: 'FedNow selected. Federal Reserve instant rail. Final, irrevocable settlement. Same no-holding MTL profile as RTP.',
    ach:    'Standard ACH selected. T+1 same-day or T+2 standard. Stripe Connect escrow holds funds — MTL covered by Stripe licenses.',
    stripe: 'Stripe Instant Payout selected. Push to debit card in minutes. Best time-to-money for your customers.'
  };
  const el = document.getElementById('rail-agent');
  if (el) el.textContent = msgs[rail] || '';
}

function simIDUpload() {
  const z = document.getElementById('id-upload-zone');
  if (!z) return;
  z.innerHTML = '<div style="color:var(--amber);font-size:13px;font-weight:500;">Verifying with Persona...</div>';
  setTimeout(() => {
    z.innerHTML = '<div style="color:var(--sage-text);font-size:13px;font-weight:500;">✓ Identity verified · Confidence 98% · OFAC clear · Watchlist clear</div>';
  }, 1800);
}

function genComplianceProfile() {
  const vol  = document.getElementById('sel-vol')?.value || '';
  const act  = document.getElementById('sel-act')?.value || '';
  const high = ['Marketplace','Crypto / Web3','Cannabis','Gambling'].includes(act);
  const big  = vol.includes('$50,000') || vol.includes('$250,000');
  const tags = document.getElementById('comp-tags');
  if (!tags) return;
  const kyc = high ? 'ctag-red">● KYC Tier 3 — Enhanced' : big ? 'ctag-amber">● KYC Tier 2' : 'ctag-blue">● KYC Tier 1';
  const mtl = high ? 'ctag-amber">● MTL review required' : 'ctag-green">● No MTL required';
  tags.innerHTML = `<span class="ctag ctag-accent">● PCI SAQ-A scope</span><span class="ctag ${mtl}</span><span class="ctag ${kyc}</span><span class="ctag ctag-amber">● Reg E disclosure needed</span>`;
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  // Wire nav items
  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', () => nav(el.dataset.page));
  });

  // Initial page from hash or default
  const initPage = window.location.hash.replace('#', '') || 'dashboard';
  activatePage(initPage);

  // Init tabs
  switchTab('bill', 'invoices');
  switchTab('comp', 'mtl');
  switchTab('recon', 'unmatched');
  switchTab('settings', 'profile');

  // Init payment flow
  selStage(0);

  // Watch for compliance profile changes
  document.getElementById('sel-vol')?.addEventListener('change', genComplianceProfile);
  document.getElementById('sel-act')?.addEventListener('change', genComplianceProfile);
});
