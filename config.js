// =====================================================
// 【老師設定區】請在下方修改各項設定
// =====================================================

// 1. 成績上傳至 Google 試算表的 Apps Script 網址
//    - 測驗版網址（exam.html 使用）
const SCRIPT_URL_EXAM = 'https://script.google.com/macros/s/AKfycbyYaUPvEzxZlYmfRgEeNp-35r44br0L20rRbnrnQe8KNw7bAfJBE2kk1UUivrdIfKY/exec';
//    - 練習版網址（practice.html 使用，若不上傳可保留樣板字串）
const SCRIPT_URL_PRACTICE = '貼上您的_Apps_Script_網址_在此';

// 2. 防偽 token（選用）
//    若您的 Apps Script 端有檢查 token（例如 e.parameter.token 是否等於此值），
//    請在此填入同一字串；留空表示不上傳 token（僅共用網址時可保護成績不被偽造）。
const SHARED_TOKEN = '';

// 3. 班級列表（選單中顯示；非數字亦可，例如 '高一甲'）
const CLASSES = [801, 802, 803, 804, 805, 806, 807, 808, 809, 810, 811, 812, 813, 814, 815];

// 4. 座號上限（選單會產生 1 ~ SEAT_MAX）
const SEAT_MAX = 32;

// 5. 出題與計分設定
const CONFIG = {
  N: 7,                      // 題目數字個數
  LAST_MAX: [4, 3, 3],       // 各演算法「最後一輪」滿分：選擇 / 插入 / 氣泡
  ALLOW_RETAKE: false        // 測驗版提交後是否允許重新出題再考（false=鎖定，只交一次）
};

// ---- 以下由上方設定自動計算，請勿修改 ----
CONFIG.R = CONFIG.N - 1;
CONFIG.MAX_ROUND_SCORE = CONFIG.N - 1;
CONFIG.TOTAL_MAX = (CONFIG.R - 1) * CONFIG.MAX_ROUND_SCORE * 3 + CONFIG.LAST_MAX.reduce((a, b) => a + b, 0);

// ---- Node.js 單元測試用匯出（瀏覽器不需要）----
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SCRIPT_URL_EXAM, SCRIPT_URL_PRACTICE, SHARED_TOKEN, CLASSES, SEAT_MAX, CONFIG };
}