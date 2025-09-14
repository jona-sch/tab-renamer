// Runs when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["globalEnabled"], (res) => {
    if (res.globalEnabled === undefined) {
      chrome.storage.local.set({ globalEnabled: true });
    }
  });
});

// Runs when a tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    chrome.tabs.sendMessage(tabId, { action: "applyRules" }, () => {
      // Ignore errors from tabs that don't have the content script
      if (chrome.runtime.lastError) {
        // Optional: console.warn(chrome.runtime.lastError.message);
      }
    });
  }
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "getRules") {
    chrome.storage.local.get("rules", (result) => {
      sendResponse(result.rules || []);
    });
    return true; // Required to indicate async response
  }
});
