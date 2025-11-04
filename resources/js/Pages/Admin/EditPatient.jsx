import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import { useForm, usePage, router } from "@inertiajs/react";
import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft, Save, Building } from "lucide-react";

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
  
  // Initialize form data with patient's existing data
  const { data, setData, patch, processing, errors } = useForm({
    woman_name: patient.woman_name || "",
    age: patient.age || "",
    literacy_status: patient.literacy_status || "Not sure",
    phone_number: patient.phone_number || "",
    husband_name: patient.husband_name || "",
    husband_phone: patient.husband_phone || "",
    community: patient.community || "",
    address: patient.address || "",
    lga_id: patient.lga_id || "",
    ward_id: patient.ward_id || "",
    health_facility_id: patient.health_facility_id || "",
    gravida: patient.gravida || "",
    parity: patient.parity || "",
    date_of_registration: formatDateForInput(patient.date_of_registration),
    edd: formatDateForInput(patient.edd),
    anc_visit_1: formatDateForInput(patient.anc_visit_1),
    tracked_before_anc1: !!patient.tracked_before_anc1,
    anc_visit_2: formatDateForInput(patient.anc_visit_2),
    tracked_before_anc2: !!patient.tracked_before_anc2,
    anc_visit_3: formatDateForInput(patient.anc_visit_3),
    tracked_before_anc3: !!patient.tracked_before_anc3,
    anc_visit_4: formatDateForInput(patient.anc_visit_4),
    tracked_before_anc4: !!patient.tracked_before_anc4,
    additional_anc_count: patient.additional_anc_count || "",
    place_of_delivery: patient.place_of_delivery || "",
    delivery_kits_received: !!patient.delivery_kits_received,
    type_of_delivery: patient.type_of_delivery || "",
    delivery_outcome: patient.delivery_outcome || "",
    date_of_delivery: formatDateForInput(patient.date_of_delivery),
    child_immunization_status: patient.child_immunization_status || "",
    fp_interest_postpartum: !!patient.fp_interest_postpartum,
    fp_given: !!patient.fp_given,
    fp_paid: !!patient.fp_paid,
    fp_payment_amount: patient.fp_payment_amount || "",
    fp_reason_not_given: patient.fp_reason_not_given || "",
    pnc_visit_1: formatDateForInput(patient.pnc_visit_1),
    pnc_visit_2: formatDateForInput(patient.pnc_visit_2),
    health_insurance_status: patient.health_insurance_status || "Not Enrolled",
    insurance_satisfaction: !!patient.insurance_satisfaction,
    anc_paid: !!patient.anc_paid,
    anc_payment_amount: patient.anc_payment_amount || "",
    remark: patient.remark || "",
    comments: patient.comments || "",
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
    <div className="bg-white p-6 rounded-xl shadow-md space-y-4 border-t-4 border-purple-500">
      <h3 className="text-xl font-semibold text-purple-700">{title}</h3>
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
    <AdminLayout title={`Edit Patient: ${patient.woman_name}`}>
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
          <div className="text-xs text-purple-600 mt-1">
            Facility: {patient.health_facility?.clinic_name}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        
        {/* --- SECTION 1: Personal & Location Information --- */}
        <InputSection title="1. Personal & Location Information">
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
                <option value="Not sure">Literacy Status *</option>
                <option value="Literate">Literate</option>
                <option value="Illiterate">Illiterate</option>
                <option value="Not sure">Not sure</option>
            </select>
            {errors.literacy_status && <p className="text-red-500 text-sm">{errors.literacy_status}</p>}

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
                <option value="">Health Facility (Registration Site) *</option>
                {facilitiesInWard.map(f => <option key={f.id} value={f.id}>{f.clinic_name}</option>)}
                {!facilitiesInWard.length && data.ward_id && <option disabled>No facilities found</option>}
            </select>
        </InputSection>
        
        {/* --- SECTION 2: Medical & Registration Details --- */}
        <InputSection title="2. Medical & Registration Details">
            <DebouncedInput 
              type="number" 
              placeholder="Gravida (G)" 
              value={data.gravida}
              onDebouncedChange={(value) => setData('gravida', value)}
              min="0" 
            />
            
            <DebouncedInput 
              type="number" 
              placeholder="Parity (P)" 
              value={data.parity}
              onDebouncedChange={(value) => setData('parity', value)}
              min="0" 
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Registration *</label>
              <input 
                type="date" 
                value={data.date_of_registration}
                onChange={(e) => setData('date_of_registration', e.target.value)} 
                required 
                className={inputClass} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Date of Delivery (EDD) *</label>
              <input 
                type="date" 
                value={data.edd}
                onChange={(e) => setData('edd', e.target.value)} 
                required 
                className={inputClass} 
              />
            </div>
        </InputSection>
        
        {/* --- SECTION 3: ANC Visit Tracking --- */}
        <InputSection title="3. ANC Visit Tracking">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ANC Visit 1 (Date)</label>
              <input 
                type="date" 
                value={data.anc_visit_1} 
                onChange={(e) => setData('anc_visit_1', e.target.value)} 
                className={inputClass} 
              />
            </div>
            <Checkbox 
              label="Tracked before ANC1?" 
              name="tracked_before_anc1" 
              checked={data.tracked_before_anc1}
              onChange={(e) => setData('tracked_before_anc1', e.target.checked)} 
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ANC Visit 2 (Date)</label>
              <input 
                type="date" 
                value={data.anc_visit_2} 
                onChange={(e) => setData('anc_visit_2', e.target.value)} 
                className={inputClass} 
              />
            </div>
            <Checkbox 
              label="Tracked before ANC2?" 
              name="tracked_before_anc2" 
              checked={data.tracked_before_anc2}
              onChange={(e) => setData('tracked_before_anc2', e.target.checked)} 
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ANC Visit 3 (Date)</label>
              <input 
                type="date" 
                value={data.anc_visit_3} 
                onChange={(e) => setData('anc_visit_3', e.target.value)} 
                className={inputClass} 
              />
            </div>
            <Checkbox 
              label="Tracked before ANC3?" 
              name="tracked_before_anc3" 
              checked={data.tracked_before_anc3}
              onChange={(e) => setData('tracked_before_anc3', e.target.checked)} 
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ANC Visit 4 (Date)</label>
              <input 
                type="date" 
                value={data.anc_visit_4} 
                onChange={(e) => setData('anc_visit_4', e.target.value)} 
                className={inputClass} 
              />
            </div>
            <Checkbox 
              label="Tracked before ANC4?" 
              name="tracked_before_anc4" 
              checked={data.tracked_before_anc4}
              onChange={(e) => setData('tracked_before_anc4', e.target.checked)} 
            />
            
            <DebouncedInput 
              type="number" 
              placeholder="Additional ANC Count" 
              value={data.additional_anc_count}
              onDebouncedChange={(value) => setData('additional_anc_count', value)}
              min="0" 
            />
        </InputSection>

        {/* --- SECTION 4: Delivery Details --- */}
        <InputSection title="4. Delivery Details">
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
              value={data.delivery_outcome} 
              onChange={(e) => setData('delivery_outcome', e.target.value)} 
              className={selectClass}
            >
                <option value="">Delivery Outcome</option>
                <option value="Live birth">Live birth</option>
                <option value="Stillbirth">Stillbirth</option>
                <option value="Miscarriage">Miscarriage</option>
            </select>
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
              label="Received free delivery kits?" 
              name="delivery_kits_received" 
              checked={data.delivery_kits_received}
              onChange={(e) => setData('delivery_kits_received', e.target.checked)} 
            />
        </InputSection>

        {/* --- SECTION 5: Postpartum & Payment --- */}
        <InputSection title="5. Postpartum & Payment">
            <select 
              value={data.child_immunization_status} 
              onChange={(e) => setData('child_immunization_status', e.target.value)} 
              className={selectClass}
            >
                <option value="">Child Immunization Status</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Pending">Pending</option>
            </select>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PNC Visit 1 (Date)</label>
              <input 
                type="date" 
                value={data.pnc_visit_1} 
                onChange={(e) => setData('pnc_visit_1', e.target.value)} 
                className={inputClass} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PNC Visit 2 (Date)</label>
              <input 
                type="date" 
                value={data.pnc_visit_2} 
                onChange={(e) => setData('pnc_visit_2', e.target.value)} 
                className={inputClass} 
              />
            </div>
            
            <select 
              value={data.health_insurance_status} 
              onChange={(e) => setData('health_insurance_status', e.target.value)} 
              className={selectClass}
            >
                <option value="Not Enrolled">Health Insurance *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not Enrolled">Not Enrolled</option>
            </select>
            <Checkbox 
              label="Happy with insurance services?" 
              name="insurance_satisfaction" 
              checked={data.insurance_satisfaction}
              onChange={(e) => setData('insurance_satisfaction', e.target.checked)} 
            />
            
            <Checkbox 
              label="Paid for ANC?" 
              name="anc_paid" 
              checked={data.anc_paid}
              onChange={(e) => setData('anc_paid', e.target.checked)} 
            />
            {data.anc_paid && (
                <DebouncedInput 
                  type="number" 
                  placeholder="ANC Payment Amount (NGN)" 
                  value={data.anc_payment_amount}
                  onDebouncedChange={(value) => setData('anc_payment_amount', value)}
                  min="0" 
                />
            )}

            <Checkbox 
              label="Interested in FP Postpartum?" 
              name="fp_interest_postpartum" 
              checked={data.fp_interest_postpartum}
              onChange={(e) => setData('fp_interest_postpartum', e.target.checked)} 
            />
            <Checkbox 
              label="FP Given?" 
              name="fp_given" 
              checked={data.fp_given}
              onChange={(e) => setData('fp_given', e.target.checked)} 
            />
            {data.fp_given && (
                <>
                    <Checkbox 
                      label="Paid for FP service?" 
                      name="fp_paid" 
                      checked={data.fp_paid}
                      onChange={(e) => setData('fp_paid', e.target.checked)} 
                    />
                    {data.fp_paid && (
                        <DebouncedInput 
                          type="number" 
                          placeholder="FP Payment Amount (NGN)" 
                          value={data.fp_payment_amount}
                          onDebouncedChange={(value) => setData('fp_payment_amount', value)}
                          min="0" 
                        />
                    )}
                </>
            )}
            {!data.fp_given && (
                <div className="md:col-span-2">
                  <DebouncedTextarea 
                    placeholder="Reason FP Not Given" 
                    value={data.fp_reason_not_given}
                    onDebouncedChange={(value) => setData('fp_reason_not_given', value)} 
                    rows="2" 
                  />
                </div>
            )}
        </InputSection>

        {/* --- SECTION 6: Notes --- */}
        <InputSection title="6. Notes">
            <div className="md:col-span-2">
              <DebouncedTextarea 
                placeholder="Remark (Notes or comments about client)" 
                value={data.remark}
                onDebouncedChange={(value) => setData('remark', value)} 
                rows="3" 
              />
            </div>
            <div className="md:col-span-2">
              <DebouncedTextarea 
                placeholder="Comments (Feedback or field comments)" 
                value={data.comments}
                onDebouncedChange={(value) => setData('comments', value)} 
                rows="3" 
              />
            </div>
        </InputSection>

        <div className="flex flex-col sm:flex-row justify-between gap-4 p-4 bg-white rounded-xl shadow-md">
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
            className="flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            <Save size={16} />
            {processing ? "Updating..." : "Update Patient Record"}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}