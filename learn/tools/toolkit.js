/* ============================================================
   輔助工具共享工具箱 TOOLKIT
   每個工具函數簽名：function(container, ctx)
     - container: 一個 <div>，工具把 UI 放進去
     - ctx: { key: "money:0", storage: {get,set,del} }  // storage 自動加前綴 tool:<key>:
   分類檔註冊：(window.LEARN_TOOLS = window.LEARN_TOOLS || {})["money"] = { "0": fn, ... }
   ============================================================ */
(function () {
  const T = {};

  // ---- 存儲（Cookie 為主，localStorage 自動備援）----
  // Cookie 設 400 天有效期：關瀏覽器重開，記錄還在。
  // 單一 Cookie 上限約 4KB，裝不下時該筆自動退回 localStorage（同樣持久）。
  const COOKIE_DAYS = 400;
  function cookieSet(name, value) {
    try {
      document.cookie = name + "=" + encodeURIComponent(value) +
        ";max-age=" + COOKIE_DAYS * 86400 + ";path=/;SameSite=Lax";
      return document.cookie.indexOf(name + "=") !== -1; // 驗證寫入成功
    } catch (e) { return false; }
  }
  function cookieGet(name) {
    const target = name + "=";
    const parts = document.cookie ? document.cookie.split("; ") : [];
    for (let i = 0; i < parts.length; i++) {
      if (parts[i].indexOf(target) === 0) {
        try { return decodeURIComponent(parts[i].slice(target.length)); }
        catch (e) { return null; }
      }
    }
    return null;
  }
  function cookieDel(name) {
    document.cookie = name + "=;max-age=0;path=/;SameSite=Lax";
  }

  T.makeStorage = function (key) {
    const prefix = "tool:" + key + ":";
    return {
      get: function (name, fallback) {
        try {
          const v = cookieGet(prefix + name);
          if (v !== null) return JSON.parse(v);
        } catch (e) { /* 壞值往下備援 */ }
        try {
          const v = localStorage.getItem(prefix + name);
          return v === null ? (fallback !== undefined ? fallback : null) : JSON.parse(v);
        } catch (e) { return fallback !== undefined ? fallback : null; }
      },
      set: function (name, value) {
        const json = JSON.stringify(value);
        if (json.length < 3500 && cookieSet(prefix + name, json)) {
          try { localStorage.removeItem(prefix + name); } catch (e) {}
        } else {
          // 太大或 Cookie 寫入失敗 → 退回 localStorage（同樣關瀏覽器不會消失）
          cookieDel(prefix + name);
          try { localStorage.setItem(prefix + name, json); } catch (e) {}
        }
      },
      del: function (name) {
        cookieDel(prefix + name);
        try { localStorage.removeItem(prefix + name); } catch (e) {}
      },
    };
  };

  // ---- DOM 小工具 ----
  T.el = function (tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  };
  T.h = function (container, text) { container.appendChild(T.el("h4", "tool-h", T.esc(text))); };
  T.esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  // 數字輸入
  T.numInput = function (container, label, id, placeholder) {
    const row = T.el("div", "tool-field");
    row.appendChild(T.el("label", "tool-label", T.esc(label)));
    const inp = T.el("input", "tool-input");
    inp.type = "number"; inp.id = id; inp.placeholder = placeholder || "0";
    inp.min = "0"; inp.step = "any";
    row.appendChild(inp); container.appendChild(row);
    return inp;
  };
  // 文字輸入
  T.textInput = function (container, label, id, placeholder) {
    const row = T.el("div", "tool-field");
    row.appendChild(T.el("label", "tool-label", T.esc(label)));
    const inp = T.el("input", "tool-input");
    inp.type = "text"; inp.id = id; inp.placeholder = placeholder || "";
    row.appendChild(inp); container.appendChild(row);
    return inp;
  };
  // 下拉
  T.select = function (container, label, id, options) {
    const row = T.el("div", "tool-field");
    row.appendChild(T.el("label", "tool-label", T.esc(label)));
    const sel = T.el("select", "tool-input");
    sel.id = id;
    options.forEach(function (o) {
      const op = document.createElement("option");
      op.value = o.value !== undefined ? o.value : o;
      op.textContent = o.label !== undefined ? o.label : o;
      sel.appendChild(op);
    });
    row.appendChild(sel); container.appendChild(row);
    return sel;
  };
  // 按鈕
  T.button = function (container, text, onClick, ghost) {
    const b = T.el("button", "tool-btn" + (ghost ? " tool-btn-ghost" : ""), T.esc(text));
    b.type = "button";
    b.addEventListener("click", onClick);
    container.appendChild(b);
    return b;
  };
  // 結果框
  T.resultBox = function (container) {
    const box = T.el("div", "tool-result");
    box.hidden = true;
    container.appendChild(box);
    return {
      show: function (html) { box.innerHTML = html; box.hidden = false; },
      hide: function () { box.hidden = true; },
      node: box,
    };
  };
  // 進度條
  T.progress = function (pct) {
    pct = Math.max(0, Math.min(100, pct));
    return '<div class="tool-progress"><div class="tool-progress-fill" style="width:' + pct + '%"></div></div>' +
      '<span class="tool-progress-text">' + pct + '%</span>';
  };
  // 金額格式化（台幣）
  T.money = function (n) {
    if (!isFinite(n)) return "—";
    return "＄" + Math.round(n).toLocaleString("zh-TW");
  };
  // 可複製區塊
  T.copyBlock = function (container, text) {
    const pre = T.el("pre", "tool-copy-pre", T.esc(text));
    container.appendChild(pre);
    T.button(container, "📋 複製", function () {
      const done = function () { pre.classList.add("tool-copied"); setTimeout(function () { pre.classList.remove("tool-copied"); }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch (e) {}
        document.body.removeChild(ta); done();
      }
    });
  };
  // 表格
  T.table = function (container, headers, rows) {
    let html = "<table class='tool-table'><thead><tr>";
    headers.forEach(function (h) { html += "<th>" + T.esc(h) + "</th>"; });
    html += "</tr></thead><tbody>";
    rows.forEach(function (r) {
      html += "<tr>";
      r.forEach(function (c) { html += "<td>" + c + "</td>"; });
      html += "</tr>";
    });
    html += "</tbody></table>";
    container.appendChild(T.el("div", "tool-table-wrap", html));
  };
  // 簡易計時器（咖啡/呼吸用）
  T.timer = function (container, seconds, onFinish, label) {
    const disp = T.el("div", "tool-timer-display", "0:00");
    container.appendChild(disp);
    let left = seconds, iv = null;
    const fmt = function (s) { return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
    disp.textContent = fmt(seconds);
    const start = T.button(container, "▶ 開始 " + (label || ""), function () {
      if (iv) { clearInterval(iv); iv = null; start.textContent = "▶ 開始 " + (label || ""); return; }
      start.textContent = "⏸ 暫停";
      iv = setInterval(function () {
        left -= 1;
        disp.textContent = fmt(left);
        if (left <= 0) { clearInterval(iv); iv = null; disp.textContent = "🎉 完成！"; start.textContent = "▶ 再來一次"; if (onFinish) onFinish(); }
      }, 1000);
    });
    T.button(container, "↺ 重置", function () {
      if (iv) { clearInterval(iv); iv = null; }
      left = seconds; disp.textContent = fmt(seconds);
      start.textContent = "▶ 開始 " + (label || "");
    }, true);
  };

  window.TOOLKIT = T;
})();
