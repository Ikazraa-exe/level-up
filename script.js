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
  drag: null,
  suppressNextTaskClick: false,
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
  elements.taskList.addEventListener("click", suppressClickAfterDrag, true);
  elements.taskList.addEventListener("pointerdown", handleTaskPointerDown);
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

function handleTaskPointerDown(event) {
  if (event.button !== undefined && event.button !== 0) return;

  const taskItem = event.target.closest(".task-item");
  if (!taskItem || !elements.taskList.contains(taskItem)) return;
  if (elements.deleteDialog.open) return;

  state.drag = {
    taskItem,
    pointerId: event.pointerId,
    startY: event.clientY,
    started: false,
    longPressTimer: window.setTimeout(beginTaskDrag, 160),
  };

  window.addEventListener("pointermove", handleTaskPointerMove, { passive: false });
  window.addEventListener("pointerup", handleTaskPointerUp);
  window.addEventListener("pointercancel", cancelTaskDrag);
}

function handleTaskPointerMove(event) {
  const drag = state.drag;
  if (!drag || event.pointerId !== drag.pointerId) return;

  const distance = Math.abs(event.clientY - drag.startY);

  if (!drag.started && distance >= 8) {
    beginTaskDrag();
  }

  if (!drag.started) return;

  event.preventDefault();
  moveDraggedTask(event.clientY);
}

function beginTaskDrag() {
  const drag = state.drag;
  if (!drag || drag.started) return;

  drag.started = true;
  drag.taskItem.classList.add("is-dragging");
  elements.taskList.classList.add("is-reordering");
  document.body.classList.add("is-task-dragging");

  try {
    drag.taskItem.setPointerCapture(drag.pointerId);
  } catch {}
}

function moveDraggedTask(clientY) {
  const previousRects = getTaskItemRects();
  const afterElement = getTaskAfterDragPosition(clientY);
  const draggingItem = state.drag.taskItem;

  if (!afterElement) {
    elements.taskList.append(draggingItem);
    animateTaskLayout(previousRects);
    return;
  }

  elements.taskList.insertBefore(draggingItem, afterElement);
  animateTaskLayout(previousRects);
}

function getTaskItemRects() {
  return new Map(
    [...elements.taskList.querySelectorAll(".task-item")].map((item) => [
      item,
      item.getBoundingClientRect(),
    ]),
  );
}

function animateTaskLayout(previousRects) {
  elements.taskList
    .querySelectorAll(".task-item:not(.is-dragging)")
    .forEach((item) => {
      const previousRect = previousRects.get(item);
      if (!previousRect) return;

      const currentRect = item.getBoundingClientRect();
      const deltaY = previousRect.top - currentRect.top;

      if (Math.abs(deltaY) < 1) return;

      item.animate(
        [
          { transform: `translateY(${deltaY}px)` },
          { transform: "translateY(0)" },
        ],
        {
          duration: 180,
          easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
        },
      );
    });
}

function getTaskAfterDragPosition(clientY) {
  const taskItems = [...elements.taskList.querySelectorAll(".task-item:not(.is-dragging)")];

  return taskItems.reduce(
    (closest, item) => {
      const box = item.getBoundingClientRect();
      const offset = clientY - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset, element: item };
      }

      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null },
  ).element;
}

function handleTaskPointerUp(event) {
  const drag = state.drag;
  if (!drag || event.pointerId !== drag.pointerId) return;
  const droppedItem = drag.taskItem;
  const didDrag = drag.started;

  if (didDrag) {
    event.preventDefault();
    persistTaskOrderFromDom();
    suppressNextTaskClickBriefly();
  }

  cleanupTaskDrag();

  if (didDrag) {
    animateTaskDrop(droppedItem);
  }
}

function animateTaskDrop(taskItem) {
  taskItem.classList.add("is-drop-animating");

  window.setTimeout(() => {
    taskItem.classList.remove("is-drop-animating");
  }, 280);
}

function cancelTaskDrag(event) {
  const drag = state.drag;
  if (!drag || event.pointerId !== drag.pointerId) return;

  cleanupTaskDrag();
  renderTasks();
}

function cleanupTaskDrag() {
  const drag = state.drag;
  if (!drag) return;

  window.clearTimeout(drag.longPressTimer);
  drag.taskItem.classList.remove("is-dragging");
  elements.taskList.classList.remove("is-reordering");
  document.body.classList.remove("is-task-dragging");

  try {
    drag.taskItem.releasePointerCapture(drag.pointerId);
  } catch {}

  window.removeEventListener("pointermove", handleTaskPointerMove);
  window.removeEventListener("pointerup", handleTaskPointerUp);
  window.removeEventListener("pointercancel", cancelTaskDrag);
  state.drag = null;
}

