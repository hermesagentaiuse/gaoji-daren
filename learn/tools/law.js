/* ============================================================
   法律與稅務 輔助工具（對應 config.js law 分類索引）
   0 扣項檢查清單 | 1 租約審查清單 | 2 借據產生器
   3 合約雷區掃描門 | 4 證據登記簿
   ⚠️ 全部內容僅為一般性提醒，非法律建議；重要事項請諮詢律師。
   ============================================================ */
(function () {
  const T = window.TOOLKIT;
  const tools = {};

  const LEGAL_NOTE = "<p class='tool-tip'>⚖️ 以上為一般性提醒，非法律建議；重要事項請諮詢律師，稅務金額請以財政部當年度公告為準。</p>";

  // 小方塊勾選列（工具箱沒有 checkbox helper，這裡自己做一個）
  function checkRow(container, label, id, checked) {
    const row = T.el("label", "tool-field tool-check-row");
    const cb = T.el("input");
    cb.type = "checkbox"; cb.id = id; cb.checked = !!checked;
    cb.style.marginRight = "8px";
    row.appendChild(cb);
    row.appendChild(T.el("span", "", T.esc(label)));
    container.appendChild(row);
    return cb;
  }

  // 金額轉國字大寫（借據用，防塗改）
  const CN_DIGITS = ["零", "壹", "貳", "參", "肆", "伍", "陸", "柒", "捌", "玖"];
  const CN_UNITS = ["", "拾", "佰", "仟"];
  const CN_GROUPS = ["", "萬", "億"];
  function cnMoney(n) {
    n = Math.round(n);
    if (n <= 0) return "零";
    if (!isFinite(n) || n >= 1e12) return "金額過大，請自行以國字大寫書寫";
    let groups = [];
    while (n > 0) { groups.push(n % 10000); n = Math.floor(n / 10000); }
    let out = "";
    for (let g = groups.length - 1; g >= 0; g--) {
      const seg = groups[g];
      if (seg === 0) continue;
      let segStr = "";
      let zero = false;
      for (let p = 3; p >= 0; p--) {
        const d = Math.floor(seg / Math.pow(10, p)) % 10;
        if (d === 0) { if (segStr) zero = true; continue; }
        if (zero) { segStr += "零"; zero = false; }
        segStr += CN_DIGITS[d] + CN_UNITS[p];
      }
      if (out && seg < 1000) out += "零";
      out += segStr + CN_GROUPS[g];
    }
    return out + "元整";
  }

  // ---- 0. 扣項檢查清單（報稅別漏勾）----
  tools["0"] = function (box, ctx) {
    T.h(box, "🧾 報稅扣項檢查清單");
    box.appendChild(T.el("p", "tool-tip", "以下金額皆為<b>例年金額，請以當年度財政部公告為準</b>。逐項勾過再送件，別把該扣的漏掉。"));

    const income = T.numInput(box, "全年綜合所得總額（例：800000）", "law-income");
    const children = T.numInput(box, "生育/托育相關胎數（每胎例 200,000）", "law-children", "0");
    const dependents = T.numInput(box, "受扶養親屬人數（每人例 70,000 免稅額）", "law-dep", "0");

    const cbStandard = checkRow(box, "適用標準扣除額（例 270,000，合併申報加倍）", "law-std", true);
    const cbSalary = checkRow(box, "薪資所得特別扣除額（例：每人上限 200,000）", "law-sal", true);

    box.appendChild(T.el("p", "tool-label", "五大類特別/特別扣除（未勾的先想清楚再送件）："));
    const cats = [
      { key: "c1", label: "儲蓄投資特別扣除（例：每人 270,000）— 有定存/保險單利息嗎？" },
      { key: "c2", label: "特別扣除：房屋租金（例：上限 120,000）或自用住宅貸款利息（例：上限 300,000）" },
      { key: "c3", label: "特別扣除：幼兒學前（例：每人 150,000）、學費（例：每人 25,000）" },
      { key: "c4", label: "特別扣除：身障（例：每人 80,000）、長期護理（例：每人 120,000）" },
      { key: "c5", label: "特別扣除：公益捐贈（例：上限綜合所得 20%）＋ 投資微型企業/創投扣除" },
    ];
    const cbs = {};
    cats.forEach(function (c) { cbs[c.key] = checkRow(box, c.label, "law-" + c.key); });

    T.button(box, "估算可扣總額", calc);
    T.button(box, "清空", function () {
      [income, children, dependents].forEach(function (i) { i.value = ""; });
      Object.keys(cbs).forEach(function (k) { cbs[k].checked = false; });
      cbStandard.checked = true; cbSalary.checked = true;
      out.hide();
    }, true);
    const out = T.resultBox(box);

    function calc() {
      const v = function (i) { return parseFloat(i.value) || 0; };
      let total = 0;
      const lines = [];
      if (cbStandard.checked) { total += 270000; lines.push(["標準扣除額（例）", 270000]); }
      if (cbSalary.checked) {
        const sal = Math.min(200000, v(income) * 0.4); // 例年上限概念，粗估
        total += sal; lines.push(["薪資特別扣除額（粗估，例上限 200,000）", sal]);
      }
      if (v(children) > 0) {
        const birth = v(children) * 200000;
        total += birth; lines.push(["生育每胎（例 200,000 × " + v(children) + "）", birth]);
      }
      if (v(dependents) > 0) {
        const dep = v(dependents) * 70000;
        total += dep; lines.push(["扶養親屬免稅額（例 70,000 × " + v(dependents) + "）", dep]);
      }
      const catNames = { c1: "儲蓄投資", c2: "房租/房貸利息", c3: "幼兒學前/學費", c4: "身障/長照", c5: "公益捐贈/創投" };
      const missed = [];
      Object.keys(cbs).forEach(function (k) {
        if (!cbs[k].checked) missed.push(catNames[k]);
      });

      let html = "";
      if (!lines.length) return out.show("<p class='tool-warn'>請至少勾一項扣除額再估算。</p>");
      html += "<table class='tool-table'><thead><tr><th>項目</th><th>估算金額</th></tr></thead><tbody>";
      lines.forEach(function (l) { html += "<tr><td>" + T.esc(l[0]) + "</td><td>" + T.money(l[1]) + "</td></tr>"; });
      html += "<tr><td><b>可扣總額（估算）</b></td><td><b class='tool-big'>" + T.money(total) + "</b></td></tr></tbody></table>";
      if (missed.length) {
        html += "<p class='tool-warn'>⚠️ 五大類扣項還沒勾：" + T.esc(missed.join("、")) + "。先回想去年有沒有這筆支出（定存利息單、租金收據/戶籍與租約、托幼收據、身障手冊、捐贈收據），有就補上。</p>";
      } else {
        html += "<p>👍 五大類扣項都確認過了。記得附證件：租金要「租約＋繳款證明＋戶籍過戶或連具戶口名簿」類資料，捐屬要收據。</p>";
      }
      html += LEGAL_NOTE;
      out.show(html);
      ctx.set("last", { income: v(income), children: v(children), dependents: v(dependents) });
    }
    const last = ctx.get("last");
    if (last) {
      income.value = last.income || "";
      children.value = last.children || "";
      dependents.value = last.dependents || "";
    }
  };

  // ---- 1. 租約審查清單 ----
  tools["1"] = function (box, ctx) {
    T.h(box, "🏠 租約審查清單（簽約前逐條核）");
    const ITEMS = [
      { k: "dep_amt", label: "押金金額寫明（例：2 個月租金以內，收據要拿）", ask: "押金新台幣＿＿元（約＿個月租金），於租期屆滿交還房屋並結清水電後無息返還。" },
      { k: "dep_back", label: "押金歸還條件與期限寫明（幾天內退、扣款基準）", ask: "出租人應於承租人返還房屋後＿日內返還押金，如有扣款須附具體明細與單據。" },
      { k: "repair", label: "修繕責任寫明（屋況自然損壞 vs 人為損壞誰負責）", ask: "房屋結構與設備之自然損壞由出租人負責修繕；承租人使用不當造成之損壞由承租人負責。" },
      { k: "early", label: "提前終止通知期寫明（提前多久、違約金怎麼算）", ask: "任何一方提前終止租約，應於＿個月前書面通知對方；未依約通知之一方應給付＿個月租金作為違約金。" },
      { k: "cap", label: "租金調幅上限寫明（續約時漲幅上限）", ask: "租期屆滿續約時，租金調整幅度不得超過原租金之＿％。" },
    ];
    const cbs = {};
    ITEMS.forEach(function (it) { cbs[it.k] = checkRow(box, it.label, "law-" + it.k, ctx.get("chk:" + it.k)); });

    T.button(box, "檢查：還缺哪幾條", check);
    T.button(box, "全部清空", function () {
      ITEMS.forEach(function (it) { cbs[it.k].checked = false; ctx.del("chk:" + it.k); });
      box.querySelectorAll(".tool-plan").forEach(function (n) { n.remove(); });
      out.hide();
    }, true);
    const out = T.resultBox(box);

    function check() {
      box.querySelectorAll(".tool-plan").forEach(function (n) { n.remove(); });
      ITEMS.forEach(function (it) { ctx.set("chk:" + it.k, cbs[it.k].checked); });
      const missing = ITEMS.filter(function (it) { return !cbs[it.k].checked; });
      let html = "";
      const done = ITEMS.length - missing.length;
      html += T.progress(Math.round(done / ITEMS.length * 100));
      if (!missing.length) {
        html += "<p>🎉 五條都確認過了，這份租約的基本盤齊了。簽名前再通讀一遍全文，口頭承諾一律要寫進條文。</p>";
        out.show(html + LEGAL_NOTE);
        return;
      }
      html += "<p class='tool-warn'>⚠️ 缺 " + missing.length + " 條 — 這些是「簽前要補的條款」，直接複製傳給房東：</p>";
      out.show(html + LEGAL_NOTE);
      const wrap = T.el("div", "tool-plan");
      wrap.appendChild(T.el("h5", "tool-card-title", "📋 簽前要補的條款（複製發給房東）"));
      const text = missing.map(function (it, i) {
        return "【應補條款 " + (i + 1) + "】" + it.label.replace(/（.*?）/g, "") + "\n建議條文：" + it.ask;
      }).join("\n\n");
      wrap.appendChild(T.el("p", "tool-tip", T.esc(text).replace(/\n/g, "<br>")));
      box.appendChild(wrap);
      T.copyBlock(wrap, "房東您好，看了租約後有幾個條款想請您補上：\n\n" + text + "\n\n麻煩了，謝謝。");
    }
  };

  // ---- 2. 借據產生器 ----
  tools["2"] = function (box, ctx) {
    T.h(box, "📜 借據產生器（借錢留白紙黑字）");
    const borrower = T.textInput(box, "借款人姓名", "law-b", "例：王小明");
    const idno = T.textInput(box, "借款人身分證號（建議寫，防同名）", "law-id", "例：A123456789");
    const lender = T.textInput(box, "出借人姓名", "law-l", "例：李小華");
    const amount = T.numInput(box, "借款金額（新台幣）", "law-amt", "例：100000");
    const borrowDate = T.textInput(box, "借款日期（例：2026-10-11）", "law-bd", "");
    const dueDate = T.textInput(box, "約定還款日期（例：2027-04-11）", "law-dd", "");
    const rate = T.numInput(box, "年利率 %（可不填＝無息）", "law-r", "留空＝無息");

    T.button(box, "產生借據", gen);
    const out = T.resultBox(box);

    function gen() {
      const b = borrower.value.trim();
      const l = lender.value.trim();
      const amt = parseFloat(amount.value) || 0;
      const bd = borrowDate.value.trim();
      const dd = dueDate.value.trim();
      if (!b || !l || amt <= 0 || !bd || !dd) {
        return out.show("<p class='tool-warn'>借款人、出借人、金額、借款日、還款日都要填。</p>");
      }
      const r = parseFloat(rate.value);
      const hasRate = isFinite(r) && r > 0;
      let warn = "";
      if (hasRate && r > 20) warn = "<p class='tool-warn'>⚠️ 年利率超過 20%：依民法，超過部分無效；超過 25% 可能涉犯加重利率處罰規定。請調低。</p>";

      const lines = [];
      lines.push("　　　　　　　　　　借　　據");
      lines.push("");
      lines.push("立借據人 " + b + "（身分證號：" + (idno.value.trim() || "＿＿＿＿＿＿＿＿＿") + "，以下稱借款人）");
      lines.push("茲因需要，向 " + l + "（以下稱出借人）借用現金新台幣 " + T.money(amt) +
        "（大寫：" + cnMoney(amt) + "），借款人已當面點收足額無誤。");
      lines.push("");
      lines.push("一、借款日期：民國＿年＿月＿日（填單時請換算：" + bd + "）。");
      lines.push("二、還款日期：借款人應於 " + dd + " 前一次全額清償。");
      if (hasRate) {
        lines.push("三、利息：按年利率 " + r + "％ 計付，與本金一併於還款日給付。");
      } else {
        lines.push("三、本借款為無息借款。");
      }
      lines.push("四、借款人如遲延清償，出借人得就未清償部分按法定利率請求遲延利息，並由借款人負擔催討必要費用。");
      lines.push("五、本借據一式兩份，出借人與借款人各執一份為憑。");
      lines.push("");
      lines.push("借款人（簽名並按指紋）：____________________　（設籍地址：____________________）");
      lines.push("");
      lines.push("中　介　人（無則免）：____________________");
      lines.push("");
      lines.push("中華民國　　年　　月　　日");
      const text = lines.join("\n");

      let html = "<p>✅ 借據草稿完成。印出後請借款人<b>親筆簽名並按指紋</b>，雙方各執一份；轉帳借錢的話，轉帳紀錄一併存檔（對上本借據金額與日期）。</p>";
      html += warn;
      html += LEGAL_NOTE;
      out.show(html);
      T.copyBlock(box, text);
      ctx.set("last", { b: b, idno: idno.value, l: l, amt: amt, bd: bd, dd: dd, rate: rate.value });
    }
    const last = ctx.get("last");
    if (last) {
      borrower.value = last.b || ""; idno.value = last.idno || ""; lender.value = last.l || "";
      amount.value = last.amt || ""; borrowDate.value = last.bd || ""; dueDate.value = last.dd || "";
      rate.value = last.rate || "";
    }
  };

  // ---- 3. 合約雷區掃描門 ----
  tools["3"] = function (box, ctx) {
    T.h(box, "🚨 合約雷區掃描門（貼片段，掃五大雷）");
    const ta = T.el("textarea", "tool-input");
    ta.id = "law-contract";
    ta.rows = 8;
    ta.placeholder = "把合約條文貼在這裡（一次一段也行），按掃描…";
    ta.style.width = "100%";
    box.appendChild(ta);

    const RULES = [
      {
        name: "違約金條款",
        kws: ["違約金", "罰鍰", "罰款", "賠償", "損害金", "懲罰性"],
        qs: [
          "違約金金額或算法寫得很明確嗎？還是「由甲方認定」這種模糊說法？",
          "違約金是否明顯高於可能損失？過高可請求法院酌減，但最好簽約前就談低。",
          "雙方違約的責任對等嗎？還是只有你要賠？",
        ],
      },
      {
        name: "自動續約",
        kws: ["自動續約", "自動更新", "視為續約", "另以書面", "未於", "終止之意思表示"],
        qs: [
          "自動續約前要通知幾天？通知窗口（例：期滿前 30 天）有寫清楚嗎？",
          "續約後的租金/費用會不會調漲？調漲有上限嗎？",
          "設個鬧鐘：在通知窗口截止前 7 天提醒自己決定要不要續。",
        ],
      },
      {
        name: "管轄法院",
        kws: ["管轄法院", "管辖", "訴訟", "法院"],
        qs: [
          "約定的法院離你家遠嗎？跑一趟北部法院對住南部的你就是變相罰款。",
          "原則上可要求改為「被告住地法院」或雙方都方便的法院。",
        ],
      },
      {
        name: "單方終止權",
        kws: ["終止", "解約", "得單方", "無須通知", "逕行", "停止提供"],
        qs: [
          "誰有權單方終止？只有對方有、你沒有＝單邊條款，要求對等。",
          "對方終止前要不要提前通知？幾天前？有沒有補償？",
          "「逕行停止服務/供貨」這種詞，代表可以不打招呼就斷線，要加上事先書面通知。",
        ],
      },
      {
        name: "保密義務",
        kws: ["保密", "秘密", "機密", "不得洩漏", "個人資料"],
        qs: [
          "保密範圍定義清楚嗎？「一切相關資訊」這種無邊界寫法要限縮。",
          "保密義務在合約結束後存續幾年？永久＝不合理，談一個年限。",
          "違反保密的賠償有上限嗎？無上限的保密條款風險極高。",
        ],
      },
    ];

    T.button(box, "掃描雷區", scan);
    T.button(box, "清空", function () { ta.value = ""; out.hide(); }, true);
    const out = T.resultBox(box);

    function scan() {
      const text = ta.value || "";
      ctx.set("draft", text);
      if (!text.trim()) return out.show("<p class='tool-warn'>請先貼上合約片段。</p>");
      const found = [];
      const missed = [];
      RULES.forEach(function (r) {
        const hit = r.kws.some(function (k) { return text.indexOf(k) !== -1; });
        (hit ? found : missed).push(r);
      });
      let html = "";
      if (!found.length) {
        html += "<p>沒掃到五大雷的關鍵字 — 但「沒掃到」不等於「沒有」：條款可能換了說法。貼更完整的全文再掃一次。</p>";
      } else {
        html += "<p>掃到 <b>" + found.length + "</b> 類條款，每一條都先問這幾個問題：</p>";
      }
      out.show(html + LEGAL_NOTE);
      box.querySelectorAll(".tool-plan").forEach(function (n) { n.remove(); });
      found.forEach(function (r) {
        const card = T.el("div", "tool-plan");
        card.innerHTML = "<h5 class='tool-card-title'>⚠️ " + T.esc(r.name) + "（掃到相關字眼）</h5><ul class='tool-checklist'>" +
          r.qs.map(function (q) { return "<li>❓ " + T.esc(q) + "</li>"; }).join("") + "</ul>";
        box.appendChild(card);
      });
      if (missed.length && found.length) {
        const note = T.el("p", "tool-tip", "未掃到：" + T.esc(missed.map(function (r) { return r.name; }).join("、")) + "。合約若很長，分段貼進來掃完整份。");
        box.appendChild(note);
      }
    }
    const draft = ctx.get("draft");
    if (draft) ta.value = draft;
  };

  // ---- 4. 證據登記簿 ----
  tools["4"] = function (box, ctx) {
    T.h(box, "🗂️ 證據登記簿（借錢/糾紛前先存證）");
    const event = T.textInput(box, "事件（例：借王小明 10 萬）", "law-ev", "");
    const date = T.textInput(box, "事件日期（例：2026-10-11）", "law-ed", "");
    const type = T.select(box, "證據類型", "law-et", [
      { value: "letter", label: "存證信函" },
      { value: "note", label: "借據" },
      { value: "line", label: "LINE 截圖" },
      { value: "bank", label: "轉帳紀錄" },
      { value: "audio", label: "錄音" },
    ]);

    const ADVICE = {
      letter: { label: "存證信函", need: "最強的催告證據。若尚未發，建議用郵局存證信函向對方確認債務金額與還款期限，存根聯與回執都要留。" },
      note: { label: "借據", need: "白紙黑字最硬。檢查有沒有：金額、日期、簽名按指紋、一式兩份各執一份。" },
      line: { label: "LINE 截圖", need: "截圖容易遭質疑真偽：建議補一份存證信函讓對方確認金額；並保留原始帳號對話（勿刪除聊天記錄），截圖要含時間與對方頭像名稱。" },
      bank: { label: "轉帳紀錄", need: "只證明「有轉錢」，不證明「是借錢」。建議補借據或請對方在 LINE 回一句「錢收到，○月還」對照金額與日期。" },
      audio: { label: "錄音", need: "自己參與的對話錄音，一般可作為證據，但證明力看內容完整性。建議補書面：存證信函確認金額；錄音檔原始檔案勿剪輯、另存備份。" },
    };

    T.button(box, "＋ 登記一筆", function () {
      const ev = event.value.trim();
      if (!ev) return out.show("<p class='tool-warn'>請填事件。</p>");
      const list = ctx.get("evidence", []);
      list.push({ ev: ev, d: date.value.trim(), t: type.value });
      ctx.set("evidence", list);
      event.value = ""; date.value = "";
      render();
    });
    T.button(box, "清空登記簿", function () {
      if (confirm("確定清空所有證據登記？")) { ctx.del("evidence"); render(); }
    }, true);
    const out = T.resultBox(box);

    function render() {
      const list = ctx.get("evidence", []);
      box.querySelectorAll(".tool-table-wrap, .tool-plan").forEach(function (n) { n.remove(); });
      if (!list.length) {
        out.show("<p class='tool-tip'>還沒有登記。鐵律：借錢出去「之前」就要有借據或至少一句寫著金額與還款日的 LINE；出了事才找證據，通常來不及。</p>");
        return;
      }
      const rows = list.map(function (e, i) {
        return [T.esc(e.ev), T.esc(e.d || "—"), T.esc((ADVICE[e.t] || { label: "其他" }).label),
          "<button class='tool-del' data-i='" + i + "'>✕</button>"];
      });
      T.table(box, ["事件", "日期", "證據", ""], rows);
      const plan = T.el("div", "tool-plan");
      plan.innerHTML = "<h5 class='tool-card-title'>🔍 每筆還缺什麼</h5>";
      list.forEach(function (e, i) {
        const a = ADVICE[e.t] || { label: "其他", need: "請確認此證據能獨立證明金額與當事人，建議補書面紀錄。" };
        const item = T.el("p", "", "<b>" + (i + 1) + ". " + T.esc(e.ev) + "</b>（" + T.esc(a.label) + "）：" + T.esc(a.need));
        plan.appendChild(item);
      });
      box.appendChild(plan);
      out.hide();
      box.querySelectorAll(".tool-del").forEach(function (b) {
        b.addEventListener("click", function () {
          const l = ctx.get("evidence", []);
          l.splice(parseInt(b.dataset.i, 10), 1);
          ctx.set("evidence", l);
          render();
        });
      });
    }
    render();
  };

  (window.LEARN_TOOLS = window.LEARN_TOOLS || {})["law"] = tools;
})();
