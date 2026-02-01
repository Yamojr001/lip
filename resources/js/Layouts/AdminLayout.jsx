import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import { useLanguage } from "@/contexts/LanguageContext";
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
  ChevronDown,
  ChevronRight,
  Stethoscope,
  Heart,
  Baby,
} from "lucide-react";
import LanguageSwitcher from "@/Components/LanguageSwitcher";

export default function AdminLayout({ children, title = "Dashboard" }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statsExpanded, setStatsExpanded] = useState(false);
  const { url } = usePage();
  const { t } = useLanguage();

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

  const SubNavItem = ({ href, label }) => (
    <Link
      href={href}
      className={`flex items-center gap-2 p-2 pl-8 rounded-lg transition text-sm ${
        url === href
          ? "bg-purple-100 text-purple-700 font-medium"
          : "text-gray-600 hover:bg-gray-50"
      }`}
    >
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

        <nav className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-150px)]">
          <NavItem href="/admin/dashboard" icon={LayoutDashboard} label={t('nav.dashboard')} />
          
          <div className="space-y-1">
            <button
              onClick={() => setStatsExpanded(!statsExpanded)}
              className="flex items-center justify-between w-full p-2 rounded-xl transition text-gray-700 hover:bg-gray-100"
            >
              <div className="flex items-center gap-2">
                <BarChart3 size={18} />
                <span>{t('nav.statistics')}</span>
              </div>
              {statsExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            {statsExpanded && (
              <div className="ml-2 space-y-1 border-l-2 border-purple-200">
                <SubNavItem href="/admin/statistics" label="Overview" />
                <SubNavItem href="/admin/statistics/anc" label="ANC Statistics" />
                <SubNavItem href="/admin/statistics/pnc" label="PNC Statistics" />
                <SubNavItem href="/admin/statistics/family-planning" label="Family Planning" />
                <SubNavItem href="/admin/statistics/nutrition" label="Nutrition" />
                <SubNavItem href="/admin/statistics/immunization" label="Immunization" />
              </div>
            )}
          </div>

          <NavItem href="/admin/nutrition-reports" icon={Apple} label={t('nav.nutritionReports')} />
          <NavItem href="/admin/vaccine-reports" icon={Syringe} label={t('nav.vaccineReports')} />
          <NavItem href="/admin/manage-locations" icon={MapPin} label={t('nav.manageLocations')} />
          <NavItem href="/admin/manage-facilities" icon={Hospital} label={t('nav.manageFacilities')} />
          <NavItem href="/admin/records" icon={FileText} label={t('nav.records')} />
          <NavItem href={route('phc.create-patient')} icon={UserPlus} label={t('nav.registerPatient')} />
          <NavItem href={route('phc.children.create')} icon={Baby} label={t('nav.registerChildren') || 'Register Child'} />
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