function persistTaskOrderFromDom() {
  const orderedIds = [...elements.taskList.querySelectorAll(".task-item")].map(
    (item) => item.dataset.taskId,
  );
  const tasksById = new Map(state.tasks.map((task) => [task.id, task]));
  const reorderedTasks = orderedIds
    .map((taskId) => tasksById.get(taskId))
    .filter(Boolean);

  if (reorderedTasks.length !== state.tasks.length) return;

  state.tasks = reorderedTasks;
  syncTodaySnapshot();
  saveTasks();
  saveTaskSnapshots();
  renderHistory();
}

function suppressNextTaskClickBriefly() {
  state.suppressNextTaskClick = true;

  window.setTimeout(() => {
    state.suppressNextTaskClick = false;
  }, 250);
}

function suppressClickAfterDrag(event) {
  if (!state.suppressNextTaskClick) return;

  event.preventDefault();
  event.stopPropagation();
  state.suppressNextTaskClick = false;
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
  const width = 1200;
  const padding = 80;
  const contentWidth = width - padding * 2;
  const taskTextWidth = contentWidth - 220;
  const taskRows = data.tasks.map((task) => {
    const lines = wrapCanvasText(task.text, taskTextWidth, "30px Arial");

    return {
      ...task,
      lines,
      height: Math.max(74, 28 + lines.length * 34),
    };
  });
  const noteLines = wrapCanvasText(data.notes, contentWidth - 56, "30px Arial");
  const taskRowsHeight =
    taskRows.length === 0
      ? 74
      : taskRows.reduce((total, task) => total + task.height, 0) +
        (taskRows.length - 1) * 14;
  const notesBoxHeight = Math.max(130, noteLines.length * 38 + 62);
  const height = Math.max(
    1160,
    padding + 275 + 48 + 126 + 72 + taskRowsHeight + 82 + notesBoxHeight + 80,
  );
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  drawCanvasBackground(context, width, height);

  let y = padding;
  y = drawCanvasHeader(context, data, padding, contentWidth, y);
  y += 48;
  y = drawCanvasStats(context, data.stats, padding, contentWidth, y);
  y += 72;
  y = drawCanvasTasks(context, taskRows, padding, contentWidth, y);
  y += 66;
  drawCanvasNotes(context, noteLines, padding, contentWidth, y, notesBoxHeight);

  return canvas;
}

