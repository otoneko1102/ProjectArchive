async function pingServer(url) {
  try {
    const start = Date.now();
    const response = await fetch(url, { mode: 'no-cors' });
    const end = Date.now();
    const responseTime = end - start;

    let statusText, statusClass, barColor, resTime;

    if (response.status > 200) {
      statusText = 'Error';
      statusClass = 'status-error';
      barColor = 'red';
      resTime = '-';
    } else if (responseTime > 200) {
      statusText = 'Warning';
      statusClass = 'status-warning';
      barColor = 'yellow';
      resTime = `${responseTime} ms`;
    } else {
      statusText = 'Working';
      statusClass = 'status-ok';
      barColor = 'green';
      resTime = `${responseTime} ms`;
    }

    document.getElementById('website-status-text').textContent = statusText;
    document.getElementById('website-status-text').className = statusClass;
    document.getElementById('website-response-time').textContent = resTime;

    const pingBar = document.getElementById('ping-bar');
    const maxPing = 200;
    const barWidth = resTime === '-' ? '0' : Math.min((responseTime / maxPing) * 100, 100);
    pingBar.style.width = `${barWidth}%`;
    pingBar.style.backgroundColor = barColor;
  } catch {
    document.getElementById('website-status-text').textContent = 'Error';
    document.getElementById('website-status-text').className = 'status-error';
    document.getElementById('website-response-time').textContent = '-';
    document.getElementById('ping-bar').style.width = '0%';
    document.getElementById('ping-bar').style.backgroundColor = 'red';
  }
}