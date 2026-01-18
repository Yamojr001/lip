import React, { useState, useEffect, useRef } from "react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { useForm, usePage } from "@inertiajs/react";
import { motion } from "framer-motion";
import { 
  CheckCircle, 
  Save, 
  Upload, 
  FileSpreadsheet, 
  Shield, 
  Thermometer, 
  Syringe, 
  Package, 
  AlertCircle, 
  Check,
  Calendar,
  Clock,
  Eye,
  Download,
  Activity,
  Droplet,
  FileText,
  Archive,
  Box,
  ClipboardCheck
} from "lucide-react";

// Debounced Input Component
const DebouncedInput = React.memo(({ 
  type = "text", 
  placeholder, 
  defaultValue, 
  onDebouncedChange, 
  required = false,
  className = "",
  disabled = false,
  min = null,
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
        disabled={disabled}
        min={min}
        className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white ${className}`}
        {...props}
      />
    </div>
  );
});

// Main Component
export default function VaccineAccountability({ existingReport, currentMonth, recentReports }) {
  const { auth } = usePage().props;
  const currentDate = new Date().toISOString().split('T')[0];
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [activeSection, setActiveSection] = useState("vaccine-utilization");
  const [stockOuts, setStockOuts] = useState({});
  const [showRecentReports, setShowRecentReports] = useState(false);
  const [isDraftMode, setIsDraftMode] = useState(!!existingReport?.status === 'draft');

  // Initialize form data from existing report or create new
  const initialFormData = existingReport ? {
    ...existingReport,
    month_year: existingReport.month_year || currentMonth,
    reporting_date: existingReport.reporting_date || currentDate,
    submission_date: existingReport.submission_date || currentDate,
  } : {
    // Header Information
    month_year: currentMonth,
    reporting_date: currentDate,
    submission_date: currentDate,
    
    // Vaccine Utilization Summary
    vaccine_utilization: [
      { name: "BCG Vaccine", type: "antigen", max_stock: "", min_stock: "", opening_balance: "", received: "", doses_opened: "", returned: "", stock_out: false },
      { name: "BCG Diluent", type: "diluent", max_stock: "", min_stock: "", opening_balance: "", received: "", doses_opened: "", returned: "", stock_out: false },
      { name: "Hep B vaccine", type: "antigen", max_stock: "", min_stock: "", opening_balance: "", received: "", doses_opened: "", returned: "", stock_out: false },
      { name: "OPV Vaccine", type: "antigen", max_stock: "", min_stock: "", opening_balance: "", received: "", doses_opened: "", returned: "", stock_out: false },
      { name: "PENTA Vaccine", type: "antigen", max_stock: "", min_stock: "", opening_balance: "", received: "", doses_opened: "", returned: "", stock_out: false },
      { name: "PCV", type: "antigen", max_stock: "", min_stock: "", opening_balance: "", received: "", doses_opened: "", returned: "", stock_out: false },
      { name: "IPV", type: "antigen", max_stock: "", min_stock: "", opening_balance: "", received: "", doses_opened: "", returned: "", stock_out: false },
      { name: "Rotavirus vaccine", type: "antigen", max_stock: "", min_stock: "", opening_balance: "", received: "", doses_opened: "", returned: "", stock_out: false },
      { name: "Measles Vaccine", type: "antigen", max_stock: "", min_stock: "", opening_balance: "", received: "", doses_opened: "", returned: "", stock_out: false },
      { name: "Measles Diluent", type: "diluent", max_stock: "", min_stock: "", opening_balance: "", received: "", doses_opened: "", returned: "", stock_out: false },
      { name: "Yellow Fever Vaccine", type: "antigen", max_stock: "", min_stock: "", opening_balance: "", received: "", doses_opened: "", returned: "", stock_out: false },
      { name: "Yellow fever Diluent", type: "diluent", max_stock: "", min_stock: "", opening_balance: "", received: "", doses_opened: "", returned: "", stock_out: false },
      { name: "Men A Vaccine", type: "antigen", max_stock: "", min_stock: "", opening_balance: "", received: "", doses_opened: "", returned: "", stock_out: false },
      { name: "Men A Diluent", type: "diluent", max_stock: "", min_stock: "", opening_balance: "", received: "", doses_opened: "", returned: "", stock_out: false },
      { name: "HPV", type: "antigen", max_stock: "", min_stock: "", opening_balance: "", received: "", doses_opened: "", returned: "", stock_out: false },
      { name: "Tetanus Diphtheria", type: "antigen", max_stock: "", min_stock: "", opening_balance: "", received: "", doses_opened: "", returned: "", stock_out: false },
    ],
    
    // Discarded Doses
    discarded_doses: [
      { name: "BCG Dose Discarded", type: "antigen", expiry: "", breakage: "", vvm_change: "", frozen: "", label_removed: "" },
      { name: "BCG Diluent Discarded", type: "diluent", expiry: "", breakage: "", vvm_change: "", frozen: "", label_removed: "" },
      { name: "Hep B Dose Discarded", type: "antigen", expiry: "", breakage: "", vvm_change: "", frozen: "", label_removed: "" },
      { name: "OPV Dose Discarded", type: "antigen", expiry: "", breakage: "", vvm_change: "", frozen: "", label_removed: "" },
      { name: "PENTA Dose Discarded", type: "antigen", expiry: "", breakage: "", vvm_change: "", frozen: "", label_removed: "" },
      { name: "PCV Dose Discarded", type: "antigen", expiry: "", breakage: "", vvm_change: "", frozen: "", label_removed: "" },
      { name: "IPV Dose Discarded", type: "antigen", expiry: "", breakage: "", vvm_change: "", frozen: "", label_removed: "" },
      { name: "Rotavirus Dose Discarded", type: "antigen", expiry: "", breakage: "", vvm_change: "", frozen: "", label_removed: "" },
      { name: "Measles Dose Discarded", type: "antigen", expiry: "", breakage: "", vvm_change: "", frozen: "", label_removed: "" },
      { name: "Measles Diluent Discarded", type: "diluent", expiry: "", breakage: "", vvm_change: "", frozen: "", label_removed: "" },
      { name: "Yellow fever Dose Discarded", type: "antigen", expiry: "", breakage: "", vvm_change: "", frozen: "", label_removed: "" },
      { name: "Yellow fever Diluent Discarded", type: "diluent", expiry: "", breakage: "", vvm_change: "", frozen: "", label_removed: "" },
      { name: "Men Vaccine Dose Discarded", type: "antigen", expiry: "", breakage: "", vvm_change: "", frozen: "", label_removed: "" },
      { name: "Men A Diluent Discarded", type: "diluent", expiry: "", breakage: "", vvm_change: "", frozen: "", label_removed: "" },
      { name: "HPV Dose Discarded", type: "antigen", expiry: "", breakage: "", vvm_change: "", frozen: "", label_removed: "" },
      { name: "Tetanus Diphtheria Dose Discarded", type: "antigen", expiry: "", breakage: "", vvm_change: "", frozen: "", label_removed: "" },
    ],
    
    // Devices/Materials Utilization
    devices_utilization: [
      { name: "BCG Syringes", opening_balance: "", received: "", used: "", ending_balance: "", returned: "" },
      { name: "AD Syringes", opening_balance: "", received: "", used: "", ending_balance: "", returned: "" },
      { name: "2ml Syringes", opening_balance: "", received: "", used: "", ending_balance: "", returned: "" },
      { name: "5ml Syringes", opening_balance: "", received: "", used: "", ending_balance: "", returned: "" },
      { name: "Safety Boxes", opening_balance: "", received: "", used: "", ending_balance: "", returned: "" },
    ],
    
    // Devices Status Report
    device_status: [
      { name: "Ice packs (0.3/0.4L)", quantity: "", functional: "", non_functional: "" },
      { name: "Vaccine Carrier", quantity: "", functional: "", non_functional: "" },
      { name: "Cold boxes", quantity: "", functional: "", non_functional: "" },
      { name: "Vaccine Fridges", quantity: "", functional: "", non_functional: "" },
      { name: "MUAC Strip", quantity: "", functional: "", non_functional: "" },
    ],
    
    // Signatories
    health_officer_name: auth?.user?.name || "",
    health_officer_signature: "",
    head_of_unit_name: "",
    head_of_unit_signature: "",
    phone_number: auth?.user?.phc?.phone || "",
  };

  const formDataRef = useRef(initialFormData);
  const { post, processing, errors, reset } = useForm(formDataRef.current);
  const [immediateChangeKey, setImmediateChangeKey] = useState(0);

  // Update form data
  const updateFormData = (section, index, field, value) => {
    if (section && index !== undefined) {
      formDataRef.current[section][index][field] = value;
    } else {
      formDataRef.current[field] = value;
    }
    setImmediateChangeKey(prev => prev + 1);
  };

  const handleStockOutChange = (vaccineIndex, value) => {
    const boolValue = value === "Yes";
    updateFormData("vaccine_utilization", vaccineIndex, "stock_out", boolValue);
    
    // Update stock outs state for UI
    setStockOuts(prev => ({
      ...prev,
      [vaccineIndex]: boolValue
    }));
  };

  // Calculate ending balance for devices
  const calculateEndingBalance = (deviceIndex) => {
    const device = formDataRef.current.devices_utilization[deviceIndex];
    const opening = parseInt(device.opening_balance) || 0;
    const received = parseInt(device.received) || 0;
    const used = parseInt(device.used) || 0;
    const ending = opening + received - used;
    
    if (!isNaN(ending) && ending >= 0) {
      updateFormData("devices_utilization", deviceIndex, "ending_balance", ending.toString());
    }
  };

  // Save draft
  const saveDraft = async () => {
    try {
      const response = await fetch(route('phc.vaccine-accountability.draft'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
        },
        body: JSON.stringify(formDataRef.current),
      });

      const data = await response.json();
      
      if (data.success) {
        setIsDraftMode(true);
        alert('Draft saved successfully!');
      } else {
        alert('Failed to save draft: ' + data.message);
      }
    } catch (error) {
      alert('Error saving draft: ' + error.message);
    }
  };

  // Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    post(route('phc.vaccine-accountability.store'), {
      data: formDataRef.current,
      onSuccess: (response) => {
        setShowSuccessModal(true);
        setIsDraftMode(false);
        
        // Reset form for new entry
        formDataRef.current = {
          ...initialFormData,
          month_year: currentMonth,
          reporting_date: currentDate,
          submission_date: currentDate,
        };
        setStockOuts({});
        setImmediateChangeKey(prev => prev + 1);
        reset();
      },
      onError: (errors) => {
        console.error("Validation Errors:", errors);
        alert('Please check all required fields and try again.');
      }
    });
  };

  // Success Modal
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Report Submitted!</h2>
        <p className="text-gray-600 mb-4">Vaccine accountability report for {formDataRef.current.month_year} has been successfully submitted.</p>
        
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-1">Reference Number</p>
          <p className="text-lg font-bold text-blue-600">VAC-{Date.now().toString().slice(-8)}</p>
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

  // Navigation Tabs - Using alternative icons
  const sections = [
    { id: "vaccine-utilization", label: "Vaccine Utilization", icon: Activity }, // Using Activity instead of Vaccine
    { id: "discarded-doses", label: "Discarded Doses", icon: AlertCircle },
    { id: "devices-utilization", label: "Devices Utilization", icon: Syringe },
    { id: "device-status", label: "Device Status", icon: Thermometer },
    { id: "signatures", label: "Signatures", icon: Shield },
  ];

  // Reusable Section Component
  const InputSection = React.memo(({ title, icon: Icon, children, subtitle }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="h-5 w-5 text-blue-600" />}
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  ));

  // Vaccine Row Component
  const VaccineRow = ({ vaccine, index, section }) => {
    const isDiscarded = section === "discarded_doses";
    
    return (
      <tr className={`border-b border-gray-200 ${vaccine.stock_out ? 'bg-red-50' : ''}`}>
        <td className="py-3 px-4 text-sm font-medium text-gray-900">
          {vaccine.name}
          {vaccine.stock_out && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Stock Out
            </span>
          )}
        </td>
        
        {!isDiscarded ? (
          <>
            <td className="py-3 px-4">
              <DebouncedInput
                type="number"
                defaultValue={vaccine.max_stock}
                onDebouncedChange={(value) => updateFormData("vaccine_utilization", index, "max_stock", value)}
                min="0"
                className="text-sm"
              />
            </td>
            <td className="py-3 px-4">
              <DebouncedInput
                type="number"
                defaultValue={vaccine.min_stock}
                onDebouncedChange={(value) => updateFormData("vaccine_utilization", index, "min_stock", value)}
                min="0"
                className="text-sm"
              />
            </td>
            <td className="py-3 px-4">
              <DebouncedInput
                type="number"
                defaultValue={vaccine.opening_balance}
                onDebouncedChange={(value) => {
                  updateFormData("vaccine_utilization", index, "opening_balance", value);
                }}
                min="0"
                className="text-sm"
              />
            </td>
            <td className="py-3 px-4">
              <DebouncedInput
                type="number"
                defaultValue={vaccine.received}
                onDebouncedChange={(value) => {
                  updateFormData("vaccine_utilization", index, "received", value);
                }}
                min="0"
                className="text-sm"
              />
            </td>
            <td className="py-3 px-4">
              <DebouncedInput
                type="number"
                defaultValue={vaccine.doses_opened}
                onDebouncedChange={(value) => {
                  updateFormData("vaccine_utilization", index, "doses_opened", value);
                }}
                min="0"
                className="text-sm"
              />
            </td>
            <td className="py-3 px-4">
              <DebouncedInput
                type="number"
                defaultValue={vaccine.returned}
                onDebouncedChange={(value) => {
                  updateFormData("vaccine_utilization", index, "returned", value);
                }}
                min="0"
                className="text-sm"
              />
            </td>
            <td className="py-3 px-4">
              <select
                defaultValue={vaccine.stock_out ? "Yes" : "No"}
                onChange={(e) => handleStockOutChange(index, e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </td>
          </>
        ) : (
          <>
            <td className="py-3 px-4">
              <DebouncedInput
                type="number"
                defaultValue={vaccine.expiry}
                onDebouncedChange={(value) => updateFormData("discarded_doses", index, "expiry", value)}
                min="0"
                className="text-sm"
              />
            </td>
            <td className="py-3 px-4">
              <DebouncedInput
                type="number"
                defaultValue={vaccine.breakage}
                onDebouncedChange={(value) => updateFormData("discarded_doses", index, "breakage", value)}
                min="0"
                className="text-sm"
              />
            </td>
            <td className="py-3 px-4">
              <DebouncedInput
                type="number"
                defaultValue={vaccine.vvm_change}
                onDebouncedChange={(value) => updateFormData("discarded_doses", index, "vvm_change", value)}
                min="0"
                className="text-sm"
              />
            </td>
            <td className="py-3 px-4">
              <DebouncedInput
                type="number"
                defaultValue={vaccine.frozen}
                onDebouncedChange={(value) => updateFormData("discarded_doses", index, "frozen", value)}
                min="0"
                className="text-sm"
              />
            </td>
            <td className="py-3 px-4">
              <DebouncedInput
                type="number"
                defaultValue={vaccine.label_removed}
                onDebouncedChange={(value) => updateFormData("discarded_doses", index, "label_removed", value)}
                min="0"
                className="text-sm"
              />
            </td>
          </>
        )}
      </tr>
    );
  };

  return (
    <PhcStaffLayout title="Vaccine Accountability">
      {showSuccessModal && <SuccessModal />}
      
      <div className="max-w-7xl mx-auto pb-8" key={immediateChangeKey}>
        {/* Header with Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Vaccine Utilization & Accountability Report</h1>
              <p className="text-blue-100">NHMIS Monthly Health Facility Vaccines Utilization Summary Form</p>
            </div>
            <FileSpreadsheet className="h-12 w-12 text-blue-200" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-sm text-blue-200">Health Facility</p>
              <p className="font-semibold">{auth?.user?.phc?.clinic_name}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-sm text-blue-200">LGA</p>
              <p className="font-semibold">{auth?.user?.phc?.lga?.name}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-sm text-blue-200">Ward</p>
              <p className="font-semibold">{auth?.user?.phc?.ward?.name}</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-sm text-blue-200">Reporting Month</p>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <select 
                  value={formDataRef.current.month_year}
                  onChange={(e) => updateFormData(null, null, 'month_year', e.target.value)}
                  className="bg-transparent border-none text-white font-semibold outline-none"
                >
                  <option value={currentMonth}>{currentMonth}</option>
                  <option value={new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long', year: 'numeric' })}>
                    {new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </option>
                </select>
              </div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="text-sm text-blue-200">Status</p>
              <div className="flex items-center">
                <div className={`h-3 w-3 rounded-full mr-2 ${existingReport ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                <p className="font-semibold">{existingReport ? 'Draft Available' : 'New Report'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports Panel */}
        {recentReports && recentReports.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowRecentReports(!showRecentReports)}
              className="w-full bg-gray-100 hover:bg-gray-200 rounded-lg p-4 flex items-center justify-between transition"
            >
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-700">Recent Reports ({recentReports.length})</span>
              </div>
              <span className="text-gray-500">{showRecentReports ? '▲' : '▼'}</span>
            </button>
            
            {showRecentReports && (
              <div className="mt-2 bg-white rounded-lg border border-gray-200 p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">{report.month_year}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === 'approved' ? 'bg-green-100 text-green-800' :
                          report.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">Submitted: {new Date(report.created_at).toLocaleDateString()}</p>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-700">{report.total_doses_used} doses used</span>
                        <a 
                          href={route('phc.vaccine-reports.show', report.id)}
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="flex overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <section.icon className="h-4 w-4" />
                <span>{section.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Vaccine Utilization Section */}
          {activeSection === "vaccine-utilization" && (
            <InputSection
              title="Vaccine Utilization Summary"
              icon={Activity} // Using Activity icon
              subtitle="Antigen (Doses)/Diluent (Vials) - Enter quantities for each vaccine"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Antigen/Diluent</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Max Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Min Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Opening Balance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quantity Received</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Doses Opened</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Returned to LGA/Facility</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Stock Out (Yes/No)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formDataRef.current.vaccine_utilization.map((vaccine, index) => (
                      <VaccineRow key={index} vaccine={vaccine} index={index} section="vaccine_utilization" />
                    ))}
                  </tbody>
                </table>
              </div>
            </InputSection>
          )}

          {/* Discarded Doses Section */}
          {activeSection === "discarded-doses" && (
            <InputSection
              title="Discarded Doses"
              icon={AlertCircle}
              subtitle="Quantity of doses discarded due to various reasons"
            >
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">Important:</p>
                    <p className="text-sm text-yellow-700">Record all discarded vaccines separately by reason (Expiry, Breakage, VVM Change, Frozen, Label Removed)</p>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Antigen/Diluent</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Expiry</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Breakage</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">VVM Change</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Frozen</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Label Removed</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formDataRef.current.discarded_doses.map((vaccine, index) => (
                      <VaccineRow key={index} vaccine={vaccine} index={index} section="discarded_doses" />
                    ))}
                  </tbody>
                </table>
              </div>
            </InputSection>
          )}

          {/* Devices Utilization Section */}
          {activeSection === "devices-utilization" && (
            <InputSection
              title="Monthly Devices/Other Materials Utilization Summary"
              icon={Syringe}
              subtitle="Track usage of syringes, safety boxes, and other materials"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Device</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Opening Balance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Received</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Used</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ending Balance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Returned to LGA</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formDataRef.current.devices_utilization.map((device, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{device.name}</td>
                        <td className="py-3 px-4">
                          <DebouncedInput
                            type="number"
                            defaultValue={device.opening_balance}
                            onDebouncedChange={(value) => {
                              updateFormData("devices_utilization", index, "opening_balance", value);
                              calculateEndingBalance(index);
                            }}
                            min="0"
                            className="text-sm"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <DebouncedInput
                            type="number"
                            defaultValue={device.received}
                            onDebouncedChange={(value) => {
                              updateFormData("devices_utilization", index, "received", value);
                              calculateEndingBalance(index);
                            }}
                            min="0"
                            className="text-sm"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <DebouncedInput
                            type="number"
                            defaultValue={device.used}
                            onDebouncedChange={(value) => {
                              updateFormData("devices_utilization", index, "used", value);
                              calculateEndingBalance(index);
                            }}
                            min="0"
                            className="text-sm"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <DebouncedInput
                            type="number"
                            defaultValue={device.ending_balance}
                            onDebouncedChange={(value) => updateFormData("devices_utilization", index, "ending_balance", value)}
                            min="0"
                            className="text-sm"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <DebouncedInput
                            type="number"
                            defaultValue={device.returned}
                            onDebouncedChange={(value) => updateFormData("devices_utilization", index, "returned", value)}
                            min="0"
                            className="text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </InputSection>
          )}

          {/* Device Status Section */}
          {activeSection === "device-status" && (
            <InputSection
              title="Monthly Devices Status Report"
              icon={Thermometer}
              subtitle="Status of cold chain equipment and other devices"
            >
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Devices</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Number Functional</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Number Non-functional</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formDataRef.current.device_status.map((device, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{device.name}</td>
                        <td className="py-3 px-4">
                          <DebouncedInput
                            type="number"
                            defaultValue={device.quantity}
                            onDebouncedChange={(value) => updateFormData("device_status", index, "quantity", value)}
                            min="0"
                            className="text-sm"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <DebouncedInput
                            type="number"
                            defaultValue={device.functional}
                            onDebouncedChange={(value) => updateFormData("device_status", index, "functional", value)}
                            min="0"
                            className="text-sm"
                          />
                        </td>
                        <td className="py-3 px-4">
                          <DebouncedInput
                            type="number"
                            defaultValue={device.non_functional}
                            onDebouncedChange={(value) => updateFormData("device_status", index, "non_functional", value)}
                            min="0"
                            className="text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </InputSection>
          )}

          {/* Signatures Section */}
          {activeSection === "signatures" && (
            <InputSection
              title="Signatures & Submission"
              icon={Shield}
              subtitle="Complete the form with required signatures"
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Health Officer/RI Focal Person</h4>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                      <DebouncedInput
                        type="text"
                        placeholder="Enter full name"
                        defaultValue={formDataRef.current.health_officer_name}
                        onDebouncedChange={(value) => updateFormData(null, null, "health_officer_name", value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Signature & Date *</label>
                      <DebouncedInput
                        type="text"
                        placeholder="Signature and date"
                        defaultValue={formDataRef.current.health_officer_signature}
                        onDebouncedChange={(value) => updateFormData(null, null, "health_officer_signature", value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Head of Unit</h4>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                      <DebouncedInput
                        type="text"
                        placeholder="Enter full name"
                        defaultValue={formDataRef.current.head_of_unit_name}
                        onDebouncedChange={(value) => updateFormData(null, null, "head_of_unit_name", value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Signature & Date *</label>
                      <DebouncedInput
                        type="text"
                        placeholder="Signature and date"
                        defaultValue={formDataRef.current.head_of_unit_signature}
                        onDebouncedChange={(value) => updateFormData(null, null, "head_of_unit_signature", value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Phone Number *</label>
                    <DebouncedInput
                      type="text"
                      placeholder="Enter phone number"
                      defaultValue={formDataRef.current.phone_number}
                      onDebouncedChange={(value) => updateFormData(null, null, "phone_number", value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Submission Date *</label>
                    <input
                      type="date"
                      value={formDataRef.current.submission_date}
                      onChange={(e) => updateFormData(null, null, "submission_date", e.target.value)}
                      required
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-blue-600 mr-2" />
                    <p className="text-sm text-blue-800">
                      By submitting this form, you certify that all information provided is accurate and complete.
                    </p>
                  </div>
                </div>
              </div>
            </InputSection>
          )}

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex space-x-3">
              {sections.map((section, index) => {
                const currentIndex = sections.findIndex(s => s.id === activeSection);
                if (index < currentIndex) {
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                    >
                      ← {section.label}
                    </button>
                  );
                }
                return null;
              })}
            </div>

            <div className="flex space-x-4">
              {/* Save Draft Button */}
              <button
                type="button"
                onClick={saveDraft}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition duration-200 flex items-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>Save Draft</span>
              </button>

              {/* Continue/Submit Button */}
              {activeSection !== "signatures" ? (
                <button
                  type="button"
                  onClick={() => {
                    const currentIndex = sections.findIndex(s => s.id === activeSection);
                    if (currentIndex < sections.length - 1) {
                      setActiveSection(sections[currentIndex + 1].id);
                    }
                  }}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200 flex items-center space-x-2"
                >
                  <span>Continue</span>
                  <span>→</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={processing}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting Report...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      <span>Submit Vaccine Report</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Status Indicator */}
          {isDraftMode && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="text-sm text-yellow-800">
                    You have an unsaved draft. Changes are automatically saved as you work.
                  </span>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  DRAFT MODE
                </span>
              </div>
            </div>
          )}
        </form>
      </div>
    </PhcStaffLayout>
  );
}