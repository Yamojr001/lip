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

class PhcStaffController extends Controller
{
    /**
     * Show the form for creating a new patient record.
     */
    public function create()
    {
        $lgas = Lga::all(['id', 'name', 'code']);
        $wards = Ward::all(['id', 'lga_id', 'name', 'code']);
        $phcFacilities = Phc::all(['id', 'ward_id', 'clinic_name']);

        return Inertia::render('Phc/CreatePatient', [
            'lgas' => $lgas,
            'wards' => $wards,
            'phcFacilities' => $phcFacilities,
        ]);
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

            $patient = Patient::create($data);

            return redirect()->route('phc.create-patient')
                ->with('success', 'Patient registered successfully! Unique ID: ' . $data['unique_id']);
        });
    }

    /**
     * Show the form for editing the specified patient.
     */
    public function edit($id)
    {
        $patient = Patient::where('phc_id', auth()->user()->phc_id)
                         ->with(['lga', 'ward', 'healthFacility'])
                         ->findOrFail($id);

        $lgas = Lga::all(['id', 'name', 'code']);
        $wards = Ward::all(['id', 'lga_id', 'name', 'code']);
        $phcFacilities = Phc::all(['id', 'ward_id', 'clinic_name']);

        return Inertia::render('Phc/EditPatient', [
            'patient' => $patient,
            'lgas' => $lgas,
            'wards' => $wards,
            'phcFacilities' => $phcFacilities,
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
     * Display all patients for this PHC (Dashboard).
     */
    public function index(Request $request)
    {
        $phcId = auth()->user()->phc_id;
        $query = Patient::query()->where('phc_id', $phcId);

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('woman_name', 'like', "%{$search}%")
                    ->orWhere('unique_id', 'like', "%{$search}%")
                    ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        $patients = $query->with(['lga:id,name', 'ward:id,name'])->latest()->paginate(10);
        
        // Get statistics data with trend calculations
        $phcStats = $this->getPhcStatistics($phcId);
        
        // Data needed for the Dashboard component
        $lgas = Lga::all(['id', 'name', 'code']);
        $wards = Ward::all(['id', 'lga_id', 'name', 'code']);
        $phcFacilities = Phc::all(['id', 'ward_id', 'clinic_name']);

        return Inertia::render('Phc/Dashboard', [
            'patients' => $patients,
            'phcStats' => $phcStats,
            'lgas' => $lgas,
            'wards' => $wards,
            'phcFacilities' => $phcFacilities,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Display statistics for PHC staff.
     */
    public function statistics(Request $request)
    {
        $phcId = auth()->user()->phc_id;
        
        // Get comprehensive statistics
        $phcStats = $this->getPhcStatistics($phcId);
        
        // Get additional data for charts
        $patients = Patient::where('phc_id', $phcId)->get();
        
        // Enhanced statistics with more details
        $enhancedStats = [
            'totalPatients' => $phcStats['totalPatients'],
            'delivered' => $phcStats['delivered'],
            'facilityDeliveries' => $phcStats['facilityDeliveries'],
            'liveBirths' => $phcStats['liveBirths'],
            'deliveryRate' => $phcStats['deliveryRate'],
            'facilityDeliveryRate' => $phcStats['facilityDeliveryRate'],
            'ancCompletion' => $phcStats['ancCompletion'],
            'pregnancyTracking' => $phcStats['pregnancyTracking'],
            'monthlyRegistrations' => $phcStats['monthlyRegistrations'],
            'deliveryOutcomes' => $phcStats['deliveryOutcomes'],
            'pncIncomplete' => $phcStats['pncIncomplete'] ?? 0,
            'activePregnancies' => $phcStats['activePregnancies'] ?? 0,
            'trends' => $phcStats['trends'] ?? [],
            
            // Additional calculated stats
            'ancVisitsBreakdown' => $this->getAncVisitsBreakdown($patients),
            'serviceUtilization' => $this->getServiceUtilization($patients),
            'timelyPnCRate' => $this->calculateTimelyPnCRate($patients),
            'immunizationCoverage' => $this->calculateImmunizationCoverage($patients),
        ];

        return Inertia::render('Phc/Statistics', [
            'phcStats' => $enhancedStats,
            'filters' => $request->only(['time_range']),
        ]);
    }

    /**
     * Generate reports for PHC staff.
     */
    public function generateReport(Request $request)
    {
        $phcId = auth()->user()->phc_id;
        $reportType = $request->input('report_type', 'monthly');
        $startDate = $request->input('start_date');
        $endDate = $request->input('end_date');

        $query = Patient::where('phc_id', $phcId);

        if ($startDate && $endDate) {
            $query->whereBetween('date_of_registration', [$startDate, $endDate]);
        }

        $patients = $query->get();
        $stats = $this->getPhcStatistics($phcId);

        // Return report data (you can format this as CSV, PDF, etc.)
        return response()->json([
            'report_type' => $reportType,
            'period' => $startDate && $endDate ? "$startDate to $endDate" : 'All Time',
            'statistics' => $stats,
            'total_records' => $patients->count(),
            'generated_at' => now()->toDateTimeString(),
        ]);
    }

    /**
     * Display records created by staff in their PHC.
     */
    public function records(Request $request)
    {
        $phcId = auth()->user()->phc_id;
        $query = Patient::query()->where('phc_id', $phcId);

        // Search filter logic
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('woman_name', 'like', "%{$search}%")
                  ->orWhere('unique_id', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%")
                  ->orWhereHas('lga', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('ward', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
            });
        }
        
        $patients = $query->with(['lga:id,name', 'ward:id,name'])
                          ->latest()
                          ->paginate(15)
                          ->withQueryString();

        return Inertia::render('Phc/MyRecords', [
            'patients' => $patients,
            'filters' => $request->only('search'),
            'auth' => [
                'user' => auth()->user()
            ],
        ]);
    }

    /**
     * Display all patients across all facilities.
     */
    public function allPatients(Request $request)
    {
        $query = Patient::with(['lga', 'ward', 'healthFacility']);

        // Search filter - only show results when searching
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('woman_name', 'like', "%{$search}%")
                  ->orWhere('unique_id', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%")
                  ->orWhereHas('lga', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('ward', function ($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  })
                  ->orWhereHas('healthFacility', function ($q) use ($search) {
                      $q->where('clinic_name', 'like', "%{$search}%");
                  });
            });
        } else {
            // If no search term, return empty results
            $query->where('id', 0);
        }

        $patients = $query->latest()->paginate(20)->withQueryString();

        return Inertia::render('Phc/AllPatients', [
            'patients' => $patients,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * View any patient in the system (read-only for PHC staff).
     */
    public function showAllPatient($id)
    {
        $patient = Patient::with(['lga:id,name', 'ward:id,name', 'healthFacility:id,clinic_name'])
                         ->findOrFail($id);

        $isCrossFacility = $patient->phc_id != auth()->user()->phc_id;

        return Inertia::render('Phc/ViewAllPatient', [
            'patient' => $patient,
            'isCrossFacility' => $isCrossFacility,
        ]);
    }

    /**
     * Show the form for editing any patient in the system.
     */
    public function editAnyPatient($id)
    {
        $patient = Patient::with(['lga', 'ward', 'healthFacility'])
                         ->findOrFail($id);

        $lgas = Lga::all(['id', 'name', 'code']);
        $wards = Ward::all(['id', 'lga_id', 'name', 'code']);
        $phcFacilities = Phc::all(['id', 'ward_id', 'clinic_name']);

        $isCrossFacility = $patient->phc_id != auth()->user()->phc_id;

        return Inertia::render('Phc/EditAnyPatient', [
            'patient' => $patient,
            'lgas' => $lgas,
            'wards' => $wards,
            'phcFacilities' => $phcFacilities,
            'isCrossFacility' => $isCrossFacility,
        ]);
    }

    /**
     * Update any patient record in the system.
     */
    public function updateAnyPatient(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);
        
        $data = $this->validatePatientData($request, true);
        $data = $this->convertBooleanFields($data);

        // Preserve the original facility
        if (isset($data['phc_id'])) {
            unset($data['phc_id']);
        }

        $patient->update($data);

        return redirect()->route('phc.all-patients')->with('success', 'Patient record updated successfully! Original facility preserved.');
    }

    /**
     * Show patient details.
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
     * Delete a patient record.
     */
    public function destroy($id)
    {
        $patient = Patient::where('phc_id', auth()->user()->phc_id)->findOrFail($id);
        $patient->delete();

        return back()->with('success', 'Patient record deleted successfully!');
    }

    /**
     * Debug ANC visits data
     */
    public function debugAncData()
    {
        $phcId = auth()->user()->phc_id;
        $patients = Patient::where('phc_id', $phcId)->get();
        
        $debugData = [];
        foreach ($patients as $patient) {
            $patientAnc = [];
            for ($i = 1; $i <= 8; $i++) {
                $fieldName = "anc_visit_{$i}_date";
                $patientAnc["anc{$i}"] = $patient->$fieldName;
            }
            $debugData[] = [
                'id' => $patient->id,
                'name' => $patient->woman_name,
                'anc_visits' => $patientAnc
            ];
        }
        
        return response()->json([
            'total_patients' => $patients->count(),
            'patient_anc_data' => $debugData,
            'anc_breakdown' => $this->getAncVisitsBreakdown($patients)
        ]);
    }

    /**
     * Get PHC statistics with dynamic trends.
     */
    private function getPhcStatistics($phcId)
    {
        $patients = Patient::where('phc_id', $phcId)->get();
        
        // Core KPIs
        $totalPatients = $patients->count();
        $delivered = $patients->whereNotNull('date_of_delivery')->count();
        
        // Calculate facility deliveries (deliveries at health facility)
        $facilityDeliveries = $patients->where('place_of_delivery', 'Health Facility')->count();
        $liveBirths = $patients->where('delivery_outcome', 'Live birth')->count();
        
        // Calculate rates
        $deliveryRate = $totalPatients > 0 ? round(($delivered / $totalPatients) * 100, 1) : 0;
        $facilityDeliveryRate = $delivered > 0 ? round(($facilityDeliveries / $delivered) * 100, 1) : 0;
        
        // ANC Completion Breakdown - Calculate based on ANC visit dates
        $ancCompletion = [
            'anc1Only' => $patients->whereNotNull('anc_visit_1_date')->whereNull('anc_visit_2_date')->count(),
            'anc2Only' => $patients->whereNotNull('anc_visit_2_date')->whereNull('anc_visit_3_date')->count(),
            'anc3Only' => $patients->whereNotNull('anc_visit_3_date')->whereNull('anc_visit_4_date')->count(),
            'anc4Only' => $patients->whereNotNull('anc_visit_4_date')->whereNull('anc_visit_5_date')->count(),
            'anc5Only' => $patients->whereNotNull('anc_visit_5_date')->whereNull('anc_visit_6_date')->count(),
            'anc6Only' => $patients->whereNotNull('anc_visit_6_date')->whereNull('anc_visit_7_date')->count(),
            'anc7Only' => $patients->whereNotNull('anc_visit_7_date')->whereNull('anc_visit_8_date')->count(),
            'anc8Completed' => $patients->whereNotNull('anc_visit_8_date')->count(),
        ];
        
        // Pregnancy Tracking
        $pregnancyTracking = [
            'sevenMonths' => $patients->filter(function ($patient) {
                return $this->calculatePregnancyMonth($patient) == 7 && !$patient->date_of_delivery;
            })->count(),
            'eightMonths' => $patients->filter(function ($patient) {
                return $this->calculatePregnancyMonth($patient) == 8 && !$patient->date_of_delivery;
            })->count(),
            'dueThisMonth' => $patients->filter(function ($patient) {
                return $this->isDueThisMonth($patient) && !$patient->date_of_delivery;
            })->count(),
        ];

        // Monthly registrations
        $monthlyRegData = Patient::where('phc_id', $phcId)
            ->select(DB::raw('MONTH(date_of_registration) as month'), DB::raw('count(*) as count'))
            ->whereYear('date_of_registration', now()->year)
            ->groupBy('month')
            ->pluck('count', 'month')
            ->toArray();
        
        // Delivery Outcome distribution
        $deliveryOutcomes = Patient::where('phc_id', $phcId)
            ->select('delivery_outcome', DB::raw('count(*) as count'))
            ->whereNotNull('delivery_outcome')
            ->groupBy('delivery_outcome')
            ->pluck('count', 'delivery_outcome')
            ->toArray();

        // Calculate additional statistics for enhanced dashboard
        $activePregnancies = $patients->whereNull('date_of_delivery')->count();
        $pncIncomplete = $delivered - $patients->whereNotNull('pnc_visit_1')->whereNotNull('pnc_visit_2')->count();

        // Calculate dynamic trends compared to previous period
        $trends = $this->calculateTrends($phcId);

        // Get the proper ANC visits breakdown
        $ancVisitsBreakdown = $this->getAncVisitsBreakdown($patients);

        return [
            'totalPatients' => $totalPatients,
            'delivered' => $delivered,
            'facilityDeliveries' => $facilityDeliveries,
            'liveBirths' => $liveBirths,
            'deliveryRate' => $deliveryRate,
            'facilityDeliveryRate' => $facilityDeliveryRate,
            'ancVisitsBreakdown' => $ancVisitsBreakdown,
            'ancCompletion' => $ancCompletion,
            'pregnancyTracking' => $pregnancyTracking,
            'monthlyRegistrations' => $monthlyRegData,
            'deliveryOutcomes' => $deliveryOutcomes,
            'pncIncomplete' => $pncIncomplete,
            'activePregnancies' => $activePregnancies,
            'trends' => $trends,
        ];
    }

    /**
     * Calculate dynamic trends compared to previous period.
     */
    private function calculateTrends($phcId)
    {
        $currentMonthStart = now()->startOfMonth();
        $lastMonthStart = now()->subMonth()->startOfMonth();
        $lastMonthEnd = now()->subMonth()->endOfMonth();

        // Current month stats
        $currentMonthStats = Patient::where('phc_id', $phcId)
            ->where('date_of_registration', '>=', $currentMonthStart)
            ->selectRaw('
                COUNT(*) as total_patients,
                COUNT(CASE WHEN date_of_delivery IS NOT NULL THEN 1 END) as delivered,
                COUNT(CASE WHEN place_of_delivery = "Health Facility" THEN 1 END) as facility_deliveries,
                COUNT(CASE WHEN delivery_outcome = "Live birth" THEN 1 END) as live_births
            ')
            ->first();

        // Last month stats
        $lastMonthStats = Patient::where('phc_id', $phcId)
            ->whereBetween('date_of_registration', [$lastMonthStart, $lastMonthEnd])
            ->selectRaw('
                COUNT(*) as total_patients,
                COUNT(CASE WHEN date_of_delivery IS NOT NULL THEN 1 END) as delivered,
                COUNT(CASE WHEN place_of_delivery = "Health Facility" THEN 1 END) as facility_deliveries,
                COUNT(CASE WHEN delivery_outcome = "Live birth" THEN 1 END) as live_births
            ')
            ->first();

        // Calculate trends
        $trends = [];
        
        // Total Patients trend
        $currentPatients = $currentMonthStats->total_patients ?? 0;
        $lastPatients = $lastMonthStats->total_patients ?? 0;
        $trends['totalPatients'] = $lastPatients > 0 ? 
            round((($currentPatients - $lastPatients) / $lastPatients) * 100, 1) : 
            ($currentPatients > 0 ? 100 : 0);

        // Delivery Rate trend
        $currentDelivered = $currentMonthStats->delivered ?? 0;
        $lastDelivered = $lastMonthStats->delivered ?? 0;
        $currentDeliveryRate = $currentPatients > 0 ? ($currentDelivered / $currentPatients) * 100 : 0;
        $lastDeliveryRate = $lastPatients > 0 ? ($lastDelivered / $lastPatients) * 100 : 0;
        $trends['deliveryRate'] = $lastDeliveryRate > 0 ? 
            round(($currentDeliveryRate - $lastDeliveryRate), 1) : 
            ($currentDeliveryRate > 0 ? $currentDeliveryRate : 0);

        // Facility Delivery Rate trend
        $currentFacility = $currentMonthStats->facility_deliveries ?? 0;
        $lastFacility = $lastMonthStats->facility_deliveries ?? 0;
        $currentFacilityRate = $currentDelivered > 0 ? ($currentFacility / $currentDelivered) * 100 : 0;
        $lastFacilityRate = $lastDelivered > 0 ? ($lastFacility / $lastDelivered) * 100 : 0;
        $trends['facilityDeliveryRate'] = $lastFacilityRate > 0 ? 
            round(($currentFacilityRate - $lastFacilityRate), 1) : 
            ($currentFacilityRate > 0 ? $currentFacilityRate : 0);

        // Live Births trend
        $currentLiveBirths = $currentMonthStats->live_births ?? 0;
        $lastLiveBirths = $lastMonthStats->live_births ?? 0;
        $trends['liveBirths'] = $lastLiveBirths > 0 ? 
            round((($currentLiveBirths - $lastLiveBirths) / $lastLiveBirths) * 100, 1) : 
            ($currentLiveBirths > 0 ? 100 : 0);

        return $trends;
    }

    /**
     * Calculate pregnancy month based on EDD.
     */
    private function calculatePregnancyMonth($patient)
    {
        if (!$patient->edd || $patient->date_of_delivery) {
            return null;
        }

        $edd = Carbon::parse($patient->edd);
        $now = Carbon::now();
        
        $totalPregnancyDays = 280;
        $daysPassed = $totalPregnancyDays - $now->diffInDays($edd, false);
        
        if ($daysPassed <= 0) return 9;
        if ($daysPassed > 280) return 1;
        
        return (int) ceil($daysPassed / 30.44);
    }

    /**
     * Check if patient is due this month.
     */
    private function isDueThisMonth($patient)
    {
        if (!$patient->edd || $patient->date_of_delivery) {
            return false;
        }

        $edd = Carbon::parse($patient->edd);
        $now = Carbon::now();
        
        return $edd->month == $now->month && $edd->year == $now->year;
    }

    /**
     * Get ANC visits breakdown for visits 1-8 (robust version).
     */
    private function getAncVisitsBreakdown($patients)
    {
        $breakdown = [];
        
        // Count each ANC visit from 1 to 8 - handles both NULL and empty strings
        for ($i = 1; $i <= 8; $i++) {
            $fieldName = "anc_visit_{$i}_date";
            $breakdown["anc{$i}"] = $patients->filter(function ($patient) use ($fieldName) {
                $dateValue = $patient->$fieldName;
                return !empty($dateValue) && $dateValue !== null && trim($dateValue) !== '';
            })->count();
        }
        
        // Count patients with additional ANC visits beyond the standard 8
        $breakdown['anc5plus'] = $patients->where('additional_anc_count', '>', 0)->count();
        
        return $breakdown;
    }

    /**
     * Get service utilization statistics.
     */
    private function getServiceUtilization($patients)
    {
        $delivered = $patients->whereNotNull('date_of_delivery');
        
        return [
            'anc_services' => $patients->whereNotNull('anc_visit_1_date')->count(),
            'delivery_services' => $delivered->count(),
            'pnc_services' => $delivered->whereNotNull('pnc_visit_1')->count(),
            'fp_services' => $patients->where('fp_using', true)->count(),
            'immunization_services' => $patients->where('bcg_received', true)->count(),
        ];
    }

    /**
     * Calculate timely PNC rate.
     */
    private function calculateTimelyPnCRate($patients)
    {
        $delivered = $patients->whereNotNull('date_of_delivery');
        $timelyPnC = $delivered->filter(function ($patient) {
            if (!$patient->pnc_visit_1 || !$patient->date_of_delivery) {
                return false;
            }
            $deliveryDate = Carbon::parse($patient->date_of_delivery);
            $pncDate = Carbon::parse($patient->pnc_visit_1);
            return $pncDate->diffInDays($deliveryDate) <= 7; // Within 7 days
        })->count();

        return $delivered->count() > 0 ? round(($timelyPnC / $delivered->count()) * 100) : 0;
    }

    /**
     * Calculate immunization coverage.
     */
    private function calculateImmunizationCoverage($patients)
    {
        $withChildren = $patients->whereNotNull('child_dob');
        $immunized = $withChildren->where('bcg_received', true);
        
        return $withChildren->count() > 0 ? round(($immunized->count() / $withChildren->count()) * 100) : 0;
    }

    /**
     * Validate patient data for update methods.
     */
    private function validatePatientData(Request $request, $update = false)
    {
        $rules = [
            // Personal Information
            'woman_name' => 'required|string|max:255',
            'age' => 'required|integer|between:15,50',
            'literacy_status' => 'required|in:Literate,Illiterate,Not sure',
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
            'delivery_outcome' => 'nullable|in:Live birth,Stillbirth,Miscarriage',
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
            'child_gender' => 'nullable|in:Male,Female',

            // Notes
            'remark' => 'nullable|string',
            'comments' => 'nullable|string',
        ];

        // Add ANC visit rules for visits 1-8
        for ($i = 1; $i <= 8; $i++) {
            $rules["anc_visit_{$i}_date"] = 'nullable|date';
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
     * Convert boolean fields.
     */
    private function convertBooleanFields($data)
    {
        // Generate ANC boolean fields for visits 1-8
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