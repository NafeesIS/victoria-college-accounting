'use client';

import { TeacherFormProps } from '@/types/types';
import { useState } from 'react';

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

export default function TeacherForm({ onTeacherAdded }: TeacherFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    bcsBatch: '',
    idNumber: '',
    nidNumber: '',
    eTin: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/teachers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Teacher registered successfully!');
        onTeacherAdded(data);
        setFormData({
          name: '',
          department: '',
          bcsBatch: '',
          idNumber: '',
          nidNumber: '',
          eTin: '',
        });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter teacher's full name"
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              id="department"
              name="department"
              required
              value={formData.department}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="bcsBatch" className="block text-sm font-medium text-gray-700 mb-2">
              BCS Batch *
            </label>
            <input
              type="text"
              id="bcsBatch"
              name="bcsBatch"
              required
              value={formData.bcsBatch}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., 35th BCS"
            />
          </div>

          <div>
            <label htmlFor="idNumber" className="block text-sm font-medium text-gray-700 mb-2">
              ID Number *
            </label>
            <input
              type="text"
              id="idNumber"
              name="idNumber"
              required
              value={formData.idNumber}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter ID number"
            />
          </div>

          <div>
            <label htmlFor="nidNumber" className="block text-sm font-medium text-gray-700 mb-2">
              NID Number *
            </label>
            <input
              type="text"
              id="nidNumber"
              name="nidNumber"
              required
              value={formData.nidNumber}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter NID number"
            />
          </div>

          <div>
            <label htmlFor="eTin" className="block text-sm font-medium text-gray-700 mb-2">
              E-TIN *
            </label>
            <input
              type="text"
              id="eTin"
              name="eTin"
              required
              value={formData.eTin}
              onChange={handleChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter E-TIN number"
            />
          </div>
        </div>

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

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading ? 'Registering...' : 'Register Teacher'}
          </button>
        </div>
      </form>
    </div>
  );
}