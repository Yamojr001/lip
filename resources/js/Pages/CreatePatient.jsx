// File: resources/js/Pages/CreatePatient.jsx
import React, { useState, useEffect } from "react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { useForm, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function CreatePatient() {
  const { lgas = [], wards = [], phcFacilities = [] } = usePage().props;
  
  // State for Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newPatientId, setNewPatientId] = useState("");

  const { data, setData, post, processing, errors, reset } = useForm({
    // Personal Info
    woman_name: "", age: "", literacy_status: "Not sure", phone_number: "", 
    husband_name: "", husband_phone: "", community: "", address: "", 
    lga_id: "", ward_id: "", health_facility_id: "",

    // Medical Info
    gravida: "", parity: "", date_of_registration: "", edd: "",

    // ANC Visits
    anc_visit_1: "", tracked_before_anc1: false, anc_visit_2: "", tracked_before_anc2: false,
    anc_visit_3: "", tracked_before_anc3: false, anc_visit_4: "", tracked_before_anc4: false,
    additional_anc_count: "",
    
    // Delivery
    place_of_delivery: "", delivery_kits_received: false, type_of_delivery: "", 
    delivery_outcome: "", date_of_delivery: "",

    // Postpartum
    child_immunization_status: "", fp_interest_postpartum: false, fp_given: false,
    fp_paid: false, fp_payment_amount: "", fp_reason_not_given: "", pnc_visit_1: "", pnc_visit_2: "",

    // Insurance & Payment
    health_insurance_status: "Not Enrolled", insurance_satisfaction: false, anc_paid: false,
    anc_payment_amount: "",

    // Additional
    remark: "", comments: "",
  });

  // Cascading Dropdowns Logic (Stable useEffect version)
  const [wardsInLGA, setWardsInLGA] = useState([]);
  const [facilitiesInWard, setFacilitiesInWard] = useState([]);
  
  // Filter Wards by LGA (LGA -> Ward)
  useEffect(() => {
    const selectedLgaId = data.lga_id ? parseInt(data.lga_id) : null;
    if (selectedLgaId) {
        const filteredWards = wards.filter(w => w.lga_id === selectedLgaId);
        setWardsInLGA(filteredWards);
    } else {
        setWardsInLGA([]);
    }
  }, [data.lga_id, wards]);

  // Filter Facilities by Ward (Ward -> Facility)
  useEffect(() => {
    const selectedWardId = data.ward_id ? parseInt(data.ward_id) : null;
    if (selectedWardId) {
        const wardFacilities = phcFacilities.filter(f => f.ward_id === selectedWardId);
        setFacilitiesInWard(wardFacilities);
    } else {
        setFacilitiesInWard([]);
    }
  }, [data.ward_id, phcFacilities]);


  // Stable input handler for simple fields
  const handleInputChange = (field) => (e) => {
    setData(field, e.target.value);
  };
  
  // Dedicated change handler for LGA to clear dependents immediately
  const handleLGAChange = (e) => {
    const lgaId = e.target.value;
    setData('lga_id', lgaId);
    setData('ward_id', '');
    setData('health_facility_id', '');
  };
  
  // Dedicated change handler for Ward to clear dependents immediately
  const handleWardChange = (e) => {
    const wardId = e.target.value;
    setData('ward_id', wardId);
    setData('health_facility_id', '');
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('phc.patient.store'), {
      onSuccess: (response) => {
        // Parse the unique ID from the success message
        const successMessage = response.props.flash.success || "";
        const uniqueIdMatch = successMessage.match(/Unique ID: (.*)/);
        const uniqueId = uniqueIdMatch ? uniqueIdMatch[1] : "N/A";
        
        setNewPatientId(uniqueId);
        setShowSuccessModal(true);
        reset();
      },
      onError: (errors) => {
        console.error("Validation Errors:", errors);
      }
    });
  };

  const InputSection = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md space-y-4 border-t-4 border-purple-500">
      <h3 className="text-xl font-semibold text-purple-700">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );

  const Checkbox = ({ label, name }) => (
    <div className="flex items-center space-x-2">
        <input
            type="checkbox"
            id={name}
            checked={data[name]}
            onChange={(e) => setData(name, e.target.checked)}
            className="rounded text-purple-600 shadow-sm focus:ring-purple-500"
        />
        <label htmlFor={name} className="text-sm font-medium text-gray-700">{label}</label>
    </div>
  );
  
  // Custom Success Modal Component
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
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        <InputSection title="1. Personal & Location Information">
            <input type="text" placeholder="Woman's Full Name *" value={data.woman_name} onChange={handleInputChange('woman_name')} required className="col-span-2 p-2 border rounded-lg" />
            {errors.woman_name && <p className="text-red-500 text-sm col-span-2">{errors.woman_name}</p>}

            <input type="number" placeholder="Age *" value={data.age} onChange={handleInputChange('age')} required min="15" max="50" className="p-2 border rounded-lg" />
            <input type="text" placeholder="Phone Number" value={data.phone_number} onChange={handleInputChange('phone_number')} className="p-2 border rounded-lg" />
            
            <select value={data.literacy_status} onChange={handleInputChange('literacy_status')} required className="p-2 border rounded-lg">
                <option value="Not sure">Education Status *</option>
                <option value="Literate">Educated</option>
                <option value="Illiterate">Uneducated</option>
                <option value="Not sure">Not sure</option>
            </select>
            {errors.literacy_status && <p className="text-red-500 text-sm">{errors.literacy_status}</p>}

            <input type="text" placeholder="Next Of kin name" value={data.husband_name} onChange={handleInputChange('husband_name')} className="p-2 border rounded-lg" />
            <input type="text" placeholder="Next of kin Phone" value={data.husband_phone} onChange={handleInputChange('husband_phone')} className="p-2 border rounded-lg" />
            <input type="text" placeholder="Community *" value={data.community} onChange={handleInputChange('community')} required className="p-2 border rounded-lg" />
            <input type="text" placeholder="Address (House No. & Street) *" value={data.address} onChange={handleInputChange('address')} required className="col-span-2 p-2 border rounded-lg" />
            
            {/* Cascading Dropdowns */}
            <select value={data.lga_id} onChange={handleLGAChange} required className="p-2 border rounded-lg">
                <option value="">Select LGA *</option>
                {lgas.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <select value={data.ward_id} onChange={handleWardChange} required disabled={!data.lga_id} className="p-2 border rounded-lg">
                <option value="">Select Ward *</option>
                {wardsInLGA.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                {data.lga_id && wardsInLGA.length === 0 && <option disabled>No wards found</option>}
            </select>
            <select value={data.health_facility_id} onChange={handleInputChange('health_facility_id')} required disabled={!data.ward_id} className="p-2 border rounded-lg">
                <option value="">Health Facility (Registration Site) *</option>
                {facilitiesInWard.map(f => <option key={f.id} value={f.id}>{f.clinic_name}</option>)}
                {data.ward_id && facilitiesInWard.length === 0 && <option disabled>No facilities found</option>}
            </select>
        </InputSection>
        
        <InputSection title="2. Medical & Registration Details">
            <input type="number" placeholder="Gravida (G)" value={data.gravida} onChange={handleInputChange('gravida')} min="0" className="p-2 border rounded-lg" />
            <input type="number" placeholder="Parity (P)" value={data.parity} onChange={handleInputChange('parity')} min="0" className="p-2 border rounded-lg" />
            <label className="block text-sm font-medium text-gray-700">Date of Registration *</label>
            <input type="date" value={data.date_of_registration} onChange={handleInputChange('date_of_registration')} required className="p-2 border rounded-lg" />
            <label className="block text-sm font-medium text-gray-700">Expected Date of Delivery (EDD) *</label>
            <input type="date" value={data.edd} onChange={handleInputChange('edd')} required className="p-2 border rounded-lg" />
        </InputSection>
        
        <InputSection title="3. ANC Visit Tracking">
            <label className="block text-sm font-medium text-gray-700">ANC Visit 1 (Date)</label>
            <input type="date" value={data.anc_visit_1} onChange={handleInputChange('anc_visit_1')} className="p-2 border rounded-lg" />
            <Checkbox label="Tracked before ANC1?" name="tracked_before_anc1" />

            <label className="block text-sm font-medium text-gray-700">ANC Visit 2 (Date)</label>
            <input type="date" value={data.anc_visit_2} onChange={handleInputChange('anc_visit_2')} className="p-2 border rounded-lg" />
            <Checkbox label="Tracked before ANC2?" name="tracked_before_anc2" />

            <label className="block text-sm font-medium text-gray-700">ANC Visit 3 (Date)</label>
            <input type="date" value={data.anc_visit_3} onChange={handleInputChange('anc_visit_3')} className="p-2 border rounded-lg" />
            <Checkbox label="Tracked before ANC3?" name="tracked_before_anc3" />

            <label className="block text-sm font-medium text-gray-700">ANC Visit 4 (Date)</label>
            <input type="date" value={data.anc_visit_4} onChange={handleInputChange('anc_visit_4')} className="p-2 border rounded-lg" />
            <Checkbox label="Tracked before ANC4?" name="tracked_before_anc4" />
            
            <input type="number" placeholder="Additional ANC Count" value={data.additional_anc_count} onChange={handleInputChange('additional_anc_count')} min="0" className="p-2 border rounded-lg" />
        </InputSection>

        <InputSection title="4. Delivery Details">
            <select value={data.place_of_delivery} onChange={handleInputChange('place_of_delivery')} className="p-2 border rounded-lg">
                <option value="">Place of Delivery</option>
                <option value="Home">Home</option>
                <option value="Health Facility">Health Facility</option>
                <option value="Traditional Attendant">Traditional Attendant</option>
            </select>
            <select value={data.type_of_delivery} onChange={handleInputChange('type_of_delivery')} className="p-2 border rounded-lg">
                <option value="">Type of Delivery</option>
                <option value="Normal (Vaginal)">Normal (Vaginal)</option>
                <option value="Cesarean Section">Cesarean Section</option>
                <option value="Assisted">Assisted</option>
                <option value="Breech">Breech</option>
            </select>
            <select value={data.delivery_outcome} onChange={handleInputChange('delivery_outcome')} className="p-2 border rounded-lg">
                <option value="">Delivery Outcome</option>
                <option value="Live birth">Live birth</option>
                <option value="Stillbirth">Stillbirth</option>
                <option value="Miscarriage">Miscarriage</option>
            </select>
            <label className="block text-sm font-medium text-gray-700">Date of Delivery</label>
            <input type="date" value={data.date_of_delivery} onChange={handleInputChange('date_of_delivery')} className="p-2 border rounded-lg" />
            <Checkbox label="Received free delivery kits?" name="delivery_kits_received" />
        </InputSection>

        <InputSection title="5. Postpartum & Payment">
            <select value={data.child_immunization_status} onChange={handleInputChange('child_immunization_status')} className="p-2 border rounded-lg">
                <option value="">Child Immunization Status</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Pending">Pending</option>
            </select>

            <label className="block text-sm font-medium text-gray-700">PNC Visit 1 (Date)</label>
            <input type="date" value={data.pnc_visit_1} onChange={handleInputChange('pnc_visit_1')} className="p-2 border rounded-lg" />
            
            <label className="block text-sm font-medium text-gray-700">PNC Visit 2 (Date)</label>
            <input type="date" value={data.pnc_visit_2} onChange={handleInputChange('pnc_visit_2')} className="p-2 border rounded-lg" />
            
            <select value={data.health_insurance_status} onChange={handleInputChange('health_insurance_status')} className="p-2 border rounded-lg">
                <option value="Not Enrolled">Health Insurance *</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not Enrolled">Not Enrolled</option>
            </select>
            <Checkbox label="Happy with insurance services?" name="insurance_satisfaction" />
            
            <Checkbox label="Paid for ANC?" name="anc_paid" />
            {data.anc_paid && (
                <input type="number" placeholder="ANC Payment Amount (NGN)" value={data.anc_payment_amount} onChange={handleInputChange('anc_payment_amount')} min="0" className="p-2 border rounded-lg" />
            )}

            <Checkbox label="Interested in FP Postpartum?" name="fp_interest_postpartum" />
            <Checkbox label="FP Given?" name="fp_given" />
            {data.fp_given && (
                <>
                    <Checkbox label="Paid for FP service?" name="fp_paid" />
                    {data.fp_paid && (
                        <input type="number" placeholder="FP Payment Amount (NGN)" value={data.fp_payment_amount} onChange={handleInputChange('fp_payment_amount')} min="0" className="p-2 border rounded-lg" />
                    )}
                </>
            )}
            {!data.fp_given && (
                <textarea placeholder="Reason FP Not Given" value={data.fp_reason_not_given} onChange={handleInputChange('fp_reason_not_given')} rows="2" className="p-2 border rounded-lg col-span-2" />
            )}
        </InputSection>

        <InputSection title="6. Notes">
            <textarea placeholder="Remark (Notes or comments about client)" value={data.remark} onChange={handleInputChange('remark')} rows="3" className="p-2 border rounded-lg col-span-2" />
            <textarea placeholder="Comments (Feedback or field comments)" value={data.comments} onChange={handleInputChange('comments')} rows="3" className="p-2 border rounded-lg col-span-2" />
        </InputSection>


        <div className="flex justify-end p-4">
          <button
            type="submit"
            disabled={processing}
            className="bg-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {processing ? "Saving..." : "Save Patient Record"}
          </button>
        </div>
      </form>
    </PhcStaffLayout>
  );
}