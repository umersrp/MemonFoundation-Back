const User = require("../models/User");



class DashboardService {

static async getDashboardStats(req) {
  try {
    // Total students
    const totalStudents = await User.countDocuments({ type: "student" });

    // Total active students
    const activeStudents = await User.countDocuments({
      type: "student",
      isActive: true,
    });

    // Scholarship breakdown
    const scholarshipCounts = await User.aggregate([
      {
        $match: { type: "student" }
      },
      {
        $group: {
          _id: "$scholarshipCategory",
          count: { $sum: 1 }
        }
      }
    ]);

    // Format output
    const breakdown = {
      STAR: 0,
      HOPE: 0,
      SEED: 0
    };

    scholarshipCounts.forEach(item => {
      if (item._id && breakdown[item._id] !== undefined) {
        breakdown[item._id] = item.count;
      }
    });

    return {
      status: 200,
      data: {
        totalStudents,
        activeStudents,
        scholarshipBreakdown: breakdown
      }
    };

  } catch (error) {
    return { status: 500, message: error.message };
  }
}
}

module.exports = DashboardService;