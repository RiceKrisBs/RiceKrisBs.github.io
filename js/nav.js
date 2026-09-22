(function () {
  const NAV_LINKS = [
    { href: 'index.html',           label: '🏠 HOME' },
    { href: 'pace-calculator.html', label: '⚡ PACE CALC' },
    { href: 'speed-converter.html', label: '🔄 SPEED' },
    { href: 'race-predictor.html',  label: '🏆 PREDICTOR' },
    { href: 'races.html',           label: '🏅 RACES' },
  ];

  function renderNav() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const path = window.location.pathname;
    // GitHub Pages serves both /page and /page.html, so compare without the extension
    const stripExt = name => name.replace(/\.html$/, '');
    const page = stripExt(path.substring(path.lastIndexOf('/') + 1) || 'index.html');

    const linksHtml = NAV_LINKS.map(({ href, label }) => {
      const active = stripExt(href) === page ? ' class="active"' : '';
      return `<a href="${href}"${active}>${label}</a>`;
    }).join('\n      ');

    nav.innerHTML = `
      <button class="nav-hamburger" onclick="toggleNav()">☰ MENU</button>
      <div class="nav-links" id="nav-links">
        ${linksHtml}
      </div>`;
  }

  function toggleNav() {
    const links = document.getElementById('nav-links');
    const btn   = document.querySelector('.nav-hamburger');
    links.classList.toggle('open');
    btn.textContent = links.classList.contains('open') ? '✕ CLOSE' : '☰ MENU';
  }

  window.toggleNav = toggleNav;

  document.addEventListener('DOMContentLoaded', renderNav);
})();
