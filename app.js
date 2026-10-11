/* 高級大人成長手冊 — 前端邏輯
 * 路由：#/home | #/cat/<id> | #/finance/<id>
 * 右側內容隨 sidebar 點擊切換；財務站點用 iframe 內嵌，不跳走。
 */
(function () {
  const CFG = window.SITE_CONFIG || { categories: [], financeLinks: [] };
  const content = document.getElementById("content");
  const catNav = document.getElementById("category-nav");
  const finNav = document.getElementById("finance-nav");
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menu-toggle");

  // ---- header 設定 ----
  document.getElementById("site-name").textContent = CFG.siteName || "高級大人成長手冊";
  document.getElementById("site-tagline").textContent = CFG.tagline || "";
  document.getElementById("owner-name").textContent = CFG.owner || "";
  document.title = CFG.siteName || document.title;

  // ---- 打卡進度（localStorage）----
  const STORE_KEY = "gaoji-daren-checkins";
  function loadCheckins() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveCheckins(d) { localStorage.setItem(STORE_KEY, JSON.stringify(d)); }

  // ---- 渲染 sidebar ----
  function buildNav() {
    catNav.innerHTML = "";
    homeLink(catNav);
    (CFG.categories || []).forEach(function (cat) {
      catNav.appendChild(navItem("#/cat/" + cat.id, cat.icon + " " + cat.title, cat.id));
    });
    finNav.innerHTML = "";
    (CFG.financeLinks || []).forEach(function (f) {
      finNav.appendChild(navItem("#/finance/" + f.id, f.icon + " " + f.title, f.id));
    });
  }

  function homeLink(ul) {
    ul.appendChild(navItem("#/home", "🏠 總覽", "home"));
  }

  function navItem(href, label, id) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = href;
    a.textContent = label;
    a.dataset.route = href;
    a.dataset.id = id;
    li.appendChild(a);
    return li;
  }

  function highlightActive(hash) {
    document.querySelectorAll(".nav-list a").forEach(function (a) {
      a.classList.toggle("active", a.dataset.route === hash);
    });
  }

  // ---- 頁面渲染 ----
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderHome() {
    const checkins = loadCheckins();
    const total = (CFG.categories || []).reduce(function (n, c) { return n + c.items.length; }, 0);
    const done = Object.keys(checkins).filter(function (k) { return checkins[k]; }).length;
    const pct = total ? Math.round((done / total) * 100) : 0;

    let html = '<div class="page"><div class="hero">';
    html += '<h2>' + esc(CFG.siteName || "高級大人成長手冊") + '</h2>';
    html += '<p class="hero-sub">' + esc(CFG.tagline || "") + '</p>';
    html += '<div class="progress-card"><div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
    html += '<p class="progress-text">已打卡 <b>' + done + '</b> / ' + total + ' 項（' + pct + '%）</p></div>';
    html += '</div><div class="card-grid">';

    (CFG.categories || []).forEach(function (cat) {
      const cdone = cat.items.filter(function (_, i) { return checkins[cat.id + ":" + i]; }).length;
      html += '<a class="card" href="#/cat/' + cat.id + '">';
      html += '<span class="card-icon">' + esc(cat.icon) + '</span>';
      html += '<span class="card-title">' + esc(cat.title) + '</span>';
      html += '<span class="card-meta">' + cdone + " / " + cat.items.length + " 項</span>";
      html += '</a>';
    });

    (CFG.financeLinks || []).forEach(function (f) {
      html += '<a class="card card-finance" href="#/finance/' + f.id + '">';
      html += '<span class="card-icon">' + esc(f.icon) + '</span>';
      html += '<span class="card-title">' + esc(f.title) + '</span>';
      html += '<span class="card-meta">財務分析站 ↗</span>';
      html += '</a>';
    });

    html += '</div><p class="hint">💡 想新增分類或財經站：編輯 <code>config.js</code> 即可，不用改其他檔案。</p></div>';
    content.innerHTML = html;
  }

  function renderCategory(catId) {
    const cat = (CFG.categories || []).find(function (c) { return c.id === catId; });
    if (!cat) return renderNotFound();
    const checkins = loadCheckins();

    let html = '<div class="page"><div class="page-head"><h2>' + esc(cat.icon) + " " + esc(cat.title) + '</h2>';
    html += '<p class="page-sub">做到一項、打卡一項。贵在持續，不在速度。</p></div><ul class="checklist">';

    cat.items.forEach(function (item, i) {
      const key = cat.id + ":" + i;
      const checked = !!checkins[key];
      html += '<li class="check-item' + (checked ? " done" : "") + '">';
      html += '<label><input type="checkbox" data-key="' + esc(key) + '"' + (checked ? " checked" : "") + " />";
      html += '<span class="check-text">' + esc(item.text) + '</span></label>';
      if (item.note) html += '<p class="check-note">📌 ' + esc(item.note) + '</p>';
      html += '</li>';
    });

    html += '</ul></div>';
    content.innerHTML = html;

    content.querySelectorAll('input[type="checkbox"]').forEach(function (cb) {
      cb.addEventListener("change", function () {
        const d = loadCheckins();
        if (cb.checked) d[cb.dataset.key] = true; else delete d[cb.dataset.key];
        saveCheckins(d);
        cb.closest(".check-item").classList.toggle("done", cb.checked);
      });
    });
  }

  function renderFinance(fid) {
    const f = (CFG.financeLinks || []).find(function (x) { return x.id === fid; });
    if (!f) return renderNotFound();

    let html = '<div class="page page-embed"><div class="page-head embed-head">';
    html += '<div><h2>' + esc(f.icon) + " " + esc(f.title) + '</h2>';
    html += '<p class="page-sub">' + esc(f.url) + '</p></div>';
    html += '<div class="embed-actions">';
    html += '<button id="reload-frame" class="btn">↻ 重新載入</button>';
    html += '<a class="btn" target="_blank" rel="noopener" href="' + esc(f.url) + '">在新分頁開啟 ↗</a>';
    html += '</div></div>';
    html += '<div class="embed-wrap"><div id="embed-fallback" class="embed-fallback" hidden>';
    html += '<p>此站點可能不允許內嵌顯示。</p>';
    html += '<a class="btn" target="_blank" rel="noopener" href="' + esc(f.url) + '">直接前往 ' + esc(f.title) + ' ↗</a>';
    html += '</div>';
    html += '<iframe id="embed-frame" src="' + esc(f.url) + '" title="' + esc(f.title) + '" loading="lazy"></iframe>';
    html += '</div></div>';
    content.innerHTML = html;

    document.getElementById("reload-frame").addEventListener("click", function () {
      const fr = document.getElementById("embed-frame");
      fr.src = f.url + "?r=" + Date.now();
    });
    // 若站點擋內嵌（X-Frame-Options / CSP），iframe 不會觸發 load 或很快 load 空白頁：
    // 給 4 秒時間，若無 load 事件則顯示 fallback。
    const fr = document.getElementById("embed-frame");
    let loaded = false;
    fr.addEventListener("load", function () { loaded = true; });
    setTimeout(function () {
      if (!loaded) document.getElementById("embed-fallback").hidden = false;
    }, 4000);
  }

  function renderNotFound() {
    content.innerHTML = '<div class="page"><div class="hero"><h2>🧭 迷路了</h2>' +
      '<p class="hero-sub">這個頁面不存在，從左側選一個吧。</p>' +
      '<p><a class="btn" href="#/home">回到總覽</a></p></div></div>';
  }

  // ---- 路由 ----
  function route() {
    const hash = location.hash || "#/home";
    highlightActive(hash);
    sidebar.classList.remove("open");
    if (hash === "#/home" || hash === "") return renderHome();
    if (hash.startsWith("#/cat/")) return renderCategory(decodeURIComponent(hash.slice(6)));
    if (hash.startsWith("#/finance/")) return renderFinance(decodeURIComponent(hash.slice("#/finance/".length)));
    renderNotFound();
  }
  window.addEventListener("hashchange", route);

  // ---- 手機選單 ----
  menuToggle.addEventListener("click", function () {
    sidebar.classList.toggle("open");
  });

  buildNav();
  route();
})();
