import React from "react";
import { usePage, Link } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { 
    ArrowLeft, Edit, Calendar, User, MapPin, Stethoscope, Baby, CreditCard, Building, AlertCircle,
    CheckCircle, XCircle, DollarSign, FlaskConical, Pill, Syringe, Shield, Heart, FileText,
    Dna, Droplet, Microscope, Scale, TrendingUp 
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

// Reusable Info Row Component
const InfoRow = ({ label, value, className = "" }) => (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-gray-100 last:border-b-0 ${className}`}>
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

    if (!visitDate && !trackedBefore && !paid && !urinalysis && !ironFolate && !mms && !sp && !sba && !hivTest) {
        return null; // Don't render if there's no data for this visit
    }

    return (
        <div className="mb-6 pb-4 border-b border-gray-200 last:mb-0 last:pb-0 last:border-b-0">
            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Stethoscope size={18} className="text-blue-600" />
                ANC Visit {visitNumber}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                <InfoRow label="Visit Date" value={formatDate(visitDate)} />
                <InfoRow label="Tracked Before Visit" value={formatBoolean(trackedBefore)} />
                <InfoRow label="Payment Made" value={formatBoolean(paid)} />
                {paid && <InfoRow label="Payment Amount" value={`₦${paymentAmount}`} />}
            </div>

            <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="font-medium text-gray-700 mb-2">Services Provided:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <span className="flex items-center gap-2">
                        {urinalysis ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />} Urinalysis
                    </span>
                    <span className="flex items-center gap-2">
                        {ironFolate ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />} Iron Folate
                    </span>
                    <span className="flex items-center gap-2">
                        {mms ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />} MMS
                    </span>
                    <span className="flex items-center gap-2">
                        {sp ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />} SP
                    </span>
                    <span className="flex items-center gap-2">
                        {sba ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />} SBA
                    </span>
                </div>
            </div>

            <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-800 mb-2">HIV Testing:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <InfoRow label="Test Conducted" value={hivTest || 'N/A'} className="!border-b-0" />
                    {hivTest === "Yes" && (
                        <>
                            <InfoRow label="Results Received" value={formatBoolean(hivResultReceived)} className="!border-b-0" />
                            {hivResultReceived && <InfoRow label="Test Result" value={hivResult} className="!border-b-0" />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Component for displaying a single vaccine record
const VaccineDetailsRow = ({ label, received, date }) => {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                {received ? <CheckCircle size={14} className="text-green-500" /> : <XCircle size={14} className="text-red-500" />}
                {label}
            </span>
            <span className="text-sm font-semibold text-gray-900">{received ? formatDate(date) : "N/A"}</span>
        </div>
    );
};

export default function ViewAllPatient() {
    const { patient, isCrossFacility = false } = usePage().props;
    
    // Determine active ANC visits based on dates (or other criteria if needed)
    const activeAncVisits = Array.from({ length: 8 }, (_, i) => i + 1)
        .filter(visitNumber => patient[`anc_visit_${visitNumber}_date`] || patient[`tracked_before_anc${visitNumber}`] || patient[`anc${visitNumber}_paid`]);

    const fpMethods = [];
    if (patient.fp_male_condom) fpMethods.push("Male Condom");
    if (patient.fp_female_condom) fpMethods.push("Female Condom");
    if (patient.fp_pill) fpMethods.push("Pill");
    if (patient.fp_injectable) fpMethods.push("Injectable");
    if (patient.fp_implant) fpMethods.push("Implant");
    if (patient.fp_iud) fpMethods.push("IUD");
    if (patient.fp_other && patient.fp_other_specify) fpMethods.push(`Other (${patient.fp_other_specify})`);
    else if (patient.fp_other) fpMethods.push("Other (Not specified)");

    return (
        <PhcStaffLayout title={`Patient: ${patient.woman_name}`}>
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                <div className="flex items-center gap-4 mb-4 lg:mb-0">
                    <Link
                        href={route('phc.all-patients')}
                        className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to Search</span>
                    </Link>
                    <div className="h-6 w-px bg-gray-300 hidden lg:block"></div>
                    <h1 className="text-2xl font-bold text-gray-800">Patient Details</h1>
                </div>
                <Link
                    href={route('phc.all-patients.edit', patient.id)}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                    <Edit size={16} />
                    Edit Patient
                </Link>
            </div>

            {/* Cross-Facility Warning Banner */}
            {isCrossFacility && (
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <Building size={20} className="text-blue-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-blue-700">
                                <strong>Note:</strong> This patient was originally registered at{' '}
                                <strong>{patient.health_facility?.clinic_name}</strong>. 
                                You can update their details while preserving their original facility record.
                            </p>
                        </div>
                    </div>
                </div>
            )}

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

                    {/* Pregnancy & Registration Information */}
                    <Section title="Pregnancy & Registration Information" icon={Baby}>
                        <InfoRow label="Gravida (G)" value={patient.gravida} />
                        <InfoRow label="Parity (P)" value={patient.parity} />
                        <InfoRow label="Date of Registration" value={formatDate(patient.date_of_registration)} />
                        <InfoRow label="Expected Delivery Date (EDD)" value={formatDate(patient.edd)} />
                        <InfoRow label="Family Planning Interest" value={patient.fp_interest} />
                    </Section>

                    {/* Delivery Information */}
                    <Section title="Delivery Information" icon={Calendar}>
                        <InfoRow label="Place of Delivery" value={patient.place_of_delivery} />
                        <InfoRow label="Type of Delivery" value={patient.type_of_delivery} />
                        <InfoRow label="Delivery Outcome" value={patient.delivery_outcome} />
                        <InfoRow label="Date of Delivery" value={formatDate(patient.date_of_delivery)} />
                        <InfoRow label="Delivery Kits Received" value={formatBoolean(patient.delivery_kits_received)} />
                    </Section>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* ANC Visits */}
                    <Section title="Antenatal Care (ANC) Visits" icon={Stethoscope}>
                        {activeAncVisits.length > 0 ? (
                            activeAncVisits.map(visitNumber => (
                                <AncVisitDetails key={`anc-${visitNumber}`} patient={patient} visitNumber={visitNumber} />
                            ))
                        ) : (
                            <p className="text-gray-600 italic">No ANC visit records available.</p>
                        )}
                        <InfoRow label="Additional ANC Count" value={patient.additional_anc_count || 0} />
                    </Section>

                    {/* Postnatal Care */}
                    <Section title="Postnatal Care (PNC)" icon={Heart}>
                        <InfoRow label="PNC Visit 1 Date" value={formatDate(patient.pnc_visit_1)} />
                        <InfoRow label="PNC Visit 2 Date" value={formatDate(patient.pnc_visit_2)} />
                        <InfoRow label="PNC Visit 3 Date" value={formatDate(patient.pnc_visit_3)} />
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
                                <InfoRow label="Insurance Satisfaction" value={formatBoolean(patient.insurance_satisfaction)} />
                            </>
                        )}
                    </Section>

                    {/* Family Planning */}
                    <Section title="Family Planning (FP)" icon={Dna}>
                        <InfoRow label="Currently Using FP" value={formatBoolean(patient.fp_using)} />
                        {patient.fp_using && fpMethods.length > 0 && (
                            <div className="py-2 border-b border-gray-100 last:border-b-0">
                                <span className="font-medium text-gray-700 text-sm sm:text-base">Methods Used:</span>
                                <ul className="list-disc list-inside text-gray-900 font-semibold mt-1 sm:mt-0 text-sm sm:text-base">
                                    {fpMethods.map((method, index) => (
                                        <li key={index}>{method}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {patient.fp_using && fpMethods.length === 0 && (
                             <InfoRow label="Methods Used" value="Not specified" />
                        )}
                    </Section>

                    {/* Child Immunization */}
                    <Section title="Child Immunization" icon={Baby}>
                        <InfoRow label="Child's Name" value={patient.child_name} />
                        <InfoRow label="Date of Birth" value={formatDate(patient.child_dob)} />
                        <InfoRow label="Gender" value={patient.child_gender} />

                        <div className="mt-4 space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-800 mb-2">At Birth</h4>
                                <VaccineDetailsRow label="BCG" received={patient.bcg_received} date={patient.bcg_date} />
                                <VaccineDetailsRow label="Hep 0" received={patient.hep0_received} date={patient.hep0_date} />
                                <VaccineDetailsRow label="OPV 0" received={patient.opv0_received} date={patient.opv0_date} />
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <h4 className="font-semibold text-green-800 mb-2">6 Weeks</h4>
                                <VaccineDetailsRow label="Penta 1" received={patient.penta1_received} date={patient.penta1_date} />
                                <VaccineDetailsRow label="PCV 1" received={patient.pcv1_received} date={patient.pcv1_date} />
                                <VaccineDetailsRow label="OPV 1" received={patient.opv1_received} date={patient.opv1_date} />
                                <VaccineDetailsRow label="Rota 1" received={patient.rota1_received} date={patient.rota1_date} />
                                <VaccineDetailsRow label="IPV 1" received={patient.ipv1_received} date={patient.ipv1_date} />
                            </div>
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                <h4 className="font-semibold text-yellow-800 mb-2">10 Weeks</h4>
                                <VaccineDetailsRow label="Penta 2" received={patient.penta2_received} date={patient.penta2_date} />
                                <VaccineDetailsRow label="PCV 2" received={patient.pcv2_received} date={patient.pcv2_date} />
                                <VaccineDetailsRow label="Rota 2" received={patient.rota2_received} date={patient.rota2_date} />
                                <VaccineDetailsRow label="OPV 2" received={patient.opv2_received} date={patient.opv2_date} />
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                <h4 className="font-semibold text-orange-800 mb-2">14 Weeks</h4>
                                <VaccineDetailsRow label="Penta 3" received={patient.penta3_received} date={patient.penta3_date} />
                                <VaccineDetailsRow label="PCV 3" received={patient.pcv3_received} date={patient.pcv3_date} />
                                <VaccineDetailsRow label="OPV 3" received={patient.opv3_received} date={patient.opv3_date} />
                                <VaccineDetailsRow label="Rota 3" received={patient.rota3_received} date={patient.rota3_date} />
                                <VaccineDetailsRow label="IPV 2" received={patient.ipv2_received} date={patient.ipv2_date} />
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                <h4 className="font-semibold text-red-800 mb-2">9 Months</h4>
                                <VaccineDetailsRow label="Measles" received={patient.measles_received} date={patient.measles_date} />
                                <VaccineDetailsRow label="Yellow Fever" received={patient.yellow_fever_received} date={patient.yellow_fever_date} />
                                <VaccineDetailsRow label="Vitamin A" received={patient.vitamin_a_received} date={patient.vitamin_a_date} />
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <h4 className="font-semibold text-purple-800 mb-2">15 Months</h4>
                                <VaccineDetailsRow label="MCV 2" received={patient.mcv2_received} date={patient.mcv2_date} />
                            </div>
                        </div>
                    </Section>
                </div>
            </div>

            {/* Notes Section - Full Width */}
            <div className="mt-6">
                <Section title="Notes & Comments" icon={FileText}>
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
                    href={route('phc.all-patients')}
                    className="flex items-center justify-center gap-2 bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-700 transition text-center"
                >
                    <ArrowLeft size={16} />
                    Back to Search
                </Link>
                <Link
                    href={route('phc.all-patients.edit', patient.id)}
                    className="flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-700 transition text-center"
                >
                    <Edit size={16} />
                    Edit Patient Record
                </Link>
            </div>
        </PhcStaffLayout>
    );
}