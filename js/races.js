async function loadRaces() {
  try {
    const [pastRes, upcomingRes] = await Promise.all([
      fetch('data/past-races.json'),
      fetch('data/upcoming-races.json')
    ]);
    const pastRaces = await pastRes.json();
    const upcomingRaces = await upcomingRes.json();
    renderPastRaces(pastRaces);
    renderUpcomingRaces(upcomingRaces);
  } catch (err) {
    console.error('Failed to load race data:', err);
    document.getElementById('past-races-table').innerHTML =
      '<p class="no-data">ERROR: Could not load race data!!</p>';
    document.getElementById('upcoming-races-table').innerHTML =
      '<p class="no-data">ERROR: Could not load race data!!</p>';
  }
}

function renderPastRaces(races) {
  const container = document.getElementById('past-races-table');
  if (!races.length) {
    container.innerHTML = '<p class="no-data">No past races yet!!</p>';
    return;
  }
  races.sort((a, b) => new Date(b.date) - new Date(a.date));
  let html = `
    <table class="race-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Race</th>
          <th>Distance</th>
          <th>Time</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
  `;
  for (const race of races) {
    html += `
      <tr>
        <td>${race.date}</td>
        <td>${race.name}</td>
        <td>${race.distance}</td>
        <td>${race.time}</td>
        <td>${race.notes || '—'}</td>
      </tr>
    `;
  }
  html += '</tbody></table>';
  container.innerHTML = html;
}

function renderUpcomingRaces(races) {
  const container = document.getElementById('upcoming-races-table');
  if (!races.length) {
    container.innerHTML = '<p class="no-data">No upcoming races yet!!</p>';
    return;
  }
  races.sort((a, b) => new Date(a.date) - new Date(b.date));
  let html = `
    <table class="race-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Race</th>
          <th>Distance</th>
          <th>Goal Time</th>
        </tr>
      </thead>
      <tbody>
  `;
  for (const race of races) {
    html += `
      <tr>
        <td>${race.date}</td>
        <td>${race.name}</td>
        <td>${race.distance}</td>
        <td>${race.goal || 'TBD'}</td>
      </tr>
    `;
  }
  html += '</tbody></table>';
  container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', loadRaces);
