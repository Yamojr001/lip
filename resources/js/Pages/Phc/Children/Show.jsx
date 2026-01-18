import React, { useState } from "react";
import { useForm, Link } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import {
    ArrowLeft, Baby, User, Phone, MapPin, Calendar, Activity,
    Syringe, Scale, Edit, Plus, Check, X, AlertCircle
} from "lucide-react";

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

const ImmunizationForm = ({ child, onClose }) => {
    const { data, setData, post, processing } = useForm({
        vaccine: '',
        date: new Date().toISOString().split('T')[0],
    });

    const vaccineSchedule = [
        { group: 'At Birth', vaccines: ['bcg', 'hep0', 'opv0'] },
        { group: '6 Weeks', vaccines: ['penta1', 'pcv1', 'opv1', 'rota1', 'ipv1'] },
        { group: '10 Weeks', vaccines: ['penta2', 'pcv2', 'rota2', 'opv2'] },
        { group: '14 Weeks', vaccines: ['penta3', 'pcv3', 'opv3', 'rota3', 'ipv2'] },
        { group: '9 Months', vaccines: ['measles1', 'yellow_fever', 'vitamin_a1'] },
        { group: '15 Months', vaccines: ['measles2', 'vitamin_a2'] },
    ];

    const getPendingVaccines = () => {
        const pending = [];
        vaccineSchedule.forEach(({ group, vaccines }) => {
            vaccines.forEach(v => {
                if (!child[`${v}_received`]) {
                    pending.push({ value: v, label: `${v.toUpperCase().replace('_', ' ')} (${group})` });
                }
            });
        });
        return pending;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('phc.children.immunization.store', child.id), {
            onSuccess: () => onClose(),
        });
    };

    const pendingVaccines = getPendingVaccines();

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vaccine *</label>
                <select
                    value={data.vaccine}
                    onChange={(e) => setData('vaccine', e.target.value)}
                    className="w-full border rounded-lg p-3"
                    required
                >
                    <option value="">Select Vaccine</option>
                    {pendingVaccines.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Given *</label>
                <input
                    type="date"
                    value={data.date}
                    onChange={(e) => setData('date', e.target.value)}
                    className="w-full border rounded-lg p-3"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={processing || pendingVaccines.length === 0}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
            >
                {processing ? 'Recording...' : 'Record Immunization'}
            </button>
        </form>
    );
};

