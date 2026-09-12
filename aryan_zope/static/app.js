const cropSelect = document.getElementById('cropSelect');
const distSelect = document.getElementById('distSelect');
const DAYS = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today'];
const CROP_EMOJI = { Onion: '🧅', Tomato: '🍅', Wheat: '🌾', Soybean: '🫘' };

const I18N = {
  en: {
    tagline: 'mandi price discovery',
    updated: 'Updated',
    crop: 'Crop',
    district: 'District',
    allDistricts: 'All districts',
    todaysBoard: "Today's board",
    trendTitle: '7-day trend — best market',
    forecastTitle: '6-month price forecast',
    actual: 'Actual',
    forecast: 'Forecast',
    forecastNote: 'This forecast uses historical trends and seasonal data from the past two years to predict future price movements. The shaded orange region indicates expected price ranges for the coming months.',
    footerNote: 'Prices are served from the Flask backend. Swap mock data for live Agmarknet prices in data.py.',
    navBoard: 'Board',
    navTrends: 'Trends',
    navAlerts: 'Alerts',
    navProfile: 'Profile',
    priceAlerts: 'Price alerts',
    alertHigh: 'Notify when best mandi rises 5% in a week',
    alertDrop: 'Notify when prices drop 5%',
    farmerName: 'Farmer profile',
    farmerPlace: 'Maharashtra · Mandi board',
    nudgeUp: (m, pct) => `Prices at <b>${m}</b> are up <b>${pct}%</b> this week. Selling now may fetch a better rate than earlier this week.`,
    nudgeDown: (m, pct) => `Prices at <b>${m}</b> are down <b>${pct}%</b> this week. If storage is available, waiting a few days may pay off.`,
    nudgeFlat: (m) => `Prices at <b>${m}</b> have stayed roughly flat this week. No strong reason to rush or delay.`,
  },
  hi: {
    tagline: 'मंडी भाव खोज',
    updated: 'अपडेट',
    crop: 'फसल',
    district: 'जिला',
    allDistricts: 'सभी जिले',
    todaysBoard: 'आज का बोर्ड',
    trendTitle: '7-दिन का रुझान — सर्वश्रेष्ठ मंडी',
    forecastTitle: '6-माह भाव पूर्वानुमान',
    actual: 'वास्तविक',
    forecast: 'पूर्वानुमान',
    forecastNote: 'यह पूर्वानुमान पिछले दो वर्षों के रुझान और मौसमी आँकड़ों पर आधारित है। नारंगी छाया आने वाले महीनों की संभावित भाव सीमा दिखाती है।',
    footerNote: 'भाव Flask बैकएंड से आते हैं। लाइव आँकड़ों के लिए data.py में मॉक डेटा बदलें।',
    navBoard: 'बोर्ड',
    navTrends: 'रुझान',
    navAlerts: 'अलर्ट',
    navProfile: 'प्रोफ़ाइल',
    priceAlerts: 'भाव अलर्ट',
    alertHigh: 'सर्वश्रेष्ठ मंडी में सप्ताह में 5% बढ़त पर सूचना',
    alertDrop: 'भाव 5% गिरने पर सूचना',
    farmerName: 'किसान प्रोफ़ाइल',
    farmerPlace: 'महाराष्ट्र · मंडी बोर्ड',
    nudgeUp: (m, pct) => `<b>${m}</b> में भाव इस सप्ताह <b>${pct}%</b> बढ़े हैं। अभी बेचने पर बेहतर दर मिल सकती है।`,
    nudgeDown: (m, pct) => `<b>${m}</b> में भाव इस सप्ताह <b>${pct}%</b> घटे हैं। भंडारण हो तो कुछ दिन प्रतीक्षा उपयोगी हो सकती है।`,
    nudgeFlat: (m) => `<b>${m}</b> में भाव इस सप्ताह लगभग स्थिर रहे। जल्दबाजी या देरी की कोई खास वजह नहीं।`,
  },
  mr: {
    tagline: 'मंडी भाव शोध',
    updated: 'अपडेट',
    crop: 'पीक',
    district: 'जिल्हा',
    allDistricts: 'सर्व जिल्हे',
    todaysBoard: 'आजचा बोर्ड',
    trendTitle: '७ दिवसांचा कल — सर्वोत्तम बाजार',
    forecastTitle: '६ महिन्यांचा भाव अंदाज',
    actual: 'प्रत्यक्ष',
    forecast: 'अंदाज',
    forecastNote: 'हा अंदाज गेल्या दोन वर्षांच्या कल आणि हंगामी आकडेवारीवर आधारित आहे. केशरी सावली पुढील महिन्यांची संभाव्य भाव श्रेणी दर्शवते.',
    footerNote: 'भाव Flask बॅकएंडमधून येतात. लाइव्ह डेटासाठी data.py मधील मॉक डेटा बदला.',
    navBoard: 'बोर्ड',
    navTrends: 'कल',
    navAlerts: 'सूचना',
    navProfile: 'प्रोफाइल',
    priceAlerts: 'भाव सूचना',
    alertHigh: 'सर्वोत्तम बाजारात आठवड्यात ५% वाढ झाल्यास सूचना',
    alertDrop: 'भाव ५% कमी झाल्यास सूचना',
    farmerName: 'शेतकरी प्रोफाइल',
    farmerPlace: 'महाराष्ट्र · मंडी बोर्ड',
    nudgeUp: (m, pct) => `<b>${m}</b> येथे भाव या आठवड्यात <b>${pct}%</b> वाढले आहेत. आता विकल्यास चांगला दर मिळू शकतो.`,
    nudgeDown: (m, pct) => `<b>${m}</b> येथे भाव या आठवड्यात <b>${pct}%</b> कमी झाले आहेत. साठवण असेल तर थोडी वाट पाहणे फायदेशीर ठरू शकते.`,
    nudgeFlat: (m) => `<b>${m}</b> येथे भाव या आठवड्यात जवळपास स्थिर आहेत. घाई किंवा उशीराची विशेष गरज नाही.`,
  },
};

