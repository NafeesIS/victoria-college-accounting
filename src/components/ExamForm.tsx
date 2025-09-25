/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { examCategories, yearOptions, distributionDefaults } from "@/contants";

interface DistributionPercent {
  percent: number;
}

interface Distribution {
  govtTreasury: DistributionPercent;
  teachersCouncil: DistributionPercent;
  staffInvigilators: DistributionPercent;
  adminCommittee: DistributionPercent;
}

interface Expenses {
  examManagement: string; // user-entered string
  distributable?: string; // computed, kept as string for display
}

interface FormData {
  year: string;
  examCategory: string;
  examName: string;
  thisCollegeCount: string;
  thisCollegeRate: string;
  otherCollegeCount: string;
  otherCollegeRate: string;
  expenses: Expenses;
  distribution: Distribution;
}

interface Calculations {
  totalStudents: number;
  incomeAmount: number;
  examManagement: number;
  distributableFund: number;
  distributableExpenses: number;
  totalExpenses: number;
  distributionAmounts: {
    govtTreasury: number;
    teachersCouncil: number;
    staffInvigilators: number;
    adminCommittee: number;
  };
}

interface ExamFormProps {
  onExamAdded?: (exam: any) => void;
  onExamUpdated?: (exam: any) => void;
  initialData?: any;
  isEditing?: boolean;
  onCancel?: () => void;
}

const initialForm = (): FormData => ({
  year: new Date().getFullYear().toString(),
  examCategory: "",
  examName: "",
  thisCollegeCount: "",
  thisCollegeRate: "",
  otherCollegeCount: "",
  otherCollegeRate: "",
  expenses: {
    examManagement: "",
    distributable: "0.00",
  },
  distribution: {
    govtTreasury: { percent: distributionDefaults.govtTreasury },
    teachersCouncil: { percent: distributionDefaults.teachersCouncil },
    staffInvigilators: { percent: distributionDefaults.staffInvigilators },
    adminCommittee: { percent: distributionDefaults.adminCommittee },
  },
});

