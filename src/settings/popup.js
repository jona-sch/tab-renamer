document.addEventListener("DOMContentLoaded", () => {
  const openSettingsBtn = document.getElementById("openSettings");
  const quickRuleForm = document.getElementById("quickRuleForm");
  const status = document.getElementById("status");

  // Open settings page
  openSettingsBtn.addEventListener("click", () => {
    chrome.runtime.openOptionsPage();
  });

  // Handle quick rule submission
  quickRuleForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const target = document.getElementById("target").value.trim();
    const filter = document.getElementById("filter").value.trim();
    const rename = document.getElementById("rename").value.trim();

    if (!target || !filter || !rename) {
      status.textContent = "⚠ Please fill out all fields.";
      status.style.color = "red";
      return;
    }

    // --- Regex validation ---
    try {
      new RegExp(filter);
    } catch (err) {
      status.textContent = "❌ Invalid regex: " + err.message;
      status.style.color = "red";
      return;
    }

    try {
      const { rules = [] } = await chrome.storage.local.get("rules");
      const enabled = true;
      rules.push({ target, filter, rename, enabled });
      await chrome.storage.local.set({ rules });

      status.textContent = "✅ Rule added!";
      status.style.color = "green";
      quickRuleForm.reset();
    } catch (err) {
      console.error("Failed to save rule:", err);
      status.textContent = "❌ Error saving rule.";
      status.style.color = "red";
    }
  });
});