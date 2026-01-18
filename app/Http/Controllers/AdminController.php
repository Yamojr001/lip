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
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Arr;

class AdminController extends Controller
{
    /**
     * Render Admin Dashboard Home with Comprehensive Statistics for entire state
     */
    public function index()
    {
        // Remove year filter to include ALL patients
        $patients = Patient::with(['lga', 'ward', 'healthFacility'])->latest()->take(10)->get();
        $allPatients = Patient::all();
        $currentYear = now()->year;

        // Calculate comprehensive statistics and chart data
        $dashboardData = $this->getAdminComprehensiveStatistics($allPatients, $currentYear);
        
        // Get basic stats for dashboard
        $totalFacilities = Phc::count();
        $totalStaff = User::where('role', 'phc_staff')->count();
        $totalLgas = Lga::count();
        $totalWards = Ward::count();

        // Get facilities for facilities tab
        $facilities = Phc::with(['ward.lga'])->get();

        // Get detailed data for all tabs
        $ancData = $this->getAncDetailedData($allPatients);
        $deliveryData = $this->getDeliveryDetailedData($allPatients);
        $immunizationData = $this->getImmunizationDetailedData($allPatients);
        $fpData = $this->getFamilyPlanningDetailedData($allPatients);
        $hivData = $this->getHivDetailedData($allPatients);
        $facilityStats = $this->getFacilityPerformanceStats($facilities);

        return Inertia::render('Admin/Dashboard', [
            'statistics' => array_merge($dashboardData['statistics'], [
                'totalFacilities' => $totalFacilities,
                'totalLgas' => $totalLgas,
                'totalWards' => $totalWards,
                'totalStaff' => $totalStaff,
            ]),
            'chartData' => $dashboardData['chartData'],
            'currentYear' => $currentYear,
            'patients' => $patients,
            'facilities' => $facilities,
            'ancData' => $ancData,
            'deliveryData' => $deliveryData,
            'immunizationData' => $immunizationData,
            'fpData' => $fpData,
            'hivData' => $hivData,
            'facilityStats' => $facilityStats,
        ]);
    }

    /**
     * Calculate comprehensive statistics and chart data for the Admin Dashboard.
     * @param Collection $patients
     * @param int $currentYear
     * @return array
     */
    private function getAdminComprehensiveStatistics(Collection $patients, int $currentYear): array
    {
        $totalRegistered = $patients->count();
        
        if ($totalRegistered === 0) {
            return $this->generateEmptyDashboardData($currentYear);
        }

        $delivered = $patients->whereNotNull('date_of_delivery')->count();

        // Core KPIs - Updated for disaggregated delivery places
        $registeredFacilityDeliveries = $patients->where('place_of_delivery', 'Registered Facility')->count();
        $homeDeliveries = $patients->where('place_of_delivery', 'Home')->count();
        $otherFacilityDeliveries = $patients->where('place_of_delivery', 'Other Facility')->count();
        $traditionalDeliveries = $patients->where('place_of_delivery', 'Traditional Attendant')->count();
        // Legacy support
        $legacyFacilityDeliveries = $patients->where('place_of_delivery', 'Health Facility')->count();
        $facilityDeliveries = $registeredFacilityDeliveries + $legacyFacilityDeliveries + $otherFacilityDeliveries;
        
        $liveBirths = $patients->where('delivery_outcome', 'Live birth')->count();
        $stillbirths = $patients->where('delivery_outcome', 'Stillbirth')->count();
        
        $deliveryRate = $totalRegistered > 0 ? round(($delivered / $totalRegistered) * 100, 1) : 0;
        $facilityDeliveryRate = $delivered > 0 ? round(($facilityDeliveries / $delivered) * 100, 1) : 0;
        $liveBirthRate = $delivered > 0 ? round(($liveBirths / $delivered) * 100, 1) : 0;

        // ANC Completion Breakdown (Exclusive counts - highest visit reached)
        $ancCompletionStats = $this->getAncCompletionStats($patients);
        
        // Individual ANC visit counts (1-8)
        $ancVisitsBreakdown = $this->getAncVisitsBreakdown($patients);
        $anc8CompletedCount = $ancVisitsBreakdown['anc8'] ?? 0;
        $anc8Rate = $totalRegistered > 0 ? round(($anc8CompletedCount / $totalRegistered) * 100, 1) : 0;

        // Pregnancy Tracking
        $pregnancyTracking = $this->getPregnancyTrackingStats($patients);
        
        // Delivery Kits
        $kitsReceived = $patients->where('delivery_kits_received', true)->count();
        $kitsReceivedRate = $delivered > 0 ? round(($kitsReceived / $delivered) * 100, 1) : 0;

        // PNC Statistics
        $pncVisitCompletion = $this->getPncVisitCompletion($patients, $delivered);
        $incompletePNCs = $this->getPncIncompleteCount($patients, $delivered);
        $pnc1CompletionRate = $pncVisitCompletion['pnc1_rate'];

        // HIV Status
        $hivTestOutcomes = $this->getHivTestOutcomes($patients);
        $hivPositiveCases = $hivTestOutcomes['Positive'] ?? 0;
        $hivPositiveRate = ($hivTestOutcomes['Total Tested'] > 0) ? round(($hivTestOutcomes['Positive'] / $hivTestOutcomes['Total Tested']) * 100, 1) : 0;

        // Family Planning
        $totalFpUsers = $patients->where('fp_using', true)->count();
        $fpUptakeRate = $totalRegistered > 0 ? round(($totalFpUsers / $totalRegistered) * 100, 1) : 0;
        $fpMethodsUsage = $this->getFpMethodsDistribution($patients);

        // Immunization
        $immunizationCoverageDetails = $this->getImmunizationCoverageDetails($patients);
        $bcgImmunizationRate = $immunizationCoverageDetails['bcg_received']['rate'] ?? 0;

        // Insurance
        $healthInsuranceEnrollment = $this->getHealthInsuranceEnrollment($patients);
        $insuranceEnrollmentRate = $totalRegistered > 0 ? round((($healthInsuranceEnrollment['Enrolled'] ?? 0) / $totalRegistered) * 100, 1) : 0;
        
        // Literacy
        $literacyStatusDistribution = $this->getLiteracyStatusDistribution($patients);
        $literacyRate = $totalRegistered > 0 ? round((($literacyStatusDistribution['Literate'] ?? 0) / $totalRegistered) * 100, 1) : 0;
        
        // Age Distribution
        $ageDistribution = $this->getAgeDistribution($patients);
        $averageAge = $this->calculateAverageAge($patients);

        // Delivery Type Distribution
        $deliveryTypeDistribution = $this->getDeliveryTypeDistribution($patients);

        // Delivery Kits Received Stats
        $deliveryKitsReceivedStats = $this->getDeliveryKitsReceivedStats($patients);

        // Trends (Year-over-Year simplified for admin dashboard)
        $trends = $this->calculateTrends($currentYear);

        $statistics = [
            'totalRegistered' => $totalRegistered,
            'anc4Rate' => ($ancVisitsBreakdown['anc4'] ?? 0) > 0 ? round((($ancVisitsBreakdown['anc4'] ?? 0) / $totalRegistered) * 100, 1) : 0,
            'anc8Rate' => $anc8Rate,
            'facilityDeliveryRate' => $facilityDeliveryRate,
            'liveBirthRate' => $liveBirthRate,
            'fpUptakeRate' => $fpUptakeRate,
            'bcgImmunizationRate' => $bcgImmunizationRate,
            'hivPositiveRate' => $hivPositiveRate,
            'hivPositiveCases' => $hivPositiveCases, // For alert
            'insuranceEnrollmentRate' => $insuranceEnrollmentRate,
            'pnc1CompletionRate' => $pnc1CompletionRate,
            'literacyRate' => $literacyRate,
            'averageAge' => $averageAge,

            'ancCompletion' => $ancCompletionStats, // Highest completed exclusive counts
            'pregnancyTracking' => [
                'sevenMonths' => $pregnancyTracking['sevenMonths'],
                'eightMonths' => $pregnancyTracking['eightMonths'],
                'dueThisMonth' => $pregnancyTracking['dueThisMonth'],
                'overdueDeliveries' => $pregnancyTracking['overdueDeliveries'],
                'highRiskPregnancies' => $pregnancyTracking['highRisk'],
                'pendingAnc8' => $pregnancyTracking['pendingAnc8'],
            ],
            'overdueDeliveries' => $pregnancyTracking['overdueDeliveries'],
            'highRiskPregnancies' => $pregnancyTracking['highRisk'],
            'pendingAnc8' => $pregnancyTracking['pendingAnc8'],
            'incompletePNCs' => $incompletePNCs,

            'detailedCounts' => [
                'totalDelivered' => $delivered,
                'stillbirths' => $stillbirths,
                'liveBirths' => $liveBirths,
                'hospitalDeliveries' => $facilityDeliveries,
                'kitsReceived' => $kitsReceived,
                'pnc1Within48h' => $pncVisitCompletion['pnc1_within_48h'] ?? 0,
            ],
            'serviceUtilization' => $this->getAdminServiceUtilization($patients),
            'trends' => $trends,
            'ancVisitsBreakdown' => $ancVisitsBreakdown,
        ];

        $chartData = [
            'monthlyRegistrations' => $this->getMonthlyRegistrationsChartData($patients, $currentYear),
            'deliveryOutcomes' => $this->formatForRecharts($this->getDeliveryOutcomeDistribution($patients)),
            'deliveryLocations' => $this->formatForRecharts($this->getDeliveryLocationDistribution($patients)),
            'ancVisitCompletion' => $this->formatForRecharts($ancVisitsBreakdown, ['anc5plus']), // Exclude anc5plus from chart
            'ancServices' => $this->formatForRecharts($this->getAncServiceCounts($patients)),
            'hivStatus' => $this->formatForRecharts($hivTestOutcomes, ['Total Tested']),
            'familyPlanning' => $this->formatForRecharts($fpMethodsUsage),
            'immunizationCoverage' => $this->formatImmunizationCoverageForRecharts($immunizationCoverageDetails),
            'pncCompletion' => $this->formatPncCompletionForRecharts($pncVisitCompletion),
            'insuranceEnrollmentType' => $this->formatForRecharts($healthInsuranceEnrollment, ['Enrolled', 'Not Enrolled']),
            'literacyStatusDistribution' => $this->formatForRecharts($literacyStatusDistribution),
            'ageDistribution' => $this->formatForRecharts($ageDistribution),
            'deliveryTypeDistribution' => $this->formatForRecharts($deliveryTypeDistribution),
            'deliveryKitsReceived' => $this->formatForRecharts($deliveryKitsReceivedStats),
        ];

        return compact('statistics', 'chartData');
    }

