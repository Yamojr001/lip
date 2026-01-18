<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        // --- Core Info and Foreign Keys ---
        'unique_id',
        'woman_name', 'age', 'literacy_status', 'phone_number', 'husband_name', 'husband_phone',
        'community', 'address', 'preferred_language',

        'ward_id', 'lga_id', 'health_facility_id', 'phc_id',

        // --- Medical Info ---
        'gravida', 'age_of_pregnancy_weeks', 'parity', 'date_of_registration', 'edd', 'fp_interest',
        
        // --- Vital Signs ---
        'blood_pressure', 'weight_kg', 'height_cm', 'blood_group', 'blood_level',

        // --- ANC Visits 1-8 with comprehensive tracking (INCLUDING NEXT VISIT DATE) ---
        // Visit 1
        'anc_visit_1_date', 'anc_visit_1_next_date', 'tracked_before_anc1', 'anc1_paid', 'anc1_payment_amount',
        'anc1_urinalysis', 'anc1_iron_folate', 'anc1_mms', 'anc1_sp', 'anc1_pcv', 'anc1_td',
        'anc1_hiv_test', 'anc1_hiv_result_received', 'anc1_hiv_result',
        
        // Visit 2
        'anc_visit_2_date', 'anc_visit_2_next_date', 'tracked_before_anc2', 'anc2_paid', 'anc2_payment_amount',
        'anc2_urinalysis', 'anc2_iron_folate', 'anc2_mms', 'anc2_sp', 'anc2_pcv', 'anc2_td',
        'anc2_hiv_test', 'anc2_hiv_result_received', 'anc2_hiv_result',
        
        // Visit 3
        'anc_visit_3_date', 'anc_visit_3_next_date', 'tracked_before_anc3', 'anc3_paid', 'anc3_payment_amount',
        'anc3_urinalysis', 'anc3_iron_folate', 'anc3_mms', 'anc3_sp', 'anc3_pcv', 'anc3_td',
        'anc3_hiv_test', 'anc3_hiv_result_received', 'anc3_hiv_result',
        
        // Visit 4
        'anc_visit_4_date', 'anc_visit_4_next_date', 'tracked_before_anc4', 'anc4_paid', 'anc4_payment_amount',
        'anc4_urinalysis', 'anc4_iron_folate', 'anc4_mms', 'anc4_sp', 'anc4_pcv', 'anc4_td',
        'anc4_hiv_test', 'anc4_hiv_result_received', 'anc4_hiv_result',
        
        // Visit 5
        'anc_visit_5_date', 'anc_visit_5_next_date', 'tracked_before_anc5', 'anc5_paid', 'anc5_payment_amount',
        'anc5_urinalysis', 'anc5_iron_folate', 'anc5_mms', 'anc5_sp', 'anc5_pcv', 'anc5_td',
        'anc5_hiv_test', 'anc5_hiv_result_received', 'anc5_hiv_result',
        
        // Visit 6
        'anc_visit_6_date', 'anc_visit_6_next_date', 'tracked_before_anc6', 'anc6_paid', 'anc6_payment_amount',
        'anc6_urinalysis', 'anc6_iron_folate', 'anc6_mms', 'anc6_sp', 'anc6_pcv', 'anc6_td',
        'anc6_hiv_test', 'anc6_hiv_result_received', 'anc6_hiv_result',
        
        // Visit 7
        'anc_visit_7_date', 'anc_visit_7_next_date', 'tracked_before_anc7', 'anc7_paid', 'anc7_payment_amount',
        'anc7_urinalysis', 'anc7_iron_folate', 'anc7_mms', 'anc7_sp', 'anc7_pcv', 'anc7_td',
        'anc7_hiv_test', 'anc7_hiv_result_received', 'anc7_hiv_result',
        
        // Visit 8
        'anc_visit_8_date', 'anc_visit_8_next_date', 'tracked_before_anc8', 'anc8_paid', 'anc8_payment_amount',
        'anc8_urinalysis', 'anc8_iron_folate', 'anc8_mms', 'anc8_sp', 'anc8_pcv', 'anc8_td',
        'anc8_hiv_test', 'anc8_hiv_result_received', 'anc8_hiv_result',

        'additional_anc_count',

        // --- Delivery Details ---
        'place_of_delivery', 'delivery_kits_received', 'type_of_delivery', 
        'complication_if_any', 'delivery_outcome', 'mother_alive', 'mother_status',
        'date_of_delivery',

        // --- Postnatal Checkup (3 visits) ---
        'pnc_visit_1', 'pnc_visit_2', 'pnc_visit_3',

        // --- Insurance & Payments ---
        'health_insurance_status', 'insurance_type', 'insurance_other_specify', 'insurance_satisfaction',

        // --- Family Planning ---
        'fp_using', 'fp_male_condom', 'fp_female_condom', 'fp_pill', 'fp_injectable',
        'fp_implant', 'fp_iud', 'fp_other', 'fp_other_specify',

        // --- Child Immunization ---
        'child_name', 'child_dob', 'child_sex',
        
        // Vaccines - At Birth
        'bcg_received', 'bcg_date', 'hep0_received', 'hep0_date', 'opv0_received', 'opv0_date',
        
        // 6 Weeks
        'penta1_received', 'penta1_date', 'pcv1_received', 'pcv1_date', 'opv1_received', 'opv1_date',
        'rota1_received', 'rota1_date', 'ipv1_received', 'ipv1_date',
        
        // 10 Weeks
        'penta2_received', 'penta2_date', 'pcv2_received', 'pcv2_date', 'rota2_received', 'rota2_date',
        'opv2_received', 'opv2_date',
        
        // 14 Weeks
        'penta3_received', 'penta3_date', 'pcv3_received', 'pcv3_date', 'opv3_received', 'opv3_date',
        'rota3_received', 'rota3_date', 'ipv2_received', 'ipv2_date',
        
        // 9 Months
        'measles_received', 'measles_date', 'yellow_fever_received', 'yellow_fever_date',
        'vitamin_a_received', 'vitamin_a_date',
        
        // 15 Months
        'mcv2_received', 'mcv2_date',

        // --- Notes ---
        'remark', 'comments',
    ];

    protected $guarded = [
        'anc_visits_count', 'anc4_completed', 'pnc_completed', 'post_edd_followup_status', 'alert',
    ];

    protected $casts = [
        'id' => 'integer',
        'lga_id' => 'integer',
        'ward_id' => 'integer',
        'phc_id' => 'integer',
        'health_facility_id' => 'integer',
        'age' => 'integer',
        'age_of_pregnancy_weeks' => 'integer',
        'gravida' => 'integer',
        'parity' => 'integer',
        'additional_anc_count' => 'integer',
        'anc_visits_count' => 'integer',

        // Date fields
        'date_of_registration' => 'date',
        'edd' => 'date',
        'date_of_delivery' => 'date',
        'child_dob' => 'date',
        
        // ANC Visit dates (including NEXT VISIT DATES)
        'anc_visit_1_date' => 'date',
        'anc_visit_1_next_date' => 'date',
        'anc_visit_2_date' => 'date',
        'anc_visit_2_next_date' => 'date',
        'anc_visit_3_date' => 'date',
        'anc_visit_3_next_date' => 'date',
        'anc_visit_4_date' => 'date',
        'anc_visit_4_next_date' => 'date',
        'anc_visit_5_date' => 'date',
        'anc_visit_5_next_date' => 'date',
        'anc_visit_6_date' => 'date',
        'anc_visit_6_next_date' => 'date',
        'anc_visit_7_date' => 'date',
        'anc_visit_7_next_date' => 'date',
        'anc_visit_8_date' => 'date',
        'anc_visit_8_next_date' => 'date',
        
        // PNC Visit dates
        'pnc_visit_1' => 'date',
        'pnc_visit_2' => 'date',
        'pnc_visit_3' => 'date',
        
        // Vaccine dates
        'bcg_date' => 'date',
        'hep0_date' => 'date',
        'opv0_date' => 'date',
        'penta1_date' => 'date',
        'pcv1_date' => 'date',
        'opv1_date' => 'date',
        'rota1_date' => 'date',
        'ipv1_date' => 'date',
        'penta2_date' => 'date',
        'pcv2_date' => 'date',
        'rota2_date' => 'date',
        'opv2_date' => 'date',
        'penta3_date' => 'date',
        'pcv3_date' => 'date',
        'opv3_date' => 'date',
        'rota3_date' => 'date',
        'ipv2_date' => 'date',
        'measles_date' => 'date',
        'yellow_fever_date' => 'date',
        'vitamin_a_date' => 'date',
        'mcv2_date' => 'date',

        // Boolean fields - ANC Tracking
        'tracked_before_anc1' => 'boolean',
        'tracked_before_anc2' => 'boolean',
        'tracked_before_anc3' => 'boolean',
        'tracked_before_anc4' => 'boolean',
        'tracked_before_anc5' => 'boolean',
        'tracked_before_anc6' => 'boolean',
        'tracked_before_anc7' => 'boolean',
        'tracked_before_anc8' => 'boolean',
        
        // Boolean fields - ANC Payments
        'anc1_paid' => 'boolean',
        'anc2_paid' => 'boolean',
        'anc3_paid' => 'boolean',
        'anc4_paid' => 'boolean',
        'anc5_paid' => 'boolean',
        'anc6_paid' => 'boolean',
        'anc7_paid' => 'boolean',
        'anc8_paid' => 'boolean',
        
        // Boolean fields - ANC Services
        'anc1_urinalysis' => 'boolean',
        'anc1_iron_folate' => 'boolean',
        'anc1_mms' => 'boolean',
        'anc1_sp' => 'boolean',
        'anc1_sba' => 'boolean',
        'anc2_urinalysis' => 'boolean',
        'anc2_iron_folate' => 'boolean',
        'anc2_mms' => 'boolean',
        'anc2_sp' => 'boolean',
        'anc2_sba' => 'boolean',
        'anc3_urinalysis' => 'boolean',
        'anc3_iron_folate' => 'boolean',
        'anc3_mms' => 'boolean',
        'anc3_sp' => 'boolean',
        'anc3_sba' => 'boolean',
        'anc4_urinalysis' => 'boolean',
        'anc4_iron_folate' => 'boolean',
        'anc4_mms' => 'boolean',
        'anc4_sp' => 'boolean',
        'anc4_sba' => 'boolean',
        'anc5_urinalysis' => 'boolean',
        'anc5_iron_folate' => 'boolean',
        'anc5_mms' => 'boolean',
        'anc5_sp' => 'boolean',
        'anc5_sba' => 'boolean',
        'anc6_urinalysis' => 'boolean',
        'anc6_iron_folate' => 'boolean',
        'anc6_mms' => 'boolean',
        'anc6_sp' => 'boolean',
        'anc6_sba' => 'boolean',
        'anc7_urinalysis' => 'boolean',
        'anc7_iron_folate' => 'boolean',
        'anc7_mms' => 'boolean',
        'anc7_sp' => 'boolean',
        'anc7_sba' => 'boolean',
        'anc8_urinalysis' => 'boolean',
        'anc8_iron_folate' => 'boolean',
        'anc8_mms' => 'boolean',
        'anc8_sp' => 'boolean',
        'anc8_sba' => 'boolean',
        
        // Boolean fields - HIV Results
        'anc1_hiv_result_received' => 'boolean',
        'anc2_hiv_result_received' => 'boolean',
        'anc3_hiv_result_received' => 'boolean',
        'anc4_hiv_result_received' => 'boolean',
        'anc5_hiv_result_received' => 'boolean',
        'anc6_hiv_result_received' => 'boolean',
        'anc7_hiv_result_received' => 'boolean',
        'anc8_hiv_result_received' => 'boolean',
        
        // Boolean fields - Delivery & Family Planning
        'delivery_kits_received' => 'boolean',
        'insurance_satisfaction' => 'boolean',
        'fp_using' => 'boolean',
        'fp_male_condom' => 'boolean',
        'fp_female_condom' => 'boolean',
        'fp_pill' => 'boolean',
        'fp_injectable' => 'boolean',
        'fp_implant' => 'boolean',
        'fp_iud' => 'boolean',
        'fp_other' => 'boolean',
        
        // Boolean fields - Vaccines
        'bcg_received' => 'boolean',
        'hep0_received' => 'boolean',
        'opv0_received' => 'boolean',
        'penta1_received' => 'boolean',
        'pcv1_received' => 'boolean',
        'opv1_received' => 'boolean',
        'rota1_received' => 'boolean',
        'ipv1_received' => 'boolean',
        'penta2_received' => 'boolean',
        'pcv2_received' => 'boolean',
        'rota2_received' => 'boolean',
        'opv2_received' => 'boolean',
        'penta3_received' => 'boolean',
        'pcv3_received' => 'boolean',
        'opv3_received' => 'boolean',
        'rota3_received' => 'boolean',
        'ipv2_received' => 'boolean',
        'measles_received' => 'boolean',
        'yellow_fever_received' => 'boolean',
        'vitamin_a_received' => 'boolean',
        'mcv2_received' => 'boolean',

        // System booleans
        'anc4_completed' => 'boolean',
        'pnc_completed' => 'boolean',
    ];

    // --- RELATIONSHIPS ---
    public function lga()
    {
        return $this->belongsTo(Lga::class);
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function healthFacility()
    {
        return $this->belongsTo(Phc::class, 'health_facility_id');
    }

    public function phc()
    {
        return $this->belongsTo(Phc::class, 'phc_id');
    }

    public function children()
    {
        return $this->hasMany(Child::class);
    }

    // --- AUTO-CALCULATION LOGIC ---
    public static function boot()
    {
        parent::boot();

        static::saving(function ($patient) {
            // Auto-calculate next visit dates if visit date exists but next date doesn't
            for ($i = 1; $i <= 8; $i++) {
                $visitDateField = "anc_visit_{$i}_date";
                $nextDateField = "anc_visit_{$i}_next_date";
                
                if (!empty($patient->$visitDateField) && empty($patient->$nextDateField)) {
                    $visitDate = Carbon::parse($patient->$visitDateField);
                    $nextVisitDate = $visitDate->copy()->addDays(28); // 4 weeks later
                    $patient->$nextDateField = $nextVisitDate->format('Y-m-d');
                }
            }
            
            // Calculate ANC visits count (1-8) - consider visits with either date or next date
            $ancDates = [];
            for ($i = 1; $i <= 8; $i++) {
                $dateField = "anc_visit_{$i}_date";
                $nextDateField = "anc_visit_{$i}_next_date";
                if (!empty($patient->$dateField) || !empty($patient->$nextDateField)) {
                    $ancDates[] = $patient->$dateField ?? $patient->$nextDateField;
                }
            }
            
            $patient->anc_visits_count = count($ancDates);
            $patient->anc4_completed = $patient->anc_visits_count >= 4;
            
            // PNC completed if all 3 visits are recorded
            $patient->pnc_completed = !empty($patient->pnc_visit_1) && 
                                     !empty($patient->pnc_visit_2) && 
                                     !empty($patient->pnc_visit_3);

            $now = Carbon::now();
            $edd = $patient->edd ? Carbon::parse($patient->edd) : null;
            $dateOfDelivery = $patient->date_of_delivery ? Carbon::parse($patient->date_of_delivery) : null;

            $patient->alert = "Up to date";
            $patient->post_edd_followup_status = "On Track";

            // Check for upcoming next visit dates
            $upcomingNextVisit = false;
            for ($i = 1; $i <= 8; $i++) {
                $nextDateField = "anc_visit_{$i}_next_date";
                if (!empty($patient->$nextDateField)) {
                    $nextDate = Carbon::parse($patient->$nextDateField);
                    if ($nextDate->isFuture() && $nextDate->diffInDays($now) <= 7) {
                        $patient->alert = "Upcoming ANC Visit in " . $nextDate->diffInDays($now) . " days";
                        $upcomingNextVisit = true;
                        break;
                    }
                }
            }
            
            if (!$upcomingNextVisit) {
                if ($edd && $now->gt($edd) && empty($dateOfDelivery)) {
                    $patient->alert = "Follow-up delivery (Overdue)";
                    $patient->post_edd_followup_status = "Missed Follow-up";
                } elseif (!empty($dateOfDelivery) && !$patient->pnc_completed) {
                    $patient->alert = "Schedule PNC Visits";
                    $patient->post_edd_followup_status = "PNC Pending";
                } elseif ($patient->anc_visits_count < 4) {
                    $patient->alert = "Needs ANC " . ($patient->anc_visits_count + 1) . " Visit";
                    $patient->post_edd_followup_status = "ANC Incomplete";
                }
            }
        });
    }

    // --- ACCESSORS FOR PAYMENT TOTALS ---
    public function getTotalAncPaymentsAttribute()
    {
        $total = 0;
        for ($i = 1; $i <= 8; $i++) {
            $paidField = "anc{$i}_paid";
            $amountField = "anc{$i}_payment_amount";
            if ($this->$paidField) {
                $total += $this->$amountField ?? 0;
            }
        }
        return $total;
    }

    public function getPaidAncVisitsCountAttribute()
    {
        $count = 0;
        for ($i = 1; $i <= 8; $i++) {
            $paidField = "anc{$i}_paid";
            if ($this->$paidField) {
                $count++;
            }
        }
        return $count;
    }

    // --- ACCESSOR FOR COMPREHENSIVE ANC SERVICES SUMMARY (INCLUDES NEXT VISIT DATE) ---
    public function getAncServicesSummaryAttribute()
    {
        $services = [];
        for ($i = 1; $i <= 8; $i++) {
            $dateField = "anc_visit_{$i}_date";
            $nextDateField = "anc_visit_{$i}_next_date";
            
            if (!empty($this->$dateField) || !empty($this->$nextDateField)) {
                $visitServices = [];
                if ($this->{"anc{$i}_urinalysis"}) $visitServices[] = 'Urinalysis';
                if ($this->{"anc{$i}_iron_folate"}) $visitServices[] = 'Iron Folate';
                if ($this->{"anc{$i}_mms"}) $visitServices[] = 'MMS';
                if ($this->{"anc{$i}_sp"}) $visitServices[] = 'SP';
                if ($this->{"anc{$i}_sba"}) $visitServices[] = 'SBA';
                
                $visitInfo = [];
                if (!empty($this->$dateField)) {
                    $visitInfo[] = 'Visit: ' . Carbon::parse($this->$dateField)->format('M d, Y');
                }
                if (!empty($this->$nextDateField)) {
                    $visitInfo[] = 'Next: ' . Carbon::parse($this->$nextDateField)->format('M d, Y');
                }
                if (!empty($visitServices)) {
                    $visitInfo[] = 'Services: ' . implode(', ', $visitServices);
                }
                
                if (!empty($visitInfo)) {
                    $services["ANC $i"] = implode(' | ', $visitInfo);
                }
            }
        }
        return $services;
    }

    // --- ACCESSOR FOR NEXT ANC VISIT DATE (FUTURE DATES) ---
    public function getNextAncVisitDateAttribute()
    {
        $now = Carbon::now();
        for ($i = 1; $i <= 8; $i++) {
            $nextDateField = "anc_visit_{$i}_next_date";
            if (!empty($this->$nextDateField)) {
                $nextDate = Carbon::parse($this->$nextDateField);
                if ($nextDate->isFuture()) {
                    return $this->$nextDateField;
                }
            }
        }
        return null;
    }

    // --- ACCESSOR FOR UPCOMING ANC VISIT (WITHIN 7 DAYS) ---
    public function getUpcomingAncVisitAttribute()
    {
        $now = Carbon::now();
        $upcomingVisits = [];
        
        for ($i = 1; $i <= 8; $i++) {
            $nextDateField = "anc_visit_{$i}_next_date";
            if (!empty($this->$nextDateField)) {
                $nextDate = Carbon::parse($this->$nextDateField);
                if ($nextDate->isFuture() && $nextDate->diffInDays($now) <= 7) {
                    $upcomingVisits[] = [
                        'visit_number' => $i,
                        'date' => $this->$nextDateField,
                        'days_until' => $nextDate->diffInDays($now),
                    ];
                }
            }
        }
        
        return $upcomingVisits;
    }

    // --- ACCESSOR FOR MISSED NEXT VISITS (PAST DATES) ---
    public function getMissedNextVisitsAttribute()
    {
        $now = Carbon::now();
        $missedVisits = [];
        
        for ($i = 1; $i <= 8; $i++) {
            $nextDateField = "anc_visit_{$i}_next_date";
            if (!empty($this->$nextDateField)) {
                $nextDate = Carbon::parse($this->$nextDateField);
                if ($nextDate->isPast()) {
                    $missedVisits[] = [
                        'visit_number' => $i,
                        'date' => $this->$nextDateField,
                        'days_overdue' => $now->diffInDays($nextDate),
                    ];
                }
            }
        }
        
        return $missedVisits;
    }

    // --- ACCESSOR FOR VACCINATION SUMMARY ---
    public function getVaccinationSummaryAttribute()
    {
        $vaccines = [];
        
        $vaccineFields = [
            'At Birth' => ['bcg', 'hep0', 'opv0'],
            '6 Weeks' => ['penta1', 'pcv1', 'opv1', 'rota1', 'ipv1'],
            '10 Weeks' => ['penta2', 'pcv2', 'rota2', 'opv2'],
            '14 Weeks' => ['penta3', 'pcv3', 'opv3', 'rota3', 'ipv2'],
            '9 Months' => ['measles', 'yellow_fever', 'vitamin_a'],
            '15 Months' => ['mcv2']
        ];

        foreach ($vaccineFields as $stage => $stageVaccines) {
            $completed = [];
            foreach ($stageVaccines as $vaccine) {
                if ($this->{"{$vaccine}_received"}) {
                    $completed[] = ucfirst($vaccine);
                }
            }
            if (!empty($completed)) {
                $vaccines[$stage] = implode(', ', $completed);
            }
        }

        return $vaccines;
    }

    // --- NEW METHOD: Calculate if patient is due for next ANC visit ---
    public function isDueForNextVisit()
    {
        $now = Carbon::now();
        
        // First, check if there's a scheduled next visit date
        if ($this->next_anc_visit_date) {
            $nextDate = Carbon::parse($this->next_anc_visit_date);
            return $now->greaterThanOrEqualTo($nextDate->subDays(3)); // Due 3 days before scheduled date
        }
        
        // If no scheduled next visit, check last visit date
        $lastVisitDate = null;
        for ($i = 8; $i >= 1; $i--) {
            $dateField = "anc_visit_{$i}_date";
            if (!empty($this->$dateField)) {
                $lastVisitDate = Carbon::parse($this->$dateField);
                break;
            }
        }
        
        if ($lastVisitDate) {
            // Check if it's been more than 4 weeks since last visit
            return $now->diffInDays($lastVisitDate) >= 28;
        }
        
        return false;
    }

    // --- NEW METHOD: Get ANC visit schedule with next dates ---
    public function getAncVisitScheduleAttribute()
    {
        $schedule = [];
        $now = Carbon::now();
        
        for ($i = 1; $i <= 8; $i++) {
            $dateField = "anc_visit_{$i}_date";
            $nextDateField = "anc_visit_{$i}_next_date";
            
            $visit = [
                'number' => $i,
                'visit_date' => $this->$dateField,
                'next_date' => $this->$nextDateField,
                'status' => 'Not Scheduled'
            ];
            
            if (!empty($this->$dateField)) {
                $visit['status'] = 'Completed';
            } elseif (!empty($this->$nextDateField)) {
                $nextDate = Carbon::parse($this->$nextDateField);
                if ($nextDate->isPast()) {
                    $visit['status'] = 'Missed';
                } elseif ($nextDate->isFuture()) {
                    $visit['status'] = 'Scheduled';
                }
            }
            
            $schedule[] = $visit;
        }
        
        return $schedule;
    }
}