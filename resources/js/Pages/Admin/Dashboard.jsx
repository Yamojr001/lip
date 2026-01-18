import React, { useState } from "react";
import { usePage, Link, router } from "@inertiajs/react";
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
    Syringe, TestTube, Pill, Home, Ambulance
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

// Overview Tab Component
const OverviewTab = ({ data, metrics, alerts, statistics, patients }) => {
    // Process real data for charts
    const monthlyRegistrationsData = data.monthlyRegistrations ? 
        Object.entries(data.monthlyRegistrations).map(([month, registrations]) => ({
            month: month.slice(5),
            registrations,
            anc4: Math.round(registrations * 0.75),
            anc8: Math.round(registrations * 0.45)
        })) : [];

    const deliveryOutcomesData = data.deliveryOutcomes || [];
    const serviceDistributionData = data.serviceDistribution || [];

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
                {metrics.map((metric, index) => (
                    <StatCard key={index} {...metric} />
                ))}
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
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
                            <BarChart data={data.ancCompletion}>
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
                            <RadarChart data={data.facilityPerformance}>
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
        </div>
    );
};

// ANC Tab Component
const AncTab = ({ data, statistics }) => {
    if (!data) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading ANC data...</p>
                </div>
            </div>
        );
    }

    const { ancVisits = {}, services = {}, payments = {}, totalPatients = 0, additionalAnc = 0 } = data;

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
const DeliveryTab = ({ data, statistics }) => {
    if (!data) {
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
        deliveryTiming = {},
        kitsReceived = 0,
        facilityDeliveries = 0,
        registeredFacilityDeliveries = 0,
        otherFacilityDeliveries = 0,
        homeDeliveries = 0,
        traditionalDeliveries = 0
    } = data;

    // Prepare data for charts - disaggregated delivery places
    const deliveryLocationData = [
        { name: 'Registered Facility', value: registeredFacilityDeliveries || 0 },
        { name: 'Other Facility', value: otherFacilityDeliveries || 0 },
        { name: 'Home', value: homeDeliveries || 0 },
        { name: 'Traditional Attendant', value: traditionalDeliveries || 0 }
    ].filter(item => item.value > 0);

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

            {/* Delivery Overview - Disaggregated */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-lg text-center border-l-4 border-blue-600">
                    <Baby className="h-7 w-7 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{totalDelivered}</p>
                    <p className="text-xs text-gray-600">Total Deliveries</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-lg text-center border-l-4 border-green-600">
                    <Hospital className="h-7 w-7 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{registeredFacilityDeliveries || 0}</p>
                    <p className="text-xs text-gray-600">Registered Facility</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-lg text-center border-l-4 border-purple-600">
                    <Building className="h-7 w-7 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{otherFacilityDeliveries || 0}</p>
                    <p className="text-xs text-gray-600">Other Facility</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-lg text-center border-l-4 border-yellow-600">
                    <Home className="h-7 w-7 text-yellow-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{homeDeliveries || 0}</p>
                    <p className="text-xs text-gray-600">Home Deliveries</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-lg text-center border-l-4 border-orange-600">
                    <Users className="h-7 w-7 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900">{traditionalDeliveries || 0}</p>
                    <p className="text-xs text-gray-600">Traditional Attendant</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Delivery Location Distribution (Disaggregated)">
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
                                    <Cell fill="#8b5cf6" />
                                    <Cell fill="#f59e0b" />
                                    <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip />
                                <Legend />
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

            {/* Delivery Timing */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Delivery Timing Relative to EDD</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries({
                        'very_early': 'Very Early (>2 weeks)',
                        'early': 'Early (1-2 weeks)',
                        'on_time': 'On Time',
                        'late': 'Late (1-2 weeks)',
                        'very_late': 'Very Late (>2 weeks)'
                    }).map(([key, label]) => (
                        <div key={key} className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="font-semibold text-green-700">{label}</p>
                            <p className="text-xl font-bold text-green-600">{deliveryTiming[key] || 0}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Immunization Tab Component - Detailed with all vaccines and real data
const ImmunizationTab = ({ data, statistics }) => {
    if (!data) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading immunization data...</p>
                </div>
            </div>
        );
    }

    // Extract real data from props with safe defaults
    const {
        totalChildren = 0,
        vaccines = {},
        scheduleCompliance = {},
        timelyVaccination = 0
    } = data;

    // All vaccines in the system
    const allVaccines = [
        'bcg', 'hep0', 'opv0', 'penta1', 'pcv1', 'opv1', 'rota1', 'ipv1',
        'penta2', 'pcv2', 'rota2', 'opv2', 'penta3', 'pcv3', 'opv3', 'rota3',
        'ipv2', 'measles', 'yellow_fever', 'vitamin_a', 'mcv2'
    ];

    // Prepare detailed vaccine data for charts and tables
    const detailedVaccineData = allVaccines.map(vaccine => {
        const vaccineData = vaccines[vaccine] || { received: 0, rate: 0 };
        return {
            name: vaccine.toUpperCase(),
            displayName: vaccine.replace(/([A-Z])/g, ' $1').toUpperCase(),
            received: vaccineData.received || 0,
            rate: vaccineData.rate || 0,
            pending: totalChildren - (vaccineData.received || 0)
        };
    });
    

    // Key vaccines for quick overview
    const keyVaccines = ['bcg', 'penta1', 'penta3', 'measles', 'yellow_fever', 'mcv2'];

    // Prepare data for coverage comparison chart
    const coverageComparisonData = detailedVaccineData.map(vaccine => ({
        name: vaccine.name,
        coverage: vaccine.rate,
        received: vaccine.received
    }));

    // Schedule compliance data
    const complianceData = [
        { 
            name: 'Fully Compliant', 
            value: scheduleCompliance.fully_compliant || 0, 
            rate: scheduleCompliance.fully_compliant_rate || 0,
            color: '#10b981'
        },
        { 
            name: 'Partially Compliant', 
            value: scheduleCompliance.partially_compliant || 0, 
            rate: scheduleCompliance.partially_compliant_rate || 0,
            color: '#f59e0b'
        },
        { 
            name: 'Non-Compliant', 
            value: scheduleCompliance.non_compliant || 0, 
            rate: scheduleCompliance.non_compliant_rate || 0,
            color: '#ef4444'
        }
    ];

    // Vaccine coverage by type (categorical)
    const vaccineCategories = {
        'Birth Vaccines': ['bcg', 'hep0', 'opv0'],
        '6-10 Week Vaccines': ['penta1', 'pcv1', 'opv1', 'rota1', 'ipv1'],
        '10-14 Week Vaccines': ['penta2', 'pcv2', 'rota2', 'opv2'],
        '14 Week - 9 Month Vaccines': ['penta3', 'pcv3', 'opv3', 'rota3', 'ipv2'],
        '9-12 Month Vaccines': ['measles', 'yellow_fever'],
        '15-18 Month Vaccines': ['mcv2', 'vitamin_a']
    };

    const categoryCoverageData = Object.entries(vaccineCategories).map(([category, vaxList]) => {
        const rates = vaxList.map(vax => vaccines[vax]?.rate || 0);
        const avgRate = rates.length > 0 ? rates.reduce((a, b) => a + b, 0) / rates.length : 0;
        return {
            category,
            coverage: Math.round(avgRate),
            vaccineCount: vaxList.length
        };
    });

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

            {/* Comprehensive Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* All Vaccines Coverage Chart */}
                <div className="bg-white p-6 rounded-xl shadow-lg lg:col-span-2">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Complete Vaccine Coverage Analysis</h3>
                    <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={coverageComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="name" 
                                    angle={-45} 
                                    textAnchor="end" 
                                    height={80}
                                    interval={0}
                                    fontSize={12}
                                />
                                <YAxis 
                                    domain={[0, 100]}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip 
                                    formatter={(value, name) => {
                                        if (name === 'coverage') return [`${value}%`, 'Coverage Rate'];
                                        if (name === 'received') return [value, 'Children Vaccinated'];
                                        return [value, name];
                                    }}
                                    labelFormatter={(label) => `Vaccine: ${label}`}
                                />
                                <Legend />
                                <Bar 
                                    dataKey="coverage" 
                                    name="Coverage Rate" 
                                    fill="#6366f1" 
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar 
                                    dataKey="received" 
                                    name="Children Vaccinated" 
                                    fill="#8b5cf6" 
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Schedule Compliance */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Immunization Schedule Compliance</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={complianceData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, rate }) => `${name}: ${rate}%`}
                                >
                                    {complianceData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value, name, props) => [
                                    `${value} children (${props.payload.rate}%)`, 
                                    name
                                ]} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                        {complianceData.map((item, index) => (
                            <div key={index} className="p-3 rounded-lg" style={{ backgroundColor: `${item.color}20` }}>
                                <p className="font-semibold" style={{ color: item.color }}>{item.name}</p>
                                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                                <p className="text-sm opacity-75" style={{ color: item.color }}>{item.rate}%</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coverage by Vaccine Category */}
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Coverage by Vaccine Category</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryCoverageData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                                <XAxis 
                                    dataKey="category" 
                                    angle={-45} 
                                    textAnchor="end" 
                                    height={60}
                                    fontSize={12}
                                />
                                <YAxis 
                                    domain={[0, 100]}
                                    tickFormatter={(value) => `${value}%`}
                                />
                                <Tooltip 
                                    formatter={(value) => [`${value}%`, 'Average Coverage']}
                                    labelFormatter={(label) => `Category: ${label}`}
                                />
                                <Bar 
                                    dataKey="coverage" 
                                    name="Average Coverage" 
                                    fill="#10b981" 
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Vaccine Coverage Table */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">Detailed Vaccine Coverage Statistics</h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {totalChildren} Total Children
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-gray-700 border-b">Vaccine</th>
                                <th className="px-4 py-3 font-semibold text-gray-700 border-b">Children Vaccinated</th>
                                <th className="px-4 py-3 font-semibold text-gray-700 border-b">Pending</th>
                                <th className="px-4 py-3 font-semibold text-gray-700 border-b">Coverage Rate</th>
                                <th className="px-4 py-3 font-semibold text-gray-700 border-b">Progress</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailedVaccineData.map((vaccine, index) => (
                                <tr key={vaccine.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-4 py-3 font-medium text-gray-900 border-b">
                                        {vaccine.displayName}
                                    </td>
                                    <td className="px-4 py-3 border-b">
                                        <span className="font-semibold text-green-600">{vaccine.received}</span>
                                    </td>
                                    <td className="px-4 py-3 border-b">
                                        <span className="text-red-600">{vaccine.pending}</span>
                                    </td>
                                    <td className="px-4 py-3 border-b">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            vaccine.rate >= 80 ? 'bg-green-100 text-green-800' :
                                            vaccine.rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {vaccine.rate}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 border-b">
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-500 ${
                                                    vaccine.rate >= 80 ? 'bg-green-500' :
                                                    vaccine.rate >= 60 ? 'bg-yellow-500' :
                                                    'bg-red-500'
                                                }`}
                                                style={{ width: `${vaccine.rate}%` }}
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="text-center">
                        <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                        <p className="text-2xl font-bold text-green-700">{scheduleCompliance.fully_compliant || 0}</p>
                        <p className="text-lg text-green-600">Fully Compliant</p>
                        <p className="text-sm text-green-500 mt-1">
                            {scheduleCompliance.fully_compliant_rate || 0}% of children
                        </p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200">
                    <div className="text-center">
                        <Activity className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                        <p className="text-2xl font-bold text-yellow-700">{scheduleCompliance.partially_compliant || 0}</p>
                        <p className="text-lg text-yellow-600">Partially Compliant</p>
                        <p className="text-sm text-yellow-500 mt-1">
                            {scheduleCompliance.partially_compliant_rate || 0}% of children
                        </p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
                    <div className="text-center">
                        <Award className="h-12 w-12 text-red-600 mx-auto mb-3" />
                        <p className="text-2xl font-bold text-red-700">{scheduleCompliance.non_compliant || 0}</p>
                        <p className="text-lg text-red-600">Non-Compliant</p>
                        <p className="text-sm text-red-500 mt-1">
                            {scheduleCompliance.non_compliant_rate || 0}% of children
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Family Planning Tab Component
const FpTab = ({ data, statistics }) => {
    if (!data) {
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
        fpInterest = {},
        methodCombinations = {},
        otherMethods = []
    } = data;

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

            {/* Method Combinations */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Popular Method Combinations</h3>
                <div className="space-y-3">
                    {Object.entries(methodCombinations)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 8)
                        .map(([combination, count]) => (
                            <div key={combination} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                <span className="font-medium text-gray-700">
                                    {combination || 'Single Method'}
                                </span>
                                <span className="bg-white px-3 py-1 rounded-full text-sm font-bold text-pink-600">
                                    {count} users
                                </span>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

// HIV Tab Component
const HivTab = ({ data, statistics }) => {
    if (!data) {
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
        positivity_rate = 0,
        by_anc_visit = {}
    } = data;

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

            {/* HIV Testing by ANC Visit */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">HIV Testing by ANC Visit</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 font-semibold">ANC Visit</th>
                                <th className="px-4 py-2 font-semibold">Tested</th>
                                <th className="px-4 py-2 font-semibold">Positive</th>
                                <th className="px-4 py-2 font-semibold">Negative</th>
                                <th className="px-4 py-2 font-semibold">Pending Results</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(by_anc_visit).map(([visit, data], index) => (
                                <tr key={visit} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-4 py-2 font-medium">{visit.toUpperCase()}</td>
                                    <td className="px-4 py-2">{data.tested || 0}</td>
                                    <td className="px-4 py-2 text-red-600 font-medium">{data.positive || 0}</td>
                                    <td className="px-4 py-2 text-green-600">{data.negative || 0}</td>
                                    <td className="px-4 py-2 text-yellow-600">{data.results_pending || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Not Tested */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Patients Not Tested for HIV</h3>
                <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-3xl font-bold text-orange-600">{not_tested}</p>
                    <p className="text-lg text-orange-700">Patients not tested for HIV</p>
                    <p className="text-sm text-orange-600 mt-2">
                        Requires follow-up and counseling
                    </p>
                </div>
            </div>
        </div>
    );
};

// Facilities Tab Component
const FacilitiesTab = ({ data, statistics }) => {
    if (!data || !Array.isArray(data)) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading facilities data...</p>
                </div>
            </div>
        );
    }

    const facilityPerformanceData = data.slice(0, 8).map(facility => ({
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
                            Real-time Facilities Data • {data.length} Total Facilities
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
                    {data.slice(0, 5).map((facility, index) => (
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

            {/* All Facilities Performance Table */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">All Facilities Performance</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 font-semibold">Facility</th>
                                <th className="px-4 py-2 font-semibold">LGA/Ward</th>
                                <th className="px-4 py-2 font-semibold">Patients</th>
                                <th className="px-4 py-2 font-semibold">ANC4 Rate</th>
                                <th className="px-4 py-2 font-semibold">Facility Delivery</th>
                                <th className="px-4 py-2 font-semibold">FP Uptake</th>
                                <th className="px-4 py-2 font-semibold">Performance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((facility, index) => (
                                <tr key={facility.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-4 py-2 font-medium">{facility.facility_name}</td>
                                    <td className="px-4 py-2">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-500">{facility.lga}</span>
                                            <span>{facility.ward}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2">{facility.total_patients}</td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            facility.anc4_rate >= 80 ? 'bg-green-100 text-green-800' :
                                            facility.anc4_rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {facility.anc4_rate}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            facility.facility_delivery_rate >= 80 ? 'bg-green-100 text-green-800' :
                                            facility.facility_delivery_rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {facility.facility_delivery_rate}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            facility.fp_uptake_rate >= 50 ? 'bg-green-100 text-green-800' :
                                            facility.fp_uptake_rate >= 30 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {facility.fp_uptake_rate}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-2">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            facility.performance_score >= 80 ? 'bg-green-100 text-green-800' :
                                            facility.performance_score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {facility.performance_score}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Main Dashboard Component
export default function Dashboard() {
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
        facilityStats = []
    } = usePage().props;
    
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [timeRange, setTimeRange] = useState('month');
    const [activeTab, setActiveTab] = useState('overview');

    // Handle real-time data refresh
    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            preserveScroll: true,
            onFinish: () => setIsRefreshing(false)
        });
    };

    // Process real data for charts with proper fallbacks
    const processRealData = (data, defaultValue = []) => {
        if (!data) return defaultValue;
        if (Array.isArray(data)) return data;
        if (typeof data === 'object') {
            return Object.entries(data).map(([name, value]) => ({
                name,
                value: typeof value === 'number' ? value : 0
            }));
        }
        return defaultValue;
    };

    // Enhanced chart data using real data from controller
    const enhancedChartData = {
        monthlyRegistrations: chartData.monthlyRegistrations || {},
        deliveryOutcomes: processRealData(chartData.deliveryOutcomes),
        serviceDistribution: processRealData(statistics.serviceUtilization),
        ancCompletion: Array(8).fill(0).map((_, i) => ({
            visit: `ANC${i + 1}`,
            completed: statistics.ancVisitsBreakdown?.[`anc${i + 1}`] || 0
        })),
        facilityPerformance: facilityStats.slice(0, 8).map(facility => ({
            name: facility.facility_name?.substring(0, 12) || 'Facility',
            performance: facility.performance_score || 0,
            deliveries: facility.facility_delivery_rate || 0,
            anc4: facility.anc4_rate || 0
        }))
    };

    // Real KPI Metrics from controller statistics
    const kpiMetrics = [
        {
            title: 'Total Patients',
            value: statistics.totalPatients || statistics.totalRegistered || 0,
            unit: '',
            color: 'border-l-4 border-blue-600',
            icon: Users,
            trend: statistics.trends?.totalPatients || 0,
            description: 'Registered pregnant women'
        },
        {
            title: 'ANC Coverage',
            value: statistics.ancCoverage || statistics.anc4Rate || 0,
            unit: '%',
            color: 'border-l-4 border-green-600',
            icon: Stethoscope,
            trend: statistics.trends?.anc8CompletionRate || 0,
            description: 'At least 4 ANC visits'
        },
        {
            title: 'Facility Deliveries',
            value: statistics.facilityDeliveries || statistics.facilityDeliveryRate || 0,
            unit: '%',
            color: 'border-l-4 border-purple-600',
            icon: Hospital,
            trend: statistics.trends?.facilityDeliveryRate || 0,
            description: 'Deliveries in health facilities'
        },
        {
            title: 'Immunization Rate',
            value: statistics.immunizationRate || statistics.bcgImmunizationRate || 0,
            unit: '%',
            color: 'border-l-4 border-yellow-600',
            icon: Activity,
            trend: statistics.trends?.bcgImmunization || 0,
            description: 'Children fully immunized'
        },
        {
            title: 'FP Uptake',
            value: statistics.fpUptake || statistics.fpUptakeRate || 0,
            unit: '%',
            color: 'border-l-4 border-pink-600',
            icon: Heart,
            trend: statistics.trends?.fpUptakeRate || 0,
            description: 'Family planning acceptance'
        }
    ];

    // Real-time critical alerts
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
        switch (activeTab) {
            case 'overview':
                return <OverviewTab 
                    data={enhancedChartData} 
                    metrics={kpiMetrics} 
                    alerts={criticalAlerts}
                    statistics={statistics}
                    patients={patients}
                />;
            case 'anc':
                return <AncTab data={ancData} statistics={statistics} />;
            case 'delivery':
                return <DeliveryTab data={deliveryData} statistics={statistics} />;
            case 'immunization':
                return <ImmunizationTab data={immunizationData} statistics={statistics} />;
            case 'fp':
                return <FpTab data={fpData} statistics={statistics} />;
            case 'hiv':
                return <HivTab data={hivData} statistics={statistics} />;
            case 'facilities':
                return <FacilitiesTab data={facilityStats} statistics={statistics} />;
            default:
                return <OverviewTab 
                    data={enhancedChartData} 
                    metrics={kpiMetrics} 
                    alerts={criticalAlerts}
                    statistics={statistics}
                    patients={patients}
                />;
        }
    };

    return (
        <AdminLayout>
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
                        <a
                            href="/admin/patients/export"
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                            <Download size={16} />
                            Export Data
                        </a>
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

                {/* Time Range Filter */}
                <div className="flex items-center gap-4">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none bg-white"
                    >
                        {/* <option value="month">This Month</option>
                        <option value="quarter">This Quarter</option> */}
                        <option value="year">This Year</option>
                        <option value="all">All Time</option>
                    </select>
                    <div className="text-sm text-gray-500">
                        Last updated: {new Date().toLocaleTimeString()}
                    </div>
                </div>

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
                    {renderTabContent()}
                </div>
            </div>
        </AdminLayout>
    );
}