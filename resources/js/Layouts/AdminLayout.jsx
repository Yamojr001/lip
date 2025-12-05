import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
  LayoutDashboard,
  BarChart3,
  Database,
  MapPin,
  Hospital,
  LogOut,
  Menu,
  X,
  FileText,
  Apple,
} from "lucide-react";

export default function AdminLayout({ children, title = "Dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { url } = usePage();

  const NavItem = ({ href, icon: Icon, label }) => (
    <Link
      href={href}
      className={`flex items-center gap-2 p-2 rounded-xl transition ${
        url === href
          ? "bg-purple-600 text-white"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-4 flex items-center justify-between border-b">
          <h2 className="text-xl font-bold text-purple-600">Lafiyar Iyali</h2>
          <button
            className="md:hidden text-gray-600"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <NavItem href="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem href="/admin/statistics" icon={Database} label="Statistics" />
          
          {/* New Nutrition Reports Menu Item */}
          <NavItem href="/admin/nutrition-reports" icon={Apple} label="Nutrition Reports" />
          <NavItem href="/admin/nutrition-statistics" icon={BarChart3} label="Nutrition Statistics" />
          
          <NavItem href="/admin/manage-locations" icon={MapPin} label="Manage Locations" />
          <NavItem href="/admin/manage-facilities" icon={Hospital} label="Manage Facilities" />
          <NavItem href="/admin/records" icon={FileText} label="Records" />
        </nav>

        <div className="p-4 border-t mt-auto">
          <Link
            href="/logout"
            method="post"
            as="button"
            className="flex items-center gap-2 text-red-500 hover:text-red-600"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 overflow-y-auto">
        {/* Top Bar */}
        <header className="flex items-center justify-between p-4 bg-white shadow-md">
          <button
            className="md:hidden text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
        </header>

        {/* Page Content */}
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}