    /**
     * Generate empty dashboard data structure for when no patients are found.
     * @param int $currentYear
     * @return array
     */
    private function generateEmptyDashboardData(int $currentYear): array
    {
        // Populate monthly registrations with 0s for chart display even if no data
        $emptyMonthlyReg = [];
        for ($month = 1; $month <= 12; $month++) {
            $monthKey = $currentYear . '-' . str_pad($month, 2, '0', STR_PAD_LEFT);
            $emptyMonthlyReg[$monthKey] = 0;
        }

        return [
            'statistics' => [
                'totalRegistered' => 0, 'anc4Rate' => 0, 'anc8Rate' => 0, 'facilityDeliveryRate' => 0,
                'liveBirthRate' => 0, 'fpUptakeRate' => 0, 'bcgImmunizationRate' => 0,
                'hivPositiveRate' => 0, 'hivPositiveCases' => 0, 'insuranceEnrollmentRate' => 0,
                'pnc1CompletionRate' => 0, 'literacyRate' => 0, 'averageAge' => null,

                'overdueDeliveries' => 0, 'highRiskPregnancies' => 0, 'pendingAnc8' => 0, 'incompletePNCs' => 0,

                'ancCompletion' => array_fill_keys(['anc1Only', 'anc2Only', 'anc3Only', 'anc4Only', 'anc5Only', 'anc6Only', 'anc7Only', 'anc8Completed', 'noAnc'], 0),
                'pregnancyTracking' => ['sevenMonths' => 0, 'eightMonths' => 0, 'dueThisMonth' => 0, 'overdueDeliveries' => 0, 'highRisk' => 0, 'pendingAnc8' => 0],
                'detailedCounts' => [
                    'totalDelivered' => 0, 'stillbirths' => 0, 'liveBirths' => 0, 'hospitalDeliveries' => 0,
                    'kitsReceived' => 0, 'pnc1Within48h' => 0,
                ],
                'serviceUtilization' => array_fill_keys(['ANC Services', 'Delivery Services', 'PNC Services', 'FP Services', 'Immunization Services', 'HIV Testing'], 0),
                'trends' => [
                    'totalPatients' => 0, 'anc8CompletionRate' => 0, 'facilityDeliveryRate' => 0,
                    'liveBirths' => 0, 'fpUptakeRate' => 0, 'bcgImmunization' => 0,
                    'hivPositiveCases' => 0, 'insuranceEnrollmentRate' => 0,
                ],
            ],
            'chartData' => [
                'monthlyRegistrations' => $emptyMonthlyReg,
                'deliveryOutcomes' => [], 'deliveryLocations' => [], 'ancVisitCompletion' => [],
                'ancServices' => [], 'hivStatus' => [], 'familyPlanning' => [],
                'immunizationCoverage' => [], 'pncCompletion' => [], 'insuranceEnrollmentType' => [],
                'literacyStatusDistribution' => [], 'ageDistribution' => [], 'deliveryTypeDistribution' => [],
                'deliveryKitsReceived' => [],
            ],
        ];
    }

    /**
     * Get ANC completion stats based on highest visit reached.
     * @param Collection $patients
     * @return array
     */
    private function getAncCompletionStats(Collection $patients): array
    {
        $stats = [
            'anc1Only' => 0, 'anc2Only' => 0, 'anc3Only' => 0, 'anc4Only' => 0,
            'anc5Only' => 0, 'anc6Only' => 0, 'anc7Only' => 0, 'anc8Completed' => 0,
            'noAnc' => 0,
        ];

        foreach ($patients as $patient) {
            $highestAnc = 0;
            for ($i = 8; $i >= 1; $i--) {
                if (!empty($patient->{"anc_visit_{$i}_date"})) {
                    $highestAnc = $i;
                    break;
                }
            }

            if ($highestAnc > 0) {
                if ($highestAnc == 8) {
                    $stats['anc8Completed']++;
                } else {
                    $stats["anc{$highestAnc}Only"]++;
                }
            } else {
                $stats['noAnc']++;
            }
        }
        return $stats;
    }

    /**
     * Get ANC visits breakdown for visits 1-8 (robust version).
     * @param Collection $patients
     * @return array
     */
    private function getAncVisitsBreakdown(Collection $patients): array
    {
        $breakdown = [];
        
        for ($i = 1; $i <= 8; $i++) {
            $fieldName = "anc_visit_{$i}_date";
            $breakdown["anc{$i}"] = $patients->filter(function ($patient) use ($fieldName) {
                $dateValue = $patient->$fieldName;
                return !empty($dateValue) && $dateValue !== null && trim($dateValue) !== '';
            })->count();
        }
        
        $breakdown['anc5plus'] = $patients->sum('additional_anc_count'); // Sum of additional counts
        
        return $breakdown;
    }

    /**
     * Get pregnancy tracking statistics.
     * @param Collection $patients
     * @return array
     */
    private function getPregnancyTrackingStats(Collection $patients): array
    {
        $sevenMonths = $patients->filter(function ($patient) {
            return $this->calculatePregnancyMonth($patient) == 7 && !$patient->date_of_delivery;
        })->count();
        $eightMonths = $patients->filter(function ($patient) {
            return $this->calculatePregnancyMonth($patient) == 8 && !$patient->date_of_delivery;
        })->count();
        $dueThisMonth = $patients->filter(function ($patient) {
            return $this->isDueThisMonth($patient) && !$patient->date_of_delivery;
        })->count();
        $overdueDeliveries = $patients->filter(function($patient) {
            return !$patient->date_of_delivery && $patient->edd && Carbon::parse($patient->edd)->isPast();
        })->count();

        $highRisk = $patients->filter(function($patient) {
            $age = $patient->age;
            $isOlder = $age && $age >= 35;
            $isYounger = $age && $age <= 18;
            $pregnancyMonth = $this->calculatePregnancyMonth($patient);
            
            return (!$patient->date_of_delivery && ($isOlder || $isYounger) && ($pregnancyMonth >= 7 && $pregnancyMonth <=9));
        })->count();

        $pendingAnc8 = $patients->filter(function($patient) {
            $pregnancyMonth = $this->calculatePregnancyMonth($patient);
            return !$patient->date_of_delivery && $pregnancyMonth >= 8 && (!($patient->anc_visit_8_date) || empty($patient->anc_visit_8_date));
        })->count();

        return [
            'sevenMonths' => $sevenMonths,
            'eightMonths' => $eightMonths,
            'dueThisMonth' => $dueThisMonth,
            'overdueDeliveries' => $overdueDeliveries,
            'highRisk' => $highRisk,
            'pendingAnc8' => $pendingAnc8,
        ];
    }

