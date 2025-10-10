import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema(
  {
    // Category identifier
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "administration",
        "governmentTeacher",
        "guestTeacher",
        "librarian",
        "physicalEducationTeacher",
        "government3rdClass",
        "government4thClass",
        "nonGovernment3rdClass",
        "nonGovernment4thClass",
        "nonGovernmentDepartmentalClerk",
      ],
      index: true,
    },

    // Common fields (all categories have these)
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      index: true,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },

    // Optional fields (depends on category)
    department: {
      type: String,
      trim: true,
      sparse: true, // Allows null/undefined for categories without department
    },
    idNumber: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    bcsBatch: {
      type: String,
      trim: true,
      sparse: true,
    },
    nidNumber: {
      type: String,
      required: [true, "NID Number is required"],
      trim: true,
      index: true,
    },
    eTin: {
      type: String,
      required: [true, "E-TIN is required"],
      trim: true,
      index: true,
    },

    // Audit fields
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    softDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for better query performance
EmployeeSchema.index({ category: 1, softDeleted: 1 });
EmployeeSchema.index({ category: 1, name: 1 });
EmployeeSchema.index({ nidNumber: 1, category: 1 }, { unique: true, sparse: true });
EmployeeSchema.index({ eTin: 1, category: 1 }, { unique: true, sparse: true });
EmployeeSchema.index({ idNumber: 1, category: 1 }, { unique: true, sparse: true });

// Pre-save validation hook
EmployeeSchema.pre("save", function (next) {
  // Categories that require idNumber and bcsBatch
  const requiresGovtFields = [
    "administration",
    "governmentTeacher",
    "guestTeacher",
    "librarian",
    "physicalEducationTeacher",
    "government3rdClass",
    "government4thClass",
  ];

  if (requiresGovtFields.includes(this.category)) {
    if (!this.idNumber) {
      return next(new Error("ID Number is required for this category"));
    }
  }

  // Categories that require department
  const requiresDepartment = ["governmentTeacher", "guestTeacher"];
  if (requiresDepartment.includes(this.category) && !this.department) {
    return next(new Error("Department is required for this category"));
  }

  next();
});

export default mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);