export default function ExamForm({
  onExamAdded,
  onExamUpdated,
  initialData,
  isEditing = false,
  onCancel,
}: ExamFormProps) {
  const [formData, setFormData] = useState<FormData>(initialForm());

  const [calculations, setCalculations] = useState<Calculations>({
    totalStudents: 0,
    incomeAmount: 0,
    examManagement: 0,
    distributableFund: 0,
    distributableExpenses: 0,
    totalExpenses: 0,
    distributionAmounts: {
      govtTreasury: 0,
      teachersCouncil: 0,
      staffInvigilators: 0,
      adminCommittee: 0,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Load initial data for editing (if provided)
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        year: (initialData.year ?? new Date().getFullYear()).toString(),
        examCategory: initialData.examCategory ?? "",
        examName: initialData.examName ?? "",
        thisCollegeCount: initialData.thisCollegeCount?.toString() ?? "",
        thisCollegeRate: initialData.thisCollegeRate?.toString() ?? "",
        otherCollegeCount: initialData.otherCollegeCount?.toString() ?? "",
        otherCollegeRate: initialData.otherCollegeRate?.toString() ?? "",
        expenses: {
          examManagement:
            initialData.expenses?.examManagement?.toString() ?? "",
          distributable:
            (initialData.expenses?.distributable !== undefined
              ? initialData.expenses.distributable.toFixed(2)
              : "0.00") ?? "0.00",
        },
        distribution: {
          govtTreasury: {
            percent:
              initialData.distribution?.govtTreasury?.percent ??
              distributionDefaults.govtTreasury,
          },
          teachersCouncil: {
            percent:
              initialData.distribution?.teachersCouncil?.percent ??
              distributionDefaults.teachersCouncil,
          },
          staffInvigilators: {
            percent:
              initialData.distribution?.staffInvigilators?.percent ??
              distributionDefaults.staffInvigilators,
          },
          adminCommittee: {
            percent:
              initialData.distribution?.adminCommittee?.percent ??
              distributionDefaults.adminCommittee,
          },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, initialData]);

  // Auto-calculate values when relevant inputs change
  useEffect(() => {
    const thisCollegeCount = parseInt(formData.thisCollegeCount) || 0;
    const thisCollegeRate = parseFloat(formData.thisCollegeRate) || 0;
    const otherCollegeCount = parseInt(formData.otherCollegeCount) || 0;
    const otherCollegeRate = parseFloat(formData.otherCollegeRate) || 0;

    const totalStudents = thisCollegeCount + otherCollegeCount;

    const incomeAmount =
      thisCollegeCount * thisCollegeRate + otherCollegeCount * otherCollegeRate;

    const examManagement = parseFloat(formData.expenses.examManagement) || 0;

    // distributableFund = income - examManagement (this is the amount to be distributed)
    const distributableFund = incomeAmount - examManagement;

    // Ensure we don't compute negative distribution if distributableFund is negative
    const baseDistributable = distributableFund > 0 ? distributableFund : 0;

    // distribution percents
    const govtPerc = Number(formData.distribution.govtTreasury.percent) || 0;
    const teachPerc =
      Number(formData.distribution.teachersCouncil.percent) || 0;
    const staffPerc =
      Number(formData.distribution.staffInvigilators.percent) || 0;
    const adminPerc = Number(formData.distribution.adminCommittee.percent) || 0;

    const distributionAmounts = {
      govtTreasury: (baseDistributable * govtPerc) / 100,
      teachersCouncil: (baseDistributable * teachPerc) / 100,
      staffInvigilators: (baseDistributable * staffPerc) / 100,
      adminCommittee: (baseDistributable * adminPerc) / 100,
    };

    const distributableExpenses =
      distributionAmounts.govtTreasury +
      distributionAmounts.teachersCouncil +
      distributionAmounts.staffInvigilators +
      distributionAmounts.adminCommittee;

    const totalExpenses = examManagement + distributableExpenses;

    // update calculations and also set the computed 'distributable' in formData.expenses for display
    setCalculations({
      totalStudents,
      incomeAmount,
      examManagement,
      distributableFund,
      distributableExpenses,
      totalExpenses,
      distributionAmounts,
    });

    // keep "expenses.distributable" read-only string for display consistent with calculated value
    setFormData((prev) => ({
      ...prev,
      expenses: {
        ...prev.expenses,
        distributable: distributableExpenses.toFixed(2),
      },
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    formData.thisCollegeCount,
    formData.thisCollegeRate,
    formData.otherCollegeCount,
    formData.otherCollegeRate,
    formData.expenses.examManagement,
    formData.distribution.govtTreasury.percent,
    formData.distribution.teachersCouncil.percent,
    formData.distribution.staffInvigilators.percent,
    formData.distribution.adminCommittee.percent,
  ]);

  // Generic input change handler (supports nested expenses.*)
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      if (parent === "expenses") {
        setFormData((prev) => ({
          ...prev,
          expenses: { ...prev.expenses, [child]: value },
        }));
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Distribution percent change (keeps percent as number)
  const handleDistributionChange = (key: keyof Distribution, value: number) => {
    setFormData((prev) => ({
      ...prev,
      distribution: {
        ...prev.distribution,
        [key]: { percent: Number(value) || 0 },
      },
    }));
  };

  const getTotalDistributionPercent = () =>
    Number(formData.distribution.govtTreasury.percent || 0) +
    Number(formData.distribution.teachersCouncil.percent || 0) +
    Number(formData.distribution.staffInvigilators.percent || 0) +
    Number(formData.distribution.adminCommittee.percent || 0);

  const getAvailableExams = () =>
    examCategories[formData.examCategory as keyof typeof examCategories] || [];

  const isFormValid = () => {
    const totalPercent = getTotalDistributionPercent();

    const thisCount = parseInt(formData.thisCollegeCount) || 0;
    const otherCount = parseInt(formData.otherCollegeCount) || 0;
    const thisRate = parseFloat(formData.thisCollegeRate) || 0;
    const otherRate = parseFloat(formData.otherCollegeRate) || 0;

    const hasAtLeastOneGroup =
      (thisCount > 0 && thisRate > 0) || (otherCount > 0 && otherRate > 0);

    // require: year, category, exam name, at least one group, examManagement entered,
    // percent sums to (approx) 100 and totalExpenses <= incomeAmount
    return (
      formData.year &&
      formData.examCategory &&
      formData.examName &&
      hasAtLeastOneGroup &&
      formData.expenses.examManagement !== "" &&
      Math.abs(totalPercent - 100) < 0.01 &&
      calculations.totalExpenses <= calculations.incomeAmount + 0.0001
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!isFormValid()) {
      setError(
        "Please complete required fields, ensure distribution sums to 100%, and expenses do not exceed income."
      );
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        year: parseInt(formData.year),
        examCategory: formData.examCategory,
        examName: formData.examName,
        thisCollegeCount: parseInt(formData.thisCollegeCount) || 0,
        thisCollegeRate: parseFloat(formData.thisCollegeRate) || 0,
        otherCollegeCount: parseInt(formData.otherCollegeCount) || 0,
        otherCollegeRate: parseFloat(formData.otherCollegeRate) || 0,
        expenses: {
          examManagement: parseFloat(formData.expenses.examManagement) || 0,
          distributable: calculations.distributableExpenses,
        },
        distribution: {
          govtTreasury: {
            percent: Number(formData.distribution.govtTreasury.percent) || 0,
          },
          teachersCouncil: {
            percent: Number(formData.distribution.teachersCouncil.percent) || 0,
          },
          staffInvigilators: {
            percent:
              Number(formData.distribution.staffInvigilators.percent) || 0,
          },
          adminCommittee: {
            percent: Number(formData.distribution.adminCommittee.percent) || 0,
          },
        },
      };

      const url =
        isEditing && initialData?._id
          ? `/api/exams/${initialData._id}`
          : "/api/exams";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(isEditing ? "Exam updated successfully!" : "Exam saved!");
        if (isEditing) {
          onExamUpdated?.(data);
        } else {
          onExamAdded?.(data);
          setFormData(initialForm());
        }
        // clear success after short delay
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data?.error || "Something went wrong");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {isEditing ? "Edit Exam Entry" : "Add New Exam Entry"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Year *
            </label>
            <select
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Exam Category *
            </label>
            <select
              name="examCategory"
              value={formData.examCategory}
              onChange={handleChange}
              required
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              <option value="">Select Category</option>
              {Object.keys(examCategories).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Exam Name *
            </label>
            <select
              name="examName"
              value={formData.examName}
              onChange={handleChange}
              required
              disabled={!formData.examCategory}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                         focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900
                         disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="">Select Exam</option>
              {getAvailableExams().map((exam) => (
                <option key={exam} value={exam}>
                  {exam}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Student & Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            label="This College Students Count"
            type="number"
            name="thisCollegeCount"
            value={formData.thisCollegeCount}
            onChange={handleChange}
            min={0}
          />
          <InputField
            label="Rate Per Student (This College)"
            type="number"
            name="thisCollegeRate"
            value={formData.thisCollegeRate}
            onChange={handleChange}
            min={0}
            step="0.01"
          />
          <InputField
            label="Other College Students Count"
            type="number"
            name="otherCollegeCount"
            value={formData.otherCollegeCount}
            onChange={handleChange}
            min={0}
          />
          <InputField
            label="Rate Per Student (Other College)"
            type="number"
            name="otherCollegeRate"
            value={formData.otherCollegeRate}
            onChange={handleChange}
            min={0}
            step="0.01"
          />

          <ReadOnlyField
            label="Total Students"
            value={calculations.totalStudents}
          />
          <ReadOnlyField
            label="Total Income"
            value={calculations.incomeAmount}
          />
        </div>

        {/* Expenses */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputField
            label="Exam Management Expense *"
            type="number"
            name="expenses.examManagement"
            value={formData.expenses.examManagement}
            onChange={handleChange}
            min={0}
            step="0.01"
            required
          />
          <ReadOnlyField
            label="Distributable Expenses (auto)"
            value={calculations.distributableExpenses}
          />
          <ReadOnlyField
            label="Total Expenses"
            value={calculations.totalExpenses}
          />
        </div>

        {/* Distribution */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Distribution
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DistributionInput
              label="Govt Treasury"
              value={formData.distribution.govtTreasury.percent}
              amount={calculations.distributionAmounts.govtTreasury}
              onChange={(val) => handleDistributionChange("govtTreasury", val)}
            />
            <DistributionInput
              label="Teachers Council"
              value={formData.distribution.teachersCouncil.percent}
              amount={calculations.distributionAmounts.teachersCouncil}
              onChange={(val) =>
                handleDistributionChange("teachersCouncil", val)
              }
            />
            <DistributionInput
              label="Staff & Invigilators"
              value={formData.distribution.staffInvigilators.percent}
              amount={calculations.distributionAmounts.staffInvigilators}
              onChange={(val) =>
                handleDistributionChange("staffInvigilators", val)
              }
            />
            <DistributionInput
              label="Admin Committee"
              value={formData.distribution.adminCommittee.percent}
              amount={calculations.distributionAmounts.adminCommittee}
              onChange={(val) =>
                handleDistributionChange("adminCommittee", val)
              }
            />
          </div>

          <p
            className={`mt-2 text-sm ${
              Math.abs(getTotalDistributionPercent() - 100) > 0.01
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            Total: {getTotalDistributionPercent().toFixed(2)}%
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}
        {success && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="text-sm text-green-700">{success}</div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md
                       hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2
                       focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : isEditing ? "Update Exam" : "Save Exam"}
          </button>

          {isEditing && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-500 text-white font-medium rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

/* ---------- Subcomponents ---------- */

function InputField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>
      <input
        {...props}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
                   focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
      />
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>
      <input
        type="text"
        value={Number(value || 0).toFixed(2)}
        readOnly
        className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900"
      />
    </div>
  );
}

function DistributionInput({
  label,
  value,
  amount,
  onChange,
}: {
  label: string;
  value: number;
  amount: number;
  onChange: (val: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        {label}
      </label>
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          min={0}
          max={100}
          step="0.01"
          className="w-20 md:w-28 px-3 py-2 border border-gray-300 rounded-md shadow-sm
                     focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
        />
        <span className="text-gray-700">%</span>
        <input
          type="text"
          value={Number(amount || 0).toFixed(2)}
          readOnly
          className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900"
        />
      </div>
    </div>
  );
}
