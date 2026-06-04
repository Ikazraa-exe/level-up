const STORAGE_KEYS = {
  tasks: "daily-level-up:tasks",
  completions: "daily-level-up:completions",
  notes: "daily-level-up:notes",
  taskSnapshots: "daily-level-up:task-snapshots",
  specialTasks: "daily-level-up:special-tasks",
  specialCompletions: "daily-level-up:special-completions",
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

const WEEK_DAYS = [
  { key: "monday", label: "Senin" },
  { key: "tuesday", label: "Selasa" },
  { key: "wednesday", label: "Rabu" },
  { key: "thursday", label: "Kamis" },
  { key: "friday", label: "Jumat" },
  { key: "saturday", label: "Sabtu" },
  { key: "sunday", label: "Minggu" },
];

const DRAG_HOLD_DELAY_MS = 180;
const DRAG_CANCEL_DISTANCE = 12;

const HISTORY_TITLES = {
  daily: "Riwayat Harian",
  weekly: "Rekap Mingguan",
  monthly: "Rekap Bulanan",
};

const TOUR_STEPS = [
  {
    selector: ".hero-card",
    title: "Header",
    description: "Di sini kamu melihat tanggal hari ini, quote motivasi, dan tombol switch dark atau light mode.",
  },
  {
    selector: ".progress-card",
    title: "Progress Harian",
    description: "Bagian ini merangkum progress daily task dan task khusus hari ini dalam bentuk persen dan progress bar.",
  },
  {
    selector: ".period-card",
    title: "Statistik Periodik",
    description: "Pantau akumulasi daily task dan task khusus yang selesai untuk minggu berjalan dan bulan berjalan.",
  },
  {
    selector: ".task-card",
    title: "Daily Task",
    description: "Ini rutinitas wajib harian. Aktifkan tombol urutkan dulu, lalu geser task dari kotaknya.",
  },
  {
    selector: ".special-card",
    title: "Task Khusus",
    description: "Atur program berbeda untuk tiap hari. Setiap hari yang punya list bisa diurutkan lewat tombol urutkan di kartunya.",
  },
  {
    selector: ".notes-card",
    title: "Daily Notes",
    description: "Tulis catatan harian. Notes tersimpan otomatis dan berbeda untuk setiap tanggal.",
  },
  {
    selector: ".history-card",
    title: "History",
    description: "Pilih mode harian, mingguan, atau bulanan untuk melihat ulang progress dan export riwayat.",
  },
];

const state = {
  tasks: [],
  completions: {},
  notes: {},
  taskSnapshots: {},
  specialTasks: {},
  specialCompletions: {},
  todayKey: getDateKey(),
  pendingDeleteId: null,
  pendingDeleteIds: [],
  pendingDeleteType: "daily",
  pendingDeleteDayKey: null,
  pendingEditId: null,
  pendingEditType: "daily",
  pendingEditDayKey: null,
  drag: null,
  suppressNextTaskClick: false,
  tourIndex: 0,
  historyView: "daily",
  dailyReorderMode: false,
  dailyActionMode: null,
  specialReorderDayKey: null,
  specialActionMode: null,
  specialActionDayKey: null,
  selectedDeleteIds: new Set(),
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
  specialWeekGrid: document.querySelector("#specialWeekGrid"),
  dailyNotes: document.querySelector("#dailyNotes"),
  notesStatus: document.querySelector("#notesStatus"),
  dailyReorderButton: document.querySelector("#dailyReorderButton"),
  dailyEditButton: document.querySelector("#dailyEditButton"),
  dailyDeleteButton: document.querySelector("#dailyDeleteButton"),
  themeToggle: document.querySelector("#themeToggle"),
  historyTitle: document.querySelector("#historyTitle"),
  historyViewButtons: document.querySelectorAll("[data-history-view]"),
  historyDate: document.querySelector("#historyDate"),
  historyExportButton: document.querySelector("#historyExportButton"),
  historyPeriodList: document.querySelector("#historyPeriodList"),
  historyTaskList: document.querySelector("#historyTaskList"),
  historyTotal: document.querySelector("#historyTotal"),
  historyCompleted: document.querySelector("#historyCompleted"),
  historyRemaining: document.querySelector("#historyRemaining"),
  historyPercent: document.querySelector("#historyPercent"),
  historyNotesLabel: document.querySelector("#historyNotesLabel"),
  historyNotes: document.querySelector("#historyNotes"),
  deleteDialog: document.querySelector("#deleteDialog"),
  deleteDialogTitle: document.querySelector("#deleteDialogTitle"),
  deleteTaskName: document.querySelector("#deleteTaskName"),
  cancelDeleteButton: document.querySelector("#cancelDeleteButton"),
  confirmDeleteButton: document.querySelector("#confirmDeleteButton"),
  editDialog: document.querySelector("#editDialog"),
  editTaskInput: document.querySelector("#editTaskInput"),
  cancelEditButton: document.querySelector("#cancelEditButton"),
  saveEditButton: document.querySelector("#saveEditButton"),
  guideButton: document.querySelector("#guideButton"),
  toTopButton: document.querySelector("#toTopButton"),
  tourOverlay: document.querySelector("#tourOverlay"),
  tourStepCounter: document.querySelector("#tourStepCounter"),
  tourTitle: document.querySelector("#tourTitle"),
  tourDescription: document.querySelector("#tourDescription"),
  tourPrevButton: document.querySelector("#tourPrevButton"),
  tourSkipButton: document.querySelector("#tourSkipButton"),
  tourNextButton: document.querySelector("#tourNextButton"),
};

init();

function init() {
  applyTheme(readTheme());
  loadState();
  setupHistoryDateInput();
  renderHeader();
  renderTasks();
  renderSpecialTasks();
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
  elements.specialWeekGrid.addEventListener("click", suppressClickAfterDrag, true);
  elements.specialWeekGrid.addEventListener("pointerdown", handleSpecialPointerDown);
  elements.specialWeekGrid.addEventListener("submit", handleSpecialTaskSubmit);
  elements.specialWeekGrid.addEventListener("click", handleSpecialTaskClick);
  elements.dailyNotes.addEventListener("input", handleNotesInput);
  elements.dailyReorderButton.addEventListener("click", toggleDailyReorderMode);
  elements.dailyEditButton.addEventListener("click", toggleDailyEditMode);
  elements.dailyDeleteButton.addEventListener("click", toggleDailyDeleteMode);
  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.guideButton.addEventListener("click", startTour);
  elements.toTopButton.addEventListener("click", scrollToTop);
  elements.tourPrevButton.addEventListener("click", showPreviousTourStep);
  elements.tourSkipButton.addEventListener("click", endTour);
  elements.tourNextButton.addEventListener("click", showNextTourStep);
  elements.tourOverlay.addEventListener("click", handleTourOverlayClick);
  elements.historyViewButtons.forEach((button) => {
    button.addEventListener("click", handleHistoryViewChange);
  });
  elements.historyDate.addEventListener("change", renderHistory);
  elements.historyExportButton.addEventListener("click", exportHistory);
  elements.cancelDeleteButton.addEventListener("click", closeDeleteDialog);
  elements.confirmDeleteButton.addEventListener("click", confirmDeleteTask);
  elements.deleteDialog.addEventListener("click", handleDialogBackdropClick);
  elements.deleteDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDeleteDialog();
  });
  elements.cancelEditButton.addEventListener("click", closeEditDialog);
  elements.saveEditButton.addEventListener("click", confirmEditTask);
  elements.editTaskInput.addEventListener("keydown", handleEditInputKeydown);
  elements.editDialog.addEventListener("click", handleEditDialogBackdropClick);
  elements.editDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeEditDialog();
  });
  window.addEventListener("focus", handleDateChange);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) handleDateChange();
  });
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function startTour() {
  state.tourIndex = 0;
  elements.tourOverlay.hidden = false;
  renderTourStep();
}

function showNextTourStep() {
  if (state.tourIndex >= TOUR_STEPS.length - 1) {
    endTour();
    return;
  }

  state.tourIndex += 1;
  renderTourStep();
}

