function globToRegex(glob) {
  const escaped = glob.replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp("^" + escaped + "$");
}

function applyRules(rules, url, title) {
  for (const { target, filter, rename, enabled } of rules) {
    if (!enabled) continue;

    if (!globToRegex(target).test(url)) continue;

    const regex = new RegExp(filter);
    const match = title.match(regex);
    if (!match) continue;

    let newTitle = rename;
    if (match.groups) {
      for (const [key, val] of Object.entries(match.groups)) {
        newTitle = newTitle.replace(new RegExp(`<${key}>`, "g"), val);
      }
    }
    console.log(newTitle);
    return newTitle;
  }
  return null;
}

(async function () {
  try {
    const rules = await chrome.runtime.sendMessage({ action: "getRules" });

    if (!rules) return;

    const newTitle = applyRules(rules, window.location.href, document.title);
    if (newTitle) {
      document.title = newTitle;
    }
  } catch (e) {
    console.error("TabRenamer error:", e);
  }
})();