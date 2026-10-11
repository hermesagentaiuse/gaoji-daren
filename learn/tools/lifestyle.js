/* ============================================================
   生活與品味 輔助工具（對應 config.js lifestyle 分類索引）
   0 場合穿搭檢查表 | 1 西餐刀叉語言速查 | 2 咖啡/茶沖泡精靈
   3 出門前車內安檢表 | 4 閱讀清冊
   ============================================================ */
(function () {
  const T = window.TOOLKIT;
  const tools = {};

  // ---- 0. 場合穿搭檢查表 ----
  const OCCASIONS = {
    "面試": {
      doList: [
        "合身優先：肩線落到肩點、袖長到手腕骨，比品牌重要",
        "深色系（深藍／灰／黑）＋素色襯衫，降低視覺噪音",
        "鞋面保持乾淨，皮鞋除尘或乾淨小白鞋",
        "出門前全身對鏡檢查：領口、皺褶、線頭、鈕扣",
        "寧可正式一分：拿不準就穿得比場合再正式一級",
      ],
      dontList: [
        "不要鮮豔圖紋、大 logo、螢光色",
        "不要濃烈香水與過度髮型造型",
        "不要涼鞋、拖鞋、運動帽准入場",
        "不要皺到像從行李箱直接取出",
      ],
    },
    "客戶餐敘": {
      doList: [
        "Smart casual 安全牌：素色 polo 或襯衫＋休閒西製長褲",
        "顏色收斂（藍、灰、卡其），把亮點留給對方",
        "口袋清空、皮帶與鞋同色系",
        "外套掛手臂或椅背，不隨意亂丟椅背",
        "手機收進內袋，餐桌面前不滑手機",
      ],
      dontList: [
        "不要短褲、牛仔褲破洞款、運動品牌全套",
        "不要濃烈古龍水（對面的人在吃飯，不是在聞你）",
        "不要捲袖捲到手肘以上露出手錶廣告（顯得急躁）",
        "不要白襪配皮鞋（除非你能撐住全場氣質）",
      ],
    },
    "婚禮": {
      doList: [
        "男生：深藍／灰色西裝或襯衫＋西製長褲＋皮鞋",
        "女生：及膝洋裝或套裝，鞋跟能走完整場為原則",
        "色系走低调：藍、灰、粉嫩、大地色",
        "紅包、備用絲襪、補妝小物提前放進包包",
      ],
      dontList: [
        "不要全白（留給主角）",
        "男生不要全黑西裝加白襯衫打黑領帶（像酒保／喪禮兩用）",
        "女生不要大红、不要亮片搶戲、不要低胸到讓人無法看菜",
        "不要拖鞋、涼鞋、運動鞋入席",
      ],
    },
    "休閒聚會": {
      doList: [
        "乾淨 basics：素色 T、合身牛仔褲、整潔鞋款",
        "可以玩顏色與圖案，但全身亮點不超過一處",
        "燙平或至少撫平皺摺，乾淨就是贏家",
        "依場地調整：爬山別穿白鞋，餐酒館別穿拖鞋",
      ],
      dontList: [
        "不要健身房全套直接赴約（除非真的是健身聚會）",
        "不要破洞到像需要縫合的牛仔褲",
        "不要汗味蓋過香水：止汗劑比香水有用",
      ],
    },
    "拜訪長輩": {
      doList: [
        "端莊保守：有領上衣＋長褲／及膝裙，顏色柔和",
        "鞋子包鞋為佳，保持整潔",
        "伴手禮提前準備，雙手遞上",
        "頭髮整齊、指甲乾淨 — 長輩看的是細節",
      ],
      dontList: [
        "不要無袖、短褲、迷你裙、拖鞋",
        "不要破洞牛仔褲與露洞設計",
        "不要大 logo 滿身、過度髮色",
        "不要穿得比長輩還隆重搶戲",
      ],
    },
  };

  tools["0"] = function (box, ctx) {
    T.h(box, "👔 場合穿搭檢查表");
    const sel = T.select(box, "你要去什麼場合？", "tk-occ", Object.keys(OCCASIONS));
    const counts = ctx.get("counts", {});
    const state = ctx.get("state", {});
    const wrap = T.el("div", "tool-plan");
    box.appendChild(wrap);

    function key() { return sel.value; }
    function checkedSet() {
      if (!state[key()]) state[key()] = [];
      return state[key()];
    }

    function render() {
      wrap.innerHTML = "";
      const occ = OCCASIONS[key()];
      const done = checkedSet();
      const total = occ.doList.length + occ.dontList.length;
      const makeList = function (title, items, prefix) {
        const h = T.el("h5", "tool-card-title", title);
        wrap.appendChild(h);
        const ul = T.el("ul", "tool-checklist");
        items.forEach(function (txt, i) {
          const id = prefix + "-" + i;
          const li = T.el("li");
          li.style.cursor = "pointer";
          const cb = document.createElement("input");
          cb.type = "checkbox";
          cb.checked = done.indexOf(id) >= 0;
          cb.style.marginRight = "8px";
          const lab = T.el("span", "", (prefix === "d" ? "✅ " : "🚫 ") + T.esc(txt));
          li.appendChild(cb);
          li.appendChild(lab);
          li.addEventListener("click", function (e) {
            if (e.target !== cb) cb.checked = !cb.checked;
            const idx = done.indexOf(id);
            if (cb.checked && idx < 0) done.push(id);
            if (!cb.checked && idx >= 0) done.splice(idx, 1);
            lab.style.textDecoration = cb.checked ? "line-through" : "none";
            ctx.set("state", state);
            renderCount();
          });
          lab.style.textDecoration = cb.checked ? "line-through" : "none";
          ul.appendChild(li);
        });
        wrap.appendChild(ul);
      };
      makeList("✅ 要做的（逐項打勾確認）", occ.doList, "d");
      makeList("🚫 別踩的地雷（逐項打勾自諾不犯）", occ.dontList, "x");
      renderCount();
    }
    function renderCount() {
      const done = state[key()] || [];
      const occ = OCCASIONS[key()];
      const total = occ.doList.length + occ.dontList.length;
      const pct = Math.round((done.length / total) * 100);
      let bar = T.el("div", "tool-plan");
      bar.innerHTML = T.progress(pct) +
        "<p>本場合已使用 <b>" + (counts[key()] || 0) + "</b> 次。</p>";
      wrap.appendChild(bar);
    }
    function finish() {
      counts[key()] = (counts[key()] || 0) + 1;
      ctx.set("counts", counts);
      state[key()] = [];
      ctx.set("state", state);
      render();
      out.show("<p>🎉 「" + T.esc(key()) + "」檢查完成並記錄（累計 " + counts[key()] + " 次）。穿搭口訣：<b>合身、整潔、場合正確，寧可正式一分</b>。</p>");
    }
    const finBtn = T.button(box, "✔ 完成檢查並記錄", finish);
    sel.addEventListener("change", function () { render(); out.hide(); });
    const out = T.resultBox(box);
    render();
  };

  // ---- 1. 西餐刀叉語言速查 ----
  tools["1"] = function (box, ctx) {
    T.h(box, "🍴 西餐刀叉語言速查（擺位就是發言）");
    T.copyBlock(box, "西餐刀叉語言口訣：八點休息（還沒吃完）、六點吃完（收盤吧）、平行斜放（美味）、豎在盤中（別收）。中餐三大地雷：不插筷、不翻魚、不舔筷。");
    const rows = [
      ["刀叉呈「八」字搭在盤緣（叉八點、刀四點方向）", "🕗", "<b>還沒吃完</b>，只是暫停 — 服務生不會收盤", "暫留訊號"],
      ["刀叉平行並排，斜放盤中（指向 4〜5 點方向）", "➡️", "<b>吃完了，請收盤</b> — 最標準的收盤訊號", "收盤訊號"],
      ["刀叉交叉擺成 X 放在盤上", "✕", "<b>還沒吃完</b>（部分餐廳視同續吃）", "暫留訊號"],
      ["刀叉橫向平行放在盤子上緣", "➖", "<b>這一輪吃完了</b>，可以上下一道", "換道菜"],
      ["刀叉豎直並攏插在盤中央", "⬆️", "少见，容易被誤會 — <b>別用</b>", "勿用"],
      ["刀刃朝內、叉齒朝上並排", "😋", "搭配小聲說「實在那道太好」= <b>美味讚許</b>，廚房會開心", "美味訊號"],
    ];
    T.table(box, ["你怎麼擺", "示意", "服務生讀到的意思", "歸類"], rows);
    const card = T.el("div", "tool-card");
    card.innerHTML = "<h5 class='tool-card-title'>🥢 中餐餐桌地雷清單</h5><ul class='tool-checklist'>" +
      [
        "筷子不直插飯上 — 那是飯碗香火的拜好公画法，像給亡者上供",
        "魚不翻面 — 翻魚象徵翻船，漁家大忌；吃下層請魚骨剔除後再吃",
        "不舔筷、不吸筷、不用筷指人、不用筷翻菜底",
        "公母筷（公筷私筷）分明，夾菜一定用公筷",
        "不拿筷敲碗 — 那是乞食行為",
        "茶壺嘴不對人（壺嘴對人＝逐客），倒茶給別人時自己杯裡也要有茶",
      ].map(function (s) { return "<li>🚫 " + T.esc(s) + "</li>"; }).join("") + "</ul>";
    box.appendChild(card);
    const tip = T.el("div", "tool-plan");
    tip.innerHTML = "<p class='tool-tip'>💡 記不住就記一個萬能位：暫停時刀叉擺成「八」字，吃完時平行斜放 — 全場通則。</p>";
    box.appendChild(tip);
    const last = ctx.get("seen");
    if (!last) { ctx.set("seen", new Date().toISOString().slice(0, 10)); }
  };

  // ---- 2. 咖啡/茶沖泡精靈 ----
  const BREWS = {
    "手衝 V60（咖啡）": {
      seconds: 150, label: "手衝 2:30",
      ratio: "粉水比 1:15（例：15g 粉 → 225g 水，水溫 90〜94°C）",
      steps: [
        "折濾紙、溫杯潤濕濾紙，倒掉溫杯水",
        "磨粉：中細研磨（像粗砂糖），15g 粉入濾杯、輕拍整平",
        "悶蒸：從中心繞圈注水約 30〜45g，浸濕所有粉，計時開始，靜待 30〜45 秒",
        "第一段注水：中心向外繞圈慢注至約 130g，水位穩定",
        "第二段注水：水位下降約一半後，續注至 225g",
        "等待濾完：總時間落在 2:30 上下，濾杯內粉床平整無坑洞",
        "搖勻分享壺後再分杯 — 前段濃後段淡，不搖會不均",
      ],
    },
    "法式壓壺（咖啡）": {
      seconds: 240, label: "法式壓 4:00",
      ratio: "粉水比 1:12〜1:15（例：20g 粉 → 280g 水，水溫 92〜96°C）",
      steps: [
        "溫壺：熱水晃一圈倒掉，壓桿組件先組好",
        "磨粉：粗研磨（像粗鹽），太細會渾濁有渣",
        "入粉注水：一次注滿 280g，啟動 4:00 計時",
        "1:00 時破渣：壓破表面粉餅，輕撇去浮沫與細渣",
        "計時結束：壓桿緩慢、垂直往下壓到底",
        "立即倒出全部咖啡 — 留在壺裡會持續萃取變苦",
      ],
    },
    "杯測茶葉（茶）": {
      seconds: 180, label: "依茶類計時",
      ratio: "茶水比 1:50（例：3g 茶 → 150ml 水；杯測感用 5g/250ml）",
      steps: [
        "看茶選水溫：綠茶 75〜80°C、烏龍 90°C、紅茶／普洱沸水 95〜100°C",
        "溫杯溫壺後投茶，輕搖聞乾香（這是招待客人的第一個亮點）",
        "注水：沿杯壁緩注，不要直衝茶心",
        "計時沖泡（見下方茶葉計時器）：時間到立即濾出茶湯，不留葉",
        "聞香、觀色、小口啜吸讓茶湯散開",
        "烏龍／普洱可續沖 2〜4 泡，每泡加 10〜20 秒",
      ],
    },
  };
  const TEAS = [
    { label: "綠茶／白茶（30〜60 秒）", secs: 45 },
    { label: "包種／輕焙烏龍（60 秒）", secs: 60 },
    { label: "重焙烏龍／巖茶（90 秒）", secs: 90 },
    { label: "紅茶（2 分鐘）", secs: 120 },
    { label: "普洱／黑茶（2〜3 分鐘）", secs: 150 },
    { label: "杯測式一泡到底（3 分鐘）", secs: 180 },
  ];

  tools["2"] = function (box, ctx) {
    T.h(box, "☕ 咖啡 / 茶沖泡精靈");
    const sel = T.select(box, "選沖法", "tk-brew", Object.keys(BREWS));
    const teaRow = T.el("div", "tool-field");
    const teaLabel = T.el("label", "tool-label", "茶葉種類（決定計時）");
    const teaSel = document.createElement("select");
    teaSel.className = "tool-input";
    TEAS.forEach(function (t, i) {
      const op = document.createElement("option");
      op.value = String(t.secs);
      op.textContent = t.label;
      teaSel.appendChild(op);
    });
    teaRow.appendChild(teaLabel); teaRow.appendChild(teaSel);
    box.appendChild(teaRow);
    const guide = T.el("div", "tool-plan");
    box.appendChild(guide);

    function render() {
      guide.innerHTML = "";
      const isTea = sel.value.indexOf("茶") >= 0;
      teaRow.style.display = isTea ? "" : "none";
      const b = BREWS[sel.value];
      const secs = isTea ? (parseInt(teaSel.value, 10) || 180) : b.seconds;
      guide.appendChild(T.el("h5", "tool-card-title", "📐 " + T.esc(b.ratio)));
      const ol = T.el("ol", "tool-order-list");
      b.steps.forEach(function (s, i) {
        const li = T.el("li", "", T.esc(s));
        li.style.opacity = ".55";
        ol.appendChild(li);
      });
      guide.appendChild(ol);
      const btns = T.el("div", "tool-field");
      const prev = T.button(btns, "← 上一步", function () { step = Math.max(0, step - 1); paint(); }, true);
      const next = T.button(btns, "下一步 →", function () { step = Math.min(b.steps.length - 1, step + 1); paint(); });
      guide.appendChild(btns);
      const tBox = T.el("div", "tool-timer-wrap");
      tBox.appendChild(T.el("h5", "tool-card-title", "⏱ 計時器"));
      guide.appendChild(tBox);
      let step = 0;
      function paint() {
        Array.prototype.forEach.call(ol.children, function (li, i) {
          li.style.opacity = i === step ? "1" : ".55";
          li.style.fontWeight = i === step ? "700" : "400";
        });
      }
      T.timer(tBox, secs, function () {
        tBox.appendChild(T.el("p", "tool-tip", "⏰ 時間到 — 現在就是最佳風味窗口，立即濾出／倒出。"));
      }, b.label + (isTea ? "（" + TEAS.find(function (t) { return t.secs === secs; }).label + "）" : ""));
      paint();
    }
    sel.addEventListener("change", function () { render(); });
    teaSel.addEventListener("change", function () { render(); });
    render();
    const tip = T.el("div", "tool-plan");
    tip.innerHTML = "<p class='tool-tip'>💡 招待客人前先到這支工具走一遍流程。記住三件事：比例精準、水溫正確、時間到就離開 — 咖啡和茶最怕的就是「再看一眼」多泡三十秒。</p>";
    box.appendChild(tip);
    ctx.set("last", sel.value);
  };

  // ---- 3. 出門前車內安檢表 ----
  const CAR_ITEMS = [
    ["🗑️", "車內無垃圾、無異味（飲料杯、便當盒、小孩零食袋清乾淨）"],
    ["⛽", "油箱過半（低於半票就先去加油，別賭下一站）"],
    ["🛞", "備胎有氣、四胎胎壓正常（儀表板胎壓警示燈熄滅）"],
    ["📹", "行車紀錄器開著、記憶卡有空間（關鍵時刻救你的是它）"],
    ["🪞", "後照鏡／左後照鏡／右後照鏡角度調整好（各自看到車後 1/3）"],
  ];

  tools["3"] = function (box, ctx) {
    T.h(box, "🚗 出門前車內安檢表");
    let checks = ctx.get("checks", [false, false, false, false, false]);
    const wrap = T.el("div", "tool-plan");
    box.appendChild(wrap);
    const out = T.resultBox(box);

    function render() {
      wrap.innerHTML = "";
      const ul = T.el("ul", "tool-checklist");
      CAR_ITEMS.forEach(function (item, i) {
        const li = T.el("li");
        li.style.cursor = "pointer";
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = !!checks[i];
        cb.style.marginRight = "8px";
        const lab = T.el("span", "", item[0] + " " + T.esc(item[1]));
        li.appendChild(cb); li.appendChild(lab);
        li.addEventListener("click", function (e) {
          if (e.target !== cb) cb.checked = !cb.checked;
          checks[i] = cb.checked;
          ctx.set("checks", checks);
        });
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
      wrap.innerHTML += T.progress(Math.round(checks.filter(Boolean).length / CAR_ITEMS.length * 100));
      const last = ctx.get("lastDate");
      wrap.appendChild(T.el("p", "tool-tip", last ? "🗓 最近一次完整安檢：" + T.esc(last) + "（超過一天請重新逐項確認）" : "🗓 尚未完成過完整安檢。"));
    }
    T.button(box, "✔ 全部確認完成", function () {
      if (!checks.every(Boolean)) return out.show("<p class='tool-warn'>還有項目沒打勾 — 開車前的偷懶，是用保險費和命在付帳。</p>");
      const d = new Date().toISOString().slice(0, 10);
      ctx.set("lastDate", d);
      checks = [false, false, false, false, false];
      ctx.set("checks", checks);
      render();
      out.show("<p>🎉 安檢完成，記錄日期 " + d + "。一路平安，慢就是快。</p>");
    });
    T.button(box, "清空勾選", function () {
      checks = [false, false, false, false, false];
      ctx.set("checks", checks);
      render(); out.hide();
    }, true);
    // 路怒暫停規則卡
    const card = T.el("div", "tool-card");
    card.innerHTML = "<h5 class='tool-card-title'>🧊 路怒暫停規則（貼在腦海儀表板上）</h5><ul class='tool-checklist'>" +
      [
        "被逼車／按喇叭：先深呼吸一次，假設對方是新手或真有急事 — 善意解釋讓你不下車對罵",
        "火氣上頭數到三：超過三拍還沒降，打開冷氣或音樂，物理降溫有效",
        "絕對不追車、不並排對看、不下車理論 — 贏了口氣，可能輸掉一切",
        "真被別車糾纏：鎖門、不眼神接觸、駛向人多的商店或警分局，必要時撥 110",
        "趕時間是最危險的狀態：提早 10 分鐘出門，比闖紅燈省下的 3 分鐘值錢",
      ].map(function (s) { return "<li>🛑 " + T.esc(s) + "</li>"; }).join("") + "</ul>";
    box.appendChild(card);
    render();
  };

  // ---- 4. 閱讀清冊 ----
  tools["4"] = function (box, ctx) {
    T.h(box, "📚 閱讀清冊（目標：每月至少一本）");
    const titleIn = T.textInput(box, "書名", "tk-bt", "例：投資最了不起的簡單常識");
    const authorIn = T.textInput(box, "作者", "tk-ba", "例：彼得·林區");
    const startIn = T.textInput(box, "開始日", "tk-bs", "2026-01-01");
    startIn.type = "date";
    const books = ctx.get("books", []);

    function statusBadge(s) {
      return s === "想讀" ? "<span class='tool-bad'>🤔 想讀</span>"
        : s === "讀中" ? "<span class='tool-warn'>📖 讀中</span>"
        : "<span class='tool-good'>✅ 讀完</span>";
    }
    function render() {
      box.querySelectorAll(".tool-table-wrap, .tool-plan").forEach(function (n) { n.remove(); });
      if (books.length) {
        const rows = books.map(function (b, i) {
          return [T.esc(b.t), T.esc(b.a || "—"), T.esc(b.s || "—"), statusBadge(b.st),
            "<button class='tool-del' data-i='" + i + "'>✕</button>"];
        });
        T.table(box, ["書名", "作者", "開始日", "狀態", ""], rows);
        box.querySelectorAll(".tool-del").forEach(function (b) {
          b.addEventListener("click", function () {
            books.splice(parseInt(b.dataset.i, 10), 1);
            ctx.set("books", books);
            render();
          });
        });
      }
      // 狀態流轉
      const flow = T.el("div", "tool-plan");
      flow.innerHTML = "<h5 class='tool-card-title'>🔁 狀態流轉（想讀 → 讀中 → 讀完）</h5>";
      const pick = document.createElement("select");
      pick.className = "tool-input";
      books.forEach(function (b, i) {
        const op = document.createElement("option");
        op.value = String(i);
        op.textContent = "[" + b.st + "] " + b.t + (b.a ? "（" + b.a + "）" : "");
        pick.appendChild(op);
      });
      flow.appendChild(pick);
      box.appendChild(flow);
      const target = T.select(box, "要轉成…", "tk-st", ["想讀", "讀中", "讀完"]);
      T.button(box, "套用狀態", function () {
        const i = parseInt(pick.value, 10);
        if (isNaN(i)) return out.show("<p class='tool-warn'>先選一本書。</p>");
        const to = target.value;
        if (to === "讀完" && !books[i].note) {
          const note = window.prompt("歸檔前必填：用一句話說服自己 — 這本書你带走了什麼？", "");
          if (!note || !note.trim()) return out.show("<p class='tool-warn'>心得留空白就不歸檔。讀完卻說不出带走什麼，等於沒讀。</p>");
          books[i].note = note.trim();
        }
        books[i].st = to;
        if (to === "讀完") books[i].fin = new Date().toISOString().slice(0, 10);
        ctx.set("books", books);
        render();
      });
      // 年度統計
      const year = String(new Date().getFullYear());
      const finished = books.filter(function (b) { return b.st === "讀完" && (b.fin || "").indexOf(year) === 0; });
      const monthNow = new Date().getMonth() + 1;
      const stat = T.el("div", "tool-plan");
      const avg = (finished.length / monthNow).toFixed(1);
      stat.innerHTML = "<h5 class='tool-card-title'>📅 " + year + " 年度統計</h5>" +
        "<p>已讀完：<b class='tool-big'>" + finished.length + " 本</b>　月均：<b>" + avg + " 本</b>（目標 1 本/月）</p>" +
        T.progress(Math.min(100, Math.round(finished.length / 12 * 100))) +
        (parseFloat(avg) >= 1 ? "<p>🎉 穩定運轉中，繼續輪著讀：財經、傳記、歷史。</p>"
          : "<p class='tool-warn'>月均未達 1 本。秘訣：床頭放實體書、手機放客廳充電。</p>");
      box.appendChild(stat);
      // 心得列表
      const noted = books.filter(function (b) { return b.note; });
      if (noted.length) {
        const txt = year + " 讀書心得（" + noted.length + " 條）\n" +
          noted.map(function (b) { return "・《" + b.t + "》" + (b.a ? b.a + "｜" : "") + b.note; }).join("\n");
        T.copyBlock(box, txt);
      }
      out.hide();
    }

    T.button(box, "＋ 加入書單", function () {
      const t = titleIn.value.trim();
      if (!t) return out.show("<p class='tool-warn'>書名必填。</p>");
      const dup = books.some(function (b) { return b.t === t && b.st !== "讀完"; });
      if (dup) return out.show("<p class='tool-warn'>《" + T.esc(t) + "》已在書單中。</p>");
      books.push({ t: t, a: authorIn.value.trim(), s: startIn.value || new Date().toISOString().slice(0, 10), st: "想讀", note: "" });
      ctx.set("books", books);
      titleIn.value = ""; authorIn.value = ""; startIn.value = "";
      render();
    });
    T.button(box, "清空全部", function () {
      if (confirm("確定清空整份閱讀清冊？（含心得）")) { ctx.del("books"); render(); }
    }, true);
    const out = T.resultBox(box);
    render();
  };

  (window.LEARN_TOOLS = window.LEARN_TOOLS || {})["lifestyle"] = tools;
})();
