/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar,
  BookOpen,
  Award,
  Building2,
  Clock
} from "lucide-react";

interface DashboardHomeProps {
  userName: string;
}

export default function DashboardHome({ userName }: DashboardHomeProps) {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalExams: 0,
    recentRegistrations: 0,
    totalIncome: 0,
  });
  const [greeting, setGreeting] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Fetch dashboard stats
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all employee categories
      const categories = [
        "administration",
        "governmentTeacher",
        "guestTeacher",
        "librarian",
        "physicalEducationTeacher",
        "government3rdClass",
        "government4thClass",
        "nonGovernment3rdClass",
        "nonGovernment4thClass",
        "nonGovernmentDepartmentalClerk",
      ];

      let totalEmployees = 0;
      let recentCount = 0;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      for (const category of categories) {
        const response = await fetch(`/api/employees/${category}`);
        if (response.ok) {
          const data = await response.json();
          totalEmployees += data.length;
          
          // Count recent registrations (last 30 days)
          const recent = data.filter((emp: any) => 
            new Date(emp.createdAt) > thirtyDaysAgo
          );
          recentCount += recent.length;
        }
      }

      // Fetch exams data
      const examsResponse = await fetch("/api/exams?limit=1000");
      let totalExams = 0;
      let totalIncome = 0;

      if (examsResponse.ok) {
        const examsData = await examsResponse.json();
        totalExams = examsData.exams.length;
        totalIncome = examsData.exams.reduce(
          (sum: number, exam: any) => sum + (exam.incomeAmount || 0),
          0
        );
      }

      setStats({
        totalEmployees,
        totalExams,
        recentRegistrations: recentCount,
        totalIncome,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Register Employee",
      description: "Add new employee to the system",
      icon: Users,
      color: "bg-blue-500",
      action: "register-governmentTeacher",
    },
    {
      title: "Register Exam",
      description: "Create new exam entry",
      icon: FileText,
      color: "bg-green-500",
      action: "exam-register",
    },
    {
      title: "View Employees",
      description: "Browse all registered employees",
      icon: BookOpen,
      color: "bg-purple-500",
      action: "list-governmentTeacher",
    },
    {
      title: "View Exams",
      description: "Browse exam records",
      icon: Award,
      color: "bg-orange-500",
      action: "exam-list",
    },
  ];

  const statCards = [
    {
      title: "Total Employees",
      value: stats.totalEmployees,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      trend: "+12% from last month",
    },
    {
      title: "Total Exams",
      value: stats.totalExams,
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50",
      trend: "Across all categories",
    },
    {
      title: "Recent Registrations",
      value: stats.recentRegistrations,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      trend: "Last 30 days",
    },
    {
      title: "Total Income",
      value: `৳${stats.totalIncome.toLocaleString()}`,
      icon: Award,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      trend: "From all exams",
    },
  ];

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-500 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {greeting}, {userName}! 👋
            </h1>
            <p className="text-indigo-100 text-lg">
              Welcome to Victoria College Accounting Department
            </p>
            <div className="flex items-center gap-2 mt-3 text-indigo-100">
              <Calendar size={18} />
              <span>{formatDate()}</span>
            </div>
          </div>
          <div className="hidden md:block">
            <Building2 size={80} className="text-white opacity-20" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow p-6 animate-pulse"
            >
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))
        ) : (
          statCards.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`${stat.color}`} size={24} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">
                {stat.title}
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {stat.value}
              </p>
              <p className="text-sm text-gray-500">{stat.trend}</p>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              className="flex flex-col items-center p-6 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-center group"
            >
              <div
                className={`${action.color} p-4 rounded-full mb-4 group-hover:scale-110 transition-transform`}
              >
                <action.icon className="text-white" size={28} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            System Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded">
                <Clock className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Active Session</p>
                <p className="text-sm text-gray-600">
                  You are logged in as {userName}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-50 rounded">
                <Users className="text-green-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Employee Database</p>
                <p className="text-sm text-gray-600">
                  {stats.totalEmployees} employees registered across 10
                  categories
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-50 rounded">
                <FileText className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Exam Records</p>
                <p className="text-sm text-gray-600">
                  {stats.totalExams} exam entries tracked
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            About Victoria College
          </h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Victoria College</strong> is one of the premier
              educational institutions dedicated to academic excellence and
              holistic development.
            </p>
            <p className="text-sm">
              This accounting management system helps streamline employee
              registration, exam management, and financial record-keeping for
              the college administration.
            </p>
            <div className="pt-4 border-t border-indigo-200 mt-4">
              <p className="text-sm text-gray-600">
                <strong>Features:</strong>
              </p>
              <ul className="text-sm text-gray-600 list-disc list-inside mt-2 space-y-1">
                <li>Employee registration across 10 categories</li>
                <li>Exam fee calculation & distribution</li>
                <li>Comprehensive reporting system</li>
                <li>Secure data management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}