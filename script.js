const STORAGE_KEYS = {
  tasks: "daily-level-up:tasks",
  completions: "daily-level-up:completions",
  notes: "daily-level-up:notes",
  taskSnapshots: "daily-level-up:task-snapshots",
  lastQuote: "daily-level-up:last-quote",
  theme: "daily-level-up:theme",
};

const DEFAULT_TASKS = [
  "Sholat 5 Waktu",
  "Sarapan",
  "Makan Siang",
  "Makan Malam",
  "Workout / Boxing",
  "Minum Air Yang Cukup",
  "Daily Notes",
];

const QUOTES = [
  "Satu checklist kecil hari ini bisa jadi momentum besar besok.",
  "Level up tidak harus dramatis, yang penting konsisten.",
  "Kerjakan yang bisa dikendalikan, lalu biarkan progres berbicara.",
  "Hari yang rapi dimulai dari satu aksi yang diselesaikan.",
  "Fokus pada langkah berikutnya, bukan seluruh tangga.",
  "Disiplin sederhana mengalahkan motivasi yang datang sesekali.",
];

const state = {
  tasks: [],
  completions: {},
  notes: {},
  taskSnapshots: {},
  todayKey: getDateKey(),
  pendingDeleteId: null,
};

const elements = {
  todayDate: document.querySelector("#todayDate"),
  dailyQuote: document.querySelector("#dailyQuote"),
  progressPercent: document.querySelector("#progressPercent"),
  progressFill: document.querySelector("#progressFill"),
  totalTasks: document.querySelector("#totalTasks"),
  completedTasks: document.querySelector("#completedTasks"),
  remainingTasks: document.querySelector("#remainingTasks"),
  statPercent: document.querySelector("#statPercent"),
  weeklyPercent: document.querySelector("#weeklyPercent"),
  weeklyFill: document.querySelector("#weeklyFill"),
  weeklyCompleted: document.querySelector("#weeklyCompleted"),
  weeklyTarget: document.querySelector("#weeklyTarget"),
  monthlyPercent: document.querySelector("#monthlyPercent"),
  monthlyFill: document.querySelector("#monthlyFill"),
  monthlyCompleted: document.querySelector("#monthlyCompleted"),
  monthlyTarget: document.querySelector("#monthlyTarget"),
  taskForm: document.querySelector("#taskForm"),
  taskInput: document.querySelector("#taskInput"),
  taskList: document.querySelector("#taskList"),
  dailyNotes: document.querySelector("#dailyNotes"),
  notesStatus: document.querySelector("#notesStatus"),
  exportButton: document.querySelector("#exportButton"),
  themeToggle: document.querySelector("#themeToggle"),
  historyDate: document.querySelector("#historyDate"),
  historyTaskList: document.querySelector("#historyTaskList"),
  historyTotal: document.querySelector("#historyTotal"),
  historyCompleted: document.querySelector("#historyCompleted"),
  historyRemaining: document.querySelector("#historyRemaining"),
  historyPercent: document.querySelector("#historyPercent"),
  historyNotes: document.querySelector("#historyNotes"),
  deleteDialog: document.querySelector("#deleteDialog"),
  deleteTaskName: document.querySelector("#deleteTaskName"),
  cancelDeleteButton: document.querySelector("#cancelDeleteButton"),
  confirmDeleteButton: document.querySelector("#confirmDeleteButton"),
};

init();

function init() {
  applyTheme(readTheme());
  loadState();
  setupHistoryDateInput();
  renderHeader();
  renderTasks();
  renderNotes();
  renderHistory();
  bindEvents();
  startDateWatcher();
}

function bindEvents() {
  elements.taskForm.addEventListener("submit", handleAddTask);
  elements.taskList.addEventListener("click", handleTaskListClick);
  elements.dailyNotes.addEventListener("input", handleNotesInput);
  elements.exportButton.addEventListener("click", exportProgress);
  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.historyDate.addEventListener("change", renderHistory);
  elements.cancelDeleteButton.addEventListener("click", closeDeleteDialog);
  elements.confirmDeleteButton.addEventListener("click", confirmDeleteTask);
  elements.deleteDialog.addEventListener("click", handleDialogBackdropClick);
  elements.deleteDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDeleteDialog();
  });
  window.addEventListener("focus", handleDateChange);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) handleDateChange();
  });
}