    /**
     * Get ANC services provided counts.
     * @param Collection $patients
     * @return array
     */
    private function getAncServiceCounts(Collection $patients): array
    {
        $serviceCounts = [
            'Urinalysis' => 0, 'Iron Folate' => 0, 'MMS' => 0, 'SP' => 0, 'SBA' => 0
        ];

        foreach ($patients as $patient) {
            for ($i = 1; $i <= 8; $i++) {
                if ($patient->{"anc{$i}_urinalysis"}) $serviceCounts['Urinalysis']++;
                if ($patient->{"anc{$i}_iron_folate"}) $serviceCounts['Iron Folate']++;
                if ($patient->{"anc{$i}_mms"}) $serviceCounts['MMS']++;
                if ($patient->{"anc{$i}_sp"}) $serviceCounts['SP']++;
                if ($patient->{"anc{$i}_sba"}) $serviceCounts['SBA']++;
            }
        }
        return $serviceCounts;
    }

    /**
     * Get delivery outcome distribution.
     * @param Collection $patients
     * @return array
     */
    private function getDeliveryOutcomeDistribution(Collection $patients): array
    {
        return $patients->whereNotNull('delivery_outcome')
                        ->countBy('delivery_outcome')
                        ->toArray();
    }

    /**
     * Get delivery location distribution.
     * @param Collection $patients
     * @return array
     */
    private function getDeliveryLocationDistribution(Collection $patients): array
    {
        return $patients->whereNotNull('place_of_delivery')
                        ->countBy('place_of_delivery')
                        ->toArray();
    }

    /**
     * Get PNC visit completion counts and rates.
     * @param Collection $patients
     * @param int $deliveredCount
     * @return array
     */
    private function getPncVisitCompletion(Collection $patients, int $deliveredCount): array
    {
        $pnc1_received = $patients->whereNotNull('date_of_delivery')->whereNotNull('pnc_visit_1')->count();
        $pnc2_received = $patients->whereNotNull('date_of_delivery')->whereNotNull('pnc_visit_2')->count();
        $pnc3_received = $patients->whereNotNull('date_of_delivery')->whereNotNull('pnc_visit_3')->count();

        return [
            'pnc1_received' => $pnc1_received,
            'pnc2_received' => $pnc2_received,
            'pnc3_received' => $pnc3_received,
            'pnc1_rate' => $deliveredCount > 0 ? round(($pnc1_received / $deliveredCount) * 100, 1) : 0,
            'pnc2_rate' => $deliveredCount > 0 ? round(($pnc2_received / $deliveredCount) * 100, 1) : 0,
            'pnc3_rate' => $deliveredCount > 0 ? round(($pnc3_received / $deliveredCount) * 100, 1) : 0,
            'pnc1_within_48h' => $patients->whereNotNull('date_of_delivery')->filter(function ($patient) {
                return $patient->date_of_delivery && $patient->pnc_visit_1 && 
                       Carbon::parse($patient->pnc_visit_1)->diffInHours(Carbon::parse($patient->date_of_delivery)) <= 48;
            })->count(),
        ];
    }

    /**
     * Get count of delivered patients with incomplete PNCs.
     * @param Collection $patients
     * @param int $deliveredCount
     * @return int
     */
    private function getPncIncompleteCount(Collection $patients, int $deliveredCount): int
    {
        // A patient has incomplete PNCs if they delivered but at least one of PNC1, PNC2, PNC3 is null
        return $patients->whereNotNull('date_of_delivery')
                        ->filter(function($patient) {
                            return is_null($patient->pnc_visit_1) || is_null($patient->pnc_visit_2) || is_null($patient->pnc_visit_3);
                        })->count();
    }

    /**
     * Get HIV test outcomes.
     * @param Collection $patients
     * @return array
     */
    private function getHivTestOutcomes(Collection $patients): array
    {
        $outcomes = [
            'Positive' => 0,
            'Negative' => 0,
            'Not Tested' => 0, // No HIV test explicitly recorded
            'Results Not Received' => 0, // Tested, but result not yet received
            'Total Tested' => 0, // Any patient who has "Yes" for HIV test in any ANC
        ];

        $patientsWithAnyHivTest = collect(); // To avoid double counting 'Not Tested'

        foreach ($patients as $patient) {
            $hasAnyTest = false;
            for ($i = 1; $i <= 8; $i++) {
                $hivTestField = "anc{$i}_hiv_test";
                $hivResultReceivedField = "anc{$i}_hiv_result_received";
                $hivResultField = "anc{$i}_hiv_result";

                if ($patient->$hivTestField === 'Yes') {
                    $outcomes['Total Tested']++; // Count every test instance
                    $hasAnyTest = true;

                    if ($patient->$hivResultReceivedField) {
                        if ($patient->$hivResultField === 'Positive') {
                            $outcomes['Positive']++;
                        } elseif ($patient->$hivResultField === 'Negative') {
                            $outcomes['Negative']++;
                        }
                    } else {
                        $outcomes['Results Not Received']++;
                    }
                }
            }
            if ($hasAnyTest) {
                $patientsWithAnyHivTest->push($patient->id);
            }
        }

        // 'Not Tested' are patients who never had a 'Yes' for hiv_test across all ANCs.
        // We need unique patients for this count to match frontend logic.
        $totalRegistered = $patients->count();
        $outcomes['Not Tested'] = $totalRegistered - $patientsWithAnyHivTest->unique()->count();
        
        return $outcomes;
    }

    /**
     * Get family planning methods distribution.
     * @param Collection $patients
     * @return array
     */
    private function getFpMethodsDistribution(Collection $patients): array
    {
        $methods = [
            'Male Condom' => 0, 'Female Condom' => 0, 'Pill' => 0,
            'Injectable' => 0, 'Implant' => 0, 'IUD' => 0, 'Other' => 0
        ];

        foreach ($patients as $patient) {
            if ($patient->fp_using) {
                if ($patient->fp_male_condom) $methods['Male Condom']++;
                if ($patient->fp_female_condom) $methods['Female Condom']++;
                if ($patient->fp_pill) $methods['Pill']++;
                if ($patient->fp_injectable) $methods['Injectable']++;
                if ($patient->fp_implant) $methods['Implant']++;
                if ($patient->fp_iud) $methods['IUD']++;
                if ($patient->fp_other) $methods['Other']++;
            }
        }
        return array_filter($methods); // Remove methods with 0 count
    }

    /**
     * Get health insurance enrollment statistics.
     * @param Collection $patients
     * @return array
     */
    private function getHealthInsuranceEnrollment(Collection $patients): array
    {
        $stats = [
            'Enrolled' => 0,
            'Not Enrolled' => 0,
            'Kachima' => 0,
            'NHIS' => 0,
            'Others' => 0,
        ];

        foreach ($patients as $patient) {
            if ($patient->health_insurance_status === 'Yes') {
                $stats['Enrolled']++;
                if (!empty($patient->insurance_type)) {
                    $stats[$patient->insurance_type] = ($stats[$patient->insurance_type] ?? 0) + 1;
                }
            } else {
                $stats['Not Enrolled']++;
            }
        }
        return $stats;
    }

    /**
     * Get detailed child immunization coverage.
     * @param Collection $patients
     * @return array
     */
    private function getImmunizationCoverageDetails(Collection $patients): array
    {
        $childrenWithDobCount = $patients->whereNotNull('child_dob')->count();
        $coverage = [];

        $vaccines = [
            'bcg', 'hep0', 'opv0', 'penta1', 'pcv1', 'opv1', 'rota1', 'ipv1',
            'penta2', 'pcv2', 'rota2', 'opv2', 'penta3', 'pcv3', 'opv3', 'rota3',
            'ipv2', 'measles', 'yellow_fever', 'vitamin_a', 'mcv2'
        ];

        foreach ($vaccines as $vaccine) {
            $receivedCount = $patients->where("{$vaccine}_received", true)->count();
            $coverage["{$vaccine}_received"] = [
                'count' => $receivedCount,
                'rate' => $childrenWithDobCount > 0 ? round(($receivedCount / $childrenWithDobCount) * 100, 1) : 0
            ];
        }
        return $coverage;
    }

