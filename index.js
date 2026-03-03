// ============================================================
// MOBILE SIDEBAR
// ============================================================
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const btn = document.getElementById('hamburger-btn');
  const isOpen = sidebar.classList.contains('mobile-open');
  if (isOpen) {
    closeSidebar();
  } else {
    sidebar.classList.add('mobile-open');
    overlay.classList.add('active');
    btn.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  const btn = document.getElementById('hamburger-btn');
  sidebar.classList.remove('mobile-open');
  overlay.classList.remove('active');
  btn.classList.remove('open');
  document.body.style.overflow = '';
}

// ============================================================
// NAVIGATION & VIEW SYSTEM
// ============================================================
function showDashboard() {
  document.getElementById('landing-page').classList.remove('active');
  document.getElementById('dashboard-page').classList.add('active');
  window.scrollTo(0, 0);
  setTimeout(initCharts, 150);
}

const viewMeta = {
  overview:         { title: 'Overview',               subtitle: 'Genetic Skin Health Summary' },
  allergies:        { title: 'Allergies',               subtitle: '4 traits analyzed' },
  dermatological:   { title: 'Dermatological Diseases', subtitle: '15 traits analyzed' },
  aesthetics:       { title: 'Skin Aesthetics',         subtitle: '8 traits analyzed' },
  markers:          { title: 'Skin Health Markers',     subtitle: '2 biomarkers analyzed' },
  recommendations:  { title: 'Recommendations',         subtitle: 'Personalized action plan' },
};

function updateTopbarFilterVisibility(viewId) {
  const filterGroup = document.querySelector('.filter-group');
  if (!filterGroup) return;
  filterGroup.style.display = (viewId === 'overview') ? 'none' : 'flex';
}

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('view-' + viewId)?.classList.add('active');
  document.querySelector(`.nav-item[data-view="${viewId}"]`)?.classList.add('active');
  const meta = viewMeta[viewId] || {};
  document.getElementById('page-title').textContent = meta.title || '';
  document.getElementById('page-subtitle').textContent = meta.subtitle || '';
  document.getElementById('risk-filter').value = 'all';
  updateTopbarFilterVisibility(viewId);
  if (viewId === 'overview') setTimeout(initCharts, 50);

  // Sync mobile bottom nav
  document.querySelectorAll('.mbn-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewId);
  });

  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 1024) closeSidebar();

  // Scroll main content to top
  const mc = document.querySelector('.main-content');
  if (mc) mc.scrollTo({ top: 0, behavior: 'smooth' });
}

function filterTraits(query) {
  const q = query.toLowerCase();
  document.querySelectorAll('.trait-card').forEach(card => {
    const name = card.querySelector('.trait-name')?.textContent.toLowerCase() || '';
    const desc = card.querySelector('.trait-desc')?.textContent.toLowerCase() || '';
    card.style.display = (name.includes(q) || desc.includes(q)) ? '' : 'none';
  });
}

function filterByRisk(level) {
  document.querySelectorAll('.trait-card').forEach(card => {
    card.style.display = (level === 'all' || card.dataset.risk === level) ? '' : 'none';
  });
}

function sortTraitCardsByRisk() {
  const riskOrder = {
    'very-high': 0,
    'high': 1,
    'medium': 2,
    'low': 3,
    'very-low': 4
  };

  document.querySelectorAll('.traits-grid').forEach(grid => {
    const cards = Array.from(grid.querySelectorAll('.trait-card'));
    cards
      .sort((a, b) => (riskOrder[a.dataset.risk] ?? 99) - (riskOrder[b.dataset.risk] ?? 99))
      .forEach(card => grid.appendChild(card));
  });
}

