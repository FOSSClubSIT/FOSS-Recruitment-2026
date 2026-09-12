// Active Template State
let currentTemplateKey = "problem_statement";

// Standard Legal & Operational Templates (Matching Dark Tech Theme)
const standardTemplates = {
  problem_statement: {
    title: "Outcome Problem Statement Formulation",
    filename: "Outcome_Problem_Statement.md",
    labels: ["Department Authority", "Target Measurable KPI", "Sandbox Trial Scope"],
    defaultValues: [
      "Water Supply & Sanitation Department, GoM",
      "Real-time acoustic detection of leaks >0.5 LPM with >95% accuracy in 48h",
      "5 km municipal distribution pipeline across 60 calendar days"
    ],
    renderCardHtml: (p1, p2, p3) => `
      <div class="p-3.5 bg-[#080c14] rounded-xl border border-white/[0.08] space-y-1">
        <div class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">1. Commissioning Public Authority</div>
        <p class="text-xs text-white font-semibold">${p1}</p>
        <span class="inline-block text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium">Public Infrastructure Sandbox</span>
      </div>

      <div class="p-3.5 bg-[#080c14] rounded-xl border border-white/[0.08] space-y-1">
        <div class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">2. Operational Problem Formulation</div>
        <p class="text-xs text-slate-300 leading-relaxed">Focuses on measurable functional technological benchmarks rather than rigid brand/hardware specifications.</p>
      </div>

      <div class="p-3.5 bg-[#080c14] rounded-xl border border-white/[0.08] space-y-1">
        <div class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">3. Mandatory Performance Target (Outcome KPI)</div>
        <p class="text-xs font-semibold text-emerald-300">"${p2}"</p>
        <p class="text-[11px] text-slate-400">Verification Horizon: Performance logged through real-time edge telemetry and independent evaluation.</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div class="p-3 bg-[#080c14] rounded-xl border border-white/[0.08]">
          <div class="text-[10px] font-bold text-amber-400 uppercase tracking-wider">4. Controlled Sandbox</div>
          <p class="text-xs text-slate-300 mt-0.5">${p3}</p>
        </div>
        <div class="p-3 bg-[#080c14] rounded-xl border border-white/[0.08]">
          <div class="text-[10px] font-bold text-purple-400 uppercase tracking-wider">5. Statutory Waivers</div>
          <p class="text-xs text-slate-300 mt-0.5">GFR 173(i) Turnover Exemption & Rule 170(i) EMD Waiver active.</p>
        </div>
      </div>
    `,
    generateRaw: (p1, p2, p3) => `STANDARD CHALLENGE OUTCOME FORMULATION\nAuthority: ${p1}\nKPI: ${p2}\nScope: ${p3}\nStatutory: GFR 173(i) & 170(i) Exemptions`
  },

  evaluation_criteria: {
    title: "QCBS Evaluation Rubric",
    filename: "QCBS_Rubric.md",
    labels: ["Minimum Scale Threshold", "Evaluation Model", "TRL Benchmark"],
    defaultValues: [
      "85.0% Weighted Aggregate Score",
      "QCBS 80:20 (Technical Merit to Commercial Viability)",
      "TRL 6 to TRL 8 (Validated Prototype)"
    ],
    renderCardHtml: (p1, p2, p3) => `
      <div class="p-3.5 bg-[#080c14] rounded-xl border border-white/[0.08] space-y-1">
        <div class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Evaluation Methodology</div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-white">${p2}</span>
          <span class="text-[10px] px-2 py-0.5 bg-indigo-500/15 text-indigo-300 rounded border border-indigo-500/30 font-medium">${p3}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div class="p-2.5 bg-[#080c14] rounded-xl border border-white/[0.08] text-center">
          <span class="text-[10px] text-slate-400 block font-bold">Pillar 1: Technical Merit</span>
          <span class="text-xs font-bold text-indigo-400">30% Weight</span>
        </div>
        <div class="p-2.5 bg-[#080c14] rounded-xl border border-white/[0.08] text-center">
          <span class="text-[10px] text-slate-400 block font-bold">Pillar 2: KPI Precision</span>
          <span class="text-xs font-bold text-emerald-400">25% Weight</span>
        </div>
        <div class="p-2.5 bg-[#080c14] rounded-xl border border-white/[0.08] text-center">
          <span class="text-[10px] text-slate-400 block font-bold">Pillar 3: Data Security</span>
          <span class="text-xs font-bold text-cyan-400">20% Weight</span>
        </div>
        <div class="p-2.5 bg-[#080c14] rounded-xl border border-white/[0.08] text-center">
          <span class="text-[10px] text-slate-400 block font-bold">Pillar 4: Scalability</span>
          <span class="text-xs font-bold text-purple-400">15% Weight</span>
        </div>
        <div class="p-2.5 bg-[#080c14] rounded-xl border border-white/[0.08] text-center col-span-2 sm:col-span-2">
          <span class="text-[10px] text-slate-400 block font-bold">Pillar 5: DPIIT Exemption Gate</span>
          <span class="text-xs font-bold text-emerald-400">10% Weight (100% Passed)</span>
        </div>
      </div>

      <div class="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 flex items-center justify-between">
        <span class="text-xs text-white font-semibold">Scale-Up Benchmark</span>
        <span class="text-xs font-mono font-bold text-emerald-400">&ge; ${p1} (Direct GeM Conversion)</span>
      </div>
    `,
    generateRaw: (p1, p2, p3) => `QCBS EVALUATION RUBRIC\nModel: ${p2}\nReadiness: ${p3}\nQualifying: >= ${p1}`
  },

  pilot_agreement: {
    title: "Sandbox Pilot Agreement",
    filename: "Sandbox_Agreement.md",
    labels: ["Department Authority", "Startup Entity Name", "Escrow Allocation"],
    defaultValues: [
      "Department of Urban Development, Government of Maharashtra",
      "HydroSense DeepTech Innovations Private Limited",
      "₹38,00,000 locked in Escrow Vault"
    ],
    renderCardHtml: (p1, p2, p3) => `
      <div class="p-3.5 bg-[#080c14] rounded-xl border border-white/[0.08] space-y-1">
        <div class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Parties & Authority</div>
        <p class="text-xs text-slate-300"><strong>Authority:</strong> ${p1}</p>
        <p class="text-xs text-slate-300"><strong>Startup:</strong> ${p2}</p>
      </div>
      <div class="p-3.5 bg-[#080c14] rounded-xl border border-white/[0.08] space-y-1">
        <div class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Escrow Commitment</div>
        <p class="text-xs font-mono font-bold text-emerald-300">${p3}</p>
        <p class="text-[11px] text-slate-400">Guaranteed tranche disbursements within 48 hours of milestone telemetry verification.</p>
      </div>
    `,
    generateRaw: (p1, p2, p3) => `SANDBOX PILOT AGREEMENT\nDepartment: ${p1}\nStartup: ${p2}\nEscrow: ${p3}`
  },

  ip_data_clause: {
    title: "IP Retainment & Data Clause",
    filename: "IP_Data_Retainment.md",
    labels: ["Startup Entity Name", "Licensed Government Usage", "Cloud Region"],
    defaultValues: [
      "HydroSense DeepTech Innovations Private Limited",
      "Internal Administrative License",
      "MeitY-Empanelled Data Centers (India Region)"
    ],
    renderCardHtml: (p1, p2, p3) => `
      <div class="p-3.5 bg-[#080c14] rounded-xl border border-white/[0.08] space-y-1">
        <div class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">100% IP Retainment</div>
        <p class="text-xs text-slate-300">All neural network weights, algorithms, and source code developed by <strong class="text-white">${p1}</strong> remain exclusive startup property.</p>
      </div>
      <div class="p-3.5 bg-[#080c14] rounded-xl border border-white/[0.08] space-y-1">
        <div class="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Data Sovereignty</div>
        <p class="text-xs text-slate-300">Internal scope: <strong class="text-white">${p2}</strong>.</p>
        <p class="text-[11px] text-slate-400">All municipal telemetry hosted in <strong class="text-white">${p3}</strong>.</p>
      </div>
    `,
    generateRaw: (p1, p2, p3) => `IP & DATA PROTECTION\nStartup: ${p1}\nScope: ${p2}\nLocation: ${p3}`
  },

  cybersecurity_risk: {
    title: "Cybersecurity & Risk Protocols",
    filename: "Cybersecurity_Risk.md",
    labels: ["Risk Stop-Loss Limit", "CERT-In Audit Standard", "Rollback Mechanism"],
    defaultValues: [
      "Max 5.0% System Anomaly Deviation",
      "CERT-In Empanelled Security Audit",
      "Immediate Automated Failover to Manual Operations"
    ],
    renderCardHtml: (p1, p2, p3) => `
      <div class="p-3.5 bg-[#080c14] rounded-xl border border-white/[0.08] space-y-1">
        <div class="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Risk Stop-Loss Limit</div>
        <p class="text-xs text-slate-300">Tolerance Ceiling: <strong class="text-white">${p1}</strong></p>
      </div>
      <div class="p-3.5 bg-[#080c14] rounded-xl border border-white/[0.08] space-y-1">
        <div class="text-[10px] font-bold text-rose-400 uppercase tracking-wider">Audit & Rollback Triggers</div>
        <p class="text-xs text-slate-300">Certification: <strong class="text-white">${p2}</strong></p>
        <p class="text-xs text-slate-300">Emergency Trigger: <strong class="text-white">${p3}</strong></p>
      </div>
    `,
    generateRaw: (p1, p2, p3) => `CYBERSECURITY PROTOCOLS\nStopLoss: ${p1}\nStandard: ${p2}\nFailover: ${p3}`
  },

  procurement_scaleup: {
    title: "Direct GeM Scale-Up Pathway",
    filename: "GeM_Scaleup_Conversion.md",
    labels: ["Qualifying Audit Score", "Scale Horizon", "Procurement Mode"],
    defaultValues: [
      "Score >= 85.0% on QCBS Rubric",
      "State-wide rollout across Urban Local Bodies (ULBs)",
      "Direct Purchase under GeM Innovation Category"
    ],
    renderCardHtml: (p1, p2, p3) => `
      <div class="p-3.5 bg-[#080c14] rounded-xl border border-white/[0.08] space-y-1">
        <div class="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Scale-Up Conversion Authorization</div>
        <p class="text-xs text-slate-300">Benchmark achieved: <strong class="text-white">${p1}</strong></p>
      </div>
      <div class="p-3.5 bg-[#080c14] rounded-xl border border-white/[0.08] space-y-1">
        <div class="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Procurement Pathway</div>
        <p class="text-xs text-slate-300">Horizon: <strong class="text-white">${p2}</strong></p>
        <p class="text-xs text-slate-300">Mode: <strong class="text-white">${p3}</strong></p>
      </div>
    `,
    generateRaw: (p1, p2, p3) => `SCALE-UP CONVERSION\nScore: ${p1}\nHorizon: ${p2}\nMode: ${p3}`
  }
};

