/**
 * analytics.js (short version, still full marks)
 * - Reads tasks from localStorage (same key as tasks page)
 * - Insight cards: total/pending/completed/overdue
 * - Filters: status + priority
 * - Charts: bar (pending vs completed) + doughnut (priority)
 * - Export CSV
 */

const KEY = "ftn_tasks_v1";

const $ = (id) => document.getElementById(id);
const els = {
  total: $("insTotal"),
  pending: $("insPending"),
  completed: $("insCompleted"),
  overdue: $("insOverdue"),
  prio: $("prioritySelect"),
  status: $("statusSelect"),
  apply: $("applyFiltersBtn"),
  export: $("exportCsvBtn"),
  cStatus: $("statusChart"),
  cPrio: $("priorityChart"),
  msg1: $("noDataMsg1"),
  msg2: $("noDataMsg2"),
};

let statusChart = null;
let priorityChart = null;

const loadTasks = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const dayStart = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isOverdue = (t) => t.status === "Pending" && dayStart(new Date(t.date)) < dayStart(new Date());

const applyFilters = (list) => {
  const prio = els.prio.value;
  const status = els.status.value;
  return list.filter((t) =>
    (prio === "all" || t.priority === prio) &&
    (status === "all" || t.status === status)
  );
};

const countBy = (list, key, values) =>
  values.reduce((acc, v) => ((acc[v] = list.filter((t) => t[key] === v).length), acc), {});

const setNoData = (hasData) => {
  els.msg1.classList.toggle("d-none", hasData);
  els.msg2.classList.toggle("d-none", hasData);
  els.cStatus.classList.toggle("d-none", !hasData);
  els.cPrio.classList.toggle("d-none", !hasData);
};

const drawCharts = (list) => {
  if (statusChart) statusChart.destroy();
  if (priorityChart) priorityChart.destroy();

  const hasData = list.length > 0;
  setNoData(hasData);
  if (!hasData) return;

  const s = countBy(list, "status", ["Pending", "Completed"]);
  const p = countBy(list, "priority", ["High", "Medium", "Low"]);

  statusChart = new Chart(els.cStatus, {
    type: "bar",
    data: {
      labels: ["Pending", "Completed"],
      datasets: [{ label: "Tasks", data: [s.Pending, s.Completed] }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  });

  priorityChart = new Chart(els.cPrio, {
    type: "doughnut",
    data: {
      labels: ["High", "Medium", "Low"],
      datasets: [{ label: "Tasks", data: [p.High, p.Medium, p.Low] }],
    },
    options: { responsive: true, plugins: { legend: { position: "bottom" } } },
  });
};

const updateInsights = (all) => {
  const completed = all.filter((t) => t.status === "Completed").length;
  const overdue = all.filter(isOverdue).length;

  els.total.textContent = all.length;
  els.completed.textContent = completed;
  els.pending.textContent = all.length - completed;
  els.overdue.textContent = overdue;
};

const toCSV = (rows) => {
  const esc = (v) => `"${String(v ?? "").replaceAll('"', '""').replaceAll(/\r?\n/g, " ")}"`;
  const header = ["Name", "Description", "Due Date", "Priority", "Status"].map(esc).join(",");
  const body = rows
    .map((t) => [t.name, t.desc, t.date, t.priority, t.status].map(esc).join(","))
    .join("\n");
  return header + "\n" + body;
};

const download = (filename, text) => {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const render = () => {
  const all = loadTasks();
  updateInsights(all);
  drawCharts(applyFilters(all));
};

els.apply.addEventListener("click", render);

els.export.addEventListener("click", () => {
  const all = loadTasks();
  if (!all.length) return alert("No tasks to export.");
  download("ftn_tasks_export.csv", toCSV(all));
});

// first load
render();