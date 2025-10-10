/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { employeeCategories } from "@/contants";
import { useState, useEffect } from "react";

interface DynamicEmployeeFormProps {
  category: string;
  onEmployeeAdded?: (employee: any) => void;
  onEmployeeUpdated?: (employee: any) => void;
  initialData?: any;
  isEditing?: boolean;
  onCancel?: () => void;
}

export default function DynamicEmployeeForm({
  category,
  onEmployeeAdded,
  onEmployeeUpdated,
  initialData,
  isEditing = false,
  onCancel,
}: DynamicEmployeeFormProps) {
  const categoryConfig = employeeCategories[category];

  const initialFormData: Record<string, string> = {};
  categoryConfig?.fields.forEach((field) => {
    initialFormData[field.name] = "";
  });

  const [formData, setFormData] =
    useState<Record<string, string>>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load initial data for editing
  useEffect(() => {
    if (isEditing && initialData) {
      const updatedData: Record<string, string> = {};
      categoryConfig?.fields.forEach((field) => {
        updatedData[field.name] = initialData[field.name] || "";
      });
      setFormData(updatedData);
    }
  }, [isEditing, initialData, categoryConfig]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const url =
        isEditing && initialData?._id
          ? `/api/employees/${category}/${initialData._id}`
          : `/api/employees/${category}`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, category }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          isEditing
            ? "Employee updated successfully!"
            : "Employee registered successfully!"
        );

        if (isEditing) {
          onEmployeeUpdated?.(data);
        } else {
          onEmployeeAdded?.(data);
          setFormData(initialFormData);
        }

        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!categoryConfig) {
    return <div className="text-red-600">Invalid category</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {isEditing
          ? `Edit ${categoryConfig.label}`
          : `Register ${categoryConfig.label}`}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categoryConfig.fields.map((field) => (
            <div key={field.name}>
              <label
                htmlFor={field.name}
                className="block text-sm font-medium text-gray-900 mb-2"
              >
                {field.label} {field.required && "*"}
              </label>

              {field.type === "select" && field.options ? (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                >
                  <option value="">Select {field.label}</option>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                />
              )}
            </div>
          ))}
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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isLoading
              ? "Saving..."
              : isEditing
              ? "Update Employee"
              : "Register Employee"}
          </button>

          {isEditing && onCancel && (
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
