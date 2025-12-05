import React from "react";
import { usePage, Link, router } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import { 
    ArrowLeft, Edit, Calendar, User, MapPin, Stethoscope, Baby, CreditCard, Building, Trash2,
    CheckCircle, XCircle, Heart, Shield, FileText, Phone, Home, BookOpen, Pill, Syringe,
    FlaskConical, Droplet, Microscope, Scale, TrendingUp
} from "lucide-react";

// Helper to format dates
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch {
        return "Invalid Date";
    }
};

// Helper to format booleans
const formatBoolean = (value) => value ? "Yes" : "No";

// Reusable Section Component
const Section = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
                <Icon size={20} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            </div>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

// Reusable Info Row Component
const InfoRow = ({ label, value, className = "" }) => (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-gray-100 last:border-b-0 ${className}`}>
        <span className="font-medium text-gray-700 text-sm sm:text-base">{label}:</span>
        <span className="text-gray-900 font-semibold mt-1 sm:mt-0 text-sm sm:text-base break-words text-right sm:text-left">{value || "N/A"}</span>
    </div>
);

// Component for displaying a single ANC visit's full details
const AncVisitDetails = ({ patient, visitNumber }) => {
    const visitDate = patient[`anc_visit_${visitNumber}_date`];
    const trackedBefore = patient[`tracked_before_anc${visitNumber}`];
    const paid = patient[`anc${visitNumber}_paid`];
    const paymentAmount = patient[`anc${visitNumber}_payment_amount`];
    const urinalysis = patient[`anc${visitNumber}_urinalysis`];
    const ironFolate = patient[`anc${visitNumber}_iron_folate`];
    const mms = patient[`anc${visitNumber}_mms`];
    const sp = patient[`anc${visitNumber}_sp`];
    const sba = patient[`anc${visitNumber}_sba`];
    const hivTest = patient[`anc${visitNumber}_hiv_test`];
    const hivResultReceived = patient[`anc${visitNumber}_hiv_result_received`];
    const hivResult = patient[`anc${visitNumber}_hiv_result`];

    // Check if there's any data for this visit
    const hasVisitData = visitDate || trackedBefore || paid || urinalysis || ironFolate || mms || sp || sba || hivTest;

    if (!hasVisitData) {
        return null;
    }

    return (
        <div className="mb-6 pb-6 border-b border-gray-200 last:mb-0 last:pb-0 last:border-b-0">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Stethoscope size={18} className="text-blue-600" />
                    ANC Visit {visitNumber}
                </h3>
                {visitDate && (
                    <span className="text-sm text-gray-500 bg-blue-50 px-2 py-1 rounded">
                        {formatDate(visitDate)}
                    </span>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <InfoRow label="Previously Tracked" value={formatBoolean(trackedBefore)} />
                <InfoRow label="Payment Made" value={formatBoolean(paid)} />
                {paid && paymentAmount && (
                    <InfoRow label="Payment Amount" value={`₦${parseFloat(paymentAmount).toLocaleString()}`} />
                )}
            </div>

            {/* Services Provided */}
            {(urinalysis || ironFolate || mms || sp || sba) && (
                <div className="mb-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="font-medium text-blue-800 mb-3">Services Provided:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                            {urinalysis ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-gray-300" />}
                            <span className={urinalysis ? "text-green-700" : "text-gray-500"}>Urinalysis</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {ironFolate ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-gray-300" />}
                            <span className={ironFolate ? "text-green-700" : "text-gray-500"}>Iron Folate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {mms ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-gray-300" />}
                            <span className={mms ? "text-green-700" : "text-gray-500"}>MMS</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {sp ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-gray-300" />}
                            <span className={sp ? "text-green-700" : "text-gray-500"}>SP</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {sba ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-gray-300" />}
                            <span className={sba ? "text-green-700" : "text-gray-500"}>SBA</span>
                        </div>
                    </div>
                </div>
            )}

            {/* HIV Testing */}
            {hivTest && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="font-medium text-green-800 mb-3">HIV Testing:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InfoRow label="Test Conducted" value={hivTest} className="!border-b-0 !py-2" />
                        {hivTest === "Yes" && (
                            <>
                                <InfoRow label="Results Received" value={formatBoolean(hivResultReceived)} className="!border-b-0 !py-2" />
                                {hivResultReceived && hivResult && (
                                    <InfoRow label="Test Result" value={hivResult} className="!border-b-0 !py-2" />
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// Component for displaying vaccine records by category
const VaccineCategory = ({ title, vaccines, color = "blue" }) => {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200 text-blue-800',
        green: 'bg-green-50 border-green-200 text-green-800',
        yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        orange: 'bg-orange-50 border-orange-200 text-orange-800',
        red: 'bg-red-50 border-red-200 text-red-800',
        purple: 'bg-purple-50 border-purple-200 text-purple-800'
    };

    return (
        <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
            <h4 className="font-semibold mb-3">{title}</h4>
            <div className="space-y-2">
                {vaccines.map(({ label, received, date }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-medium">
                            {received ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-gray-300" />}
                            {label}
                        </span>
                        <span className="font-semibold">
                            {received && date ? formatDate(date) : "Not received"}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function ViewPatient() {
    const { patient } = usePage().props;
    
    // Handle delete
    const handleDelete = () => {
        if (confirm("Are you sure you want to delete this patient record? This action cannot be undone.")) {
            router.delete(route('admin.patients.destroy', patient.id));
        }
    };

    // Get active ANC visits (1-8)
    const activeAncVisits = Array.from({ length: 8 }, (_, i) => i + 1)
        .filter(visitNumber => {
            return patient[`anc_visit_${visitNumber}_date`] || 
                   patient[`tracked_before_anc${visitNumber}`] || 
                   patient[`anc${visitNumber}_paid`] ||
                   patient[`anc${visitNumber}_urinalysis`] ||
                   patient[`anc${visitNumber}_iron_folate`] ||
                   patient[`anc${visitNumber}_mms`] ||
                   patient[`anc${visitNumber}_sp`] ||
                   patient[`anc${visitNumber}_sba`] ||
                   patient[`anc${visitNumber}_hiv_test`];
        });

    // Family Planning methods
    const fpMethods = [];
    if (patient.fp_male_condom) fpMethods.push("Male Condom");
    if (patient.fp_female_condom) fpMethods.push("Female Condom");
    if (patient.fp_pill) fpMethods.push("Pill");
    if (patient.fp_injectable) fpMethods.push("Injectable");
    if (patient.fp_implant) fpMethods.push("Implant");
    if (patient.fp_iud) fpMethods.push("IUD");
    if (patient.fp_other) {
        fpMethods.push(patient.fp_other_specify ? `Other (${patient.fp_other_specify})` : "Other");
    }

    // Vaccine data organized by category
    const vaccineCategories = [
        {
            title: "At Birth",
            color: "blue",
            vaccines: [
                { label: "BCG", received: patient.bcg_received, date: patient.bcg_date },
                { label: "Hep 0", received: patient.hep0_received, date: patient.hep0_date },
                { label: "OPV 0", received: patient.opv0_received, date: patient.opv0_date }
            ]
        },
        {
            title: "6 Weeks",
            color: "green",
            vaccines: [
                { label: "Penta 1", received: patient.penta1_received, date: patient.penta1_date },
                { label: "PCV 1", received: patient.pcv1_received, date: patient.pcv1_date },
                { label: "OPV 1", received: patient.opv1_received, date: patient.opv1_date },
                { label: "Rota 1", received: patient.rota1_received, date: patient.rota1_date },
                { label: "IPV 1", received: patient.ipv1_received, date: patient.ipv1_date }
            ]
        },
        {
            title: "10 Weeks",
            color: "yellow",
            vaccines: [
                { label: "Penta 2", received: patient.penta2_received, date: patient.penta2_date },
                { label: "PCV 2", received: patient.pcv2_received, date: patient.pcv2_date },
                { label: "Rota 2", received: patient.rota2_received, date: patient.rota2_date },
                { label: "OPV 2", received: patient.opv2_received, date: patient.opv2_date }
            ]
        },
        {
            title: "14 Weeks",
            color: "orange",
            vaccines: [
                { label: "Penta 3", received: patient.penta3_received, date: patient.penta3_date },
                { label: "PCV 3", received: patient.pcv3_received, date: patient.pcv3_date },
                { label: "OPV 3", received: patient.opv3_received, date: patient.opv3_date },
                { label: "Rota 3", received: patient.rota3_received, date: patient.rota3_date },
                { label: "IPV 2", received: patient.ipv2_received, date: patient.ipv2_date }
            ]
        },
        {
            title: "9 Months",
            color: "red",
            vaccines: [
                { label: "Measles", received: patient.measles_received, date: patient.measles_date },
                { label: "Yellow Fever", received: patient.yellow_fever_received, date: patient.yellow_fever_date },
                { label: "Vitamin A", received: patient.vitamin_a_received, date: patient.vitamin_a_date }
            ]
        },
        {
            title: "15 Months",
            color: "purple",
            vaccines: [
                { label: "MCV 2", received: patient.mcv2_received, date: patient.mcv2_date }
            ]
        }
    ];

    return (
        <AdminLayout title={`Patient: ${patient.woman_name}`}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div className="flex items-center gap-4 mb-4 lg:mb-0">
                    <Link
                        href={route('admin.patients.index')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
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
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
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
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 mb-6 shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">{patient.woman_name}</h2>
                        <p className="text-blue-100 mt-1">Unique ID: {patient.unique_id}</p>
                    </div>
                    <div className="mt-4 md:mt-0 text-right">
                        <p className="text-blue-100">Age: {patient.age} years</p>
                        <p className="text-blue-100">Facility: {patient.health_facility?.clinic_name || 'N/A'}</p>
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

                    {/* Medical & Registration Information */}
                    <Section title="Medical & Registration Information" icon={Stethoscope}>
                        <InfoRow label="Gravida (G)" value={patient.gravida} />
                        <InfoRow label="Parity (P)" value={patient.parity} />
                        <InfoRow label="Date of Registration" value={formatDate(patient.date_of_registration)} />
                        <InfoRow label="Expected Delivery Date (EDD)" value={formatDate(patient.edd)} />
                        <InfoRow label="Family Planning Interest" value={patient.fp_interest} />
                    </Section>

                    {/* Health Insurance */}
                    <Section title="Health Insurance" icon={Shield}>
                        <InfoRow label="Insurance Status" value={patient.health_insurance_status} />
                        {patient.health_insurance_status === "Yes" && (
                            <>
                                <InfoRow label="Insurance Type" value={patient.insurance_type} />
                                {patient.insurance_type === "Others" && (
                                    <InfoRow label="Other Provider" value={patient.insurance_other_specify} />
                                )}
                                <InfoRow label="Satisfied with Insurance" value={formatBoolean(patient.insurance_satisfaction)} />
                            </>
                        )}
                    </Section>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Delivery Information */}
                    <Section title="Delivery Information" icon={Baby}>
                        <InfoRow label="Place of Delivery" value={patient.place_of_delivery} />
                        <InfoRow label="Type of Delivery" value={patient.type_of_delivery} />
                        <InfoRow label="Delivery Outcome" value={patient.delivery_outcome} />
                        <InfoRow label="Date of Delivery" value={formatDate(patient.date_of_delivery)} />
                        <InfoRow label="Delivery Kits Received" value={formatBoolean(patient.delivery_kits_received)} />
                    </Section>

                    {/* Postnatal Care */}
                    <Section title="Postnatal Care (PNC)" icon={Heart}>
                        <InfoRow label="PNC Visit 1 Date" value={formatDate(patient.pnc_visit_1)} />
                        <InfoRow label="PNC Visit 2 Date" value={formatDate(patient.pnc_visit_2)} />
                        <InfoRow label="PNC Visit 3 Date" value={formatDate(patient.pnc_visit_3)} />
                    </Section>

                    {/* Family Planning */}
                    <Section title="Family Planning" icon={Heart}>
                        <InfoRow label="Currently Using Family Planning" value={formatBoolean(patient.fp_using)} />
                        {patient.fp_using && fpMethods.length > 0 && (
                            <div className="mt-4">
                                <p className="font-medium text-gray-700 mb-3">Methods Being Used:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {fpMethods.map((method, index) => (
                                        <div key={index} className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-lg border border-green-200">
                                            <CheckCircle size={16} className="text-green-500" />
                                            <span className="font-medium">{method}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Section>
                </div>
            </div>

            {/* Full Width Sections */}
            
            {/* ANC Visits */}
            <div className="mt-6">
                <Section title="Antenatal Care (ANC) Visits" icon={Stethoscope}>
                    {activeAncVisits.length > 0 ? (
                        activeAncVisits.map(visitNumber => (
                            <AncVisitDetails key={`anc-${visitNumber}`} patient={patient} visitNumber={visitNumber} />
                        ))
                    ) : (
                        <p className="text-gray-600 italic text-center py-4">No ANC visit records available.</p>
                    )}
                    
                    {patient.additional_anc_count && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <InfoRow label="Additional ANC Visits Beyond 8" value={patient.additional_anc_count} />
                        </div>
                    )}
                </Section>
            </div>

            {/* Child Immunization */}
            <div className="mt-6">
                <Section title="Child Immunization" icon={Baby}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <InfoRow label="Child's Name" value={patient.child_name} />
                        <InfoRow label="Date of Birth" value={formatDate(patient.child_dob)} />
                        <InfoRow label="Gender" value={patient.child_gender} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vaccineCategories.map((category, index) => (
                            <VaccineCategory
                                key={index}
                                title={category.title}
                                vaccines={category.vaccines}
                                color={category.color}
                            />
                        ))}
                    </div>
                </Section>
            </div>

            {/* Notes Section */}
            <div className="mt-6">
                <Section title="Additional Notes" icon={FileText}>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-3">Clinical Remarks:</h3>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[100px]">
                                <p className="text-gray-900 whitespace-pre-wrap">
                                    {patient.remark || "No clinical remarks provided."}
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-700 mb-3">Additional Comments:</h3>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 min-h-[100px]">
                                <p className="text-gray-900 whitespace-pre-wrap">
                                    {patient.comments || "No additional comments provided."}
                                </p>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8 p-6 bg-white rounded-xl shadow-md border border-gray-200">
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
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition text-center"
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