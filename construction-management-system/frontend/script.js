const API_URL = `${(window.CONSTRUCTION_API_URL || "http://localhost:5000").replace(/\/$/, "")}/api`;

let token = sessionStorage.getItem("constructionToken") || "";

// --- Helpers ---
function authHeader() {
  return { Authorization: `Bearer ${token}` };
}

function setStatus(message, kind = "info") {
  const status = document.getElementById("status");
  status.textContent = message;
  status.dataset.kind = kind;
}

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    token = "";
    sessionStorage.removeItem("constructionToken");
  }
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}
function setTotal(cost) {
  document.getElementById("totalCost").textContent = `R${cost.toFixed(2)}`;
}

// --- Auth ---
async function register() {
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value;
  if (!username || password.length < 8) {
    setStatus("Enter a username and a password of at least 8 characters.", "error");
    return;
  }

  try {
    const data = await request("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    setStatus(data.message, "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  try {
    const data = await request("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });
    token = data.token;
    sessionStorage.setItem("constructionToken", token);
    await fetchTasks();
    setStatus("Logged in successfully.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
}

// --- Tasks ---
async function fetchTasks() {
  try {
    const tasks = await request("/tasks", { headers: authHeader() });
    renderTasks(tasks);
  } catch (error) {
    setStatus(error.message, "error");
  }
}

async function addTask(name, cost, deadline) {
  await request("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ name, cost, deadline })
  });
  await fetchTasks();
}

async function deleteTask(id) {
  await request(`/tasks/${encodeURIComponent(id)}`, { method: "DELETE", headers: authHeader() });
  await fetchTasks();
}

async function editTask(id) {
  const name = prompt("New task name:");
  if (name === null) return;
  const costStr = prompt("New cost:");
  if (costStr === null) return;
  const deadline = prompt("New deadline (YYYY-MM-DD):");
  if (deadline === null) return;

  const cost = Number(costStr);
  if (!name.trim() || !Number.isFinite(cost) || cost < 0 || !deadline) {
    setStatus("Enter a valid task name, non-negative cost, and deadline.", "error");
    return;
  }

  await request(`/tasks/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ name, cost, deadline })
  });
  await fetchTasks();
}

// --- Render ---
function renderTasks(tasks) {
  const tbody = document.querySelector("#taskTable tbody");
  tbody.innerHTML = "";
  const total = tasks.reduce((sum, t) => sum + (Number(t.cost) || 0), 0);

  tasks.forEach((t) => {
    const tr = document.createElement("tr");
    const nameCell = document.createElement("td");
    const costCell = document.createElement("td");
    const deadlineCell = document.createElement("td");
    const actionsCell = document.createElement("td");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    nameCell.textContent = t.name;
    costCell.textContent = Number(t.cost).toFixed(2);
    deadlineCell.textContent = new Date(t.deadline).toLocaleDateString();
    editButton.type = "button";
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editTask(t._id).catch((error) => setStatus(error.message, "error")));
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteTask(t._id).catch((error) => setStatus(error.message, "error")));
    actionsCell.append(editButton, deleteButton);
    tr.append(nameCell, costCell, deadlineCell, actionsCell);
    tbody.appendChild(tr);
  });

  setTotal(total);
}

// --- Form submit ---
document.getElementById("taskForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("taskName").value.trim();
  const cost = Number(document.getElementById("taskCost").value);
  const deadline = document.getElementById("taskDeadline").value;
  if (!name || !Number.isFinite(cost) || cost < 0 || !deadline) {
    setStatus("Fill in all task fields with valid values.", "error");
    return;
  }
  try {
    await addTask(name, cost, deadline);
    e.target.reset();
    setStatus("Task added.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

document.getElementById("registerButton").addEventListener("click", register);
document.getElementById("loginButton").addEventListener("click", login);
if (token) fetchTasks();
