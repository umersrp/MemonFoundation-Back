const mongoose = require("mongoose");

const SchoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true },
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    phone: { type: String, default: "" },
    status: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("School", SchoolSchema);
