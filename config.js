// ============================================================
// 自我修養 — 網站設定檔
// 想要新增分類或外部站點，只需要改這個檔案，不用碰 HTML/CSS/JS
// ============================================================
window.SITE_CONFIG = {
  siteName: "自我修養",
  tagline: "在台灣，一步一步成為更厲害、更認真的大人。",
  owner: "Jason",

  // ---- 分類（sidebar 上半部）----
  // icon: emoji 或任何字元 | title: 顯示名稱
  // items: { text: 條目文字, note: 給自己的備註（選填）}
  categories: [
    {
      id: "mindset",
      icon: "🧠",
      title: "心態與修養",
      items: [
        { text: "情緒不上桌：生氣時做的決定，醒來後都要付錢", note: "生氣先睡一覺，隔天再回信" },
        { text: "守信：答應的時間、金額、範圍，一字不改地做到" },
        { text: "不辯贏，講證據：用數據和事實說話，不用音量說話" },
        { text: "承認「我不知道」比硬講高級一百倍" },
        { text: "每日覆盤 10 分鐘：今天哪句話可以不說、哪件事可以做得更好" },
        { text: "長期主義：別人看一年，你看五年" },
      ],
    },
    {
      id: "money",
      icon: "💰",
      title: "金錢與財務",
      items: [
        { text: "先存緊急預備金：6 個月生活費，放高利活存/MMF" },
        { text: "每月薪資先儲蓄再消費（pay yourself first）" },
        { text: "市值型 ETF（0050/006208 等）定期定額，攢時間復利" },
        { text: "保險保底：醫險＋實支實付＋失能，保費控制在年收入 10% 內" },
        { text: "看得懂財報三大表：資產負債表、損益表、現金流量表" },
        { text: "負債分好壞：能生錢的可留，消費性循環利息即刻清" },
        { text: "記帳 3 個月，抓出「無感開銷」前三名並砍掉" },
      ],
    },
    {
      id: "work",
      icon: "💼",
      title: "職場與專業",
      items: [
        { text: "回報有結構：結論先行 → 三個理由 → 需要對方做什麼" },
        { text: "Email 主旨寫清楚，內文三段完結，附件先確認再寄" },
        { text: "開會前發議程、開會後發會議紀錄＋行動項目＋負責人＋期限" },
        { text: "一技之長做到部門前 10%：別人想到這個問題就找你" },
        { text: "談加薪用貢獻與市場行情，不用個人困難" },
        { text: "離職見人品：交接文件寫到陌生人也能接手" },
      ],
    },
    {
      id: "social",
      icon: "🤝",
      title: "社交與應酬",
      items: [
        { text: "台灣商務禮儀：名片雙手遞、座位主次（面對門為上）" },
        { text: "敬酒杯沿低於長輩/客戶，不喝酒就明確說「以茶代酒」" },
        { text: "記住對方的名字與上次聊的小事，下次主動提起" },
        { text: "人情往來：紅白帖、請託、回饋，金額在行情 ±10% 內" },
        { text: "學會優雅地說不：「我評估後發現幫不上忙，不耽誤你時間」" },
        { text: "群組不抱怨、不傳未查證的消息" },
      ],
    },
    {
      id: "health",
      icon: "🏃",
      title: "健康與體態",
      items: [
        { text: "年度健檢不能省：血液、肝腎、糖尿病篩檢、性別專項" },
        { text: "每週 150 分鐘中等強度運動＋2 次力量訓練" },
        { text: "睡眠 7 小時固定時段，比補覺重要" },
        { text: "牙醫每半年洗牙一次，牙齒就是長期資產" },
        { text: "體態管理：合身的衣服比名牌高級" },
      ],
    },
    {
      id: "lifestyle",
      icon: "🍷",
      title: "生活與品味",
      items: [
        { text: "穿搭三原則：合身、整潔、場合正確（寧可正式一分）" },
        { text: "基本餐桌禮儀：西餐刀叉由外而內、中餐不翻魚不插筷" },
        { text: "會泡一杯像樣的咖啡/茶，招待客人有備而來" },
        { text: "開車禮儀：不搶快、讓行人、車內整潔無異味" },
        { text: "持續閱讀：每月至少一本書（財經、傳記、歷史輪著來）" },
      ],
    },
    {
      id: "law",
      icon: "⚖️",
      title: "法律與稅務",
      items: [
        { text: "報稅基本義務與權利：綜所稅按時申報、減除項目用好用滿" },
        { text: "租賃基本盤：租屋契約看清押金、修繕責任、提前終止條款" },
        { text: "預立遺囑的觀念：不立遺囑時法律怎麼分，你該知道" },
        { text: "簽約前讀細項：違約金、終止權、管轄法院，逐條看過再簽" },
        { text: "證據意識：借錢、合夥、大額交易一定留白紙黑字或訊息紀錄" },
      ],
    },
    {
      id: "family",
      icon: "🏠",
      title: "家庭與親密關係",
      items: [
        { text: "與父母談錢有邊界：孝順要透明，但不讓金錢模糊關係" },
        { text: "家庭開支共同規劃：共同帳本、共同決策，不靠其中一人硬扛" },
        { text: "伴侶吵架對事不對人：家事不外揚，不在氣頭上定罪" },
        { text: "父母的健康與財務主動盤點：健檢、保險、存戶，趁還來得及" },
        { text: "固定的家庭儀式感：每週一頓不滑手機的飯，說得出家人近況" },
      ],
    },
    {
      id: "emo",
      icon: "🧘",
      title: "心理與情緒",
      items: [
        { text: "辨認情緒而非壓抑：說得出「我現在是憤怒/失望/丟臉」，而不是只覺得「煩」" },
        { text: "焦慮拆結構：把模糊的擔心寫成具體問題，分清「能處理的」與「只能接受的」" },
        { text: "設立人際界線：敢讓別人對你失望，不把別人的情緒全扛成自己的責任" },
        { text: "自我對話換軌：像對待好朋友一樣跟自己說話，嚴厲但不羞辱" },
        { text: "懂得何時求助：持續兩週以上的失眠、食慾、情緒變化，就該找專業（1925 安心專線）" },
      ],
    },
    {
      id: "digital",
      icon: "💻",
      title: "數位與資訊素養",
      items: [
        { text: "密碼管理：每個重要帳號獨立密碼＋密碼管理器＋兩步驟驗證，不再一支好記走遍天下" },
        { text: "詐騙辨識：異常時效、要求保密、異常付款管道——三者出現其一就停下來查證" },
        { text: "訊息查核：看到會讓你生氣或想轉發的，先查來源與日期再決定" },
        { text: "雲端資料備份：3-2-1 原則，重要檔案至少三份副本、兩種媒介、一份異地" },
        { text: "數位足跡管理：每年搜一次自己的名字，清掉不想被看見的過去" },
      ],
    },
  ],

  // ---- 股市教學（sidebar 單一入口；內容存放在 learn/stocks.json）----
  stockLearning: {
    id: "stocks",
    icon: "📈",
    title: "朱家泓·股市教學",
    source: "理周教育學苑 朱家泓 教學 playlist（100 支影片）",
    playlistUrl: "https://youtube.com/playlist?list=PLa0dxLD5Sk23lON5CTiAov8sN3naeuHFH",
  },

  // ---- 古籍夜讀（sidebar 單一入口；內容存放在 learn/books.json）----
  bookLearning: {
    id: "books",
    icon: "📜",
    title: "枕書夜話·古籍夜讀",
    source: "YouTube 頻道「枕書夜話」30 分鐘讀完一部古籍",
    playlistUrl: "https://www.youtube.com/channel/UC4DNU7jSBRMFMefFUZsdPAA",
  },

  // ---- 財務分析站（sidebar 下半部）----
  // 點進來右側內容區會以 iframe 載入；網站擋內嵌時自動提示「在新分頁開啟」
  // 新增站點：往這個陣列加一筆 { id, title, icon, url } 即可
  // ---- 遊戲（sidebar 單一入口；iframe 內嵌）----
  gameLinks: [
    {
      id: "three-kingdoms",
      icon: "🎮",
      title: "三國蝴蝶·文字遊戲",
      url: "https://hermesagentaiuse.github.io/three-kingdoms/",
    },
  ],

  financeLinks: [
    {
      id: "analyst-dashboard",
      icon: "📊",
      title: "分析師儀表板",
      url: "https://hermesagentaiuse.github.io/analyst-dashboard/",
    },
    {
      id: "serenity-watch",
      icon: "🐦",
      title: "Serenity 追蹤",
      url: "https://hermesagentaiuse.github.io/serenity-watch/",
    },
    // 範例：之後要加新的財經站，照格式加在這裡
    // { id: "my-new-site", icon: "📈", title: "我的新分析站", url: "https://hermesagentaiuse.github.io/my-new-site/" },
  ],
};
