import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, ComposedChart
} from 'recharts';
import { 
    Users, Activity, TrendingUp, Filter, Calendar, Download,
    Baby, AlertCircle, CheckCircle, Heart, Pill, Home, Hospital
} from 'lucide-react';

// Reuse FilterSection from Statistics.jsx
const FilterSection = ({ filters, dropdowns, onFilterChange, onReset }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        
        if (key === 'lga_id') {
            newFilters.ward_id = 'all';
            newFilters.phc_id = 'all';
        } else if (key === 'ward_id') {
            newFilters.phc_id = 'all';
        }
        
        setLocalFilters(newFilters);
    };

    const applyFilters = () => {
        onFilterChange(localFilters);
    };

    const resetFilters = () => {
        const defaultFilters = {
            lga_id: 'all',
            ward_id: 'all',
            phc_id: 'all',
            year: new Date().getFullYear().toString(),
            month: 'all',
            start_date: '',
            end_date: ''
        };
        setLocalFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    const wardsInLGA = localFilters.lga_id !== 'all' 
        ? dropdowns.wards.filter(ward => ward.lga_id == localFilters.lga_id)
        : dropdowns.wards;

    const facilitiesInWard = localFilters.ward_id !== 'all'
        ? dropdowns.phcs.filter(phc => phc.ward_id == localFilters.ward_id)
        : dropdowns.phcs;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Filter Nutrition Data</h3>
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
                        className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="all">All LGAs</option>
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
                        disabled={localFilters.lga_id === 'all'}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                    >
                        <option value="all">All Wards</option>
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
                        disabled={localFilters.ward_id === 'all'}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                    >
                        <option value="all">All Facilities</option>
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
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="all">All Years</option>
                        {dropdowns.years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                {/* Month Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                    <select 
                        value={localFilters.month} 
                        onChange={(e) => handleFilterChange('month', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="all">All Months</option>
                        {dropdowns.months.map(month => (
                            <option key={month} value={month}>{month}</option>
                        ))}
                    </select>
                </div>

                {/* Start Date Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input 
                        type="date" 
                        value={localFilters.start_date} 
                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                </div>

                {/* End Date Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input 
                        type="date" 
                        value={localFilters.end_date} 
                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                </div>
            </div>

            {/* Active Filters Display */}
            <div className="mt-4 flex flex-wrap gap-2">
                {localFilters.lga_id !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        LGA: {dropdowns.lgas.find(l => l.id == localFilters.lga_id)?.name}
                    </span>
                )}
                {localFilters.ward_id !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Ward: {dropdowns.wards.find(w => w.id == localFilters.ward_id)?.name}
                    </span>
                )}
                {localFilters.phc_id !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Facility: {dropdowns.phcs.find(p => p.id == localFilters.phc_id)?.clinic_name}
                    </span>
                )}
                {localFilters.year !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Year: {localFilters.year}
                    </span>
                )}
                {localFilters.month !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                        Month: {localFilters.month}
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
const StatCard = ({ title, value, unit, color, icon: Icon, description }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg border-l-4 ${color}`}>
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}{unit}</p>
                {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
            </div>
            <div className={`p-3 rounded-full ${color.replace('border-l-4 border-', 'bg-').replace('-600', '-100')}`}>
                <Icon className={`h-6 w-6 ${color.replace('border-l-4 border-', 'text-')}`} />
            </div>
        </div>
    </div>
);

export default function AdminNutritionStatistics() {
    const { 
        statistics = {}, 
        monthlyData = {}, 
        facilityPerformance = [], 
        years, 
        months,
        lgas, 
        wards, 
        phcs,
        filters = {}
    } = usePage().props;
    
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const handleFilterChange = (newFilters) => {
        router.get(route('admin.nutrition.statistics'), newFilters, {
            preserveState: true,
            replace: true,
            onStart: () => setIsRefreshing(true),
            onFinish: () => setIsRefreshing(false)
        });
    };
    
    // Prepare chart data
    const monthlyTrendData = Object.entries(monthlyData).flatMap(([year, monthsData]) =>
        Object.entries(monthsData).map(([month, data]) => ({
            name: `${month.slice(0, 3)} ${year}`,
            screened: data.total_screened || 0,
            sam: data.total_sam || 0,
            mam: data.total_mam || 0,
            rutf: data.total_rutf || 0
        }))
    );
    
    const nutritionStatusData = [
        { name: 'Normal', value: statistics.total_normal || 0, color: '#3b82f6' },
        { name: 'MAM', value: statistics.total_mam || 0, color: '#f59e0b' },
        { name: 'SAM', value: statistics.total_sam || 0, color: '#ef4444' }
    ];
    
    const facilityData = facilityPerformance.slice(0, 10).map(facility => ({
        name: facility.facility_name?.substring(0, 15) || 'Facility',
        screened: facility.total_screened || 0,
        samRate: facility.avg_sam_rate || 0,
        mamRate: facility.avg_mam_rate || 0
    }));
    
    const statCards = [
        {
            title: 'Total Children Screened',
            value: statistics.total_children_screened?.toLocaleString() || '0',
            unit: '',
            color: 'border-l-4 border-blue-600',
            icon: Users,
            description: 'Children screened for malnutrition'
        },
        {
            title: 'SAM Cases',
            value: statistics.total_sam?.toLocaleString() || '0',
            unit: '',
            color: 'border-l-4 border-red-600',
            icon: AlertCircle,
            description: 'Severe Acute Malnutrition'
        },
        {
            title: 'MAM Cases',
            value: statistics.total_mam?.toLocaleString() || '0',
            unit: '',
            color: 'border-l-4 border-yellow-600',
            icon: Activity,
            description: 'Moderate Acute Malnutrition'
        },
        {
            title: 'RUTF Given',
            value: statistics.total_rutf_given?.toLocaleString() || '0',
            unit: '',
            color: 'border-l-4 border-green-600',
            icon: Pill,
            description: 'Ready-to-Use Therapeutic Food'
        },
        {
            title: 'Exclusive Breastfeeding',
            value: statistics.total_exclusive_breastfeeding?.toLocaleString() || '0',
            unit: '',
            color: 'border-l-4 border-pink-600',
            icon: Heart,
            description: '0-6 months exclusively breastfed'
        },
        {
            title: 'MIYCF Counselled',
            value: statistics.total_miycf_counselled?.toLocaleString() || '0',
            unit: '',
            color: 'border-l-4 border-purple-600',
            icon: Users,
            description: 'Pregnant women & caregivers counselled'
        }
    ];
    
    return (
        <AdminLayout title="Nutrition Statistics Dashboard">
            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Nutrition Statistics Dashboard</h1>
                        <p className="text-gray-600 mt-2">
                            Comprehensive overview of nutrition screening and interventions
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
                                <Activity size={16} />
                            )}
                            Refresh
                        </button>
                        <button
                            onClick={() => {
                                const params = new URLSearchParams(filters).toString();
                                window.location.href = route('admin.nutrition.export') + '?' + params;
                            }}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            <Download size={16} />
                            Export Data
                        </button>
                    </div>
                </div>
                
                {/* Filter Section */}
                <FilterSection 
                    filters={{
                        lga_id: filters.lga_id || 'all',
                        ward_id: filters.ward_id || 'all',
                        phc_id: filters.phc_id || 'all',
                        year: filters.year || new Date().getFullYear().toString(),
                        month: filters.month || 'all',
                        start_date: filters.start_date || '',
                        end_date: filters.end_date || ''
                    }}
                    dropdowns={{ lgas, wards, phcs, years, months }}
                    onFilterChange={handleFilterChange}
                    onReset={() => handleFilterChange({
                        lga_id: 'all',
                        ward_id: 'all',
                        phc_id: 'all',
                        year: new Date().getFullYear().toString(),
                        month: 'all',
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
                
                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Trends */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Screening Trends</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={monthlyTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="screened" name="Children Screened" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    <Line type="monotone" dataKey="sam" name="SAM Cases" stroke="#ef4444" strokeWidth={2} />
                                    <Line type="monotone" dataKey="mam" name="MAM Cases" stroke="#f59e0b" strokeWidth={2} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    {/* Nutrition Status Distribution */}
                    <div className="bg-white p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Nutrition Status Distribution</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={nutritionStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                    >
                                        {nutritionStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                
                {/* Facility Performance */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Facilities Performance</h3>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={facilityData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" width={120} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="screened" name="Children Screened" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="samRate" name="SAM Rate %" fill="#ef4444" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="mamRate" name="MAM Rate %" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                {/* Detailed Statistics Table */}
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Nutrition Statistics</h3>
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
                                    <td className="px-4 py-3 font-medium">Total Reports</td>
                                    <td className="px-4 py-3">{statistics.total_reports || 0}</td>
                                    <td className="px-4 py-3">Number of nutrition reports submitted</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-4 py-3 font-medium">Total Children Screened</td>
                                    <td className="px-4 py-3">{statistics.total_children_screened || 0}</td>
                                    <td className="px-4 py-3">Children screened for malnutrition</td>
                                </tr>
                                <tr className="bg-white">
                                    <td className="px-4 py-3 font-medium">SAM Cases</td>
                                    <td className="px-4 py-3">{statistics.total_sam || 0}</td>
                                    <td className="px-4 py-3">Severe Acute Malnutrition cases identified</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-4 py-3 font-medium">MAM Cases</td>
                                    <td className="px-4 py-3">{statistics.total_mam || 0}</td>
                                    <td className="px-4 py-3">Moderate Acute Malnutrition cases identified</td>
                                </tr>
                                <tr className="bg-white">
                                    <td className="px-4 py-3 font-medium">Oedema Cases</td>
                                    <td className="px-4 py-3">{statistics.total_oedema || 0}</td>
                                    <td className="px-4 py-3">Children with oedema</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-4 py-3 font-medium">Albendazole Given</td>
                                    <td className="px-4 py-3">{statistics.total_albendazole || 0}</td>
                                    <td className="px-4 py-3">Albendazole doses administered</td>
                                </tr>
                                <tr className="bg-white">
                                    <td className="px-4 py-3 font-medium">VAS Given</td>
                                    <td className="px-4 py-3">{statistics.total_vas || 0}</td>
                                    <td className="px-4 py-3">Vitamin A Supplementation doses</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-4 py-3 font-medium">MNP Given</td>
                                    <td className="px-4 py-3">{statistics.total_mnp_given || 0}</td>
                                    <td className="px-4 py-3">Multiple Micronutrient Powder distributed</td>
                                </tr>
                                <tr className="bg-white">
                                    <td className="px-4 py-3 font-medium">MIYCF Counselling</td>
                                    <td className="px-4 py-3">{statistics.total_miycf_counselled || 0}</td>
                                    <td className="px-4 py-3">Pregnant women and caregivers counselled</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}