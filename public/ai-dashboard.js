// =====================================================
// AI ADVISOR — Data extraction and highlight functions
// Loaded separately from dashboard.js so dashboard.js
// stays untouched and this file stays small/manageable.
// =====================================================

window.getDashboardData = function() {
  var revenueMo = parseFloat(document.getElementById('revenue-mo') && document.getElementById('revenue-mo').value) || 0;
  var varItems = [];
  document.querySelectorAll('[data-group="variable"]').forEach(function(inp, i) {
    if (varData && varData[i]) varItems.push({ name: varData[i][0], monthly: parseFloat(inp.value) || 0 });
  });
  var ohItems = [];
  document.querySelectorAll('[data-group="overhead"]').forEach(function(inp, i) {
    if (ohData && ohData[i]) ohItems.push({ name: ohData[i][0], monthly: parseFloat(inp.value) || 0 });
  });
  var debtItems = [];
  document.querySelectorAll('[data-group="debt"]').forEach(function(inp, i) {
    if (debtData && debtData[i]) debtItems.push({ name: debtData[i][0], monthly: parseFloat(inp.value) || 0 });
  });
  var varTotal = varItems.reduce(function(s,i){ return s+i.monthly; }, 0);
  var ohTotal = ohItems.reduce(function(s,i){ return s+i.monthly; }, 0);
  var debtTotal = debtItems.reduce(function(s,i){ return s+i.monthly; }, 0);
  var cmDollar = revenueMo - varTotal;
  var cmPct = revenueMo > 0 ? cmDollar / revenueMo : 0;
  var fixedTotal = ohTotal + debtTotal;
  var beMonthly = cmPct > 0 ? fixedTotal / cmPct : 0;
  var surplus = revenueMo - beMonthly;
  var slAnalysis = (typeof serviceLines !== 'undefined' ? serviceLines : []).map(function(sl, i) {
    var calc = (typeof slCalcLine === 'function') ? slCalcLine(sl) : { sellPrice: 0, allInMargin: 0 };
    var jobsPerMo = (typeof slJobsPerMonth !== 'undefined' && slJobsPerMonth[i]) ? slJobsPerMonth[i] : 0;
    return {
      name: sl.name,
      sellPrice: Math.round(calc.sellPrice || 0),
      allInMarginPct: Math.round((calc.allInMargin || 0) * 10) / 10,
      targetMarginPct: sl.targetMarginPct || 0,
      jobsPerMonth: jobsPerMo,
      monthlyRevenue: Math.round((calc.sellPrice || 0) * jobsPerMo),
      costPerLead: sl.costPerLead || 0,
      closeRatePct: sl.closeRatePct || 0
    };
  });
  var lsAnalysis = (typeof leadSources !== 'undefined' ? leadSources : []).map(function(ls) {
    var calc = (typeof lsCalc === 'function') ? lsCalc(ls) : { cpsj: 0, leadsPerMo: 0 };
    return {
      name: ls.name, type: ls.type || '', spend: ls.spend || 0,
      cpsj: Math.round(calc.cpsj || 0), leadsPerMo: calc.leadsPerMo || 0
    };
  });
  return {
    businessContext: 'Custom Contracting Inc — Home services (roofing, eavestrough, siding, windows, doors) in Ontario, Canada.',
    breakEven: {
      revenueMo: Math.round(revenueMo),
      breakEvenMo: Math.round(beMonthly),
      surplusMo: Math.round(surplus),
      cmPct: Math.round(cmPct * 1000) / 10,
      cmDollarMo: Math.round(cmDollar),
      variableCostsMo: Math.round(varTotal),
      overheadMo: Math.round(ohTotal),
      debtServiceMo: Math.round(debtTotal),
      fixedCostsMo: Math.round(fixedTotal),
      variableItems: varItems,
      overheadItems: ohItems,
      debtItems: debtItems
    },
    serviceLines: slAnalysis,
    leadSources: lsAnalysis
  };
};

window.applyAIHighlights = function(highlights) {
  document.querySelectorAll('.ai-hl-badge').forEach(function(el) { el.remove(); });
  if (!document.getElementById('ai-hl-styles')) {
    var style = document.createElement('style');
    style.id = 'ai-hl-styles';
    style.textContent = [
      '.ai-hl-badge{display:block;padding:6px 10px;border-radius:6px;font-size:11px;font-weight:600;margin-top:6px;line-height:1.4;animation:ai-pop 0.3s ease}',
      '.ai-hl-badge.ai-red{background:#fef2f2;color:#dc2626;border-left:3px solid #ef4444}',
      '.ai-hl-badge.ai-yellow{background:#fffbeb;color:#d97706;border-left:3px solid #f59e0b}',
      '.ai-hl-badge.ai-green{background:#f0fdf4;color:#16a34a;border-left:3px solid #22c55e}',
      '@keyframes ai-pop{0%{opacity:0;transform:translateY(-4px)}100%{opacity:1;transform:translateY(0)}}'
    ].join('');
    document.head.appendChild(style);
  }
  var insertAfter = {
    'break-even': document.getElementById('hero-surplus') && document.getElementById('hero-surplus').closest('.hero-card'),
    'scenario': document.getElementById('s2-surplus') && document.getElementById('s2-surplus').closest('.sc-rcard'),
    'service-lines': document.getElementById('sl-container'),
    'budget': document.getElementById('bud-ytd-var') && document.getElementById('bud-ytd-var').closest('.bh-card')
  };
  var bySection = {};
  highlights.forEach(function(h) {
    var sec = h.section || 'break-even';
    if (!bySection[sec]) bySection[sec] = [];
    bySection[sec].push(h);
  });
  Object.keys(bySection).forEach(function(section) {
    var container = insertAfter[section];
    if (!container) return;
    bySection[section].forEach(function(h) {
      var icon = h.status === 'red' ? '⚠️ ' : h.status === 'yellow' ? '⚡ ' : '✅ ';
      var badge = document.createElement('div');
      badge.className = 'ai-hl-badge ai-' + h.status;
      badge.innerHTML = '<strong>' + icon + h.metric + ':</strong> ' + h.message;
      badge.title = '💡 Action: ' + h.action;
      container.appendChild(badge);
    });
  });
};
