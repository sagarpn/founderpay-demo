// ── STATE ──
const S = {
  page: 'home',
  onboardStep: 1,
  selectedRail: 'rtp',
  selectedStage: 0,
  payTab: 'collect',
  compTab: 'mtl',
  billingTab: 'invoices',
  reconChecked: new Set(),
  approvedActions: new Set()
};

// ── ICONS ──
const CHECK_SVG = `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// ── PAGE TITLES ──
const TITLES = {
  home:        { title: 'Good morning, Jordan', sub: 'Luna Inc · Day 23 · Tuesday, Mar 24' },
  onboarding:  { title: 'Get started', sub: 'Complete your compliance setup' },
  banking:     { title: 'Banking & Treasury', sub: 'Cash position · Runway · Yield' },
  payments:    { title: 'Payments & Revenue', sub: 'Collect · Aggregate · Deposit · Recovery' },
  ap:          { title: 'Accounts Payable', sub: 'Bills · Vendors · Approvals' },
  ar:          { title: 'Accounts Receivable', sub: 'Invoices · Collections · Aging' },
  billing:     { title: 'Consumer Billing & Subscriptions', sub: 'Invoicing · Recurring · Payment Recovery · Revenue' },
  recon:       { title: 'Bookkeeping & Reconciliation', sub: 'Transactions · P&L · Bank match' },
  disputes:    { title: 'Dispute Center', sub: '1 open · response due Mar 28' },
  compliance:  { title: 'Compliance & Risk', sub: 'MTL · KYC · PCI · NACHA · Reg E' },
  payroll:     { title: 'Payroll & Contractors', sub: 'Preview · Coming Q3' },
  tax:         { title: 'Tax', sub: 'Preview · Coming Q3' },
  settings:    { title: 'Settings', sub: 'Luna Inc · Integrations' }
};

// ── NAVIGATE ──
function nav(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const pg = document.getElementById('pg-' + page);
  if (pg) pg.classList.add('active');
  const ni = document.querySelector(`[data-page="${page}"]`);
  if (ni) ni.classList.add('active');
  S.page = page;
  const t = TITLES[page] || { title: page, sub: '' };
  document.getElementById('tb-title').textContent = t.title;
  document.getElementById('tb-sub').textContent = t.sub;
  updateAgentSidebar(page);
  window.scrollTo(0, 0);
}

// ── AGENT SIDEBAR CONTEXT ──
const AGENT_CONTEXTS = {
  home: {
    text: "Overnight I handled 3 items. Bridger's chargeback response is drafted — needs your approval by Mar 28. Tidal Flow's ACH return has been noted; I recommend switching them to card. Your $8,240 payout batches Tuesday.",
    actions: [
      { label: 'Review chargeback response', page: 'disputes' },
      { label: 'Switch Tidal Flow to card', page: 'billing' },
      { label: 'View Tuesday payout', page: 'payments' }
    ]
  },
  banking: {
    text: "Cash is healthy at $142,400 — 5.1 months runway. $48,200 is sitting idle in checking. I recommend moving $30K to a yield account at 4.8% APY. That's $118/month in passive interest.",
    actions: [
      { label: 'Move $30K to yield', page: 'banking' },
      { label: 'View runway model', page: 'banking' }
    ]
  },
  payments: {
    text: "Collect layer is clean. All RTP and FedNow transactions cleared under the no-holding doctrine. One ACH return (Tidal Flow R01) — return rate now 0.3%, approaching the 0.5% threshold.",
    actions: [
      { label: 'View return details', page: 'payments' },
      { label: 'Switch Tidal Flow to card', page: 'billing' }
    ]
  },
  ap: {
    text: "3 bills totaling $4,200 are due this week. I've pre-approved the recurring ones — Netlify and AWS. The new vendor Designco needs your first approval before I can schedule payment.",
    actions: [
      { label: 'Approve Designco payment', page: 'ap' },
      { label: 'View all pending bills', page: 'ap' }
    ]
  },
  ar: {
    text: "Invoice #1041 to Meridian Co is 14 days overdue ($3,400). I've drafted a follow-up email. Two others are due this week. Total outstanding AR is $18,400.",
    actions: [
      { label: 'Send Meridian follow-up', page: 'ar' },
      { label: 'View aging report', page: 'ar' }
    ]
  },
  billing: {
    text: "MRR is $11,240 — up 8% this month. One subscription failed payment recovery in progress for Kwan Digital ($299). Smart retry scheduled for tomorrow based on R01 decline pattern.",
    actions: [
      { label: 'View recovery queue', page: 'billing' },
      { label: 'See MRR breakdown', page: 'billing' }
    ]
  },
  recon: {
    text: "47 transactions to reconcile this week. I auto-matched 44 to existing invoices or known vendors. 3 need your review — two look like duplicate charges, one is an unrecognized vendor.",
    actions: [
      { label: 'Review 3 flagged items', page: 'recon' },
      { label: 'Approve auto-matches', page: 'recon' }
    ]
  },
  disputes: {
    text: "Bridger Group chargeback is winnable. Evidence profile is strong — invoice, delivery confirmation, customer sign-off. Win rate for reason code 4853 with this evidence is ~68%. Response drafted, ready to submit.",
    actions: [
      { label: 'Submit dispute response', page: 'disputes' }
    ]
  },
  compliance: {
    text: "Compliance is mostly clean. One open item: Reg E disclosure needs to be added to your checkout. NY MTL exposure is flagged — legal opinion recommended before NY volume exceeds $10K/month.",
    actions: [
      { label: 'Add Reg E disclosure', page: 'compliance' },
      { label: 'View NY MTL analysis', page: 'compliance' }
    ]
  },
  payroll: { text: "Payroll module launches Q3. First payroll run for Luna Inc is scheduled for April 1 — 2 employees, 3 contractors. I'll handle classification checks and 1099 prep automatically.", actions: [] },
  tax: { text: "Tax module launches Q3. Q1 estimated tax is due April 15 — approximately $4,200 based on current net income. I'll have the full calculation ready by April 1.", actions: [] }
};

function updateAgentSidebar(page) {
  const ctx = AGENT_CONTEXTS[page] || AGENT_CONTEXTS.home;
  const textEl = document.getElementById('agent-sb-text');
  const actionsEl = document.getElementById('agent-sb-actions');
  if (textEl) textEl.textContent = ctx.text;
  if (actionsEl) {
    actionsEl.innerHTML = ctx.actions.map(a => `
      <button class="agent-action-btn" onclick="nav('${a.page}')">
        <span>${a.label}</span>
        <span class="agent-action-arrow">→</span>
      </button>
    `).join('');
  }
}

// ── ONBOARDING ──
function goStep(n) {
  S.onboardStep = n;
  document.querySelectorAll('.onboard-screen').forEach((s, i) => {
    s.classList.toggle('active', i + 1 === n);
  });
  document.querySelectorAll('.step-circle').forEach((c, i) => {
    c.className = 'step-circle';
    if (i + 1 < n) { c.classList.add('done'); c.innerHTML = CHECK_SVG; }
    else if (i + 1 === n) { c.classList.add('active'); c.textContent = i + 1; }
    else c.textContent = i + 1;
  });
  document.querySelectorAll('.step-label').forEach((l, i) => {
    l.className = 'step-label';
    if (i + 1 < n) l.classList.add('done');
    else if (i + 1 === n) l.classList.add('active');
  });
  document.querySelectorAll('.step-line').forEach((l, i) => {
    l.className = 'step-line' + (i + 1 < n ? ' done' : '');
  });
  const pf = document.getElementById('prog-fill');
  if (pf) pf.style.width = ((n - 1) / 3 * 100) + '%';
  genComplianceProfile();
}

function genComplianceProfile() {
  const vol = document.getElementById('sel-vol')?.value || '$10,000–$50,000';
  const act = document.getElementById('sel-act')?.value || 'SaaS / Software';
  const high = ['Marketplace','Crypto / Web3','Cannabis','Gambling'].includes(act);
  const big  = vol.includes('$50,000') || vol.includes('$250,000');
  const tags = document.getElementById('comp-tags');
  if (!tags) return;
  const kyc   = high ? 'ctag-red" >&#9679; KYC Tier 3 — Enhanced' : big ? 'ctag-amber" >&#9679; KYC Tier 2' : 'ctag-blue" >&#9679; KYC Tier 1';
  const mtl   = high ? 'ctag-amber" >&#9679; MTL review required' : 'ctag-green" >&#9679; No MTL required';
  tags.innerHTML = `
    <span class="ctag ctag-accent">&#9679; PCI SAQ-A scope</span>
    <span class="ctag ${mtl}</span>
    <span class="ctag ${kyc}</span>
    <span class="ctag ctag-amber">&#9679; Reg E disclosure needed</span>
  `;
  const ab = document.getElementById('agent-step1');
  if (ab) {
    if (high) ab.textContent = `${act} platforms have elevated MTL exposure. I'm evaluating the Agent of Payee exemption and pass-through RTP architecture. A legal opinion letter is recommended before operating in NY or CA.`;
    else if (big) ab.textContent = `At this volume you'll trigger KYC Tier 2 — full SSN and business formation docs required. I'll initiate the upgrade automatically at $45K/month so there's no disruption to your payouts.`;
    else ab.textContent = `Based on your structure and volume you're below the MTL threshold. Stripe Connect handles licensed money movement in all 50 states. Reg E disclosures will be generated automatically at checkout.`;
  }
}

