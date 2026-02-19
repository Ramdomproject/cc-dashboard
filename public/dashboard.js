// ===== SHARED DATA (Monthly Values) =====
const BASE = {
  revenue: 189266.08,
  materials: 48499.61,
  subcontractors: 31415.75,
  labour: 10778.78,
  marketing: 15043.85,
  commissions: 17463.18,
  wagesOfficers: 13457.95,
  wagesProduction: 6815.55,
  wagesOffice: 1636.30,
  cppEi: 2969.53,
  vehicleLeases: 8446.51,
  vehicleOps: 5282.33,
  software: 6901.54,
  rent: 3635.96,
  officeGeneral: 2994.22,
  recruiting: 1554.51,
  bdcLoans: 8479.92,
  ccInterest: 2521.33,
  snapDeferral: 3559.67,
  snapCCFee: 48.63,
  equipLeases: 1419.33,
  creditLine: 25.00,
  bankCharges: 2326.76,
  qbFees: 675.18,
  payrollFees: 168.17
};

const CURRENT_DEBT = BASE.bdcLoans + BASE.ccInterest + BASE.snapDeferral + BASE.snapCCFee + BASE.equipLeases + BASE.creditLine + BASE.bankCharges + BASE.qbFees + BASE.payrollFees;
const CURRENT_VAR = BASE.materials + BASE.subcontractors + BASE.labour + BASE.marketing + BASE.commissions;
const CURRENT_OH = BASE.wagesOfficers + BASE.wagesProduction + BASE.wagesOffice + BASE.cppEi + BASE.vehicleLeases + BASE.vehicleOps + BASE.software + BASE.rent + BASE.officeGeneral + BASE.recruiting;
const CURRENT_FIXED = CURRENT_OH + CURRENT_DEBT;
const CURRENT_CM_PCT = (BASE.revenue - CURRENT_VAR) / BASE.revenue;
const CURRENT_BE = CURRENT_FIXED / CURRENT_CM_PCT;
const CURRENT_SURPLUS = BASE.revenue - CURRENT_BE;

const varData = [
  ["Materials (COGS)", BASE.materials],
  ["Subcontractors", BASE.subcontractors],
  ["Production Labour (COGS)", BASE.labour],
  ["Marketing & Advertising", BASE.marketing],
  ["Sales Commissions", BASE.commissions]
];
const ohData = [
  ["Wages - Officers", BASE.wagesOfficers],
  ["Wages - Production (Office/Admin)", BASE.wagesProduction],
  ["Wages - Office Staff", BASE.wagesOffice],
  ["CPP & EI Employer", BASE.cppEi],
  ["Vehicle Leases", BASE.vehicleLeases, true],
  ["Vehicle Operating (Fuel, Ins, Repairs)", BASE.vehicleOps],
  ["Software & Technology", BASE.software],
  ["Rent", BASE.rent],
  ["Office & General Expenses", BASE.officeGeneral],
  ["Recruiting", BASE.recruiting]
];
const debtData = [
  ["BDC Loan Payments", BASE.bdcLoans, true],
  ["Interest - Credit Cards", BASE.ccInterest],
  ["Snap Deferral Fees", BASE.snapDeferral],
  ["Snap CC Fee", BASE.snapCCFee],
  ["Equipment Leases", BASE.equipLeases, true],
  ["Credit Line Fee", BASE.creditLine, true],
  ["Bank Charges & Fees", BASE.bankCharges],
  ["QB / POS / Square / Stripe Fees", BASE.qbFees],
  ["Payroll Processing Fees", BASE.payrollFees]
];

function fmt(n) {
  if (n < 0) return '($' + Math.abs(Math.round(n)).toLocaleString() + ')';
  return '$' + Math.round(n).toLocaleString();
}
function fmtPct(n) { return (n * 100).toFixed(1) + '%'; }
function fmtDelta(n) {
  if (n > 0) return '+$' + Math.round(n).toLocaleString();
  if (n < 0) return '-$' + Math.abs(Math.round(n)).toLocaleString();
  return '$0';
}

