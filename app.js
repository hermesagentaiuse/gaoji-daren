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

  // ---- 打卡進度（Cookie 持久化 400 天，關瀏覽器重開還在；過大自動退回 localStorage）----
  const STORE_KEY = "gaoji-daren-checkins";
  const DAYS = 400;
  function cookieWrite(name, value) {
    try {
      document.cookie = name + "=" + encodeURIComponent(value) +
        ";max-age=" + DAYS * 86400 + ";path=/;SameSite=Lax";
      return document.cookie.indexOf(name + "=") !== -1;
    } catch (e) { return false; }
  }
  function cookieRead(name) {
    const t = name + "=";
    const parts = document.cookie ? document.cookie.split("; ") : [];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].indexOf(t) === 0) {
        try { return decodeURIComponent(parts[i].slice(t.length)); } catch (e) { return null; }
      }
    }
    return null;
  }
  function loadCheckins() {
    try {
      const c = cookieRead(STORE_KEY);
      if (c) return JSON.parse(c) || {};
    } catch (e) {}
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveCheckins(d) {
    const json = JSON.stringify(d);
    if (json.length < 3500 && cookieWrite(STORE_KEY, json)) {
      try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    } else {
      document.cookie = STORE_KEY + "=;max-age=0;path=/;SameSite=Lax";
      try { localStorage.setItem(STORE_KEY, json); } catch (e) {}
    }
  }

  // ---- 渲染 sidebar ----
  function buildNav() {
    catNav.innerHTML = "";
    homeLink(catNav);
    (CFG.categories || []).forEach(function (cat) {
      catNav.appendChild(navItem("#/cat/" + cat.id, cat.icon + " " + cat.title, cat.id));
    });
    finNav.innerHTML = "";
    const SL = CFG.stockLearning;
    if (SL) {
      finNav.appendChild(navItem("#/stocks", SL.icon + " " + SL.title, SL.id));
    }
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
      const r = a.dataset.route;
      let on = r === hash;
      if (!on && r.startsWith("#/cat/")) {
        on = hash === r || hash.startsWith(r + "/"); // 詳情頁也点亮所屬分類
      }
      if (!on && r === "#/stocks") {
        on = hash === r || hash.startsWith(r + "/");
      }
      a.classList.toggle("active", on);
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

    if (CFG.stockLearning) {
      const SL = CFG.stockLearning;
      html += '<a class="card card-finance" href="#/stocks">';
      html += '<span class="card-icon">' + esc(SL.icon) + '</span>';
      html += '<span class="card-title">' + esc(SL.title) + '</span>';
      html += '<span class="card-meta">股市教學</span>';
      html += '</a>';
    }

    html += '</div><p class="hint">💡 想新增分類或財經站：編輯 <code>config.js</code> 即可，不用改其他檔案。</p></div>';
    content.innerHTML = html;
  }

  function renderCategory(catId) {
    const cat = (CFG.categories || []).find(function (c) { return c.id === catId; });
    if (!cat) return renderNotFound();
    const checkins = loadCheckins();

    let html = '<div class="page"><div class="page-head"><h2>' + esc(cat.icon) + " " + esc(cat.title) + '</h2>';
    html += '<p class="page-sub">做到一項、打卡一項。點條目標題可看「如何做到」學習指南。</p></div><ul class="checklist">';

    cat.items.forEach(function (item, i) {
      const key = cat.id + ":" + i;
      const checked = !!checkins[key];
      html += '<li class="check-item' + (checked ? " done" : "") + '">';
      html += '<div class="check-row">';
      html += '<label class="check-label"><input type="checkbox" data-key="' + esc(key) + '"' + (checked ? " checked" : "") + " />";
      html += '<span class="check-text"><a class="learn-link" href="#/cat/' + cat.id + "/" + i + '">' + esc(item.text) + '</a></span></label>';
      html += '<a class="learn-btn" href="#/cat/' + cat.id + "/" + i + '" title="學習如何做到">如何做到 →</a>';
      html += '</div>';
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

  // ---- 學習指南詳情頁：#/cat/<catId>/<itemIndex> ----
  const learnCache = {};
  const toolsLoaded = {}; // catId -> true

  function loadToolScript(catId, cb) {
    if (toolsLoaded[catId]) return cb(true);
    const s = document.createElement("script");
    s.src = "learn/tools/" + encodeURIComponent(catId) + ".js";
    s.onload = function () { toolsLoaded[catId] = true; cb(true); };
    s.onerror = function () { toolsLoaded[catId] = false; cb(false); };
    document.head.appendChild(s);
  }

  function mountTool(catId, idx) {
    const slot = document.getElementById("tool-slot");
    const note = document.getElementById("tool-note");
    if (!slot) return;
    loadToolScript(catId, function (ok) {
      const fn = ok && window.LEARN_TOOLS && window.LEARN_TOOLS[catId] && window.LEARN_TOOLS[catId][String(idx)];
      if (!fn) { if (note) note.hidden = false; return; }
      try {
        const st = window.TOOLKIT.makeStorage(catId + ":" + idx);
        fn(slot, { key: catId + ":" + idx, get: st.get, set: st.set, del: st.del, storage: st });
      } catch (e) {
        if (note) { note.textContent = "工具載入失敗：" + e.message; note.hidden = false; }
      }
    });
  }

  function renderLearn(catId, idx) {
    const cat = (CFG.categories || []).find(function (c) { return c.id === catId; });
    if (!cat || !cat.items[idx]) return renderNotFound();
    const item = cat.items[idx];
    const key = cat.id + ":" + idx;
    const checkins = loadCheckins();
    const checked = !!checkins[key];

    function paint(guides) {
      const g = guides && guides[idx];
      let html = '<div class="page"><div class="page-head">';
      html += '<a class="back-link" href="#/cat/' + cat.id + '">← 返回「' + esc(cat.title) + '」</a>';
      html += '<h2>' + esc(cat.icon) + " " + esc(item.text) + '</h2></div>';

      // 打卡列
      html += '<div class="learn-checkrow"><label><input type="checkbox" data-key="' + esc(key) + '"' + (checked ? " checked" : "") + " />";
      html += '<span>我已經做到了</span></label></div>';

      if (!g) {
        html += '<p class="hint">📖 這份學習指南還在撰寫中，請稍後再試。</p></div>';
        content.innerHTML = html;
        bindLearnCheck();
        return;
      }

      html += '<section class="learn-block"><h3>為什麼必會</h3><p>' + esc(g.intro) + '</p></section>';
      html += '<section class="learn-block"><h3>如何做到</h3><ol class="step-list">';
      (g.steps || []).forEach(function (s) { html += '<li>' + esc(s) + '</li>'; });
      html += '</ol>';
      if (g.time) html += '<p class="learn-time">⏱ ' + esc(g.time) + '</p>';
      html += '</section>';

      if ((g.pitfalls || []).length) {
        html += '<section class="learn-block"><h3>常見地雷</h3><ul class="pitfall-list">';
        g.pitfalls.forEach(function (p) { html += '<li>⚠️ ' + esc(p) + '</li>'; });
        html += '</ul></section>';
      }

      if ((g.resources || []).length) {
        html += '<section class="learn-block"><h3>進階資源</h3><ul class="resource-list">';
        g.resources.forEach(function (r) {
          html += '<li>📚 ';
          if (r.url) html += '<a href="' + esc(r.url) + '" target="_blank" rel="noopener">' + esc(r.title) + ' ↗</a>';
          else html += esc(r.title);
          html += '</li>';
        });
        html += '</ul></section>';
      }

      html += '<section class="learn-block"><h3>🛠 輔助工具</h3><div id="tool-slot"></div>' +
        '<p class="tool-note" id="tool-note" hidden>這個項目的輔助工具開發中 — 一項一項來，不著急。</p></section>';

      // 上一項 / 下一項
      html += '<nav class="learn-nav">';
      if (idx > 0) html += '<a href="#/cat/' + cat.id + "/" + (idx - 1) + '">← 上一項</a>';
      if (idx < cat.items.length - 1) html += '<a href="#/cat/' + cat.id + "/" + (idx + 1) + '">下一項 →</a>';
      html += '</nav></div>';

      content.innerHTML = html;
      bindLearnCheck();
      mountTool(catId, idx);
    }

    function bindLearnCheck() {
      const cb = content.querySelector('.learn-checkrow input[type="checkbox"]');
      if (!cb) return;
      cb.addEventListener("change", function () {
        const d = loadCheckins();
        if (cb.checked) d[cb.dataset.key] = true; else delete d[cb.dataset.key];
        saveCheckins(d);
      });
    }

    if (learnCache[catId]) return paint(learnCache[catId]);

    content.innerHTML = '<div class="page"><p class="hint">📖 載入學習指南中…</p></div>';
    fetch("learn/" + encodeURIComponent(catId) + ".json")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { learnCache[catId] = data; paint(data); })
      .catch(function () { paint(null); });
  }

  // ---- 股市教學：#/stocks（主題總覽）→ #/stocks/<topic>（清單）→ #/stocks/<topic>/<vid>（單篇筆記）----
  const stocksCache = {};

  function stockData(cb) {
    if (stocksCache.data) return cb(stocksCache.data);
    content.innerHTML = '<div class="page"><p class="hint">📈 載入股市教學中…</p></div>';
    fetch("learn/stocks.json")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { stocksCache.data = d; cb(d); })
      .catch(function () {
        content.innerHTML = '<div class="page"><p class="hint">教學資料載入失敗，請重新整理重試。</p></div>';
      });
  }

  function videoCard(v) {
    let h = '<a class="card card-stock" href="#/stocks/' + encodeURIComponent(v.topic) + "/" + encodeURIComponent(v.vid) + '">';
    h += '<span class="card-title">' + esc(v.title) + '</span>';
    h += '<span class="card-meta">' + (v.key_points || []).length + " 個重點</span>";
    h += '</a>';
    return h;
  }

  function renderStocks() {
    const SL = CFG.stockLearning;
    stockData(function (data) {
      let html = '<div class="page"><div class="hero">';
      html += '<h2>' + esc(SL.icon) + " " + esc(SL.title) + '</h2>';
      html += '<p class="hero-sub">' + esc(SL.source || "") + '　<a href="' + esc(SL.playlistUrl || "#") + '" target="_blank" rel="noopener">原始 playlist ↗</a></p>';
      html += '</div><div class="card-grid">';
      const topics = data.topics || [];
      topics.forEach(function (t) {
        html += '<a class="card" href="#/stocks/' + encodeURIComponent(t.name) + '">';
        html += '<span class="card-icon">' + esc(t.icon || "📈") + '</span>';
        html += '<span class="card-title">' + esc(t.name) + '</span>';
        html += '<span class="card-meta">' + t.count + " 篇教學</span>";
        html += '</a>';
      });
      html += '</div>';
      if ((data.no_subs || []).length) {
        html += '<p class="hint">⚠️ ' + data.no_subs.length + ' 支影片無公開字幕，僅收錄於目錄。</p>';
      }
      html += '</div>';
      content.innerHTML = html;
    });
  }

  function renderStockTopic(topicName) {
    const SL = CFG.stockLearning;
    stockData(function (data) {
      const videos = (data.videos || []).filter(function (v) { return v.topic === topicName; });
      if (!videos.length) return renderNotFound();
      let html = '<div class="page"><div class="page-head">';
      html += '<a class="back-link" href="#/stocks">← 返回「' + esc(SL.title) + '」</a>';
      html += '<h2>📌 ' + esc(topicName) + '</h2>';
      html += '<p class="page-sub">共 ' + videos.length + ' 篇，點標題看重點整理。</p></div>';
      html += '<div class="card-grid">' + videos.map(videoCard).join("") + '</div></div>';
      content.innerHTML = html;
    });
  }

  function renderStockVideo(topicName, vid) {
    const SL = CFG.stockLearning;
    stockData(function (data) {
      const list = (data.videos || []).filter(function (v) { return v.topic === topicName; });
      const i = list.findIndex(function (v) { return v.vid === vid; });
      if (i === -1) return renderNotFound();
      const v = list[i];
      let html = '<div class="page"><div class="page-head">';
      html += '<a class="back-link" href="#/stocks/' + encodeURIComponent(topicName) + '">← 返回「' + esc(topicName) + '」</a>';
      html += '<h2>' + esc(v.title) + '</h2>';
      html += '<p class="page-sub">理周教育學苑 · 朱家泓　<a href="https://youtu.be/' + esc(v.vid) + '" target="_blank" rel="noopener">看原片 ↗</a></p></div>';

      html += '<section class="learn-block"><h3>🎯 主題</h3><p>' + esc(v.topic) + '</p></section>';
      html += '<section class="learn-block"><h3>📖 重點整理</h3><ol class="step-list">';
      (v.key_points || []).forEach(function (p) { html += '<li>' + esc(p) + '</li>'; });
      html += '</ol></section>';
      if ((v.actionable_rules || []).length) {
        html += '<section class="learn-block"><h3>✅ 操作鐵則（背下來）</h3><ul class="pitfall-list">';
        v.actionable_rules.forEach(function (p) { html += '<li>⚔️ ' + esc(p) + '</li>'; });
        html += '</ul></section>';
      }
      html += '<nav class="learn-nav">';
      if (i > 0) html += '<a href="#/stocks/' + encodeURIComponent(topicName) + "/" + encodeURIComponent(list[i - 1].vid) + '">← 上一篇</a>';
      if (i < list.length - 1) html += '<a href="#/stocks/' + encodeURIComponent(topicName) + "/" + encodeURIComponent(list[i + 1].vid) + '">下一篇 →</a>';
      html += '</nav></div>';
      content.innerHTML = html;
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
    if (hash.startsWith("#/cat/")) {
      const rest = decodeURIComponent(hash.slice("#/cat/".length));
      const slash = rest.indexOf("/");
      if (slash === -1) return renderCategory(rest);
      const idx = parseInt(rest.slice(slash + 1), 10);
      if (Number.isNaN(idx)) return renderNotFound();
      return renderLearn(rest.slice(0, slash), idx);
    }
    if (hash === "#/stocks" || hash.startsWith("#/stocks/")) {
      const rest = decodeURIComponent(hash.slice("#/stocks".length)).replace(/^\//, "");
      if (!rest) return renderStocks();
      const slash = rest.indexOf("/");
      if (slash === -1) return renderStockTopic(rest);
      return renderStockVideo(rest.slice(0, slash), rest.slice(slash + 1));
    }
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
