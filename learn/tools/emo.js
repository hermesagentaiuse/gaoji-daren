/* ============================================================
   心理與情緒 輔助工具（對應 config.js emo 分類索引）
   0 情緒命名器 | 1 焦慮拆結構機 | 2 界線練習器
   3 自我對話改寫機 | 4 求助時機檢查表
   本分類內容為一般性情緒支持與自我觀察工具，非醫療建議、非診斷。
   若有傷害自己的念頭，請立即撥打 1925（安心專線，24 小時）或 119。
   ============================================================ */
(function () {
  const T = window.TOOLKIT;
  const tools = {};

  // ---- 共用小件 ----
  // 多行文字輸入（工具箱沒有，補一支，風格對齊 textInput）
  function textArea(container, label, id, placeholder, rows) {
    const row = T.el("div", "tool-field");
    row.appendChild(T.el("label", "tool-label", T.esc(label)));
    const ta = T.el("textarea", "tool-input");
    ta.id = id; ta.rows = rows || 3;
    if (placeholder) ta.placeholder = placeholder;
    row.appendChild(ta); container.appendChild(row);
    return ta;
  }
  // 勾選列
  function checkRow(container, id, text, checked, cls) {
    const lab = T.el("label", "tool-field " + (cls || "tk-check-row"));
    const cb = T.el("input");
    cb.type = "checkbox"; cb.id = id; cb.checked = !!checked;
    lab.appendChild(cb);
    lab.appendChild(T.el("span", "", T.esc(text)));
    container.appendChild(lab);
    return cb;
  }
  function todayStr() { return new Date().toISOString().slice(0, 10); }
  const MED_NOTE = "<p class='tool-tip'>⚠️ 本工具為一般性情緒支持與自我觀察，非診斷、非醫療建議。" +
    "若有傷害自己的念頭，請立即撥打 <b>1925</b>（安心專線，24 小時）或 <b>119</b>。</p>";

  // ============================================================
  // ---- 0. 情緒命名器 ----
  // 身體感受 → 情境 → 情緒候選 → 情緒＋自我確認句（可複製）＋最近 10 次頻率統計
  // ============================================================
  tools["0"] = function (box, ctx) {
    T.h(box, "🏷️ 情緒命名器（先說出名字，情緒就小了一半）");
    box.appendChild(T.el("p", "tool-tip",
      "說不清什麼感覺的時候，先從身體找線索，再對照情境——名字對了，你才知道下一步要照顧的是什麼。"));

    const bodySel = T.select(box, "① 身體最明顯的感覺", "tk-body", [
      { value: "", label: "— 請選擇 —" },
      { value: "胸悶", label: "胸悶、胸口壓壓的" },
      { value: "肩緊", label: "肩頸緊、咬著牙" },
      { value: "胃緊", label: "胃緊、想吐、繃著" },
      { value: "臉熱", label: "臉熱、耳根發燙" },
      { value: "手抖", label: "手抖、心跳很快" },
      { value: "變輕", label: "整個身體變重、使不上力" },
    ]);
    const ctxSel = T.select(box, "② 幾乎同時發生的情境", "tk-ctx", [
      { value: "", label: "— 請選擇 —" },
      { value: "工作", label: "工作／課業" },
      { value: "人際", label: "朋友／同事／人際" },
      { value: "家人", label: "家人／伴侶" },
      { value: "自己", label: "跟自己比較／獨處時" },
    ]);

    // 身體感受 × 情境 → 情緒候選權重
    const BODY_MAP = {
      "胸悶": { "憤怒": 2, "委屈": 3, "失望": 3, "丟臉": 1, "忌妒": 1, "孤獨": 3, "焦慮": 2, "無力": 3 },
      "肩緊": { "憤怒": 2, "委屈": 1, "失望": 1, "丟臉": 1, "忌妒": 1, "孤獨": 1, "焦慮": 3, "無力": 2 },
      "胃緊": { "憤怒": 1, "委屈": 2, "失望": 1, "丟臉": 2, "忌妒": 1, "孤獨": 2, "焦慮": 3, "無力": 2 },
      "臉熱": { "憤怒": 3, "委屈": 1, "失望": 1, "丟臉": 3, "忌妒": 3, "孤獨": 1, "焦慮": 1, "無力": 0 },
      "手抖": { "憤怒": 1, "委屈": 1, "失望": 0, "丟臉": 1, "忌妒": 0, "孤獨": 1, "焦慮": 3, "無力": 1 },
      "變輕": { "憤怒": 0, "委屈": 2, "失望": 3, "丟臉": 0, "忌妒": 0, "孤獨": 3, "焦慮": 1, "無力": 3 },
    };
    const CTX_MAP = {
      "工作": { "憤怒": 2, "委屈": 2, "失望": 2, "丟臉": 2, "忌妒": 2, "孤獨": 0, "焦慮": 3, "無力": 2 },
      "人際": { "憤怒": 2, "委屈": 2, "失望": 2, "丟臉": 2, "忌妒": 3, "孤獨": 2, "焦慮": 2, "無力": 1 },
      "家人": { "憤怒": 2, "委屈": 3, "失望": 3, "丟臉": 1, "忌妒": 1, "孤獨": 2, "焦慮": 1, "無力": 2 },
      "自己": { "憤怒": 1, "委屈": 1, "失望": 2, "丟臉": 1, "忌妒": 2, "孤獨": 3, "焦慮": 2, "無力": 3 },
    };
    const EMOS = ["憤怒", "委屈", "失望", "丟臉", "忌妒", "孤獨", "焦慮", "無力"];
    const AFFIRM = {
      "憤怒": "我感到憤怒，因為我的界線被踩到了 — 憤怒是在提醒我保護自己，它會過去。",
      "委屈": "我感到委屈，因為我的付出沒被看見 — 這個感覺合理，它會過去。",
      "失望": "我感到失望，因為我在乎的期待落空了 — 會失望代表我曾認真相信，它會過去。",
      "丟臉": "我感到丟臉，因為我害怕被看見不夠好 — 羞恥最愛說謊，它說的不是我，它會過去。",
      "忌妒": "我感到忌妒，因為那正是我想要卻還沒有的 — 忌妒是一張地圖，不是罪名，它會過去。",
      "孤獨": "我感到孤獨，因為我渴望被真正理解 — 需要人不是軟弱，它會過去。",
      "焦慮": "我感到焦慮，因為我在乎結果、卻抓不住控制 — 身體在備戰而已，它會過去。",
      "無力": "我感到無力，因為我使了力卻看不到改變 — 先休息不是放棄，它會過去。",
    };

    const candWrap = T.el("div", "tk-dyn");
    box.appendChild(candWrap);
    const out = T.resultBox(box);

    function renderCandidates() {
      candWrap.innerHTML = "";
      const b = bodySel.value, c = ctxSel.value;
      if (!b || !c) return;
      candWrap.appendChild(T.el("p", "tool-label",
        "③ 身體＋情境對照，最接近的三種感覺（選一個最像的）："));
      const scored = EMOS.map(function (e) {
        return { e: e, s: (BODY_MAP[b][e] || 0) + (CTX_MAP[c][e] || 0) };
      }).sort(function (x, y) { return y.s - x.s; });
      const top = scored.slice(0, 3);
      top.forEach(function (o) {
        T.button(candWrap, "我覺得是「" + o.e + "」", function () { nameIt(o.e); });
      });
    }
    function nameIt(emo) {
      const line = AFFIRM[emo];
      let html = "<p>身體說：<b>" + T.esc(bodySel.value) + "</b>　情境：<b>" + T.esc(ctxSel.value) + "</b></p>";
      html += "<p class='tool-big'>🏷️ 這個感覺比較像：<b>" + emo + "</b></p>";
      html += "<p>" + T.esc(line) + "</p>";
      out.node.innerHTML = html;
      out.node.hidden = false;
      T.copyBlock(out.node, line);
      // 記錄最近 10 次
      const hist = ctx.get("hist", []);
      hist.push({ e: emo, t: todayStr() });
      while (hist.length > 10) hist.shift();
      ctx.set("hist", hist);
      renderStats();
    }
    bodySel.addEventListener("change", renderCandidates);
    ctxSel.addEventListener("change", renderCandidates);

    // 頻率統計
    const statWrap = T.el("div", "tk-dyn");
    box.appendChild(statWrap);
    function renderStats() {
      statWrap.innerHTML = "";
      const hist = ctx.get("hist", []);
      if (!hist.length) return;
      statWrap.appendChild(T.el("h4", "tool-h", "📊 最近 " + hist.length + " 次，哪種情緒最常來？"));
      const count = {};
      hist.forEach(function (h) { count[h.e] = (count[h.e] || 0) + 1; });
      const es = Object.keys(count).sort(function (a, b) { return count[b] - count[a]; });
      const max = count[es[0]];
      es.forEach(function (e) {
        const pct = Math.round(count[e] / max * 100);
        const row = T.el("div", "tool-field");
        row.innerHTML = "<span style='display:inline-block;min-width:4.5em'>😐 " + e + " × " + count[e] + "</span>" + T.progress(pct);
        statWrap.appendChild(row);
      });
      const tip = {
        "憤怒": "憤怒常來，代表你的界線長期在退讓。下次它出現時，先問：「哪條線被踩到了？」",
        "委屈": "委屈常來，多半是你先照顧所有人的感受、最後才輪到自己。試著先說一次「我也有我的部分」。",
        "失望": "失望常來，檢查是不是把期待都押在別人改變上。期待留兩分給自己執行。",
        "丟臉": "羞恥常來，代表你活在被評價的鏡頭裡。記住：評價是別人的作品，不是你的身分。",
        "忌妒": "忌妒常來是好事的線索—它反覆指出你想要的東西。把它當地圖，別當罪名。",
        "孤獨": "孤獨常來，不是你人不好，是「被真正理解」的連結太少。本週約一位能談真的朋友。",
        "焦慮": "焦慮常來，身體長期在備戰。每天做 5 分鐘慢呼吸，並把「控制不了的部分」寫下來放著。",
        "無力": "無力感常來，先檢查休息夠不夠，再把目標切小到「今天一定做得到」的尺寸。",
      }[es[0]];
      statWrap.appendChild(T.el("p", "tool-tip", "💡 " + tip));
    }
    T.button(box, "清空情緒紀錄", function () {
      ctx.del("hist"); statWrap.innerHTML = ""; out.hide();
    }, true);
    renderStats();
  };

  // ============================================================
  // ---- 1. 焦慮拆結構機 ----
  // 擔心 → 機率 + 最壞結果 → 能行動 / 只能接受 → 拆解單（可複製）＋歷史＋「後來發生了嗎」
  // ============================================================
  tools["1"] = function (box, ctx) {
    T.h(box, "🧩 焦慮拆結構機（把一團霧拆成兩疊紙）");
    box.appendChild(T.el("p", "tool-tip",
      "焦慮最怕被寫下來。拆成「我能行動的」和「我只能接受的」之後，行動的去做，接受的練習放手—這兩件事從來不能混著做。"));

    const worry = textArea(box, "① 寫下那個擔心（越具體越好）", "tk-worry", "例：下週報告講砸，主管覺得我不行", 2);
    const prob = T.numInput(box, "② 你估計它發生的機率 %", "tk-prob", "例：30");
    const worst = textArea(box, "③ 最壞的結果是什麼", "tk-worst", "例：被打小報告，年終打折", 2);
    const act = textArea(box, "④ 我能行動的（今天就能做的下一步）", "tk-act", "例：先寫大綱請同事帮我看 10 分鐘", 2);
    const acc = textArea(box, "⑤ 我只能接受的（控制不了的別人反應／結果）", "tk-acc", "例：主管當下怎麼想，我管不到", 2);

    const out = T.resultBox(box);
    T.button(box, "產生我的焦慮拆解單", function () {
      const w = worry.value.trim();
      if (!w) return out.show("<p class='tool-warn'>先把擔心寫下來—沒寫下來，它會在腦裡無限循環。</p>");
      const p = Math.max(0, Math.min(100, parseInt(prob.value, 10) || 0));
      const ws = worst.value.trim() || "（沒填）";
      const a1 = act.value.trim() || "（還想不出來：先寫一個最小的動作，例：查資料 10 分鐘）";
      const a2 = acc.value.trim() || "（結果與別人的反應，不在我手上）";
      const letGo = "這個部分不在我手上。我已經把能做的做好了，剩下的，我練習放開手—" +
        "不是放棄，是把力氣留回給自己。它如果來了，我應對得來；它不來，我剛剛擔心的那幾分鐘，還給自己。";
      const memo =
        "【焦慮拆解單 " + todayStr() + "】\n" +
        "擔心：" + w + "\n" +
        "我估計發生機率：" + p + "%\n" +
        "最壞結果：" + ws + "\n" +
        "我能行動的：" + a1 + "\n" +
        "我只能接受的：" + a2 + "\n" +
        "放手句：" + letGo;
      let html = "<p><b>焦慮拆解單</b>（" + todayStr() + "）</p>";
      html += "<p>擔心：「" + T.esc(w) + "」　自估機率：<b>" + p + "%</b>　" + T.progress(p) + "</p>";
      html += "<p>最壞結果：" + T.esc(ws) + "</p>";
      html += "<p>✅ 我能行動的：<b>" + T.esc(a1) + "</b></p>";
      html += "<p>🍃 我只能接受的：" + T.esc(a2) + "</p>";
      html += "<p class='tool-big'>🍃 " + T.esc(letGo) + "</p>";
      if (p <= 30) html += "<p class='tool-tip'>💡 你自估只有 " + p + "%—焦慮慣於把低機率的事畫得像必定發生。去執行你的下一步，然後讓它去。</p>";
      out.node.innerHTML = html;
      out.node.hidden = false;
      T.copyBlock(out.node, memo);
      const hist = ctx.get("hist", []);
      hist.push({ w: w, p: p, worst: ws, act: a1, acc: a2, t: todayStr(), oc: "" });
      while (hist.length > 20) hist.shift();
      ctx.set("hist", hist);
      renderHist();
    });
    T.button(box, "清空輸入", function () {
      [worry, prob, worst, act, acc].forEach(function (i) { i.value = ""; });
      out.hide();
    }, true);

    // ---- 歷史：重看時標「後來發生了嗎」 ----
    const histWrap = T.el("div", "tk-dyn");
    box.appendChild(histWrap);
    function renderHist() {
      histWrap.innerHTML = "";
      const hist = ctx.get("hist", []);
      if (!hist.length) return;
      histWrap.appendChild(T.el("h4", "tool-h", "🗂️ 歷史拆解（回來看：它後來真的發生了嗎？）"));
      const rows = hist.slice().reverse().map(function (h) {
        const i = hist.length - 1 - rows.length; // placeholder, recomputed below
        return null;
      });
      const trs = [];
      for (let idx = hist.length - 1; idx >= 0; idx--) {
        const h = hist[idx];
        const mark = h.oc === "yes" ? "✅ 發生了" : (h.oc === "no" ? "🌤 沒發生" : "❔ 還不知道");
        trs.push([
          T.esc(h.t),
          T.esc(h.w.length > 24 ? h.w.slice(0, 24) + "…" : h.w),
          h.p + "%",
          mark,
          "<button class='tool-del' data-i='" + idx + "' data-oc='yes'>發生了</button> " +
          "<button class='tool-del' data-i='" + idx + "' data-oc='no'>沒發生</button> " +
          "<button class='tool-del' data-i='" + idx + "' data-oc=''>❔</button>",
        ]);
      }
      T.table(histWrap, ["日期", "擔心", "機率", "後來", "標記"], trs);
      histWrap.querySelectorAll(".tool-del").forEach(function (b) {
        b.addEventListener("click", function () {
          const h = ctx.get("hist", []);
          const i = parseInt(b.dataset.i, 10);
          if (h[i]) { h[i].oc = b.dataset.oc || ""; ctx.set("hist", h); }
          renderHist();
        });
      });
      const known = hist.filter(function (h) { return h.oc === "yes" || h.oc === "no"; });
      const notHappened = known.filter(function (h) { return h.oc === "no"; }).length;
      if (known.length >= 3) {
        histWrap.appendChild(T.el("p", "tool-tip",
          "💡 你已回填 " + known.length + " 筆：其中 <b>" + notHappened + " 筆</b>後來根本沒發生。" +
          "你的焦慮有一個慣用的虛張聲勢—下次它報 80% 的時候，記得它過去的實績。"));
      }
    }
    renderHist();
    T.button(box, "清空歷史拆解", function () {
      if (confirm("確定清空所有歷史拆解紀錄？")) { ctx.del("hist"); renderHist(); }
    }, true);
  };

  // ============================================================
  // ---- 2. 界線練習器 ----
  // 選情境 → 他的情緒 vs 我的責任 對照表 ＋ 台詞（同理→界線→替代）＋ 愧疚期提醒 ＋ 練習次數
  // ============================================================
  tools["2"] = function (box, ctx) {
    T.h(box, "🚧 界線練習器（溫和而堅定，是可以同時存在的）");
    box.appendChild(T.el("p", "tool-tip",
      "設界線不是吵架，是把「我」放回對話裡。台詞順序：先同理 → 再界線 → 給替代方案。說完就停，不需要解釋第二次。"));

    const SCENES = {
      "同事塞工作": {
        theirs: ["不高興、擺臉子", "說「你不是很好嗎，帮忙一下」", "裝委屈：「只有你願意幫我」", "生氣：「你變得很難說話」"],
        mine: ["我自己的工作品質與期限，是我的責任", "他能不能準時交差，是他的責任", "他不高興的情緒，歸他處理", "我答應或不答應，是我的責任"],
        lines: [
          "同理：「我知道你時間很緊，這份報告壓在你身上一定很急。」",
          "界線：「但我這週手上有自己的件，沒有辦法接你這份。」",
          "替代：「你可以問問 XXX，或我教你用我上次的範本，設定大概 15 分鐘—這樣你會快很多。」",
        ],
        guilt: "設完線後的 24～72 小時是「愧疚高峰期」—腦子會重播他的臉色、勸你「要不還是帮他」。這是正常的戒斷反應，不是你做錯了。愧疚會退，界線要留。",
      },
      "家人干涉育兒": {
        theirs: ["不高興、說「我們以前都這樣帶」", "搬出經驗權威：「我吃過的鹽比你吃過的米多」", "難過：「我們是在帮你們」", "生悶氣、冷戰"],
        mine: ["孩子的教養決定與後果，是我們（父母）的責任", "長輩想參與、想被需要的心情，可以接住", "他們被拒絕後的情緒，不是我們要收拾的", "怎麼感謝他們的好意、同時守住決定，是我的功課"],
        lines: [
          "同理：「我知道你們這麼做是因為疼愛孫子，這份心意我們真的收到、也很感謝。」",
          "界線：「不過關於（吃糖／睡午覺／手機）這件事，我們已經查過醫師的建議，想統一照我們的方式來。」",
          "替代：「你們可以負責陪他玩和說故事—這部分沒有人比你們更厲害。規則這塊讓我們來堅持。」",
        ],
        guilt: "拒絕長輩之後的愧疚，很多是「孝順制約」在作響，不是你真的不孝。孩子會從你身上學會：愛可以跟界線共存。這段愧疚期（約一週）撐過去，關係會進入新的平衡。",
      },
      "朋友借錢": {
        theirs: ["為難、尷尬", "道德試探：「我們這麼好你也拒絕？」", "生氣：「見死不救」", "退而求其次：「那借一半就好」"],
        mine: ["我的錢怎麼用、借不借，是我的責任", "他怎麼補上資金缺口，是他的責任", "他失望或生氣，是他的情緒", "拒絕時給不給對方面子，我可以選擇溫和"],
        lines: [
          "同理：「我知道你會開口，一定是真的撐得很辛苦，我不會因此看輕你。」",
          "界線：「但我跟自己有個約定：朋友之間不借錢—因為我不想失去這個朋友。」",
          "替代：「我可以帮你想別的辦法：（陪你查勞保卡貸／介紹你問家人的窗口），或這週的聚餐我請，你先省下來。」",
        ],
        guilt: "不借錢之後感到愧疚，通常是因為你把「拒絕借錢」聽成了「拒絕當朋友」—但你拒絕的只是錢。真正因借錢不成而離開的朋友，本來就不是靠交情留下來的。",
      },
      "長輩逼婚": {
        theirs: ["焦慮：「你再拖就來不及了」", "比較：「鄰居小孩都會走路了」", "不高兴、嘆氣", "情緒施壓：「我們等不到幾天了」"],
        mine: ["我的人生節奏與伴侶選擇，是我的責任", "長輩對「含孫弄抱」的期待，是他們的課題", "他們的焦慮與面子，我不負責鎮靜", "我怎麼回答（溫和或直接），是我的選擇"],
        lines: [
          "同理：「我知道你是擔心我老了沒人陪，這份擔心我聽進去了。」",
          "界線：「但婚姻這件事，我不會因為時間壓力而決定—那樣對我也對對方都不公平。」",
          "替代：「我現在在認真過的（工作/生活）上我很踏實。有對象消息我一定第一時間告訴你，我們先聊點開心的好嗎？」",
        ],
        guilt: "頂住逼婚後的愧疚，很多來自「我讓爸媽失望了」—但失望不等於傷害。你可以繼續愛他們、繼續孝順，同時把人生主導權留在自己手上。這兩件事不衝突。",
      },
    };
    const sceneSel = T.select(box, "① 你要練習哪個情境", "tk-scene",
      [{ value: "", label: "— 請選擇情境 —" }].concat(Object.keys(SCENES)));

    const out = T.resultBox(box);
    function render() {
      const key = sceneSel.value;
      if (!key) { out.hide(); return; }
      const s = SCENES[key];
      out.node.innerHTML = "<p><b>情境：" + T.esc(key) + "</b></p>";
      T.table(out.node, ["😤 他的情緒（歸他處理）", "🙋 我的責任（我負責到底）"],
        s.theirs.map(function (t, i) {
          return [T.esc(t), T.esc(s.mine[i] || "—")];
        }));
      const script = "【" + key + " 界線台詞】\n" +
        s.lines[0] + "\n" + s.lines[1] + "\n" + s.lines[2] + "\n" +
        "（說完停住。不解釋第二次。）";
      out.node.appendChild(T.el("p", "tool-label", "② 可複製台詞（先同理 → 界線 → 替代方案）"));
      T.copyBlock(out.node, script);
      out.node.appendChild(T.el("p", "tool-label", "③ 設完線之後的愧疚期提醒"));
      out.node.appendChild(T.el("p", "tool-big", "🫂 " + T.esc(s.guilt)));
      out.node.hidden = false;
    }
    sceneSel.addEventListener("change", render);

    // 練習次數
    const cntWrap = T.el("div", "tk-dyn");
    box.appendChild(cntWrap);
    function renderCount() {
      cntWrap.innerHTML = "";
      const n = ctx.get("count", 0);
      cntWrap.appendChild(T.el("p", "tool-tip", n > 0
        ? "✍️ 你已經正式練習過 <b>" + n + "</b> 次。設界線是肌肉，練過就會—還記得第一次的心跳嗎？現在你熟練多了。"
        : "還沒有練習紀錄—選個情境，把台詞唸出聲一遍也算。嘴巴練過，事發時才說得出口。"));
    }
    T.button(box, "✅ 我今天真的練習了一次", function () {
      ctx.set("count", (ctx.get("count", 0) || 0) + 1);
      renderCount();
    });
    renderCount();
    box.appendChild(T.el("p", "tool-tip", MED_NOTE_TEXT()));
  };
  function MED_NOTE_TEXT() {
    return "設界線之後若出現持續的失眠、焦慮、情緒崩潰，請尋求專業協助（1925 安心專線 24 小時）。本工具為一般性參考。";
  }

  // ============================================================
  // ---- 3. 自我對話改寫機 ----
  // 輸入內心批評句 → 三步提問 → 改寫版存 ctx → 歷史改寫列表 ＋ 常見羞辱句反駁卡
  // ============================================================
  tools["3"] = function (box, ctx) {
    T.h(box, "🪞 自我對話改寫機（你對自已，比對任何人都刻薄）");
    box.appendChild(T.el("p", "tool-tip",
      "腦子裡那個罵你的聲音，往往是早年誰的聲音，不是事實。改寫它—不是變成雞湯，是改成「嚴格但尊重」的教練版。"));

    const orig = textArea(box, "① 寫下那個批評句（原話照抄，包括最難聽的字）", "tk-orig", "例：這點事都做不好，我真是個廢物", 2);

    const stepWrap = T.el("div", "tk-dyn");
    box.appendChild(stepWrap);
    const STEPS = [
      ["第 1 步：這是事實，還是評價？", "事實是攝影機也拍得到的：遲到了 5 分鐘、報告被打回一次。其他全是評價。", "我寫的句子裡，可驗證的事實部分是："],
      ["第 2 步：好朋友這樣說，你會怎麼回他？", "換個人講這句話，你不會點頭—你會心疼他。那份心疼，你也有資格領。", "如果好友這樣罵自己，我會對他說："],
      ["第 3 步：改成「嚴格但尊重」的版本", "承認問題（嚴格）＋指出下一步（有用）＋保留人的價值（尊重）。三者都要在。", "我的改寫版："],
    ];
    let stepAns = [];
    T.button(box, "開始三步提問", function () {
      const o = orig.value.trim();
      if (!o) return out.show("<p class='tool-warn'>先把腦裡那句原話照抄下來—越難聽越要寫，寫下來它才失去體積。</p>");
      stepWrap.innerHTML = "";
      stepAns = [];
      STEPS.forEach(function (s, i) {
        stepWrap.appendChild(T.el("p", "tool-label", s[0]));
        stepWrap.appendChild(T.el("p", "tool-tip", s[1]));
        stepAns.push(textArea(stepWrap, s[2], "tk-step-" + i, "寫在這裡…", 2));
      });
      saveBtn.hidden = false;
      out.hide();
    });
    const saveBtn = T.button(box, "💾 儲存改寫版", function () {
      const o = orig.value.trim();
      if (!o) return out.show("<p class='tool-warn'>先寫下原句。</p>");
      const rewrite = (stepAns[2] && stepAns[2].value.trim()) || "";
      if (!rewrite) return out.show("<p class='tool-warn'>第 3 步的改寫版必填—沒有改寫，就只是把原句又唸了一遍。</p>");
      const items = ctx.get("rewrites", []);
      items.push({ o: o, r: rewrite, t: todayStr() });
      while (items.length > 20) items.shift();
      ctx.set("rewrites", items);
      orig.value = "";
      stepWrap.innerHTML = "";
      saveBtn.hidden = true;
      let html = "<p>✅ 已存入改寫歷史。</p><p>原句：「" + T.esc(o) + "」</p>" +
        "<p class='tool-big'>改寫：「" + T.esc(rewrite) + "」</p>" +
        "<p class='tool-tip'>💡 改寫版不是用來感受好的，是用來「下次這樣想的時候，有第二句可以接」。讀三次，存進直覺裡。</p>";
      out.show(html);
      renderRewrites();
    }, false);
    saveBtn.hidden = true;
    const out = T.resultBox(box);

    // 歷史改寫列表
    const histWrap = T.el("div", "tk-dyn");
    box.appendChild(histWrap);
    function renderRewrites() {
      histWrap.innerHTML = "";
      const items = ctx.get("rewrites", []);
      if (!items.length) return;
      histWrap.appendChild(T.el("h4", "tool-h", "🗂️ 我的改寫牆（心情差的時候重讀這面牆）"));
      items.slice().reverse().forEach(function (it, rev) {
        const i = items.length - 1 - rev;
        const card = T.el("div", "tool-card");
        card.innerHTML = "<p class='tool-card-title'>🗑 原：「" + T.esc(it.o) + "」</p>" +
          "<p class='tool-big'>✨ 改：「" + T.esc(it.r) + "」 <span class='tool-card-sub'>" + T.esc(it.t) + "</span></p>";
        const del = T.el("button", "tool-del", "✕");
        del.type = "button";
        del.addEventListener("click", function () {
          const arr = ctx.get("rewrites", []);
          arr.splice(i, 1);
          ctx.set("rewrites", arr);
          renderRewrites();
        });
        card.appendChild(del);
        histWrap.appendChild(card);
      });
    }
    renderRewrites();
    T.button(box, "清空改寫牆", function () {
      if (confirm("確定清空改寫歷史？")) { ctx.del("rewrites"); renderRewrites(); }
    }, true);

    // 常見羞辱句三句＋反駁卡
    box.appendChild(T.el("h4", "tool-h", "🃏 常見羞辱句三句＋反駁（貼在腦子門口）"));
    const CARDS = [
      ["「這點事都做不好，我真是個廢物」",
        "反駁：做不好的是「這件事．這次」，不是我這個人。廢物是個評價，不是事實—我把事件和身分拆開：我是一個正在學這件事的人。"],
      ["「大家都覺得我很差」",
        "反駁：「大家都」是焦慮最愛的假詞—我能舉出三個人這樣說過嗎？說不出來，就是我一個人替所有人開了會。事實是：大多數人正忙著擔心自己。"],
      ["「都這個歲數了還這樣，我完蛋了」",
        "反駁：歲數不是刑期。我拿別人的進度表判自己的刑—但那张表本來就是瞎寫的。我只跟上週的自己比：這週我多會了一件事，就沒有完蛋。"],
    ];
    CARDS.forEach(function (c) {
      const card = T.el("div", "tool-card");
      card.innerHTML = "<p class='tool-card-title'>🗯 羞辱句：「" + T.esc(c[0]) + "」</p>" +
        "<p>" + T.esc(c[1]) + "</p>";
      box.appendChild(card);
    });
    T.copyBlock(box, CARDS.map(function (c) { return "羞辱句：「" + c[0] + "」\n" + c[1]; }).join("\n\n"));
  };

  // ============================================================
  // ---- 4. 求助時機檢查表 ----
  // 12 項警訊勾選 → ≥4 項或最後一項有勾 → 建議（1925／家醫科／精神科）＋ 可複製就診準備單
  // 頂部固定免責：本工具非診斷
  // ============================================================
  tools["4"] = function (box, ctx) {
    T.h(box, "🧭 求助時機檢查表（不是你不够堅強，是撐太久了）");
    box.appendChild(T.el("p", "tool-warn",
      "⚠️ 本工具非診斷、非醫療建議。若有傷害自己的念頭，請立即撥打 <b>1925</b>（安心專線，24 小時）或報 <b>119</b>。"));

    const ITEMS = [
      ["insomnia", "失眠超過兩週（入睡難／早醒／睡得飽但沒休息感）"],
      ["appetite", "食慾明顯變化（吃不下，或用暴食安撫自己）"],
      ["anhedonia", "興趣消失（以前喜歡的事，現在提不起勁）"],
      ["irritable", "易怒、耐熱度明顯變差（容易因為小事想爆）"],
      ["focus", "注意力難集中（看東西讀不進去、記不起剛剛的事）"],
      ["fatigue", "疲勞（睡過還是累，身體像灌了鉛）"],
      ["worthless", "自責、無價值感（覺得自己是累贅、什麼都做不好）"],
      ["isolate", "避人（已讀不回、推掉聚會、不想被找到）"],
      ["drink", "酒量增加（需要更多才能麻痺／入睡，靠烟酒藥撐）"],
      ["decline", "工作學業下滑（明顯比平時差，快要撐不住）"],
      ["pain", "身體疼痛查不出原因（頭痛、胸悶、胃痛，健檢正常卻一直痛）"],
      ["relief", "出現「解脫了也好」的念頭（想到消失、不想醒來）"],
    ];
    const checked0 = ctx.get("checks", {});
    const chkWrap = T.el("div", "tk-dyn");
    box.appendChild(chkWrap);
    const cbs = {};
    ITEMS.forEach(function (it) {
      cbs[it[0]] = checkRow(chkWrap, "tk-" + it[0], it[1], !!checked0[it[0]]);
      cbs[it[0]].addEventListener("change", function () {
        const d = ctx.get("checks", {}) || {};
        if (cbs[it[0]].checked) d[it[0]] = true; else delete d[it[0]];
        ctx.set("checks", d);
        renderResult();
      });
    });

    const dur = textArea(box, "這些狀況大約持續多久了？（就診準備單用）", "tk-dur", "例：兩個多月，這週變嚴重", 1);
    const impact = textArea(box, "對生活最大的影響是什麼？（就診準備單用）", "tk-impact", "例：開會常走神，請假變多，不敢接電話", 1);

    const out = T.resultBox(box);
    function renderResult() {
      const n = ITEMS.filter(function (it) { return cbs[it[0]].checked; }).length;
      const relief = cbs["relief"].checked;
      box.querySelectorAll(".tk-result-dyn").forEach(function (x) { x.remove(); });
      if (n === 0 && !relief) { out.hide(); return; }
      let html = "<p>本次勾選：<b>" + n + " / 12</b> 項　" + T.progress(Math.round(n / 12 * 100)) + "</p>";
      if (n < 4 && !relief) {
        html += "<p>目前警訊還不到建議求助的門檻。但你的感覺不需要及格才算數—再觀察兩週，" +
          "每天固定時間勾一次，趨勢比單次分數重要。</p>";
        html += "<p class='tool-tip'>💡 現在可以做的：固定睡覺時間、每天曬 15 分鐘太陽、跟一位人講真話。撐不住隨時回來勾。</p>";
        out.show(html);
        return;
      }
      html += "<p class='tool-big'>" + (relief
        ? "🚨 你勾了最後一項—這一項不管幾分都需要人帮忙。請今天撥 <b>1925</b>（安心專線，24 小時、免費、保密），或報 <b>119</b>。"
        : "✅ 達到了求助門檻（≥4 項）。這不是軟弱，是大腦的引擎過熱警示燈—跟血糖偵測器一樣，亮了就該處理。") + "</p>";
      html += "<ul class='tool-checklist'>" +
        "<li>📞 <b>1925 安心專線</b>：24 小時、免費、保密—現在就可以打，不用等到「很嚴重」。</li>" +
        "<li>🏥 <b>家醫科</b>：不知道從哪開始？家醫科可以初步評估、轉介，身體疼痛查不出原因也適合從這裡開始。</li>" +
        "<li>🧠 <b>精神科／身心科</b>：失眠、情緒、注意力問題都可以看—就診不丟人。感冒會看耳鼻喉科，大腦過載看身心科，是同一件事。</li>" +
        "</ul>";
      html += "<p class='tool-tip'>💡 擔心「是不是不夠嚴重」？這個擔心本身就是來這裡的理由。</p>";
      out.node.innerHTML = html;
      out.node.hidden = false;
      // 就診準備單
      const names = ITEMS.filter(function (it) { return cbs[it[0]].checked; })
        .map(function (it) { return "・" + it[1]; });
      const memo =
        "【就診準備單 " + todayStr() + "】\n" +
        "症狀（自己觀察到的，不需要診斷書）：\n" + names.join("\n") + "\n" +
        "持續時間：" + (dur.value.trim() || "（就診前先想好：大約從什麼時候開始）") + "\n" +
        "對生活的影響：" + (impact.value.trim() || "（例：工作、人際、睡眠具體哪裡受影響）") + "\n" +
        "目前用药／病史：（就診時記得告訴醫師）";
      const formWrap = T.el("div", "tk-result-dyn");
      formWrap.appendChild(T.el("p", "tool-label", "📋 可複製的就診準備單（存進手機，看診時照著唸，緊張也沒關係）"));
      T.copyBlock(formWrap, memo);
      box.appendChild(formWrap);
    }
    renderResult();
    T.button(box, "清空勾選", function () {
      ctx.del("checks");
      ITEMS.forEach(function (it) { cbs[it[0]].checked = false; });
      box.querySelectorAll(".tk-result-dyn").forEach(function (x) { x.remove(); });
      out.hide();
    }, true);
    box.appendChild(T.el("p", "tool-tip",
      "⚠️ 再次提醒：本工具非診斷。情緒的急症和身體的急症一樣值得掛號。1925 安心專線 24 小時都在。"));
  };

  (window.LEARN_TOOLS = window.LEARN_TOOLS || {})["emo"] = tools;
})();
