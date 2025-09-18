'use client';

import { useState } from 'react';

interface Teacher {
  _id: string;
  name: string;
  department: string;
  bcsBatch: string;
  idNumber: string;
  nidNumber: string;
  eTin: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Filters {
  search: string;
  department: string;
  sortBy: string;
  sortOrder: string;
}

interface TeacherTableProps {
  teachers: Teacher[];
  isLoading: boolean;
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const departments = [
  'Accounting',
  'Management',
  'Economics',
  'Finance',
  'Marketing',
  'Computer Science',
  'English',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Political Science',
  'Philosophy',
  'Psychology',
];

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'department', label: 'Department' },
  { value: 'bcsBatch', label: 'BCS Batch' },
  { value: 'createdAt', label: 'Date Added' },
];

export default function TeacherTable({ teachers, isLoading, filters, onFilterChange }: TeacherTableProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput });
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleSort = (sortBy: string) => {
    const newSortOrder = filters.sortBy === sortBy && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    onFilterChange({ ...filters, sortBy, sortOrder: newSortOrder });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSortIcon = (column: string) => {
    if (filters.sortBy !== column) return '↕️';
    return filters.sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <form onSubmit={handleSearchSubmit} className="flex">
              <input
                type="text"
                placeholder="Search by name, ID, NID, or E-TIN..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                🔍
              </button>
            </form>
          </div>

          <div>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option className='text-gray-900' key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* <div>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                handleFilterChange('sortBy', sortBy);
                handleFilterChange('sortOrder', sortOrder);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              {sortOptions.map((option) => (
                <optgroup key={option.value} label={option.label}>
                  <option value={`${option.value}-asc`}>{option.label} (A-Z)</option>
                  <option value={`${option.value}-desc`}>{option.label} (Z-A)</option>
                </optgroup>
              ))}
            </select>
          </div> */}
        </div>

        <div className="mt-4 text-sm text-gray-900">
          Total: {teachers.length} teacher{teachers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="text-gray-900">Loading teachers...</div>
          </div>
        ) : teachers.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-900">No teachers found</div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort('name')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Name {getSortIcon('name')}
                </th>
                <th
                  onClick={() => handleSort('department')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Department {getSortIcon('department')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  BCS Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  ID Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  NID Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  E-TIN
                </th>
                <th
                  onClick={() => handleSort('createdAt')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Date Added {getSortIcon('createdAt')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                    <div className="text-sm text-gray-500">by {teacher.createdBy.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {teacher.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {teacher.bcsBatch}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {teacher.idNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {teacher.nidNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {teacher.eTin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(teacher.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}