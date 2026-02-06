const mongoose = require("mongoose");

const studentEmailToAdminSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
    studentName: { type: String, required: true, trim: true },
    studentEmail: { type: String, required: true, trim: true },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
    sentAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Export the model correctly
module.exports = mongoose.model("StudentEmailToAdmin", studentEmailToAdminSchema);
