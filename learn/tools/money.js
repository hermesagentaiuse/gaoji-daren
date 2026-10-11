/* ============================================================
   金錢與財務 輔助工具（對應 config.js money 分類索引）
   0 預備金計算機 | 1 先儲蓄試算 | 2 ETF定期定額復利計算機
   3 保費健檢 | 4 財報三大表速查 | 5 好壞負債清單 | 6 記帳+無感開銷分析
   ============================================================ */
(function () {
  const T = window.TOOLKIT;
  const tools = {};

  // ---- 0. 緊急預備金計算機 ----
  tools["0"] = function (box, ctx) {
    T.h(box, "🧮 預備金計算機");
    const mRent = T.numInput(box, "房租 / 房貸（月）");
    const mFood = T.numInput(box, "飲食（月）");
    const mTrans = T.numInput(box, "通勤 / 交通（月）");
    const mBill = T.numInput(box, "水電網費 + 保險 + 訂閱（月）");
    const mOther = T.numInput(box, "其他固定支出（月）");
    const saved = T.numInput(box, "目前已存預備金", "tk-saved", "0");
    const btn = T.button(box, "計算我的預備金目標", calc);
    T.button(box, "清空", function () {
      [mRent, mFood, mTrans, mBill, mOther, saved].forEach(function (i) { i.value = ""; });
      out.hide();
    }, true);
    const out = T.resultBox(box);
    function calc() {
      const v = function (i) { return parseFloat(i.value) || 0; };
      const monthly = v(mRent) + v(mFood) + v(mTrans) + v(mBill) + v(mOther);
      if (monthly <= 0) return out.show("<p class='tool-warn'>請先填本月固定開銷。</p>");
      const target = monthly * 6;
      const s = v(saved);
      const pct = target ? Math.round((s / target) * 100) : 0;
      let html = "<p>真實月開銷：<b>" + T.money(monthly) + "</b>　→　6 個月目標：<b class='tool-big'>" + T.money(target) + "</b></p>";
      html += T.progress(pct);
      const perMonth = (target - s) / 12;
      if (s < target) {
        html += "<p>想 12 個月內存滿：每月存 <b>" + T.money(Math.max(0, perMonth)) + "</b>（設成薪資到賬日自動轉出）</p>";
        html += "<p class='tool-tip'>💡 放高利活存或 MMF（貨幣市場基金），要能在 48 小時內領得出來。</p>";
      } else {
        html += "<p>🎉 預備金達標！多出來的錢可以開始往 ETF 定期定額移動。</p>";
      }
      out.show(html);
      ctx.set("last", { monthly: monthly, saved: s });
    }
    const last = ctx.get("last");
    if (last && last.monthly) { saved.value = last.saved || ""; }
  };

  // ---- 1. 先儲蓄試算（pay yourself first）----
  tools["1"] = function (box, ctx) {
    T.h(box, "💵 先儲蓄比例試算");
    const income = T.numInput(box, "每月稅後收入");
    const ratio = T.select(box, "儲蓄比例", "tk-ratio", [
      { value: "10", label: "10% — 起步" },
      { value: "15", label: "15% — 認真" },
      { value: "20", label: "20% — 進階" },
      { value: "30", label: "30% — 拚 FIRE（財務獨立）" },
    ]);
    T.button(box, "試算", function () {
      const inc = parseFloat(income.value) || 0;
      const r = parseInt(ratio.value, 10) / 100;
      if (inc <= 0) return out.show("<p class='tool-warn'>請輸入月收入。</p>");
      const save = inc * r;
      const spend = inc - save;
      const y10 = save * 12 * 10 * 1.05; // 粗略含 5% 年化
      let html = "<p>發薪日<b>當天自動轉出</b>：<b class='tool-big'>" + T.money(save) + "</b>　可支配：<b>" + T.money(spend) + "</b></p>";
      html += "<p>堅持 10 年（含約 5% 年化）≈ <b>" + T.money(y10) + "</b>（未計勞退/配息）</p>";
      html += "<p class='tool-tip'>💡 關鍵不是比例多高，是「到賬日自動轉出」— 輪不到你猶豫。</p>";
      out.show(html);
    });
    const out = T.resultBox(box);
  };

  // ---- 2. ETF 定期定額復利計算機 ----
  tools["2"] = function (box, ctx) {
    T.h(box, "📈 定期定額復利計算機");
    const monthly = T.numInput(box, "每月投入", "tk-m", "3000");
    const years = T.numInput(box, "年數", "tk-y", "10");
    const rate = T.select(box, "假設年化報酬", "tk-r", [
      { value: "4", label: "4% — 保守" },
      { value: "6", label: "6% — 市值型長期約略" },
      { value: "8", label: "8% — 樂觀" },
    ]);
    T.button(box, "計算復利", function () {
      const p = parseFloat(monthly.value) || 0;
      const y = parseInt(years.value, 10) || 0;
      const r = (parseFloat(rate.value) || 0) / 100 / 12;
      if (p <= 0 || y <= 0) return out.show("<p class='tool-warn'>請填每月投入與年數。</p>");
      const fv = p * ((Math.pow(1 + r, y * 12) - 1) / r) * (1 + r);
      const principal = p * 12 * y;
      let html = "<p>每月 " + T.money(p) + " × " + y + " 年 → 總投入 <b>" + T.money(principal) + "</b>";
      html += "　期末約 <b class='tool-big'>" + T.money(fv) + "</b></p>";
      html += T.progress(Math.min(100, Math.round((fv - principal) / fv * 100)));
      html += "<p>其中 <b>" + T.money(fv - principal) + "</b>（" + Math.round((fv - principal) / fv * 100) + "%）是復利幫你賺的。</p>";
      html += "<p class='tool-tip'>⚠️ 名目報酬假設，未扣稅與通膨、實際報酬因市場而異。0050/006208 等實際配息與績效請上官網查證。</p>";
      out.show(html);
    });
    const out = T.resultBox(box);
  };

  // ---- 3. 保費健檢（10% 法則）----
  tools["3"] = function (box, ctx) {
    T.h(box, "🛡️ 保費健檢（年收入 10% 法則）");
    const income = T.numInput(box, "年收入");
    const prem = T.numInput(box, "每年保費總額（含儲蓄型）");
    T.button(box, "健檢", function () {
      const inc = parseFloat(income.value) || 0;
      const pm = parseFloat(prem.value) || 0;
      if (inc <= 0) return out.show("<p class='tool-warn'>請輸入年收入。</p>");
      const cap = inc * 0.1;
      const pct = Math.round(pm / inc * 100);
      let html = "<p>保費佔年收入：<b>" + pct + "%</b>（天花板 10% = " + T.money(cap) + "）</p>" + T.progress(Math.min(100, pct * 5));
      const checks = [
        ["有實支實付（至少 1 份、注意第二份限額）", true],
        ["有失能/重大傷病保障（工作收入中斷才是最貴的風險）", true],
        ["醫療險在預算內（優先純保費型，儲蓄型另議）", true],
        ["保費總額 ≤ 年收入 10%", pm <= cap],
      ];
      html += "<ul class='tool-checklist'>";
      checks.forEach(function (c) {
        html += "<li>" + (c[1] ? "✅" : "⚠️") + " " + T.esc(c[0]) + "</li>";
      });
      html += "</ul>";
      if (pm > cap) html += "<p class='tool-warn'>保費超頂 " + T.money(pm - cap) + "：先砍儲蓄型/年金型，保住純保障型。</p>";
      html += "<p class='tool-tip'>💡 勞保失能給付不夠支撐長期收入中斷，商業失能險補缺口。實際給付請查勞保局。</p>";
      out.show(html);
    });
    const out = T.resultBox(box);
  };

  // ---- 4. 財報三大表速查卡 ----
  tools["4"] = function (box, ctx) {
    T.h(box, "📊 財報三大表速查（看財報前打開這個）");
    const data = [
      ["資產負債表", "公司的『體檢報告快照』",
        ["負債比 < 50% 常見安全線（產業差異大）", "現金+短債 vs 短債：短期償還能力", "應收帳款天數暴增 = 貨賣了收不到錢", "商譽/無形資產占比過高要警覺"]],
      ["損益表", "一段時間的『損益經營成績單』",
        ["營收連續 2-3 季成長 > 單季爆發可信", "毛利率趨勢比絕對值重要", "EPS 要看是否業外/一次性收益堆出", "營業利益率才是本業真本事"]],
      ["現金流量表", "『錢實際有沒有進口袋』",
        ["營運動態現金流 > 淨利 = 獲利品質高", "連續自由現金流為負 = 燒錢換成長", "融資現金流大舉流入要留意擴張風險", "配息發得出來靠的是這張表，不是 EPS"]],
    ];
    data.forEach(function (d) {
      const card = T.el("div", "tool-card");
      card.innerHTML = "<h5 class='tool-card-title'>" + T.esc(d[0]) + " <span class='tool-card-sub'>" + T.esc(d[1]) + "</span></h5><ul class='tool-checklist'>" +
        d[2].map(function (s) { return "<li>🔍 " + T.esc(s) + "</li>"; }).join("") + "</ul>";
      box.appendChild(card);
    });
    T.copyBlock(box, "看財報口訣：先看現金流認獲利品質，再看損益看趨勢，最後看負債表查體質。營收、毛利率、營益率、營運動態現金流/淨利、負債比 — 五個數看完再決定要不要深挖。");
  };

  // ---- 5. 好壞負債清單 ----
  tools["5"] = function (box, ctx) {
    T.h(box, "⚖️ 好壞負債清單");
    let debts = ctx.get("debts", []);
    const name = T.textInput(box, "負債名稱", "tk-dn", "例：信用卡循環");
    const amount = T.numInput(box, "餘額");
    const rate = T.numInput(box, "年利率 %", "tk-dr", "例：14");
    const purpose = T.select(box, "用途性質", "tk-dp", [
      { value: "bad", label: "消費/投機（壞債：循環利息、買手機、賭）" },
      { value: "good", label: "自住房貸/生產工具（好債：能生錢或保值）" },
    ]);
    T.button(box, "＋ 加入清單", function () {
      const n = name.value.trim();
      const a = parseFloat(amount.value) || 0;
      const r = parseFloat(rate.value) || 0;
      if (!n || a <= 0) return out.show("<p class='tool-warn'>名稱與餘額必填。</p>");
      debts.push({ n: n, a: a, r: r, p: purpose.value });
      ctx.set("debts", debts);
      name.value = ""; amount.value = ""; rate.value = "";
      render();
    });
    T.button(box, "清空清單", function () { debts = []; ctx.del("debts"); render(); }, true);
    const out = T.resultBox(box);
    function render() {
      box.querySelectorAll(".tool-table-wrap, .tool-plan").forEach(function (n) { n.remove(); });
      if (!debts.length) return;
      const rows = debts.map(function (d, i) {
        const tag = d.p === "bad" ? "<span class='tool-bad'>壞債</span>" : "<span class='tool-good'>好債</span>";
        return [T.esc(d.n), T.money(d.a), d.r + "%", tag,
          "<button class='tool-del' data-i='" + i + "'>✕</button>"];
      });
      T.table(box, ["負債", "餘額", "利率", "判定", ""], rows);
      // 雪崩法建議
      const bads = debts.filter(function (d) { return d.p === "bad"; })
        .sort(function (a, b) { return b.r - a.r; });
      const plan = T.el("div", "tool-plan");
      if (bads.length) {
        const totalBad = bads.reduce(function (s, d) { return s + d.a; }, 0);
        const monthlyInterest = bads.reduce(function (s, d) { return s + d.a * (d.r || 0) / 100 / 12; }, 0);
        plan.innerHTML = "<h5 class='tool-card-title'>🔥 清償順序（雪崩法：先砍利率最高的）</h5><ol class='tool-order-list'>" +
          bads.map(function (d) { return "<li><b>" + T.esc(d.n) + "</b>（" + d.r + "%，" + T.money(d.a) + "）</li>"; }).join("") +
          "</ol><p>壞債每個月光是利息就要付 <b class='tool-warn'>" + T.money(monthlyInterest) + "</b>。先停掉所有新增消費，把預算集中火力按上面順序清。</p>";
      } else {
        plan.innerHTML = "<p>目前沒有壞債 👍 好債（自住房貸）利率低，按原本進度繳就好。</p>";
      }
      box.appendChild(plan);
      box.querySelectorAll(".tool-del").forEach(function (b) {
        b.addEventListener("click", function () {
          debts.splice(parseInt(b.dataset.i, 10), 1);
          ctx.set("debts", debts);
          render();
        });
      });
    }
    render();
  };

  // ---- 6. 記帳 + 無感開銷分析 ----
  tools["6"] = function (box, ctx) {
    T.h(box, "🧾 記帳速記（抓無感開銷）");
    const desc = T.textInput(box, "買了什麼", "tk-desc", "例：手搖飲");
    const amt = T.numInput(box, "金額");
    const cat = T.select(box, "分類", "tk-cat", ["飲食", "飲料零食", "交通", "訂閱/娛樂", "購物", "人情", "其他"]);
    T.button(box, "＋ 記一筆", function () {
      const d = desc.value.trim() || "(未填)";
      const a = parseFloat(amt.value) || 0;
      if (a <= 0) return out.show("<p class='tool-warn'>請填金額。</p>");
      const logs = ctx.get("logs", []);
      logs.push({ d: d, a: a, c: cat.value, t: new Date().toISOString().slice(0, 10) });
      ctx.set("logs", logs);
      desc.value = ""; amt.value = "";
      render();
    });
    const delAll = T.button(box, "清空紀錄", function () {
      if (confirm("確定清空所有記帳紀錄？")) { ctx.del("logs"); render(); }
    }, true);
    const out = T.resultBox(box);
    function render() {
      const logs = ctx.get("logs", []);
      box.querySelectorAll(".tool-table-wrap, .tool-plan").forEach(function (n) { n.remove(); });
      if (!logs.length) { out.show("<p class='tool-tip'>還沒有紀錄 — 今天的飲料現在就記下去。記滿 30 筆以上再看分析。</p>"); return; }
      const total = logs.reduce(function (s, l) { return s + l.a; }, 0);
      // 分類彙整
      const byCat = {};
      logs.forEach(function (l) { byCat[l.c] = (byCat[l.c] || 0) + l.a; });
      const cats = Object.keys(byCat).sort(function (a, b) { return byCat[b] - byCat[a]; });
      const rows = cats.map(function (c) {
        return [T.esc(c), T.money(byCat[c]), Math.round(byCat[c] / total * 100) + "%",
          logs.filter(function (l) { return l.c === c; }).length + " 筆"];
      });
      T.table(box, ["分類", "金額", "佔比", "筆數"], rows);
      const plan = T.el("div", "tool-plan");
      const top3 = cats.slice(0, 3);
      plan.innerHTML = "<h5 class='tool-card-title'>🎯 前三名無感開銷（先對付這三個）</h5><ol class='tool-order-list'>" +
        top3.map(function (c, i) {
          return "<li><b>" + T.esc(c) + "</b>：" + T.money(byCat[c]) + "（" + logs.filter(function (l) { return l.c === c; }).length + " 筆）</li>";
        }).join("") + "</ol>" +
        "<p class='tool-tip'>對策：飲料→自帶；訂閱→每季審一次留 2 個；購物→放購物車隔 72 小時再決定。設一個「想買就記在這裡」的清單，衝動會自己蒸發。</p>";
      box.appendChild(plan);
      out.hide();
    }
    render();
  };

  (window.LEARN_TOOLS = window.LEARN_TOOLS || {})["money"] = tools;
})();
