import mongoose from "mongoose";

const ExamSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: 2000,
      max: 2050,
    },
    examCategory: {
      type: String,
      required: [true, "Exam category is required"],
      enum: ["Board/University", "Internal", "Application Fee"],
    },
    examName: {
      type: String,
      required: [true, "Exam name is required"],
      trim: true,
    },

    // 🔹 Replaced studentCount + ratePerStudent with separate groups
    thisCollegeCount: {
      type: Number,
      required: true,
      min: 0,
    },
    thisCollegeRate: {
      type: Number,
      required: true,
      min: 0,
    },
    otherCollegeCount: {
      type: Number,
      required: true,
      min: 0,
    },
    otherCollegeRate: {
      type: Number,
      required: true,
      min: 0,
    },

    // 🔹 Auto-calculated values
    totalStudents: {
      type: Number,
      required: true,
      min: 0,
    },
    incomeAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    expenses: {
      examManagement: {
        type: Number,
        required: true,
        min: 0,
      },
      distributable: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    totalIncome: {
      type: Number,
      required: true,
      min: 0,
    },
    totalExpenses: {
      type: Number,
      required: true,
      min: 0,
    },
    distributableFund: {
      type: Number,
      required: true,
      min: 0,
    },

    distribution: {
      govtTreasury: {
        percent: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
      teachersCouncil: {
        percent: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
      staffInvigilators: {
        percent: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
      adminCommittee: {
        percent: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    },

    softDeleted: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ExamSchema.index({ year: 1, examCategory: 1, examName: 1 });
ExamSchema.index({ softDeleted: 1 });

// Validation middleware
ExamSchema.pre("save", function (next) {
  // ✅ Distribution percentages must sum to 100
const dist = this.distribution || {};

  const totalPercent =
    (dist.govtTreasury?.percent || 0) +
    (dist.teachersCouncil?.percent || 0) +
    (dist.staffInvigilators?.percent || 0) +
    (dist.adminCommittee?.percent || 0);

  if (Math.abs(totalPercent - 100) > 0.01) {
    return next(new Error("Distribution percentages must sum to 100%"));
  }

  // ✅ Total expenses cannot exceed total income
  if (this.totalExpenses > this.totalIncome) {
    return next(new Error("Total expenses cannot exceed total income"));
  }

  // ✅ Auto-calc safeguard: totalStudents should match counts
  const expectedTotal =
    (this.thisCollegeCount || 0) + (this.otherCollegeCount || 0);
  if (this.totalStudents !== expectedTotal) {
    return next(new Error("totalStudents must equal thisCollegeCount + otherCollegeCount"));
  }

  next();
});

export default mongoose.model("Exam", ExamSchema);