let lang = 'en';
let lastNudge = null;
let lastBest = '';
let lastTrend = null;
let lastForecast = null;

document.getElementById('todayDate').textContent =
  new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

function t() { return I18N[lang]; }

function applyI18n() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    const value = t()[key];
    if (typeof value === 'string') {
      if (el.tagName === 'P' && el.querySelector('code')) {
        el.innerHTML = value.replace('data.py', '<code>data.py</code>');
      } else {
        el.textContent = value;
      }
    }
  });
  const allOpt = distSelect.querySelector('option[value="ALL"]');
  if (allOpt) allOpt.textContent = t().allDistricts;
  if (lastNudge) renderNudge(lastNudge, lastBest);
}

document.querySelectorAll('.lang button').forEach((btn) => {
  btn.addEventListener('click', () => {
    lang = btn.dataset.lang;
    document.querySelectorAll('.lang button').forEach((b) => b.classList.toggle('is-active', b === btn));
    applyI18n();
  });
});

document.querySelectorAll('.tabbar button').forEach((btn) => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    document.querySelectorAll('.tabbar button').forEach((b) => b.classList.toggle('is-active', b === btn));
    document.querySelectorAll('.view').forEach((view) => {
      const on = view.dataset.view === tab;
      view.hidden = !on;
      view.classList.toggle('is-active', on);
    });
    if (tab === 'trends' && lastTrend) {
      renderTrend(lastTrend, 'trendSvgClone');
      if (lastForecast) renderForecast(lastForecast.history, lastForecast.forecast, 'forecastSvgClone');
    }
    replayCardAnim();
  });
});

function replayCardAnim() {
  document.querySelectorAll('.view.is-active .anim-card').forEach((card) => {
    card.style.animation = 'none';
    void card.offsetWidth;
    card.style.animation = '';
  });
}

async function init() {
  const res = await fetch('/api/meta');
  const meta = await res.json();

  meta.crops.forEach((c) => cropSelect.add(new Option(`${CROP_EMOJI[c] || ''} ${c}`.trim(), c)));
  distSelect.add(new Option(t().allDistricts, 'ALL'));
  meta.districts.forEach((d) => distSelect.add(new Option(d, d)));
  distSelect.value = 'ALL';

  cropSelect.addEventListener('change', loadBoard);
  distSelect.addEventListener('change', loadBoard);

  loadBoard();
}

