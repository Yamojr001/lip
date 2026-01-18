import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useForm, usePage, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft, Save, Building, Plus, Trash2 } from "lucide-react";

// Custom Debounced Input Components
const DebouncedInput = React.memo(({
  type = "text",
  placeholder,
  value,
  onDebouncedChange,
  required = false,
  className = "",
  ...props
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const timeoutRef = useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (onDebouncedChange) {
        onDebouncedChange(newValue);
      }
    }, 300);
  };
  
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);
  
  useEffect(() => { 
    return () => { 
      if (timeoutRef.current) { 
        clearTimeout(timeoutRef.current); 
      } 
    }; 
  }, []);

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      required={required}
      className={`p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base w-full ${className}`}
      {...props}
    />
  );
});

const DebouncedTextarea = React.memo(({ 
  placeholder, 
  value, 
  onDebouncedChange, 
  rows = 3,
  className = "",
  ...props 
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const timeoutRef = useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      if (onDebouncedChange) {
        onDebouncedChange(newValue);
      }
    }, 300);
  };
  
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);
  
  useEffect(() => { 
    return () => { 
      if (timeoutRef.current) { 
        clearTimeout(timeoutRef.current); 
      } 
    }; 
  }, []);

  return (
    <textarea
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      rows={rows}
      className={`p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base w-full resize-vertical ${className}`}
      {...props}
    />
  );
});

// Format date for input fields
const formatDateForInput = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  } catch {
    return "";
  }
};

