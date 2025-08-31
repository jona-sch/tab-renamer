// In background.js (or first-run logic)
browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.get(["globalEnabled"]).then((res) => {
    if (res.globalEnabled === undefined) {
      browser.storage.local.set({ globalEnabled: true });
    }
  });
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete") {
        browser.tabs.sendMessage(tabId, { action: "applyRules" }).catch(() => {});
    }
});

// Handle requests from content scripts
browser.runtime.onMessage.addListener((msg, sender) => {
  if (msg.action === "getRules") {
    return browser.storage.local.get("rules").then(result => {
      return result.rules || [];
    });
  }
});
