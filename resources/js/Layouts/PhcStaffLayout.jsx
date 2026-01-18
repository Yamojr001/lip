import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import {
  LayoutDashboard,
  ClipboardList,
  UserPlus,
  BarChart3,
  LogOut,
  Menu,
  X,
  FileText,
  Search,
  Apple,
  Package,
  Baby,
} from "lucide-react";

export default function PhcStaffLayout({ children, title = "PHC Dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { url, props } = usePage();
  const { auth } = props;

  const NavItem = ({ href, icon: Icon, label, method = "get" }) => (
    <Link
      href={href}
      method={method}
      as={method === "post" ? "button" : "a"}
      className={`flex items-center gap-2 p-2 rounded-xl transition w-full text-left
        ${url.startsWith(href)
          ? "bg-purple-600 text-white"
          : "text-purple-100 hover:bg-purple-600/50"
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-purple-700 text-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="p-4 flex items-center justify-between border-b border-purple-500">
          <h2 className="text-xl font-bold">Lafiyar Iyali</h2>
          <button
            className="md:hidden text-purple-200 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4 border-b border-purple-500">
            <p className="text-sm font-semibold">Welcome,</p>
            <p className="text-lg font-bold">{auth?.user?.name || "Staff"}</p>
            <p className="text-xs text-purple-200">{auth?.user?.phc?.clinic_name || 'PHC Staff Panel'}</p>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <NavItem href={route('phc.dashboard')} icon={LayoutDashboard} label="Dashboard" />
          <NavItem href={route('phc.search')} icon={Search} label="Find Patient" />
          <NavItem href={route('phc.create-patient')} icon={UserPlus} label="Register Patient" />
          <NavItem href={route('phc.children.index')} icon={Baby} label="Children" />
          <NavItem href={route('phc.records')} icon={FileText} label="My Records" />
          <NavItem href={route('phc.all-patients')} icon={ClipboardList} label="All Patients" />
          
          {/* New Vaccine Accountability Menu Item */}
          <NavItem href={route('phc.vaccine-accountability')} icon={Package} label="Vaccine Accountability" />
          
          {/* New Nutrition Reports Menu Item */}
          <NavItem href={route('phc.nutrition.reports.index')} icon={Apple} label="Nutrition Reports" />
          
          {/* Optional: View all vaccine reports */}
          <NavItem href={route('phc.vaccine-reports.index')} icon={ClipboardList} label="Vaccine Reports" />
        </nav>

        <div className="p-4 border-t border-purple-500 mt-auto">
          <NavItem
            href={route('logout')}
            icon={LogOut}
            label="Logout"
            method="post"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 overflow-y-auto">
        {/* Top Bar */}
        <header className="flex items-center justify-between p-4 bg-white shadow-md sticky top-0 z-30">
          <button
            className="md:hidden text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
          <div className="text-sm text-gray-600 hidden sm:block">
            {auth?.user?.phc?.clinic_name || 'PHC Staff'}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}