function renderRules(rules) {
  const list = document.getElementById("ruleList");
  list.innerHTML = "";

  rules.forEach((rule, index) => {
    const li = document.createElement("li");

    // Text part
    const text = document.createElement("span");
    text.textContent = `${rule.target} | ${rule.filter} → ${rule.rename}`;
    if (!rule.enabled) {
      text.style.opacity = "0.5"; // visually dim disabled rules
    }

    // Action buttons
    const actions = document.createElement("div");
    actions.className = "actions";

    // Toggle button
    const toggle = document.createElement("button");
    toggle.textContent = rule.enabled ? "Deactivate" : "Activate";
    toggle.className = rule.enabled ? "deactivate" : "activate";
    toggle.addEventListener("click", async () => {
      rules[index].enabled = !rules[index].enabled;
      await browser.storage.local.set({ rules });
      renderRules(rules); // re-render
    });

    // Edit button
    const edit = document.createElement("button");
    edit.textContent = "Edit";
    edit.className = "edit";
    edit.addEventListener("click", () => {
      document.getElementById("target").value = rule.target;
      document.getElementById("filter").value = rule.filter;
      document.getElementById("rename").value = rule.rename;
      rules.splice(index, 1); // remove it so it can be resaved
      browser.storage.local.set({ rules }).then(() => renderRules(rules));
    });

    // Delete button
    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "delete";
    del.addEventListener("click", () => {
      rules.splice(index, 1);
      browser.storage.local.set({ rules }).then(() => renderRules(rules));
    });

    actions.appendChild(toggle);
    actions.appendChild(edit);
    actions.appendChild(del);

    li.appendChild(text);
    li.appendChild(actions);
    list.appendChild(li);
  });
}
  
async function loadRules() {
  const { rules = [] } = await browser.storage.local.get("rules");
  renderRules(rules);
}
  
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ruleForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const target = document.getElementById("target").value.trim();
    const filter = document.getElementById("filter").value.trim();
    const rename = document.getElementById("rename").value.trim();
    const enabled = true;

    if (!target || !filter || !rename) return;

    try {
      new RegExp(filter);
    } catch (err) {
      alert("❌ Invalid regex in filter:\n" + err.message);
      return;
    }

    const { rules = [] } = await browser.storage.local.get("rules");
    rules.push({ target, filter, rename, enabled });
    await browser.storage.local.set({ rules });

    form.reset();
    loadRules();
  });

  // --- Download rules ---
  document.getElementById("downloadRules").addEventListener("click", async () => {
    const { rules = [] } = await browser.storage.local.get("rules");
    const blob = new Blob([JSON.stringify(rules, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "tab_renamer_rules.json";
    a.click();

    URL.revokeObjectURL(url);
  });

  // --- Upload rules ---
  const uploadInput = document.getElementById("uploadRules");
  document.getElementById("uploadButton").addEventListener("click", () => {
    uploadInput.click(); // trigger file picker
  });

  uploadInput.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    try {
      const imported = JSON.parse(text);
      if (!Array.isArray(imported)) throw new Error("Invalid file format");

      await browser.storage.local.set({ rules: imported });
      loadRules();
    } catch (err) {
      alert("Invalid rules file: " + err.message);
    }
  });

  loadRules();
});