function drawCanvasBackground(context, width, height) {
  context.fillStyle = "#f6fbf8";
  context.fillRect(0, 0, width, height);

  context.fillStyle = "rgba(15, 118, 110, 0.12)";
  context.beginPath();
  context.arc(70, 70, 300, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgba(217, 119, 6, 0.08)";
  context.beginPath();
  context.arc(width, height, 360, 0, Math.PI * 2);
  context.fill();
}

function drawCanvasHeader(context, data, padding, contentWidth, y) {
  context.fillStyle = "#0f766e";
  context.font = "700 26px Arial";
  context.fillText("PERSONAL PRODUCTIVITY", padding, y);

  context.fillStyle = "#111827";
  context.font = "800 76px Arial";
  context.fillText("DAILY LEVEL UP", padding, y + 86);

  context.fillStyle = "#64748b";
  context.font = "28px Arial";
  context.fillText(data.formattedDate, padding, y + 132);

  context.fillStyle = "#334155";
  context.font = "32px Arial";
  context.fillText(`Progress hari ini: ${data.stats.percent}%`, padding, y + 196);

  drawCanvasProgress(context, padding, y + 226, contentWidth, 20, data.stats.percent);

  return y + 246;
}

function drawCanvasStats(context, stats, padding, contentWidth, y) {
  const cards = [
    ["Total", stats.total],
    ["Selesai", stats.completed],
    ["Belum", stats.remaining],
    ["Progress", `${stats.percent}%`],
  ];
  const gap = 18;
  const cardWidth = (contentWidth - gap * 3) / 4;

  cards.forEach(([label, value], index) => {
    const x = padding + index * (cardWidth + gap);

    drawRoundRect(context, x, y, cardWidth, 126, 14, "#ffffff", "#d8e0e8");
    context.fillStyle = "#64748b";
    context.font = "24px Arial";
    context.fillText(label, x + 24, y + 46);

    context.fillStyle = "#111827";
    context.font = "800 40px Arial";
    context.fillText(String(value), x + 24, y + 94);
  });

  return y + 126;
}

function drawCanvasTasks(context, taskRows, padding, contentWidth, y) {
  context.fillStyle = "#0f766e";
  context.font = "700 24px Arial";
  context.fillText("DAILY TASK", padding, y);

  let currentY = y + 28;

  if (taskRows.length === 0) {
    drawRoundRect(context, padding, currentY, contentWidth, 74, 14, "#ffffff", "#d8e0e8");
    context.fillStyle = "#64748b";
    context.font = "28px Arial";
    context.fillText("Belum ada task.", padding + 28, currentY + 46);
    return currentY + 74;
  }

  taskRows.forEach((task) => {
    drawRoundRect(context, padding, currentY, contentWidth, task.height, 14, "#ffffff", "#d8e0e8");
    drawCanvasTaskStatus(context, padding + 32, currentY + 36, task.completed);

    context.fillStyle = "#111827";
    context.font = "30px Arial";
    task.lines.forEach((line, index) => {
      context.fillText(line, padding + 76, currentY + 42 + index * 34);
    });

    drawCanvasStatusPill(
      context,
      padding + contentWidth - 144,
      currentY + 22,
      task.completed ? "Selesai" : "Belum",
      task.completed,
    );

    currentY += task.height + 14;
  });

  return currentY - 14;
}

function drawCanvasTaskStatus(context, x, y, isComplete) {
  context.beginPath();
  context.arc(x, y, 16, 0, Math.PI * 2);
  context.fillStyle = isComplete ? "#0f766e" : "#ffffff";
  context.fill();
  context.strokeStyle = isComplete ? "#0f766e" : "#cbd5e1";
  context.lineWidth = 3;
  context.stroke();

  if (!isComplete) return;

  context.beginPath();
  context.moveTo(x - 7, y);
  context.lineTo(x - 1, y + 6);
  context.lineTo(x + 9, y - 8);
  context.strokeStyle = "#ffffff";
  context.lineWidth = 4;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.stroke();
}

function drawCanvasStatusPill(context, x, y, text, isComplete) {
  const fill = isComplete ? "#d1fae5" : "#f1f5f9";
  const textColor = isComplete ? "#0f766e" : "#64748b";

  drawRoundRect(context, x, y, 116, 34, 17, fill);
  context.fillStyle = textColor;
  context.font = "700 20px Arial";
  context.textAlign = "center";
  context.fillText(text, x + 58, y + 23);
  context.textAlign = "left";
}

function drawCanvasNotes(context, noteLines, padding, contentWidth, y, notesBoxHeight) {
  context.fillStyle = "#0f766e";
  context.font = "700 24px Arial";
  context.fillText("DAILY NOTES", padding, y);

  drawRoundRect(context, padding, y + 28, contentWidth, notesBoxHeight, 14, "#ffffff", "#d8e0e8");

  context.fillStyle = "#334155";
  context.font = "30px Arial";
  noteLines.forEach((line, index) => {
    context.fillText(line, padding + 28, y + 82 + index * 38);
  });
}

function drawCanvasProgress(context, x, y, width, height, percent) {
  drawRoundRect(context, x, y, width, height, height / 2, "#e5e7eb");

  if (percent === 0) return;

  const fillGradient = context.createLinearGradient(x, y, x + width, y);
  fillGradient.addColorStop(0, "#0f766e");
  fillGradient.addColorStop(1, "#d97706");
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
  const paragraphs = String(text).split("\n");
  const lines = [];

  context.font = font;

  paragraphs.forEach((paragraph) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    let line = "";

    if (words.length === 0) {
      lines.push("");
      return;
    }

    words.forEach((word) => {
      const chunks = splitLongCanvasWord(context, word, maxWidth);

      chunks.forEach((chunk) => {
        const nextLine = line ? `${line} ${chunk}` : chunk;

        if (context.measureText(nextLine).width > maxWidth && line) {
          lines.push(line);
          line = chunk;
        } else {
          line = nextLine;
        }
      });
    });

    if (line) lines.push(line);
  });

  return lines;
}

function splitLongCanvasWord(context, word, maxWidth) {
  if (context.measureText(word).width <= maxWidth) return [word];

  const chunks = [];
  let chunk = "";

  [...word].forEach((character) => {
    const nextChunk = chunk + character;

    if (context.measureText(nextChunk).width > maxWidth && chunk) {
      chunks.push(chunk);
      chunk = character;
    } else {
      chunk = nextChunk;
    }
  });

  if (chunk) chunks.push(chunk);
  return chunks;
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