function loadState() {
  state.tasks = readFromStorage(STORAGE_KEYS.tasks, null) ?? createDefaultTasks();
  state.completions = readFromStorage(STORAGE_KEYS.completions, {});
  state.notes = readFromStorage(STORAGE_KEYS.notes, {});
  state.taskSnapshots = readFromStorage(STORAGE_KEYS.taskSnapshots, {});

  ensureCompletionBucket(state.todayKey);
  migrateTaskSnapshots();
  ensureTaskSnapshot(state.todayKey);

  saveTasks();
  saveCompletions();
  saveTaskSnapshots();
}

function createDefaultTasks() {
  return DEFAULT_TASKS.map((text) => ({
    id: crypto.randomUUID(),
    text,
  }));
}

function renderHeader() {
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(today);

  elements.todayDate.textContent = formattedDate;
  elements.todayDate.dateTime = state.todayKey;
  elements.dailyQuote.textContent = getRandomQuote();
}

function getRandomQuote() {
  const lastQuoteIndex = Number(localStorage.getItem(STORAGE_KEYS.lastQuote));
  let randomIndex = Math.floor(Math.random() * QUOTES.length);

  if (QUOTES.length > 1) {
    while (randomIndex === lastQuoteIndex) {
      randomIndex = Math.floor(Math.random() * QUOTES.length);
    }
  }

  localStorage.setItem(STORAGE_KEYS.lastQuote, String(randomIndex));
  return QUOTES[randomIndex];
}

function renderTasks() {
  elements.taskList.innerHTML = "";

  if (state.tasks.length === 0) {
    elements.taskList.innerHTML =
      '<li class="empty-state">Belum ada task. Tambahkan satu langkah kecil untuk hari ini.</li>';
    updateStats();
    return;
  }

  const todayCompletedIds = getTodayCompletedIds();
  const fragment = document.createDocumentFragment();

  state.tasks.forEach((task) => {
    const isComplete = todayCompletedIds.includes(task.id);
    const item = document.createElement("li");
    item.className = `task-item${isComplete ? " is-complete" : ""}`;
    item.dataset.taskId = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = isComplete;
    checkbox.setAttribute("aria-label", `Tandai ${task.text} selesai`);

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.className = "delete-button";
    deleteButton.innerHTML = getTrashIcon();
    deleteButton.setAttribute("aria-label", `Hapus ${task.text}`);

    item.append(deleteButton, taskText, checkbox);
    fragment.append(item);
  });

  elements.taskList.append(fragment);
  updateStats();
}

function renderNotes() {
  elements.dailyNotes.value = state.notes[state.todayKey] ?? "";
}

function setupHistoryDateInput() {
  const yesterday = addDays(parseDateKey(state.todayKey), -1);

  elements.historyDate.max = state.todayKey;
  elements.historyDate.value = getDateKey(yesterday);
}

function handleAddTask(event) {
  event.preventDefault();

  const text = elements.taskInput.value.trim();
  if (!text) return;

  state.tasks.push({
    id: crypto.randomUUID(),
    text,
  });

  elements.taskInput.value = "";
  syncTodaySnapshot();
  saveTasks();
  saveTaskSnapshots();
  renderTasks();
  renderHistory();
}

function handleTaskListClick(event) {
  const taskItem = event.target.closest(".task-item");
  if (!taskItem) return;

  const taskId = taskItem.dataset.taskId;

  if (event.target.matches(".task-check")) {
    toggleTaskStatus(taskId, event.target.checked);
    taskItem.classList.toggle("is-complete", event.target.checked);
    updateStats();
    return;
  }

  if (event.target.closest(".delete-button")) {
    openDeleteDialog(taskId);
  }
}

function getTrashIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3 6h18" fill="none" stroke="currentColor" stroke-linecap="round" />
      <path d="M8 6V4h8v2" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M6 6l1 15h10l1-15" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M10 11v6" fill="none" stroke="currentColor" stroke-linecap="round" />
      <path d="M14 11v6" fill="none" stroke="currentColor" stroke-linecap="round" />
    </svg>
  `;
}

function toggleTaskStatus(taskId, isComplete) {
  const completedIds = new Set(getTodayCompletedIds());
  ensureTaskSnapshot(state.todayKey);

  if (isComplete) {
    completedIds.add(taskId);
  } else {
    completedIds.delete(taskId);
  }

  state.completions[state.todayKey] = [...completedIds];
  saveCompletions();
  saveTaskSnapshots();
}

function openDeleteDialog(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  state.pendingDeleteId = taskId;
  elements.deleteTaskName.textContent = task.text;

  if (typeof elements.deleteDialog.showModal === "function") {
    elements.deleteDialog.showModal();
    return;
  }

  if (window.confirm(`Hapus task "${task.text}"?`)) {
    confirmDeleteTask();
  } else {
    state.pendingDeleteId = null;
  }
}

function closeDeleteDialog() {
  state.pendingDeleteId = null;

  if (elements.deleteDialog.open) {
    elements.deleteDialog.close();
  }
}

function handleDialogBackdropClick(event) {
  if (event.target === elements.deleteDialog) {
    closeDeleteDialog();
  }
}

function confirmDeleteTask() {
  if (!state.pendingDeleteId) return;

  const taskId = state.pendingDeleteId;
  state.pendingDeleteId = null;

  if (elements.deleteDialog.open) {
    elements.deleteDialog.close();
  }

  deleteTask(taskId);
}

function deleteTask(taskId) {
  state.tasks = state.tasks.filter((task) => task.id !== taskId);

  // History tanggal lama tetap utuh; yang dibersihkan hanya data hari ini.
  state.completions[state.todayKey] = getTodayCompletedIds().filter(
    (completedId) => completedId !== taskId,
  );
  state.taskSnapshots[state.todayKey] = getHistoryTasks(state.todayKey).filter(
    (task) => task.id !== taskId,
  );

  saveTasks();
  saveCompletions();
  saveTaskSnapshots();
  renderTasks();
  renderHistory();
}

function handleNotesInput() {
  state.notes[state.todayKey] = elements.dailyNotes.value;
  elements.notesStatus.textContent = "Menyimpan...";

  saveNotes();
  renderHistory();

  window.clearTimeout(handleNotesInput.statusTimer);
  handleNotesInput.statusTimer = window.setTimeout(() => {
    elements.notesStatus.textContent = "Tersimpan";
  }, 450);
}

function updateStats() {
  const total = state.tasks.length;
  const completed = getTodayCompletedIds().filter((taskId) =>
    state.tasks.some((task) => task.id === taskId),
  ).length;
  const remaining = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  elements.totalTasks.textContent = total;
  elements.completedTasks.textContent = completed;
  elements.remainingTasks.textContent = remaining;
  elements.progressPercent.textContent = `${percent}%`;
  elements.statPercent.textContent = `${percent}%`;
  elements.progressFill.style.width = `${percent}%`;

  updatePeriodStats();
}

function updatePeriodStats() {
  const today = parseDateKey(state.todayKey);
  const weeklyStats = calculatePeriodStats(getStartOfWeek(today), today);
  const monthlyStats = calculatePeriodStats(getStartOfMonth(today), today);

  renderPeriodStats("weekly", weeklyStats);
  renderPeriodStats("monthly", monthlyStats);
}

function calculatePeriodStats(startDate, endDate) {
  const taskIds = new Set(state.tasks.map((task) => task.id));
  const dateKeys = getDateKeysBetween(startDate, endDate);
  const target = state.tasks.length * dateKeys.length;
  const completed = dateKeys.reduce((total, dateKey) => {
    const completedForDate = state.completions[dateKey] ?? [];
    const validCompleted = completedForDate.filter((taskId) => taskIds.has(taskId));

    return total + validCompleted.length;
  }, 0);
  const percent = target === 0 ? 0 : Math.round((completed / target) * 100);

  return { completed, target, percent };
}

function renderPeriodStats(period, stats) {
  const percentElement = elements[`${period}Percent`];
  const fillElement = elements[`${period}Fill`];
  const completedElement = elements[`${period}Completed`];
  const targetElement = elements[`${period}Target`];

  percentElement.textContent = `${stats.percent}%`;
  fillElement.style.width = `${stats.percent}%`;
  completedElement.textContent = stats.completed;
  targetElement.textContent = stats.target;
}

function renderHistory() {
  const dateKey = elements.historyDate.value;
  const historyTasks = getHistoryTasks(dateKey);
  const completedIds = new Set(state.completions[dateKey] ?? []);
  const completed = historyTasks.filter((task) => completedIds.has(task.id)).length;
  const total = historyTasks.length;
  const remaining = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  elements.historyTotal.textContent = total;
  elements.historyCompleted.textContent = completed;
  elements.historyRemaining.textContent = remaining;
  elements.historyPercent.textContent = `${percent}%`;
  elements.historyTaskList.innerHTML = "";

  if (historyTasks.length === 0) {
    elements.historyTaskList.innerHTML =
      '<li class="empty-state">Belum ada history task untuk tanggal ini.</li>';
  } else {
    const fragment = document.createDocumentFragment();

    historyTasks.forEach((task) => {
      const isComplete = completedIds.has(task.id);
      const item = document.createElement("li");
      item.className = `history-item${isComplete ? " is-complete" : ""}`;

      const status = document.createElement("span");
      status.className = "history-status";
      status.setAttribute("aria-hidden", "true");

      const taskName = document.createElement("span");
      taskName.className = "history-task-name";
      taskName.textContent = task.text;

      const stateLabel = document.createElement("span");
      stateLabel.className = "history-state";
      stateLabel.textContent = isComplete ? "Selesai" : "Belum";

      item.append(status, taskName, stateLabel);
      fragment.append(item);
    });

    elements.historyTaskList.append(fragment);
  }

  elements.historyNotes.textContent =
    state.notes[dateKey]?.trim() || "Belum ada catatan untuk tanggal ini.";
}

function exportProgress() {
  const completedIds = getTodayCompletedIds();
  const total = state.tasks.length;
  const completed = state.tasks.filter((task) => completedIds.includes(task.id)).length;
  const remaining = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const exportData = {
    date: state.todayKey,
    formattedDate: elements.todayDate.textContent,
    tasks: state.tasks.map((task) => ({
      text: task.text,
      completed: completedIds.includes(task.id),
    })),
    notes: state.notes[state.todayKey]?.trim() || "Belum ada catatan hari ini.",
    stats: { total, completed, remaining, percent },
  };

  const canvas = createProgressCanvas(exportData);
  const link = document.createElement("a");

  link.href = canvas.toDataURL("image/png");
  link.download = `daily-level-up-${state.todayKey}.png`;
  document.body.append(link);
  link.click();
  link.remove();
}

function createProgressCanvas(data) {
  const width = 1080;
  const padding = 72;
  const taskLineHeight = 46;
  const noteLines = wrapCanvasText(data.notes, width - padding * 2, "28px Arial");
  const taskAreaHeight = Math.max(1, data.tasks.length) * taskLineHeight;
  const height = Math.max(
    980,
    520 + taskAreaHeight + noteLines.length * 36,
  );
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  drawCanvasBackground(context, width, height);
  drawCanvasHeader(context, data, padding);
  drawCanvasStats(context, data.stats, padding, 300);
  drawCanvasTasks(context, data.tasks, padding, 500, taskLineHeight);
  drawCanvasNotes(context, noteLines, padding, 540 + taskAreaHeight);

  return canvas;
}

function drawCanvasBackground(context, width, height) {
  const gradient = context.createLinearGradient(0, 0, width, height);

  gradient.addColorStop(0, "#0d0e10");
  gradient.addColorStop(0.55, "#16181d");
  gradient.addColorStop(1, "#111316");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(45, 212, 191, 0.12)";
  context.beginPath();
  context.arc(80, 80, 260, 0, Math.PI * 2);
  context.fill();
}

function drawCanvasHeader(context, data, padding) {
  context.fillStyle = "#2dd4bf";
  context.font = "700 26px Arial";
  context.fillText("PERSONAL PRODUCTIVITY", padding, 86);

  context.fillStyle = "#f2f6fb";
  context.font = "800 74px Arial";
  context.fillText("DAILY LEVEL UP", padding, 172);

  context.fillStyle = "#9ca3af";
  context.font = "28px Arial";
  context.fillText(data.formattedDate, padding, 220);

  context.fillStyle = "#c4cedd";
  context.font = "30px Arial";
  context.fillText(`Progress hari ini: ${data.stats.percent}%`, padding, 278);

  drawCanvasProgress(context, padding, 305, 936, 18, data.stats.percent);
}

function drawCanvasStats(context, stats, padding, y) {
  const cards = [
    ["Total", stats.total],
    ["Selesai", stats.completed],
    ["Belum", stats.remaining],
    ["Progress", `${stats.percent}%`],
  ];
  const gap = 18;
  const cardWidth = (1080 - padding * 2 - gap * 3) / 4;

  cards.forEach(([label, value], index) => {
    const x = padding + index * (cardWidth + gap);

    drawRoundRect(context, x, y, cardWidth, 118, 12, "#111316", "#30343a");
    context.fillStyle = "#9ca3af";
    context.font = "24px Arial";
    context.fillText(label, x + 24, y + 42);

    context.fillStyle = "#f2f6fb";
    context.font = "800 38px Arial";
    context.fillText(String(value), x + 24, y + 88);
  });
}

function drawCanvasTasks(context, tasks, padding, startY, lineHeight) {
  context.fillStyle = "#2dd4bf";
  context.font = "700 24px Arial";
  context.fillText("DAILY TASK", padding, startY - 36);

  if (tasks.length === 0) {
    context.fillStyle = "#9ca3af";
    context.font = "28px Arial";
    context.fillText("Belum ada task.", padding, startY + 8);
    return;
  }

  tasks.forEach((task, index) => {
    const y = startY + index * lineHeight;
    const mark = task.completed ? "OK" : "--";
    const status = task.completed ? "Selesai" : "Belum";

    context.fillStyle = task.completed ? "#2dd4bf" : "#9ca3af";
    context.font = "700 28px Arial";
    context.fillText(mark, padding, y);

    context.fillStyle = "#f2f6fb";
    context.font = "28px Arial";
    context.fillText(task.text, padding + 44, y);

    context.fillStyle = task.completed ? "#2dd4bf" : "#9ca3af";
    context.font = "24px Arial";
    context.fillText(status, 890, y);
  });
}

function drawCanvasNotes(context, noteLines, padding, startY) {
  context.fillStyle = "#2dd4bf";
  context.font = "700 24px Arial";
  context.fillText("DAILY NOTES", padding, startY);

  drawRoundRect(context, padding, startY + 24, 936, noteLines.length * 36 + 52, 12, "#111316", "#30343a");

  context.fillStyle = "#c4cedd";
  context.font = "28px Arial";
  noteLines.forEach((line, index) => {
    context.fillText(line, padding + 24, startY + 76 + index * 36);
  });
}

function drawCanvasProgress(context, x, y, width, height, percent) {
  drawRoundRect(context, x, y, width, height, height / 2, "#0b0d10");

  if (percent === 0) return;

  const fillGradient = context.createLinearGradient(x, y, x + width, y);
  fillGradient.addColorStop(0, "#2dd4bf");
  fillGradient.addColorStop(1, "#fbbf24");
  drawRoundRect(
    context,
    x,
    y,
    Math.max(height, width * (percent / 100)),
    height,
    height / 2,
    fillGradient,
  );
}

function drawRoundRect(context, x, y, width, height, radius, fillStyle, strokeStyle) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fillStyle = fillStyle;
  context.fill();

  if (strokeStyle) {
    context.strokeStyle = strokeStyle;
    context.lineWidth = 2;
    context.stroke();
  }
}

function wrapCanvasText(text, maxWidth, font) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const paragraphs = text.split("\n");
  const lines = [];

  context.font = font;

  paragraphs.forEach((paragraph) => {
    const words = paragraph.trim().split(/\s+/);
    let line = "";

    words.forEach((word) => {
      const nextLine = line ? `${line} ${word}` : word;

      if (context.measureText(nextLine).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = nextLine;
      }
    });

    lines.push(line || "");
  });

  return lines;
}

function getTodayCompletedIds() {
  return state.completions[state.todayKey] ?? [];
}

function getHistoryTasks(dateKey) {
  if (Array.isArray(state.taskSnapshots[dateKey])) {
    return state.taskSnapshots[dateKey];
  }

  if (dateKey === state.todayKey || state.completions[dateKey] || state.notes[dateKey]) {
    return cloneTasks(state.tasks);
  }

  return [];
}

function ensureCompletionBucket(dateKey) {
  // Bucket tanggal baru dimulai kosong, sehingga checklist otomatis reset ke nol.
  if (!Array.isArray(state.completions[dateKey])) {
    state.completions[dateKey] = [];
  }
}

function ensureTaskSnapshot(dateKey) {
  if (!Array.isArray(state.taskSnapshots[dateKey])) {
    state.taskSnapshots[dateKey] = cloneTasks(state.tasks);
  }
}

function syncTodaySnapshot() {
  state.taskSnapshots[state.todayKey] = cloneTasks(state.tasks);
}

function migrateTaskSnapshots() {
  const knownDateKeys = new Set([
    ...Object.keys(state.completions),
    ...Object.keys(state.notes),
    ...Object.keys(state.taskSnapshots),
    state.todayKey,
  ]);

  knownDateKeys.forEach((dateKey) => {
    if (!Array.isArray(state.taskSnapshots[dateKey])) {
      state.taskSnapshots[dateKey] = cloneTasks(state.tasks);
    }
  });
}

function cloneTasks(tasks) {
  return tasks.map((task) => ({
    id: task.id,
    text: task.text,
  }));
}

function startDateWatcher() {
  window.setInterval(handleDateChange, 60 * 1000);
}

function handleDateChange() {
  const currentDateKey = getDateKey();

  if (currentDateKey === state.todayKey) return;

  state.todayKey = currentDateKey;
  ensureCompletionBucket(state.todayKey);
  saveCompletions();
  renderHeader();
  renderTasks();
  renderNotes();
  elements.notesStatus.textContent = "Tersimpan";
  elements.historyDate.max = state.todayKey;
  renderHistory();
}

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const result = startOfDay(date);
  result.setDate(result.getDate() + days);
  return result;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function getStartOfWeek(date) {
  const start = startOfDay(date);
  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  start.setDate(start.getDate() + diffToMonday);
  return start;
}

function getStartOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getDateKeysBetween(startDate, endDate) {
  const dateKeys = [];
  const cursor = startOfDay(startDate);
  const lastDate = startOfDay(endDate);

  while (cursor <= lastDate) {
    dateKeys.push(getDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dateKeys;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function readTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  return savedTheme === "light" ? "light" : "dark";
}

function toggleTheme() {
  const nextTheme = document.body.dataset.theme === "light" ? "dark" : "light";
  applyTheme(nextTheme);
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEYS.theme, theme);
  elements.themeToggle.setAttribute(
    "aria-label",
    theme === "light" ? "Ganti ke dark mode" : "Ganti ke light mode",
  );
}

function readFromStorage(key, fallback) {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch (error) {
    console.warn(`Gagal membaca LocalStorage untuk ${key}`, error);
    return fallback;
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(state.tasks));
}

function saveCompletions() {
  localStorage.setItem(STORAGE_KEYS.completions, JSON.stringify(state.completions));
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(state.notes));
}

function saveTaskSnapshots() {
  localStorage.setItem(
    STORAGE_KEYS.taskSnapshots,
    JSON.stringify(state.taskSnapshots),
  );
}