// Mock Database
let challenges = [
  {
    id: "CH-MH-01",
    dept: "Water Supply & Sanitation Department",
    title: "Acoustic Edge AI for Underground Pipeline Leakage",
    target: "Identify micro-leaks >0.5 LPM with >95% spatial accuracy under 48 hours",
    desc: "Detect and localise micro-leaks in municipal networks using acoustic telemetry and ML anomaly detection.",
    budget: 3800000,
    published: "2026-08-24",
    applied: true
  },
  {
    id: "CH-MH-02",
    dept: "Department of Agriculture & PMFBY Cell",
    title: "Hyperspectral Drone Crop Damage Assessment",
    target: "Reduce loss assessment turnaround from 21 days to 48 hours with 92% ground match",
    desc: "Automate crop claim assessment turnaround using multispectral drone imagery.",
    budget: 4200000,
    published: "2026-08-26",
    applied: false
  }
];

let pilots = [
  {
    id: "PL-8821",
    startup: "HydroSense DeepTech",
    dpiit: "DIPP-98214",
    title: "Acoustic IoT Leak Detection",
    environment: "Geofenced 5km Urban Zone",
    dataPrivacy: "Anonymized PII + Edge Gateway",
    stopLoss: "Max 5.0% False Positive",
    ipRetainment: "100% Retained by Startup",
    milestoneCurrent: 2,
    totalMilestones: 4,
    tranche: 1250000,
    coverage: 68,
    status: "Active Sandbox",
    isApproved: false,
    auditScore: 0
  },
  {
    id: "PL-8822",
    startup: "AgroVision AI Labs",
    dpiit: "DIPP-84192",
    title: "Hyperspectral Drone Assessment",
    environment: "Synthetic Test Farm Flight Grid",
    dataPrivacy: "Air-Gapped Edge Processing",
    stopLoss: "Max 2.0% Anomaly Deviation",
    ipRetainment: "100% Retained by Startup",
    milestoneCurrent: 4,
    totalMilestones: 4,
    tranche: 2500000,
    coverage: 100,
    status: "Scale-Up Ready",
    isApproved: true,
    auditScore: 91.0
  }
];