async function loadBoard() {
  const crop = cropSelect.value;
  const district = distSelect.value;

  const res = await fetch(`/api/board?crop=${encodeURIComponent(crop)}&district=${encodeURIComponent(district)}`);
  if (!res.ok) {
    document.getElementById('boardList').textContent = 'Could not load prices.';
    return;
  }
  const payload = await res.json();
  renderBoard(payload.records);
  lastTrend = payload.records[0];
  renderTrend(payload.records[0]);
  lastNudge = payload.nudge;
  lastBest = payload.best_market;
  renderNudge(payload.nudge, payload.best_market);
  document.getElementById('profileCrop').textContent = cropSelect.options[cropSelect.selectedIndex].text;
  document.getElementById('profileDist').textContent = distSelect.options[distSelect.selectedIndex].text;
  loadForecast(crop);
  replayCardAnim();
}

async function loadForecast(crop) {
  const res = await fetch(`/api/forecast?crop=${encodeURIComponent(crop)}`);
  if (!res.ok) return;
  const payload = await res.json();
  lastForecast = payload;
  renderForecast(payload.history.slice(-6), payload.forecast);
}

function animatePath(path) {
  if (!path) return;
  const len = Math.ceil(path.getTotalLength());
  path.style.setProperty('--len', String(len));
  path.classList.add('draw');
}

function renderForecast(recentHistory, forecast, svgId = 'forecastSvg') {
  const svg = document.getElementById(svgId);
  if (!svg) return;
  const w = 400, h = 160, padX = 22, padY = 22;

  const allPoints = recentHistory.map((item) => item.price)
    .concat(forecast.map((f) => f.predicted_price))
    .concat(forecast.map((f) => f.low))
    .concat(forecast.map((f) => f.high));
  const min = Math.min(...allPoints);
  const max = Math.max(...allPoints);
  const range = (max - min) || 1;
  const totalPoints = recentHistory.length + forecast.length;
  const stepX = (w - padX * 2) / (totalPoints - 1);

  const yFor = (v) => h - padY - ((v - min) / range) * (h - padY * 2);
  const xFor = (i) => padX + i * stepX;

  const actualPts = recentHistory.map((hpt, i) => [xFor(i), yFor(hpt.price)]);
  const predictedPts = forecast.map((f, i) => [xFor(recentHistory.length + i), yFor(f.predicted_price)]);
  const predictedPath = [actualPts[actualPts.length - 1], ...predictedPts];

  const bandTop = forecast.map((f, i) => [xFor(recentHistory.length + i), yFor(f.high)]);
  const bandBottom = forecast.map((f, i) => [xFor(recentHistory.length + i), yFor(f.low)]).reverse();
  const bandStart = [xFor(recentHistory.length - 1), yFor(recentHistory[recentHistory.length - 1].price)];

  const toPath = (pts) => pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const toAreaPath = (top, bottom, start) => {
    const upper = [start, ...top];
    return toPath(upper.concat(bottom)) + ' Z';
  };

  let inner = `
    <defs>
      <linearGradient id="forecastFill-${svgId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#e0893a" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#e0893a" stop-opacity="0"/>
      </linearGradient>
    </defs>
  `;
  for (let g = 0; g <= 3; g++) {
    const y = padY + g * ((h - padY * 2) / 3);
    inner += `<line class="forecast-grid" x1="${padX}" y1="${y}" x2="${w - padX}" y2="${y}" />`;
  }

  inner += `<path class="forecast-band" fill="url(#forecastFill-${svgId})" d="${toAreaPath(bandTop, bandBottom, bandStart)}" />`;
  inner += `<path class="forecast-actual" d="${toPath(actualPts)}" />`;
  actualPts.forEach((p) => {
    inner += `<circle class="forecast-dot-actual" cx="${p[0]}" cy="${p[1]}" r="3" />`;
  });
  inner += `<path class="forecast-predicted" d="${toPath(predictedPath)}" />`;
  predictedPts.forEach((p) => {
    inner += `<rect class="forecast-dot-predicted" x="${(p[0] - 3.2).toFixed(1)}" y="${(p[1] - 3.2).toFixed(1)}" width="6.4" height="6.4" transform="rotate(45 ${p[0].toFixed(1)} ${p[1].toFixed(1)})" />`;
  });

  const allLabels = recentHistory.map((hpt) => hpt.month.split(' ')[0]).concat(forecast.map((f) => f.month.split(' ')[0]));
  allLabels.forEach((label, i) => {
    if (i % 2 === 0) {
      inner += `<text class="forecast-label" x="${xFor(i)}" y="${h - 4}" text-anchor="middle">${label}</text>`;
    }
  });

  svg.innerHTML = inner;
  animatePath(svg.querySelector('.forecast-actual'));
  animatePath(svg.querySelector('.forecast-predicted'));
}

