import React, { useState, useEffect, useRef, useMemo } from "react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { useForm, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

// --- Custom Debounced Input Components (Omitted for brevity, assumed correct) ---
// Note: The full component code from the user's last turn is assumed to be here.
// Re-insert the DebouncedInput and DebouncedTextarea components here if running the file.

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
  useEffect(() => { return () => { if (timeoutRef.current) { clearTimeout(timeoutRef.current); } }; }, []);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      required={required}
      className={`p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition ${className}`}
      {...props}
    />
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
  useEffect(() => { return () => { if (timeoutRef.current) { clearTimeout(timeoutRef.current); } }; }, []);
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      rows={rows}
      className={`p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition ${className}`}
      {...props}
    />
  );
});


// --- Main Component ---

export default function CreatePatient() {
  const { lgas = [], wards = [], phcFacilities = [] } = usePage().props;
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newPatientId, setNewPatientId] = useState("");
  
  // 1. useRef to store the actual form data (for performance)
  const formDataRef = useRef({
    woman_name: "", age: "", literacy_status: "Not sure", phone_number: "", 
    husband_name: "", husband_phone: "", community: "", address: "", 
    lga_id: "", ward_id: "", health_facility_id: "",
    gravida: "", parity: "", date_of_registration: "", edd: "",
    anc_visit_1: "", tracked_before_anc1: false, anc_visit_2: "", tracked_before_anc2: false,
    anc_visit_3: "", tracked_before_anc3: false, anc_visit_4: "", tracked_before_anc4: false,
    additional_anc_count: "",
    place_of_delivery: "", delivery_kits_received: false, type_of_delivery: "", 
    delivery_outcome: "", date_of_delivery: "",
    child_immunization_status: "", fp_interest_postpartum: false, fp_given: false,
    fp_paid: false, fp_payment_amount: "", fp_reason_not_given: "", pnc_visit_1: "", pnc_visit_2: "",
    health_insurance_status: "Not Enrolled", insurance_satisfaction: false, anc_paid: false,
    anc_payment_amount: "",
    remark: "", comments: "",
  });
  
  // 2. useForm is only used for submission logic and error tracking
  const { post, processing, errors, reset } = useForm(formDataRef.current);
  
  // 3. Local state for dropdown filtering only (to force re-render when selections change)
  const [localSelections, setLocalSelections] = useState({
    lga_id: "",
    ward_id: "",
  });

  // Derived state for filtering dropdowns (Optimized)
  const [wardsInLGA, setWardsInLGA] = useState([]);
  const [facilitiesInWard, setFacilitiesInWard] = useState([]);
  
  // Filter Wards by LGA (LGA -> Ward)
  useEffect(() => {
    const selectedLgaId = formDataRef.current.lga_id ? parseInt(formDataRef.current.lga_id) : null;
    
    if (selectedLgaId) {
        const filteredWards = wards.filter(w => w.lga_id === selectedLgaId);
        setWardsInLGA(filteredWards);
    } else {
        setWardsInLGA([]);
    }
  }, [formDataRef.current.lga_id, wards]);

  // Filter Facilities by Ward (Ward -> Facility)
  useEffect(() => {
    const selectedWardId = formDataRef.current.ward_id ? parseInt(formDataRef.current.ward_id) : null;
    
    if (selectedWardId) {
        const wardFacilities = phcFacilities.filter(f => f.ward_id === selectedWardId);
        setFacilitiesInWard(wardFacilities);
    } else {
        setFacilitiesInWard([]);
    }
  }, [formDataRef.current.ward_id, phcFacilities]);

  // Update form data ref without causing re-renders
  const updateFormData = (field, value) => {
    formDataRef.current[field] = value;
  };

  // --- Change Handlers ---
  
  // Handles text/number inputs (Debounced)
  const handleDebouncedChange = (field) => (value) => {
    updateFormData(field, value);
  };

  // Handles immediate input changes (Select, Date, Checkbox)
  const [immediateChangeKey, setImmediateChangeKey] = useState(0); // Dummy state for forcing re-render
  const handleImmediateChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    updateFormData(field, value);
    setImmediateChangeKey(prev => prev + 1); // Trigger re-render for conditional UI/dropdowns
  };
  
  // Dedicated change handler for LGA to clear dependents immediately
  const handleLGAChange = (e) => {
    const lgaId = e.target.value;
    updateFormData('lga_id', lgaId);
    updateFormData('ward_id', '');
    updateFormData('health_facility_id', '');
    setImmediateChangeKey(prev => prev + 1); // Trigger re-render
  };

  // Dedicated change handler for Ward to clear dependents immediately
  const handleWardChange = (e) => {
    const wardId = e.target.value;
    updateFormData('ward_id', wardId);
    updateFormData('health_facility_id', '');
    setImmediateChangeKey(prev => prev + 1); // Trigger re-render
  };

  // --- Submission ---

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert formDataRef to regular object for submission
    const submissionData = { ...formDataRef.current };
    
    // Ensure boolean fields are explicitly set for submission (required by validation)
    ['tracked_before_anc1', 'tracked_before_anc2', 'tracked_before_anc3', 'tracked_before_anc4', 'delivery_kits_received', 'fp_interest_postpartum', 'fp_given', 'fp_paid', 'insurance_satisfaction', 'anc_paid'].forEach(field => {
        submissionData[field] = !!submissionData[field];
    });

    post(route('phc.patient.store'), {
      data: submissionData,
      onSuccess: (response) => {
        // FIX: Use optional chaining to safely access flash props
        const successMessage = response.props?.flash?.success || ""; 
        const uniqueIdMatch = successMessage.match(/Unique ID: (.*)/);
        const uniqueId = uniqueIdMatch ? uniqueIdMatch[1] : "N/A";
        
        setNewPatientId(uniqueId);
        setShowSuccessModal(true);
        
        // Reset form data and local state
        Object.keys(formDataRef.current).forEach(key => {
          formDataRef.current[key] = "";
        });
        formDataRef.current.literacy_status = "Not sure";
        formDataRef.current.health_insurance_status = "Not Enrolled";
        setImmediateChangeKey(prev => prev + 1); // Trigger final UI reset
        reset(); // Reset useForm state for errors/processing
      },
      onError: (errors) => {
        console.error("Validation Errors:", errors);
      }
    });
  };

  // --- Reusable Components ---

  const InputSection = React.memo(({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-4 border-t-4 border-purple-500">
      <h3 className="text-xl font-semibold text-purple-700">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  ));

  const Checkbox = React.memo(({ label, name, defaultChecked, onChange }) => (
    <div className="flex items-center space-x-2">
        <input
            type="checkbox"
            id={name}
            // Controlled by formDataRef's value
            defaultChecked={formDataRef.current[name]} 
            onChange={onChange}
            className="rounded text-purple-600 shadow-sm focus:ring-purple-500"
        />
        <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
    </div>
  ), (prevProps, nextProps) => prevProps.name === nextProps.name); // Simple memoization

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
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h2>
              <p className="text-lg text-gray-600 mb-4">Patient record saved successfully.</p>
              
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-800">New Patient ID:</p>
                  <p className="text-2xl font-extrabold text-green-600">{newPatientId}</p>
              </div>

              <button
                  onClick={() => setShowSuccessModal(false)}
                  className="mt-6 bg-purple-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-purple-700 transition"
              >
                  Close & Continue
              </button>
          </motion.div>
      </motion.div>
  );

  return (
    <PhcStaffLayout title="Register New Patient">
      {showSuccessModal && <SuccessModal />}
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto" key={immediateChangeKey}>
        
        {/* --- SECTION 1: Personal & Location Information --- */}
        <InputSection title="1. Personal & Location Information">
            <DebouncedInput 
              type="text" 
              placeholder="Woman's Full Name *" 
              defaultValue={formDataRef.current.woman_name}
              onDebouncedChange={handleDebouncedChange('woman_name')}
              required 
              className="col-span-2" 
            />
            {errors.woman_name && <p className="text-red-500 text-sm col-span-2">{errors.woman_name}</p>}

            <DebouncedInput 
              type="number" 
              placeholder="Age *" 
              defaultValue={formDataRef.current.age}
              onDebouncedChange={handleDebouncedChange('age')}
              required 
              min="15" 
              max="50" 
            />
            
            <DebouncedInput 
              type="text" 
              placeholder="Phone Number" 
              defaultValue={formDataRef.current.phone_number}
              onDebouncedChange={handleDebouncedChange('phone_number')}
            />
            
            <select 
              defaultValue={formDataRef.current.literacy_status} 
              onChange={handleImmediateChange('literacy_status')} 
              required 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
            >
                <option value="Not sure">Literacy Status *</option>
                <option value="Literate">Literate</option>
                <option value="Illiterate">Illiterate</option>
                <option value="Not sure">Not sure</option>
            </select>
            {errors.literacy_status && <p className="text-red-500 text-sm">{errors.literacy_status}</p>}

            <DebouncedInput 
              type="text" 
              placeholder="Husband Name" 
              defaultValue={formDataRef.current.husband_name}
              onDebouncedChange={handleDebouncedChange('husband_name')}
            />
            
            <DebouncedInput 
              type="text" 
              placeholder="Husband Phone" 
              defaultValue={formDataRef.current.husband_phone}
              onDebouncedChange={handleDebouncedChange('husband_phone')}
            />
            
            <DebouncedInput 
              type="text" 
              placeholder="Community *" 
              defaultValue={formDataRef.current.community}
              onDebouncedChange={handleDebouncedChange('community')}
              required 
            />
            
            <DebouncedInput 
              type="text" 
              placeholder="Address (House No. & Street) *" 
              defaultValue={formDataRef.current.address}
              onDebouncedChange={handleDebouncedChange('address')}
              required 
              className="col-span-2" 
            />
            
            {/* Cascading Dropdowns */}
            <select 
              defaultValue={formDataRef.current.lga_id} 
              onChange={handleLGAChange} 
              required 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
            >
                <option value="">Select LGA *</option>
                {lgas.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            
            <select 
              defaultValue={formDataRef.current.ward_id} 
              onChange={handleWardChange} 
              required 
              disabled={!formDataRef.current.lga_id} 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
            >
                <option value="">Select Ward *</option>
                {wardsInLGA.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                {!wardsInLGA.length && formDataRef.current.lga_id && <option disabled>No wards found</option>}
            </select>
            
            <select 
              defaultValue={formDataRef.current.health_facility_id} 
              onChange={handleImmediateChange('health_facility_id')} 
              required 
              disabled={!formDataRef.current.ward_id} 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
            >
                <option value="">Health Facility (Registration Site) *</option>
                {facilitiesInWard.map(f => <option key={f.id} value={f.id}>{f.clinic_name}</option>)}
                {!facilitiesInWard.length && formDataRef.current.ward_id && <option disabled>No facilities found</option>}
            </select>
        </InputSection>
        
        {/* --- SECTION 2: Medical & Registration Details --- */}
        <InputSection title="2. Medical & Registration Details">
            <DebouncedInput 
              type="number" 
              placeholder="Gravida (G)" 
              defaultValue={formDataRef.current.gravida}
              onDebouncedChange={handleDebouncedChange('gravida')}
              min="0" 
            />
            
            <DebouncedInput 
              type="number" 
              placeholder="Parity (P)" 
              defaultValue={formDataRef.current.parity}
              onDebouncedChange={handleDebouncedChange('parity')}
              min="0" 
            />
            
            <label className="block text-sm font-medium text-gray-700">Date of Registration *</label>
            <input 
              type="date" 
              defaultValue={formDataRef.current.date_of_registration}
              onChange={handleImmediateChange('date_of_registration')} 
              required 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition" 
            />
            
            <label className="block text-sm font-medium text-gray-700">Expected Date of Delivery (EDD) *</label>
            <input 
              type="date" 
              defaultValue={formDataRef.current.edd}
              onChange={handleImmediateChange('edd')} 
              required 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition" 
            />
        </InputSection>
        
        {/* --- SECTION 3: ANC Visit Tracking --- */}
        <InputSection title="3. ANC Visit Tracking">
            <label className="block text-sm font-medium text-gray-700">ANC Visit 1 (Date)</label>
            <input 
              type="date" 
              defaultValue={formDataRef.current.anc_visit_1} 
              onChange={handleImmediateChange('anc_visit_1')} 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition" 
            />
            <Checkbox label="Tracked before ANC1?" name="tracked_before_anc1" onChange={handleImmediateChange('tracked_before_anc1')} />

            <label className="block text-sm font-medium text-gray-700">ANC Visit 2 (Date)</label>
            <input 
              type="date" 
              defaultValue={formDataRef.current.anc_visit_2} 
              onChange={handleImmediateChange('anc_visit_2')} 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition" 
            />
            <Checkbox label="Tracked before ANC2?" name="tracked_before_anc2" onChange={handleImmediateChange('tracked_before_anc2')} />

            <label className="block text-sm font-medium text-gray-700">ANC Visit 3 (Date)</label>
            <input 
              type="date" 
              defaultValue={formDataRef.current.anc_visit_3} 
              onChange={handleImmediateChange('anc_visit_3')} 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition" 
            />
            <Checkbox label="Tracked before ANC3?" name="tracked_before_anc3" onChange={handleImmediateChange('tracked_before_anc3')} />

            <label className="block text-sm font-medium text-gray-700">ANC Visit 4 (Date)</label>
            <input 
              type="date" 
              defaultValue={formDataRef.current.anc_visit_4} 
              onChange={handleImmediateChange('anc_visit_4')} 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition" 
            />
            <Checkbox label="Tracked before ANC4?" name="tracked_before_anc4" onChange={handleImmediateChange('tracked_before_anc4')} />
            
            <DebouncedInput 
              type="number" 
              placeholder="Additional ANC Count" 
              defaultValue={formDataRef.current.additional_anc_count}
              onDebouncedChange={handleDebouncedChange('additional_anc_count')}
              min="0" 
            />
        </InputSection>

        {/* --- SECTION 4: Delivery Details --- */}
        <InputSection title="4. Delivery Details">
            <select 
              defaultValue={formDataRef.current.place_of_delivery} 
              onChange={handleImmediateChange('place_of_delivery')} 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
            >
                <option value="">Place of Delivery</option>
                <option value="Home">Home</option>
                <option value="Health Facility">Health Facility</option>
                <option value="Traditional Attendant">Traditional Attendant</option>
            </select>
            <select 
              defaultValue={formDataRef.current.type_of_delivery} 
              onChange={handleImmediateChange('type_of_delivery')} 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
            >
                <option value="">Type of Delivery</option>
                <option value="Normal (Vaginal)">Normal (Vaginal)</option>
                <option value="Cesarean Section">Cesarean Section</option>
                <option value="Assisted">Assisted</option>
                <option value="Breech">Breech</option>
            </select>
            <select 
              defaultValue={formDataRef.current.delivery_outcome} 
              onChange={handleImmediateChange('delivery_outcome')} 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
            >
                <option value="">Delivery Outcome</option>
                <option value="Live birth">Live birth</option>
                <option value="Stillbirth">Stillbirth</option>
                <option value="Miscarriage">Miscarriage</option>
            </select>
            <label className="block text-sm font-medium text-gray-700">Date of Delivery</label>
            <input 
              type="date" 
              defaultValue={formDataRef.current.date_of_delivery} 
              onChange={handleImmediateChange('date_of_delivery')} 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition" 
            />
            <Checkbox label="Received free delivery kits?" name="delivery_kits_received" onChange={handleImmediateChange('delivery_kits_received')} />
        </InputSection>

        {/* --- SECTION 5: Postpartum & Payment --- */}
        <InputSection title="5. Postpartum & Payment">
            <select 
              defaultValue={formDataRef.current.child_immunization_status} 
              onChange={handleImmediateChange('child_immunization_status')} 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
            >
                <option value="">Child Immunization Status</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Pending">Pending</option>
            </select>

            <label className="block text-sm font-medium text-gray-700">PNC Visit 1 (Date)</label>
            <input 
              type="date" 
              defaultValue={formDataRef.current.pnc_visit_1} 
              onChange={handleImmediateChange('pnc_visit_1')} 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition" 
            />
            
            <label className="block text-sm font-medium text-gray-700">PNC Visit 2 (Date)</label>
            <input 
              type="date" 
              defaultValue={formDataRef.current.pnc_visit_2} 
              onChange={handleImmediateChange('pnc_visit_2')} 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition" 
            />
            
            <select 
              defaultValue={formDataRef.current.health_insurance_status} 
              onChange={handleImmediateChange('health_insurance_status')} 
              className="p-2 border rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition"
            >
                <option value="Not Enrolled">Health Insurance *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not Enrolled">Not Enrolled</option>
            </select>
            <Checkbox label="Happy with insurance services?" name="insurance_satisfaction" onChange={handleImmediateChange('insurance_satisfaction')} />
            
            <Checkbox label="Paid for ANC?" name="anc_paid" onChange={handleImmediateChange('anc_paid')} />
            {formDataRef.current.anc_paid && (
                <DebouncedInput 
                  type="number" 
                  placeholder="ANC Payment Amount (NGN)" 
                  defaultValue={formDataRef.current.anc_payment_amount}
                  onDebouncedChange={handleDebouncedChange('anc_payment_amount')}
                  min="0" 
                />
            )}

            <Checkbox label="Interested in FP Postpartum?" name="fp_interest_postpartum" onChange={handleImmediateChange('fp_interest_postpartum')} />
            <Checkbox label="FP Given?" name="fp_given" onChange={handleImmediateChange('fp_given')} />
            {formDataRef.current.fp_given && (
                <>
                    <Checkbox label="Paid for FP service?" name="fp_paid" onChange={handleImmediateChange('fp_paid')} />
                    {formDataRef.current.fp_paid && (
                        <DebouncedInput 
                          type="number" 
                          placeholder="FP Payment Amount (NGN)" 
                          defaultValue={formDataRef.current.fp_payment_amount}
                          onDebouncedChange={handleDebouncedChange('fp_payment_amount')}
                          min="0" 
                        />
                    )}
                </>
            )}
            {!formDataRef.current.fp_given && (
                <DebouncedTextarea 
                  placeholder="Reason FP Not Given" 
                  defaultValue={formDataRef.current.fp_reason_not_given}
                  onDebouncedChange={handleDebouncedChange('fp_reason_not_given')} 
                  rows="2" 
                  className="col-span-2" 
                />
            )}
        </InputSection>

        {/* --- SECTION 6: Notes --- */}
        <InputSection title="6. Notes">
            <DebouncedTextarea 
              placeholder="Remark (Notes or comments about client)" 
              defaultValue={formDataRef.current.remark}
              onDebouncedChange={handleDebouncedChange('remark')} 
              rows="3" 
              className="col-span-2" 
            />
            <DebouncedTextarea 
              placeholder="Comments (Feedback or field comments)" 
              defaultValue={formDataRef.current.comments}
              onDebouncedChange={handleDebouncedChange('comments')} 
              rows="3" 
              className="col-span-2" 
            />
        </InputSection>

        <div className="flex justify-end p-4">
          <button
            type="submit"
            disabled={processing}
            className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 outline-none"
          >
            {processing ? "Saving..." : "Save Patient Record"}
          </button>
        </div>
      </form>
    </PhcStaffLayout>
  );
}