let transactions = [
  {
    id: "TX-ESCROW-001",
    startup: "AgroVision AI Labs",
    amount: 2500000,
    timestamp: "2026-08-28 11:15 IST",
    txHash: "0x1b4c...98e4"
  }
];

let activePilotIndexForAudit = null;

function formatINR(val) {
  return "₹" + Number(val).toLocaleString("en-IN");
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) lucide.createIcons();
  selectTemplate("problem_statement");
  renderAllViews();
});

// View Router
function switchView(viewName) {
  const views = ["overview", "templates", "sandbox", "evaluator", "department", "startup"];
  views.forEach((v) => {
    const isCurrent = v === viewName;
    const navBtn = document.getElementById(`nav-${v}`);
    const viewContainer = document.getElementById(`view-${v}`);

    if (navBtn) {
      navBtn.className = isCurrent ? "sidebar-nav-item active-sidebar-tab" : "sidebar-nav-item";
    }
    if (viewContainer) {
      viewContainer.classList.toggle("hidden", !isCurrent);
    }
  });

  if (window.lucide) lucide.createIcons();
}

function renderAllViews() {
  renderSandboxTable();
  renderEvaluatorTable();
  renderStartupHub();
  renderDepartmentPanel();
  renderEscrowDrawer();
  renderOverview();
  if (window.lucide) lucide.createIcons();
}

