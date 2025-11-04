import React from "react";
import { usePage, Link } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { ArrowLeft, Edit, Calendar, User, MapPin, Stethoscope, Baby, CreditCard, Building, Trash2 } from "lucide-react";

export default function ViewPatient() {
    const { patient } = usePage().props;
    
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatBoolean = (value) => value ? "Yes" : "No";

    const Section = ({ title, icon: Icon, children }) => (
        <div className="bg-white rounded-xl shadow-md border-l-4 border-purple-500 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-white px-6 py-4 border-b">
                <div className="flex items-center gap-3">
                    <Icon size={20} className="text-purple-600" />
                    <h2 className="text-xl font-semibold text-purple-800">{title}</h2>
                </div>
            </div>
            <div className="p-6">
                {children}
            </div>
        </div>
    );

    const InfoRow = ({ label, value, className = "" }) => (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 ${className}`}>
            <span className="font-medium text-gray-700 text-sm sm:text-base">{label}:</span>
            <span className="text-gray-900 font-semibold mt-1 sm:mt-0 text-sm sm:text-base">{value || "N/A"}</span>
        </div>
    );

    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this patient record? This action cannot be undone.")) {
            router.delete(route('admin.patients.destroy', patient.id));
        }
    };

    return (
        <AdminLayout title={`Patient: ${patient.woman_name}`}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div className="flex items-center gap-4 mb-4 lg:mb-0">
                    <Link
                        href={route('admin.patients.index')}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to All Patients</span>
                    </Link>
                    <div className="h-6 w-px bg-gray-300 hidden lg:block"></div>
                    <h1 className="text-2xl font-bold text-gray-800">Patient Details</h1>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={route('admin.patients.edit', patient.id)}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                        <Edit size={16} />
                        Edit Patient
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                </div>
            </div>

            {/* Patient ID Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl p-6 mb-6 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">{patient.woman_name}</h2>
                        <p className="text-purple-100 mt-1">Unique ID: {patient.unique_id}</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                        <p className="text-purple-100">Age: {patient.age} years</p>
                        <p className="text-purple-100">Facility: {patient.health_facility?.clinic_name || 'N/A'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Personal Information */}
                    <Section title="Personal Information" icon={User}>
                        <InfoRow label="Full Name" value={patient.woman_name} />
                        <InfoRow label="Age" value={patient.age} />
                        <InfoRow label="Literacy Status" value={patient.literacy_status} />
                        <InfoRow label="Phone Number" value={patient.phone_number} />
                        <InfoRow label="Husband's Name" value={patient.husband_name} />
                        <InfoRow label="Husband's Phone" value={patient.husband_phone} />
                    </Section>

                    {/* Location Information */}
                    <Section title="Location Information" icon={MapPin}>
                        <InfoRow label="Community" value={patient.community} />
                        <InfoRow label="Address" value={patient.address} />
                        <InfoRow label="LGA" value={patient.lga?.name} />
                        <InfoRow label="Ward" value={patient.ward?.name} />
                        <InfoRow label="Health Facility" value={patient.health_facility?.clinic_name} />
                    </Section>

                    {/* Pregnancy Information */}
                    <Section title="Pregnancy Information" icon={Baby}>
                        <InfoRow label="Gravida (G)" value={patient.gravida} />
                        <InfoRow label="Parity (P)" value={patient.parity} />
                        <InfoRow label="Date of Registration" value={formatDate(patient.date_of_registration)} />
                        <InfoRow label="Expected Delivery Date" value={formatDate(patient.edd)} />
                    </Section>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* ANC Visits */}
                    <Section title="ANC Visits" icon={Stethoscope}>
                        <InfoRow label="ANC Visit 1" value={formatDate(patient.anc_visit_1)} />
                        <InfoRow label="Tracked Before ANC1" value={formatBoolean(patient.tracked_before_anc1)} />
                        <InfoRow label="ANC Visit 2" value={formatDate(patient.anc_visit_2)} />
                        <InfoRow label="Tracked Before ANC2" value={formatBoolean(patient.tracked_before_anc2)} />
                        <InfoRow label="ANC Visit 3" value={formatDate(patient.anc_visit_3)} />
                        <InfoRow label="Tracked Before ANC3" value={formatBoolean(patient.tracked_before_anc3)} />
                        <InfoRow label="ANC Visit 4" value={formatDate(patient.anc_visit_4)} />
                        <InfoRow label="Tracked Before ANC4" value={formatBoolean(patient.tracked_before_anc4)} />
                        <InfoRow label="Additional ANC Count" value={patient.additional_anc_count} />
                    </Section>

                    {/* Delivery Information */}
                    <Section title="Delivery Information" icon={Calendar}>
                        <InfoRow label="Place of Delivery" value={patient.place_of_delivery} />
                        <InfoRow label="Type of Delivery" value={patient.type_of_delivery} />
                        <InfoRow label="Delivery Outcome" value={patient.delivery_outcome} />
                        <InfoRow label="Date of Delivery" value={formatDate(patient.date_of_delivery)} />
                        <InfoRow label="Delivery Kits Received" value={formatBoolean(patient.delivery_kits_received)} />
                    </Section>

                    {/* Postpartum & Payment */}
                    <Section title="Postpartum & Payment" icon={CreditCard}>
                        <InfoRow label="Child Immunization Status" value={patient.child_immunization_status} />
                        <InfoRow label="PNC Visit 1" value={formatDate(patient.pnc_visit_1)} />
                        <InfoRow label="PNC Visit 2" value={formatDate(patient.pnc_visit_2)} />
                        <InfoRow label="Health Insurance Status" value={patient.health_insurance_status} />
                        <InfoRow label="Insurance Satisfaction" value={formatBoolean(patient.insurance_satisfaction)} />
                        <InfoRow label="ANC Paid" value={formatBoolean(patient.anc_paid)} />
                        {patient.anc_paid && (
                            <InfoRow label="ANC Payment Amount" value={`₦${patient.anc_payment_amount}`} />
                        )}
                        <InfoRow label="FP Interest Postpartum" value={formatBoolean(patient.fp_interest_postpartum)} />
                        <InfoRow label="FP Given" value={formatBoolean(patient.fp_given)} />
                        {patient.fp_given && (
                            <>
                                <InfoRow label="FP Paid" value={formatBoolean(patient.fp_paid)} />
                                {patient.fp_paid && (
                                    <InfoRow label="FP Payment Amount" value={`₦${patient.fp_payment_amount}`} />
                                )}
                            </>
                        )}
                        {!patient.fp_given && (
                            <InfoRow label="Reason FP Not Given" value={patient.fp_reason_not_given} />
                        )}
                    </Section>
                </div>
            </div>

            {/* Notes Section - Full Width */}
            <div className="mt-6">
                <Section title="Notes & Comments" icon={User}>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Remarks:</h3>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg min-h-[80px]">
                                {patient.remark || "No remarks provided."}
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-2">Comments:</h3>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg min-h-[80px]">
                                {patient.comments || "No comments provided."}
                            </p>
                        </div>
                    </div>
                </Section>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8 p-6 bg-white rounded-xl shadow-md">
                <Link
                    href={route('admin.patients.index')}
                    className="flex items-center justify-center gap-2 bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-700 transition text-center"
                >
                    <ArrowLeft size={16} />
                    Back to All Patients
                </Link>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                        href={route('admin.patients.edit', patient.id)}
                        className="flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-700 transition text-center"
                    >
                        <Edit size={16} />
                        Edit Patient Record
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="flex items-center justify-center gap-2 bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-700 transition text-center"
                    >
                        <Trash2 size={16} />
                        Delete Record
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}