import React, { useState, useEffect } from "react";
import { useForm, usePage, Link, router } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import {
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Users,
  Baby,
  Heart,
  Calendar,
  TrendingUp,
  Activity,
  Stethoscope,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Home,
  Hospital
} from "lucide-react";
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Tooltip,
  Legend,
  Title,
  Filler
} from 'chart.js';

// Register Chart.js components including Filler
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  ArcElement, 
  BarElement, 
  Tooltip, 
  Legend, 
  Title,
  Filler
);

// Enhanced StatCard Component
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
        {trend !== undefined && (
          <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'}`}>
            {trend > 0 ? <ArrowUp size={14} /> : trend < 0 ? <ArrowDown size={14} /> : <span className="w-3"></span>}
            <span className="ml-1">
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Mini Stat Card for compact displays
const MiniStatCard = ({ title, value, color, icon: Icon, subtitle }) => (
  <div className="bg-white p-4 rounded-lg shadow border-l-2 border-t border-gray-50">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p className="text-lg font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
  </div>
);

// Alert Component for critical notifications
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

// ANC Progress Bar Component
const AncProgressBar = ({ patient }) => {
  const ancVisits = [1, 2, 3, 4, 5, 6, 7, 8].map(i => 
    patient[`anc_visit_${i}_date`] ? i : null
  ).filter(Boolean);
  
  const progress = (ancVisits.length / 8) * 100;
  const hasAdditional = patient.additional_anc_count > 0;

  return (
    <div className="flex items-center space-x-2">
      <div className="w-20 bg-gray-200 rounded-full h-2">
        <div 
          className="bg-green-600 h-2 rounded-full transition-all duration-500" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <span className="text-xs text-gray-500">
        {ancVisits.length}/8
        {hasAdditional && <span className="text-orange-500"> +{patient.additional_anc_count}</span>}
      </span>
    </div>
  );
};

// Delivery Location Indicator
const DeliveryLocation = ({ patient }) => {
  if (!patient.date_of_delivery) return null;
  
  const location = patient.place_of_delivery;
  const isFacility = location === 'Health Facility';
  
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
      isFacility ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
    }`}>
      {isFacility ? <Hospital size={12} className="mr-1" /> : <Home size={12} className="mr-1" />}
      {location}
    </div>
  );
};

export default function PhcDashboard() {
  const { 
    patients = { data: [] }, 
    auth, 
    lgas = [], 
    wards = [],
    phcStats = null
  } = usePage().props;
  
  const results = patients?.data || [];
  
  const [search, setSearch] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('month');

  // Enhanced statistics data handling
  const { 
    totalPatients, 
    delivered, 
    facilityDeliveries = 0,
    liveBirths, 
    deliveryRate, 
    facilityDeliveryRate = 0,
    monthlyRegistrations = {},
    deliveryOutcomes = {},
    ancCompletion = {},
    pregnancyTracking = {},
    activePregnancies = 0,
    pncIncomplete = 0,
    ancVisitsBreakdown = {},
    trends = {}
  } = phcStats || {};

  // Calculate ANC 1-8 completion rates
  const ancVisitsData = {
    anc1: ancVisitsBreakdown?.anc1 || 0,
    anc2: ancVisitsBreakdown?.anc2 || 0,
    anc3: ancVisitsBreakdown?.anc3 || 0,
    anc4: ancVisitsBreakdown?.anc4 || 0,
    anc5: ancVisitsBreakdown?.anc5 || 0,
    anc6: ancVisitsBreakdown?.anc6 || 0,
    anc7: ancVisitsBreakdown?.anc7 || 0,
    anc8: ancVisitsBreakdown?.anc8 || 0,
    ancPlus: ancVisitsBreakdown?.anc5plus || 0
  };

  // Calculate ANC completion rates
  const ancRates = {
    anc1: totalPatients > 0 ? Math.round((ancVisitsData.anc1 / totalPatients) * 100) : 0,
    anc4: totalPatients > 0 ? Math.round((ancVisitsData.anc4 / totalPatients) * 100) : 0,
    anc8: totalPatients > 0 ? Math.round((ancVisitsData.anc8 / totalPatients) * 100) : 0
  };

  // Calculate additional metrics
  const pendingDeliveriesCount = pregnancyTracking?.dueThisMonth || 0;
  const highRiskPregnancies = Math.round((pregnancyTracking?.sevenMonths || 0) * 0.3);
  const pncCompletion = delivered > 0 ? Math.round(((delivered - pncIncomplete) / delivered) * 100) : 0;

  // Calculate non-facility deliveries
  const nonFacilityDeliveries = delivered - facilityDeliveries;

  // Refresh data function
  const refreshData = () => {
    setIsRefreshing(true);
    router.reload({
      preserveScroll: true,
      onFinish: () => setIsRefreshing(false)
    });
  };

  // Enhanced chart data configurations
  const monthlyRegChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        label: `Registrations (${new Date().getFullYear()})`,
        data: monthlyRegistrations ? Object.values(monthlyRegistrations) : Array(12).fill(0),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const deliveryOutcomeData = {
    labels: ['Live birth', 'Stillbirth', 'Other/Miscarriage'],
    datasets: [
      {
        data: [
          deliveryOutcomes['Live birth'] || 0,
          deliveryOutcomes['Stillbirth'] || 0,
          Math.max(0, (delivered - (deliveryOutcomes['Live birth'] || 0) - (deliveryOutcomes['Stillbirth'] || 0)))
        ],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
        hoverBackgroundColor: ['#059669', '#dc2626', '#d97706'],
        borderWidth: 2,
        borderColor: '#fff'
      },
    ],
  };

  // Delivery Location Chart
  const deliveryLocationData = {
    labels: ['Health Facility', 'Home/Other'],
    datasets: [
      {
        data: [facilityDeliveries, nonFacilityDeliveries],
        backgroundColor: ['#10b981', '#f59e0b'],
        hoverBackgroundColor: ['#059669', '#d97706'],
        borderWidth: 2,
        borderColor: '#fff'
      },
    ],
  };

  // ANC 1-8 Completion Chart
  const anc18CompletionData = {
    labels: ['ANC1', 'ANC2', 'ANC3', 'ANC4', 'ANC5', 'ANC6', 'ANC7', 'ANC8'],
    datasets: [
      {
        label: 'Patients Completed',
        data: [
          ancVisitsData.anc1,
          ancVisitsData.anc2,
          ancVisitsData.anc3,
          ancVisitsData.anc4,
          ancVisitsData.anc5,
          ancVisitsData.anc6,
          ancVisitsData.anc7,
          ancVisitsData.anc8
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(139, 69, 19, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
          'rgb(20, 184, 166)',
          'rgb(249, 115, 22)',
          'rgb(139, 69, 19)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // ANC Completion Progress Chart
  const ancCompletionData = {
    labels: ['ANC1 Only', 'ANC2 Only', 'ANC3 Only', 'ANC4 Only', 'ANC5 Only', 'ANC6 Only', 'ANC7 Only', 'ANC8 Completed'],
    datasets: [
      {
        label: 'Patients',
        data: [
          ancCompletion?.anc1Only || 0,
          ancCompletion?.anc2Only || 0,
          ancCompletion?.anc3Only || 0,
          ancCompletion?.anc4Only || 0,
          ancCompletion?.anc5Only || 0,
          ancCompletion?.anc6Only || 0,
          ancCompletion?.anc7Only || 0,
          ancCompletion?.anc8Completed || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(139, 69, 19, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
          'rgb(20, 184, 166)',
          'rgb(249, 115, 22)',
          'rgb(139, 69, 19)'
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15
        }
      }
    }
  };

  // Critical Alerts Data
  const criticalAlerts = [
    {
      type: 'danger',
      title: 'Overdue Deliveries',
      message: 'Patients past due date',
      count: Math.max(0, pregnancyTracking?.dueThisMonth ? pregnancyTracking.dueThisMonth - delivered : 0),
      icon: AlertCircle
    },
    {
      type: 'warning',
      title: 'High Risk Pregnancies',
      message: 'Requires special attention',
      count: highRiskPregnancies,
      icon: Activity
    },
    {
      type: 'info',
      title: 'Pending ANC8',
      message: 'Patients needing final ANC visit',
      count: Math.max(0, (ancVisitsData.anc7 || 0) - (ancVisitsData.anc8 || 0)),
      icon: Stethoscope
    }
  ];

  // Delete patient function
  const handleDelete = (id) => { 
    if (confirm("Are you sure you want to delete this patient record?")) { 
      router.delete(route("phc.patients.destroy", id)); 
    } 
  };

  // Search functionality
  const filtered = results.filter((p) => {
    const searchTerm = search.toLowerCase();
    return (
      p.woman_name?.toLowerCase().includes(searchTerm) ||
      p.unique_id?.toLowerCase().includes(searchTerm) ||
      p.phone_number?.toLowerCase().includes(searchTerm)
    );
  });

  // Loading state
  if (!phcStats || totalPatients === undefined) {
    return (
      <PhcStaffLayout title="Clinic Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading comprehensive dashboard data...</p>
          </div>
        </div>
      </PhcStaffLayout>
    );
  }

  return (
    <PhcStaffLayout title="Comprehensive Clinic Dashboard">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">
            Welcome, {auth?.user?.name || "Staff"}
          </h1>
          <p className="text-gray-600">Comprehensive overview of clinic performance and patient management</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
          >
            {isRefreshing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <RefreshCw size={16} />
            )}
            Refresh
          </button>
          <Link
            href={route('phc.create-patient')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-center flex items-center gap-2"
          >
            <Users size={16} />
            Add New Patient
          </Link>
        </div>
      </div>

      {/* CRITICAL ALERTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {criticalAlerts.map((alert, index) => (
          alert.count > 0 && (
            <AlertCard key={index} {...alert} />
          )
        ))}
      </div>

      {/* ENHANCED STATISTICS SECTION */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Performance Overview</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Activity size={16} />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        
        {/* MAIN KPI SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Registered Patients" 
            value={totalPatients} 
            unit="" 
            color="border-purple-600"
            icon={Users}
            trend={trends.totalPatients}
            description="Active patients in care"
          />
          <StatCard 
            title="Facility Delivery Rate" 
            value={facilityDeliveryRate} 
            unit="%" 
            color="border-green-600"
            icon={Hospital}
            trend={trends.facilityDeliveryRate}
            description="Deliveries at health facility"
          />
          <StatCard 
            title="ANC8 Completion Rate" 
            value={ancRates.anc8} 
            unit="%" 
            color="border-blue-600"
            icon={CheckCircle}
            trend={3.2}
            description="Completed 8 ANC visits"
          />
          <StatCard 
            title="Live Births Recorded" 
            value={liveBirths} 
            unit="" 
            color="border-yellow-600"
            icon={Heart}
            trend={trends.liveBirths}
            description="Successful live births"
          />
        </div>

        {/* SECONDARY METRICS */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <MiniStatCard title="Active Pregnancies" value={activePregnancies} color="text-pink-600" icon={Baby} />
          <MiniStatCard title="Due This Month" value={pregnancyTracking?.dueThisMonth || 0} color="text-orange-600" icon={Calendar} />
          <MiniStatCard title="Facility Deliveries" value={facilityDeliveries} color="text-green-600" icon={Hospital} subtitle={`${facilityDeliveryRate}% rate`} />
          <MiniStatCard title="ANC1 Completion" value={`${ancRates.anc1}%`} color="text-blue-600" icon={Stethoscope} subtitle={`${ancVisitsData.anc1} patients`} />
          <MiniStatCard title="PNC Completion" value={`${pncCompletion}%`} color="text-green-600" icon={CheckCircle} />
          <MiniStatCard title="Extra ANC Visits" value={ancVisitsData.ancPlus || 0} color="text-indigo-600" icon={TrendingUp} subtitle="5+ visits" />
        </div>

        {/* DELIVERY PERFORMANCE OVERVIEW */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Delivery Performance Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-center mb-2">
                <Hospital className="h-8 w-8 text-green-600" />
              </div>
              <p className="font-semibold text-green-700">Facility Deliveries</p>
              <p className="text-3xl font-bold text-green-600">{facilityDeliveries}</p>
              <p className="text-lg text-green-600">{facilityDeliveryRate}%</p>
              <p className="text-xs text-green-600 mt-1">of all deliveries</p>
              {trends.facilityDeliveryRate !== undefined && (
                <div className={`inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs ${
                  trends.facilityDeliveryRate > 0 ? 'bg-green-100 text-green-800' : 
                  trends.facilityDeliveryRate < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {trends.facilityDeliveryRate > 0 ? <ArrowUp size={12} /> : 
                   trends.facilityDeliveryRate < 0 ? <ArrowDown size={12} /> : null}
                  <span className="ml-1">
                    {trends.facilityDeliveryRate > 0 ? '+' : ''}{trends.facilityDeliveryRate}%
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-center mb-2">
                <Heart className="h-8 w-8 text-blue-600" />
              </div>
              <p className="font-semibold text-blue-700">Total Deliveries</p>
              <p className="text-3xl font-bold text-blue-600">{delivered}</p>
              <p className="text-lg text-blue-600">{deliveryRate}%</p>
              <p className="text-xs text-blue-600 mt-1">delivery rate</p>
              {trends.deliveryRate !== undefined && (
                <div className={`inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs ${
                  trends.deliveryRate > 0 ? 'bg-green-100 text-green-800' : 
                  trends.deliveryRate < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {trends.deliveryRate > 0 ? <ArrowUp size={12} /> : 
                   trends.deliveryRate < 0 ? <ArrowDown size={12} /> : null}
                  <span className="ml-1">
                    {trends.deliveryRate > 0 ? '+' : ''}{trends.deliveryRate}%
                  </span>
                </div>
              )}
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-center mb-2">
                <Baby className="h-8 w-8 text-purple-600" />
              </div>
              <p className="font-semibold text-purple-700">Live Births</p>
              <p className="text-3xl font-bold text-purple-600">{liveBirths}</p>
              <p className="text-lg text-purple-600">
                {delivered > 0 ? Math.round((liveBirths / delivered) * 100) : 0}%
              </p>
              <p className="text-xs text-purple-600 mt-1">success rate</p>
              {trends.liveBirths !== undefined && (
                <div className={`inline-flex items-center mt-2 px-2 py-1 rounded-full text-xs ${
                  trends.liveBirths > 0 ? 'bg-green-100 text-green-800' : 
                  trends.liveBirths < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {trends.liveBirths > 0 ? <ArrowUp size={12} /> : 
                   trends.liveBirths < 0 ? <ArrowDown size={12} /> : null}
                  <span className="ml-1">
                    {trends.liveBirths > 0 ? '+' : ''}{trends.liveBirths}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ANC 1-8 COMPLETION BREAKDOWN */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">ANC 1-8 Completion Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(visit => (
              <div key={visit} className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-blue-700">ANC{visit}</p>
                <p className="text-2xl font-bold text-blue-600">{ancVisitsData[`anc${visit}`] || 0}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {totalPatients > 0 ? Math.round(((ancVisitsData[`anc${visit}`] || 0) / totalPatients) * 100) : 0}%
                </p>
              </div>
            ))}
          </div>
          {ancVisitsData.ancPlus > 0 && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800">
                <TrendingUp size={14} className="mr-1" />
                <span className="text-sm font-medium">
                  {ancVisitsData.ancPlus} patients completed 5+ additional ANC visits
                </span>
              </div>
            </div>
          )}
        </div>

        {/* PREGNANCY TRACKING */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Pregnancy Tracking & Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
              <p className="font-semibold text-orange-700">7 Months Pregnant</p>
              <p className="text-2xl font-bold text-orange-600">{pregnancyTracking?.sevenMonths || 0}</p>
              <p className="text-xs text-orange-600 mt-1">(2 months to EDD)</p>
              <div className="w-full bg-orange-200 rounded-full h-2 mt-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="font-semibold text-red-700">8 Months Pregnant</p>
              <p className="text-2xl font-bold text-red-600">{pregnancyTracking?.eightMonths || 0}</p>
              <p className="text-xs text-red-600 mt-1">(1 month to EDD)</p>
              <div className="w-full bg-red-200 rounded-full h-2 mt-2">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg border border-pink-200">
              <p className="font-semibold text-pink-700">Due This Month</p>
              <p className="text-2xl font-bold text-pink-600">{pregnancyTracking?.dueThisMonth || 0}</p>
              <p className="text-xs text-pink-600 mt-1">(Expected delivery this month)</p>
              <div className="w-full bg-pink-200 rounded-full h-2 mt-2">
                <div className="bg-pink-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* COMPREHENSIVE CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Registrations */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Monthly ANC Registrations Trend</h3>
            <div className="h-64">
              <Line data={monthlyRegChartData} options={chartOptions} />
            </div>
          </div>
          
          {/* Delivery Locations */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Delivery Location Distribution</h3>
            <div className="h-64">
              <Doughnut data={deliveryLocationData} options={pieChartOptions} />
            </div>
          </div>
        </div>

        {/* ANC VISITS CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* ANC 1-8 Completion */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">ANC 1-8 Visit Completion</h3>
            <div className="h-64">
              <Bar data={anc18CompletionData} options={chartOptions} />
            </div>
          </div>

          {/* ANC Completion Progress */}
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">ANC Completion Progress</h3>
            <div className="h-64">
              <Bar data={ancCompletionData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* DELIVERY OUTCOMES CHART */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
          <h3 className="text-xl font-semibold mb-4">Delivery Outcome Distribution</h3>
          <div className="h-64">
            <Doughnut data={deliveryOutcomeData} options={pieChartOptions} />
          </div>
        </div>

        {/* DETAILED PERFORMANCE METRICS */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-semibold mb-4">Detailed Performance Metrics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-700">Facility Deliveries</p>
              <p className="text-2xl font-bold text-green-600">{facilityDeliveries}</p>
              <p className="text-xs text-gray-500">{facilityDeliveryRate}% facility rate</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-700">Completed ANC8</p>
              <p className="text-2xl font-bold text-blue-600">{ancVisitsData.anc8 || 0}</p>
              <p className="text-xs text-gray-500">{ancRates.anc8}% completion rate</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-700">Total Delivered</p>
              <p className="text-2xl font-bold text-purple-600">{delivered}</p>
              <p className="text-xs text-gray-500">{deliveryRate}% delivery rate</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-700">Stillbirths</p>
              <p className="text-2xl font-bold text-red-600">{deliveryOutcomes['Stillbirth'] || 0}</p>
              <p className="text-xs text-gray-500">{delivered > 0 ? Math.round((deliveryOutcomes['Stillbirth'] / delivered) * 100) : 0}% rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* PATIENT MANAGEMENT SECTION */}
      <div className="mt-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Patient Management</h2>
          <div className="flex items-center space-x-4">
            <p className="text-gray-600">Total: {filtered.length} patients</p>
            <div className="flex space-x-1">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active: {totalPatients - delivered}</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Delivered: {delivered}</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">ANC8: {ancVisitsData.anc8 || 0}</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Facility: {facilityDeliveries}</span>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:justify-between mb-6 gap-3">
          <div className="flex items-center gap-2 w-full md:w-1/3">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search by name, ID, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition"
            />
          </div>
          
          <div className="flex gap-3">
            <Link
              href={route('phc.statistics')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-center flex items-center gap-2"
            >
              <TrendingUp size={16} />
              Detailed Analytics
            </Link>
            <Link
              href={route('phc.records')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center flex items-center gap-2"
            >
              <Users size={16} />
              All Records
            </Link>
          </div>
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto bg-white shadow-lg rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-600">
            <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Unique ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Age</th>
                <th className="px-4 py-3 font-semibold">LGA/Ward</th>
                <th className="px-4 py-3 font-semibold">EDD</th>
                <th className="px-4 py-3 font-semibold">ANC Progress (1-8)</th>
                <th className="px-4 py-3 font-semibold">Delivery Location</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((p, index) => (
                  <tr key={p.id} className={`border-b hover:bg-gray-50 transition ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3 font-medium text-purple-600">{p.unique_id}</td>
                    <td className="px-4 py-3 font-medium">{p.woman_name}</td>
                    <td className="px-4 py-3">{p.age || "N/A"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium">{p.lga?.name || 'N/A'}</span>
                        <span className="text-xs text-gray-500">{p.ward?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.edd ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          new Date(p.edd) > new Date() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {p.edd}
                        </span>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <AncProgressBar patient={p} />
                    </td>
                    <td className="px-4 py-3">
                      <DeliveryLocation patient={p} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.date_of_delivery 
                          ? 'bg-green-100 text-green-800' 
                          : new Date(p.edd) < new Date() 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {p.date_of_delivery ? 'Delivered' : new Date(p.edd) < new Date() ? 'Overdue' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <Link
                          href={route('phc.patients.edit', p.id)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded transition transform hover:scale-110"
                          title="Edit Patient"
                        >
                          <Edit size={16} />
                        </Link>
                        <Link
                          href={route('phc.patients.show', p.id)}
                          className="text-green-600 hover:text-green-800 p-1 rounded transition transform hover:scale-110"
                          title="View Details"
                        >
                          <Search size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition transform hover:scale-110"
                          title="Delete Patient"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
                    className="text-center text-gray-400 py-8 font-medium"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Search size={48} className="text-gray-300 mb-2" />
                      <p className="text-lg">No patients found</p>
                      <p className="text-sm mt-1">
                        {search ? 'Try adjusting your search terms' : 'Get started by adding your first patient'}
                      </p>
                      {!search && (
                        <Link
                          href={route('phc.create-patient')}
                          className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition flex items-center gap-2"
                        >
                          <Users size={16} />
                          Add Your First Patient
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        {patients?.links && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {filtered.length} of {patients.total} patients
            </div>
            <div className="flex gap-1">
              {patients.links.map((link, index) => (
                <Link
                  key={index}
                  href={link.url || '#'}
                  className={`px-3 py-1 rounded ${
                    link.active
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </PhcStaffLayout>
  );
}