function selectRail(rail) {
  S.selectedRail = rail;
  document.querySelectorAll('.rail-option').forEach(r => r.classList.remove('selected'));
  document.getElementById('rail-' + rail)?.classList.add('selected');
  const msgs = {
    rtp:    'RTP selected. Funds move bank-to-bank in under 5 seconds. No holding — satisfies the no-holding MTL doctrine in 34 states. Platform sends instruction only, never touches the funds.',
    fednow: 'FedNow selected. Federal Reserve instant rail. Final, irrevocable settlement. $1M per-transaction limit. Same no-holding MTL profile as RTP. Available at 500+ banks.',
    ach:    'Standard ACH selected. T+1 same-day or T+2 standard. Funds settle in Stripe Connect escrow — holding period creates MTL exposure covered by Stripe\'s licenses. Return rate monitored (threshold 0.5%).',
    stripe: 'Stripe Instant Payout selected. Push to debit card in minutes. Stripe holds briefly in licensed escrow. Best time-to-money. Slightly higher per-transaction cost (1.5%).'
  };
  const el = document.getElementById('rail-agent');
  if (el) el.textContent = msgs[rail] || '';
}

function selectFlowModel(id) {
  document.querySelectorAll('[id^="fm-"]').forEach(e => e.classList.remove('selected'));
  document.getElementById(id)?.classList.add('selected');
}