function getRoutineProfileKey() {
  const cards = Array.from(document.querySelectorAll('.trait-card[data-risk]'));
  if (!cards.length) return 'medium';

  const riskWeights = { 'very-high': 5, 'high': 4, 'medium': 3, 'low': 2, 'very-low': 1 };
  const counts = { 'very-high': 0, 'high': 0, 'medium': 0, 'low': 0, 'very-low': 0 };
  let weightedSum = 0;

  cards.forEach(card => {
    const risk = card.dataset.risk;
    if (!(risk in riskWeights)) return;
    counts[risk] += 1;
    weightedSum += riskWeights[risk];
  });

  const avg = weightedSum / cards.length;
  let profile = 'very-low';
  if (avg >= 4.2) profile = 'very-high';
  else if (avg >= 3.5) profile = 'high';
  else if (avg >= 2.6) profile = 'medium';
  else if (avg >= 1.8) profile = 'low';

  // Escalate one level for concentrated high-severity outliers.
  if (counts['very-high'] >= 2) {
    if (profile === 'medium') profile = 'high';
    if (profile === 'high') profile = 'very-high';
  }
  return profile;
}

function renderRoutineBuilder() {
  const card = document.getElementById('routine-builder-card');
  const morningList = document.getElementById('routine-morning-list');
  const nightList = document.getElementById('routine-night-list');
  const badge = document.getElementById('routine-profile-badge');
  const subtitle = document.getElementById('routine-sub');
  const footer = document.getElementById('routine-footer-note');
  const progressMeta = document.getElementById('routine-progress-meta');
  const progressFill = document.getElementById('routine-progress-fill');

  if (!card || !morningList || !nightList || !badge || !subtitle || !footer || !progressMeta || !progressFill) return;

  const routineProfiles = {
    'very-high': {
      label: 'Very High Focus',
      subtitle: 'Your routine prioritizes UV protection, inflammation control, and skin-monitoring habits.',
      morning: [
        'Apply broad-spectrum mineral SPF 50+ before sun exposure.',
        'Use antioxidant serum (Vitamin C or niacinamide) to reduce oxidative stress.',
        'Wear UV-protective clothing or hat if outdoors >15 minutes.',
        'Photograph any evolving lesion or unusual irritation once weekly.'
      ],
      night: [
        'Double cleanse gently to remove UV filters and pollutants.',
        'Apply barrier-repair moisturizer with ceramides and panthenol.',
        'Do a 60-second skin check for new/changing spots (ABCDE).',
        'Log today\'s trigger events (heat, friction, allergens, stress).'
      ],
      note: 'High-risk profile: consistency matters more than product count.'
    },
    'high': {
      label: 'High Focus',
      subtitle: 'This routine emphasizes prevention and calm-skin maintenance across high-risk traits.',
      morning: [
        'Use a low-irritant cleanser and apply SPF 50.',
        'Add a calming active (niacinamide 4-5% or azelaic acid).',
        'Reapply sunscreen around midday when outdoors.',
        'Avoid known irritants (fragrance, harsh exfoliants).'
      ],
      night: [
        'Cleanse gently and avoid over-scrubbing.',
        'Use ceramide-rich moisturizer to support barrier recovery.',
        'Apply anti-inflammatory serum if redness or itching appears.',
        'Track skin response and flare frequency in your log.'
      ],
      note: 'High-risk profile: prevention reduces cumulative flare burden.'
    },
    'medium': {
      label: 'Balanced Focus',
      subtitle: 'A steady preventive routine keeps medium-risk traits stable over time.',
      morning: [
        'Cleanse gently and apply daily SPF 30+.',
        'Use hydrating serum to maintain barrier resilience.',
        'Keep UV and heat exposure moderate during peak hours.',
        'Stay hydrated and watch for new irritation patterns.'
      ],
      night: [
        'Remove sunscreen and makeup fully before sleep.',
        'Apply moisturizer with humectants + lipids.',
        'Use active treatment 2-3 nights/week only if tolerated.',
        'Note skin comfort score (1-5) in your checklist.'
      ],
      note: 'Balanced profile: a simple routine with high adherence works best.'
    },
    'low': {
      label: 'Low-Risk Maintenance',
      subtitle: 'Focus on protecting your baseline skin health and preserving long-term resilience.',
      morning: [
        'Use lightweight cleanser and SPF 30+.',
        'Apply moisturizer to prevent barrier dehydration.',
        'Avoid unnecessary product switching.',
        'Limit direct midday UV when possible.'
      ],
      night: [
        'Cleanse and moisturize consistently.',
        'Use gentle active care (retinoid/AHA) only as needed.',
        'Spot-check for dryness or irritation.',
        'Keep a weekly skin photo for trend tracking.'
      ],
      note: 'Low-risk profile: maintain habits to preserve protective advantages.'
    },
    'very-low': {
      label: 'Protective Profile',
      subtitle: 'You have a favorable genetic baseline; keep routines consistent and minimal.',
      morning: [
        'Cleanse lightly and apply SPF 30.',
        'Use basic moisturizer to lock hydration.',
        'Keep routine minimal to avoid unnecessary irritation.',
        'Support skin health with hydration and sleep.'
      ],
      night: [
        'Gentle cleanse before bed.',
        'Apply nourishing moisturizer or overnight barrier cream.',
        'Use actives sparingly and only when needed.',
        'Review weekly routine completion for consistency.'
      ],
      note: 'Protective profile: consistency and prevention sustain low risk.'
    }
  };

  const profileKey = getRoutineProfileKey();
  const profile = routineProfiles[profileKey] || routineProfiles.medium;
  const dayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `routine_builder:${profileKey}:${dayKey}`;

  let state = { morning: profile.morning.map(() => false), night: profile.night.map(() => false) };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    if (Array.isArray(saved.morning) && saved.morning.length === profile.morning.length) state.morning = saved.morning;
    if (Array.isArray(saved.night) && saved.night.length === profile.night.length) state.night = saved.night;
  } catch (_) {}

  badge.textContent = `Profile: ${profile.label}`;
  subtitle.textContent = profile.subtitle;
  footer.textContent = profile.note;
  badge.classList.remove('risk-very-high', 'risk-high', 'risk-medium', 'risk-low', 'risk-very-low');
  badge.classList.add(`risk-${profileKey}`);

  function saveState() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch (_) {}
  }

  function updateProgress() {
    const total = state.morning.length + state.night.length;
    const completed = state.morning.filter(Boolean).length + state.night.filter(Boolean).length;
    const pct = total ? Math.round((completed / total) * 100) : 0;
    progressMeta.textContent = `${completed}/${total} completed today`;
    progressFill.style.width = `${pct}%`
  }

  function renderList(targetEl, period, items) {
    targetEl.innerHTML = items.map((text, idx) => `
      <li>
        <button type="button" class="routine-item-btn ${state[period][idx] ? 'checked' : ''}" data-period="${period}" data-index="${idx}">
          <span class="routine-check" aria-hidden="true"></span>
          <span class="routine-item-text">${text}</span>
        </button>
      </li>
    `).join('');
  }

  renderList(morningList, 'morning', profile.morning);
  renderList(nightList, 'night', profile.night);
  updateProgress();

  card.querySelectorAll('.routine-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const period = btn.dataset.period;
      const index = Number(btn.dataset.index);
      if (!state[period] || Number.isNaN(index) || index < 0 || index >= state[period].length) return;
      state[period][index] = !state[period][index];
      btn.classList.toggle('checked', state[period][index]);
      saveState();
      updateProgress();
    });
  });
}

