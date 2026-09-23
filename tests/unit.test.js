// 單元測試：驗證 quiz-core.js 純函式（出題步驟、答對數、計分、跳脫）
// 執行方式：node tests/unit.test.js（零依賴，使用 node:assert）
const assert = require('node:assert/strict');
const { CONFIG, CLASSES, SEAT_MAX } = require('../config.js');
const qc = require('../quiz-core.js');

let passed = 0;
function check(name, fn) {
  try {
    fn();
    passed++;
    console.log(`ok - ${name}`);
  } catch (e) {
    console.error(`FAIL - ${name}`);
    console.error(e.message);
    process.exitCode = 1;
  }
}

// 1. 三種排序的分輪答案（經典範例 [5,3,8,1,2]）
check('selSteps 產生正確分輪', () => {
  assert.deepEqual(qc.selSteps([5, 3, 8, 1, 2]), [
    [1, 3, 8, 5, 2],
    [1, 2, 8, 5, 3],
    [1, 2, 3, 5, 8],
    [1, 2, 3, 5, 8]
  ]);
});

check('insSteps 產生正確分輪', () => {
  assert.deepEqual(qc.insSteps([5, 3, 8, 1, 2]), [
    [3, 5, 8, 1, 2],
    [3, 5, 8, 1, 2],
    [1, 3, 5, 8, 2],
    [1, 2, 3, 5, 8]
  ]);
});

check('bubSteps 產生正確分輪', () => {
  assert.deepEqual(qc.bubSteps([5, 3, 8, 1, 2]), [
    [3, 5, 1, 2, 8],
    [3, 1, 2, 5, 8],
    [1, 2, 3, 5, 8],
    [1, 2, 3, 5, 8]
  ]);
});

check('makeAnswers 一次產生三種答案', () => {
  const a = qc.makeAnswers([5, 3, 8, 1, 2]);
  assert.deepEqual(Object.keys(a).sort(), ['1', '2', '3']);
  assert.deepEqual(a[1][0], [1, 3, 8, 5, 2]);
  assert.deepEqual(a[3][3], [1, 2, 3, 5, 8]);
});

// 2. 答對數與計分（一般輪滿分 6、最後一輪依演算法 4/3/3）
check('countHits 統計逐格答對', () => {
  assert.equal(qc.countHits([1, 2, 3], [1, 9, 3]), 2);
  assert.equal(qc.countHits([1, 2, 3], [0, 0, 0]), 0);
});

check('scoreRound 全對拿滿分', () => {
  const full = [1, 2, 3, 4, 5, 6, 7];
  assert.deepEqual(qc.scoreRound(full, [...full], 4, 6, false), { hits: 7, pts: 6 });
  assert.deepEqual(qc.scoreRound(full, [...full], 4, 6, true), { hits: 7, pts: 4 });
});

check('scoreRound 差一格扣一分、全錯得零分', () => {
  assert.deepEqual(qc.scoreRound([1, 2, 3], [1, 2, 9], 4, 6, false), { hits: 2, pts: 1 });
  assert.deepEqual(qc.scoreRound([1, 2, 3], [0, 0, 0], 4, 6, false), { hits: 0, pts: 0 });
  // 最後一輪滿分上限仍受限
  assert.deepEqual(qc.scoreRound([1, 2, 3, 4, 5, 6, 7], [1, 2, 3, 4, 5, 6, 0], 3, 6, true), { hits: 6, pts: 3 });
});

// 3. 隨機出題：個數正確、不重複、範圍內
check('rand 產生 N 個不重複數字', () => {
  const a = qc.rand(7);
  assert.equal(a.length, 7);
  assert.equal(new Set(a).size, 7);
  assert.ok(a.every(n => n >= 2 && n <= 98));
});

// 4. 設定一致性：預設滿分 100
check('TOTAL_MAX 預設為 100', () => {
  assert.equal(CONFIG.N, 7);
  assert.deepEqual(CONFIG.LAST_MAX, [4, 3, 3]);
  assert.equal(CONFIG.TOTAL_MAX, 100);
  assert.equal(CLASSES.length > 0, true);
  assert.equal(SEAT_MAX, 32);
});

// 5. HTML 跳脫
check('esc 跳脫危險字元', () => {
  assert.equal(
    qc.esc('<img src=x onerror=alert(1)>'),
    '&lt;img src=x onerror=alert(1)&gt;'
  );
  assert.equal(qc.esc('王小明'), '王小明');
});

console.log(`\n${passed} tests passed${process.exitCode ? ' (with failures)' : ''}`);
