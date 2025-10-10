import { LucideIcon } from "lucide-react";
export const departments = [
  "Accounting",
  "Bangla",
  "Botany",
  "Chemistry",
  "Economics",
  "English",
  "Finance & Banking",
  "History",
  "Islamic History & Culture",
  "Arabic & Islamic Studies",
  "Management",
  "Marketing",
  "Mathematics",
  "Philosophy",
  "Physics",
  "Political Science",
  "Social Work",
  "Sociology",
  "Statistics",
  "Zoology",
];

export const governmentDesignations = [
  "Principal",
  "Vice Principal",
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecture",
  "Physical Teacher",
  "Librarian",
  "Demonstrator",
  "Head Assistant",
  "Accountant",
  "Assistant Accountant",
  "Store Keeper",
  "Cashier",
  "Office Assistant Cum-Computer Operator",
  "Book Sorter",
  "Skill Bearer",
  "Office Assistant",
];

export const examCategories = {
  "Board/University": [
    "HSC Board Exam",
    "Honors 1st Year Exam",
    "Honors 2nd Year Exam",
    "Honors 3rd Year Exam",
    "Honors 4th Year Exam",
    "Degree 1st Year Exam",
    "Degree 2nd Year Exam",
    "Degree 3rd Year Exam",
    "Preliminary to Masters Exam",
    "Master's First Year Exam",
  ],
  Internal: [
    "Class XI Half-Yearly Exam",
    "Class XI Annual Exam",
    "Class XII Pre-Selection Exam",
    "Class XII Selection Exam",
    "Degree 1st Year Selection Exam",
    "Degree 2nd Year Selection Exam",
    "Degree 3rd Year Selection Exam",
  ],
  "Application Fee": [
    "Class XI Admission Application Fee",
    "Honors 1st Year Admission Application Fee",
    "Degree 1st Year Admission Application Fee",
    "Preliminary Admission Application Fee",
    "Master's Final Admission Application Fee",
  ],
};

export const distributionDefaults = {
  govtTreasury: 10,
  teachersCouncil: 2,
  staffInvigilators: 56,
  adminCommittee: 32,
};

export const currentYear = new Date().getFullYear();
export const yearOptions = Array.from(
  { length: 11 },
  (_, i) => currentYear - 5 + i
);

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "select" | "number";
  required: boolean;
  unique?: boolean;
  options?: string[];
}

export interface CategoryConfig {
  label: string;
  iconName: string; // Store icon name as string
  fields: FieldConfig[];
  tableColumns: string[];
}