function triggerDownload() {
  alert('📄 Your report PDF is downloaded.');
}

// ============================================================
// CHARTS
// ============================================================
let scoreChartInst, polarChartInst, bioChartInst;
let chartsInitialized = false;

function initCharts() {
  if (chartsInitialized) return;
  chartsInitialized = true;

  // Score donut
  const scoreCtx = document.getElementById('scoreChart')?.getContext('2d');
  if (scoreCtx) {
    scoreChartInst = new Chart(scoreCtx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [74, 26],
          backgroundColor: ['#D4A853', '#EFE9DF'],
          borderWidth: 0,
          borderRadius: 6,
        }]
      },
      options: {
        cutout: '72%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: { duration: 1200, easing: 'easeInOutQuart' }
      }
    });
  }

  // Polar chart
  const polarCtx = document.getElementById('polarChart')?.getContext('2d');
  if (polarCtx) {
    polarChartInst = new Chart(polarCtx, {
      type: 'polarArea',
      data: {
        labels: ['Allergies', 'Dermatological', 'Aesthetics', 'Markers'],
        datasets: [{
          data: [55, 82, 48, 63],
          backgroundColor: [
            'rgba(123,158,135,0.55)',
            'rgba(193,99,74,0.55)',
            'rgba(212,168,83,0.55)',
            'rgba(107,174,214,0.55)',
          ],
          borderColor: ['#7B9E87','#C1634A','#D4A853','#6BAED6'],
          hoverBackgroundColor: [
            'rgba(123,158,135,0.85)',
            'rgba(193,99,74,0.85)',
            'rgba(212,168,83,0.85)',
            'rgba(107,174,214,0.85)',
          ],
          hoverBorderColor: ['#7B9E87','#C1634A','#D4A853','#6BAED6'],
          hoverBorderWidth: 2.5,
          hoverOffset: 10,
          borderWidth: 1.5,
        }]
      },
      options: {
        interaction: { mode: 'nearest', intersect: true },
        onHover: (event, activeElements) => {
          const canvas = event?.native?.target;
          if (canvas) canvas.style.cursor = activeElements.length ? 'pointer' : 'default';
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { family: 'Outfit', size: 12 }, color: '#6B6357', padding: 16, boxWidth: 12 }
          }
        },
        scales: {
          r: {
            ticks: { display: false },
            grid: { color: '#EFE9DF' },
            pointLabels: { font: { family: 'Outfit', size: 11 }, color: '#6B6357' }
          }
        },
        animation: { duration: 1000, easing: 'easeInOutQuart' }
      }
    });
  }
}