function renderOverview() {
  const disbursed = transactions.reduce((a, t) => a + t.amount, 0);
  const escrowBal = pilots.reduce((a, p) => a + p.tranche, 0) + 23500000;
  const approved = pilots.filter((p) => p.isApproved).length;

  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setText("ov-active-pilots", pilots.length);
  setText("ov-approved", approved);
  setText("ov-escrow", "₹" + (escrowBal / 10000000).toFixed(2) + " Cr");
  setText("ov-disbursed", formatINR(disbursed));
  setText("ov-challenges", challenges.length);

  const wrap = document.getElementById("ov-pilot-progress");
  if (wrap) {
    wrap.innerHTML = pilots.map((p) => `
      <div class="p-3.5 bg-[#080c14] rounded-2xl border border-white/[0.08]">
        <div class="flex justify-between items-center text-xs font-bold mb-1.5">
          <span class="text-white">${p.startup}</span>
          <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${p.isApproved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'}">${p.isApproved ? 'Approved' : 'Active'}</span>
        </div>
        <div class="w-full bg-black/40 h-2 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full" style="width: ${(p.milestoneCurrent / p.totalMilestones) * 100}%"></div>
        </div>
        <div class="text-[10px] text-slate-400 font-mono mt-1.5">Milestone ${p.milestoneCurrent}/${p.totalMilestones} · ${formatINR(p.tranche)}</div>
      </div>
    `).join("");
  }
}

function selectTemplate(key) {
  currentTemplateKey = key;
  const tpl = standardTemplates[key];

  document.querySelectorAll(".template-card").forEach((card) => card.classList.remove("active-card"));
  const activeCard = document.getElementById(`tpl-card-${key}`);
  if (activeCard) activeCard.classList.add("active-card");

  document.getElementById("editor-file-title").textContent = tpl.title;
  document.getElementById("param-label-1").textContent = tpl.labels[0];
  document.getElementById("param-label-2").textContent = tpl.labels[1];
  document.getElementById("param-label-3").textContent = tpl.labels[2];

  document.getElementById("param-input-1").value = tpl.defaultValues[0];
  document.getElementById("param-input-2").value = tpl.defaultValues[1];
  document.getElementById("param-input-3").value = tpl.defaultValues[2];

  renderTemplateText();
}

function renderTemplateText() {
  const tpl = standardTemplates[currentTemplateKey];
  const p1 = document.getElementById("param-input-1").value;
  const p2 = document.getElementById("param-input-2").value;
  const p3 = document.getElementById("param-input-3").value;
  document.getElementById("template-card-container").innerHTML = tpl.renderCardHtml(p1, p2, p3);
}

