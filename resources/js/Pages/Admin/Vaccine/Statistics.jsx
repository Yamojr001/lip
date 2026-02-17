import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
    TrendingUp, Filter, Calendar, Download, Users, FileText, AlertCircle, 
    CheckCircle, Thermometer, Syringe, Activity, Shield, Package, RefreshCw,
    Building, MapPin, Home, ArrowUpRight, ArrowDownRight, BarChart3
} from 'lucide-react';

// Filter Section Component
const FilterSection = ({ filters, dropdowns, onFilterChange, onReset }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        
        if (key === 'lga_id') {
            newFilters.ward_id = '';
            newFilters.phc_id = '';
        } else if (key === 'ward_id') {
            newFilters.phc_id = '';
        }
        
        setLocalFilters(newFilters);
    };

    const applyFilters = () => {
        onFilterChange(localFilters);
    };

    const resetFilters = () => {
        const defaultFilters = {
            lga_id: '',
            ward_id: '',
            phc_id: '',
            year: new Date().getFullYear().toString(),
            start_date: '',
            end_date: ''
        };
        setLocalFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    const wardsInLGA = localFilters.lga_id 
        ? dropdowns.wards.filter(ward => ward.lga_id == localFilters.lga_id)
        : dropdowns.wards;

    const facilitiesInWard = localFilters.ward_id
        ? dropdowns.phcs.filter(phc => phc.ward_id == localFilters.ward_id)
        : dropdowns.phcs;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Filter Vaccine Data</h3>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={resetFilters}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                    >
                        Reset
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
                        {dropdowns.lgas.map(lga => (
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
                        {wardsInLGA.map(ward => (
                            <option key={ward.id} value={ward.id}>{ward.name}</option>
                        ))}
                    </select>
                </div>

                {/* PHC Facility Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Health Facility</label>
                    <select 
                        value={localFilters.phc_id} 
                        onChange={(e) => handleFilterChange('phc_id', e.target.value)}
                        disabled={!localFilters.ward_id}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                        <option value="">All Facilities</option>
                        {facilitiesInWard.map(phc => (
                            <option key={phc.id} value={phc.id}>{phc.clinic_name}</option>
                        ))}
                    </select>
                </div>

                {/* Year Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <select 
                        value={localFilters.year} 
                        onChange={(e) => handleFilterChange('year', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Years</option>
                        {dropdowns.years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Date Range Filters */}
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
            </div>

            {/* Active Filters Display */}
            <div className="mt-4 flex flex-wrap gap-2">
                {localFilters.lga_id && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        LGA: {dropdowns.lgas.find(l => l.id == localFilters.lga_id)?.name}
                    </span>
                )}
                {localFilters.ward_id && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ward: {dropdowns.wards.find(w => w.id == localFilters.ward_id)?.name}
                    </span>
                )}
                {localFilters.phc_id && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Facility: {dropdowns.phcs.find(p => p.id == localFilters.phc_id)?.clinic_name}
                    </span>
                )}
                {localFilters.year && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Year: {localFilters.year}
                    </span>
                )}
                {(localFilters.start_date || localFilters.end_date) && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Date Range: {localFilters.start_date || 'Start'} to {localFilters.end_date || 'End'}
                    </span>
                )}
            </div>
        </div>
    );
};

