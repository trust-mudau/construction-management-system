const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, maxlength: 50 },
    password: { type: String, required: true, minlength: 8 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
