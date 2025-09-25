/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Edit, Trash2, Search, Download } from "lucide-react";
import { examCategories, yearOptions } from "@/contants";

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

  const exportToCSV = () => {
    const headers = [
      "Year",
      "Category",
      "Exam Name",
      "This College Students",
      "This College Rate",
      "Other College Students",
      "Other College Rate",
      "Income",
      "Expenses",
      "Distributable",
      "Govt Treasury %",
      "Teachers Council %",
      "Staff/Invigilators %",
      "Admin Committee %",
      "Date Added",
    ];

    const csvData = exams.map((exam) => [
      exam.year,
      exam.examCategory,
      exam.examName,
      exam.thisCollegeCount,
      exam.thisCollegeRate,
      exam.otherCollegeCount,
      exam.otherCollegeRate,
      exam.incomeAmount,
      exam.totalExpenses,
      exam.distributableFund,
      exam.distribution?.govtTreasury?.percent || 0,
      exam.distribution?.teachersCouncil?.percent || 0,
      exam.distribution?.staffInvigilators?.percent || 0,
      exam.distribution?.adminCommittee?.percent || 0,
      formatDate(exam.createdAt),
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `exam-records-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header and Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Exam Records</h2>
          <button
            onClick={exportToCSV}
            disabled={exams.length === 0}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
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
              onChange={(e) => handleFilterChange("examCategory", e.target.value)}
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
              {Math.min(pagination.current * pagination.limit, pagination.count)} of{" "}
              {pagination.count} entries
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
                <tr key={exam._id} className="hover:bg-gray-50">
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
                        Teachers: {exam.distribution?.teachersCouncil?.percent || 0}%
                      </div>
                      <div>
                        Staff: {exam.distribution?.staffInvigilators?.percent || 0}%
                      </div>
                      <div>
                        Admin: {exam.distribution?.adminCommittee?.percent || 0}%
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
                  Showing page <span className="font-medium">{pagination.current}</span> of{" "}
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
                  {Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
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
                  })}

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
