'use client';

import Script from 'next/script';

// Dashboard body HTML — rendered as-is to preserve all inline event handlers
// (onclick, onchange etc.) which call functions from public/dashboard.js
const DASHBOARD_HTML = String.raw`

<div class="top-bar">
  <div>
    <h1>Custom Contracting Inc</h1>
    <div class="sub">Financial Command Center &nbsp;|&nbsp; Oct 2024 – Sep 2025 &nbsp;|&nbsp; All Costs Bank-Verified</div>
  </div>
  <div class="save-cluster">
    <div style="display:flex; flex-direction:column; align-items:flex-end; gap:3px;">
      <div style="display:flex; gap:6px; align-items:center;">
        <button class="btn-io" onclick="importTrigger()" title="Load from a backup JSON file">📥 Import</button>
        <button class="btn-io" onclick="exportData()" title="Download backup JSON file">📤 Export</button>
        <button class="btn-save" id="save-btn" onclick="saveData()" title="Save all data to this browser (persists through reloads)">💾 Save</button>
      </div>
      <div class="last-saved-txt" id="last-saved-txt">No save found — click Save to keep your data</div>
    </div>
  </div>
</div>
<input type="file" id="import-file-input" accept=".json" style="display:none;" onchange="importData(event)">

<!-- TAB BAR -->
<div class="tab-bar">
  <button class="tab-btn active" onclick="showTab('break-even',this)">📊 Break-Even</button>
  <button class="tab-btn" onclick="showTab('scenarios',this)">🔬 Scenario Planner</button>
  <button class="tab-btn" onclick="showTab('budget',this)">📅 Budget vs Actual</button>
  <button class="tab-btn" onclick="showTab('margins',this)">🧮 Service Line Planner</button>
</div>

<!-- ============================================================ -->
<!-- TAB 1: BREAK-EVEN (original) -->
<!-- ============================================================ -->
<div id="page-break-even" class="tab-page active">

<div class="instructions">
  <strong>How to use:</strong> Click any <span style="color:blue; font-weight:700;">blue monthly number</span> to change it. Annual, percentages, break-even, and surplus all update instantly. Press <strong>Tab</strong> to jump to the next field.
</div>

<div class="hero">
  <div class="hero-card">
    <div class="label">Break-Even / Month</div>
    <div class="value val-navy" id="hero-be">$208,900</div>
    <div class="monthly">Annual: <span id="hero-be-yr">$2,506,802</span></div>
  </div>
  <div class="hero-card">
    <div class="label">Current Revenue / Month</div>
    <div class="value val-green" id="hero-rev">$189,266</div>
    <div class="monthly">Annual: <span id="hero-rev-yr">$2,271,193</span></div>
  </div>
  <div class="hero-card">
    <div class="label">Monthly Surplus / (Shortfall)</div>
    <div class="value" id="hero-surplus">($19,634)</div>
    <div class="monthly" id="hero-surplus-note">Below break-even</div>
  </div>
</div>

<div class="gauge-row">
  <div class="gauge-card">
    <h3>Revenue vs Break-Even</h3>
    <div class="bar-wrap">
      <div class="bar-fill red" id="bar-rev" style="width:90%">90.6%</div>
    </div>
    <div class="bar-labels"><span>$0</span><span id="bar-rev-label">Break-Even: $208,900/mo</span></div>
  </div>
  <div class="gauge-card">
    <h3>Cost Structure (% of Revenue)</h3>
    <div style="display:flex; gap:2px; height:28px; border-radius:8px; overflow:hidden;">
      <div id="cost-var-bar" style="background:#3b82f6; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:700;">Variable 65.1%</div>
      <div id="cost-oh-bar" style="background:#f59e0b; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:700;">Overhead 28.4%</div>
      <div id="cost-debt-bar" style="background:#ef4444; display:flex; align-items:center; justify-content:center; color:white; font-size:10px; font-weight:700;">Debt 10.2%</div>
    </div>
    <div class="bar-labels"><span>Variable</span><span>Overhead</span><span>Debt & Finance</span></div>
  </div>
</div>

<div style="padding: 0 32px 16px;">
  <div class="cm-section">
    <h3>Contribution Margin Summary</h3>
    <div class="cm-grid">
      <div class="cm-item"><div class="cm-label">CM %</div><div class="cm-val" id="cm-pct">34.9%</div></div>
      <div class="cm-item"><div class="cm-label">CM $ / Month</div><div class="cm-val" id="cm-mo">$66,065</div></div>
      <div class="cm-item"><div class="cm-label">Fixed Costs / Month</div><div class="cm-val" id="fixed-mo" style="color:#dc2626;">$72,918</div></div>
      <div class="cm-item"><div class="cm-label">Gap / Month</div><div class="cm-val" id="gap-mo">($6,853)</div></div>
    </div>
  </div>
</div>

<div class="main">
  <div class="section">
    <div class="section-hdr"><span>Revenue</span><span class="total">/mo: <span id="rev-total-mo">$189,266</span></span></div>
    <table>
      <tr><th>Item</th><th class="mo-hdr">Monthly ✏️</th><th>Annual</th><th>% Rev</th></tr>
      <tr>
        <td>Total Revenue</td>
        <td><input class="editable" id="revenue-mo" value="189266.08" data-group="revenue"></td>
        <td id="rev-yr">$2,271,193</td>
        <td>100.0%</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <div class="section-hdr"><span>Variable Costs</span><span class="total">/mo: <span id="var-total-mo">$123,201</span></span></div>
    <table>
      <tr><th>Item</th><th class="mo-hdr">Monthly ✏️</th><th>Annual</th><th>% Rev</th></tr>
      <tbody id="var-body"></tbody>
      <tr class="total-row"><td>Total Variable</td><td id="var-sum-mo"></td><td id="var-sum-yr"></td><td id="var-pct"></td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-hdr"><span>Fixed Costs — Overhead</span><span class="total">/mo: <span id="oh-total-mo">$53,694</span></span></div>
    <table>
      <tr><th>Item</th><th class="mo-hdr">Monthly ✏️</th><th>Annual</th><th>% Rev</th></tr>
      <tbody id="oh-body"></tbody>
      <tr class="total-row"><td>Total Overhead</td><td id="oh-sum-mo"></td><td id="oh-sum-yr"></td><td id="oh-pct"></td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-hdr"><span>Fixed Costs — Debt & Finance</span><span class="total">/mo: <span id="debt-total-mo">$19,224</span></span></div>
    <table>
      <tr><th>Item</th><th class="mo-hdr">Monthly ✏️</th><th>Annual</th><th>% Rev</th></tr>
      <tbody id="debt-body"></tbody>
      <tr class="total-row"><td>Total Debt & Finance</td><td id="debt-sum-mo"></td><td id="debt-sum-yr"></td><td id="debt-pct"></td></tr>
    </table>
  </div>
</div>
</div>

<!-- ============================================================ -->
<!-- TAB 2: SCENARIO PLANNER V2 -->
<!-- ============================================================ -->
<div id="page-scenarios" class="tab-page">

<div class="instructions">
  <strong>Business Model Builder:</strong> Enter your <span style="color:blue; font-weight:700;">ideal costs</span>, build your sales pipeline, model your rep compensation, and plan your fleet. Every number you change recalculates your break-even instantly. Use sliders OR type directly — both work.
</div>

<div class="sc-wrap">

  <!-- QUICK PRESETS -->
  <div class="preset-bar">
    <button class="preset-pill active" onclick="scPreset('current',this)">📍 Current State</button>
    <button class="preset-pill" onclick="scPreset('direct',this)">🔨 Direct-Cost Jobs Only</button>
    <button class="preset-pill" onclick="scPreset('growth',this)">🚀 Push Ads + Growth</button>
    <button class="preset-pill" onclick="scPreset('lean',this)">✂️ Slash Overhead</button>
    <button class="preset-pill" onclick="scPreset('scale',this)">📈 Scale with Reps + Trucks</button>
    <button class="preset-pill" onclick="scPreset('reset',this)" style="margin-left:auto; border-color:var(--red); color:var(--red);">↺ Reset All</button>
  </div>

  <!-- RESULT STRIP (always visible) -->
  <div class="sc-result-strip">
    <div class="sc-rcard"><div class="rc-label">Scenario Revenue</div><div class="rc-val val-navy" id="s2-rev">$189,266</div><div class="rc-delta" id="s2-rev-d">&nbsp;</div></div>
    <div class="sc-rcard"><div class="rc-label">CM %</div><div class="rc-val val-navy" id="s2-cm">34.9%</div><div class="rc-delta" id="s2-cm-d">&nbsp;</div></div>
    <div class="sc-rcard"><div class="rc-label">Break-Even / Mo</div><div class="rc-val val-navy" id="s2-be">$208,900</div><div class="rc-delta" id="s2-be-d">&nbsp;</div></div>
    <div class="sc-rcard"><div class="rc-label">Surplus / (Shortfall)</div><div class="rc-val" id="s2-surplus">($19,634)</div><div class="rc-delta" id="s2-surplus-d">&nbsp;</div></div>
    <div class="sc-rcard"><div class="rc-label">Net Profit / Mo</div><div class="rc-val" id="s2-net">($19,634)</div><div class="rc-delta" id="s2-net-d">&nbsp;</div></div>
  </div>

  <!-- SECTION 1: JOB COSTING -->
  <div class="sc-section">
    <div class="sc-hdr"><span class="sc-icon">🔨</span> Job Costing — Direct Costs</div>
    <div class="sc-body">
      <p style="font-size:12px; color:var(--muted); margin-bottom:16px;">Set your ideal material %, labour %, and subcontractor costs. Type a dollar amount OR a percentage of revenue.</p>
      <div class="sc-grid">
        <div class="sc-field">
          <label>Materials Cost / Month</label>
          <div class="field-row">
            <span class="unit">$</span>
            <input type="number" id="sc-mat-dollar" value="48500" oninput="scFromDollar('mat')">
          </div>
          <div class="field-row" style="margin-top:6px;">
            <input type="range" min="0" max="60" value="25.6" step="0.5" id="sc-mat-slider" oninput="scFromSlider('mat')">
          </div>
          <div class="field-row" style="margin-top:2px;">
            <span class="unit" style="min-width:50px;">% of Rev:</span>
            <input type="number" id="sc-mat-pct" value="25.6" step="0.5" style="width:80px;" oninput="scFromPct('mat')">
            <span class="unit">%</span>
          </div>
          <div class="hint">Current: $48,500/mo (25.6% of revenue)</div>
        </div>
        <div class="sc-field">
          <label>Production Labour / Month</label>
          <div class="field-row">
            <span class="unit">$</span>
            <input type="number" id="sc-lab-dollar" value="10779" oninput="scFromDollar('lab')">
          </div>
          <div class="field-row" style="margin-top:6px;">
            <input type="range" min="0" max="30" value="5.7" step="0.5" id="sc-lab-slider" oninput="scFromSlider('lab')">
          </div>
          <div class="field-row" style="margin-top:2px;">
            <span class="unit" style="min-width:50px;">% of Rev:</span>
            <input type="number" id="sc-lab-pct" value="5.7" step="0.5" style="width:80px;" oninput="scFromPct('lab')">
            <span class="unit">%</span>
          </div>
          <div class="hint">Current: $10,779/mo (5.7% of revenue)</div>
        </div>
        <div class="sc-field">
          <label>Subcontractors / Month</label>
          <div class="field-row">
            <span class="unit">$</span>
            <input type="number" id="sc-sub-dollar" value="31416" oninput="scFromDollar('sub')">
          </div>
          <div class="field-row" style="margin-top:6px;">
            <input type="range" min="0" max="40" value="16.6" step="0.5" id="sc-sub-slider" oninput="scFromSlider('sub')">
          </div>
          <div class="field-row" style="margin-top:2px;">
            <span class="unit" style="min-width:50px;">% of Rev:</span>
            <input type="number" id="sc-sub-pct" value="16.6" step="0.5" style="width:80px;" oninput="scFromPct('sub')">
            <span class="unit">%</span>
          </div>
          <div class="hint">Current: $31,416/mo (16.6% of revenue)</div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="sc-grid" style="grid-template-columns:1fr 1fr;">
        <div class="calc-out">
          <div class="co-label">Total Direct Costs / Mo</div>
          <div class="co-val" id="sc-direct-total">$90,694</div>
          <div class="co-sub" id="sc-direct-pct">47.9% of revenue</div>
        </div>
        <div class="calc-out">
          <div class="co-label">Gross Margin (before sales costs)</div>
          <div class="co-val" id="sc-gross-margin">$98,572</div>
          <div class="co-sub" id="sc-gross-pct">52.1% of revenue</div>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 2: SALES PIPELINE -->
  <div class="sc-section">
    <div class="sc-hdr"><span class="sc-icon">📊</span> Sales Pipeline & Lead Generation</div>
    <div class="sc-body">
      <p style="font-size:12px; color:var(--muted); margin-bottom:16px;">Model your advertising spend, leads, closing rate, and revenue per job. The calculator figures out how many leads and jobs you need.</p>
      <div class="sc-grid-4">
        <div class="sc-field">
          <label>Monthly Ad Spend</label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-adspend" value="15044" oninput="scCalcAll()"></div>
          <div class="field-row" style="margin-top:6px;">
            <input type="range" min="0" max="60000" value="15044" step="500" id="sc-adspend-sl" oninput="document.getElementById('sc-adspend').value=this.value; scCalcAll()">
          </div>
          <div class="hint">Current: $15,044/mo</div>
        </div>
        <div class="sc-field">
          <label>Cost Per Lead</label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-cpl" value="150" oninput="scCalcAll()"></div>
          <div class="hint">What each lead costs you in ads</div>
        </div>
        <div class="sc-field">
          <label>Closing Rate</label>
          <div class="field-row"><input type="number" id="sc-closerate" value="25" step="1" oninput="scCalcAll()"><span class="unit">%</span></div>
          <div class="field-row" style="margin-top:6px;">
            <input type="range" min="5" max="80" value="25" step="1" id="sc-close-sl" oninput="document.getElementById('sc-closerate').value=this.value; scCalcAll()">
          </div>
          <div class="hint">% of leads that become jobs</div>
        </div>
        <div class="sc-field">
          <label>Avg Revenue Per Job</label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-revjob" value="12500" oninput="scCalcAll()"></div>
          <div class="hint">Average ticket size per closed job</div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="sc-grid-4">
        <div class="calc-out">
          <div class="co-label">Leads / Month</div>
          <div class="co-val" id="sc-leads-mo">100</div>
          <div class="co-sub">From your ad spend ÷ CPL</div>
        </div>
        <div class="calc-out">
          <div class="co-label">Jobs Closed / Month</div>
          <div class="co-val" id="sc-jobs-mo">25</div>
          <div class="co-sub">Leads × closing rate</div>
        </div>
        <div class="calc-out">
          <div class="co-label">Revenue from Pipeline</div>
          <div class="co-val" id="sc-pipeline-rev">$312,500</div>
          <div class="co-sub">Jobs × avg revenue per job</div>
        </div>
        <div class="calc-out">
          <div class="co-label">Cost Per Acquisition</div>
          <div class="co-val" id="sc-cpa">$602</div>
          <div class="co-sub">Ad spend ÷ jobs closed</div>
        </div>
      </div>
      <div style="margin-top:12px; background:#fef9c3; border:1px solid #fde68a; border-radius:8px; padding:10px 14px;">
        <div style="font-size:12px; color:#92400e;"><strong>⚡ Pipeline Revenue:</strong> <span id="sc-pipeline-note">$312,500/mo from pipeline. Use the revenue override below or let the pipeline drive your scenario revenue.</span></div>
      </div>
      <div class="sc-grid-2" style="margin-top:12px;">
        <div class="sc-field">
          <label>Override: Total Monthly Revenue</label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-rev-override" value="" placeholder="Leave blank to use pipeline" oninput="scCalcAll()"></div>
          <div class="hint">Type a number here to override pipeline revenue, or leave blank</div>
        </div>
        <div class="calc-out" style="display:flex; align-items:center;">
          <div>
            <div class="co-label">Scenario Revenue / Mo</div>
            <div class="co-val" id="sc-rev-final">$189,266</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 3: SALES REP COMPENSATION -->
  <div class="sc-section">
    <div class="sc-hdr"><span class="sc-icon">👥</span> Sales Rep Compensation</div>
    <div class="sc-body">
      <p style="font-size:12px; color:var(--muted); margin-bottom:16px;">Currently paying <strong>10% commission</strong> on revenue ($17,463/mo). Model adding reps, changing to base+commission, or adjusting the commission rate.</p>
      <div class="sc-grid-4">
        <div class="sc-field">
          <label>Number of Sales Reps</label>
          <div class="field-row"><input type="number" id="sc-numreps" value="0" min="0" max="20" oninput="scCalcAll()"></div>
          <div class="field-row" style="margin-top:6px;">
            <input type="range" min="0" max="15" value="0" id="sc-reps-sl" oninput="document.getElementById('sc-numreps').value=this.value; scCalcAll()">
          </div>
          <div class="hint">0 = current model (owner sells)</div>
        </div>
        <div class="sc-field">
          <label>Base Salary / Rep / Month</label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-repbase" value="4000" oninput="scCalcAll()"></div>
          <div class="hint">Fixed monthly base per rep</div>
        </div>
        <div class="sc-field">
          <label>Commission % of Revenue</label>
          <div class="field-row"><input type="number" id="sc-commpct" value="10" step="0.5" oninput="scCalcAll()"><span class="unit">%</span></div>
          <div class="field-row" style="margin-top:6px;">
            <input type="range" min="0" max="25" value="10" step="0.5" id="sc-comm-sl" oninput="document.getElementById('sc-commpct').value=this.value; scCalcAll()">
          </div>
          <div class="hint">Current: 10% of all revenue</div>
        </div>
        <div class="sc-field">
          <label>Leads Needed Per Rep</label>
          <div class="field-row"><input type="number" id="sc-leadsperrep" value="30" oninput="scCalcAll()"></div>
          <div class="hint">How many leads each rep can handle/mo</div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="sc-grid">
        <div class="calc-out">
          <div class="co-label">Total Commission / Mo</div>
          <div class="co-val" id="sc-comm-total">$17,463</div>
          <div class="co-sub" id="sc-comm-sub">10% × revenue</div>
        </div>
        <div class="calc-out">
          <div class="co-label">Rep Base Salaries / Mo</div>
          <div class="co-val" id="sc-base-total">$0</div>
          <div class="co-sub" id="sc-base-sub">0 reps × $4,000</div>
        </div>
        <div class="calc-out">
          <div class="co-label">Total Sales Cost / Mo</div>
          <div class="co-val" id="sc-salescost-total">$17,463</div>
          <div class="co-sub" id="sc-salescost-sub">Commission + base salaries</div>
        </div>
      </div>
      <div style="margin-top:12px;">
        <div class="calc-out">
          <div class="co-label">Net Revenue Per Lead (after all sales costs)</div>
          <div style="display:flex; gap:24px; align-items:baseline;">
            <div class="co-val" id="sc-netperlead">$1,719</div>
            <div class="co-sub" id="sc-netperlead-sub">(Avg revenue per job − CPL − commission per job)</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 4: FLEET PLANNING -->
  <div class="sc-section">
    <div class="sc-hdr"><span class="sc-icon">🚛</span> Fleet Planning — Vehicles</div>
    <div class="sc-body">
      <p style="font-size:12px; color:var(--muted); margin-bottom:16px;">Currently running <strong>9 vehicles</strong> at $8,447/mo leases + $5,282/mo operating. Add or remove trucks to see the cost impact.</p>
      <div class="sc-grid-4">
        <div class="sc-field">
          <label>Total Vehicles</label>
          <div class="field-row"><input type="number" id="sc-trucks" value="9" min="0" max="25" oninput="scCalcAll()"></div>
          <div class="field-row" style="margin-top:6px;">
            <input type="range" min="1" max="25" value="9" id="sc-trucks-sl" oninput="document.getElementById('sc-trucks').value=this.value; scCalcAll()">
          </div>
          <div class="hint">Current: 9 vehicles</div>
        </div>
        <div class="sc-field">
          <label>Avg Lease / Vehicle / Mo</label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-leaseper" value="938" oninput="scCalcAll()"></div>
          <div class="hint">Current avg: $8,447 ÷ 9 = $938</div>
        </div>
        <div class="sc-field">
          <label>Avg Operating / Vehicle / Mo</label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-opper" value="587" oninput="scCalcAll()"></div>
          <div class="hint">Fuel, insurance, repairs per truck</div>
        </div>
        <div class="sc-field">
          <label>Revenue Per Truck / Mo</label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-revpertruck" value="21030" oninput="scCalcAll()"></div>
          <div class="hint">$189,266 ÷ 9 = ~$21,030</div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="sc-grid-4">
        <div class="calc-out">
          <div class="co-label">Total Fleet Leases / Mo</div>
          <div class="co-val" id="sc-fleet-lease">$8,447</div>
          <div class="co-sub" id="sc-fleet-lease-sub">9 × $938</div>
        </div>
        <div class="calc-out">
          <div class="co-label">Total Fleet Operating / Mo</div>
          <div class="co-val" id="sc-fleet-ops">$5,282</div>
          <div class="co-sub" id="sc-fleet-ops-sub">9 × $587</div>
        </div>
        <div class="calc-out">
          <div class="co-label">Total Fleet Cost / Mo</div>
          <div class="co-val" id="sc-fleet-total">$13,729</div>
          <div class="co-sub">Leases + operating</div>
        </div>
        <div class="calc-out">
          <div class="co-label">Fleet Revenue Capacity</div>
          <div class="co-val" id="sc-fleet-cap">$189,266</div>
          <div class="co-sub" id="sc-fleet-cap-sub">9 trucks × $21,030</div>
        </div>
      </div>
    </div>
  </div>

  <!-- SECTION 5: OVERHEAD ADJUSTMENTS -->
  <div class="sc-section">
    <div class="sc-hdr"><span class="sc-icon">⚙️</span> Other Overhead Adjustments</div>
    <div class="sc-body">
      <div class="sc-grid">
        <div class="sc-field">
          <label>Officer Wages / Mo</label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-wage-off" value="13458" oninput="scCalcAll()"></div>
          <div class="hint">Current: $13,458</div>
        </div>
        <div class="sc-field">
          <label>Office & Admin Wages / Mo</label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-wage-admin" value="8452" oninput="scCalcAll()"></div>
          <div class="hint">Current: $6,816 prod + $1,636 office = $8,452</div>
        </div>
        <div class="sc-field">
          <label>CPP & EI / Mo</label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-cpp" value="2970" oninput="scCalcAll()"></div>
          <div class="hint">Current: $2,970</div>
        </div>
        <div class="sc-field">
          <label>Software & Tech / Mo</label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-soft" value="6902" oninput="scCalcAll()"></div>
          <div class="hint">Current: $6,902</div>
        </div>
        <div class="sc-field">
          <label>Rent / Mo</label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-rent" value="3636" oninput="scCalcAll()"></div>
          <div class="hint">Current: $3,636</div>
        </div>
        <div class="sc-field">
          <label>Recruiting / Mo</label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-recruit" value="1555" oninput="scCalcAll()"></div>
          <div class="hint">Current: $1,555</div>
        </div>
        <div class="sc-field">
          <label>Office & General / Mo</label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-offgen" value="2994" oninput="scCalcAll()"></div>
          <div class="hint">Current: $2,994</div>
        </div>
        <div class="sc-field">
          <label>Debt & Finance / Mo <span class="lock-badge">LOCKED</span></label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-debt" value="19224" disabled style="background:#f1f3f5; color:#64748b;"></div>
          <div class="hint">BDC loans, CC interest, bank fees — can't change</div>
        </div>
        <div class="sc-field">
          <label>Equipment Leases / Mo <span class="lock-badge">LOCKED</span></label>
          <div class="field-row"><span class="unit">$</span><input type="number" id="sc-equip" value="1419" disabled style="background:#f1f3f5; color:#64748b;"></div>
          <div class="hint">Current: $1,419</div>
        </div>
      </div>
    </div>
  </div>

  <!-- FULL COMPARISON TABLE -->
  <div class="sc-compare">
    <div class="section-hdr"><span>Current vs Scenario — Full Breakdown</span></div>
    <table>
      <tr><th style="text-align:left;">Category</th><th style="text-align:right;">Current /Mo</th><th style="text-align:right;">Scenario /Mo</th><th style="text-align:right;">Change</th></tr>
      <tbody id="s2-compare-body"></tbody>
    </table>
  </div>

</div>
</div>

<!-- ============================================================ -->
<!-- TAB 3: BUDGET vs ACTUAL -->
<!-- ============================================================ -->
<div id="page-budget" class="tab-page">

<div class="instructions">
  <strong>Budget vs Actual:</strong> Enter your <span style="color:blue; font-weight:700;">blue budget numbers</span> for each month. Actual comes from your current averages (edit those too). Variance = Actual − Budget. <span style="color:var(--green); font-weight:700;">Green</span> = under budget (good for costs) or over budget (good for revenue). <span style="color:var(--red); font-weight:700;">Red</span> = the opposite.
</div>

<div class="budget-wrap">

  <!-- Category chips -->
  <div class="month-cat-sel">
    <button class="cat-chip active" onclick="showBudgetCat('revenue',this)">Revenue</button>
    <button class="cat-chip" onclick="showBudgetCat('variable',this)">Variable Costs</button>
    <button class="cat-chip" onclick="showBudgetCat('overhead',this)">Overhead</button>
    <button class="cat-chip" onclick="showBudgetCat('debt',this)">Debt & Finance</button>
    <button class="cat-chip" onclick="showBudgetCat('summary',this)">Summary</button>
  </div>

  <!-- Budget hero cards -->
  <div class="budget-hero">
    <div class="bh-card">
      <div class="bh-label">YTD Budget Total</div>
      <div class="bh-val val-navy" id="bud-ytd-budget">$0</div>
    </div>
    <div class="bh-card">
      <div class="bh-label">YTD Actual Total</div>
      <div class="bh-val val-navy" id="bud-ytd-actual">$0</div>
    </div>
    <div class="bh-card">
      <div class="bh-label">YTD Variance</div>
      <div class="bh-val" id="bud-ytd-var">$0</div>
    </div>
    <div class="bh-card">
      <div class="bh-label">Variance %</div>
      <div class="bh-val" id="bud-ytd-pct">0%</div>
    </div>
  </div>

  <!-- Budget table container -->
  <div class="budget-table-wrap">
    <table id="budget-table">
    </table>
  </div>

</div>
</div>

<!-- ============================================================ -->
<!-- TAB 4: MARGIN CALCULATOR -->
<!-- ============================================================ -->
<div id="page-margins" class="tab-page">

<div class="instructions">
  <strong>Service Line Profitability Planner:</strong> Set your profit goal, define service lines with real costs, toggle expenses per job type, and plan your monthly revenue mix. All numbers in <span style="color:blue; font-weight:700;">blue</span> are editable.
</div>

<div class="mc-wrap">

  <!-- ===== SECTION 1: PROFIT GOAL & FIXED COSTS ===== -->
  <div class="mc-section">
    <div class="mc-hdr">
      <span>🎯 Monthly Profit Goal & Fixed Costs</span>
      <span style="font-size:12px; opacity:0.8;">Set your target, toggle expenses to model scenarios</span>
    </div>
    <div class="mc-body">
      <div class="goal-strip">
        <div class="goal-card" style="border-color: var(--green);">
          <div class="g-label">Target Net Profit</div>
          <div style="margin-top:4px;"><input type="number" class="goal-input" id="goal-profit" value="10000" step="500" onchange="goalCalc()" onkeydown="if(event.key==='Enter'){this.blur();}"></div>
        </div>
        <div class="goal-card">
          <div class="g-label">Total Fixed Costs</div>
          <div class="g-val val-red" id="goal-fixed">$0</div>
        </div>
        <div class="goal-card">
          <div class="g-label">Gross Profit Needed</div>
          <div class="g-val val-navy" id="goal-gp">$0</div>
        </div>
        <div class="goal-card">
          <div class="g-label">Revenue Needed (at current CM%)</div>
          <div class="g-val val-navy" id="goal-rev">$0</div>
        </div>
      </div>

      <div class="exp-grid">
        <div>
          <div class="exp-group-title">
            <span>Overhead Expenses</span>
            <span class="exp-tog" onclick="expToggleGroup('oh')">Toggle All</span>
          </div>
          <div id="exp-oh-items"></div>
        </div>
        <div>
          <div class="exp-group-title">
            <span>Debt & Finance</span>
            <span class="exp-tog" onclick="expToggleGroup('debt')">Toggle All</span>
          </div>
          <div id="exp-debt-items"></div>
        </div>
      </div>

      <div class="preset-bar">
        <button class="preset-btn" onclick="expPreset('all')">📋 All Expenses</button>
        <button class="preset-btn" onclick="expPreset('lean')">🔥 Lean (no debt)</button>
        <button class="preset-btn" onclick="expPreset('nodbt')">💳 No BDC Loans</button>
        <button class="preset-btn" onclick="expPreset('min')">⚡ Bare Minimum</button>
      </div>
    </div>
  </div>

  <!-- ===== SECTION 2: SERVICE LINE BUILDER ===== -->
  <div class="mc-section">
    <div class="mc-hdr">
      <span>🔧 Service Line Builder</span>
      <span style="font-size:12px; opacity:0.8;">Define each service with costs, margins, and per-job expenses</span>
    </div>
    <div class="mc-body">
      <div id="sl-container"></div>
      <div style="margin-top:12px;">
        <button class="mc-add-btn" onclick="slAdd()">➕ Add Service Line</button>
      </div>
    </div>
  </div>

  <!-- ===== SECTION 3: LEAD SOURCE COST CALCULATOR ===== -->
  <div class="mc-section">
    <div class="mc-hdr">
      <span>📣 Lead Source Cost Calculator</span>
      <span style="font-size:12px; opacity:0.8;">Compare your true cost-per-sold-job across all lead channels</span>
    </div>
    <div class="mc-body">
      <div style="margin-bottom:12px; display:flex; gap:16px; align-items:flex-start; flex-wrap:wrap;">
        <div style="display:flex; gap:6px; align-items:center;">
          <label style="font-size:12px; font-weight:600;">Global Booking Rate:</label>
          <input type="number" id="ls-booking-rate" value="60" step="1" style="width:60px; padding:5px 8px; border:1.5px solid #bfdbfe; border-radius:6px; font-size:13px; font-weight:700; color:var(--blue-input); text-align:right;" onchange="lsRender()">
          <span style="font-size:12px; font-weight:600;">%</span>
        </div>
        <div style="display:flex; gap:6px; align-items:center;">
          <label style="font-size:12px; font-weight:600;">Global Close Rate:</label>
          <input type="number" id="ls-close-rate" value="25" step="1" style="width:60px; padding:5px 8px; border:1.5px solid #bfdbfe; border-radius:6px; font-size:13px; font-weight:700; color:var(--blue-input); text-align:right;" onchange="lsRender()">
          <span style="font-size:12px; font-weight:600;">%</span>
        </div>
        <div style="font-size:10px; color:var(--muted); line-height:1.4; max-width:300px;">Booking Rate = % of leads that book an appointment.<br>Close Rate = % of booked appointments that sell.<br>Override either per source below.</div>
      </div>
      <div class="ls-grid" id="ls-container"></div>
      <div style="margin-top:12px;">
        <button class="mc-add-btn" onclick="lsAdd()">➕ Add Lead Source</button>
      </div>

      <!-- Comparison Rankings -->
      <div style="margin-top:20px; padding-top:16px; border-top:2px solid var(--border);">
        <div style="font-weight:700; font-size:13px; color:var(--navy); margin-bottom:10px;">📊 Cost-Per-Sold-Job Comparison (leads → booked → sold &bull; lowest = best)</div>
        <div class="ls-compare" id="ls-compare"></div>
      </div>

    </div>
  </div>

  <!-- ===== SECTION 4: MONTHLY REVENUE PLANNER ===== -->
  <div class="mc-section">
    <div class="mc-hdr">
      <span>📊 Monthly Revenue Planner</span>
      <span style="font-size:12px; opacity:0.8;">Enter jobs per month to see if you hit your goal</span>
    </div>
    <div class="mc-body">

      <div class="mp-strip">
        <div class="mp-card">
          <div class="mp-label">Total Revenue</div>
          <div class="mp-val val-navy" id="mp-rev">$0</div>
        </div>
        <div class="mp-card">
          <div class="mp-label">All-In Costs</div>
          <div class="mp-val val-red" id="mp-cost">$0</div>
        </div>
        <div class="mp-card">
          <div class="mp-label">Gross Profit</div>
          <div class="mp-val" id="mp-gp">$0</div>
        </div>
        <div class="mp-card">
          <div class="mp-label">After Fixed Costs</div>
          <div class="mp-val" id="mp-net">$0</div>
        </div>
        <div class="mp-card">
          <div class="mp-label">Total Jobs/Month</div>
          <div class="mp-val val-navy" id="mp-jobs">0</div>
        </div>
      </div>

      <div style="overflow-x:auto;">
        <div class="mp-table-hdr">
          <div>Service Line</div>
          <div>Jobs/Mo</div>
          <div>Revenue</div>
          <div>Direct Cost</div>
          <div>Variable Cost</div>
          <div>Gross Profit</div>
          <div>All-In Margin</div>
        </div>
        <div id="mp-rows"></div>
        <div class="mp-total" id="mp-total-row">
          <div>TOTAL</div>
          <div id="mp-t-jobs">0</div>
          <div id="mp-t-rev">$0</div>
          <div id="mp-t-direct">$0</div>
          <div id="mp-t-var">$0</div>
          <div id="mp-t-profit">$0</div>
          <div id="mp-t-margin">0%</div>
        </div>
      </div>

      <!-- Goal comparison -->
      <div class="mp-goal-box">
        <h4>Goal Achievement</h4>
        <div class="mp-goal-row">
          <span>Gross Profit from Service Lines</span>
          <span class="mp-goal-val" id="mpg-gp">$0</span>
        </div>
        <div class="mp-goal-row">
          <span>− Fixed Costs (from Section 1)</span>
          <span class="mp-goal-val" id="mpg-fixed">$0</span>
        </div>
        <div class="mp-goal-row" style="border-top:1px solid rgba(255,255,255,0.3); padding-top:6px; margin-top:4px;">
          <span style="font-size:16px;">= Net Profit</span>
          <span class="mp-goal-val" id="mpg-net" style="font-size:20px;">$0</span>
        </div>
        <div class="mp-goal-row">
          <span>Target Profit</span>
          <span class="mp-goal-val" id="mpg-target">$0</span>
        </div>
        <div class="mp-goal-row">
          <span>Gap (+ = ahead, − = short)</span>
          <span class="mp-goal-val" id="mpg-gap">$0</span>
        </div>
        <div class="mp-gauge">
          <div class="mp-gauge-fill" id="mpg-gauge" style="width:0%;">0%</div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:10px; opacity:0.6; margin-top:4px;">
          <span>$0</span>
          <span>Progress to Target</span>
          <span>100%+</span>
        </div>
      </div>

    </div>
  </div>

</div>
</div>

<div class="footer">
  Custom Contracting Inc &nbsp;|&nbsp; Financial Command Center &nbsp;|&nbsp; <span>Blue numbers are editable</span> &nbsp;|&nbsp; All calculations update instantly
</div>

`;

export default function DashboardPage() {
  return (
    <>
      {/* Dashboard shell — all dynamic content is injected by dashboard.js */}
      <div dangerouslySetInnerHTML={{ __html: DASHBOARD_HTML }} />

      {/* Dashboard logic — loaded after page is interactive so DOM is ready.
          Runs as a classic (non-module) script so all functions are global,
          matching the onclick/onchange attribute strings in the HTML above. */}
      <Script
        src="/dashboard.js"
        strategy="afterInteractive"
      />
    </>
  );
}
