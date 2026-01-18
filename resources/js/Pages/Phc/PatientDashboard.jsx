import React, { useState } from "react";
import { useForm, Link } from "@inertiajs/react";
import { useTranslation } from "react-i18next";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import {
    User, Calendar, MapPin, Phone, Heart, Baby, Stethoscope, 
    Shield, Activity, Plus, Check, X, Clock, AlertCircle,
    ChevronDown, ChevronUp, Edit, ArrowLeft
} from "lucide-react";

const ActionButton = ({ icon: Icon, label, color, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`flex flex-col items-center justify-center p-6 rounded-xl shadow-lg hover:shadow-xl transition-all ${color} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
        <Icon className="h-10 w-10 mb-3" />
        <span className="font-semibold text-lg">{label}</span>
    </button>
);

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

const AncForm = ({ patient, onClose }) => {
    const { t } = useTranslation();
    const today = new Date().toISOString().split('T')[0];
    
    const { data, setData, post, processing, errors } = useForm({
        visit_date: today,
        urinalysis: false,
        iron_folate: false,
        mms: false,
        sp: false,
        pcv: false,
        td: false,
        hiv_test: '',
        hiv_result_received: false,
        hiv_result: '',
        paid: false,
        payment_amount: '',
        counseling_hiv_syphilis: false,
        syphilis_test: '',
        syphilis_treated: false,
        hep_b_test: '',
        hep_c_test: '',
        itn_given: false,
        deworming: false,
        blood_sugar_checked: false,
        blood_sugar_result: '',
        vitamin_fe: false,
        visit_outcome: '',
        facility_name: patient.phc?.clinic_name || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('phc.patient.anc.store', patient.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">Patient Information (Read-Only)</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium">Name:</span> {patient.woman_name}</div>
                    <div><span className="font-medium">Age:</span> {patient.age} years</div>
                    <div><span className="font-medium">Card No:</span> {patient.unique_id}</div>
                    <div><span className="font-medium">Parity:</span> {patient.parity || 'N/A'}</div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date *</label>
                    <input type="date" value={data.visit_date} onChange={(e) => setData('visit_date', e.target.value)} className="w-full border rounded-lg p-2" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facility Name</label>
                    <input type="text" value={data.facility_name} onChange={(e) => setData('facility_name', e.target.value)} className="w-full border rounded-lg p-2" />
                </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">ANC Services</h4>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { key: 'urinalysis', label: 'Urinalysis' },
                        { key: 'iron_folate', label: 'Iron/Folate' },
                        { key: 'mms', label: 'MMS' },
                        { key: 'sp', label: 'SP' },
                        { key: 'pcv', label: 'PCV' },
                        { key: 'td', label: 'TD' },
                        { key: 'vitamin_fe', label: 'Vitamin/Fe' },
                        { key: 'itn_given', label: 'ITN Given' },
                        { key: 'deworming', label: 'Deworming' },
                    ].map(({ key, label }) => (
                        <label key={key} className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-white">
                            <input type="checkbox" checked={data[key]} onChange={(e) => setData(key, e.target.checked)} className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm">{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-3">Counseling & HIV Testing</h4>
                <div className="space-y-3">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={data.counseling_hiv_syphilis} onChange={(e) => setData('counseling_hiv_syphilis', e.target.checked)} className="w-4 h-4" />
                        <span className="text-sm">HIV & Syphilis Counseling Done</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">HIV Test</label>
                            <select value={data.hiv_test} onChange={(e) => setData('hiv_test', e.target.value)} className="w-full border rounded p-2 text-sm">
                                <option value="">Not tested</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                            </select>
                        </div>
                        {data.hiv_test === 'Yes' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">HIV Result</label>
                                <select value={data.hiv_result} onChange={(e) => setData('hiv_result', e.target.value)} className="w-full border rounded p-2 text-sm">
                                    <option value="">Select</option>
                                    <option value="Negative">Negative</option>
                                    <option value="Positive">Positive</option>
                                </select>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-3">Syphilis & Hepatitis Testing</h4>
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Syphilis Test</label>
                        <select value={data.syphilis_test} onChange={(e) => setData('syphilis_test', e.target.value)} className="w-full border rounded p-2 text-sm">
                            <option value="">Select</option>
                            <option value="Positive">Positive</option>
                            <option value="Negative">Negative</option>
                            <option value="Not Done">Not Done</option>
                        </select>
                    </div>
                    {data.syphilis_test === 'Positive' && (
                        <div className="flex items-end">
                            <label className="flex items-center gap-2 p-2 border rounded bg-white">
                                <input type="checkbox" checked={data.syphilis_treated} onChange={(e) => setData('syphilis_treated', e.target.checked)} className="w-4 h-4" />
                                <span className="text-sm">Treated</span>
                            </label>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hepatitis B</label>
                        <select value={data.hep_b_test} onChange={(e) => setData('hep_b_test', e.target.value)} className="w-full border rounded p-2 text-sm">
                            <option value="">Select</option>
                            <option value="Positive">Positive</option>
                            <option value="Negative">Negative</option>
                            <option value="Not Done">Not Done</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hepatitis C</label>
                        <select value={data.hep_c_test} onChange={(e) => setData('hep_c_test', e.target.value)} className="w-full border rounded p-2 text-sm">
                            <option value="">Select</option>
                            <option value="Positive">Positive</option>
                            <option value="Negative">Negative</option>
                            <option value="Not Done">Not Done</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-800 mb-3">Blood Sugar Check</h4>
                <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center gap-2">
                        <input type="checkbox" checked={data.blood_sugar_checked} onChange={(e) => setData('blood_sugar_checked', e.target.checked)} className="w-4 h-4" />
                        <span className="text-sm">Blood Sugar Checked</span>
                    </label>
                    {data.blood_sugar_checked && (
                        <input type="text" placeholder="Result (e.g., 5.5 mmol/L)" value={data.blood_sugar_result} onChange={(e) => setData('blood_sugar_result', e.target.value)} className="border rounded p-2 text-sm" />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visit Outcome</label>
                    <select value={data.visit_outcome} onChange={(e) => setData('visit_outcome', e.target.value)} className="w-full border rounded-lg p-2">
                        <option value="">Select</option>
                        <option value="Continued">Continued</option>
                        <option value="Referred">Referred</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Defaulted">Defaulted</option>
                    </select>
                </div>
                <div className="flex items-end gap-3">
                    <label className="flex items-center gap-2 p-2 border rounded">
                        <input type="checkbox" checked={data.paid} onChange={(e) => setData('paid', e.target.checked)} className="w-4 h-4" />
                        <span className="text-sm">Payment Made</span>
                    </label>
                    {data.paid && (
                        <input type="number" placeholder="Amount" value={data.payment_amount} onChange={(e) => setData('payment_amount', e.target.value)} className="w-24 border rounded p-2 text-sm" />
                    )}
                </div>
            </div>

            <button type="submit" disabled={processing} className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50">
                {processing ? 'Saving...' : `Record ANC Visit ${patient.anc_visits_count + 1}`}
            </button>
        </form>
    );
};

const DeliveryForm = ({ patient, onClose }) => {
    const { data, setData, post, processing } = useForm({
        date_of_delivery: new Date().toISOString().split('T')[0],
        place_of_delivery: '',
        type_of_delivery: '',
        delivery_outcome: '',
        complication_if_any: 'No complication',
        mother_alive: 'Yes',
        mother_status: '',
        delivery_kits_received: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('phc.patient.delivery.store', patient.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Delivery *</label>
                <input
                    type="date"
                    value={data.date_of_delivery}
                    onChange={(e) => setData('date_of_delivery', e.target.value)}
                    className="w-full border rounded-lg p-3"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Place of Delivery *</label>
                <select
                    value={data.place_of_delivery}
                    onChange={(e) => setData('place_of_delivery', e.target.value)}
                    className="w-full border rounded-lg p-3"
                    required
                >
                    <option value="">Select Place</option>
                    <option value="Registered Facility">Registered Facility (PHC/Hospital)</option>
                    <option value="Home">Home</option>
                    <option value="Other Facility">Other Facility</option>
                    <option value="Traditional Attendant">Traditional Attendant</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type of Delivery *</label>
                <select
                    value={data.type_of_delivery}
                    onChange={(e) => setData('type_of_delivery', e.target.value)}
                    className="w-full border rounded-lg p-3"
                    required
                >
                    <option value="">Select Type</option>
                    <option value="Normal (Vaginal)">Normal (Vaginal)</option>
                    <option value="Cesarean Section">Cesarean Section</option>
                    <option value="Assisted">Assisted</option>
                    <option value="Breech">Breech</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Outcome *</label>
                <select
                    value={data.delivery_outcome}
                    onChange={(e) => setData('delivery_outcome', e.target.value)}
                    className="w-full border rounded-lg p-3"
                    required
                >
                    <option value="">Select Outcome</option>
                    <option value="Live birth">Live birth</option>
                    <option value="Stillbirth">Stillbirth</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complications</label>
                <select
                    value={data.complication_if_any}
                    onChange={(e) => setData('complication_if_any', e.target.value)}
                    className="w-full border rounded-lg p-3"
                >
                    <option value="No complication">No complication</option>
                    <option value="Hemorrhage">Hemorrhage</option>
                    <option value="Eclampsia">Eclampsia</option>
                    <option value="Sepsis">Sepsis</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother Alive *</label>
                    <select
                        value={data.mother_alive}
                        onChange={(e) => setData('mother_alive', e.target.value)}
                        className="w-full border rounded-lg p-3"
                        required
                    >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mother Status *</label>
                    <select
                        value={data.mother_status}
                        onChange={(e) => setData('mother_status', e.target.value)}
                        className="w-full border rounded-lg p-3"
                        required
                    >
                        <option value="">Select Status</option>
                        <option value="Discharged home">Discharged home</option>
                        <option value="Admitted">Admitted</option>
                        <option value="Referred to other facility">Referred</option>
                    </select>
                </div>
            </div>

            <label className="flex items-center gap-2 p-3 border rounded-lg">
                <input
                    type="checkbox"
                    checked={data.delivery_kits_received}
                    onChange={(e) => setData('delivery_kits_received', e.target.checked)}
                    className="w-5 h-5"
                />
                <span>Delivery Kits Received</span>
            </label>

            <button
                type="submit"
                disabled={processing}
                className="w-full py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 font-medium disabled:opacity-50"
            >
                {processing ? 'Saving...' : 'Record Delivery'}
            </button>
        </form>
    );
};

const PncForm = ({ patient, onClose }) => {
    const { data, setData, post, processing } = useForm({
        visit_number: '',
        visit_date: new Date().toISOString().split('T')[0],
    });

    const getAvailableVisits = () => {
        const visits = [];
        if (!patient.pnc_visit_1) visits.push(1);
        if (!patient.pnc_visit_2) visits.push(2);
        if (!patient.pnc_visit_3) visits.push(3);
        return visits;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('phc.patient.pnc.store', patient.id), {
            onSuccess: () => onClose(),
        });
    };

    const availableVisits = getAvailableVisits();

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PNC Visit Number *</label>
                <select
                    value={data.visit_number}
                    onChange={(e) => setData('visit_number', e.target.value)}
                    className="w-full border rounded-lg p-3"
                    required
                >
                    <option value="">Select Visit</option>
                    {availableVisits.map((v) => (
                        <option key={v} value={v}>PNC Visit {v}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date *</label>
                <input
                    type="date"
                    value={data.visit_date}
                    onChange={(e) => setData('visit_date', e.target.value)}
                    className="w-full border rounded-lg p-3"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={processing || availableVisits.length === 0}
                className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
            >
                {processing ? 'Saving...' : 'Record PNC Visit'}
            </button>
        </form>
    );
};

const FamilyPlanningForm = ({ patient, onClose }) => {
    const { t } = useTranslation();
    const today = new Date().toISOString().split('T')[0];
    
    const { data, setData, post, processing, errors } = useForm({
        visit_date: today,
        client_card_number: patient.unique_id || '',
        sex: 'Female',
        marital_status: '',
        acceptor_type: 'New',
        blood_pressure: '',
        oral_pills: false,
        oral_pills_type: '',
        oral_pills_status: '',
        oral_pills_cycles: '',
        injectable: false,
        injectable_type: '',
        injectable_status: '',
        injectable_doses: '',
        iud: false,
        iud_status: '',
        iud_action: '',
        condoms: false,
        condoms_type: '',
        condoms_direction: '',
        condoms_quantity: '',
        implants: false,
        implants_type: '',
        implants_direction: '',
        voluntary_sterilization: false,
        sterilization_type: '',
        natural_methods: false,
        cycle_beads: false,
        natural_method_other: '',
        referred: false,
        referred_to: '',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('phc.patient.fp.store', patient.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">Visit Information</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date *</label>
                        <input type="date" value={data.visit_date} onChange={(e) => setData('visit_date', e.target.value)} className="w-full border rounded-lg p-2" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Client Card No.</label>
                        <input type="text" value={data.client_card_number} onChange={(e) => setData('client_card_number', e.target.value)} className="w-full border rounded-lg p-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                        <select value={data.marital_status} onChange={(e) => setData('marital_status', e.target.value)} className="w-full border rounded-lg p-2">
                            <option value="">Select...</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Acceptor Type *</label>
                        <select value={data.acceptor_type} onChange={(e) => setData('acceptor_type', e.target.value)} className="w-full border rounded-lg p-2" required>
                            <option value="New">New Acceptor</option>
                            <option value="Revisit">Revisit</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure</label>
                        <input type="text" placeholder="e.g., 120/80" value={data.blood_pressure} onChange={(e) => setData('blood_pressure', e.target.value)} className="w-full border rounded-lg p-2" />
                    </div>
                </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Contraceptive Methods</h4>
                
                <div className="space-y-4">
                    <div className="border-b pb-3">
                        <label className="flex items-center gap-2 mb-2">
                            <input type="checkbox" checked={data.oral_pills} onChange={(e) => setData('oral_pills', e.target.checked)} className="w-4 h-4" />
                            <span className="font-medium">Oral Pills</span>
                        </label>
                        {data.oral_pills && (
                            <div className="grid grid-cols-3 gap-2 ml-6">
                                <input type="text" placeholder="Type of Pills" value={data.oral_pills_type} onChange={(e) => setData('oral_pills_type', e.target.value)} className="border rounded p-2 text-sm" />
                                <select value={data.oral_pills_status} onChange={(e) => setData('oral_pills_status', e.target.value)} className="border rounded p-2 text-sm">
                                    <option value="">Status</option>
                                    <option value="New">New</option>
                                    <option value="RV">Revisit</option>
                                </select>
                                <input type="number" placeholder="Cycles" value={data.oral_pills_cycles} onChange={(e) => setData('oral_pills_cycles', e.target.value)} className="border rounded p-2 text-sm" min="0" />
                            </div>
                        )}
                    </div>

                    <div className="border-b pb-3">
                        <label className="flex items-center gap-2 mb-2">
                            <input type="checkbox" checked={data.injectable} onChange={(e) => setData('injectable', e.target.checked)} className="w-4 h-4" />
                            <span className="font-medium">Injectable</span>
                        </label>
                        {data.injectable && (
                            <div className="grid grid-cols-3 gap-2 ml-6">
                                <input type="text" placeholder="Type" value={data.injectable_type} onChange={(e) => setData('injectable_type', e.target.value)} className="border rounded p-2 text-sm" />
                                <select value={data.injectable_status} onChange={(e) => setData('injectable_status', e.target.value)} className="border rounded p-2 text-sm">
                                    <option value="">Status</option>
                                    <option value="New">New</option>
                                    <option value="RV">Revisit</option>
                                </select>
                                <input type="number" placeholder="Doses" value={data.injectable_doses} onChange={(e) => setData('injectable_doses', e.target.value)} className="border rounded p-2 text-sm" min="0" />
                            </div>
                        )}
                    </div>

                    <div className="border-b pb-3">
                        <label className="flex items-center gap-2 mb-2">
                            <input type="checkbox" checked={data.iud} onChange={(e) => setData('iud', e.target.checked)} className="w-4 h-4" />
                            <span className="font-medium">IUDs</span>
                        </label>
                        {data.iud && (
                            <div className="grid grid-cols-2 gap-2 ml-6">
                                <select value={data.iud_status} onChange={(e) => setData('iud_status', e.target.value)} className="border rounded p-2 text-sm">
                                    <option value="">Status</option>
                                    <option value="New">New</option>
                                    <option value="RV">Revisit</option>
                                </select>
                                <select value={data.iud_action} onChange={(e) => setData('iud_action', e.target.value)} className="border rounded p-2 text-sm">
                                    <option value="">Action</option>
                                    <option value="Insertion">Insertion</option>
                                    <option value="Removal">Removal</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="border-b pb-3">
                        <label className="flex items-center gap-2 mb-2">
                            <input type="checkbox" checked={data.condoms} onChange={(e) => setData('condoms', e.target.checked)} className="w-4 h-4" />
                            <span className="font-medium">Condoms</span>
                        </label>
                        {data.condoms && (
                            <div className="grid grid-cols-3 gap-2 ml-6">
                                <select value={data.condoms_type} onChange={(e) => setData('condoms_type', e.target.value)} className="border rounded p-2 text-sm">
                                    <option value="">Type</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Both">Both</option>
                                </select>
                                <select value={data.condoms_direction} onChange={(e) => setData('condoms_direction', e.target.value)} className="border rounded p-2 text-sm">
                                    <option value="">IN/OUT</option>
                                    <option value="IN">IN</option>
                                    <option value="OUT">OUT</option>
                                </select>
                                <input type="number" placeholder="Quantity" value={data.condoms_quantity} onChange={(e) => setData('condoms_quantity', e.target.value)} className="border rounded p-2 text-sm" min="0" />
                            </div>
                        )}
                    </div>

                    <div className="border-b pb-3">
                        <label className="flex items-center gap-2 mb-2">
                            <input type="checkbox" checked={data.implants} onChange={(e) => setData('implants', e.target.checked)} className="w-4 h-4" />
                            <span className="font-medium">Implants</span>
                        </label>
                        {data.implants && (
                            <div className="grid grid-cols-2 gap-2 ml-6">
                                <input type="text" placeholder="Type" value={data.implants_type} onChange={(e) => setData('implants_type', e.target.value)} className="border rounded p-2 text-sm" />
                                <select value={data.implants_direction} onChange={(e) => setData('implants_direction', e.target.value)} className="border rounded p-2 text-sm">
                                    <option value="">IN/OUT</option>
                                    <option value="IN">IN (Insertion)</option>
                                    <option value="OUT">OUT (Removal)</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="border-b pb-3">
                        <label className="flex items-center gap-2 mb-2">
                            <input type="checkbox" checked={data.voluntary_sterilization} onChange={(e) => setData('voluntary_sterilization', e.target.checked)} className="w-4 h-4" />
                            <span className="font-medium">Voluntary Sterilization</span>
                        </label>
                        {data.voluntary_sterilization && (
                            <div className="ml-6">
                                <select value={data.sterilization_type} onChange={(e) => setData('sterilization_type', e.target.value)} className="border rounded p-2 text-sm w-full">
                                    <option value="">Select Type</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="border-b pb-3">
                        <label className="flex items-center gap-2 mb-2">
                            <input type="checkbox" checked={data.natural_methods} onChange={(e) => setData('natural_methods', e.target.checked)} className="w-4 h-4" />
                            <span className="font-medium">Natural Methods</span>
                        </label>
                        {data.natural_methods && (
                            <div className="ml-6 space-y-2">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={data.cycle_beads} onChange={(e) => setData('cycle_beads', e.target.checked)} className="w-4 h-4" />
                                    <span className="text-sm">Cycle Beads</span>
                                </label>
                                <input type="text" placeholder="Other natural method" value={data.natural_method_other} onChange={(e) => setData('natural_method_other', e.target.value)} className="border rounded p-2 text-sm w-full" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg">
                <label className="flex items-center gap-2 mb-2">
                    <input type="checkbox" checked={data.referred} onChange={(e) => setData('referred', e.target.checked)} className="w-4 h-4" />
                    <span className="font-medium">Referred</span>
                </label>
                {data.referred && (
                    <input type="text" placeholder="Referred to..." value={data.referred_to} onChange={(e) => setData('referred_to', e.target.value)} className="w-full border rounded p-2 text-sm" />
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={data.notes} onChange={(e) => setData('notes', e.target.value)} className="w-full border rounded-lg p-2" rows="2" placeholder="Additional notes..."></textarea>
            </div>

            <button type="submit" disabled={processing} className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50">
                {processing ? 'Saving...' : 'Record Family Planning Visit'}
            </button>
        </form>
    );
};

export default function PatientDashboard({ patient }) {
    const [activeModal, setActiveModal] = useState(null);

    const ancProgress = (patient.anc_visits_count / 8) * 100;
    const pncProgress = [patient.pnc_visit_1, patient.pnc_visit_2, patient.pnc_visit_3].filter(Boolean).length;

    return (
        <PhcStaffLayout header={`Patient: ${patient.woman_name}`}>
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <Link
                        href={route("phc.search")}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600"
                    >
                        <ArrowLeft size={20} />
                        Back to Search
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-gray-800">{patient.woman_name}</h1>
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-medium">
                                    {patient.unique_id}
                                </span>
                            </div>
                            <p className="text-gray-600 mt-1">Age: {patient.age} years</p>
                        </div>
                        <Link
                            href={route("phc.patients.edit", patient.id)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Edit size={18} />
                            Edit Details
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Phone className="text-gray-400" size={20} />
                            <div>
                                <p className="text-xs text-gray-500">Phone</p>
                                <p className="font-medium">{patient.phone_number || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <MapPin className="text-gray-400" size={20} />
                            <div>
                                <p className="text-xs text-gray-500">Location</p>
                                <p className="font-medium">{patient.lga?.name}, {patient.ward?.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Calendar className="text-gray-400" size={20} />
                            <div>
                                <p className="text-xs text-gray-500">Expected Delivery</p>
                                <p className="font-medium">{patient.edd || 'Not set'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Activity className="text-gray-400" size={20} />
                            <div>
                                <p className="text-xs text-gray-500">Pregnancy</p>
                                <p className="font-medium">G{patient.gravida || 0} P{patient.parity || 0}</p>
                            </div>
                        </div>
                    </div>

                    {patient.alert && (
                        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                            <AlertCircle className="text-amber-600" size={24} />
                            <span className="text-amber-800 font-medium">{patient.alert}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="font-semibold text-gray-800 mb-3">ANC Progress</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 bg-gray-200 rounded-full h-4">
                                <div 
                                    className="bg-emerald-500 h-4 rounded-full transition-all"
                                    style={{ width: `${ancProgress}%` }}
                                ></div>
                            </div>
                            <span className="font-bold text-emerald-600">{patient.anc_visits_count}/8</span>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="font-semibold text-gray-800 mb-3">PNC Progress</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 bg-gray-200 rounded-full h-4">
                                <div 
                                    className="bg-purple-500 h-4 rounded-full transition-all"
                                    style={{ width: `${(pncProgress / 3) * 100}%` }}
                                ></div>
                            </div>
                            <span className="font-bold text-purple-600">{pncProgress}/3</span>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                    <ActionButton
                        icon={Stethoscope}
                        label="Add ANC"
                        color="bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        onClick={() => setActiveModal('anc')}
                        disabled={patient.anc_visits_count >= 8}
                    />
                    <ActionButton
                        icon={Heart}
                        label="Delivery"
                        color="bg-pink-100 text-pink-800 hover:bg-pink-200"
                        onClick={() => setActiveModal('delivery')}
                        disabled={!!patient.date_of_delivery}
                    />
                    <ActionButton
                        icon={Baby}
                        label="Child"
                        color="bg-blue-100 text-blue-800 hover:bg-blue-200"
                        onClick={() => window.location.href = route('phc.children.create', { patient_id: patient.id })}
                    />
                    <ActionButton
                        icon={Shield}
                        label="PNC"
                        color="bg-purple-100 text-purple-800 hover:bg-purple-200"
                        onClick={() => setActiveModal('pnc')}
                        disabled={patient.pnc_completed}
                    />
                    <ActionButton
                        icon={Activity}
                        label="Family Planning"
                        color="bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                        onClick={() => setActiveModal('fp')}
                    />
                </div>

                {patient.children && patient.children.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Children</h3>
                        <div className="grid gap-3">
                            {patient.children.map((child) => (
                                <Link
                                    key={child.id}
                                    href={route('phc.children.show', child.id)}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-full ${child.sex === 'Male' ? 'bg-blue-100' : 'bg-pink-100'}`}>
                                            <Baby className={child.sex === 'Male' ? 'text-blue-600' : 'text-pink-600'} size={24} />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{child.child_name}</p>
                                            <p className="text-sm text-gray-500">DOB: {child.date_of_birth}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-3 py-1 rounded-full text-sm ${
                                            child.nutrition_status === 'Normal' ? 'bg-green-100 text-green-800' :
                                            child.nutrition_status === 'MAM' ? 'bg-yellow-100 text-yellow-800' :
                                            child.nutrition_status === 'SAM' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {child.nutrition_status}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <Modal isOpen={activeModal === 'anc'} onClose={() => setActiveModal(null)} title="Record ANC Visit">
                    <AncForm patient={patient} onClose={() => setActiveModal(null)} />
                </Modal>

                <Modal isOpen={activeModal === 'delivery'} onClose={() => setActiveModal(null)} title="Record Delivery">
                    <DeliveryForm patient={patient} onClose={() => setActiveModal(null)} />
                </Modal>

                <Modal isOpen={activeModal === 'pnc'} onClose={() => setActiveModal(null)} title="Record PNC Visit">
                    <PncForm patient={patient} onClose={() => setActiveModal(null)} />
                </Modal>

                <Modal isOpen={activeModal === 'fp'} onClose={() => setActiveModal(null)} title="Family Planning">
                    <FamilyPlanningForm patient={patient} onClose={() => setActiveModal(null)} />
                </Modal>
            </div>
        </PhcStaffLayout>
    );
}
