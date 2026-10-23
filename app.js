/* 自我修養 — 前端邏輯
 * 路由：#/home | #/cat/<id> | #/finance/<id>
 * 右側內容隨 sidebar 點擊切換；財務站點用 iframe 內嵌，不跳走。
 */
(function () {
  const CFG = window.SITE_CONFIG || { categories: [], financeLinks: [] };
  const content = document.getElementById("content");
  const catNav = document.getElementById("category-nav");
  const sidebar = document.getElementById("sidebar");
  const menuToggle = document.getElementById("menu-toggle");

  // ---- header 設定 ----
  document.getElementById("site-name").textContent = CFG.siteName || "自我修養";
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
    if (CFG.sections && CFG.sections.length) {
      // 三層式：sidebar 只列大項目（sections）
      CFG.sections.forEach(function (s) {
        const href = s.type === "group" ? "#/section/" + s.id : s.route;
        catNav.appendChild(navItem(href, s.icon + " " + s.title, s.id));
      });
      return;
    }
    // 後相容：無 sections 時退回扁平清單
    (CFG.categories || []).forEach(function (cat) {
      catNav.appendChild(navItem("#/cat/" + cat.id, cat.icon + " " + cat.title, cat.id));
    });
    const SL = CFG.stockLearning;
    if (SL) catNav.appendChild(navItem("#/stocks", SL.icon + " " + SL.title, SL.id));
    const BL = CFG.bookLearning;
    if (BL) catNav.appendChild(navItem("#/books", BL.icon + " " + BL.title, BL.id));
    const BO = CFG.boyinLearning;
    if (BO) catNav.appendChild(navItem("#/boyin", BO.icon + " " + BO.title, BO.id));
    (CFG.gameLinks || []).forEach(function (g) {
      catNav.appendChild(navItem("#/game/" + g.id, g.icon + " " + g.title, g.id));
    });
    (CFG.financeLinks || []).forEach(function (f) {
      catNav.appendChild(navItem("#/finance/" + f.id, f.icon + " " + f.title, f.id));
    });
  }

  // ---- 大項目入口頁：#/section/<id>（點進去是子分類清單）----
  function renderSection(secId) {
    const sec = (CFG.sections || []).find(function (s) { return s.id === secId; });
    if (!sec || sec.type !== "group") return renderNotFound();
    const checkins = loadCheckins();
    let gTotal = 0, gDone = 0;
    (sec.children || []).forEach(function (cid) {
      const cat = (CFG.categories || []).find(function (c) { return c.id === cid; });
      if (!cat) return;
      gTotal += cat.items.length;
      gDone += cat.items.filter(function (_, i) { return checkins[cat.id + ":" + i]; }).length;
    });
    const pct = gTotal ? Math.round((gDone / gTotal) * 100) : 0;
    let html = '<div class="page"><div class="hero">';
    html += '<h2>' + esc(sec.icon) + " " + esc(sec.title) + '</h2>';
    if (sec.desc) html += '<p class="hero-sub">' + esc(sec.desc) + '</p>';
    html += '<div class="progress-card"><div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
    html += '<p class="progress-text">已打卡 <b>' + gDone + '</b> / ' + gTotal + ' 項（' + pct + '%）</p></div>';
    html += '</div><div class="card-grid">';
    (sec.children || []).forEach(function (cid) {
      const cat = (CFG.categories || []).find(function (c) { return c.id === cid; });
      if (!cat) return;
      const cdone = cat.items.filter(function (_, i) { return checkins[cat.id + ":" + i]; }).length;
      html += '<a class="card" href="#/cat/' + cat.id + '">';
      html += '<span class="card-icon">' + esc(cat.icon) + '</span>';
      html += '<span class="card-title">' + esc(cat.title) + '</span>';
      html += '<span class="card-meta">' + cdone + " / " + cat.items.length + " 項</span>";
      html += '</a>';
    });
    html += '</div></div>';
    content.innerHTML = html;
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
        if (!on && hash.startsWith("#/section/")) {
          // 大項目頁高亮其 sidebar 入口
          const sec = (CFG.sections || []).find(function (s) { return s.type === "group" && (s.children || []).indexOf(r.slice("#/cat/".length)) !== -1; });
          on = !!sec && hash === "#/section/" + sec.id;
        }
      }
      if (!on && r === "#/stocks") {
        on = hash === r || hash.startsWith(r + "/");
      }
      if (!on && r === "#/books") {
        on = hash === r || hash.startsWith(r + "/");
      }
      if (!on && r === "#/boyin") {
        on = hash === r || hash.startsWith(r + "/");
      }
      if (!on && r === "#/research") {
        on = hash === r || hash.startsWith(r + "/");
      }
      if (!on && r.startsWith("#/game/")) {
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
    let html = '<div class="page"><div class="hero">';
    html += '<h2>\uD83C\uDFE0 總覽</h2>';
    html += '<p class="hero-sub">' + esc(CFG.tagline || "") + '</p>';
    html += '</div><div class="card-grid">';

    if (CFG.sections && CFG.sections.length) {
      // 與 sidebar 一致：總覽只列大項目；自我修養（group）點進去才是子分類清單
      CFG.sections.forEach(function (s) {
        const href = s.type === "group" ? "#/section/" + s.id : s.route;
        let meta = "";
        if (s.type === "group") {
          meta = s.desc || "點進去查看分類";
        } else {
          if (s.route === "#/stocks") meta = "股市教學";
          else if (s.route === "#/books") meta = "古籍夜讀";
          else if (s.route === "#/boyin") meta = "Podcast 訪談精讀";
          else if (s.route === "#/research") meta = "論文學習地圖 · 每天一篇";
          else if (s.route && s.route.startsWith("#/game/")) meta = "文字遊戲 ↗";
          else if (s.route && s.route.startsWith("#/finance/")) meta = "財務分析站 ↗";
        }
        html += '<a class="card' + (s.type === "group" ? "" : " card-finance") + '" href="' + href + '">';
        html += '<span class="card-icon">' + esc(s.icon) + '</span>';
        html += '<span class="card-title">' + esc(s.title) + '</span>';
        html += '<span class="card-meta">' + esc(meta) + '</span>';
        html += '</a>';
      });
    } else {
      // 後相容：無 sections 時退回舊扁平清單
      (CFG.categories || []).forEach(function (cat) {
        const cdone = cat.items.filter(function (_, i) { return checkins[cat.id + ":" + i]; }).length;
        html += '<a class="card" href="#/cat/' + cat.id + '">';
        html += '<span class="card-icon">' + esc(cat.icon) + '</span>';
        html += '<span class="card-title">' + esc(cat.title) + '</span>';
        html += '<span class="card-meta">' + cdone + " / " + cat.items.length + " 項</span>";
        html += '</a>';
      });
    }

    html += '</div><p class="hint">💡 想新增分類或財經站：編輯 <code>config.js</code> 即可，不用改其他檔案。</p></div>';
    content.innerHTML = html;
  }

  function renderCategory(catId) {
    const cat = (CFG.categories || []).find(function (c) { return c.id === catId; });
    if (!cat) return renderNotFound();
    const checkins = loadCheckins();

    const parentSec = (CFG.sections || []).find(function (s) { return s.type === "group" && (s.children || []).indexOf(catId) !== -1; });
    let html = '<div class="page"><div class="page-head">';
    if (parentSec) html += '<p class="page-sub"><a href="#/section/' + parentSec.id + '" style="color:inherit;text-decoration:none">← ' + esc(parentSec.icon + " " + parentSec.title) + '</a></p>';
    html += '<h2>' + esc(cat.icon) + " " + esc(cat.title) + '</h2>';
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

  // ---- 古籍夜讀：#/books（主題總覽）→ #/books/<topic>（清單）→ #/books/<topic>/<vid>（單篇筆記）----
  const booksCache = {};

  function bookData(cb) {
    if (booksCache.data) return cb(booksCache.data);
    content.innerHTML = '<div class="page"><p class="hint">📜 載入古籍夜讀中…</p></div>';
    fetch("learn/books.json")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { booksCache.data = d; cb(d); })
      .catch(function () {
        content.innerHTML = '<div class="page"><p class="hint">古籍資料載入失敗，請重新整理重試。</p></div>';
      });
  }

  function bookCard(v) {
    let h = '<a class="card card-stock" href="#/books/' + encodeURIComponent(v.topic) + "/" + encodeURIComponent(v.vid) + '">';
    h += '<span class="card-title">《' + esc(v.book) + '》' + esc(v.title) + '</span>';
    h += '<span class="card-meta">' + esc(v.author_era || "") + "　" + (v.key_points || []).length + " 個重點</span>";
    h += "</a>";
    return h;
  }

  function renderBooks() {
    const BL = CFG.bookLearning;
    bookData(function (data) {
      let html = '<div class="page"><div class="hero">';
      html += "<h2>" + esc(BL.icon) + " " + esc(BL.title) + "</h2>";
      html += '<p class="hero-sub">' + esc(BL.source || "") + "　已整理 " + (data.analyzed || 0) + " / " + (data.total || 0) +
              ' 篇　<a href="' + esc(BL.playlistUrl || "#") + '" target="_blank" rel="noopener">原始頻道 ↗</a></p>';
      html += '</div><div class="card-grid">';
      (data.topics || []).forEach(function (t) {
        html += '<a class="card" href="#/books/' + encodeURIComponent(t.name) + '">';
        html += '<span class="card-icon">' + esc(t.icon || "📚") + "</span>";
        html += '<span class="card-title">' + esc(t.name) + "</span>";
        html += '<span class="card-meta">' + t.count + " 篇</span>";
        html += "</a>";
      });
      html += "</div></div>";
      content.innerHTML = html;
    });
  }

  function renderBookTopic(topicName) {
    const BL = CFG.bookLearning;
    bookData(function (data) {
      const videos = (data.videos || []).filter(function (v) { return v.topic === topicName; });
      if (!videos.length) return renderNotFound();
      let html = '<div class="page"><div class="page-head">';
      html += '<a class="back-link" href="#/books">← 返回「' + esc(BL.title) + '」</a>';
      html += "<h2>📌 " + esc(topicName) + "</h2>";
      html += '<p class="page-sub">共 ' + videos.length + " 篇，點標題看重點整理。</p></div>";
      html += '<div class="card-grid">' + videos.map(bookCard).join("") + "</div></div>";
      content.innerHTML = html;
    });
  }

  function renderBookVideo(topicName, vid) {
    bookData(function (data) {
      const list = (data.videos || []).filter(function (v) { return v.topic === topicName; });
      const i = list.findIndex(function (v) { return v.vid === vid; });
      if (i === -1) return renderNotFound();
      const v = list[i];
      let html = '<div class="page"><div class="page-head">';
      html += '<a class="back-link" href="#/books/' + encodeURIComponent(topicName) + '">← 返回「' + esc(topicName) + '」</a>';
      html += "<h2>《" + esc(v.book) + "》" + esc(v.title) + "</h2>";
      html += '<p class="page-sub">' + esc(v.author_era || "") + "　枕書夜話　<a href=\"https://youtu.be/" + esc(v.vid) + '" target="_blank" rel="noopener">看原片 ↗</a></p></div>';
      if (v.intro) html += '<section class="learn-block"><h3>📖 篇引言</h3><p>' + esc(v.intro) + "</p></section>";
      html += '<section class="learn-block"><h3>🎯 重點整理</h3><ol class="step-list">';
      (v.key_points || []).forEach(function (p) { html += "<li>" + esc(p) + "</li>"; });
      html += "</ol></section>";
      if (v.analysis) html += '<section class="learn-block"><h3>🔍 深度解析</h3><p>' + esc(v.analysis) + "</p></section>";
      if ((v.actionable || []).length) {
        html += '<section class="learn-block"><h3>✅ 實踐要點（做起來）</h3><ul class="pitfall-list">';
        v.actionable.forEach(function (p) { html += "<li>⚔️ " + esc(p) + "</li>"; });
        html += "</ul></section>";
      }
      if ((v.quotes || []).length) {
        html += '<section class="learn-block"><h3>💬 片中金句</h3>';
        v.quotes.forEach(function (q) { html += "<blockquote>「" + esc(q) + "」</blockquote>"; });
        html += "</section>";
      }
      html += '<nav class="learn-nav">';
      if (i > 0) html += '<a href="#/books/' + encodeURIComponent(topicName) + "/" + encodeURIComponent(list[i - 1].vid) + '">← 上一篇</a>';
      if (i < list.length - 1) html += '<a href="#/books/' + encodeURIComponent(topicName) + "/" + encodeURIComponent(list[i + 1].vid) + '">下一篇 →</a>';
      html += "</nav></div>";
      content.innerHTML = html;
    });
  }

  // ---- 博音精讀：#/boyin（主題總覽）→ #/boyin/<topic>（清單）→ #/boyin/<topic>/<vid>（單篇筆記）----
  const boyinCache = {};

  function boyinData(cb) {
    if (boyinCache.data) return cb(boyinCache.data);
    content.innerHTML = '<div class="page"><p class="hint">🎙️ 載入博音精讀中…</p></div>';
    fetch("learn/boyin.json")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { boyinCache.data = d; cb(d); })
      .catch(function () {
        content.innerHTML = '<div class="page"><p class="hint">博音資料載入失敗，請重新整理重試。</p></div>';
      });
  }

  function boyinCard(v) {
    let h = '<a class="card card-stock" href="#/boyin/' + encodeURIComponent(v.topic) + "/" + encodeURIComponent(v.vid) + '">';
    h += '<span class="card-title">' + esc(v.title) + '</span>';
    h += '<span class="card-meta">' + esc(v.guest || "") + "　" + (v.key_points || []).length + " 個重點</span>";
    h += "</a>";
    return h;
  }

  function renderBoyin() {
    const BO = CFG.boyinLearning;
    boyinData(function (data) {
      let html = '<div class="page"><div class="hero">';
      html += "<h2>" + esc(BO.icon) + " " + esc(BO.title) + "</h2>";
      html += '<p class="hero-sub">' + esc(BO.source || "") + "　已整理 " + (data.analyzed || 0) + " / " + (data.total || 0) +
              ' 集　<a href="' + esc(BO.playlistUrl || "#") + '" target="_blank" rel="noopener">原始清單 ↗</a></p>';
      html += '</div><div class="card-grid">';
      (data.topics || []).forEach(function (t) {
        html += '<a class="card" href="#/boyin/' + encodeURIComponent(t.name) + '">';
        html += '<span class="card-icon">' + esc(t.icon || "🎧") + "</span>";
        html += '<span class="card-title">' + esc(t.name) + "</span>";
        html += '<span class="card-meta">' + t.count + " 集</span>";
        html += "</a>";
      });
      html += "</div></div>";
      content.innerHTML = html;
    });
  }

  function renderBoyinTopic(topicName) {
    const BO = CFG.boyinLearning;
    boyinData(function (data) {
      const videos = (data.videos || []).filter(function (v) { return v.topic === topicName; });
      if (!videos.length) return renderNotFound();
      let html = '<div class="page"><div class="page-head">';
      html += '<a class="back-link" href="#/boyin">← 返回「' + esc(BO.title) + '」</a>';
      html += "<h2>📌 " + esc(topicName) + "</h2>";
      html += '<p class="page-sub">共 ' + videos.length + " 集，點標題看重點整理。</p></div>";
      html += '<div class="card-grid">' + videos.map(boyinCard).join("") + "</div></div>";
      content.innerHTML = html;
    });
  }

  function renderBoyinVideo(topicName, vid) {
    boyinData(function (data) {
      const list = (data.videos || []).filter(function (v) { return v.topic === topicName; });
      const i = list.findIndex(function (v) { return v.vid === vid; });
      if (i === -1) return renderNotFound();
      const v = list[i];
      let html = '<div class="page"><div class="page-head">';
      html += '<a class="back-link" href="#/boyin/' + encodeURIComponent(topicName) + '">← 返回「' + esc(topicName) + '」</a>';
      html += "<h2>" + esc(v.title) + "</h2>";
      html += '<p class="page-sub">' + (v.guest ? "來賓：" + esc(v.guest) + "　" : "") + '博音 Podcast　<a href="https://youtu.be/' + esc(v.vid) + '" target="_blank" rel="noopener">聽原集 ↗</a></p></div>';
      if (v.intro) html += '<section class="learn-block"><h3>📖 集引言</h3><p>' + esc(v.intro) + "</p></section>";
      html += '<section class="learn-block"><h3>🎯 重點整理</h3><ol class="step-list">';
      (v.key_points || []).forEach(function (p) { html += "<li>" + esc(p) + "</li>"; });
      html += "</ol></section>";
      if (v.analysis) html += '<section class="learn-block"><h3>🔍 深度解析</h3><p>' + esc(v.analysis) + "</p></section>";
      if ((v.actionable || []).length) {
        html += '<section class="learn-block"><h3>✅ 實踐要點（做起來）</h3><ul class="pitfall-list">';
        v.actionable.forEach(function (p) { html += "<li>⚔️ " + esc(p) + "</li>"; });
        html += "</ul></section>";
      }
      if ((v.quotes || []).length) {
        html += '<section class="learn-block"><h3>💬 來賓金句</h3>';
        v.quotes.forEach(function (q) { html += "<blockquote>「" + esc(q) + "」</blockquote>"; });
        html += "</section>";
      }
      html += '<nav class="learn-nav">';
      if (i > 0) html += '<a href="#/boyin/' + encodeURIComponent(topicName) + "/" + encodeURIComponent(list[i - 1].vid) + '">← 上一集</a>';
      if (i < list.length - 1) html += '<a href="#/boyin/' + encodeURIComponent(topicName) + "/" + encodeURIComponent(list[i + 1].vid) + '">下一集 →</a>';
      html += "</nav></div>";
      content.innerHTML = html;
    });
  }

  // ---- 研究生專區：#/research（學習地圖）→ #/research/<track>（論文清單）→ #/research/<track>/<pid>（論文卡片）----
  const researchCache = {};

  function researchData(cb) {
    if (researchCache.data) return cb(researchCache.data);
    content.innerHTML = '<div class="page"><p class="hint">🎓 載入研究生專區中…</p></div>';
    fetch("learn/research.json")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) { researchCache.data = d; cb(d); })
      .catch(function () {
        content.innerHTML = '<div class="page"><p class="hint">研究資料載入失敗，請重新整理重試。</p></div>';
      });
  }

  function paperCard(p) {
    const checkins = loadCheckins();
    const done = checkins["research:" + p.pid] ? " ✅" : "";
    let h = '<a class="card card-stock" href="#/research/' + encodeURIComponent(p.topic) + "/" + encodeURIComponent(p.pid) + '">';
    h += '<span class="card-title">' + (p.level === "前沿" ? "🔥 " : "") + esc(p.title) + done + '</span>';
    h += '<span class="card-meta">' + esc(p.year || "") + "　" + esc(p.venue || "") + "　" + esc(p.level || "") + "</span>";
    h += "</a>";
    return h;
  }

  function renderResearch() {
    const RL = CFG.researchLearning || { icon: "🎓", title: "研究生專區", source: "" };
    researchData(function (data) {
      const checkins = loadCheckins();
      const total = (data.papers || []).length;
      const doneN = (data.papers || []).filter(function (p) { return !!checkins["research:" + p.pid]; }).length;
      const pct = total ? Math.round(doneN * 100 / total) : 0;
      let html = '<div class="page"><div class="hero">';
      html += "<h2>" + esc(RL.icon) + " " + esc(RL.title) + "</h2>";
      html += '<p class="hero-sub">' + esc(RL.source || "") + "</p>";
      html += '<div class="progress-card"><div class="progress-bar"><div class="progress-fill" style="width:' + pct + '%"></div></div>';
      html += '<p class="progress-text">已讀 <b>' + doneN + "</b> / " + total + " 篇（" + pct + "%）</p></div>";
      html += "</div>";
      // 學習地圖（分階段路線）
      if ((data.roadmap || []).length) {
        html += '<section class="learn-block"><h3>🗺️ 學習地圖（分階段路線）</h3>';
        data.roadmap.forEach(function (st, si) {
          html += "<h4>階段 " + (si + 1) + "：" + esc(st.name) + "</h4>";
          if (st.goal) html += "<p>" + esc(st.goal) + "</p>";
          if (st.time) html += '<p class="learn-time">⏱ ' + esc(st.time) + "</p>";
          const sp = (data.papers || []).filter(function (p) { return (st.pids || []).indexOf(p.pid) !== -1; });
          if (sp.length) {
            html += '<ol class="step-list">';
            sp.forEach(function (p) {
              html += '<li><a class="learn-link" href="#/research/' + encodeURIComponent(p.topic) + "/" + encodeURIComponent(p.pid) + '">' + esc(p.title) + "</a></li>";
            });
            html += "</ol>";
          }
        });
        html += "</section>";
      }
      html += '<div class="card-grid">';
      (data.tracks || []).forEach(function (t) {
        const cnt = (data.papers || []).filter(function (p) { return p.topic === t.name; }).length;
        html += '<a class="card" href="#/research/' + encodeURIComponent(t.name) + '">';
        html += '<span class="card-icon">' + esc(t.icon || "📄") + "</span>";
        html += '<span class="card-title">' + esc(t.name) + "</span>";
        html += '<span class="card-meta">' + cnt + " 篇</span>";
        html += "</a>";
      });
      html += "</div></div>";
      content.innerHTML = html;
    });
  }

  function renderResearchTrack(topicName) {
    const RL = CFG.researchLearning || { icon: "🎓", title: "研究生專區" };
    researchData(function (data) {
      const papers = (data.papers || []).filter(function (p) { return p.topic === topicName; });
      if (!papers.length) return renderNotFound();
      const t = (data.tracks || []).find(function (x) { return x.name === topicName; });
      let html = '<div class="page"><div class="page-head">';
      html += '<a class="back-link" href="#/research">← 返回「' + esc(RL.title) + '」</a>';
      html += "<h2>" + esc((t && t.icon) || "📄") + " " + esc(topicName) + "</h2>";
      if (t && t.desc) html += '<p class="page-sub">' + esc(t.desc) + "</p>";
      html += '<p class="page-sub">共 ' + papers.length + " 篇，點標題看論文卡片。</p></div>";
      html += '<div class="card-grid">' + papers.map(paperCard).join("") + "</div></div>";
      content.innerHTML = html;
    });
  }

  function studyKitHtml(p) {
    const k = p.study_kit;
    let h = "";
    if (k.source_verified) {
      const sv = k.source_verified;
      h += '<section class="learn-block"><h3>✅ 全文驗證</h3><p>' + esc(sv.method || "") +
        "　·　" + esc(String(sv.pages || "")) + " 頁 / " + esc(String(sv.chars || "")) +
        " 字元　·　" + esc(sv.read_at || "") + "</p><p><em>" + esc(sv.note || "") + "</em></p></section>";
    }
    if ((k.pre_read_questions || []).length) {
      h += '<section class="learn-block"><h3>❓ 讀前先想（SQ3R 提問）</h3><ol class="step-list">';
      k.pre_read_questions.forEach(function (q) { h += "<li>" + esc(q) + "</li>"; });
      h += "</ol></section>";
    }
    if (k.pass1_five_c) {
      const f = k.pass1_five_c;
      h += '<section class="learn-block"><h3>🗂️ 第一遍 · 5C 速覽（10 分鐘）</h3>';
      [["category", "類型"], ["context", "脈絡"], ["correctness", "正確性"], ["contributions", "貢獻"], ["clarity", "清晰度"]].forEach(function (pr) {
        if (f[pr[0]]) h += "<p><strong>" + pr[1] + "：</strong>" + esc(f[pr[0]]) + "</p>";
      });
      h += "</section>";
    }
    if ((k.pass2_sections || []).length) {
      h += '<section class="learn-block"><h3>📖 第二遍 · 逐節精讀（60 分鐘）</h3>';
      k.pass2_sections.forEach(function (s) {
        h += '<div style="margin:10px 0;padding:10px 12px;border-left:3px solid #7c9cbf;background:rgba(124,156,191,.07);border-radius:6px">';
        h += "<p><strong>" + esc(s.sec) + "</strong>　<span style='opacity:.75'>讀：" + esc(s.read) + "</span></p>";
        h += "<p>" + esc(s.key) + "</p></div>";
      });
      h += "</section>";
    }
    if ((k.glossary || []).length) {
      h += '<section class="learn-block"><h3>📖 專有名詞完全解釋（' + k.glossary.length + ' 個）</h3><dl style="margin:0">';
      k.glossary.forEach(function (g) {
        h += '<dt style="font-weight:700;margin-top:10px">' + esc(g.term) + (g.zh ? ' <span style="font-weight:400;opacity:.7">（' + esc(g.zh) + "）</span>" : "") + "</dt>";
        h += '<dd style="margin:2px 0 0 0">' + esc(g.why) + "</dd>";
      });
      h += "</dl></section>";
    }
    if ((k.feynman_test || []).length) {
      h += '<section class="learn-block"><h3>🧪 費曼檢驗（講得出來才算讀懂）</h3><ol class="step-list">';
      k.feynman_test.forEach(function (q) { h += "<li>" + esc(q) + "</li>"; });
      h += "</ol></section>";
    }
    if ((k.integration || []).length) {
      h += '<section class="learn-block"><h3>🔗 融會貫通（連回你的論文）</h3>';
      k.integration.forEach(function (it) {
        h += "<p><strong>" + esc(it.link) + "：</strong>";
        if (it.pid) h += '<a class="learn-link" href="#/research/' + encodeURIComponent(p.topic) + "/" + encodeURIComponent(it.pid) + '">' + esc(it.text) + "</a>";
        else h += esc(it.text);
        h += "</p>";
      });
      h += "</section>";
    }
    if ((k.checklist || []).length) {
      h += '<section class="learn-block"><h3>☑️ 讀完自核清單</h3><ul class="step-list" style="list-style:none;padding-left:2px">';
      k.checklist.forEach(function (c) { h += "<li>" + esc(c) + "</li>"; });
      h += "</ul></section>";
    }
    const nkey = "mynote:" + p.pid;
    h += '<section class="learn-block"><h3>🖊️ 我的備註</h3>';
    h += '<textarea id="mynote-box" rows="6" style="width:100%;box-sizing:border-box;font:inherit;padding:8px;border-radius:8px;border:1px solid #8884;background:transparent" placeholder="' + esc(k.my_notes || "寫下你自己的三行心得…") + '"></textarea>';
    h += '<p><button id="mynote-save" class="learn-link" style="cursor:pointer;border:1px solid #7c9cbf;border-radius:8px;padding:6px 14px;background:transparent">儲存備註</button> <span id="mynote-saved" style="opacity:.7"></span></p></section>';
    setTimeout(function () {
      const ta = document.getElementById("mynote-box");
      const btn = document.getElementById("mynote-save");
      const tag = document.getElementById("mynote-saved");
      if (ta) { try { ta.value = localStorage.getItem(nkey) || ""; } catch (e) {} }
      if (btn) btn.addEventListener("click", function () {
        try { localStorage.setItem(nkey, ta.value); if (tag) { tag.textContent = "已儲存 " + new Date().toLocaleTimeString(); } } catch (e) {}
      });
    }, 0);
    return h;
  }

  function renderResearchPaper(topicName, pid) {
    researchData(function (data) {
      const list = (data.papers || []).filter(function (p) { return p.topic === topicName; });
      const i = list.findIndex(function (p) { return p.pid === pid; });
      if (i === -1) return renderNotFound();
      const p = list[i];
      const checkins = loadCheckins();
      const key = "research:" + p.pid;
      const checked = !!checkins[key];
      const byPid = {};
      (data.papers || []).forEach(function (q) { byPid[q.pid] = q; });
      function linkList(arr, label, empty) {
        if (!(arr || []).length) {
          return '<section class="learn-block"><h3>' + label + "</h3><p>" + (empty || "—") + "</p></section>";
        }
        let h = '<section class="learn-block"><h3>' + label + "</h3><ol class=\"step-list\">";
        arr.forEach(function (x) {
          const q = byPid[x];
          if (q) h += '<li><a class="learn-link" href="#/research/' + encodeURIComponent(q.topic) + "/" + encodeURIComponent(q.pid) + '">' + esc(q.title) + "</a>（" + esc(q.year || "") + "）</li>";
          else h += "<li>" + esc(x) + "</li>";
        });
        return h + "</ol></section>";
      }
      let html = '<div class="page"><div class="page-head">';
      html += '<a class="back-link" href="#/research/' + encodeURIComponent(topicName) + '">← 返回「' + esc(topicName) + '」</a>';
      html += "<h2>" + esc(p.title) + "</h2>";
      html += '<p class="page-sub">' + esc(p.year || "") + "　" + esc(p.venue || "") + "　" + esc(p.level || "");
      if (p.arxiv_id && p.arxiv_id !== "none") html += '　<a href="https://arxiv.org/abs/' + esc(p.arxiv_id) + '" target="_blank" rel="noopener">arXiv:' + esc(p.arxiv_id) + " ↗</a>";
      html += "</p></div>";
      html += '<div class="learn-checkrow"><label><input type="checkbox" data-key="' + esc(key) + '"' + (checked ? " checked" : "") + " />";
      html += "<span>我已經讀完這篇了</span></label></div>";
      if (p.intro) html += '<section class="learn-block"><h3>📖 引言</h3><p>' + esc(p.intro) + "</p></section>";
      html += '<section class="learn-block"><h3>🎯 核心貢獻</h3><ol class="step-list">';
      (Array.isArray(p.core_contribution) ? p.core_contribution : [p.core_contribution]).forEach(function (k) { html += "<li>" + esc(k) + "</li>"; });
      html += "</ol></section>";
      html += linkList(p.builds_on, "⬅️ 承接誰（前置論文）", "暫無（源頭論文）");
      html += linkList(p.influenced, "➡️ 影響誰（延伸閱讀）", "待補");
      if (p.why_for_reader) html += '<section class="learn-block"><h3>🧭 為什麼你要讀</h3><p>' + esc(p.why_for_reader) + "</p></section>";
      if ((p.reading_notes || []).length) {
        html += '<section class="learn-block"><h3>📝 解讀筆記</h3><ol class="step-list">';
        p.reading_notes.forEach(function (k) { html += "<li>" + esc(k) + "</li>"; });
        html += "</ol></section>";
      }
      if (p.study_kit) html += studyKitHtml(p);
      html += '<nav class="learn-nav">';
      if (i > 0) html += '<a href="#/research/' + encodeURIComponent(topicName) + "/" + encodeURIComponent(list[i - 1].pid) + '">← 上一篇</a>';
      if (i < list.length - 1) html += '<a href="#/research/' + encodeURIComponent(topicName) + "/" + encodeURIComponent(list[i + 1].pid) + '">下一篇 →</a>';
      html += "</nav></div>";
      content.innerHTML = html;
      const cb = content.querySelector('.learn-checkrow input[type="checkbox"]');
      if (cb) cb.addEventListener("change", function () {
        const d = loadCheckins();
        if (cb.checked) d[cb.dataset.key] = true; else delete d[cb.dataset.key];
        saveCheckins(d);
      });
    });
  }

  function renderFinance(fid) { return renderEmbed(CFG.financeLinks, fid, "財務分析站"); }
  function renderGame(gid) { return renderEmbed(CFG.gameLinks, gid, "遊戲"); }
  function renderEmbed(list, id, kindLabel) {
    const f = (list || []).find(function (x) { return x.id === id; });
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
    if (hash.startsWith("#/section/")) return renderSection(decodeURIComponent(hash.slice("#/section/".length)));
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
    if (hash === "#/books" || hash.startsWith("#/books/")) {
      const rest = decodeURIComponent(hash.slice("#/books".length)).replace(/^\//, "");
      if (!rest) return renderBooks();
      const slash = rest.indexOf("/");
      if (slash === -1) return renderBookTopic(rest);
      return renderBookVideo(rest.slice(0, slash), rest.slice(slash + 1));
    }
    if (hash === "#/boyin" || hash.startsWith("#/boyin/")) {
      const rest = decodeURIComponent(hash.slice("#/boyin".length)).replace(/^\//, "");
      if (!rest) return renderBoyin();
      const slash = rest.indexOf("/");
      if (slash === -1) return renderBoyinTopic(rest);
      return renderBoyinVideo(rest.slice(0, slash), rest.slice(slash + 1));
    }
    if (hash.startsWith("#/game/")) return renderGame(decodeURIComponent(hash.slice("#/game/".length)));
    if (hash === "#/research" || hash.startsWith("#/research/")) {
      const rest = decodeURIComponent(hash.slice("#/research".length).replace(/^\//, ""));
      if (!rest) return renderResearch();
      const slash = rest.indexOf("/");
      if (slash === -1) return renderResearchTrack(rest);
      return renderResearchPaper(rest.slice(0, slash), rest.slice(slash + 1));
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
