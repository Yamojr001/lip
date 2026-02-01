import React, { useState, useEffect } from "react";
import { useForm, usePage, Link, router } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import {
  Search, Edit, Trash2, RefreshCw, Users, Baby, Heart, Calendar,
  TrendingUp, Activity, Stethoscope, Shield, Clock, AlertCircle,
  CheckCircle, XCircle, ArrowUp, ArrowDown, Home, Hospital, UserPlus
} from "lucide-react";
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, BarElement, Tooltip, Legend, Title, Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  ArcElement, BarElement, Tooltip, Legend, Title, Filler
);

const StatCard = ({ title, value, unit, color, icon: Icon, trend, description }) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg border-l-4 ${color} hover:shadow-xl transition-all duration-300`}>
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}{unit}</p>
        {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
      </div>
      <div className="flex flex-col items-end">
        <div className={`p-3 rounded-full ${color.replace('border', 'bg').replace('-600', '-100')}`}>
          <Icon className={`h-6 w-6 ${color.replace('border', 'text').replace('-600', '-600')}`} />
        </div>
      </div>
    </div>
  </div>
);

const AlertCard = ({ type, title, message, count, icon: Icon }) => {
  const colors = {
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };
  return (
    <div className={`p-4 rounded-lg border ${colors[type]} flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5" />
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm opacity-80">{message}</p>
        </div>
      </div>
      {count > 0 && <span className="bg-white px-2 py-1 rounded-full text-sm font-bold">{count}</span>}
    </div>
  );
};

const AncProgressBar = ({ patient }) => {
  const ancVisits = [1, 2, 3, 4, 5, 6, 7, 8].map(i => 
    patient[`anc_visit_${i}_date`] ? i : null
  ).filter(Boolean);
  const progress = (ancVisits.length / 8) * 100;
  return (
    <div className="flex items-center space-x-2">
      <div className="w-20 bg-gray-200 rounded-full h-2">
        <div className="bg-green-600 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
      </div>
      <span className="text-xs text-gray-500">{ancVisits.length}/8</span>
    </div>
  );
};

