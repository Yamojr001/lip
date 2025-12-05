import React, { useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, ComposedChart,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
    Users, Activity, Hospital, Stethoscope, Baby, Heart, Shield, TrendingUp, 
    ArrowUp, ArrowDown, AlertCircle, Clock, CheckCircle, RefreshCw, 
    Calendar, Download, Filter, Search, Edit, Trash2, Plus,
    BarChart3, MapPin, Building, Target, Award, Zap,
    Syringe, TestTube, Pill, Home, Ambulance, Filter as FilterIcon
} from 'lucide-react';

// Enhanced StatCard Component
const StatCard = ({ title, value, unit, color, icon: Icon, trend, description, onClick }) => (
    <div 
        className={`bg-white p-6 rounded-2xl shadow-lg border-l-4 ${color} hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1`}
        onClick={onClick}
    >
        <div className="flex items-center justify-between">
            <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}{unit}</p>
                {description && <p className="text-xs text-gray-400 mt-1">{description}</p>}
            </div>
            <div className="flex flex-col items-end">
                <div className={`p-3 rounded-full ${color.replace('border-l-4 border-', 'bg-').replace('-600', '-100')}`}>
                    <Icon className={`h-6 w-6 ${color.replace('border-l-4 border-', 'text-')}`} />
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

// Chart Card Wrapper
const ChartCard = ({ title, children, className = "" }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-lg border border-gray-100 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        {children}
    </div>
);

// Metric Card for small stats
const MetricCard = ({ title, value, subtitle, color = "blue" }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
        red: 'bg-red-50 text-red-600'
    };

    return (
        <div className={`p-4 rounded-xl ${colors[color]}`}>
            <p className="text-sm font-medium opacity-80">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs opacity-70 mt-1">{subtitle}</p>}
        </div>
    );
};

// Alert Card Component
const AlertCard = ({ type, title, message, count, icon: Icon, onClick }) => {
    const colors = {
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100',
        danger: 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100',
        info: 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100',
        success: 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
    };

    return (
        <div 
            className={`p-4 rounded-lg border ${colors[type]} flex items-center justify-between cursor-pointer transition-colors`}
            onClick={onClick}
        >
            <div className="flex items-center space-x-3">
                <Icon className="h-5 w-5" />
                <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-sm opacity-80">{message}</p>
                </div>
            </div>
            {count > 0 && (
                <span className="bg-white px-2 py-1 rounded-full text-sm font-bold shadow-sm">
                    {count}
                </span>
            )}
        </div>
    );
};

