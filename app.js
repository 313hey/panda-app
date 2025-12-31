const STORAGE_KEY = "cd_mission_completed_tasks_v1";
const TOTAL_TASKS = 6;

function getCompletedSet() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch (e) {
    return new Set();
  }
}

function saveCompletedSet(set) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

function markComplete(taskId) {
  const s = getCompletedSet();
  s.add(taskId);
  saveCompletedSet(s);
}

function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
}

function percent() {
  const s = getCompletedSet();
  return Math.round((s.size / TOTAL_TASKS) * 100);
}

function renderProgress() {
  const s = getCompletedSet();
  const p = percent();
  const bar = document.getElementById("progress-bar");
  const txt = document.getElementById("progress-text");
  if (bar) bar.style.width = `${p}%`;
  if (txt) txt.textContent = `${p}% (${s.size}/${TOTAL_TASKS})`;
}

function badgeText(taskId, done) {
  const map = {
    "t1": "🐼 熊猫文化 Panda Culture",
    "t2": "🌿 保护行动 Conservation",
    "t3": "🍜 成都味道 Chengdu Food",
    "t4": "🗿 三星堆 Sanxingdui",
    "t5": "🎭 川剧与变脸 Sichuan Opera",
    "t6": "🧭 城市礼仪 City Etiquette"
  };
  return (done ? "✅ " : "⬜ ") + (map[taskId] || taskId);
}