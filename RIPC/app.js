// ============ RIPC APP.JS - Application Logic ============

// ========================== NAVIGATION ==========================
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const breadcrumb = document.getElementById('breadcrumb');

const tabLabels = {
  dashboard: 'نظرة عامة',
  regulations: 'الأنظمة واللوائح',
  procedures: 'دورة حياة الترخيص',
  violations: 'المخالفات والجزاءات',
  fines: 'جدول الغرامات',
  compliance: 'قوائم الامتثال',
  prevention: 'منع المخالفات',
  risk: 'مصفوفة المخاطر',
  kpi: 'مؤشرات الأداء KPI',
  reports: 'التقارير التنفيذية',
  database: 'قاعدة البيانات'
};

// ========================== THEME TOGGLE ==========================
let currentTheme = localStorage.getItem('ripc_theme') || 'dark';

function applyTheme() {
  document.documentElement.setAttribute('data-theme', currentTheme);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = currentTheme === 'dark' ? '🌙' : '☀️';
}

function toggleTheme() {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme();
  localStorage.setItem('ripc_theme', currentTheme);
  drawDonutChart();
}

// ========================== LANGUAGE TOGGLE ==========================
function toggleLanguage() {
  const newLang = currentLang === 'ar' ? 'en' : 'ar';
  setLanguage(newLang);
  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) langBtn.textContent = newLang === 'ar' ? 'EN' : 'عربي';
  // Update tab labels from i18n
  Object.keys(tabLabels).forEach(k => {
    if (TRANSLATIONS[newLang]?.nav?.[k]) tabLabels[k] = TRANSLATIONS[newLang].nav[k];
  });
  if (breadcrumb) {
    const activeNav = document.querySelector('.nav-item.active');
    if (activeNav) breadcrumb.textContent = tabLabels[activeNav.dataset.tab] || '';
  }
  // Re-render welcome message in new language
  renderWelcomeMessage();
}

// ========================== SIDEBAR TOGGLE ==========================
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ========================== SUPPORT DROPDOWN ==========================
function toggleSupport() {
  document.getElementById('support-panel').classList.toggle('open');
}

// Close support panel when clicking outside
document.addEventListener('click', (e) => {
  const supportDropdown = document.querySelector('.support-dropdown');
  if (supportDropdown && !supportDropdown.contains(e.target)) {
    document.getElementById('support-panel')?.classList.remove('open');
  }
});

function switchTab(tabName) {
  navItems.forEach(n => n.classList.remove('active'));
  tabContents.forEach(t => t.classList.remove('active'));

  document.getElementById(`nav-${tabName}`)?.classList.add('active');
  document.getElementById(`tab-${tabName}`)?.classList.add('active');
  if (breadcrumb) breadcrumb.textContent = tabLabels[tabName] || tabName;

  // Lazy render
  if (tabName === 'violations' && !window.violationsRendered) {
    renderViolations(VIOLATIONS);
    window.violationsRendered = true;
  }
  if (tabName === 'fines' && !window.finesRendered) {
    renderFines();
    window.finesRendered = true;
  }
  if (tabName === 'compliance' && !window.complianceRendered) {
    renderCompliance();
    window.complianceRendered = true;
  }
  if (tabName === 'risk' && !window.riskRendered) {
    renderRiskMatrix();
    renderRiskTable();
    window.riskRendered = true;
  }
  if (tabName === 'kpi' && !window.kpiRendered) {
    renderKPI();
    window.kpiRendered = true;
  }
}

navItems.forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    switchTab(item.dataset.tab);
    // Close sidebar on mobile
    if (window.innerWidth < 900) document.getElementById('sidebar').classList.remove('open');
  });
});

// Mobile menu toggle
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ========================== ANIMATED COUNTERS ==========================
function animateCounter(el, target, duration = 1500, suffix = '') {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target.toLocaleString('ar-SA') + suffix;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start).toLocaleString('ar-SA') + suffix;
    }
  }, 16);
}

function initCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    animateCounter(el, parseInt(el.dataset.count));
  });
  const maxFineEl = document.getElementById('max-fine');
  if (maxFineEl) animateCounter(maxFineEl, 1000000, 2000);
}

