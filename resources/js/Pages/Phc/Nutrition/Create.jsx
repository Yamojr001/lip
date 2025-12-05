import React, { useState, useEffect } from "react";
import { usePage, router, useForm } from "@inertiajs/react";
import PhcStaffLayout from "@/Layouts/PhcStaffLayout";
import { 
    Save, 
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Users,
    Baby,
    Activity,
    Pill,
    Heart,
    ClipboardCheck,
    Calendar,
    Apple,
    FileText
} from "lucide-react";

export default function NutritionCreate() {
    const { years, months, currentYear, currentMonth } = usePage().props;
    
    const [formData, setFormData] = useState({
        // Month/Year Selection
        year: currentYear || new Date().getFullYear(),
        month: currentMonth || '',
        
        // Section 1: Total Children Screened
        total_children_screened: 0,
        
        // Age 6-23 months (by gender)
        age_6_23_male_screened: 0,
        age_6_23_female_screened: 0,
        
        // Age 24-59 months (by gender)
        age_24_59_male_screened: 0,
        age_24_59_female_screened: 0,
        
        // Section 2: Normal Children Identified
        age_6_23_male_normal: 0,
        age_6_23_female_normal: 0,
        age_24_59_male_normal: 0,
        age_24_59_female_normal: 0,
        
        // Section 3: MAM Children Identified
        age_6_23_male_mam: 0,
        age_6_23_female_mam: 0,
        age_24_59_male_mam: 0,
        age_24_59_female_mam: 0,
        
        // Section 4: SAM Children Identified
        age_6_23_male_sam: 0,
        age_6_23_female_sam: 0,
        age_24_59_male_sam: 0,
        age_24_59_female_sam: 0,
        
        // Section 5: SAM Management
        new_sam_this_outreach: 0,
        sam_referred_otp: 0,
        
        // Section 6: Oedema Cases
        oedema_sam_complications_male: 0,
        oedema_sam_complications_female: 0,
        oedema_total_male: 0,
        oedema_total_female: 0,
        
        // Section 7: SAM with Complications to SC
        sam_complications_male_sc: 0,
        sam_complications_female_sc: 0,
        
        // Section 8: Albendazole
        albendazole_12_23_male: 0,
        albendazole_12_23_female: 0,
        albendazole_24_59_male: 0,
        albendazole_24_59_female: 0,
        
        // Section 9: Vitamin A Supplementation (VAS)
        vas_6_11_first_dose_male: 0,
        vas_6_11_first_dose_female: 0,
        vas_12_59_second_dose_male: 0,
        vas_12_59_second_dose_female: 0,
        
        // Section 10: Nutrition Products
        rutf_given: 0,
        mnp_given: 0,
        
        // Section 11: Breastfeeding & Counseling
        exclusive_breastfeeding_0_6: 0,
        miycf_counselled_pregnant_women: 0,
        miycf_counselled_caregivers: 0,
        
        // Comments
        comments: '',
        
        // Submission
        submitted: false,
    });
    
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Calculate totals
    const calculateTotals = () => {
        const totals = {
            age_6_23_total_screened: formData.age_6_23_male_screened + formData.age_6_23_female_screened,
            age_24_59_total_screened: formData.age_24_59_male_screened + formData.age_24_59_female_screened,
            total_normal: formData.age_6_23_male_normal + formData.age_6_23_female_normal + 
                         formData.age_24_59_male_normal + formData.age_24_59_female_normal,
            total_mam: formData.age_6_23_male_mam + formData.age_6_23_female_mam + 
                      formData.age_24_59_male_mam + formData.age_24_59_female_mam,
            total_sam: formData.age_6_23_male_sam + formData.age_6_23_female_sam + 
                      formData.age_24_59_male_sam + formData.age_24_59_female_sam,
            total_oedema: formData.oedema_total_male + formData.oedema_total_female,
        };
        
        return totals;
    };
    
    const totals = calculateTotals();
    
    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };
    
    const handleSubmit = (e, submitType = 'draft') => {
        e.preventDefault();
        setIsSubmitting(true);
        
        const dataToSubmit = {
            ...formData,
            submitted: submitType === 'submit'
        };
        
        router.post(route('phc.nutrition.reports.store'), dataToSubmit, {
            onSuccess: () => {
                setIsSubmitting(false);
                // Success handled by Inertia
            },
            onError: (errors) => {
                setErrors(errors);
                setIsSubmitting(false);
            }
        });
    };
    
    // Reusable Input Component
    const NumberInput = ({ label, name, value, onChange, required = true, min = 0, step = 1, helpText = null }) => (
        <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type="number"
                name={name}
                value={value}
                onChange={(e) => onChange(name, parseInt(e.target.value) || 0)}
                min={min}
                step={step}
                required={required}
                className={`w-full p-2 border ${errors[name] ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition`}
            />
            {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
            {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
        </div>
    );
    
    // Age-Gender Section Component
    const AgeGenderSection = ({ title, prefix, showTotal = true }) => {
        const maleValue = formData[`${prefix}_male`];
        const femaleValue = formData[`${prefix}_female`];
        const total = maleValue + femaleValue;
        
        return (
            <div className="bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <NumberInput
                        label="Male"
                        name={`${prefix}_male`}
                        value={maleValue}
                        onChange={handleChange}
                    />
                    <NumberInput
                        label="Female"
                        name={`${prefix}_female`}
                        value={femaleValue}
                        onChange={handleChange}
                    />
                    {showTotal && (
                        <div className="bg-white p-3 rounded border flex flex-col justify-center">
                            <p className="text-sm text-gray-600 font-medium">Total</p>
                            <p className="text-lg font-bold text-green-600">{total}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };
    
    // Section Header Component
    const SectionHeader = ({ icon: Icon, title, subtitle, color = "green" }) => {
        const colors = {
            green: 'text-green-600',
            blue: 'text-blue-600',
            red: 'text-red-600',
            yellow: 'text-yellow-600',
            purple: 'text-purple-600',
            pink: 'text-pink-600',
            orange: 'text-orange-600',
            indigo: 'text-indigo-600'
        };
        
        return (
            <div className="flex items-center gap-2 mb-4">
                <div className={`p-2 rounded-lg bg-${color}-50`}>
                    <Icon className={`h-5 w-5 ${colors[color]}`} />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
                    {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                </div>
            </div>
        );
    };
    
    return (
        <PhcStaffLayout title="Create Nutrition Report">
            <div className="space-y-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Create Monthly Nutrition Report
                        </h1>
                        <p className="text-gray-600">
                            Enter nutrition screening data for the selected month
                        </p>
                    </div>
                    <a
                        href={route('phc.nutrition.reports.index')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
                    >
                        <ArrowLeft size={18} />
                        Back to Reports
                    </a>
                </div>
                
                {/* Summary Stats Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-500">Total Screened</p>
                            <p className="text-lg font-bold text-green-600">{formData.total_children_screened}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">6-23 Months</p>
                            <p className="text-lg font-bold text-blue-600">{totals.age_6_23_total_screened}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">24-59 Months</p>
                            <p className="text-lg font-bold text-blue-600">{totals.age_24_59_total_screened}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Normal</p>
                            <p className="text-lg font-bold text-green-600">{totals.total_normal}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">MAM</p>
                            <p className="text-lg font-bold text-yellow-600">{totals.total_mam}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">SAM</p>
                            <p className="text-lg font-bold text-red-600">{totals.total_sam}</p>
                        </div>
                    </div>
                </div>
                
                <form onSubmit={(e) => handleSubmit(e, 'draft')} className="space-y-8">
                    {/* Month/Year Selection */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <SectionHeader 
                            icon={Calendar}
                            title="Month & Year Selection"
                            color="blue"
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Year <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.year}
                                    onChange={(e) => handleChange('year', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                    required
                                >
                                    <option value="">Select Year</option>
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Month <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.month}
                                    onChange={(e) => handleChange('month', e.target.value)}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                    required
                                >
                                    <option value="">Select Month</option>
                                    {months.map(month => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>
                                {errors.month && <p className="text-red-500 text-xs mt-1">{errors.month}</p>}
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 1: Total Children Screened */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <SectionHeader 
                            icon={Users}
                            title="1. Total Children Screened"
                            color="green"
                        />
                        
                        <div className="space-y-6">
                            <NumberInput
                                label="Total Children Screened (6-59 months)"
                                name="total_children_screened"
                                value={formData.total_children_screened}
                                onChange={handleChange}
                                helpText="Total number of children screened for malnutrition aged 6-59 months"
                            />
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-3">Age 6-23 Months</h4>
                                    <div className="space-y-4">
                                        <NumberInput
                                            label="Male (6-23 months)"
                                            name="age_6_23_male_screened"
                                            value={formData.age_6_23_male_screened}
                                            onChange={handleChange}
                                        />
                                        <NumberInput
                                            label="Female (6-23 months)"
                                            name="age_6_23_female_screened"
                                            value={formData.age_6_23_female_screened}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-3">Age 24-59 Months</h4>
                                    <div className="space-y-4">
                                        <NumberInput
                                            label="Male (24-59 months)"
                                            name="age_24_59_male_screened"
                                            value={formData.age_24_59_male_screened}
                                            onChange={handleChange}
                                        />
                                        <NumberInput
                                            label="Female (24-59 months)"
                                            name="age_24_59_female_screened"
                                            value={formData.age_24_59_female_screened}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 2: Normal Children Identified */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <SectionHeader 
                            icon={CheckCircle}
                            title="2. Normal Children Identified"
                            subtitle="Children with normal nutritional status"
                            color="blue"
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 6-23 Months</h4>
                                <div className="space-y-4">
                                    <NumberInput
                                        label="Male - Normal"
                                        name="age_6_23_male_normal"
                                        value={formData.age_6_23_male_normal}
                                        onChange={handleChange}
                                    />
                                    <NumberInput
                                        label="Female - Normal"
                                        name="age_6_23_female_normal"
                                        value={formData.age_6_23_female_normal}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 24-59 Months</h4>
                                <div className="space-y-4">
                                    <NumberInput
                                        label="Male - Normal"
                                        name="age_24_59_male_normal"
                                        value={formData.age_24_59_male_normal}
                                        onChange={handleChange}
                                    />
                                    <NumberInput
                                        label="Female - Normal"
                                        name="age_24_59_female_normal"
                                        value={formData.age_24_59_female_normal}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 3: MAM Children Identified */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <SectionHeader 
                            icon={AlertCircle}
                            title="3. MAM Children Identified"
                            subtitle="Moderate Acute Malnutrition"
                            color="yellow"
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 6-23 Months</h4>
                                <AgeGenderSection
                                    title=""
                                    prefix="age_6_23_mam"
                                />
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 24-59 Months</h4>
                                <AgeGenderSection
                                    title=""
                                    prefix="age_24_59_mam"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 4: SAM Children Identified */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <SectionHeader 
                            icon={AlertCircle}
                            title="4. SAM Children Identified"
                            subtitle="Severe Acute Malnutrition"
                            color="red"
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 6-23 Months</h4>
                                <AgeGenderSection
                                    title=""
                                    prefix="age_6_23_sam"
                                />
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 24-59 Months</h4>
                                <AgeGenderSection
                                    title=""
                                    prefix="age_24_59_sam"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 5: SAM Management */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <SectionHeader 
                            icon={Activity}
                            title="5. SAM Management"
                            color="purple"
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <NumberInput
                                label="New SAM in this outreach (no filter)"
                                name="new_sam_this_outreach"
                                value={formData.new_sam_this_outreach}
                                onChange={handleChange}
                            />
                            
                            <NumberInput
                                label="Number of SAM referred to OTP"
                                name="sam_referred_otp"
                                value={formData.sam_referred_otp}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    
                    {/* Section 6: Oedema Cases */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <SectionHeader 
                            icon={Baby}
                            title="6. Oedema Cases"
                            color="orange"
                        />
                        
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Oedema/SAM with complications referred to SC</h4>
                                <AgeGenderSection
                                    title=""
                                    prefix="oedema_sam_complications"
                                />
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Oedema Total (by gender)</h4>
                                <AgeGenderSection
                                    title=""
                                    prefix="oedema_total"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 7: SAM with Complications to SC */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <SectionHeader 
                            icon={ClipboardCheck}
                            title="7. SAM with Complications referred to Stabilization Center"
                            subtitle="Filtered by gender"
                            color="red"
                        />
                        
                        <div className="space-y-4">
                            <NumberInput
                                label="Male - SAM with complications to SC"
                                name="sam_complications_male_sc"
                                value={formData.sam_complications_male_sc}
                                onChange={handleChange}
                            />
                            <NumberInput
                                label="Female - SAM with complications to SC"
                                name="sam_complications_female_sc"
                                value={formData.sam_complications_female_sc}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    
                    {/* Section 8: Albendazole */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <SectionHeader 
                            icon={Pill}
                            title="8. Albendazole Administration"
                            color="green"
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 12-23 Months</h4>
                                <AgeGenderSection
                                    title="Filtered by gender"
                                    prefix="albendazole_12_23"
                                />
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 24-59 Months</h4>
                                <AgeGenderSection
                                    title="Filtered by gender"
                                    prefix="albendazole_24_59"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 9: Vitamin A Supplementation (VAS) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <SectionHeader 
                            icon={Heart}
                            title="9. Vitamin A Supplementation (VAS)"
                            color="pink"
                        />
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 6-11 Months (1st Dose)</h4>
                                <AgeGenderSection
                                    title="Filtered by gender"
                                    prefix="vas_6_11_first_dose"
                                />
                            </div>
                            
                            <div>
                                <h4 className="font-medium text-gray-700 mb-3">Age 12-59 Months (2nd Dose)</h4>
                                <AgeGenderSection
                                    title="Filtered by gender"
                                    prefix="vas_12_59_second_dose"
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Section 10: Nutrition Products */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <SectionHeader 
                            icon={Apple}
                            title="10. Nutrition Products Distribution"
                            color="indigo"
                        />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <NumberInput
                                label="Number of children given RUTF (no filter)"
                                name="rutf_given"
                                value={formData.rutf_given}
                                onChange={handleChange}
                                helpText="Ready-to-Use Therapeutic Food"
                            />
                            
                            <NumberInput
                                label="Number of children given MNP (no filter)"
                                name="mnp_given"
                                value={formData.mnp_given}
                                onChange={handleChange}
                                helpText="Multiple Micronutrient Powder"
                            />
                        </div>
                    </div>
                    
                    {/* Section 11: Breastfeeding & Counseling */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <SectionHeader 
                            icon={Baby}
                            title="11. Breastfeeding & MIYCF Counseling"
                            subtitle="Maternal Infant and Young Child Feeding"
                            color="blue"
                        />
                        
                        <div className="space-y-6">
                            <NumberInput
                                label="Total number of children 0-6 months exclusively breastfed (no filter)"
                                name="exclusive_breastfeeding_0_6"
                                value={formData.exclusive_breastfeeding_0_6}
                                onChange={handleChange}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <NumberInput
                                    label="Number of pregnant women counselled on MIYCF"
                                    name="miycf_counselled_pregnant_women"
                                    value={formData.miycf_counselled_pregnant_women}
                                    onChange={handleChange}
                                />
                                
                                <NumberInput
                                    label="Number of other caregivers counselled on MIYCF"
                                    name="miycf_counselled_caregivers"
                                    value={formData.miycf_counselled_caregivers}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                    
                    {/* Comments */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <SectionHeader 
                            icon={FileText}
                            title="Additional Comments"
                            color="gray"
                        />
                        <textarea
                            value={formData.comments}
                            onChange={(e) => handleChange('comments', e.target.value)}
                            rows="4"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                            placeholder="Enter any additional comments, observations, or challenges faced during this reporting period..."
                        />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="text-sm text-gray-600">
                                <p>All fields marked with <span className="text-red-500">*</span> are required</p>
                                <p className="text-xs mt-1">Ensure all data is accurate before submission</p>
                            </div>
                            
                            <div className="flex gap-3">
                                <a
                                    href={route('phc.nutrition.reports.index')}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </a>
                                
                                <button
                                    type="button"
                                    onClick={(e) => handleSubmit(e, 'draft')}
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} />
                                            Save as Draft
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    type="button"
                                    onClick={(e) => handleSubmit(e, 'submit')}
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={16} />
                                            Save & Submit Report
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-yellow-800 font-medium">Important Notes:</p>
                                    <ul className="text-xs text-yellow-700 mt-1 list-disc pl-5 space-y-1">
                                        <li>Draft reports can be edited later</li>
                                        <li>Submitted reports cannot be edited</li>
                                        <li>Ensure all data is accurate before final submission</li>
                                        <li>Reports are due by the 5th of each month for the previous month</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </PhcStaffLayout>
    );
}