"use client";

import { SidebarProps } from "@/types/types";
import { signOut } from "next-auth/react";
import { X } from "lucide-react";

interface ResponsiveSidebarProps extends SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({
  activeSection,
  setActiveSection,
  userName,
  isOpen,
  onClose,
}: ResponsiveSidebarProps) {
  const menuItems = [
    { id: "register", label: "Register Teacher", icon: "👤" },
    { id: "list", label: "Teachers List", icon: "📋" },
    { id: "exam-register", label: "Register Exam", icon: "📝" },
    { id: "exam-list", label: "Exams List", icon: "📊" },
  ];

  return (
    <div
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-indigo-900 text-white flex flex-col transform transition-transform duration-300 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      {/* Header */}
      <div className="p-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Victoria College</h2>
          <p className="text-indigo-200 text-sm mt-1">Accounting Department</p>
        </div>
        {/* Close button (mobile only) */}
        <button
          className="lg:hidden text-white hover:text-gray-300"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  setActiveSection(item.id);
                  onClose(); // auto-close on mobile
                }}
                className={`w-full px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                  activeSection === item.id
                    ? "bg-indigo-800 text-white"
                    : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-indigo-800">
        <div className="mb-4">
          <p className="text-sm text-indigo-200">Signed in as</p>
          <p className="font-medium truncate">{userName}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-sm font-medium transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
