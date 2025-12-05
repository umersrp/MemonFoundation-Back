const User = require("../models/User");
const Tenant = require("../models/Tenant");
const EmailService = require("./mailerService");
const bcrypt = require("bcrypt");
const { Types, default: mongoose } = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");



class UserService {
  // static async createTutor(req) {
  //   try {
  //     const { userId } = req.user;
  //     const { name, email, tenantId, username, password } = req.body;

  //     if (!password) {
  //       return { status: 400, message: "Password is required" };
  //     }
  //     const existingUser = await User.findOne({ email });
  //     if (existingUser) {
  //       return { status: 400, message: "Email already registered" };
  //     }
  //     const tenant = await Tenant.findById(tenantId);
  //     if (!tenant || !tenant.isActive) {
  //       return { status: 400, message: "Invalid or inactive tenant" };
  //     }
  //     const existingTenantUser = await User.findOne({ tenantId });
  //     if (existingTenantUser) {
  //       return {
  //         status: 400,
  //         message: "This tenant is already assigned to another user",
  //       };
  //     }

  //     // Hash password
  //     const salt = await bcrypt.genSalt(10);
  //     const hashedPassword = await bcrypt.hash(password, salt);

  //     // Create tutor
  //     const user = await User.create({
  //       name,
  //       createdBy: userId,
  //       email,
  //       type: "tutor",
  //       tenantId,
  //       username,
  //       password: hashedPassword,
  //     });

  //     return {
  //       status: 201,
  //       data: user,
  //       message: "Tutor created successfully.",
  //     };
  //   } catch (error) {
  //     return { status: 500, message: error.message };
  //   }
  // }

