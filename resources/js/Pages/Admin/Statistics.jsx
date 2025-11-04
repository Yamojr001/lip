import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Statistics() {
    const { statistics, chartData, dropdowns, filters } = usePage().props;
    const [localFilters, setLocalFilters] = useState({
        lga_id: 'all',
        ward_id: 'all',
        phc_id: 'all',
        start_date: '2024-01-01',
        end_date: '2024-12-31',
        ...filters
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        if (key === 'lga_id') {
            newFilters.ward_id = 'all';
            newFilters.phc_id = 'all';
        } else if (key === 'ward_id') {
            newFilters.phc_id = 'all';
        }
        setLocalFilters(newFilters);
        router.get(route('admin.statistics'), newFilters, { preserveState: true, replace: true });
    };

    // Safe data processing - no fallback data
    const monthlyData = chartData?.monthlyRegistrations ? Object.entries(chartData.monthlyRegistrations).map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        registrations: count
    })) : [];

    const deliveryData = chartData?.deliveryOutcomes ? Object.entries(chartData.deliveryOutcomes).map(([name, value]) => ({ name, value })) : [];
    const lgaData = chartData?.lgaAncCompletion ? Object.entries(chartData.lgaAncCompletion).map(([lga, rate]) => ({ lga, rate })) : [];
    const progressData = chartData?.ancProgress?.months ? chartData.ancProgress.months.map((month, index) => ({
        month,
        actual: chartData.ancProgress.actual[index],
        target: chartData.ancProgress.target[index]
    })) : [];

    // Check if we have any data to display
    const hasData = statistics?.totalRegistered > 0;
    const hasMonthlyData = monthlyData.length > 0;
    const hasDeliveryData = deliveryData.length > 0;
    const hasLgaData = lgaData.length > 0;
    const hasProgressData = progressData.length > 0;

    return (
        <AdminLayout title="Statistics Dashboard">
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LGA</label>
                        <select value={localFilters.lga_id} onChange={(e) => handleFilterChange('lga_id', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                            <option value="all">All LGAs</option>
                            {dropdowns?.lgas?.map(lga => <option key={lga.id} value={lga.id}>{lga.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                        <select value={localFilters.ward_id} onChange={(e) => handleFilterChange('ward_id', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" disabled={localFilters.lga_id === 'all'}>
                            <option value="all">All Wards</option>
                            {dropdowns?.wards
                                ?.filter(ward => localFilters.lga_id === 'all' || ward.lga_id == localFilters.lga_id)
                                .map(ward => <option key={ward.id} value={ward.id}>{ward.name}</option>)
                            }
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PHC Facility</label>
                        <select value={localFilters.phc_id} onChange={(e) => handleFilterChange('phc_id', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" disabled={localFilters.ward_id === 'all'}>
                            <option value="all">All Facilities</option>
                            {dropdowns?.phcs
                                ?.filter(phc => localFilters.ward_id === 'all' || phc.ward_id == localFilters.ward_id)
                                .map(phc => <option key={phc.id} value={phc.id}>{phc.clinic_name}</option>)
                            }
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" value={localFilters.start_date} onChange={(e) => handleFilterChange('start_date', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input type="date" value={localFilters.end_date} onChange={(e) => handleFilterChange('end_date', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" />
                    </div>
                </div>
            </div>

            {!hasData && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center mb-6">
                    <div className="text-yellow-600 text-lg font-semibold mb-2">No Data Available</div>
                    <p className="text-yellow-700">No patient records found for the selected filters and date range.</p>
                    <p className="text-yellow-600 text-sm mt-2">Try adjusting your filters or select a different date range.</p>
                </div>
            )}

            {hasData && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Performance Indicators</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                                    <div className="text-2xl font-bold text-blue-600">{statistics.totalRegistered.toLocaleString()}</div>
                                    <div className="text-sm text-gray-600">Total Registered</div>
                                </div>
                                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                                    <div className="text-2xl font-bold text-green-600">{statistics.anc4Rate}%</div>
                                    <div className="text-sm text-gray-600">ANC4 Completion Rate</div>
                                </div>
                                <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                                    <div className="text-2xl font-bold text-purple-600">{statistics.hospitalDeliveryRate}%</div>
                                    <div className="text-sm text-gray-600">Health Facility Delivery Rate</div>
                                </div>
                                <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                                    <div className="text-2xl font-bold text-orange-600">{statistics.liveBirthRate}%</div>
                                    <div className="text-sm text-gray-600">Live Birth Rate</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Counts</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between"><span>Completed ANC4:</span><span className="font-semibold">{statistics.detailedCounts.anc4Completed.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span>Total Delivered:</span><span className="font-semibold">{statistics.detailedCounts.totalDelivered.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span>PNC Incomplete:</span><span className="font-semibold text-red-600">{statistics.detailedCounts.pncIncomplete.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span>Stillbirths:</span><span className="font-semibold">{statistics.detailedCounts.stillbirths.toLocaleString()}</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {hasMonthlyData ? (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly ANC Registrations</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={monthlyData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="registrations" fill="#8884d8" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-center">
                                <div className="text-gray-500 text-center">
                                    <div className="text-lg font-semibold mb-2">No Monthly Data</div>
                                    <p className="text-sm">No registration data available for the selected period.</p>
                                </div>
                            </div>
                        )}

                        {hasDeliveryData ? (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Delivery Outcome Distribution</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie 
                                                data={deliveryData} 
                                                cx="50%" 
                                                cy="50%" 
                                                labelLine={false} 
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} 
                                                outerRadius={80} 
                                                dataKey="value"
                                            >
                                                {deliveryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-center">
                                <div className="text-gray-500 text-center">
                                    <div className="text-lg font-semibold mb-2">No Delivery Data</div>
                                    <p className="text-sm">No delivery outcome data available.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {hasLgaData ? (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">ANC Completion by LGA</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={lgaData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" domain={[0, 100]} />
                                            <YAxis type="category" dataKey="lga" width={80} />
                                            <Tooltip formatter={(value) => `${value}%`} />
                                            <Bar dataKey="rate" fill="#82ca9d" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-center">
                                <div className="text-gray-500 text-center">
                                    <div className="text-lg font-semibold mb-2">No LGA Data</div>
                                    <p className="text-sm">No ANC completion data by LGA available.</p>
                                </div>
                            </div>
                        )}

                        {hasProgressData ? (
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Towards 25% ANC Target</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={progressData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip formatter={(value) => `${value}%`} />
                                            <Line type="monotone" dataKey="actual" stroke="#8884d8" strokeWidth={2} />
                                            <Line type="monotone" dataKey="target" stroke="#ff7300" strokeWidth={2} strokeDasharray="5 5" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-center">
                                <div className="text-gray-500 text-center">
                                    <div className="text-lg font-semibold mb-2">No Progress Data</div>
                                    <p className="text-sm">No ANC progress data available.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-lg shadow-md text-center">
                            <div className="text-xl font-bold text-blue-600">{statistics.kitsReceivedRate}%</div>
                            <div className="text-sm text-gray-600">Delivery Kits Received</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md text-center">
                            <div className="text-xl font-bold text-green-600">{statistics.pnc1Within48hRate}%</div>
                            <div className="text-sm text-gray-600">PNC1 within 48h</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md text-center">
                            <div className="text-xl font-bold text-purple-600">{statistics.detailedCounts.hospitalDeliveries.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Hospital Deliveries</div>
                        </div>
                        <div className="bg-white p-4 rounded-lg shadow-md text-center">
                            <div className="text-xl font-bold text-orange-600">{statistics.detailedCounts.liveBirths.toLocaleString()}</div>
                            <div className="text-sm text-gray-600">Live Births</div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}