export default function PhcDashboard() {
  const { patients = { data: [] }, auth, phcStats = null } = usePage().props;
  const results = patients?.data || [];
  const { 
    totalPatients = 0, 
    delivered = 0, 
    facilityDeliveries = 0, 
    liveBirths = 0, 
    stillbirths = 0,
    facilityDeliveryRate = 0, 
    monthlyRegistrations = {}, 
    activePregnancies = 0, 
    ancVisitsBreakdown = {}, 
    pregnancyTracking = {},
    pncVisitCompletion = {},
    pncIncomplete = 0,
    fpUptakeRate = 0,
    totalFpUsers = 0,
    fpMethodsUsage = {},
    deliveryOutcomes = {},
    deliveryTypeDistribution = {},
    immunizationCoverageDetails = {},
    hivTestOutcomes = {},
    ancServiceCounts = {}
  } = phcStats || {};

  const monthlyRegChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [{
      label: 'Registrations',
      data: Object.values(monthlyRegistrations).length ? Object.values(monthlyRegistrations) : Array(12).fill(0),
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99, 102, 241, 0.2)',
      tension: 0.3,
      fill: true,
    }],
  };

  const anc18CompletionData = {
    labels: ['ANC1', 'ANC2', 'ANC3', 'ANC4', 'ANC5', 'ANC6', 'ANC7', 'ANC8'],
    datasets: [{
      label: 'Patients',
      data: [ancVisitsBreakdown.anc1 || 0, ancVisitsBreakdown.anc2 || 0, ancVisitsBreakdown.anc3 || 0, ancVisitsBreakdown.anc4 || 0, ancVisitsBreakdown.anc5 || 0, ancVisitsBreakdown.anc6 || 0, ancVisitsBreakdown.anc7 || 0, ancVisitsBreakdown.anc8 || 0],
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
    }],
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false };

  const criticalAlerts = [
    { type: 'danger', title: 'Overdue Deliveries', message: 'Patients past due date', count: pregnancyTracking?.overdue || 0, icon: AlertCircle },
    { type: 'warning', title: 'Due This Month', message: 'Upcoming deliveries', count: pregnancyTracking?.dueThisMonth || 0, icon: Calendar },
  ];

  return (
    <PhcStaffLayout title="Clinic Dashboard">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clinic Overview</h1>
            <p className="mt-2 text-sm text-gray-600">Health indicators and patient management</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link href={route('phc.search')} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
              <Search className="-ml-1 mr-2 h-5 w-5" /> Find Patient
            </Link>
            <Link href={route('phc.create-patient')} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              <UserPlus className="-ml-1 mr-2 h-5 w-5" /> Register Patient
            </Link>
            <Link href={route('phc.children.create')} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700">
              <Plus className="-ml-1 mr-2 h-5 w-5" /> Register Child
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Total Patients" value={totalPatients} color="border-purple-600" icon={Users} description="Registered records" />
          <StatCard title="Active Pregnancies" value={activePregnancies} color="border-pink-600" icon={Baby} description="Patients in ANC" />
          <StatCard title="Facility Deliveries" value={facilityDeliveries} color="border-green-600" icon={Hospital} description={`${facilityDeliveryRate}% rate`} />
          <StatCard title="Live Births" value={liveBirths} color="border-blue-600" icon={Heart} description="Successful outcomes" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Registration Trends</h3>
            <div className="h-72"><Line data={monthlyRegChartData} options={chartOptions} /></div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Critical Alerts</h3>
            <div className="space-y-4">
              {criticalAlerts.map((alert, index) => alert.count > 0 && <AlertCard key={index} {...alert} />)}
              {criticalAlerts.every(a => a.count === 0) && <div className="text-center py-8 text-gray-500"><p>No critical alerts</p></div>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">ANC Visit Completion</h3>
          <div className="h-80"><Bar data={anc18CompletionData} options={chartOptions} /></div>
        </div>

        {/* Additional Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <StatCard title="Total Deliveries" value={delivered} color="border-indigo-600" icon={Baby} description="All recorded" />
          <StatCard title="Stillbirths" value={stillbirths} color="border-red-600" icon={AlertCircle} description="Adverse outcomes" />
          <StatCard title="FP Users" value={totalFpUsers} color="border-teal-600" icon={Shield} description={`${fpUptakeRate}% uptake`} />
          <StatCard title="PNC Incomplete" value={pncIncomplete} color="border-orange-600" icon={Clock} description="Need follow-up" />
        </div>

        {/* PNC & Immunization Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* PNC Completion */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">PNC Visit Completion</h3>
            <div className="space-y-4">
              {[
                { label: 'PNC Visit 1', count: pncVisitCompletion.pnc1_received || 0, rate: pncVisitCompletion.pnc1_rate || 0, color: 'bg-pink-500' },
                { label: 'PNC Visit 2', count: pncVisitCompletion.pnc2_received || 0, rate: pncVisitCompletion.pnc2_rate || 0, color: 'bg-pink-400' },
                { label: 'PNC Visit 3', count: pncVisitCompletion.pnc3_received || 0, rate: pncVisitCompletion.pnc3_rate || 0, color: 'bg-pink-300' },
              ].map((pnc, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{pnc.label}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2.5">
                      <div className={`${pnc.color} h-2.5 rounded-full`} style={{ width: `${Math.min(pnc.rate, 100)}%` }}></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 w-16 text-right">{pnc.count} ({pnc.rate}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Family Planning Methods */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Family Planning Methods</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Injectable', key: 'injectable', color: 'bg-blue-100 text-blue-700' },
                { label: 'Implant', key: 'implant', color: 'bg-green-100 text-green-700' },
                { label: 'IUD', key: 'iud', color: 'bg-purple-100 text-purple-700' },
                { label: 'Pill', key: 'pill', color: 'bg-pink-100 text-pink-700' },
                { label: 'Male Condom', key: 'male_condom', color: 'bg-cyan-100 text-cyan-700' },
                { label: 'Female Condom', key: 'female_condom', color: 'bg-teal-100 text-teal-700' },
              ].map((method) => (
                <div key={method.key} className={`p-3 rounded-lg ${method.color}`}>
                  <p className="text-sm font-medium">{method.label}</p>
                  <p className="text-xl font-bold">{fpMethodsUsage[method.key] || 0}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ANC Services & HIV Testing */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* ANC Services */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">ANC Services Provided</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Urinalysis', count: ancServiceCounts.urinalysis || 0, color: 'bg-blue-50 text-blue-700' },
                { label: 'Iron Folate', count: ancServiceCounts.iron_folate || 0, color: 'bg-green-50 text-green-700' },
                { label: 'MMS', count: ancServiceCounts.mms || 0, color: 'bg-yellow-50 text-yellow-700' },
                { label: 'SP', count: ancServiceCounts.sp || 0, color: 'bg-purple-50 text-purple-700' },
                { label: 'SBA', count: ancServiceCounts.sba || 0, color: 'bg-pink-50 text-pink-700' },
              ].map((svc, idx) => (
                <div key={idx} className={`p-3 rounded-lg text-center ${svc.color}`}>
                  <p className="text-sm">{svc.label}</p>
                  <p className="text-2xl font-bold">{svc.count}</p>
                </div>
              ))}
            </div>
          </div>

          {/* HIV Testing */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">HIV Test Outcomes</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{hivTestOutcomes.Positive || 0}</p>
                <p className="text-sm text-red-700">Positive</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{hivTestOutcomes.Negative || 0}</p>
                <p className="text-sm text-green-700">Negative</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-600">{hivTestOutcomes.NotTested || 0}</p>
                <p className="text-sm text-gray-700">Not Tested</p>
              </div>
            </div>
          </div>
        </div>

        {/* Immunization Coverage */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Immunization Coverage</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: 'BCG', key: 'bcg', color: 'bg-blue-100 text-blue-700' },
              { label: 'OPV 0', key: 'opv0', color: 'bg-green-100 text-green-700' },
              { label: 'Penta 1', key: 'penta1', color: 'bg-purple-100 text-purple-700' },
              { label: 'Penta 3', key: 'penta3', color: 'bg-pink-100 text-pink-700' },
              { label: 'Measles', key: 'measles', color: 'bg-yellow-100 text-yellow-700' },
              { label: 'MCV 2', key: 'mcv2', color: 'bg-orange-100 text-orange-700' },
            ].map((vaccine) => (
              <div key={vaccine.key} className={`p-3 rounded-lg text-center ${vaccine.color}`}>
                <p className="text-sm font-medium">{vaccine.label}</p>
                <p className="text-2xl font-bold">{immunizationCoverageDetails[vaccine.key] || 0}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Recent Patients</h3>
            <Link href={route('phc.records')} className="text-sm font-medium text-emerald-600 hover:text-emerald-500">View all</Link>
          </div>
          <ul className="divide-y divide-gray-200">
            {results.slice(0, 5).map((patient) => (
              <li key={patient.id}>
                <Link href={route('phc.patient.dashboard', patient.id)} className="block hover:bg-gray-50 p-4 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Users size={20} /></div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{patient.woman_name}</p>
                        <p className="text-xs text-gray-500">ID: {patient.unique_id}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <AncProgressBar patient={patient} />
                      <p className="text-xs text-gray-400 mt-1">EDD: {patient.edd || 'Not set'}</p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PhcStaffLayout>
  );
}