// ANC Visit Component
const AncVisitSection = ({ visitNumber, data, setData, onRemove, canRemove }) => {
    return (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-800">ANC Visit {visitNumber}</h4>
                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                    >
                        <Trash2 size={16} />
                        Remove
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date</label>
                    <input 
                        type="date" 
                        value={data[`anc_visit_${visitNumber}_date`] || ""}
                        onChange={(e) => setData(`anc_visit_${visitNumber}_date`, e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                </div>

                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={`tracked_before_anc${visitNumber}`}
                            checked={data[`tracked_before_anc${visitNumber}`] || false}
                            onChange={(e) => setData(`tracked_before_anc${visitNumber}`, e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <label htmlFor={`tracked_before_anc${visitNumber}`} className="text-sm text-gray-700">
                            Previously tracked before this visit
                        </label>
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id={`anc${visitNumber}_paid`}
                            checked={data[`anc${visitNumber}_paid`] || false}
                            onChange={(e) => setData(`anc${visitNumber}_paid`, e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                        <label htmlFor={`anc${visitNumber}_paid`} className="text-sm text-gray-700">
                            Payment made for this visit
                        </label>
                    </div>
                </div>
            </div>

            {data[`anc${visitNumber}_paid`] && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount (₦)</label>
                    <DebouncedInput 
                        type="number" 
                        placeholder="Enter amount paid"
                        value={data[`anc${visitNumber}_payment_amount`] || ""}
                        onDebouncedChange={(value) => setData(`anc${visitNumber}_payment_amount`, value)}
                        min="0" 
                        step="0.01"
                    />
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Services Provided</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                        { key: 'urinalysis', label: 'Urinalysis' },
                        { key: 'iron_folate', label: 'Iron Folate' },
                        { key: 'mms', label: 'MMS' },
                        { key: 'sp', label: 'SP' },
                        { key: 'sba', label: 'SBA' }
                    ].map((service) => (
                        <div key={service.key} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id={`anc${visitNumber}_${service.key}`}
                                checked={data[`anc${visitNumber}_${service.key}`] || false}
                                onChange={(e) => setData(`anc${visitNumber}_${service.key}`, e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                            />
                            <label htmlFor={`anc${visitNumber}_${service.key}`} className="text-sm text-gray-700">
                                {service.label}
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-blue-800 mb-2">HIV Testing</label>
                <div className="space-y-3">
                    <select 
                        value={data[`anc${visitNumber}_hiv_test`] || ""}
                        onChange={(e) => setData(`anc${visitNumber}_hiv_test`, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    >
                        <option value="">Test conducted?</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>

                    {data[`anc${visitNumber}_hiv_test`] === "Yes" && (
                        <>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id={`anc${visitNumber}_hiv_result_received`}
                                    checked={data[`anc${visitNumber}_hiv_result_received`] || false}
                                    onChange={(e) => setData(`anc${visitNumber}_hiv_result_received`, e.target.checked)}
                                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                                />
                                <label htmlFor={`anc${visitNumber}_hiv_result_received`} className="text-sm text-gray-700">
                                    Results received
                                </label>
                            </div>
                            
                            {data[`anc${visitNumber}_hiv_result_received`] && (
                                <select 
                                    value={data[`anc${visitNumber}_hiv_result`] || ""}
                                    onChange={(e) => setData(`anc${visitNumber}_hiv_result`, e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                                >
                                    <option value="">Test result</option>
                                    <option value="Positive">Positive</option>
                                    <option value="Negative">Negative</option>
                                </select>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// Vaccine Checkbox Component
const VaccineCheckbox = ({ label, name, data, setData }) => {
    return (
        <div className="flex items-center justify-between space-x-4 p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center space-x-3">
                <input
                    type="checkbox"
                    id={`${name}_received`}
                    checked={data[`${name}_received`] || false}
                    onChange={(e) => setData(`${name}_received`, e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`${name}_received`} className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            </div>
            {data[`${name}_received`] && (
                <input 
                    type="date" 
                    value={data[`${name}_date`] || ""}
                    onChange={(e) => setData(`${name}_date`, e.target.value)}
                    className="p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" 
                />
            )}
        </div>
    );
};

export default function EditPatient() {
    const { patient, lgas = [], wards = [], phcFacilities = [] } = usePage().props;
    
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [activeAncVisits, setActiveAncVisits] = useState([]);
    
    // Initialize form data with patient's existing data - UPDATED WITH NEW FIELDS
    const { data, setData, patch, processing, errors } = useForm({
        // Personal Information
        woman_name: patient.woman_name || "",
        age: patient.age || "",
        literacy_status: patient.literacy_status || "", // CHANGED: Updated default value
        phone_number: patient.phone_number || "",
        husband_name: patient.husband_name || "",
        husband_phone: patient.husband_phone || "",
        community: patient.community || "",
        address: patient.address || "",
        lga_id: patient.lga_id || "",
        ward_id: patient.ward_id || "",
        health_facility_id: patient.health_facility_id || "",
        
        // Vital Signs
        blood_pressure: patient.blood_pressure || "",
        weight_kg: patient.weight_kg || "",
        height_cm: patient.height_cm || "",
        blood_group: patient.blood_group || "",
        blood_level: patient.blood_level || "",
        preferred_language: patient.preferred_language || "",
        
        // Medical Details - ADDED age_of_pregnancy_weeks
        gravida: patient.gravida || "",
        age_of_pregnancy_weeks: patient.age_of_pregnancy_weeks || "", // NEW FIELD
        parity: patient.parity || "",
        date_of_registration: formatDateForInput(patient.date_of_registration),
        edd: formatDateForInput(patient.edd),
        fp_interest: patient.fp_interest || "",
        health_insurance_status: patient.health_insurance_status || "Not Enrolled", // MOVED from separate section
        
        // ANC Visits (1-8)
        ...Array.from({ length: 8 }, (_, i) => ({
            [`anc_visit_${i+1}_date`]: formatDateForInput(patient[`anc_visit_${i+1}_date`]),
            [`tracked_before_anc${i+1}`]: !!patient[`tracked_before_anc${i+1}`],
            [`anc${i+1}_paid`]: !!patient[`anc${i+1}_paid`],
            [`anc${i+1}_payment_amount`]: patient[`anc${i+1}_payment_amount`] || "",
            [`anc${i+1}_urinalysis`]: !!patient[`anc${i+1}_urinalysis`],
            [`anc${i+1}_iron_folate`]: !!patient[`anc${i+1}_iron_folate`],
            [`anc${i+1}_mms`]: !!patient[`anc${i+1}_mms`],
            [`anc${i+1}_sp`]: !!patient[`anc${i+1}_sp`],
            [`anc${i+1}_sba`]: !!patient[`anc${i+1}_sba`],
            [`anc${i+1}_hiv_test`]: patient[`anc${i+1}_hiv_test`] || "",
            [`anc${i+1}_hiv_result_received`]: !!patient[`anc${i+1}_hiv_result_received`],
            [`anc${i+1}_hiv_result`]: patient[`anc${i+1}_hiv_result`] || "",
        })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
        
        additional_anc_count: patient.additional_anc_count || "",
        
        // Delivery - ADDED NEW FIELDS
        place_of_delivery: patient.place_of_delivery || "",
        delivery_kits_received: !!patient.delivery_kits_received,
        type_of_delivery: patient.type_of_delivery || "",
        complication_if_any: patient.complication_if_any || "", // NEW FIELD
        delivery_outcome: patient.delivery_outcome || "",
        mother_alive: patient.mother_alive || "", // NEW FIELD
        mother_status: patient.mother_status || "", // NEW FIELD
        date_of_delivery: formatDateForInput(patient.date_of_delivery),
        
        // Postnatal
        pnc_visit_1: formatDateForInput(patient.pnc_visit_1),
        pnc_visit_2: formatDateForInput(patient.pnc_visit_2),
        pnc_visit_3: formatDateForInput(patient.pnc_visit_3),
        
        // Insurance - MOVED to Medical section
        insurance_type: patient.insurance_type || "",
        insurance_other_specify: patient.insurance_other_specify || "",
        insurance_satisfaction: !!patient.insurance_satisfaction,
        
        // Family Planning
        fp_using: !!patient.fp_using,
        fp_male_condom: !!patient.fp_male_condom,
        fp_female_condom: !!patient.fp_female_condom,
        fp_pill: !!patient.fp_pill,
        fp_injectable: !!patient.fp_injectable,
        fp_implant: !!patient.fp_implant,
        fp_iud: !!patient.fp_iud,
        fp_other: !!patient.fp_other,
        fp_other_specify: patient.fp_other_specify || "",
        
        // Child Immunization - CHANGED gender to sex
        child_name: patient.child_name || "",
        child_dob: formatDateForInput(patient.child_dob),
        child_sex: patient.child_sex || "", // CHANGED FROM child_gender
        bcg_received: !!patient.bcg_received,
        bcg_date: formatDateForInput(patient.bcg_date),
        hep0_received: !!patient.hep0_received,
        hep0_date: formatDateForInput(patient.hep0_date),
        opv0_received: !!patient.opv0_received,
        opv0_date: formatDateForInput(patient.opv0_date),
        penta1_received: !!patient.penta1_received,
        penta1_date: formatDateForInput(patient.penta1_date),
        pcv1_received: !!patient.pcv1_received,
        pcv1_date: formatDateForInput(patient.pcv1_date),
        opv1_received: !!patient.opv1_received,
        opv1_date: formatDateForInput(patient.opv1_date),
        rota1_received: !!patient.rota1_received,
        rota1_date: formatDateForInput(patient.rota1_date),
        ipv1_received: !!patient.ipv1_received,
        ipv1_date: formatDateForInput(patient.ipv1_date),
        penta2_received: !!patient.penta2_received,
        penta2_date: formatDateForInput(patient.penta2_date),
        pcv2_received: !!patient.pcv2_received,
        pcv2_date: formatDateForInput(patient.pcv2_date),
        rota2_received: !!patient.rota2_received,
        rota2_date: formatDateForInput(patient.rota2_date),
        opv2_received: !!patient.opv2_received,
        opv2_date: formatDateForInput(patient.opv2_date),
        penta3_received: !!patient.penta3_received,
        penta3_date: formatDateForInput(patient.penta3_date),
        pcv3_received: !!patient.pcv3_received,
        pcv3_date: formatDateForInput(patient.pcv3_date),
        opv3_received: !!patient.opv3_received,
        opv3_date: formatDateForInput(patient.opv3_date),
        rota3_received: !!patient.rota3_received,
        rota3_date: formatDateForInput(patient.rota3_date),
        ipv2_received: !!patient.ipv2_received,
        ipv2_date: formatDateForInput(patient.ipv2_date),
        measles_received: !!patient.measles_received,
        measles_date: formatDateForInput(patient.measles_date),
        yellow_fever_received: !!patient.yellow_fever_received,
        yellow_fever_date: formatDateForInput(patient.yellow_fever_date),
        vitamin_a_received: !!patient.vitamin_a_received,
        vitamin_a_date: formatDateForInput(patient.vitamin_a_date),
        mcv2_received: !!patient.mcv2_received,
        mcv2_date: formatDateForInput(patient.mcv2_date),
        
        remark: patient.remark || "",
        comments: patient.comments || "",
    });

    // Derived state for filtering dropdowns
    const [wardsInLGA, setWardsInLGA] = useState([]);
    const [facilitiesInWard, setFacilitiesInWard] = useState([]);
    
    // Initialize active ANC visits
    useEffect(() => {
        const visits = Array.from({ length: 8 }, (_, i) => i + 1)
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
        setActiveAncVisits(visits.length > 0 ? visits : [1]);
    }, [patient]);

    // Filter Wards by LGA
    useEffect(() => {
        const selectedLgaId = data.lga_id ? parseInt(data.lga_id) : null;
        
        if (selectedLgaId) {
            const filteredWards = wards.filter(w => w.lga_id === selectedLgaId);
            setWardsInLGA(filteredWards);
        } else {
            setWardsInLGA([]);
        }
    }, [data.lga_id, wards]);

    // Filter Facilities by Ward
    useEffect(() => {
        const selectedWardId = data.ward_id ? parseInt(data.ward_id) : null;
        
        if (selectedWardId) {
            const wardFacilities = phcFacilities.filter(f => f.ward_id === selectedWardId);
            setFacilitiesInWard(wardFacilities);
        } else {
            setFacilitiesInWard([]);
        }
    }, [data.ward_id, phcFacilities]);

    // ANC Visit Management
    const addAncVisit = () => {
        if (activeAncVisits.length < 8) {
            const nextVisit = Math.max(...activeAncVisits) + 1;
            setActiveAncVisits([...activeAncVisits, nextVisit]);
        }
    };

    const removeAncVisit = (visitNumber) => {
        if (activeAncVisits.length > 1) {
            const newActiveVisits = activeAncVisits.filter(v => v !== visitNumber);
            setActiveAncVisits(newActiveVisits);
            
            // Clear data for removed visit
            const fieldsToClear = [
                `anc_visit_${visitNumber}_date`, `tracked_before_anc${visitNumber}`, 
                `anc${visitNumber}_paid`, `anc${visitNumber}_payment_amount`,
                `anc${visitNumber}_urinalysis`, `anc${visitNumber}_iron_folate`, 
                `anc${visitNumber}_mms`, `anc${visitNumber}_sp`, `anc${visitNumber}_sba`,
                `anc${visitNumber}_hiv_test`, `anc${visitNumber}_hiv_result_received`, 
                `anc${visitNumber}_hiv_result`
            ];
            
            fieldsToClear.forEach(field => {
                setData(field, field.includes('tracked') || field.includes('paid') || field.includes('received') || field.includes('urinalysis') || field.includes('iron') || field.includes('mms') || field.includes('sp') || field.includes('sba') ? false : "");
            });
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        patch(route('admin.patients.update', patient.id), {
            onSuccess: () => {
                setShowSuccessModal(true);
            },
            onError: (errors) => {
                console.error("Validation Errors:", errors);
            }
        });
    };

    // Handle back to view
    const handleBack = () => {
        router.get(route('admin.patients.show', patient.id));
    };

    // Handle back to all patients
    const handleBackToList = () => {
        router.get(route('admin.patients.index'));
    };

    // Reusable Components
    const InputSection = React.memo(({ title, children }) => (
        <div className="bg-white p-6 rounded-xl shadow-md space-y-4 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">{title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children}
            </div>
        </div>
    ));

    const Checkbox = React.memo(({ label, name, checked, onChange }) => (
        <div className="flex items-center space-x-2">
            <input
                type="checkbox"
                id={name}
                checked={checked}
                onChange={onChange}
                className="rounded text-blue-600 shadow-sm focus:ring-blue-500 h-4 w-4"
            />
            <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
        </div>
    ));

    // Success Modal Component
    const SuccessModal = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
        >
            <motion.div
                initial={{ scale: 0.8, y: -50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center"
            >
                <CheckCircle size={60} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
                <p className="text-lg text-gray-600 mb-4">Patient record updated successfully.</p>
                
                <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                    <p className="text-sm font-medium text-green-800">Patient ID:</p>
                    <p className="text-2xl font-extrabold text-green-600">{patient.unique_id}</p>
                </div>

                <div className="flex gap-3">
                  <button
                      onClick={() => setShowSuccessModal(false)}
                      className="flex-1 bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                  >
                      Continue Editing
                  </button>
                  <button
                      onClick={handleBack}
                      className="flex-1 bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                      View Patient
                  </button>
                </div>
            </motion.div>
        </motion.div>
    );

    // Common input styles
    const inputClass = "p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base w-full";
    const selectClass = "p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-base w-full";

    // Vaccine categories
    const vaccineCategories = [
        {
            title: "At Birth",
            vaccines: [
                { label: "BCG", name: "bcg" },
                { label: "Hep 0", name: "hep0" },
                { label: "OPV 0", name: "opv0" }
            ]
        },
        {
            title: "6 Weeks",
            vaccines: [
                { label: "Penta 1", name: "penta1" },
                { label: "PCV 1", name: "pcv1" },
                { label: "OPV 1", name: "opv1" },
                { label: "Rota 1", name: "rota1" },
                { label: "IPV 1", name: "ipv1" }
            ]
        },
        {
            title: "10 Weeks",
            vaccines: [
                { label: "Penta 2", name: "penta2" },
                { label: "PCV 2", name: "pcv2" },
                { label: "Rota 2", name: "rota2" },
                { label: "OPV 2", name: "opv2" }
            ]
        },
        {
            title: "14 Weeks",
            vaccines: [
                { label: "Penta 3", name: "penta3" },
                { label: "PCV 3", name: "pcv3" },
                { label: "OPV 3", name: "opv3" },
                { label: "Rota 3", name: "rota3" },
                { label: "IPV 2", name: "ipv2" }
            ]
        },
        {
            title: "9 Months",
            vaccines: [
                { label: "Measles", name: "measles" },
                { label: "Yellow Fever", name: "yellow_fever" },
                { label: "Vitamin A", name: "vitamin_a" }
            ]
        },
        {
            title: "15 Months",
            vaccines: [
                { label: "MCV 2", name: "mcv2" }
            ]
        }
    ];

    return (
        <AdminLayout title={`Edit Patient: ${patient.woman_name}`}>
            {showSuccessModal && <SuccessModal />}
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to View</span>
                    </button>
                    <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
                    <h1 className="text-2xl font-bold text-gray-800">Edit Patient Record</h1>
                </div>
                <div className="bg-blue-100 px-4 py-2 rounded-lg">
                    <span className="text-blue-800 font-semibold">ID: {patient.unique_id}</span>
                    <div className="text-xs text-blue-600 mt-1">
                        Facility: {patient.health_facility?.clinic_name}
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Personal Information */}
                <InputSection title="Personal Information">
                    <div className="md:col-span-2">
                      <DebouncedInput 
                        type="text" 
                        placeholder="Woman's Full Name *" 
                        value={data.woman_name}
                        onDebouncedChange={(value) => setData('woman_name', value)}
                        required 
                      />
                      {errors.woman_name && <p className="text-red-500 text-sm mt-1">{errors.woman_name}</p>}
                    </div>

                    <DebouncedInput 
                      type="number" 
                      placeholder="Age *" 
                      value={data.age}
                      onDebouncedChange={(value) => setData('age', value)}
                      required 
                      min="15" 
                      max="50" 
                    />
                    
                    <DebouncedInput 
                      type="text" 
                      placeholder="Phone Number" 
                      value={data.phone_number}
                      onDebouncedChange={(value) => setData('phone_number', value)}
                    />
                    
                    <select 
                      value={data.literacy_status} 
                      onChange={(e) => setData('literacy_status', e.target.value)} 
                      required 
                      className={selectClass}
                    >
                        <option value="">Literacy Status *</option>
                        <option value="Literate">Literate</option>
                        <option value="Not literate">Not literate</option>
                    </select>

                    <DebouncedInput 
                      type="text" 
                      placeholder="Husband Name" 
                      value={data.husband_name}
                      onDebouncedChange={(value) => setData('husband_name', value)}
                    />
                    
                    <DebouncedInput 
                      type="text" 
                      placeholder="Husband Phone" 
                      value={data.husband_phone}
                      onDebouncedChange={(value) => setData('husband_phone', value)}
                    />
                </InputSection>

                {/* Location Information */}
                <InputSection title="Location Information">
                    <DebouncedInput 
                      type="text" 
                      placeholder="Community *" 
                      value={data.community}
                      onDebouncedChange={(value) => setData('community', value)}
                      required 
                    />
                    
                    <div className="md:col-span-2">
                      <DebouncedInput 
                        type="text" 
                        placeholder="Address (House No. & Street) *" 
                        value={data.address}
                        onDebouncedChange={(value) => setData('address', value)}
                        required 
                      />
                    </div>
                    
                    {/* Cascading Dropdowns */}
                    <select 
                      value={data.lga_id} 
                      onChange={(e) => setData('lga_id', e.target.value)} 
                      required 
                      className={selectClass}
                    >
                        <option value="">Select LGA *</option>
                        {lgas.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                    
                    <select 
                      value={data.ward_id} 
                      onChange={(e) => setData('ward_id', e.target.value)} 
                      required 
                      disabled={!data.lga_id} 
                      className={selectClass}
                    >
                        <option value="">Select Ward *</option>
                        {wardsInLGA.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        {!wardsInLGA.length && data.lga_id && <option disabled>No wards found</option>}
                    </select>
                    
                    <select 
                      value={data.health_facility_id} 
                      onChange={(e) => setData('health_facility_id', e.target.value)} 
                      required 
                      disabled={!data.ward_id} 
                      className={selectClass}
                    >
                        <option value="">Health Facility *</option>
                        {facilitiesInWard.map(f => <option key={f.id} value={f.id}>{f.clinic_name}</option>)}
                        {!facilitiesInWard.length && data.ward_id && <option disabled>No facilities found</option>}
                    </select>
                </InputSection>
                
                {/* Vital Signs */}
                <InputSection title="Vital Signs">
                    <DebouncedInput 
                      type="text" 
                      placeholder="Blood Pressure (e.g., 120/80)" 
                      value={data.blood_pressure}
                      onDebouncedChange={(value) => setData('blood_pressure', value)}
                    />
                    
                    <DebouncedInput 
                      type="number" 
                      placeholder="Weight (kg)" 
                      value={data.weight_kg}
                      onDebouncedChange={(value) => setData('weight_kg', value)}
                      step="0.1"
                      min="30"
                      max="200"
                    />
                    
                    <DebouncedInput 
                      type="number" 
                      placeholder="Height (cm)" 
                      value={data.height_cm}
                      onDebouncedChange={(value) => setData('height_cm', value)}
                      step="0.1"
                      min="100"
                      max="220"
                    />
                    
                    <select 
                      value={data.blood_group} 
                      onChange={(e) => setData('blood_group', e.target.value)} 
                      className={selectClass}
                    >
                        <option value="">Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                    
                    <DebouncedInput 
                      type="number" 
                      placeholder="Blood Level (g/dL)" 
                      value={data.blood_level}
                      onDebouncedChange={(value) => setData('blood_level', value)}
                      step="0.1"
                      min="5"
                      max="20"
                    />
                    
                    <select 
                      value={data.preferred_language} 
                      onChange={(e) => setData('preferred_language', e.target.value)} 
                      className={selectClass}
                    >
                        <option value="">Preferred Language</option>
                        <option value="Hausa">Hausa</option>
                        <option value="English">English</option>
                        <option value="Yoruba">Yoruba</option>
                        <option value="Other">Other</option>
                    </select>
                </InputSection>
                
                {/* Medical & Registration Details */}
                <InputSection title="Medical & Registration Details">
                    <DebouncedInput 
                      type="number" 
                      placeholder="Gravida (G)" 
                      value={data.gravida}
                      onDebouncedChange={(value) => setData('gravida', value)}
                      min="0" 
                    />
                    
                    <DebouncedInput 
                      type="number" 
                      placeholder="Age of Pregnancy (weeks)" 
                      value={data.age_of_pregnancy_weeks}
                      onDebouncedChange={(value) => setData('age_of_pregnancy_weeks', value)}
                      min="0" 
                      max="45"
                    />
                    
                    <DebouncedInput 
                      type="number" 
                      placeholder="Parity (P)" 
                      value={data.parity}
                      onDebouncedChange={(value) => setData('parity', value)}
                      min="0" 
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date *</label>
                      <input 
                        type="date" 
                        value={data.date_of_registration}
                        onChange={(e) => setData('date_of_registration', e.target.value)} 
                        required 
                        className={inputClass} 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date (EDD) *</label>
                      <input 
                        type="date" 
                        value={data.edd}
                        onChange={(e) => setData('edd', e.target.value)} 
                        required 
                        className={inputClass} 
                      />
                    </div>

                    <select 
                      value={data.fp_interest} 
                      onChange={(e) => setData('fp_interest', e.target.value)} 
                      className={selectClass}
                    >
                        <option value="">Family Planning Interest</option>
                        <option value="Yes">Interested</option>
                        <option value="No">Not Interested</option>
                    </select>

                    <select 
                      value={data.health_insurance_status} 
                      onChange={(e) => setData('health_insurance_status', e.target.value)} 
                      className={selectClass}
                    >
                        <option value="Not Enrolled">Health Insurance Status</option>
                        <option value="Yes">Enrolled</option>
                        <option value="No">Not Enrolled</option>
                    </select>

                    {data.health_insurance_status === "Yes" && (
                        <>
                            <select 
                              value={data.insurance_type} 
                              onChange={(e) => setData('insurance_type', e.target.value)} 
                              className={selectClass}
                            >
                                <option value="">Insurance Provider</option>
                                <option value="Kachima">Kachima</option>
                                <option value="NHIS">NHIS</option>
                                <option value="Others">Other</option>
                            </select>

                            {data.insurance_type === "Others" && (
                                <DebouncedInput 
                                  type="text" 
                                  placeholder="Specify insurance provider"
                                  value={data.insurance_other_specify}
                                  onDebouncedChange={(value) => setData('insurance_other_specify', value)}
                                />
                            )}

                            <Checkbox 
                              label="Satisfied with insurance services" 
                              name="insurance_satisfaction" 
                              checked={data.insurance_satisfaction}
                              onChange={(e) => setData('insurance_satisfaction', e.target.checked)} 
                            />
                        </>
                    )}
                </InputSection>

                {/* ANC Visit Tracking */}
                <div className="bg-white p-6 rounded-xl shadow-md space-y-4 border border-gray-200">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="text-xl font-semibold text-gray-800">ANC Visit Tracking</h3>
                        {activeAncVisits.length < 8 && (
                            <button
                                type="button"
                                onClick={addAncVisit}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                <Plus size={16} />
                                Add Visit
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-4">
                        {activeAncVisits.map(visitNumber => (
                            <AncVisitSection
                                key={visitNumber}
                                visitNumber={visitNumber}
                                data={data}
                                setData={setData}
                                onRemove={() => removeAncVisit(visitNumber)}
                                canRemove={activeAncVisits.length > 1}
                            />
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional ANC Visits</label>
                        <DebouncedInput 
                            type="number" 
                            placeholder="Enter count of additional visits beyond 8"
                            value={data.additional_anc_count}
                            onDebouncedChange={(value) => setData('additional_anc_count', value)}
                            min="0" 
                        />
                    </div>
                </div>

                {/* Delivery Details - UPDATED WITH NEW FIELDS */}
                <InputSection title="Delivery Details">
                    <select 
                      value={data.place_of_delivery} 
                      onChange={(e) => setData('place_of_delivery', e.target.value)} 
                      className={selectClass}
                    >
                        <option value="">Place of Delivery</option>
                        <option value="Home">Home</option>
                        <option value="Health Facility">Health Facility</option>
                        <option value="Traditional Attendant">Traditional Attendant</option>
                    </select>
                    
                    <select 
                      value={data.type_of_delivery} 
                      onChange={(e) => setData('type_of_delivery', e.target.value)} 
                      className={selectClass}
                    >
                        <option value="">Type of Delivery</option>
                        <option value="Normal (Vaginal)">Normal (Vaginal)</option>
                        <option value="Cesarean Section">Cesarean Section</option>
                        <option value="Assisted">Assisted</option>
                        <option value="Breech">Breech</option>
                    </select>
                    
                    <select 
                      value={data.complication_if_any} 
                      onChange={(e) => setData('complication_if_any', e.target.value)} 
                      className={selectClass}
                    >
                        <option value="">Complication if any</option>
                        <option value="No complication">No complication</option>
                        <option value="Hemorrhage">Hemorrhage</option>
                        <option value="Eclampsia">Eclampsia</option>
                        <option value="Sepsis">Sepsis</option>
                        <option value="Other">Other</option>
                    </select>
                    
                    <select 
                      value={data.delivery_outcome} 
                      onChange={(e) => setData('delivery_outcome', e.target.value)} 
                      className={selectClass}
                    >
                        <option value="">Delivery Outcome</option>
                        <option value="Live birth">Live birth</option>
                        <option value="Stillbirth">Stillbirth</option>
                        <option value="Miscarriage">Miscarriage</option>
                    </select>
                    
                    <select 
                      value={data.mother_alive} 
                      onChange={(e) => setData('mother_alive', e.target.value)} 
                      className={selectClass}
                    >
                        <option value="">Mother Alive?</option>
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                    
                    {data.mother_alive === "Yes" && (
                        <select 
                          value={data.mother_status} 
                          onChange={(e) => setData('mother_status', e.target.value)} 
                          className={selectClass}
                        >
                            <option value="">Mother's Status</option>
                            <option value="Admitted">Admitted</option>
                            <option value="Referred to other facility">Referred to other facility</option>
                            <option value="Discharged home">Discharged home</option>
                        </select>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date of Delivery</label>
                      <input 
                        type="date" 
                        value={data.date_of_delivery} 
                        onChange={(e) => setData('date_of_delivery', e.target.value)} 
                        className={inputClass} 
                      />
                    </div>
                    
                    <Checkbox 
                      label="Received delivery kits" 
                      name="delivery_kits_received" 
                      checked={data.delivery_kits_received}
                      onChange={(e) => setData('delivery_kits_received', e.target.checked)} 
                    />
                </InputSection>

                {/* Postnatal Care */}
                <InputSection title="Postnatal Care">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PNC Visit 1 Date</label>
                      <input 
                        type="date" 
                        value={data.pnc_visit_1} 
                        onChange={(e) => setData('pnc_visit_1', e.target.value)} 
                        className={inputClass} 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PNC Visit 2 Date</label>
                      <input 
                        type="date" 
                        value={data.pnc_visit_2} 
                        onChange={(e) => setData('pnc_visit_2', e.target.value)} 
                        className={inputClass} 
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PNC Visit 3 Date</label>
                      <input 
                        type="date" 
                        value={data.pnc_visit_3} 
                        onChange={(e) => setData('pnc_visit_3', e.target.value)} 
                        className={inputClass} 
                      />
                    </div>
                </InputSection>

                {/* Family Planning */}
                <div className="bg-white p-6 rounded-xl shadow-md space-y-4 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Family Planning</h3>
                    
                    <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                        <Checkbox 
                          label="Currently using family planning services" 
                          name="fp_using" 
                          checked={data.fp_using}
                          onChange={(e) => setData('fp_using', e.target.checked)} 
                        />
                    </div>

                    {data.fp_using && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <Checkbox label="Male Condom" name="fp_male_condom" checked={data.fp_male_condom} onChange={(e) => setData('fp_male_condom', e.target.checked)} />
                            <Checkbox label="Female Condom" name="fp_female_condom" checked={data.fp_female_condom} onChange={(e) => setData('fp_female_condom', e.target.checked)} />
                            <Checkbox label="Pill" name="fp_pill" checked={data.fp_pill} onChange={(e) => setData('fp_pill', e.target.checked)} />
                            <Checkbox label="Injectable" name="fp_injectable" checked={data.fp_injectable} onChange={(e) => setData('fp_injectable', e.target.checked)} />
                            <Checkbox label="Implant" name="fp_implant" checked={data.fp_implant} onChange={(e) => setData('fp_implant', e.target.checked)} />
                            <Checkbox label="IUD" name="fp_iud" checked={data.fp_iud} onChange={(e) => setData('fp_iud', e.target.checked)} />
                            <Checkbox label="Other" name="fp_other" checked={data.fp_other} onChange={(e) => setData('fp_other', e.target.checked)} />
                            
                            {data.fp_other && (
                                <div className="md:col-span-3">
                                    <DebouncedInput 
                                        type="text" 
                                        placeholder="Specify other method"
                                        value={data.fp_other_specify}
                                        onDebouncedChange={(value) => setData('fp_other_specify', value)}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Child Immunization */}
                <div className="bg-white p-6 rounded-xl shadow-md space-y-6 border border-gray-200">
                    <h3 className="text-xl font-semibold text-gray-800 border-b pb-2">Child Immunization</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <DebouncedInput 
                            type="text" 
                            placeholder="Child's Name"
                            value={data.child_name}
                            onDebouncedChange={(value) => setData('child_name', value)}
                        />
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input 
                                type="date" 
                                value={data.child_dob} 
                                onChange={(e) => setData('child_dob', e.target.value)} 
                                className={inputClass} 
                            />
                        </div>
                        
                        <select 
                            value={data.child_sex} 
                            onChange={(e) => setData('child_sex', e.target.value)} 
                            className={selectClass}
                        >
                            <option value="">Sex</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        {vaccineCategories.map((category, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h4 className="font-semibold text-gray-800 mb-3">{category.title}</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {category.vaccines.map(vaccine => (
                                        <VaccineCheckbox
                                            key={vaccine.name}
                                            label={vaccine.label}
                                            name={vaccine.name}
                                            data={data}
                                            setData={setData}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes */}
                <InputSection title="Additional Notes">
                    <div className="md:col-span-2">
                      <DebouncedTextarea 
                        placeholder="Clinical Remarks" 
                        value={data.remark}
                        onDebouncedChange={(value) => setData('remark', value)} 
                        rows="4" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <DebouncedTextarea 
                        placeholder="Additional Comments" 
                        value={data.comments}
                        onDebouncedChange={(value) => setData('comments', value)} 
                        rows="4" 
                      />
                    </div>
                </InputSection>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 p-6 bg-white rounded-xl shadow-md border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center justify-center gap-2 bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-700 transition"
                    >
                      <ArrowLeft size={16} />
                      Back to View
                    </button>
                    <button
                      type="button"
                      onClick={handleBackToList}
                      className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                      <ArrowLeft size={16} />
                      Back to List
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={processing}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    <Save size={16} />
                    {processing ? "Updating..." : "Update Patient Record"}
                  </button>
                </div>
            </form>
        </AdminLayout>
    );
}