    /**
     * Get literacy status distribution.
     * @param Collection $patients
     * @return array
     */
    private function getLiteracyStatusDistribution(Collection $patients): array
    {
        return $patients->countBy('literacy_status')->toArray();
    }

    /**
     * Get age distribution in ranges.
     * @param Collection $patients
     * @return array
     */
    private function getAgeDistribution(Collection $patients): array
    {
        $ageGroups = [
            '15-19' => 0, '20-24' => 0, '25-29' => 0, '30-34' => 0,
            '35-39' => 0, '40-44' => 0, '45-50' => 0, 'Other' => 0
        ];

        foreach ($patients as $patient) {
            if ($patient->age >= 15 && $patient->age <= 19) $ageGroups['15-19']++;
            elseif ($patient->age >= 20 && $patient->age <= 24) $ageGroups['20-24']++;
            elseif ($patient->age >= 25 && $patient->age <= 29) $ageGroups['25-29']++;
            elseif ($patient->age >= 30 && $patient->age <= 34) $ageGroups['30-34']++;
            elseif ($patient->age >= 35 && $patient->age <= 39) $ageGroups['35-39']++;
            elseif ($patient->age >= 40 && $patient->age <= 44) $ageGroups['40-44']++;
            elseif ($patient->age >= 45 && $patient->age <= 50) $ageGroups['45-50']++;
            else $ageGroups['Other']++;
        }
        return $ageGroups;
    }

    /**
     * Calculate average age of patients.
     * @param Collection $patients
     * @return float|null
     */
    private function calculateAverageAge(Collection $patients): ?float
    {
        return $patients->avg('age');
    }

    /**
     * Get delivery type distribution.
     * @param Collection $patients
     * @return array
     */
    private function getDeliveryTypeDistribution(Collection $patients): array
    {
        return $patients->whereNotNull('type_of_delivery')
                        ->countBy('type_of_delivery')
                        ->toArray();
    }

    /**
     * Get delivery kits received statistics.
     * @param Collection $patients
     * @return array
     */
    private function getDeliveryKitsReceivedStats(Collection $patients): array
    {
        $stats = [
            'Yes' => $patients->where('delivery_kits_received', true)->count(),
            'No' => $patients->where('delivery_kits_received', false)->count(),
        ];
        return $stats;
    }

    /**
     * Get monthly registrations data formatted for Recharts.
     * @param Collection $patients
     * @param int $currentYear
     * @return array
     */
    private function getMonthlyRegistrationsChartData(Collection $patients, int $currentYear): array
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
     * Get service utilization for Admin.
     * @param Collection $patients
     * @return array
     */
    private function getAdminServiceUtilization(Collection $patients): array
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
     * Helper to format key-value arrays for Recharts (name, value).
     * Excludes specified keys from the output.
     * @param array $data
     * @param array $excludeKeys
     * @return array
     */
    private function formatForRecharts(array $data, array $excludeKeys = []): array
    {
        $formatted = [];
        foreach ($data as $key => $value) {
            if (!in_array($key, $excludeKeys)) {
                $formatted[] = ['name' => $key, 'value' => $value];
            }
        }
        return $formatted;
    }

    /**
     * Helper to format immunization coverage for Recharts.
     * @param array $immunizationCoverageDetails
     * @return array
     */
    private function formatImmunizationCoverageForRecharts(array $immunizationCoverageDetails): array
    {
        $formatted = [];
        $keyVaccines = ['bcg_received', 'penta1_received', 'measles_received', 'yellow_fever_received', 'mcv2_received']; // Focus on key ones for dashboard

        foreach ($keyVaccines as $key) {
            if (isset($immunizationCoverageDetails[$key])) {
                $name = str_replace('_received', '', $key);
                $name = ucwords(str_replace('_', ' ', $name));
                $formatted[] = ['name' => $name, 'value' => $immunizationCoverageDetails[$key]['rate']];
            }
        }
        return $formatted;
    }

    /**
     * Helper to format PNC completion for Recharts.
     * @param array $pncVisitCompletion
     * @return array
     */
    private function formatPncCompletionForRecharts(array $pncVisitCompletion): array
    {
        $formatted = [];
        if (isset($pncVisitCompletion['pnc1_received'])) $formatted[] = ['name' => 'PNC1', 'value' => $pncVisitCompletion['pnc1_received']];
        if (isset($pncVisitCompletion['pnc2_received'])) $formatted[] = ['name' => 'PNC2', 'value' => $pncVisitCompletion['pnc2_received']];
        if (isset($pncVisitCompletion['pnc3_received'])) $formatted[] = ['name' => 'PNC3', 'value' => $pncVisitCompletion['pnc3_received']];
        return $formatted;
    }

    /**
     * Calculate trends (Year-over-Year comparison).
     * @param int $currentYear
     * @return array
     */
    private function calculateTrends(int $currentYear): array
    {
        $previousYear = $currentYear - 1;
        
        $currentYearPatients = Patient::whereYear('date_of_registration', $currentYear)->get();
        $previousYearPatients = Patient::whereYear('date_of_registration', $previousYear)->get();
        
        // Helper to get stats for a given patient collection
        $getStatsForYear = function (Collection $patients) {
            $total = $patients->count();
            $delivered = $patients->whereNotNull('date_of_delivery')->count();
            $facilityDeliveries = $patients->where('place_of_delivery', 'Health Facility')->count();
            $liveBirths = $patients->where('delivery_outcome', 'Live birth')->count();
            $anc8Completed = $this->getAncVisitsBreakdown($patients)['anc8'] ?? 0;
            $fpUsers = $patients->where('fp_using', true)->count();
            $insuredPatients = $patients->where('health_insurance_status', 'Yes')->count();
            
            $childrenWithDobCount = $patients->whereNotNull('child_dob')->count();
            $bcgReceived = $patients->where('bcg_received', true)->count();
            $bcgRate = $childrenWithDobCount > 0 ? round(($bcgReceived / $childrenWithDobCount) * 100, 1) : 0;

            $hivTestOutcomes = $this->getHivTestOutcomes($patients);
            $hivPositive = $hivTestOutcomes['Positive'] ?? 0;

            return [
                'total' => $total,
                'delivered' => $delivered,
                'facilityDeliveries' => $facilityDeliveries,
                'liveBirths' => $liveBirths,
                'anc8Completed' => $anc8Completed,
                'fpUsers' => $fpUsers,
                'insuredPatients' => $insuredPatients,
                'bcgRate' => $bcgRate,
                'hivPositive' => $hivPositive,
            ];
        };

        $currentStats = $getStatsForYear($currentYearPatients);
        $previousStats = $getStatsForYear($previousYearPatients);

        // Helper for percentage change
        $getChange = function ($current, $last) {
            if ($last == 0) return $current > 0 ? 100 : 0; // If was 0, now more than 0 -> 100% increase
            return round((($current - $last) / $last) * 100, 1);
        };
        
        // Helper for absolute rate change
        $getRateChange = function ($currentRate, $lastRate) {
            return round($currentRate - $lastRate, 1);
        };

        $trends = [];
        $trends['totalPatients'] = $getChange($currentStats['total'], $previousStats['total']);
        $trends['liveBirths'] = $getChange($currentStats['liveBirths'], $previousStats['liveBirths']);
        $trends['hivPositiveCases'] = $getChange($currentStats['hivPositive'], $previousStats['hivPositive']);

        // Rates
        $currentDeliveredPatients = $currentStats['delivered'];
        $previousDeliveredPatients = $previousStats['delivered'];
        
        $currentFacilityDeliveryRate = $currentDeliveredPatients > 0 ? ($currentStats['facilityDeliveries'] / $currentDeliveredPatients) * 100 : 0;
        $previousFacilityDeliveryRate = $previousDeliveredPatients > 0 ? ($previousStats['facilityDeliveries'] / $previousDeliveredPatients) * 100 : 0;
        $trends['facilityDeliveryRate'] = $getRateChange($currentFacilityDeliveryRate, $previousFacilityDeliveryRate);

        $currentAnc8Rate = $currentStats['total'] > 0 ? ($currentStats['anc8Completed'] / $currentStats['total']) * 100 : 0;
        $previousAnc8Rate = $previousStats['total'] > 0 ? ($previousStats['anc8Completed'] / $previousStats['total']) * 100 : 0;
        $trends['anc8CompletionRate'] = $getRateChange($currentAnc8Rate, $previousAnc8Rate);

        $currentFpUptakeRate = $currentStats['total'] > 0 ? ($currentStats['fpUsers'] / $currentStats['total']) * 100 : 0;
        $previousFpUptakeRate = $previousStats['total'] > 0 ? ($previousStats['fpUsers'] / $previousStats['total']) * 100 : 0;
        $trends['fpUptakeRate'] = $getRateChange($currentFpUptakeRate, $previousFpUptakeRate);

        $currentInsuranceEnrollmentRate = $currentStats['total'] > 0 ? ($currentStats['insuredPatients'] / $currentStats['total']) * 100 : 0;
        $previousInsuranceEnrollmentRate = $previousStats['total'] > 0 ? ($previousStats['insuredPatients'] / $previousStats['total']) * 100 : 0;
        $trends['insuranceEnrollmentRate'] = $getRateChange($currentInsuranceEnrollmentRate, $previousInsuranceEnrollmentRate);

        // BCG trend needs children count from previous year, more complex, so keeping it null for now or basic change
        $trends['bcgImmunization'] = $getRateChange($currentStats['bcgRate'], $previousStats['bcgRate']);

        return $trends;
    }

