const mongoose = require("mongoose");

const CATEGORIES = [
  "Midterm Examination Results",
  "Final Term Examination Results",
  "Midterm Attendance Record",
  "Final Term Attendance Record",
  "Quarterly Fee Voucher",
  "Payment Acknowledgement",
];

const STATUSES = [
  "Submitted",
  "Pending Payment",
  "Under Review",
  "Approved",
  "Rejected",
];

const StudentAcademicDocumentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      default: null,
      index: true,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
    },
    fileName: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true },
    academicYear: { type: String, default: "", trim: true },
    termOrQuarter: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: STATUSES,
      default: "Submitted",
    },
    paymentDate: { type: Date, default: null },
    paymentReference: { type: String, default: "" },
    amountPaid: { type: Number, default: null },
    remarks: { type: String, default: "" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, default: null },
    uploadedByName: { type: String, default: "" },
    uploadedByType: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "StudentAcademicDocument",
  StudentAcademicDocumentSchema
);
module.exports.CATEGORIES = CATEGORIES;
module.exports.STATUSES = STATUSES;