function simIDUpload() {
  const z = document.getElementById('id-upload-zone');
  if (!z) return;
  z.innerHTML = '<div style="color:var(--amber);font-size:13px;font-weight:500;">Verifying with Persona...</div>';
  setTimeout(() => {
    z.innerHTML = '<div style="color:var(--green);font-size:13px;font-weight:500;">&#10003; Identity verified · Confidence 98% · OFAC clear · Watchlist clear</div>';
  }, 1800);
}

// ── PAYMENT FLOW STAGES ──
function selStage(n) {
  S.selectedStage = n;
  document.querySelectorAll('.flow-stage').forEach((s, i) => s.classList.toggle('active', i === n));
  document.querySelectorAll('.stage-detail').forEach((d, i) => d.style.display = i === n ? 'block' : 'none');
}

// ── TABS ──
function switchTab(group, tab) {
  document.querySelectorAll(`.${group}-tab-btn`).forEach(b => b.classList.remove('active'));
  document.querySelectorAll(`.${group}-tab-content`).forEach(c => c.style.display = 'none');
  document.querySelector(`[data-${group}tab="${tab}"]`)?.classList.add('active');
  document.getElementById(`${group}tab-${tab}`) && (document.getElementById(`${group}tab-${tab}`).style.display = 'block');
}

// ── RECONCILIATION ──
function toggleRecon(id) {
  if (S.reconChecked.has(id)) S.reconChecked.delete(id);
  else S.reconChecked.add(id);
  const box = document.getElementById('recon-' + id);
  if (box) {
    box.classList.toggle('checked', S.reconChecked.has(id));
    box.innerHTML = S.reconChecked.has(id) ? CHECK_SVG : '';
  }
  document.getElementById('recon-count').textContent = S.reconChecked.size + ' matched';
}

// ── APPROVE BRIEFING ACTION ──
function approveAction(id, label) {
  S.approvedActions.add(id);
  const btn = document.getElementById('ba-btn-' + id);
  if (btn) { btn.textContent = 'Done'; btn.style.background = 'var(--green)'; btn.disabled = true; }
}

// ── AP APPROVE ──
function approveVendor(name) {
  alert(`Payment to ${name} approved. Scheduled for next business day. Confirmation sent to your email.`);
}

// ── INVOICE MODAL ──
function openInvoiceModal() {
  document.getElementById('invoice-modal').style.display = 'flex';
}
function closeInvoiceModal() {
  document.getElementById('invoice-modal').style.display = 'none';
}
function sendInvoice() {
  const client = document.getElementById('inv-client').value || 'Client';
  const amount = document.getElementById('inv-amount').value || '$0';
  closeInvoiceModal();
  alert(`Invoice sent to ${client} for ${amount}.\n\nPayment link generated. Reg E disclosure embedded. Invoice added to AR tracking.`);
}

// ── DISPUTE TABS ──
function switchDisputeTab(tab) {
  document.querySelectorAll('.dispute-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`[onclick="switchDisputeTab('${tab}')"]`)?.classList.add('active');
  ['open','history','playbook'].forEach(t => {
    const el = document.getElementById('dtab-' + t);
    if (el) el.style.display = t === tab ? 'block' : 'none';
  });
}

// ── DISPUTE SUBMIT ──
function submitDispute() {
  alert('Response submitted to Stripe dispute team. Confirmation sent to jordan@luna.inc. You will receive a decision within 7-10 business days.');
}

// ── COPY REG E ──
function copyRegE() {
  const t = 'In case of errors or questions about your electronic transfers, contact us within 60 days after the error appeared on your statement. We will investigate and correct any error within 10 business days. If we need more time, we may take up to 45 days, but will credit your account within 10 days while the investigation is ongoing.';
  navigator.clipboard.writeText(t).then(() => alert('Reg E disclosure copied. Paste into your checkout page or payment terms.'));
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-page]').forEach(el => el.addEventListener('click', () => nav(el.dataset.page)));
  nav('home');
  selStage(0);
  selectRail('rtp');
  switchTab('pay', 'collect');
  switchTab('comp', 'mtl');
  switchTab('bill', 'invoices');
  switchTab('recon', 'unmatched');
  document.getElementById('sel-vol')?.addEventListener('change', genComplianceProfile);
  document.getElementById('sel-act')?.addEventListener('change', genComplianceProfile);
  goStep(1);
});