    /**
     * Calculate pregnancy month based on EDD.
     * @param Patient $patient
     * @return int|null
     */
    private function calculatePregnancyMonth(Patient $patient): ?int
    {
        if (!$patient->edd || $patient->date_of_delivery) {
            return null;
        }

        $edd = Carbon::parse($patient->edd);
        $now = Carbon::now();
        
        $diffInDays = $edd->diffInDays($now, false); // false for absolute difference

        // If EDD is in the future, calculate months remaining, then subtract from 9
        if ($diffInDays >= 0) {
            $daysToEdd = $diffInDays;
            $monthsToEdd = floor($daysToEdd / 30.44); // Average days in a month, floor to get full months
            $month = 9 - $monthsToEdd;
            return max(1, min(9, (int) $month)); // Ensure it's between 1 and 9
        } else {
            // If EDD is in the past, pregnancy is considered finished, or overdue
            return 9; // Max month, indicating due or overdue
        }
    }

    /**
     * Check if patient is due this month.
     * @param Patient $patient
     * @return bool
     */
    private function isDueThisMonth(Patient $patient): bool
    {
        if (!$patient->edd || $patient->date_of_delivery) {
            return false;
        }

        $edd = Carbon::parse($patient->edd);
        $now = Carbon::now();
        
        return $edd->month == $now->month && $edd->year == $now->year;
    }

    /**
     * Get ANC Detailed Data for ANC Tab
     */
    private function getAncDetailedData(Collection $patients)
    {
        $totalPatients = $patients->count();
        
        // ANC Visit completion rates
        $ancVisits = [];
        for ($i = 1; $i <= 8; $i++) {
            $completed = $patients->filter(function ($patient) use ($i) {
                return !empty($patient->{"anc_visit_{$i}_date"});
            })->count();
            
            $ancVisits["anc{$i}"] = [
                'completed' => $completed,
                'rate' => $totalPatients > 0 ? round(($completed / $totalPatients) * 100, 1) : 0
            ];
        }

        // ANC Services utilization
        $services = [
            'urinalysis' => $patients->sum(function ($patient) {
                $count = 0;
                for ($i = 1; $i <= 8; $i++) {
                    if ($patient->{"anc{$i}_urinalysis"}) $count++;
                }
                return $count;
            }),
            'iron_folate' => $patients->sum(function ($patient) {
                $count = 0;
                for ($i = 1; $i <= 8; $i++) {
                    if ($patient->{"anc{$i}_iron_folate"}) $count++;
                }
                return $count;
            }),
            'mms' => $patients->sum(function ($patient) {
                $count = 0;
                for ($i = 1; $i <= 8; $i++) {
                    if ($patient->{"anc{$i}_mms"}) $count++;
                }
                return $count;
            }),
            'sp' => $patients->sum(function ($patient) {
                $count = 0;
                for ($i = 1; $i <= 8; $i++) {
                    if ($patient->{"anc{$i}_sp"}) $count++;
                }
                return $count;
            }),
            'sba' => $patients->sum(function ($patient) {
                $count = 0;
                for ($i = 1; $i <= 8; $i++) {
                    if ($patient->{"anc{$i}_sba"}) $count++;
                }
                return $count;
            })
        ];

        // ANC Payment analysis
        $payments = [];
        for ($i = 1; $i <= 8; $i++) {
            $paidCount = $patients->where("anc{$i}_paid", true)->count();
            $totalAmount = $patients->sum("anc{$i}_payment_amount");
            
            $payments["anc{$i}"] = [
                'paid_count' => $paidCount,
                'total_amount' => $totalAmount,
                'average_amount' => $paidCount > 0 ? round($totalAmount / $paidCount, 2) : 0
            ];
        }

        return [
            'ancVisits' => $ancVisits,
            'services' => $services,
            'payments' => $payments,
            'totalPatients' => $totalPatients,
            'additionalAnc' => $patients->sum('additional_anc_count')
        ];
    }

    /**
     * Get Delivery Detailed Data for Delivery Tab
     */
    private function getDeliveryDetailedData(Collection $patients)
    {
        $delivered = $patients->whereNotNull('date_of_delivery');
        $totalDelivered = $delivered->count();

        $deliveryTypes = $delivered->countBy('type_of_delivery')->toArray();
        $deliveryOutcomes = $delivered->countBy('delivery_outcome')->toArray();
        $deliveryLocations = $delivered->countBy('place_of_delivery')->toArray();

        // Delivery timing analysis
        $deliveryTiming = [];
        foreach ($delivered as $patient) {
            if ($patient->edd && $patient->date_of_delivery) {
                $edd = Carbon::parse($patient->edd);
                $deliveryDate = Carbon::parse($patient->date_of_delivery);
                $daysDifference = $edd->diffInDays($deliveryDate, false);
                
                if ($daysDifference < -14) $deliveryTiming['very_early'] = ($deliveryTiming['very_early'] ?? 0) + 1;
                elseif ($daysDifference < 0) $deliveryTiming['early'] = ($deliveryTiming['early'] ?? 0) + 1;
                elseif ($daysDifference == 0) $deliveryTiming['on_time'] = ($deliveryTiming['on_time'] ?? 0) + 1;
                elseif ($daysDifference <= 14) $deliveryTiming['late'] = ($deliveryTiming['late'] ?? 0) + 1;
                else $deliveryTiming['very_late'] = ($deliveryTiming['very_late'] ?? 0) + 1;
            }
        }

        // Disaggregated delivery place stats
        $registeredFacility = $delivered->where('place_of_delivery', 'Registered Facility')->count();
        $otherFacility = $delivered->where('place_of_delivery', 'Other Facility')->count();
        $home = $delivered->where('place_of_delivery', 'Home')->count();
        $traditional = $delivered->where('place_of_delivery', 'Traditional Attendant')->count();
        // Legacy support
        $legacyFacility = $delivered->where('place_of_delivery', 'Health Facility')->count();

        return [
            'totalDelivered' => $totalDelivered,
            'deliveryTypes' => $deliveryTypes,
            'deliveryOutcomes' => $deliveryOutcomes,
            'deliveryLocations' => $deliveryLocations,
            'deliveryTiming' => $deliveryTiming,
            'kitsReceived' => $delivered->where('delivery_kits_received', true)->count(),
            'registeredFacilityDeliveries' => $registeredFacility,
            'otherFacilityDeliveries' => $otherFacility,
            'homeDeliveries' => $home,
            'traditionalDeliveries' => $traditional,
            'facilityDeliveries' => $registeredFacility + $otherFacility + $legacyFacility,
        ];
    }

    /**
     * Get Immunization Detailed Data for Immunization Tab
     */
    private function getImmunizationDetailedData(Collection $patients)
    {
        $childrenWithDob = $patients->whereNotNull('child_dob');
        $totalChildren = $childrenWithDob->count();

        $vaccines = [
            'bcg', 'hep0', 'opv0', 'penta1', 'pcv1', 'opv1', 'rota1', 'ipv1',
            'penta2', 'pcv2', 'rota2', 'opv2', 'penta3', 'pcv3', 'opv3', 'rota3',
            'ipv2', 'measles', 'yellow_fever', 'vitamin_a', 'mcv2'
        ];

        $immunizationData = [];
        foreach ($vaccines as $vaccine) {
            $received = $patients->where("{$vaccine}_received", true)->count();
            $immunizationData[$vaccine] = [
                'received' => $received,
                'rate' => $totalChildren > 0 ? round(($received / $totalChildren) * 100, 1) : 0
            ];
        }

        // Immunization schedule compliance
        $scheduleCompliance = $this->calculateImmunizationScheduleCompliance($patients);

        return [
            'totalChildren' => $totalChildren,
            'vaccines' => $immunizationData,
            'scheduleCompliance' => $scheduleCompliance,
            'timelyVaccination' => $this->calculateTimelyVaccination($patients)
        ];
    }

