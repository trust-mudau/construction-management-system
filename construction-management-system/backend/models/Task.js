const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    cost: { type: Number, default: 0, min: 0 },
    deadline: { type: Date, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
