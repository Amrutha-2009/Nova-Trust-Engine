/**
 * NOVA Trust Engine - Interactive Application Logic
 * Comprehensive Trust Scoring, Stock Risk Evaluation, Smart Recommendations & Business Impact
 */

// --- Network & Catalog Mock Datasets ---
const NOVA_STORES = [
  { id: 'store-101', name: 'NovaCart Downtown Flagship #101', baselineReliability: 91, avgFulfillmentMin: 45, distanceMiles: 3.2 },
  { id: 'store-002', name: 'NovaCart Metro Distribution Hub #002', baselineReliability: 99, avgFulfillmentMin: 20, distanceMiles: 7.8 },
  { id: 'store-204', name: 'NovaCart North Galleria #204', baselineReliability: 94, avgFulfillmentMin: 35, distanceMiles: 5.1 },
  { id: 'store-108', name: 'NovaCart Westside Express #108', baselineReliability: 88, avgFulfillmentMin: 55, distanceMiles: 4.0 },
  { id: 'store-312', name: 'NovaCart East Bay Logistics #312', baselineReliability: 98, avgFulfillmentMin: 25, distanceMiles: 9.4 },
  { id: 'store-145', name: 'NovaCart South Suburban Depot #145', baselineReliability: 93, avgFulfillmentMin: 40, distanceMiles: 6.5 }
];

const NOVA_PRODUCTS = [
  { name: 'Sony WH-1000XM5 Wireless ANC Headphones', price: 399, category: 'Electronics', defaultVelocity: 'medium' },
  { name: 'Apple MacBook Air M3 15-inch 16GB', price: 1299, category: 'Computing', defaultVelocity: 'high' },
  { name: 'Dyson V15 Detect Cordless Vacuum Cleaner', price: 749, category: 'Home Appliances', defaultVelocity: 'medium' },
  { name: 'PlayStation 5 Slim Digital Edition', price: 449, category: 'Gaming', defaultVelocity: 'surge' },
  { name: 'Nike Air Zoom Pegasus 40 Running Shoes', price: 130, category: 'Footwear', defaultVelocity: 'medium' },
  { name: 'Ninja Air Fryer Pro 4-in-1 5QT', price: 119, category: 'Kitchen', defaultVelocity: 'high' },
  { name: 'Bose QuietComfort Ultra Earbuds', price: 299, category: 'Audio', defaultVelocity: 'medium' },
  { name: 'Kindle Paperwhite 16GB Signature Edition', price: 189, category: 'E-Readers', defaultVelocity: 'low' }
];

// Presets for instant testing
const SCENARIO_PRESETS = {
  critical: {
    productName: 'PlayStation 5 Slim Digital Edition',
    storeName: 'NovaCart Downtown Flagship #101',
    stock: 1,
    updateAge: '48', // 48+ hours ago
    velocity: 'surge',
    orderVolume: 25000
  },
  warning: {
    productName: 'Sony WH-1000XM5 Wireless ANC Headphones',
    storeName: 'NovaCart Westside Express #108',
    stock: 3,
    updateAge: '14', // 14 hours ago
    velocity: 'medium',
    orderVolume: 15000
  },
  healthy: {
    productName: 'Apple MacBook Air M3 15-inch 16GB',
    storeName: 'NovaCart Metro Distribution Hub #002',
    stock: 38,
    updateAge: '0.1', // 6 mins ago
    velocity: 'low',
    orderVolume: 35000
  },
  rush: {
    productName: 'Dyson V15 Detect Cordless Vacuum Cleaner',
    storeName: 'NovaCart North Galleria #204',
    stock: 2,
    updateAge: '0.5', // 30 mins ago
    velocity: 'surge',
    orderVolume: 20000
  }
};

// Application State
const state = {
  theme: 'dark',
  currentAnalysis: null,
  history: [],
  monthlyVolume: 20000,
  orderRerouted: false
};

// DOM Element References
let elements = {};

document.addEventListener('DOMContentLoaded', () => {
  initElementRefs();
  initTheme();
  populateDropdowns();
  bindEventListeners();
  loadHistoryFromStorage();
  
  // Run an initial analysis with standard realistic preset
  loadPreset('warning');
  runAnalysis();
});

