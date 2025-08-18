// During development:
const API_URL = "http://localhost:5000/api";

let token = "";

// --- Helpers ---
function authHeader() {
  return { Authorization: `Bearer ${token}` };
}
function setTotal(cost) {
  document.getElementById("totalCost").textContent = `R${cost.toFixed(2)}`;
}

// --- Auth ---
async function register() {
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value;
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  alert(data.message || data.error || "Unknown response");
}

async function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.token) {
    token = data.token;
    await fetchTasks();
    alert("✅ Logged in");
  } else {
    alert(data.error || "Login failed");
  }
}

// --- Tasks ---
async function fetchTasks() {
  const res = await fetch(`${API_URL}/tasks`, { headers: authHeader() });
  const tasks = await res.json();
  renderTasks(tasks);
}

async function addTask(name, cost, deadline) {
  await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ name, cost, deadline })
  });
  fetchTasks();
}

async function deleteTask(id) {
  await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE", headers: authHeader() });
  fetchTasks();
}

async function editTask(id) {
  const name = prompt("New task name:");
  if (name === null) return;
  const costStr = prompt("New cost:");
  if (costStr === null) return;
  const deadline = prompt("New deadline (YYYY-MM-DD):");
  if (deadline === null) return;

  const cost = Number(costStr);
  await fetch(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify({ name, cost, deadline })
  });
  fetchTasks();
}

// --- Render ---
function renderTasks(tasks) {
  const tbody = document.querySelector("#taskTable tbody");
  tbody.innerHTML = "";
  const total = tasks.reduce((sum, t) => sum + (Number(t.cost) || 0), 0);

  tasks.forEach((t) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${t.name}</td>
      <td>${Number(t.cost).toFixed(2)}</td>
      <td>${new Date(t.deadline).toLocaleDateString()}</td>
      <td>
        <button onclick="editTask('${t._id}')">Edit</button>
        <button onclick="deleteTask('${t._id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  setTotal(total);
}

// --- Form submit ---
document.getElementById("taskForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("taskName").value.trim();
  const cost = Number(document.getElementById("taskCost").value);
  const deadline = document.getElementById("taskDeadline").value;
  if (!name || isNaN(cost) || !deadline) return alert("Fill all fields");
  addTask(name, cost, deadline);
  e.target.reset();
});
