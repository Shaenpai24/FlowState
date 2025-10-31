// FlowState Focus Guardian - Popup Script
document.addEventListener('DOMContentLoaded', () => {
  updateStatus();
  
  // Update status every second
  setInterval(updateStatus, 1000);
});

function updateStatus() {
  chrome.runtime.sendMessage({ type: 'GET_SESSION_STATUS' }, (response) => {
    const statusEl = document.getElementById('status');
    const statusTextEl = document.getElementById('status-text');
    const sessionInfoEl = document.getElementById('session-info');
    
    if (response && response.isActive && response.session) {
      const session = response.session;
      const duration = Math.floor((Date.now() - session.startTime) / 1000);
      
      statusEl.className = 'status active';
      statusTextEl.textContent = 'Flow Session Active';
      sessionInfoEl.style.display = 'block';
      sessionInfoEl.innerHTML = `
        <div>Duration: ${formatDuration(duration)}</div>
        <div>Distractions: ${session.distractions.length}</div>
        <div>Allowed sites: ${session.allowedSites.length}</div>
      `;
    } else {
      statusEl.className = 'status inactive';
      statusTextEl.textContent = 'No active Flow Session';
      sessionInfoEl.style.display = 'none';
    }
  });
}

function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
}