// Filter Component
const FilterSection = ({ filters, dropdowns, onFilterChange, onReset }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        
        // Reset dependent filters
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
            start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Start of current year
            end_date: new Date().toISOString().split('T')[0] // Today
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
                    <FilterIcon className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Filter Data</h3>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* LGA Filter */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">LGA</label>
                    <select 
                        value={localFilters.lga_id} 
                        onChange={(e) => handleFilterChange('lga_id', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
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
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                        <option value="all">All Facilities</option>
                        {facilitiesInWard.map(phc => (
                            <option key={phc.id} value={phc.id}>{phc.clinic_name}</option>
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
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* End Date Filter */}
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
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Date: {localFilters.start_date} to {localFilters.end_date}
                </span>
            </div>
        </div>
    );
};

// Overview Tab Component
const OverviewTab = ({ statistics, chartData, alerts, onTabChange }) => {
    // Process data for charts
    const monthlyRegistrationsData = chartData?.monthlyRegistrations ? 
        Object.entries(chartData.monthlyRegistrations).map(([month, registrations]) => ({
            month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            registrations,
            anc4: Math.round(registrations * (statistics.anc4Rate / 100)),
            anc8: Math.round(registrations * (statistics.anc8Rate / 100))
        })) : [];

    const deliveryOutcomesData = chartData?.deliveryOutcomes || [];
    const serviceDistributionData = statistics?.serviceUtilization ? 
        Object.entries(statistics.serviceUtilization).map(([service, count]) => ({
            service,
            count
        })) : [];

    const ancCompletionData = Array.from({ length: 8 }, (_, i) => ({
        visit: `ANC${i + 1}`,
        completed: statistics.ancVisits?.[`anc${i + 1}`]?.completed || 0
    }));

    const facilityPerformanceData = Array.from({ length: 8 }, (_, i) => ({
        name: `Facility ${i + 1}`,
        performance: Math.random() * 100,
        deliveries: Math.random() * 100,
        anc4: Math.random() * 100
    }));

    // KPI Metrics
    const kpiMetrics = [
        {
            title: 'Total Patients',
            value: statistics.totalRegistered?.toLocaleString() || '0',
            unit: '',
            color: 'border-l-4 border-blue-600',
            icon: Users,
            trend: statistics.trends?.totalPatients || 0,
            description: 'Registered pregnant women'
        },
        {
            title: 'ANC4 Completion',
            value: statistics.anc4Rate || '0',
            unit: '%',
            color: 'border-l-4 border-green-600',
            icon: Stethoscope,
            trend: statistics.trends?.anc4CompletionRate || 0,
            description: 'At least 4 ANC visits'
        },
        {
            title: 'Facility Deliveries',
            value: statistics.hospitalDeliveryRate || '0',
            unit: '%',
            color: 'border-l-4 border-purple-600',
            icon: Hospital,
            trend: statistics.trends?.facilityDeliveryRate || 0,
            description: 'Deliveries in health facilities'
        },
        {
            title: 'Live Birth Rate',
            value: statistics.liveBirthRate || '0',
            unit: '%',
            color: 'border-l-4 border-yellow-600',
            icon: Baby,
            trend: statistics.trends?.liveBirthRate || 0,
            description: 'Successful live births'
        },
        {
            title: 'FP Uptake',
            value: statistics.fpUptakeRate || '0',
            unit: '%',
            color: 'border-l-4 border-pink-600',
            icon: Heart,
            trend: statistics.trends?.fpUptakeRate || 0,
            description: 'Family planning acceptance'
        }
    ];

    return (
        <div className="space-y-6">
            {/* Critical Alerts */}
            {alerts.filter(alert => alert.count > 0).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {alerts.map((alert, index) => (
                        alert.count > 0 && (
                            <AlertCard key={index} {...alert} />
                        )
                    ))}
                </div>
            )}

            {/* Real-time Data Indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                            Real-time Data • Last updated: {new Date().toLocaleTimeString()}
                        </span>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {statistics.totalRegistered || 0} total patients
                    </span>
                </div>
            </div>

            {/* KPI Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {kpiMetrics.map((metric, index) => (
                    <StatCard key={index} {...metric} />
                ))}
            </div>

            {/* ANC Completion Breakdown */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">ANC Completion Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg bg-blue-50 border-blue-200">
                        <div className="text-2xl font-bold text-blue-600">{statistics.ancCompletion?.anc1Only || 0}</div>
                        <div className="text-sm text-gray-600">Completed ANC1 Only</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-green-50 border-green-200">
                        <div className="text-2xl font-bold text-green-600">{statistics.ancCompletion?.anc2Only || 0}</div>
                        <div className="text-sm text-gray-600">Completed ANC2 Only</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-600">{statistics.ancCompletion?.anc3Only || 0}</div>
                        <div className="text-sm text-gray-600">Completed ANC3 Only</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-purple-50 border-purple-200">
                        <div className="text-2xl font-bold text-purple-600">{statistics.ancCompletion?.anc4Completed || 0}</div>
                        <div className="text-sm text-gray-600">Completed ANC4</div>
                    </div>
                </div>
            </div>

            {/* Pregnancy Tracking */}
            <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Pregnancy Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg bg-orange-50 border-orange-200">
                        <div className="text-2xl font-bold text-orange-600">{statistics.pregnancyTracking?.sevenMonths || 0}</div>
                        <div className="text-sm text-gray-600">7 Months Pregnant</div>
                        <div className="text-xs text-orange-600 mt-1">(2 months to EDD)</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-red-50 border-red-200">
                        <div className="text-2xl font-bold text-red-600">{statistics.pregnancyTracking?.eightMonths || 0}</div>
                        <div className="text-sm text-gray-600">8 Months Pregnant</div>
                        <div className="text-xs text-red-600 mt-1">(1 month to EDD)</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-pink-50 border-pink-200">
                        <div className="text-2xl font-bold text-pink-600">{statistics.pregnancyTracking?.dueThisMonth || 0}</div>
                        <div className="text-sm text-gray-600">Due This Month</div>
                        <div className="text-xs text-pink-600 mt-1">(Expected delivery this month)</div>
                    </div>
                </div>
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trends */}
                <ChartCard title="Monthly Registrations & ANC Completion">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyRegistrationsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="registrations" fill="#6366f1" stroke="#6366f1" fillOpacity={0.3} name="Registrations" />
                                <Line type="monotone" dataKey="anc4" stroke="#10b981" strokeWidth={2} name="ANC4 Completed" />
                                <Line type="monotone" dataKey="anc8" stroke="#f59e0b" strokeWidth={2} name="ANC8 Completed" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Service Distribution */}
                <ChartCard title="Service Distribution">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={serviceDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="count"
                                    label={({ service, percent }) => `${service}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {serviceDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][index % 5]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>

            {/* Secondary Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Delivery Outcomes */}
                <ChartCard title="Delivery Outcomes">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deliveryOutcomesData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {deliveryOutcomesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#10b981', '#ef4444', '#f59e0b'][index % 3]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* ANC Completion Progress */}
                <ChartCard title="ANC Completion Progress">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ancCompletionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="visit" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="completed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Facility Performance */}
                <ChartCard title="Top Facilities Performance">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={facilityPerformanceData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="name" />
                                <PolarRadiusAxis />
                                <Radar name="Performance" dataKey="performance" stroke="#6366f1" fill="#6366f1" fillOpacity={0.6} />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard title="Delivery Kits Received" value={`${statistics.kitsReceivedRate}%`} subtitle="Of deliveries" color="blue" />
                <MetricCard title="PNC within 48h" value={`${statistics.pnc1Within48hRate}%`} subtitle="Postnatal care" color="green" />
                <MetricCard title="Hospital Deliveries" value={statistics.detailedCounts?.hospitalDeliveries?.toLocaleString() || '0'} subtitle="Total" color="purple" />
                <MetricCard title="Live Births" value={statistics.detailedCounts?.liveBirths?.toLocaleString() || '0'} subtitle="Total" color="orange" />
            </div>
        </div>
    );
};

// ANC Tab Component
const AncTab = ({ ancData, statistics }) => {
    if (!ancData) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading ANC data...</p>
                </div>
            </div>
        );
    }

    const { ancVisits = {}, services = {}, payments = {}, totalPatients = 0, additionalAnc = 0 } = ancData;

    // Prepare ANC visits data for chart
    const ancVisitsData = Object.entries(ancVisits).map(([visit, data]) => ({
        visit: visit.toUpperCase(),
        completed: data.completed || 0,
        rate: data.rate || 0
    }));

    // Prepare services data for chart
    const servicesData = Object.entries(services).map(([service, count]) => ({
        service: service.replace(/_/g, ' ').toUpperCase(),
        count
    }));

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Antenatal Care Analytics</h2>
            
            {/* Real-time Data Indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                            Real-time ANC Data • {totalPatients} Total Patients
                        </span>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Last updated: {new Date().toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* ANC Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard title="ANC1 Completion" value={`${ancVisits.anc1?.rate || 0}%`} subtitle="First visit" color="blue" />
                <MetricCard title="ANC4 Completion" value={`${ancVisits.anc4?.rate || 0}%`} subtitle="Fourth visit" color="green" />
                <MetricCard title="ANC8 Completion" value={`${ancVisits.anc8?.rate || 0}%`} subtitle="Eighth visit" color="purple" />
                <MetricCard title="Additional Visits" value={additionalAnc} subtitle="Beyond schedule" color="orange" />
            </div>

            {/* ANC Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="ANC Visit Completion Rate">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={ancVisitsData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="visit" />
                                <YAxis />
                                <Tooltip />
                                <Area type="monotone" dataKey="completed" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                <ChartCard title="ANC Services Utilization">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={servicesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="service" angle={-45} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>

            {/* ANC Payments Table */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">ANC Payment Analysis</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 font-semibold">ANC Visit</th>
                                <th className="px-4 py-2 font-semibold">Patients Paid</th>
                                <th className="px-4 py-2 font-semibold">Total Amount (₦)</th>
                                <th className="px-4 py-2 font-semibold">Average Amount (₦)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(payments).map(([visit, data], index) => (
                                <tr key={visit} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-4 py-2 font-medium">{visit.toUpperCase()}</td>
                                    <td className="px-4 py-2">{data.paid_count || 0}</td>
                                    <td className="px-4 py-2">₦{data.total_amount?.toLocaleString() || 0}</td>
                                    <td className="px-4 py-2">₦{data.average_amount?.toLocaleString() || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Delivery Tab Component
const DeliveryTab = ({ deliveryData, statistics }) => {
    if (!deliveryData) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading delivery data...</p>
                </div>
            </div>
        );
    }

    const {
        totalDelivered = 0,
        deliveryTypes = {},
        deliveryOutcomes = {},
        deliveryLocations = {},
        kitsReceived = 0,
        facilityDeliveries = 0,
        homeDeliveries = 0,
        traditionalDeliveries = 0
    } = deliveryData;

    // Prepare data for charts
    const deliveryLocationData = [
        { name: 'Health Facility', value: facilityDeliveries },
        { name: 'Home', value: homeDeliveries },
        { name: 'Traditional', value: traditionalDeliveries }
    ];

    const deliveryTypeData = Object.entries(deliveryTypes).map(([type, count]) => ({
        type,
        count
    }));

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Delivery Services Analytics</h2>
            
            {/* Real-time Data Indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                            Real-time Delivery Data • {totalDelivered} Total Deliveries
                        </span>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Last updated: {new Date().toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* Delivery Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-blue-600">
                    <Baby className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{totalDelivered}</p>
                    <p className="text-sm text-gray-600">Total Deliveries</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-green-600">
                    <Hospital className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{facilityDeliveries}</p>
                    <p className="text-sm text-gray-600">Facility Deliveries</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-yellow-600">
                    <Home className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{homeDeliveries}</p>
                    <p className="text-sm text-gray-600">Home Deliveries</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-orange-600">
                    <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{traditionalDeliveries}</p>
                    <p className="text-sm text-gray-600">Traditional Deliveries</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Delivery Location Distribution">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deliveryLocationData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#f59e0b" />
                                    <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                <ChartCard title="Delivery Type Analysis">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={deliveryTypeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="type" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>

            {/* Delivery Outcomes */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Delivery Outcomes</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(deliveryOutcomes).map(([outcome, count], index) => (
                        <div key={outcome} className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="font-semibold text-blue-700">{outcome}</p>
                            <p className="text-2xl font-bold text-blue-600">{count}</p>
                            <p className="text-xs text-blue-600 mt-1">
                                {((count / totalDelivered) * 100).toFixed(1)}% of deliveries
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Immunization Tab Component
const ImmunizationTab = ({ immunizationData, statistics }) => {
    if (!immunizationData) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading immunization data...</p>
                </div>
            </div>
        );
    }

    const {
        totalChildren = 0,
        vaccines = {},
        scheduleCompliance = {},
        timelyVaccination = 0
    } = immunizationData;

    // Key vaccines for quick overview
    const keyVaccines = ['bcg', 'penta1', 'penta3', 'measles', 'yellow_fever', 'mcv2'];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Child Immunization Analytics</h2>
            
            {/* Real-time Data Indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                            Real-time Data • Last updated: {new Date().toLocaleTimeString()}
                        </span>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {totalChildren} children in system
                    </span>
                </div>
            </div>

            {/* Immunization Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Children with DOB</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{totalChildren}</p>
                            <p className="text-xs text-gray-400 mt-1">Total registered children</p>
                        </div>
                        <Baby className="h-8 w-8 text-blue-600 opacity-80" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Timely Vaccination</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{timelyVaccination}%</p>
                            <p className="text-xs text-gray-400 mt-1">Vaccines administered on schedule</p>
                        </div>
                        <CheckCircle className="h-8 w-8 text-green-600 opacity-80" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Fully Compliant</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{scheduleCompliance.fully_compliant_rate || 0}%</p>
                            <p className="text-xs text-gray-400 mt-1">Complete immunization schedule</p>
                        </div>
                        <Award className="h-8 w-8 text-purple-600 opacity-80" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-600">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">BCG Coverage</h3>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{vaccines.bcg?.rate || 0}%</p>
                            <p className="text-xs text-gray-400 mt-1">Primary vaccination coverage</p>
                        </div>
                        <Activity className="h-8 w-8 text-orange-600 opacity-80" />
                    </div>
                </div>
            </div>

            {/* Key Vaccine Coverage */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Vaccine Coverage Rates</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {keyVaccines.map((vaccine) => {
                        const vaccineData = vaccines[vaccine] || { received: 0, rate: 0 };
                        return (
                            <div key={vaccine} className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                                <p className="font-semibold text-blue-700 uppercase">{vaccine}</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {vaccineData.rate || 0}%
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                    {vaccineData.received || 0} / {totalChildren}
                                </p>
                                <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                                    <div 
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                                        style={{ width: `${vaccineData.rate || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Family Planning Tab Component
const FpTab = ({ fpData, statistics }) => {
    if (!fpData) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading family planning data...</p>
                </div>
            </div>
        );
    }

    const {
        totalUsers = 0,
        uptakeRate = 0,
        methods = {},
        fpInterest = {}
    } = fpData;

    // Prepare method data for charts
    const methodData = Object.entries(methods).map(([method, data]) => ({
        method: method.replace(/_/g, ' ').toUpperCase(),
        count: data.count,
        percentage: data.percentage
    }));

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Family Planning Analytics</h2>
            
            {/* Real-time Data Indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                            Real-time FP Data • {totalUsers} Active Users
                        </span>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Last updated: {new Date().toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* FP Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-pink-600">
                    <Heart className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
                    <p className="text-sm text-gray-600">FP Users</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-green-600">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{uptakeRate}%</p>
                    <p className="text-sm text-gray-600">Uptake Rate</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-purple-600">
                    <Pill className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{Object.keys(methods).length}</p>
                    <p className="text-sm text-gray-600">Methods Available</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Method Distribution */}
                <ChartCard title="Family Planning Method Distribution">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={methodData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="count"
                                    nameKey="method"
                                    label={({ method, percentage }) => `${method}: ${percentage}%`}
                                >
                                    {methodData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#d946ef'][index % 5]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name, props) => [
                                    `${value} users (${props.payload.percentage}%)`, 
                                    name
                                ]} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Method Usage Bar Chart */}
                <ChartCard title="Method Usage Comparison">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={methodData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="method" angle={-45} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>
        </div>
    );
};

// HIV Tab Component
const HivTab = ({ hivData, statistics }) => {
    if (!hivData) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading HIV data...</p>
                </div>
            </div>
        );
    }

    const {
        tested = 0,
        positive = 0,
        negative = 0,
        results_pending = 0,
        not_tested = 0,
        testing_rate = 0,
        positivity_rate = 0
    } = hivData;

    const hivOverviewData = [
        { name: 'Tested', value: tested },
        { name: 'Positive', value: positive },
        { name: 'Negative', value: negative },
        { name: 'Pending Results', value: results_pending },
        { name: 'Not Tested', value: not_tested }
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">HIV Services Analytics</h2>
            
            {/* Real-time Data Indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                            Real-time HIV Data • {testing_rate}% Testing Rate
                        </span>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Last updated: {new Date().toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* HIV Testing Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-blue-600">
                    <TestTube className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{tested}</p>
                    <p className="text-sm text-gray-600">Tested</p>
                    <p className="text-xs text-blue-600">{testing_rate}% rate</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-green-600">
                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{negative}</p>
                    <p className="text-sm text-gray-600">Negative</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-red-600">
                    <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{positive}</p>
                    <p className="text-sm text-gray-600">Positive</p>
                    <p className="text-xs text-red-600">{positivity_rate}% rate</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg text-center border-l-4 border-yellow-600">
                    <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{results_pending}</p>
                    <p className="text-sm text-gray-600">Pending Results</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* HIV Testing Status */}
                <ChartCard title="HIV Testing Status">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={hivOverviewData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#ef4444" />
                                    <Cell fill="#22c55e" />
                                    <Cell fill="#f59e0b" />
                                    <Cell fill="#6366f1" />
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                {/* Test Results Distribution */}
                <ChartCard title="Test Results Distribution">
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { result: 'Negative', count: negative },
                                { result: 'Positive', count: positive },
                                { result: 'Pending', count: results_pending }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="result" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>
        </div>
    );
};

// Facilities Tab Component
const FacilitiesTab = ({ facilityStats, statistics }) => {
    if (!facilityStats || !Array.isArray(facilityStats)) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading facilities data...</p>
                </div>
            </div>
        );
    }

    const facilityPerformanceData = facilityStats.slice(0, 8).map(facility => ({
        name: facility.facility_name?.substring(0, 12) || 'Facility',
        performance: facility.performance_score || 0,
        deliveries: facility.facility_delivery_rate || 0,
        anc4: facility.anc4_rate || 0
    }));

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Health Facilities Performance</h2>
            
            {/* Real-time Data Indicator */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Activity className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">
                            Real-time Facilities Data • {facilityStats.length} Total Facilities
                        </span>
                    </div>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        Last updated: {new Date().toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* Top Performing Facilities */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Top Performing Facilities</h3>
                <div className="space-y-4">
                    {facilityStats.slice(0, 5).map((facility, index) => (
                        <div key={facility.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                            <div className="flex items-center space-x-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                    index === 1 ? 'bg-gray-100 text-gray-600' :
                                    index === 2 ? 'bg-orange-100 text-orange-600' :
                                    'bg-blue-100 text-blue-600'
                                }`}>
                                    <span className="font-bold">{index + 1}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{facility.facility_name}</p>
                                    <p className="text-sm text-gray-600">{facility.ward}, {facility.lga}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">{facility.performance_score}</p>
                                <p className="text-sm text-gray-600">Performance Score</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Facility Performance Chart */}
            <ChartCard title="Facility Performance Comparison">
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={facilityPerformanceData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={80} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="performance" name="Performance Score" fill="#6366f1" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="deliveries" name="Delivery Rate %" fill="#10b981" radius={[0, 4, 4, 0]} />
                            <Bar dataKey="anc4" name="ANC4 Rate %" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </ChartCard>
        </div>
    );
};

// Main Dashboard Component
export default function Statistics() {
    const { 
        statistics = {}, 
        chartData = {}, 
        currentYear, 
        patients = [], 
        facilities = [],
        ancData = {},
        deliveryData = {},
        immunizationData = {},
        fpData = {},
        hivData = {},
        facilityStats = [],
        dropdowns = {},
        filters: initialFilters = {}
    } = usePage().props;
    
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [filters, setFilters] = useState(initialFilters);

    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        router.get(route('admin.statistics'), newFilters, {
            preserveState: true,
            replace: true,
            onStart: () => setIsRefreshing(true),
            onFinish: () => setIsRefreshing(false)
        });
    };

    // Handle real-time data refresh
    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            preserveScroll: true,
            onFinish: () => setIsRefreshing(false)
        });
    };

    // Critical alerts data
    const criticalAlerts = [
        {
            type: 'warning',
            title: 'Pending ANC Visits',
            message: 'Patients with overdue ANC visits',
            count: statistics.pendingAnc8 || 0,
            icon: Clock,
            onClick: () => setActiveTab('anc')
        },
        {
            type: 'danger',
            title: 'Overdue Deliveries',
            message: 'Patients past their EDD without delivery recorded',
            count: statistics.overdueDeliveries || 0,
            icon: AlertCircle,
            onClick: () => setActiveTab('delivery')
        },
        {
            type: 'info',
            title: 'High Risk Pregnancies',
            message: 'Patients requiring special attention',
            count: statistics.highRiskPregnancies || 0,
            icon: Activity,
            onClick: () => setActiveTab('overview')
        }
    ];

    // Tab Navigation
    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'anc', label: 'ANC Services', icon: Stethoscope },
        { id: 'delivery', label: 'Delivery', icon: Baby },
        { id: 'immunization', label: 'Immunization', icon: Activity },
        { id: 'fp', label: 'Family Planning', icon: Heart },
        { id: 'hiv', label: 'HIV Services', icon: Shield },
        { id: 'facilities', label: 'Facilities', icon: Building }
    ];

    // Render tab content
    const renderTabContent = () => {
        const tabProps = { statistics, onTabChange: setActiveTab };

        switch (activeTab) {
            case 'overview':
                return <OverviewTab 
                    {...tabProps} 
                    chartData={chartData}
                    alerts={criticalAlerts}
                />;
            case 'anc':
                return <AncTab {...tabProps} ancData={ancData} />;
            case 'delivery':
                return <DeliveryTab {...tabProps} deliveryData={deliveryData} />;
            case 'immunization':
                return <ImmunizationTab {...tabProps} immunizationData={immunizationData} />;
            case 'fp':
                return <FpTab {...tabProps} fpData={fpData} />;
            case 'hiv':
                return <HivTab {...tabProps} hivData={hivData} />;
            case 'facilities':
                return <FacilitiesTab {...tabProps} facilityStats={facilityStats} />;
            default:
                return <OverviewTab 
                    {...tabProps} 
                    chartData={chartData}
                    alerts={criticalAlerts}
                />;
        }
    };

    return (
        <AdminLayout title="Statistics Dashboard">
            <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Maternal & Child Health Dashboard</h1>
                        <p className="text-gray-600 mt-2">
                            Comprehensive overview of healthcare services and patient management
                        </p>
                    </div>
                    <div className="flex items-center gap-4 mt-4 lg:mt-0">
                        <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-3 py-2 rounded-lg shadow border">
                            <Calendar size={16} />
                            <span>{currentYear}</span>
                        </div>
                        <button
                            onClick={handleRefresh}
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
                    </div>
                </div>

                {/* Filter Section */}
                <FilterSection 
                    filters={filters}
                    dropdowns={dropdowns}
                    onFilterChange={handleFilterChange}
                    onReset={() => handleFilterChange({
                        lga_id: 'all',
                        ward_id: 'all',
                        phc_id: 'all',
                        start_date: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
                        end_date: new Date().toISOString().split('T')[0]
                    })}
                />

                {/* Tab Navigation */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="flex border-b overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'border-purple-600 text-purple-600 bg-purple-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content */}
                <div className="min-h-screen">
                    {isRefreshing ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading data...</p>
                            </div>
                        </div>
                    ) : (
                        renderTabContent()
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}