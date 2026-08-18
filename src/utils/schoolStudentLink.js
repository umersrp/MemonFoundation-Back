const School = require("../models/School");
const User = require("../models/User");
const mongoose = require("mongoose");

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Resolve schoolId from explicit id or by matching currentSchool name.
 */
async function resolveSchoolId({ schoolId, currentSchool }) {
  if (schoolId && mongoose.Types.ObjectId.isValid(schoolId)) {
    const school = await School.findOne({
      _id: schoolId,
      isDeleted: false,
      status: true,
    }).lean();
    if (school) {
      return { schoolId: school._id, currentSchool: currentSchool || school.name };
    }
  }

  if (currentSchool && String(currentSchool).trim()) {
    const name = String(currentSchool).trim();
    if (name.toLowerCase() === "other (please specify)") {
      return { schoolId: null, currentSchool: name };
    }
    const school = await School.findOne({
      name: { $regex: `^${escapeRegex(name)}$`, $options: "i" },
      isDeleted: false,
      status: true,
    }).lean();
    if (school) {
      return { schoolId: school._id, currentSchool: school.name };
    }
  }

  return {
    schoolId: null,
    currentSchool: currentSchool || "",
  };
}

/**
 * Link existing students whose currentSchool matches this school name.
 */
async function linkStudentsToSchool(school) {
  if (!school?._id || !school?.name) return { linked: 0 };

  const result = await User.updateMany(
    {
      type: "student",
      isDeleted: false,
      currentSchool: {
        $regex: `^${escapeRegex(school.name)}$`,
        $options: "i",
      },
      $or: [{ schoolId: null }, { schoolId: { $exists: false } }],
    },
    { $set: { schoolId: school._id, currentSchool: school.name } }
  );

  return { linked: result.modifiedCount || 0 };
}

/**
 * Ensure students matching this school are linked, then return schoolId filter value.
 */
async function ensureSchoolStudentsLinked(schoolUserId) {
  const school = await School.findOne({
    _id: schoolUserId,
    isDeleted: false,
  }).lean();

  if (school) {
    await linkStudentsToSchool(school);
  }

  return schoolUserId;
}

module.exports = {
  escapeRegex,
  resolveSchoolId,
  linkStudentsToSchool,
  ensureSchoolStudentsLinked,
};