// ===== TAB 1: BREAK-EVEN =====
function buildRows(tbody, data, group) {
  tbody.innerHTML = '';
  data.forEach((item, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item[0]}${item[2] ? '<span class="bank-tag">BANK</span>' : ''}</td>
      <td><input class="editable" value="${item[1].toFixed(2)}" data-group="${group}" data-idx="${i}"></td>
      <td class="yr-cell"></td>
      <td class="pct-cell"></td>
    `;
    tbody.appendChild(tr);
  });
}

buildRows(document.getElementById('var-body'), varData, 'variable');
buildRows(document.getElementById('oh-body'), ohData, 'overhead');
buildRows(document.getElementById('debt-body'), debtData, 'debt');

function getVal(input) {
  const v = parseFloat(input.value.replace(/[^0-9.\-]/g, ''));
  return isNaN(v) ? 0 : v;
}

function recalc() {
  const revMo = getVal(document.getElementById('revenue-mo'));
  const rev = revMo * 12;
  document.getElementById('rev-yr').textContent = fmt(rev);
  document.getElementById('rev-total-mo').textContent = fmt(revMo);

  let varSumMo = 0;
  document.querySelectorAll('[data-group="variable"]').forEach((inp, i) => {
    const mo = getVal(inp);
    varData[i][1] = mo;
    varSumMo += mo;
    const yr = mo * 12;
    const tr = inp.closest('tr');
    tr.querySelector('.yr-cell').textContent = fmt(yr);
    tr.querySelector('.pct-cell').textContent = rev > 0 ? fmtPct(yr / rev) : '0.0%';
  });

  let ohSumMo = 0;
  document.querySelectorAll('[data-group="overhead"]').forEach((inp, i) => {
    const mo = getVal(inp);
    ohData[i][1] = mo;
    ohSumMo += mo;
    const yr = mo * 12;
    const tr = inp.closest('tr');
    tr.querySelector('.yr-cell').textContent = fmt(yr);
    tr.querySelector('.pct-cell').textContent = rev > 0 ? fmtPct(yr / rev) : '0.0%';
  });

  let debtSumMo = 0;
  document.querySelectorAll('[data-group="debt"]').forEach((inp, i) => {
    const mo = getVal(inp);
    debtData[i][1] = mo;
    debtSumMo += mo;
    const yr = mo * 12;
    const tr = inp.closest('tr');
    tr.querySelector('.yr-cell').textContent = fmt(yr);
    tr.querySelector('.pct-cell').textContent = rev > 0 ? fmtPct(yr / rev) : '0.0%';
  });

  const varSum = varSumMo * 12, ohSum = ohSumMo * 12, debtSum = debtSumMo * 12;
  const cm = rev - varSum;
  const cmPct = rev > 0 ? cm / rev : 0;
  const totalFixedMo = ohSumMo + debtSumMo;
  const totalFixed = totalFixedMo * 12;
  const beAnnual = cmPct > 0 ? totalFixed / cmPct : 0;
  const beMo = beAnnual / 12;
  const surplus = revMo - beMo;

  document.getElementById('var-sum-mo').textContent = fmt(varSumMo);
  document.getElementById('var-sum-yr').textContent = fmt(varSum);
  document.getElementById('var-pct').textContent = rev > 0 ? fmtPct(varSum / rev) : '0.0%';
  document.getElementById('var-total-mo').textContent = fmt(varSumMo);

  document.getElementById('oh-sum-mo').textContent = fmt(ohSumMo);
  document.getElementById('oh-sum-yr').textContent = fmt(ohSum);
  document.getElementById('oh-pct').textContent = rev > 0 ? fmtPct(ohSum / rev) : '0.0%';
  document.getElementById('oh-total-mo').textContent = fmt(ohSumMo);

  document.getElementById('debt-sum-mo').textContent = fmt(debtSumMo);
  document.getElementById('debt-sum-yr').textContent = fmt(debtSum);
  document.getElementById('debt-pct').textContent = rev > 0 ? fmtPct(debtSum / rev) : '0.0%';
  document.getElementById('debt-total-mo').textContent = fmt(debtSumMo);

  document.getElementById('hero-be').textContent = fmt(beMo);
  document.getElementById('hero-be-yr').textContent = fmt(beAnnual);
  document.getElementById('hero-rev').textContent = fmt(revMo);
  document.getElementById('hero-rev-yr').textContent = fmt(rev);
  document.getElementById('hero-surplus').textContent = fmt(surplus);

  const surplusEl = document.getElementById('hero-surplus');
  const noteEl = document.getElementById('hero-surplus-note');
  if (surplus >= 0) { surplusEl.className = 'value val-green'; noteEl.textContent = 'Above break-even'; }
  else { surplusEl.className = 'value val-red'; noteEl.textContent = 'Below break-even'; }

  document.getElementById('cm-pct').textContent = fmtPct(cmPct);
  document.getElementById('cm-mo').textContent = fmt(cm / 12);
  document.getElementById('fixed-mo').textContent = fmt(totalFixedMo);
  const gapMo = cm / 12 - totalFixedMo;
  const gapEl = document.getElementById('gap-mo');
  gapEl.textContent = fmt(gapMo);
  gapEl.style.color = gapMo >= 0 ? 'var(--green)' : 'var(--red)';

  const revPct = beMo > 0 ? Math.min((revMo / beMo) * 100, 100) : 0;
  const barRevEl = document.getElementById('bar-rev');
  barRevEl.style.width = revPct + '%';
  barRevEl.textContent = revPct.toFixed(1) + '%';
  barRevEl.className = surplus >= 0 ? 'bar-fill green' : 'bar-fill red';
  document.getElementById('bar-rev-label').textContent = 'Break-Even: ' + fmt(beMo) + '/mo';

  if (rev > 0) {
    const vp = varSum / rev * 100, op = ohSum / rev * 100, dp = debtSum / rev * 100;
    document.getElementById('cost-var-bar').style.width = vp + '%';
    document.getElementById('cost-var-bar').textContent = 'Variable ' + vp.toFixed(1) + '%';
    document.getElementById('cost-oh-bar').style.width = op + '%';
    document.getElementById('cost-oh-bar').textContent = 'Overhead ' + op.toFixed(1) + '%';
    document.getElementById('cost-debt-bar').style.width = dp + '%';
    document.getElementById('cost-debt-bar').textContent = 'Debt ' + dp.toFixed(1) + '%';
  }
}

document.addEventListener('input', (e) => {
  if (e.target.classList.contains('editable')) recalc();
});
document.addEventListener('focusin', (e) => {
  if (e.target.classList.contains('editable') || e.target.classList.contains('bud-input')) {
    setTimeout(() => e.target.select(), 0);
  }
});
recalc();

// ===== TAB NAVIGATION =====
function showTab(id, btn) {
  document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  if (id === 'scenarios') scCalcAll();
  if (id === 'budget') budgetCalc();
}

// ===== TAB 2: SCENARIO PLANNER V2 =====
function numVal(id) {
  const el = document.getElementById(id);
  const v = parseFloat(el.value);
  return isNaN(v) ? 0 : v;
}

// Sync dollar <-> pct <-> slider for job costing
function scFromDollar(key) {
  const rev = getScenarioRev();
  const dollar = numVal('sc-' + key + '-dollar');
  const pct = rev > 0 ? (dollar / rev * 100) : 0;
  document.getElementById('sc-' + key + '-pct').value = pct.toFixed(1);
  document.getElementById('sc-' + key + '-slider').value = pct.toFixed(1);
  scCalcAll();
}
function scFromPct(key) {
  const rev = getScenarioRev();
  const pct = numVal('sc-' + key + '-pct');
  const dollar = Math.round(rev * pct / 100);
  document.getElementById('sc-' + key + '-dollar').value = dollar;
  document.getElementById('sc-' + key + '-slider').value = pct.toFixed(1);
  scCalcAll();
}
function scFromSlider(key) {
  const rev = getScenarioRev();
  const pct = parseFloat(document.getElementById('sc-' + key + '-slider').value);
  const dollar = Math.round(rev * pct / 100);
  document.getElementById('sc-' + key + '-dollar').value = dollar;
  document.getElementById('sc-' + key + '-pct').value = pct.toFixed(1);
  scCalcAll();
}

function getScenarioRev() {
  // Check override first
  const ov = document.getElementById('sc-rev-override').value;
  if (ov && !isNaN(parseFloat(ov)) && parseFloat(ov) > 0) return parseFloat(ov);
  // Otherwise use pipeline calc
  const adSpend = numVal('sc-adspend');
  const cpl = numVal('sc-cpl');
  const closeRate = numVal('sc-closerate') / 100;
  const revPerJob = numVal('sc-revjob');
  const leads = cpl > 0 ? adSpend / cpl : 0;
  const jobs = leads * closeRate;
  const pipelineRev = jobs * revPerJob;
  return pipelineRev > 0 ? pipelineRev : BASE.revenue;
}

function scCalcAll() {
  // 1. Pipeline calcs
  const adSpend = numVal('sc-adspend');
  const cpl = numVal('sc-cpl');
  const closeRate = numVal('sc-closerate') / 100;
  const revPerJob = numVal('sc-revjob');
  const leads = cpl > 0 ? Math.round(adSpend / cpl) : 0;
  const jobs = Math.round(leads * closeRate);
  const pipelineRev = jobs * revPerJob;
  const cpa = jobs > 0 ? Math.round(adSpend / jobs) : 0;

  document.getElementById('sc-leads-mo').textContent = leads.toLocaleString();
  document.getElementById('sc-jobs-mo').textContent = jobs.toLocaleString();
  document.getElementById('sc-pipeline-rev').textContent = fmt(pipelineRev);
  document.getElementById('sc-cpa').textContent = fmt(cpa);

  // Sync ad spend slider
  document.getElementById('sc-adspend-sl').value = adSpend;
  document.getElementById('sc-close-sl').value = numVal('sc-closerate');

  // 2. Revenue
  const ovVal = document.getElementById('sc-rev-override').value;
  let scRevenue;
  if (ovVal && !isNaN(parseFloat(ovVal)) && parseFloat(ovVal) > 0) {
    scRevenue = parseFloat(ovVal);
    document.getElementById('sc-pipeline-note').textContent = 'Revenue override active: ' + fmt(scRevenue) + '/mo. Pipeline shows ' + fmt(pipelineRev) + '/mo potential.';
  } else {
    scRevenue = pipelineRev > 0 ? pipelineRev : BASE.revenue;
    document.getElementById('sc-pipeline-note').textContent = fmt(pipelineRev) + '/mo from pipeline (' + leads + ' leads × ' + (closeRate*100).toFixed(0) + '% close × ' + fmt(revPerJob) + '/job).';
  }
  document.getElementById('sc-rev-final').textContent = fmt(scRevenue);

  // 3. Job costs (re-sync from dollars since revenue may have changed)
  const matDollar = numVal('sc-mat-dollar');
  const labDollar = numVal('sc-lab-dollar');
  const subDollar = numVal('sc-sub-dollar');
  const directTotal = matDollar + labDollar + subDollar;
  const grossMargin = scRevenue - directTotal;

  document.getElementById('sc-direct-total').textContent = fmt(directTotal);
  document.getElementById('sc-direct-pct').textContent = scRevenue > 0 ? (directTotal/scRevenue*100).toFixed(1) + '% of revenue' : '0%';
  document.getElementById('sc-gross-margin').textContent = fmt(grossMargin);
  document.getElementById('sc-gross-pct').textContent = scRevenue > 0 ? (grossMargin/scRevenue*100).toFixed(1) + '% of revenue' : '0%';

  // 4. Sales rep compensation
  const numReps = numVal('sc-numreps');
  const repBase = numVal('sc-repbase');
  const commPct = numVal('sc-commpct') / 100;
  const leadsPerRep = numVal('sc-leadsperrep');
  const commTotal = Math.round(scRevenue * commPct);
  const baseTotal = Math.round(numReps * repBase);
  const salesCostTotal = commTotal + baseTotal;

  document.getElementById('sc-numreps').value; // sync slider
  document.getElementById('sc-reps-sl').value = numReps;
  document.getElementById('sc-comm-sl').value = (commPct * 100).toFixed(1);

  document.getElementById('sc-comm-total').textContent = fmt(commTotal);
  document.getElementById('sc-comm-sub').textContent = (commPct*100).toFixed(1) + '% × ' + fmt(scRevenue);
  document.getElementById('sc-base-total').textContent = fmt(baseTotal);
  document.getElementById('sc-base-sub').textContent = numReps + ' reps × ' + fmt(repBase);
  document.getElementById('sc-salescost-total').textContent = fmt(salesCostTotal);
  document.getElementById('sc-salescost-sub').textContent = fmt(commTotal) + ' comm + ' + fmt(baseTotal) + ' base';

  // Net revenue per lead
  const commPerJob = jobs > 0 ? commTotal / jobs : 0;
  const netPerLead = revPerJob - cpl - commPerJob;
  document.getElementById('sc-netperlead').textContent = fmt(netPerLead);
  document.getElementById('sc-netperlead-sub').textContent = fmt(revPerJob) + ' revenue − ' + fmt(cpl) + ' CPL − ' + fmt(Math.round(commPerJob)) + ' commission/job';

  // 5. Fleet
  const trucks = numVal('sc-trucks');
  const leasePer = numVal('sc-leaseper');
  const opPer = numVal('sc-opper');
  const revPerTruck = numVal('sc-revpertruck');
  const fleetLease = Math.round(trucks * leasePer);
  const fleetOps = Math.round(trucks * opPer);
  const fleetTotal = fleetLease + fleetOps;
  const fleetCap = Math.round(trucks * revPerTruck);

  document.getElementById('sc-trucks-sl').value = trucks;
  document.getElementById('sc-fleet-lease').textContent = fmt(fleetLease);
  document.getElementById('sc-fleet-lease-sub').textContent = trucks + ' × ' + fmt(leasePer);
  document.getElementById('sc-fleet-ops').textContent = fmt(fleetOps);
  document.getElementById('sc-fleet-ops-sub').textContent = trucks + ' × ' + fmt(opPer);
  document.getElementById('sc-fleet-total').textContent = fmt(fleetTotal);
  document.getElementById('sc-fleet-cap').textContent = fmt(fleetCap);
  document.getElementById('sc-fleet-cap-sub').textContent = trucks + ' trucks × ' + fmt(revPerTruck);

  // 6. Overhead
  const wageOff = numVal('sc-wage-off');
  const wageAdmin = numVal('sc-wage-admin');
  const cpp = numVal('sc-cpp');
  const soft = numVal('sc-soft');
  const rent = numVal('sc-rent');
  const recruit = numVal('sc-recruit');
  const offgen = numVal('sc-offgen');
  const debtMo = CURRENT_DEBT; // locked
  const equipMo = numVal('sc-equip');

  // 7. Totals
  const scVarTotal = matDollar + subDollar + labDollar + adSpend + salesCostTotal;
  const scOhTotal = wageOff + wageAdmin + cpp + fleetLease + fleetOps + soft + rent + offgen + recruit;
  const scFixedTotal = scOhTotal + debtMo;
  const scCM = scRevenue - scVarTotal;
  const scCMpct = scRevenue > 0 ? scCM / scRevenue : 0;
  const scBE = scCMpct > 0 ? scFixedTotal / scCMpct : 0;
  const scSurplus = scRevenue - scBE;
  const scNetProfit = scRevenue - scVarTotal - scFixedTotal;

  // Update result strip
  document.getElementById('s2-rev').textContent = fmt(scRevenue);
  document.getElementById('s2-cm').textContent = (scCMpct * 100).toFixed(1) + '%';
  document.getElementById('s2-be').textContent = fmt(scBE);
  document.getElementById('s2-surplus').textContent = fmt(scSurplus);
  document.getElementById('s2-surplus').className = 'rc-val ' + (scSurplus >= 0 ? 'val-green' : 'val-red');
  document.getElementById('s2-net').textContent = fmt(scNetProfit);
  document.getElementById('s2-net').className = 'rc-val ' + (scNetProfit >= 0 ? 'val-green' : 'val-red');

  // Deltas
  const dRev = scRevenue - BASE.revenue;
  const dCM = (scCMpct - CURRENT_CM_PCT) * 100;
  const dBE = scBE - CURRENT_BE;
  const dSurplus = scSurplus - CURRENT_SURPLUS;
  const curNet = BASE.revenue - CURRENT_VAR - CURRENT_FIXED;
  const dNet = scNetProfit - curNet;

  document.getElementById('s2-rev-d').innerHTML = mkDelta(dRev, true);
  document.getElementById('s2-cm-d').innerHTML = mkDeltaPct(dCM);
  document.getElementById('s2-be-d').innerHTML = mkDelta(dBE, false);
  document.getElementById('s2-surplus-d').innerHTML = mkDelta(dSurplus, true);
  document.getElementById('s2-net-d').innerHTML = mkDelta(dNet, true);

  // Comparison table
  const rows = [
    ['Revenue', BASE.revenue, scRevenue, true],
    ['— Materials', BASE.materials, matDollar, false],
    ['— Production Labour', BASE.labour, labDollar, false],
    ['— Subcontractors', BASE.subcontractors, subDollar, false],
    ['— Advertising', BASE.marketing, adSpend, false],
    ['— Sales Commissions', BASE.commissions, commTotal, false],
    ['— Rep Base Salaries', 0, baseTotal, false],
    ['Total Variable Costs', CURRENT_VAR, scVarTotal, false],
    ['Contribution Margin', BASE.revenue - CURRENT_VAR, scCM, true],
    ['CM %', CURRENT_CM_PCT * 100, scCMpct * 100, true, true],
    ['— Officer Wages', BASE.wagesOfficers, wageOff, false],
    ['— Admin/Office Wages', BASE.wagesProduction + BASE.wagesOffice, wageAdmin, false],
    ['— CPP & EI', BASE.cppEi, cpp, false],
    ['— Fleet Leases (' + trucks + ' trucks)', BASE.vehicleLeases, fleetLease, false],
    ['— Fleet Operating', BASE.vehicleOps, fleetOps, false],
    ['— Software & Tech', BASE.software, soft, false],
    ['— Rent', BASE.rent, rent, false],
    ['— Office & General', BASE.officeGeneral, offgen, false],
    ['— Recruiting', BASE.recruiting, recruit, false],
    ['Total Overhead', CURRENT_OH, scOhTotal, false],
    ['Debt & Finance (locked)', CURRENT_DEBT, debtMo, false],
    ['Total Fixed Costs', CURRENT_FIXED, scFixedTotal, false],
    ['Break-Even / Mo', CURRENT_BE, scBE, false],
    ['Surplus / (Shortfall)', CURRENT_SURPLUS, scSurplus, true],
    ['Net Profit / (Loss)', curNet, scNetProfit, true]
  ];

  const tbody = document.getElementById('s2-compare-body');
  tbody.innerHTML = '';
  rows.forEach(r => {
    const isPctRow = r[4];
    const diff = r[2] - r[1];
    const isBold = ['Revenue','Contribution Margin','Total Variable Costs','Total Overhead','Total Fixed Costs','Break-Even / Mo','Surplus / (Shortfall)','Net Profit / (Loss)','CM %'].includes(r[0]);
    let cls = '';
    if (Math.abs(diff) > 0.5) {
      if (isPctRow) {
        cls = diff > 0 ? 'delta-pos' : 'delta-neg';
      } else {
        cls = r[3] ? (diff > 0 ? 'delta-pos' : 'delta-neg') : (diff < 0 ? 'delta-pos' : 'delta-neg');
      }
    }
    const fmtFn = isPctRow ? (v) => v.toFixed(1) + '%' : fmt;
    const fmtDFn = isPctRow ? (v) => (v > 0 ? '+' : '') + v.toFixed(1) + ' pts' : fmtDelta;
    tbody.innerHTML += `<tr style="${isBold ? 'font-weight:700; background:#f0f7ff;' : ''}">
      <td style="text-align:left;">${r[0]}</td>
      <td style="text-align:right;">${fmtFn(r[1])}</td>
      <td style="text-align:right;">${fmtFn(r[2])}</td>
      <td style="text-align:right;" class="${cls}">${Math.abs(diff) < 0.5 ? '—' : fmtDFn(diff)}</td>
    </tr>`;
  });
}

function mkDelta(n, positiveIsGood) {
  if (Math.abs(n) < 1) return '<span style="color:var(--muted);">&nbsp;</span>';
  const good = positiveIsGood ? n > 0 : n < 0;
  return `<span style="color:${good ? 'var(--green)' : 'var(--red)'}; font-weight:600; font-size:11px;">${fmtDelta(n)} vs current</span>`;
}
function mkDeltaPct(n) {
  if (Math.abs(n) < 0.05) return '<span style="color:var(--muted);">&nbsp;</span>';
  const good = n > 0;
  return `<span style="color:${good ? 'var(--green)' : 'var(--red)'}; font-weight:600; font-size:11px;">${n > 0 ? '+' : ''}${n.toFixed(1)} pts</span>`;
}

// PRESETS
function scPreset(name, btn) {
  document.querySelectorAll('.preset-pill').forEach(p => p.classList.remove('active'));
  if (name !== 'reset' && btn) btn.classList.add('active');

  // Reset to current first
  document.getElementById('sc-mat-dollar').value = 48500;
  document.getElementById('sc-lab-dollar').value = 10779;
  document.getElementById('sc-sub-dollar').value = 31416;
  document.getElementById('sc-adspend').value = 15044;
  document.getElementById('sc-cpl').value = 150;
  document.getElementById('sc-closerate').value = 25;
  document.getElementById('sc-revjob').value = 12500;
  document.getElementById('sc-rev-override').value = '';
  document.getElementById('sc-numreps').value = 0;
  document.getElementById('sc-repbase').value = 4000;
  document.getElementById('sc-commpct').value = 10;
  document.getElementById('sc-leadsperrep').value = 30;
  document.getElementById('sc-trucks').value = 9;
  document.getElementById('sc-leaseper').value = 938;
  document.getElementById('sc-opper').value = 587;
  document.getElementById('sc-revpertruck').value = 21030;
  document.getElementById('sc-wage-off').value = 13458;
  document.getElementById('sc-wage-admin').value = 8452;
  document.getElementById('sc-cpp').value = 2970;
  document.getElementById('sc-soft').value = 6902;
  document.getElementById('sc-rent').value = 3636;
  document.getElementById('sc-recruit').value = 1555;
  document.getElementById('sc-offgen').value = 2994;

  if (name === 'direct') {
    // Direct cost jobs: zero ads, zero commissions, lower subs, lower revenue
    document.getElementById('sc-adspend').value = 0;
    document.getElementById('sc-commpct').value = 0;
    document.getElementById('sc-numreps').value = 0;
    document.getElementById('sc-sub-dollar').value = 15000;
    document.getElementById('sc-rev-override').value = 135000;
    document.getElementById('sc-recruit').value = 0;
  } else if (name === 'growth') {
    // Push ads: double ad spend, better CPL, hire 2 reps
    document.getElementById('sc-adspend').value = 30000;
    document.getElementById('sc-cpl').value = 120;
    document.getElementById('sc-closerate').value = 30;
    document.getElementById('sc-numreps').value = 2;
    document.getElementById('sc-repbase').value = 4000;
    document.getElementById('sc-commpct').value = 8;
    document.getElementById('sc-rev-override').value = '';
    document.getElementById('sc-soft').value = 4500;
    document.getElementById('sc-recruit').value = 800;
  } else if (name === 'lean') {
    // Slash overhead
    document.getElementById('sc-wage-off').value = 10000;
    document.getElementById('sc-wage-admin').value = 6000;
    document.getElementById('sc-soft').value = 3500;
    document.getElementById('sc-recruit').value = 0;
    document.getElementById('sc-offgen').value = 1500;
    document.getElementById('sc-adspend').value = 8000;
    document.getElementById('sc-rev-override').value = 165000;
  } else if (name === 'scale') {
    // Scale: more trucks, more reps, bigger pipeline
    document.getElementById('sc-trucks').value = 14;
    document.getElementById('sc-adspend').value = 25000;
    document.getElementById('sc-cpl').value = 130;
    document.getElementById('sc-closerate').value = 28;
    document.getElementById('sc-numreps').value = 3;
    document.getElementById('sc-repbase').value = 4500;
    document.getElementById('sc-commpct').value = 8;
    document.getElementById('sc-mat-dollar').value = 70000;
    document.getElementById('sc-lab-dollar').value = 18000;
    document.getElementById('sc-sub-dollar').value = 45000;
    document.getElementById('sc-wage-admin').value = 12000;
    document.getElementById('sc-cpp').value = 4500;
    document.getElementById('sc-rev-override').value = '';
  }

  // Sync pct/slider fields for job costing
  ['mat','lab','sub'].forEach(k => scFromDollar(k));
  scCalcAll();
}

// ===== TAB 3: BUDGET vs ACTUAL =====
const MONTHS = ['Oct 24','Nov 24','Dec 24','Jan 25','Feb 25','Mar 25','Apr 25','May 25','Jun 25','Jul 25','Aug 25','Sep 25'];

const BUDGET_CATS = {
  revenue: {
    label: 'Revenue',
    items: [{ name: 'Total Revenue', base: BASE.revenue }],
    isRevenue: true
  },
  variable: {
    label: 'Variable Costs',
    items: [
      { name: 'Materials (COGS)', base: BASE.materials },
      { name: 'Subcontractors', base: BASE.subcontractors },
      { name: 'Production Labour', base: BASE.labour },
      { name: 'Marketing & Advertising', base: BASE.marketing },
      { name: 'Sales Commissions', base: BASE.commissions }
    ],
    isRevenue: false
  },
  overhead: {
    label: 'Overhead',
    items: [
      { name: 'Officer Wages', base: BASE.wagesOfficers },
      { name: 'Production Wages', base: BASE.wagesProduction },
      { name: 'Office Staff', base: BASE.wagesOffice },
      { name: 'CPP & EI', base: BASE.cppEi },
      { name: 'Vehicle Leases', base: BASE.vehicleLeases },
      { name: 'Vehicle Operating', base: BASE.vehicleOps },
      { name: 'Software & Tech', base: BASE.software },
      { name: 'Rent', base: BASE.rent },
      { name: 'Office & General', base: BASE.officeGeneral },
      { name: 'Recruiting', base: BASE.recruiting }
    ],
    isRevenue: false
  },
  debt: {
    label: 'Debt & Finance',
    items: [
      { name: 'BDC Loans', base: BASE.bdcLoans },
      { name: 'CC Interest', base: BASE.ccInterest },
      { name: 'Snap Deferral', base: BASE.snapDeferral },
      { name: 'Equipment Leases', base: BASE.equipLeases },
      { name: 'Bank Charges', base: BASE.bankCharges },
      { name: 'Other Fees', base: BASE.snapCCFee + BASE.creditLine + BASE.qbFees + BASE.payrollFees }
    ],
    isRevenue: false
  }
};

let budgetStore = {};
Object.keys(BUDGET_CATS).forEach(cat => {
  budgetStore[cat] = {};
  BUDGET_CATS[cat].items.forEach((item, idx) => {
    budgetStore[cat][idx] = {};
    MONTHS.forEach((m, mi) => {
      budgetStore[cat][idx][mi] = { budget: Math.round(item.base), actual: Math.round(item.base) };
    });
  });
});

let currentBudgetCat = 'revenue';

function showBudgetCat(cat, btn) {
  currentBudgetCat = cat;
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderBudgetTable();
}

function renderBudgetTable() {
  const table = document.getElementById('budget-table');
  if (currentBudgetCat === 'summary') { renderBudgetSummary(); return; }
  const catDef = BUDGET_CATS[currentBudgetCat];
  const isRev = catDef.isRevenue;
  let html = '<tr><th style="text-align:left; min-width:140px;">Item</th><th style="text-align:left; min-width:60px;">Row</th>';
  MONTHS.forEach(m => { html += `<th style="text-align:right; min-width:85px;">${m}</th>`; });
  html += '<th style="text-align:right; min-width:85px;">YTD Total</th></tr>';

  catDef.items.forEach((item, idx) => {
    html += `<tr><td rowspan="3" style="font-weight:600; vertical-align:top; border-right:1px solid var(--border);">${item.name}</td>`;
    html += '<td style="font-size:11px; color:var(--muted);">Budget</td>';
    let budYTD = 0;
    MONTHS.forEach((m, mi) => {
      const val = budgetStore[currentBudgetCat][idx][mi].budget;
      budYTD += val;
      html += `<td><input class="bud-input" value="${val}" data-cat="${currentBudgetCat}" data-idx="${idx}" data-mi="${mi}" data-type="budget" onchange="budgetInputChange(this)"></td>`;
    });
    html += `<td style="text-align:right; font-weight:600;">${fmt(budYTD)}</td></tr>`;

    html += '<tr><td style="font-size:11px; color:var(--muted);">Actual</td>';
    let actYTD = 0;
    MONTHS.forEach((m, mi) => {
      const val = budgetStore[currentBudgetCat][idx][mi].actual;
      actYTD += val;
      html += `<td><input class="bud-input" value="${val}" data-cat="${currentBudgetCat}" data-idx="${idx}" data-mi="${mi}" data-type="actual" onchange="budgetInputChange(this)"></td>`;
    });
    html += `<td style="text-align:right; font-weight:600;">${fmt(actYTD)}</td></tr>`;

    html += '<tr style="border-bottom:2px solid var(--border);"><td style="font-size:11px; color:var(--muted);">Variance</td>';
    let varYTD = 0;
    MONTHS.forEach((m, mi) => {
      const b = budgetStore[currentBudgetCat][idx][mi].budget;
      const a = budgetStore[currentBudgetCat][idx][mi].actual;
      const v = a - b;
      varYTD += v;
      const good = isRev ? v >= 0 : v <= 0;
      html += `<td style="text-align:right; font-weight:600; color:${v === 0 ? 'var(--muted)' : (good ? 'var(--green)' : 'var(--red)')};">${fmt(v)}</td>`;
    });
    const goodYTD = isRev ? varYTD >= 0 : varYTD <= 0;
    html += `<td style="text-align:right; font-weight:700; color:${varYTD === 0 ? 'var(--muted)' : (goodYTD ? 'var(--green)' : 'var(--red)')};">${fmt(varYTD)}</td></tr>`;
  });
  table.innerHTML = html;
  budgetCalc();
}

function renderBudgetSummary() {
  const table = document.getElementById('budget-table');
  let html = '<tr><th style="text-align:left;">Category</th><th style="text-align:left;">Row</th>';
  MONTHS.forEach(m => { html += `<th style="text-align:right; min-width:85px;">${m}</th>`; });
  html += '<th style="text-align:right; min-width:85px;">YTD</th></tr>';
  const categories = ['revenue', 'variable', 'overhead', 'debt'];
  const catLabels = { revenue: 'Revenue', variable: 'Variable Costs', overhead: 'Overhead', debt: 'Debt & Finance' };

  categories.forEach(cat => {
    const isRev = BUDGET_CATS[cat].isRevenue;
    const items = BUDGET_CATS[cat].items;
    let budRow = new Array(12).fill(0);
    let actRow = new Array(12).fill(0);
    items.forEach((item, idx) => {
      MONTHS.forEach((m, mi) => {
        budRow[mi] += budgetStore[cat][idx][mi].budget;
        actRow[mi] += budgetStore[cat][idx][mi].actual;
      });
    });
    const budYTD = budRow.reduce((a,b) => a+b, 0);
    const actYTD = actRow.reduce((a,b) => a+b, 0);
    html += `<tr><td rowspan="3" style="font-weight:700; vertical-align:top; border-right:1px solid var(--border);">${catLabels[cat]}</td>`;
    html += '<td style="font-size:11px; color:var(--muted);">Budget</td>';
    budRow.forEach(v => { html += `<td style="text-align:right;">${fmt(v)}</td>`; });
    html += `<td style="text-align:right; font-weight:600;">${fmt(budYTD)}</td></tr>`;
    html += '<tr><td style="font-size:11px; color:var(--muted);">Actual</td>';
    actRow.forEach(v => { html += `<td style="text-align:right;">${fmt(v)}</td>`; });
    html += `<td style="text-align:right; font-weight:600;">${fmt(actYTD)}</td></tr>`;
    html += '<tr style="border-bottom:2px solid var(--border);"><td style="font-size:11px; color:var(--muted);">Variance</td>';
    let varTot = 0;
    MONTHS.forEach((m, mi) => {
      const v = actRow[mi] - budRow[mi]; varTot += v;
      const good = isRev ? v >= 0 : v <= 0;
      html += `<td style="text-align:right; font-weight:600; color:${v === 0 ? 'var(--muted)' : (good ? 'var(--green)' : 'var(--red)')};">${fmt(v)}</td>`;
    });
    const goodT = (cat === 'revenue') ? varTot >= 0 : varTot <= 0;
    html += `<td style="text-align:right; font-weight:700; color:${varTot === 0 ? 'var(--muted)' : (goodT ? 'var(--green)' : 'var(--red)')};">${fmt(varTot)}</td></tr>`;
  });

  // Net Profit row
  html += '<tr style="background:#f0f7ff;"><td rowspan="3" style="font-weight:800; vertical-align:top; border-right:1px solid var(--border); color:var(--navy);">Net Profit / (Loss)</td>';
  html += '<td style="font-size:11px; color:var(--muted);">Budget</td>';
  let netBudYTD = 0;
  MONTHS.forEach((m, mi) => {
    let revB = 0, costB = 0;
    BUDGET_CATS.revenue.items.forEach((it, idx) => { revB += budgetStore.revenue[idx][mi].budget; });
    ['variable','overhead','debt'].forEach(cat => { BUDGET_CATS[cat].items.forEach((it, idx) => { costB += budgetStore[cat][idx][mi].budget; }); });
    const net = revB - costB; netBudYTD += net;
    html += `<td style="text-align:right; font-weight:600; color:${net >= 0 ? 'var(--green)' : 'var(--red)'};">${fmt(net)}</td>`;
  });
  html += `<td style="text-align:right; font-weight:700; color:${netBudYTD >= 0 ? 'var(--green)' : 'var(--red)'};">${fmt(netBudYTD)}</td></tr>`;

  html += '<tr style="background:#f0f7ff;"><td style="font-size:11px; color:var(--muted);">Actual</td>';
  let netActYTD = 0;
  MONTHS.forEach((m, mi) => {
    let revA = 0, costA = 0;
    BUDGET_CATS.revenue.items.forEach((it, idx) => { revA += budgetStore.revenue[idx][mi].actual; });
    ['variable','overhead','debt'].forEach(cat => { BUDGET_CATS[cat].items.forEach((it, idx) => { costA += budgetStore[cat][idx][mi].actual; }); });
    const net = revA - costA; netActYTD += net;
    html += `<td style="text-align:right; font-weight:600; color:${net >= 0 ? 'var(--green)' : 'var(--red)'};">${fmt(net)}</td>`;
  });
  html += `<td style="text-align:right; font-weight:700; color:${netActYTD >= 0 ? 'var(--green)' : 'var(--red)'};">${fmt(netActYTD)}</td></tr>`;

  html += '<tr style="background:#f0f7ff; border-bottom:2px solid var(--border);"><td style="font-size:11px; color:var(--muted);">Variance</td>';
  let netVarYTD = 0;
  MONTHS.forEach((m, mi) => {
    let revB = 0, revA = 0, costB = 0, costA = 0;
    BUDGET_CATS.revenue.items.forEach((it, idx) => { revB += budgetStore.revenue[idx][mi].budget; revA += budgetStore.revenue[idx][mi].actual; });
    ['variable','overhead','debt'].forEach(cat => { BUDGET_CATS[cat].items.forEach((it, idx) => { costB += budgetStore[cat][idx][mi].budget; costA += budgetStore[cat][idx][mi].actual; }); });
    const v = (revA - costA) - (revB - costB); netVarYTD += v;
    html += `<td style="text-align:right; font-weight:600; color:${v === 0 ? 'var(--muted)' : (v > 0 ? 'var(--green)' : 'var(--red)')};">${fmt(v)}</td>`;
  });
  html += `<td style="text-align:right; font-weight:700; color:${netVarYTD === 0 ? 'var(--muted)' : (netVarYTD > 0 ? 'var(--green)' : 'var(--red)')};">${fmt(netVarYTD)}</td></tr>`;
  table.innerHTML = html;
  budgetCalc();
}

function budgetInputChange(el) {
  const cat = el.dataset.cat;
  const idx = parseInt(el.dataset.idx);
  const mi = parseInt(el.dataset.mi);
  const type = el.dataset.type;
  const val = parseInt(el.value.replace(/[^0-9.\-]/g, '')) || 0;
  budgetStore[cat][idx][mi][type] = val;
  renderBudgetTable();
}

function budgetCalc() {
  let revBudget = 0, revActual = 0, costBudget = 0, costActual = 0;
  BUDGET_CATS.revenue.items.forEach((it, idx) => {
    MONTHS.forEach((m, mi) => { revBudget += budgetStore.revenue[idx][mi].budget; revActual += budgetStore.revenue[idx][mi].actual; });
  });
  ['variable','overhead','debt'].forEach(cat => {
    BUDGET_CATS[cat].items.forEach((it, idx) => {
      MONTHS.forEach((m, mi) => { costBudget += budgetStore[cat][idx][mi].budget; costActual += budgetStore[cat][idx][mi].actual; });
    });
  });
  const netBudget = revBudget - costBudget;
  const netActual = revActual - costActual;
  const netVar = netActual - netBudget;
  const netPct = netBudget !== 0 ? (netVar / Math.abs(netBudget) * 100) : 0;
  document.getElementById('bud-ytd-budget').textContent = fmt(netBudget);
  document.getElementById('bud-ytd-actual').textContent = fmt(netActual);
  const varEl = document.getElementById('bud-ytd-var');
  varEl.textContent = fmt(netVar);
  varEl.className = 'bh-val ' + (netVar >= 0 ? 'val-green' : 'val-red');
  const pctEl = document.getElementById('bud-ytd-pct');
  pctEl.textContent = (netPct >= 0 ? '+' : '') + netPct.toFixed(1) + '%';
  pctEl.className = 'bh-val ' + (netPct >= 0 ? 'val-green' : 'val-red');
}

// ===== SERVICE LINE PROFITABILITY PLANNER =====

// --- Expense items with toggle state ---
const expOh = [
  { key: 'wagesOfficers', name: 'Wages \u2013 Officers / Owner', amt: BASE.wagesOfficers, on: true },
  { key: 'wagesProduction', name: 'Wages \u2013 Production Staff', amt: BASE.wagesProduction, on: true },
  { key: 'wagesOffice', name: 'Wages \u2013 Office Staff', amt: BASE.wagesOffice, on: true },
  { key: 'cppEi', name: 'CPP & EI (Employer)', amt: BASE.cppEi, on: true },
  { key: 'vehicleLeases', name: 'Vehicle Leases (9 vehicles)', amt: BASE.vehicleLeases, on: true },
  { key: 'vehicleOps', name: 'Vehicle Operating', amt: BASE.vehicleOps, on: true },
  { key: 'software', name: 'Software & Technology', amt: BASE.software, on: true },
  { key: 'rent', name: 'Rent', amt: BASE.rent, on: true },
  { key: 'officeGeneral', name: 'Office & General', amt: BASE.officeGeneral, on: true },
  { key: 'recruiting', name: 'Recruiting', amt: BASE.recruiting, on: true }
];
const expDebt = [
  { key: 'bdcLoans', name: 'BDC Loan Payments', amt: BASE.bdcLoans, on: true },
  { key: 'ccInterest', name: 'Credit Card Interest', amt: BASE.ccInterest, on: true },
  { key: 'snapDeferral', name: 'Snap Deferral Fees', amt: BASE.snapDeferral, on: true },
  { key: 'snapCCFee', name: 'Snap CC Fee', amt: BASE.snapCCFee, on: true },
  { key: 'equipLeases', name: 'Equipment Leases', amt: BASE.equipLeases, on: true },
  { key: 'creditLine', name: 'Credit Line Fee', amt: BASE.creditLine, on: true },
  { key: 'bankCharges', name: 'Bank Charges & Fees', amt: BASE.bankCharges, on: true },
  { key: 'qbFees', name: 'QB / POS / Stripe Fees', amt: BASE.qbFees, on: true },
  { key: 'payrollFees', name: 'Payroll Processing', amt: BASE.payrollFees, on: true }
];

function expRender() {
  let h = '';
  expOh.forEach((item, i) => {
    h += '<div class="exp-item ' + (item.on ? '' : 'exp-off') + '">'
      + '<input type="checkbox" ' + (item.on ? 'checked' : '') + ' onchange="expToggle(\'oh\',' + i + ')">'
      + '<span class="exp-name">' + item.name + '</span>'
      + '<span class="exp-amt">' + fmt(item.amt) + '</span></div>';
  });
  document.getElementById('exp-oh-items').innerHTML = h;
  h = '';
  expDebt.forEach((item, i) => {
    h += '<div class="exp-item ' + (item.on ? '' : 'exp-off') + '">'
      + '<input type="checkbox" ' + (item.on ? 'checked' : '') + ' onchange="expToggle(\'debt\',' + i + ')">'
      + '<span class="exp-name">' + item.name + '</span>'
      + '<span class="exp-amt">' + fmt(item.amt) + '</span></div>';
  });
  document.getElementById('exp-debt-items').innerHTML = h;
}
function expToggle(group, idx) {
  const arr = group === 'oh' ? expOh : expDebt;
  arr[idx].on = !arr[idx].on; expRender(); goalCalc();
}
function expToggleGroup(group) {
  const arr = group === 'oh' ? expOh : expDebt;
  const allOn = arr.every(i => i.on);
  arr.forEach(i => i.on = !allOn); expRender(); goalCalc();
}
function expPreset(mode) {
  if (mode === 'all') { expOh.forEach(i => i.on = true); expDebt.forEach(i => i.on = true); }
  else if (mode === 'lean') { expOh.forEach(i => i.on = true); expDebt.forEach(i => i.on = false); }
  else if (mode === 'nodbt') { expOh.forEach(i => i.on = true); expDebt.forEach(i => i.on = true); expDebt[0].on = false; }
  else if (mode === 'min') { expOh.forEach(i => i.on = false); expDebt.forEach(i => i.on = false);
    expOh[0].on = true; expOh[4].on = true; expOh[7].on = true; expDebt[6].on = true; }
  expRender(); goalCalc();
}

function getFixedCosts() {
  let s = 0;
  expOh.forEach(i => { if (i.on) s += i.amt; });
  expDebt.forEach(i => { if (i.on) s += i.amt; });
  return s;
}

function goalCalc() {
  const target = numVal('goal-profit');
  const fixed = getFixedCosts();
  const gpNeeded = fixed + target;
  const revNeeded = CURRENT_CM_PCT > 0 ? gpNeeded / CURRENT_CM_PCT : 0;
  document.getElementById('goal-fixed').textContent = fmt(fixed);
  document.getElementById('goal-gp').textContent = fmt(gpNeeded);
  document.getElementById('goal-rev').textContent = fmt(revNeeded);
  slRender(); // re-render service cards so "jobs to break even" updates with new fixed costs
  mpCalc(); // update planner whenever goal changes
}

// --- Service Lines ---
let serviceLines = [
  { name:'Roofing \u2013 Full Package', unitType:'per SQ', matPerUnit:141.91, labPerUnit:95.08, othPerUnit:0, avgJobSize:8, targetMarginPct:75,
    hasComm:true, commPct:10, hasMktg:true, costPerLead:150, closeRatePct:25, hasProdMgr:false, prodMgrPct:3, expanded:true },
  { name:'Eavestrough \u2013 Full Package', unitType:'per LF', matPerUnit:2.11, labPerUnit:5.24, othPerUnit:0, avgJobSize:119, targetMarginPct:75,
    hasComm:true, commPct:10, hasMktg:true, costPerLead:120, closeRatePct:30, hasProdMgr:false, prodMgrPct:3, expanded:false },
  { name:'EavesArmour \u2013 Guard', unitType:'per LF', matPerUnit:7.25, labPerUnit:2.00, othPerUnit:0, avgJobSize:115, targetMarginPct:64,
    hasComm:true, commPct:10, hasMktg:true, costPerLead:100, closeRatePct:30, hasProdMgr:false, prodMgrPct:3, expanded:false },
  { name:'EavesArmour \u2013 Heated', unitType:'per LF', matPerUnit:7.40, labPerUnit:5.10, othPerUnit:0, avgJobSize:108, targetMarginPct:70,
    hasComm:true, commPct:10, hasMktg:true, costPerLead:100, closeRatePct:30, hasProdMgr:false, prodMgrPct:3, expanded:false },
  { name:'Siding \u2013 Full Package', unitType:'per SQFT', matPerUnit:3.17, labPerUnit:5.12, othPerUnit:0, avgJobSize:754, targetMarginPct:75,
    hasComm:true, commPct:10, hasMktg:true, costPerLead:150, closeRatePct:25, hasProdMgr:false, prodMgrPct:3, expanded:false },
  { name:'Windows', unitType:'per SQFT', matPerUnit:36.40, labPerUnit:25.00, othPerUnit:0, avgJobSize:61, targetMarginPct:75,
    hasComm:true, commPct:10, hasMktg:true, costPerLead:120, closeRatePct:30, hasProdMgr:false, prodMgrPct:3, expanded:false },
  { name:'Doors', unitType:'per EA', matPerUnit:1684.00, labPerUnit:500.00, othPerUnit:0, avgJobSize:1, targetMarginPct:67,
    hasComm:true, commPct:10, hasMktg:true, costPerLead:120, closeRatePct:30, hasProdMgr:false, prodMgrPct:3, expanded:false },
  { name:'Soffit, Fascia & Eavestrough', unitType:'per LF', matPerUnit:5.11, labPerUnit:15.99, othPerUnit:0, avgJobSize:118, targetMarginPct:75,
    hasComm:true, commPct:10, hasMktg:true, costPerLead:130, closeRatePct:25, hasProdMgr:false, prodMgrPct:3, expanded:false },
  { name:'Insurance Repair', unitType:'per job', matPerUnit:3500, labPerUnit:2200, othPerUnit:500, avgJobSize:1, targetMarginPct:30,
    hasComm:false, commPct:0, hasMktg:false, costPerLead:0, closeRatePct:100, hasProdMgr:false, prodMgrPct:3, expanded:false }
];
let slJobsPerMonth = {}; // keyed by index

function slCalcLine(sl) {
  const directPerUnit = sl.matPerUnit + sl.labPerUnit + sl.othPerUnit;
  const directPerJob = directPerUnit * sl.avgJobSize;
  const marginMult = 1 - (sl.targetMarginPct / 100);
  const sellPrice = marginMult > 0 ? directPerJob / marginMult : directPerJob;
  const grossProfit = sellPrice - directPerJob;

  // Variable costs per job
  const commAmt = sl.hasComm ? sellPrice * (sl.commPct / 100) : 0;
  const mktgPerJob = (sl.hasMktg && sl.closeRatePct > 0) ? sl.costPerLead / (sl.closeRatePct / 100) : 0;
  const prodMgrAmt = sl.hasProdMgr ? sellPrice * (sl.prodMgrPct / 100) : 0;
  const totalVarPerJob = commAmt + mktgPerJob + prodMgrAmt;

  const allInCost = directPerJob + totalVarPerJob;
  const allInProfit = sellPrice - allInCost;
  const allInMargin = sellPrice > 0 ? (allInProfit / sellPrice * 100) : 0;

  const matPerJob = sl.matPerUnit * sl.avgJobSize;
  const labPerJob = sl.labPerUnit * sl.avgJobSize;
  const othPerJob = sl.othPerUnit * sl.avgJobSize;
  const matPct = sellPrice > 0 ? (matPerJob / sellPrice * 100) : 0;
  const labPct = sellPrice > 0 ? (labPerJob / sellPrice * 100) : 0;
  const othPct = sellPrice > 0 ? (othPerJob / sellPrice * 100) : 0;

  return { directPerUnit, directPerJob, sellPrice, grossProfit, commAmt, mktgPerJob, prodMgrAmt, totalVarPerJob, allInCost, allInProfit, allInMargin, matPerJob, labPerJob, othPerJob, matPct, labPct, othPct };
}

function slRender() {
  const container = document.getElementById('sl-container');
  let html = '';
  serviceLines.forEach((sl, i) => {
    const c = slCalcLine(sl);
    const marginColor = c.allInMargin >= 30 ? 'var(--green)' : c.allInMargin >= 15 ? 'var(--amber)' : 'var(--red)';

    html += '<div class="sl-card">';
    // Header row
    html += '<div class="sl-header" onclick="slToggleExpand(' + i + ')">';
    html += '<div class="sl-h-name">' + sl.name + '</div>';
    html += '<div class="sl-h-stat"><small>Sell Price</small>' + fmt(c.sellPrice) + '</div>';
    html += '<div class="sl-h-stat"><small>Direct Cost</small>' + fmt(c.directPerJob) + '</div>';
    html += '<div class="sl-h-stat"><small>All-In Profit</small><span style="color:' + (c.allInProfit >= 0 ? 'var(--green)' : 'var(--red)') + '">' + fmt(c.allInProfit) + '</span></div>';
    html += '<div class="sl-h-stat"><small>All-In Margin</small><span style="color:' + marginColor + '">' + c.allInMargin.toFixed(1) + '%</span></div>';
    html += '<button class="sl-expand-btn" onclick="event.stopPropagation();slDel(' + i + ')" title="Delete">&times;</button>';
    html += '</div>';

    // Detail section
    html += '<div class="sl-detail ' + (sl.expanded ? 'open' : '') + '">';
    html += '<div class="sl-detail-grid">';

    // Column 1: Job Details
    html += '<div class="sl-fieldset">';
    html += '<div class="sl-fieldset-title">Job Details</div>';
    html += '<div class="sl-field"><label>Service Name</label><input type="text" value="' + sl.name + '" onchange="slUpd(' + i + ',\'name\',this.value)" style="width:140px;"></div>';
    html += '<div class="sl-field"><label>Unit Type</label><select onchange="slUpd(' + i + ',\'unitType\',this.value)">';
    ['per sqft','per square','per linear ft','per unit','per job'].forEach(u => {
      html += '<option' + (sl.unitType === u ? ' selected' : '') + '>' + u + '</option>';
    });
    html += '</select></div>';
    html += '<div class="sl-field"><label>Material / ' + sl.unitType + '</label><input type="number" value="' + sl.matPerUnit + '" step="0.5" onchange="slUpd(' + i + ',\'matPerUnit\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
    html += '<div class="sl-field"><label>Labour / ' + sl.unitType + '</label><input type="number" value="' + sl.labPerUnit + '" step="0.5" onchange="slUpd(' + i + ',\'labPerUnit\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
    html += '<div class="sl-field"><label>Other Direct / ' + sl.unitType + '</label><input type="number" value="' + sl.othPerUnit + '" step="0.5" onchange="slUpd(' + i + ',\'othPerUnit\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
    html += '<div class="sl-field"><label>Avg Job Size (' + sl.unitType.replace('per ','') + 's)</label><input type="number" value="' + sl.avgJobSize + '" step="1" onchange="slUpd(' + i + ',\'avgJobSize\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
    html += '<div class="sl-field"><label>Target Margin %</label><input type="number" value="' + sl.targetMarginPct + '" step="0.5" onchange="slUpd(' + i + ',\'targetMarginPct\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
    html += '<div style="margin-top:8px; padding-top:8px; border-top:1px solid var(--border); font-size:12px;">';
    html += '<div style="display:flex; justify-content:space-between;"><span>Cost / ' + sl.unitType + ':</span><strong>' + '$' + c.directPerUnit.toFixed(2) + '</strong></div>';
    html += '<div style="display:flex; justify-content:space-between; margin-top:6px; padding-top:6px; border-top:1px dashed var(--border);"><span>Material / Job:</span><strong>' + fmt(c.matPerJob) + ' <span style="color:var(--muted); font-weight:500;">(' + c.matPct.toFixed(1) + '% of price)</span></strong></div>';
    html += '<div style="display:flex; justify-content:space-between;"><span>Labour / Job:</span><strong>' + fmt(c.labPerJob) + ' <span style="color:var(--muted); font-weight:500;">(' + c.labPct.toFixed(1) + '% of price)</span></strong></div>';
    if (c.othPerJob > 0) { html += '<div style="display:flex; justify-content:space-between;"><span>Other / Job:</span><strong>' + fmt(c.othPerJob) + ' <span style="color:var(--muted); font-weight:500;">(' + c.othPct.toFixed(1) + '% of price)</span></strong></div>'; }
    html += '<div style="display:flex; justify-content:space-between; margin-top:4px; padding-top:4px; border-top:1px solid var(--border);"><span>Direct Cost / Job:</span><strong>' + fmt(c.directPerJob) + '</strong></div>';
    html += '<div style="display:flex; justify-content:space-between;"><span>Selling Price / Job:</span><strong style="color:var(--navy);">' + fmt(c.sellPrice) + '</strong></div>';
    html += '</div>';
    html += '</div>';

    // Column 2: Per-Job Cost Adjustments
    html += '<div class="sl-fieldset">';
    html += '<div class="sl-fieldset-title">Per-Job Cost Adjustments</div>';

    // Sales Commission
    html += '<div class="sl-toggle-row">';
    html += '<input type="checkbox" ' + (sl.hasComm ? 'checked' : '') + ' onchange="slToggle(' + i + ',\'hasComm\')">';
    html += '<label>Sales Commission</label>';
    html += '<input type="number" value="' + sl.commPct + '" step="0.5" ' + (sl.hasComm ? '' : 'disabled') + ' onchange="slUpd(' + i + ',\'commPct\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}" style="width:55px;">';
    html += '<span style="font-size:11px;">%</span>';
    html += '<span class="sl-toggle-val" style="color:' + (sl.hasComm ? 'var(--red)' : '#cbd5e1') + ';">' + fmt(c.commAmt) + '/job</span>';
    html += '</div>';

    // Marketing / Lead Cost
    html += '<div class="sl-toggle-row">';
    html += '<input type="checkbox" ' + (sl.hasMktg ? 'checked' : '') + ' onchange="slToggle(' + i + ',\'hasMktg\')">';
    html += '<label>Marketing / Lead Cost</label>';
    html += '</div>';
    if (sl.hasMktg) {
      html += '<div style="padding-left:24px; margin-bottom:6px;">';
      html += '<div class="sl-field" style="margin-bottom:4px;"><label style="font-size:11px;">Cost Per Lead $</label><input type="number" value="' + sl.costPerLead + '" step="5" onchange="slUpd(' + i + ',\'costPerLead\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}" style="width:80px;"></div>';
      html += '<div class="sl-field" style="margin-bottom:4px;"><label style="font-size:11px;">Close Rate %</label><input type="number" value="' + sl.closeRatePct + '" step="1" onchange="slUpd(' + i + ',\'closeRatePct\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}" style="width:80px;"></div>';
      html += '<div style="font-size:11px; color:var(--red); font-weight:600;">= ' + fmt(c.mktgPerJob) + ' marketing cost per closed job</div>';
      html += '</div>';
    }

    // Production Manager
    html += '<div class="sl-toggle-row">';
    html += '<input type="checkbox" ' + (sl.hasProdMgr ? 'checked' : '') + ' onchange="slToggle(' + i + ',\'hasProdMgr\')">';
    html += '<label>Production Manager</label>';
    html += '<input type="number" value="' + sl.prodMgrPct + '" step="0.5" ' + (sl.hasProdMgr ? '' : 'disabled') + ' onchange="slUpd(' + i + ',\'prodMgrPct\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}" style="width:55px;">';
    html += '<span style="font-size:11px;">%</span>';
    html += '<span class="sl-toggle-val" style="color:' + (sl.hasProdMgr ? 'var(--red)' : '#cbd5e1') + ';">' + fmt(c.prodMgrAmt) + '/job</span>';
    html += '</div>';

    // Summary of variable costs
    html += '<div style="margin-top:10px; padding-top:8px; border-top:1px solid var(--border); font-size:12px;">';
    html += '<div style="display:flex; justify-content:space-between;"><span>Commission:</span><span style="color:' + (sl.hasComm ? 'var(--red)' : '#cbd5e1') + ';">' + fmt(c.commAmt) + '</span></div>';
    html += '<div style="display:flex; justify-content:space-between;"><span>Marketing/Lead Cost:</span><span style="color:' + (sl.hasMktg ? 'var(--red)' : '#cbd5e1') + ';">' + fmt(c.mktgPerJob) + '</span></div>';
    html += '<div style="display:flex; justify-content:space-between;"><span>Production Mgr:</span><span style="color:' + (sl.hasProdMgr ? 'var(--red)' : '#cbd5e1') + ';">' + fmt(c.prodMgrAmt) + '</span></div>';
    html += '<div style="display:flex; justify-content:space-between; font-weight:700; margin-top:4px; padding-top:4px; border-top:1px solid var(--border);"><span>Total Variable / Job:</span><span style="color:var(--red);">' + fmt(c.totalVarPerJob) + '</span></div>';
    html += '</div>';
    html += '</div>';

    // Column 3: All-In Results
    html += '<div class="sl-fieldset" style="background: #f0f7ff;">';
    html += '<div class="sl-fieldset-title">All-In Per Job Results</div>';
    html += '<div style="text-align:center; padding: 8px 0;">';
    html += '<div style="font-size:10px; text-transform:uppercase; color:var(--muted);">Selling Price</div>';
    html += '<div style="font-size:24px; font-weight:800; color:var(--navy);">' + fmt(c.sellPrice) + '</div>';
    html += '</div>';
    html += '<div style="display:flex; justify-content:space-between; padding:4px 0; font-size:12px;"><span>Direct Costs:</span><strong>' + fmt(c.directPerJob) + '</strong></div>';
    html += '<div style="display:flex; justify-content:space-between; padding:4px 0; font-size:12px;"><span>+ Variable Costs:</span><strong>' + fmt(c.totalVarPerJob) + '</strong></div>';
    html += '<div style="display:flex; justify-content:space-between; padding:4px 0; font-size:12px; border-top:1px solid var(--border);"><span>= All-In Cost:</span><strong style="color:var(--red);">' + fmt(c.allInCost) + '</strong></div>';
    html += '<div style="display:flex; justify-content:space-between; padding:8px 0; font-size:14px; border-top:2px solid var(--navy); margin-top:4px;"><span style="font-weight:700;">All-In Profit:</span><strong style="font-size:18px; color:' + (c.allInProfit >= 0 ? 'var(--green)' : 'var(--red)') + ';">' + fmt(c.allInProfit) + '</strong></div>';
    html += '<div style="display:flex; justify-content:space-between; padding:4px 0; font-size:14px;"><span style="font-weight:700;">All-In Margin:</span><strong style="font-size:18px; color:' + marginColor + ';">' + c.allInMargin.toFixed(1) + '%</strong></div>';

    // How many to cover fixed costs?
    const fixedCosts = getFixedCosts();
    const targetProfit = numVal('goal-profit');
    const jobsToBreakEven = c.allInProfit > 0 ? Math.ceil(fixedCosts / c.allInProfit) : 999;
    const jobsToTarget = c.allInProfit > 0 ? Math.ceil((fixedCosts + targetProfit) / c.allInProfit) : 999;
    html += '<div style="margin-top:10px; padding:8px; background:rgba(31,78,121,0.08); border-radius:6px; font-size:11px;">';
    html += '<div style="font-weight:700; margin-bottom:4px; color:var(--navy);">If ONLY doing this service:</div>';
    html += '<div>' + jobsToBreakEven + ' jobs/mo to break even (' + fmt(jobsToBreakEven * c.sellPrice) + '/mo)</div>';
    html += '<div>' + jobsToTarget + ' jobs/mo to hit profit goal (' + fmt(jobsToTarget * c.sellPrice) + '/mo)</div>';
    html += '</div>';
    html += '</div>';

    html += '</div>'; // end detail-grid
    html += '</div>'; // end sl-detail
    html += '</div>'; // end sl-card
  });
  container.innerHTML = html;
}

function slUpd(i, field, val) {
  if (field === 'name' || field === 'unitType') {
    serviceLines[i][field] = val;
  } else {
    serviceLines[i][field] = parseFloat(val) || 0;
  }
  slRender(); mpRender();
}
function slToggle(i, field) {
  serviceLines[i][field] = !serviceLines[i][field];
  slRender(); mpRender();
}
function slToggleExpand(i) {
  serviceLines[i].expanded = !serviceLines[i].expanded;
  slRender();
}
function slDel(i) {
  serviceLines.splice(i, 1);
  const newMix = {};
  Object.keys(slJobsPerMonth).forEach(k => {
    const ki = parseInt(k);
    if (ki < i) newMix[ki] = slJobsPerMonth[ki];
    else if (ki > i) newMix[ki - 1] = slJobsPerMonth[ki];
  });
  slJobsPerMonth = newMix;
  slRender(); mpRender();
}
function slAdd() {
  serviceLines.push({
    name:'New Service', unitType:'per job', matPerUnit:2000, labPerUnit:1500, othPerUnit:300, avgJobSize:1, targetMarginPct:35,
    hasComm:true, commPct:10, hasMktg:true, costPerLead:100, closeRatePct:30, hasProdMgr:false, prodMgrPct:3, expanded:true
  });
  slRender(); mpRender();
}

// --- Lead Source Cost Calculator ---
let leadSources = [
  { name:'Google Ads', icon:'🔍', type:'paid',
    monthlySpend:3000, leadsPerMonth:25,
    bookingRatePct:0, useGlobalBooking:true, closeRatePct:0, useGlobalClose:true,
    bonusPerBookedLead:0, bonusPerSoldJob:0 },
  { name:'Facebook/Meta Ads', icon:'📘', type:'paid',
    monthlySpend:2000, leadsPerMonth:20,
    bookingRatePct:0, useGlobalBooking:true, closeRatePct:0, useGlobalClose:true,
    bonusPerBookedLead:0, bonusPerSoldJob:0 },
  { name:'Canvassing', icon:'🚪', type:'labour',
    hourlyRate:18, hoursPerDay:6, daysPerMonth:20,
    leadsBookedPerDay:2,
    bookingRatePct:0, useGlobalBooking:true, closeRatePct:0, useGlobalClose:true,
    bonusPerBookedLead:25, bonusPerSoldJob:100 },
  { name:'Home Shows', icon:'🏠', type:'show',
    boothCostPerShow:1500, showsPerMonth:2, leadsPerShow:30,
    staffPerShow:2, staffHoursPerShow:10, staffHourlyRate:18,
    bookingRatePct:0, useGlobalBooking:true, closeRatePct:0, useGlobalClose:true,
    bonusPerBookedLead:0, bonusPerSoldJob:50 },
  { name:'Referrals', icon:'🤝', type:'referral',
    rewardPerReferral:200, leadsPerMonth:5,
    bookingRatePct:0, useGlobalBooking:true, closeRatePct:0, useGlobalClose:true,
    bonusPerBookedLead:0, bonusPerSoldJob:0 }
];

function lsCalc(ls) {
  const globalBooking = numVal('ls-booking-rate');
  const globalClose = numVal('ls-close-rate');
  const bookingRate = (ls.useGlobalBooking ? globalBooking : ls.bookingRatePct) / 100;
  const closeRate = (ls.useGlobalClose ? globalClose : ls.closeRatePct) / 100;

  let monthlyCost = 0;
  let rawLeads = 0; // total raw leads generated

  if (ls.type === 'paid') {
    monthlyCost = ls.monthlySpend;
    rawLeads = ls.leadsPerMonth;
  } else if (ls.type === 'labour') {
    const totalHours = ls.hoursPerDay * ls.daysPerMonth;
    const basePay = totalHours * ls.hourlyRate;
    rawLeads = ls.leadsBookedPerDay * ls.daysPerMonth;
    const bookedAppts = rawLeads * bookingRate;
    const bookingBonuses = bookedAppts * ls.bonusPerBookedLead;
    const soldJobs = bookedAppts * closeRate;
    const soldBonuses = soldJobs * ls.bonusPerSoldJob;
    monthlyCost = basePay + bookingBonuses + soldBonuses;
  } else if (ls.type === 'show') {
    const boothCosts = ls.boothCostPerShow * ls.showsPerMonth;
    const staffCost = ls.staffPerShow * ls.staffHoursPerShow * ls.staffHourlyRate * ls.showsPerMonth;
    rawLeads = ls.leadsPerShow * ls.showsPerMonth;
    const bookedAppts = rawLeads * bookingRate;
    const soldJobs = bookedAppts * closeRate;
    const soldBonuses = soldJobs * ls.bonusPerSoldJob;
    const bookBonuses = bookedAppts * ls.bonusPerBookedLead;
    monthlyCost = boothCosts + staffCost + bookBonuses + soldBonuses;
  } else if (ls.type === 'referral') {
    rawLeads = ls.leadsPerMonth;
    const bookedAppts = rawLeads * bookingRate;
    const soldJobs = bookedAppts * closeRate;
    monthlyCost = (rawLeads * ls.rewardPerReferral) + (bookedAppts * ls.bonusPerBookedLead) + (soldJobs * ls.bonusPerSoldJob);
  }

  const bookedPerMonth = rawLeads * bookingRate;
  const soldJobsPerMonth = bookedPerMonth * closeRate;
  const costPerLead = rawLeads > 0 ? monthlyCost / rawLeads : 0;
  const costPerBookedAppt = bookedPerMonth > 0 ? monthlyCost / bookedPerMonth : 0;
  const costPerSoldJob = soldJobsPerMonth > 0 ? monthlyCost / soldJobsPerMonth : 0;

  return { monthlyCost, rawLeads, bookedPerMonth, costPerLead, costPerBookedAppt, soldJobsPerMonth, costPerSoldJob, bookingRate, closeRate };
}

function lsRender() {
  const container = document.getElementById('ls-container');
  let html = '';
  leadSources.forEach((ls, i) => {
    const c = lsCalc(ls);
    html += '<div class="ls-card">';
    html += '<div class="ls-card-hdr">' + ls.icon + ' <input type="text" value="' + ls.name + '" onchange="lsUpdName(' + i + ',this.value)" onclick="event.stopPropagation();" style="border:none; background:transparent; font-weight:700; font-size:13px; width:140px; padding:2px 4px; border-radius:4px; cursor:text;" onfocus="this.style.background=\'#fff\'; this.style.border=\'1px solid var(--border)\';" onblur="this.style.background=\'transparent\'; this.style.border=\'none\';">';
    html += '<span style="margin-left:auto; font-size:11px; font-weight:600; color:var(--muted);">' + fmt(c.costPerSoldJob) + '/sold job</span>';
    html += '<button style="border:none; background:none; cursor:pointer; font-size:14px; color:var(--muted);" onclick="event.stopPropagation();lsDel(' + i + ')" title="Delete">&times;</button>';
    html += '</div>';
    html += '<div class="ls-card-body">';

    // Fields by type
    if (ls.type === 'paid') {
      html += '<div class="ls-field"><label>Monthly Ad Spend</label><input type="number" value="' + ls.monthlySpend + '" step="100" onchange="lsUpd(' + i + ',\'monthlySpend\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
      html += '<div class="ls-field"><label>Leads / Month</label><input type="number" value="' + ls.leadsPerMonth + '" step="1" onchange="lsUpd(' + i + ',\'leadsPerMonth\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
    } else if (ls.type === 'labour') {
      html += '<div class="ls-field"><label>Hourly Rate $</label><input type="number" value="' + ls.hourlyRate + '" step="0.5" onchange="lsUpd(' + i + ',\'hourlyRate\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
      html += '<div class="ls-field"><label>Hours / Day</label><input type="number" value="' + ls.hoursPerDay + '" step="0.5" onchange="lsUpd(' + i + ',\'hoursPerDay\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
      html += '<div class="ls-field"><label>Days / Month</label><input type="number" value="' + ls.daysPerMonth + '" step="1" onchange="lsUpd(' + i + ',\'daysPerMonth\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
      html += '<div class="ls-field"><label>Leads Booked / Day</label><input type="number" value="' + ls.leadsBookedPerDay + '" step="0.5" onchange="lsUpd(' + i + ',\'leadsBookedPerDay\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
      html += '<div class="ls-field"><label>Bonus / Booked Lead $</label><input type="number" value="' + ls.bonusPerBookedLead + '" step="5" onchange="lsUpd(' + i + ',\'bonusPerBookedLead\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
      html += '<div class="ls-field"><label>Bonus / Sold Job $</label><input type="number" value="' + ls.bonusPerSoldJob + '" step="10" onchange="lsUpd(' + i + ',\'bonusPerSoldJob\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
    } else if (ls.type === 'show') {
      html += '<div class="ls-field"><label>Booth Cost / Show $</label><input type="number" value="' + ls.boothCostPerShow + '" step="50" onchange="lsUpd(' + i + ',\'boothCostPerShow\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
      html += '<div class="ls-field"><label>Shows / Month</label><input type="number" value="' + ls.showsPerMonth + '" step="1" onchange="lsUpd(' + i + ',\'showsPerMonth\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
      html += '<div class="ls-field"><label>Leads / Show</label><input type="number" value="' + ls.leadsPerShow + '" step="1" onchange="lsUpd(' + i + ',\'leadsPerShow\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
      html += '<div class="ls-field"><label>Staff / Show</label><input type="number" value="' + ls.staffPerShow + '" step="1" onchange="lsUpd(' + i + ',\'staffPerShow\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
      html += '<div class="ls-field"><label>Staff Hours / Show</label><input type="number" value="' + ls.staffHoursPerShow + '" step="0.5" onchange="lsUpd(' + i + ',\'staffHoursPerShow\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
      html += '<div class="ls-field"><label>Staff Hourly Rate $</label><input type="number" value="' + ls.staffHourlyRate + '" step="0.5" onchange="lsUpd(' + i + ',\'staffHourlyRate\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
      html += '<div class="ls-field"><label>Bonus / Booked Lead $</label><input type="number" value="' + ls.bonusPerBookedLead + '" step="5" onchange="lsUpd(' + i + ',\'bonusPerBookedLead\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
      html += '<div class="ls-field"><label>Bonus / Sold Job $</label><input type="number" value="' + ls.bonusPerSoldJob + '" step="10" onchange="lsUpd(' + i + ',\'bonusPerSoldJob\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
    } else if (ls.type === 'referral') {
      html += '<div class="ls-field"><label>Reward / Referral $</label><input type="number" value="' + ls.rewardPerReferral + '" step="10" onchange="lsUpd(' + i + ',\'rewardPerReferral\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
      html += '<div class="ls-field"><label>Leads / Month</label><input type="number" value="' + ls.leadsPerMonth + '" step="1" onchange="lsUpd(' + i + ',\'leadsPerMonth\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
      html += '<div class="ls-field"><label>Bonus / Booked Lead $</label><input type="number" value="' + ls.bonusPerBookedLead + '" step="5" onchange="lsUpd(' + i + ',\'bonusPerBookedLead\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
      html += '<div class="ls-field"><label>Bonus / Sold Job $</label><input type="number" value="' + ls.bonusPerSoldJob + '" step="10" onchange="lsUpd(' + i + ',\'bonusPerSoldJob\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
    }

    // Booking rate override
    html += '<div style="margin-top:8px; padding-top:8px; border-top:1px dashed var(--border);">';
    html += '<div class="ls-field"><label style="font-size:10px;">Use global booking rate</label>';
    html += '<input type="checkbox" ' + (ls.useGlobalBooking ? 'checked' : '') + ' onchange="lsToggleBooking(' + i + ')" style="width:16px; height:16px; accent-color:var(--navy); cursor:pointer;">';
    html += '</div>';
    if (!ls.useGlobalBooking) {
      html += '<div class="ls-field"><label style="font-size:10px;">Custom Booking Rate %</label><input type="number" value="' + ls.bookingRatePct + '" step="1" onchange="lsUpd(' + i + ',\'bookingRatePct\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}" style="width:65px;"></div>';
    }

    // Close rate override
    html += '<div class="ls-field" style="margin-top:4px;"><label style="font-size:10px;">Use global close rate</label>';
    html += '<input type="checkbox" ' + (ls.useGlobalClose ? 'checked' : '') + ' onchange="lsToggleClose(' + i + ')" style="width:16px; height:16px; accent-color:var(--navy); cursor:pointer;">';
    html += '</div>';
    if (!ls.useGlobalClose) {
      html += '<div class="ls-field"><label style="font-size:10px;">Custom Close Rate %</label><input type="number" value="' + ls.closeRatePct + '" step="1" onchange="lsUpd(' + i + ',\'closeRatePct\',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}" style="width:65px;"></div>';
    }
    html += '</div>';

    // Results - full funnel
    html += '<div class="ls-result">';
    html += '<div class="ls-result-row"><span>Monthly Total Cost:</span><strong style="color:var(--red);">' + fmt(c.monthlyCost) + '</strong></div>';
    html += '<div class="ls-result-row"><span>Raw Leads / Month:</span><strong>' + c.rawLeads.toFixed(0) + '</strong></div>';
    html += '<div class="ls-result-row"><span>Cost / Lead:</span><strong>' + fmt(c.costPerLead) + '</strong></div>';
    html += '<div class="ls-result-row"><span>Booking Rate:</span><strong>' + (c.bookingRate * 100).toFixed(0) + '%</strong></div>';
    html += '<div class="ls-result-row"><span>Booked Appts / Month:</span><strong style="color:var(--amber);">' + c.bookedPerMonth.toFixed(1) + '</strong></div>';
    html += '<div class="ls-result-row"><span>Cost / Booked Appt:</span><strong>' + fmt(c.costPerBookedAppt) + '</strong></div>';
    html += '<div class="ls-result-row"><span>Close Rate:</span><strong>' + (c.closeRate * 100).toFixed(0) + '%</strong></div>';
    html += '<div class="ls-result-row"><span>Sold Jobs / Month:</span><strong style="color:var(--green);">' + c.soldJobsPerMonth.toFixed(1) + '</strong></div>';
    html += '<div class="ls-result-row ls-highlight"><span>Cost / Sold Job:</span><strong style="color:var(--navy);">' + fmt(c.costPerSoldJob) + '</strong></div>';
    html += '</div>';

    html += '</div>'; // end body
    html += '</div>'; // end card
  });
  container.innerHTML = html;
  lsRenderCompare();
}

function lsRenderCompare() {
  const results = leadSources.map((ls, i) => {
    const c = lsCalc(ls);
    return { name: ls.icon + ' ' + ls.name, costPerSoldJob: c.costPerSoldJob, costPerLead: c.costPerLead, costPerBookedAppt: c.costPerBookedAppt, rawLeads: c.rawLeads, bookedAppts: c.bookedPerMonth, soldJobs: c.soldJobsPerMonth, monthlyCost: c.monthlyCost, bookingRate: c.bookingRate, closeRate: c.closeRate };
  }).filter(r => r.soldJobs > 0).sort((a, b) => a.costPerSoldJob - b.costPerSoldJob);

  let html = '';
  results.forEach((r, idx) => {
    const isBest = idx === 0;
    html += '<div class="ls-rank' + (isBest ? ' ls-best' : '') + '">';
    if (isBest) html += '<div class="ls-rank-badge">BEST VALUE</div>';
    html += '<div class="ls-rank-name">' + r.name + '</div>';
    html += '<div class="ls-rank-val" style="color:' + (isBest ? 'var(--green)' : 'var(--navy)') + ';">' + fmt(r.costPerSoldJob) + '</div>';
    html += '<div class="ls-rank-sub">per sold job</div>';
    html += '<div class="ls-rank-sub" style="margin-top:4px;">' + r.rawLeads.toFixed(0) + ' leads → ' + r.bookedAppts.toFixed(1) + ' booked → ' + r.soldJobs.toFixed(1) + ' sold</div>';
    html += '<div class="ls-rank-sub">' + fmt(r.costPerLead) + '/lead &bull; ' + fmt(r.costPerBookedAppt) + '/appt</div>';
    html += '<div class="ls-rank-sub">' + fmt(r.monthlyCost) + '/mo total</div>';
    html += '</div>';
  });
  document.getElementById('ls-compare').innerHTML = html;
}

function lsUpd(i, field, val) {
  leadSources[i][field] = parseFloat(val) || 0;
  lsRender();
}
function lsUpdName(i, val) {
  leadSources[i].name = val;
  lsRenderCompare(); // only update comparison, don't re-render cards (would lose focus)
}
function lsToggleBooking(i) {
  leadSources[i].useGlobalBooking = !leadSources[i].useGlobalBooking;
  lsRender();
}
function lsToggleClose(i) {
  leadSources[i].useGlobalClose = !leadSources[i].useGlobalClose;
  lsRender();
}
function lsDel(i) {
  leadSources.splice(i, 1);
  lsRender();
}
function lsAdd() {
  const types = [
    { label:'Paid Ads (Google, Facebook, etc.)', type:'paid' },
    { label:'Canvassing / Door Knocking', type:'labour' },
    { label:'Home Show / Trade Show', type:'show' },
    { label:'Referral Program', type:'referral' }
  ];
  let msg = 'Choose lead source type:\\n';
  types.forEach((t, i) => msg += (i + 1) + '. ' + t.label + '\\n');
  const pick = prompt(msg, '1');
  const idx = parseInt(pick) - 1;
  if (idx < 0 || idx >= types.length) return;
  const t = types[idx].type;

  if (t === 'paid') {
    leadSources.push({ name:'New Ad Channel', icon:'📢', type:'paid', monthlySpend:1000, leadsPerMonth:10, bookingRatePct:0, useGlobalBooking:true, closeRatePct:0, useGlobalClose:true, bonusPerBookedLead:0, bonusPerSoldJob:0 });
  } else if (t === 'labour') {
    leadSources.push({ name:'New Canvasser', icon:'🚪', type:'labour', hourlyRate:18, hoursPerDay:6, daysPerMonth:20, leadsBookedPerDay:2, bookingRatePct:0, useGlobalBooking:true, closeRatePct:0, useGlobalClose:true, bonusPerBookedLead:25, bonusPerSoldJob:50 });
  } else if (t === 'show') {
    leadSources.push({ name:'New Show', icon:'🏠', type:'show', boothCostPerShow:1000, showsPerMonth:1, leadsPerShow:20, staffPerShow:2, staffHoursPerShow:8, staffHourlyRate:18, bookingRatePct:0, useGlobalBooking:true, closeRatePct:0, useGlobalClose:true, bonusPerBookedLead:0, bonusPerSoldJob:0 });
  } else if (t === 'referral') {
    leadSources.push({ name:'New Referral', icon:'🤝', type:'referral', rewardPerReferral:100, leadsPerMonth:3, bookingRatePct:0, useGlobalBooking:true, closeRatePct:0, useGlobalClose:true, bonusPerBookedLead:0, bonusPerSoldJob:0 });
  }
  lsRender();
}

// --- Monthly Revenue Planner ---
function mpRender() {
  const container = document.getElementById('mp-rows');
  let html = '';
  serviceLines.forEach((sl, i) => {
    const c = slCalcLine(sl);
    const count = slJobsPerMonth[i] || 0;
    const rev = count * c.sellPrice;
    const direct = count * c.directPerJob;
    const varCost = count * c.totalVarPerJob;
    const profit = count * c.allInProfit;
    const margin = rev > 0 ? (profit / rev * 100) : 0;
    const marginColor = margin >= 25 ? 'var(--green)' : margin >= 10 ? 'var(--amber)' : 'var(--red)';

    html += '<div class="mp-row">';
    html += '<div class="mp-name">' + sl.name + '</div>';
    html += '<div><input type="number" value="' + count + '" min="0" step="1" onchange="mpUpd(' + i + ',this.value)" onkeydown="if(event.key===\'Enter\'){this.blur();}"></div>';
    html += '<div>' + fmt(rev) + '</div>';
    html += '<div style="color:var(--red);">' + fmt(direct) + '</div>';
    html += '<div style="color:var(--amber);">' + fmt(varCost) + '</div>';
    html += '<div style="color:' + (profit >= 0 ? 'var(--green)' : 'var(--red)') + ';">' + fmt(profit) + '</div>';
    html += '<div style="color:' + marginColor + ';">' + margin.toFixed(1) + '%</div>';
    html += '</div>';
  });
  container.innerHTML = html;
  mpCalc();
}

function mpUpd(i, val) {
  slJobsPerMonth[i] = parseInt(val) || 0;
  mpRender();
}

function mpCalc() {
  let totJobs = 0, totRev = 0, totDirect = 0, totVar = 0, totProfit = 0;
  serviceLines.forEach((sl, i) => {
    const c = slCalcLine(sl);
    const count = slJobsPerMonth[i] || 0;
    totJobs += count;
    totRev += count * c.sellPrice;
    totDirect += count * c.directPerJob;
    totVar += count * c.totalVarPerJob;
    totProfit += count * c.allInProfit;
  });
  const totMargin = totRev > 0 ? (totProfit / totRev * 100) : 0;
  const fixed = getFixedCosts();
  const target = numVal('goal-profit');
  const netProfit = totProfit - fixed;
  const gap = netProfit - target;

  // Top strip
  document.getElementById('mp-rev').textContent = fmt(totRev);
  document.getElementById('mp-cost').textContent = fmt(totDirect + totVar);
  document.getElementById('mp-gp').textContent = fmt(totProfit);
  document.getElementById('mp-gp').style.color = totProfit >= 0 ? 'var(--green)' : 'var(--red)';
  document.getElementById('mp-net').textContent = fmt(netProfit);
  document.getElementById('mp-net').style.color = netProfit >= 0 ? 'var(--green)' : 'var(--red)';
  document.getElementById('mp-jobs').textContent = totJobs;

  // Totals row
  document.getElementById('mp-t-jobs').textContent = totJobs;
  document.getElementById('mp-t-rev').textContent = fmt(totRev);
  document.getElementById('mp-t-direct').textContent = fmt(totDirect);
  document.getElementById('mp-t-var').textContent = fmt(totVar);
  document.getElementById('mp-t-profit').textContent = fmt(totProfit);
  document.getElementById('mp-t-profit').style.color = totProfit >= 0 ? 'var(--green)' : 'var(--red)';
  document.getElementById('mp-t-margin').textContent = totMargin.toFixed(1) + '%';
  document.getElementById('mp-t-margin').style.color = totMargin >= 25 ? 'var(--green)' : totMargin >= 10 ? 'var(--amber)' : 'var(--red)';

  // Goal box
  document.getElementById('mpg-gp').textContent = fmt(totProfit);
  document.getElementById('mpg-fixed').textContent = fmt(fixed);
  document.getElementById('mpg-net').textContent = fmt(netProfit);
  document.getElementById('mpg-net').style.color = netProfit >= 0 ? '#86efac' : '#fca5a5';
  document.getElementById('mpg-target').textContent = fmt(target);
  document.getElementById('mpg-gap').textContent = (gap >= 0 ? '+' : '') + fmt(gap);
  document.getElementById('mpg-gap').style.color = gap >= 0 ? '#86efac' : '#fca5a5';

  // Gauge: progress toward target profit
  const goalTotal = fixed + target;
  const pct = goalTotal > 0 ? Math.min((totProfit / goalTotal) * 100, 150) : 0;
  const gaugeEl = document.getElementById('mpg-gauge');
  gaugeEl.style.width = Math.max(pct, 0) + '%';
  gaugeEl.textContent = pct.toFixed(0) + '%';
  if (pct >= 100) gaugeEl.style.background = 'linear-gradient(90deg, #22c55e, #16a34a)';
  else if (pct >= 70) gaugeEl.style.background = 'linear-gradient(90deg, #f59e0b, #d97706)';
  else gaugeEl.style.background = 'linear-gradient(90deg, #dc2626, #f87171)';
}

// =====================================================
// SAVE / LOAD / EXPORT / IMPORT
// =====================================================
const SAVE_KEY = 'cc_dashboard_v1';

function collectInputs() {
  const inputs = {};
  document.querySelectorAll('input[id], select[id], textarea[id]').forEach(el => {
    if (el.id === 'import-file-input') return; // skip file picker
    if (el.type === 'checkbox') inputs[el.id] = el.checked;
    else inputs[el.id] = el.value;
  });
  return inputs;
}

function applyInputs(inputs) {
  if (!inputs) return;
  Object.entries(inputs).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el || el.id === 'import-file-input') return;
    if (el.type === 'checkbox') el.checked = val;
    else el.value = val;
  });
}

function buildState() {
  return {
    v: 1,
    savedAt: new Date().toISOString(),
    inputs: collectInputs(),
    serviceLines: JSON.parse(JSON.stringify(serviceLines)),
    slJobsPerMonth: JSON.parse(JSON.stringify(slJobsPerMonth)),
    leadSources: JSON.parse(JSON.stringify(leadSources)),
    budgetStore: JSON.parse(JSON.stringify(budgetStore)),
    expOh: expOh.map(e => e.on),
    expDebt: expDebt.map(e => e.on)
  };
}

function applyState(state) {
  if (!state || state.v !== 1) return false;
  if (state.serviceLines) serviceLines = state.serviceLines;
  if (state.slJobsPerMonth) slJobsPerMonth = state.slJobsPerMonth;
  if (state.leadSources) leadSources = state.leadSources;
  if (state.budgetStore) budgetStore = state.budgetStore;
  if (state.expOh) state.expOh.forEach((on, i) => { if (expOh[i]) expOh[i].on = on; });
  if (state.expDebt) state.expDebt.forEach((on, i) => { if (expDebt[i]) expDebt[i].on = on; });
  if (state.inputs) applyInputs(state.inputs);
  return true;
}

function saveData() {
  try {
    const state = buildState();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    const d = new Date(state.savedAt);
    document.getElementById('last-saved-txt').textContent = 'Saved ' + d.toLocaleDateString('en-CA') + ' at ' + d.toLocaleTimeString('en-CA', { hour:'2-digit', minute:'2-digit' });
    const btn = document.getElementById('save-btn');
    btn.textContent = '✓ Saved!';
    btn.style.background = '#15803d';
    setTimeout(() => { btn.innerHTML = '💾 Save'; btn.style.background = ''; }, 2000);
  } catch(e) {
    alert('Save failed — your browser may have storage disabled.\n\nUse Export instead to download a backup file.');
  }
}

function loadSaved() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (!state || state.v !== 1) return null;
    return state;
  } catch(e) {
    return null;
  }
}

function exportData() {
  try {
    const state = buildState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'CC_Dashboard_Backup_' + new Date().toISOString().slice(0, 10) + '.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  } catch(e) {
    alert('Export failed: ' + e.message);
  }
}

function importTrigger() {
  document.getElementById('import-file-input').click();
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const state = JSON.parse(ev.target.result);
      if (!applyState(state)) { alert('Invalid backup file — could not restore.'); return; }
      // Re-render everything with restored data
      renderBudgetTable();
      expRender();
      goalCalc();
      slRender();
      lsRender();
      mpRender();
      // Update last-saved label
      if (state.savedAt) {
        const d = new Date(state.savedAt);
        document.getElementById('last-saved-txt').textContent = 'Imported backup from ' + d.toLocaleDateString('en-CA');
      }
      alert('✅ Dashboard restored from backup!');
    } catch(err) {
      alert('Import failed: ' + err.message);
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // allow re-importing same file
}

// =====================================================
// Initialize
// =====================================================
renderBudgetTable();
const _saved = loadSaved();
if (_saved) {
  // Restore saved state — arrays must be set before renders, DOM inputs after
  if (_saved.serviceLines) serviceLines = _saved.serviceLines;
  if (_saved.slJobsPerMonth) slJobsPerMonth = _saved.slJobsPerMonth;
  if (_saved.leadSources) leadSources = _saved.leadSources;
  if (_saved.budgetStore) budgetStore = _saved.budgetStore;
  if (_saved.expOh) _saved.expOh.forEach((on, i) => { if (expOh[i]) expOh[i].on = on; });
  if (_saved.expDebt) _saved.expDebt.forEach((on, i) => { if (expDebt[i]) expDebt[i].on = on; });
} else {
  scPreset('current'); // only apply defaults if nothing was saved
}
expRender();
goalCalc();
slRender();
lsRender();
mpRender();
// Apply static DOM inputs AFTER renders (renders may also write to DOM)
if (_saved && _saved.inputs) applyInputs(_saved.inputs);
// Update last-saved display
if (_saved && _saved.savedAt) {
  const _d = new Date(_saved.savedAt);
  document.getElementById('last-saved-txt').textContent = 'Last saved ' + _d.toLocaleDateString('en-CA') + ' at ' + _d.toLocaleTimeString('en-CA', { hour:'2-digit', minute:'2-digit' });
}
