import React, { useState, useEffect, useRef } from "react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { useForm, usePage, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft, Save, User, MapPin, Stethoscope, Baby, Heart, FileText, Shield, Dna, DollarSign, FlaskConical, Pill as PillIcon, Syringe as SyringeIcon, Droplet, Microscope, Scale } from "lucide-react";

// Custom Debounced Input Components (as provided by user)
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
  
  // Update internal state when value prop changes
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
      className={`p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition text-base w-full ${className}`}
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
  
  // Update internal state when value prop changes
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
      className={`p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition text-base w-full resize-vertical ${className}`}
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

export default function EditPatient() {
  const { patient, lgas = [], wards = [], phcFacilities = [] } = usePage().props;
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Initialize form data with patient's existing data - COMPREHENSIVE
  const { data, setData, patch, processing, errors } = useForm({
    woman_name: patient.woman_name || "",
    age: patient.age || "",
    literacy_status: patient.literacy_status || "",
    phone_number: patient.phone_number || "",
    husband_name: patient.husband_name || "",
    husband_phone: patient.husband_phone || "",
    community: patient.community || "",
    address: patient.address || "",
    lga_id: patient.lga_id || "",
    ward_id: patient.ward_id || "",
    health_facility_id: patient.health_facility_id || "",
    gravida: patient.gravida || "",
    age_of_pregnancy_weeks: patient.age_of_pregnancy_weeks || "", // NEW FIELD
    parity: patient.parity || "",
    date_of_registration: formatDateForInput(patient.date_of_registration),
    edd: formatDateForInput(patient.edd),
    fp_interest: patient.fp_interest || "", // New field

    // ANC Visits (up to 8) with NEXT VISIT DATE
    ...Array.from({ length: 8 }, (_, i) => ({
      [`anc_visit_${i+1}_date`]: formatDateForInput(patient[`anc_visit_${i+1}_date`]),
      [`anc_visit_${i+1}_next_date`]: formatDateForInput(patient[`anc_visit_${i+1}_next_date`]), // Added next visit date
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
      [`anc${i+1}_hiv_result`]: patient[`anc${i+1}_hiv_result`] || ""
    })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    additional_anc_count: patient.additional_anc_count || "",
    
    // Delivery - UPDATED WITH NEW FIELDS
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

    // Insurance
    health_insurance_status: patient.health_insurance_status || "Not Enrolled",
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
    
    // Child Immunization - UPDATED gender to sex
    child_name: patient.child_name || "",
    child_dob: formatDateForInput(patient.child_dob),
    child_sex: patient.child_sex || "", // CHANGED FROM child_gender
    bcg_received: !!patient.bcg_received, bcg_date: formatDateForInput(patient.bcg_date),
    hep0_received: !!patient.hep0_received, hep0_date: formatDateForInput(patient.hep0_date),
    opv0_received: !!patient.opv0_received, opv0_date: formatDateForInput(patient.opv0_date),
    penta1_received: !!patient.penta1_received, penta1_date: formatDateForInput(patient.penta1_date),
    pcv1_received: !!patient.pcv1_received, pcv1_date: formatDateForInput(patient.pcv1_date),
    opv1_received: !!patient.opv1_received, opv1_date: formatDateForInput(patient.opv1_date),
    rota1_received: !!patient.rota1_received, rota1_date: formatDateForInput(patient.rota1_date),
    ipv1_received: !!patient.ipv1_received, ipv1_date: formatDateForInput(patient.ipv1_date),
    penta2_received: !!patient.penta2_received, penta2_date: formatDateForInput(patient.penta2_date),
    pcv2_received: !!patient.pcv2_received, pcv2_date: formatDateForInput(patient.pcv2_date),
    rota2_received: !!patient.rota2_received, rota2_date: formatDateForInput(patient.rota2_date),
    opv2_received: !!patient.opv2_received, opv2_date: formatDateForInput(patient.opv2_date),
    penta3_received: !!patient.penta3_received, penta3_date: formatDateForInput(patient.penta3_date),
    pcv3_received: !!patient.pcv3_received, pcv3_date: formatDateForInput(patient.pcv3_date),
    opv3_received: !!patient.opv3_received, opv3_date: formatDateForInput(patient.opv3_date),
    rota3_received: !!patient.rota3_received, rota3_date: formatDateForInput(patient.rota3_date),
    ipv2_received: !!patient.ipv2_received, ipv2_date: formatDateForInput(patient.ipv2_date),
    measles_received: !!patient.measles_received, measles_date: formatDateForInput(patient.measles_date),
    yellow_fever_received: !!patient.yellow_fever_received, yellow_fever_date: formatDateForInput(patient.yellow_fever_date),
    vitamin_a_received: !!patient.vitamin_a_received, vitamin_a_date: formatDateForInput(patient.vitamin_a_date),
    mcv2_received: !!patient.mcv2_received, mcv2_date: formatDateForInput(patient.mcv2_date),
    
    remark: patient.remark || "", comments: patient.comments || "",
  });

  // Derived state for filtering dropdowns
  const [wardsInLGA, setWardsInLGA] = useState([]);
  const [facilitiesInWard, setFacilitiesInWard] = useState([]);
  
  // Filter Wards by LGA
  useEffect(() => {
    const selectedLgaId = data.lga_id ? parseInt(data.lga_id) : null;
    
    if (selectedLgaId) {
        const filteredWards = wards.filter(w => w.lga_id === selectedLgaId);
        setWardsInLGA(filteredWards);
    } else {
        setWardsInLGA([]);
    }
    // If LGA changes, reset ward and facility
    if (selectedLgaId !== (patient.lga_id ? parseInt(patient.lga_id) : null)) {
      setData('ward_id', '');
      setData('health_facility_id', '');
    }
  }, [data.lga_id, wards, patient.lga_id]);

  // Filter Facilities by Ward
  useEffect(() => {
    const selectedWardId = data.ward_id ? parseInt(data.ward_id) : null;
    
    if (selectedWardId) {
        const wardFacilities = phcFacilities.filter(f => f.ward_id === selectedWardId);
        setFacilitiesInWard(wardFacilities);
    } else {
        setFacilitiesInWard([]);
    }
    // If Ward changes, reset facility
    if (selectedWardId !== (patient.ward_id ? parseInt(patient.ward_id) : null)) {
      setData('health_facility_id', '');
    }
  }, [data.ward_id, phcFacilities, patient.ward_id]);

  // Handle visit date change with auto-calculation of next visit date
  const handleVisitDateChange = (visitNumber) => (e) => {
    const visitDate = e.target.value;
    setData(`anc_visit_${visitNumber}_date`, visitDate);
    
    // Auto-calculate next visit date (4 weeks later) if next date is not already set
    if (visitDate && !data[`anc_visit_${visitNumber}_next_date`]) {
      const nextVisitDate = new Date(visitDate);
      nextVisitDate.setDate(nextVisitDate.getDate() + 28); // 4 weeks = 28 days
      const formattedNextDate = nextVisitDate.toISOString().split('T')[0];
      setData(`anc_visit_${visitNumber}_next_date`, formattedNextDate);
    }
  };

  // Handle form submission - PATCH method for updates
  const handleSubmit = (e) => {
    e.preventDefault();
    
    patch(route('phc.patients.update', patient.id), {
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
    router.get(route('phc.patients.show', patient.id));
  };

  // Reusable Components
  const InputSection = React.memo(({ title, icon: Icon, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-4 border-t-4 border-purple-500">
      <h3 className="text-xl font-semibold text-purple-700 flex items-center gap-2">{Icon && <Icon size={20} />} {title}</h3>
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
            className="rounded text-purple-600 shadow-sm focus:ring-purple-500 h-5 w-5"
        />
        <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
    </div>
  ));

  // Component for editing a single ANC visit with NEXT VISIT DATE
  const AncVisitEditSection = ({ visitNumber }) => {
    const prefix = `anc${visitNumber}`;
    return (
      <div className="col-span-2 bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-6">
        <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2"><Stethoscope size={18} /> ANC Visit {visitNumber}</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Visit Date</label>
            <input 
              type="date" 
              value={data[`anc_visit_${visitNumber}_date`]} 
              onChange={handleVisitDateChange(visitNumber)} 
              className={inputClass}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Next Visit Date</label>
            <input 
              type="date" 
              value={data[`anc_visit_${visitNumber}_next_date`]} 
              onChange={(e) => setData(`anc_visit_${visitNumber}_next_date`, e.target.value)} 
              className={inputClass}
              min={data[`anc_visit_${visitNumber}_date`]}
            />
          </div>

          <div className="space-y-3 md:col-span-2">
            <Checkbox 
              label="Previously tracked before this visit" 
              name={`${prefix}_tracked_before_anc`} 
              checked={data[`tracked_before_${prefix}`]} 
              onChange={(e) => setData(`tracked_before_${prefix}`, e.target.checked)} 
            />
            <Checkbox 
              label="Payment made for this visit" 
              name={`${prefix}_paid`} 
              checked={data[`${prefix}_paid`]} 
              onChange={(e) => setData(`${prefix}_paid`, e.target.checked)} 
            />
          </div>
        </div>

        {data[`${prefix}_paid`] && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Payment Amount (₦)</label>
            <DebouncedInput 
              type="number" 
              placeholder="Enter amount paid"
              value={data[`${prefix}_payment_amount`]}
              onDebouncedChange={(value) => setData(`${prefix}_payment_amount`, value)}
              min="0" 
              step="0.01"
            />
          </div>
        )}

        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Services Provided</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Checkbox label="Urinalysis" name={`${prefix}_urinalysis`} checked={data[`${prefix}_urinalysis`]} onChange={(e) => setData(`${prefix}_urinalysis`, e.target.checked)} />
            <Checkbox label="Iron Folate" name={`${prefix}_iron_folate`} checked={data[`${prefix}_iron_folate`]} onChange={(e) => setData(`${prefix}_iron_folate`, e.target.checked)} />
            <Checkbox label="MMS" name={`${prefix}_mms`} checked={data[`${prefix}_mms`]} onChange={(e) => setData(`${prefix}_mms`, e.target.checked)} />
            <Checkbox label="SP" name={`${prefix}_sp`} checked={data[`${prefix}_sp`]} onChange={(e) => setData(`${prefix}_sp`, e.target.checked)} />
            <Checkbox label="SBA" name={`${prefix}_sba`} checked={data[`${prefix}_sba`]} onChange={(e) => setData(`${prefix}_sba`, e.target.checked)} />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
          <label className="block text-sm font-medium text-gray-700">HIV Testing</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm text-gray-600">Test conducted?</label>
              <select 
                value={data[`${prefix}_hiv_test`]} 
                onChange={(e) => setData(`${prefix}_hiv_test`, e.target.value)} 
                className={selectClass}
              >
                <option value="">Select option</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {data[`${prefix}_hiv_test`] === "Yes" && (
              <>
                <div className="flex items-center">
                  <Checkbox 
                    label="Results received" 
                    name={`${prefix}_hiv_result_received`} 
                    checked={data[`${prefix}_hiv_result_received`]} 
                    onChange={(e) => setData(`${prefix}_hiv_result_received`, e.target.checked)} 
                  />
                </div>
                
                {data[`${prefix}_hiv_result_received`] && (
                  <div className="space-y-2">
                    <label className="block text-sm text-gray-600">Test result</label>
                    <select 
                      value={data[`${prefix}_hiv_result`]} 
                      onChange={(e) => setData(`${prefix}_hiv_result`, e.target.value)} 
                      className={selectClass}
                    >
                      <option value="">Select result</option>
                      <option value="Positive">Positive</option>
                      <option value="Negative">Negative</option>
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const VaccineCheckboxEdit = React.memo(({ label, namePrefix }) => (
    <div className="flex items-center justify-between space-x-4 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition">
      <Checkbox 
        label={label} 
        name={`${namePrefix}_received`} 
        checked={data[`${namePrefix}_received`]} 
        onChange={(e) => setData(`${namePrefix}_received`, e.target.checked)} 
      />
      {data[`${namePrefix}_received`] && (
        <div className="flex-1 max-w-32">
          <input 
            type="date" 
            value={data[`${namePrefix}_date`]} 
            onChange={(e) => setData(`${namePrefix}_date`, e.target.value)} 
            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition" 
          />
        </div>
      )}
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
                    className="flex-1 bg-purple-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                    View Patient
                </button>
              </div>
          </motion.div>
      </motion.div>
  );

  // Common input styles
  const inputClass = "p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition text-base w-full";
  const selectClass = "p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition text-base w-full";

  return (
    <PhcStaffLayout title={`Edit Patient: ${patient.woman_name}`}>
      {showSuccessModal && <SuccessModal />}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-800 transition"
          >
            <ArrowLeft size={20} />
            <span>Back to View</span>
          </button>
          <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
          <h1 className="text-2xl font-bold text-gray-800">Edit Patient Record</h1>
        </div>
        <div className="bg-purple-100 px-4 py-2 rounded-lg">
          <span className="text-purple-800 font-semibold">ID: {patient.unique_id}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-8">
        
        {/* --- SECTION 1: Personal & Location Information --- */}
        <InputSection title="Personal Information" icon={User}>
            <div className="md:col-span-2">
              <label htmlFor="woman_name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <DebouncedInput 
                id="woman_name"
                type="text" 
                placeholder="Enter woman's full name" 
                value={data.woman_name}
                onDebouncedChange={(value) => setData('woman_name', value)}
                required 
              />
              {errors.woman_name && <p className="text-red-500 text-sm mt-1">{errors.woman_name}</p>}
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
              <DebouncedInput 
                id="age"
                type="number" 
                placeholder="Enter age" 
                value={data.age}
                onDebouncedChange={(value) => setData('age', value)}
                required 
                min="15" 
                max="50" 
              />
            </div>
            
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <DebouncedInput 
                id="phone_number"
                type="text" 
                placeholder="Enter phone number" 
                value={data.phone_number}
                onDebouncedChange={(value) => setData('phone_number', value)}
              />
            </div>
            
            <div>
              <label htmlFor="literacy_status" className="block text-sm font-medium text-gray-700 mb-1">Literacy Status *</label>
              <select 
                id="literacy_status"
                value={data.literacy_status} 
                onChange={(e) => setData('literacy_status', e.target.value)} 
                required 
                className={selectClass}
              >
                  <option value="">Select literacy status</option>
                  <option value="Literate">Literate</option>
                  <option value="Not literate">Not literate</option>
              </select>
              {errors.literacy_status && <p className="text-red-500 text-sm mt-1">{errors.literacy_status}</p>}
            </div>

            <div>
              <label htmlFor="husband_name" className="block text-sm font-medium text-gray-700 mb-1">Husband's Name</label>
              <DebouncedInput 
                id="husband_name"
                type="text" 
                placeholder="Enter husband's name" 
                value={data.husband_name}
                onDebouncedChange={(value) => setData('husband_name', value)}
              />
            </div>
            
            <div>
              <label htmlFor="husband_phone" className="block text-sm font-medium text-gray-700 mb-1">Husband's Phone</label>
              <DebouncedInput 
                id="husband_phone"
                type="text" 
                placeholder="Enter husband's phone" 
                value={data.husband_phone}
                onDebouncedChange={(value) => setData('husband_phone', value)}
              />
            </div>
            
            <div>
              <label htmlFor="community" className="block text-sm font-medium text-gray-700 mb-1">Community *</label>
              <DebouncedInput 
                id="community"
                type="text" 
                placeholder="Enter community name" 
                value={data.community}
                onDebouncedChange={(value) => setData('community', value)}
                required 
              />
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address (House No. & Street) *</label>
              <DebouncedInput 
                id="address"
                type="text" 
                placeholder="Enter house number and street" 
                value={data.address}
                onDebouncedChange={(value) => setData('address', value)}
                required 
              />
            </div>
            
            {/* Cascading Dropdowns */}
            <div>
              <label htmlFor="lga_id" className="block text-sm font-medium text-gray-700 mb-1">LGA *</label>
              <select 
                id="lga_id"
                value={data.lga_id} 
                onChange={(e) => setData('lga_id', e.target.value)} 
                required 
                className={selectClass}
              >
                  <option value="">Select LGA</option>
                  {lgas.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            
            <div>
              <label htmlFor="ward_id" className="block text-sm font-medium text-gray-700 mb-1">Ward *</label>
              <select 
                id="ward_id"
                value={data.ward_id} 
                onChange={(e) => setData('ward_id', e.target.value)} 
                required 
                disabled={!data.lga_id} 
                className={`${selectClass} ${!data.lga_id ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                  <option value="">Select Ward</option>
                  {wardsInLGA.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  {!wardsInLGA.length && data.lga_id && <option disabled>No wards found</option>}
              </select>
            </div>
            
            <div>
              <label htmlFor="health_facility_id" className="block text-sm font-medium text-gray-700 mb-1">Health Facility (Registration Site) *</label>
              <select 
                id="health_facility_id"
                value={data.health_facility_id} 
                onChange={(e) => setData('health_facility_id', e.target.value)} 
                required 
                disabled={!data.ward_id} 
                className={`${selectClass} ${!data.ward_id ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                  <option value="">Select Health Facility</option>
                  {facilitiesInWard.map(f => <option key={f.id} value={f.id}>{f.clinic_name}</option>)}
                  {!facilitiesInWard.length && data.ward_id && <option disabled>No facilities found</option>}
              </select>
            </div>
        </InputSection>
        
        {/* --- SECTION 2: Medical & Registration Details --- */}
        <InputSection title="Medical & Registration Details" icon={Stethoscope}>
            <div>
              <label htmlFor="gravida" className="block text-sm font-medium text-gray-700 mb-1">Gravida (G)</label>
              <DebouncedInput 
                id="gravida"
                type="number" 
                placeholder="Enter gravida" 
                value={data.gravida}
                onDebouncedChange={(value) => setData('gravida', value)}
                min="0" 
              />
            </div>

            <div>
              <label htmlFor="age_of_pregnancy_weeks" className="block text-sm font-medium text-gray-700 mb-1">Age of Pregnancy (weeks)</label>
              <DebouncedInput 
                id="age_of_pregnancy_weeks"
                type="number" 
                placeholder="Enter weeks of pregnancy" 
                value={data.age_of_pregnancy_weeks}
                onDebouncedChange={(value) => setData('age_of_pregnancy_weeks', value)}
                min="0" 
                max="45"
              />
            </div>
            
            <div>
              <label htmlFor="parity" className="block text-sm font-medium text-gray-700 mb-1">Parity (P)</label>
              <DebouncedInput 
                id="parity"
                type="number" 
                placeholder="Enter parity" 
                value={data.parity}
                onDebouncedChange={(value) => setData('parity', value)}
                min="0" 
              />
            </div>
            
            <div>
              <label htmlFor="date_of_registration" className="block text-sm font-medium text-gray-700 mb-1">Registration Date *</label>
              <input 
                id="date_of_registration"
                type="date" 
                value={data.date_of_registration}
                onChange={(e) => setData('date_of_registration', e.target.value)} 
                required 
                className={inputClass} 
              />
            </div>
            
            <div>
              <label htmlFor="edd" className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date (EDD) *</label>
              <input 
                id="edd"
                type="date" 
                value={data.edd}
                onChange={(e) => setData('edd', e.target.value)} 
                required 
                className={inputClass} 
              />
            </div>

            <div>
              <label htmlFor="fp_interest" className="block text-sm font-medium text-gray-700 mb-1">Family Planning Interest</label>
              <select 
                id="fp_interest"
                value={data.fp_interest} 
                onChange={(e) => setData('fp_interest', e.target.value)} 
                className={selectClass}
              >
                <option value="">Select interest</option>
                <option value="Yes">Interested</option>
                <option value="No">Not Interested</option>
              </select>
            </div>

            <div>
              <label htmlFor="health_insurance_status" className="block text-sm font-medium text-gray-700 mb-1">Health Insurance</label>
              <select 
                id="health_insurance_status"
                value={data.health_insurance_status} 
                onChange={(e) => setData('health_insurance_status', e.target.value)} 
                className={selectClass}
              >
                <option value="Not Enrolled">Select insurance status</option>
                <option value="Yes">Enrolled</option>
                <option value="No">Not Enrolled</option>
              </select>
            </div>
        </InputSection>
        
        {/* --- SECTION 3: ANC Visit Tracking --- */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Stethoscope size={20} /> Antenatal Care (ANC) Visits
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {Array.from({ length: 8 }, (_, i) => i + 1).map((visitNum) => (
              <AncVisitEditSection key={visitNum} visitNumber={visitNum} />
            ))}
            <div className="space-y-2">
              <label htmlFor="additional_anc_count" className="block text-sm font-medium text-gray-700 mb-1">Additional ANC Visits (beyond 8)</label>
              <DebouncedInput 
                id="additional_anc_count"
                type="number" 
                placeholder="Enter count of additional visits" 
                value={data.additional_anc_count}
                onDebouncedChange={(value) => setData('additional_anc_count', value)}
                min="0" 
              />
            </div>
          </div>
        </div>

        {/* --- SECTION 4: Delivery Details --- */}
        <InputSection title="Delivery Details" icon={Baby}>
            <div>
              <label htmlFor="place_of_delivery" className="block text-sm font-medium text-gray-700 mb-1">Delivery Location</label>
              <select 
                id="place_of_delivery"
                value={data.place_of_delivery} 
                onChange={(e) => setData('place_of_delivery', e.target.value)} 
                className={selectClass}
              >
                  <option value="">Select delivery location</option>
                  <option value="Home">Home</option>
                  <option value="Health Facility">Health Facility</option>
                  <option value="Traditional Attendant">Traditional Attendant</option>
              </select>
            </div>

            <div>
              <label htmlFor="type_of_delivery" className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
              <select 
                id="type_of_delivery"
                value={data.type_of_delivery} 
                onChange={(e) => setData('type_of_delivery', e.target.value)} 
                className={selectClass}
              >
                  <option value="">Select delivery type</option>
                  <option value="Normal (Vaginal)">Normal (Vaginal)</option>
                  <option value="Cesarean Section">Cesarean Section</option>
                  <option value="Assisted">Assisted</option>
                  <option value="Breech">Breech</option>
              </select>
            </div>

            <div>
              <label htmlFor="complication_if_any" className="block text-sm font-medium text-gray-700 mb-1">Complication if any</label>
              <select 
                id="complication_if_any"
                value={data.complication_if_any} 
                onChange={(e) => setData('complication_if_any', e.target.value)} 
                className={selectClass}
              >
                  <option value="">Select complication</option>
                  <option value="No complication">No complication</option>
                  <option value="Hemorrhage">Hemorrhage</option>
                  <option value="Eclampsia">Eclampsia</option>
                  <option value="Sepsis">Sepsis</option>
                  <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="delivery_outcome" className="block text-sm font-medium text-gray-700 mb-1">Delivery Outcome</label>
              <select 
                id="delivery_outcome"
                value={data.delivery_outcome} 
                onChange={(e) => setData('delivery_outcome', e.target.value)} 
                className={selectClass}
              >
                  <option value="">Select outcome</option>
                  <option value="Live birth">Live Birth</option>
                  <option value="Stillbirth">Stillbirth</option>
                  <option value="Miscarriage">Miscarriage</option>
              </select>
            </div>

            <div>
              <label htmlFor="mother_alive" className="block text-sm font-medium text-gray-700 mb-1">Mother Alive?</label>
              <select 
                id="mother_alive"
                value={data.mother_alive} 
                onChange={(e) => setData('mother_alive', e.target.value)} 
                className={selectClass}
              >
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
              </select>
            </div>

            {data.mother_alive === "Yes" && (
              <div>
                <label htmlFor="mother_status" className="block text-sm font-medium text-gray-700 mb-1">Mother's Status</label>
                <select 
                  id="mother_status"
                  value={data.mother_status} 
                  onChange={(e) => setData('mother_status', e.target.value)} 
                  className={selectClass}
                >
                  <option value="">Select status</option>
                  <option value="Admitted">Admitted</option>
                  <option value="Referred to other facility">Referred to other facility</option>
                  <option value="Discharged home">Discharged home</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="date_of_delivery" className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
              <input 
                id="date_of_delivery"
                type="date" 
                value={data.date_of_delivery} 
                onChange={(e) => setData('date_of_delivery', e.target.value)} 
                className={inputClass} 
              />
            </div>

            <div className="md:col-span-2 pt-6">
              <Checkbox 
                label="Received delivery kits" 
                name="delivery_kits_received" 
                checked={data.delivery_kits_received}
                onChange={(e) => setData('delivery_kits_received', e.target.checked)} 
              />
            </div>
        </InputSection>

        {/* --- SECTION 5: Postnatal Care --- */}
        <InputSection title="Postnatal Care (PNC)" icon={Heart}>
            <div>
              <label htmlFor="pnc_visit_1" className="block text-sm font-medium text-gray-700 mb-1">PNC Visit 1 Date</label>
              <input 
                id="pnc_visit_1"
                type="date" 
                value={data.pnc_visit_1} 
                onChange={(e) => setData('pnc_visit_1', e.target.value)} 
                className={inputClass} 
              />
            </div>
            <div>
              <label htmlFor="pnc_visit_2" className="block text-sm font-medium text-gray-700 mb-1">PNC Visit 2 Date</label>
              <input 
                id="pnc_visit_2"
                type="date" 
                value={data.pnc_visit_2} 
                onChange={(e) => setData('pnc_visit_2', e.target.value)} 
                className={inputClass} 
              />
            </div>
            <div>
              <label htmlFor="pnc_visit_3" className="block text-sm font-medium text-gray-700 mb-1">PNC Visit 3 Date</label>
              <input 
                id="pnc_visit_3"
                type="date" 
                value={data.pnc_visit_3} 
                onChange={(e) => setData('pnc_visit_3', e.target.value)} 
                className={inputClass} 
              />
            </div>
        </InputSection>

        {/* --- SECTION 6: Health Insurance --- */}
        <InputSection title="Health Insurance" icon={Shield}>
            {data.health_insurance_status === "Yes" && (
              <>
                <div>
                  <label htmlFor="insurance_type" className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                  <select 
                    id="insurance_type"
                    value={data.insurance_type} 
                    onChange={(e) => setData('insurance_type', e.target.value)} 
                    className={selectClass}
                  >
                      <option value="">Select provider</option>
                      <option value="Kachima">Kachima</option>
                      <option value="NHIS">NHIS</option>
                      <option value="Others">Other</option>
                  </select>
                </div>
                {data.insurance_type === "Others" && (
                  <div>
                    <label htmlFor="insurance_other_specify" className="block text-sm font-medium text-gray-700 mb-1">Specify Provider</label>
                    <DebouncedInput 
                      id="insurance_other_specify"
                      type="text" 
                      placeholder="Enter insurance provider name"
                      value={data.insurance_other_specify}
                      onDebouncedChange={(value) => setData('insurance_other_specify', value)}
                    />
                  </div>
                )}
                <div className="md:col-span-2 pt-6">
                  <Checkbox 
                    label="Satisfied with insurance services?" 
                    name="insurance_satisfaction" 
                    checked={data.insurance_satisfaction}
                    onChange={(e) => setData('insurance_satisfaction', e.target.checked)} 
                  />
                </div>
              </>
            )}
        </InputSection>

        {/* --- SECTION 7: Family Planning --- */}
        <InputSection title="Family Planning (FP)" icon={Dna}>
          <div className="md:col-span-2">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <Checkbox label="Currently using family planning services" name="fp_using" checked={data.fp_using} onChange={(e) => setData('fp_using', e.target.checked)} />
            </div>
            
            {data.fp_using && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Checkbox label="Male Condom" name="fp_male_condom" checked={data.fp_male_condom} onChange={(e) => setData('fp_male_condom', e.target.checked)} />
                <Checkbox label="Female Condom" name="fp_female_condom" checked={data.fp_female_condom} onChange={(e) => setData('fp_female_condom', e.target.checked)} />
                <Checkbox label="Pill" name="fp_pill" checked={data.fp_pill} onChange={(e) => setData('fp_pill', e.target.checked)} />
                <Checkbox label="Injectable" name="fp_injectable" checked={data.fp_injectable} onChange={(e) => setData('fp_injectable', e.target.checked)} />
                <Checkbox label="Implant" name="fp_implant" checked={data.fp_implant} onChange={(e) => setData('fp_implant', e.target.checked)} />
                <Checkbox label="IUD" name="fp_iud" checked={data.fp_iud} onChange={(e) => setData('fp_iud', e.target.checked)} />
                <Checkbox label="Other" name="fp_other" checked={data.fp_other} onChange={(e) => setData('fp_other', e.target.checked)} />
                
                {data.fp_other && (
                  <div className="col-span-2 md:col-span-4">
                    <label htmlFor="fp_other_specify" className="block text-sm font-medium text-gray-700 mb-1">Specify Other Method</label>
                    <DebouncedInput 
                      id="fp_other_specify"
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
        </InputSection>

        {/* --- SECTION 8: Child Immunization --- */}
        <InputSection title="Child Immunization" icon={Baby}>
          <div>
            <label htmlFor="child_name" className="block text-sm font-medium text-gray-700 mb-1">Child's Name</label>
            <DebouncedInput 
              id="child_name"
              type="text" 
              placeholder="Enter child's name"
              value={data.child_name}
              onDebouncedChange={(value) => setData('child_name', value)}
            />
          </div>

          <div>
            <label htmlFor="child_dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input 
              id="child_dob"
              type="date" 
              value={data.child_dob} 
              onChange={(e) => setData('child_dob', e.target.value)} 
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="child_sex" className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
            <select 
              id="child_sex"
              value={data.child_sex} 
              onChange={(e) => setData('child_sex', e.target.value)} 
              className={selectClass}
            >
              <option value="">Select sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-6">
            {[
              { title: "At Birth", vaccines: ["bcg", "hep0", "opv0"], color: "blue" },
              { title: "6 Weeks", vaccines: ["penta1", "pcv1", "opv1", "rota1", "ipv1"], color: "green" },
              { title: "10 Weeks", vaccines: ["penta2", "pcv2", "rota2", "opv2"], color: "yellow" },
              { title: "14 Weeks", vaccines: ["penta3", "pcv3", "opv3", "rota3", "ipv2"], color: "orange" },
              { title: "9 Months", vaccines: ["measles", "yellow_fever", "vitamin_a"], color: "red" },
              { title: "15 Months", vaccines: ["mcv2"], color: "purple" }
            ].map((stage, index) => (
              <div key={index} className={`bg-${stage.color}-50 rounded-xl p-4 border border-${stage.color}-200`}>
                <h4 className={`font-semibold text-${stage.color}-800 mb-3`}>{stage.title}</h4>
                <div className={`grid grid-cols-1 ${stage.vaccines.length > 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-3`}>
                  {stage.vaccines.map(vaccine => (
                    <VaccineCheckboxEdit key={vaccine} label={vaccine.replace(/_/g, ' ').replace(/([a-z])([0-9])/g, '$1 $2').toUpperCase()} namePrefix={vaccine} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </InputSection>

        {/* --- SECTION 9: Notes --- */}
        <InputSection title="Additional Notes" icon={FileText}>
            <div className="md:col-span-2">
              <label htmlFor="remark" className="block text-sm font-medium text-gray-700 mb-1">Clinical Remarks</label>
              <DebouncedTextarea 
                id="remark"
                placeholder="Enter clinical notes and observations"
                value={data.remark}
                onDebouncedChange={(value) => setData('remark', value)} 
                rows="4"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">Additional Comments</label>
              <DebouncedTextarea 
                id="comments"
                placeholder="Enter any additional comments or feedback"
                value={data.comments}
                onDebouncedChange={(value) => setData('comments', value)} 
                rows="4"
              />
            </div>
        </InputSection>

        <div className="flex justify-between p-4 bg-white rounded-xl shadow-md">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            <ArrowLeft size={16} />
            Cancel
          </button>
          <button
            type="submit"
            disabled={processing}
            className="flex items-center gap-2 bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            <Save size={16} />
            {processing ? "Updating..." : "Update Patient Record"}
          </button>
        </div>
      </form>
    </PhcStaffLayout>
  );
}