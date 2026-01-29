const User = require("../models/User");

class DashboardService {
  static async getDashboardStats(req) {
    try {
      // Total students
      const totalStudents = await User.countDocuments({ type: "student" });

      // Active students
      const activeStudents = await User.countDocuments({
        type: "student",
        isActive: true,
      });

      // Scholarship breakdown
      const scholarshipCounts = await User.aggregate([
        { $match: { type: "student" } },
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

      // 🔥 Top 10 Jamaat by student count
      // 🔥 Top 10 Jamaat by student count (from father.jamaatName)
      const topJamaats = await User.aggregate([
        {
          $match: {
            type: "student",
            "father.jamaatName": { $exists: true, $ne: "" }
          }
        },
        {
          $group: {
            _id: "$father.jamaatName",
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
