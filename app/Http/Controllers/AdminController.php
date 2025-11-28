<?php

namespace App\Http\Controllers;

use App\Models\Lga;
use App\Models\Ward;
use App\Models\Phc;
use App\Models\User;
use App\Models\Patient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AdminController extends Controller
{
    /**
     * Render Admin Dashboard Home with Comprehensive Statistics for entire state
     */
    public function index()
    {
        // Get current year range
        $currentYear = now()->year;
        $startDate = $currentYear . '-01-01';
        $endDate = $currentYear . '-12-31';

        // Get all patients for current year across entire state
        $patients = Patient::whereBetween('date_of_registration', [$startDate, $endDate])->get();

        // Calculate comprehensive statistics
        $stats = $this->calculateComprehensiveStatistics($patients);
        $chartData = $this->generateComprehensiveChartData($patients, $currentYear);

        // Get basic stats for dashboard
        $totalPatients = Patient::count();
        $totalFacilities = Phc::count();
        $totalStaff = User::where('role', 'phc_staff')->count();
        $totalLgas = Lga::count();
        $totalWards = Ward::count();

        // Get recent patients for activity feed
        $recentPatients = Patient::with(['lga', 'ward', 'healthFacility'])
                                ->latest()
                                ->take(5)
                                ->get();

        return Inertia::render('Admin/Dashboard', [
            'statistics' => array_merge($stats, [
                'totalFacilities' => $totalFacilities,
                'totalLgas' => $totalLgas,
                'totalWards' => $totalWards,
                'totalStaff' => $totalStaff,
            ]),
            'chartData' => $chartData,
            'currentYear' => $currentYear,
            'recentPatients' => $recentPatients,
        ]);
    }

    /**
     * Calculate comprehensive statistics including all form data
     */
    private function calculateComprehensiveStatistics($patients)
    {
        $totalRegistered = $patients->count();
        
        if ($totalRegistered === 0) {
            return [
                'totalRegistered' => 0,
                'anc4Rate' => 0,
                'hospitalDeliveryRate' => 0,
                'kitsReceivedRate' => 0,
                'pnc1Within48hRate' => 0,
                'liveBirthRate' => 0,
                'ancCompletion' => [
                    'anc1Only' => 0, 'anc2Only' => 0, 'anc3Only' => 0, 'anc4Completed' => 0,
                    'anc5Only' => 0, 'anc6Only' => 0, 'anc7Only' => 0, 'anc8Completed' => 0,
                ],
                'pregnancyTracking' => [
                    'sevenMonths' => 0, 'eightMonths' => 0, 'dueThisMonth' => 0,
                ],
                'detailedCounts' => [
                    'anc4Completed' => 0, 'totalDelivered' => 0, 'pncIncomplete' => 0,
                    'stillbirths' => 0, 'liveBirths' => 0, 'hospitalDeliveries' => 0,
                    'kitsReceived' => 0, 'pnc1Within48h' => 0,
                ],
                'trends' => [
                    'totalPatients' => 0, 'deliveryRate' => 0, 'facilityDeliveryRate' => 0, 
                    'liveBirths' => 0, 'anc4Rate' => 0,
                ],
                'serviceUtilization' => [
                    'anc_services' => 0, 'delivery_services' => 0, 'pnc_services' => 0,
                    'fp_services' => 0, 'immunization_services' => 0, 'hiv_testing' => 0,
                ]
            ];
        }

        // ANC Statistics - Count patients with each ANC visit
        $anc1Completed = $patients->whereNotNull('anc_visit_1_date')->count();
        $anc2Completed = $patients->whereNotNull('anc_visit_2_date')->count();
        $anc3Completed = $patients->whereNotNull('anc_visit_3_date')->count();
        $anc4Completed = $patients->whereNotNull('anc_visit_4_date')->count();
        $anc5Completed = $patients->whereNotNull('anc_visit_5_date')->count();
        $anc6Completed = $patients->whereNotNull('anc_visit_6_date')->count();
        $anc7Completed = $patients->whereNotNull('anc_visit_7_date')->count();
        $anc8Completed = $patients->whereNotNull('anc_visit_8_date')->count();

        $anc4Rate = round(($anc4Completed / $totalRegistered) * 100, 1);

        // ANC Completion Breakdown (exclusive counts)
        $ancCompletion = [
            'anc1Only' => $patients->filter(function ($patient) {
                return $patient->anc_visit_1_date && !$patient->anc_visit_2_date;
            })->count(),
            'anc2Only' => $patients->filter(function ($patient) {
                return $patient->anc_visit_2_date && !$patient->anc_visit_3_date;
            })->count(),
            'anc3Only' => $patients->filter(function ($patient) {
                return $patient->anc_visit_3_date && !$patient->anc_visit_4_date;
            })->count(),
            'anc4Completed' => $anc4Completed,
            'anc5Only' => $patients->filter(function ($patient) {
                return $patient->anc_visit_5_date && !$patient->anc_visit_6_date;
            })->count(),
            'anc6Only' => $patients->filter(function ($patient) {
                return $patient->anc_visit_6_date && !$patient->anc_visit_7_date;
            })->count(),
            'anc7Only' => $patients->filter(function ($patient) {
                return $patient->anc_visit_7_date && !$patient->anc_visit_8_date;
            })->count(),
            'anc8Completed' => $anc8Completed,
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

        // Delivery Statistics
        $deliveredPatients = $patients->whereNotNull('date_of_delivery');
        $totalDelivered = $deliveredPatients->count();

        $hospitalDeliveries = $deliveredPatients->filter(function ($patient) {
            return $patient->place_of_delivery === 'Health Facility';
        })->count();

        $hospitalDeliveryRate = $totalDelivered > 0 ? round(($hospitalDeliveries / $totalDelivered) * 100, 1) : 0;

        // Delivery Kits
        $kitsReceived = $deliveredPatients->where('delivery_kits_received', true)->count();
        $kitsReceivedRate = $totalDelivered > 0 ? round(($kitsReceived / $totalDelivered) * 100, 1) : 0;

        // PNC Statistics
        $pnc1Within48h = $deliveredPatients->filter(function ($patient) {
            return $patient->date_of_delivery && $patient->pnc_visit_1 && 
                   Carbon::parse($patient->pnc_visit_1)->diffInHours(Carbon::parse($patient->date_of_delivery)) <= 48;
        })->count();

        $pnc1Within48hRate = $totalDelivered > 0 ? round(($pnc1Within48h / $totalDelivered) * 100, 1) : 0;

        // Birth Outcomes
        $liveBirths = $deliveredPatients->where('delivery_outcome', 'Live birth')->count();
        $liveBirthRate = $totalDelivered > 0 ? round(($liveBirths / $totalDelivered) * 100, 1) : 0;

        // Additional Metrics
        $pncIncomplete = $deliveredPatients->filter(function ($patient) {
            return empty($patient->pnc_visit_1) || empty($patient->pnc_visit_2);
        })->count();

        $stillbirths = $deliveredPatients->where('delivery_outcome', 'Stillbirth')->count();

        // Service Utilization
        $serviceUtilization = [
            'anc_services' => $anc1Completed,
            'delivery_services' => $totalDelivered,
            'pnc_services' => $deliveredPatients->whereNotNull('pnc_visit_1')->count(),
            'fp_services' => $patients->where('fp_using', true)->count(),
            'immunization_services' => $patients->where('bcg_received', true)->count(),
            'hiv_testing' => $patients->where(function ($query) {
                for ($i = 1; $i <= 8; $i++) {
                    $query->orWhere("anc{$i}_hiv_test", 'Yes');
                }
            })->count(),
        ];

        // Calculate trends
        $trends = $this->calculateTrends();

        return [
            'totalRegistered' => $totalRegistered,
            'anc4Rate' => $anc4Rate,
            'hospitalDeliveryRate' => $hospitalDeliveryRate,
            'kitsReceivedRate' => $kitsReceivedRate,
            'pnc1Within48hRate' => $pnc1Within48hRate,
            'liveBirthRate' => $liveBirthRate,
            'ancCompletion' => $ancCompletion,
            'pregnancyTracking' => $pregnancyTracking,
            'detailedCounts' => [
                'anc4Completed' => $anc4Completed,
                'totalDelivered' => $totalDelivered,
                'pncIncomplete' => $pncIncomplete,
                'stillbirths' => $stillbirths,
                'liveBirths' => $liveBirths,
                'hospitalDeliveries' => $hospitalDeliveries,
                'kitsReceived' => $kitsReceived,
                'pnc1Within48h' => $pnc1Within48h,
            ],
            'serviceUtilization' => $serviceUtilization,
            'trends' => $trends,
        ];
    }

    /**
     * Generate comprehensive chart data for all metrics
     */
    private function generateComprehensiveChartData($patients, $currentYear)
    {
        if ($patients->count() === 0) {
            return $this->generateEmptyChartData();
        }

        return [
            // Monthly registrations
            'monthlyRegistrations' => $this->getMonthlyRegistrations($patients, $currentYear),
            
            // Delivery outcomes
            'deliveryOutcomes' => $this->getDeliveryOutcomes($patients),
            
            // ANC completion
            'ancCompletion' => $this->getANCCompletion($patients),
            
            // Literacy status
            'literacyStatus' => $this->getLiteracyStatus($patients),
            
            // Insurance status
            'insuranceStatus' => $this->getInsuranceStatus($patients),
            
            // HIV status
            'hivStatus' => $this->getHIVStatus($patients),
            
            // Family planning
            'familyPlanning' => $this->getFamilyPlanning($patients),
            
            // Immunization
            'immunization' => $this->getImmunization($patients),
            
            // Service utilization
            'serviceUtilization' => $this->getServiceUtilization($patients),

            // ANC Services breakdown
            'ancServices' => $this->getAncServices($patients),

            // Payment statistics
            'paymentStats' => $this->getPaymentStatistics($patients),
        ];
    }

    /**
     * Get monthly registrations data
     */
    private function getMonthlyRegistrations($patients, $currentYear)
    {
        $monthlyData = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthKey = $currentYear . '-' . str_pad($month, 2, '0', STR_PAD_LEFT);
            $count = $patients->filter(function ($patient) use ($month, $currentYear) {
                $regDate = Carbon::parse($patient->date_of_registration);
                return $regDate->month == $month && $regDate->year == $currentYear;
            })->count();
            $monthlyData[$monthKey] = $count;
        }
        return $monthlyData;
    }

    /**
     * Get delivery outcomes
     */
    private function getDeliveryOutcomes($patients)
    {
        $delivered = $patients->whereNotNull('date_of_delivery');
        return [
            'Live Birth' => $delivered->where('delivery_outcome', 'Live birth')->count(),
            'Stillbirth' => $delivered->where('delivery_outcome', 'Stillbirth')->count(),
            'Miscarriage' => $delivered->where('delivery_outcome', 'Miscarriage')->count(),
        ];
    }

    /**
     * Get ANC completion data
     */
    private function getANCCompletion($patients)
    {
        return [
            'ANC1' => $patients->whereNotNull('anc_visit_1_date')->count(),
            'ANC2' => $patients->whereNotNull('anc_visit_2_date')->count(),
            'ANC3' => $patients->whereNotNull('anc_visit_3_date')->count(),
            'ANC4' => $patients->whereNotNull('anc_visit_4_date')->count(),
            'ANC5' => $patients->whereNotNull('anc_visit_5_date')->count(),
            'ANC6' => $patients->whereNotNull('anc_visit_6_date')->count(),
            'ANC7' => $patients->whereNotNull('anc_visit_7_date')->count(),
            'ANC8' => $patients->whereNotNull('anc_visit_8_date')->count(),
        ];
    }

    /**
     * Get literacy status
     */
    private function getLiteracyStatus($patients)
    {
        return [
            'Literate' => $patients->where('literacy_status', 'Literate')->count(),
            'Illiterate' => $patients->where('literacy_status', 'Illiterate')->count(),
            'Not Sure' => $patients->where('literacy_status', 'Not sure')->count(),
        ];
    }

    /**
     * Get insurance status
     */
    private function getInsuranceStatus($patients)
    {
        $insured = $patients->where('health_insurance_status', 'Yes');
        $satisfied = $insured->where('insurance_satisfaction', true);

        return [
            'Insured' => $insured->count(),
            'Not Insured' => $patients->where('health_insurance_status', 'No')->count(),
            'Not Enrolled' => $patients->where('health_insurance_status', 'Not Enrolled')->count(),
            'Satisfied' => $satisfied->count(),
            'Not Satisfied' => $insured->count() - $satisfied->count(),
        ];
    }

    /**
     * Get HIV status
     */
    private function getHIVStatus($patients)
    {
        // Count patients tested for HIV in any ANC visit
        $tested = $patients->filter(function ($patient) {
            for ($i = 1; $i <= 8; $i++) {
                $hivTestField = "anc{$i}_hiv_test";
                if ($patient->$hivTestField === 'Yes') {
                    return true;
                }
            }
            return false;
        });

        // Count positive results
        $positive = $patients->filter(function ($patient) {
            for ($i = 1; $i <= 8; $i++) {
                $hivResultField = "anc{$i}_hiv_result";
                if ($patient->$hivResultField === 'Positive') {
                    return true;
                }
            }
            return false;
        });

        return [
            'Tested' => $tested->count(),
            'Positive' => $positive->count(),
            'Negative' => $tested->count() - $positive->count(),
            'Not Tested' => $patients->count() - $tested->count(),
        ];
    }

    /**
     * Get family planning data
     */
    private function getFamilyPlanning($patients)
    {
        $fpUsers = $patients->where('fp_using', true);

        return [
            'Interested' => $patients->where('fp_interest', 'Yes')->count(),
            'Using FP' => $fpUsers->count(),
            'Male Condom' => $patients->where('fp_male_condom', true)->count(),
            'Female Condom' => $patients->where('fp_female_condom', true)->count(),
            'Pill' => $patients->where('fp_pill', true)->count(),
            'Injectable' => $patients->where('fp_injectable', true)->count(),
            'Implant' => $patients->where('fp_implant', true)->count(),
            'IUD' => $patients->where('fp_iud', true)->count(),
            'Other Methods' => $patients->where('fp_other', true)->count(),
        ];
    }

    /**
     * Get immunization data
     */
    private function getImmunization($patients)
    {
        return [
            'BCG' => $patients->where('bcg_received', true)->count(),
            'Hepatitis B' => $patients->where('hep0_received', true)->count(),
            'OPV' => $patients->where('opv0_received', true)->count(),
            'Penta1' => $patients->where('penta1_received', true)->count(),
            'PCV1' => $patients->where('pcv1_received', true)->count(),
            'Rota1' => $patients->where('rota1_received', true)->count(),
            'IPV1' => $patients->where('ipv1_received', true)->count(),
            'Penta2' => $patients->where('penta2_received', true)->count(),
            'PCV2' => $patients->where('pcv2_received', true)->count(),
            'Rota2' => $patients->where('rota2_received', true)->count(),
            'Penta3' => $patients->where('penta3_received', true)->count(),
            'PCV3' => $patients->where('pcv3_received', true)->count(),
            'IPV2' => $patients->where('ipv2_received', true)->count(),
            'Measles' => $patients->where('measles_received', true)->count(),
            'Yellow Fever' => $patients->where('yellow_fever_received', true)->count(),
            'Vitamin A' => $patients->where('vitamin_a_received', true)->count(),
            'MCV2' => $patients->where('mcv2_received', true)->count(),
        ];
    }

    /**
     * Get service utilization
     */
    private function getServiceUtilization($patients)
    {
        $ancServices = 0;
        for ($i = 1; $i <= 8; $i++) {
            $field = "anc_visit_{$i}_date";
            $ancServices += $patients->whereNotNull($field)->count();
        }

        return [
            'ANC Services' => $ancServices,
            'Delivery Services' => $patients->whereNotNull('date_of_delivery')->count(),
            'PNC Services' => $patients->whereNotNull('pnc_visit_1')->count(),
            'FP Services' => $patients->where('fp_using', true)->count(),
            'Immunization Services' => $patients->where('bcg_received', true)->count(),
            'HIV Testing' => $patients->filter(function ($patient) {
                for ($i = 1; $i <= 8; $i++) {
                    if ($patient->{"anc{$i}_hiv_test"} === 'Yes') {
                        return true;
                    }
                }
                return false;
            })->count(),
        ];
    }

    /**
     * Get ANC services breakdown
     */
    private function getAncServices($patients)
    {
        $services = [
            'Urinalysis' => 0,
            'Iron Folate' => 0,
            'MMS' => 0,
            'SP' => 0,
            'SBA' => 0,
        ];

        for ($i = 1; $i <= 8; $i++) {
            $services['Urinalysis'] += $patients->where("anc{$i}_urinalysis", true)->count();
            $services['Iron Folate'] += $patients->where("anc{$i}_iron_folate", true)->count();
            $services['MMS'] += $patients->where("anc{$i}_mms", true)->count();
            $services['SP'] += $patients->where("anc{$i}_sp", true)->count();
            $services['SBA'] += $patients->where("anc{$i}_sba", true)->count();
        }

        return $services;
    }

    /**
     * Get payment statistics
     */
    private function getPaymentStatistics($patients)
    {
        $paymentData = [
            'ANC Payments' => 0,
            'FP Payments' => 0,
            'Total Revenue' => 0,
        ];

        // ANC Payments
        for ($i = 1; $i <= 8; $i++) {
            $paidField = "anc{$i}_paid";
            $amountField = "anc{$i}_payment_amount";
            
            $paidPatients = $patients->where($paidField, true);
            $paymentData['ANC Payments'] += $paidPatients->count();
            $paymentData['Total Revenue'] += $paidPatients->sum($amountField);
        }

        // FP Payments
        $fpPaid = $patients->where('fp_paid', true);
        $paymentData['FP Payments'] = $fpPaid->count();
        $paymentData['Total Revenue'] += $fpPaid->sum('fp_payment_amount');

        return $paymentData;
    }

    /**
     * Generate empty chart data structure
     */
    private function generateEmptyChartData()
    {
        return [
            'monthlyRegistrations' => [],
            'deliveryOutcomes' => [],
            'ancCompletion' => [],
            'literacyStatus' => [],
            'insuranceStatus' => [],
            'hivStatus' => [],
            'familyPlanning' => [],
            'immunization' => [],
            'serviceUtilization' => [],
            'ancServices' => [],
            'paymentStats' => [],
        ];
    }

    /**
     * Calculate pregnancy month based on EDD
     */
    private function calculatePregnancyMonth($patient)
    {
        if (!$patient->edd || $patient->date_of_delivery) {
            return null;
        }

        $edd = Carbon::parse($patient->edd);
        $now = Carbon::now();
        
        $totalPregnancyDays = 280; // 40 weeks
        $daysPassed = $totalPregnancyDays - $now->diffInDays($edd, false);
        
        if ($daysPassed <= 0) return 9;
        if ($daysPassed > 280) return 1;
        
        return (int) ceil($daysPassed / 30.44);
    }

    /**
     * Check if patient is due this month
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
     * Calculate trends (simplified - compare with previous year)
     */
    private function calculateTrends()
    {
        $currentYear = now()->year;
        $previousYear = $currentYear - 1;
        
        $currentYearPatients = Patient::whereYear('date_of_registration', $currentYear)->get();
        $previousYearPatients = Patient::whereYear('date_of_registration', $previousYear)->get();
        
        if ($previousYearPatients->count() === 0) {
            return [
                'totalPatients' => 100,
                'deliveryRate' => 100,
                'facilityDeliveryRate' => 100,
                'liveBirths' => 100,
                'anc4Rate' => 100,
            ];
        }

        // Calculate current year stats
        $currentTotal = $currentYearPatients->count();
        $currentDelivered = $currentYearPatients->whereNotNull('date_of_delivery')->count();
        $currentFacilityDeliveries = $currentYearPatients->where('place_of_delivery', 'Health Facility')->count();
        $currentLiveBirths = $currentYearPatients->where('delivery_outcome', 'Live birth')->count();
        $currentANC4 = $currentYearPatients->whereNotNull('anc_visit_4_date')->count();

        // Calculate previous year stats
        $previousTotal = $previousYearPatients->count();
        $previousDelivered = $previousYearPatients->whereNotNull('date_of_delivery')->count();
        $previousFacilityDeliveries = $previousYearPatients->where('place_of_delivery', 'Health Facility')->count();
        $previousLiveBirths = $previousYearPatients->where('delivery_outcome', 'Live birth')->count();
        $previousANC4 = $previousYearPatients->whereNotNull('anc_visit_4_date')->count();

        // Calculate trends
        $totalTrend = $previousTotal > 0 ? round((($currentTotal - $previousTotal) / $previousTotal) * 100, 1) : 100;
        $deliveryTrend = $previousDelivered > 0 ? round((($currentDelivered - $previousDelivered) / $previousDelivered) * 100, 1) : 100;
        $facilityTrend = $previousFacilityDeliveries > 0 ? round((($currentFacilityDeliveries - $previousFacilityDeliveries) / $previousFacilityDeliveries) * 100, 1) : 100;
        $liveBirthTrend = $previousLiveBirths > 0 ? round((($currentLiveBirths - $previousLiveBirths) / $previousLiveBirths) * 100, 1) : 100;
        $anc4Trend = $previousANC4 > 0 ? round((($currentANC4 - $previousANC4) / $previousANC4) * 100, 1) : 100;

        return [
            'totalPatients' => $totalTrend,
            'deliveryRate' => $deliveryTrend,
            'facilityDeliveryRate' => $facilityTrend,
            'liveBirths' => $liveBirthTrend,
            'anc4Rate' => $anc4Trend,
        ];
    }

    /**
     * Display all patients across all facilities (Admin view)
     */
    public function allPatients(Request $request)
    {
        $query = Patient::with(['lga', 'ward', 'healthFacility']);

        // Search filter
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
        }

        // Facility filter
        if ($facility = $request->input('facility')) {
            $query->where('health_facility_id', $facility);
        }

        // ANC Filters
        if ($ancFilter = $request->input('anc_filter')) {
            switch ($ancFilter) {
                case 'anc1_only':
                    $query->whereNotNull('anc_visit_1_date')
                          ->whereNull('anc_visit_2_date');
                    break;
                case 'anc2_only':
                    $query->whereNotNull('anc_visit_2_date')
                          ->whereNull('anc_visit_3_date');
                    break;
                case 'anc3_only':
                    $query->whereNotNull('anc_visit_3_date')
                          ->whereNull('anc_visit_4_date');
                    break;
                case 'anc4_completed':
                    $query->whereNotNull('anc_visit_4_date');
                    break;
                case 'anc_incomplete':
                    $query->whereNull('anc_visit_1_date');
                    break;
            }
        }

        // Pregnancy Filters
        if ($pregnancyFilter = $request->input('pregnancy_filter')) {
            $now = Carbon::now();
            
            switch ($pregnancyFilter) {
                case '7_months':
                    $twoMonthsFromNow = $now->copy()->addMonths(2);
                    $oneMonthFromNow = $now->copy()->addMonth();
                    $query->whereNotNull('edd')
                          ->whereNull('date_of_delivery')
                          ->where('edd', '>=', $oneMonthFromNow)
                          ->where('edd', '<=', $twoMonthsFromNow);
                    break;
                case '8_months':
                    $oneMonthFromNow = $now->copy()->addMonth();
                    $query->whereNotNull('edd')
                          ->whereNull('date_of_delivery')
                          ->where('edd', '<=', $oneMonthFromNow)
                          ->where('edd', '>=', $now);
                    break;
                case 'due_this_month':
                    $startOfMonth = $now->copy()->startOfMonth();
                    $endOfMonth = $now->copy()->endOfMonth();
                    $query->whereNotNull('edd')
                          ->whereNull('date_of_delivery')
                          ->where('edd', '>=', $startOfMonth)
                          ->where('edd', '<=', $endOfMonth);
                    break;
                case 'overdue':
                    $query->whereNotNull('edd')
                          ->whereNull('date_of_delivery')
                          ->where('edd', '<', $now);
                    break;
                case 'delivered':
                    $query->whereNotNull('date_of_delivery');
                    break;
                case 'not_delivered':
                    $query->whereNull('date_of_delivery');
                    break;
            }
        }

        // Delivery Place Filters
        if ($deliveryFilter = $request->input('delivery_filter')) {
            switch ($deliveryFilter) {
                case 'hospital':
                    $query->where('place_of_delivery', 'Health Facility');
                    break;
                case 'home':
                    $query->where('place_of_delivery', 'Home');
                    break;
                case 'traditional':
                    $query->where('place_of_delivery', 'Traditional Attendant');
                    break;
            }
        }

        $patients = $query->latest()->paginate(20)->withQueryString();
        $facilities = Phc::all(['id', 'clinic_name']);

        return Inertia::render('Admin/AllPatients', [
            'patients' => $patients,
            'facilities' => $facilities,
            'filters' => $request->only([
                'search', 'facility', 'anc_filter', 'pregnancy_filter', 'delivery_filter'
            ]),
        ]);
    }

    /**
     * Show a specific patient record (Admin view)
     */
    public function showPatient($id)
    {
        $patient = Patient::with(['lga', 'ward', 'healthFacility'])
                         ->findOrFail($id);

        return Inertia::render('Admin/ViewPatient', [
            'patient' => $patient,
        ]);
    }

    /**
     * Show the form for editing a patient record (Admin view)
     */
    public function editPatient($id)
    {
        $patient = Patient::with(['lga', 'ward', 'healthFacility'])
                         ->findOrFail($id);

        $lgas = Lga::all(['id', 'name', 'code']);
        $wards = Ward::all(['id', 'lga_id', 'name', 'code']);
        $phcFacilities = Phc::all(['id', 'ward_id', 'clinic_name']);

        return Inertia::render('Admin/EditPatient', [
            'patient' => $patient,
            'lgas' => $lgas,
            'wards' => $wards,
            'phcFacilities' => $phcFacilities,
        ]);
    }

    /**
     * Update a patient record (Admin view)
     */
    public function updatePatient(Request $request, $id)
    {
        $patient = Patient::findOrFail($id);
        
        $data = $request->validate([
            // Personal Information
            'woman_name' => 'required|string|max:255',
            'age' => 'required|integer|between:15,50',
            'literacy_status' => 'required|in:Literate,Illiterate,Not sure',
            'phone_number' => 'nullable|string|max:20',
            'husband_name' => 'nullable|string|max:255',
            'husband_phone' => 'nullable|string|max:20',
            'community' => 'required|string|max:255',
            'address' => 'required|string|max:255',
            'lga_id' => 'required|exists:lgas,id',
            'ward_id' => 'required|exists:wards,id',
            'health_facility_id' => 'required|exists:phcs,id',

            // Medical Information
            'gravida' => 'nullable|integer|min:0',
            'parity' => 'nullable|integer|min:0',
            'date_of_registration' => 'required|date',
            'edd' => 'required|date|after_or_equal:date_of_registration',

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
            'fp_interest' => 'nullable|in:Yes,No',
            'fp_using' => 'boolean',
            'fp_male_condom' => 'boolean',
            'fp_female_condom' => 'boolean',
            'fp_pill' => 'boolean',
            'fp_injectable' => 'boolean',
            'fp_implant' => 'boolean',
            'fp_iud' => 'boolean',
            'fp_other' => 'boolean',
            'fp_other_specify' => 'nullable|string|max:255',
            'fp_paid' => 'boolean',
            'fp_payment_amount' => 'nullable|numeric|min:0',

            // Child Immunization
            'child_name' => 'nullable|string|max:255',
            'child_dob' => 'nullable|date',
            'child_gender' => 'nullable|in:Male,Female',

            // Notes
            'remark' => 'nullable|string',
            'comments' => 'nullable|string',
        ]);

        // Add ANC visit validations for visits 1-8
        for ($i = 1; $i <= 8; $i++) {
            $request->validate([
                "anc_visit_{$i}_date" => 'nullable|date',
                "tracked_before_anc{$i}" => 'boolean',
                "anc{$i}_paid" => 'boolean',
                "anc{$i}_payment_amount" => 'nullable|numeric|min:0',
                "anc{$i}_urinalysis" => 'boolean',
                "anc{$i}_iron_folate" => 'boolean',
                "anc{$i}_mms" => 'boolean',
                "anc{$i}_sp" => 'boolean',
                "anc{$i}_sba" => 'boolean',
                "anc{$i}_hiv_test" => 'nullable|in:Yes,No',
                "anc{$i}_hiv_result_received" => 'boolean',
                "anc{$i}_hiv_result" => 'nullable|in:Positive,Negative',
            ]);

            // Add these fields to data
            $data["anc_visit_{$i}_date"] = $request->input("anc_visit_{$i}_date");
            $data["tracked_before_anc{$i}"] = (bool)$request->input("tracked_before_anc{$i}", false);
            $data["anc{$i}_paid"] = (bool)$request->input("anc{$i}_paid", false);
            $data["anc{$i}_payment_amount"] = $request->input("anc{$i}_payment_amount");
            $data["anc{$i}_urinalysis"] = (bool)$request->input("anc{$i}_urinalysis", false);
            $data["anc{$i}_iron_folate"] = (bool)$request->input("anc{$i}_iron_folate", false);
            $data["anc{$i}_mms"] = (bool)$request->input("anc{$i}_mms", false);
            $data["anc{$i}_sp"] = (bool)$request->input("anc{$i}_sp", false);
            $data["anc{$i}_sba"] = (bool)$request->input("anc{$i}_sba", false);
            $data["anc{$i}_hiv_test"] = $request->input("anc{$i}_hiv_test");
            $data["anc{$i}_hiv_result_received"] = (bool)$request->input("anc{$i}_hiv_result_received", false);
            $data["anc{$i}_hiv_result"] = $request->input("anc{$i}_hiv_result");
        }

        // Add vaccine validations
        $vaccines = [
            'bcg', 'hep0', 'opv0', 'penta1', 'pcv1', 'opv1', 'rota1', 'ipv1',
            'penta2', 'pcv2', 'rota2', 'opv2', 'penta3', 'pcv3', 'opv3', 'rota3',
            'ipv2', 'measles', 'yellow_fever', 'vitamin_a', 'mcv2'
        ];

        foreach ($vaccines as $vaccine) {
            $request->validate([
                "{$vaccine}_received" => 'boolean',
                "{$vaccine}_date" => 'nullable|date',
            ]);

            $data["{$vaccine}_received"] = (bool)$request->input("{$vaccine}_received", false);
            $data["{$vaccine}_date"] = $request->input("{$vaccine}_date");
        }

        $patient->update($data);

        return redirect()->route('admin.patients.index')->with('success', 'Patient record updated successfully!');
    }

    /**
     * Delete a patient record (Admin view)
     */
    public function destroyPatient($id)
    {
        $patient = Patient::findOrFail($id);
        $patient->delete();

        return redirect()->route('admin.patients.index')->with('success', 'Patient record deleted successfully!');
    }

    /**
     * Export patients data
     */
    public function exportPatients(Request $request)
    {
        $query = Patient::with(['lga', 'ward', 'healthFacility']);

        // Apply filters same as allPatients method
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
        }

        if ($facility = $request->input('facility')) {
            $query->where('health_facility_id', $facility);
        }

        $patients = $query->get();

        $fileName = 'all-patients-' . now()->format('Y-m-d') . '.csv';
        
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ];

        $callback = function() use ($patients) {
            $file = fopen('php://output', 'w');
            
            // Add BOM for Excel compatibility
            fwrite($file, "\xEF\xBB\xBF");
            
            // Add CSV headers with comprehensive fields
            fputcsv($file, [
                'Unique ID', 'Woman Name', 'Age', 'Literacy Status', 'Phone Number',
                'Husband Name', 'Husband Phone', 'Community', 'Address',
                'LGA', 'Ward', 'Health Facility', 'Gravida', 'Parity',
                'Registration Date', 'EDD', 
                'ANC1 Date', 'ANC1 Paid', 'ANC1 Amount', 'ANC1 HIV Test', 'ANC1 HIV Result',
                'ANC2 Date', 'ANC2 Paid', 'ANC2 Amount', 'ANC2 HIV Test', 'ANC2 HIV Result',
                'ANC3 Date', 'ANC3 Paid', 'ANC3 Amount', 'ANC3 HIV Test', 'ANC3 HIV Result',
                'ANC4 Date', 'ANC4 Paid', 'ANC4 Amount', 'ANC4 HIV Test', 'ANC4 HIV Result',
                'ANC5 Date', 'ANC6 Date', 'ANC7 Date', 'ANC8 Date',
                'Place of Delivery', 'Delivery Outcome', 'Date of Delivery',
                'Delivery Kits Received', 'PNC1 Date', 'PNC2 Date',
                'Health Insurance', 'Insurance Type', 'Insurance Satisfied',
                'FP Interested', 'FP Using', 'FP Method', 'FP Paid', 'FP Amount',
                'Child Name', 'Child DOB', 'Child Gender', 'BCG Received',
                'Remark', 'Comments'
            ]);

            // Add data rows
            foreach ($patients as $patient) {
                // Determine FP method
                $fpMethod = '';
                if ($patient->fp_male_condom) $fpMethod .= 'Male Condom, ';
                if ($patient->fp_female_condom) $fpMethod .= 'Female Condom, ';
                if ($patient->fp_pill) $fpMethod .= 'Pill, ';
                if ($patient->fp_injectable) $fpMethod .= 'Injectable, ';
                if ($patient->fp_implant) $fpMethod .= 'Implant, ';
                if ($patient->fp_iud) $fpMethod .= 'IUD, ';
                if ($patient->fp_other) $fpMethod .= 'Other: ' . ($patient->fp_other_specify ?? '');
                $fpMethod = rtrim($fpMethod, ', ');

                fputcsv($file, [
                    $patient->unique_id,
                    $patient->woman_name,
                    $patient->age,
                    $patient->literacy_status,
                    $patient->phone_number,
                    $patient->husband_name ?? '',
                    $patient->husband_phone ?? '',
                    $patient->community,
                    $patient->address,
                    $patient->lga->name ?? 'N/A',
                    $patient->ward->name ?? 'N/A',
                    $patient->healthFacility->clinic_name ?? 'N/A',
                    $patient->gravida ?? '',
                    $patient->parity ?? '',
                    $patient->date_of_registration,
                    $patient->edd,
                    // ANC1
                    $patient->anc_visit_1_date ?? '',
                    $patient->anc1_paid ? 'Yes' : 'No',
                    $patient->anc1_payment_amount ?? '',
                    $patient->anc1_hiv_test ?? '',
                    $patient->anc1_hiv_result ?? '',
                    // ANC2
                    $patient->anc_visit_2_date ?? '',
                    $patient->anc2_paid ? 'Yes' : 'No',
                    $patient->anc2_payment_amount ?? '',
                    $patient->anc2_hiv_test ?? '',
                    $patient->anc2_hiv_result ?? '',
                    // ANC3
                    $patient->anc_visit_3_date ?? '',
                    $patient->anc3_paid ? 'Yes' : 'No',
                    $patient->anc3_payment_amount ?? '',
                    $patient->anc3_hiv_test ?? '',
                    $patient->anc3_hiv_result ?? '',
                    // ANC4
                    $patient->anc_visit_4_date ?? '',
                    $patient->anc4_paid ? 'Yes' : 'No',
                    $patient->anc4_payment_amount ?? '',
                    $patient->anc4_hiv_test ?? '',
                    $patient->anc4_hiv_result ?? '',
                    // Additional ANC
                    $patient->anc_visit_5_date ?? '',
                    $patient->anc_visit_6_date ?? '',
                    $patient->anc_visit_7_date ?? '',
                    $patient->anc_visit_8_date ?? '',
                    // Delivery
                    $patient->place_of_delivery ?? '',
                    $patient->delivery_outcome ?? '',
                    $patient->date_of_delivery ?? '',
                    $patient->delivery_kits_received ? 'Yes' : 'No',
                    $patient->pnc_visit_1 ?? '',
                    $patient->pnc_visit_2 ?? '',
                    // Insurance
                    $patient->health_insurance_status,
                    $patient->insurance_type ?? '',
                    $patient->insurance_satisfaction ? 'Yes' : 'No',
                    // Family Planning
                    $patient->fp_interest ?? '',
                    $patient->fp_using ? 'Yes' : 'No',
                    $fpMethod,
                    $patient->fp_paid ? 'Yes' : 'No',
                    $patient->fp_payment_amount ?? '',
                    // Child
                    $patient->child_name ?? '',
                    $patient->child_dob ?? '',
                    $patient->child_gender ?? '',
                    $patient->bcg_received ? 'Yes' : 'No',
                    // Notes
                    $patient->remark ?? '',
                    $patient->comments ?? ''
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Display statistics page (simplified version)
     */
    public function statistics()
    {
        $currentYear = now()->year;
        
        // Get basic statistics for the state
        $totalPatients = Patient::whereYear('date_of_registration', $currentYear)->count();
        $totalDelivered = Patient::whereYear('date_of_registration', $currentYear)
                                ->whereNotNull('date_of_delivery')
                                ->count();
        $anc4Completed = Patient::whereYear('date_of_registration', $currentYear)
                               ->whereNotNull('anc_visit_4_date')
                               ->count();

        $statistics = [
            'totalRegistered' => $totalPatients,
            'totalDelivered' => $totalDelivered,
            'anc4Completed' => $anc4Completed,
            'anc4Rate' => $totalPatients > 0 ? round(($anc4Completed / $totalPatients) * 100, 1) : 0,
            'deliveryRate' => $totalPatients > 0 ? round(($totalDelivered / $totalPatients) * 100, 1) : 0,
        ];

        return Inertia::render('Admin/Statistics', [
            'statistics' => $statistics,
            'currentYear' => $currentYear,
        ]);
    }
}