import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Link, usePage, router } from "@inertiajs/react";
import {
    Search,
    Filter,
    Calendar,
    Download,
    Eye,
    FileText,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    BarChart3,
    Syringe,
    Thermometer,
    Activity,
    Shield,
    Building,
    MapPin,
    Users
} from "lucide-react";

export default function AdminVaccineReports({ reports, lgas, wards, phcs, months, filters }) {
    const { auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [localFilters, setLocalFilters] = useState({
        lga_id: filters?.lga_id || '',
        ward_id: filters?.ward_id || '',
        phc_id: filters?.phc_id || '',
        status: filters?.status || '',
        month_year: filters?.month_year || '',
        start_date: filters?.start_date || '',
        end_date: filters?.end_date || '',
    });

    const [expandedRows, setExpandedRows] = useState({});

    // Calculate summary statistics
    const stats = {
        total: reports.total,
        submitted: reports.data.filter(r => r.status === 'submitted').length,
        approved: reports.data.filter(r => r.status === 'approved').length,
        draft: reports.data.filter(r => r.status === 'draft').length,
        rejected: reports.data.filter(r => r.status === 'rejected').length,
        totalDosesUsed: reports.data.reduce((sum, r) => sum + (r.total_doses_used || 0), 0),
        totalDosesDiscarded: reports.data.reduce((sum, r) => sum + (r.total_doses_discarded || 0), 0),
        avgWastageRate: reports.data.length > 0
            ? (reports.data.reduce((sum, r) => sum + (parseFloat(r.vaccine_wastage_rate) || 0), 0) / reports.data.length).toFixed(2)
            : 0,
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-gray-100 text-gray-800',
            submitted: 'bg-blue-100 text-blue-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
        };
        
        const labels = {
            draft: 'Draft',
            submitted: 'Submitted',
            approved: 'Approved',
            rejected: 'Rejected',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getWastageStatus = (rate) => {
        const wastageRate = parseFloat(rate) || 0;
        if (wastageRate > 15) return { color: 'text-red-600', bg: 'bg-red-100', label: 'High Risk' };
        if (wastageRate > 10) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium Risk' };
        if (wastageRate > 5) return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Watch' };
        return { color: 'text-green-600', bg: 'bg-green-100', label: 'Good' };
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        
        // Reset dependent filters
        if (key === 'lga_id') {
            newFilters.ward_id = '';
            newFilters.phc_id = '';
        } else if (key === 'ward_id') {
            newFilters.phc_id = '';
        }
        
        setLocalFilters(newFilters);
    };

    const applyFilters = () => {
        router.get(route('admin.vaccine.reports.index'), localFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        const defaultFilters = {
            lga_id: '',
            ward_id: '',
            phc_id: '',
            status: '',
            month_year: '',
            start_date: '',
            end_date: '',
        };
        setLocalFilters(defaultFilters);
        router.get(route('admin.vaccine.reports.index'), defaultFilters, {
            preserveState: true,
            replace: true,
        });
    };

    const toggleRow = (id) => {
        setExpandedRows(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const getFilteredWards = () => {
        if (!localFilters.lga_id) return wards;
        return wards.filter(ward => ward.lga_id == localFilters.lga_id);
    };

    const getFilteredPhcs = () => {
        if (!localFilters.ward_id) return phcs;
        return phcs.filter(phc => phc.ward_id == localFilters.ward_id);
    };

    return (
        <AdminLayout title="Vaccine Accountability Reports">
            <div className="max-w-7xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Vaccine Accountability Reports</h1>
                            <p className="text-gray-600 mt-2">View and manage all vaccine utilization reports across all facilities</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Link
                                href={route('admin.vaccine.statistics')}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition flex items-center space-x-2"
                            >
                                <BarChart3 className="h-5 w-5" />
                                <span>View Statistics</span>
                            </Link>
                            <button
                                onClick={() => {
                                    const params = new URLSearchParams(localFilters).toString();
                                    window.location.href = route('admin.vaccine.export') + '?' + params;
                                }}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
                            >
                                <Download className="h-5 w-5" />
                                <span>Export Data</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Reports</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <FileText className="h-8 w-8 text-blue-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Submitted</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Approved</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Avg. Wastage</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.avgWastageRate}%</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-red-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Doses Used</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalDosesUsed.toLocaleString()}</p>
                            </div>
                            <Syringe className="h-8 w-8 text-indigo-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Doses Discarded</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalDosesDiscarded.toLocaleString()}</p>
                            </div>
                            <AlertCircle className="h-8 w-8 text-red-500" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <Filter className="h-5 w-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-800">Filter Reports</h3>
                        </div>
                        <div className="flex space-x-2">
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            >
                                Reset All
                            </button>
                            <button
                                onClick={applyFilters}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* LGA Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">LGA</label>
                            <select
                                value={localFilters.lga_id}
                                onChange={(e) => handleFilterChange('lga_id', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All LGAs</option>
                                {lgas.map(lga => (
                                    <option key={lga.id} value={lga.id}>{lga.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Ward Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                            <select
                                value={localFilters.ward_id}
                                onChange={(e) => handleFilterChange('ward_id', e.target.value)}
                                disabled={!localFilters.lga_id}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">All Wards</option>
                                {getFilteredWards().map(ward => (
                                    <option key={ward.id} value={ward.id}>{ward.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* PHC Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Health Facility</label>
                            <select
                                value={localFilters.phc_id}
                                onChange={(e) => handleFilterChange('phc_id', e.target.value)}
                                disabled={!localFilters.ward_id}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            >
                                <option value="">All Facilities</option>
                                {getFilteredPhcs().map(phc => (
                                    <option key={phc.id} value={phc.id}>{phc.clinic_name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={localFilters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Status</option>
                                <option value="draft">Draft</option>
                                <option value="submitted">Submitted</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Month Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Month/Year</label>
                            <select
                                value={localFilters.month_year}
                                onChange={(e) => handleFilterChange('month_year', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Months</option>
                                {months.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                            <input
                                type="date"
                                value={localFilters.start_date}
                                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                            <input
                                type="date"
                                value={localFilters.end_date}
                                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search reports..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            handleFilterChange('search', searchTerm);
                                            applyFilters();
                                        }
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Active Filters */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {localFilters.lga_id && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                LGA: {lgas.find(l => l.id == localFilters.lga_id)?.name}
                            </span>
                        )}
                        {localFilters.ward_id && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Ward: {wards.find(w => w.id == localFilters.ward_id)?.name}
                            </span>
                        )}
                        {localFilters.phc_id && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                Facility: {phcs.find(p => p.id == localFilters.phc_id)?.clinic_name}
                            </span>
                        )}
                        {localFilters.status && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Status: {localFilters.status}
                            </span>
                        )}
                        {localFilters.month_year && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                                Month: {localFilters.month_year}
                            </span>
                        )}
                        {(localFilters.start_date || localFilters.end_date) && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Date: {localFilters.start_date || 'Start'} to {localFilters.end_date || 'End'}
                            </span>
                        )}
                        {searchTerm && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                Search: {searchTerm}
                            </span>
                        )}
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Report Details</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Facility & Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Doses Used</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Wastage Rate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Stock Outs</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Submitted On</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reports.data.map((report) => {
                                    const wastageStatus = getWastageStatus(report.vaccine_wastage_rate);
                                    const isExpanded = expandedRows[report.id];
                                    
                                    return (
                                        <React.Fragment key={report.id}>
                                            <tr className="hover:bg-gray-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                                                        <div>
                                                            <div className="font-medium text-gray-900">{report.month_year || 'N/A'}</div>
                                                            <div className="text-sm text-gray-500">Report #{report.id}</div>
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                {formatDate(report.reporting_date)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-medium text-gray-900 flex items-center">
                                                            <Building className="h-4 w-4 mr-2 text-gray-400" />
                                                            {report.phc?.clinic_name || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-600 flex items-center mt-1">
                                                            <MapPin className="h-3 w-3 mr-1" />
                                                            {report.phc?.lga?.name || 'N/A'}, {report.phc?.ward?.name || 'N/A'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 mt-1 flex items-center">
                                                            <Users className="h-3 w-3 mr-1" />
                                                            {report.user?.name || 'Staff'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(report.status)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-lg font-semibold text-gray-900">{report.total_doses_used?.toLocaleString() || 0}</div>
                                                    <div className="text-sm text-gray-500">doses</div>
                                                    {report.total_doses_discarded > 0 && (
                                                        <div className="text-xs text-red-500 mt-1">
                                                            Discarded: {report.total_doses_discarded}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        <div className={`h-2 w-16 bg-gray-200 rounded-full overflow-hidden mr-3`}>
                                                            <div 
                                                                className={`h-full ${parseFloat(report.vaccine_wastage_rate) > 10 ? 'bg-red-500' : 'bg-green-500'}`}
                                                                style={{ 
                                                                    width: `${Math.min(parseFloat(report.vaccine_wastage_rate) || 0, 100)}%` 
                                                                }}
                                                            ></div>
                                                        </div>
                                                        <span className={`font-medium ${wastageStatus.color}`}>
                                                            {(parseFloat(report.vaccine_wastage_rate) || 0).toFixed(2)}%
                                                        </span>
                                                    </div>
                                                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${wastageStatus.bg} ${wastageStatus.color}`}>
                                                        {wastageStatus.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        {report.stock_out_count > 0 ? (
                                                            <>
                                                                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                                                                <span className="font-medium text-red-600">{report.stock_out_count}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-green-600 font-medium flex items-center">
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                None
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(report.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            onClick={() => toggleRow(report.id)}
                                                            className="text-blue-600 hover:text-blue-900 flex items-center"
                                                        >
                                                            {isExpanded ? (
                                                                <>
                                                                    <ChevronUp className="h-4 w-4 mr-1" />
                                                                    Less
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <ChevronDown className="h-4 w-4 mr-1" />
                                                                    More
                                                                </>
                                                            )}
                                                        </button>
                                                        <Link
                                                            href={route('admin.vaccine.reports.show', report.id)}
                                                            className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            View
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                            
                                            {/* Expanded Row Details */}
                                            {isExpanded && (
                                                <tr className="bg-blue-50">
                                                    <td colSpan="8" className="px-6 py-4">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                            <div className="space-y-2">
                                                                <h4 className="font-medium text-gray-700 flex items-center">
                                                                    <Shield className="h-4 w-4 mr-2" />
                                                                    Signatories
                                                                </h4>
                                                                <div className="text-sm">
                                                                    <p className="text-gray-600">
                                                                        Health Officer: <span className="font-medium">{report.health_officer_name}</span>
                                                                    </p>
                                                                    <p className="text-gray-600">
                                                                        Head of Unit: <span className="font-medium">{report.head_of_unit_name}</span>
                                                                    </p>
                                                                    <p className="text-gray-600">
                                                                        Phone: <span className="font-medium">{report.phone_number}</span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h4 className="font-medium text-gray-700 flex items-center">
                                                                    <Activity className="h-4 w-4 mr-2" />
                                                                    Quick Stats
                                                                </h4>
                                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                                    <div className="bg-white p-2 rounded">
                                                                        <p className="text-gray-500 text-xs">Total Reports</p>
                                                                        <p className="font-medium">{report.phc?.vaccine_accountability_reports_count || 0}</p>
                                                                    </div>
                                                                    <div className="bg-white p-2 rounded">
                                                                        <p className="text-gray-500 text-xs">Compliance</p>
                                                                        <p className="font-medium text-green-600">
                                                                            {report.status === 'submitted' ? 'On Time' : 
                                                                             report.status === 'approved' ? 'Approved' : 
                                                                             report.status === 'draft' ? 'Pending' : 'Rejected'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <h4 className="font-medium text-gray-700 flex items-center">
                                                                    <Thermometer className="h-4 w-4 mr-2" />
                                                                    Cold Chain Status
                                                                </h4>
                                                                <div className="text-sm text-gray-600">
                                                                    {report.device_status && Array.isArray(report.device_status) && (
                                                                        <div>
                                                                            {report.device_status.slice(0, 2).map((device, idx) => (
                                                                                <div key={idx} className="flex justify-between">
                                                                                    <span>{device.name}:</span>
                                                                                    <span className="font-medium">
                                                                                        {device.functional || 0} functional
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {reports.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{reports.from}</span> to{' '}
                                    <span className="font-medium">{reports.to}</span> of{' '}
                                    <span className="font-medium">{reports.total}</span> results
                                </div>
                                <div className="flex space-x-2">
                                    {reports.links.map((link, index) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(link.url, localFilters, {
                                                        preserveState: true,
                                                        replace: true,
                                                    });
                                                }
                                            }}
                                            className={`px-3 py-1 rounded-md ${
                                                link.active
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Empty State */}
                {reports.data.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                        <p className="text-gray-600 mb-6">
                            {Object.values(localFilters).some(f => f) 
                                ? 'Try adjusting your filters or search criteria'
                                : 'No vaccine reports have been submitted yet.'}
                        </p>
                        {Object.values(localFilters).some(f => f) && (
                            <button
                                onClick={resetFilters}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center space-x-2"
                            >
                                <Filter className="h-5 w-5" />
                                <span>Clear All Filters</span>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}