    /**
     * Get Family Planning Detailed Data for FP Tab
     */
    private function getFamilyPlanningDetailedData(Collection $patients)
    {
        $fpUsers = $patients->where('fp_using', true);
        $totalFpUsers = $fpUsers->count();
        $totalPatients = $patients->count();

        $methods = [
            'male_condom' => [
                'count' => $fpUsers->where('fp_male_condom', true)->count(),
                'percentage' => $totalFpUsers > 0 ? round(($fpUsers->where('fp_male_condom', true)->count() / $totalFpUsers) * 100, 1) : 0
            ],
            'female_condom' => [
                'count' => $fpUsers->where('fp_female_condom', true)->count(),
                'percentage' => $totalFpUsers > 0 ? round(($fpUsers->where('fp_female_condom', true)->count() / $totalFpUsers) * 100, 1) : 0
            ],
            'pill' => [
                'count' => $fpUsers->where('fp_pill', true)->count(),
                'percentage' => $totalFpUsers > 0 ? round(($fpUsers->where('fp_pill', true)->count() / $totalFpUsers) * 100, 1) : 0
            ],
            'injectable' => [
                'count' => $fpUsers->where('fp_injectable', true)->count(),
                'percentage' => $totalFpUsers > 0 ? round(($fpUsers->where('fp_injectable', true)->count() / $totalFpUsers) * 100, 1) : 0
            ],
            'implant' => [
                'count' => $fpUsers->where('fp_implant', true)->count(),
                'percentage' => $totalFpUsers > 0 ? round(($fpUsers->where('fp_implant', true)->count() / $totalFpUsers) * 100, 1) : 0
            ],
            'iud' => [
                'count' => $fpUsers->where('fp_iud', true)->count(),
                'percentage' => $totalFpUsers > 0 ? round(($fpUsers->where('fp_iud', true)->count() / $totalFpUsers) * 100, 1) : 0
            ],
            'other' => [
                'count' => $fpUsers->where('fp_other', true)->count(),
                'percentage' => $totalFpUsers > 0 ? round(($fpUsers->where('fp_other', true)->count() / $totalFpUsers) * 100, 1) : 0
            ]
        ];

        $fpInterest = $patients->countBy('fp_interest')->toArray();

        // Method combinations
        $methodCombinations = [];
        foreach ($fpUsers as $patient) {
            $methodsUsed = [];
            if ($patient->fp_male_condom) $methodsUsed[] = 'Male Condom';
            if ($patient->fp_female_condom) $methodsUsed[] = 'Female Condom';
            if ($patient->fp_pill) $methodsUsed[] = 'Pill';
            if ($patient->fp_injectable) $methodsUsed[] = 'Injectable';
            if ($patient->fp_implant) $methodsUsed[] = 'Implant';
            if ($patient->fp_iud) $methodsUsed[] = 'IUD';
            if ($patient->fp_other) $methodsUsed[] = 'Other';

            $combination = implode(' + ', $methodsUsed);
            if (!isset($methodCombinations[$combination])) {
                $methodCombinations[$combination] = 0;
            }
            $methodCombinations[$combination]++;
        }

        return [
            'totalUsers' => $totalFpUsers,
            'uptakeRate' => $totalPatients > 0 ? round(($totalFpUsers / $totalPatients) * 100, 1) : 0,
            'methods' => $methods,
            'fpInterest' => $fpInterest,
            'methodCombinations' => $methodCombinations,
            'otherMethods' => $patients->where('fp_other', true)->pluck('fp_other_specify')->filter()->values()
        ];
    }

    /**
     * Get HIV Detailed Data for HIV Tab
     */
    private function getHivDetailedData(Collection $patients)
    {
        $hivData = [
            'tested' => 0,
            'positive' => 0,
            'negative' => 0,
            'results_pending' => 0,
            'not_tested' => 0,
            'by_anc_visit' => []
        ];

        // Initialize ANC visit data
        for ($i = 1; $i <= 8; $i++) {
            $hivData['by_anc_visit']["anc{$i}"] = [
                'tested' => 0,
                'positive' => 0,
                'negative' => 0,
                'results_pending' => 0
            ];
        }

        foreach ($patients as $patient) {
            $tested = false;
            $positive = false;
            $resultsReceived = false;

            for ($i = 1; $i <= 8; $i++) {
                if ($patient->{"anc{$i}_hiv_test"} === 'Yes') {
                    $tested = true;
                    $hivData['by_anc_visit']["anc{$i}"]['tested']++;

                    if ($patient->{"anc{$i}_hiv_result_received"}) {
                        $resultsReceived = true;
                        if ($patient->{"anc{$i}_hiv_result"} === 'Positive') {
                            $positive = true;
                            $hivData['by_anc_visit']["anc{$i}"]['positive']++;
                        } else {
                            $hivData['by_anc_visit']["anc{$i}"]['negative']++;
                        }
                    } else {
                        $hivData['by_anc_visit']["anc{$i}"]['results_pending']++;
                    }
                }
            }

            if ($tested) {
                $hivData['tested']++;
                if ($resultsReceived) {
                    if ($positive) {
                        $hivData['positive']++;
                    } else {
                        $hivData['negative']++;
                    }
                } else {
                    $hivData['results_pending']++;
                }
            } else {
                $hivData['not_tested']++;
            }
        }

        // Calculate rates
        $totalPatients = $patients->count();
        $hivData['testing_rate'] = $totalPatients > 0 ? round(($hivData['tested'] / $totalPatients) * 100, 1) : 0;
        $hivData['positivity_rate'] = $hivData['tested'] > 0 ? round(($hivData['positive'] / $hivData['tested']) * 100, 1) : 0;

        return $hivData;
    }

    /**
     * Get Facility Performance Stats
     */
    private function getFacilityPerformanceStats(Collection $facilities)
    {
        $stats = [];

        foreach ($facilities as $facility) {
            $patients = $facility->patients;
            $totalPatients = $patients->count();
            $delivered = $patients->whereNotNull('date_of_delivery')->count();

            // ANC metrics
            $anc4Completed = $patients->filter(function ($p) {
                return !empty($p->anc_visit_4_date);
            })->count();

            $anc8Completed = $patients->filter(function ($p) {
                return !empty($p->anc_visit_8_date);
            })->count();

            // FP metrics
            $fpUsers = $patients->where('fp_using', true)->count();

            $stats[] = [
                'id' => $facility->id,
                'facility_name' => $facility->clinic_name,
                'ward' => $facility->ward->name ?? 'N/A',
                'lga' => $facility->ward->lga->name ?? 'N/A',
                'total_patients' => $totalPatients,
                'delivered' => $delivered,
                'facility_delivery_rate' => $delivered > 0 ? 
                    round(($patients->where('place_of_delivery', 'Health Facility')->count() / $delivered) * 100, 1) : 0,
                'anc4_rate' => $totalPatients > 0 ? 
                    round(($anc4Completed / $totalPatients) * 100, 1) : 0,
                'anc8_rate' => $totalPatients > 0 ? 
                    round(($anc8Completed / $totalPatients) * 100, 1) : 0,
                'fp_uptake_rate' => $totalPatients > 0 ? 
                    round(($fpUsers / $totalPatients) * 100, 1) : 0,
                'performance_score' => $this->calculateFacilityPerformanceScore($patients, $totalPatients, $delivered)
            ];
        }

        // Sort by performance score
        usort($stats, function ($a, $b) {
            return $b['performance_score'] <=> $a['performance_score'];
        });

        return $stats;
    }

