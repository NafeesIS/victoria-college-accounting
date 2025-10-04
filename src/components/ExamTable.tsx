/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Edit, Trash2, Search, Download } from "lucide-react";
import { examCategories, yearOptions } from "@/contants";
import * as XLSX from "xlsx";

interface ExamTableProps {
  exams: any[];
  isLoading: boolean;
  filters: any;
  onFilterChange: (filters: any) => void;
  onEdit: (exam: any) => void;
  onDelete: (examId: string) => void;
  pagination: any;
}

export default function ExamTable({
  exams,
  isLoading,
  filters,
  onFilterChange,
  onEdit,
  onDelete,
  pagination,
}: ExamTableProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput });
  };

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    onFilterChange({ ...filters, page: newPage });
  };

  const handleSort = (sortBy: string) => {
    const newSortOrder =
      filters.sortBy === sortBy && filters.sortOrder === "asc" ? "desc" : "asc";
    onFilterChange({ ...filters, sortBy, sortOrder: newSortOrder });
  };

  const handleRowSelect = (examId: string) => {
    setSelectedRowId(selectedRowId === examId ? null : examId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString()}`;
  };

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column) return "↕️";
    return filters.sortOrder === "asc" ? "↑" : "↓";
  };

  const exportSelectedRowToExcel = () => {
    const selectedExam = exams.find((exam) => exam._id === selectedRowId);
    if (!selectedExam) {
      alert("Please select a row to export");
      return;
    }

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Calculate totals for the selected exam
    const totalIncome = selectedExam.incomeAmount || 0;
    const totalExpenses = selectedExam.totalExpenses || 0;
    const distributableAmount = selectedExam.distributableFund || 0;

    // Prepare data matching the Bengali format layout
    const wsData = [
      ["কুমিল্লা ভিক্টোরিয়া সরকারি কলেজ, কুমিল্লা", "", "", "", ""],
      [
        `${selectedExam.year} সালের ${selectedExam.examName} পরীক্ষার হিসাব ও বণ্টন বিবরণী`,
        "",
        "",
        "",
        "",
      ],
      [],
      ["আয়ের বিবরণ", "", "", "ব্যয়", ""],
      [
        "আয়ের বিবরণ",
        "শিক্ষার্থীর সংখ্যা",
        "টাকার হার",
        "মোট আয় টাকার পরিমাণ",
        "ব্যয়ের বিবরণ",
        "মোট ব্যয় টাকার পরিমাণ",
      ],
      [
        "বহিঃকলেজ পরীক্ষার্থী ফি প্রাপ্তি",
        selectedExam.otherCollegeCount || 0,
        selectedExam.otherCollegeRate || 0,
        selectedExam.otherCollegeRate * selectedExam.otherCollegeCount || 0,
        "পরীক্ষা পরিচালনা কাজে ব্যয়",
        selectedExam.expenses.examManagement.toFixed(2),
      ],
      [
        "এ কলেজের পরীক্ষার্থী ফি প্রাপ্তি",
        selectedExam.thisCollegeCount || 0,
        selectedExam.thisCollegeRate || 0,
        selectedExam.thisCollegeCount * selectedExam.thisCollegeRate || 0,
        "মোট বণ্টনকৃত টাকা পরিমাণ",
        distributableAmount.toFixed(2),
      ],
      [
        "মোট আয়=",
        selectedExam.otherCollegeCount + selectedExam.thisCollegeCount,
        "",
        selectedExam.otherCollegeRate * selectedExam.otherCollegeCount +
          selectedExam.thisCollegeCount * selectedExam.thisCollegeRate,
        "মোট ব্যয়=",
        totalExpenses.toFixed(2),
      ],
      [],
      [
        "বন্টনকৃত টাকা পরিমাণ",
        "",
        "বন্টনের বিবরণ",
        "টাকার হার",
        "মোট বন্টন টাকার পরিমাণ",
      ],
      [
        distributableAmount.toFixed(2),
        "",
        "সরকারি কোষাগারে জমা",
        `${selectedExam.distribution?.govtTreasury?.percent || 0}%`,
        (
          (distributableAmount *
            (selectedExam.distribution?.govtTreasury?.percent || 0)) /
          100
        ).toFixed(2),
      ],
      [
        "",
        "",
        "শিক্ষক পরিষদ",
        `${selectedExam.distribution?.teachersCouncil?.percent || 0}%`,
        (
          (distributableAmount *
            (selectedExam.distribution?.teachersCouncil?.percent || 0)) /
          100
        ).toFixed(2),
      ],
      [
        "",
        "",
        "ইনভিজিলেটর, পরীক্ষা সংগঠক কাজে নিযুক্ত কর্মচারী (এল এস এস, দারোয়ান, সুপার ও অন্যান্য)",
        `${selectedExam.distribution?.staffInvigilators?.percent || 0}%`,
        (
          (distributableAmount *
            (selectedExam.distribution?.staffInvigilators?.percent || 0)) /
          100
        ).toFixed(2),
      ],
      [
        "",
        "",
        "প্রধান, কমিটি ও অফিস",
        `${selectedExam.distribution?.adminCommittee?.percent || 0}%`,
        (
          (distributableAmount *
            (selectedExam.distribution?.adminCommittee?.percent || 0)) /
          100
        ).toFixed(2),
      ],
      ["", "", "মোট", "১০০%", distributableAmount.toFixed(2)],
    ];

    // Convert to worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Merge cells for titles and headers as in the original format
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, // Row 1: college name across all 5 columns
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }, // Row 2: subtitle across all 5 columns
      { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } }, // Row 4: "আয়ের বিবরণ" across 3 columns
      { s: { r: 3, c: 3 }, e: { r: 3, c: 4 } }, // Row 4: "ব্যয়" across 2 columns
      { s: { r: 10, c: 0 }, e: { r: 14, c: 0 } }, // Distribution amount spans multiple rows
      { s: { r: 10, c: 1 }, e: { r: 14, c: 1 } }, // Empty column spans
    ];
    ws["A1"].s = {
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
      font: { bold: true },
    };

    ws["A2"].s = {
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
    };

    ws["E11"].s = { alignment: { horizontal: "center", vertical: "center" } };
    // Set column widths
    ws["!cols"] = [
      { wch: 35 }, // Column A - wider for descriptions
      { wch: 15 }, // Column B - student count
      { wch: 20 }, // Column C - rate
      { wch: 20 }, // Column D - expense descriptions
      { wch: 20 }, // Column E - amounts
      { wch: 20 }, // Column E - amounts
    ];

    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Exam Report");

    // Export the workbook with exam-specific filename
    XLSX.writeFile(
      wb,
      `${selectedExam.examName}-${selectedExam.year}-report-${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  };

  const getSelectedExam = () => {
    return exams.find((exam) => exam._id === selectedRowId);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header and Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Exam Records</h2>
          <div className="flex space-x-2">
            {selectedRowId && (
              <div className="text-sm text-gray-600 px-3 py-2 bg-blue-50 rounded-md">
                Selected: {getSelectedExam()?.examName}
              </div>
            )}
            <button
              onClick={exportSelectedRowToExcel}
              disabled={!selectedRowId}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={16} />
              <span>Export Selected</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <form onSubmit={handleSearchSubmit} className="flex">
              <input
                type="text"
                placeholder="Search by exam name or year..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <Search size={16} />
              </button>
            </form>
          </div>

          <div>
            <select
              value={filters.year || "all"}
              onChange={(e) => handleFilterChange("year", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              <option value="all">All Years</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filters.examCategory || "all"}
              onChange={(e) =>
                handleFilterChange("examCategory", e.target.value)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              <option value="all">All Categories</option>
              {Object.keys(examCategories).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filters.limit || "10"}
              onChange={(e) => handleFilterChange("limit", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>

        {pagination && (
          <div className="mt-4 text-sm text-gray-600">
            <span>
              Showing {(pagination.current - 1) * pagination.limit + 1} to{" "}
              {Math.min(
                pagination.current * pagination.limit,
                pagination.count
              )}{" "}
              of {pagination.count} entries
            </span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">Loading exam records...</div>
          </div>
        ) : exams.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-500">No exam records found</div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th
                  onClick={() => handleSort("year")}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Year {getSortIcon("year")}
                </th>
                <th
                  onClick={() => handleSort("examCategory")}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Category {getSortIcon("examCategory")}
                </th>
                <th
                  onClick={() => handleSort("examName")}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Exam Name {getSortIcon("examName")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  This College Students
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  This College Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Other College Students
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Other College Rate
                </th>
                <th
                  onClick={() => handleSort("incomeAmount")}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Income {getSortIcon("incomeAmount")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expenses
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distributable
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distribution
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Date {getSortIcon("createdAt")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {exams.map((exam) => (
                <tr
                  key={exam._id}
                  className={`hover:bg-gray-50 ${
                    selectedRowId === exam._id
                      ? "bg-blue-50 ring-2 ring-blue-200"
                      : ""
                  }`}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="radio"
                      name="selectedRow"
                      checked={selectedRowId === exam._id}
                      onChange={() => handleRowSelect(exam._id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exam.year}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {exam.examCategory}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={exam.examName}>
                      {exam.examName}
                    </div>
                    <div className="text-xs text-gray-500">
                      by {exam.createdBy?.name || "Unknown"}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exam.thisCollegeCount}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(exam.thisCollegeRate)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {exam.otherCollegeCount}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(exam.otherCollegeRate)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    {formatCurrency(exam.incomeAmount)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                    {formatCurrency(exam.totalExpenses)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {formatCurrency(exam.distributableFund)}
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-600">
                    <div className="space-y-1">
                      <div>
                        Govt: {exam.distribution?.govtTreasury?.percent || 0}%
                      </div>
                      <div>
                        Teachers:{" "}
                        {exam.distribution?.teachersCouncil?.percent || 0}%
                      </div>
                      <div>
                        Staff:{" "}
                        {exam.distribution?.staffInvigilators?.percent || 0}%
                      </div>
                      <div>
                        Admin: {exam.distribution?.adminCommittee?.percent || 0}
                        %
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(exam.createdAt)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(exam)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                        aria-label="Edit exam"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDelete(exam._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                        aria-label="Delete exam"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.total > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current === pagination.total}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page{" "}
                  <span className="font-medium">{pagination.current}</span> of{" "}
                  <span className="font-medium">{pagination.total}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.current - 1)}
                    disabled={pagination.current === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {/* Page numbers */}
                  {Array.from(
                    { length: Math.min(5, pagination.total) },
                    (_, i) => {
                      const page = Math.max(1, pagination.current - 2) + i;
                      if (page > pagination.total) return null;

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.current === page
                              ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() => handlePageChange(pagination.current + 1)}
                    disabled={pagination.current === pagination.total}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
