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
  Home,
  Calendar,
  Baby,
  Stethoscope,
  Heart,
  AlertTriangle,
  CheckCircle,
  X
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

// Filter Badge Component
const FilterBadge = ({ label, value, onRemove }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
    {label}: {value}
    <button
      onClick={onRemove}
      className="ml-1 hover:text-blue-600"
    >
      <X size={12} />
    </button>
  </span>
);

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
  const [ancFilter, setAncFilter] = useState(filters.anc_filter || "");
  const [pregnancyFilter, setPregnancyFilter] = useState(filters.pregnancy_filter || "");
  const [deliveryFilter, setDeliveryFilter] = useState(filters.delivery_filter || "");
  const [deliveryOutcomeFilter, setDeliveryOutcomeFilter] = useState(filters.delivery_outcome_filter || "");
  const [pncFilter, setPncFilter] = useState(filters.pnc_filter || "");
  const [insuranceFilter, setInsuranceFilter] = useState(filters.insurance_filter || "");
  const [fpFilter, setFpFilter] = useState(filters.fp_filter || "");
  const [kitFilter, setKitFilter] = useState(filters.kit_filter || "");
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter options
  const ancFilters = {
    '': 'All ANC Status',
    'anc1_only': 'Completed ANC1 Only',
    'anc2_only': 'Completed ANC2 Only', 
    'anc3_only': 'Completed ANC3 Only',
    'anc4_completed': 'Completed ANC4',
    'anc_incomplete': 'ANC Incomplete',
    'anc1_paid': 'ANC1 Paid',
    'anc2_paid': 'ANC2 Paid',
    'anc3_paid': 'ANC3 Paid',
    'anc4_paid': 'ANC4 Paid'
  };

  const pregnancyFilters = {
    '': 'All Pregnancy Status',
    '7_months': '7 Months Pregnant (2 months to EDD)',
    '8_months': '8 Months Pregnant (1 month to EDD)',
    'due_this_month': 'Due This Month',
    'overdue': 'Overdue (Past EDD)',
    'delivered': 'Already Delivered',
    'not_delivered': 'Not Yet Delivered'
  };

  const deliveryFilters = {
    '': 'All Delivery Places',
    'hospital': 'Hospital Delivery',
    'phc': 'PHC Delivery', 
    'home': 'Home Delivery',
    'other': 'Other Places'
  };

  const deliveryOutcomeFilters = {
    '': 'All Outcomes',
    'live_birth': 'Live Birth',
    'stillbirth': 'Stillbirth',
    'miscarriage': 'Miscarriage'
  };

  const pncFilters = {
    '': 'All PNC Status',
    'pnc_completed': 'PNC Completed',
    'pnc_incomplete': 'PNC Incomplete',
    'pnc1_within_48h': 'PNC1 within 48h',
    'pnc_missed': 'PNC Missed'
  };

  const insuranceFilters = {
    '': 'All Insurance Status',
    'insured': 'Has Insurance',
    'not_insured': 'No Insurance',
    'satisfied': 'Insurance Satisfied',
    'not_satisfied': 'Insurance Not Satisfied'
  };

  const fpFilters = {
    '': 'All FP Status',
    'fp_interested': 'FP Interested',
    'fp_given': 'FP Given',
    'fp_paid': 'FP Paid',
    'fp_not_given': 'FP Not Given'
  };

  const kitFilters = {
    '': 'All Kit Status',
    'kit_received': 'Kit Received',
    'kit_not_received': 'Kit Not Received'
  };

  // Handle search with debounce
  const handleSearch = (value) => {
    setSearch(value);
    applyFilters({ search: value });
  };

  // Apply all filters
  const applyFilters = (updatedFilters = {}) => {
    const params = {
      search: updatedFilters.search !== undefined ? updatedFilters.search : search,
      facility: updatedFilters.facility !== undefined ? updatedFilters.facility : selectedFacility,
      anc_filter: updatedFilters.anc_filter !== undefined ? updatedFilters.anc_filter : ancFilter,
      pregnancy_filter: updatedFilters.pregnancy_filter !== undefined ? updatedFilters.pregnancy_filter : pregnancyFilter,
      delivery_filter: updatedFilters.delivery_filter !== undefined ? updatedFilters.delivery_filter : deliveryFilter,
      delivery_outcome_filter: updatedFilters.delivery_outcome_filter !== undefined ? updatedFilters.delivery_outcome_filter : deliveryOutcomeFilter,
      pnc_filter: updatedFilters.pnc_filter !== undefined ? updatedFilters.pnc_filter : pncFilter,
      insurance_filter: updatedFilters.insurance_filter !== undefined ? updatedFilters.insurance_filter : insuranceFilter,
      fp_filter: updatedFilters.fp_filter !== undefined ? updatedFilters.fp_filter : fpFilter,
      kit_filter: updatedFilters.kit_filter !== undefined ? updatedFilters.kit_filter : kitFilter,
    };

    // Remove empty values
    Object.keys(params).forEach(key => {
      if (!params[key]) delete params[key];
    });

    router.get(route('admin.patients.index'), params, {
      preserveState: true,
      replace: true,
    });
  };

  // Handle individual filter changes
  const handleFacilityFilter = (facilityId) => {
    setSelectedFacility(facilityId);
    applyFilters({ facility: facilityId });
  };

  const handleAncFilter = (filter) => {
    setAncFilter(filter);
    applyFilters({ anc_filter: filter });
  };

  const handlePregnancyFilter = (filter) => {
    setPregnancyFilter(filter);
    applyFilters({ pregnancy_filter: filter });
  };

  const handleDeliveryFilter = (filter) => {
    setDeliveryFilter(filter);
    applyFilters({ delivery_filter: filter });
  };

  const handleDeliveryOutcomeFilter = (filter) => {
    setDeliveryOutcomeFilter(filter);
    applyFilters({ delivery_outcome_filter: filter });
  };

  const handlePncFilter = (filter) => {
    setPncFilter(filter);
    applyFilters({ pnc_filter: filter });
  };

  const handleInsuranceFilter = (filter) => {
    setInsuranceFilter(filter);
    applyFilters({ insurance_filter: filter });
  };

  const handleFpFilter = (filter) => {
    setFpFilter(filter);
    applyFilters({ fp_filter: filter });
  };

  const handleKitFilter = (filter) => {
    setKitFilter(filter);
    applyFilters({ kit_filter: filter });
  };

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setSelectedFacility("");
    setAncFilter("");
    setPregnancyFilter("");
    setDeliveryFilter("");
    setDeliveryOutcomeFilter("");
    setPncFilter("");
    setInsuranceFilter("");
    setFpFilter("");
    setKitFilter("");
    
    router.get(route('admin.patients.index'), {}, {
      preserveState: true,
      replace: true,
    });
  };

  // Remove specific filter
  const removeFilter = (filterType) => {
    switch (filterType) {
      case 'search':
        setSearch("");
        applyFilters({ search: "" });
        break;
      case 'facility':
        setSelectedFacility("");
        applyFilters({ facility: "" });
        break;
      case 'anc_filter':
        setAncFilter("");
        applyFilters({ anc_filter: "" });
        break;
      case 'pregnancy_filter':
        setPregnancyFilter("");
        applyFilters({ pregnancy_filter: "" });
        break;
      case 'delivery_filter':
        setDeliveryFilter("");
        applyFilters({ delivery_filter: "" });
        break;
      case 'delivery_outcome_filter':
        setDeliveryOutcomeFilter("");
        applyFilters({ delivery_outcome_filter: "" });
        break;
      case 'pnc_filter':
        setPncFilter("");
        applyFilters({ pnc_filter: "" });
        break;
      case 'insurance_filter':
        setInsuranceFilter("");
        applyFilters({ insurance_filter: "" });
        break;
      case 'fp_filter':
        setFpFilter("");
        applyFilters({ fp_filter: "" });
        break;
      case 'kit_filter':
        setKitFilter("");
        applyFilters({ kit_filter: "" });
        break;
    }
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
    if (ancFilter) params.append('anc_filter', ancFilter);
    if (pregnancyFilter) params.append('pregnancy_filter', pregnancyFilter);
    if (deliveryFilter) params.append('delivery_filter', deliveryFilter);
    if (deliveryOutcomeFilter) params.append('delivery_outcome_filter', deliveryOutcomeFilter);
    if (pncFilter) params.append('pnc_filter', pncFilter);
    if (insuranceFilter) params.append('insurance_filter', insuranceFilter);
    if (fpFilter) params.append('fp_filter', fpFilter);
    if (kitFilter) params.append('kit_filter', kitFilter);
    
    window.location.href = route('admin.patients.export') + '?' + params.toString();
  };

  // Check if any filter is active
  const hasActiveFilters = search || selectedFacility || ancFilter || pregnancyFilter || 
                          deliveryFilter || deliveryOutcomeFilter || pncFilter || 
                          insuranceFilter || fpFilter || kitFilter;

  // Get display value for filter badges
  const getFilterDisplayValue = (filterType, value) => {
    const maps = {
      'facility': facilities.find(f => f.id == value)?.clinic_name,
      'anc_filter': ancFilters[value],
      'pregnancy_filter': pregnancyFilters[value],
      'delivery_filter': deliveryFilters[value],
      'delivery_outcome_filter': deliveryOutcomeFilters[value],
      'pnc_filter': pncFilters[value],
      'insurance_filter': insuranceFilters[value],
      'fp_filter': fpFilters[value],
      'kit_filter': kitFilters[value]
    };
    return maps[filterType] || value;
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

          {/* Active Filters Badges */}
          {hasActiveFilters && (
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-blue-800">Active Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {search && (
                  <FilterBadge 
                    label="Search" 
                    value={search} 
                    onRemove={() => removeFilter('search')} 
                  />
                )}
                {selectedFacility && (
                  <FilterBadge 
                    label="Facility" 
                    value={getFilterDisplayValue('facility', selectedFacility)} 
                    onRemove={() => removeFilter('facility')} 
                  />
                )}
                {ancFilter && (
                  <FilterBadge 
                    label="ANC" 
                    value={getFilterDisplayValue('anc_filter', ancFilter)} 
                    onRemove={() => removeFilter('anc_filter')} 
                  />
                )}
                {pregnancyFilter && (
                  <FilterBadge 
                    label="Pregnancy" 
                    value={getFilterDisplayValue('pregnancy_filter', pregnancyFilter)} 
                    onRemove={() => removeFilter('pregnancy_filter')} 
                  />
                )}
                {deliveryFilter && (
                  <FilterBadge 
                    label="Delivery Place" 
                    value={getFilterDisplayValue('delivery_filter', deliveryFilter)} 
                    onRemove={() => removeFilter('delivery_filter')} 
                  />
                )}
                {deliveryOutcomeFilter && (
                  <FilterBadge 
                    label="Delivery Outcome" 
                    value={getFilterDisplayValue('delivery_outcome_filter', deliveryOutcomeFilter)} 
                    onRemove={() => removeFilter('delivery_outcome_filter')} 
                  />
                )}
                {pncFilter && (
                  <FilterBadge 
                    label="PNC" 
                    value={getFilterDisplayValue('pnc_filter', pncFilter)} 
                    onRemove={() => removeFilter('pnc_filter')} 
                  />
                )}
                {insuranceFilter && (
                  <FilterBadge 
                    label="Insurance" 
                    value={getFilterDisplayValue('insurance_filter', insuranceFilter)} 
                    onRemove={() => removeFilter('insurance_filter')} 
                  />
                )}
                {fpFilter && (
                  <FilterBadge 
                    label="Family Planning" 
                    value={getFilterDisplayValue('fp_filter', fpFilter)} 
                    onRemove={() => removeFilter('fp_filter')} 
                  />
                )}
                {kitFilter && (
                  <FilterBadge 
                    label="Delivery Kit" 
                    value={getFilterDisplayValue('kit_filter', kitFilter)} 
                    onRemove={() => removeFilter('kit_filter')} 
                  />
                )}
              </div>
            </div>
          )}

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-white p-6 rounded-xl shadow-md border border-purple-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Facility Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building size={16} className="inline mr-1" />
                    Facility
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

                {/* ANC Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Stethoscope size={16} className="inline mr-1" />
                    ANC Status
                  </label>
                  <select
                    value={ancFilter}
                    onChange={(e) => handleAncFilter(e.target.value)}
                    className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
                  >
                    {Object.entries(ancFilters).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Pregnancy Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Baby size={16} className="inline mr-1" />
                    Pregnancy Status
                  </label>
                  <select
                    value={pregnancyFilter}
                    onChange={(e) => handlePregnancyFilter(e.target.value)}
                    className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
                  >
                    {Object.entries(pregnancyFilters).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Delivery Place Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Home size={16} className="inline mr-1" />
                    Delivery Place
                  </label>
                  <select
                    value={deliveryFilter}
                    onChange={(e) => handleDeliveryFilter(e.target.value)}
                    className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
                  >
                    {Object.entries(deliveryFilters).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Delivery Outcome Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Heart size={16} className="inline mr-1" />
                    Delivery Outcome
                  </label>
                  <select
                    value={deliveryOutcomeFilter}
                    onChange={(e) => handleDeliveryOutcomeFilter(e.target.value)}
                    className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
                  >
                    {Object.entries(deliveryOutcomeFilters).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* PNC Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CheckCircle size={16} className="inline mr-1" />
                    PNC Status
                  </label>
                  <select
                    value={pncFilter}
                    onChange={(e) => handlePncFilter(e.target.value)}
                    className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
                  >
                    {Object.entries(pncFilters).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Insurance Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AlertTriangle size={16} className="inline mr-1" />
                    Insurance Status
                  </label>
                  <select
                    value={insuranceFilter}
                    onChange={(e) => handleInsuranceFilter(e.target.value)}
                    className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
                  >
                    {Object.entries(insuranceFilters).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Family Planning Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users size={16} className="inline mr-1" />
                    Family Planning
                  </label>
                  <select
                    value={fpFilter}
                    onChange={(e) => handleFpFilter(e.target.value)}
                    className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
                  >
                    {Object.entries(fpFilters).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Delivery Kit Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Delivery Kit
                  </label>
                  <select
                    value={kitFilter}
                    onChange={(e) => handleKitFilter(e.target.value)}
                    className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-purple-400 outline-none"
                  >
                    {Object.entries(kitFilters).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Clear Filters Button */}
              {hasActiveFilters && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={clearFilters}
                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                  >
                    Clear All Filters
                  </button>
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
                <th className="px-4 py-3">ANC Visits</th>
                <th className="px-4 py-3">Delivery Status</th>
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
                        p.anc_visits_count >= 4 ? 'bg-green-100 text-green-800' :
                        p.anc_visits_count >= 2 ? 'bg-yellow-100 text-yellow-800' :
                        p.anc_visits_count >= 1 ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {p.anc_visits_count || 0} visits
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        p.date_of_delivery ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {p.date_of_delivery ? 'Delivered' : 'Pending'}
                        {p.delivery_outcome && ` - ${p.delivery_outcome}`}
                      </span>
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
                    colSpan="9"
                    className="text-center text-gray-400 py-12 font-medium"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Users size={48} className="text-gray-300 mb-3" />
                      <p className="text-lg text-gray-500 mb-2">No patient records found</p>
                      <p className="text-sm text-gray-400">
                        {hasActiveFilters 
                          ? "No patients match your current filters." 
                          : "There are no patient records in the system yet."}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="mt-3 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                        >
                          Clear Filters
                        </button>
                      )}
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
          <h3 className="font-semibold text-blue-800 mb-2">Advanced Filtering</h3>
          <p className="text-sm text-blue-700">
            Use the comprehensive filters above to find specific patient groups:
            <br />
            • ANC completion status (ANC1 only, ANC2 only, ANC3 only, ANC4 completed)
            <br />
            • Pregnancy status (7 months, 8 months, due this month, overdue)
            <br />
            • Delivery outcomes and locations
            <br />
            • PNC completion and family planning status
          </p>
        </div>
    </AdminLayout>
  );
}