// =====================================================
// quiz-core.js — 考試版與練習版共用的核心邏輯（純函式 + DOM 渲染）
// 瀏覽器：以 <script> 載入後直接使用全域函式；
// Node.js：可用 require('./quiz-core.js') 做單元測試。
// =====================================================

const MIN_NUM = 2;
const MAX_NUM = 98;

// 將使用者輸入的姓名等文字做 HTML 跳脫，避免 XSS
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 產生 N 個不重複的隨機數字，範圍 [min, max]
function rand(N, min, max) {
  min = min == null ? MIN_NUM : min;
  max = max == null ? MAX_NUM : max;
  const a = [];
  while (a.length < N) {
    const n = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!a.includes(n)) a.push(n);
  }
  return a;
}

// 選擇排序：每輪找出未排序部分最小值放到前端
function selSteps(a) {
  a = [...a]; const s = [];
  for (let i = 0; i < a.length - 1; i++) {
    let m = i;
    for (let j = i + 1; j < a.length; j++) if (a[j] < a[m]) m = j;
    [a[i], a[m]] = [a[m], a[i]]; s.push([...a]);
  }
  return s;
}

// 插入排序：每輪取一個元素插入已排序部分的正確位置
function insSteps(a) {
  a = [...a]; const s = [];
  for (let i = 1; i < a.length; i++) {
    let k = a[i], j = i - 1;
    while (j >= 0 && a[j] > k) { a[j + 1] = a[j]; j--; }
    a[j + 1] = k; s.push([...a]);
  }
  return s;
}

// 氣泡排序：每輪相鄰比較交換，最大值浮至末端
function bubSteps(a) {
  a = [...a]; const s = [];
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) if (a[j] > a[j + 1]) [a[j], a[j + 1]] = [a[j + 1], a[j]];
    s.push([...a]);
  }
  return s;
}

// 依一組數字產生三種排序法的分輪答案 {1, 2, 3}
function makeAnswers(nums) {
  return { 1: selSteps(nums), 2: insSteps(nums), 3: bubSteps(nums) };
}

// 統計逐格答對數
function countHits(correct, vals) {
  let hits = 0;
  for (let i = 0; i < correct.length; i++) if (vals[i] === correct[i]) hits++;
  return hits;
}

// 計分：每輪「差 1 個扣 1 分」（滿分 = 答對數 - 1，0 分下限）
// lastMax：最後一輪的滿分；maxRound：一般輪滿分。
function scoreRound(correct, vals, lastMax, maxRound, isLast) {
  const hits = countHits(correct, vals);
  const maxPts = isLast ? lastMax : maxRound;
  const pts = Math.min(maxPts, Math.max(0, hits - 1));
  return { hits, pts };
}

// 統一上傳成績：帶 8 秒逾時，回傳 { ok, timedOut }
async function sendScore(url, payload, timeoutMs) {
  timeoutMs = timeoutMs || 8000;
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => fd.append(k, v));
  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    await fetch(url, { method: 'POST', body: fd, signal: ctrl.signal });
    clearTimeout(tid);
    return { ok: true };
  } catch (e) {
    clearTimeout(tid);
    return { ok: false, timedOut: e.name === 'AbortError' };
  }
}

// 渲染「原始資料」數字格
function renderChips(el, arr) {
  el.innerHTML = arr.map(n => `<div class="chip">${n}</div>`).join('');
}

// 產生某排序法的分輪輸入列與正解列（withRetry 為 true 時每輪加「重試」鈕）
function renderRows(containerId, q, R, N, withRetry) {
  const c = document.getElementById(containerId);
  c.innerHTML = '';
  for (let r = 1; r <= R; r++) {
    const inputs = Array.from({ length: N }, (_, i) =>
      `<input type="number" id="q${q}r${r}i${i}" placeholder="?" aria-label="排序${q}第${r}輪第${i + 1}格">`
    ).join('');
    const retry = withRetry ? `<button type="button" class="btn-round" data-q="${q}" data-r="${r}" aria-label="重試第${r}輪" title="重試此輪">↺ 重試此輪</button>` : '';
    const d = document.createElement('div');
    d.innerHTML = `<div class="rnd"><div class="rnd-lbl">第${r}輪→</div><div class="rnd-inputs" role="group" aria-label="第${r}輪輸入">${inputs}</div><div class="stag-score" id="st${q}${r}" aria-live="polite"></div>${retry}</div><div class="ans-row" id="ar${q}${r}"><span class="ans-lbl">正解：</span></div>`;
    while (d.firstElementChild) c.appendChild(d.firstElementChild);
  }
}

// 標記某一輪的對錯、分數與正解
function markRound(q, r, correct, vals, pts, maxPts) {
  for (let i = 0; i < correct.length; i++) {
    const el = document.getElementById(`q${q}r${r}i${i}`);
    if (el) el.className = vals[i] === correct[i] ? 'ok' : 'err';
  }
  const st = document.getElementById(`st${q}${r}`);
  if (st) {
    st.textContent = `${pts}分`;
    st.className = `stag-score show ${pts === maxPts ? 'sp-full' : pts > 0 ? 'sp-part' : 'sp-zero'}`;
  }
  const ar = document.getElementById(`ar${q}${r}`);
  if (ar) {
    ar.className = 'ans-row show';
    ar.innerHTML = `<span class="ans-lbl">正解：</span>` + correct.map(n => `<span class="ans-chip">${n}</span>`).join('');
  }
}

// 讀取某一輪作答：emptyNull=true 時空格回傳 null，否則回傳 0
function getRoundVals(q, r, N, emptyNull) {
  return Array.from({ length: N }, (_, i) => {
    const el = document.getElementById(`q${q}r${r}i${i}`);
    const v = el ? el.value : '';
    if (v === '') return emptyNull ? null : 0;
    return parseInt(v, 10) || 0;
  });
}

// 記憶／載入最近一次學生資料
function saveStudent(key, cl, se, nm) {
  try { localStorage.setItem(key, JSON.stringify({ cl, se, nm })); } catch (e) {}
}

function loadStudent(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; }
}

// 將選項填入 select（保留原有的「請選擇」第一個 option）
function fillOptions(selectId, values) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  values.forEach(v => {
    const o = document.createElement('option');
    o.textContent = v;
    sel.appendChild(o);
  });
}

// ---- Node.js 單元測試用匯出（瀏覽器不需要）----
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MIN_NUM, MAX_NUM, esc, rand, selSteps, insSteps, bubSteps, makeAnswers,
    countHits, scoreRound, sendScore, renderChips, renderRows, markRound,
    getRoundVals, saveStudent, loadStudent, fillOptions
  };
}