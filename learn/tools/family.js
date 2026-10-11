/* ============================================================
   家庭與親密關係 輔助工具（對應 config.js family 分類索引）
   0 孝親費協議表 | 1 家庭財務會準備器 | 2 冷靜 24 小時
   3 父母檔案盤點器 | 4 家庭儀式感打卡
   ============================================================ */
(function () {
  const T = window.TOOLKIT;
  const tools = {};

  // ---- 0. 孝親費協議表 ----
  tools["0"] = function (box, ctx) {
    T.h(box, "🤝 孝親費協議表（跟手足一起算清楚）");
    const nSib = T.numInput(box, "兄弟姐妹人數（含你自己）", "tk-n", "例：3");
    const per = T.numInput(box, "每人每月擬出金額", "tk-per", "例：5000");
    const need = T.numInput(box, "父母每月需求（同住開銷＋醫療＋日常）", "tk-need", "例：15000");
    T.button(box, "產生分攤方案", calc);
    T.button(box, "清空", function () {
      [nSib, per, need].forEach(function (i) { i.value = ""; });
      ctx.del("p");
      out.hide();
      box.querySelectorAll(".tool-plan, .tool-table-wrap").forEach(function (n) { n.remove(); });
    }, true);
    const out = T.resultBox(box);

    function calc() {
      const n = Math.max(1, Math.round(parseFloat(nSib.value) || 0));
      const p = parseFloat(per.value) || 0;
      const d = parseFloat(need.value) || 0;
      if (p <= 0 || d <= 0) return out.show("<p class='tool-warn'>請先填每人擬出金額與父母每月需求。</p>");
      ctx.set("p", { n: n, p: p, d: d });
      const total = n * p;
      const diff = total - d;

      let html = "<p>人手 " + T.money(p) + " × " + n + " 人 = 每月共 <b class='tool-big'>" + T.money(total) + "</b>　父母需求：" + T.money(d) + "</p>";
      if (diff >= 0) {
        html += "<p>💰 每月多 " + T.money(diff) + "：建議存成「父母緊急基金」，專戶滾存，看病、看護、突發狀況都從這裡出。</p>";
      } else {
        const gap = Math.ceil((-diff) / n / 100) * 100;
        html += "<p class='tool-warn'>⚠️ 每月缺 " + T.money(-diff) + "：每人加到 <b>" + T.money(p + gap) + "</b> 才夠，或先與父母確認哪些開銷可以精簡。</p>";
      }
      out.show(html);

      // 分攤明細表
      const rows = [];
      for (let i = 1; i <= n; i++) {
        rows.push(["手足 " + i, T.money(p), "每月 " + (5) + " 日前匯款", "備註「孝親 " + "月份」"]);
      }
      rows.push(["<b>合計</b>", "<b>" + T.money(total) + "</b>", "對照需求 " + T.money(d), diff >= 0 ? "✅ 達標" : "⚠️ 不足"]);
      box.querySelectorAll(".tool-plan, .tool-table-wrap").forEach(function (x) { x.remove(); });
      T.table(box, ["成員", "每月出資", "給法", "紀錄"], rows);

      const plan = T.el("div", "tool-plan");
      plan.innerHTML = "<h5 class='tool-card-title'>💡 給法建議（談錢不傷感情的三個開銷紀律）</h5><ul class='tool-checklist'>" +
        "<li>📅 <b>固定日匯款</b>：訂死每月 5 日前自動轉出，不要「等有空再說」— 固定日期就不用每次開口。</li>" +
        "<li>🧾 <b>留紀錄</b>：轉帳備註統一寫「孝親＋月份」，收據收好。不是不信任誰，是幫所有人免於翻舊帳。</li>" +
        "<li>🔍 <b>與手足公開對帳</b>：每季最後一個週日開一次共享帳目（通訊軟體開群檔就好），數字擺在桌面上，猜忌就沒有生存空間。</li>" +
        "</ul>" +
        "<p class='tool-tip'>先跟父母對一次真實需求，再把手足找齊一起看這張表。錢的事早談、明談，比最後一次爆好。</p>";
      box.appendChild(plan);

      // 群組公告文字
      const now = new Date();
      const ym = now.getFullYear() + "/" + String(now.getMonth() + 1).padStart(2, "0");
      const announce = "【孝親費安排 " + ym + " 起】\n" +
        "從這月起，我們 " + n + " 位每人每月 " + T.money(p) + "，在每月 5 日前匯到爸媽帳戶（備註「孝親＋月份」）。\n" +
        "每月共 " + T.money(total) + "，對應爸媽每月開銷約 " + T.money(d) + "。\n" +
        "每季最後一個週日，我們把轉帳紀錄到共享群組對帳一次，公開透明。\n" +
        "多出來的部分存成爸媽緊急基金；不夠或有多，我們下次對帳時再一起調整。\n" +
        "有任何困難或想法，直接說，我們慢慢調整 🙏";
      T.copyBlock(box, announce);
    }

    const last = ctx.get("p");
    if (last) { nSib.value = last.n; per.value = last.p; need.value = last.d; }
  };

  // ---- 1. 家庭財務會準備器 ----
  tools["1"] = function (box, ctx) {
    T.h(box, "📋 家庭財務會準備器（30 分鐘開完一場會）");
    const c1 = T.textInput(box, "本月開支變化 1", "tk-c1", "例：外食變多，比上個月多 3000");
    const c2 = T.textInput(box, "本月開支變化 2", "tk-c2", "例：小孩才藝班續費");
    const c3 = T.textInput(box, "本月開支變化 3", "tk-c3", "例：汽車保養");
    const savePct = T.numInput(box, "本月儲蓄達成率 %", "tk-sp", "例：70");
    const bigNext = T.textInput(box, "下月大額支出（結婚/紅包/稅…）", "tk-big", "例：表弟結婚紅包 6000 + 房屋稅");
    T.button(box, "產生會議議程單", gen);
    T.button(box, "清空", function () {
      [c1, c2, c3, savePct, bigNext].forEach(function (i) { i.value = ""; });
      ctx.del("prep"); out.hide();
    }, true);
    const out = T.resultBox(box);

    function gen() {
      const items = [c1, c2, c3].map(function (i) { return i.value.trim(); }).filter(Boolean);
      const sp = parseFloat(savePct.value);
      const big = bigNext.value.trim();
      if (!items.length && !(sp > 0) && !big) return out.show("<p class='tool-warn'>至少填一項：開支變化、儲蓄達成率或下月大額支出。</p>");
      ctx.set("prep", { items: items, sp: sp, big: big });

      const spLine = (sp > 0)
        ? (sp >= 100 ? "達成（目標 " + Math.round(sp) + "%）🎉 記得互相誇一句"
          : "達成率 " + Math.round(sp) + "% — 不指責，一起看卡在哪")
        : "（未填，會中現場說）";
      const agenda =
        "【家庭財務會 · 30 分鐘議程】" + "\n" +
        "時間建議：平常的週日晚上，手機收起來，飯後茶時間最鬆。\n" +
        "\n" +
        "① 0–3 分　開場：每人講一件這個月家裡值得感謝的小事（先暖場再談錢）\n" +
        "② 3–10 分　本月三大開支變化：\n" +
        (items.length ? items.map(function (x, i) { return "　　" + (i + 1) + ". " + x; }).join("\n") : "　　（會中一起回憶）") + "\n" +
        "③ 10–15 分　儲蓄達成率：" + spLine + "\n" +
        "④ 15–22 分　下月大額支出與因應：\n" +
        "　　" + (big || "（會中一起盤：紅包、稅、保險費、旅遊）") + "\n" +
        "　　→ 決定：從哪個帳戶出？要不要這月开始預作準備？\n" +
        "⑤ 22–27 分　下月一起調一件事：只挑一件好做的（例如外食減一餐、設一個共同目標）\n" +
        "⑥ 27–30 分　固定結尾：每人講一句「下月我最擔心的一件事」\n" +
        "　　規則：只聽、不評價、不保證「沒關係」— 讓擔心被聽見，就是這場會最大的收獲。\n" +
        "\n" +
        "（會後把結論記在共享備忘錄，下個月從上一場的結論接續。）";
      out.show("<p>✅ 議程單好了。會前 5 分鐘自己過一遍，會中照順序走，30 分鐘剛剛好。</p>");
      T.copyBlock(box, agenda);
    }

    const last = ctx.get("prep");
    if (last) {
      if (last.items) [c1, c2, c3].forEach(function (i, k) { if (last.items[k]) i.value = last.items[k]; });
      if (last.sp) savePct.value = last.sp;
      if (last.big) bigNext.value = last.big;
    }
  };

  // ---- 2. 冷靜 24 小時 ----
  tools["2"] = function (box, ctx) {
    T.h(box, "🧊 冷靜 24 小時（氣頭上寫的話，先封存一天）");
    const intro = T.el("p", "tool-tip", "想發的那條訊息，先寫在這裡。它不會發出去 — 24 小時後你回來看，大多數時候你會慶幸自己沒發。");
    box.appendChild(intro);
    const stage = T.el("div", "tool-plan");
    box.appendChild(stage);

    const sealed = ctx.get("sealed");

    function fmtTime(ts) {
      const d = new Date(ts);
      return d.getFullYear() + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" +
        String(d.getDate()).padStart(2, "0") + " " + String(d.getHours()).padStart(2, "0") + ":" +
        String(d.getMinutes()).padStart(2, "0");
    }

    function renderSealedView(s) {
      const now = Date.now();
      const elapsed = now - s.ts;
      const DAY = 24 * 3600 * 1000;
      if (s.answered) {
        stage.innerHTML = "<h5 class='tool-card-title'>✅ 你已經回看過這條訊息</h5>" +
          "<p>封存於 " + fmtTime(s.ts) + "，你在 " + fmtTime(s.answered.at) + " 選了：<b>" + T.esc(s.answered.choice) + "</b></p>" +
          "<pre class='tool-copy-pre'>" + T.esc(s.text) + "</pre>" +
          "<p class='tool-tip'>" + (s.answered.choice === "還是想發"
            ? "既然想清楚了要發，發之前把最尖的那句刪掉 — 留下事實和感受，去掉殺傷力，事情會解決得更快。"
            : "這就是 24 小時的力量 🌱 那句話留在這裡就好，你可以安心開始新的一天了。") + "</p>";
        T.button(stage, "開始新一輪封存", function () { ctx.del("sealed"); renderIdle(); }, true);
        return;
      }
      if (elapsed < DAY) {
        const leftMs = DAY - elapsed;
        const h = Math.floor(leftMs / 3600000), m = Math.floor(leftMs % 3600000 / 60000);
        stage.innerHTML = "<h5 class='tool-card-title'>🔒 已封存，剩 " + h + " 小時 " + m + " 分</h5>" +
          "<p class='tool-tip'>寫過就交給時間。這 24 小時去散個步、找朋友吃個飯 — 訊息不在你腦子裡，情緒才會退潮。</p>";
        return;
      }
      // 超過 24 小時 → 回看
      stage.innerHTML = "<h5 class='tool-card-title'>⏰ 24 小時到了 — 回看一眼當天的你</h5>" +
        "<p>封存於 " + fmtTime(s.ts) + "：</p>" +
        "<pre class='tool-copy-pre'>" + T.esc(s.text) + "</pre>" +
        "<p><b>你現在還想發嗎？</b>（誠實勾一個，記錄下來，這比發出去更有價值）</p>";
      const row = T.el("div", "tool-field");
      ["還是想發", "慶幸沒發"].forEach(function (opt) {
        const b = T.el("button", "tool-btn", opt);
        b.type = "button";
        b.style.marginRight = "8px";
        b.addEventListener("click", function () {
          s.answered = { choice: opt, at: Date.now() };
          ctx.set("sealed", s);
          renderSealedView(s);
        });
        row.appendChild(b);
      });
      stage.appendChild(row);
    }

    function renderIdle() {
      stage.innerHTML = "<p>還沒開始。如果那股火正在燒，按下下面的按鈕 — 先呼吸 6 秒，再決定。</p>";
      T.button(stage, "😤 我在氣頭上", startBreath);
    }

    function startBreath() {
      stage.innerHTML = "";
      const big = T.el("div", "tool-timer-display", "吸氣 — 6");
      stage.appendChild(big);
      let left = 6;
      const iv = setInterval(function () {
        left -= 1;
        if (left > 0) {
          big.textContent = (left > 3 ? "吸氣 — " : "呼氣 — ") + left;
        } else {
          clearInterval(iv);
          big.textContent = "🌬 好，氧氣到了大腦，我們慢慢說。";
          renderDraft();
        }
      }, 1000);
    }

    function renderDraft() {
      stage.innerHTML = "";
      stage.appendChild(T.el("p", "tool-tip", "寫在下面的每個字都不會發出去。想到什麼寫什麼，罵人也行 — 寫完封存，交給 24 小時。"));
      const ta = T.el("textarea", "tool-input");
      ta.style.minHeight = "140px";
      ta.placeholder = "把想說的話全部倒在這裡…";
      ta.value = ctx.get("draft", "");
      ta.addEventListener("input", function () { ctx.set("draft", ta.value); });
      stage.appendChild(ta);
      T.button(stage, "🔒 封存這條訊息", function () {
        const txt = ta.value.trim();
        if (!txt) { ta.focus(); return; }
        ctx.set("sealed", { text: txt, ts: Date.now(), answered: null });
        ctx.del("draft");
        renderSealedView(ctx.get("sealed"));
      });
    }

    if (sealed && sealed.text) renderSealedView(sealed);
    else renderIdle();
  };

  // ---- 3. 父母檔案盤點器 ----
  tools["3"] = function (box, ctx) {
    T.h(box, "🗂 父母檔案盤點器（趁還來得及，把重要的事問清楚）");
    box.appendChild(T.el("p", "tool-tip", "不是身後事，是平時就該備好的「家庭資料庫」。每項打勾＋寫下答案，缺的會變紅 — 那些紅字就是你下次回家的話題。"));

    const ITEMS = [
      { k: "checkup", label: "健檢最後日期", ph: "例：2026/03（下次該約幾時？）" },
      { k: "insurance", label: "保險單存放位置", ph: "例：書房第二抽屜＋信箱電子保單" },
      { k: "banks", label: "銀行戶頭清單", ph: "例：台新、郵銀各一；哪些有網路銀行" },
      { k: "docs", label: "重要文件位置", ph: "例：權狀、存摺、印鑑在客廳鐵盒" },
      { k: "contacts", label: "緊急聯絡人", ph: "例：邻居阿嬤、表哥、居家護理師電話" },
    ];
    let data = ctx.get("files", {});
    const fields = {};

    ITEMS.forEach(function (it) {
      const row = T.el("div", "tool-field");
      const lbl = T.el("label", "tool-label", it.label);
      const chk = T.el("input");
      chk.type = "checkbox";
      chk.checked = !!(data[it.k] && data[it.k].done);
      chk.style.marginRight = "6px";
      const inp = T.el("input", "tool-input");
      inp.type = "text";
      inp.placeholder = it.ph;
      inp.value = (data[it.k] && data[it.k].v) || "";
      inp.style.width = "70%";
      function save() {
        data[it.k] = { done: chk.checked, v: inp.value.trim() };
        ctx.set("files", data);
        paint();
      }
      chk.addEventListener("change", save);
      inp.addEventListener("input", function () {
        data[it.k] = { done: chk.checked, v: inp.value.trim() };
        ctx.set("files", data);
      });
      lbl.insertBefore(chk, lbl.firstChild);
      row.appendChild(lbl);
      row.appendChild(inp);
      box.appendChild(row);
      fields[it.k] = { chk: chk, inp: inp, row: row, label: it.label };
    });

    const out = T.resultBox(box);

    function paint() {
      const doneCount = ITEMS.filter(function (it) { return data[it.k] && data[it.k].done; }).length;
      const pct = Math.round(doneCount / ITEMS.length * 100);
      out.show(T.progress(pct) + "<p>" + (doneCount === ITEMS.length
        ? "🎉 全部備齊 — 這個家被你照顧得很周到。"
        : "完成 " + doneCount + "/" + ITEMS.length + "。<b>紅色的那一項，就是下次回家最該開口問的一件事。</b>") + "</p>");
      ITEMS.forEach(function (it) {
        const f = fields[it.k];
        const done = data[it.k] && data[it.k].done;
        f.row.style.opacity = "1";
        if (!done) {
          f.inp.style.borderColor = "#c0392b";
          f.row.style.background = "rgba(192,57,43,0.08)";
          f.inp.placeholder = "❗ 待補 — " + it.ph;
        } else {
          f.inp.style.borderColor = "";
          f.row.style.background = "";
        }
      });
      // 台詞（放在最後一個 field 之後）
      box.querySelectorAll(".tool-plan").forEach(function (n) { n.remove(); });
      const plan = T.el("div", "tool-plan");
      plan.innerHTML = "<h5 class='tool-card-title'>🗣 開啟對話的三句話（挑一句，下次吃飯時自然地說）</h5>";
      box.appendChild(plan);
      const lines =
        "① 「媽，我最近在看理財的課，學到每家都該有份『家庭檔案』— 幫個忙，我們一起把你們的保險單和戶頭整理一下好不好？我想知道該放在哪。」\n" +
        "② 「爸，我同學的爸爸前陣子住院，結果全家找不到存摺和印鑑，折騰好久 — 你們的文件都收在哪裡？我幫你們拍個記錄存起來。」\n" +
        "③ 「我這週想幫你們約健檢 — 你們上次檢查是什麼時候？我記得幫我留意一下最近有沒有哪裡不舒服，一起去問醫生。」\n" +
        "（要訣：把「問身後事」翻譯成「幫個忙／幫你們整理」，爸媽才接得住。）";
      T.copyBlock(plan, lines);
    }
    paint();
  };

  // ---- 4. 家庭儀式感打卡 ----
  tools["4"] = function (box, ctx) {
    T.h(box, "🍚 家庭儀式感打卡（一週一餐，不動手機）");
    box.appendChild(T.el("p", "tool-tip", "規矩只有一條：這餐手機全部收起來（拍照也不行）。做滿一週勾一次，連續下去你會看到一條鏈。"));

    function weekKey(d) {
      // ISO 週：以週一為週首
      const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      const day = t.getUTCDay() || 7;
      t.setUTCDate(t.getUTCDate() + 4 - day);
      const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
      const wk = Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
      return t.getUTCFullYear() + "-W" + String(wk).padStart(2, "0");
    }
    function weekLabel(key) { return key.replace("-W", " 第") + " 週"; }

    let marks = ctx.get("meal", {}); // { "2026-W41": true }
    const thisWk = weekKey(new Date());
    const doneThisWeek = !!marks[thisWk];
    const rowWrap = T.el("div", "tool-field");
    const chk = T.el("input");
    chk.type = "checkbox";
    chk.checked = doneThisWeek;
    chk.style.marginRight = "6px";
    const chkLabel = T.el("label", "tool-label", "本週（" + weekLabel(thisWk) + "）完成「不動手機共進一餐」");
    chkLabel.style.display = "inline";
    chkLabel.insertBefore(chk, chkLabel.firstChild);
    rowWrap.appendChild(chkLabel);
    box.appendChild(rowWrap);
    chk.addEventListener("change", function () {
      if (chk.checked) marks[thisWk] = true; else delete marks[thisWk];
      ctx.set("meal", marks);
      renderBoard();
    });

    const board = T.el("div", "tool-plan");
    box.appendChild(board);

    function recentWeeks(count) {
      // 產生最近 count 週的週次 key（含本週）
      const list = [];
      const base = new Date();
      for (let i = 0; i < count; i++) {
        const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() - i * 7);
        const k = weekKey(d);
        if (list.indexOf(k) === -1) list.push(k);
        if (list.length >= count) break;
      }
      return list.slice(0, count);
    }

    function renderBoard() {
      // 連續週數 streak（從本週或上週往回數）
      let streak = 0;
      const base = new Date();
      let cursor = new Date(base.getFullYear(), base.getMonth(), base.getDate());
      if (!marks[weekKey(cursor)]) cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 7);
      while (marks[weekKey(cursor)]) {
        streak += 1;
        cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 7);
      }
      // 8 週文字方格熱力圖（由舊到新）
      const weeks = recentWeeks(8).reverse();
      let grid = "<div style='display:grid;grid-template-columns:repeat(8,1fr);gap:6px;margin:10px 0'>";
      weeks.forEach(function (k) {
        const on = !!marks[k];
        grid += "<div title='" + T.esc(k) + "' style='padding:10px 2px;text-align:center;border-radius:8px;font-size:12px;border:1px solid " +
          (on ? "#2e7d32;background:#2e7d32;color:#fff" : "#bbb;background:transparent;color:#999") + "'>" +
          (on ? "✅" : "・") + "<br>" + T.esc(k.split("-W")[1]) + "</div>";
      });
      grid += "</div>";
      board.innerHTML = "<h5 class='tool-card-title'>🔥 連續 " + streak + " 週" +
        (streak >= 4 ? " — 這已經不是打卡，是你家的傳統了。" : streak > 0 ? " — 保持下去，別中斷這週。" : " — 本週就是一週之始，約個時間吧。") + "</h5>" +
        grid + "<p class='tool-tip'>方格由舊到新（右上角是這週）。沒做不補打卡 — 空的格子也是資訊，它告訴你哪週最忙，該換個時段。</p>";
    }
    renderBoard();

    // ---- 家人近況測試 ----
    const QUIZ = [
      "你媽最近常提什麼事／什麼人？",
      "你爸上週做了什麼（哪怕很小）？",
      "家裡最近誰的身體有狀況？細節你知道嗎？",
      "你手足最近在工作或感情上煩惱什麼？",
      "你媽最近一次跟你抱怨的是什麼？",
      "你爸最近有什麼新興趣或新習慣？",
      "上次全家一起吃飯是什麼時候？在哪裡？",
      "家裡最近有什麼東西壞了需要修？",
    ];
    box.appendChild(T.el("h4", "tool-h", "🧠 家人近況測試（答得出來，代表你有在注意）"));
    const hist = ctx.get("quiz", null);
    if (hist && hist.a) {
      const card = T.el("div", "tool-card");
      card.innerHTML = "<h5 class='tool-card-title'>📖 上次的題目（先複習，再答新的）</h5>" +
        "<p><b>" + T.esc(hist.q) + "</b></p><p>你的答案：" + T.esc(hist.a) +
        "<br><span class='tool-tip'>（" + T.esc(hist.date) + " 作答 — 現在還答得出一樣嗎？近況會變，答不出來就打電話問。）</span></p>";
      box.appendChild(card);
    }
    // 隨機抽一題（避開上次那題）
    let q = QUIZ[Math.floor(Math.random() * QUIZ.length)];
    if (hist && hist.q) {
      for (let i = 0; i < 5 && q === hist.q; i++) q = QUIZ[Math.floor(Math.random() * QUIZ.length)];
    }
    box.appendChild(T.el("p", "tool-label", "❓ " + T.esc(q)));
    const ans = T.el("textarea", "tool-input");
    ans.style.minHeight = "80px";
    ans.placeholder = "寫下你的答案 — 寫不出來別抄，記下來當做下次打電話的主題。";
    box.appendChild(ans);
    T.button(box, "💾 記錄答案（下次回來複習）", function () {
      const a = ans.value.trim();
      if (!a) { ans.focus(); return; }
      ctx.set("quiz", { q: q, a: a, date: new Date().toISOString().slice(0, 10) });
      ans.value = "";
      box.querySelectorAll(".tool-card").forEach(function (n) { n.remove(); });
      const card = T.el("div", "tool-card");
      card.innerHTML = "<h5 class='tool-card-title'>📖 已存好（下次回來先複習這題）</h5><p><b>" + T.esc(q) + "</b></p><p>你的答案：" + T.esc(a) + "</p>";
      box.insertBefore(card, ans.parentNode ? ans : null);
      box.appendChild(card);
    });
    T.button(box, "這題答不上來 → 記起來打電話問", function () {
      ctx.set("todo_q", { q: q, at: new Date().toISOString().slice(0, 10) });
      out.show("<p>👍 誠實比猜好。本週的電話主題就是：<b>" + T.esc(q) + "</b> — 不用嚴肅，閒聊時順著問就好。</p>");
    }, true);
    const out = T.resultBox(box);
  };

  (window.LEARN_TOOLS = window.LEARN_TOOLS || {})["family"] = tools;
})();