  static async createStudent(req) {
    try {
      const {
        name,
        firstName,
        middleName,
        lastName,
        applicationStatus,
        scholarshipCategory,
        email,
        gender,
        dob,
        nationality,
        username,
        phone,
        residentialAddress,
        appliedOther,
        appliedDetails,
        currentSchool,
        schoolAddress,
        positionAchieved,
        gradeClass,
        monthlyFee,
        plannedCollege,
        examinationBoard,
        declarationParentName,
        declarationDate,

        academicRecords,
        extracurricularActivities,

        father,
        mother,
        selectionNote,
        numberOfHouseholdMembers,
        familyMembers,
        documents,
        financialInformation,

        officeUseInfo,
      } = req.body;

      if (!email) {
        return { status: 400, message: "Email is required." };
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return { status: 400, message: "Email already registered." };
      }

      // Generate dummy password
      const tempPassword = crypto.randomBytes(10).toString("hex");
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(tempPassword, salt);

      const user = await User.create({
        name,
        firstName,
        middleName,
        lastName,
        email,
        username,
        gender,
        dob,
        nationality,
        applicationStatus,
        scholarshipCategory,
        phone,
        residentialAddress,
        appliedOther,
        appliedDetails,
        currentSchool,
        schoolAddress,
        positionAchieved,
        gradeClass,
        monthlyFee,
        plannedCollege,
        examinationBoard,
        declarationParentName,
        declarationDate,
        type: "student",
        password: hashedPassword,
        isActive: false,
        isEmailValid: false,
        documents,
        createdBy: req.user?._id,

        // Add academic & extracurricular
        academicRecords,
        extracurricularActivities,

        // Family & financial info
        father,
        mother,
        selectionNote,
        numberOfHouseholdMembers,
        familyMembers,
        financialInformation,
        // Office use (admin-only fields)
        officeUseInfo,
      });

      return {
        status: 201,
        data: user,
        message: "Student created successfully. Awaiting password setup.",
      };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }


  static async sendPasswordSetupLink(req) {
    try {
      const { email } = req.body;

      if (!email) {
        return { status: 400, message: "Email is required." };
      }

      const user = await User.findOne({ email });

      if (!user) {
        return { status: 404, message: "Student not found." };
      }

      if (user.type !== "student") {
        return { status: 400, message: "Only students can receive setup links." };
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      const setupLink = `http://localhost:5173/setup-password?token=${token}`;
      const emailResult = await EmailService.sendPasswordSetupEmail(user.email, user.name, setupLink);

      return {
        status: emailResult.status,
        message: emailResult.message,
      };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  static async setPassword(req) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return { status: 400, message: "Token and new password are required." };
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (!user) {
        return { status: 404, message: "User not found." };
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user.password = hashedPassword;
      user.isActive = true;
      await user.save();

      return { status: 200, message: "Password set successfully." };
    } catch (err) {
      logger.error("Set password failed:", err);
      return { status: 500, message: "Invalid or expired token." };
    }
  }
  static async studentsUpdate(req) {
    try {
      const { id } = req.params;
      const {
        name,
        firstName,
        middleName,
        lastName,
        email,
        gender,
        dob,
        nationality,
        username,
        password,
        image,
        isActive,
        selectionNote,
        numberOfHouseholdMembers,
        financialInformation,
        residentialAddress,
        appliedOther,
        appliedDetails,
        currentSchool,
        schoolAddress,
        positionAchieved,
        gradeClass,
        monthlyFee,
        plannedCollege,
        examinationBoard,
        declarationParentName,
        declarationDate,
        academicRecords,
        extracurricularActivities,
        father,
        mother,
        familyMembers,
        documents,
        officeUseInfo,
      } = req.body;

      // 🧩 Find student
      const student = await User.findOne({ _id: id, type: "student" });
      if (!student) {
        return { status: 404, message: "Student not found" };
      }

      // 🧩 Validate email uniqueness
      if (email && email !== student.email) {
        const existingUser = await User.findOne({
          email,
          _id: { $ne: id },
        }).lean();

        if (existingUser) {
          return { status: 400, message: "Email already registered" };
        }

        student.email = email;
      }

      // 🧩 Validate username uniqueness
      if (username && username !== student.username) {
        const existingUserName = await User.findOne({
          username,
          _id: { $ne: id },
        }).lean();

        if (existingUserName) {
          return { status: 400, message: "This Username is Already Taken" };
        }

        student.username = username;
      }

      // 🧩 Update other fields
      if (name) student.name = name;
      if (firstName !== undefined) student.firstName = firstName;
      if (middleName !== undefined) student.middleName = middleName;
      if (lastName !== undefined) student.lastName = lastName;
      if (gender) student.gender = gender;
      if (dob) student.dob = dob;
      if (nationality) student.nationality = nationality;
      if (image) student.image = image; // ✅ Image now updates
      if (typeof isActive !== "undefined") student.isActive = isActive;
      if (selectionNote) student.selectionNote = selectionNote;
      if (numberOfHouseholdMembers)
        student.numberOfHouseholdMembers = numberOfHouseholdMembers;
      if (residentialAddress !== undefined) student.residentialAddress = residentialAddress;
      if (appliedOther !== undefined) student.appliedOther = appliedOther;
      if (appliedDetails !== undefined) student.appliedDetails = appliedDetails;
      if (currentSchool !== undefined) student.currentSchool = currentSchool;
      if (schoolAddress !== undefined) student.schoolAddress = schoolAddress;
      if (positionAchieved !== undefined) student.positionAchieved = positionAchieved;
      if (gradeClass !== undefined) student.gradeClass = gradeClass;
      if (monthlyFee !== undefined) student.monthlyFee = monthlyFee;
      if (plannedCollege !== undefined) student.plannedCollege = plannedCollege;
      if (examinationBoard !== undefined) student.examinationBoard = examinationBoard;
      if (declarationParentName !== undefined) student.declarationParentName = declarationParentName;
      if (declarationDate !== undefined) student.declarationDate = declarationDate;

      // 🧩 Handle academic records
      if (academicRecords) {
        student.academicRecords = academicRecords;
      }

      // 🧩 Handle extracurricular activities
      if (extracurricularActivities) {
        student.extracurricularActivities = extracurricularActivities;
      }

      // 🧩 Handle father info
      if (father) {
        student.father = {
          ...student.father,
          ...father,
        };
      }

      // 🧩 Handle mother info
      if (mother) {
        student.mother = {
          ...student.mother,
          ...mother,
        };
      }

      // 🧩 Handle family members
      if (familyMembers) {
        student.familyMembers = familyMembers;
      }

      // 🧩 Handle documents
      if (documents) {
        student.documents = {
          ...student.documents,
          ...documents,
        };
      }

      // 🧩 Handle financial info safely
      if (financialInformation) {
        student.financialInformation = {
          ...student.financialInformation,
          ...financialInformation,
        };
      }

      // 🧩 Handle office use info safely
      if (officeUseInfo) {
        if (!student.officeUseInfo) {
          student.officeUseInfo = {};
        }

        // Handle nested memfOffice
        if (officeUseInfo.memfOffice) {
          if (!student.officeUseInfo.memfOffice) {
            student.officeUseInfo.memfOffice = {};
          }

          // Merge memfOffice fields
          if (officeUseInfo.memfOffice.studentCode !== undefined) {
            student.officeUseInfo.memfOffice.studentCode = officeUseInfo.memfOffice.studentCode;
          }
          if (officeUseInfo.memfOffice.assessmentDate !== undefined) {
            student.officeUseInfo.memfOffice.assessmentDate = officeUseInfo.memfOffice.assessmentDate;
          }
          if (officeUseInfo.memfOffice.interviewDate !== undefined) {
            student.officeUseInfo.memfOffice.interviewDate = officeUseInfo.memfOffice.interviewDate;
          }
          if (officeUseInfo.memfOffice.memfEvaluationScore !== undefined) {
            student.officeUseInfo.memfOffice.memfEvaluationScore = officeUseInfo.memfOffice.memfEvaluationScore;
          }
          if (officeUseInfo.memfOffice.decision !== undefined) {
            student.officeUseInfo.memfOffice.decision = officeUseInfo.memfOffice.decision;
          }
          if (officeUseInfo.memfOffice.category !== undefined) {
            student.officeUseInfo.memfOffice.category = officeUseInfo.memfOffice.category;
          }
          if (officeUseInfo.memfOffice.panelComments !== undefined) {
            student.officeUseInfo.memfOffice.panelComments = officeUseInfo.memfOffice.panelComments;
          }
          if (officeUseInfo.memfOffice.gradingRubrics !== undefined) {
            student.officeUseInfo.memfOffice.gradingRubrics = officeUseInfo.memfOffice.gradingRubrics;
          }

          // Handle scholarship
          if (officeUseInfo.memfOffice.scholarship) {
            if (!student.officeUseInfo.memfOffice.scholarship) {
              student.officeUseInfo.memfOffice.scholarship = {};
            }
            if (officeUseInfo.memfOffice.scholarship.grantedFor !== undefined) {
              student.officeUseInfo.memfOffice.scholarship.grantedFor = officeUseInfo.memfOffice.scholarship.grantedFor;
            }
            if (officeUseInfo.memfOffice.scholarship.totalAmount !== undefined) {
              student.officeUseInfo.memfOffice.scholarship.totalAmount = officeUseInfo.memfOffice.scholarship.totalAmount;
            }
            if (officeUseInfo.memfOffice.scholarship.installments !== undefined) {
              student.officeUseInfo.memfOffice.scholarship.installments = officeUseInfo.memfOffice.scholarship.installments;
            }
          }

          // Handle reviewPanelSignature
          if (officeUseInfo.memfOffice.reviewPanelSignature) {
            if (!student.officeUseInfo.memfOffice.reviewPanelSignature) {
              student.officeUseInfo.memfOffice.reviewPanelSignature = {};
            }
            student.officeUseInfo.memfOffice.reviewPanelSignature = {
              ...student.officeUseInfo.memfOffice.reviewPanelSignature,
              ...officeUseInfo.memfOffice.reviewPanelSignature,
            };
          }
        }

        // Handle other officeUseInfo fields
        if (officeUseInfo.jamaatName !== undefined) {
          student.officeUseInfo.jamaatName = officeUseInfo.jamaatName;
        }
        if (officeUseInfo.membershipNumber !== undefined) {
          student.officeUseInfo.membershipNumber = officeUseInfo.membershipNumber;
        }
        if (officeUseInfo.belongsToJamaat !== undefined) {
          student.officeUseInfo.belongsToJamaat = officeUseInfo.belongsToJamaat;
        }
        if (officeUseInfo.supportProvided !== undefined) {
          student.officeUseInfo.supportProvided = officeUseInfo.supportProvided;
        }
        if (officeUseInfo.zakatDeserving !== undefined) {
          student.officeUseInfo.zakatDeserving = officeUseInfo.zakatDeserving;
        }
        if (officeUseInfo.channelOfSubmission !== undefined) {
          student.officeUseInfo.channelOfSubmission = officeUseInfo.channelOfSubmission;
        }

        // Handle authorizedSignature if exists
        if (officeUseInfo.authorizedSignature) {
          if (!student.officeUseInfo.authorizedSignature) {
            student.officeUseInfo.authorizedSignature = {};
          }
          student.officeUseInfo.authorizedSignature = {
            ...student.officeUseInfo.authorizedSignature,
            ...officeUseInfo.authorizedSignature,
          };
        }
      }

      // 🧩 Handle password hashing
      if (password) {
        const salt = await bcrypt.genSalt(10);
        student.password = await bcrypt.hash(password, salt);
      }

      // 🧩 Save changes
      await student.save();

      return {
        status: 200,
        data: student,
        message: "Student updated successfully.",
      };
    } catch (error) {
      console.error("❌ Update Error:", error);
      return { status: 500, message: error.message };
    }
  }

  static async updateProfile(req) {
    try {
      const { name, username, image } = req.body;
      const { userId } = req.user;
      if (username) {
        const existingUserName = await User.findOne({ username }).lean();
        if (existingUserName)
          return { status: 400, message: "This Username is Already Taken" };
      }
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            username,
            name,
            image,
          },
        },
        {
          new: true,
        }
      );
      if (!updatedUser)
        return { status: 400, message: "Unable to update user profile" };
      return { status: 200, data: updatedUser };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  static async removeUser(req) {
    try {
      const { userId } = req.user;
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $set: {
            isActive: false,
          },
        },
        {
          new: true,
        }
      );
      return { status: 200, data: updatedUser };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  static async getUserData(req) {
    try {
      const { userId } = req.user;
      const userData = await User.findById(userId).lean().populate('createdBy', 'name');
      if (!userData)
        return { status: 400, message: "Unable to fetch User's Data" };
      return { status: 200, data: userData };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  static async getAllUsers(req) {
    try {
      const { userId, type } = req.user;

      let users;
      if (type === "admin") {
        users = await User.find({ type: "tutor" })
          .populate('createdBy', 'name')
          .populate('tenantId', 'name')
          .populate('updatedBy', 'name')
          .lean(); // Move lean() to the end
      } else {
        users = await User.findById(userId)
          .populate('createdBy', 'name')
          .populate('tenantId', 'name')
          .populate('updatedBy', 'name')
          .lean();
        if (!users) {
          return { status: 400, message: "User not found" };
        }
      }
      return { status: 200, data: users };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  static async getAllStudents(req) {
    try {
      const { tenantId } = req.user;
      const { page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;
      const filter = {
        tenantId,
        type: "student",
      };
      const total = await User.countDocuments(filter);
      const students = await User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      return {
        status: 200,
        data: {
          students,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
          },
        },
      };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }
  static async getStudentsByTenant(req) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;
      const filter = {
        type: "student",
        isDeleted: false,
      };
      const total = await User.countDocuments(filter);
      const students = await User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      return {
        status: 200,
        data: {
          students,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
          },
        },
      };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }


  static async getUserById(req) {
    try {
      const { id } = req.params;
      const user = await User.findById(id).select
        ("-password")
        .lean();
      if (!user) {
        return { status: 404, message: "User not found" };
      }
      return { status: 200, data: user };
    }
    catch (error) {
      return { status: 500, message: error.message };
    }
  }

  static async updateByAdmin(req) {
    try {
      const { id } = req.params;
      const { name, email, username, type, isActive } = req.body;
      const user = await User.findById(id);
      if (!user) {
        return { status: 404, message: "User not found" };
      }
      if (email && email !== user.email) {
        const existingUser = await
          User.findOne({
            email,
            _id: { $ne: id },
          })
            .lean();
        if (existingUser) {
          return { status: 400, message: "Email already registered" };
        }
        user.email = email;
      }
      if (username) {
        const existingUserName = await User.findOne({
          username,
          _id: { $ne: id },
        }).lean();
        if (existingUserName) {
          return { status: 400, message: "This Username is Already Taken" };
        }
        user.username = username;
      }
      if (name) user.name = name;
      if (type) user.type = type;
      if (typeof isActive === "boolean") user.isActive = isActive;
      await user.save();
      return { status: 200, data: user, message: "User updated successfully." };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }

  static async removeByAdmin(req) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);

      if (!user) {
        return { status: 404, message: "User not found" };
      }

      // Mark the user as deleted (soft delete)
      user.isDeleted = true;
      await user.save();

      return { status: 200, message: "User removed (soft deleted) successfully." };
    } catch (error) {
      return { status: 500, message: error.message };
    }
  }


  static async updateStudentStatus(req) {
    try {
      const { type: userType } = req.user;
      const { studentId } = req.params;
      const { isActive } = req.body;

      // ✅ Allow only superadmin to update status
      if (userType !== 'superadmin') {
        return { status: 403, message: 'Only superadmin can update student status' };
      }

      // ✅ Validate studentId
      if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
        return { status: 400, message: 'A valid student ID is required' };
      }

      // ✅ Find the student within the same tenant
      const student = await User.findOne({
        _id: studentId,
        type: 'student'
      });

      if (!student) {
        return { status: 404, message: 'Student not found' };
      }

      // ✅ Update the active status
      student.isActive = isActive;
      await student.save();

      return {
        status: 200,
        message: `Student ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: {
          studentId: student._id,
          name: student.name,
          email: student.email,
          isActive: student.isActive
        }
      };
    } catch (error) {
      console.error('Error in updateStudentStatusAPI:', error);
      return { status: 500, message: error.message };
    }
  }


  static async getStudentReport(req) {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Base filter
      const filter = { type: "student", isDeleted: false };

      // Add search filter if search string provided
      if (search) {
        const regex = new RegExp(search, "i"); // case-insensitive
        filter.$or = [
          { name: regex },
          { firstName: regex },
          { middleName: regex },
          { lastName: regex },
          { email: regex },
        ];
      }

      const total = await User.countDocuments(filter);

      const students = await User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Attach scholarship and installment info
      const studentReports = await Promise.all(
        students.map(async (stu) => {
          const studentDetail = await User.findById(stu._id).lean();

          const scholarship = studentDetail?.officeUseInfo?.memfOffice?.scholarship || {};
          const totalAmount = scholarship.totalAmount || 0;

          const installments = (scholarship.installments || []).map((inst) => ({
            month: inst.month,
            amount: inst.amount,
            status: inst.status || "unpaid",
          }));

          const paidAmount = installments
            .filter((inst) => inst.status === "paid")
            .reduce((sum, inst) => sum + inst.amount, 0);

          const remainingAmount = totalAmount - paidAmount;

          return {
            ...stu,
            scholarship: {
              grantedFor: scholarship.grantedFor || null,
              totalAmount,
              paidAmount,
              remainingAmount,
              monthlyInstallments: installments,
            },
          };
        })
      );

      return {
        status: 200,
        data: {
          students: studentReports,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
          },
        },
      };
    } catch (error) {
      console.error("Error generating student report:", error);
      return { status: 500, message: error.message };
    }
  }



}

module.exports = UserService;
