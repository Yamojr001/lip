import React, { useState, useEffect, useRef, useMemo } from "react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { useForm, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import { CheckCircle, Plus, Trash2, User, MapPin, Stethoscope, Baby, Heart, FileText } from "lucide-react";

// --- Custom Debounced Input Components ---
const DebouncedInput = React.memo(({ 
  type = "text", 
  placeholder, 
  defaultValue, 
  onDebouncedChange, 
  required = false,
  className = "",
  ...props 
}) => {
  const [value, setValue] = useState(defaultValue || "");
  const timeoutRef = useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
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
    return () => { 
      if (timeoutRef.current) { 
        clearTimeout(timeoutRef.current); 
      } 
    }; 
  }, []);

  return (
    <div className="space-y-1">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        required={required}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white ${className}`}
        {...props}
      />
    </div>
  );
});

const DebouncedTextarea = React.memo(({ 
  placeholder, 
  defaultValue, 
  onDebouncedChange, 
  rows = 3,
  className = "",
  ...props 
}) => {
  const [value, setValue] = useState(defaultValue || "");
  const timeoutRef = useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
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
    return () => { 
      if (timeoutRef.current) { 
        clearTimeout(timeoutRef.current); 
      } 
    }; 
  }, []);

  return (
    <div className="space-y-1">
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        rows={rows}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white ${className}`}
        {...props}
      />
    </div>
  );
});

