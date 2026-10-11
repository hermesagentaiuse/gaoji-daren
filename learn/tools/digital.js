/* ============================================================
   數位與資訊素養 輔助工具（對應 config.js digital 分類索引）
   0 兩步驟驗證檢查表 | 1 詐騙紅旗掃描器 | 2 轉發前安檢門
   3 備份 3-2-1 稽核器 | 4 數位足跡年檢表
   ============================================================ */
(function () {
  const T = window.TOOLKIT;
  const tools = {};

  // 共用的文字輸入框（多行）
  function textarea(container, label, id, placeholder) {
    const row = T.el("div", "tool-field");
    row.appendChild(T.el("label", "tool-label", T.esc(label)));
    const ta = T.el("textarea", "tool-input");
    ta.id = id;
    ta.placeholder = placeholder || "";
    ta.rows = 5;
    ta.style.resize = "vertical";
    row.appendChild(ta);
    container.appendChild(row);
    return ta;
  }

  // ---- 0. 兩步驟驗證檢查表 ----
  tools["0"] = function (box, ctx) {
    T.h(box, "🔐 兩步驟驗證檢查表");
    box.appendChild(T.el("p", "tool-tip",
      "三個欄位都打勾才算真的安全：獨立密碼（每組帳號不同）、存進密碼管理器、開 2FA（用驗證器 App，不要用簡訊）。"));

    const DEFAULTS = [
      "電子郵件（最優先：它能重設你所有其他帳號）",
      "網路銀行",
      "券商 / 證券 APP",
      "超商會員 / 支付綁定（台灣 Pay、LINE Pay 等）",
      "社群（Facebook / Instagram / LINE）",
      "雲端（Google / Apple / OneDrive）",
    ];
    let accounts = ctx.get("accounts", null);
    if (!accounts || !accounts.length) {
      accounts = DEFAULTS.map(function (n) { return { n: n, p: false, m: false, t: false }; });
    }

    const nameInp = T.textInput(box, "加一個自己的帳號", "tk-acct-name", "例：公司信箱、購物網站");
    T.button(box, "＋ 加入清單", function () {
      const n = nameInp.value.trim();
      if (!n) return out.show("<p class='tool-warn'>請先輸入帳號名稱。</p>");
      accounts.push({ n: n, p: false, m: false, t: false });
      ctx.set("accounts", accounts);
      nameInp.value = "";
      render();
    });
    T.button(box, "重置為預設清單", function () {
      if (!confirm("確定清除自訂帳號、回復預設清單？")) return;
      ctx.del("accounts");
      accounts = DEFAULTS.map(function (n) { return { n: n, p: false, m: false, t: false }; });
      render();
    }, true);
    const out = T.resultBox(box);

    function render() {
      box.querySelectorAll(".tool-table-wrap, .tool-plan").forEach(function (n) { n.remove(); });
      const cols = ["獨立密碼", "密碼管理器", "2FA（驗證器 App）"];
      const rows = accounts.map(function (a, i) {
        const cells = cols.map(function (_, k) {
          const key = ["p", "m", "t"][k];
          return "<input type='checkbox' data-i='" + i + "' data-k='" + key + "'" + (a[key] ? " checked" : "") + ">";
        });
        return [T.esc(a.n), cells[0], cells[1], cells[2],
          "<button class='tool-del' data-del='" + i + "'>✕</button>"];
      });
      T.table(box, ["帳號"].concat(cols).concat([""]), rows);

      // 完成度
      const total = accounts.length * 3;
      let done = 0;
      accounts.forEach(function (a) { done += (a.p ? 1 : 0) + (a.m ? 1 : 0) + (a.t ? 1 : 0); });
      const pct = total ? Math.round((done / total) * 100) : 0;

      // 優先補強建議：mail 最優先，其餘依缺項數排
      const missing = accounts.map(function (a, i) {
        const miss = [];
        if (!a.p) miss.push("獨立密碼");
        if (!a.m) miss.push("密碼管理器");
        if (!a.t) miss.push("2FA");
        return { n: a.n, miss: miss, isMail: /mail|電子信箱|信箱/i.test(a.n) || i === 0 };
      }).filter(function (x) { return x.miss.length; });
      missing.sort(function (a, b) {
        if (a.isMail !== b.isMail) return a.isMail ? -1 : 1;
        return b.miss.length - a.miss.length;
      });

      const plan = T.el("div", "tool-plan");
      let html = "<h5 class='tool-card-title'>🎯 完成度</h5>" + T.progress(pct);
      if (missing.length) {
        html += "<ol class='tool-order-list'>" + missing.slice(0, 5).map(function (m) {
          return "<li><b>" + T.esc(m.n) + "</b>：補 " + m.miss.map(T.esc).join("、") + "</li>";
        }).join("") + "</ol>";
        html += "<p class='tool-warn'>🥇 最優先補電子郵件 — 幾乎所有帳號都能用它「忘記密碼」重設，信箱失守＝全數淪陷。</p>";
      } else {
        html += "<p>🎉 全部達標！每季回來抽查一次，新註冊的帳號馬上補進清單。</p>";
      }
      html += "<p class='tool-tip'>💡 2FA 優先選驗證器 App（Google Authenticator / Aegis）或硬體金鑰；簡訊 2FA 可能被門號轉移攔截。密碼管理器推薦 Bitwarden（免費）。</p>";
      plan.innerHTML = html;
      box.appendChild(plan);

      box.querySelectorAll("input[type='checkbox'][data-i]").forEach(function (cb) {
        cb.addEventListener("change", function () {
          accounts[parseInt(cb.dataset.i, 10)][cb.dataset.k] = cb.checked;
          ctx.set("accounts", accounts);
          render();
        });
      });
      box.querySelectorAll(".tool-del").forEach(function (b) {
        b.addEventListener("click", function () {
          accounts.splice(parseInt(b.dataset.del, 10), 1);
          ctx.set("accounts", accounts);
          render();
        });
      });
    }
    render();
  };

  // ---- 1. 詐騙紅旗掃描器 ----
  tools["1"] = function (box, ctx) {
    T.h(box, "🚩 詐騙紅旗掃描器");
    box.appendChild(T.el("p", "tool-tip", "把可疑的簡訊、LINE 訊息、對話內容整段貼進來（或直接描述情境），掃三大紅旗。"));
    const ta = textarea(box, "可疑訊息內容 / 情境描述", "tk-scam",
      "例：您的帳戶異常，請於十分鐘內到超商購買儲值卡並提供代碼，不要告訴其他人，不然就凍結帳戶…");
    T.button(box, "🚩 掃描紅旗", function () {
      const text = ta.value.trim();
      if (!text) return out.show("<p class='tool-warn'>請先貼上訊息內容。</p>");
      const groups = [
        {
          name: "紅旗一：異常時效施壓（不給你思考時間）",
          why: "正規的機構不會用倒數計時逼你做決定。施壓是詐騙的核心手法。",
          words: ["十分鐘", "10分鐘", "五分鐘", "5分鐘", "三分鐘", "馬上", "马上", "立刻", "立即",
            "不然就", "否則", "限今天", "限現在", "即將失效", "逾期", "24小時內", "盡快完成", "現在不", "抓緊時間"]
        },
        {
          name: "紅旗二：要求保密（隔絕你跟求證對象）",
          why: "要你別告訴家人朋友，就是怕旁邊的人一句話戳破謊言。",
          words: ["不要告訴", "別告訴", "不要跟其他", "别告诉", "別跟別", "别告诉其", "不要讓家人", "別讓家人",
            "保密", "不要說出去", "悄悄", "獨自", "一個人去", "不要聲張", "別問別人", "不要問別人", "不能說"]
        },
        {
          name: "紅旗三：異常付款（錢出去就追不回來）",
          why: "儲值卡、超商代碼、虛擬貨幣、人頭戶匯款——全是可以讓錢瞬間消失、無法追溯的管道。",
          words: ["儲值", "超商", "代碼", "點數卡", "JT", "MyCard", "虛擬貨幣", "加密貨幣", "USDT", "比特幣",
            "人頭", "頭存", "提款卡", "金融卡", "帳戶", "匯款", "轉帳", "ATM", "转账", "付款碼", "繳費"]
        },
      ];
      const hits = groups.map(function (g) {
        const found = g.words.filter(function (w) { return text.indexOf(w) !== -1; });
        return { g: g, found: found };
      }).filter(function (h) { return h.found.length; });
      const n = hits.length;

      let html = "<p>命中紅旗：<b class='tool-big'>" + n + " / 3</b></p>";
      if (n === 0) {
        html += "<p>✅ 未命中三大紅旗 — 但仍要留意：詐騙話術一直在更新。</p>";
      } else {
        html += "<ul class='tool-checklist'>" + hits.map(function (h) {
          return "<li>⚠️ <b>" + T.esc(h.g.name) + "</b><br>命中詞：" +
            h.found.map(function (w) { return "<b>" + T.esc(w) + "</b>"; }).join("、") +
            "<br><span class='tool-tip'>" + T.esc(h.g.why) + "</span></li>";
        }).join("") + "</ul>";
      }
      if (n === 0) {
        html += "<p>建議：還是可疑就照下面的查證步驟走一遍。</p>";
      } else if (n === 1) {
        html += "<p class='tool-warn'>一盞紅旗：提高警覺，先掛斷／已讀不回，自己撥官方客服查證再說。</p>";
      } else if (n === 2) {
        html += "<p class='tool-warn'>兩盞紅旗：高風險！不要回撥對方給的電話、不要點連結、不要匯任何錢。</p>";
      } else {
        html += "<p class='tool-warn'>三盞紅旗全中：幾乎可確定是詐騙。立刻封鎖對方，已付款立即撥 <b>165</b> 反詐騙專線申請止付。</p>";
      }
      html += "<p class='tool-tip'>📞 萬用原則：<b>掛斷，自己撥官方客服（從官網／卡背查號碼，不用對方給的號碼）查證</b>；拿不準就撥 <b>165</b> 反詐騙專線。</p>";
      out.show(html);
      ctx.set("lastScan", { t: text.slice(0, 500), n: n, d: new Date().toISOString().slice(0, 10) });
    });
    T.button(box, "清空", function () { ta.value = ""; out.hide(); }, true);
    const out = T.resultBox(box);

    const QUESTIONS = [
      "查證提問清單（掛斷前照著問，或掛斷後自己撥官方客服核對）：",
      "1. 請告訴我你的員工編號與客服分機，我掛斷後會自己撥官方專線確認。",
      "2. 這件事情官網上公告過嗎？請給我可以自行查證的官方連結。",
      "3. 為什麼必須用儲值卡／代碼／虛擬貨幣付款？一般機構為什麼不收這種付款方式？",
      "4. 我要求「今天不做、明天再處理」，可以做嗎？（對方說不行＝紅旗）",
      "5. 我可以找家人／朋友一起去處理嗎？（對方說不可以＝紅旗）",
      "6. 請提供公司全名與統一編號，我到經濟部商業司登記網查證。",
      "拿不準：撥 165 反詐騙專線（免費），或 110 報案。",
    ].join("\n");
    box.appendChild(T.el("p", "tool-tip", "📋 查證時直接把這份提問清單帶在手上："));
    T.copyBlock(box, QUESTIONS);
  };

  // ---- 2. 轉發前安檢門 ----
  tools["2"] = function (box, ctx) {
    T.h(box, "🛃 轉發前安檢門");
    box.appendChild(T.el("p", "tool-tip", "要分享到家族群／社團之前，先過這五關。標題聳動、要你「快轉」的，九成不用轉。"));
    const title = T.textInput(box, "文章標題", "tk-title", "例：震驚！吃這個會致癌，趕緊轉給家人！");
    const src = T.textInput(box, "來源（發佈的網站／媒體／帳號）", "tk-src", "例：某新聞網／unknown");
    const date = T.textInput(box, "發佈日期（YYYY-MM-DD）", "tk-date", "例：2026-10-01");
    const singleWrap = T.el("div", "tool-field");
    const singleLbl = T.el("label", "tool-label", "我已搜尋過：同樣消息只有這一個來源（沒有其他媒體跟進）");
    const singleCb = T.el("input");
    singleCb.type = "checkbox";
    singleLbl.appendChild(singleCb);
    singleWrap.appendChild(singleLbl);
    box.appendChild(singleWrap);

    T.button(box, "🛃 過安檢", function () {
      const tt = title.value.trim();
      const ss = src.value.trim();
      const dd = date.value.trim();
      if (!tt) return out.show("<p class='tool-warn'>請先貼上文章標題。</p>");

      const checks = [];
      // 1. 具名來源
      const BAD_SRC = ["", "無", "未知", "unknown", "網路", "網路傳聞", "傳聞", "朋友", "朋友傳的", "群組",
        "line群", "微信群", "限時動態", "內行", "據說", "聽聞"];
      const namedOk = BAD_SRC.indexOf(ss.toLowerCase()) === -1 && ss.length >= 2;
      checks.push(["有具名來源（寫得出網站／媒體／帳號）", namedOk,
        namedOk ? "來源：" + T.esc(ss) : "來源不明或太籠統（例：「網路傳聞」「朋友說」）"]);
      // 2. 日期近期
      let recentOk = false, dateNote = "無法解讀日期，請填 YYYY-MM-DD（舊聞新傳是假訊息最常見的手法）";
      const m = dd.replace(/\//g, "-").match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (m) {
        const pub = new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
        const days = Math.floor((Date.now() - pub.getTime()) / 86400000);
        recentOk = days >= -1 && days <= 30;
        dateNote = recentOk ? "發佈 " + days + " 天內，算近期" : "發佈已 " + days + " 天前 — 超過 30 天，小心是舊聞重燒";
      }
      checks.push(["日期近期（30 天內）", recentOk, dateNote]);
      // 3. 不是單一來源
      const multiOk = !singleCb.checked;
      checks.push(["不是只有單一來源（有其他媒體跟進）", multiOk,
        multiOk ? "有其他來源跟進" : "只有這一處在講 — 重要消息不會只有一家知道"]);
      // 4. 標題不情緒化
      const EMOTIO = ["震驚", "惊爆", "驚爆", "崩潰", "淚崩", "淚目", "駭人", "嚇呆", "瘋傳", "全网", "全網",
        "看完就哭", "看完淚", "太可怕", "趕緊看", "快看", "必看", "良心", "震驚全國", "震驚全台", "揭密", "黑幕"];
      const emotioHits = EMOTIO.filter(function (w) { return tt.indexOf(w) !== -1; });
      const bang = (tt.match(/[!！]/g) || []).length >= 2;
      const emotioOk = !emotioHits.length && !bang;
      checks.push(["標題不情緒化（沒有聳動詞、連串驚嘆號）", emotioOk,
        emotioOk ? "標題算平實" : "聳動訊號：" + emotioHits.concat(bang ? ["連串驚嘆號"] : []).map(T.esc).join("、")]);
      // 5. 不要求立即轉發
      const FORCE = ["快轉", "請轉", "務必轉", "轉給", "不轉", "擴散", "緊急擴散", "趕快分享", "分享出去",
        "轉發", "赶紧转", "赶紧轉", "不轉不是", "是家人就轉"];
      const forceHits = FORCE.filter(function (w) { return tt.indexOf(w) !== -1; });
      const forceOk = !forceHits.length;
      checks.push(["不要求立即轉發（沒有「快轉給家人」式話術）", forceOk,
        forceOk ? "沒有施壓轉發" : "施壓轉發詞：" + forceHits.map(T.esc).join("、")]);

      const passed = checks.filter(function (c) { return c[1]; }).length;
      const score = passed * 20;
      let verdict, vcls;
      if (score >= 80) { verdict = "✅ 建議：可以轉（轉的時候附上來源連結）"; vcls = "tool-good"; }
      else if (score >= 60) { verdict = "🤔 建議：先查再轉（搜標題關鍵字＋「謠言」，看轉真網／MyGoPen 有沒有查核報告）"; vcls = "tool-warn"; }
      else { verdict = "⛔ 建議：不轉。不確定就假設是假的 — 不轉不會損失什麼，轉錯會害親友受騙"; vcls = "tool-bad"; }

      let html = "<p>安檢分數：<b class='tool-big'>" + score + " / 100</b>（過 " + passed + " / 5 關）</p>" + T.progress(score);
      html += "<p><b class='" + vcls + "'>" + verdict + "</b></p>";
      html += "<ul class='tool-checklist'>" + checks.map(function (c) {
        return "<li>" + (c[1] ? "✅" : "❌") + " " + T.esc(c[0]) +
          "<br><span class='tool-tip'>" + c[2] + "</span></li>";
      }).join("") + "</ul>";
      html += "<p class='tool-tip'>🔎 快速查證：google「標題關鍵字 + 謠言」、查 <b>轉真網</b>（cofacts）與 <b>MyGoPen</b>；衛生醫療類查衛福部食藥署「食品藥物安全資訊網」的闢謠專區。</p>";
      out.show(html);
      ctx.set("last", { title: tt.slice(0, 120), score: score, d: new Date().toISOString().slice(0, 10) });
    });
    const out = T.resultBox(box);
  };

  // ---- 3. 備份 3-2-1 稽核器 ----
  tools["3"] = function (box, ctx) {
    T.h(box, "💾 備份 3-2-1 稽核器");
    box.appendChild(T.el("p", "tool-tip",
      "3-2-1 原則：重要資料至少 <b>3</b> 份副本、放在 <b>2</b> 種不同媒介、其中 <b>1</b> 份在異地（雲端或另一地點）。沒打勾的格子就是缺口。"));

    const CATS = ["照片 / 影片", "重要文件（報稅、契約、證照）", "財務紀錄", "工作檔"];
    let matrix = ctx.get("matrix", null);
    if (!matrix) {
      matrix = CATS.map(function () { return { c: false, e: false, n: false }; });
    }
    const SMALL_THINGS = {
      "照片 / 影片": "把手機相簿打開自動備份（Google 相簿 / iCloud），今天就去按那個「開啟同步」按鈕。",
      "重要文件（報稅、契約、證照）": "把掃描檔集中進一個資料夾，複製一份到外接硬碟，標上今天的日期。",
      "財務紀錄": "把記帳檔／對帳單備份到加密雲端（或複製進密碼管理器的附件），5 分鐘就完成。",
      "工作檔": "幫工作資料夾開雲端同步（OneDrive / Google Drive），或備一份到第二個硬碟。",
    };

    const drill = T.textInput(box, "上次成功「還原演練」日期（YYYY-MM-DD）", "tk-drill", "例：2025-09-01");
    T.button(box, "💾 記錄這次演練", function () {
      const v = drill.value.trim().replace(/\//g, "-");
      if (!/^\d{4}-\d{1,2}-\d{1,2}$/.test(v)) return out.show("<p class='tool-warn'>請填 YYYY-MM-DD 格式的日期。</p>");
      ctx.set("drillDate", v);
      render();
    });
    const out = T.resultBox(box);

    function render() {
      box.querySelectorAll(".tool-table-wrap, .tool-plan").forEach(function (n) { n.remove(); });
      const rows = CATS.map(function (c, i) {
        const r = matrix[i];
        const cell = function (k) {
          return "<input type='checkbox' data-i='" + i + "' data-k='" + k + "'" + (r[k] ? " checked" : "") + ">";
        };
        const count = (r.c ? 1 : 0) + (r.e ? 1 : 0) + (r.n ? 1 : 0);
        const status = count === 0 ? "<span class='tool-bad'>🔥 裸奔中</span>"
          : count === 1 ? "<span class='tool-warn'>⚠️ 只有一份</span>"
          : (!r.c && !r.n) ? "<span class='tool-warn'>⚠️ 沒異地</span>"
          : "<span class='tool-good'>✅ 達標</span>";
        return [T.esc(c), cell("c"), cell("e"), cell("n"), status];
      });
      T.table(box, ["資料類別", "雲端", "外接硬碟", "NAS / 異地", "判定"], rows);

      // 缺口＋下週小事
      const gaps = [];
      CATS.forEach(function (c, i) {
        const r = matrix[i];
        const count = (r.c ? 1 : 0) + (r.e ? 1 : 0) + (r.n ? 1 : 0);
        if (count < 2 || (!r.c && !r.n)) {
          gaps.push("<li><b>" + T.esc(c) + "</b>（現 " + count + " 份" + (!r.c && !r.n ? "、無異地副本" : "") + "）<br><span class='tool-tip'>📌 下週就做的一件小事：" + T.esc(SMALL_THINGS[c]) + "</span></li>");
        }
      });
      // 還原演練
      const drillDate = ctx.get("drillDate", null);
      let drillHtml;
      if (!drillDate) {
        drillHtml = "<p class='tool-warn'>⚠️ 還沒有還原演練紀錄 — 沒驗證過的備份不算備份。這週挑一個檔案「從備份還原」試試，成功後填上日期。</p>";
      } else {
        const dm = drillDate.replace(/\//g, "-").match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        let days = null;
        if (dm) days = Math.floor((Date.now() - new Date(+dm[1], +dm[2] - 1, +dm[3]).getTime()) / 86400000);
        if (days !== null && days > 365) {
          drillHtml = "<p class='tool-warn'>⚠️ 上次演練是 " + T.esc(drillDate) + "（" + days + " 天前，超過一年了）— 備份軟體會壞、雲端帳號會掉，重新演練一次。</p>";
        } else {
          drillHtml = "<p>✅ 上次還原演練：" + T.esc(drillDate) + (days !== null ? "（" + days + " 天前）" : "") + "，一年一次保持。</p>";
        }
      }

      const plan = T.el("div", "tool-plan");
      let html = "<h5 class='tool-card-title'>🕳️ 缺口清單</h5>";
      html += gaps.length ? "<ul class='tool-checklist'>" + gaps.join("") + "</ul>"
        : "<p>🎉 四類資料都達 3-2-1 標準！</p>";
      html += "<h5 class='tool-card-title'>🧪 還原演練</h5>" + drillHtml;
      html += "<p class='tool-tip'>💡 提醒：雲端不是備份的萬靈丹 — 誤刪、帳號被停、勒索病毒同步都會一次清光。異地的實體副本（第二顆硬碟放親友家）才是最後一道保險。</p>";
      plan.innerHTML = html;
      box.appendChild(plan);

      box.querySelectorAll("input[type='checkbox'][data-i]").forEach(function (cb) {
        cb.addEventListener("change", function () {
          matrix[parseInt(cb.dataset.i, 10)][cb.dataset.k] = cb.checked;
          ctx.set("matrix", matrix);
          render();
        });
      });
    }
    const dd = ctx.get("drillDate", null);
    if (dd) drill.value = dd;
    render();
  };

  // ---- 4. 數位足跡年檢表 ----
  tools["4"] = function (box, ctx) {
    T.h(box, "👣 數位足跡年檢表");
    box.appendChild(T.el("p", "tool-tip", "每年至少做一次（一年真的轉眼就過）。重點：網路上的你，跟你以為的自己還一樣嗎？"));

    const ITEMS = [
      "在 Google 搜自己的名字（開無痕模式），看第一頁出現什麼",
      "搜自己的手機號碼，看有沒有被掛在奇怪網站上",
      "翻清三年前的社群貼文（當時覺得好笑、現在想刪的，現在刪）",
      "檢視第三方登入授權（Google / Apple「安全性」裡的「使用你的帳號登入的應用程式」），撤掉不再用的",
      "檢查各社群帳號的隱私設定（誰能看到貼文、好友清單、定位標記）",
      "確認不再使用的老帳號：已從舊裝置登出、已註銷（或至少關掉發文權限）",
    ];
    let checks = ctx.get("checks", null);
    if (!checks || checks.length !== ITEMS.length) {
      checks = ITEMS.map(function () { return false; });
    }

    function render() {
      box.querySelectorAll(".tool-plan").forEach(function (n) { n.remove(); });
      const plan = T.el("div", "tool-plan");
      const done = checks.filter(Boolean).length;
      const pct = Math.round((done / ITEMS.length) * 100);
      let html = "<h5 class='tool-card-title'>📋 年檢清單</h5><ul class='tool-checklist'>";
      ITEMS.forEach(function (it, i) {
        html += "<li style='list-style:none;margin:6px 0'><label><input type='checkbox' data-ci='" + i + "'" +
          (checks[i] ? " checked" : "") + "> " + (checks[i] ? "✅ " : "⬜ ") + T.esc(it) + "</label></li>";
      });
      html += "</ul>" + T.progress(pct);
      const lastRun = ctx.get("lastRun", null);
      if (lastRun) {
        const lm = String(lastRun).replace(/\//g, "-").match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        let months = null;
        if (lm) months = Math.floor((Date.now() - new Date(+lm[1], +lm[2] - 1, +lm[3]).getTime()) / (30.44 * 86400000));
        if (months !== null && months > 11) {
          html += "<p class='tool-warn'>⏰ 上次執行是 " + T.esc(lastRun) + "（約 " + months + " 個月前）— 超過 11 個月，該再做一次年檢了！</p>";
        } else {
          html += "<p>上次執行：" + T.esc(lastRun) + (months !== null ? "（約 " + months + " 個月前）" : "") + "。</p>";
        }
      } else {
        html += "<p class='tool-tip'>還沒有執行紀錄 — 全部勾完按下面的「完成年檢」記錄今天。</p>";
      }
      if (pct === 100) html += "<p>🎉 年檢完成！設個手機行事曆提醒：一年後同一週再來一次。</p>";
      plan.innerHTML = html;
      box.appendChild(plan);
      plan.querySelectorAll("input[type='checkbox'][data-ci]").forEach(function (cb) {
        cb.addEventListener("change", function () {
          checks[parseInt(cb.dataset.ci, 10)] = cb.checked;
          ctx.set("checks", checks);
          render();
        });
      });
    }

    T.button(box, "✅ 完成年檢，記錄今天", function () {
      const undone = checks.filter(function (c) { return !c; }).length;
      if (undone > 0 && !confirm("還有 " + undone + " 項沒勾完，確定記錄為完成？")) return;
      ctx.set("lastRun", new Date().toISOString().slice(0, 10));
      render();
    });
    T.button(box, "重置勾選（明年重新來過）", function () {
      checks = ITEMS.map(function () { return false; });
      ctx.set("checks", checks);
      render();
    }, true);
    render();
  };

  (window.LEARN_TOOLS = window.LEARN_TOOLS || {})["digital"] = tools;
})();
