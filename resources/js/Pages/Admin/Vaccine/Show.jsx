import React, { useState } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { Link, useForm, router } from "@inertiajs/react";
import {
    ArrowLeft,
    Download,
    Printer,
    Calendar,
    Building,
    MapPin,
    User,
    FileText,
    Syringe,
    AlertCircle,
    CheckCircle,
    Thermometer,
    Package,
    Activity,
    Shield,
    Clock,
    Phone,
    RefreshCw,
    Edit
} from "lucide-react";

export default function AdminVaccineShow({ report, flash }) {
    const [showConfirmation, setShowConfirmation] = useState(null);
    const [confirmationAction, setConfirmationAction] = useState('');
    const [confirmationMessage, setConfirmationMessage] = useState('');
    
    const { data, setData, patch, processing, errors, reset } = useForm({
        status: report.status,
        feedback: '',
        rejected_reason: '',
        revision_notes: '',
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
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
            pending_revision: 'bg-yellow-100 text-yellow-800',
        };
        
        const labels = {
            draft: 'Draft',
            submitted: 'Submitted',
            approved: 'Approved',
            rejected: 'Rejected',
            pending_revision: 'Pending Revision',
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

    const wastageStatus = getWastageStatus(report.vaccine_wastage_rate);

    // Handle status update
    const handleStatusUpdate = (status, action) => {
        setConfirmationAction(action);
        
        switch (status) {
            case 'approved':
                setConfirmationMessage('Are you sure you want to approve this vaccine report? Once approved, it cannot be modified.');
                break;
            case 'rejected':
                setConfirmationMessage('Please provide a reason for rejecting this report:');
                setShowConfirmation('reject');
                return;
            case 'pending_revision':
                setConfirmationMessage('Please provide revision notes for the facility staff:');
                setShowConfirmation('revision');
                return;
            default:
                setData('status', status);
                submitStatusUpdate();
                break;
        }
        
        setData('status', status);
        setShowConfirmation('confirm');
    };

    const submitStatusUpdate = () => {
        patch(route('admin.vaccine.reports.update', report.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowConfirmation(null);
                reset();
            },
            onError: (errors) => {
                console.error('Error updating status:', errors);
            }
        });
    };

    // Calculate vaccine utilization summary
    const calculateVaccineSummary = () => {
        if (!report.vaccine_utilization || !Array.isArray(report.vaccine_utilization)) {
            return { totalOpening: 0, totalReceived: 0, totalUsed: 0 };
        }

        const summary = report.vaccine_utilization.reduce((acc, vaccine) => ({
            totalOpening: acc.totalOpening + (parseInt(vaccine.opening_balance) || 0),
            totalReceived: acc.totalReceived + (parseInt(vaccine.received) || 0),
            totalUsed: acc.totalUsed + (parseInt(vaccine.doses_opened) || 0),
        }), { totalOpening: 0, totalReceived: 0, totalUsed: 0 });

        return summary;
    };

    const vaccineSummary = calculateVaccineSummary();

    // Confirmation Modal Component
    const ConfirmationModal = () => {
        if (!showConfirmation) return null;

        const handleConfirm = () => {
            if (showConfirmation === 'reject') {
                if (!data.rejected_reason.trim()) {
                    alert('Please provide a reason for rejection');
                    return;
                }
            } else if (showConfirmation === 'revision') {
                if (!data.revision_notes.trim()) {
                    alert('Please provide revision notes');
                    return;
                }
            }
            submitStatusUpdate();
        };

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        {confirmationAction === 'approve' ? 'Approve Report' : 
                         confirmationAction === 'reject' ? 'Reject Report' : 'Request Revision'}
                    </h3>
                    
                    <p className="text-gray-600 mb-4">{confirmationMessage}</p>

                    {showConfirmation === 'reject' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Reason for Rejection *
                            </label>
                            <textarea
                                value={data.rejected_reason}
                                onChange={(e) => setData('rejected_reason', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                rows="3"
                                placeholder="Enter reason for rejection..."
                                required
                            />
                            {errors.rejected_reason && (
                                <p className="text-red-500 text-sm mt-1">{errors.rejected_reason}</p>
                            )}
                        </div>
                    )}

                    {showConfirmation === 'revision' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Revision Notes *
                            </label>
                            <textarea
                                value={data.revision_notes}
                                onChange={(e) => setData('revision_notes', e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                rows="3"
                                placeholder="Enter revision notes for facility staff..."
                                required
                            />
                            {errors.revision_notes && (
                                <p className="text-red-500 text-sm mt-1">{errors.revision_notes}</p>
                            )}
                        </div>
                    )}

                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowConfirmation(null)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                            disabled={processing}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={processing}
                            className={`flex-1 px-4 py-2 text-white rounded-lg transition flex items-center justify-center ${
                                confirmationAction === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                                confirmationAction === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                                'bg-yellow-600 hover:bg-yellow-700'
                            }`}
                        >
                            {processing ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    {confirmationAction === 'approve' ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Approve
                                        </>
                                    ) : confirmationAction === 'reject' ? (
                                        <>
                                            <AlertCircle className="h-4 w-4 mr-2" />
                                            Reject
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Request Revision
                                        </>
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <AdminLayout title={`Vaccine Report - ${report.month_year}`}>
            {showConfirmation && <ConfirmationModal />}
            
            {/* Flash Messages */}
            {flash?.success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <p className="text-green-800">{flash.success}</p>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto p-6">
                {/* Header with Actions */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            href={route('admin.vaccine.reports.index')}
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Back to Reports
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Vaccine Accountability Report</h1>
                    </div>
                    <div className="flex space-x-3">
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center">
                            <Printer className="h-5 w-5 mr-2" />
                            Print
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center">
                            <Download className="h-5 w-5 mr-2" />
                            Download PDF
                        </button>
                    </div>
                </div>

                {/* Report Header Card */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-2 mb-2">
                                <FileText className="h-6 w-6" />
                                <h2 className="text-xl font-bold">NHMIS Monthly Health Facility Vaccines Utilization Summary</h2>
                            </div>
                            <p className="text-blue-100">Reference: VAC-{report.id}-{new Date(report.created_at).getFullYear()}</p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            {getStatusBadge(report.status)}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Report Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Facility Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Building className="h-5 w-5 mr-2 text-gray-500" />
                                Facility Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Health Facility</label>
                                    <p className="text-gray-900 font-medium">{report.phc?.clinic_name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">LGA</label>
                                    <p className="text-gray-900 flex items-center">
                                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                        {report.phc?.lga?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ward</label>
                                    <p className="text-gray-900">{report.phc?.ward?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Month</label>
                                    <p className="text-gray-900 flex items-center">
                                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                        {report.month_year}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Date</label>
                                    <p className="text-gray-900">{formatDate(report.reporting_date)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Submitted By</label>
                                    <p className="text-gray-900 flex items-center">
                                        <User className="h-4 w-4 mr-2 text-gray-400" />
                                        {report.user?.name || 'Staff Member'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Activity className="h-5 w-5 mr-2 text-gray-500" />
                                Key Performance Metrics
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="flex items-center justify-center mb-2">
                                        <Syringe className="h-6 w-6 text-blue-600 mr-2" />
                                        <span className="text-sm font-medium text-blue-700">Doses Used</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{report.total_doses_used?.toLocaleString() || 0}</p>
                                    <p className="text-xs text-gray-500 mt-1">vaccine doses</p>
                                </div>
                                
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <div className="flex items-center justify-center mb-2">
                                        <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
                                        <span className="text-sm font-medium text-red-700">Wastage Rate</span>
                                    </div>
                                    <p className={`text-2xl font-bold ${wastageStatus.color}`}>
                                        {(parseFloat(report.vaccine_wastage_rate) || 0).toFixed(2)}%
                                    </p>
                                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${wastageStatus.bg} ${wastageStatus.color}`}>
                                        {wastageStatus.label}
                                    </span>
                                </div>
                                
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <div className="flex items-center justify-center mb-2">
                                        <Package className="h-6 w-6 text-yellow-600 mr-2" />
                                        <span className="text-sm font-medium text-yellow-700">Stock Outs</span>
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{report.stock_out_count || 0}</p>
                                    <p className="text-xs text-gray-500 mt-1">vaccine types</p>
                                </div>
                            </div>
                            
                            {/* Wastage Progress Bar */}
                            <div className="mt-6">
                                <div className="flex justify-between text-sm text-gray-600 mb-1">
                                    <span>Wastage Rate: {(parseFloat(report.vaccine_wastage_rate) || 0).toFixed(2)}%</span>
                                    <span>Target: ≤10%</span>
                                </div>
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${parseFloat(report.vaccine_wastage_rate) > 10 ? 'bg-red-500' : 'bg-green-500'}`}
                                        style={{ 
                                            width: `${Math.min(parseFloat(report.vaccine_wastage_rate) || 0, 100)}%` 
                                        }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>0%</span>
                                    <span className="text-red-500 font-medium">High Risk Zone (10%+)</span>
                                    <span>100%</span>
                                </div>
                            </div>
                        </div>

                        {/* Vaccine Utilization Summary */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <FileText className="h-5 w-5 mr-2 text-gray-500" />
                                Vaccine Utilization Summary
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left font-medium text-gray-700">Vaccine</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-700">Opening Balance</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-700">Received</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-700">Used</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-700">Returned</th>
                                            <th className="px-4 py-2 text-left font-medium text-gray-700">Stock Out</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.vaccine_utilization && Array.isArray(report.vaccine_utilization) ? (
                                            report.vaccine_utilization.map((vaccine, index) => (
                                                <tr key={index} className={vaccine.stock_out ? 'bg-red-50' : 'hover:bg-gray-50'}>
                                                    <td className="px-4 py-3 border-b">
                                                        <div className="font-medium text-gray-900">
                                                            {vaccine.name}
                                                            {vaccine.stock_out && (
                                                                <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{vaccine.type}</div>
                                                    </td>
                                                    <td className="px-4 py-3 border-b">{vaccine.opening_balance || 0}</td>
                                                    <td className="px-4 py-3 border-b">{vaccine.received || 0}</td>
                                                    <td className="px-4 py-3 border-b">{vaccine.doses_opened || 0}</td>
                                                    <td className="px-4 py-3 border-b">{vaccine.returned || 0}</td>
                                                    <td className="px-4 py-3 border-b">
                                                        {vaccine.stock_out ? (
                                                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                                                                Yes
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                                                No
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-3 text-center text-gray-500">
                                                    No vaccine utilization data available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot className="bg-gray-50 font-medium">
                                        <tr>
                                            <td className="px-4 py-3">Total</td>
                                            <td className="px-4 py-3">{vaccineSummary.totalOpening}</td>
                                            <td className="px-4 py-3">{vaccineSummary.totalReceived}</td>
                                            <td className="px-4 py-3">{vaccineSummary.totalUsed}</td>
                                            <td className="px-4 py-3">-</td>
                                            <td className="px-4 py-3">{report.stock_out_count || 0}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Signatures Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Shield className="h-5 w-5 mr-2 text-gray-500" />
                                Signatures & Approval
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Health Officer</label>
                                    <p className="text-gray-900 font-medium">{report.health_officer_name || 'N/A'}</p>
                                    <p className="text-xs text-gray-500 mt-1">Signature: {report.health_officer_signature || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Head of Unit</label>
                                    <p className="text-gray-900 font-medium">{report.head_of_unit_name || 'N/A'}</p>
                                    <p className="text-xs text-gray-500 mt-1">Signature: {report.head_of_unit_signature || 'Not provided'}</p>
                                </div>
                                <div className="pt-4 border-t">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Submission Date</span>
                                        <span className="font-medium">{formatDate(report.submission_date)}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm mt-2">
                                        <span className="text-gray-600">Phone Number</span>
                                        <span className="font-medium flex items-center">
                                            <Phone className="h-4 w-4 mr-1" />
                                            {report.phone_number || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cold Chain Status */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Thermometer className="h-5 w-5 mr-2 text-gray-500" />
                                Cold Chain Status
                            </h3>
                            {report.device_status && Array.isArray(report.device_status) ? (
                                <div className="space-y-3">
                                    {report.device_status.map((device, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-900">{device.name}</p>
                                                <p className="text-xs text-gray-500">Quantity: {device.quantity || 0}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-medium ${
                                                    device.functional === device.quantity ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                    {device.functional || 0} functional
                                                </p>
                                                {device.non_functional > 0 && (
                                                    <p className="text-xs text-red-500">
                                                        {device.non_functional} non-functional
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No cold chain data available</p>
                            )}
                        </div>

                        {/* Timeline */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <Clock className="h-5 w-5 mr-2 text-gray-500" />
                                Report Timeline
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Created</span>
                                    <span className="font-medium">{formatDate(report.created_at)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Last Updated</span>
                                    <span className="font-medium">{formatDate(report.updated_at)}</span>
                                </div>
                                {report.approved_at && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Approved</span>
                                        <span className="font-medium">{formatDate(report.approved_at)}</span>
                                    </div>
                                )}
                                {report.rejected_at && (
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-600">Rejected</span>
                                        <span className="font-medium">{formatDate(report.rejected_at)}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Actions</h3>
                            <div className="space-y-3">
                                {report.status !== 'approved' && (
                                    <button
                                        onClick={() => handleStatusUpdate('approved', 'approve')}
                                        disabled={processing}
                                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center disabled:opacity-50"
                                    >
                                        {processing && data.status === 'approved' ? (
                                            <>
                                                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="h-5 w-5 mr-2" />
                                                Approve Report
                                            </>
                                        )}
                                    </button>
                                )}
                                
                                {report.status !== 'rejected' && (
                                    <button
                                        onClick={() => handleStatusUpdate('rejected', 'reject')}
                                        disabled={processing}
                                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center justify-center disabled:opacity-50"
                                    >
                                        {processing && data.status === 'rejected' ? (
                                            <>
                                                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="h-5 w-5 mr-2" />
                                                Reject Report
                                            </>
                                        )}
                                    </button>
                                )}
                                
                                {report.status !== 'pending_revision' && (
                                    <button
                                        onClick={() => handleStatusUpdate('pending_revision', 'revision')}
                                        disabled={processing}
                                        className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition flex items-center justify-center disabled:opacity-50"
                                    >
                                        {processing && data.status === 'pending_revision' ? (
                                            <>
                                                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <Edit className="h-5 w-5 mr-2" />
                                                Request Revision
                                            </>
                                        )}
                                    </button>
                                )}
                                
                                {/* Display current status info */}
                                <div className="pt-4 border-t">
                                    <p className="text-sm text-gray-600">
                                        Current Status: <span className="font-medium">{getStatusBadge(report.status)}</span>
                                    </p>
                                    {report.rejected_reason && (
                                        <div className="mt-2 p-2 bg-red-50 rounded">
                                            <p className="text-xs font-medium text-red-700">Rejection Reason:</p>
                                            <p className="text-sm text-red-600">{report.rejected_reason}</p>
                                        </div>
                                    )}
                                    {report.revision_notes && (
                                        <div className="mt-2 p-2 bg-yellow-50 rounded">
                                            <p className="text-xs font-medium text-yellow-700">Revision Notes:</p>
                                            <p className="text-sm text-yellow-600">{report.revision_notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between">
                    <div className="text-sm text-gray-500">
                        Report ID: {report.id} | 
                        Facility ID: {report.phc_id} | 
                        Created by: {report.user?.name || 'Staff'}
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route('admin.vaccine.reports.index')}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                        >
                            View All Reports
                        </Link>
                        <Link
                            href={route('admin.vaccine.statistics')}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                        >
                            View Statistics
                        </Link>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}