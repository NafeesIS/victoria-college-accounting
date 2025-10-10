"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { employeeCategories } from "@/contants";
// import { employeeCategories } from "@/constants/employeeCategories";

interface EnhancedSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function EnhancedSidebar({
  activeSection,
  setActiveSection,
  userName,
  isOpen,
  onClose,
}: EnhancedSidebarProps) {
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }));
  };

  const handleMenuItemClick = (section: string) => {
    setActiveSection(section);
    onClose();
  };

  const menuItems = [
    {
      id: "employee-registration",
      label: "Employee Registration",
      icon: "👤",
      hasSubmenu: true,
      submenu: Object.entries(employeeCategories).map(([key, config]) => ({
        id: `register-${key}`,
        label: config.label,
        icon: "📝",
      })),
    },
    {
      id: "employee-list",
      label: "Employee List",
      icon: "📋",
      hasSubmenu: true,
      submenu: Object.entries(employeeCategories).map(([key, config]) => ({
        id: `list-${key}`,
        label: config.label,
        icon: "📊",
      })),
    },
    { id: "exam-register", label: "Register Exam", icon: "📝", hasSubmenu: false },
    { id: "exam-list", label: "Exams List", icon: "📊", hasSubmenu: false },
  ];

  return (
    <div
    className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-indigo-900 text-white flex flex-col transform transition-transform duration-300 
      ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
    >
      {/* Header */}
      <div className="p-6 flex justify-between items-center border-b border-indigo-800">
        <div>
          <h2 className="text-xl font-bold">Victoria College</h2>
          <p className="text-indigo-200 text-sm mt-1">Accounting Department</p>
        </div>
        <button
          className="lg:hidden text-white hover:text-gray-300"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              {item.hasSubmenu ? (
                <div>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`w-full px-4 py-3 rounded-lg flex items-center justify-between transition-colors ${
                      expandedMenus[item.id]
                        ? "bg-indigo-800 text-white"
                        : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {expandedMenus[item.id] ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>

                  {/* Submenu */}
                  {expandedMenus[item.id] && (
                    <ul className="mt-2 ml-4 space-y-1">
                      {item.submenu?.map((subItem) => (
                        <li key={subItem.id}>
                          <button
                            onClick={() => handleMenuItemClick(subItem.id)}
                            className={`w-full px-4 py-2 rounded-lg flex items-center space-x-3 text-sm transition-colors ${
                              activeSection === subItem.id
                                ? "bg-indigo-700 text-white"
                                : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
                            }`}
                          >
                            <span>{subItem.icon}</span>
                            <span>{subItem.label}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`w-full px-4 py-3 rounded-lg flex items-center space-x-3 transition-colors ${
                    activeSection === item.id
                      ? "bg-indigo-800 text-white"
                      : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              )}
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