function initBiomarkerChart() {
  if (bioChartInst) return;
  const ctx = document.getElementById('biomarkerChart')?.getContext('2d');
  if (!ctx) return;
  bioChartInst = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Kallikrein-7', 'Ceramide'],
      datasets: [{
        label: 'Your Genetic Set Point',
        data: [83, 10],
        backgroundColor: ['rgba(212,168,83,0.7)', 'rgba(74,112,85,0.7)'],
        borderColor: ['#D4A853', '#4A7055'],
        borderWidth: 1.5, borderRadius: 8,
      }, {
        label: 'Population Average (50th percentile)',
        data: [50, 50],
        backgroundColor: ['rgba(0,0,0,0.06)', 'rgba(0,0,0,0.06)'],
        borderColor: ['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.15)'],
        borderWidth: 1, borderRadius: 8,
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { labels: { font: { family: 'Outfit', size: 12 }, color: '#6B6357' } }
      },
      scales: {
        x: {
          max: 100, grid: { color: '#EFE9DF' },
          ticks: { font: { family: 'Outfit', size: 11 }, color: '#9E9589', callback: v => v + 'th %ile' }
        },
        y: { ticks: { font: { family: 'Outfit', size: 13 }, color: '#1A1A1A' }, grid: { display: false } }
      },
      animation: { duration: 900 }
    }
  });
}

// Override showView for markers to init biomarker chart
const _origShowView = showView;
window.showView = function(id) {
  _origShowView(id);
  if (id === 'markers') setTimeout(initBiomarkerChart, 100);
};

