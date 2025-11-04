import React, { useState } from "react";
import { useForm, usePage, Link, router } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import {
  Search,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { Line, Pie } from "react-chartjs-2";
import { 
    Chart as ChartJS, 
    CategoryScale, 
    LinearScale, 
    PointElement, 
    LineElement, 
    ArcElement, 
    BarElement, 
    Tooltip, 
    Legend 
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, BarElement, Tooltip, Legend);

// Simple component for a statistic card (EXACTLY from Statistics.jsx)
const StatCard = ({ title, value, unit, color }) => (
    <div className={`bg-white p-6 rounded-xl shadow border-l-4 ${color}`}>
        <h3 className="text-sm text-gray-500 font-medium">{title}</h3>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}{unit}</p>
    </div>
);

// Component for monthly registrations chart (EXACTLY from Statistics.jsx)
const MonthlyRegChart = ({ data }) => {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    
    // Convert controller data array (month => count) to chart array (index => count)
    const chartDataArray = labels.map((_, index) => data[index + 1] || 0);

    const chartData = {
        labels: labels,
        datasets: [
            {
                label: `Registrations (${currentYear})`,
                data: chartDataArray,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                tension: 0.3,
                fill: true,
            },
        ],
    };

    const options = { 
        responsive: true, 
        maintainAspectRatio: false,
        plugins: { 
            legend: { 
                position: 'top' 
            } 
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

    return (
        <div className="h-64">
            <Line data={chartData} options={options} />
        </div>
    );
};

export default function PhcDashboard() {
  // Destructure props (using default empty arrays/objects for safety)
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

  // EXACTLY the same data handling as Statistics.jsx
  const { 
    totalPatients, 
    delivered, 
    anc4Completed, 
    liveBirths, 
    deliveryRate, 
    anc4Rate,
    monthlyRegistrations = {},
    deliveryOutcomes = {} 
  } = phcStats || {};

  // Refresh data function
  const refreshData = () => {
    setIsRefreshing(true);
    router.reload({
      preserveScroll: true,
      onFinish: () => setIsRefreshing(false)
    });
  };

  // EXACTLY the same pie chart data as Statistics.jsx
  const pieData = {
    labels: ['Live birth', 'Stillbirth', 'Other/Miscarriage'],
    datasets: [
        {
            data: [
                deliveryOutcomes['Live birth'] || 0,
                deliveryOutcomes['Stillbirth'] || 0,
                Math.max(0, (delivered - (deliveryOutcomes['Live birth'] || 0) - (deliveryOutcomes['Stillbirth'] || 0))) // Calculate 'Other' with min 0
            ],
            backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
            hoverBackgroundColor: ['#059669', '#dc2626', '#d97706'],
        },
    ],
  };

  // EXACTLY the same loading check as Statistics.jsx
  if (!phcStats || totalPatients === undefined) {
    return (
      <PhcStaffLayout title="Clinic Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </PhcStaffLayout>
    );
  }

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

  return (
    <PhcStaffLayout title="Clinic Dashboard">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-purple-700">
            Welcome, {auth?.user?.name || "Staff"}
          </h1>
          <p className="text-gray-600">Manage patients and view clinic statistics</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
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
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-center"
          >
            + Add New Patient
          </Link>
        </div>
      </div>

      {/* EXACTLY THE SAME STATISTICS SECTION AS Statistics.jsx */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Performance Overview for Your PHC</h2>
        
        {/* KPI Section - IDENTICAL to Statistics.jsx */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Registered Patients" 
            value={totalPatients} 
            unit="" 
            color="border-purple-600"
          />
          <StatCard 
            title="ANC4 Completion Rate" 
            value={anc4Rate} 
            unit="%" 
            color="border-green-600"
          />
          <StatCard 
            title="Health Facility Delivery Rate" 
            value={deliveryRate} 
            unit="%" 
            color="border-blue-600"
          />
          <StatCard 
            title="Live Births Recorded" 
            value={liveBirths} 
            unit="" 
            color="border-yellow-600"
          />
        </div>

        {/* Charts/Visualization Section - IDENTICAL to Statistics.jsx */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Registrations */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-4">Monthly ANC Registrations</h3>
            <MonthlyRegChart data={monthlyRegistrations} />
          </div>
          
          {/* Delivery Outcomes */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-4">Delivery Outcome Distribution</h3>
            <div className="h-64 flex items-center justify-center">
              <Pie 
                data={pieData} 
                options={{ 
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
                }} 
              />
            </div>
          </div>
        </div>

        {/* Detailed Counts - IDENTICAL to Statistics.jsx */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-4">Detailed Counts</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-700">Completed ANC4</p>
              <p className="text-2xl font-bold text-green-600">{anc4Completed}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-700">Total Delivered</p>
              <p className="text-2xl font-bold text-blue-600">{delivered}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-700">PNC Incomplete</p>
              <p className="text-2xl font-bold text-orange-600">{totalPatients - delivered}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-700">Stillbirths</p>
              <p className="text-2xl font-bold text-red-600">{deliveryOutcomes['Stillbirth'] || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PATIENT MANAGEMENT SECTION */}
      <div className="mt-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Patient Management</h2>
          <p className="text-gray-600">Total: {filtered.length} patients</p>
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
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-center"
            >
              View Detailed Statistics
            </Link>
            <Link
              href={route('phc.records')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center"
            >
              View All Records
            </Link>
          </div>
        </div>

        {/* Patient Table */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-600">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="px-4 py-3 font-semibold">Unique ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Age</th>
                <th className="px-4 py-3 font-semibold">LGA/Ward</th>
                <th className="px-4 py-3 font-semibold">EDD</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((p, index) => (
                  <tr key={p.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
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
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.date_of_delivery 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {p.date_of_delivery ? 'Delivered' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-center">
                        <Link
                          href={route('phc.patients.edit', p.id)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded transition"
                          title="Edit Patient"
                        >
                          <Edit size={16} />
                        </Link>
                        <Link
                          href={route('phc.patients.show', p.id)}
                          className="text-green-600 hover:text-green-800 p-1 rounded transition"
                          title="View Details"
                        >
                          <Search size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition"
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
                    colSpan="7"
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
                          className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                        >
                          + Add Your First Patient
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