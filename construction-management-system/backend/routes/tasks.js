const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");
const { validTaskInput } = require("../utils/taskValidation");

const router = express.Router();
const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

// All routes below require auth
router.use(auth);

// Get tasks for current user
router.get("/", asyncRoute(async (req, res) => {
  const tasks = await Task.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(tasks);
}));

// Create task
router.post("/", asyncRoute(async (req, res) => {
  const { name, cost, deadline } = req.body;
  if (!validTaskInput({ name, cost, deadline })) {
    return res.status(400).json({ error: "Provide a task name, non-negative cost, and valid deadline" });
  }
  const task = await Task.create({
    user: req.userId,
    name: name.trim(),
    cost: Number(cost) || 0,
    deadline: new Date(deadline)
  });
  res.status(201).json(task);
}));

// Update task
router.put("/:id", asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid task id" });
  const { name, cost, deadline } = req.body;
  if (!validTaskInput({ name, cost, deadline }, true)) {
    return res.status(400).json({ error: "Provide a valid name, non-negative cost, and deadline" });
  }
  const updated = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { ...(name && { name: name.trim() }), ...(cost !== undefined && { cost: Number(cost) }), ...(deadline && { deadline: new Date(deadline) }) },
    { new: true }
  );
  if (!updated) return res.status(404).json({ error: "Task not found" });
  res.json(updated);
}));

// Delete task
router.delete("/:id", asyncRoute(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid task id" });
  const deleted = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!deleted) return res.status(404).json({ error: "Task not found" });
  res.json({ message: "Task deleted" });
}));

module.exports = router;
