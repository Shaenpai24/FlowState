// FlowState Focus Guardian - Background Script
let currentSession = null;
let allowedSites = [];
let sessionStartTime = null;

// Listen for messages from the web app
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);
  
  switch (message.type) {
    case 'FLOW_SESSION_START':
      startFlowSession(message.payload);
      sendResponse({ success: true });
      break;
      
    case 'FLOW_SESSION_END':
      endFlowSession();
      sendResponse({ success: true });
      break;
      
    case 'GET_SESSION_STATUS':
      sendResponse({ 
        isActive: !!currentSession,
        session: currentSession 
      });
      break;
      
    default:
      sendResponse({ error: 'Unknown message type' });
  }
  
  return true; // Keep message channel open for async response
});

// Listen for tab updates to check for distractions
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!currentSession || !changeInfo.url) return;
  
  checkForDistraction(tab.url, tabId);
});

// Listen for tab activation to check for distractions
chrome.tabs.onActivated.addListener((activeInfo) => {
  if (!currentSession) return;
  
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      checkForDistraction(tab.url, activeInfo.tabId);
    }
  });
});

function startFlowSession(payload) {
  currentSession = {
    taskId: payload.taskId,
    startTime: Date.now(),
    allowedSites: payload.allowedSites || [],
    distractions: []
  };
  
  allowedSites = payload.allowedSites || [];
  sessionStartTime = Date.now();
  
  // Store session in chrome storage
  chrome.storage.local.set({ currentSession });
  
  // Update badge to show active session
  chrome.action.setBadgeText({ text: '🔥' });
  chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
  
  console.log('Flow session started:', currentSession);
}

function endFlowSession() {
  if (!currentSession) return;
  
  const sessionDuration = Date.now() - sessionStartTime;
  
  // Log final session data
  console.log('Flow session ended:', {
    ...currentSession,
    duration: sessionDuration,
    endTime: Date.now()
  });
  
  currentSession = null;
  allowedSites = [];
  sessionStartTime = null;
  
  // Clear storage
  chrome.storage.local.remove(['currentSession']);
  
  // Clear badge
  chrome.action.setBadgeText({ text: '' });
  
  console.log('Flow session ended');
}

function checkForDistraction(url, tabId) {
  if (!currentSession || !url) return;
  
  const hostname = extractHostname(url);
  const isAllowed = isUrlAllowed(hostname);
  
  console.log('Checking URL:', hostname, 'Allowed:', isAllowed);
  
  if (!isAllowed) {
    // Log distraction
    const distraction = {
      site: hostname,
      timestamp: Date.now(),
      url: url
    };
    
    currentSession.distractions.push(distraction);
    
    // Update storage
    chrome.storage.local.set({ currentSession });
    
    // Inject the focus overlay
    injectFocusOverlay(tabId, hostname);
    
    console.log('Distraction detected:', distraction);
  }
}

function extractHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return url;
  }
}

function isUrlAllowed(hostname) {
  if (!hostname) return true;
  
  // Always allow localhost and local development
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return true;
  }
  
  // Check against allowed sites
  return allowedSites.some(site => 
    hostname.includes(site) || site.includes(hostname)
  );
}

function injectFocusOverlay(tabId, hostname) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: showFocusOverlay,
    args: [hostname, currentSession.taskId]
  }).catch(err => {
    console.log('Could not inject script:', err);
  });
}

// This function will be injected into the page
function showFocusOverlay(hostname, taskId) {
  // Remove existing overlay if present
  const existingOverlay = document.getElementById('flowstate-focus-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }
  
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'flowstate-focus-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    ">
      <div style="
        background: white;
        padding: 2rem;
        border-radius: 1rem;
        text-align: center;
        max-width: 400px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      ">
        <div style="
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          font-size: 24px;
        ">⚡</div>
        
        <h2 style="
          margin: 0 0 0.5rem;
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
        ">Still in Flow Session?</h2>
        
        <p style="
          margin: 0 0 1.5rem;
          color: #6b7280;
          font-size: 0.9rem;
        ">You're currently focused on a task. <strong>${hostname}</strong> isn't on your allowed list.</p>
        
        <div style="display: flex; gap: 0.75rem; justify-content: center;">
          <button id="flowstate-back-to-work" style="
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 500;
            cursor: pointer;
            font-size: 0.9rem;
          ">Back to Work</button>
          
          <button id="flowstate-snooze" style="
            background: #f3f4f6;
            color: #374151;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 500;
            cursor: pointer;
            font-size: 0.9rem;
          ">Snooze 5min</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Add event listeners
  document.getElementById('flowstate-back-to-work').addEventListener('click', () => {
    window.history.back();
  });
  
  document.getElementById('flowstate-snooze').addEventListener('click', () => {
    overlay.remove();
    // Set a timeout to show overlay again in 5 minutes
    setTimeout(() => {
      if (document.getElementById('flowstate-focus-overlay')) return;
      document.body.appendChild(overlay);
    }, 5 * 60 * 1000);
  });
}

// Initialize on startup
chrome.runtime.onStartup.addListener(() => {
  // Restore session from storage if exists
  chrome.storage.local.get(['currentSession'], (result) => {
    if (result.currentSession) {
      currentSession = result.currentSession;
      allowedSites = currentSession.allowedSites || [];
      sessionStartTime = currentSession.startTime;
      
      chrome.action.setBadgeText({ text: '🔥' });
      chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
    }
  });
});

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('FlowState Focus Guardian installed');
});