/* ============================================================
   職場與專業 輔助工具（對應 config.js work 分類索引）
   0 回報結構產生器 | 1 Email 三段檢查機 | 2 會議紀錄模板機
   3 一技之長定位器 | 4 加薪準備度檢查表 | 5 離職交接清單產生器
   ============================================================ */
(function () {
  const T = window.TOOLKIT;
  const tools = {};

  // ---- 0. 回報結構產生器 ----
  tools["0"] = function (box, ctx) {
    T.h(box, "🗣 回報結構產生器（結論 → 三理由 → 行動請求）");
    const who = T.select(box, "回報對象", "tk-who", ["主管", "客戶/廠商", "團隊平行部門", "跨級（主管的主管）"]);
    const concl = T.textInput(box, "結論（一句話，先講結果/建議）", "tk-c", "例：建議續用 A 供應商");
    const r1 = T.textInput(box, "理由一");
    const r2 = T.textInput(box, "理由二");
    const r3 = T.textInput(box, "理由三（選填）");
    const ask = T.textInput(box, "需要對方做什麼", "tk-a", "例：請在本周五前核准預算");
    T.button(box, "生成回報稿", function () {
      const c = concl.value.trim(), a = ask.value.trim();
      const reasons = [r1, r2, r3].map(function (i) { return i.value.trim(); }).filter(Boolean);
      if (!c) return out.show("<p class='tool-warn'>結論必填 — 這是整段回報的地基。</p>");
      if (!reasons.length) return out.show("<p class='tool-warn'>至少給一個理由。</p>");
      const whoMap = { "主管": "報告", "客戶/廠商": "貴方好，關於", "團隊平行部門": "各位", "跨級（主管的主管）": "報告" };
      let text = "【結論】" + c + "\n\n【理由】\n";
      reasons.forEach(function (r, i) { text += (i + 1) + ". " + r + "\n"; });
      text += "\n【需要您協助】" + (a || "（未填：想清楚你要對方做什麼再寄）");
      if (whoMap[who.value]) text = whoMap[who.value] + "：\n\n" + text;
      T.copyBlock(box, text);
      out.show("<p class='tool-tip'>口頭版口訣：30 秒講完結論＋第一個理由，對方問再展開。先講結果的人，會被當成做事有章法的人。</p>");
    });
    const out = T.resultBox(box);
  };

  // ---- 1. Email 三段檢查機 ----
  tools["1"] = function (box, ctx) {
    T.h(box, "✉️ Email 寄前檢查機");
    const subj = T.textInput(box, "主旨（含動詞＋期限＋專案名）", "tk-s", "例：【請核准】Q4 網域名稱續費（10/20 前）");
    const body = T.el("textarea", "tool-input");
    body.rows = 6; body.placeholder = "貼上內文...";
    const wrap = T.el("div", "tool-field");
    wrap.appendChild(T.el("label", "tool-label", "內文"));
    wrap.appendChild(body); box.appendChild(wrap);
    const attach = T.select(box, "有掛附件嗎？", "tk-att", ["沒有", "有 — 已確認附件存在且可開", "有 — 但還沒掛"]);
    T.button(box, "寄前檢查", function () {
      const s = subj.value.trim(), b = body.value.trim();
      const checks = [];
      checks.push(["主旨有動詞（請核准/請確認/請回覆）", /[請請]|確認|核准|回覆|簽核/.test(s)]);
      checks.push(["主旨含期限或日期", /\d{1,2}[\/月]\d{1,2}|今天|明天|本週|下周|月底前/.test(s)]);
      checks.push(["主旨長度適中（6-40 字）", s.length >= 6 && s.length <= 40]);
      checks.push(["內文不太長（建議 120-600 字）", b.length >= 20 && b.length <= 900]);
      checks.push(["內文有明確的「請您…」請求", /請您|請再|麻煩|煩請|請協助|請於/.test(b)]);
      checks.push(["附件狀態正確", attach.value.indexOf("有 — 但還沒") === -1]);
      let html = "<ul class='tool-checklist'>";
      checks.forEach(function (c) { html += "<li>" + (c[1] ? "✅" : "⚠️") + " " + T.esc(c[0]) + "</li>"; });
      html += "</ul>";
      const fails = checks.filter(function (c) { return !c[1]; }).length;
      html += fails === 0 ? "<p>🎯 全數通過，可以按發送了。</p>"
        : "<p class='tool-warn'>還有 " + fails + " 項沒過 — 先修再寄。一封主旨清楚的信，省掉的是之後十幾則訊息往來。</p>";
      out.show(html);
    });
    const out = T.resultBox(box);
  };

  // ---- 2. 會議紀錄模板機 ----
  tools["2"] = function (box, ctx) {
    T.h(box, "📝 會議紀錄模板機");
    const title = T.textInput(box, "會議名稱", "tk-t", "例：Q4 行銷專案第二次工作會議");
    const people = T.textInput(box, "與會者（逗號分隔）", "tk-p", "王經理、小李、我");
    const agenda = T.textInput(box, "決議事項（一行一件）", "tk-ag", "例：改採 B 方案");
    const act1 = T.textInput(box, "行動項目一", "tk-a1", "例：送出修訂報價單");
    const who1 = T.textInput(box, "負責人", "tk-w1", "小李");
    const due1 = T.textInput(box, "期限", "tk-d1", "10/18（五）");
    const act2 = T.textInput(box, "行動項目二（選填）");
    const who2 = T.textInput(box, "負責人", "tk-w2");
    const due2 = T.textInput(box, "期限", "tk-d2");
    T.button(box, "產生會議紀錄", function () {
      const t = title.value.trim() || "(未命名會議)";
      const acts = [];
      if (act1.value.trim()) acts.push([act1.value.trim(), who1.value.trim() || "待定", due1.value.trim() || "待定"]);
      if (act2.value.trim()) acts.push([act2.value.trim(), who2.value.trim() || "待定", due2.value.trim() || "待定"]);
      let text = "【會議紀錄】" + t + "\n日期：今天　與會：" + (people.value.trim() || "(未填)") + "\n\n■ 決議：\n";
      text += (agenda.value.trim() ? "・" + agenda.value.trim().replace(/\n/g, "\n・") : "・（無）") + "\n\n■ 行動項目：\n";
      if (acts.length) {
        acts.forEach(function (a, i) { text += (i + 1) + ". " + a[0] + "｜負責：" + a[1] + "｜期限：" + a[2] + "\n"; });
      } else {
        text += "（無行動項目 — 那這個會議需要開嗎？）\n";
      }
      text += "\n下次會議：（待定）";
      T.copyBlock(box, text);
      if (!acts.length) out.show("<p class='tool-warn'>沒有行動項目的會議，大概率是白開。每一場會議至少帶出一件「誰、做什麼、何時前」。</p>");
      else out.show("<p class='tool-tip'>會後 2 小時內發出 — 超過當天記憶就失真了。copy 到 Email/群組即可。</p>");
    });
    const out = T.resultBox(box);
  };

  // ---- 3. 一技之長定位器 ----
  tools["3"] = function (box, ctx) {
    T.h(box, "🎯 一技之長定位器");
    const skill = T.textInput(box, "別人最常找你處理什麼問題？", "tk-sk", "例：Excel 樞紐分析、簡報排版、客戶客訴");
    const proof = T.textInput(box, "最能證明實力的一件成果（含數字）", "tk-pr", "例：把月報從 6 小時壓到 40 分鐘");
    const freq = T.select(box, "過去一個月被找了幾次？", "tk-fq", ["4 次以上 — 已是部門標籤", "2-3 次 — 有雏形", "0-1 次 — 還需要養"]);
    T.button(box, "產生我的定位句", function () {
      const s = skill.value.trim(), p = proof.value.trim();
      if (!s) return out.show("<p class='tool-warn'>先想清楚：別人遇到什麼問題會第一個想到你？這題答不出來，代表定位還沒形成。</p>");
      let text = "「我是團隊裡負責【" + s + "】的人」";
      if (p) text += "，代表作：" + p + "。";
      T.copyBlock(box, text);
      let advice = "";
      if (freq.value.indexOf("0-1") === 0) {
        advice = "還需要養：主動把這技能輸出成模板/教學檔丟部門群組，讓更多人知道你有這把刀。";
      } else if (freq.value.indexOf("2-3") === 0) {
        advice = "再推一把：把解決流程寫成一頁 SOP 貼在共筆，下次別人不用問你也能找到你 — 標籤就固化了。";
      } else {
        advice = "已是部門標籤 ✅ 下一步：往公司外擴（內部分享會、產業社群），把部門標籤升級成產業標籤，那才是議價本錢。";
      }
      out.show("<p>" + advice + "</p><p class='tool-tip'>检验標準很簡單：主管想到這個問題，第一個名單是不是你。</p>");
    });
    const out = T.resultBox(box);
  };

  // ---- 4. 加薪準備度檢查表 ----
  tools["4"] = function (box, ctx) {
    T.h(box, "💰 加薪準備度檢查表");
    const items = [
      "我寫得出 3 件「用數據講的」貢獻（省下多少/賺了多少/提速多少）",
      "我查過市場行情（104/求職平台同職缺薪資區間）",
      "我距上次調薪/晉升已 ≥ 6 個月",
      "我手上正扛著「超出原職務說明」的職責",
      "我想好了若被拒絕的下一步（多久後再談/要什麼條件）",
      "我避開了公司壞消息期（虧損、裁員風聲）",
      "我約的是正式面談時段，不是走廊攔人",
    ];
    const boxes = [];
    const wrap = T.el("div", "tool-checklist");
    items.forEach(function (t) {
      const lab = T.el("label");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      lab.appendChild(cb); lab.appendChild(T.el("span", null, "　" + T.esc(t)));
      wrap.appendChild(lab); boxes.push(cb);
    });
    box.appendChild(wrap);
    const targetRole = T.textInput(box, "（選填）想談的對象與場合", "tk-r", "例：10/20 季評前先約 30 分鐘");
    T.button(box, "評估準備度", function () {
      const done = boxes.filter(function (b) { return b.checked; }).length;
      const pct = Math.round(done / boxes.length * 100);
      let html = "<p>準備度：<b class='tool-big'>" + pct + "%</b>（" + done + "/" + boxes.length + "）</p>" + T.progress(pct);
      if (pct >= 86) html += "<p>🎯 可以約談了。開場句：「想跟您討論我的職責與薪酬匹配 — 過去半年我做了 A（省 X 萬）、B（提速 Y%），查了市場行情落在 Z 區間，希望調整到⋯」用貢獻和行情開場，絕口不談房貸和通貨膨脹。</p>";
      else if (pct >= 57) html += "<p>⏳ 還差口氣：先把沒勾的補齊（最常被漏的是「數據化貢獻」和「市場行情」— 這兩樣沒準備就去談，等於空手上場）。</p>";
      else html += "<p class='tool-warn'>🛑 還不到開口的時候。現在去談只会拿到「再等等」。先花兩週把貢獻數據和行情資料做成一頁紙，再約時間。</p>";
      if (targetRole.value.trim()) html += "<p class='tool-tip'>場合：" + T.esc(targetRole.value.trim()) + "（記在行事曆，附一頁紙）</p>";
      out.show(html);
    });
    const out = T.resultBox(box);
  };

  // ---- 5. 離職交接清單產生器 ----
  tools["5"] = function (box, ctx) {
    T.h(box, "🤝 離職交接清單產生器（走得漂亮，路才走得寬）");
    const role = T.textInput(box, "你的職位", "tk-role", "例：後端工程師");
    const projects = T.textInput(box, "手上項目（一行一個）", "tk-proj", "訂單系統 v2\n每日排程報表\n客戶 A API 串接");
    const days = T.numInput(box, "剩餘工作日", "tk-days", "14");
    T.button(box, "產生交接計畫", function () {
      const pj = projects.value.trim() ? projects.value.trim().split(/\n+/) : ["(尚未填寫項目)"];
      const d = parseInt(days.value, 10) || 14;
      const per = Math.max(1, Math.floor(d / Math.max(1, pj.length)));
      let text = "【交接計畫】" + (role.value.trim() || "（職位未填）") + "｜剩餘 " + d + " 個工作日\n\n";
      pj.forEach(function (p, i) {
        text += "■ 項目 " + (i + 1) + "：" + p + "\n";
        text += "　□ 文件：運作原理/常見問題/聯絡窗口（陌生人可接手等級）\n";
        text += "　□ 帳號權限：交接清單與移交時間\n";
        text += "　□ 進行中事項與下一步（含死線）\n";
        text += "　□ 帶接手人跑一次實際操作\n";
        text += "　（排第 " + ((i * per) + 1) + "–" + ((i + 1) * per) + " 天）\n\n";
      });
      text += "□ 全部完成後：發交接總結信給主管＋接手人，_cc_ 関係人\n□ 離職前最後一週保留手機暢通 30 天（情份就在這裡）";
      T.copyBlock(box, text);
      out.show("<p class='tool-tip'>檢驗標準：接手的人不用打電話問你，就能上工。交接文件寫得好，前主管會變成你的人脈；寫得爛，業界就那麼大。</p>");
    });
    const out = T.resultBox(box);
  };

  (window.LEARN_TOOLS = window.LEARN_TOOLS || {})["work"] = tools;
})();