const NutritionForm = ({ child, onClose }) => {
    const { data, setData, post, processing } = useForm({
        visit_date: new Date().toISOString().split('T')[0],
        weight: '',
        height: '',
        muac: '',
        vitamin_a_given: false,
        deworming_given: false,
        iron_supplement_given: false,
        feeding_practice: '',
        referred_for_treatment: false,
        referral_reason: '',
        counseling_given: '',
        remarks: '',
        next_visit_date: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('phc.children.nutrition.store', child.id), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg) *</label>
                    <input
                        type="number"
                        step="0.1"
                        value={data.weight}
                        onChange={(e) => setData('weight', e.target.value)}
                        className="w-full border rounded-lg p-3"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={data.height}
                        onChange={(e) => setData('height', e.target.value)}
                        className="w-full border rounded-lg p-3"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">MUAC (cm)</label>
                    <input
                        type="number"
                        step="0.1"
                        value={data.muac}
                        onChange={(e) => setData('muac', e.target.value)}
                        className="w-full border rounded-lg p-3"
                    />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                {[
                    { key: 'vitamin_a_given', label: 'Vitamin A' },
                    { key: 'deworming_given', label: 'Deworming' },
                    { key: 'iron_supplement_given', label: 'Iron' },
                ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                            type="checkbox"
                            checked={data[key]}
                            onChange={(e) => setData(key, e.target.checked)}
                            className="w-5 h-5"
                        />
                        <span className="text-sm">{label}</span>
                    </label>
                ))}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feeding Practice</label>
                <select
                    value={data.feeding_practice}
                    onChange={(e) => setData('feeding_practice', e.target.value)}
                    className="w-full border rounded-lg p-3"
                >
                    <option value="">Select Practice</option>
                    <option value="Exclusive Breastfeeding">Exclusive Breastfeeding</option>
                    <option value="Mixed Feeding">Mixed Feeding</option>
                    <option value="Formula Only">Formula Only</option>
                    <option value="Complementary Feeding">Complementary Feeding</option>
                </select>
            </div>

            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={data.referred_for_treatment}
                        onChange={(e) => setData('referred_for_treatment', e.target.checked)}
                        className="w-5 h-5"
                    />
                    <span>Referred for Treatment</span>
                </label>
            </div>

            {data.referred_for_treatment && (
                <input
                    type="text"
                    placeholder="Referral reason"
                    value={data.referral_reason}
                    onChange={(e) => setData('referral_reason', e.target.value)}
                    className="w-full border rounded-lg p-3"
                />
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea
                    value={data.remarks}
                    onChange={(e) => setData('remarks', e.target.value)}
                    className="w-full border rounded-lg p-3"
                    rows="2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Visit Date</label>
                <input
                    type="date"
                    value={data.next_visit_date}
                    onChange={(e) => setData('next_visit_date', e.target.value)}
                    className="w-full border rounded-lg p-3"
                />
            </div>

            <button
                type="submit"
                disabled={processing}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium disabled:opacity-50"
            >
                {processing ? 'Recording...' : 'Record Nutrition Visit'}
            </button>
        </form>
    );
};

const VaccineCard = ({ label, received, date }) => (
    <div className={`p-3 rounded-lg border ${received ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{label}</span>
            {received ? (
                <Check className="text-green-600" size={18} />
            ) : (
                <X className="text-gray-400" size={18} />
            )}
        </div>
        {received && date && (
            <p className="text-xs text-gray-500 mt-1">{date}</p>
        )}
    </div>
);

export default function ShowChild({ child }) {
    const [activeModal, setActiveModal] = useState(null);

    const getNutritionColor = (status) => {
        switch (status) {
            case 'Normal': return 'bg-green-100 text-green-800 border-green-200';
            case 'MAM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'SAM': return 'bg-red-100 text-red-800 border-red-200';
            case 'Overweight': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <PhcStaffLayout header={`Child: ${child.child_name}`}>
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <Link
                        href={child.patient_id ? route("phc.patient.dashboard", child.patient_id) : route("phc.children.index")}
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600"
                    >
                        <ArrowLeft size={20} />
                        Back
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-full ${child.sex === 'Male' ? 'bg-blue-100' : 'bg-pink-100'}`}>
                                <Baby className={`h-10 w-10 ${child.sex === 'Male' ? 'text-blue-600' : 'text-pink-600'}`} />
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl font-bold text-gray-800">{child.child_name}</h1>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full font-medium">
                                        {child.unique_id}
                                    </span>
                                </div>
                                <p className="text-gray-600">{child.sex}</p>
                            </div>
                        </div>
                        <Link
                            href={route("phc.children.edit", child.id)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <Edit size={18} />
                            Edit
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Calendar className="text-gray-400" size={20} />
                            <div>
                                <p className="text-xs text-gray-500">Date of Birth</p>
                                <p className="font-medium">{child.date_of_birth}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <User className="text-gray-400" size={20} />
                            <div>
                                <p className="text-xs text-gray-500">Mother</p>
                                <p className="font-medium">{child.mother_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Phone className="text-gray-400" size={20} />
                            <div>
                                <p className="text-xs text-gray-500">Mother Phone</p>
                                <p className="font-medium">{child.mother_phone || 'Not provided'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Activity className="text-gray-400" size={20} />
                            <div>
                                <p className="text-xs text-gray-500">Nutrition Status</p>
                                <span className={`px-2 py-1 rounded text-sm font-medium ${getNutritionColor(child.nutrition_status)}`}>
                                    {child.nutrition_status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {child.alert && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-3">
                            <AlertCircle className="text-amber-600" size={24} />
                            <span className="text-amber-800 font-medium">{child.alert}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <button
                        onClick={() => setActiveModal('immunization')}
                        className="flex items-center justify-center gap-3 p-6 bg-blue-100 text-blue-800 rounded-xl shadow-lg hover:bg-blue-200 transition-all"
                    >
                        <Syringe size={28} />
                        <span className="font-semibold text-lg">Add Immunization</span>
                    </button>
                    <button
                        onClick={() => setActiveModal('nutrition')}
                        className="flex items-center justify-center gap-3 p-6 bg-emerald-100 text-emerald-800 rounded-xl shadow-lg hover:bg-emerald-200 transition-all"
                    >
                        <Scale size={28} />
                        <span className="font-semibold text-lg">Add Nutrition Log</span>
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Immunization Record</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">At Birth</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <VaccineCard label="BCG" received={child.bcg_received} date={child.bcg_date} />
                                <VaccineCard label="HepB0" received={child.hep0_received} date={child.hep0_date} />
                                <VaccineCard label="OPV0" received={child.opv0_received} date={child.opv0_date} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">6 Weeks</h3>
                            <div className="grid grid-cols-5 gap-2">
                                <VaccineCard label="Penta1" received={child.penta1_received} date={child.penta1_date} />
                                <VaccineCard label="PCV1" received={child.pcv1_received} date={child.pcv1_date} />
                                <VaccineCard label="OPV1" received={child.opv1_received} date={child.opv1_date} />
                                <VaccineCard label="Rota1" received={child.rota1_received} date={child.rota1_date} />
                                <VaccineCard label="IPV1" received={child.ipv1_received} date={child.ipv1_date} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">10 Weeks</h3>
                            <div className="grid grid-cols-4 gap-2">
                                <VaccineCard label="Penta2" received={child.penta2_received} date={child.penta2_date} />
                                <VaccineCard label="PCV2" received={child.pcv2_received} date={child.pcv2_date} />
                                <VaccineCard label="Rota2" received={child.rota2_received} date={child.rota2_date} />
                                <VaccineCard label="OPV2" received={child.opv2_received} date={child.opv2_date} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">14 Weeks</h3>
                            <div className="grid grid-cols-5 gap-2">
                                <VaccineCard label="Penta3" received={child.penta3_received} date={child.penta3_date} />
                                <VaccineCard label="PCV3" received={child.pcv3_received} date={child.pcv3_date} />
                                <VaccineCard label="OPV3" received={child.opv3_received} date={child.opv3_date} />
                                <VaccineCard label="Rota3" received={child.rota3_received} date={child.rota3_date} />
                                <VaccineCard label="IPV2" received={child.ipv2_received} date={child.ipv2_date} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">9 Months</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <VaccineCard label="Measles" received={child.measles1_received} date={child.measles1_date} />
                                <VaccineCard label="Yellow Fever" received={child.yellow_fever_received} date={child.yellow_fever_date} />
                                <VaccineCard label="Vitamin A" received={child.vitamin_a1_received} date={child.vitamin_a1_date} />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-gray-600 mb-2">15 Months</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <VaccineCard label="Measles 2" received={child.measles2_received} date={child.measles2_date} />
                                <VaccineCard label="Vitamin A 2" received={child.vitamin_a2_received} date={child.vitamin_a2_date} />
                            </div>
                        </div>
                    </div>
                </div>

                {child.nutrition_logs && child.nutrition_logs.length > 0 && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Recent Nutrition Logs</h2>
                            <Link
                                href={route("phc.children.nutrition.logs", child.id)}
                                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2 px-3">Date</th>
                                        <th className="text-left py-2 px-3">Weight</th>
                                        <th className="text-left py-2 px-3">Height</th>
                                        <th className="text-left py-2 px-3">MUAC</th>
                                        <th className="text-left py-2 px-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {child.nutrition_logs.slice(0, 5).map((log) => (
                                        <tr key={log.id} className="border-b">
                                            <td className="py-2 px-3">{log.visit_date}</td>
                                            <td className="py-2 px-3">{log.weight} kg</td>
                                            <td className="py-2 px-3">{log.height ? `${log.height} cm` : '-'}</td>
                                            <td className="py-2 px-3">{log.muac ? `${log.muac} cm` : '-'}</td>
                                            <td className="py-2 px-3">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    log.muac_status === 'Normal' ? 'bg-green-100 text-green-800' :
                                                    log.muac_status === 'MAM' ? 'bg-yellow-100 text-yellow-800' :
                                                    log.muac_status === 'SAM' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {log.muac_status || 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <Modal isOpen={activeModal === 'immunization'} onClose={() => setActiveModal(null)} title="Record Immunization">
                    <ImmunizationForm child={child} onClose={() => setActiveModal(null)} />
                </Modal>

                <Modal isOpen={activeModal === 'nutrition'} onClose={() => setActiveModal(null)} title="Record Nutrition Visit">
                    <NutritionForm child={child} onClose={() => setActiveModal(null)} />
                </Modal>
            </div>
        </PhcStaffLayout>
    );
}
