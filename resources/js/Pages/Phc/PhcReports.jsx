import React, { useState } from "react";
import { usePage, router } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { Download, FileText, BarChart3, Calendar, Users, ChevronDown } from "lucide-react";

export default function PhcReports() {
    const { auth } = usePage().props;
    
    const [reportData, setReportData] = useState({
        start_date: "",
        end_date: "",
        report_type: "pdf_portrait",
        include_details: true,
        include_statistics: true,
    });

    const [isGenerating, setIsGenerating] = useState(false);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setReportData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    // Handle custom report generation
    const handleGenerateReport = (e) => {
        e.preventDefault();
        setIsGenerating(true);

        router.post(route("phc.reports.generate"), reportData, {
            onFinish: () => {
                setIsGenerating(false);
            },
        });
    };

    // Format options for the dropdown
    const formatOptions = [
        {
            value: "pdf_portrait",
            label: "PDF Report (Portrait)",
            description: "Standard PDF format for detailed reports",
            icon: FileText
        },
        {
            value: "pdf_landscape", 
            label: "PDF Report (Landscape)",
            description: "Wide format for detailed tables and charts",
            icon: FileText
        },
        {
            value: "excel",
            label: "Excel Spreadsheet",
            description: "Full data in Excel format for analysis",
            icon: BarChart3
        },
        {
            value: "csv",
            label: "CSV Data",
            description: "Raw data in CSV format for external applications",
            icon: Users
        }
    ];

    // Get current selected format details
    const selectedFormat = formatOptions.find(option => option.value === reportData.report_type) || formatOptions[0];

    return (
        <PhcStaffLayout title="Reports & Exports">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-purple-700">
                        Reports & Data Export
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Generate and download comprehensive reports for your facility
                    </p>
                </div>
            </div>

            {/* Custom Report Generator */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Calendar size={20} />
                        Generate Custom Report
                    </h2>
                </div>

                <form onSubmit={handleGenerateReport} className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Date Range */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Date Range</h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    name="start_date"
                                    value={reportData.start_date}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={reportData.end_date}
                                    onChange={handleInputChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Report Options */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800">Report Options</h3>

                            {/* Format Selection Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Download Format
                                </label>
                                <div className="relative">
                                    <select
                                        name="report_type"
                                        value={reportData.report_type}
                                        onChange={handleInputChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition appearance-none bg-white"
                                    >
                                        {formatOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                                
                                {/* Format Description */}
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <selectedFormat.icon size={16} className="text-purple-600" />
                                        <span className="text-sm font-medium text-gray-800">
                                            {selectedFormat.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        {selectedFormat.description}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        name="include_details"
                                        checked={reportData.include_details}
                                        onChange={handleInputChange}
                                        className="rounded text-purple-600 focus:ring-purple-500 h-5 w-5"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Include Patient Details
                                    </span>
                                </label>

                                <label className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        name="include_statistics"
                                        checked={reportData.include_statistics}
                                        onChange={handleInputChange}
                                        className="rounded text-purple-600 focus:ring-purple-500 h-5 w-5"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Include Statistics & Charts
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            disabled={isGenerating}
                            className="bg-purple-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
                        >
                            <Download size={16} />
                            {isGenerating
                                ? "Generating Report..."
                                : "Generate Report"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Format Guide */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Available Download Formats
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <FileText size={16} className="text-purple-600" />
                            PDF Formats
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                <div>
                                    <strong>PDF Portrait:</strong> Best for standard reports with detailed patient information and summary statistics
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                <div>
                                    <strong>PDF Landscape:</strong> Ideal for wide tables, comparison charts, and comprehensive data overviews
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <BarChart3 size={16} className="text-green-600" />
                            Data Formats
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-2">
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                <div>
                                    <strong>Excel Spreadsheet:</strong> Perfect for data analysis, filtering, and creating custom calculations
                                </div>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                <div>
                                    <strong>CSV File:</strong> Simple format for importing into other applications and databases
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                
                {/* Quick Tips */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">💡 Quick Tips</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Leave date fields empty to include all records</li>
                        <li>• PDF formats are best for printing and sharing</li>
                        <li>• Excel/CSV formats are ideal for data analysis</li>
                        <li>• Reports typically take 10-30 seconds to generate depending on data size</li>
                    </ul>
                </div>
            </div>
        </PhcStaffLayout>
    );
}