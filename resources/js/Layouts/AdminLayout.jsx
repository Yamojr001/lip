import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
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
  Syringe,
} from "lucide-react";
import LanguageSwitcher from "@/Components/LanguageSwitcher";

export default function AdminLayout({ children, title = "Dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { url } = usePage();
  const { t } = useTranslation();

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
          <NavItem href="/admin/dashboard" icon={LayoutDashboard} label={t('nav.dashboard')} />
          <NavItem href="/admin/statistics" icon={Database} label={t('nav.statistics')} />
          <NavItem href="/admin/nutrition-reports" icon={Apple} label={t('nav.nutritionReports')} />
          <NavItem href="/admin/nutrition-statistics" icon={BarChart3} label={t('nav.nutritionStatistics')} />
          <NavItem href="/admin/vaccine-reports" icon={Syringe} label={t('nav.vaccineReports')} />
          <NavItem href="/admin/vaccine-statistics" icon={BarChart3} label={t('nav.vaccineStatistics')} />
          <NavItem href="/admin/manage-locations" icon={MapPin} label={t('nav.manageLocations')} />
          <NavItem href="/admin/manage-facilities" icon={Hospital} label={t('nav.manageFacilities')} />
          <NavItem href="/admin/records" icon={FileText} label={t('nav.records')} />
        </nav>

        <div className="p-4 border-t mt-auto">
          <Link
            href="/logout"
            method="post"
            as="button"
            className="flex items-center gap-2 text-red-500 hover:text-red-600"
          >
            <LogOut size={18} />
            <span>{t('common.logout')}</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:ml-64 overflow-y-auto">
        <header className="flex items-center justify-between p-4 bg-white shadow-md sticky top-0 z-30">
          <button
            className="md:hidden text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
          <LanguageSwitcher />
        </header>

        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}