export const employeeCategories: Record<string, CategoryConfig> = {
  administration: {
    label: "Administration",
    iconName: "Briefcase",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true },
      {
        name: "designation",
        label: "Designation",
        type: "text",
        required: true,
      },
      {
        name: "idNumber",
        label: "ID Number",
        type: "text",
        required: true,
        unique: true,
      },
      { name: "bcsBatch", label: "BCS Batch", type: "text", required: true },
      {
        name: "nidNumber",
        label: "NID Number",
        type: "text",
        required: true,
        unique: true,
      },
      {
        name: "eTin",
        label: "E-TIN",
        type: "text",
        required: true,
        unique: true,
      },
    ],
    tableColumns: [
      "name",
      "designation",
      "idNumber",
      "bcsBatch",
      "nidNumber",
      "eTin",
    ],
  },
  governmentTeacher: {
    label: "Government Teacher",
    iconName: "GraduationCap",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true },
      {
        name: "designation",
        label: "Designation",
        type: "select",
        required: true,
        options: [
          "Professor",
          "Associate Professor",
          "Assistant Professor",
          "Lecturer",
          "Senior Lecturer",
        ],
      },
      {
        name: "department",
        label: "Department",
        type: "select",
        required: true,
        options: [
          "Bangla",
          "English",
          "Mathematics",
          "Physics",
          "Chemistry",
          "Biology",
          "ICT",
          "Economics",
          "Political Science",
          "History",
          "Islamic Studies",
          "Accounting",
          "Management",
          "Finance",
        ],
      },
      {
        name: "idNumber",
        label: "ID Number",
        type: "text",
        required: true,
        unique: true,
      },
      { name: "bcsBatch", label: "BCS Batch", type: "text", required: true },
      {
        name: "nidNumber",
        label: "NID Number",
        type: "text",
        required: true,
        unique: true,
      },
      {
        name: "eTin",
        label: "E-TIN",
        type: "text",
        required: true,
        unique: true,
      },
    ],
    tableColumns: [
      "name",
      "designation",
      "department",
      "idNumber",
      "bcsBatch",
      "nidNumber",
      "eTin",
    ],
  },
  guestTeacher: {
    label: "Guest Teacher",
    iconName: "Users",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true },
      {
        name: "designation",
        label: "Designation",
        type: "text",
        required: true,
      },
      {
        name: "department",
        label: "Department",
        type: "select",
        required: true,
        options: [
          "Bangla",
          "English",
          "Mathematics",
          "Physics",
          "Chemistry",
          "Biology",
          "ICT",
          "Economics",
          "Political Science",
          "History",
          "Islamic Studies",
          "Accounting",
          "Management",
          "Finance",
        ],
      },
      {
        name: "idNumber",
        label: "ID Number",
        type: "text",
        required: true,
        unique: true,
      },
      {
        name: "nidNumber",
        label: "NID Number",
        type: "text",
        required: true,
        unique: true,
      },
      {
        name: "eTin",
        label: "E-TIN",
        type: "text",
        required: true,
        unique: true,
      },
    ],
    tableColumns: [
      "name",
      "designation",
      "department",
      "idNumber",
      "nidNumber",
      "eTin",
    ],
  },
  librarian: {
    label: "Librarian",
    iconName: "BookOpen",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true },
      {
        name: "designation",
        label: "Designation",
        type: "text",
        required: true,
      },
      {
        name: "idNumber",
        label: "ID Number",
        type: "text",
        required: true,
        unique: true,
      },
      {
        name: "nidNumber",
        label: "NID Number",
        type: "text",
        required: true,
        unique: true,
      },
      {
        name: "eTin",
        label: "E-TIN",
        type: "text",
        required: true,
        unique: true,
      },
    ],
    tableColumns: ["name", "designation", "idNumber", "nidNumber", "eTin"],
  },
  physicalEducationTeacher: {
    label: "Physical Education Teacher",
    iconName: "Dumbbell",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true },
      {
        name: "designation",
        label: "Designation",
        type: "text",
        required: true,
      },
      {
        name: "idNumber",
        label: "ID Number",
        type: "text",
        required: true,
        unique: true,
      },
      {
        name: "nidNumber",
        label: "NID Number",
        type: "text",
        required: true,
        unique: true,
      },
      {
        name: "eTin",
        label: "E-TIN",
        type: "text",
        required: true,
        unique: true,
      },
    ],
    tableColumns: ["name", "designation", "idNumber", "nidNumber", "eTin"],
  },
  government3rdClass: {
    label: "Government 3rd Class Employee",
    iconName: "UserCog",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true },
      {
        name: "designation",
        label: "Designation",
        type: "text",
        required: true,
      },
      {
        name: "idNumber",
        label: "ID Number",
        type: "text",
        required: true,
        unique: true,
      },
      {
        name: "nidNumber",
        label: "NID Number",
        type: "text",
        required: true,
        unique: true,
      },
      {
        name: "eTin",
        label: "E-TIN",
        type: "text",
        required: true,
        unique: true,
      },
    ],
    tableColumns: ["name", "designation", "idNumber", "nidNumber", "eTin"],
  },
  government4thClass: {
    label: "Government 4th Class Employee",
    iconName: "UserCog",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true },
      {
        name: "designation",
        label: "Designation",
        type: "text",
        required: true,
      },
      {
        name: "idNumber",
        label: "ID Number",
        type: "text",
        required: true,
        unique: true,
      },
      {
        name: "nidNumber",
        label: "NID Number",
        type: "text",
        required: true,
        unique: true,
      },
      {
        name: "eTin",
        label: "E-TIN",
        type: "text",
        required: true,
        unique: true,
      },
    ],
    tableColumns: ["name", "designation", "idNumber", "nidNumber", "eTin"],
  },
  nonGovernment3rdClass: {
    label: "Non-Government 3rd Class Employee",
    iconName: "UserCog",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true },
      {
        name: "designation",
        label: "Designation",
        type: "text",
        required: true,
      },
      {
        name: "nidNumber",
        label: "NID Number",
        type: "text",
        required: true,
        unique: true,
      },
      {
        name: "eTin",
        label: "E-TIN",
        type: "text",
        required: true,
        unique: true,
      },
    ],
    tableColumns: ["name", "designation", "nidNumber", "eTin"],
  },
  nonGovernment4thClass: {
    label: "Non-Government 4th Class Employee",
    iconName: "UserCog",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true },
      {
        name: "designation",
        label: "Designation",
        type: "text",
        required: true,
      },
      {
        name: "nidNumber",
        label: "NID Number",
        type: "text",
        required: true,
        unique: true,
      },
      {
        name: "eTin",
        label: "E-TIN",
        type: "text",
        required: true,
        unique: true,
      },
    ],
    tableColumns: ["name", "designation", "nidNumber", "eTin"],
  },
  nonGovernmentDepartmentalClerk: {
    label: "Non-Government Departmental Clerk",
    iconName: "UserCog",
    fields: [
      { name: "name", label: "Full Name", type: "text", required: true },
      {
        name: "designation",
        label: "Designation",
        type: "text",
        required: true,
      },
      {
        name: "nidNumber",
        label: "NID Number",
        type: "text",
        required: true,
        unique: true,
      },
      {
        name: "eTin",
        label: "E-TIN",
        type: "text",
        required: true,
        unique: true,
      },
    ],
    tableColumns: ["name", "designation", "nidNumber", "eTin"],
  },
};