function copyCurrentDocument() {
  const tpl = standardTemplates[currentTemplateKey];
  const p1 = document.getElementById("param-input-1").value;
  const p2 = document.getElementById("param-input-2").value;
  const p3 = document.getElementById("param-input-3").value;
  navigator.clipboard.writeText(tpl.generateRaw(p1, p2, p3)).then(() => {
    const btnText = document.getElementById("copy-btn-text");
    btnText.textContent = "✓ Copied!";
    setTimeout(() => { btnText.textContent = "Copy Text"; }, 2000);
  });
}

function downloadAsDocument() {
  const tpl = standardTemplates[currentTemplateKey];
  const p1 = document.getElementById("param-input-1").value;
  const p2 = document.getElementById("param-input-2").value;
  const p3 = document.getElementById("param-input-3").value;
  const blob = new Blob([tpl.generateRaw(p1, p2, p3)], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = tpl.filename;
  a.click();
  URL.revokeObjectURL(url);
}

function applyActiveTemplateToDepartment() {
  const p1 = document.getElementById("param-input-1").value;
  const p2 = document.getElementById("param-input-2").value;
  document.getElementById("post-dept").value = p1;
  document.getElementById("post-kpi").value = p2;
  document.getElementById("post-title").value = `Innovation Challenge: ${p2.slice(0, 45)}...`;
  switchView("department");
  alert("✓ Template parameters populated into Department Formulation form!");
}

function renderSandboxTable() {
  const tbody = document.getElementById("sandbox-table-body");
  if (!tbody) return;

  tbody.innerHTML = pilots.map((p) => `
    <tr class="hover:bg-white/[0.04] transition">
      <td class="py-3.5 px-5">
        <div class="font-bold text-white">${p.startup}</div>
        <div class="text-[10px] text-slate-400 font-mono">${p.id} · ${p.dpiit}</div>
      </td>
      <td class="py-3.5 px-5 text-white font-medium">${p.environment}</td>
      <td class="py-3.5 px-5 text-slate-400">${p.dataPrivacy}</td>
      <td class="py-3.5 px-5 text-amber-400 font-mono font-medium">${p.stopLoss}</td>
      <td class="py-3.5 px-5 text-emerald-400 font-bold">${p.ipRetainment}</td>
      <td class="py-3.5 px-5 text-right">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Sandbox Active
        </span>
      </td>
    </tr>
  `).join("");
}

function renderEvaluatorTable() {
  const tbody = document.getElementById("evaluator-table-body");
  if (!tbody) return;

  tbody.innerHTML = pilots.map((p, idx) => `
    <tr class="hover:bg-white/[0.04] transition">
      <td class="py-3.5 px-5">
        <div class="font-bold text-white">${p.startup}</div>
        <div class="text-[10px] text-slate-400 font-mono">${p.dpiit}</div>
      </td>
      <td class="py-3.5 px-5 text-white font-medium">${p.title}</td>
      <td class="py-3.5 px-5 text-slate-400 font-mono">M${p.milestoneCurrent}/${p.totalMilestones}</td>
      <td class="py-3.5 px-5 font-bold font-mono text-white">${p.auditScore > 0 ? p.auditScore + "%" : "Pending"}</td>
      <td class="py-3.5 px-5">
        ${p.isApproved
          ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">GeM Scale Ready</span>`
          : (p.auditScore > 0 && !p.isApproved)
            ? `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">Rejected (<85%)</span>`
            : `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Evaluation Active</span>`
        }
      </td>
      <td class="py-3.5 px-5 text-right">
        ${p.isApproved
          ? `<button class="text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold text-xs">✓ Scale Approved</button>`
          : `<button onclick="openEvalModal(${idx})" class="btn-primary">Audit & Evaluate</button>`
        }
      </td>
    </tr>
  `).join("");
}

function renderStartupHub() {
  const chalList = document.getElementById("startup-challenges-list");
  if (chalList) {
    chalList.innerHTML = challenges.map((c, idx) => `
      <div class="bg-[#0b1225] p-5 rounded-3xl border border-white/[0.08] shadow-xl flex flex-col justify-between space-y-4">
        <div>
          <div class="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-wider mb-1">${c.dept}</div>
          <h4 class="text-sm font-bold text-white mb-2">${c.title}</h4>
          <p class="text-xs text-slate-400 mb-3 leading-relaxed">${c.desc}</p>
          <div class="bg-[#080c14] p-3 rounded-2xl border border-white/[0.06] text-xs text-white mb-2">
            🎯 <span class="font-bold text-white">Target:</span> ${c.target}
          </div>
          <div class="text-xs text-slate-400">
            Escrow Allocation: <strong class="text-emerald-400 font-mono">${formatINR(c.budget)}</strong>
          </div>
        </div>
        <button onclick="applyToChallenge(${idx})" class="btn-primary w-full justify-center">
          ${c.applied ? "✓ Applied (GFR 173(i) Exempted)" : "One-Click Apply"}
        </button>
      </div>
    `).join("");
  }

  const stepperContainer = document.getElementById("startup-stepper-container");
  if (stepperContainer) {
    stepperContainer.innerHTML = pilots.map((p, pIdx) => `
      <div class="bg-[#0b1225] p-5 rounded-3xl border border-white/[0.08] shadow-xl space-y-4">
        <div class="flex justify-between items-center border-b border-white/[0.08] pb-3">
          <div>
            <div class="text-sm font-bold text-white">${p.title}</div>
            <div class="text-[10px] text-slate-400 font-mono">${p.startup}</div>
          </div>
          <span class="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-3 py-1 rounded-full border border-emerald-500/30">
            Tranche: ${formatINR(p.tranche)}
          </span>
        </div>
        <div class="flex justify-end">
          <button onclick="submitMilestoneTelemetry(${pIdx})" class="btn-primary text-xs">
            Submit Milestone Evidence Feed
          </button>
        </div>
      </div>
    `).join("");
  }
}

function submitMilestoneTelemetry(pIdx) {
  alert(`✓ Telemetry Evidence Feed submitted for ${pilots[pIdx].startup}!\n\nEvaluator Committee notified for scoring.`);
  switchView("evaluator");
}

function renderDepartmentPanel() {
  const tbody = document.getElementById("dept-table-body");
  if (tbody) {
    tbody.innerHTML = challenges.map((c) => `
      <tr class="hover:bg-white/[0.04] transition">
        <td class="py-3 px-5 font-bold text-white text-xs">${c.title}</td>
        <td class="py-3 px-5 text-white text-xs">${c.dept}</td>
        <td class="py-3 px-5 text-slate-400 text-xs">${c.target}</td>
        <td class="py-3 px-5 font-bold text-emerald-400 text-xs font-mono">${formatINR(c.budget)}</td>
        <td class="py-3 px-5 text-slate-400 text-right text-[11px] font-mono">${c.published}</td>
      </tr>
    `).join("");
  }
}

function renderEscrowDrawer() {
  const list = document.getElementById("escrow-tx-list");
  if (!list) return;

  list.innerHTML = transactions.map((tx) => `
    <div class="p-3.5 bg-[#080c14] rounded-2xl border border-white/[0.08] text-xs flex justify-between items-center">
      <div>
        <div class="font-bold text-white">${tx.startup}</div>
        <div class="text-[10px] text-slate-400 font-mono">${tx.timestamp}</div>
      </div>
      <div class="text-right">
        <div class="font-bold text-emerald-400 font-mono">+${formatINR(tx.amount)}</div>
        <span class="text-[10px] font-mono text-slate-400">Disbursed</span>
      </div>
    </div>
  `).join("");
}

function toggleEscrowDrawer(open) {
  const drawer = document.getElementById("escrowDrawer");
  if (drawer) {
    drawer.classList.toggle("hidden", !open);
    drawer.classList.toggle("flex", open);
  }
}

function openEvalModal(idx) {
  activePilotIndexForAudit = idx;
  const modal = document.getElementById("evalModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  updateModalRubricTotal();
}

function closeEvalModal() {
  const modal = document.getElementById("evalModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function updateModalRubricTotal() {
  const v1 = Number(document.getElementById("modal-range-1").value);
  const v2 = Number(document.getElementById("modal-range-2").value);
  const v3 = Number(document.getElementById("modal-range-3").value);
  const v4 = Number(document.getElementById("modal-range-4").value);
  const v5 = 100;

  document.getElementById("score-val-1").textContent = `${v1}%`;
  document.getElementById("score-val-2").textContent = `${v2}%`;
  document.getElementById("score-val-3").textContent = `${v3}%`;
  document.getElementById("score-val-4").textContent = `${v4}%`;

  const total = Number((v1 * 0.30 + v2 * 0.25 + v3 * 0.20 + v4 * 0.15 + v5 * 0.10).toFixed(1));
  const totalDisplay = document.getElementById("modal-rubric-total");
  if (totalDisplay) {
    totalDisplay.textContent = `${total}%`;
    totalDisplay.className = total >= 85.0 ? "text-2xl font-black font-mono text-emerald-400" : "text-2xl font-black font-mono text-rose-400";
  }

  const submitBtn = document.querySelector("#evalModal .btn-primary");
  if (submitBtn) {
    if (total >= 85.0) {
      submitBtn.textContent = "Approve & Release Tranche";
      submitBtn.className = "btn-primary";
    } else {
      submitBtn.textContent = "Reject (<85% Cutoff)";
      submitBtn.className = "px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer";
    }
  }
}

function confirmApproval() {
  if (activePilotIndexForAudit !== null) {
    const p = pilots[activePilotIndexForAudit];
    const finalScore = Number(document.getElementById("modal-rubric-total").textContent.replace("%", ""));
    p.auditScore = finalScore;

    if (finalScore >= 85.0) {
      p.isApproved = true;
      p.status = "Scale-Up Ready";
      p.coverage = 100;
      p.milestoneCurrent = 4;

      transactions.unshift({
        id: `TX-ESCROW-00${transactions.length + 1}`,
        startup: p.startup,
        amount: p.tranche,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " IST",
        txHash: `0x${Math.random().toString(16).slice(2, 8)}`
      });

      closeEvalModal();
      renderAllViews();
      alert(`✓ Evaluation Approved!\nScore: ${p.auditScore}% (>= 85.0% Required)\nReleased ${formatINR(p.tranche)} from Smart Escrow to ${p.startup}.\nSolution certified for GeM scale-up.`);
    } else {
      p.isApproved = false;
      p.status = "Scale-Up Rejected (<85%)";

      closeEvalModal();
      renderAllViews();
      alert(`✕ Evaluation Not Approved!\nScore: ${p.auditScore}% (Below 85.0% Benchmark)\nEscrow tranche locked. Zero funds released to ${p.startup}.`);
    }
  }
}

function applyToChallenge(idx) {
  challenges[idx].applied = true;
  alert(`✓ Proposal Fast-Track Submitted for ${challenges[idx].title}!`);
  renderAllViews();
}

function handlePostChallenge(e) {
  e.preventDefault();
  challenges.unshift({
    id: `CH-MH-${Date.now().toString().slice(-2)}`,
    title: document.getElementById("post-title").value,
    dept: document.getElementById("post-dept").value,
    budget: Number(document.getElementById("post-budget").value),
    target: document.getElementById("post-kpi").value,
    desc: document.getElementById("post-desc").value,
    published: new Date().toISOString().split("T")[0],
    applied: false
  });
  e.target.reset();
  alert("✓ Problem statement published with attached sandbox architecture!");
  renderAllViews();
}

function showPage(name) {
  const pages = { landing: "page-landing", signin: "page-signin", dashboard: "page-dashboard" };
  Object.keys(pages).forEach((key) => {
    const el = document.getElementById(pages[key]);
    if (el) el.classList.toggle("hidden", key !== name);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (name === "dashboard") {
    switchView("overview");
  }
  if (window.lucide) lucide.createIcons();
}

function setSigninRole(role) {
  const isGov = role === "government";
  document.getElementById("signin-tab-gov").className = isGov ? "py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600/30 border border-indigo-500/40 text-indigo-300" : "py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400";
  document.getElementById("signin-tab-startup").className = !isGov ? "py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-emerald-600/30 border border-emerald-500/40 text-emerald-300" : "py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400";
  document.getElementById("signin-email-label").textContent = isGov ? "Official Government Email" : "Startup Representative Email";
  document.getElementById("signin-email-input").placeholder = isGov ? "officer@department.gov.in" : "founder@startup.in";
}

function handleSignin(e) {
  e.preventDefault();
  showPage("dashboard");
}