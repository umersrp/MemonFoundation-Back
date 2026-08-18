const StudentAcademicDocument = require("../models/StudentAcademicDocument");
const User = require("../models/User");
const School = require("../models/School");
const { CATEGORIES } = require("../models/StudentAcademicDocument");

const PAYMENT_ACK = "Payment Acknowledgement";

async function assertStudentAccess(req, studentId) {
  const student = await User.findOne({
    _id: studentId,
    type: "student",
    isDeleted: false,
  }).lean();

  if (!student) {
    return { error: { status: 404, message: "Student not found" } };
  }

  if (req.user.type === "school") {
    if (!student.schoolId || String(student.schoolId) !== String(req.user._id)) {
      return { error: { status: 403, message: "You can only access your school's students" } };
    }
  }

  return { student };
}

async function getUploaderMeta(req) {
  if (req.user.type === "school") {
    const school = await School.findById(req.user._id).lean();
    return {
      uploadedBy: req.user._id,
      uploadedByName: school?.name || "School",
      uploadedByType: "school",
      schoolId: req.user._id,
    };
  }

  const admin = await User.findById(req.user._id).lean();
  return {
    uploadedBy: req.user._id,
    uploadedByName: admin?.name || admin?.username || "Admin",
    uploadedByType: "superadmin",
    schoolId: null,
  };
}

class StudentAcademicDocumentService {
  static async listByStudent(req) {
    try {
      const { studentId } = req.params;
      const access = await assertStudentAccess(req, studentId);
      if (access.error) return access.error;

      const docs = await StudentAcademicDocument.find({
        studentId,
        isDeleted: false,
      })
        .sort({ createdAt: -1 })
        .lean();

      return { status: 200, data: docs, categories: CATEGORIES };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  static async create(req) {
    try {
      if (req.user.type === "superadmin") {
        return {
          status: 403,
          message: "Superadmin can only view documents. Schools upload student documents.",
        };
      }

      const {
        studentId,
        category,
        fileName,
        fileUrl,
        academicYear,
        termOrQuarter,
        status,
        paymentDate,
        paymentReference,
        amountPaid,
        remarks,
      } = req.body;

      if (!studentId || !category || !fileName || !fileUrl) {
        return {
          status: 400,
          message: "studentId, category, fileName, and fileUrl are required",
        };
      }

      if (!CATEGORIES.includes(category)) {
        return { status: 400, message: "Invalid document category" };
      }

      const access = await assertStudentAccess(req, studentId);
      if (access.error) return access.error;

      // School users cannot upload Payment Acknowledgement
      if (req.user.type === "school" && category === PAYMENT_ACK) {
        return {
          status: 403,
          message: "School users cannot upload or modify Payment Acknowledgement",
        };
      }

      if (category === "Quarterly Fee Voucher") {
        if (!academicYear || !termOrQuarter) {
          return {
            status: 400,
            message: "Academic Year and Quarter are required for Fee Voucher",
          };
        }
      }

      const uploader = await getUploaderMeta(req);
      const schoolId =
        access.student.schoolId ||
        (req.user.type === "school" ? req.user._id : uploader.schoolId);

      const doc = await StudentAcademicDocument.create({
        studentId,
        schoolId,
        category,
        fileName,
        fileUrl,
        academicYear: academicYear || "",
        termOrQuarter: termOrQuarter || "",
        status: status || (category === "Quarterly Fee Voucher" ? "Submitted" : "Submitted"),
        paymentDate: paymentDate || null,
        paymentReference: paymentReference || "",
        amountPaid: amountPaid != null && amountPaid !== "" ? Number(amountPaid) : null,
        remarks: remarks || "",
        uploadedBy: uploader.uploadedBy,
        uploadedByName: uploader.uploadedByName,
        uploadedByType: uploader.uploadedByType,
      });

      return { status: 201, data: doc, message: "Document uploaded successfully" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  static async update(req) {
    try {
      if (req.user.type === "superadmin") {
        return {
          status: 403,
          message: "Superadmin can only view documents. Schools manage student document uploads.",
        };
      }

      const { id } = req.params;
      const doc = await StudentAcademicDocument.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!doc) {
        return { status: 404, message: "Document not found" };
      }

      const access = await assertStudentAccess(req, doc.studentId);
      if (access.error) return access.error;

      // School cannot edit/replace Payment Acknowledgement
      if (req.user.type === "school" && doc.category === PAYMENT_ACK) {
        return {
          status: 403,
          message: "Payment Acknowledgement is read-only for school users",
        };
      }

      const {
        fileName,
        fileUrl,
        academicYear,
        termOrQuarter,
        status,
        paymentDate,
        paymentReference,
        amountPaid,
        remarks,
      } = req.body;

      if (fileName !== undefined) doc.fileName = fileName;
      if (fileUrl !== undefined) doc.fileUrl = fileUrl;
      if (academicYear !== undefined) doc.academicYear = academicYear;
      if (termOrQuarter !== undefined) doc.termOrQuarter = termOrQuarter;
      if (status !== undefined) doc.status = status;
      if (paymentDate !== undefined) doc.paymentDate = paymentDate;
      if (paymentReference !== undefined) doc.paymentReference = paymentReference;
      if (amountPaid !== undefined) {
        doc.amountPaid = amountPaid !== "" && amountPaid != null ? Number(amountPaid) : null;
      }
      if (remarks !== undefined) doc.remarks = remarks;

      const uploader = await getUploaderMeta(req);
      doc.uploadedBy = uploader.uploadedBy;
      doc.uploadedByName = uploader.uploadedByName;
      doc.uploadedByType = uploader.uploadedByType;

      await doc.save();
      return { status: 200, data: doc, message: "Document updated successfully" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  static async remove(req) {
    try {
      if (req.user.type === "superadmin") {
        return {
          status: 403,
          message: "Superadmin can only view documents. Schools manage student document uploads.",
        };
      }

      const { id } = req.params;
      const doc = await StudentAcademicDocument.findOne({
        _id: id,
        isDeleted: false,
      });

      if (!doc) {
        return { status: 404, message: "Document not found" };
      }

      const access = await assertStudentAccess(req, doc.studentId);
      if (access.error) return access.error;

      if (req.user.type === "school" && doc.category === PAYMENT_ACK) {
        return {
          status: 403,
          message: "School users cannot delete Payment Acknowledgement",
        };
      }

      doc.isDeleted = true;
      await doc.save();
      return { status: 200, message: "Document deleted successfully" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}

module.exports = StudentAcademicDocumentService;
