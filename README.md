# 施宥丞 Craig Shih — 個人作品集

線上作品集網站，純靜態、無框架、無建置流程，直接放 GitHub Pages 就會動。
搭配一頁履歷 PDF 使用：**履歷講「我是誰」，這個網站負責「證明」。**

網址：<https://craigshih.github.io>

```
.
├── index.html            ← 首頁（Bento 卡片版面：自介、數字、精選作品、經歷、競賽、能力、聯絡）
├── en/                   ← 英文版（index.html + en/work/ 八個案例頁），右上角 中文 / EN 切換
├── work/                 ← 每個案例一頁，可以單獨分享連結
│   ├── amazon-campus.html   01 亞馬遜跨境電商人才培育計畫
│   ├── amazon-social.html   02 亞馬遜全球開店 社群全棧運營
│   ├── onus.html            03 On-us 台灣市場 0 到 1
│   ├── dreamloan.html       04 夢想銀號 四平台社群
│   ├── bourgeois.html       05 布爾喬亞 金融科技客戶策略
│   ├── bm7.html             06 Bm7 詞曲創作大賽
│   ├── radio.html           07 想見鬼想見鬼想見鬼
│   └── finance-hub.html     08 Craig 財經站
├── assets/css/site.css   ← 全站樣式（紅・黑・黃；顏色、字體、圓角都在最上面 :root）
├── assets/js/site.js     ← 手機選單、捲動進場、圖片燈箱
├── assets/img/           ← 圖片（WebP）；portrait.jpg 與 og.jpg 給社群分享預覽用
├── assets/cv/            ← 一頁履歷 PDF（首頁與聯絡區的「下載履歷」按鈕）
├── assets/logos/         ← 經歷時間軸的品牌 logo（取自各公司官網）
├── sitemap.xml / robots.txt
└── README.md
```

## 更新方式

| 想改什麼 | 找哪裡 |
|---|---|
| 顏色、字體、圓角 | `assets/css/site.css` 最上面 `:root{ }`（下面那段是深色模式） |
| 首屏標語、求職狀態 | `index.html` 的 `hero-main` |
| 首頁四個數字 | `index.html` 的 `card stat` |
| 財經站卡片 | `index.html` 的 `card inv c-7 feature` |
| 經歷時間軸 | `index.html` 的 `<ul class="timeline">` |
| 案例內容 | `work/` 底下對應的檔案 |
| 新增一個案例 | 複製一個 `work/*.html` 改內容，再到首頁 `#work` 複製一張 `card work`，記得改上一頁／下一頁連結與 `sitemap.xml` |

### 圖片

- 新圖請先轉成 WebP（寬度 1400px 以內），放進 `assets/img/`。可用 [Squoosh](https://squoosh.app) 線上轉檔。
- `<img>` 請保留 `width`、`height`（避免版面跳動）與 `loading="lazy"`。
- 案例頁圖庫：照片用一般 `<img>`；截圖、證書這類要完整顯示的加 `class="doc"`。
- 加上 `data-lb` 的圖片點了會放大；同一個 `data-lb-group` 內可以左右切換。

### 版面卡片

首頁和案例頁都用 12 欄網格 `.bento`，卡片用 `c-3 / c-4 / c-5 / c-6 / c-7 / c-8 / c-12` 決定寬度，平板與手機會自動改成兩欄／一欄。
卡片樣式：`card`（白）、`card grad`（漸層）、`card inv`（深色）、`card soft`（淡紅）。

改完存檔 → push 到 GitHub → 約 1 分鐘後網站更新。

## 個資揭露

這是公開網頁且會被 Google 索引，所以刻意**沒有**放入：手機號碼、出生年月日、身分證字號（原 PDF 的樂利豐工作證明、金融研訓院證照、勞保投保明細上都有）、學位證書與語言成績單掃描。這些留在給特定公司的 PDF 履歷裡就好。

## 資料待確認

原始 PDF 有幾處前後不一致：

1. **Amazon 實習期間** — 一頁簡歷寫 `2025.9–2025.12`，內頁標頭寫 `2025/9–2025/11`。網站寫「2025 秋」規避，但履歷 PDF 記得統一。
2. **布爾喬亞期間** — 第 1 頁標頭寫 `2024/10–2025/03`，其他頁寫 `2024/10–2025/06`。網站採用 **2024.10 – 2025.06**。
3. **夢想銀號 Shorts 最高觀看** — 個人經歷寫「10,000 人次／136 按讚」，社群作品集寫「20,000 人次／500 按讚」。網站採用 **2 萬／500**。

**另外**：社群作品集 PDF 裡有幾條 Canva 與 Google Docs 的 `/edit` 連結。如果那些檔案設為公開，任何拿到連結的人都能**編輯**你的原始檔。建議改成「檢視」權限。

## 技術說明

- 純 HTML + CSS + 少量原生 JS，零相依套件、零建置流程
- 字體：Google Fonts 的 Inter（英數）+ Noto Sans TC（中文）
- 響應式：手機 / 平板 / 桌機；手機版有選單按鈕
- 自動跟隨系統的淺色 / 深色模式
- SEO：每頁獨立 title / description / canonical、Open Graph 分享圖、JSON-LD 個人資料、sitemap
- 無障礙：「跳到主要內容」連結、鍵盤可操作的燈箱（← → 切換、Esc 關閉）、可見 focus 框、尊重 `prefers-reduced-motion`
- 圖示：[Lucide](https://lucide.dev)（ISC 授權）以內嵌 SVG 使用；「關於我」與 UX／UI 競賽卡的插圖是自製 SVG，顏色跟著深淺色模式變
- 作品封面、競賽插圖：自製動畫 SVG，直接寫在 HTML 裡（`class="cover-art"` / `art-thumb`），動畫用 `site.css` 的 `.fx-*` class
- 工具圖示：[Simple Icons](https://simpleicons.org)（CC0）品牌圖示；ManyChat 與 Prompt 設計用 Lucide 通用圖示
- 品牌 logo：Amazon 取自 Simple Icons；On-us、布爾喬亞（VOCAL MIDDLE）、夢想銀號、政大、政大之聲取自各自官網。樂利豐、非我設計、存在音樂找不到官方 logo，用文字徽章代替
- 動態背景：`.bg-fx`（漂移色塊 + 點陣）、卡片游標光暈、頂部捲動進度條；系統開啟「減少動態效果」時全部停止
- CSS / JS 連結帶 `?v=` 版本參數（檔案內容雜湊），改完記得更新，避免訪客看到舊樣式
- 中英雙語：中文在 `/`，英文在 `/en/`，每頁都有 hreflang 互相指向。改中文內容時，記得同步改 `en/` 底下對應的檔案
- 首屏：大字姓名＋印章動畫、旋轉的 OPEN TO WORK 徽章、股價看板跑馬燈（台股紅漲 ▲）、數字卡進場時從 0 跑到目標值
- 配色只有深色版（紅 #E5402B、黃 #FFC83D、黑 #0C0C0D）
- 星座背景：`.bg-fx .stars` canvas，點會彼此連線、靠近游標時連到游標（只在有滑鼠時）
- 跨界座標：首頁 `#map`，中心 Q 版頭像、三顆星球（傳播／科技／商業）各四個技能；內容在產生器的 `map` 設定，點星球切換右側說明與相關案例
- 角落 hashtag：左下角打字機輪播履歷上的 #跨域轉譯家 等標籤（寬螢幕才顯示）
