// 全站字體大小調整（浮動控件，任何頁面都能調，選完記在 localStorage）
(function () {
  var LEVELS = [0.85, 1.0, 1.15, 1.3, 1.5];
  var LABELS = ["A−−", "A", "A+", "A++", "A+++"];
  var KEY = "gaoji_…evely";
  var level = parseInt(localStorage.getItem(KEY), 10);
  if (isNaN(level) || level < 0 || level >= LEVELS.length) level = 1;

  function apply() {
    var z = LEVELS[level];
    document.documentElement.style.zoom = z;          // Chrome/Safari/新Firefox
    document.documentElement.style.setProperty("--gscale", z); // 備援
    var btn = document.getElementById("fs-current");
    if (btn) btn.textContent = LABELS[level];
    var tip = document.getElementById("fs-tip");
    if (tip) {
      tip.textContent = ["小","標準","大","特大","超大"][level] + "字級";
    }
    localStorage.setItem(KEY, String(level));
  }

  function step(d) {
    level = Math.max(0, Math.min(LEVELS.length - 1, level + d));
    apply();
  }

  function mount() {
    if (document.getElementById("fs-widget")) return;
    var box = document.createElement("div");
    box.id = "fs-widget";
    box.innerHTML =
      '<button id="fs-down" title="變小">A−</button>' +
      '<button id="fs-current" title="目前字級"></button>' +
      '<button id="fs-up" title="變大">A＋</button>';
    document.body.appendChild(box);
    var tip = document.createElement("div");
    tip.id = "fs-tip";
    box.appendChild(tip);
    document.getElementById("fs-down").addEventListener("click", function () { step(-1); });
    document.getElementById("fs-up").addEventListener("click", function () { step(1); });
    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
  apply();
})();