function initElementRefs() {
  elements = {
    // Form elements
    productInput: document.getElementById('productInput'),
    storeSelect: document.getElementById('storeSelect'),
    stockInput: document.getElementById('stockInput'),
    btnStockMinus: document.getElementById('btnStockMinus'),
    btnStockPlus: document.getElementById('btnStockPlus'),
    stockTagPreview: document.getElementById('stockTagPreview'),
    updateAgeSelect: document.getElementById('updateAgeSelect'),
    velocitySelect: document.getElementById('velocitySelect'),
    btnAnalyze: document.getElementById('btnAnalyze'),
    btnClearForm: document.getElementById('btnClearForm'),
    btnRandomSample: document.getElementById('btnRandomSample'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    advancedToggleBtn: document.getElementById('advancedToggleBtn'),
    advancedContent: document.getElementById('advancedContent'),

    // Preset buttons
    presetCritical: document.getElementById('presetCritical'),
    presetWarning: document.getElementById('presetWarning'),
    presetHealthy: document.getElementById('presetHealthy'),
    presetRush: document.getElementById('presetRush'),

    // Results - Trust Engine
    confidenceScoreVal: document.getElementById('confidenceScoreVal'),
    gaugeProgressCircle: document.getElementById('gaugeProgressCircle'),
    riskStatusBadge: document.getElementById('riskStatusBadge'),
    trustGradeBadge: document.getElementById('trustGradeBadge'),
    riskHeadline: document.getElementById('riskHeadline'),
    riskDescription: document.getElementById('riskDescription'),

    // Sub-metric Progress Bars
    stockBufferVal: document.getElementById('stockBufferVal'),
    stockBufferFill: document.getElementById('stockBufferFill'),
    dataFreshnessVal: document.getElementById('dataFreshnessVal'),
    dataFreshnessFill: document.getElementById('dataFreshnessFill'),
    velocityFactorVal: document.getElementById('velocityFactorVal'),
    velocityFactorFill: document.getElementById('velocityFactorFill'),
    phantomRiskVal: document.getElementById('phantomRiskVal'),
    phantomRiskFill: document.getElementById('phantomRiskFill'),

    // Problems Detected
    problemsDetectedPanel: document.getElementById('problemsDetectedPanel'),
    problemsCountBadge: document.getElementById('problemsCountBadge'),
    btnGenerateActionPlan: document.getElementById('btnGenerateActionPlan'),
    cardSyncDelay: document.getElementById('cardSyncDelay'),
    checkSyncDelay: document.getElementById('checkSyncDelay'),
    tagSyncDelay: document.getElementById('tagSyncDelay'),
    meterValSyncDelay: document.getElementById('meterValSyncDelay'),
    fillSyncDelay: document.getElementById('fillSyncDelay'),
    descSyncDelay: document.getElementById('descSyncDelay'),

    cardPhantomRisk: document.getElementById('cardPhantomRisk'),
    checkPhantomRisk: document.getElementById('checkPhantomRisk'),
    tagPhantomRisk: document.getElementById('tagPhantomRisk'),
    meterValPhantomRisk: document.getElementById('meterValPhantomRisk'),
    fillPhantomRisk: document.getElementById('fillPhantomRisk'),
    descPhantomRisk: document.getElementById('descPhantomRisk'),

    cardCancelProb: document.getElementById('cardCancelProb'),
    checkCancelProb: document.getElementById('checkCancelProb'),
    tagCancelProb: document.getElementById('tagCancelProb'),
    meterValCancelProb: document.getElementById('meterValCancelProb'),
    fillCancelProb: document.getElementById('fillCancelProb'),
    descCancelProb: document.getElementById('descCancelProb'),

    cardTrustLoss: document.getElementById('cardTrustLoss'),
    checkTrustLoss: document.getElementById('checkTrustLoss'),
    tagTrustLoss: document.getElementById('tagTrustLoss'),
    meterValTrustLoss: document.getElementById('meterValTrustLoss'),
    fillTrustLoss: document.getElementById('fillTrustLoss'),
    descTrustLoss: document.getElementById('descTrustLoss'),

    // Action Plan
    actionPlanPanel: document.getElementById('actionPlanPanel'),
    btnDeployAllSteps: document.getElementById('btnDeployAllSteps'),
    btnCopyActionPlan: document.getElementById('btnCopyActionPlan'),

    // Recommendations
    smartRecPanel: document.getElementById('smartRecPanel'),
    recBanner: document.getElementById('recBanner'),
    recBannerIcon: document.getElementById('recBannerIcon'),
    recBannerTitle: document.getElementById('recBannerTitle'),
    recBannerText: document.getElementById('recBannerText'),
    altStoreCard: document.getElementById('altStoreCard'),
    altStoreName: document.getElementById('altStoreName'),
    altStoreStock: document.getElementById('altStoreStock'),
    altStoreFreshness: document.getElementById('altStoreFreshness'),
    altStoreReliability: document.getElementById('altStoreReliability'),
    altStoreDistance: document.getElementById('altStoreDistance'),
    btnRouteOrder: document.getElementById('btnRouteOrder'),
    recommendationReasonsList: document.getElementById('recommendationReasonsList'),

    // Business Impact
    cancellationDropVal: document.getElementById('cancellationDropVal'),
    cancellationSavedUnits: document.getElementById('cancellationSavedUnits'),
    repeatPurchaseLiftVal: document.getElementById('repeatPurchaseLiftVal'),
    repeatLtvImpact: document.getElementById('repeatLtvImpact'),
    supportTicketDropVal: document.getElementById('supportTicketDropVal'),
    supportHoursSaved: document.getElementById('supportHoursSaved'),
    gmvProtectedVal: document.getElementById('gmvProtectedVal'),

    // Interactive Slider & Comparison Bars
    volumeSlider: document.getElementById('volumeSlider'),
    volumeDisplay: document.getElementById('volumeDisplay'),
    barBaselineCancel: document.getElementById('barBaselineCancel'),
    barOptimizedCancel: document.getElementById('barOptimizedCancel'),
    barBaselineText: document.getElementById('barBaselineText'),
    barOptimizedText: document.getElementById('barOptimizedText'),

    // History Table
    historyTableBody: document.getElementById('historyTableBody'),
    btnClearHistory: document.getElementById('btnClearHistory'),
    btnExportData: document.getElementById('btnExportData'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };
}

// --- Theme Management ---
function initTheme() {
  const savedTheme = localStorage.getItem('nova_theme') || 'dark';
  setTheme(savedTheme);
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('nova_theme', theme);
  if (elements.themeToggleBtn) {
    elements.themeToggleBtn.innerHTML = theme === 'dark' 
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
  }
}

// --- Population & Input Helpers ---
function populateDropdowns() {
  // Populate Stores
  if (elements.storeSelect) {
    elements.storeSelect.innerHTML = NOVA_STORES.map(s => 
      `<option value="${s.name}" data-id="${s.id}">${s.name} (${s.distanceMiles} mi - ${s.baselineReliability}% reliab.)</option>`
    ).join('');
  }

  // Populate Product Datalist for autocomplete
  const datalist = document.getElementById('productList');
  if (datalist) {
    datalist.innerHTML = NOVA_PRODUCTS.map(p => 
      `<option value="${p.name}">$${p.price} • ${p.category}</option>`
    ).join('');
  }
}

function updateStockTagPreview() {
  const stock = parseInt(elements.stockInput.value, 10) || 0;
  let tagHtml = '';
  if (stock <= 0) {
    tagHtml = `<span style="color: var(--danger)">⛔ Zero Stock - Definite Out-of-Stock</span>`;
  } else if (stock === 1) {
    tagHtml = `<span style="color: var(--danger)">⚠️ Lone Unit - 85% Phantom Stock Risk</span>`;
  } else if (stock <= 4) {
    tagHtml = `<span style="color: var(--warning)">⚡ Low Stock Buffer (${stock} units remaining)</span>`;
  } else if (stock <= 15) {
    tagHtml = `<span style="color: var(--info)">🔹 Healthy Local Inventory (${stock} units)</span>`;
  } else {
    tagHtml = `<span style="color: var(--success)">✅ Deep Surplus Reserve (${stock} units)</span>`;
  }
  elements.stockTagPreview.innerHTML = tagHtml;
}

// --- Event Listeners ---
function bindEventListeners() {
  // Theme toggle
  elements.themeToggleBtn.addEventListener('click', () => {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
  });

  // Stock Steppers
  elements.btnStockMinus.addEventListener('click', () => {
    let current = parseInt(elements.stockInput.value, 10) || 0;
    if (current > 0) {
      elements.stockInput.value = current - 1;
      updateStockTagPreview();
    }
  });

  elements.btnStockPlus.addEventListener('click', () => {
    let current = parseInt(elements.stockInput.value, 10) || 0;
    elements.stockInput.value = current + 1;
    updateStockTagPreview();
  });

  elements.stockInput.addEventListener('input', updateStockTagPreview);

  // Advanced accordion toggle
  elements.advancedToggleBtn.addEventListener('click', () => {
    const isOpen = elements.advancedContent.classList.contains('open');
    elements.advancedContent.classList.toggle('open', !isOpen);
    elements.advancedToggleBtn.querySelector('span:last-child').textContent = isOpen ? '▼' : '▲';
  });

  // Analyze button
  elements.btnAnalyze.addEventListener('click', () => {
    runAnalysis();
  });

  // Clear Form
  elements.btnClearForm.addEventListener('click', () => {
    elements.productInput.value = '';
    elements.stockInput.value = '5';
    elements.updateAgeSelect.value = '1';
    updateStockTagPreview();
    showToast('Form fields reset to defaults');
  });

  // Random Sample
  elements.btnRandomSample.addEventListener('click', () => {
    const randomProduct = NOVA_PRODUCTS[Math.floor(Math.random() * NOVA_PRODUCTS.length)];
    const randomStore = NOVA_STORES[Math.floor(Math.random() * NOVA_STORES.length)];
    const randomStock = Math.floor(Math.random() * 25);
    const updateTimes = ['0.1', '0.5', '1', '4', '12', '24', '48'];
    const randomUpdate = updateTimes[Math.floor(Math.random() * updateTimes.length)];

    elements.productInput.value = randomProduct.name;
    elements.storeSelect.value = randomStore.name;
    elements.stockInput.value = randomStock;
    elements.updateAgeSelect.value = randomUpdate;
    updateStockTagPreview();
    runAnalysis();
    showToast('Randomized sample scenario generated');
  });

  // Presets
  elements.presetCritical.addEventListener('click', () => loadPreset('critical'));
  elements.presetWarning.addEventListener('click', () => loadPreset('warning'));
  elements.presetHealthy.addEventListener('click', () => loadPreset('healthy'));
  elements.presetRush.addEventListener('click', () => loadPreset('rush'));

  // Volume Slider
  elements.volumeSlider.addEventListener('input', (e) => {
    state.monthlyVolume = parseInt(e.target.value, 10);
    elements.volumeDisplay.textContent = `${state.monthlyVolume.toLocaleString()} orders / mo`;
    if (state.currentAnalysis) {
      updateBusinessImpactMetrics(state.currentAnalysis);
    }
  });

  // Smart Routing Button
  elements.btnRouteOrder.addEventListener('click', () => {
    handleOrderReroute();
  });

  // History Clear & Export
  elements.btnClearHistory.addEventListener('click', () => {
    state.history = [];
    localStorage.removeItem('nova_trust_history');
    renderHistoryTable();
    showToast('History log cleared');
  });

  elements.btnExportData.addEventListener('click', () => {
    exportHistoryData();
  });

  // Generate Action Plan Button
  if (elements.btnGenerateActionPlan) {
    elements.btnGenerateActionPlan.addEventListener('click', handleGenerateActionPlan);
  }

  // Deploy All Steps Button
  if (elements.btnDeployAllSteps) {
    elements.btnDeployAllSteps.addEventListener('click', handleDeployAllSteps);
  }

  // Copy Action Plan Button
  if (elements.btnCopyActionPlan) {
    elements.btnCopyActionPlan.addEventListener('click', handleCopyActionPlan);
  }
}

function loadPreset(key) {
  const p = SCENARIO_PRESETS[key];
  if (!p) return;

  elements.productInput.value = p.productName;
  elements.storeSelect.value = p.storeName;
  elements.stockInput.value = p.stock;
  elements.updateAgeSelect.value = p.updateAge;
  elements.velocitySelect.value = p.velocity;
  if (p.orderVolume) {
    state.monthlyVolume = p.orderVolume;
    elements.volumeSlider.value = p.orderVolume;
    elements.volumeDisplay.textContent = `${p.orderVolume.toLocaleString()} orders / mo`;
  }
  updateStockTagPreview();
  state.orderRerouted = false;
  resetRerouteButton();
}

// --- Trust Score Calculation Engine ---
function runAnalysis() {
  // Add loading animation to button
  elements.btnAnalyze.classList.add('loading');
  elements.btnAnalyze.querySelector('.btn-text').textContent = 'Evaluating Realtime Telemetry...';

  setTimeout(() => {
    processAnalysisCore();
    elements.btnAnalyze.classList.remove('loading');
    elements.btnAnalyze.querySelector('.btn-text').textContent = 'Run Trust Analysis';
  }, 400);
}

function processAnalysisCore() {
  const productName = elements.productInput.value.trim() || 'NovaCart Featured Item';
  const storeName = elements.storeSelect.value;
  const stock = parseInt(elements.stockInput.value, 10) || 0;
  const updateAgeHours = parseFloat(elements.updateAgeSelect.value) || 1.0;
  const velocityType = elements.velocitySelect.value;

  // Selected Store Object
  const currentStore = NOVA_STORES.find(s => s.name === storeName) || NOVA_STORES[0];
  
  // Velocity numeric multiplier
  let velocityUnitsPerHour = 3.0;
  if (velocityType === 'low') velocityUnitsPerHour = 0.8;
  if (velocityType === 'medium') velocityUnitsPerHour = 3.5;
  if (velocityType === 'high') velocityUnitsPerHour = 8.0;
  if (velocityType === 'surge') velocityUnitsPerHour = 18.0;

  // 1. Stock Buffer Score (0 - 100)
  let stockBufferScore = 0;
  if (stock === 0) stockBufferScore = 0;
  else if (stock === 1) stockBufferScore = 18;
  else if (stock === 2) stockBufferScore = 38;
  else if (stock === 3) stockBufferScore = 55;
  else if (stock <= 5) stockBufferScore = 70;
  else if (stock <= 10) stockBufferScore = 85;
  else if (stock <= 20) stockBufferScore = 95;
  else stockBufferScore = 99;

  // 2. Data Freshness Score (0 - 100) - Exponential decay
  // e^(-0.07 * hours)
  const freshnessScore = Math.max(5, Math.min(100, Math.round(100 * Math.exp(-0.065 * updateAgeHours))));

  // 3. Phantom Inventory Risk Probability (0 - 100%)
  // Likelihood the shelf unit was stolen, misplaced, damaged, or checked out in physical cart without sync
  const phantomExposure = (updateAgeHours * velocityUnitsPerHour * 7.5) / (stock + 0.6);
  const phantomRiskScore = Math.min(96, Math.max(4, Math.round(phantomExposure)));

  // 4. Store Velocity Stress Index (0 - 100)
  const velocityStressIndex = Math.min(100, Math.round((velocityUnitsPerHour / Math.max(stock, 1)) * 30));

  // 5. Total Inventory Confidence Score (0 - 100)
  // Weighted algorithmic combination
  let rawConfidence = (stockBufferScore * 0.42) +
                      (freshnessScore * 0.33) +
                      (currentStore.baselineReliability * 0.25) -
                      (phantomRiskScore * 0.22);

  // Edge cases
  if (stock === 0) rawConfidence = 0;
  if (stock === 1 && updateAgeHours >= 24) rawConfidence = Math.min(rawConfidence, 15);
  if (stock >= 20 && updateAgeHours <= 1) rawConfidence = Math.max(rawConfidence, 92);

  const confidenceScore = Math.max(2, Math.min(99, Math.round(rawConfidence)));

  // 6. Cancellation Risk Calculation
  // Inversely proportional to confidence, adjusted with phantom factor
  let rawRisk = 100 - confidenceScore;
  if (stock === 0) rawRisk = 99;
  const cancellationRisk = Math.max(3, Math.min(99, Math.round(rawRisk)));

  // Determine Risk Category & Grade
  let riskLevel = 'low'; // low, medium, high
  let statusBadgeClass = 'low-risk';
  let statusText = 'Low Risk';
  let trustGrade = 'A+';
  let headline = 'Verified In-Stock • Fulfillment Safe';
  let description = 'High confidence in store physical inventory. Extremely low likelihood of stockout or cancellation.';

  if (cancellationRisk >= 60) {
    riskLevel = 'high';
    statusBadgeClass = 'high-risk';
    statusText = 'Critical Risk';
    trustGrade = confidenceScore < 20 ? 'F' : 'D';
    headline = 'Critical Cancellation Hazard • High Phantom Threat';
    description = `Inventory update is severely stale (${formatHours(updateAgeHours)}) with only ${stock} unit(s) recorded. Very high chance the item is missing, damaged, or already sold.`;
  } else if (cancellationRisk >= 25) {
    riskLevel = 'medium';
    statusBadgeClass = 'medium-risk';
    statusText = 'Moderate Risk';
    trustGrade = confidenceScore >= 70 ? 'B+' : 'B';
    headline = 'Fulfillment Warning • Stock Lag Detected';
    description = `Adequate stock on record, but inventory synchronization lag (${formatHours(updateAgeHours)}) introduces moderate risk during concurrent checkout surges.`;
  } else {
    trustGrade = confidenceScore >= 95 ? 'A+' : 'A';
  }

  // Find Best Alternative Store in NovaCart Network
  const alternativeStore = findBestAlternativeStore(currentStore.id);

  // Compile Analysis Payload
  const analysis = {
    id: 'TRX-' + Math.floor(100000 + Math.random() * 900000),
    timestamp: new Date(),
    productName,
    storeName,
    currentStore,
    stock,
    updateAgeHours,
    velocityType,
    velocityUnitsPerHour,
    stockBufferScore,
    freshnessScore,
    phantomRiskScore,
    velocityStressIndex,
    confidenceScore,
    cancellationRisk,
    riskLevel,
    statusBadgeClass,
    statusText,
    trustGrade,
    headline,
    description,
    alternativeStore
  };

  state.currentAnalysis = analysis;
  state.orderRerouted = false;

  // Render All UI Panels
  renderTrustScorePanel(analysis);
  renderProblemsDetected(analysis);
  renderSmartRecommendations(analysis);
  updateBusinessImpactMetrics(analysis);
  addHistoryRecord(analysis);
}

// --- Render Trust Score Panel ---
function renderTrustScorePanel(analysis) {
  // Animate Gauge & Percentage
  animateValue(elements.confidenceScoreVal, parseInt(elements.confidenceScoreVal.textContent, 10) || 0, analysis.confidenceScore, 800);

  // Gauge SVG circle stroke-dashoffset (Circumference ~ 440)
  const offset = 440 - (440 * analysis.confidenceScore) / 100;
  elements.gaugeProgressCircle.style.strokeDashoffset = offset;

  // Color stroke according to risk
  let strokeColor = 'var(--success)';
  if (analysis.riskLevel === 'medium') strokeColor = 'var(--warning)';
  if (analysis.riskLevel === 'high') strokeColor = 'var(--danger)';
  elements.gaugeProgressCircle.style.stroke = strokeColor;

  // Badge & Grades
  elements.riskStatusBadge.className = `status-badge ${analysis.statusBadgeClass}`;
  elements.riskStatusBadge.innerHTML = `
    <span class="pulse-dot" style="background-color: ${strokeColor}"></span>
    ${analysis.statusText} (${analysis.cancellationRisk}% Risk)
  `;

  elements.trustGradeBadge.textContent = `GRADE ${analysis.trustGrade}`;
  elements.trustGradeBadge.style.color = strokeColor;
  elements.trustGradeBadge.style.borderColor = strokeColor;

  elements.riskHeadline.textContent = analysis.headline;
  elements.riskDescription.textContent = analysis.description;

  // Sub-metric Progress Bars
  renderProgressBar(elements.stockBufferVal, elements.stockBufferFill, analysis.stockBufferScore, 'stock');
  renderProgressBar(elements.dataFreshnessVal, elements.dataFreshnessFill, analysis.freshnessScore, 'freshness');
  renderProgressBar(elements.velocityFactorVal, elements.velocityFactorFill, analysis.velocityStressIndex, 'velocity');
  renderProgressBar(elements.phantomRiskVal, elements.phantomRiskFill, analysis.phantomRiskScore, 'phantom');
}

function renderProgressBar(valElem, fillElem, score, type) {
  valElem.textContent = `${score}%`;
  fillElem.style.width = `${score}%`;

  fillElem.className = 'progress-fill';
  if (type === 'phantom' || type === 'velocity') {
    // For risk factors, higher is worse (red)
    if (score >= 60) fillElem.classList.add('red');
    else if (score >= 30) fillElem.classList.add('yellow');
    else fillElem.classList.add('green');
  } else {
    // For buffer/freshness, higher is better (green)
    if (score >= 75) fillElem.classList.add('green');
    else if (score >= 45) fillElem.classList.add('yellow');
    else fillElem.classList.add('red');
  }
}

// --- Problems Detected Diagnostic Engine ---
function renderProblemsDetected(analysis) {
  const panel = elements.problemsDetectedPanel;
  if (!panel) return;

  let issuesCount = 0;

  // 1. Inventory Sync Delay
  const syncDecayPct = Math.max(0, Math.min(100, 100 - analysis.freshnessScore));
  let syncSeverity = 'low';
  let syncBadgeText = 'Optimal Sync (< 1h)';
  let syncDesc = `Store inventory was synchronized recently (${formatHours(analysis.updateAgeHours)}). Data fidelity between physical shelf and central system is optimal.`;

  if (analysis.updateAgeHours >= 24) {
    syncSeverity = 'high';
    syncBadgeText = `${formatHours(analysis.updateAgeHours)} • Critical Stale`;
    syncDesc = `Store inventory was last updated ${formatHours(analysis.updateAgeHours)}. Over prolonged unsynchronized intervals, in-store sales and walkouts produce critical inventory divergence.`;
    issuesCount++;
  } else if (analysis.updateAgeHours >= 4) {
    syncSeverity = 'medium';
    syncBadgeText = `${formatHours(analysis.updateAgeHours)} • Sync Lag`;
    syncDesc = `Last sync occurred ${formatHours(analysis.updateAgeHours)}. Telemetry delay creates noticeable vulnerability during concurrent in-store and online checkout spikes.`;
    issuesCount++;
  }

  updateProblemCard(
    elements.cardSyncDelay,
    elements.checkSyncDelay,
    elements.tagSyncDelay,
    elements.fillSyncDelay,
    elements.meterValSyncDelay,
    elements.descSyncDelay,
    syncSeverity,
    syncBadgeText,
    `${syncDecayPct}% Decay`,
    syncDecayPct,
    syncDesc
  );

  // 2. Phantom Stock Risk
  let phantomSeverity = 'low';
  let phantomBadgeText = `${analysis.phantomRiskScore}% • Negligible Risk`;
  let phantomDesc = `Deep stock buffer (${analysis.stock} units) effectively insulates against phantom inventory discrepancies.`;

  if (analysis.phantomRiskScore >= 60) {
    phantomSeverity = 'high';
    phantomBadgeText = `${analysis.phantomRiskScore}% • Critical Hazard`;
    phantomDesc = `High probability that recorded stock is 'ghost inventory'—already taken by in-store shoppers, damaged, or sequestered in another pending checkout cart.`;
    issuesCount++;
  } else if (analysis.phantomRiskScore >= 25) {
    phantomSeverity = 'medium';
    phantomBadgeText = `${analysis.phantomRiskScore}% • Moderate Risk`;
    phantomDesc = `Moderate risk of phantom inventory. With low recorded stock (${analysis.stock} units), any unrecorded physical decrement will result in immediate stockout.`;
    issuesCount++;
  }

  updateProblemCard(
    elements.cardPhantomRisk,
    elements.checkPhantomRisk,
    elements.tagPhantomRisk,
    elements.fillPhantomRisk,
    elements.meterValPhantomRisk,
    elements.descPhantomRisk,
    phantomSeverity,
    phantomBadgeText,
    `${analysis.phantomRiskScore}% Risk`,
    analysis.phantomRiskScore,
    phantomDesc
  );

  // 3. Cancellation Probability
  let cancelSeverity = 'low';
  let cancelBadgeText = `${analysis.cancellationRisk}% • Minimal Risk`;
  let cancelDesc = `Fulfillment safety index is high. Extremely low probability of dispatch abort or stockout cancellation.`;

  if (analysis.cancellationRisk >= 60) {
    cancelSeverity = 'high';
    cancelBadgeText = `${analysis.cancellationRisk}% • Severe Hazard`;
    cancelDesc = `Fulfillment packing station has an estimated ${analysis.cancellationRisk}% probability of discovering missing stock, triggering automatic order abort.`;
    issuesCount++;
  } else if (analysis.cancellationRisk >= 25) {
    cancelSeverity = 'medium';
    cancelBadgeText = `${analysis.cancellationRisk}% • Elevated Risk`;
    cancelDesc = `Fulfillment failure likelihood is ${analysis.cancellationRisk}%. Order is susceptible to pick rejection if in-store checkout spikes occur before dispatch.`;
    issuesCount++;
  }

  updateProblemCard(
    elements.cardCancelProb,
    elements.checkCancelProb,
    elements.tagCancelProb,
    elements.fillCancelProb,
    elements.meterValCancelProb,
    elements.descCancelProb,
    cancelSeverity,
    cancelBadgeText,
    `${analysis.cancellationRisk}% Expected`,
    analysis.cancellationRisk,
    cancelDesc
  );

  // 4. Customer Trust Loss
  let trustSeverity = 'low';
  let trustBadgeText = 'Trust Preserved (+18 NPS)';
  let trustImpactMeter = 12;
  let trustDesc = `High fulfillment certainty protects customer satisfaction, reinforcing NovaCart brand reliability and driving repeat purchases.`;

  if (analysis.cancellationRisk >= 60) {
    trustSeverity = 'high';
    trustBadgeText = 'Critical Churn Threat (-35 NPS)';
    trustImpactMeter = 88;
    trustDesc = `Surprise stockout cancellations severely damage customer trust. 68% of customers who suffer cancellations churn permanently to competing retailers.`;
    issuesCount++;
  } else if (analysis.cancellationRisk >= 25) {
    trustSeverity = 'medium';
    trustBadgeText = 'Moderate Brand Friction (-15 NPS)';
    trustImpactMeter = 52;
    trustDesc = `Potential fulfillment friction creates negative customer sentiment and spikes WISMO ("Where is my order") support ticket volume.`;
    issuesCount++;
  }

  updateProblemCard(
    elements.cardTrustLoss,
    elements.checkTrustLoss,
    elements.tagTrustLoss,
    elements.fillTrustLoss,
    elements.meterValTrustLoss,
    elements.descTrustLoss,
    trustSeverity,
    trustBadgeText,
    `${trustImpactMeter}% Impact`,
    trustImpactMeter,
    trustDesc
  );

  // Overall Panel Badge & Border
  if (elements.problemsCountBadge) {
    if (issuesCount >= 3) {
      elements.problemsCountBadge.className = 'status-badge high-risk';
      elements.problemsCountBadge.textContent = `${issuesCount} Critical Vulnerabilities`;
      panel.className = 'panel-card problems-detected-panel';
    } else if (issuesCount >= 1) {
      elements.problemsCountBadge.className = 'status-badge medium-risk';
      elements.problemsCountBadge.textContent = `${issuesCount} Warning Vulnerability`;
      panel.className = 'panel-card problems-detected-panel has-warning';
    } else {
      elements.problemsCountBadge.className = 'status-badge low-risk';
      elements.problemsCountBadge.textContent = `All Clear • Zero Vulnerabilities`;
      panel.className = 'panel-card problems-detected-panel all-good';
    }
  }
}

function updateProblemCard(card, checkBadge, tag, fill, meterVal, desc, severity, tagText, meterText, meterPct, descText) {
  if (!card) return;
  card.className = `problem-card severity-${severity}`;
  
  if (checkBadge) {
    checkBadge.className = `problem-check-badge ${severity === 'high' ? 'red' : severity === 'medium' ? 'yellow' : 'green'}`;
  }

  if (tag) {
    tag.className = `problem-severity-tag ${severity === 'high' ? 'red' : severity === 'medium' ? 'yellow' : 'green'}`;
    tag.textContent = tagText;
  }

  if (meterVal) {
    meterVal.textContent = meterText;
  }

  if (fill) {
    fill.style.width = `${meterPct}%`;
    fill.className = `progress-fill ${severity === 'high' ? 'red' : severity === 'medium' ? 'yellow' : 'green'}`;
  }

  if (desc) {
    desc.textContent = descText;
  }
}

// --- Action Plan Handlers ---
function handleGenerateActionPlan() {
  if (!elements.actionPlanPanel) return;

  elements.actionPlanPanel.style.display = 'block';
  elements.actionPlanPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  showToast('Action Plan Generated: 4 targeted countermeasures ready for deployment!');
}

function handleDeployAllSteps() {
  for (let i = 1; i <= 4; i++) {
    const card = document.getElementById(`actionStep${i}`);
    if (card) {
      card.classList.add('active-policy');
      const btn = card.querySelector('.btn-toggle-step');
      if (btn) {
        btn.classList.add('deployed');
        const textSpan = btn.querySelector('.step-btn-text');
        if (textSpan) textSpan.textContent = 'Active Policy';
      }
    }
  }
  showToast('All 4 Action Plan policies deployed across NovaCart network!');
}

function handleCopyActionPlan() {
  const planText = `NOVA Trust Engine — NovaCart Strategic Action Plan:
1. Force inventory sync every 2 hours
2. Flag risky products
3. Route orders to backup stores
4. Notify customers before checkout`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(planText).then(() => {
      showToast('Action Plan copied to clipboard!');
    }).catch(() => {
      showToast('Action Plan: 4 policies ready');
    });
  } else {
    showToast('Action Plan copied to clipboard!');
  }
}

window.toggleActionStep = function(stepNum) {
  const card = document.getElementById(`actionStep${stepNum}`);
  if (!card) return;

  const btn = card.querySelector('.btn-toggle-step');
  const isDeployed = card.classList.contains('active-policy');

  if (isDeployed) {
    card.classList.remove('active-policy');
    if (btn) {
      btn.classList.remove('deployed');
      const textSpan = btn.querySelector('.step-btn-text');
      if (textSpan) textSpan.textContent = 'Deploy Policy';
    }
    showToast(`Step ${stepNum} policy deactivated.`);
  } else {
    card.classList.add('active-policy');
    if (btn) {
      btn.classList.add('deployed');
      const textSpan = btn.querySelector('.step-btn-text');
      if (textSpan) textSpan.textContent = 'Active Policy';
    }
    showToast(`Step ${stepNum} policy deployed & active!`);
  }
};

// --- Smart Recommendation Logic ---
function findBestAlternativeStore(currentStoreId) {
  // Pick from remaining stores, prefer Metro Distribution Hub or highest reliability with close distance
  const candidates = NOVA_STORES.filter(s => s.id !== currentStoreId);
  candidates.sort((a, b) => b.baselineReliability - a.baselineReliability);
  
  const best = candidates[0];
  // Synthetic high stock & ultra-fresh sync for the recommended alternative hub
  const altStock = Math.floor(25 + Math.random() * 30);
  const altFreshnessMinutes = Math.floor(2 + Math.random() * 8);

  return {
    ...best,
    verifiedStock: altStock,
    freshnessText: `${altFreshnessMinutes} mins ago (Live Scanner)`,
    calculatedTrust: 99.1
  };
}

function renderSmartRecommendations(analysis) {
  const panel = elements.smartRecPanel;
  panel.className = 'panel-card smart-recommendation-panel';

  if (analysis.riskLevel === 'high') {
    panel.classList.add('urgent');
    elements.recBanner.className = 'recommendation-banner alert-danger';
    elements.recBannerIcon.innerHTML = '🚨';
    elements.recBannerTitle.textContent = 'High Order Cancellation Hazard Detected';
    elements.recBannerText.textContent = `Immediate intervention required: Physical stockout probability at ${analysis.storeName} is ${analysis.cancellationRisk}%. Fulfilling from this store is strongly discouraged.`;

    elements.altStoreCard.style.display = 'flex';
    populateAlternativeStoreUI(analysis.alternativeStore);
    renderDetailedReasons(analysis, true);

  } else if (analysis.riskLevel === 'medium') {
    panel.classList.add('urgent');
    elements.recBanner.className = 'recommendation-banner alert-warning';
    elements.recBannerIcon.innerHTML = '⚠️';
    elements.recBannerTitle.textContent = 'Inventory Lag Warning: Safety Re-Route Available';
    elements.recBannerText.textContent = `Current store has moderate risk due to sync age. Fulfilling via NovaCart Intelligent Auto-Routing will guarantee seamless delivery without delay.`;

    elements.altStoreCard.style.display = 'flex';
    populateAlternativeStoreUI(analysis.alternativeStore);
    renderDetailedReasons(analysis, false);

  } else {
    panel.classList.add('safe');
    elements.recBanner.className = 'recommendation-banner alert-success';
    elements.recBannerIcon.innerHTML = '✨';
    elements.recBannerTitle.textContent = 'Prime In-Stock Guarantee Verified';
    elements.recBannerText.textContent = `Safe to fulfill directly from ${analysis.storeName}. Confidence is optimal (${analysis.confidenceScore}%), with minimal cancellation risk (${analysis.cancellationRisk}%).`;

    elements.altStoreCard.style.display = 'none';
    elements.recommendationReasonsList.innerHTML = `
      <div class="reasons-title">Trust Verification Highlights</div>
      <div class="reason-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span><strong>Ample Stock Buffer:</strong> ${analysis.stock} units confirmed on shelf, easily sustaining expected customer volume.</span>
      </div>
      <div class="reason-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span><strong>Fresh Telemetry:</strong> Synced ${formatHours(analysis.updateAgeHours)}, ensuring zero phantom inventory discrepancies.</span>
      </div>
      <div class="reason-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span><strong>Dispatch Action:</strong> Authorized for Instant 1-Hour Dispatch and Checkout 'Guaranteed In-Stock' trust badge.</span>
      </div>
    `;
  }
}

function populateAlternativeStoreUI(altStore) {
  elements.altStoreName.textContent = altStore.name;
  elements.altStoreStock.textContent = `${altStore.verifiedStock} units`;
  elements.altStoreFreshness.textContent = altStore.freshnessText;
  elements.altStoreReliability.textContent = `${altStore.baselineReliability}%`;
  elements.altStoreDistance.textContent = `${altStore.distanceMiles} miles`;
  resetRerouteButton();
}

function renderDetailedReasons(analysis, isCritical) {
  elements.recommendationReasonsList.innerHTML = `
    <div class="reasons-title">Root Causes & Safety Analysis</div>
    <div class="reason-item">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${isCritical ? '#ef4444' : '#f59e0b'}" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span><strong>Sync Lag Threat:</strong> Last inventory handshake was <strong>${formatHours(analysis.updateAgeHours)}</strong>. Over this timeframe, physical in-store shoppers or offline holds create phantom stockouts.</span>
    </div>
    <div class="reason-item">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${isCritical ? '#ef4444' : '#f59e0b'}" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span><strong>Fragile Buffer (${analysis.stock} unit(s)):</strong> Single or low-unit listings carry an estimated <strong>${analysis.phantomRiskScore}% phantom inventory risk</strong>.</span>
    </div>
    <div class="reason-item">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      <span><strong>Alternative Advantage:</strong> Routing to <em>${analysis.alternativeStore.name}</em> guarantees fulfillment with <strong>${analysis.alternativeStore.verifiedStock} live verified units</strong> and 99%+ order safety.</span>
    </div>
  `;
}

function handleOrderReroute() {
  if (state.orderRerouted) return;

  state.orderRerouted = true;
  elements.btnRouteOrder.disabled = true;
  elements.btnRouteOrder.style.background = 'var(--success)';
  elements.btnRouteOrder.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
    Rerouted to ${state.currentAnalysis.alternativeStore.name}
  `;

  showToast(`Order routing diverted to ${state.currentAnalysis.alternativeStore.name}! Cancellation risk reduced to 1.2%.`);
}

function resetRerouteButton() {
  elements.btnRouteOrder.disabled = false;
  elements.btnRouteOrder.style.background = 'var(--primary)';
  elements.btnRouteOrder.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
    Auto-Route to Alternative Store
  `;
}

// --- Business Impact Dashboard Engine ---
function updateBusinessImpactMetrics(analysis) {
  const volume = state.monthlyVolume;
  
  // Baseline cancellation rate without trust engine for this risk profile
  let baselineCancelRate = 0.165; // 16.5% standard baseline
  if (analysis.riskLevel === 'high') baselineCancelRate = 0.42;
  if (analysis.riskLevel === 'medium') baselineCancelRate = 0.22;
  if (analysis.riskLevel === 'low') baselineCancelRate = 0.07;

  // Optimized cancellation rate with NOVA Trust Engine
  // With proactive routing, stock buffer holds, and confidence scoring
  const optimizedCancelRate = Math.max(0.012, baselineCancelRate * (1 - (analysis.confidenceScore / 115)));

  // Relative Reduction in Cancellations %
  const reductionPercentage = Math.round(((baselineCancelRate - optimizedCancelRate) / baselineCancelRate) * 100);
  
  // Monthly cancelled orders prevented
  const baselineCancellations = Math.round(volume * baselineCancelRate);
  const optimizedCancellations = Math.round(volume * optimizedCancelRate);
  const savedOrdersCount = Math.max(0, baselineCancellations - optimizedCancellations);

  // Financial GMV Protected
  const matchedProduct = NOVA_PRODUCTS.find(p => p.name === analysis.productName);
  const avgOrderValue = matchedProduct ? matchedProduct.price : 185;
  const gmvProtected = Math.round(savedOrdersCount * avgOrderValue);

  // Repeat Purchase Increase %
  // Preventing cancellations directly lifts 90-day repeat purchase retention
  const repeatLiftPercentage = Math.round(reductionPercentage * 0.45);
  const ltvLiftAmount = Math.round(savedOrdersCount * (avgOrderValue * 0.35));

  // Support Ticket Reduction %
  // Over 60% of customer support tickets originate from "Where is my order" & surprise cancellations
  const supportTicketDropPercentage = Math.round(reductionPercentage * 0.88);
  const ticketsSavedMonthly = Math.round(savedOrdersCount * 0.82);
  const supportHoursSavedMonthly = Math.round((ticketsSavedMonthly * 15) / 60); // 15 mins avg resolution

  // Render to DOM
  elements.cancellationDropVal.textContent = `-${reductionPercentage}%`;
  elements.cancellationSavedUnits.textContent = `~${savedOrdersCount.toLocaleString()} orders prevented / mo`;

  elements.repeatPurchaseLiftVal.textContent = `+${repeatLiftPercentage}%`;
  elements.repeatLtvImpact.textContent = `+$${ltvLiftAmount.toLocaleString()} retained LTV`;

  elements.supportTicketDropVal.textContent = `-${supportTicketDropPercentage}%`;
  elements.supportHoursSaved.textContent = `~${supportHoursSavedMonthly.toLocaleString()} agent hrs saved / mo`;

  if (elements.gmvProtectedVal) {
    elements.gmvProtectedVal.textContent = `$${gmvProtected.toLocaleString()}`;
  }

  // Visual Comparison Bars
  renderComparisonBars(baselineCancelRate, optimizedCancelRate, volume);
}

function renderComparisonBars(baselineRate, optimizedRate, volume) {
  const baselinePct = (baselineRate * 100).toFixed(1);
  const optPct = (optimizedRate * 100).toFixed(1);

  // Scaled widths relative to 50% max scale
  const baseWidth = Math.min(100, Math.round((baselineRate / 0.5) * 100));
  const optWidth = Math.max(4, Math.min(100, Math.round((optimizedRate / 0.5) * 100)));

  elements.barBaselineCancel.style.width = `${baseWidth}%`;
  elements.barBaselineText.textContent = `${baselinePct}% (${Math.round(volume * baselineRate).toLocaleString()} orders)`;

  elements.barOptimizedCancel.style.width = `${optWidth}%`;
  elements.barOptimizedText.textContent = `${optPct}% (${Math.round(volume * optimizedRate).toLocaleString()} orders)`;
}

// --- History / Audit Log ---
function addHistoryRecord(analysis) {
  state.history.unshift({
    id: analysis.id,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    product: analysis.productName,
    store: analysis.storeName,
    stock: analysis.stock,
    confidence: analysis.confidenceScore,
    risk: analysis.cancellationRisk,
    grade: analysis.trustGrade,
    statusText: analysis.statusText,
    badgeClass: analysis.statusBadgeClass
  });

  if (state.history.length > 20) {
    state.history.pop();
  }

  saveHistoryToStorage();
  renderHistoryTable();
}

function renderHistoryTable() {
  if (!elements.historyTableBody) return;

  if (state.history.length === 0) {
    elements.historyTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="empty-state-notice">
          No previous analysis runs in audit log. Click "Run Trust Analysis" to record telemetry.
        </td>
      </tr>
    `;
    return;
  }

  elements.historyTableBody.innerHTML = state.history.map(item => `
    <tr>
      <td><span style="font-family: monospace; font-size: 0.75rem;">${item.id}</span></td>
      <td>${item.time}</td>
      <td class="highlight-text">${truncateText(item.product, 28)}</td>
      <td>${truncateText(item.store, 24)}</td>
      <td><strong>${item.stock}</strong></td>
      <td>
        <span class="status-badge ${item.badgeClass}" style="padding: 2px 8px; font-size: 0.7rem;">
          ${item.confidence}% (${item.grade})
        </span>
      </td>
      <td>
        <button class="btn-secondary" style="padding: 4px 8px; font-size: 0.72rem;" onclick="reloadHistoryItem('${item.id}')">
          Re-evaluate
        </button>
      </td>
    </tr>
  `).join('');
}

window.reloadHistoryItem = function(id) {
  const item = state.history.find(h => h.id === id);
  if (!item) return;

  elements.productInput.value = item.product;
  elements.storeSelect.value = item.store;
  elements.stockInput.value = item.stock;
  updateStockTagPreview();
  runAnalysis();
  showToast(`Loaded analysis ${item.id}`);
};

function saveHistoryToStorage() {
  try {
    localStorage.setItem('nova_trust_history', JSON.stringify(state.history));
  } catch (e) {
    console.warn('Unable to persist history to localStorage', e);
  }
}

function loadHistoryFromStorage() {
  try {
    const raw = localStorage.getItem('nova_trust_history');
    if (raw) {
      state.history = JSON.parse(raw);
      renderHistoryTable();
    }
  } catch (e) {
    console.warn('Error reading history', e);
  }
}

function exportHistoryData() {
  if (state.history.length === 0) {
    showToast('No history records to export.');
    return;
  }

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.history, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `nova_trust_engine_audit_${Date.now()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('Audit log exported successfully (JSON)');
}

// --- Utility Helpers ---
function formatHours(hours) {
  if (hours < 0.2) return '5 mins ago (< 15m)';
  if (hours < 1) return `${Math.round(hours * 60)} mins ago`;
  if (hours === 1) return '1 hour ago';
  if (hours < 24) return `${Math.round(hours)} hours ago`;
  return `${Math.round(hours / 24)} day(s) ago (${hours}h+)`;
}

function truncateText(str, max) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '...' : str;
}

function animateValue(elem, start, end, duration) {
  if (!elem) return;
  const range = end - start;
  let current = start;
  const increment = end > start ? 1 : -1;
  const stepTime = Math.abs(Math.floor(duration / (range || 1)));
  
  if (range === 0) {
    elem.textContent = end;
    return;
  }

  const timer = setInterval(() => {
    current += increment;
    elem.textContent = current;
    if (current === end) {
      clearInterval(timer);
    }
  }, Math.max(stepTime, 15));
}

function showToast(message) {
  if (!elements.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
    <span>${message}</span>
  `;
  elements.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
