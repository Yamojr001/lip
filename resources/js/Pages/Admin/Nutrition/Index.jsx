import React, { useState } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    Search, 
    Filter,
    CheckCircle,
    Clock,
    FileText,
    Download,
    BarChart3,
    MapPin,
    Building2
} from "lucide-react";

export default function AdminNutritionIndex() {
    const { reports, years, months, lgas, wards, phcs, filters } = usePage().props;
    
    const [selectedLga, setSelectedLga] = useState(filters.lga_id || "");
    const [selectedWard, setSelectedWard] = useState(filters.ward_id || "");
    const [selectedPhc, setSelectedPhc] = useState(filters.phc_id || "");
    const [selectedYear, setSelectedYear] = useState(filters.year || "");
    const [selectedMonth, setSelectedMonth] = useState(filters.month || "");
    
    // Filter wards based on selected LGA
    const filteredWards = selectedLga 
        ? wards.filter(ward => ward.lga_id.toString() === selectedLga)
        : wards;
    
    // Filter PHCs based on selected ward
    const filteredPhcs = selectedWard 
        ? phcs.filter(phc => phc.ward_id.toString() === selectedWard)
        : phcs;
    
    const handleFilter = () => {
        router.get(route('admin.nutrition.reports.index'), {
            lga_id: selectedLga,
            ward_id: selectedWard,
            phc_id: selectedPhc,
            year: selectedYear,
            month: selectedMonth
        });
    };
    
    const handleReset = () => {
        setSelectedLga("");
        setSelectedWard("");
        setSelectedPhc("");
        setSelectedYear("");
        setSelectedMonth("");
        router.get(route('admin.nutrition.reports.index'));
    };
    
    const handleExport = () => {
        window.location.href = route('admin.nutrition.export', {
            lga_id: selectedLga,
            ward_id: selectedWard,
            phc_id: selectedPhc,
            year: selectedYear,
            month: selectedMonth
        });
    };
    
    const getStatusBadge = (status) => {
        const statusConfig = {
            'submitted': { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Submitted' },
            'draft': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Draft' },
        };
        
        const config = statusConfig[status] || statusConfig['draft'];
        const Icon = config.icon;
        
        return (
            <span className={`${config.color} px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1`}>
                <Icon size={12} />
                {config.label}
            </span>
        );
    };
    
    return (
        <AdminLayout title="Nutrition Monthly Reports">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Nutrition Monthly Reports</h1>
                        <p className="text-gray-600">View and manage nutrition screening reports from all PHCs</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-2">
                        <Link
                            href={route('admin.nutrition.statistics')}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <BarChart3 size={18} />
                            View Statistics
                        </Link>
                        <button
                            onClick={handleExport}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                            <Download size={18} />
                            Export CSV
                        </button>
                    </div>
                </div>
                
                {/* Filters */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter size={18} className="text-gray-500" />
                        <h3 className="font-medium text-gray-700">Filter Reports</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">LGA</label>
                            <select
                                value={selectedLga}
                                onChange={(e) => {
                                    setSelectedLga(e.target.value);
                                    setSelectedWard("");
                                    setSelectedPhc("");
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="">All LGAs</option>
                                {lgas.map(lga => (
                                    <option key={lga.id} value={lga.id}>{lga.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                            <select
                                value={selectedWard}
                                onChange={(e) => {
                                    setSelectedWard(e.target.value);
                                    setSelectedPhc("");
                                }}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                disabled={!selectedLga}
                            >
                                <option value="">All Wards</option>
                                {filteredWards.map(ward => (
                                    <option key={ward.id} value={ward.id}>{ward.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">PHC</label>
                            <select
                                value={selectedPhc}
                                onChange={(e) => setSelectedPhc(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                disabled={!selectedWard}
                            >
                                <option value="">All PHCs</option>
                                {filteredPhcs.map(phc => (
                                    <option key={phc.id} value={phc.id}>{phc.clinic_name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="">All Years</option>
                                {years.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            >
                                <option value="">All Months</option>
                                {months.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={handleFilter}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Apply Filters
                        </button>
                        <button
                            onClick={handleReset}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                        >
                            Reset
                        </button>
                    </div>
                </div>
                
                {/* Reports Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-600">
                            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">PHC</th>
                                    <th className="px-4 py-3 font-semibold">LGA</th>
                                    <th className="px-4 py-3 font-semibold">Ward</th>
                                    <th className="px-4 py-3 font-semibold">Month/Year</th>
                                    <th className="px-4 py-3 font-semibold">Total Screened</th>
                                    <th className="px-4 py-3 font-semibold">Normal</th>
                                    <th className="px-4 py-3 font-semibold">MAM</th>
                                    <th className="px-4 py-3 font-semibold">SAM</th>
                                    <th className="px-4 py-3 font-semibold">RUTF Given</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reports.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                                            <FileText size={48} className="mx-auto mb-2 text-gray-300" />
                                            <p className="text-lg font-medium">No nutrition reports found</p>
                                            <p className="text-sm">Try adjusting your filters or check back later.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    reports.data.map((report) => (
                                        <tr key={report.id} className="border-b hover:bg-gray-50 transition">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <Building2 size={16} className="text-gray-400" />
                                                    {report.phc?.clinic_name || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                {report.phc?.ward?.lga?.name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3">
                                                {report.phc?.ward?.name || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 font-medium">
                                                {report.month} {report.year}
                                            </td>
                                            <td className="px-4 py-3 text-center font-semibold">
                                                {report.total_children_screened}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                                                    {report.total_normal}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-medium">
                                                    {report.total_mam}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded font-medium">
                                                    {report.total_sam}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {report.rutf_given}
                                            </td>
                                            <td className="px-4 py-3">
                                                {getStatusBadge(report.status)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {reports.links && reports.links.length > 3 && (
                        <div className="px-6 py-4 border-t bg-gray-50">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-600">
                                    Showing {reports.from} to {reports.to} of {reports.total} reports
                                </div>
                                <div className="flex gap-1">
                                    {reports.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`px-3 py-1 rounded ${
                                                link.active 
                                                    ? 'bg-blue-600 text-white' 
                                                    : link.url 
                                                        ? 'bg-white text-gray-700 hover:bg-gray-100 border' 
                                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                            disabled={!link.url}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
