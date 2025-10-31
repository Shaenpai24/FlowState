// FlowState Focus Guardian - Content Script
console.log('FlowState Focus Guardian content script loaded');

// Listen for messages from the web app
window.addEventListener('message', (event) => {
  // Only accept messages from same origin
  if (event.origin !== window.location.origin) return;
  
  const { type, payload } = event.data;
  
  switch (type) {
    case 'FLOW_SESSION_START':
      chrome.runtime.sendMessage({
        type: 'FLOW_SESSION_START',
        payload
      });
      break;
      
    case 'FLOW_SESSION_END':
      chrome.runtime.sendMessage({
        type: 'FLOW_SESSION_END',
        payload
      });
      break;
  }
});

// Inject communication bridge
const script = document.createElement('script');
script.textContent = `
  // Bridge between page and extension
  window.FlowStateExtension = {
    startSession: (taskId, allowedSites) => {
      window.postMessage({
        type: 'FLOW_SESSION_START',
        payload: { taskId, allowedSites }
      }, window.location.origin);
    },
    
    endSession: (sessionId) => {
      window.postMessage({
        type: 'FLOW_SESSION_END',
        payload: { sessionId }
      }, window.location.origin);
    }
  };
`;
document.documentElement.appendChild(script);
script.remove();