// --- Main Component ---
export default function CreatePatient() {
  const { lgas = [], wards = [], phcFacilities = [] } = usePage().props;
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newPatientId, setNewPatientId] = useState("");
  const [selectedAncVisit, setSelectedAncVisit] = useState(1);
  const [activeAncVisits, setActiveAncVisits] = useState([1]);

  // Form data reference
  const formDataRef = useRef({
    // Personal Information
    woman_name: "", age: "", literacy_status: "", phone_number: "", 
    husband_name: "", husband_phone: "", community: "", address: "", 
    lga_id: "", ward_id: "", health_facility_id: "",
    
    // Medical Details
    gravida: "", age_of_pregnancy_weeks: "", parity: "", date_of_registration: "", edd: "", fp_interest: "",
    
    // ANC Visits (1 to 8)
    ...Array.from({ length: 8 }, (_, i) => ({
      [`anc_visit_${i+1}_date`]: "",
      [`anc_visit_${i+1}_next_date`]: "", // Added next visit date field
      [`tracked_before_anc${i+1}`]: false,
      [`anc${i+1}_paid`]: false,
      [`anc${i+1}_payment_amount`]: "",
      [`anc${i+1}_urinalysis`]: false,
      [`anc${i+1}_iron_folate`]: false,
      [`anc${i+1}_mms`]: false,
      [`anc${i+1}_sp`]: false,
      [`anc${i+1}_sba`]: false,
      [`anc${i+1}_hiv_test`]: "",
      [`anc${i+1}_hiv_result_received`]: false,
      [`anc${i+1}_hiv_result`]: ""
    })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    
    additional_anc_count: "",
    
    // Delivery
    place_of_delivery: "", delivery_kits_received: false, type_of_delivery: "", 
    complication_if_any: "", delivery_outcome: "", mother_alive: "", mother_status: "",
    date_of_delivery: "",
    
    // Postnatal
    pnc_visit_1: "", pnc_visit_2: "", pnc_visit_3: "",
    
    // Insurance
    health_insurance_status: "Not Enrolled", insurance_type: "", insurance_other_specify: "", insurance_satisfaction: false,
    
    // Family Planning
    fp_using: false, fp_male_condom: false, fp_female_condom: false, fp_pill: false, 
    fp_injectable: false, fp_implant: false, fp_iud: false, fp_other: false, fp_other_specify: "",
    
    // Child Immunization
    child_name: "", child_dob: "", child_sex: "",
    bcg_received: false, bcg_date: "", hep0_received: false, hep0_date: "", opv0_received: false, opv0_date: "",
    penta1_received: false, penta1_date: "", pcv1_received: false, pcv1_date: "", opv1_received: false, opv1_date: "",
    rota1_received: false, rota1_date: "", ipv1_received: false, ipv1_date: "", penta2_received: false, penta2_date: "",
    pcv2_received: false, pcv2_date: "", rota2_received: false, rota2_date: "", opv2_received: false, opv2_date: "",
    penta3_received: false, penta3_date: "", pcv3_received: false, pcv3_date: "", opv3_received: false, opv3_date: "",
    rota3_received: false, rota3_date: "", ipv2_received: false, ipv2_date: "", measles_received: false, measles_date: "",
    yellow_fever_received: false, yellow_fever_date: "", vitamin_a_received: false, vitamin_a_date: "",
    mcv2_received: false, mcv2_date: "",
    
    remark: "", comments: "",
  });

  const { post, processing, errors, reset } = useForm(formDataRef.current);
  const [wardsInLGA, setWardsInLGA] = useState([]);
  const [facilitiesInWard, setFacilitiesInWard] = useState([]);
  const [immediateChangeKey, setImmediateChangeKey] = useState(0);

  // Filter Wards by LGA
  useEffect(() => {
    const selectedLgaId = formDataRef.current.lga_id ? parseInt(formDataRef.current.lga_id) : null;
    setWardsInLGA(selectedLgaId ? wards.filter(w => w.lga_id === selectedLgaId) : []);
  }, [formDataRef.current.lga_id, wards]);

  // Filter Facilities by Ward
  useEffect(() => {
    const selectedWardId = formDataRef.current.ward_id ? parseInt(formDataRef.current.ward_id) : null;
    setFacilitiesInWard(selectedWardId ? phcFacilities.filter(f => f.ward_id === selectedWardId) : []);
  }, [formDataRef.current.ward_id, phcFacilities]);

  // Update form data
  const updateFormData = (field, value) => {
    formDataRef.current[field] = value;
  };

  // Handlers
  const handleDebouncedChange = (field) => (value) => updateFormData(field, value);

  const handleImmediateChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    updateFormData(field, value);
    setImmediateChangeKey(prev => prev + 1);
  };

  // Handler for visit date that auto-calculates next visit date (4 weeks later)
  const handleVisitDateChange = (visitNumber) => (e) => {
    const visitDate = e.target.value;
    updateFormData(`anc_visit_${visitNumber}_date`, visitDate);
    
    // Auto-calculate next visit date (4 weeks later)
    if (visitDate) {
      const nextVisitDate = new Date(visitDate);
      nextVisitDate.setDate(nextVisitDate.getDate() + 28); // 4 weeks = 28 days
      const formattedNextDate = nextVisitDate.toISOString().split('T')[0];
      updateFormData(`anc_visit_${visitNumber}_next_date`, formattedNextDate);
    }
    
    setImmediateChangeKey(prev => prev + 1);
  };

  const handleLGAChange = (e) => {
    const lgaId = e.target.value;
    updateFormData('lga_id', lgaId);
    updateFormData('ward_id', '');
    updateFormData('health_facility_id', '');
    setImmediateChangeKey(prev => prev + 1);
  };

  const handleWardChange = (e) => {
    const wardId = e.target.value;
    updateFormData('ward_id', wardId);
    updateFormData('health_facility_id', '');
    setImmediateChangeKey(prev => prev + 1);
  };

  // ANC Visit Management
  const addAncVisit = () => {
    if (activeAncVisits.length < 8) {
      const nextVisit = Math.max(...activeAncVisits) + 1;
      setActiveAncVisits([...activeAncVisits, nextVisit]);
      setSelectedAncVisit(nextVisit);
    }
  };

  const removeAncVisit = (visitNumber) => {
    if (activeAncVisits.length > 1) {
      const newActiveVisits = activeAncVisits.filter(v => v !== visitNumber);
      setActiveAncVisits(newActiveVisits);
      
      // Clear data for removed visit
      const fieldsToClear = [
        `anc_visit_${visitNumber}_date`, 
        `anc_visit_${visitNumber}_next_date`, // Added next visit date field
        `tracked_before_anc${visitNumber}`, 
        `anc${visitNumber}_paid`, 
        `anc${visitNumber}_payment_amount`,
        `anc${visitNumber}_urinalysis`, 
        `anc${visitNumber}_iron_folate`, 
        `anc${visitNumber}_mms`, 
        `anc${visitNumber}_sp`, 
        `anc${visitNumber}_sba`,
        `anc${visitNumber}_hiv_test`, 
        `anc${visitNumber}_hiv_result_received`, 
        `anc${visitNumber}_hiv_result`
      ];
      
      fieldsToClear.forEach(field => {
        updateFormData(field, field.includes('tracked') || field.includes('paid') || field.includes('received') || field.includes('urinalysis') || field.includes('iron') || field.includes('mms') || field.includes('sp') || field.includes('sba') ? false : "");
      });
      
      if (selectedAncVisit === visitNumber) {
        setSelectedAncVisit(newActiveVisits[0]);
      }
    }
  };

  // Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = { ...formDataRef.current };
    
    const booleanFields = [
      ...activeAncVisits.flatMap(visit => [
        `tracked_before_anc${visit}`, `anc${visit}_paid`,
        `anc${visit}_urinalysis`, `anc${visit}_iron_folate`, `anc${visit}_mms`, 
        `anc${visit}_sp`, `anc${visit}_sba`, `anc${visit}_hiv_result_received`
      ]),
      'delivery_kits_received', 'insurance_satisfaction', 'fp_using',
      'fp_male_condom', 'fp_female_condom', 'fp_pill', 'fp_injectable', 
      'fp_implant', 'fp_iud', 'fp_other',
      'bcg_received', 'hep0_received', 'opv0_received', 'penta1_received',
      'pcv1_received', 'opv1_received', 'rota1_received', 'ipv1_received',
      'penta2_received', 'pcv2_received', 'rota2_received', 'opv2_received',
      'penta3_received', 'pcv3_received', 'opv3_received', 'rota3_received',
      'ipv2_received', 'measles_received', 'yellow_fever_received',
      'vitamin_a_received', 'mcv2_received'
    ];

    booleanFields.forEach(field => submissionData[field] = !!submissionData[field]);

    post(route('phc.patient.store'), {
      data: submissionData,
      onSuccess: (response) => {
        const successMessage = response.props?.flash?.success || ""; 
        const uniqueIdMatch = successMessage.match(/Unique ID: (.*)/);
        const uniqueId = uniqueIdMatch ? uniqueIdMatch[1] : "N/A";
        
        setNewPatientId(uniqueId);
        setShowSuccessModal(true);
        
        // Reset form
        Object.keys(formDataRef.current).forEach(key => formDataRef.current[key] = "");
        formDataRef.current.literacy_status = "";
        formDataRef.current.health_insurance_status = "Not Enrolled";
        setActiveAncVisits([1]);
        setSelectedAncVisit(1);
        setImmediateChangeKey(prev => prev + 1);
        reset();
      },
      onError: (errors) => console.error("Validation Errors:", errors)
    });
  };

  // Reusable Components
  const InputSection = React.memo(({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="h-5 w-5 text-blue-600" />}
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children}
        </div>
      </div>
    </div>
  ));

  const Checkbox = React.memo(({ label, name, onChange }) => (
    <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition">
      <input
        type="checkbox"
        id={name}
        defaultChecked={formDataRef.current[name]} 
        onChange={onChange}
        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <label htmlFor={name} className="text-sm font-medium text-gray-700 cursor-pointer">
        {label}
      </label>
    </div>
  ));

  const SuccessModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Record Saved Successfully!</h2>
        <p className="text-gray-600 mb-6">Patient information has been securely stored in the system.</p>
        
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-1">Patient ID</p>
          <p className="text-xl font-bold text-blue-600">{newPatientId}</p>
        </div>

        <button
          onClick={() => setShowSuccessModal(false)}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );

  // Dynamic ANC Visit Component
  const AncVisitSection = ({ visitNumber, onRemove, canRemove }) => (
    <div className="col-span-2 bg-gray-50 rounded-xl p-6 border border-gray-200 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-blue-600">{visitNumber}</span>
          </div>
          <h4 className="text-lg font-semibold text-gray-800">ANC Visit {visitNumber}</h4>
        </div>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(visitNumber)}
            className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition"
          >
            <Trash2 className="h-4 w-4" />
            <span className="text-sm font-medium">Remove</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Visit Date *</label>
          <input 
            type="date" 
            defaultValue={formDataRef.current[`anc_visit_${visitNumber}_date`]} 
            onChange={handleVisitDateChange(visitNumber)} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Next Visit Date</label>
          <input 
            type="date" 
            defaultValue={formDataRef.current[`anc_visit_${visitNumber}_next_date`]} 
            onChange={handleImmediateChange(`anc_visit_${visitNumber}_next_date`)} 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            min={formDataRef.current[`anc_visit_${visitNumber}_date`]}
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <Checkbox 
            label="Previously tracked before this visit" 
            name={`tracked_before_anc${visitNumber}`} 
            onChange={handleImmediateChange(`tracked_before_anc${visitNumber}`)} 
          />
          <Checkbox 
            label="Payment made for this visit" 
            name={`anc${visitNumber}_paid`} 
            onChange={handleImmediateChange(`anc${visitNumber}_paid`)} 
          />
        </div>
      </div>

      {formDataRef.current[`anc${visitNumber}_paid`] && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Payment Amount (₦)</label>
          <DebouncedInput 
            type="number" 
            placeholder="Enter amount paid"
            defaultValue={formDataRef.current[`anc${visitNumber}_payment_amount`]}
            onDebouncedChange={handleDebouncedChange(`anc${visitNumber}_payment_amount`)}
            min="0" 
            step="0.01"
          />
        </div>
      )}

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">Services Provided</label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <Checkbox label="Urinalysis" name={`anc${visitNumber}_urinalysis`} onChange={handleImmediateChange(`anc${visitNumber}_urinalysis`)} />
          <Checkbox label="Iron Folate" name={`anc${visitNumber}_iron_folate`} onChange={handleImmediateChange(`anc${visitNumber}_iron_folate`)} />
          <Checkbox label="MMS" name={`anc${visitNumber}_mms`} onChange={handleImmediateChange(`anc${visitNumber}_mms`)} />
          <Checkbox label="SP" name={`anc${visitNumber}_sp`} onChange={handleImmediateChange(`anc${visitNumber}_sp`)} />
          <Checkbox label="SBA" name={`anc${visitNumber}_sba`} onChange={handleImmediateChange(`anc${visitNumber}_sba`)} />
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
        <label className="block text-sm font-medium text-gray-700">HIV Testing</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm text-gray-600">Test conducted?</label>
            <select 
              defaultValue={formDataRef.current[`anc${visitNumber}_hiv_test`]} 
              onChange={handleImmediateChange(`anc${visitNumber}_hiv_test`)} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            >
              <option value="">Select option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {formDataRef.current[`anc${visitNumber}_hiv_test`] === "Yes" && (
            <>
              <div className="flex items-center">
                <Checkbox 
                  label="Results received" 
                  name={`anc${visitNumber}_hiv_result_received`} 
                  onChange={handleImmediateChange(`anc${visitNumber}_hiv_result_received`)} 
                />
              </div>
              
              {formDataRef.current[`anc${visitNumber}_hiv_result_received`] && (
                <div className="space-y-2">
                  <label className="block text-sm text-gray-600">Test result</label>
                  <select 
                    defaultValue={formDataRef.current[`anc${visitNumber}_hiv_result`]} 
                    onChange={handleImmediateChange(`anc${visitNumber}_hiv_result`)} 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
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

  // Vaccine Component
  const VaccineCheckbox = ({ label, name }) => (
    <div className="flex items-center justify-between space-x-4 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition">
      <Checkbox label={label} name={`${name}_received`} onChange={handleImmediateChange(`${name}_received`)} />
      {formDataRef.current[`${name}_received`] && (
        <div className="flex-1 max-w-32">
          <input 
            type="date" 
            defaultValue={formDataRef.current[`${name}_date`]} 
            onChange={handleImmediateChange(`${name}_date`)} 
            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
          />
        </div>
      )}
    </div>
  );

  return (
    <PhcStaffLayout title="Register New Patient">
      {showSuccessModal && <SuccessModal />}
      
      <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto pb-8" key={immediateChangeKey}>
        
        {/* Section 1: Personal Information */}
        <InputSection title="Personal Information" icon={User}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Full Name *</label>
            <DebouncedInput 
              type="text" 
              placeholder="Enter woman's full name"
              defaultValue={formDataRef.current.woman_name}
              onDebouncedChange={handleDebouncedChange('woman_name')}
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Age *</label>
            <DebouncedInput 
              type="number" 
              placeholder="Enter age"
              defaultValue={formDataRef.current.age}
              onDebouncedChange={handleDebouncedChange('age')}
              required 
              min="15" 
              max="50" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <DebouncedInput 
              type="text" 
              placeholder="Enter phone number"
              defaultValue={formDataRef.current.phone_number}
              onDebouncedChange={handleDebouncedChange('phone_number')}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Literacy Status *</label>
            <select 
              defaultValue={formDataRef.current.literacy_status} 
              onChange={handleImmediateChange('literacy_status')} 
              required 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="">Select literacy status</option>
              <option value="Literate">Literate</option>
              <option value="Not literate">Not literate</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Next of kin name</label>
            <DebouncedInput 
              type="text" 
              placeholder="Enter Next of kin name"
              defaultValue={formDataRef.current.husband_name}
              onDebouncedChange={handleDebouncedChange('husband_name')}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Next of kin Phone</label>
            <DebouncedInput 
              type="text" 
              placeholder="Enter next of kin phone"
              defaultValue={formDataRef.current.husband_phone}
              onDebouncedChange={handleDebouncedChange('husband_phone')}
            />
          </div>
        </InputSection>

        {/* Section 2: Location Information */}
        <InputSection title="Location Information" icon={MapPin}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Community *</label>
            <DebouncedInput 
              type="text" 
              placeholder="Enter community name"
              defaultValue={formDataRef.current.community}
              onDebouncedChange={handleDebouncedChange('community')}
              required 
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Address *</label>
            <DebouncedInput 
              type="text" 
              placeholder="Enter house number and street"
              defaultValue={formDataRef.current.address}
              onDebouncedChange={handleDebouncedChange('address')}
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">LGA *</label>
            <select 
              defaultValue={formDataRef.current.lga_id} 
              onChange={handleLGAChange} 
              required 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="">Select LGA</option>
              {lgas.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Ward *</label>
            <select 
              defaultValue={formDataRef.current.ward_id} 
              onChange={handleWardChange} 
              required 
              disabled={!formDataRef.current.lga_id} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white disabled:bg-gray-100"
            >
              <option value="">Select Ward</option>
              {wardsInLGA.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Health Facility *</label>
            <select 
              defaultValue={formDataRef.current.health_facility_id} 
              onChange={handleImmediateChange('health_facility_id')} 
              required 
              disabled={!formDataRef.current.ward_id} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white disabled:bg-gray-100"
            >
              <option value="">Select Health Facility</option>
              {facilitiesInWard.map(f => <option key={f.id} value={f.id}>{f.clinic_name}</option>)}
            </select>
          </div>
        </InputSection>

        {/* Section 3: Medical Details */}
        <InputSection title="Medical & Registration Details" icon={Stethoscope}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Gravida (G)</label>
            <DebouncedInput 
              type="number" 
              placeholder="Enter gravida"
              defaultValue={formDataRef.current.gravida}
              onDebouncedChange={handleDebouncedChange('gravida')}
              min="0" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Age of Pregnancy (weeks)</label>
            <DebouncedInput 
              type="number" 
              placeholder="Enter weeks of pregnancy"
              defaultValue={formDataRef.current.age_of_pregnancy_weeks}
              onDebouncedChange={handleDebouncedChange('age_of_pregnancy_weeks')}
              min="0" 
              max="45"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Parity (P)</label>
            <DebouncedInput 
              type="number" 
              placeholder="Enter parity"
              defaultValue={formDataRef.current.parity}
              onDebouncedChange={handleDebouncedChange('parity')}
              min="0" 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Registration Date *</label>
            <input 
              type="date" 
              defaultValue={formDataRef.current.date_of_registration}
              onChange={handleImmediateChange('date_of_registration')} 
              required 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Expected Delivery Date *</label>
            <input 
              type="date" 
              defaultValue={formDataRef.current.edd}
              onChange={handleImmediateChange('edd')} 
              required 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Family Planning Interest</label>
            <select 
              defaultValue={formDataRef.current.fp_interest} 
              onChange={handleImmediateChange('fp_interest')} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="">Select interest</option>
              <option value="Yes">Interested</option>
              <option value="No">Not Interested</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Health Insurance</label>
            <select 
              defaultValue={formDataRef.current.health_insurance_status} 
              onChange={handleImmediateChange('health_insurance_status')} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="Not Enrolled">Select insurance status</option>
              <option value="Yes">Enrolled</option>
              <option value="No">Not Enrolled</option>
            </select>
          </div>

          {formDataRef.current.health_insurance_status === "Yes" && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Insurance Provider</label>
                <select 
                  defaultValue={formDataRef.current.insurance_type} 
                  onChange={handleImmediateChange('insurance_type')} 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                >
                  <option value="">Select provider</option>
                  <option value="Kachima">Kachima</option>
                  <option value="NHIS">NHIS</option>
                  <option value="Others">Other</option>
                </select>
              </div>

              {formDataRef.current.insurance_type === "Others" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Specify Provider</label>
                  <DebouncedInput 
                    type="text" 
                    placeholder="Enter insurance provider name"
                    defaultValue={formDataRef.current.insurance_other_specify}
                    onDebouncedChange={handleDebouncedChange('insurance_other_specify')}
                  />
                </div>
              )}
            </>
          )}
        </InputSection>

        {/* Section 4: ANC Visits */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">ANC Visit Tracking</h3>
              </div>
              {activeAncVisits.length < 8 && (
                <button
                  type="button"
                  onClick={addAncVisit}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Add Visit</span>
                </button>
              )}
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-wrap gap-2">
              {activeAncVisits.map(visit => (
                <button
                  key={visit}
                  type="button"
                  onClick={() => setSelectedAncVisit(visit)}
                  className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                    selectedAncVisit === visit
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Visit {visit}
                </button>
              ))}
            </div>

            <AncVisitSection 
              visitNumber={selectedAncVisit} 
              onRemove={removeAncVisit}
              canRemove={activeAncVisits.length > 1}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Additional ANC Visits</label>
              <DebouncedInput 
                type="number" 
                placeholder="Enter count of additional visits beyond 8"
                defaultValue={formDataRef.current.additional_anc_count}
                onDebouncedChange={handleDebouncedChange('additional_anc_count')}
                min="0" 
              />
            </div>
          </div>
        </div>

        {/* Section 5: Delivery Details */}
        <InputSection title="Delivery Details" icon={Baby}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Delivery Location</label>
            <select 
              defaultValue={formDataRef.current.place_of_delivery} 
              onChange={handleImmediateChange('place_of_delivery')} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="">Select delivery location</option>
              <option value="Home">Home</option>
              <option value="Health Facility">Health Facility</option>
              <option value="Traditional Attendant">Traditional Attendant</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Delivery Type</label>
            <select 
              defaultValue={formDataRef.current.type_of_delivery} 
              onChange={handleImmediateChange('type_of_delivery')} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="">Select delivery type</option>
              <option value="Normal (Vaginal)">Normal (Vaginal)</option>
              <option value="Cesarean Section">Cesarean Section</option>
              <option value="Assisted">Assisted</option>
              <option value="Breech">Breech</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Complication if any</label>
            <select 
              defaultValue={formDataRef.current.complication_if_any} 
              onChange={handleImmediateChange('complication_if_any')} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="">Select complication</option>
              <option value="No complication">No complication</option>
              <option value="Hemorrhage">Hemorrhage</option>
              <option value="Eclampsia">Eclampsia</option>
              <option value="Sepsis">Sepsis</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Delivery Outcome</label>
            <select 
              defaultValue={formDataRef.current.delivery_outcome} 
              onChange={handleImmediateChange('delivery_outcome')} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="">Select outcome</option>
              <option value="Live birth">Live Birth</option>
              <option value="Stillbirth">Stillbirth</option>
              <option value="Miscarriage">Miscarriage</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Mother Alive?</label>
            <select 
              defaultValue={formDataRef.current.mother_alive} 
              onChange={handleImmediateChange('mother_alive')} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="">Select</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {formDataRef.current.mother_alive === "Yes" && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mother's Status</label>
              <select 
                defaultValue={formDataRef.current.mother_status} 
                onChange={handleImmediateChange('mother_status')} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
              >
                <option value="">Select status</option>
                <option value="Admitted">Admitted</option>
                <option value="Referred to other facility">Referred to other facility</option>
                <option value="Discharged home">Discharged home</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Delivery Date</label>
            <input 
              type="date" 
              defaultValue={formDataRef.current.date_of_delivery} 
              onChange={handleImmediateChange('date_of_delivery')} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Checkbox label="Received delivery kits" name="delivery_kits_received" onChange={handleImmediateChange('delivery_kits_received')} />
          </div>
        </InputSection>

        {/* Section 6: Postnatal Checkup */}
        <InputSection title="Postnatal Checkup" icon={Heart}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">PNC Visit 1 Date</label>
            <input 
              type="date" 
              defaultValue={formDataRef.current.pnc_visit_1} 
              onChange={handleImmediateChange('pnc_visit_1')} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">PNC Visit 2 Date</label>
            <input 
              type="date" 
              defaultValue={formDataRef.current.pnc_visit_2} 
              onChange={handleImmediateChange('pnc_visit_2')} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">PNC Visit 3 Date</label>
            <input 
              type="date" 
              defaultValue={formDataRef.current.pnc_visit_3} 
              onChange={handleImmediateChange('pnc_visit_3')} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>
        </InputSection>

        {/* Section 7: Family Planning */}
        <InputSection title="Family Planning" icon={Heart}>
          <div className="col-span-2 space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Checkbox label="Currently using family planning services" name="fp_using" onChange={handleImmediateChange('fp_using')} />
            </div>
            
            {formDataRef.current.fp_using && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Checkbox label="Male Condom" name="fp_male_condom" onChange={handleImmediateChange('fp_male_condom')} />
                <Checkbox label="Female Condom" name="fp_female_condom" onChange={handleImmediateChange('fp_female_condom')} />
                <Checkbox label="Pill" name="fp_pill" onChange={handleImmediateChange('fp_pill')} />
                <Checkbox label="Injectable" name="fp_injectable" onChange={handleImmediateChange('fp_injectable')} />
                <Checkbox label="Implant" name="fp_implant" onChange={handleImmediateChange('fp_implant')} />
                <Checkbox label="IUD" name="fp_iud" onChange={handleImmediateChange('fp_iud')} />
                <Checkbox label="Other" name="fp_other" onChange={handleImmediateChange('fp_other')} />
                
                {formDataRef.current.fp_other && (
                  <div className="col-span-2 md:col-span-4">
                    <DebouncedInput 
                      type="text" 
                      placeholder="Specify other method"
                      defaultValue={formDataRef.current.fp_other_specify}
                      onDebouncedChange={handleDebouncedChange('fp_other_specify')}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </InputSection>

        {/* Section 8: Child Immunization */}
        <InputSection title="Child Immunization" icon={Baby}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Child's Name</label>
            <DebouncedInput 
              type="text" 
              placeholder="Enter child's name"
              defaultValue={formDataRef.current.child_name}
              onDebouncedChange={handleDebouncedChange('child_name')}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input 
              type="date" 
              defaultValue={formDataRef.current.child_dob} 
              onChange={handleImmediateChange('child_dob')} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Sex</label>
            <select 
              defaultValue={formDataRef.current.child_sex} 
              onChange={handleImmediateChange('child_sex')} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
            >
              <option value="">Select sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="col-span-2 space-y-6">
            {[
              { title: "At Birth", vaccines: ["BCG", "Hep 0", "OPV 0"], color: "blue" },
              { title: "6 Weeks", vaccines: ["Penta 1", "PCV 1", "OPV 1", "Rota 1", "IPV 1"], color: "green" },
              { title: "10 Weeks", vaccines: ["Penta 2", "PCV 2", "Rota 2", "OPV 2"], color: "yellow" },
              { title: "14 Weeks", vaccines: ["Penta 3", "PCV 3", "OPV 3", "Rota 3", "IPV 2"], color: "orange" },
              { title: "9 Months", vaccines: ["Measles", "Yellow Fever", "Vitamin A"], color: "red" },
              { title: "15 Months", vaccines: ["MCV 2"], color: "purple" }
            ].map((stage, index) => (
              <div key={index} className={`bg-${stage.color}-50 rounded-xl p-4 border border-${stage.color}-200`}>
                <h4 className={`font-semibold text-${stage.color}-800 mb-3`}>{stage.title}</h4>
                <div className={`grid grid-cols-1 ${stage.vaccines.length > 3 ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2'} gap-3`}>
                  {stage.vaccines.map(vaccine => (
                    <VaccineCheckbox key={vaccine} label={vaccine} name={vaccine.toLowerCase().replace(/\s+/g, '')} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </InputSection>

        {/* Section 9: Notes */}
        <InputSection title="Additional Notes" icon={FileText}>
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Clinical Remarks</label>
            <DebouncedTextarea 
              placeholder="Enter clinical notes and observations"
              defaultValue={formDataRef.current.remark}
              onDebouncedChange={handleDebouncedChange('remark')} 
              rows="4"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Additional Comments</label>
            <DebouncedTextarea 
              placeholder="Enter any additional comments or feedback"
              defaultValue={formDataRef.current.comments}
              onDebouncedChange={handleDebouncedChange('comments')} 
              rows="4"
            />
          </div>
        </InputSection>

        {/* Submit Button */}
        <div className="flex justify-center pt-8">
          <button
            type="submit"
            disabled={processing}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold px-12 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
          >
            {processing ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Patient Record...</span>
              </div>
            ) : (
              "Save Patient Record"
            )}
          </button>
        </div>
      </form>
    </PhcStaffLayout>
  );
}