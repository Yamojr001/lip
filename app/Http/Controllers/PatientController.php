<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Lga;
use App\Models\Ward;
use App\Models\Phc;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class PatientController extends Controller
{
    /**
     * Display all patients for this PHC.
     */
    public function index(Request $request)
    {
        $query = Patient::query()->where('phc_id', auth()->user()->phc_id);

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('woman_name', 'like', "%{$search}%")
                    ->orWhere('unique_id', 'like', "%{$search}%")
                    ->orWhere('community', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        $patients = $query->with(['lga:id,name', 'ward:id,name', 'healthFacility:id,clinic_name'])
                         ->latest()
                         ->paginate(10);
        
        $lgas = Lga::all(['id', 'name', 'code']);
        $wards = Ward::all(['id', 'lga_id', 'name', 'code']);
        $phcFacilities = Phc::all(['id', 'ward_id', 'clinic_name']);

        return Inertia::render('Phc/Dashboard', [
            'patients' => $patients,
            'lgas' => $lgas,
            'wards' => $wards,
            'phcFacilities' => $phcFacilities,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Display all patients across facilities for cross-facility editing.
     */
    public function allPatients(Request $request)
    {
        $query = Patient::query();
        
        // Only show patients from the same state as the user's PHC
        $userPhc = auth()->user()->phc;
        if ($userPhc) {
            $query->whereHas('healthFacility.ward.lga.state', function($q) use ($userPhc) {
                $q->where('id', $userPhc->ward->lga->state_id);
            });
        }

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('woman_name', 'like', "%{$search}%")
                    ->orWhere('unique_id', 'like', "%{$search}%")
                    ->orWhere('community', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        $patients = $query->with(['lga:id,name', 'ward:id,name', 'healthFacility:id,clinic_name'])
                         ->latest()
                         ->paginate(10);

        return Inertia::render('Phc/AllPatients/Index', [
            'patients' => $patients,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * View a single patient record for cross-facility access.
     */
    public function showAllPatient($id)
    {
        $patient = Patient::with(['lga:id,name', 'ward:id,name', 'healthFacility:id,clinic_name'])
                         ->findOrFail($id);
        
        $isCrossFacility = $patient->health_facility_id != auth()->user()->phc_id;
        
        return Inertia::render('Phc/AllPatients/View', [
            'patient' => $patient,
            'isCrossFacility' => $isCrossFacility
        ]);
    }

    /**
     * Edit a patient record for cross-facility access.
     */
    public function editAllPatient($id)
    {
        $patient = Patient::findOrFail($id);
        
        $isCrossFacility = $patient->health_facility_id != auth()->user()->phc_id;
        $lgas = Lga::all(['id', 'name']);
        $wards = Ward::all(['id', 'lga_id', 'name']);
        $phcFacilities = Phc::all(['id', 'ward_id', 'clinic_name']);
        
        return Inertia::render('Phc/AllPatients/Edit', [
            'patient' => $patient,
            'lgas' => $lgas,
            'wards' => $wards,
            'phcFacilities' => $phcFacilities,
            'isCrossFacility' => $isCrossFacility
        ]);
    }

    /**
     * Update patient record for cross-facility access.
     */
    public function updateAllPatient(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);
        
        // For cross-facility patients, preserve original facility
        $isCrossFacility = $patient->health_facility_id != auth()->user()->phc_id;
        
        $data = $this->validatePatientData($request, true);
        
        // If cross-facility, don't change the original facility
        if ($isCrossFacility) {
            $data['health_facility_id'] = $patient->health_facility_id;
            $data['lga_id'] = $patient->lga_id;
            $data['ward_id'] = $patient->ward_id;
        }
        
        $data = $this->convertBooleanFields($data);
        $patient->update($data);

        return back()->with('success', 'Patient updated successfully!');
    }

    /**
     * Store a new patient record.
     */
    public function store(Request $request)
    {
        $user = auth()->user();
        
        // Check if user has a PHC assigned
        if (!$user->phc_id) {
            return redirect()->back()
                ->with('error', 'Your account is not associated with any PHC facility. Please contact administrator.');
        }

        $lga = Lga::find($request->lga_id);
        $ward = Ward::find($request->ward_id);

        if (!$lga || !$ward) {
            return redirect()->back()->with('error', 'Invalid LGA or Ward selected.');
        }

        $data = $this->validatePatientData($request);

        return DB::transaction(function () use ($data, $lga, $ward, $user) {
            
            // Unique ID Generation: LGA_CODE/WARD_CODE/SERIAL
            $lga_code = strtoupper(substr($lga->code ?? $lga->name, 0, 3));
            $ward_code = strtoupper(substr($ward->code ?? $ward->name, 0, 3));
            
            $serial = str_pad(
                Patient::where('lga_id', $data['lga_id'])->where('ward_id', $data['ward_id'])->count() + 1,
                3,
                '0',
                STR_PAD_LEFT
            );
            
            $data['unique_id'] = "{$lga_code}/{$ward_code}/{$serial}";
            $data['phc_id'] = $user->phc_id;

            // Handle boolean conversions
            $data = $this->convertBooleanFields($data);

            // Auto-calculate next visit dates if not provided
            for ($i = 1; $i <= 8; $i++) {
                $visitDateField = "anc_visit_{$i}_date";
                $nextVisitField = "anc_visit_{$i}_next_date";
                
                if (!empty($data[$visitDateField]) && empty($data[$nextVisitField])) {
                    $visitDate = Carbon::parse($data[$visitDateField]);
                    $nextVisitDate = $visitDate->copy()->addDays(28); // 4 weeks later
                    $data[$nextVisitField] = $nextVisitDate->format('Y-m-d');
                }
            }

            $patient = Patient::create($data);

            return redirect()->route('phc.create-patient')
                ->with('success', 'Patient registered successfully! Unique ID: ' . $data['unique_id']);
        });
    }

    /**
     * View a single patient record.
     */
    public function show($id)
    {
        $patient = Patient::where('phc_id', auth()->user()->phc_id)
                         ->with(['lga:id,name', 'ward:id,name', 'healthFacility:id,clinic_name'])
                         ->findOrFail($id);
        
        return Inertia::render('Phc/ViewPatient', [
            'patient' => $patient
        ]);
    }

    /**
     * Edit a patient record.
     */
    public function edit($id)
    {
        $patient = Patient::where('phc_id', auth()->user()->phc_id)->findOrFail($id);
        
        $lgas = Lga::all(['id', 'name']);
        $wards = Ward::all(['id', 'lga_id', 'name']);
        $phcFacilities = Phc::all(['id', 'ward_id', 'clinic_name']);
        
        return Inertia::render('Phc/EditPatient', [
            'patient' => $patient,
            'lgas' => $lgas,
            'wards' => $wards,
            'phcFacilities' => $phcFacilities
        ]);
    }

    /**
     * Update patient record.
     */
    public function update(Request $request, $id)
    {
        $patient = Patient::where('phc_id', auth()->user()->phc_id)->findOrFail($id);
        
        $data = $this->validatePatientData($request, true);
        $data = $this->convertBooleanFields($data);

        $patient->update($data);

        return back()->with('success', 'Patient updated successfully!');
    }

    /**
     * Delete a patient record.
     */
    public function destroy($id)
    {
        $patient = Patient::where('phc_id', auth()->user()->phc_id)->findOrFail($id);
        $patient->delete();

        return back()->with('success', 'Patient record deleted successfully!');
    }

    /**
     * Validate patient data
     */
    private function validatePatientData(Request $request, $update = false)
    {
        $rules = [
            // Personal Information
            'woman_name' => 'required|string|max:255',
            'age' => 'required|integer|between:15,50',
            'literacy_status' => 'required|in:Literate,Not literate',
            'phone_number' => 'nullable|string|max:20',
            'husband_name' => 'nullable|string|max:255',
            'husband_phone' => 'nullable|string|max:20',
            'community' => 'required|string|max:255',
            'address' => 'required|string',
            'lga_id' => 'required|exists:lgas,id',
            'ward_id' => 'required|exists:wards,id',
            'health_facility_id' => 'required|exists:phcs,id',

            // Medical Information
            'gravida' => 'nullable|integer|min:0',
            'age_of_pregnancy_weeks' => 'nullable|integer|min:0|max:45',
            'parity' => 'nullable|integer|min:0',
            'date_of_registration' => 'required|date',
            'edd' => 'required|date|after_or_equal:date_of_registration',
            'fp_interest' => 'nullable|in:Yes,No',

            // ANC Visits 1-8
            'additional_anc_count' => 'nullable|integer|min:0',

            // Delivery Details
            'place_of_delivery' => 'nullable|in:Home,Health Facility,Traditional Attendant',
            'delivery_kits_received' => 'boolean',
            'type_of_delivery' => 'nullable|in:Normal (Vaginal),Cesarean Section,Assisted,Breech',
            'complication_if_any' => 'nullable|in:No complication,Hemorrhage,Eclampsia,Sepsis,Other',
            'delivery_outcome' => 'nullable|in:Live birth,Stillbirth,Miscarriage',
            'mother_alive' => 'nullable|in:Yes,No',
            'mother_status' => 'nullable|in:Admitted,Referred to other facility,Discharged home',
            'date_of_delivery' => 'nullable|date',

            // Postnatal Checkup
            'pnc_visit_1' => 'nullable|date',
            'pnc_visit_2' => 'nullable|date',
            'pnc_visit_3' => 'nullable|date',

            // Insurance
            'health_insurance_status' => 'nullable|in:Yes,No,Not Enrolled',
            'insurance_type' => 'nullable|in:Kachima,NHIS,Others',
            'insurance_other_specify' => 'nullable|string|max:255',
            'insurance_satisfaction' => 'boolean',

            // Family Planning
            'fp_using' => 'boolean',
            'fp_male_condom' => 'boolean',
            'fp_female_condom' => 'boolean',
            'fp_pill' => 'boolean',
            'fp_injectable' => 'boolean',
            'fp_implant' => 'boolean',
            'fp_iud' => 'boolean',
            'fp_other' => 'boolean',
            'fp_other_specify' => 'nullable|string|max:255',

            // Child Immunization
            'child_name' => 'nullable|string|max:255',
            'child_dob' => 'nullable|date',
            'child_sex' => 'nullable|in:Male,Female',

            // Notes
            'remark' => 'nullable|string',
            'comments' => 'nullable|string',
        ];

        // Add ANC visit rules for visits 1-8 (including next visit date)
        for ($i = 1; $i <= 8; $i++) {
            $rules["anc_visit_{$i}_date"] = 'nullable|date';
            $rules["anc_visit_{$i}_next_date"] = 'nullable|date|after_or_equal:anc_visit_' . $i . '_date';
            $rules["tracked_before_anc{$i}"] = 'boolean';
            $rules["anc{$i}_paid"] = 'boolean';
            $rules["anc{$i}_payment_amount"] = 'nullable|numeric|min:0';
            
            // Services
            $rules["anc{$i}_urinalysis"] = 'boolean';
            $rules["anc{$i}_iron_folate"] = 'boolean';
            $rules["anc{$i}_mms"] = 'boolean';
            $rules["anc{$i}_sp"] = 'boolean';
            $rules["anc{$i}_sba"] = 'boolean';
            
            // HIV Testing
            $rules["anc{$i}_hiv_test"] = 'nullable|in:Yes,No';
            $rules["anc{$i}_hiv_result_received"] = 'boolean';
            $rules["anc{$i}_hiv_result"] = 'nullable|in:Positive,Negative';
        }

        // Add vaccine rules
        $vaccines = [
            'bcg', 'hep0', 'opv0', 'penta1', 'pcv1', 'opv1', 'rota1', 'ipv1',
            'penta2', 'pcv2', 'rota2', 'opv2', 'penta3', 'pcv3', 'opv3', 'rota3',
            'ipv2', 'measles', 'yellow_fever', 'vitamin_a', 'mcv2'
        ];

        foreach ($vaccines as $vaccine) {
            $rules["{$vaccine}_received"] = 'boolean';
            $rules["{$vaccine}_date"] = 'nullable|date';
        }

        return $request->validate($rules);
    }

    /**
     * Convert boolean fields
     */
    private function convertBooleanFields($data)
    {
        // Generate ANC boolean fields
        $ancBooleanFields = [];
        for ($i = 1; $i <= 8; $i++) {
            $ancBooleanFields = array_merge($ancBooleanFields, [
                "tracked_before_anc{$i}",
                "anc{$i}_paid",
                "anc{$i}_urinalysis",
                "anc{$i}_iron_folate", 
                "anc{$i}_mms", 
                "anc{$i}_sp", 
                "anc{$i}_sba", 
                "anc{$i}_hiv_result_received"
            ]);
        }
        
        $otherBooleanFields = [
            // Delivery & Insurance
            'delivery_kits_received', 'insurance_satisfaction',
            
            // Family Planning
            'fp_using', 'fp_male_condom', 'fp_female_condom', 'fp_pill', 
            'fp_injectable', 'fp_implant', 'fp_iud', 'fp_other',
            
            // Vaccines
            'bcg_received', 'hep0_received', 'opv0_received', 'penta1_received',
            'pcv1_received', 'opv1_received', 'rota1_received', 'ipv1_received',
            'penta2_received', 'pcv2_received', 'rota2_received', 'opv2_received',
            'penta3_received', 'pcv3_received', 'opv3_received', 'rota3_received',
            'ipv2_received', 'measles_received', 'yellow_fever_received',
            'vitamin_a_received', 'mcv2_received'
        ];

        $booleanFields = array_merge($ancBooleanFields, $otherBooleanFields);

        foreach ($booleanFields as $field) {
            if (array_key_exists($field, $data)) {
                $data[$field] = (bool)($data[$field] ?? false);
            }
        }

        return $data;
    }
}