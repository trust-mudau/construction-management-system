const express = require("express");
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

// All routes below require auth
router.use(auth);

// Get tasks for current user
router.get("/", async (req, res) => {
  const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(tasks);
});

// Create task
router.post("/", async (req, res) => {
  const { name, cost, deadline } = req.body;
  if (!name?.trim() || !deadline) {
    return res.status(400).json({ error: "Name and deadline are required" });
  }
  const task = await Task.create({
    user: req.userId,
    name: name.trim(),
    cost: Number(cost) || 0,
    deadline: new Date(deadline)
  });
  res.json(task);
});

// Update task
router.put("/:id", async (req, res) => {
  const { name, cost, deadline } = req.body;
  const updated = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { ...(name && { name }), ...(cost !== undefined && { cost }), ...(deadline && { deadline }) },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: "Task not found" });
  res.json(updated);
});

// Delete task
router.delete("/:id", async (req, res) => {
  const deleted = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!deleted) return res.status(404).json({ error: "Task not found" });
  res.json({ message: "Task deleted" });
});

module.exports = router;
