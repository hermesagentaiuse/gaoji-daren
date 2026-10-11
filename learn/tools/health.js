/* ============================================================
   健康與體態 輔助工具（對應 config.js health 分類索引）
   0 健檢倒數器 | 1 運動 312 追蹤器 | 2 睡眠錨定器
   3 洗牙排程器 | 4 合身穿搭量尺表
   醫療相關內容僅為一般性資訊，不構成診斷或處方建議，實際請詢醫師。
   ============================================================ */
(function () {
  const T = window.TOOLKIT;
  const tools = {};

  // ---- 日期小工具（一律用本地日期字串 YYYY-MM-DD）----
  function parseD(s) {
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    const d = new Date(s + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  }
  function iso(d) {
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }
  function today() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
  function addMonths(d, n) {
    const r = new Date(d);
    const day = r.getDate();
    r.setMonth(r.getMonth() + n);
    if (r.getDate() < day) r.setDate(0); // 月底修正（例：1/31 +1月 → 2/28）
    return r;
  }
  function diffDays(a, b) { return Math.round((a - b) / 86400000); }
  // 本週起始日（週一）
  function weekStart(d) {
    const r = new Date(d); r.setHours(0, 0, 0, 0);
    const wd = (r.getDay() + 6) % 7; // 0=週一
    return addDays(r, -wd);
  }
  function cnDate(d) { return d.getFullYear() + " 年 " + (d.getMonth() + 1) + " 月 " + d.getDate() + " 日"; }
  function fmtWanD(d) { return cnDate(d) + "（" + "週日一二三四五六".charAt(d.getDay()) + "）"; }

  // 日期輸入（toolkit 沒有，補一支，風格對齊 numInput）
  function dateInput(container, label, id, placeholder) {
    const row = T.el("div", "tool-field");
    row.appendChild(T.el("label", "tool-label", T.esc(label)));
    const inp = T.el("input", "tool-input");
    inp.type = "date"; inp.id = id; if (placeholder) inp.placeholder = placeholder;
    row.appendChild(inp); container.appendChild(row);
    return inp;
  }
  // 時間輸入
  function timeInput(container, label, id) {
    const row = T.el("div", "tool-field");
    row.appendChild(T.el("label", "tool-label", T.esc(label)));
    const inp = T.el("input", "tool-input");
    inp.type = "time"; inp.id = id;
    row.appendChild(inp); container.appendChild(row);
    return inp;
  }
  const MED_NOTE = "<p class='tool-tip'>⚠️ 清單為保守的一般性資訊，非醫療建議。依國民健康署成人健康檢查建議，實際請詢醫師。</p>";

  // ---- 0. 健檢倒數器 ----
  tools["0"] = function (box, ctx) {
    T.h(box, "🩺 健檢倒數器");
    const lastInp = dateInput(box, "上次健檢日期", "tk-last");
    const genderSel = T.select(box, "性別", "tk-sex", [
      { value: "f", label: "女性" },
      { value: "m", label: "男性" },
    ]);
    const ageSel = T.select(box, "年齡層", "tk-age", [
      { value: "18", label: "18–29 歲" },
      { value: "30", label: "30–39 歲" },
      { value: "40", label: "40–49 歲" },
      { value: "50", label: "50–64 歲" },
      { value: "65", label: "65 歲以上" },
    ]);
    T.button(box, "建立我的健檢清單", render);
    T.button(box, "清空紀錄", function () {
      if (confirm("確定清空健檢紀錄與勾選？")) { ctx.del("checkup"); ctx.del("checks"); render(); }
    }, true);
    const out = T.resultBox(box);

    // 保守描述：僅列一般宣導項目，不建議自費加項
    const BASE = [
      ["blood", "血液檢查（血常规）"],
      ["sugar", "血糖"],
      ["lipid", "血中脂（膽固醇）"],
      ["liver", "肝腎功能（GOT／GPT、肌酸酐）"],
      ["urine", "尿液檢查"],
      ["xray", "胸部 X 光"],
    ];
    function dynItems(sex, age) {
      const a = parseInt(age, 10);
      const list = [];
      if (sex === "f" && a >= 30) list.push(["pap", "子宮頸抹片（一般建議每 2 年，資格以健保署公告為準）"]);
      if (sex === "f" && a >= 40) list.push(["mammo", "乳房 X 光攝影（一般建議每 2 年）"]);
      if (a >= 45) list.push(["ob", "糞便潛血檢查（一般建議每年，年齡資格以健保署公告為準）"]);
      if (sex === "m" && a >= 50) list.push(["psa", "攝護腺癌篩檢 PSA（自費項目，是否加做請與醫師討論）"]);
      list.push(["hba1c", "糖化血色素 HbA1c（有糖尿病／高血壓家族史者可請醫師評估加開）"]);
      list.push(["us", "腹部超音波（有脂肪肝疑慮者可請醫師評估）"]);
      return list;
    }
    function render() {
      const st = ctx.get("checkup") || {};
      const checks = ctx.get("checks") || {};
      box.querySelectorAll(".tk-dyn").forEach(function (n) { n.remove(); });
      const last = parseD(lastInp.value || (st.last || ""));
      if (!last) { out.show("<p class='tool-warn'>請先選擇上次健檢日期。</p>"); return; }
      const next = addMonths(last, 12);
      const days = diffDays(next, today());
      const wrap = T.el("div", "tool-plan tk-dyn");
      let html = "<p>上次健檢：" + cnDate(last) + "　→　下次建議日期：<b class='tool-big'>" + cnDate(next) + "</b></p>";
      if (days > 0) {
        html += "<p>倒數 <b>" + days + " 天</b>。建議提前 1–2 個月預約，並固定排在生日所在月份較容易養成習慣。</p>";
        html += T.progress(Math.max(0, Math.min(100, Math.round((365 - days) / 365 * 100))));
      } else if (days === 0) {
        html += "<p class='tool-warn'>🔔 今天就是建議日 — 現在就打電話預約！</p>";
      } else {
        html += "<p class='tool-warn'>🔴 已逾期 <b>" + Math.abs(days) + " 天</b>！健檢的價值在跨年趨勢，逾期越久趨勢斷得越兇。</p>";
      }
      wrap.innerHTML = html;
      box.appendChild(wrap);
      // 勾選清單
      const gender = genderSel.value, age = ageSel.value;
      const sec = T.el("div", "tool-plan tk-dyn");
      let cl = "<h5 class='tool-card-title'>📋 建議檢查項目勾選表（" + (gender === "f" ? "女性" : "男性") + "・" + ageSel.options[ageSel.selectedIndex].text + "）</h5>";
      cl += "<ul class='tool-checklist'>";
      BASE.concat(dynItems(gender, age)).forEach(function (it) {
        const on = checks[it[0]] ? "checked" : "";
        cl += "<li><label><input type='checkbox' class='tk-chk' data-k='" + it[0] + "' " + on + "> " +
          T.esc(it[1]) + "</label></li>";
      });
      cl += "</ul>" + MED_NOTE +
        "<p class='tool-tip'>💡 檢查前一晚 8–12 小時禁食（可少量開水）；每年報告存檔，比較趨勢而不只是單年數字。</p>";
      sec.innerHTML = cl;
      box.appendChild(sec);
      box.querySelectorAll(".tk-chk").forEach(function (cb) {
        cb.addEventListener("change", function () {
          const c2 = ctx.get("checks") || {};
          c2[cb.dataset.k] = cb.checked;
          ctx.set("checks", c2);
        });
      });
      ctx.set("checkup", { last: lastInp.value, sex: gender, age: age });
      out.hide();
    }
    const st = ctx.get("checkup");
    if (st) {
      if (st.last) lastInp.value = st.last;
      if (st.sex) genderSel.value = st.sex;
      if (st.age) ageSel.value = st.age;
      if (st.last) render();
    }
  };

  // ---- 1. 運動 312 追蹤器 ----
  tools["1"] = function (box, ctx) {
    T.h(box, "🏃 運動 312 追蹤器（每週 150 分鐘有氧＋2 次力量）");
    const dInp = dateInput(box, "日期", "tk-ed", "");
    dInp.value = iso(today());
    const typeSel = T.select(box, "有氧類型", "tk-et", [
      { value: "walk", label: "走路（快走）" },
      { value: "run", label: "慢跑" },
      { value: "swim", label: "游泳" },
      { value: "bike", label: "騎車" },
    ]);
    const minInp = T.numInput(box, "分鐘數", "tk-em", "30");
    T.button(box, "＋ 記一次有氧", function () {
      const m = parseInt(minInp.value, 10) || 0;
      if (m <= 0) return out.show("<p class='tool-warn'>請填分鐘數。</p>");
      const ex = ctx.get("ex", []);
      ex.push({ d: dInp.value || iso(today()), k: typeSel.value, m: m });
      ctx.set("ex", ex);
      minInp.value = "";
      out.hide(); render();
    });
    T.button(box, "＋ 記一次力量訓練", function () {
      const st = ctx.get("st", []);
      st.push({ d: dInp.value || iso(today()) });
      ctx.set("st", st);
      render();
    });
    T.button(box, "清空紀錄", function () {
      if (confirm("確定清空所有運動紀錄？")) { ctx.del("ex"); ctx.del("st"); render(); }
    }, true);
    const out = T.resultBox(box);
    const typeName = { walk: "走路", run: "慢跑", swim: "游泳", bike: "騎車" };
    function weeksAgg() {
      const ex = ctx.get("ex", []), st = ctx.get("st", []);
      const map = {}; // weekKey -> {min, st}
      function key(d) { const p = parseD(d); return p ? iso(weekStart(p)) : null; }
      ex.forEach(function (e) {
        const k = key(e.d); if (!k) return;
        map[k] = map[k] || { min: 0, st: 0 };
        map[k].min += e.m || 0;
      });
      st.forEach(function (s) {
        const k = key(s.d); if (!k) return;
        map[k] = map[k] || { min: 0, st: 0 };
        map[k].st += 1;
      });
      return map;
    }
    function pass(w) { return w && w.min >= 150 && w.st >= 2; }
    function render() {
      box.querySelectorAll(".tk-dyn").forEach(function (n) { n.remove(); });
      const map = weeksAgg();
      const now0 = weekStart(today());
      const thisKey = iso(now0);
      const cur = map[thisKey] || { min: 0, st: 0 };
      const wrap = T.el("div", "tool-plan tk-dyn");
      let html = "<h5 class='tool-card-title'>📅 本週進度（" + fmtWanD(now0) + " 起）</h5>";
      html += "<p>有氧：" + cur.min + " / 150 分鐘</p>" + T.progress(Math.min(100, Math.round(cur.min / 150 * 100)));
      html += "<p>力量訓練：" + cur.st + " / 2 次（隔開非連續日，覆蓋腿、背、胸與核心）</p>" + T.progress(Math.min(100, Math.round(cur.st / 2 * 100)));
      // 連續達標週數：本週已達標則含本週，否則從上週往回數
      let streak = 0;
      let d = pass(map[thisKey]) ? now0 : addDays(now0, -7);
      while (true) {
        const w = map[iso(d)];
        if (pass(w)) { streak += 1; d = addDays(d, -7); } else break;
        if (streak > 260) break; // 防呆
      }
      var lack = "";
      if (cur.min < 150) lack += "有氧 " + (150 - cur.min) + " 分鐘 ";
      if (cur.st < 2) lack += "力量 " + (2 - cur.st) + " 次";
      html += "<p>🔥 連續達標週數：<b class='tool-big'>" + streak + " 週</b>" +
        (cur.min >= 150 && cur.st >= 2 ? "（本週已達標！）" : "　本週還差：" + lack + "）") + "</p>";
      html += "<p class='tool-tip'>💡 10 分鐘 × 3 段同樣計入每週 150 分鐘，碎片化不是藉口；簡易強度判斷：還能講話、不能唱歌。</p>";
      wrap.innerHTML = html;
      box.appendChild(wrap);
      // 上週與歷史
      const keys = Object.keys(map).sort().reverse();
      if (keys.length) {
        const rows = keys.slice(0, 8).map(function (k) {
          const w = map[k];
          const tag = pass(w) ? "<span class='tool-good'>✅ 達標</span>"
            : (w.min >= 150 || w.st >= 2 ? "<span class='tool-warn'>🟡 部分</span>" : "❌ 未達標");
          return [k + " 週起", w.min + " 分鐘", w.st + " 次", tag];
        });
        const hist = T.el("div", "tk-dyn");
        box.appendChild(hist);
        T.table(hist, ["週", "有氧", "力量", "判定"], rows);
        const lastWeek = iso(addDays(now0, -7));
        const lw = map[lastWeek];
        const hint = T.el("div", "tool-plan tk-dyn");
        hint.innerHTML = "<p class='tool-tip'>上週（" + lastWeek + " 週起）：" +
          (lw ? "有氧 " + lw.min + " 分鐘、力量 " + lw.st + " 次 — " + (pass(lw) ? "達標 👍" : "未達標，本週補上。") : "沒有紀錄 — 從今天開始記。") +
          "</p>";
        box.appendChild(hint);
      }
      // 明細（最近 10 筆）
      const ex = ctx.get("ex", []), stn = ctx.get("st", []);
      const all = ex.map(function (e) { return { d: e.d, txt: "有氧・" + (typeName[e.k] || e.k) + " " + e.m + " 分鐘" }; })
        .concat(stn.map(function (s) { return { d: s.d, txt: "力量訓練" }; }))
        .sort(function (a, b) { return a.d < b.d ? 1 : -1; });
      if (all.length) {
        const det = T.el("div", "tk-dyn");
        box.appendChild(det);
        T.table(det, ["日期", "項目"], all.slice(0, 10).map(function (r) { return [T.esc(r.d), T.esc(r.txt)]; }));
      }
    }
    render();
  };

  // ---- 2. 睡眠錨定器 ----
  tools["2"] = function (box, ctx) {
    T.h(box, "😴 睡眠錨定器（固定時段比補覺重要）");
    const bedInp = timeInput(box, "固定上床時間", "tk-bed");
    const riseInp = timeInput(box, "固定起床時間", "tk-rise");
    T.button(box, "保存我的睡眠錨點", function () {
      if (!bedInp.value || !riseInp.value) return out.show("<p class='tool-warn'>請設定上床與起床時間。</p>");
      ctx.set("anchor", { bed: bedInp.value, rise: riseInp.value });
      out.hide(); render();
    });
    const out = T.resultBox(box);
    function duration(bed, rise) {
      const toMin = function (s) { const p = s.split(":"); return (+p[0]) * 60 + (+p[1] || 0); };
      let d = toMin(rise) - toMin(bed);
      if (d < 0) d += 1440; // 跨午夜
      return d;
    }
    function render() {
      box.querySelectorAll(".tk-dyn").forEach(function (n) { n.remove(); });
      const a = ctx.get("anchor");
      const checks = ctx.get("checks", {});
      if (!a) { out.show("<p class='tool-tip'>先設定固定上床／起床時間 — 目標是「比補覺重要的是固定時段」，起床時間含週末誤差最好不超過 1 小時。</p>"); return; }
      out.hide();
      bedInp.value = a.bed; riseInp.value = a.rise;
      const dur = duration(a.bed, a.rise);
      const wrap = T.el("div", "tool-plan tk-dyn");
      let html = "<p>錨點：上床 <b>" + T.esc(a.bed) + "</b>　起床 <b>" + T.esc(a.rise) + "</b>　≈ 在床 " +
        Math.floor(dur / 60) + " 小時 " + (dur % 60) + " 分" +
        (dur < 420 ? " <span class='tool-warn'>（不足 7 小時）</span>" : " ✅") + "</p>";
      // 近 7 天打卡（文字方格热力图）
      html += "<h5 class='tool-card-title'>🗓️ 近 7 天打卡（按時上床＋按時起床才算完成）</h5>";
      let grid = "<div class='tk-grid'>";
      for (let i = 6; i >= 0; i--) {
        const d = iso(addDays(today(), -i));
        const on = !!checks[d];
        grid += "<button class='tool-btn tk-cell" + (on ? " tk-cell-on" : "") + "' data-d='" + d + "' title='" + d + "'>" +
          (d.slice(5)) + "<br>" + (on ? "✅" : "⬜") + "</button>";
      }
      grid += "</div>";
      html += grid;
      // 連續天數 streak：今天沒勾則從昨天往回數
      let streak = 0, sd = today();
      if (!checks[iso(sd)]) sd = addDays(sd, -1);
      while (checks[iso(sd)]) { streak += 1; sd = addDays(sd, -1); if (streak > 1000) break; }
      html += "<p>🔥 連續按時天數：<b class='tool-big'>" + streak + " 天</b></p>";
      html += "<p class='tool-tip'>💡 比補覺重要的是固定時段：先定死起床時間（含週末誤差 ≤1 小時），再往前推約 7.5 小時設就寢時間。起床後 15–30 分鐘曬太陽幫生理時鐘校時。</p>";
      html += "<p class='tool-warn'>若連續三個月以上嚴重打鼾、睡眠中憋醒、白天嗜睡，請到醫院睡眠中心或家醫科就診，不要自行長期服用安眠藥。</p>";
      wrap.innerHTML = html;
      box.appendChild(wrap);
      box.querySelectorAll(".tk-cell").forEach(function (b) {
        b.addEventListener("click", function () {
          const c = ctx.get("checks", {});
          const d = b.dataset.d;
          if (c[d]) delete c[d]; else c[d] = 1;
          ctx.set("checks", c);
          render();
        });
      });
    }
    render();
  };

  // ---- 3. 洗牙排程器 ----
  tools["3"] = function (box, ctx) {
    T.h(box, "🦷 洗牙排程器（每半年一次）");
    const lastInp = dateInput(box, "上次洗牙日期", "tk-dlast");
    const noteInp = T.textInput(box, "牙齒備註（醫師建議）", "tk-dnote", "例：左下第二大臼齒易堆牙結石");
    T.button(box, "保存排程", function () {
      const last = parseD(lastInp.value);
      if (!last) return out.show("<p class='tool-warn'>請選擇上次洗牙日期。</p>");
      ctx.set("dental", { last: lastInp.value, note: noteInp.value.trim() });
      out.hide(); render();
    });
    T.button(box, "清空紀錄", function () {
      if (confirm("確定清空洗牙紀錄？")) { ctx.del("dental"); render(); }
    }, true);
    const out = T.resultBox(box);
    function render() {
      box.querySelectorAll(".tk-dyn").forEach(function (n) { n.remove(); });
      const rec = ctx.get("dental");
      if (!rec) { out.show("<p class='tool-tip'>填入上次洗牙日期即可自動排程。健保給付每半年一次齲齒與牙周相關洗牙（成年人部分負擔、65 歲以上免部分負擔），費用與給付資格請以健保署公告與診所報價為準。</p>"); return; }
      out.hide();
      lastInp.value = rec.last; noteInp.value = rec.note || "";
      const last = parseD(rec.last);
      const next = addMonths(last, 6);
      const days = diffDays(next, today());
      const wrap = T.el("div", "tool-plan tk-dyn");
      let html = "<p>上次洗牙：" + cnDate(last) + "　→　下次提醒：<b class='tool-big'>" + cnDate(next) + "</b></p>";
      if (days > 14) {
        html += "<p>還有 <b>" + days + " 天</b>到期。建議提前 1–2 週約診，固定同一家診所，病歷連續醫師才看得出變化。</p>";
        html += T.progress(Math.max(0, Math.min(100, Math.round((182 - days) / 182 * 100))));
      } else if (days >= 0) {
        html += "<p class='tool-warn'>🟡 即將到期（剩 " + days + " 天）— 這週就打約診電話。</p>";
      } else {
        html += "<p class='tool-warn' style='color:#c0392b;font-weight:bold'>🔴 已逾期 " + Math.abs(days) + " 天！牙周病是沉默疾病，等到痛通常齒槽骨已流失、逆不回來。現在就約。</p>";
      }
      if (rec.note) html += "<p>📝 醫師備註：" + T.esc(rec.note) + "</p>";
      html += "<p class='tool-tip'>💡 日常三件套：三餐後刷牙（含睡前）、每天至少一次牙線（牙線棒比牙線容易養成）、含氟牙膏。出現咬東西會痛、刷牙流血、持續口氣、對冷熱敏感 — 立即約診，不等半年週期。</p>";
      html += "<p class='tool-warn'>洗牙與後續治療費用（補牙、植牙、假牙等）依診所報價為準；健保給付資格以健保署公告為準。</p>";
      wrap.innerHTML = html;
      box.appendChild(wrap);
    }
    render();
  };

  // ---- 4. 合身穿搭量尺表 ----
  tools["4"] = function (box, ctx) {
    T.h(box, "📏 合身穿搭量尺表（以數字為準，不看標籤 S／M／L）");
    const shoulder = T.numInput(box, "肩寬（cm，後頸骨點至肩峰×2）", "tk-sh", "例：44");
    const chest = T.numInput(box, "胸圍（cm，經乳點水平一圈）", "tk-ch", "例：98");
    const waist = T.numInput(box, "腰圍（cm，肚臍水平一圈）", "tk-wa", "例：84");
    const sleeve = T.numInput(box, "袖長（cm，肩峰經手肘至腕骨）", "tk-sl", "例：61");
    const pants = T.numInput(box, "褲長／內長（cm，胯下至腳踝）", "tk-pl", "例：80");
    const typeSel = T.select(box, "想買的衣服類型", "tk-gt", [
      { value: "shirt", label: "襯衫" },
      { value: "blazer", label: "西裝外套" },
      { value: "trousers", label: "西裝褲" },
    ]);
    T.button(box, "判斷我的尺寸", function () {
      const meas = {
        sh: parseFloat(shoulder.value) || 0,
        ch: parseFloat(chest.value) || 0,
        wa: parseFloat(waist.value) || 0,
        sl: parseFloat(sleeve.value) || 0,
        pl: parseFloat(pants.value) || 0,
      };
      if (meas.ch <= 0 || meas.wa <= 0) return out.show("<p class='tool-warn'>至少填寫胸圍與腰圍（軟尺貼身但不勒，照常呼吸測量）。</p>");
      ctx.set("measure", meas);
      judge(meas, typeSel.value);
    });
    T.button(box, "清除我的尺寸", function () { ctx.del("measure"); out.hide(); }, true);
    const out = T.resultBox(box);

    function sizeByGarmentChest(c) {
      if (c < 96) return "XS";
      if (c < 104) return "S";
      if (c < 112) return "M";
      if (c < 120) return "L";
      if (c < 128) return "XL";
      return "XXL 以上";
    }
    function judge(m, type) {
      let html = "";
      const tips = {
        shirt: {
          ease: [10, 15],
          name: "襯衫",
          rules: [
            "合身襯衫的預留量：成衣胸圍約為「淨胸圍 + 10〜15 cm」（太鬆像帳篷、太緊繃扣子）。",
            "肩線應正好落在肩骨邊緣：肩線掉到手臂上＝太大，勒進肩峰＝太小。",
            "袖長：手自然下垂時袖口落在腕骨、繫最上一顆扣子後不滑過手背。",
            "衣長：塞進褲子後抬手不脫出；不塞則蓋過皮帶約一半。",
          ],
        },
        blazer: {
          ease: [8, 12],
          name: "西裝外套",
          rules: [
            "西裝外套預留量較襯衫小：成衣胸圍約為「淨胸圍 + 8〜12 cm」，因為它有結構與墊肩。",
            "肩寬是西裝外套的命：肩線超出你自己的肩峰 1 cm 以內；肩線不合幾乎無法修改，寧可不買。",
            "扣上最上一顆（或兩顆）扣子後，胸口能放進一拳為合。",
            "袖長：襯衫袖口露出西裝袖約 1〜1.5 cm。",
          ],
        },
        trousers: {
          ease: [2, 4],
          name: "西裝褲",
          rules: [
            "西裝褲腰頭預留：成衣腰圍約為「淨腰圍 + 2〜4 cm」，係皮帶後不滑落、能放進一两指。",
            "褲長：坐下時不整段吊起；鞋前緣約 0.5〜1 cm 的微折（no break〜half break）最乾淨。",
            "臀圍與大腿圍比腰圍更容易被忽略：蹲下緊繃＝已太小。",
            "腰圍是台灣男性最容易失守的數字：國民健康署定義男性腰圍 90 cm、女性 80 cm 以上即屬異常，納入年度自查。",
          ],
        },
      };
      const t = tips[type];
      html += "<h5 class='tool-card-title'>👔 " + t.name + " 尺寸判斷</h5>";
      if (type === "trousers") {
        const gc = m.wa + t.ease[0], gc2 = m.wa + t.ease[1];
        html += "<p>淨腰圍 " + m.wa + " cm ＋預留 " + t.ease[0] + "〜" + t.ease[1] + " cm → 腰頭約 <b>" + gc + "〜" + gc2 + " cm</b>（約對應 <b>" +
          (gc < 76 ? "S" : gc < 84 ? "M" : gc < 92 ? "L" : gc < 100 ? "XL" : "XXL") + "</b>；各品牌版型差異大，以試穿為準）</p>";
        if (m.pl > 0) html += "<p>內長 " + m.pl + " cm：成衣褲長請挑「內長 " + (m.pl - 1) + "〜" + (m.pl + 2) + " cm」或買長版送修改 — 改褲長是最便宜、效果最大的修改。</p>";
        if (m.wa >= 90) html += "<p class='tool-warn'>⚠️ 腰圍已達國民健康署異常門檻（男性 90／女性 80 cm 以上），買大號解決不了代謝問題，建議納入年度健檢項目並詢問醫師。</p>";
      } else {
        const gc = m.ch + t.ease[0], gc2 = m.ch + t.ease[1];
        html += "<p>淨胸圍 " + m.ch + " cm ＋預留 " + t.ease[0] + "〜" + t.ease[1] + " cm → 成衣胸圍約 <b>" + gc + "〜" + gc2 + " cm</b> → 建議選 <b class='tool-big'>" +
          sizeByGarmentChest((gc + gc2) / 2) + "</b>（例：胸圍 98＋10〜15＝108〜113 → M；各品牌版型差異大，以試穿為準）</p>";
        if (type === "blazer" && m.sh > 0) {
          html += "<p>肩寬 " + m.sh + " cm：西裝外套肩線落在你肩峰外 1 cm 以內最合；超出 2 cm 以上通常表示這件太大，肩線修改成本高，不建議買。</p>";
        }
        if (m.sl > 0) {
          html += "<p>袖長 " + m.sl + " cm：" + (type === "blazer"
            ? "外套袖長以露出襯衫袖口 1〜1.5 cm 為準（外套袖長可改）。"
            : "袖口應落在腕骨；過長可改袖口、過短無解，寧可買長一點去改。") + "</p>";
        }
      }
      html += "<ul class='tool-checklist'>" + t.rules.map(function (r) { return "<li>🔍 " + T.esc(r) + "</li>"; }).join("") + "</ul>";
      html += "<p class='tool-tip'>💡 常見不合身穿法：買小一號「當減肥動力」（天天受苦、自信被消耗）；肩線塌到手臂還硬穿；褲長堆積在鞋面像褲腳吃貨；商標很大但布料起毛，三公尺外就露怯。找一位可信賴的修改店：袖長、褲長、腰身改好，外觀就勝過一半的訂製。</p>";
      html += "<p class='tool-tip'>💡 建議每 6 個月複測一次數字並記錄；以數字為準買衣服，不看標籤的 S／M／L。</p>";
      out.show(html);
      T.copyBlock(out.node, t.name + "：淨胸圍 " + m.ch + "、腰圍 " + m.wa + "、肩寬 " + m.sh + "、袖長 " + m.sl + "、內長 " + m.pl + "（cm）— 記下數字，買衣服帶手機打開對照。");
    }
    const m = ctx.get("measure");
    if (m) {
      shoulder.value = m.sh || ""; chest.value = m.ch || ""; waist.value = m.wa || "";
      sleeve.value = m.sl || ""; pants.value = m.pl || "";
    }
  };

  (window.LEARN_TOOLS = window.LEARN_TOOLS || {})["health"] = tools;
})();
