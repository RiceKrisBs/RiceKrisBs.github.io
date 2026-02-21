// ============================================================
// UTILITY — Time parsing and formatting
// ============================================================

// Parse "h:mm:ss" or "m:ss" to total seconds. Returns null if invalid.
function parseTime(str) {
  const parts = str.trim().split(':').map(Number);
  if (parts.length < 2 || parts.length > 3) return null;
  if (parts.some(isNaN) || parts.some(p => p < 0)) return null;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return parts[0] * 60 + parts[1];
}

// Format total seconds to "h:mm:ss" or "m:ss"
function formatTime(totalSecs) {
  totalSecs = Math.round(totalSecs);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
  return `${m}:${pad(s)}`;
}

// Format pace seconds to "m:ss"
function formatPace(paceSecs) {
  const m = Math.floor(paceSecs / 60);
  const s = Math.round(paceSecs % 60);
  return `${m}:${pad(s)}`;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

// ============================================================
// PACE / DISTANCE / TIME CALCULATOR
// ============================================================

let lastCalculatedField = null;

function applyPresetDistance(val) {
  if (!val) return;
  const [distance, unit] = val.split('|');
  document.getElementById('calc-distance').value = distance;
  document.getElementById('calc-distance-unit').value = unit;
}

function calculatePaceDistanceTime() {
  const distanceInput = document.getElementById('calc-distance').value.trim();
  const timeInput     = document.getElementById('calc-time').value.trim();
  const paceInput     = document.getElementById('calc-pace').value.trim();
  const distUnit      = document.getElementById('calc-distance-unit').value;
  const paceUnit      = document.getElementById('calc-pace-unit').value;
  const resultEl      = document.getElementById('calc-result');

  const hasDistance = distanceInput !== '';
  const hasTime     = timeInput !== '';
  const hasPace     = paceInput !== '';
  const filledCount = [hasDistance, hasTime, hasPace].filter(Boolean).length;

  if (filledCount < 2) {
    return showResult(resultEl, 'ERROR: Fill in at least 2 fields!!', 'error');
  }
  if (filledCount === 3) {
    return showResult(resultEl, 'ERROR: Leave ONE field blank for me to calculate!!', 'error');
  }

  // Parse inputs — convert everything to miles and seconds internally
  let distMiles = hasDistance ? parseFloat(distanceInput) : null;
  if (hasDistance) {
    if (isNaN(distMiles) || distMiles <= 0)
      return showResult(resultEl, 'ERROR: Distance must be a positive number!!', 'error');
    if (distUnit === 'km') distMiles *= 0.621371;
  }

  let timeSecs = hasTime ? parseTime(timeInput) : null;
  if (hasTime && timeSecs === null)
    return showResult(resultEl, 'ERROR: Invalid time format!! Use h:mm:ss or m:ss', 'error');

  // Pace is always entered as per-mile or per-km; convert to per-mile internally
  let paceSecsPerMile = hasPace ? parseTime(paceInput) : null;
  if (hasPace && paceSecsPerMile === null)
    return showResult(resultEl, 'ERROR: Invalid pace format!! Use m:ss (e.g. 8:30)', 'error');
  if (hasPace && paceUnit === 'km') paceSecsPerMile *= 0.621371;

  // Calculate the missing field
  if (!hasDistance) {
    distMiles = timeSecs / paceSecsPerMile;
    const display = distUnit === 'km' ? distMiles / 0.621371 : distMiles;
    document.getElementById('calc-distance').value = display.toFixed(2);
    lastCalculatedField = 'calc-distance';
    showResult(resultEl, `DISTANCE: ${display.toFixed(2)} ${distUnit === 'km' ? 'km' : 'miles'}`, 'success');
  } else if (!hasTime) {
    timeSecs = distMiles * paceSecsPerMile;
    document.getElementById('calc-time').value = formatTime(timeSecs);
    lastCalculatedField = 'calc-time';
    showResult(resultEl, `TIME: ${formatTime(timeSecs)}`, 'success');
  } else {
    paceSecsPerMile = timeSecs / distMiles;
    const displayPace = paceUnit === 'km' ? paceSecsPerMile / 0.621371 : paceSecsPerMile;
    const paceStr = formatPace(displayPace);
    document.getElementById('calc-pace').value = paceStr;
    lastCalculatedField = 'calc-pace';
    showResult(resultEl, `PACE: ${paceStr} per ${paceUnit === 'km' ? 'km' : 'mile'}`, 'success');
  }
}

function clearLastCalculated() {
  if (lastCalculatedField) {
    document.getElementById(lastCalculatedField).value = '';
    lastCalculatedField = null;
  }
  const resultEl = document.getElementById('calc-result');
  resultEl.textContent = '';
  resultEl.className = 'calc-result';
}

function clearPaceCalculator() {
  ['calc-distance', 'calc-time', 'calc-pace'].forEach(id => {
    document.getElementById(id).value = '';
  });
  lastCalculatedField = null;
  const resultEl = document.getElementById('calc-result');
  resultEl.textContent = '';
  resultEl.className = 'calc-result';
}

function showResult(el, message, type) {
  el.textContent = type === 'success' ? `✓ ${message}` : `✗ ${message}`;
  el.className = `calc-result ${type}`;
}

// ============================================================
// PACE / SPEED CONVERTER
// ============================================================

function convertPaceToSpeed(unit) {
  const other     = unit === 'mile' ? 'km' : 'mile';
  const factor    = unit === 'mile' ? 0.621371 : 1 / 0.621371; // pace_other = pace_this * factor
  const paceSecs  = parseTime(document.getElementById(`conv-pace-${unit}`).value.trim());
  if (!paceSecs || paceSecs <= 0) {
    ['conv-speed-' + unit, 'conv-pace-' + other, 'conv-speed-' + other].forEach(id => {
      document.getElementById(id).value = '';
    });
    return;
  }
  const otherPaceSecs = paceSecs * factor;
  document.getElementById(`conv-speed-${unit}`).value  = (60 / (paceSecs / 60)).toFixed(2);
  document.getElementById(`conv-pace-${other}`).value  = formatPace(otherPaceSecs);
  document.getElementById(`conv-speed-${other}`).value = (60 / (otherPaceSecs / 60)).toFixed(2);
}

function convertSpeedToPace(unit) {
  const other   = unit === 'mile' ? 'km' : 'mile';
  const factor  = unit === 'mile' ? 0.621371 : 1 / 0.621371;
  const speed   = parseFloat(document.getElementById(`conv-speed-${unit}`).value);
  if (!speed || speed <= 0) {
    ['conv-pace-' + unit, 'conv-pace-' + other, 'conv-speed-' + other].forEach(id => {
      document.getElementById(id).value = '';
    });
    return;
  }
  const paceSecs      = (60 / speed) * 60;
  const otherPaceSecs = paceSecs * factor;
  document.getElementById(`conv-pace-${unit}`).value   = formatPace(paceSecs);
  document.getElementById(`conv-pace-${other}`).value  = formatPace(otherPaceSecs);
  document.getElementById(`conv-speed-${other}`).value = (60 / (otherPaceSecs / 60)).toFixed(2);
}

// ============================================================
// RACE TIME PREDICTOR — Riegel Formula: T2 = T1 * (D2/D1)^1.06
// ============================================================

const PREDICT_DISTANCES = [
  { label: '1 Mile',        meters: 1609.34  },
  { label: '5K',            meters: 5000     },
  { label: '5 Mile',        meters: 8046.72  },
  { label: '10K',           meters: 10000    },
  { label: '15K',           meters: 15000    },
  { label: '10 Mile',       meters: 16093.4  },
  { label: 'Half Marathon', meters: 21097.5  },
  { label: 'Marathon',      meters: 42195    },
];

function predictRaceTimes() {
  const inputMeters = parseFloat(document.getElementById('pred-distance').value);
  const timeStr     = document.getElementById('pred-time').value.trim();
  const resultEl    = document.getElementById('pred-result');

  const inputSecs = parseTime(timeStr);
  if (!inputSecs || inputSecs <= 0) {
    resultEl.innerHTML = '✗ ERROR: Invalid time format!! Use h:mm:ss or m:ss';
    resultEl.className = 'pred-result error';
    return;
  }

  let html = `
    <div class="table-scroll">
      <table class="pred-table">
        <thead>
          <tr>
            <th>Distance</th>
            <th>Predicted Time</th>
            <th>Pace / Mile</th>
          </tr>
        </thead>
        <tbody>
  `;

  for (const race of PREDICT_DISTANCES) {
    const predictedSecs  = inputSecs * Math.pow(race.meters / inputMeters, 1.06);
    const pacePerMileSec = predictedSecs / (race.meters / 1609.34);
    const isInputRow     = Math.abs(race.meters - inputMeters) < 1;
    const rowClass       = isInputRow ? ' class="input-row"' : '';
    const marker         = isInputRow ? ' ★' : '';
    html += `
      <tr${rowClass}>
        <td>${race.label}${marker}</td>
        <td>${formatTime(predictedSecs)}</td>
        <td>${formatPace(pacePerMileSec)} /mi</td>
      </tr>
    `;
  }

  html += '</tbody></table></div>';
  resultEl.innerHTML = html;
  resultEl.className = 'pred-result success';
}