function renderBoard(records) {
  const list = document.getElementById('boardList');
  list.innerHTML = '';
  records.forEach((r, i) => {
    const row = document.createElement('div');
    row.className = 'row' + (i === 0 ? ' best' : '');
    row.innerHTML = `
      <div class="mkt">
        <span class="star">${i === 0 ? '★' : ''}</span>
        <span class="place"><strong>${r.market}</strong><span>${r.district}</span></span>
      </div>
      <div class="price">₹${r.modal_price.toLocaleString('en-IN')}<small>/qtl</small></div>
    `;
    list.appendChild(row);
  });
}

function renderTrend(best, svgId = 'trendSvg') {
  const series = best.series;
  const svg = document.getElementById(svgId);
  if (!svg || !series) return;
  const w = 400, h = 140, padX = 18, padY = 18;
  const min = Math.min(...series), max = Math.max(...series);
  const range = (max - min) || 1;
  const stepX = (w - padX * 2) / (series.length - 1);
  const pts = series.map((v, i) => {
    const x = padX + i * stepX;
    const y = h - padY - ((v - min) / range) * (h - padY * 2);
    return [x, y];
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');
  const area = `${path} L${pts[pts.length - 1][0].toFixed(1)},${h - padY} L${pts[0][0].toFixed(1)},${h - padY} Z`;

  let svgInner = `
    <defs>
      <linearGradient id="trendFill-${svgId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1c8a6a" stop-opacity="0.28"/>
        <stop offset="100%" stop-color="#1c8a6a" stop-opacity="0"/>
      </linearGradient>
    </defs>
  `;
  for (let g = 0; g <= 3; g++) {
    const y = padY + g * ((h - padY * 2) / 3);
    svgInner += `<line class="trend-grid" x1="${padX}" y1="${y}" x2="${w - padX}" y2="${y}" />`;
  }
  svgInner += `<path class="trend-area" fill="url(#trendFill-${svgId})" d="${area}" />`;
  svgInner += `<path class="trend-line" d="${path}" />`;
  pts.forEach((p, i) => {
    svgInner += `<circle class="trend-dot" cx="${p[0]}" cy="${p[1]}" r="${i === pts.length - 1 ? 4.2 : 3}" />`;
    svgInner += `<text class="trend-day" x="${p[0]}" y="${h - 2}" text-anchor="middle">${DAYS[i]}</text>`;
  });
  svg.innerHTML = svgInner;
  animatePath(svg.querySelector('.trend-line'));
}

function renderNudge(nudge, bestMarket) {
  const box = document.getElementById('nudgeBox');
  const text = document.getElementById('nudgeText');
  const pct = Math.abs(nudge.pct_change);
  let html = t().nudgeFlat(bestMarket);
  if (nudge.direction === 'up') html = t().nudgeUp(bestMarket, pct);
  if (nudge.direction === 'down') html = t().nudgeDown(bestMarket, pct);

  box.className = 'insight anim-card ' + nudge.direction;
  text.innerHTML = html;
  document.getElementById('alertsNudge').className = 'insight anim-card ' + nudge.direction;
  document.getElementById('alertsNudgeText').innerHTML = html;
}

init();