    /**
     * Calculate facility performance score
     */
    private function calculateFacilityPerformanceScore($patients, $totalPatients, $delivered)
    {
        if ($totalPatients === 0) return 0;

        $score = 0;
        
        // ANC completion (30%)
        $anc4Completed = $patients->filter(function ($p) {
            return !empty($p->anc_visit_4_date);
        })->count();
        $score += ($anc4Completed / $totalPatients) * 30;

        // Facility delivery rate (30%)
        $facilityDeliveries = $patients->where('place_of_delivery', 'Health Facility')->count();
        if ($delivered > 0) {
            $score += ($facilityDeliveries / $delivered) * 30;
        }

        // FP uptake (20%)
        $fpUsers = $patients->where('fp_using', true)->count();
        $score += ($fpUsers / $totalPatients) * 20;

        // Live birth rate (20%)
        $liveBirths = $patients->where('delivery_outcome', 'Live birth')->count();
        if ($delivered > 0) {
            $score += ($liveBirths / $delivered) * 20;
        }

        return round($score, 1);
    }

    /**
     * Calculate timely vaccination rates
     */
    private function calculateTimelyVaccination(Collection $patients)
    {
        $timelyCount = 0;
        $totalWithVaccines = 0;

        foreach ($patients as $patient) {
            if ($patient->child_dob && $patient->bcg_received && $patient->bcg_date) {
                $bcgDate = Carbon::parse($patient->bcg_date);
                $dob = Carbon::parse($patient->child_dob);
                $daysDifference = $dob->diffInDays($bcgDate);
                
                if ($daysDifference <= 7) { // BCG should be within 7 days of birth
                    $timelyCount++;
                }
                $totalWithVaccines++;
            }
        }

        return $totalWithVaccines > 0 ? round(($timelyCount / $totalWithVaccines) * 100, 1) : 0;
    }

    /**
     * Calculate immunization schedule compliance
     */
    private function calculateImmunizationScheduleCompliance(Collection $patients)
    {
        $complianceData = [
            'fully_compliant' => 0,
            'partially_compliant' => 0,
            'non_compliant' => 0
        ];

        foreach ($patients as $patient) {
            if (!$patient->child_dob) continue;

            $requiredVaccines = ['bcg', 'penta1', 'penta2', 'penta3', 'measles'];
            $receivedCount = 0;

            foreach ($requiredVaccines as $vaccine) {
                if ($patient->{"{$vaccine}_received"}) {
                    $receivedCount++;
                }
            }

            if ($receivedCount === count($requiredVaccines)) {
                $complianceData['fully_compliant']++;
            } elseif ($receivedCount >= 3) {
                $complianceData['partially_compliant']++;
            } else {
                $complianceData['non_compliant']++;
            }
        }

        $totalChildren = $patients->whereNotNull('child_dob')->count();
        if ($totalChildren > 0) {
            $complianceData['fully_compliant_rate'] = round(($complianceData['fully_compliant'] / $totalChildren) * 100, 1);
            $complianceData['partially_compliant_rate'] = round(($complianceData['partially_compliant'] / $totalChildren) * 100, 1);
            $complianceData['non_compliant_rate'] = round(($complianceData['non_compliant'] / $totalChildren) * 100, 1);
        }

        return $complianceData;
    }