// ============================================================
// TRAIT MODAL DATA
// ============================================================
const traitData = {
  mosquito: {
    name: 'Mosquito Bite Sensitivity', category: 'Allergies', risk: 'high',
    prs: '1.88', percentile: '81st',
    description: 'IL-4 and IgE pathway variants indicate an elevated immune response to mosquito salivary antigens, predicting increased whealing and pruritus following bites. This reflects a Th2-skewed immune phenotype with heightened mast cell degranulation.',
    recs: ['Use DEET-based or picaridin insect repellents when outdoors', 'Apply antihistamine cream immediately after bites to reduce whealing', 'Consider oral antihistamine prophylaxis in high-exposure environments', 'Wear long-sleeved, light-colored clothing during dawn and dusk'],
    genes: 'IL4 · FCER1A rs2298805 · IL13 rs1800925'
  },
  keratinocyte: {
    name: 'Keratinocyte Cancer', category: 'Dermatological Diseases', risk: 'very-high',
    prs: '2.31', percentile: '92nd',
    description: 'Multiple GWAS risk loci in keratinocyte-differentiation genes converge on very high lifetime risk for squamous cell carcinoma of the skin. This finding warrants immediate clinical attention and regular dermatological monitoring.',
    recs: ['Annual full-body dermatological examination with dermoscopy', 'Apply broad-spectrum SPF 50+ sunscreen daily', 'Avoid tanning beds completely', 'Report any non-healing lesions, sores, or new growths promptly'],
    genes: 'KRT5 rs11170164 · TP53 rs1042522 · CDKN2A Δ16bp'
  },
  nonmelanoma: {
    name: 'Non-Melanoma Skin Cancer', category: 'Dermatological Diseases', risk: 'very-high',
    prs: '2.47', percentile: '95th',
    description: 'MC1R, PTCH1, and TP53 variants converge to significantly elevate squamous and basal cell carcinoma risk. Your PRS places you in the top 5% of the population for this trait.',
    recs: ['Begin annual dermatological screening immediately if not already doing so', 'Apply mineral SPF 50+ (zinc/titanium) each morning', 'Seek shade between 10am–4pm; wear UPF clothing', 'Self-examine skin monthly using the ABCDE method'],
    genes: 'MC1R p.R160W · PTCH1 rs357564 · OCA2 rs1800407'
  },
  psoriasis: {
    name: 'Psoriasis', category: 'Dermatological Diseases', risk: 'high',
    prs: '1.94', percentile: '85th',
    description: 'HLA-C*06:02 and IL-23/IL-17 pathway variants significantly increase psoriasis susceptibility. This combination is the most important genetic risk factor for plaque psoriasis.',
    recs: ['Avoid known triggers: stress, infections, NSAIDs, lithium', 'Use fragrance-free, pH-balanced skincare products', 'Consider early dermatological consultation for treatment planning', 'Monitor for psoriatic arthritis symptoms (joint pain, stiffness)'],
    genes: 'HLA-C*06:02 · IL23R rs11209026 · CARD14 rs11652075'
  },
  rosacea: {
    name: 'Rosacea', category: 'Dermatological Diseases', risk: 'high',
    prs: '1.78', percentile: '80th',
    description: 'Cathelicidin (LL-37) and inflammatory vascular response gene variants show elevated rosacea predisposition. VEGF-related and TLR2 variants amplify facial inflammatory responses to triggers.',
    recs: ['Identify and avoid personal triggers (alcohol, spicy foods, UV, heat)', 'Use azelaic acid or niacinamide-based serums to calm redness', 'Apply mineral SPF daily to reduce UV-triggered flares', 'Consider a dermatology consultation for topical metronidazole or ivermectin'],
    genes: 'BTNL2 rs2395185 · HLA-DRA rs763802 · TLR2 rs3804100'
  },
  kallikrein: {
    name: 'Kallikrein-7 Levels', category: 'Skin Health Markers', risk: 'high',
    prs: '1.82', percentile: '83rd',
    description: 'Kallikrein-7 (KLK7) is a serine protease critical for skin desquamation. Elevated genetic levels can over-digest the corneal layer, leading to barrier compromise, sensitivity, and inflammatory skin conditions.',
    recs: ['Use gentle, low-pH (5.0–5.5) cleansers to support natural protease balance', 'Avoid harsh physical exfoliants that further disrupt the barrier', 'Incorporate ceramide and fatty acid-rich moisturizers', 'Be cautious with retinoids — introduce gradually'],
    genes: 'KLK7 promoter · SPINK5 rs2303064 · CST9 rs2070219'
  },
  ceramide: {
    name: 'Ceramide Levels', category: 'Skin Health Markers', risk: 'very-low',
    prs: '0.41', percentile: '10th',
    description: 'Ceramides are essential lipids that form the skin\'s waterproof barrier. Your CERS2 and SMPD1 variant profile predicts excellent ceramide synthesis, contributing to robust barrier function across your lifetime.',
    recs: ['Reinforce with ceramide-containing moisturizers to amplify natural advantages', 'Maintain a diet rich in omega-3 fatty acids to support lipid synthesis', 'Avoid over-cleansing to preserve your naturally strong barrier', 'You can tolerate more active ingredients (retinoids, AHAs) than average'],
    genes: 'CERS2 rs267606587 · SMPD1 rs1050239 · ASAH1 rs6428711'
  },
  sunburn: {
    name: 'Sunburn Sensitivity', category: 'Skin Aesthetics', risk: 'high',
    prs: '1.96', percentile: '86th',
    description: 'MC1R loss-of-function variants and minimal melanin buffering increase UV erythema response substantially. You are genetically predisposed to burn quickly and significantly in unprotected sun exposure.',
    recs: ['Apply SPF 50+ every 2 hours during outdoor activity', 'Reapply after swimming or sweating regardless of label claims', 'Wear wide-brim hats and UPF 50+ clothing', 'Avoid peak UV hours 10am–4pm when possible'],
    genes: 'MC1R p.V60L · MC1R p.R151C · TYR rs1393350'
  },
};

