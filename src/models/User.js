const { string } = require("joi");
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      trim: true,
    },
    // tenantId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Tenant",
    //   required: function () {
    //     return this.type !== "admin";
    //   },
    // },
    type: {
      type: String,
      enum: ["student", "tutor", "superadmin"],
      required: true,
    },
    applicationStatus: {
      type: String,
    },
    scholarshipCategory: {
      type: String,
    },
    name: {
      type: String,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    gender: {
      type: String
    },
    dob: {
      type: Date
    },
    nationality: {
      type: String
    },
    residentialAddress: {
      type: String,
      trim: true,
    },
    appliedOther: {
      type: String,
      default: "no",
    },
    appliedDetails: {
      type: String,
      default: "",
    },
    currentSchool: {
      type: String,
      trim: true,
    },
    schoolAddress: {
      type: String,
      trim: true,
    },
    positionAchieved: {
      type: String,
      trim: true,
    },
    gradeClass: {
      type: String,
      trim: true,
    },
    monthlyFee: {
      type: String,
      trim: true,
    },
    plannedCollege: {
      type: String,
      trim: true,
    },
    examinationBoard: {
      type: String,
      enum: ["National", "Cambridge", "Other"],
      default: "National",
    },
    declarationParentName: {
      type: String,
      trim: true,
    },
    declarationDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: false,

    },
    image: {
      type: String,
      default: "",
    },
    phone: {
      type: String,

    },
    isEmailValid: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",

    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    documents: {
      passportPhoto: { type: String, default: "" },
      last3YearsResults: { type: String, default: "" },
      achievementCertificates: { type: String, default: "" },
      fatherCNIC: { type: String, default: "" },
      fatherJamaatCard: { type: String, default: "" },
      motherCNIC: { type: String, default: "" },
      motherJamaatCard: { type: String, default: "" },
      jamaatNOC: { type: String, default: "" },
      lastPaidFeeChallan: { type: String, default: "" },
      lastSalarySlip: { type: String, default: "" },
      utilityBills: { type: String, default: "" },
      bForm: { type: String, default: "" },
    },

    academicRecords: [{
      class: {
        type: String,
      },
      stream: {
        type: String,
        enum: ["Science", "Commerce", "Arts", "Other"],
        default: "Other",
      },
      schoolName: {
        type: String,
      },
      yearOfPassing: {
        type: String,
      },
      gradeOrPercentage: {
        type: String, // Can handle grades like 'A+' or '85%'
      },
      positionOrRank: {
        type: String,
        default: "", // Optional
      },
      transcript: {
        type: String,
        default: "",
      },
    }],
    extracurricularActivities: [{
      activityName: {
        type: String,
      },
      role: {
        type: String,
      },
      timespent: {
        type: String,

      },
      beeninvoled: {
        type: String,
      },
      reciveCertificates: {
        type: String,

      },
    }],
    father: {
      firstName: { type: String },
      middleName: { type: String },
      lastName: { type: String },
      cnicNo: { type: String },
      jamaatName: { type: String },
      jamaatMembershipNo: { type: String },
      profession: { type: String },
      companyName: { type: String },
      designation: { type: String },
      residentialAddress: { type: String },
      mobileNumber: { type: String },
      qualification: { type: String },
      salary: { type: String },
      email: { type: String },
    },

    mother: {
      firstName: { type: String },
      middleName: { type: String },
      lastName: { type: String },
      cnicNo: { type: String },
      jamaatName: { type: String },
      jamaatMembershipNo: { type: String },
      profession: { type: String },
      companyName: { type: String },
      designation: { type: String },
      residentialAddress: { type: String },
      mobileNumber: { type: String },
       qualification: { type: String },
      salary: { type: String },
      email: { type: String },
    },

    selectionNote: {
      type: String,
      default: "",
    },

    numberOfHouseholdMembers: {
      type: Number,
      default: 0,
    },

    familyMembers: [
      {
        name: { type: String },
        relation: { type: String },
      },
    ],

    financialInformation: {
      numberOfEarningMembers: { type: Number },
      earningMemberRelations: [{ type: String }],
      totalMonthlyIncome: { type: Number },
    },


    officeUseInfo: {
      jamaatName: { type: String },
      membershipNumber: { type: String },
      belongsToJamaat: {
        type: String,
        enum: [
          "Mother",
          "Father",
          "Both",
          "None"
        ],
        default: "None",
      },
      supportProvided: {
        type: String,
        enum: [
          "Course and Uniform",
          "No Support"
        ],
      },
      zakatDeserving: { type: Boolean, default: false },

      authorizedSignature: {
        name: { type: String },
        designation: { type: String },
        stamp: { type: String }, // URL or base64 image optional
      },

      channelOfSubmission: {
        type: String,
        enum: [
          "All Pakistan Memon Federation",
          "World Memon Organization",
          "The Pakistan Memon Educational & Welfare Society (Sir Adamjee Institute)",
          "Other"
        ],
        default: "Other",
      },

      memfOffice: {
        studentCode: { type: String },
        assessmentDate: { type: Date },
        interviewDate: { type: Date },
        memfEvaluationScore: { type: String },
        decision: {
          type: String,
          enum: ["Approve", "Hold", "Regret"],
          default: "Hold",
        },
        category: {
          type: String,
          enum: ["STAR", "HOPE", "SEED"],
          default: "SEED",
        },
        scholarship: {
          grantedFor: [{ type: String }], // E.g. ["Monthly Fee", "Books"]
          totalAmount: { type: Number },
          installments: [
            {
              month: String,
              amount: Number,
              status: {
                type: String,
                enum: ['paid', 'unpaid'],
                default: 'unpaid',
              }
            }
          ],
        },
        panelComments: { type: String },
        gradingRubrics: [{
          academicMerit: { type: Number, default: 0 }, // 30%
          talentTest: { type: Number, default: 0 }, // 25%
          personalStatement: { type: Number, default: 0 }, // 10%
          leadership: { type: Number, default: 0 }, // 15%
          homeSupport: { type: Number, default: 0 }, // 10%
          total: { type: Number, default: 0 },
        }],
        reviewPanelSignature: {
          name: { type: String },
          designation: { type: String },
          stamp: { type: String },
        },
      },
    },
  },
  { timestamps: true }
);

// UserSchema.pre("save", function (next) {
//   if (this.type !== "admin" && !this.tenantId) {
//     next(new Error("TenantId is required for non-admin users"));
//   }
//   next();
// });

module.exports = mongoose.model("User", UserSchema);
