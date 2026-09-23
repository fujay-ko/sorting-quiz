# 排序演算法實作評量 (Sorting Quiz)

用於評量與練習常見排序演算法（插入排序、選擇排序、氣泡排序）的網頁工具。

## 檔案說明

| 檔案 | 說明 |
| --- | --- |
| `index.html` | 入口頁：測驗版／練習版連結 |
| `exam.html` | 【測驗版】正式評量。提交後才顯示分數與正解，成績自動上傳至 Google 試算表；提交後預設鎖定（不可重考）；作答自動暫存，重整不怕資料遺失 |
| `practice.html` | 【練習版】填滿一輪即時批改＋顯示正解＋可單輪重試，附排序法說明 |
| `config.js` | 【老師設定】班級、座號、題數、計分、上傳網址——只改這支即可 |
| `quiz-core.js` | 共用核心邏輯（出題、排序步驟、計分、渲染、上傳） |
| `tests/unit.test.js` | 核心邏輯單元測試（`node tests/unit.test.js`） |

## 老師使用流程

1. 打開 `config.js`，修改班級（`CLASSES`）、座號上限（`SEAT_MAX`）、題數（`N`）、計分（`LAST_MAX`）、Apps Script 網址（`SCRIPT_URL_EXAM`／`SCRIPT_URL_PRACTICE`）。
2. 若要防偽造上傳，在 `config.js` 設定 `SHARED_TOKEN`，並在 Apps Script 端檢查 `e.parameter.token` 是否相同。
3. 把全班帶到 `exam.html` 作答；成績會逐筆寫入 Google 試算表。傳送失敗時頁面會顯示「重新傳送成績」按鈕，也可重新整理還原成績畫面。
4. 列印成績：提交後按「列印成績」（只列印批改結果）。
5. 想開放學生重考：把 `config.js` 的 `ALLOW_RETAKE` 設為 `true`。

## 上傳欄位對照（FormData POST）

| 欄位 | 內容 |
| --- | --- |
| `timestamp` | 提交時間（`zh-TW` 本機字串） |
| `class` / `seat` / `studentName` | 班級／座號／姓名 |
| `score1` / `score2` / `score3` / `total` | 選擇／插入／氣泡分數／總分 |
| `numbers` | 原始題目數字（逗點分隔） |
| `token` | 防偽字串（對應 `config.js` 的 `SHARED_TOKEN`，未設定則為空字串） |

## 部署方式

純靜態檔案，無需後端伺服器（成績上傳走 Google Apps Script）：

- 最簡單：雙擊 `index.html` 在本機瀏覽器開啟（同一資料夾的 `config.js`／`quiz-core.js` 須一起保留）。
- 課堂使用：上傳整個資料夾到任意靜態主機（GitHub Pages、Netlify、校內主機皆可）。

## 單元測試

```bash
node tests/unit.test.js
```

驗證三種排序的分輪答案、計分公式（差一格扣一分）、隨機出題不重複、設定滿分 100 分、HTML 跳脫。

## 已知限制（工程面）

- **客戶端防弊有限**：題目與正解都在瀏覽器產生，看原始碼可取得答案。正式測驗請配合監考；若需嚴格防弊，應以後端驗證取代前端批改。
- **防偽 token 為基本防護**：可擋隨意偽造的上傳，但無法擋取得 token 的刻意攻擊。
- **作答草稿存於本機 `localStorage`**：同一瀏覽器才能還原；換裝置無法接續。

## 技術規格

- 純 HTML/CSS/JavaScript，不需額外後端伺服器（成績上傳除外）。
- 整合 Google Apps Script 進行成績收集。
- 採用響應式設計，支援行動裝置與列印功能。