    // ... REST OF YOUR EXISTING METHODS (allPatients, showPatient, editPatient, updatePatient, destroyPatient, exportPatients, etc.)
    // These remain exactly as you had them in your original controller

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
                    $query->whereNull('anc_visit_1_date'); // Basic check for incomplete ANC
                    break;
            }
        }

        // Pregnancy Filters
        if ($pregnancyFilter = $request->input('pregnancy_filter')) {
            $now = Carbon::now();
            
            switch ($pregnancyFilter) {
                case '7_months':
                    // Patients whose EDD is 2 months from now, not yet delivered
                    $eddStart = $now->copy()->addMonths(1)->startOfMonth();
                    $eddEnd = $now->copy()->addMonths(2)->endOfMonth(); // EDD between 1 and 2 months from now
                    $query->whereNotNull('edd')
                          ->whereNull('date_of_delivery')
                          ->where('edd', '>=', $eddStart)
                          ->where('edd', '<=', $eddEnd);
                    break;
                case '8_months':
                    // Patients whose EDD is 1 month from now, not yet delivered
                    $eddStart = $now->copy()->startOfMonth();
                    $eddEnd = $now->copy()->addMonths(1)->endOfMonth(); // EDD within next month
                    $query->whereNotNull('edd')
                          ->whereNull('date_of_delivery')
                          ->where('edd', '>=', $eddStart)
                          ->where('edd', '<=', $eddEnd);
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
        
        $data = $this->validatePatientData($request); // Use unified validation
        $data = $this->convertBooleanFields($data); // Use unified boolean conversion

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
            
            // Generate ANC headers
            $ancHeaders = [];
            for ($i = 1; $i <= 8; $i++) {
                $ancHeaders = array_merge($ancHeaders, [
                    "ANC{$i} Date", "Tracked Before ANC{$i}", "ANC{$i} Paid", "ANC{$i} Amount",
                    "ANC{$i} Urinalysis", "ANC{$i} Iron Folate", "ANC{$i} MMS", "ANC{$i} SP", "ANC{$i} SBA",
                    "ANC{$i} HIV Test", "ANC{$i} HIV Result Received", "ANC{$i} HIV Result"
                ]);
            }
            $ancHeaders[] = 'Additional ANC Count';

            // Generate vaccine headers
            $vaccineHeaders = [];
            $vaccines = [
                'bcg', 'hep0', 'opv0', 'penta1', 'pcv1', 'opv1', 'rota1', 'ipv1',
                'penta2', 'pcv2', 'rota2', 'opv2', 'penta3', 'pcv3', 'opv3', 'rota3',
                'ipv2', 'measles', 'yellow_fever', 'vitamin_a', 'mcv2'
            ];
            foreach ($vaccines as $vaccine) {
                $name = ucwords(str_replace('_', ' ', $vaccine));
                $vaccineHeaders[] = "{$name} Received";
                $vaccineHeaders[] = "{$name} Date";
            }

            // Generate CSV headers dynamically from a list of all fields
            $headerFields = array_merge(
                ['Unique ID', 'Woman Name', 'Age', 'Literacy Status', 'Phone Number',
                'Husband Name', 'Husband Phone', 'Community', 'Address',
                'LGA', 'Ward', 'Health Facility', 'Gravida', 'Age of Pregnancy (weeks)', 'Parity',
                'Registration Date', 'EDD', 'FP Interest'],
                
                $ancHeaders,

                // Delivery
                ['Place of Delivery', 'Delivery Kits Received', 'Type of Delivery', 'Complication if any', 'Delivery Outcome', 'Mother Alive', 'Mother Status', 'Date of Delivery'],

                // Postnatal
                ['PNC1 Date', 'PNC2 Date', 'PNC3 Date'],

                // Insurance
                ['Health Insurance Status', 'Insurance Type', 'Insurance Other Specify', 'Insurance Satisfaction'],

                // Family Planning
                ['FP Using', 'FP Male Condom', 'FP Female Condom', 'FP Pill', 'FP Injectable',
                'FP Implant', 'FP IUD', 'FP Other', 'FP Other Specify'],

                // Child Immunization
                ['Child Name', 'Child DOB', 'Child Sex'],
                $vaccineHeaders,

                // Notes
                ['Remark', 'Comments']
            );

            fputcsv($file, $headerFields);

            // Add data rows
            foreach ($patients as $patient) {
                $rowData = [
                    $patient->unique_id, $patient->woman_name, $patient->age, $patient->literacy_status, $patient->phone_number,
                    $patient->husband_name ?? '', $patient->husband_phone ?? '', $patient->community, $patient->address,
                    $patient->lga->name ?? 'N/A', $patient->ward->name ?? 'N/A', $patient->healthFacility->clinic_name ?? 'N/A',
                    $patient->gravida ?? '', $patient->age_of_pregnancy_weeks ?? '', $patient->parity ?? '',
                    $patient->date_of_registration, $patient->edd,
                ];

                // ANC Visits (1-8) data
                for ($i = 1; $i <= 8; $i++) {
                    $rowData = array_merge($rowData, [
                        $patient->{"anc_visit_{$i}_date"} ?? '',
                        $patient->{"tracked_before_anc{$i}"} ? 'Yes' : 'No',
                        $patient->{"anc{$i}_paid"} ? 'Yes' : 'No',
                        $patient->{"anc{$i}_payment_amount"} ?? '',
                        $patient->{"anc{$i}_urinalysis"} ? 'Yes' : 'No',
                        $patient->{"anc{$i}_iron_folate"} ? 'Yes' : 'No',
                        $patient->{"anc{$i}_mms"} ? 'Yes' : 'No',
                        $patient->{"anc{$i}_sp"} ? 'Yes' : 'No',
                        $patient->{"anc{$i}_sba"} ? 'Yes' : 'No',
                        $patient->{"anc{$i}_hiv_test"} ?? '',
                        $patient->{"anc{$i}_hiv_result_received"} ? 'Yes' : 'No',
                        $patient->{"anc{$i}_hiv_result"} ?? '',
                    ]);
                }
                $rowData[] = $patient->additional_anc_count ?? '';

                // Delivery data
                $rowData = array_merge($rowData, [
                    $patient->place_of_delivery ?? '', $patient->delivery_kits_received ? 'Yes' : 'No',
                    $patient->type_of_delivery ?? '', $patient->complication_if_any ?? '', $patient->delivery_outcome ?? '', $patient->mother_alive ?? '', $patient->mother_status ?? '', $patient->date_of_delivery ?? '',
                ]);

                // PNC data
                $rowData = array_merge($rowData, [
                    $patient->pnc_visit_1 ?? '', $patient->pnc_visit_2 ?? '', $patient->pnc_visit_3 ?? '',
                ]);

                // Insurance data
                $rowData = array_merge($rowData, [
                    $patient->health_insurance_status, $patient->insurance_type ?? '',
                    $patient->insurance_other_specify ?? '', $patient->insurance_satisfaction ? 'Yes' : 'No',
                ]);

                // Family Planning data
                $fpData = [
                    $patient->fp_using ? 'Yes' : 'No',
                    $patient->fp_male_condom ? 'Yes' : 'No',
                    $patient->fp_female_condom ? 'Yes' : 'No',
                    $patient->fp_pill ? 'Yes' : 'No',
                    $patient->fp_injectable ? 'Yes' : 'No',
                    $patient->fp_implant ? 'Yes' : 'No',
                    $patient->fp_iud ? 'Yes' : 'No',
                    $patient->fp_other ? 'Yes' : 'No',
                    $patient->fp_other_specify ?? '',
                ];
                $rowData = array_merge($rowData, $fpData);

                // Child Immunization data
                $rowData = array_merge($rowData, [
                    $patient->child_name ?? '', $patient->child_dob ?? '', $patient->child_sex ?? '',
                ]);
                
                // Vaccine data
                foreach ($vaccines as $vaccine) {
                    $rowData[] = $patient->{"{$vaccine}_received"} ? 'Yes' : 'No';
                    $rowData[] = $patient->{"{$vaccine}_date"} ?? '';
                }

                // Notes
                $rowData = array_merge($rowData, [
                    $patient->remark ?? '', $patient->comments ?? ''
                ]);
                
                fputcsv($file, $rowData);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Unified validation logic for patient data (Admin view, similar to PHC Staff)
     * @param Request $request
     * @return array
     */
    private function validatePatientData(Request $request): array
    {
        $rules = [
            'woman_name' => 'required|string|max:255', 'age' => 'required|integer|between:15,50',
            'literacy_status' => 'required|in:Literate,Not literate', 'phone_number' => 'nullable|string|max:20',
            'husband_name' => 'nullable|string|max:255', 'husband_phone' => 'nullable|string|max:20',
            'community' => 'required|string|max:255', 'address' => 'required|string',
            'lga_id' => 'required|exists:lgas,id', 'ward_id' => 'required|exists:wards,id',
            'health_facility_id' => 'required|exists:phcs,id',
            'gravida' => 'nullable|integer|min:0', 'age_of_pregnancy_weeks' => 'nullable|integer|min:0|max:45', 'parity' => 'nullable|integer|min:0',
            'date_of_registration' => 'required|date', 'edd' => 'required|date|after_or_equal:date_of_registration',
            'fp_interest' => 'nullable|in:Yes,No', 'additional_anc_count' => 'nullable|integer|min:0',
            'place_of_delivery' => 'nullable|in:Home,Health Facility,Traditional Attendant', 'delivery_kits_received' => 'boolean',
            'type_of_delivery' => 'nullable|in:Normal (Vaginal),Cesarean Section,Assisted,Breech', 'complication_if_any' => 'nullable|in:No complication,Hemorrhage,Eclampsia,Sepsis,Other', 'delivery_outcome' => 'nullable|in:Live birth,Stillbirth,Miscarriage',
            'mother_alive' => 'nullable|in:Yes,No', 'mother_status' => 'nullable|in:Admitted,Referred to other facility,Discharged home',
            'date_of_delivery' => 'nullable|date', 'pnc_visit_1' => 'nullable|date', 'pnc_visit_2' => 'nullable|date',
            'pnc_visit_3' => 'nullable|date', 'health_insurance_status' => 'nullable|in:Yes,No,Not Enrolled',
            'insurance_type' => 'nullable|in:Kachima,NHIS,Others', 'insurance_other_specify' => 'nullable|string|max:255',
            'insurance_satisfaction' => 'boolean', 'fp_using' => 'boolean', 'fp_male_condom' => 'boolean',
            'fp_female_condom' => 'boolean', 'fp_pill' => 'boolean', 'fp_injectable' => 'boolean',
            'fp_implant' => 'boolean', 'fp_iud' => 'boolean', 'fp_other' => 'boolean',
            'fp_other_specify' => 'nullable|string|max:255', 'child_name' => 'nullable|string|max:255',
            'child_dob' => 'nullable|date', 'child_sex' => 'nullable|in:Male,Female',
            'remark' => 'nullable|string', 'comments' => 'nullable|string',
        ];

        for ($i = 1; $i <= 8; $i++) {
            $rules["anc_visit_{$i}_date"] = 'nullable|date';
            $rules["tracked_before_anc{$i}"] = 'boolean'; $rules["anc{$i}_paid"] = 'boolean';
            $rules["anc{$i}_payment_amount"] = 'nullable|numeric|min:0'; $rules["anc{$i}_urinalysis"] = 'boolean';
            $rules["anc{$i}_iron_folate"] = 'boolean'; $rules["anc{$i}_mms"] = 'boolean';
            $rules["anc{$i}_sp"] = 'boolean'; $rules["anc{$i}_sba"] = 'boolean';
            $rules["anc{$i}_hiv_test"] = 'nullable|in:Yes,No'; $rules["anc{$i}_hiv_result_received"] = 'boolean';
            $rules["anc{$i}_hiv_result"] = 'nullable|in:Positive,Negative';
        }

        $vaccines = [
            'bcg', 'hep0', 'opv0', 'penta1', 'pcv1', 'opv1', 'rota1', 'ipv1',
            'penta2', 'pcv2', 'rota2', 'opv2', 'penta3', 'pcv3', 'opv3', 'rota3',
            'ipv2', 'measles', 'yellow_fever', 'vitamin_a', 'mcv2'
        ];
        foreach ($vaccines as $vaccine) {
            $rules["{$vaccine}_received"] = 'boolean'; $rules["{$vaccine}_date"] = 'nullable|date';
        }

        return $request->validate($rules);
    }

    /**
     * Convert boolean fields (Admin view, similar to PHC Staff)
     * @param array $data
     * @return array
     */
    private function convertBooleanFields(array $data): array
    {
        $booleanFields = [
            'delivery_kits_received', 'insurance_satisfaction',
            'fp_using', 'fp_male_condom', 'fp_female_condom', 'fp_pill',
            'fp_injectable', 'fp_implant', 'fp_iud', 'fp_other',
        ];

        for ($i = 1; $i <= 8; $i++) {
            array_push($booleanFields, "tracked_before_anc{$i}", "anc{$i}_paid", "anc{$i}_urinalysis",
                       "anc{$i}_iron_folate", "anc{$i}_mms", "anc{$i}_sp", "anc{$i}_sba",
                       "anc{$i}_hiv_result_received");
        }

        $vaccines = [
            'bcg', 'hep0', 'opv0', 'penta1', 'pcv1', 'opv1', 'rota1', 'ipv1',
            'penta2', 'pcv2', 'rota2', 'opv2', 'penta3', 'pcv3', 'opv3', 'rota3',
            'ipv2', 'measles', 'yellow_fever', 'vitamin_a', 'mcv2'
        ];
        foreach ($vaccines as $vaccine) {
            $booleanFields[] = "{$vaccine}_received";
        }

        foreach ($booleanFields as $field) {
            if (array_key_exists($field, $data)) {
                $data[$field] = (bool)($data[$field] ?? false);
            }
        }
        return $data;
    }
}