const bcrypt = require("bcrypt");
const School = require("../models/School");
const User = require("../models/User");
const { linkStudentsToSchool } = require("../utils/schoolStudentLink");

class SchoolService {
  static async createSchool(req) {
    try {
      const { name, email, password, address, city, phone, status } = req.body;
        
      if (!name || !email || !password) {
        return { status: 400, message: "Name, email, and password are required" };
      }

      const existingSchool = await School.findOne({ email: email.toLowerCase().trim(), isDeleted: false });
      if (existingSchool) {
        return { status: 400, message: "A school with this email already exists" };
      }

        const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newSchool = await School.create({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        address: address || "",
        city: city || "",
        phone: phone || "",
        status: status === false || status === "false" ? false : true,
      });

      // Link any existing students who already have this school name
      const { linked } = await linkStudentsToSchool(newSchool);

      return {
        status: 201,
        data: newSchool,
        message: linked
          ? `School created successfully. ${linked} existing student(s) linked.`
          : "School created successfully.",
      };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  /** Public/auth list of active schools for student registration dropdown */
  static async getActiveSchoolsForDropdown() {
    try {
      const schools = await School.find({
        isDeleted: false,
        status: true,
      })
        .select("_id name")
        .sort({ name: 1 })
        .lean();

      return { status: 200, data: schools };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  static async getAllSchools(req) {
    try {
      const { page = 1, limit = 10, name, email, status } = req.query;
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const skip = (pageNum - 1) * limitNum;

      const filter = { isDeleted: false };
      if (name) {
        filter.name = { $regex: name.trim(), $options: "i" };
      }
      if (email) {
        filter.email = { $regex: email.trim(), $options: "i" };
      }
      if (status !== undefined && status !== null && status !== "") {
        filter.status = ["true", "1", "active", "yes"].includes(String(status).toLowerCase());
      }

      const [schools, total] = await Promise.all([
        School.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        School.countDocuments(filter),
      ]);

      return {
        status: 200,
        data: schools,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          last_page: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  static async getSchoolById(req) {
    try {
      const { id } = req.params;
      const school = await School.findOne({ _id: id, isDeleted: false });
      if (!school) {
        return { status: 404, message: "School not found" };
      }
      return { status: 200, data: school };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  static async updateSchool(req) {
    try {
      const { id } = req.params;
      const { name, email, password, address, city, phone, status } = req.body;
      const updateData = {};

      if (name !== undefined) updateData.name = name.trim();
      if (email !== undefined) updateData.email = email.toLowerCase().trim();
      if (password !== undefined && password !== "") {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }
      if (address !== undefined) updateData.address = address;
      if (city !== undefined) updateData.city = city;
      if (phone !== undefined) updateData.phone = phone;
      if (status !== undefined) updateData.status = ["true", "1", "active", "yes"].includes(String(status).toLowerCase());

      const existingSchool = await School.findOne({ email: updateData.email, _id: { $ne: id }, isDeleted: false });
      if (existingSchool) {
        return { status: 400, message: "Email is already in use by another school" };
      }

      const school = await School.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: updateData },
        { new: true }
      );
      if (!school) {
        return { status: 404, message: "School not found" };
      }

      // Keep linked students' currentSchool name in sync
      if (updateData.name) {
        await User.updateMany(
          { type: "student", schoolId: school._id, isDeleted: false },
          { $set: { currentSchool: school.name } }
        );
        await linkStudentsToSchool(school);
      }

      return { status: 200, data: school };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  static async updateSchoolStatus(req) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const school = await School.findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { status: !!status } },
        { new: true }
      );
      if (!school) {
        return { status: 404, message: "School not found" };
      }
      return { status: 200, data: school };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  static async deleteSchool(req) {
    try {
      const { id } = req.params;
      const school = await School.findOne({ _id: id, isDeleted: false });
      if (!school) {
        return { status: 404, message: "School not found" };
      }
      school.isDeleted = true;
      await school.save();
      return { status: 200, message: "School deleted successfully" };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
}

module.exports = SchoolService;