// ========================== DONUT CHART ==========================
function drawDonutChart() {
  const canvas = document.getElementById('severityChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const cx = W / 2, cy = H / 2, r = 70, innerR = 42;

  const data = [
    { val: 8, color: '#ef4444' },
    { val: 14, color: '#f97316' },
    { val: 16, color: '#eab308' },
    { val: 11, color: '#4F9D6F' },
    { val: 3, color: '#94a3b8' }
  ];

  const total = data.reduce((s, d) => s + d.val, 0);
  let angle = -Math.PI / 2;

  ctx.clearRect(0, 0, W, H);

  data.forEach(d => {
    const slice = (d.val / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, r, angle, angle + slice);
    ctx.closePath();
    ctx.fillStyle = d.color;
    ctx.fill();
    angle += slice;
  });

  // Inner circle
  ctx.beginPath();
  ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
  ctx.fillStyle = '#131d35';
  ctx.fill();
}

// ========================== RENDER BARS ==========================
function animateBars() {
  setTimeout(() => {
    document.querySelectorAll('.bar-fill').forEach(bar => {
      const val = bar.dataset.value;
      bar.style.width = val + '%';
    });
  }, 300);
}

// ========================== RENDER REGULATIONS ==========================
function renderRegulations() {
  const grid = document.getElementById('regulations-grid');
  if (!grid) return;
  grid.innerHTML = REGULATIONS.map(r => `
    <div class="reg-card" onclick="showRegulationModal('${r.id}')">
      <div class="reg-card-header">
        <span class="reg-icon">${r.icon}</span>
        <div>
          <div class="reg-title">${r.title}</div>
          <div class="reg-version">${r.version}</div>
        </div>
      </div>
      <div class="reg-meta">
        ${r.tags.map(t => `<span class="reg-tag">${t}</span>`).join('')}
      </div>
      <div class="reg-description">${r.description}</div>
      <div class="reg-footer">
        <span class="reg-date">📅 ${r.issuedDate}</span>
        <a href="${r.url}" target="_blank" class="reg-link" onclick="event.stopPropagation()">الموقع الرسمي ↗</a>
      </div>
    </div>
  `).join('');
}

function showRegulationModal(id) {
  const reg = REGULATIONS.find(r => r.id === id);
  if (!reg) return;
  document.getElementById('modal-content').innerHTML = `
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
      <span style="font-size:40px">${reg.icon}</span>
      <div>
        <h2 style="font-size:18px;margin-bottom:4px">${reg.title}</h2>
        <span style="font-size:12px;color:var(--text-muted)">${reg.id} | ${reg.version}</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px">
      ${[
        ['الجهة المصدرة', reg.issuedBy],
        ['تاريخ الإصدار', reg.issuedDate],
        ['آخر تحديث', reg.lastUpdate],
        ['نطاق التطبيق', reg.scope],
        ['السند النظامي', reg.legalRef]
      ].map(([l,v]) => `
        <div style="background:rgba(255,255,255,0.03);padding:12px;border-radius:8px">
          <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px">${l}</div>
          <div style="font-size:13px">${v}</div>
        </div>
      `).join('')}
    </div>
    <div style="background:rgba(79,157,111,0.06);border:1px solid rgba(79,157,111,0.2);border-radius:8px;padding:14px;margin-bottom:18px">
      <h4 style="font-size:13px;margin-bottom:8px;color:var(--green)">📝 نبذة عن النظام</h4>
      <p style="font-size:13px;color:var(--text-secondary);line-height:1.7">${reg.description}</p>
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px">
      ${reg.tags.map(t => `<span class="reg-tag">${t}</span>`).join('')}
    </div>
    <a href="${reg.url}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:var(--green);color:white;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700">🔗 الاطلاع على الوثيقة الرسمية</a>
  `;
  document.getElementById('modal-overlay').classList.add('open');
}

// ========================== RENDER LIFECYCLE ==========================
function renderLifecycle() {
  const container = document.getElementById('lifecycle-container');
  if (!container) return;
  container.innerHTML = LIFECYCLE_PHASES.map(p => `
    <div class="lifecycle-phase">
      <div class="phase-header" onclick="togglePhase(this)">
        <div class="phase-num">${p.num}</div>
        <div class="phase-title">${p.title}</div>
        <div class="phase-toggle">▼</div>
      </div>
      <div class="phase-body ${p.num <= 3 ? 'open' : ''}">
        <p style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;padding-top:14px;border-top:1px solid var(--border-light)">${p.details}</p>
        <div class="phase-grid">
          ${[
            ['المدخلات', p.inputs],
            ['المخرجات', p.outputs],
            ['المسؤول', p.responsible],
            ['المدة الزمنية', p.duration],
            ['الشروط النظامية', p.conditions],
            ['المستندات المطلوبة', p.documents.join(' • ')]
          ].map(([l,v]) => `
            <div class="phase-item">
              <div class="phase-item-label">${l}</div>
              <div class="phase-item-value">${v}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

function togglePhase(header) {
  const body = header.nextElementSibling;
  const toggle = header.querySelector('.phase-toggle');
  body.classList.toggle('open');
  toggle.textContent = body.classList.contains('open') ? '▲' : '▼';
}

// ========================== RENDER VIOLATIONS ==========================
function renderViolations(data) {
  const tbody = document.getElementById('violations-tbody');
  if (!tbody) return;
  tbody.innerHTML = data.map((v, i) => `
    <tr onclick="showViolationModal('${v.id}')" style="cursor:pointer">
      <td style="color:var(--text-muted);font-size:11px">${v.id}</td>
      <td style="font-weight:600;color:var(--text-primary)">${v.title}</td>
      <td><span style="font-size:11px;padding:2px 8px;background:rgba(255,255,255,0.05);border-radius:8px">${v.category}</span></td>
      <td><span class="severity-badge ${getSeverityClass(v.severity)}">${v.severity}</span></td>
      <td style="font-weight:700;color:${getFineColor(v.fine)}">${v.fine.toLocaleString('ar-SA')} ر.س</td>
      <td style="font-size:11px;color:var(--text-muted)">×${v.repeatMultiplier}</td>
      <td style="font-size:12px;color:var(--text-secondary)">${v.action}</td>
      <td style="font-size:11px;color:var(--text-muted)">${v.impact}</td>
    </tr>
  `).join('');
}

function getSeverityClass(sev) {
  const map = { 'حرجة': 'sev-critical', 'جسيمة': 'sev-high', 'متوسطة': 'sev-medium', 'غير جسيمة': 'sev-low', 'بسيطة': 'sev-minor' };
  return map[sev] || 'sev-minor';
}

function getFineColor(fine) {
  if (fine >= 50000) return '#ef4444';
  if (fine >= 20000) return '#f97316';
  if (fine >= 8000) return '#eab308';
  if (fine >= 3000) return '#4F9D6F';
  return '#94a3b8';
}

function filterViolations() {
  const cat = document.getElementById('violation-filter-category').value;
  const sev = document.getElementById('violation-filter-severity').value;
  const search = document.getElementById('violation-search').value.toLowerCase();

  const filtered = VIOLATIONS.filter(v => {
    const matchCat = !cat || v.category.includes(cat);
    const matchSev = !sev || v.severity === sev;
    const matchSearch = !search || v.title.includes(search) || v.action.includes(search);
    return matchCat && matchSev && matchSearch;
  });

  renderViolations(filtered);
}

function showViolationModal(id) {
  const v = VIOLATIONS.find(x => x.id === id);
  if (!v) return;
  document.getElementById('modal-content').innerHTML = `
    <div style="margin-bottom:20px">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span class="severity-badge ${getSeverityClass(v.severity)}">${v.severity}</span>
        <span style="font-size:11px;color:var(--text-muted)">${v.id}</span>
      </div>
      <h2 style="font-size:17px;line-height:1.5">${v.title}</h2>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px">
      ${[
        ['الفئة', v.category],
        ['الغرامة الأساسية', v.fine.toLocaleString('ar-SA') + ' ر.س'],
        ['معامل التكرار', '×' + v.repeatMultiplier],
        ['الغرامة عند التكرار', (v.fine * v.repeatMultiplier).toLocaleString('ar-SA') + ' ر.س'],
        ['السند النظامي', v.legalRef],
        ['مستوى التأثير', v.impact]
      ].map(([l,val]) => `
        <div style="background:rgba(255,255,255,0.03);padding:12px;border-radius:8px">
          <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;margin-bottom:4px">${l}</div>
          <div style="font-size:13px;font-weight:600">${val}</div>
        </div>
      `).join('')}
    </div>
    <div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.2);border-radius:8px;padding:14px;margin-bottom:14px">
      <h4 style="font-size:13px;margin-bottom:8px;color:#ef4444">🛠️ الإجراء التصحيحي</h4>
      <p style="font-size:13px;color:var(--text-secondary)">${v.action}</p>
    </div>
    <div style="background:rgba(79,157,111,0.06);border:1px solid rgba(79,157,111,0.2);border-radius:8px;padding:14px">
      <h4 style="font-size:13px;margin-bottom:8px;color:var(--green)">💡 كيفية التفادي</h4>
      <p style="font-size:13px;color:var(--text-secondary)">الالتزام بـ ${v.legalRef} وإجراء مراجعة يومية للامتثال. التوثيق الجيد وتدريب الفريق على المتطلبات الخاصة بهذا البند.</p>
    </div>
  `;
  document.getElementById('modal-overlay').classList.add('open');
}

// ========================== RENDER FINES ==========================
function renderFines() {
  const grid = document.getElementById('fines-grid');
  if (!grid) return;
  grid.innerHTML = FINES_DATA.map(f => `
    <div class="fine-card" style="border-top:3px solid ${f.color}">
      <div class="fine-card-header">
        <span style="font-size:24px">${f.icon}</span>
        <span class="fine-category" style="color:${f.color}">${f.category}</span>
      </div>
      <div class="fine-amounts">
        <div class="fine-amount-item">
          <div class="fine-amount-label">الحد الأدنى</div>
          <div class="fine-amount-value fine-min">${f.minFine.toLocaleString('ar-SA')}</div>
        </div>
        <div class="fine-amount-item">
          <div class="fine-amount-label">الحد الأقصى</div>
          <div class="fine-amount-value fine-max">${f.maxFine.toLocaleString('ar-SA')}</div>
        </div>
        <div class="fine-amount-item">
          <div class="fine-amount-label">التكرار</div>
          <div class="fine-amount-value fine-repeat">${f.repeatFine}</div>
        </div>
      </div>
      <div class="fine-notes">${f.notes}</div>
    </div>
  `).join('');
}

// ========================== RENDER COMPLIANCE ==========================
function renderCompliance() {
  const container = document.getElementById('checklist-container');
  if (!container) return;
  container.innerHTML = COMPLIANCE_CHECKLISTS.map(cl => `
    <div class="checklist-section">
      <div class="checklist-section-header">
        <span class="checklist-section-icon">${cl.icon}</span>
        <span class="checklist-section-title">${cl.title}</span>
        <span class="checklist-section-badge" style="background:rgba(255,255,255,0.05);color:${cl.badgeColor};border:1px solid ${cl.badgeColor}">${cl.badge}</span>
        <span style="font-size:12px;color:var(--text-muted)">${cl.items.length} بند</span>
      </div>
      <div class="checklist-items">
        ${cl.items.map((item, idx) => `
          <div class="checklist-item" id="ci-${cl.id}-${idx}" onclick="toggleChecklistItem('${cl.id}', ${idx})">
            <div class="checklist-checkbox"></div>
            <div class="checklist-text">${item.text}</div>
            <span class="checklist-priority" style="background:${item.priorityColor}20;color:${item.priorityColor}">${item.priority}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function toggleChecklistItem(clId, idx) {
  const el = document.getElementById(`ci-${clId}-${idx}`);
  el.classList.toggle('checked');
  const cb = el.querySelector('.checklist-checkbox');
  cb.textContent = el.classList.contains('checked') ? '✓' : '';
}

// ========================== RENDER PREVENTION ==========================
function renderPrevention() {
  const container = document.getElementById('prevention-phases');
  if (!container) return;
  container.innerHTML = PREVENTION_GUIDE.map(phase => `
    <div class="prevention-phase">
      <div class="prevention-phase-header">
        <span class="prevention-phase-icon">${phase.icon}</span>
        <div>
          <div class="prevention-phase-title">${phase.title}</div>
          <div class="prevention-phase-sub">${phase.subtitle}</div>
        </div>
      </div>
      <div class="prevention-items-grid">
        ${phase.items.map((item, i) => `
          <div class="prevention-item">
            <div class="pi-num">${i + 1}</div>
            <div class="pi-text">
              <strong>${item.title}</strong>
              <p>${item.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ========================== RENDER RISK MATRIX ==========================
function renderRiskMatrix() {
  const grid = document.getElementById('risk-matrix');
  if (!grid) return;

  const levels = { 1: 'نادر', 2: 'محتمل', 3: 'متوسط', 4: 'مرتفع', 5: 'شبه مؤكد' };
  const impacts = { 1: 'ضئيل', 2: 'خفيف', 3: 'متوسط', 4: 'كبير', 5: 'كارثي' };

  // Header row
  grid.innerHTML = '<div class="matrix-cell matrix-header-col"></div>';
  for (let i = 1; i <= 5; i++) {
    grid.innerHTML += `<div class="matrix-cell matrix-header-col">${impacts[i]}</div>`;
  }

  for (let p = 5; p >= 1; p--) {
    grid.innerHTML += `<div class="matrix-cell matrix-header-row">${levels[p]}</div>`;
    for (let im = 1; im <= 5; im++) {
      const score = p * im;
      let cls = score <= 4 ? 'matrix-low' : score <= 9 ? 'matrix-medium' : score <= 15 ? 'matrix-high' : 'matrix-critical';
      const risks = RISK_DATA.filter(r => r.probability === p && r.impact === im);
      grid.innerHTML += `<div class="matrix-cell ${cls}" title="${risks.map(r => r.risk).join(', ')}">${score}${risks.length > 0 ? `<br><small style="font-size:9px">${risks.length} مخاطر</small>` : ''}</div>`;
    }
  }
}

function renderRiskTable() {
  const tbody = document.getElementById('risk-table-body');
  if (!tbody) return;
  tbody.innerHTML = RISK_DATA.map((r, i) => {
    const score = r.probability * r.impact;
    let level = score <= 4 ? '🟢 منخفض' : score <= 9 ? '🟡 متوسط' : score <= 15 ? '🟠 عالٍ' : '🔴 حرج';
    return `
      <tr>
        <td>${r.id}</td>
        <td style="font-weight:600">${r.risk}</td>
        <td><span style="font-size:11px;padding:2px 8px;background:rgba(255,255,255,0.05);border-radius:8px">${r.category}</span></td>
        <td style="text-align:center">${r.probability}/5</td>
        <td style="text-align:center">${r.impact}/5</td>
        <td style="font-weight:700;font-size:15px">${level} (${score})</td>
        <td style="font-size:12px;color:var(--text-muted)">${r.strategy}</td>
      </tr>
    `;
  }).join('');
}

// ========================== RENDER KPI ==========================
function renderKPI() {
  const grid = document.getElementById('kpi-grid');
  if (!grid) return;
  grid.innerHTML = KPI_DATA.map(k => `
    <div class="kpi-card">
      <div class="kpi-header">
        <span class="kpi-name">${k.name}</span>
        <span class="kpi-icon">${k.icon}</span>
      </div>
      <div class="kpi-value-row">
        <span class="kpi-value" style="color:${k.color}">${k.value.toLocaleString('ar-SA')}</span>
        <span class="kpi-unit">${k.unit}</span>
      </div>
      <div class="kpi-progress-wrap">
        <div class="kpi-progress-fill" style="width:${k.progress}%;background:${k.color}" data-progress="${k.progress}"></div>
      </div>
      <div class="kpi-meta">
        <span class="kpi-target">الهدف: ${k.target}</span>
        <span class="kpi-status ${k.status}">${k.statusText}</span>
      </div>
    </div>
  `).join('');
  // Animate progress bars
  setTimeout(() => {
    document.querySelectorAll('.kpi-progress-fill').forEach(bar => {
      bar.style.width = bar.dataset.progress + '%';
    });
  }, 300);
}

// ========================== RENDER REPORTS ==========================
function renderReports() {
  const grid = document.getElementById('reports-grid');
  if (!grid) return;
  grid.innerHTML = REPORTS.map(r => `
    <div class="report-card" onclick="showReportModal('${r.title}')">
      <div class="report-icon">${r.icon}</div>
      <div class="report-title" style="color:${r.color}">${r.title}</div>
      <div class="report-desc">${r.desc}</div>
      <div class="report-footer">
        <span class="report-sections">${r.sections}</span>
        <button class="report-btn" onclick="event.stopPropagation();showReportModal('${r.title}')">عرض التقرير</button>
      </div>
    </div>
  `).join('');
}

function showReportModal(title) {
  const r = REPORTS.find(x => x.title === title);
  if (!r) return;
  document.getElementById('modal-content').innerHTML = `
    <div style="margin-bottom:20px;border-bottom:1px solid var(--border-light);padding-bottom:20px">
      <div style="font-size:40px;margin-bottom:10px">${r.icon}</div>
      <h2 style="font-size:20px;color:${r.color}">${r.title}</h2>
      <p style="font-size:13px;color:var(--text-muted);margin-top:6px">${r.sections}</p>
    </div>
    <div style="margin-bottom:18px">
      <p style="font-size:14px;color:var(--text-secondary);line-height:1.7">${r.desc}</p>
    </div>
    <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:16px;margin-bottom:18px">
      <h4 style="font-size:13px;margin-bottom:10px;">📋 محتوى التقرير</h4>
      <p style="font-size:13px;color:var(--text-secondary);line-height:1.7">${r.content}</p>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap">
      <button onclick="exportToPDF()" style="background:var(--green);color:white;border:none;padding:10px 18px;border-radius:8px;font-family:inherit;font-size:13px;font-weight:700;cursor:pointer">📕 تصدير PDF</button>
      <button onclick="exportToExcel()" style="background:rgba(255,255,255,0.08);color:var(--text-primary);border:1px solid var(--border-light);padding:10px 18px;border-radius:8px;font-family:inherit;font-size:13px;cursor:pointer">📊 Excel</button>
    </div>
  `;
  document.getElementById('modal-overlay').classList.add('open');
}

// ========================== RENDER DATABASE ==========================
function renderDatabase() {
  const container = document.getElementById('db-tables');
  if (!container) return;
  container.innerHTML = `
    <div>
      <h3 class="db-section-title">📋 جدول الأنظمة واللوائح (${REGULATIONS.length} سجل)</h3>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>الرقم</th><th>العنوان</th><th>الإصدار</th><th>الجهة المصدرة</th><th>التاريخ</th><th>نطاق التطبيق</th></tr>
          </thead>
          <tbody>
            ${REGULATIONS.map(r => `
              <tr>
                <td style="color:var(--text-muted);font-size:11px">${r.id}</td>
                <td style="font-weight:600">${r.title}</td>
                <td>${r.version}</td>
                <td>${r.issuedBy}</td>
                <td>${r.issuedDate}</td>
                <td style="font-size:12px;color:var(--text-muted)">${r.scope}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div>
      <h3 class="db-section-title">⚠️ جدول المخالفات (${VIOLATIONS.length} مخالفة)</h3>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>الرقم</th><th>المخالفة</th><th>الفئة</th><th>التصنيف</th><th>الغرامة (ر.س)</th><th>الإجراء التصحيحي</th></tr>
          </thead>
          <tbody>
            ${VIOLATIONS.map(v => `
              <tr>
                <td style="color:var(--text-muted);font-size:11px">${v.id}</td>
                <td style="font-weight:600">${v.title}</td>
                <td>${v.category}</td>
                <td><span class="severity-badge ${getSeverityClass(v.severity)}">${v.severity}</span></td>
                <td style="font-weight:700;color:${getFineColor(v.fine)}">${v.fine.toLocaleString('ar-SA')}</td>
                <td style="font-size:12px">${v.action}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
    <div>
      <h3 class="db-section-title">🎯 جدول مؤشرات الأداء (${KPI_DATA.length} مؤشر)</h3>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>الرقم</th><th>المؤشر</th><th>القيمة الحالية</th><th>الوحدة</th><th>المستهدف</th><th>الحالة</th></tr>
          </thead>
          <tbody>
            ${KPI_DATA.map(k => `
              <tr>
                <td style="color:var(--text-muted);font-size:11px">${k.id}</td>
                <td style="font-weight:600">${k.name}</td>
                <td style="font-weight:700;color:${k.color}">${k.value}</td>
                <td>${k.unit}</td>
                <td>${k.target}</td>
                <td><span class="kpi-status ${k.status}">${k.statusText}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ========================== GLOBAL SEARCH ==========================
document.getElementById('global-search').addEventListener('input', function() {
  const q = this.value.trim();
  if (q.length < 2) return;
  const results = VIOLATIONS.filter(v => v.title.includes(q) || v.category.includes(q)).slice(0, 5);
  // Simple: switch to violations tab if results found
  if (results.length > 0) {
    switchTab('violations');
    if (!window.violationsRendered) {
      renderViolations(VIOLATIONS);
      window.violationsRendered = true;
    }
    document.getElementById('violation-search').value = q;
    filterViolations();
  }
});

// ========================== MODAL ========================== 
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ========================== EXPORT FUNCTIONS ==========================
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function exportData() {
  exportToCSV('all');
}

function exportViolationsCSV() {
  exportToCSV('violations');
}

function exportViolationsExcel() {
  exportToExcel();
}

function exportToCSV(type) {
  let csv = '';
  let filename = 'RIPC_data.csv';

  if (type === 'violations' || type === 'all') {
    csv = 'رقم المخالفة,وصف المخالفة,الفئة,التصنيف,الغرامة (ر.س),معامل التكرار,الإجراء التصحيحي,التأثير,السند النظامي\n';
    VIOLATIONS.forEach(v => {
      csv += `${v.id},"${v.title}",${v.category},${v.severity},${v.fine},×${v.repeatMultiplier},"${v.action}",${v.impact},"${v.legalRef}"\n`;
    });
    filename = 'RIPC_violations.csv';
  }

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  showToast('✅ تم تصدير الملف CSV بنجاح');
}

function exportToExcel() {
  // Export CSV with Excel-friendly format
  exportToCSV('all');
  showToast('✅ يمكنك فتح ملف CSV في Excel مباشرة');
}

function exportToJSON() {
  const data = {
    regulations: REGULATIONS,
    violations: VIOLATIONS,
    fines: FINES_DATA,
    kpis: KPI_DATA,
    lifecycle: LIFECYCLE_PHASES,
    risks: RISK_DATA,
    exportDate: new Date().toISOString(),
    source: 'ripc.gov.sa'
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'RIPC_knowledge_base.json';
  a.click();
  showToast('✅ تم تصدير قاعدة البيانات JSON');
}

function exportToPDF() {
  window.print();
  showToast('📕 جاري فتح نافذة الطباعة...');
}

function showPowerBI() {
  showToast('📈 يمكن ربط قاعدة البيانات JSON بـ Power BI مباشرة');
}

function showSAP() {
  showToast('⚙️ يتوفر ملف CSV للاستيراد إلى SAP/Oracle ERP');
}

// ========================== INITIALIZE ==========================
function init() {
  // Apply saved theme
  document.documentElement.setAttribute('data-theme', currentTheme);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = currentTheme === 'dark' ? '🌙' : '☀️';

  renderRegulations();
  renderLifecycle();
  renderPrevention();
  renderReports();
  renderDatabase();
  drawDonutChart();
  initCounters();
  animateBars();
  // Initialize AI chat
  if (typeof initAIChat === 'function') initAIChat();
}

window.addEventListener('load', init);
