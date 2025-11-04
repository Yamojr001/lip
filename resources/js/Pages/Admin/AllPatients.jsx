import React, { useState } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout"; 
import {
  Search,
  Edit,
  Trash2,
  Eye,
  Building,
  Filter,
  Download,
  Users,
  MapPin,
  Home
} from "lucide-react";

// Fixed Pagination component with null href protection
const Pagination = ({ links }) => {
    return (
        <div className="flex justify-center mt-6">
            <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {links.map((link, index) => (
                    <Link
                        key={index}
                        href={link.url || ""}
                        disabled={!link.url}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                            link.active
                                ? 'bg-purple-600 text-white border-purple-600 z-10'
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''} first:rounded-l-md last:rounded-r-md`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </nav>
        </div>
    );
};

export default function AllPatients() {
  const { 
    patients: paginatedPatients, 
    filters = {},
    facilities = [],
    auth 
  } = usePage().props;
  
  const patientResults = paginatedPatients?.data || [];
  
  // State for search and filters
  const [search, setSearch] = useState(filters.search || "");
  const [selectedFacility, setSelectedFacility] = useState(filters.facility || "");
  const [showFilters, setShowFilters] = useState(false);
  
  // Handle search with debounce
  const handleSearch = (value) => {
    setSearch(value);
    const params = {};
    if (value) params.search = value;
    if (selectedFacility) params.facility = selectedFacility;
    
    router.get(route('admin.patients.index'), params, {
      preserveState: true,
      replace: true,
    });
  };

  // Handle facility filter
  const handleFacilityFilter = (facilityId) => {
    setSelectedFacility(facilityId);
    const params = {};
    if (search) params.search = search;
    if (facilityId) params.facility = facilityId;
    
    router.get(route('admin.patients.index'), params, {
      preserveState: true,
      replace: true,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setSelectedFacility("");
    router.get(route('admin.patients.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  // CRUD actions
  const handleDelete = (id) => { 
    if (confirm("Are you sure you want to delete this patient record?")) { 
        router.delete(route("admin.patients.destroy", id)); 
    } 
  };
  
  const handleEdit = (patient) => { 
    router.get(route('admin.patients.edit', patient.id));
  };

  const handleView = (patient) => {
    router.get(route('admin.patients.show', patient.id));
  };

  // Export functionality
  const handleExport = () => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (selectedFacility) params.append('facility', selectedFacility);
    
    window.location.href = route('admin.patients.export') + '?' + params.toString();
  };

  return (
    <AdminLayout title="All Patient Records">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-purple-700">
              All Patient Records ({paginatedPatients?.total || 0})
            </h1>
            <p className="text-gray-600 mt-1">View and manage all patient records across all facilities</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              <Download size={16} />
              Export
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
            >
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          {/* Search Bar */}
          <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-md">
            <Search size={20} className="text-purple-600" />
            <input
              type="text"
              placeholder="Search by name, ID, phone, LGA, ward, or facility..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
            />
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-white p-4 rounded-xl shadow-md border border-purple-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Facility
                  </label>
                  <select
                    value={selectedFacility}
                    onChange={(e) => handleFacilityFilter(e.target.value)}
                    className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
                  >
                    <option value="">All Facilities</option>
                    {facilities.map(facility => (
                      <option key={facility.id} value={facility.id}>
                        {facility.clinic_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {(search || selectedFacility) && (
                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
              
              {/* Active Filters Badge */}
              {(search || selectedFacility) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {search && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Search: "{search}"
                      <button
                        onClick={() => handleSearch("")}
                        className="ml-1 hover:text-blue-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                  {selectedFacility && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Facility: {facilities.find(f => f.id == selectedFacility)?.clinic_name}
                      <button
                        onClick={() => handleFacilityFilter("")}
                        className="ml-1 hover:text-green-600"
                      >
                        ×
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Records Table with horizontal scrolling */}
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full text-sm text-left text-gray-600 whitespace-nowrap">
            <thead className="bg-purple-600 text-white">
              <tr>
                <th className="px-4 py-3 sticky left-0 bg-purple-600 z-10">Unique ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">LGA/Ward</th>
                <th className="px-4 py-3">Facility</th>
                <th className="px-4 py-3">EDD</th>
                <th className="px-4 py-3">Alert</th>
                <th className="px-4 py-3 sticky right-0 bg-purple-600 z-10">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patientResults.length > 0 ? (
                patientResults.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-purple-600 sticky left-0 bg-white z-10 border-r">
                      {p.unique_id}
                    </td>
                    <td className="px-4 py-3 min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-gray-400" />
                        <span>{p.woman_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{p.lga?.name || 'N/A'}/{p.ward?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-[150px]">
                      <div className="flex items-center gap-2">
                        <Building size={14} className="text-gray-400" />
                        <span>{p.health_facility?.clinic_name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {p.edd ? new Date(p.edd).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            p.alert === 'Up to date' ? 'bg-green-100 text-green-800' :
                            (p.alert && (p.alert.includes('Overdue') || p.alert.includes('PNC'))) ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                            {p.alert || 'N/A'}
                        </span>
                    </td>
                    <td className="px-4 py-3 sticky right-0 bg-white z-10 border-l">
                      <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => handleView(p)}
                            className="text-blue-600 hover:text-blue-800 transition"
                            title="View Details"
                        >
                            <Eye size={16} />
                        </button>
                        {/* <button
                            onClick={() => handleEdit(p)}
                            className="text-yellow-600 hover:text-yellow-800 transition"
                            title="Edit Record"
                        >
                            <Edit size={16} />
                        </button> */}
                        <button
                            onClick={() => handleDelete(p.id)}
                            className="text-red-600 hover:text-red-800 transition"
                            title="Delete Record"
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
                    className="text-center text-gray-400 py-12 font-medium"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Users size={48} className="text-gray-300 mb-3" />
                      <p className="text-lg text-gray-500 mb-2">No patient records found</p>
                      <p className="text-sm text-gray-400">
                        {search || selectedFacility 
                          ? "No patients match your current filters." 
                          : "There are no patient records in the system yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Links */}
        {paginatedPatients?.links && <Pagination links={paginatedPatients.links} />}

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <Users className="text-blue-500" size={24} />
              <div>
                <div className="text-2xl font-bold text-blue-600">{paginatedPatients?.total || 0}</div>
                <div className="text-sm text-gray-600">Total Patients</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <Home className="text-green-500" size={24} />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {facilities.length}
                </div>
                <div className="text-sm text-gray-600">Total Facilities</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center gap-3">
              <MapPin className="text-purple-500" size={24} />
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {new Set(patientResults.map(p => p.lga_id)).size}
                </div>
                <div className="text-sm text-gray-600">LGAs Covered</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
            <div className="flex items-center gap-3">
              <Building className="text-orange-500" size={24} />
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {new Set(patientResults.map(p => p.ward_id)).size}
                </div>
                <div className="text-sm text-gray-600">Wards Covered</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Info */}
        <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">Administrator Access</h3>
          <p className="text-sm text-blue-700">
            As an administrator, you can view, edit, and manage all patient records across all facilities. 
            Use the search and filters above to quickly find specific patients or facilities.
          </p>
        </div>
    </AdminLayout>
  );
}