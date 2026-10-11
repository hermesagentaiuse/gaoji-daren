# 高級大人成長手冊 🥃

在台灣，一步一步成為更厲害、更認真的大人。

一個純靜態網站（無框架、無 build）：左側 sidebar 分類、上方 header、右側內容區隨點擊切換；自己的財經分析站以 iframe 內嵌在右側內容區呈現，不會跳走。

## 使用方式

- **打卡進度**存在瀏覽器 localStorage，換裝置不會帶過去（之後可改成 commit 到 repo）。
- **路由**：`#/home` 總覽、`#/cat/<id>` 分類、`#/finance/<id>` 財經站。

## 新增分類

打開 `config.js`，在 `categories` 陣列加一筆：

```js
{
  id: "reading",            // 唯一 id（英文）
  icon: "📚",
  title: "閱讀清單",
  items: [
    { text: "條目文字", note: "選填備註" },
  ],
}
```

## 新增財經分析站（連結到其他 GitHub Pages）

在 `financeLinks` 陣列加一筆：

```js
{ id: "my-new-site", icon: "📈", title: "我的新分析站", url: "https://hermesagentaiuse.github.io/my-new-site/" }
```

右側內容區會以 iframe 載入該站。若目標站禁止內嵌（X-Frame-Options），會自動顯示「在新分頁開啟」按鈕。

## 部署

GitHub Pages（Branch: main / root）。推上去即上線。
