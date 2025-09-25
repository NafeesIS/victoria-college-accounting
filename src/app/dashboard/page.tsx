/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TeacherForm from "@/components/TeacherForm";
import TeacherTable from "@/components/TeacherTable";
import ExamForm from "@/components/ExamForm";
import ExamTable from "@/components/ExamTable";
import Sidebar from "@/components/sidebar";
import { Teacher } from "@/types/types";
import { Menu } from "lucide-react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Teacher state
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherFilters, setTeacherFilters] = useState({
    search: "",
    department: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

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
  const [activeSection, setActiveSection] = useState("teacher-register");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch data when logged in
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (activeSection.startsWith("teacher")) {
      fetchTeachers();
    } else {
      fetchExams();
    }
  }, [session, status, teacherFilters, examFilters, activeSection]);

  // Fetch Teachers
  const fetchTeachers = async () => {
    try {
      const params = new URLSearchParams(teacherFilters);
      const response = await fetch(`/api/teachers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Exams
  const fetchExams = async () => {
    try {
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

  // Handlers
  const handleTeacherAdded = (newTeacher: Teacher) => {
    setTeachers((prev) => [newTeacher, ...prev]);
  };

  const handleExamAdded = (newExam: any) => {
    setExams((prev) => [newExam, ...prev]);
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
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
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
              {activeSection === "teacher-register" && "Register Teacher"}
              {activeSection === "teacher-list" && "Teachers List"}
              {activeSection === "exam-register" && "Register Exam"}
              {activeSection === "exam-list" && "Exams List"}
            </h1>
            <p className="text-sm text-gray-600">
              Victoria College - Accounting Department
            </p>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {activeSection === "register" && (
            <div>
              <TeacherForm onTeacherAdded={handleTeacherAdded} />
            </div>
          )}
          {activeSection === "list" && (
            <TeacherTable
              teachers={teachers}
              isLoading={isLoading}
              filters={teacherFilters}
              onFilterChange={setTeacherFilters}
            />
          )}
          {activeSection === "exam-register" && (
            <div>
              <ExamForm onExamAdded={handleExamAdded} />
            </div>
          )}
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
