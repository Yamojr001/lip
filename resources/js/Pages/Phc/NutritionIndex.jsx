import React, { useState } from "react";
import { usePage, Link, router } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { 
    Search, 
    Edit, 
    Trash2, 
    RefreshCw, 
    Calendar, 
    Filter,
    CheckCircle,
    Clock,
    FileText,
    Plus,
    Download,
    BarChart3
} from "lucide-react";

export default function NutritionIndex() {
    const { reports, years, months, filters } = usePage().props;
    
    const [search, setSearch] = useState("");
    const [selectedYear, setSelectedYear] = useState(filters.year || "");
    const [selectedMonth, setSelectedMonth] = useState(filters.month || "");
    
    // Filter reports
    const filteredReports = reports.data.filter(report => {
        const matchesSearch = 
            report.month.toLowerCase().includes(search.toLowerCase()) ||
            report.year.toString().includes(search);
        
        const matchesYear = !selectedYear || report.year.toString() === selectedYear;
        const matchesMonth = !selectedMonth || report.month === selectedMonth;
        
        return matchesSearch && matchesYear && matchesMonth;
    });
    
    const handleFilter = () => {
        router.get(route('phc.nutrition.reports.index'), {
            year: selectedYear,
            month: selectedMonth
        });
    };
    
    const handleReset = () => {
        setSelectedYear("");
        setSelectedMonth("");
        router.get(route('phc.nutrition.reports.index'));
    };
    
    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this nutrition report? This action cannot be undone.")) {
            router.delete(route('phc.nutrition.reports.destroy', id));
        }
    };
    
    const handleSubmit = (id) => {
        if (confirm("Are you sure you want to submit this report? Once submitted, it cannot be edited.")) {
            router.post(route('phc.nutrition.reports.submit', id));
        }
    };
    
    return (
        <PhcStaffLayout title="Nutrition Monthly Reports">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Nutrition Monthly Reports</h1>
                        <p className="text-gray-600">Submit and manage monthly nutrition screening reports</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <Link
                            href={route('phc.nutrition.reports.create')}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Create New Report
                        </Link>
                    </div>
                </div>
                
                {/* Filters */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter size={18} className="text-gray-500" />
                        <h3 className="font-medium text-gray-700">Filter Reports</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
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
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            >
                                <option value="">All Months</option>
                                {months.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex items-end gap-2">
                            <button
                                onClick={handleFilter}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
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
                </div>
                
                {/* Reports Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left text-gray-600">
                            <thead className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Month/Year</th>
                                    <th className="px-4 py-3 font-semibold">Total Screened</th>
                                    <th className="px-4 py-3 font-semibold">Normal</th>
                                    <th className="px-4 py-3 font-semibold">MAM</th>
                                    <th className="px-4 py-3 font-semibold">SAM</th>
                                    <th className="px-4 py-3 font-semibold">RUTF Given</th>
                                    <th className="px-4 py-3 font-semibold">Status</th>
                                    <th className="px-4 py-3 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.length > 0 ? (
                                    filteredReports.map((report, index) => (
                                        <tr key={report.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-900">
                                                    {report.month} {report.year}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {report.submitted_at ? `Submitted: ${new Date(report.submitted_at).toLocaleDateString()}` : 'Draft'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-bold text-green-600">
                                                    {report.total_children_screened}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                    {report.total_normal}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                                    {report.total_mam}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                                    {report.total_sam}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-medium">
                                                    {report.rutf_given}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {report.submitted ? (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle size={12} className="mr-1" />
                                                        Submitted
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                        <Clock size={12} className="mr-1" />
                                                        Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2 justify-center">
                                                    <Link
                                                        href={route('phc.nutrition.reports.edit', report.id)}
                                                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition hover:bg-blue-50"
                                                        title="Edit Report"
                                                    >
                                                        <Edit size={16} />
                                                    </Link>
                                                    {!report.submitted && (
                                                        <button
                                                            onClick={() => handleSubmit(report.id)}
                                                            className="text-green-600 hover:text-green-800 p-1 rounded transition hover:bg-green-50"
                                                            title="Submit Report"
                                                        >
                                                            <FileText size={16} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(report.id)}
                                                        className="text-red-600 hover:text-red-800 p-1 rounded transition hover:bg-red-50"
                                                        title="Delete Report"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="text-center text-gray-400 py-8">
                                            <div className="flex flex-col items-center justify-center">
                                                <FileText size={48} className="text-gray-300 mb-2" />
                                                <p className="text-lg">No nutrition reports found</p>
                                                <p className="text-sm mt-1">
                                                    {search || selectedYear || selectedMonth 
                                                        ? 'Try adjusting your filters' 
                                                        : 'Get started by creating your first report'}
                                                </p>
                                                {!search && !selectedYear && !selectedMonth && (
                                                    <Link
                                                        href={route('phc.nutrition.reports.create')}
                                                        className="mt-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                                                    >
                                                        <Plus size={16} />
                                                        Create First Report
                                                    </Link>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Pagination */}
                    {reports.links && reports.links.length > 3 && (
                        <div className="px-4 py-3 border-t flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing {reports.from} to {reports.to} of {reports.total} reports
                            </div>
                            <div className="flex gap-1">
                                {reports.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 rounded ${
                                            link.active
                                                ? 'bg-green-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {filteredReports.reduce((sum, report) => sum + report.total_children_screened, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Children Screened</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
                        <div className="text-2xl font-bold text-blue-600">
                            {filteredReports.reduce((sum, report) => sum + report.total_normal, 0)}
                        </div>
                        <div className="text-sm text-gray-600">Normal Children</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                            {filteredReports.reduce((sum, report) => sum + report.total_mam, 0)}
                        </div>
                        <div className="text-sm text-gray-600">MAM Cases</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border text-center">
                        <div className="text-2xl font-bold text-red-600">
                            {filteredReports.reduce((sum, report) => sum + report.total_sam, 0)}
                        </div>
                        <div className="text-sm text-gray-600">SAM Cases</div>
                    </div>
                </div>
            </div>
        </PhcStaffLayout>
    );
}