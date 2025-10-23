/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ExamForm from "@/components/ExamForm";
import ExamTable from "@/components/ExamTable";
import EnhancedSidebar from "@/components/EnhancedSidebar";
import DynamicEmployeeForm from "@/components/DynamicEmployeeForm";
import DynamicEmployeeTable from "@/components/DynamicEmployeeTable";
import DashboardHome from "@/components/DashboardHome";
import { Menu } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Employee state
  const [employees, setEmployees] = useState<any[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  // Exam state
  const [exams, setExams] = useState<any[]>([]);
  const [pagination, setPagination] = useState();
  const [examFilters, setExamFilters] = useState({
    search: "",
    year: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Common
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Extract category from section (e.g., "register-governmentTeacher" -> "governmentTeacher")
  const getCurrentCategory = () => {
    if (activeSection.startsWith("register-")) {
      return activeSection.replace("register-", "");
    }
    if (activeSection.startsWith("list-")) {
      return activeSection.replace("list-", "");
    }
    return null;
  };

  const currentCategory = getCurrentCategory();

  // Fetch data when section changes
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (activeSection.startsWith("list-")) {
      fetchEmployees();
    } else if (activeSection === "exam-list") {
      fetchExams();
    } else {
      setIsLoading(false);
    }
  }, [session, status, activeSection, examFilters]);

  // Fetch Employees
  const fetchEmployees = async () => {
    const category = currentCategory;
    if (!category) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/employees/${category}`);
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Exams
  const fetchExams = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams(examFilters);
      const response = await fetch(`/api/exams?${params}`);
      if (response.ok) {
        const data = await response.json();
        setExams(data.exams);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Employee Handlers
  const handleEmployeeAdded = (newEmployee: any) => {
    setEmployees((prev) => [newEmployee, ...prev]);
    // Optionally switch to list view
    const category = currentCategory;
    if (category) {
      setActiveSection(`list-${category}`);
    }
  };

  const handleEmployeeUpdated = (updatedEmployee: any) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp._id === updatedEmployee._id ? updatedEmployee : emp))
    );
    setEditingEmployee(null);
    // Switch to list view
    const category = currentCategory;
    if (category) {
      setActiveSection(`list-${category}`);
    }
  };

  const handleEmployeeEdit = (employee: any) => {
    setEditingEmployee(employee);
    const category = currentCategory;
    if (category) {
      setActiveSection(`register-${category}`);
    }
  };

  const handleEmployeeDelete = async (employeeId: string) => {
    const category = currentCategory;
    if (!category) return;

    try {
      const response = await fetch(`/api/employees/${category}/${employeeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setEmployees((prev) => prev.filter((emp) => emp._id !== employeeId));
        alert("Employee deleted successfully");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete employee");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      alert("Failed to delete employee");
    }
  };

  const handleCancelEdit = () => {
    setEditingEmployee(null);
  };

  // Exam Handlers
  const handleExamAdded = (newExam: any) => {
    setExams((prev) => [newExam, ...prev]);
  };

  // Get page title
  const getPageTitle = () => {
    if (activeSection === "home") return "Dashboard Home";
    if (activeSection === "exam-register") return "Register Exam";
    if (activeSection === "exam-list") return "Exams List";
    if (activeSection.startsWith("register-")) {
      const category = currentCategory;
      if (category) {
        return editingEmployee ? "Edit Employee" : "Register Employee";
      }
    }
    if (activeSection.startsWith("list-")) {
      return "Employee List";
    }
    return "Dashboard";
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <EnhancedSidebar
        activeSection={activeSection}
        setActiveSection={(section) => {
          setActiveSection(section);
          setEditingEmployee(null); // Clear editing state when changing sections
        }}
        userName={session.user?.name || ""}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex items-center justify-start px-6 py-4 gap-4">
          <button
            className="lg:hidden text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-gray-600">
              Victoria College - Accounting Department
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Dashboard Home */}
          {activeSection === "home" && (
            <DashboardHome userName={session.user?.name || ""} />
          )}

          {/* Employee Registration Forms */}
          {activeSection.startsWith("register-") && currentCategory && (
            <DynamicEmployeeForm
              category={currentCategory}
              onEmployeeAdded={handleEmployeeAdded}
              onEmployeeUpdated={handleEmployeeUpdated}
              initialData={editingEmployee}
              isEditing={!!editingEmployee}
              onCancel={handleCancelEdit}
            />
          )}

          {/* Employee List Tables */}
          {activeSection.startsWith("list-") && currentCategory && (
            <DynamicEmployeeTable
              category={currentCategory}
              employees={employees}
              isLoading={isLoading}
              onEdit={handleEmployeeEdit}
              onDelete={handleEmployeeDelete}
              onRefresh={fetchEmployees}
            />
          )}

          {/* Exam Register */}
          {activeSection === "exam-register" && (
            <div>
              <ExamForm onExamAdded={handleExamAdded} />
            </div>
          )}

          {/* Exam List */}
          {activeSection === "exam-list" && (
            <ExamTable
              exams={exams}
              isLoading={isLoading}
              filters={examFilters}
              onFilterChange={setExamFilters}
              onEdit={(exam) => console.log("Edit exam:", exam)}
              onDelete={(id) => console.log("Delete exam:", id)}
              pagination={pagination}
            />
          )}
        </main>
      </div>
    </div>
  );
}