function showPreviousTourStep() {
  if (state.tourIndex === 0) return;

  state.tourIndex -= 1;
  renderTourStep();
}

function endTour() {
  clearTourHighlight();
  elements.tourOverlay.hidden = true;
}

function handleTourOverlayClick(event) {
  if (event.target === elements.tourOverlay) {
    endTour();
  }
}

function renderTourStep() {
  const step = TOUR_STEPS[state.tourIndex];
  const target = document.querySelector(step.selector);

  clearTourHighlight();

  if (target) {
    target.classList.add("is-tour-highlight");
    target.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  elements.tourStepCounter.textContent = `${state.tourIndex + 1}/${TOUR_STEPS.length}`;
  elements.tourTitle.textContent = step.title;
  elements.tourDescription.textContent = step.description;
  elements.tourPrevButton.disabled = state.tourIndex === 0;
  elements.tourNextButton.textContent =
    state.tourIndex === TOUR_STEPS.length - 1 ? "Selesai" : "Next";
}

function clearTourHighlight() {
  document
    .querySelectorAll(".is-tour-highlight")
    .forEach((element) => element.classList.remove("is-tour-highlight"));
}

function handleTaskPointerDown(event) {
  if (!state.dailyReorderMode) return;
  if (event.button !== undefined && event.button !== 0) return;
  if (event.target.closest("button, input, textarea")) return;

  const taskItem = event.target.closest(".task-item");
  if (!taskItem || !elements.taskList.contains(taskItem)) return;
  if (elements.deleteDialog.open) return;

  startReorderDrag({
    event,
    type: "daily",
    item: taskItem,
    list: elements.taskList,
    itemSelector: ".task-item",
  });
}

function handleSpecialPointerDown(event) {
  if (event.button !== undefined && event.button !== 0) return;
  if (event.target.closest("button, input, textarea")) return;

  const item = event.target.closest(".special-task-item");
  const card = event.target.closest(".special-day-card");
  const list = event.target.closest(".special-task-list");

  if (!item || !card || !list) return;
  if (state.specialReorderDayKey !== card.dataset.dayKey) return;
  if (elements.deleteDialog.open) return;

  startReorderDrag({
    event,
    type: "special",
    item,
    list,
    itemSelector: ".special-task-item",
    dayKey: card.dataset.dayKey,
  });
}

function startReorderDrag({ event, type, item, list, itemSelector, dayKey = null }) {
  state.drag = {
    type,
    item,
    list,
    itemSelector,
    dayKey,
    pointerId: event.pointerId,
    startY: event.clientY,
    started: false,
    longPressTimer: window.setTimeout(beginReorderDrag, DRAG_HOLD_DELAY_MS),
  };

  window.addEventListener("pointermove", handleTaskPointerMove, { passive: false });
  window.addEventListener("pointerup", handleTaskPointerUp);
  window.addEventListener("pointercancel", cancelTaskDrag);
}

function handleTaskPointerMove(event) {
  const drag = state.drag;
  if (!drag || event.pointerId !== drag.pointerId) return;

  const distance = Math.abs(event.clientY - drag.startY);

  if (!drag.started) {
    if (distance >= DRAG_CANCEL_DISTANCE) {
      cleanupTaskDrag();
    }

    return;
  }

  event.preventDefault();
  moveDraggedItem(event.clientY);
}

function beginReorderDrag() {
  const drag = state.drag;
  if (!drag || drag.started) return;

  drag.started = true;
  drag.item.classList.add("is-dragging");
  drag.list.classList.add("is-reordering");
  document.body.classList.add("is-task-dragging");

  try {
    drag.item.setPointerCapture(drag.pointerId);
  } catch {}
}

function moveDraggedItem(clientY) {
  const drag = state.drag;
  const previousRects = getDragItemRects(drag);
  const afterElement = getItemAfterDragPosition(drag, clientY);
  const draggingItem = drag.item;

  if (!afterElement) {
    drag.list.append(draggingItem);
    animateDragLayout(drag, previousRects);
    return;
  }

  drag.list.insertBefore(draggingItem, afterElement);
  animateDragLayout(drag, previousRects);
}

function getDragItemRects(drag) {
  return new Map(
    [...drag.list.querySelectorAll(drag.itemSelector)].map((item) => [
      item,
      item.getBoundingClientRect(),
    ]),
  );
}

function animateDragLayout(drag, previousRects) {
  drag.list
    .querySelectorAll(`${drag.itemSelector}:not(.is-dragging)`)
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

function getItemAfterDragPosition(drag, clientY) {
  const taskItems = [
    ...drag.list.querySelectorAll(`${drag.itemSelector}:not(.is-dragging)`),
  ];

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
  const droppedItem = drag.item;
  const didDrag = drag.started;

  if (didDrag) {
    event.preventDefault();
    persistReorderFromDom(drag);
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
  const type = drag.type;

  cleanupTaskDrag();

  if (type === "special") {
    renderSpecialTasks();
  } else {
    renderTasks();
  }
}

function cleanupTaskDrag() {
  const drag = state.drag;
  if (!drag) return;

  window.clearTimeout(drag.longPressTimer);
  drag.item.classList.remove("is-dragging");
  drag.list.classList.remove("is-reordering");
  document.body.classList.remove("is-task-dragging");

  try {
    drag.item.releasePointerCapture(drag.pointerId);
  } catch {}

  window.removeEventListener("pointermove", handleTaskPointerMove);
  window.removeEventListener("pointerup", handleTaskPointerUp);
  window.removeEventListener("pointercancel", cancelTaskDrag);
  state.drag = null;
}

function persistReorderFromDom(drag) {
  if (drag.type === "special") {
    persistSpecialTaskOrderFromDom(drag);
    return;
  }

  persistDailyTaskOrderFromDom(drag);
}

function persistDailyTaskOrderFromDom(drag) {
  const orderedIds = [...drag.list.querySelectorAll(".task-item")].map(
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

function persistSpecialTaskOrderFromDom(drag) {
  if (!state.specialTasks[drag.dayKey]) return;

  const orderedIds = [...drag.list.querySelectorAll(".special-task-item")].map(
    (item) => item.dataset.specialId,
  );
  const tasksById = new Map(
    state.specialTasks[drag.dayKey].map((task) => [task.id, task]),
  );
  const reorderedTasks = orderedIds
    .map((taskId) => tasksById.get(taskId))
    .filter(Boolean);

  if (reorderedTasks.length !== state.specialTasks[drag.dayKey].length) return;

  state.specialTasks[drag.dayKey] = reorderedTasks;
  saveSpecialTasks();
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
  state.specialTasks = readFromStorage(STORAGE_KEYS.specialTasks, {});
  state.specialCompletions = readFromStorage(STORAGE_KEYS.specialCompletions, {});

  ensureCompletionBucket(state.todayKey);
  ensureSpecialCompletionBucket(state.todayKey);
  normalizeSpecialTasks();
  migrateTaskSnapshots();
  ensureTaskSnapshot(state.todayKey);

  saveTasks();
  saveCompletions();
  saveTaskSnapshots();
  saveSpecialTasks();
  saveSpecialCompletions();
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
    state.dailyReorderMode = false;
    state.dailyActionMode = null;
    state.selectedDeleteIds.clear();
    updateDailyReorderMode();
    updateStats();
    return;
  }

  const todayCompletedIds = getTodayCompletedIds();
  const fragment = document.createDocumentFragment();

  state.tasks.forEach((task) => {
    const isComplete = todayCompletedIds.includes(task.id);
    const isSelectedForDelete =
      state.dailyActionMode === "delete" && state.selectedDeleteIds.has(task.id);
    const item = document.createElement("li");
    item.className = `task-item${isComplete ? " is-complete" : ""}${
      isSelectedForDelete ? " is-selected-for-delete" : ""
    }`;
    item.dataset.taskId = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = isComplete;
    checkbox.setAttribute("aria-label", `Tandai ${task.text} selesai`);

    const taskText = document.createElement("span");
    taskText.className = "task-text";
    taskText.textContent = task.text;

    const actions = document.createElement("span");
    actions.className = "task-actions";

    actions.append(checkbox);
    item.append(taskText, actions);
    fragment.append(item);
  });

  elements.taskList.append(fragment);
  if (state.tasks.length < 2) {
    state.dailyReorderMode = false;
  }
  updateDailyReorderMode();
  updateStats();
}

function toggleDailyReorderMode() {
  if (state.tasks.length < 2) return;

  state.dailyReorderMode = !state.dailyReorderMode;
  state.dailyActionMode = null;
  state.selectedDeleteIds.clear();

  if (!state.dailyReorderMode && state.drag?.type === "daily") {
    cleanupTaskDrag();
  }

  if (state.dailyReorderMode) {
    clearSpecialModes();
  }

  updateDailyReorderMode();
  renderTasks();
}

function updateDailyReorderMode() {
  const canReorder = state.tasks.length > 1;
  const hasTasks = state.tasks.length > 0;

  elements.taskList.classList.toggle("is-reorder-mode", state.dailyReorderMode);
  elements.taskList.classList.toggle("is-edit-mode", state.dailyActionMode === "edit");
  elements.taskList.classList.toggle("is-delete-mode", state.dailyActionMode === "delete");
  elements.dailyReorderButton.disabled = !canReorder;
  elements.dailyReorderButton.classList.toggle("is-active", state.dailyReorderMode);
  elements.dailyReorderButton.setAttribute("aria-pressed", String(state.dailyReorderMode));
  elements.dailyReorderButton.setAttribute(
    "aria-label",
    state.dailyReorderMode
      ? "Matikan mode urutkan daily task"
      : "Aktifkan mode urutkan daily task",
  );
  elements.dailyReorderButton.title = state.dailyReorderMode
    ? "Selesai urutkan"
    : "Urutkan daily task";

  elements.dailyEditButton.disabled = !hasTasks;
  elements.dailyEditButton.classList.toggle("is-active", state.dailyActionMode === "edit");
  elements.dailyEditButton.setAttribute(
    "aria-pressed",
    String(state.dailyActionMode === "edit"),
  );
  elements.dailyEditButton.setAttribute(
    "aria-label",
    state.dailyActionMode === "edit"
      ? "Matikan mode edit daily task"
      : "Aktifkan mode edit daily task",
  );
  elements.dailyEditButton.title =
    state.dailyActionMode === "edit" ? "Selesai edit" : "Edit daily task";

  elements.dailyDeleteButton.disabled = !hasTasks;
  elements.dailyDeleteButton.classList.toggle(
    "is-active",
    state.dailyActionMode === "delete",
  );
  elements.dailyDeleteButton.setAttribute(
    "aria-pressed",
    String(state.dailyActionMode === "delete"),
  );
  elements.dailyDeleteButton.setAttribute(
    "aria-label",
    state.dailyActionMode === "delete"
      ? "Konfirmasi hapus daily task terpilih"
      : "Aktifkan mode hapus daily task",
  );
  elements.dailyDeleteButton.title =
    state.dailyActionMode === "delete" && state.selectedDeleteIds.size > 0
      ? "Konfirmasi hapus"
      : state.dailyActionMode === "delete"
        ? "Selesai hapus"
        : "Hapus daily task";
}

function toggleDailyEditMode() {
  if (state.tasks.length === 0) return;

  state.dailyReorderMode = false;
  state.dailyActionMode = state.dailyActionMode === "edit" ? null : "edit";
  state.selectedDeleteIds.clear();
  if (state.dailyActionMode) {
    clearSpecialModes();
  }
  renderTasks();
  renderSpecialTasks();
}

function toggleDailyDeleteMode() {
  if (state.tasks.length === 0) return;

  if (state.dailyActionMode === "delete") {
    if (state.selectedDeleteIds.size > 0) {
      openDeleteDialogForTasks([...state.selectedDeleteIds], { type: "daily" });
      return;
    }

    state.dailyActionMode = null;
    renderTasks();
    return;
  }

  state.dailyReorderMode = false;
  state.dailyActionMode = "delete";
  state.selectedDeleteIds.clear();
  clearSpecialModes();
  renderTasks();
  renderSpecialTasks();
}

function clearDailyModes() {
  if (state.drag?.type === "daily") {
    cleanupTaskDrag();
  }

  state.dailyReorderMode = false;
  state.dailyActionMode = null;
  state.selectedDeleteIds.clear();
  updateDailyReorderMode();
}

function renderSpecialTasks() {
  const todayDayKey = getWeekDayKey(parseDateKey(state.todayKey));
  const todayCompletedSpecialIds = getTodaySpecialCompletedIds();
  const fragment = document.createDocumentFragment();

  elements.specialWeekGrid.innerHTML = "";

  if (
    state.specialReorderDayKey &&
    (state.specialTasks[state.specialReorderDayKey]?.length ?? 0) < 2
  ) {
    state.specialReorderDayKey = null;
  }

  if (
    state.specialActionDayKey &&
    (state.specialTasks[state.specialActionDayKey]?.length ?? 0) === 0
  ) {
    state.specialActionMode = null;
    state.specialActionDayKey = null;
    state.selectedDeleteIds.clear();
  }

  WEEK_DAYS.forEach((day) => {
    const isToday = day.key === todayDayKey;
    const dayTasks = state.specialTasks[day.key] ?? [];
    const isReorderMode = state.specialReorderDayKey === day.key;
    const isEditMode =
      state.specialActionMode === "edit" && state.specialActionDayKey === day.key;
    const isDeleteMode =
      state.specialActionMode === "delete" && state.specialActionDayKey === day.key;
    const card = document.createElement("article");
    card.className = `special-day-card${isToday ? " is-today" : ""}${
      isReorderMode ? " is-reorder-mode" : ""
    }${isEditMode ? " is-edit-mode" : ""}${isDeleteMode ? " is-delete-mode" : ""}`;
    card.dataset.dayKey = day.key;

    const header = document.createElement("div");
    header.className = "special-day-header";

    const title = document.createElement("h3");
    title.textContent = day.label;

    const actions = document.createElement("div");
    actions.className = "special-day-actions";

    if (isToday) {
      const badge = document.createElement("span");
      badge.className = "today-badge";
      badge.textContent = "Hari ini";
      actions.append(badge);
    }

    if (dayTasks.length > 1) {
      const reorderButton = document.createElement("button");
      reorderButton.type = "button";
      reorderButton.className = `reorder-toggle-button special-reorder-button${
        isReorderMode ? " is-active" : ""
      }`;
      reorderButton.dataset.dayKey = day.key;
      reorderButton.innerHTML = getReorderIcon();
      reorderButton.setAttribute(
        "aria-label",
        isReorderMode
          ? `Matikan mode urutkan task khusus ${day.label}`
          : `Aktifkan mode urutkan task khusus ${day.label}`,
      );
      reorderButton.setAttribute("aria-pressed", String(isReorderMode));
      reorderButton.title = isReorderMode ? "Selesai urutkan" : `Urutkan ${day.label}`;
      actions.append(reorderButton);
    }

    if (dayTasks.length > 0) {
      const editModeButton = document.createElement("button");
      editModeButton.type = "button";
      editModeButton.className = `edit-button special-action-button special-edit-mode-button${
        isEditMode ? " is-active" : ""
      }`;
      editModeButton.dataset.dayKey = day.key;
      editModeButton.innerHTML = getPencilIcon();
      editModeButton.setAttribute(
        "aria-label",
        isEditMode
          ? `Matikan mode edit task khusus ${day.label}`
          : `Aktifkan mode edit task khusus ${day.label}`,
      );
      editModeButton.setAttribute("aria-pressed", String(isEditMode));
      editModeButton.title = isEditMode ? "Selesai edit" : `Edit ${day.label}`;
      actions.append(editModeButton);

      const deleteModeButton = document.createElement("button");
      deleteModeButton.type = "button";
      deleteModeButton.className = `delete-button special-action-button special-delete-mode-button${
        isDeleteMode ? " is-active" : ""
      }`;
      deleteModeButton.dataset.dayKey = day.key;
      deleteModeButton.innerHTML = getTrashIcon();
      deleteModeButton.setAttribute(
        "aria-label",
        isDeleteMode
          ? `Konfirmasi hapus task khusus ${day.label} terpilih`
          : `Aktifkan mode hapus task khusus ${day.label}`,
      );
      deleteModeButton.setAttribute("aria-pressed", String(isDeleteMode));
      deleteModeButton.title =
        isDeleteMode && state.selectedDeleteIds.size > 0
          ? "Konfirmasi hapus"
          : isDeleteMode
            ? "Selesai hapus"
            : `Hapus ${day.label}`;
      actions.append(deleteModeButton);
    }

    header.append(title, actions);

    const list = document.createElement("ul");
    list.className = `special-task-list${isReorderMode ? " is-reorder-mode" : ""}${
      isEditMode ? " is-edit-mode" : ""
    }${isDeleteMode ? " is-delete-mode" : ""}`;

    if (dayTasks.length === 0) {
      const empty = document.createElement("li");
      empty.className = "special-empty";
      empty.textContent = isToday
        ? "Tidak ada task di hari ini."
        : "Tidak ada task di hari itu.";
      list.append(empty);
    } else {
      dayTasks.forEach((task) => {
        const isComplete = isToday && todayCompletedSpecialIds.includes(task.id);
        const isSelectedForDelete = isDeleteMode && state.selectedDeleteIds.has(task.id);
        const item = document.createElement("li");
        item.className = `special-task-item${isComplete ? " is-complete" : ""}${
          isSelectedForDelete ? " is-selected-for-delete" : ""
        }`;
        item.dataset.specialId = task.id;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check special-check";
        checkbox.checked = isComplete;
        checkbox.disabled = !isToday;
        checkbox.setAttribute(
          "aria-label",
          isToday
            ? `Tandai ${task.text} selesai`
            : `Checklist ${task.text} aktif saat hari ${day.label}`,
        );

        const text = document.createElement("span");
        text.className = "special-task-text";
        text.textContent = task.text;

        const actions = document.createElement("span");
        actions.className = "task-actions";

        actions.append(checkbox);
        item.append(text, actions);
        list.append(item);
      });
    }

    const form = document.createElement("form");
    form.className = "special-form";
    form.dataset.dayKey = day.key;
    form.autocomplete = "off";

    const input = document.createElement("input");
    input.className = "special-input";
    input.type = "text";
    input.placeholder = `Task ${day.label.toLowerCase()}...`;
    input.maxLength = 80;
    input.required = true;

    const addButton = document.createElement("button");
    addButton.className = "special-add-button";
    addButton.type = "submit";
    addButton.innerHTML = getPlusIcon();
    addButton.setAttribute("aria-label", `Tambah task khusus ${day.label}`);

    form.append(input, addButton);
    card.append(header, list, form);
    fragment.append(card);
  });

  elements.specialWeekGrid.append(fragment);
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

  if (state.dailyActionMode === "delete") {
    toggleDeleteSelection(taskId);
    renderTasks();
    return;
  }

  if (state.dailyActionMode === "edit") {
    openEditDialog(taskId);
    return;
  }

  if (state.dailyReorderMode) return;

  if (event.target.matches(".task-check")) {
    toggleTaskStatus(taskId, event.target.checked);
    taskItem.classList.toggle("is-complete", event.target.checked);
    if (event.target.checked) {
      playChecklistAnimation(taskItem);
    }
    updateStats();
    renderHistory();
    return;
  }

}

function toggleDeleteSelection(taskId) {
  if (state.selectedDeleteIds.has(taskId)) {
    state.selectedDeleteIds.delete(taskId);
    return;
  }

  state.selectedDeleteIds.add(taskId);
}

function handleSpecialTaskSubmit(event) {
  const form = event.target.closest(".special-form");
  if (!form) return;

  event.preventDefault();

  const dayKey = form.dataset.dayKey;
  const input = form.querySelector(".special-input");
  const text = input.value.trim();

  if (!text || !state.specialTasks[dayKey]) return;

  state.specialTasks[dayKey].push({
    id: crypto.randomUUID(),
    text,
  });

  input.value = "";
  saveSpecialTasks();
  renderSpecialTasks();
  updateStats();
  renderHistory();
}

function handleSpecialTaskClick(event) {
  const reorderButton = event.target.closest(".special-reorder-button");
  if (reorderButton) {
    toggleSpecialReorderMode(reorderButton.dataset.dayKey);
    return;
  }

  const editModeButton = event.target.closest(".special-edit-mode-button");
  if (editModeButton) {
    toggleSpecialEditMode(editModeButton.dataset.dayKey);
    return;
  }

  const deleteModeButton = event.target.closest(".special-delete-mode-button");
  if (deleteModeButton) {
    toggleSpecialDeleteMode(deleteModeButton.dataset.dayKey);
    return;
  }

  const activeReorderCard = event.target.closest(".special-day-card.is-reorder-mode");
  if (activeReorderCard && event.target.closest(".special-task-item")) return;

  const specialItem = event.target.closest(".special-task-item");
  const dayCard = event.target.closest(".special-day-card");

  if (
    specialItem &&
    dayCard &&
    state.specialActionDayKey === dayCard.dataset.dayKey &&
    state.specialActionMode === "delete"
  ) {
    toggleDeleteSelection(specialItem.dataset.specialId);
    renderSpecialTasks();
    return;
  }

  if (
    specialItem &&
    dayCard &&
    state.specialActionDayKey === dayCard.dataset.dayKey &&
    state.specialActionMode === "edit"
  ) {
    openEditDialog(specialItem.dataset.specialId, {
      type: "special",
      dayKey: dayCard.dataset.dayKey,
    });
    return;
  }

  if (event.target.matches(".special-check")) {
    const item = event.target.closest(".special-task-item");
    const dayCard = event.target.closest(".special-day-card");

    if (!item || !dayCard?.classList.contains("is-today")) return;

    toggleSpecialTaskStatus(item.dataset.specialId, event.target.checked);
    item.classList.toggle("is-complete", event.target.checked);
    if (event.target.checked) {
      playChecklistAnimation(item);
    }
    updateStats();
    renderHistory();
    return;
  }
}

function toggleSpecialReorderMode(dayKey) {
  if (!dayKey || (state.specialTasks[dayKey]?.length ?? 0) < 2) return;

  const isActive = state.specialReorderDayKey === dayKey;

  if (isActive && state.drag?.type === "special") {
    cleanupTaskDrag();
  }

  state.specialReorderDayKey = isActive ? null : dayKey;
  state.specialActionMode = null;
  state.specialActionDayKey = null;
  state.selectedDeleteIds.clear();
  if (state.specialReorderDayKey && state.dailyReorderMode) {
    state.dailyReorderMode = false;
    state.dailyActionMode = null;
    updateDailyReorderMode();
  }
  renderSpecialTasks();
}

function toggleSpecialEditMode(dayKey) {
  if (!dayKey || (state.specialTasks[dayKey]?.length ?? 0) === 0) return;

  const isActive =
    state.specialActionMode === "edit" && state.specialActionDayKey === dayKey;

  clearDailyModes();
  state.specialReorderDayKey = null;
  state.specialActionMode = isActive ? null : "edit";
  state.specialActionDayKey = isActive ? null : dayKey;
  state.selectedDeleteIds.clear();
  renderTasks();
  renderSpecialTasks();
}

function toggleSpecialDeleteMode(dayKey) {
  if (!dayKey || (state.specialTasks[dayKey]?.length ?? 0) === 0) return;

  const isActive =
    state.specialActionMode === "delete" && state.specialActionDayKey === dayKey;

  if (isActive) {
    if (state.selectedDeleteIds.size > 0) {
      openDeleteDialogForTasks([...state.selectedDeleteIds], {
        type: "special",
        dayKey,
      });
      return;
    }

    state.specialActionMode = null;
    state.specialActionDayKey = null;
    renderSpecialTasks();
    return;
  }

  clearDailyModes();
  state.specialReorderDayKey = null;
  state.specialActionMode = "delete";
  state.specialActionDayKey = dayKey;
  state.selectedDeleteIds.clear();
  renderTasks();
  renderSpecialTasks();
}

function clearSpecialModes() {
  if (state.drag?.type === "special") {
    cleanupTaskDrag();
  }

  state.specialReorderDayKey = null;
  state.specialActionMode = null;
  state.specialActionDayKey = null;
  state.selectedDeleteIds.clear();
}

function toggleSpecialTaskStatus(taskId, isComplete) {
  const completedIds = new Set(getTodaySpecialCompletedIds());

  if (isComplete) {
    completedIds.add(taskId);
  } else {
    completedIds.delete(taskId);
  }

  state.specialCompletions[state.todayKey] = [...completedIds];
  saveSpecialCompletions();
}

function playChecklistAnimation(item) {
  item.classList.remove("is-check-animating");
  void item.offsetWidth;
  item.classList.add("is-check-animating");

  window.setTimeout(() => {
    item.classList.remove("is-check-animating");
  }, 440);
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

function getPlusIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-linecap="round" />
    </svg>
  `;
}

function getReorderIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="4" />
    </svg>
  `;
}

function getPencilIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 20h9" fill="none" stroke="currentColor" stroke-linecap="round" />
      <path d="m16.5 3.5 4 4L8 20H4v-4L16.5 3.5Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
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

function handleHistoryViewChange(event) {
  const view = event.currentTarget.dataset.historyView;
  if (!HISTORY_TITLES[view]) return;

  state.historyView = view;
  renderHistory();
}

function openEditDialog(taskId, options = {}) {
  const type = options.type ?? "daily";
  const task =
    type === "special"
      ? state.specialTasks[options.dayKey]?.find((item) => item.id === taskId)
      : state.tasks.find((item) => item.id === taskId);

  if (!task) return;

  state.pendingEditId = taskId;
  state.pendingEditType = type;
  state.pendingEditDayKey = options.dayKey ?? null;
  elements.editTaskInput.value = task.text;

  if (typeof elements.editDialog.showModal === "function") {
    elements.editDialog.showModal();
    window.setTimeout(() => {
      elements.editTaskInput.focus();
      elements.editTaskInput.select();
    }, 0);
    return;
  }

  const nextText = window.prompt("Ubah nama task:", task.text)?.trim();

  if (nextText) {
    editTask(taskId, nextText, { type, dayKey: options.dayKey });
  }

  clearPendingEdit();
}

function closeEditDialog() {
  clearPendingEdit();

  if (elements.editDialog.open) {
    elements.editDialog.close();
  }
}

function handleEditDialogBackdropClick(event) {
  if (event.target === elements.editDialog) {
    closeEditDialog();
  }
}

function handleEditInputKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    confirmEditTask();
  }
}

function confirmEditTask() {
  if (!state.pendingEditId) return;

  const text = elements.editTaskInput.value.trim();

  if (!text) {
    elements.editTaskInput.focus();
    return;
  }

  const taskId = state.pendingEditId;
  const type = state.pendingEditType;
  const dayKey = state.pendingEditDayKey;

  clearPendingEdit();

  if (elements.editDialog.open) {
    elements.editDialog.close();
  }

  editTask(taskId, text, { type, dayKey });
}

function clearPendingEdit() {
  state.pendingEditId = null;
  state.pendingEditType = "daily";
  state.pendingEditDayKey = null;
}

function editTask(taskId, text, options = {}) {
  const type = options.type ?? "daily";

  if (type === "special") {
    editSpecialTask(options.dayKey, taskId, text);
    return;
  }

  editDailyTask(taskId, text);
}

function editDailyTask(taskId, text) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  task.text = text;
  syncTodaySnapshot();
  saveTasks();
  saveTaskSnapshots();
  renderTasks();
  renderHistory();
}

function editSpecialTask(dayKey, taskId, text) {
  const task = state.specialTasks[dayKey]?.find((item) => item.id === taskId);
  if (!task) return;

  task.text = text;
  saveSpecialTasks();
  renderSpecialTasks();
  renderHistory();
}

function openDeleteDialogForTasks(taskIds, options = {}) {
  const type = options.type ?? "daily";
  const sourceTasks = type === "special" ? state.specialTasks[options.dayKey] ?? [] : state.tasks;
  const selectedTasks = sourceTasks.filter((task) => taskIds.includes(task.id));

  if (selectedTasks.length === 0) return;

  state.pendingDeleteId = selectedTasks[0].id;
  state.pendingDeleteIds = selectedTasks.map((task) => task.id);
  state.pendingDeleteType = type;
  state.pendingDeleteDayKey = options.dayKey ?? null;
  elements.deleteDialogTitle.textContent =
    selectedTasks.length > 1 ? `Hapus ${selectedTasks.length} task?` : "Hapus task?";
  elements.deleteTaskName.textContent =
    selectedTasks.length > 1
      ? selectedTasks.map((task) => task.text).join(", ")
      : selectedTasks[0].text;

  if (typeof elements.deleteDialog.showModal === "function") {
    elements.deleteDialog.showModal();
    return;
  }

  const confirmText =
    selectedTasks.length > 1
      ? `Hapus ${selectedTasks.length} task terpilih?`
      : `Hapus task "${selectedTasks[0].text}"?`;

  if (window.confirm(confirmText)) {
    confirmDeleteTask();
  } else {
    state.pendingDeleteId = null;
    state.pendingDeleteIds = [];
  }
}

function closeDeleteDialog() {
  state.pendingDeleteId = null;
  state.pendingDeleteIds = [];
  state.pendingDeleteType = "daily";
  state.pendingDeleteDayKey = null;
  elements.deleteDialogTitle.textContent = "Hapus task?";

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
  if (!state.pendingDeleteId && state.pendingDeleteIds.length === 0) return;

  const taskIds =
    state.pendingDeleteIds.length > 0 ? [...state.pendingDeleteIds] : [state.pendingDeleteId];
  const type = state.pendingDeleteType;
  const dayKey = state.pendingDeleteDayKey;
  state.pendingDeleteId = null;
  state.pendingDeleteIds = [];
  state.pendingDeleteType = "daily";
  state.pendingDeleteDayKey = null;
  elements.deleteDialogTitle.textContent = "Hapus task?";

  if (elements.deleteDialog.open) {
    elements.deleteDialog.close();
  }

  if (type === "special") {
    deleteSpecialTasks(dayKey, taskIds);
    return;
  }

  deleteTasks(taskIds);
}

function deleteTasks(taskIds) {
  const taskIdSet = new Set(taskIds);
  state.tasks = state.tasks.filter((task) => !taskIdSet.has(task.id));

  // History tanggal lama tetap utuh; yang dibersihkan hanya data hari ini.
  state.completions[state.todayKey] = getTodayCompletedIds().filter(
    (completedId) => !taskIdSet.has(completedId),
  );
  state.taskSnapshots[state.todayKey] = getHistoryTasks(state.todayKey).filter(
    (task) => !taskIdSet.has(task.id),
  );
  state.dailyActionMode = null;
  state.selectedDeleteIds.clear();

  saveTasks();
  saveCompletions();
  saveTaskSnapshots();
  renderTasks();
  renderHistory();
}

function deleteSpecialTasks(dayKey, taskIds) {
  if (!state.specialTasks[dayKey]) return;

  const taskIdSet = new Set(taskIds);
  state.specialTasks[dayKey] = state.specialTasks[dayKey].filter(
    (task) => !taskIdSet.has(task.id),
  );
  state.specialCompletions[state.todayKey] = getTodaySpecialCompletedIds().filter(
    (completedId) => !taskIdSet.has(completedId),
  );
  state.specialActionMode = null;
  state.specialActionDayKey = null;
  state.selectedDeleteIds.clear();

  saveSpecialTasks();
  saveSpecialCompletions();
  renderSpecialTasks();
  updateStats();
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
  const total = getTotalTaskCountForDate(state.todayKey);
  const completed = getCompletedTaskCountForDate(state.todayKey);
  const remaining = Math.max(0, total - completed);
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
  const monthlyStats = calculatePeriodStats(getStartOfMonth(today), getEndOfMonth(today));

  renderPeriodStats("weekly", weeklyStats);
  renderPeriodStats("monthly", monthlyStats);
}

function calculatePeriodStats(startDate, endDate) {
  const dateKeys = getDateKeysBetween(startDate, endDate);
  const target = dateKeys.reduce(
    (total, dateKey) => total + getTotalTaskCountForDate(dateKey),
    0,
  );
  const completed = dateKeys.reduce(
    (total, dateKey) => total + getCompletedTaskCountForDate(dateKey),
    0,
  );
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
  const dateKey = elements.historyDate.value || state.todayKey;

  updateHistoryViewButtons();
  elements.historyTitle.textContent = HISTORY_TITLES[state.historyView];

  if (state.historyView === "daily") {
    renderDailyHistory(getDailyHistoryData(dateKey));
    return;
  }

  renderRecapHistory(getRecapHistoryData(dateKey, state.historyView));
}

function updateHistoryViewButtons() {
  elements.historyViewButtons.forEach((button) => {
    const isActive = button.dataset.historyView === state.historyView;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function renderDailyHistory(data) {
  renderHistorySummary(data.stats);
  elements.historyPeriodList.hidden = true;
  elements.historyTaskList.hidden = false;
  elements.historyTaskList.innerHTML = "";
  elements.historyNotesLabel.textContent = "Daily Notes";

  if (data.items.length === 0) {
    elements.historyTaskList.innerHTML =
      '<li class="empty-state">Belum ada history task untuk tanggal ini.</li>';
  } else {
    const fragment = document.createDocumentFragment();

    data.items.forEach((task) => {
      const item = document.createElement("li");
      item.className = `history-item${task.completed ? " is-complete" : ""}`;

      const status = document.createElement("span");
      status.className = "history-status";
      status.setAttribute("aria-hidden", "true");

      const content = document.createElement("span");
      content.className = "history-task-content";

      const taskName = document.createElement("span");
      taskName.className = "history-task-name";
      taskName.textContent = task.text;

      const taskType = document.createElement("span");
      taskType.className = "history-task-type";
      taskType.textContent = task.type;

      const stateLabel = document.createElement("span");
      stateLabel.className = "history-state";
      stateLabel.textContent = task.completed ? "Selesai" : "Belum";

      content.append(taskName, taskType);
      item.append(status, content, stateLabel);
      fragment.append(item);
    });

    elements.historyTaskList.append(fragment);
  }

  elements.historyNotes.textContent = data.notes;
}

function renderRecapHistory(data) {
  renderHistorySummary(data.stats);
  elements.historyTaskList.hidden = true;
  elements.historyPeriodList.hidden = false;
  elements.historyPeriodList.innerHTML = "";
  elements.historyNotesLabel.textContent = "Catatan Dalam Periode";
  elements.historyNotes.textContent = data.notesSummary;

  const fragment = document.createDocumentFragment();

  data.days.forEach((day) => {
    const item = document.createElement("article");
    item.className = "history-period-item";

    const header = document.createElement("div");
    header.className = "history-period-heading";

    const title = document.createElement("strong");
    title.textContent = day.shortLabel;

    const percent = document.createElement("span");
    percent.textContent = `${day.stats.percent}%`;

    const progress = document.createElement("div");
    progress.className = "mini-progress";
    progress.setAttribute("aria-label", `Progress ${day.shortLabel}`);

    const fill = document.createElement("div");
    fill.className = "mini-progress-fill";
    fill.style.width = `${day.stats.percent}%`;

    const meta = document.createElement("p");
    meta.className = "history-period-meta";
    meta.textContent = `${day.stats.completed}/${day.stats.total} checklist selesai`;

    const note = document.createElement("p");
    note.className = "history-period-note";
    note.textContent = getRecapDayDescription(day);

    header.append(title, percent);
    progress.append(fill);
    item.append(header, progress, meta, note);
    fragment.append(item);
  });

  elements.historyPeriodList.append(fragment);
}

function renderHistorySummary(stats) {
  elements.historyTotal.textContent = stats.total;
  elements.historyCompleted.textContent = stats.completed;
  elements.historyRemaining.textContent = stats.remaining;
  elements.historyPercent.textContent = `${stats.percent}%`;
}

function getDailyHistoryData(dateKey) {
  const completedIds = new Set(state.completions[dateKey] ?? []);
  const completedSpecialIds = new Set(state.specialCompletions[dateKey] ?? []);
  const dailyTasks = getHistoryTasks(dateKey).map((task) => ({
    id: task.id,
    text: task.text,
    type: "Daily Task",
    completed: completedIds.has(task.id),
  }));
  const specialTasks = getSpecialTasksForDateKey(dateKey).map((task) => ({
    id: task.id,
    text: task.text,
    type: "Task Khusus",
    completed: completedSpecialIds.has(task.id),
  }));
  const items = [...dailyTasks, ...specialTasks];
  const notesRaw = state.notes[dateKey]?.trim() ?? "";

  return {
    mode: "daily",
    dateKey,
    formattedDate: formatFullDate(dateKey),
    shortLabel: formatShortDate(dateKey),
    canvasEyebrow: "RIWAYAT HARIAN",
    canvasTitle: "DAILY LEVEL UP",
    progressLabel: "Progress",
    tasks: dailyTasks.map(({ text, completed }) => ({ text, completed })),
    specialTasks: specialTasks.map(({ text, completed }) => ({ text, completed })),
    items,
    notesRaw,
    notes: notesRaw || "Belum ada catatan untuk tanggal ini.",
    stats: getStatsFromItems(items),
  };
}

function getRecapHistoryData(dateKey, mode) {
  const selectedDate = parseDateKey(dateKey);
  const startDate = mode === "weekly" ? getStartOfWeek(selectedDate) : getStartOfMonth(selectedDate);
  const endDate = selectedDate;
  const days = getDateKeysBetween(startDate, endDate).map(getDailyHistoryData);
  const total = days.reduce((sum, day) => sum + day.stats.total, 0);
  const completed = days.reduce((sum, day) => sum + day.stats.completed, 0);
  const stats = createStats(total, completed);
  const periodLabel =
    mode === "weekly"
      ? `${formatShortDate(getDateKey(startDate))} - ${formatShortDate(getDateKey(endDate))}`
      : formatMonthLabel(dateKey);
  const notesSummary = days
    .filter((day) => day.notesRaw)
    .map((day) => `${day.shortLabel}\n${day.notesRaw}`)
    .join("\n\n");

  return {
    mode,
    title: HISTORY_TITLES[mode],
    dateKey,
    formattedDate: periodLabel,
    days,
    notesSummary: notesSummary || "Belum ada catatan dalam periode ini.",
    stats,
  };
}

function getStatsFromItems(items) {
  return createStats(
    items.length,
    items.filter((item) => item.completed).length,
  );
}

function createStats(total, completed) {
  const remaining = Math.max(0, total - completed);
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { total, completed, remaining, percent };
}

function getRecapDayDescription(day) {
  if (day.stats.total === 0) {
    return "Belum ada task pada tanggal ini.";
  }

  const unfinishedTasks = day.items.filter((item) => !item.completed);

  if (unfinishedTasks.length === 0) {
    return day.notesRaw ? "Semua checklist selesai. Ada catatan harian." : "Semua checklist selesai.";
  }

  const preview = unfinishedTasks
    .slice(0, 3)
    .map((task) => task.text)
    .join(", ");
  const moreCount = unfinishedTasks.length - 3;

  return `Belum: ${preview}${moreCount > 0 ? ` +${moreCount} lagi` : ""}`;
}

function exportProgress() {
  const completedIds = getTodayCompletedIds();
  const completedSpecialIds = getTodaySpecialCompletedIds();
  const total = getTotalTaskCountForDate(state.todayKey);
  const completed = getCompletedTaskCountForDate(state.todayKey);
  const remaining = Math.max(0, total - completed);
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
  const exportData = {
    date: state.todayKey,
    formattedDate: elements.todayDate.textContent,
    tasks: state.tasks.map((task) => ({
      text: task.text,
      completed: completedIds.includes(task.id),
    })),
    specialTasks: getTodaySpecialTasks().map((task) => ({
      text: task.text,
      completed: completedSpecialIds.includes(task.id),
    })),
    notes: state.notes[state.todayKey]?.trim() || "Belum ada catatan hari ini.",
    stats: { total, completed, remaining, percent },
  };

  const canvas = createProgressCanvas(exportData);

  downloadCanvas(canvas, `daily-level-up-${state.todayKey}.png`);
}

function exportHistory() {
  const dateKey = elements.historyDate.value || state.todayKey;
  const canvas =
    state.historyView === "daily"
      ? createProgressCanvas(getDailyHistoryData(dateKey))
      : createRecapCanvas(getRecapHistoryData(dateKey, state.historyView));

  downloadCanvas(canvas, `daily-level-up-${state.historyView}-${dateKey}.png`);
}

function downloadCanvas(canvas, filename) {
  const link = document.createElement("a");

  link.href = canvas.toDataURL("image/png");
  link.download = filename;
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
  const specialRows = (data.specialTasks ?? []).map((task) => {
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
  const specialRowsHeight =
    specialRows.length === 0
      ? 74
      : specialRows.reduce((total, task) => total + task.height, 0) +
        (specialRows.length - 1) * 14;
  const notesBoxHeight = Math.max(130, noteLines.length * 38 + 62);
  const height = Math.max(
    1160,
    padding +
      275 +
      48 +
      126 +
      72 +
      taskRowsHeight +
      66 +
      specialRowsHeight +
      82 +
      notesBoxHeight +
      80,
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
  y = drawCanvasSpecialTasks(context, specialRows, padding, contentWidth, y);
  y += 66;
  drawCanvasNotes(context, noteLines, padding, contentWidth, y, notesBoxHeight);

  return canvas;
}

function createRecapCanvas(data) {
  if (data.mode === "monthly") {
    return createMonthlyRecapCanvas(data);
  }

  const width = 1200;
  const padding = 80;
  const contentWidth = width - padding * 2;
  const dayRows = data.days.map((day) => {
    const description = getRecapDayDescription(day);
    const lines = wrapCanvasText(description, contentWidth - 320, "24px Arial");
    const descriptionTop = 108;
    const descriptionLineHeight = 30;
    const bottomPadding = 28;

    return {
      ...day,
      description,
      lines,
      descriptionTop,
      descriptionLineHeight,
      height: Math.max(
        154,
        descriptionTop + Math.max(1, lines.length) * descriptionLineHeight + bottomPadding,
      ),
    };
  });
  const rowsHeight =
    dayRows.length === 0
      ? 74
      : dayRows.reduce((total, day) => total + day.height, 0) +
        (dayRows.length - 1) * 14;
  const noteLines = wrapCanvasText(data.notesSummary, contentWidth - 56, "28px Arial");
  const notesBoxHeight = Math.max(130, noteLines.length * 36 + 62);
  const height = Math.max(
    1080,
    padding + 275 + 48 + 126 + 72 + rowsHeight + 66 + notesBoxHeight + 80,
  );
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  drawCanvasBackground(context, width, height);

  let y = padding;
  y = drawCanvasHeader(
    context,
    {
      formattedDate: data.formattedDate,
      stats: data.stats,
      canvasEyebrow: data.title.toUpperCase(),
      canvasTitle: "DAILY LEVEL UP",
      progressLabel: "Progress",
    },
    padding,
    contentWidth,
    y,
  );
  y += 48;
  y = drawCanvasStats(context, data.stats, padding, contentWidth, y);
  y += 72;
  y = drawCanvasRecapDays(context, dayRows, padding, contentWidth, y);
  y += 66;
  drawCanvasNotes(
    context,
    noteLines,
    padding,
    contentWidth,
    y,
    notesBoxHeight,
    "CATATAN PERIODE",
  );

  return canvas;
}

function createMonthlyRecapCanvas(data) {
  const width = 1200;
  const padding = 80;
  const contentWidth = width - padding * 2;
  const gap = 12;
  const weekdayHeight = 36;
  const cellWidth = (contentWidth - gap * 6) / 7;
  const cellHeight = 112;
  const firstDate = getStartOfMonth(parseDateKey(data.dateKey));
  const monthOffset = getMondayFirstDayOffset(firstDate);
  const rowCount = Math.max(1, Math.ceil((monthOffset + data.days.length) / 7));
  const gridHeight = weekdayHeight + rowCount * cellHeight + (rowCount - 1) * gap;
  const noteLines = wrapCanvasText(data.notesSummary, contentWidth - 56, "28px Arial");
  const notesBoxHeight = Math.max(130, noteLines.length * 36 + 62);
  const height = Math.max(
    1380,
    padding + 275 + 48 + 126 + 72 + gridHeight + 66 + notesBoxHeight + 80,
  );
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width;
  canvas.height = height;

  drawCanvasBackground(context, width, height);

  let y = padding;
  y = drawCanvasHeader(
    context,
    {
      formattedDate: data.formattedDate,
      stats: data.stats,
      canvasEyebrow: data.title.toUpperCase(),
      canvasTitle: "DAILY LEVEL UP",
      progressLabel: "Progress",
    },
    padding,
    contentWidth,
    y,
  );
  y += 48;
  y = drawCanvasStats(context, data.stats, padding, contentWidth, y);
  y += 72;
  y = drawCanvasMonthlyGrid(
    context,
    data.days,
    padding,
    contentWidth,
    y,
    monthOffset,
    cellWidth,
    cellHeight,
    gap,
    weekdayHeight,
  );
  y += 66;
  drawCanvasNotes(
    context,
    noteLines,
    padding,
    contentWidth,
    y,
    notesBoxHeight,
    "CATATAN PERIODE",
  );

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
  context.fillText(data.canvasEyebrow ?? "PERSONAL PRODUCTIVITY", padding, y);

  context.fillStyle = "#111827";
  context.font = "800 76px Arial";
  context.fillText(data.canvasTitle ?? "DAILY LEVEL UP", padding, y + 86);

  context.fillStyle = "#64748b";
  context.font = "28px Arial";
  context.fillText(data.formattedDate, padding, y + 132);

  context.fillStyle = "#334155";
  context.font = "32px Arial";
  context.fillText(`${data.progressLabel ?? "Progress hari ini"}: ${data.stats.percent}%`, padding, y + 196);

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

function drawCanvasSpecialTasks(context, specialRows, padding, contentWidth, y) {
  context.fillStyle = "#0f766e";
  context.font = "700 24px Arial";
  context.fillText("TASK KHUSUS HARI INI", padding, y);

  let currentY = y + 28;

  if (specialRows.length === 0) {
    drawRoundRect(context, padding, currentY, contentWidth, 74, 14, "#ffffff", "#d8e0e8");
    context.fillStyle = "#64748b";
    context.font = "28px Arial";
    context.fillText("Tidak ada task khusus di hari ini.", padding + 28, currentY + 46);
    return currentY + 74;
  }

  specialRows.forEach((task) => {
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

function drawCanvasRecapDays(context, dayRows, padding, contentWidth, y) {
  context.fillStyle = "#0f766e";
  context.font = "700 24px Arial";
  context.fillText("RINCIAN PERIODE", padding, y);

  let currentY = y + 28;

  if (dayRows.length === 0) {
    drawRoundRect(context, padding, currentY, contentWidth, 74, 14, "#ffffff", "#d8e0e8");
    context.fillStyle = "#64748b";
    context.font = "28px Arial";
    context.fillText("Belum ada data pada periode ini.", padding + 28, currentY + 46);
    return currentY + 74;
  }

  dayRows.forEach((day) => {
    drawRoundRect(context, padding, currentY, contentWidth, day.height, 14, "#ffffff", "#d8e0e8");

    context.fillStyle = "#111827";
    context.font = "700 28px Arial";
    context.fillText(day.shortLabel, padding + 28, currentY + 42);

    context.fillStyle = "#0f766e";
    context.font = "800 28px Arial";
    context.textAlign = "right";
    context.fillText(`${day.stats.percent}%`, padding + contentWidth - 28, currentY + 42);
    context.textAlign = "left";

    drawCanvasProgress(
      context,
      padding + contentWidth - 302,
      currentY + 58,
      274,
      12,
      day.stats.percent,
    );

    context.fillStyle = "#64748b";
    context.font = "23px Arial";
    context.fillText(
      `${day.stats.completed}/${day.stats.total} checklist selesai`,
      padding + 28,
      currentY + 78,
    );

    context.fillStyle = "#334155";
    context.font = "24px Arial";
    day.lines.forEach((line, index) => {
      context.fillText(
        line,
        padding + 28,
        currentY + day.descriptionTop + index * day.descriptionLineHeight,
      );
    });

    currentY += day.height + 14;
  });

  return currentY - 14;
}

function drawCanvasMonthlyGrid(
  context,
  days,
  padding,
  contentWidth,
  y,
  monthOffset,
  cellWidth,
  cellHeight,
  gap,
  weekdayHeight,
) {
  context.fillStyle = "#0f766e";
  context.font = "700 24px Arial";
  context.fillText("RINCIAN BULANAN", padding, y);

  const weekdays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
  const weekdayY = y + 52;

  context.font = "700 20px Arial";
  context.fillStyle = "#64748b";
  weekdays.forEach((label, index) => {
    const x = padding + index * (cellWidth + gap);
    context.fillText(label, x + 12, weekdayY);
  });

  const gridY = y + 28 + weekdayHeight;

  days.forEach((day, index) => {
    const position = monthOffset + index;
    const column = position % 7;
    const row = Math.floor(position / 7);
    const x = padding + column * (cellWidth + gap);
    const currentY = gridY + row * (cellHeight + gap);
    const dayNumber = parseDateKey(day.dateKey).getDate();
    const isCompleteDay = day.stats.total > 0 && day.stats.percent === 100;
    const fill = isCompleteDay ? "#ecfdf5" : "#ffffff";
    const stroke = isCompleteDay ? "#86efac" : "#d8e0e8";
    const status =
      day.stats.total === 0
        ? "Kosong"
        : isCompleteDay
          ? "Selesai"
          : `${day.stats.remaining} belum`;

    drawRoundRect(context, x, currentY, cellWidth, cellHeight, 14, fill, stroke);

    context.fillStyle = "#111827";
    context.font = "800 28px Arial";
    context.fillText(String(dayNumber), x + 14, currentY + 34);

    context.fillStyle = isCompleteDay ? "#047857" : "#0f766e";
    context.font = "800 23px Arial";
    context.textAlign = "right";
    context.fillText(`${day.stats.percent}%`, x + cellWidth - 14, currentY + 34);
    context.textAlign = "left";

    drawCanvasProgress(context, x + 14, currentY + 50, cellWidth - 28, 10, day.stats.percent);

    context.fillStyle = "#64748b";
    context.font = "19px Arial";
    context.fillText(
      `${day.stats.completed}/${day.stats.total} selesai`,
      x + 14,
      currentY + 78,
    );

    context.fillStyle = isCompleteDay ? "#047857" : "#334155";
    context.font = "700 20px Arial";
    context.fillText(status, x + 14, currentY + 102);
  });

  return gridY + Math.max(1, Math.ceil((monthOffset + days.length) / 7)) * (cellHeight + gap) - gap;
}

function getMondayFirstDayOffset(date) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
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

function drawCanvasNotes(
  context,
  noteLines,
  padding,
  contentWidth,
  y,
  notesBoxHeight,
  title = "DAILY NOTES",
) {
  context.fillStyle = "#0f766e";
  context.font = "700 24px Arial";
  context.fillText(title, padding, y);

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
  fillGradient.addColorStop(1, "#34d399");
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

function getTodaySpecialTasks() {
  return getSpecialTasksForDateKey(state.todayKey);
}

function getTodaySpecialCompletedIds() {
  return state.specialCompletions[state.todayKey] ?? [];
}

function getTotalTaskCountForDate(dateKey) {
  return state.tasks.length + getSpecialTasksForDateKey(dateKey).length;
}

function getCompletedTaskCountForDate(dateKey) {
  return (
    getCompletedDailyTaskCountForDate(dateKey) +
    getCompletedSpecialTaskCountForDate(dateKey)
  );
}

function getCompletedDailyTaskCountForDate(dateKey) {
  const taskIds = new Set(state.tasks.map((task) => task.id));
  const completedIds = state.completions[dateKey] ?? [];

  return completedIds.filter((taskId) => taskIds.has(taskId)).length;
}

function getCompletedSpecialTaskCountForDate(dateKey) {
  const specialTaskIds = new Set(
    getSpecialTasksForDateKey(dateKey).map((task) => task.id),
  );
  const completedIds = state.specialCompletions[dateKey] ?? [];

  return completedIds.filter((taskId) => specialTaskIds.has(taskId)).length;
}

function getSpecialTasksForDateKey(dateKey) {
  const dayKey = getWeekDayKey(parseDateKey(dateKey));
  return state.specialTasks[dayKey] ?? [];
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

function ensureSpecialCompletionBucket(dateKey) {
  if (!Array.isArray(state.specialCompletions[dateKey])) {
    state.specialCompletions[dateKey] = [];
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

function normalizeSpecialTasks() {
  WEEK_DAYS.forEach((day) => {
    if (!Array.isArray(state.specialTasks[day.key])) {
      state.specialTasks[day.key] = [];
    }
  });
}

function startDateWatcher() {
  window.setInterval(handleDateChange, 60 * 1000);
}

function handleDateChange() {
  const currentDateKey = getDateKey();

  if (currentDateKey === state.todayKey) return;

  state.todayKey = currentDateKey;
  ensureCompletionBucket(state.todayKey);
  ensureSpecialCompletionBucket(state.todayKey);
  ensureTaskSnapshot(state.todayKey);
  saveCompletions();
  saveSpecialCompletions();
  saveTaskSnapshots();
  renderHeader();
  renderTasks();
  renderSpecialTasks();
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

function getWeekDayKey(date = new Date()) {
  const keysByDayIndex = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return keysByDayIndex[date.getDay()];
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

function formatFullDate(dateKey) {
  return formatDate(dateKey, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(dateKey) {
  return formatDate(dateKey, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatMonthLabel(dateKey) {
  return formatDate(dateKey, {
    month: "long",
    year: "numeric",
  });
}

function formatDate(dateKey, options) {
  return new Intl.DateTimeFormat("id-ID", options).format(parseDateKey(dateKey));
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

function getEndOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
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
  document.body.classList.add("is-theme-switching");
  document.body.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEYS.theme, theme);
  elements.themeToggle.setAttribute(
    "aria-label",
    theme === "light" ? "Ganti ke dark mode" : "Ganti ke light mode",
  );

  window.requestAnimationFrame(() => {
    document.body.classList.remove("is-theme-switching");
  });
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

function saveSpecialTasks() {
  localStorage.setItem(
    STORAGE_KEYS.specialTasks,
    JSON.stringify(state.specialTasks),
  );
}

function saveSpecialCompletions() {
  localStorage.setItem(
    STORAGE_KEYS.specialCompletions,
    JSON.stringify(state.specialCompletions),
  );
}