// Stat Card Component
const StatCard = ({ title, value, unit, color, icon: Icon, description, trend }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                    {typeof value === 'number' ? value.toLocaleString() : value}{unit}
                </p>
                {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
                {trend && (
                    <div className={`inline-flex items-center mt-2 text-sm ${trest > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        <span className="ml-1">{Math.abs(trend)}% from previous period</span>
                    </div>
                )}
            </div>
            <div className={`p-3 rounded-full ${color.replace('border-l-4 border-', 'bg-').replace('-600', '-100')}`}>
                <Icon className={`h-6 w-6 ${color.replace('border-l-4 border-', 'text-')}`} />
            </div>
        </div>
    </div>
);

// Chart Card Wrapper
const ChartCard = ({ title, children, className = "", icon: Icon }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 ${className}`}>
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            {Icon && <Icon className="h-5 w-5 text-gray-400" />}
        </div>
        {children}
    </div>
);

export default function AdminVaccineStatistics({ 
    statistics = {}, 
    chartData = {}, 
    facilityPerformance = [], 
    monthlyTrends = [],
    lgas, 
    wards, 
    phcs,
    years,
    filters = {}
}) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const handleFilterChange = (newFilters) => {
        router.get(route('admin.vaccine.statistics'), newFilters, {
            preserveState: true,
            replace: true,
            onStart: () => setIsRefreshing(true),
            onFinish: () => setIsRefreshing(false)
        });
    };

    // Prepare chart data
    const statusDistributionData = chartData.status_distribution 
        ? Object.entries(chartData.status_distribution).map(([name, value]) => ({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value
        }))
        : [];

    const wastageDistributionData = chartData.wastage_distribution 
        ? Object.entries(chartData.wastage_distribution).map(([name, value]) => ({
            name,
            value
        }))
        : [];

    const stockOutDistributionData = chartData.stock_out_distribution 
        ? Object.entries(chartData.stock_out_distribution).map(([name, value]) => ({
            name,
            value
        }))
        : [];

    // Define colors
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const WASTAGE_COLORS = ['#10b981', '#84cc16', '#f59e0b', '#f97316', '#ef4444'];

    const statCards = [
        {
            title: 'Total Reports',
            value: statistics.total_reports || 0,
            unit: '',
            color: 'border-l-4 border-blue-600',
            icon: FileText,
            description: 'Vaccine accountability reports'
        },
        {
            title: 'Total Doses Used',
            value: statistics.total_doses_used || 0,
            unit: '',
            color: 'border-l-4 border-green-600',
            icon: Syringe,
            description: 'Vaccine doses administered'
        },
        {
            title: 'Avg. Wastage Rate',
            value: statistics.avg_wastage_rate || 0,
            unit: '%',
            color: 'border-l-4 border-yellow-600',
            icon: TrendingUp,
            description: 'Average vaccine wastage'
        },
        {
            title: 'Reports with Issues',
            value: statistics.reports_with_issues_percentage || 0,
            unit: '%',
            color: 'border-l-4 border-red-600',
            icon: AlertCircle,
            description: 'High wastage or stock outs'
        },
        {
            title: 'Total Stock Outs',
            value: statistics.total_stock_outs || 0,
            unit: '',
            color: 'border-l-4 border-purple-600',
            icon: Package,
            description: 'Vaccine stock out incidents'
        },
        {
            title: 'High Wastage Reports',
            value: statistics.high_wastage_reports || 0,
            unit: '',
            color: 'border-l-4 border-orange-600',
            icon: Thermometer,
            description: 'Reports with >10% wastage'
        }
    ];

    // Facility performance data for chart
    const topFacilitiesData = facilityPerformance.slice(0, 10).map(facility => ({
        name: facility.facility_name?.substring(0, 12) || 'Facility',
        wastageRate: facility.avg_wastage_rate || 0,
        compliance: facility.compliance_rate || 0,
        stockOuts: facility.total_stock_outs || 0,
        reports: facility.total_reports || 0,
        status: facility.status
    }));

    return (
        <AdminLayout title="Vaccine Statistics Dashboard">
            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Vaccine Statistics Dashboard</h1>
                        <p className="text-gray-600 mt-2">
                            Comprehensive overview of vaccine utilization, wastage, and cold chain management
                        </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 lg:mt-0">
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg shadow border">
                            <Calendar size={16} />
                            <span>Last updated: {new Date().toLocaleDateString()}</span>
                        </div>
                        <button
                            onClick={() => handleFilterChange(filters)}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition border border-gray-300"
                        >
                            {isRefreshing ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                            ) : (
                                <RefreshCw size={16} />
                            )}
                            Refresh
                        </button>
                        <button
                            onClick={() => {
                                const params = new URLSearchParams(filters).toString();
                                window.location.href = route('admin.vaccine.export') + '?' + params;
                            }}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            <Download size={16} />
                            Export Data
                        </button>
                    </div>
                </div>
                
                {/* Filter Section */}
                <FilterSection 
                    filters={{
                        lga_id: filters.lga_id || '',
                        ward_id: filters.ward_id || '',
                        phc_id: filters.phc_id || '',
                        year: filters.year || new Date().getFullYear().toString(),
                        start_date: filters.start_date || '',
                        end_date: filters.end_date || ''
                    }}
                    dropdowns={{ lgas, wards, phcs, years }}
                    onFilterChange={handleFilterChange}
                    onReset={() => handleFilterChange({
                        lga_id: '',
                        ward_id: '',
                        phc_id: '',
                        year: new Date().getFullYear().toString(),
                        start_date: '',
                        end_date: ''
                    })}
                />
                
                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                    {statCards.map((card, index) => (
                        <StatCard key={index} {...card} />
                    ))}
                </div>
                
                {/* Charts Section - Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Trends */}
                    <ChartCard title="Monthly Utilization Trends" icon={Activity}>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={monthlyTrends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="month" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="total_doses_used" name="Doses Used" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Line yAxisId="right" type="monotone" dataKey="avg_wastage_rate" name="Wastage Rate %" stroke="#ef4444" strokeWidth={2} />
                                    <Line yAxisId="left" type="monotone" dataKey="total_doses_discarded" name="Doses Discarded" stroke="#f59e0b" strokeWidth={2} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                    
                    {/* Report Status Distribution */}
                    <ChartCard title="Report Status Distribution" icon={Shield}>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                    >
                                        {statusDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [value, 'Reports']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>

                {/* Charts Section - Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Wastage Distribution */}
                    <ChartCard title="Wastage Rate Distribution" icon={TrendingUp}>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={wastageDistributionData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="value" name="Number of Reports" fill="#8884d8" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>

                    {/* Stock Out Distribution */}
                    <ChartCard title="Stock Out Distribution" icon={Package}>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stockOutDistributionData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                    >
                                        {stockOutDistributionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [value, 'Reports']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartCard>
                </div>
                
                {/* Facility Performance */}
                <ChartCard title="Top Facilities Performance Analysis" icon={Building}>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={topFacilitiesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="name" />
                                <YAxis yAxisId="left" />
                                <YAxis yAxisId="right" orientation="right" />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="reports" name="Reports" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Line yAxisId="right" type="monotone" dataKey="wastageRate" name="Wastage Rate %" stroke="#ef4444" strokeWidth={2} />
                                <Line yAxisId="left" type="monotone" dataKey="compliance" name="Compliance %" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
                
                {/* Detailed Statistics Table */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Vaccine Statistics</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-600">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Metric</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Value</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="bg-white">
                                    <td className="px-4 py-3 font-medium">Total Reports Submitted</td>
                                    <td className="px-4 py-3">{statistics.total_reports || 0}</td>
                                    <td className="px-4 py-3">Number of vaccine accountability reports</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-4 py-3 font-medium">Total Doses Used</td>
                                    <td className="px-4 py-3">{statistics.total_doses_used?.toLocaleString() || 0}</td>
                                    <td className="px-4 py-3">Vaccine doses administered to patients</td>
                                </tr>
                                <tr className="bg-white">
                                    <td className="px-4 py-3 font-medium">Total Doses Discarded</td>
                                    <td className="px-4 py-3">{statistics.total_doses_discarded?.toLocaleString() || 0}</td>
                                    <td className="px-4 py-3">Vaccine doses discarded due to various reasons</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-4 py-3 font-medium">Average Wastage Rate</td>
                                    <td className="px-4 py-3">{statistics.avg_wastage_rate?.toFixed(2) || 0}%</td>
                                    <td className="px-4 py-3">Average percentage of vaccines wasted</td>
                                </tr>
                                <tr className="bg-white">
                                    <td className="px-4 py-3 font-medium">Total Stock Out Incidents</td>
                                    <td className="px-4 py-3">{statistics.total_stock_outs || 0}</td>
                                    <td className="px-4 py-3">Times vaccines were out of stock</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-4 py-3 font-medium">High Wastage Reports (&gt;10%)</td>
                                    <td className="px-4 py-3">{statistics.high_wastage_reports || 0}</td>
                                    <td className="px-4 py-3">Reports with wastage rate above 10%</td>
                                </tr>
                                <tr className="bg-white">
                                    <td className="px-4 py-3 font-medium">Reports with Stock Outs</td>
                                    <td className="px-4 py-3">{statistics.reports_with_stock_outs || 0}</td>
                                    <td className="px-4 py-3">Reports indicating vaccine stock outs</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-4 py-3 font-medium">Reports with Issues</td>
                                    <td className="px-4 py-3">{statistics.reports_with_issues || 0} ({statistics.reports_with_issues_percentage || 0}%)</td>
                                    <td className="px-4 py-3">Reports with high wastage or stock outs</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                {/* Facility Performance Table */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">Facility Performance Details</h3>
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {facilityPerformance.length} Facilities
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-600">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Facility</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">LGA/Ward</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Reports</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Wastage Rate</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Stock Outs</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Compliance</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {facilityPerformance.slice(0, 15).map((facility, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-4 py-3 font-medium">{facility.facility_name || 'N/A'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500">{facility.lga || 'N/A'}</span>
                                                <span>{facility.ward || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{facility.total_reports || 0}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                facility.avg_wastage_rate >= 15 ? 'bg-red-100 text-red-800' :
                                                facility.avg_wastage_rate >= 10 ? 'bg-yellow-100 text-yellow-800' :
                                                facility.avg_wastage_rate >= 5 ? 'bg-orange-100 text-orange-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {facility.avg_wastage_rate?.toFixed(1) || 0}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{facility.total_stock_outs || 0}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                facility.compliance_rate >= 90 ? 'bg-green-100 text-green-800' :
                                                facility.compliance_rate >= 80 ? 'bg-blue-100 text-blue-800' :
                                                facility.compliance_rate >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {facility.compliance_rate?.toFixed(1) || 0}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                facility.status === 'High Risk' ? 'bg-red-100 text-red-800' :
                                                facility.status === 'Medium Risk' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {facility.status || 'Low Risk'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}