function showTrait(id) {
  const d = traitData[id];
  if (!d) return;
  const riskColors = { 'very-high':'#C1634A','high':'#D4A853','medium':'#6BAED6','low':'#7B9E87','very-low':'#4A7055' };
  const riskLabels = { 'very-high':'Very High','high':'High','medium':'Medium','low':'Low','very-low':'Very Low' };
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-cat">${d.category}</div>
    <h2 class="modal-h2">${d.name}</h2>
    <div class="modal-risk-banner risk-${d.risk}">
      <div class="modal-prs-big">${d.prs}</div>
      <div class="modal-prs-meta">
        <span class="m-label">PRS Score</span>
        <span class="m-label" style="margin-top:8px">Population Percentile</span>
        <span class="m-val">${d.percentile}</span>
      </div>
      <div style="margin-left:auto;">
        <span class="risk-badge risk-${d.risk}" style="font-size:13px;padding:6px 14px;">${riskLabels[d.risk]}</span>
      </div>
    </div>
    <p class="modal-desc">${d.description}</p>
    <div class="modal-section-title">Personalized Recommendations</div>
    <div class="modal-recs">
      ${d.recs.map(r => `<div class="modal-rec-item"><div class="rec-dot"></div><span>${r}</span></div>`).join('')}
    </div>
    <div class="modal-genes">Key Variants: ${d.genes}</div>
  `;
  document.getElementById('trait-modal').classList.add('open');
}

function closeModal(e) {
  if (!e || e.target === document.getElementById('trait-modal')) {
    document.getElementById('trait-modal').classList.remove('open');
  }
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// Initialize charts if dashboard is default active
document.addEventListener('DOMContentLoaded', () => {
  sortTraitCardsByRisk();
  renderRoutineBuilder();

  const activeViewEl = document.querySelector('.view.active');
  const activeViewId = activeViewEl?.id?.replace('view-', '') || 'overview';
  updateTopbarFilterVisibility(activeViewId);

  if (document.getElementById('dashboard-page').classList.contains('active')) {
    setTimeout(initCharts, 200);
  }
});
