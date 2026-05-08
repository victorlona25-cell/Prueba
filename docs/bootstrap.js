window.addEventListener('load', function () {
  try {
    if (typeof render === 'function') {
      render();
    }
    if (typeof drawChart === 'function' && typeof page !== 'undefined' && page === 'trade') {
      setTimeout(drawChart, 100);
    }
  } catch (err) {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = '<div style="background:#060d1a;color:#f05e5e;padding:20px;font-family:Arial"><h2>Error cargando WebTrade</h2><pre>' + err.message + '</pre></div>';
    }
  }
});
