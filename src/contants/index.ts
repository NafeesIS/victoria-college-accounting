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
  "Internal": [
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