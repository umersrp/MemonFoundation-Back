const User = require("../models/User");
const { ensureSchoolStudentsLinked } = require("../utils/schoolStudentLink");

class DashboardService {
  static async getDashboardStats(req) {
    try {
      // Build query based on user type
      const query = { type: "student", isDeleted: false };
      
      // If school user, filter by school
      if (req.user.type === "school") {
        await ensureSchoolStudentsLinked(req.user._id);
        query.schoolId = req.user._id;
      }

      // Total students
      const totalStudents = await User.countDocuments(query);

      // Active students
      const activeStudents = await User.countDocuments({
        ...query,
        isActive: true,
      });

      // Scholarship breakdown
      const scholarshipCounts = await User.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$scholarshipCategory",
            count: { $sum: 1 },
          },
        },
      ]);

      const breakdown = {
        STAR: 0,
        HOPE: 0,
        SEED: 0,
      };

      scholarshipCounts.forEach((item) => {
        if (item._id && breakdown[item._id] !== undefined) {
          breakdown[item._id] = item.count;
        }
      });

      const topJamaats = await User.aggregate([
        {
          $match: {
            ...query,
            "father.jamaatName": { $exists: true, $ne: "" }
          }
        },
        {
          $group: {
            _id: {
              $trim: {
                input: { $toLower: "$father.jamaatName" }
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            jamaatName: "$_id",
            count: 1
          }
        }
      ]);

      return {
        status: 200,
        data: {
          totalStudents,
          activeStudents,
          scholarshipBreakdown: breakdown,
          topJamaats, // ✅ added
        },
      };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}

module.exports = DashboardService;
