"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TeacherForm from "@/components/TeacherForm";
import TeacherTable from "@/components/TeacherTable";
import Sidebar from "@/components/sidebar";
import { Teacher } from "@/types/types";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("register");
  const [filters, setFilters] = useState({
    search: "",
    department: "all",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchTeachers();
  }, [session, status, router, filters]);

  const fetchTeachers = async () => {
    try {
      const params = new URLSearchParams(filters);
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

  const handleTeacherAdded = (newTeacher: Teacher) => {
    setTeachers((prev) => [newTeacher, ...prev]);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userName={session.user?.name || ""}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              {activeSection === "register"
                ? "Register Teacher"
                : "Teachers List"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Victoria College - Accounting Department
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {activeSection === "register" && (
            <div className="max-w-2xl">
              <TeacherForm onTeacherAdded={handleTeacherAdded} />
            </div>
          )}

          {activeSection === "list" && (
            <TeacherTable
              teachers={teachers}
              isLoading={isLoading}
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          )}
        </main>
      </div>
    </div>
  );
}
