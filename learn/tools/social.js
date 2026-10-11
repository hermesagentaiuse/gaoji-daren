/* ============================================================
   社交與應酬 輔助工具（對應 config.js social 分類索引）
   0 座次判斷器 | 1 敬酒自保器 | 2 人脈記憶卡
   3 人情帳本 | 4 優雅拒絕話術產生器 | 5 群組發言安檢門
   ============================================================ */
(function () {
  const T = window.TOOLKIT;
  const tools = {};

  // ---- 0. 座次判斷器 ----
  tools["0"] = function (box, ctx) {
    T.h(box, "🪑 座次判斷器（進場前先看一眼）");
    const sceneSel = T.select(box, "場合", "tk-scene", [
      { value: "cn", label: "中式圓桌合菜" },
      { value: "west", label: "西式長桌宴會" },
      { value: "conf", label: "會議室長桌談判" },
      { value: "car", label: "計程車・商務車（有司機）" },
    ]);
    T.button(box, "顯示座位主次", function () { render(sceneSel.value); });
    const out = T.resultBox(box);

    const DATA = {
      cn: {
        title: "中式圓桌：面對門為上，主人右手邊為主客",
        ascii:
          "            【 門 】\n" +
          "              ↓\n" +
          "         買單・催菜位（背門）\n" +
          "        第三賓      第二賓\n" +
          "          ＼ ◯ 圓桌◯ ／\n" +
          "          ／         ＼\n" +
          "        主賓★    主人（面對門）\n" +
          "     ★＝主人右手邊第一位",
        rules: [
          ["主人位（主陪）", "面對門正中——看得到誰進出，負責帶局、點菜、買單。"],
          ["主賓", "主人的右手邊第一位——整桌最尊貴的客人。"],
          ["第二賓", "主人的左手邊第二位。"],
          ["副陪／買單位", "背對門口——催菜、倒酒、結帳的功能位。晚輩、下屬、做東的學弟常坐這裡。"],
          ["大原則", "離門越遠越尊貴；面對門比背對門尊貴；左不過右——右邊永遠比左邊大。"],
        ],
        mines: [
          "一進門就坐面對門的位子＝搶主人位，長輩會記住你一輩子。",
          "帶客戶時把主賓讓到對角線——主賓沒坐到主人右手邊，等於打主人的臉。",
          "一群晚輩搶著坐主位拍照，長輩站在旁邊——這種照片發出去就是社交死刑。",
          "不確定坐哪裡時，站在原位等主人來「排座位」，這是最低成本的保險。",
        ],
      },
      west: {
        title: "西式長桌：主人坐長邊中間（或桌頭），主賓在主人右側",
        ascii:
          "        【窗／背牆】\n" +
          "  ┌──────────────────────┐\n" +
          "  │ 三賓    ★主人(長邊中間)│\n" +
          "  │ ★主賓   四賓           │\n" +
          "  │ 二賓    五賓           │\n" +
          "  └───────────┬──────────┘\n" +
          "            【門】",
        rules: [
          ["主人", "長邊中間、背靠牆面對門（正式家宴也可坐桌頭）；男主人右側為女賓中最尊貴者。"],
          ["主賓", "主人右手邊第一位；第二賓在左手邊。"],
          ["交錯原則", "男女交錯、相熟者隔開坐——避免兩兩自成小圈子。"],
          ["桌頭桌尾", "正式晚宴的兩端是男女主人位；商務場合兩端留空或坐翻譯／助理。"],
        ],
        mines: [
          "自行坐桌頭＝自封主人，真正的主人只能站在旁邊。",
          "夫妻／情侶紧挨著坐——西方禮儀視為失禮（商務場合尤其明顯）。",
          "主賓位被自己的同事先坐了，別當場糾正——微笑換位，事後解釋。",
        ],
      },
      conf: {
        title: "會議室長桌：面對門的一側是客方，主方背門負責迎送",
        ascii:
          "         【窗／投影布幕】\n" +
          "  ┌──────────────────────┐\n" +
          "  │ 客方2   客方主談★  客方3 │  ← 背靠牆、面對門＝客方\n" +
          "  │ 主方3   主方主談★  主方2 │  ← 背對門＝主方（迎送・點餐）\n" +
          "  └───────────┬──────────┘\n" +
          "            【門】",
        rules: [
          ["客方", "背靠牆、面對門的一側——賓客要有「看得到入口」的安全感。"],
          ["主方", "背對門的一側——負責開門迎人、引導入座、招呼茶水。"],
          ["主談位", "雙方主谈人坐各自長邊正中間，職位由中間向外遞減。"],
          ["翻譯／紀錄", "坐主談人右手邊或桌尾，不佔主位。"],
        ],
        mines: [
          "客人一到就坐背門那側——把主位讓出去，對方主人會很為難。",
          "主談人坐桌頭（短邊）——變成「審訊局」，氣氛立刻僵掉。",
          "下屬搶坐長邊中間的位置拍照占位——進門先讓主管坐定，你再找邊位。",
        ],
      },
      car: {
        title: "計程車・商務車：後座右側為上位（有司機時）",
        ascii:
          "          車頭 →\n" +
          "  ┌───────────────┐\n" +
          "  │ 駕駛 │ 副駕駛   │ ← 隨從・特助位\n" +
          "  ├──────┼────────┤\n" +
          "  │ 後左  │ 後右★  │ ← ★最上位（靠路側，安全上下車）\n" +
          "  │(次之) │(上位)  │\n" +
          "  └──────┴───┬────┘\n" +
          "          後中（最末位）",
        rules: [
          ["後右 ★", "副駕駛正後方——最上位，離人行道最近、上下車最安全，留給最大貴賓。"],
          ["後左", "次上位；後座中間最末，三人同行才輪到。"],
          ["副駕駛", "秘書、特助、買單的人坐——幫主人開門、指路、付車錢。"],
          ["七人座商務車", "第二排右側（獨立座椅靠路側）為上位，第二排左側次之，第三排再次。"],
          ["主人自己開車", "副駕駛＝上位！坐後座等於把人家當司機，大忌。"],
        ],
        mines: [
          "搭朋友的車徑直坐後座——請立刻下車繞到副駕駛座，這動作比道歉一百遍有用。",
          "有司機時坐副駕駛——把司機當透明人之外，還自降隨從位。",
          "長輩上车前沒人幫擋車頂——手扶門框上緣三秒鐘，這細節別人會記一輩子。",
        ],
      },
    };

    function render(key) {
      const d = DATA[key];
      let html = "<h5 class='tool-card-title'>" + T.esc(d.title) + "</h5>";
      html += "<pre class='tool-copy-pre'>" + T.esc(d.ascii) + "</pre>";
      html += "<table class='tool-table'><thead><tr><th>位置</th><th>怎麼坐</th></tr></thead><tbody>";
      d.rules.forEach(function (r) {
        html += "<tr><td><b>" + T.esc(r[0]) + "</b></td><td>" + T.esc(r[1]) + "</td></tr>";
      });
      html += "</tbody></table>";
      html += "<h5 class='tool-card-title'>💣 常見誤坐地雷</h5><ul class='tool-checklist'>" +
        d.mines.map(function (m) { return "<li>⚠️ " + T.esc(m) + "</li>"; }).join("") + "</ul>";
      html += "<p class='tool-tip'>💡 老哥提醒：所有場合通用的保命符——「您覺得我坐哪裡合適？」把座位決定權交還主人，永遠不得罪人。</p>";
      out.show(html);
      ctx.set("lastScene", key);
    }
    const last = ctx.get("lastScene");
    if (last && DATA[last]) { sceneSel.value = last; render(last); }
  };

  // ---- 1. 敬酒自保器 ----
  tools["1"] = function (box, ctx) {
    T.h(box, "🍵 敬酒自保器（以茶代酒＋三層拒酒話術）");
    const sceneSel = T.select(box, "場合", "tk-toast-scene", [
      { value: "client", label: "客戶應酬" },
      { value: "wedding", label: "親友婚禮" },
      { value: "colleague", label: "同事聚餐" },
    ]);
    const reasonSel = T.select(box, "你不喝酒的原因", "tk-toast-why", [
      { value: "drive", label: "開車（今天必須開車）" },
      { value: "stomach", label: "胃／醫囑（身體因素）" },
      { value: "never", label: "根本不想喝（就是滴酒不沾）" },
    ]);
    const holder = T.el("div");
    box.appendChild(holder);
    T.button(box, "產生我的台詞", generate);
    T.button(box, "重設", function () { holder.innerHTML = ""; }, true);

    const OPENERS = {
      client: [
        "×總，這杯我敬您。這一年多虧您照顧，全在這裡面——我以茶代酒，茶越濃代表我越誠心。",
      ],
      wedding: [
        "今天是大喜的日子，酒可以慢喝，祝福不能打折——我以茶代酒，先祝新人（長輩）身體健康、萬事如意！",
      ],
      colleague: [
        "各位，這杯我敬大家！今天這頓我吃得最開心——我以茶代酒先乾為敬，你們隨意，我負責把大家照顧好。",
      ],
    };
    const REASONS = {
      drive: "今天是我開車上來的，酒我真的不能沾——安全責任在車上，還有家人在等我。",
      stomach: "醫囑這段時間必須忌酒，醫生開的單子我不敢不聽，感情深不深從來不在酒裡。",
      never: "我這人一杯就倒，倒下來那個醜態會掃了大家的興——我保持清醒，陪你們到最後一個。",
    };
    function generate() {
      const scene = sceneSel.value, why = reasonSel.value;
      const opener = OPENERS[scene][0].replace("×總", "○總（換成對方稱呼）");
      const lines = [
        "【第一句｜以茶代酒，先發制人】",
        opener + " " + REASONS[why],
        "",
        "【被勸酒時・第一層｜先捧再擋】",
        "「您這杯酒我收到重量了——正因為是重量級，我才不能糊裡糊塗喝掉。這杯我先記帳，改天我備好酒專程補敬您。」",
        "",
        "【第二層｜陳述事實，不留缺口】",
        "「真的不是不給面子，是' + '今天確實（開車／有醫囑在身），一旦開了第一口就沒有收場。您罰我三大杯茶，我把您服務好，這比酒實在。」",
        "",
        "【第三層｜自我調侃＋給替代方案】",
        "「我今天的崗位是『清醒擔當』——等會兒叫車、結帳、拎外套、把各位安全送上車，全包在我身上。您讓我微醺，誰照顧您？」",
      ].join("\n");
      holder.innerHTML = "";
      T.copyBlock(holder, lines);
      const tip = T.el("p", "tool-tip", "💡 老哥提醒：拒酒三個鐵律——① 從一開始就不端酒杯（端了再放下更難）；② 理由要「不可協商」（開車、醫囑），說「不太能喝」就是留門縫；③ 永遠笑著說，把面子還給對方。");
      holder.appendChild(tip);
      ctx.set("lastToast", { scene: scene, why: why });
    }
    const last = ctx.get("lastToast");
    if (last) { sceneSel.value = last.scene; reasonSel.value = last.why; }
  };

  // ---- 2. 人脈記憶卡 ----
  tools["2"] = function (box, ctx) {
    T.h(box, "🃏 人脈記憶卡（下次見面先問什麼）");
    const name = T.textInput(box, "名字", "tk-pn", "例：王協理");
    const title = T.textInput(box, "職稱", "tk-pt", "例：採購部協理");
    const company = T.textInput(box, "公司", "tk-pc", "例：○○科技");
    const topic = T.textInput(box, "上次聊的小事（關鍵！）", "tk-pp", "例：兒子要考國中、剛去日本滑雪");
    const meet = T.textInput(box, "上次見面日", "tk-pm", "例：2026-10-01");
    T.button(box, "＋ 建立卡片", function () {
      const n = name.value.trim();
      if (!n) return out.show("<p class='tool-warn'>至少要有名字。</p>");
      const people = ctx.get("people", []);
      people.push({
        n: n, t: title.value.trim(), c: company.value.trim(),
        p: topic.value.trim(), d: meet.value.trim(),
      });
      ctx.set("people", people);
      [name, title, company, topic, meet].forEach(function (i) { i.value = ""; });
      render();
    });
    T.button(box, "🎲 隨機抽一位（見面前溫習）", function () {
      const people = ctx.get("people", []);
      if (!people.length) return out.show("<p class='tool-warn'>還沒有卡片——先把你這週要見的人建進去。</p>");
      const p = people[Math.floor(Math.random() * people.length)];
      let days = "—";
      if (p.d) {
        const diff = (Date.now() - Date.parse(p.d + "T00:00:00")) / 86400000;
        if (isFinite(diff) && diff >= 0) days = Math.floor(diff) + " 天前見過";
      }
      const ask = p.p
        ? "「上次你提到「" + T.esc(p.p) + "」，後來怎麼樣了？」"
        : "「上次見面之後有沒有發生什麼好玩的事？」（下次記得記下他隨口講的小事！）";
      let html = "<div class='tool-card'><h5 class='tool-card-title'>🃏 " + T.esc(p.n) +
        " <span class='tool-card-sub'>" + T.esc([p.t, p.c].filter(Boolean).join("｜") || "（沒有職稱資料）") + "</span></h5>" +
        "<p>距離上次： <b>" + T.esc(days) + "</b></p>" +
        "<p><b>下次遇到他，你該先問的：</b><br>" + ask + "</p></div>";
      if (p.p) html += "<p class='tool-tip'>💡 記住：人不會因為你認識他而記住你，會因為「你記得他講過的小事」而記住你。這一問價值勝過十張名片。</p>";
      else html += "<p class='tool-warn'>⚠️ 這張卡沒有「上次聊的小事」——這種人在你腦中只是名字。見面三分鐘內找出一個細節補上去。</p>";
      out.show(html);
    });
    T.button(box, "清空全部卡片", function () {
      if (confirm("確定清空所有人脈卡片？")) { ctx.del("people"); render(); }
    }, true);
    const out = T.resultBox(box);

    function render() {
      const people = ctx.get("people", []);
      box.querySelectorAll(".tool-table-wrap, .tool-plan").forEach(function (n) { n.remove(); });
      if (!people.length) return;
      const rows = people.map(function (p, i) {
        return [T.esc(p.n), T.esc(p.t || "—"), T.esc(p.c || "—"),
          T.esc(p.p || "（待補）"), T.esc(p.d || "—"),
          "<button class='tool-del' data-up='" + i + "'>✅ 剛見完</button> " +
          "<button class='tool-del' data-i='" + i + "'>✕</button>"];
      });
      T.table(box, ["姓名", "職稱", "公司", "上次的小事", "上次見面", "更新／刪除"], rows);
      box.querySelectorAll(".tool-del").forEach(function (b) {
        if (b.dataset.up !== undefined) {
          b.addEventListener("click", function () {
            const list = ctx.get("people", []);
            const p = list[parseInt(b.dataset.up, 10)];
            const np = prompt("這次見面聊了什麼新的小事？（留白＝沿用舊的）\n例如：女兒考上大學了", p.p || "");
            if (np !== null) p.p = np.trim() || p.p;
            p.d = new Date().toISOString().slice(0, 10);
            ctx.set("people", list);
            render();
          });
        } else {
          b.addEventListener("click", function () {
            const list = ctx.get("people", []);
            list.splice(parseInt(b.dataset.i, 10), 1);
            ctx.set("people", list);
            render();
          });
        }
      });
    }
    render();
  };

  // ---- 3. 人情帳本 ----
  tools["3"] = function (box, ctx) {
    T.h(box, "🧧 人情帳本（往來差額一眼看清）");
    const who = T.textInput(box, "對象", "tk-w", "例：李大中（大學同學）");
    const whySel = T.select(box, "事由", "tk-why2", [
      "紅帖（婚禮）", "白帖（喪祭）", "生日", "節日（年節問候）",
      "問候・探病", "生小孩・满月", "借錢・往來", "其他",
    ]);
    const amt = T.numInput(box, "金額", "tk-a3", "例：1200");
    const amtHint = T.el("p", "tool-tip", "💰 金額欄僅供你記錄實際數字用。紅包行情依當地習俗、交情深淺調整——沒有標準答案，參考就好。");
    box.appendChild(amtHint);
    const date = T.textInput(box, "日期", "tk-d3", "例：2026-10-11");
    const dirSel = T.select(box, "方向", "tk-dir", [
      { value: "in", label: "收 — 對方給我的（我欠人情）" },
      { value: "out", label: "送 — 我給對方的（我還人情）" },
    ]);
    T.button(box, "＋ 記一筆", function () {
      const w = who.value.trim();
      const a = parseFloat(amt.value) || 0;
      if (!w || a <= 0) return out.show("<p class='tool-warn'>對象與金額必填。</p>");
      const logs = ctx.get("ledger", []);
      logs.push({
        w: w, y: whySel.value, a: a,
        t: date.value.trim() || new Date().toISOString().slice(0, 10),
        d: dirSel.value,
      });
      ctx.set("ledger", logs);
      who.value = ""; amt.value = ""; date.value = "";
      render();
    });
    T.button(box, "清空帳本", function () {
      if (confirm("確定清空整個人情帳本？")) { ctx.del("ledger"); render(); }
    }, true);
    const out = T.resultBox(box);

    function render() {
      const logs = ctx.get("ledger", []);
      box.querySelectorAll(".tool-table-wrap, .tool-plan").forEach(function (n) { n.remove(); });
      if (!logs.length) {
        out.show("<p class='tool-tip'>還沒有紀錄。人情的道理跟錢一樣——不記帳的人，總在還錯金額、錯過時機。</p>");
        return;
      }
      const byWho = {};
      logs.forEach(function (l) {
        if (!byWho[l.w]) byWho[l.w] = { in: 0, out: 0 };
        byWho[l.w][l.d] += l.a;
      });
      const names = Object.keys(byWho).sort(function (a, b) {
        return Math.abs(byWho[b].in - byWho[b].out) - Math.abs(byWho[a].in - byWho[a].out);
      });
      const rows = names.map(function (w) {
        const b = byWho[w], diff = b.in - b.out;
        let tag;
        if (diff > 0) tag = "<span class='tool-bad'>欠人情 " + T.money(diff) + "：該補</span>";
        else if (diff < 0) tag = "<span class='tool-good'>被欠 " + T.money(-diff) + "：可觀察</span>";
        else tag = "<span class='tool-good'>往來平衡 👍</span>";
        return [T.esc(w), T.money(b.out), T.money(b.in), tag];
      });
      T.table(box, ["對象", "我送出的", "我收到的", "往來差額判定"], rows);
      const plan = T.el("div", "tool-plan");
      const owe = names.filter(function (w) { return byWho[w].in > byWho[w].out; });
      const owed = names.filter(function (w) { return byWho[w].out > byWho[w].in; });
      let ph = "<h5 class='tool-card-title'>🎯 行動清單</h5><ul class='tool-checklist'>";
      owe.forEach(function (w) {
        ph += "<li>⚠️ <b>" + T.esc(w) + "</b>：你欠他 " + T.money(byWho[w].in - byWho[w].out) +
          " 的人情——<b>在對方開口之前主動補</b>（節日問候、請一頓飯、對方需要時出一份力）。被催的還情，價值折半。</li>";
      });
      owed.forEach(function (w) {
        ph += "<li>👀 <b>" + T.esc(w) + "</b>：他欠你 " + T.money(byWho[w].out - byWho[w].in) +
          " ——觀察就好：<b>不主動提、不逢人便說</b>。真正的人脈不看單筆盈虧，看對方在你需要時會不會出現。</li>";
      });
      if (!owe.length && !owed.length) ph += "<li>✅ 目前人人兩清，保持節奏就好。</li>";
      ph += "</ul>";
      ph += "<p class='tool-tip'>💡 行情參考（僅供參考，務必依當地行情與交情調整）：婚禮紅帖——普通同事／同學 ＄600～1,200、好朋友 ＄1,200～3,600、死當／血親另議；喪祭奠儀——常用單數、依家族與當地習俗問長輩最準；满月／喬遷——比婚禮低一個檔次即可。拿不準就問同樣圈子的共同朋友，「隨大流」永遠不會錯得離譜。</p>";
      plan.innerHTML = ph;
      box.appendChild(plan);
      out.hide();
    }
    render();
  };

  // ---- 4. 優雅拒絕話術產生器 ----
  tools["4"] = function (box, ctx) {
    T.h(box, "🚫 優雅拒絕話術（先肯定 → 拒絕＋一句理由 → 給台階）");
    const sitSel = T.select(box, "情境", "tk-sit", [
      { value: "loan", label: "借錢" },
      { value: "parcel", label: "代收快遞／拿包裹" },
      { value: "weekend", label: "週末無效應酬" },
      { value: "insurance", label: "朋友推銷保險" },
      { value: "workdump", label: "同事塞工作給你" },
    ]);
    const relSel = T.select(box, "關係遠近", "tk-rel", [
      { value: "general", label: "一般（點頭之交／跨部門）" },
      { value: "close", label: "熟（常往來的同事朋友）" },
      { value: "veryclose", label: "很熟（兄弟閨蜜級）" },
    ]);
    const holder = T.el("div");
    box.appendChild(holder);
    T.button(box, "產生台詞", generate);
    T.button(box, "重設", function () { holder.innerHTML = ""; }, true);

    const S = {
      loan: {
        general: {
          open: "你會想到找我，代表你信任我，這份信任我很珍惜。",
          refuse: "不過這筆錢我沒辦法借你，直接跟你說清楚，不拖你時間。",
          reason: "我手上的錢全部排好了用途（備用金、房貸），動一格，整個計畫就塌。",
          alt: "如果你真急用，我可以陪你看銀行貸款、薪轉資貸的方案，或幫你想想還有誰合適——這個忙我幫得起。",
        },
        close: {
          open: "你開口我一定認真聽，不會隨便打發你。",
          refuse: "借錢這事我這裡是真的不行，先跟你說一聲抱歉。",
          reason: "我給自己定過規矩：親友之間金錢與感情分流——分開了，感情才走得遠。",
          alt: "但你的難處我記下了。需要人脈、需要幫忙想辦法、需要半夜聽你抱怨，隨時找我。",
        },
        veryclose: {
          open: "正因為我們這麼熟，我不跟你打太極。",
          refuse: "錢我借不了。你要生氣就生氣，我不跟你演「回去考慮看看」那種戲。",
          reason: "我要的是十年後還能跟你喝酒的兄弟，不是因為一筆錢變得不尷不尬的合夥人。",
          alt: "你說說卡在哪裡，錢以外的資源我調得動就幫你調。真要借錢，我們一起想正規管道。",
        },
      },
      parcel: {
        general: {
          open: "謝謝你想到我，舉手之勞本來不該計較。",
          refuse: "不過代收這個我這邊真的不方便。",
          reason: "我座位／工位在管理區，代收包裹被查到要跟進跟出，我耗不起那個時間。",
          alt: "建議你直接放管理櫃、超商取貨，或約宅配到府時段——花兩分鐘設定，之後都不用麻煩人。",
        },
        close: {
          open: "你的包裹我幫領過幾次，不是不肯幫你。",
          refuse: "但這次開始不行了，我工位已經快變成快遞集散中心。",
          reason: "東西堆在座位旁被主管唸過，我可不想成為部門地標。",
          alt: "超商取貨真的超方便，我教你設定，一分鐘搞定——搞定之前你急件可以先找管理室。",
        },
        veryclose: {
          open: "咱倆這交情，領十個包裹我都沒廢話。",
          refuse: "但代收這件事我得跟你停——不是不肯，是上週差點弄丟你那件，我自己這關過不去。",
          reason: "你的東西丟了我賠不起，也賠不起我們之間的信任。",
          alt: "以後一律超商，取貨碼傳給我都不嫌煩。這錢我請，就當賠罪。",
        },
      },
      weekend: {
        general: {
          open: "謝謝你揪我，被想到總是一件愉快的事。",
          refuse: "這週末我已經有安排了，這次就不去了。",
          reason: "固定的家庭日，這個我不排進工作也不排進應酬。",
          alt: "你們玩得盡興！下次有正經好局（好酒／好球賽）再找我。",
        },
        close: {
          open: "你知道我多愛湊熱鬧，所以這次是真的不行。",
          refuse: "週末我已經答應家人了，先訂先贏。",
          reason: "我的規矩：答應的事不臨時放鳥——今天放你們，改天也會放別人。",
          alt: "平日午休我請咖啡賠罪，或者下週某個晚上我們約個小範圍的，人少我反而玩得開。",
        },
        veryclose: {
          open: "兄弟，你的局我什麼時候掃過興？所以這次的『不去』你該知道份量。",
          refuse: "這次真的不去，不是推託——是我要把週末還給我的生活。",
          reason: "我今年在砍無效應酬，留體力給真正重要的局。你的局在我清單上，但排在『有意義』那一欄我才來。",
          alt: "下次你主導的局我第一個報到。這週你自己玩，回來記得跟我說最好喝的那間。",
        },
      },
      insurance: {
        general: {
          open: "謝謝你想到我，我知道你做這行很認真。",
          refuse: "保單這塊我已經有規劃了，暫時不考慮新增，就不占用你的時間。",
          reason: "我的保規是統一請同一位顧問審，重複買反而保障重疊浪費。",
          alt: "業績方面我幫你留意身邊有需求的人，介紹歸介紹，買賣就從我這裡停止。",
        },
        close: {
          open: "你轉職這事我一直幫你加油，所以跟你說話我不繞。",
          refuse: "保險我不跟你買，這不是對你有意見，是我把『朋友』和『業務』分開。",
          reason: "我不想有一天我們討論保單條款的時候，連以前一起打球的感覺都變質。",
          alt: "你需要練話術，我隨時坐下來當你的免費試聽對象——但口袋這關，免開。改約打球我奉陪。",
        },
        veryclose: {
          open: "咱倆這交情，我跟你說實話才是尊重。",
          refuse: "你的商品好不好我先不評論，但我不會從你手上買，以後也別向我推銷——我們把這條線畫清楚。",
          reason: "你賣我一份保單，你賺佣金；我們之間就少一份『無條件站你這邊』的信任。這買賣我虧。",
          alt: "真心想做這行，我幫你盤你有沒有賣漏的親友名單；想換心情，我陪你跑個步。推銷的話題就此打住。",
        },
      },
      workdump: {
        general: {
          open: "你找我，代表你認為這事我能處理，謝謝你看得起。",
          refuse: "不過這份我接不下來，我手上有案子在_deadline_上。",
          reason: "硬接的話兩邊都做不好，到時拖累你的時程，那我更得罪不起。",
          alt: "我可以給你上次的範本，或花十五分鐘幫你看邏輯——但執行這塊，你跟自己主管重新分工比較合適。",
        },
        close: {
          open: "咱倆合作這麼多次，我要是不幫就不是這個人了。",
          refuse: "但這次不行——我最近接你的活已經超過我自己的工作，主管都在問我本業進度了。",
          reason: "你的急迫不是我的死線；一直當你的後備機對我們兩個都不好。",
          alt: "我把範本和 SOP 傳給你，你自己跑一次，卡關再問。第一次慢，第二次你就比我快了。",
        },
        veryclose: {
          open: "正因為熟，這句話我只跟你講一次。",
          refuse: "以後你的活別再丟給我。我幫你成慣性，你學不會自己扛，主管看到的永遠是我在扛你的部分。",
          reason: "我這不是拒絕你，是拒絕把你養成巨嬰——我們兩個都劃不來。",
          alt: "你有困難我教你、陪你做第一次，但功課得你自己交。今晚先約一攤，這件事翻篇。",
        },
      },
    };
    const MENTOR = "💡 老哥提醒：拒絕三段式是公式也是禮貌——① 先肯定對方的心意（花十秒，省掉後面三十秒的攻防）；② 拒絕只配一句理由，理由越多越像心虛；③ 一定給替代方案——你關上的是一扇門，不是整棟大樓。說出去之前默讀一遍，語氣要比文字再軟 20%。";

    function generate() {
      const s = S[sitSel.value][relSel.value];
      const lines = [
        "【第一步｜先肯定】", s.open, "",
        "【第二步｜拒絕＋一句理由】", s.refuse + " " + s.reason, "",
        "【第三步｜給台階（替代方案）】", s.alt,
      ].join("\n");
      holder.innerHTML = "";
      T.copyBlock(holder, lines);
      holder.appendChild(T.el("p", "tool-tip", MENTOR));
      ctx.set("lastRefuse", { s: sitSel.value, r: relSel.value });
    }
    const last = ctx.get("lastRefuse");
    if (last) { sitSel.value = last.s; relSel.value = last.r; }
  };

  // ---- 5. 群組發言安檢門 ----
  tools["5"] = function (box, ctx) {
    T.h(box, "🛡️ 群組發言安檢門（發出前先過掃）");
    const groupSel = T.select(box, "要發到哪個群", "tk-grp", [
      { value: "company", label: "公司內部群" },
      { value: "client", label: "客戶群" },
      { value: "other", label: "其他工作群" },
    ]);
    const ta = T.el("textarea", "tool-input");
    ta.placeholder = "貼上你想發的一段話……";
    ta.rows = 6;
    ta.style.width = "100%";
    const taRow = T.el("div", "tool-field");
    taRow.appendChild(T.el("label", "tool-label", "發言內容"));
    taRow.appendChild(ta);
    box.appendChild(taRow);
    T.button(box, "🔍 過掃檢查", scan);
    T.button(box, "清空", function () { ta.value = ""; out.hide(); }, true);
    const out = T.resultBox(box);

    const RULES = [
      {
        name: "情緒性詞句",
        re: /(白目|腦殘|智障|白痴|垃圾|廢物|搞什麼|亂搞|亂寫|亂做|受不了|煩死|氣死|無言|醉了|離譜|瞎搞|白費|爛)/,
        fix: "情緒字眼在群組裡等於簽名——換成事實描述：「這個做法會導致 OO 問題」比「亂搞」有力一百倍。",
      },
      {
        name: "抱怨語氣（全面化指責）",
        re: /(每次都是|為什麼都|從來都沒|根本沒人|反正沒人|你們自己看|憑什麼|就我一個|誰管啊|沒人理)/,
        fix: "「每次都」「根本沒人」是點燃全場的寫法。改成具體對象＋具體事件＋具體請求，或直接私訊。",
      },
      {
        name: "未經查證的消息",
        re: /(聽說|據說|聽人說|網路說|網上說|朋友說|內部消息|傳聞|據傳|爆料|小道消息)/,
        fix: "群組裡未標來源的消息會自動變成「事實」。刪掉，或補上來源與連結：「依○○公告（附圖）」；不能確認的事不發。",
      },
      {
        name: "私人話題混入工作群",
        re: /(薪水|薪資|年終|加薪|升遷|感情生活|分手|離婚|懷孕|體重|身材|長相|八卦)/,
        fix: "薪資、感情、外貌相關的話題不進工作群——截圖沒有場合限制。要聊就約line一對一或當面。",
      },
      {
        name: "@特定人＋抱怨",
        re: null,
        fix: "@人本來就等於當眾點名，搭配負面字眼就是公開處刑。把對人的話改成對事，或改私訊＋一句「我在群組補上結論」。",
      },
    ];
    const NEG = /(沒|不|沒能力|拖|爛|錯|忘記|漏|遲|慢|推|混|懶)/;

    function scan() {
      const text = ta.value.trim();
      if (!text) return out.show("<p class='tool-warn'>先貼上你要發的內容。</p>");
      const sentences = text.split(/(?<=[。！？；!?;\n])/).map(function (s) { return s.trim(); })
        .filter(function (s) { return s.length > 0; });
      const hits = [];
      sentences.forEach(function (s) {
        RULES.forEach(function (r, idx) {
          if (idx === 4) {
            // @特定人＋抱怨：同一句內出現 @ 與負面字眼
            if (/@/.test(s) && NEG.test(s)) hits.push({ seg: s, name: r.name, fix: r.fix });
            return;
          }
          if (r.re.test(s)) hits.push({ seg: s, name: r.name, fix: r.fix });
        });
      });
      // 去重（同句同規則）
      const seen = {};
      const uniq = hits.filter(function (h) {
        const k = h.seg + "|" + h.name;
        if (seen[k]) return false;
        seen[k] = 1; return true;
      });
      const grpLabel = groupSel.options[groupSel.selectedIndex].text;
      let html = "";
      if (!uniq.length) {
        html += "<p>🟢 <b>通過安檢</b>——沒有偵測到明顯地雷，可以發到【" + T.esc(grpLabel) + "】。</p>";
        html += "<p class='tool-tip'>💡 最後一道人工安檢：想像這段話被截圖貼到「別的群」，你還接得住嗎？接不住就重寫。</p>";
      } else {
        const risk = Math.min(100, uniq.length * 25);
        html += "<p>🔴 <b>偵測到 " + uniq.length + " 處可疑句段</b>（風險 " + risk + "%）——建議改完再發。</p>" + T.progress(risk);
        uniq.forEach(function (h, i) {
          html += "<div class='tool-card'><b>" + (i + 1) + ". 【" + T.esc(h.name) + "】</b>" +
            "<p>可疑句段：<i>「" + T.esc(h.seg) + "」</i></p>" +
            "<p>✍️ 改寫建議：" + T.esc(h.fix) + "</p></div>";
        });
        html += "<p class='tool-tip'>💡 老哥原則：群組發言只留三種內容——結論、請求、感謝。評語留給一對一，情緒留給朋友，未查證的消息留給自己的草稿箱。</p>";
      }
      out.show(html);
      ctx.set("lastScan", { text: text.slice(0, 2000), grp: groupSel.value });
    }
    const last = ctx.get("lastScan");
    if (last && last.text) { ta.value = last.text; groupSel.value = last.grp; }
  };

  (window.LEARN_TOOLS = window.LEARN_TOOLS || {})["social"] = tools;
})();
