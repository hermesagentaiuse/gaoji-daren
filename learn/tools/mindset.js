/* ============================================================
   心態與修養 輔助工具（對應 config.js mindset 分類索引）
   0 情緒暫停器 | 1 承諾登記本 | 2 證據挑戰器
   3 「我不知道」練習器 | 4 每日覆盤 10 分鐘精靈 | 5 五年之問
   ============================================================ */
(function () {
  const T = window.TOOLKIT;
  const tools = {};

  // ---- 0. 情緒暫停器（24 小時法則 + 寫但不寄）----
  tools["0"] = function (box, ctx) {
    T.h(box, "🌡️ 情緒暫停器 — 別讓生氣的自己坐在談判桌上");

    const stage = T.el("div", "tool-plan");
    box.appendChild(stage);

    // ---- 第一幕：我很生氣 → 6 秒呼吸倒數 ----
    function stageAngry() {
      stage.innerHTML = "";
      stage.appendChild(T.el("p", "tool-tip", "血壓上升的那一刻，負責判斷的大腦區塊是下線的。先讓心率降下來，再決定要不要開口。"));
      const big = T.el("button", "tool-btn tool-btn-big", "我很生氣 🔥");
      big.type = "button";
      big.style.fontSize = "1.3em";
      big.style.padding = "18px 28px";
      big.style.width = "100%";
      stage.appendChild(big);
      big.addEventListener("click", startBreath);
    }

    // ---- 第二幕：6 秒圓圈呼吸倒數（吸 4 秒、停 2 秒）----
    function startBreath() {
      stage.innerHTML = "";
      const circle = T.el("div", "tool-breath-circle");
      circle.style.cssText = "width:150px;height:150px;border-radius:50%;margin:18px auto;" +
        "background:conic-gradient(#5b8def var(--deg,0deg), #23283a 0deg);" +
        "display:flex;align-items:center;justify-content:center;font-size:2em;font-weight:700;";
      const label = T.el("p", "tool-tip");
      label.style.textAlign = "center";
      stage.appendChild(circle);
      stage.appendChild(label);
      const total = 6;
      let left = total;
      label.textContent = "吸氣 4 秒… 停 2 秒… 把注意力放回呼吸";
      const iv = setInterval(function () {
        left -= 0.1;
        const done = Math.min(1, (total - left) / total);
        circle.style.setProperty("--deg", (done * 360) + "deg");
        circle.textContent = Math.ceil(left);
        if (left <= 0) {
          clearInterval(iv);
          circle.textContent = "👍";
          label.textContent = "好。現在心率下來了 — 寫，但不要寄。";
          setTimeout(stageWrite, 600);
        }
      }, 100);
    }

    // ---- 第三幕：寫但不寄 ----
    function stageWrite() {
      stage.innerHTML = "";
      stage.appendChild(T.el("p", "tool-tip", "把想罵的話全部寫下來，寫到最狠為止。這封信永遠不會寄出 — 它唯一的讀者是你自己。"));
      const ta = T.el("textarea", "tool-input");
      ta.style.minHeight = "180px";
      ta.placeholder = "把想說的話全寫在這裡…（自動保存，下次打開還在）";
      ta.value = ctx.get("draft", "");
      ta.addEventListener("input", function () { ctx.set("draft", ta.value); });
      stage.appendChild(ta);
      const row = T.el("div", "tool-field");
      stage.appendChild(row);
      T.button(row, "🔒 封存 24 小時後再看", function () {
        const text = ta.value.trim();
        if (!text) return;
        ctx.set("sealed", { text: text, ts: Date.now() });
        ctx.del("draft");
        ta.value = "";
        renderHistory();
        stage.innerHTML = "<p>🔒 已封存。24 小時後回來看看當時的自己 — 多數人會感謝自己沒按下送出。</p>";
        T.button(stage, "↩ 返回", function () { renderHistory(); stageAngry(); });
      });
      T.button(row, "只丟掉，不封存", function () {
        ctx.del("draft");
        ta.value = "";
        renderHistory();
      }, true);
    }

    // ---- 過期檢查：封存滿 24 小時 → 「你 24 小時前寫下的是…」----
    function renderHistory() {
      stage.innerHTML = "";
      const sealed = ctx.get("sealed");
      if (sealed && sealed.ts) {
        const elapsed = Date.now() - sealed.ts;
        const DAY = 24 * 60 * 60 * 1000;
        if (elapsed >= DAY) {
          const card = T.el("div", "tool-card");
          card.innerHTML = "<h5 class='tool-card-title'>⏰ 你 24 小時前寫下的是：</h5>" +
            "<pre class='tool-copy-pre' style='white-space:pre-wrap'>" + T.esc(sealed.text) + "</pre>" +
            "<p><b>現在還想發嗎？</b>想 — 重写一遍再發（通常會縮成三句話）。不想 — 關掉頁面，今天賺到一段沒燒掉的關係。</p>";
          stage.appendChild(card);
          T.button(stage, "✅ 處理完了，丟掉", function () {
            ctx.del("sealed");
            renderHistory();
          });
          T.button(stage, "再封存一天", function () {
            ctx.set("sealed", { text: sealed.text, ts: Date.now() });
            renderHistory();
          }, true);
          return;
        }
        const hours = Math.ceil((DAY - elapsed) / 3600000);
        stage.appendChild(T.el("p", "tool-tip", "🔒 有一封已封存的信，還剩約 " + hours + " 小時解鎖。這段時間什麼都不用做。"));
      }
      const n = ctx.get("count", 0);
      if (n > 0) {
        stage.appendChild(T.el("p", "tool-tip", "你已經封存過 " + n + " 次。每一次沒按下的送出，都是省下来的賠償金。"));
      }
    }

    renderHistory();
    stageAngry();
  };

  // ---- 1. 承諾登記本（對人守信是可练的肌肉）----
  tools["1"] = function (box, ctx) {
    T.h(box, "🤝 承諾登記本 — 信用是一筆一筆存出來的");
    box.appendChild(T.el("p", "tool-tip", "不敢承諾的人不可靠，亂承諾的人更不可靠。登記下來、到期兌現 — 這是「說話算話」的肌肉訓練。"));

    const who = T.textInput(box, "對誰承諾", "tk-who", "例：主管 / 老婆 / 自己");
    const what = T.textInput(box, "承諾什麼", "tk-what", "例：週五前交報告初稿");
    const due = T.el("input", "tool-input");
    {
      const row = T.el("div", "tool-field");
      row.appendChild(T.el("label", "tool-label", "期限"));
      due.type = "date";
      row.appendChild(due);
      box.appendChild(row);
    }
    const out = T.resultBox(box);

    T.button(box, "＋ 登記承諾", function () {
      const w = what.value.trim();
      if (!w) return out.show("<p class='tool-warn'>承諾內容必填 — 講不出白紙黑字的內容，就不算承諾。</p>");
      const list = ctx.get("list", []);
      list.push({
        who: who.value.trim() || "(未填對象)",
        what: w,
        due: due.value || "",
        created: new Date().toISOString().slice(0, 10),
        done: false, doneAt: null,
      });
      ctx.set("list", list);
      who.value = ""; what.value = ""; due.value = "";
      render();
    });
    T.button(box, "清空", function () {
      if (confirm("確定清空所有承諾紀錄？")) { ctx.del("list"); render(); }
    }, true);

    function render() {
      box.querySelectorAll(".tool-table-wrap, .tool-plan").forEach(function (n) { n.remove(); });
      const list = ctx.get("list", []);
      if (!list.length) {
        out.show("<p class='tool-tip'>還沒有紀錄。從今天答應別人的小事開始記 — 「晚點回你」也算，寫下來才有機會兌現。</p>");
        return;
      }
      const today = new Date().toISOString().slice(0, 10);
      const rows = list.map(function (p, i) {
        const overdue = !p.done && p.due && p.due < today;
        let status;
        if (p.done) status = "<span class='tool-good'>✅ 已兌現</span>";
        else if (overdue) status = "<span class='tool-bad'>🔴 逾期未兌現</span>";
        else status = "進行中";
        const btn = p.done
          ? "<button class='tool-del' data-undo='" + i + "'>↩</button>"
          : "<button class='tool-btn tool-btn-ghost' data-done='" + i + "'>✓ 已兌現</button>";
        return [T.esc(p.who), T.esc(p.what), T.esc(p.due || "—"), status, btn];
      });
      T.table(box, ["對象", "承諾", "期限", "狀態", ""], rows);

      const doneN = list.filter(function (p) { return p.done; }).length;
      const rate = Math.round(doneN / list.length * 100);
      const overdueN = list.filter(function (p) { return !p.done && p.due && p.due < today; }).length;
      const plan = T.el("div", "tool-plan");
      plan.innerHTML = "<h5 class='tool-card-title'>📊 兌現率</h5>" + T.progress(rate) +
        "<p>" + doneN + " / " + list.length + " 已兌現（" + rate + "%）" +
        (overdueN ? "　<b class='tool-warn'>逾期 " + overdueN + " 筆</b>" : "") + "</p>" +
        "<p class='tool-tip'>" + (rate >= 80
          ? "80% 以上：你的話開始有重量。繼續只承諾做得到的事。"
          : rate >= 50
            ? "先別增加新承諾 — 把逾期的幾筆今天处理掉，或主動跟對方重新約時間。悄悄消失是最差的選項。"
            : "兌現率低不是品德問題，是承諾時沒算清楚。下次答應前先問自己：這件事我幾號做、誰會知道我做沒做？") + "</p>";
      box.appendChild(plan);

      box.querySelectorAll("[data-done]").forEach(function (b) {
        b.addEventListener("click", function () {
          const p = ctx.get("list", [])[parseInt(b.dataset.done, 10)];
          p.done = true; p.doneAt = today;
          ctx.set("list", ctx.get("list", []));
          render();
        });
      });
      box.querySelectorAll("[data-undo]").forEach(function (b) {
        b.addEventListener("click", function () {
          const p = ctx.get("list", [])[parseInt(b.dataset.undo, 10)];
          p.done = false; p.doneAt = null;
          ctx.set("list", ctx.get("list", []));
          render();
        });
      });
      // 逾期優先提醒
      const od = list.filter(function (p) { return !p.done && p.due && p.due < today; });
      if (od.length) {
        out.show("<p class='tool-warn'>⚠️ 先處理逾期：" + od.map(function (p) { return "「" + T.esc(p.what) + "」"; }).join("、") +
          " — 要嘛今天做完，要嘛今天就開口重新約。</p>");
      } else {
        out.hide();
      }
    }
    render();
  };

  // ---- 2. 證據挑戰器（對自己的斷言比對別人更狠）----
  tools["2"] = function (box, ctx) {
    T.h(box, "🔬 證據挑戰器 — 你的斷言經得起幾連問？");
    box.appendChild(T.el("p", "tool-tip", "說服力和自欺只差一層：能不能經得起自己連環追問。先把最常掛在嘴邊的那句話丟進來。"));

    const claim = T.textInput(box, "你想說的一句斷言", "tk-claim", "例：我們部門最累 / 客戶都在脫單 / 這行業沒機會了");
    const out = T.resultBox(box);

    const QUESTIONS = [
      ["📂 資料來源", "這個結論是從「資料」來的，還是從「最近兩次記憶」來的？說出來源：誰統計的、什麼時候、口徑是什麼。"],
      ["🔢 樣本幾多", "你見過幾個案例就敢下這個結論？三個案例叫故事，三百個才叫趨勢。樣本數寫下來。"],
      ["🔄 有沒有反例", "刻意去想一個反例：有沒有不這樣的人／部門／時候？想不出來通常不是沒有，是你沒找。"],
      ["🎭 換成對方立場還成立嗎", "用對方（主管／客戶／同事）的角度重唸一遍這句話 — 同樣的資料會不會得出另一個結論？會的話，你說的是立場，不是事實。"],
      ["📏 換個量尺還成立嗎", "把「最累」換成可量的指標（工時？工單數？事故數）還成立嗎？量化不了的形容詞，多数是情緒穿的西裝。"],
    ];

    T.button(box, "開始連環追問", function () {
      const c = claim.value.trim();
      if (!c) return out.show("<p class='tool-warn'>先寫下一句你常說的斷言。</p>");
      const answers = [];
      let html = "<h5 class='tool-card-title'>審查目標：「" + T.esc(c) + "」</h5>";
      QUESTIONS.forEach(function (q, i) {
        html += "<div class='tool-card' style='margin:10px 0'>" +
          "<h5 class='tool-card-title'>第 " + (i + 1) + " 問 — " + T.esc(q[0]) + "</h5>" +
          "<p>" + T.esc(q[1]) + "</p>" +
          "<textarea class='tool-input tk-ans' rows='2' placeholder='誠實回答，只有你看得到…' data-i='" + i + "'></textarea>" +
          "</div>";
      });
      html += "<div id='tk-score-area'></div>";
      out.show(html);
      const area = out.node.querySelector("#tk-score-area");
      T.button(area, "結算證據分數", function () {
        const tas = out.node.querySelectorAll(".tk-ans");
        let score = 0;
        const tips = [];
        tas.forEach(function (ta, i) {
          const v = ta.value.trim();
          if (v.length >= 20) { score += 20; }
          else if (v.length >= 6) { score += 10; tips.push("第 " + (i + 1) + " 問答得太短 — 「答得出來但寫不出來」通常等於沒有。"); }
          else { tips.push("第 " + (i + 1) + " 問（" + QUESTIONS[i][0] + "）空著 — 這一問答不出來，這句話就不該說出口。"); }
        });
        let verdict;
        if (score >= 80) verdict = "💪 證據充足：這句可以說，而且說得出細節的人才壓得住場。";
        else if (score >= 50) verdict = "⚠️ 半成品：這句話现在只配在心裡，不配在會上說。補齊再講。";
        else verdict = "🚫 這是情緒不是論點：先別對外講。去把資料撈出來，或改口「我目前看到的情況是……還需要確認」。";
        area.innerHTML = "<h5 class='tool-card-title'>證據分數：" + score + " / 100</h5>" + T.progress(score) +
          "<p>" + verdict + "</p>" +
          (tips.length ? "<ul class='tool-checklist'>" + tips.map(function (t) { return "<li>🔍 " + T.esc(t) + "</li>"; }).join("") + "</ul>" : "") +
          "<p class='tool-tip'>高級大人的習慣：對外斷言之前，先讓自己當最兇的反方。</p>";
        ctx.set("last", { claim: c, score: score, ts: new Date().toISOString().slice(0, 10) });
      });
    });

    const last = ctx.get("last");
    if (last && last.claim) {
      box.appendChild(T.el("p", "tool-tip", "上次審查（" + T.esc(last.ts) + "）：「" + T.esc(last.claim) + "」→ 證據分數 " + last.score + "/100"));
    }
  };

  // ---- 3. 「我不知道」練習器（承認不知道，是高可信度的開始）----
  tools["3"] = function (box, ctx) {
    T.h(box, "🗣️ 「我不知道」練習器 — 講得出這三個字的人最可信");
    box.appendChild(T.el("p", "tool-tip", "亂掰一次被抓到，你之後說的每句話都要打折。承認不知道＋給時限＋給確定的部分 = 反而加分。"));

    const SCENES = {
      "被問報價": {
        scene: "客戶當場問：「這個做一整套要多少錢？」你手上還沒有完整規格。",
        lines: [
          "「這個我現在給不了你準確報價 — 價格取決於 XX 和 YY 兩個變數。」（承認不知道＋點出變數）",
          "「我週三下班前把分項報價表傳給你，含兩種配置的對比。」（給一個做得到的時限）",
          "「先給你現在能確定的部分：基礎版範圍內都在預算內，之前類似案子的區間是 A～B。」（先給確定的錨）",
        ],
      },
      "被問技術細節": {
        scene: "會上有人問一個你沒碰過的底層實作細節，所有人都看向你。",
        lines: [
          "「這個細節我沒有第一手確認過，不想憑印象猜給你。」（承認不知道，不裝懂）",
          "「我會後找負責這塊的同事確認，今天五點前在群裡給你準確答案。」（時限＋負責人）",
          "「我能先確定的是：整體架構走 X 方案，這塊不影響上線時程。」（守住能確定的範圍）",
        ],
      },
      "被問未來預測": {
        scene: "老闆問：「你覺得下季這個市場會怎麼走？」其實沒人真的知道。",
        lines: [
          "「下季的準確走勢我現在不敢跟你保證 — 這種預測現在講得越肯定的越不能信。」（承認不知道）",
          "「我這週整理一份三種情境的假設表給你，含每種情境我們對應的動作。」（把預測換成情境計畫）",
          "「先說我能確定的：目前兩個訊號是 X 和 Y，它們短期內不會反轉。」（給可驗證的事實）",
        ],
      },
    };

    const sel = T.select(box, "情境", "tk-scene", Object.keys(SCENES));
    const out = T.resultBox(box);

    function showScene() {
      const s = SCENES[sel.value];
      let html = "<div class='tool-card'><h5 class='tool-card-title'>🎬 " + T.esc(sel.value) + "</h5>" +
        "<p>" + T.esc(s.scene) + "</p></div>";
      html += "<h5 class='tool-card-title'>三句式台詞（承認＋時限＋確定的部分）</h5><ol class='tool-order-list'>";
      s.lines.forEach(function (l) { html += "<li>" + T.esc(l) + "</li>"; });
      html += "</ol>";
      out.show(html);
      const copyText = "【" + sel.value + "】\n" + s.lines.map(function (l, i) { return (i + 1) + ". " + l; }).join("\n");
      T.copyBlock(out.node, copyText);
      const n = ctx.get("count", 0) + 1;
      ctx.set("count", n);
      countLine.textContent = "已練習 " + n + " 次";
    }

    const countLine = T.el("p", "tool-tip", "");
    box.appendChild(countLine);
    const n0 = ctx.get("count", 0);
    countLine.textContent = n0 ? "已練習 " + n0 + " 次" : "還沒練過 — 現在就挑一個情境，把台詞念出聲。";

    T.button(box, "生成台詞", showScene);
    showScene();
    box.appendChild(T.el("p", "tool-tip", "💡 練到不用想就能講出來。真到那個時刻，你的嘴比面子快 — 這才是修養。"));
  };

  // ---- 4. 每日覆盤 10 分鐘精靈（打字即存、按日期歸檔）----
  tools["4"] = function (box, ctx) {
    T.h(box, "🌙 每日覆盤 10 分鐘 — 不覆盤的日子等於沒過");
    const PROMPTS = [
      ["q1", "今天哪句話可以不說？", "例：會中打斷小陳的那句。下次同樣場合怎麼講？"],
      ["q2", "哪件事可以做得更好？", "寫具體動作，不寫「我要更主動」這種口號。"],
      ["q3", "明天最重要的一件事？", "只能寫一件。寫兩件等於沒寫。"],
    ];
    const today = new Date().toISOString().slice(0, 10);
    const entries = ctx.get("entries", {});
    const todayEntry = entries[today] || {};

    PROMPTS.forEach(function (p) {
      const row = T.el("div", "tool-field");
      row.appendChild(T.el("label", "tool-label", p[1]));
      row.appendChild(T.el("div", "tool-tip", p[2]));
      const ta = T.el("textarea", "tool-input");
      ta.rows = 3;
      ta.placeholder = "寫幾行就好 — 空著也是答案（代表今天沒這題）";
      ta.value = todayEntry[p[0]] || "";
      ta.addEventListener("input", function () {
        const e = ctx.get("entries", {});
        const rec = e[today] || {};
        rec[p[0]] = ta.value;
        rec.ts = new Date().toISOString();
        e[today] = rec;
        ctx.set("entries", e);
        renderList();
      });
      row.appendChild(ta);
      box.appendChild(row);
    });

    const listWrap = T.el("div", "tool-plan");
    box.appendChild(listWrap);

    function streakDays() {
      const e = ctx.get("entries", {});
      let n = 0;
      const d = new Date();
      for (;;) {
        const key = d.toISOString().slice(0, 10);
        const rec = e[key];
        const has = rec && ["q1", "q2", "q3"].some(function (k) { return (rec[k] || "").trim().length >= 4; });
        // 今天還沒寫不斷 streak（從昨天往前連）
        if (!has && key !== today) break;
        if (has) n += 1;
        d.setDate(d.getDate() - 1);
        if (n > 365) break;
      }
      return n;
    }

    function renderList() {
      listWrap.innerHTML = "";
      const e = ctx.get("entries", {});
      const days = Object.keys(e)
        .filter(function (k) { return ["q1", "q2", "q3"].some(function (q) { return (e[k][q] || "").trim(); }); })
        .sort().reverse().slice(0, 7);
      const st = streakDays();
      listWrap.innerHTML = "<h5 class='tool-card-title'>🔥 連續打卡：" + st + " 天</h5>" +
        (st >= 7 ? "<p class='tool-good'>超過一週了 — 這已經不是紀律，是習慣。</p>"
                 : "<p class='tool-tip'>連到 7 天才算啟動。漏一天不要補籤，明天老實寫就好 — 騙自己的覆盤沒有價值。</p>");
      if (!days.length) {
        listWrap.appendChild(T.el("p", "tool-tip", "最近 7 天還沒有紀錄。上面的三個題，現在花 5 分鐘填一填。"));
        return;
      }
      const rows = days.map(function (k) {
        const rec = e[k];
        const clip = function (v) { v = (v || "").trim(); return v ? T.esc(v.slice(0, 28)) + (v.length > 28 ? "…" : "") : "<span class='tool-muted'>—</span>"; };
        return [T.esc(k), clip(rec.q1), clip(rec.q2), clip(rec.q3),
          "<button class='tool-del' data-day='" + k + "'>✕</button>"];
      });
      T.table(listWrap, ["日期", "可以不說的話", "可更好的事", "明天的第一件事", ""], rows);
      listWrap.querySelectorAll("[data-day]").forEach(function (b) {
        b.addEventListener("click", function () {
          const e2 = ctx.get("entries", {});
          delete e2[b.dataset.day];
          ctx.set("entries", e2);
          renderList();
        });
      });
      const y = days.filter(function (k) { return k !== today; })[0];
      if (y) {
        listWrap.appendChild(T.el("p", "tool-tip", "💡 覆盤的价值在第 30 天才浮現：同一個錯誤連續出現三次，那就不是運氣，是模式。"));
      }
    }
    renderList();
  };

  // ---- 5. 五年之問（把決定放到五年後的自己面前過堂）----
  tools["5"] = function (box, ctx) {
    T.h(box, "🔭 五年之問 — 現在的糾結，五年後的自己怎麼看？");
    box.appendChild(T.el("p", "tool-tip", "多數糾結當下無解，是因為你站在今天看今天。把鏡頭拉遠，答案常常自己浮出來。"));

    const decide = T.textInput(box, "你正在糾結的一個決定", "tk-decide", "例：要不要接跨部門那個職缺 / 要不要離開這間公司");
    const qs = [
      ["a1", "這事 5 年後還重要嗎？", "如果重要 — 重要的是什麼？如果不重要 — 你現在糾結的到底是什麼？"],
      ["a2", "5 年後的你會怎麼看這個選擇？", "想像 5 年後過得還不错的你，回頭看今天的兩個選項，他會說哪句？"],
      ["a3", "你願意為 5 年後的自己現在做什麼？", "寫一件今天就能做的具體事（一個電話、一份履歷、一次當面談）。"],
    ];
    const inputs = qs.map(function (q) {
      const row = T.el("div", "tool-field");
      row.appendChild(T.el("label", "tool-label", q[1]));
      row.appendChild(T.el("div", "tool-tip", q[2]));
      const ta = T.el("textarea", "tool-input");
      ta.rows = 3;
      row.appendChild(ta);
      box.appendChild(row);
      return ta;
    });
    const out = T.resultBox(box);

    T.button(box, "🔭 產生五年視角備忘", function () {
      const d = decide.value.trim();
      if (!d) return out.show("<p class='tool-warn'>先把那個決定寫清楚 — 講不清的決定，通常不是決定問題，是逃避問題。</p>");
      const ans = inputs.map(function (ta) { return ta.value.trim(); });
      const blank = ans.filter(function (a) { return !a; }).length;
      if (blank === 3) return out.show("<p class='tool-warn'>三個問題都空著 — 這題先放著，今晚睡前再答。</p>");
      const memo =
        "【五年視角備忘 · " + new Date().toISOString().slice(0, 10) + "】\n" +
        "糾結中的決定：" + d + "\n\n" +
        "1. 5 年後還重要嗎？\n" + (ans[0] || "(未答)") + "\n\n" +
        "2. 5 年後的我看這個選擇：\n" + (ans[1] || "(未答)") + "\n\n" +
        "3. 我為 5 年後的自己現在做：\n" + (ans[2] || "(未答)") + "\n\n" +
        "規則：72 小時內做掉第 3 題那件事。到期還未做，代表你其實已經選了「不選」。";
      out.show("<h5 class='tool-card-title'>📝 五年視角備忘</h5>");
      T.copyBlock(out.node, memo);
      out.node.appendChild(T.el("p", "tool-tip", "💡 把這份備忘存進你的筆記，設 30 天後提醒回看 — 到時候你會有兩種感覺：庆幸做了，或庆幸沒做。兩種都是收穫。"));
      ctx.set("last", { decide: d, answers: ans, memo: memo, ts: new Date().toISOString().slice(0, 10) });
    });
    T.button(box, "帶入上次的備忘", function () {
      const last = ctx.get("last");
      if (!last) return out.show("<p class='tool-warn'>還沒有存過備忘。</p>");
      decide.value = last.decide || "";
      inputs.forEach(function (ta, i) { ta.value = (last.answers || [])[i] || ""; });
    }, true);

    const last = ctx.get("last");
    if (last && last.decide) {
      box.appendChild(T.el("p", "tool-tip", "上次（" + T.esc(last.ts) + "）的糾結：「" + T.esc(last.decide) + "」— 現在回頭看，還糾結嗎？"));
    }
  };

  (window.LEARN_TOOLS = window.LEARN_TOOLS || {})["mindset"] = tools;
})();
