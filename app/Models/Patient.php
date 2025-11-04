<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Patient extends Model
{
    use HasFactory;

    protected $fillable = [
        // --- Core Info and Foreign Keys (Normalized) ---
        'unique_id',
        'woman_name', 'age', 'literacy_status', 'phone_number', 'husband_name', 'husband_phone',
        'community', 'address',

        'ward_id', 'lga_id', 'health_facility_id', 'phc_id', // Foreign Keys

        // --- Medical Info ---
        'gravida', 'parity', 'date_of_registration', 'edd',

        // --- ANC Visits and Tracking ---
        'anc_visit_1', 'tracked_before_anc1', 'anc_visit_2', 'tracked_before_anc2',
        'anc_visit_3', 'tracked_before_anc3', 'anc_visit_4', 'tracked_before_anc4',
        'additional_anc_count',

        // --- Delivery ---
        'place_of_delivery', 'delivery_kits_received', 'type_of_delivery', 'delivery_outcome', 'date_of_delivery',

        // --- Postpartum & FP ---
        'child_immunization_status', 'fp_interest_postpartum', 'fp_given', 'fp_paid',
        'fp_payment_amount', 'fp_reason_not_given', 'pnc_visit_1', 'pnc_visit_2',

        // --- Insurance & Payment ---
        'health_insurance_status', 'insurance_satisfaction', 'anc_paid', 'anc_payment_amount',

        // --- Additional Notes ---
        'remark', 'comments',
    ];

    protected $guarded = [
        'anc_visits_count', 'anc4_completed', 'pnc_completed', 'post_edd_followup_status', 'alert',
    ];

    // ✅ Add ID casting here too (most important)
    protected $casts = [
        'id' => 'integer',
        'lga_id' => 'integer',
        'ward_id' => 'integer',
        'phc_id' => 'integer',
        'health_facility_id' => 'integer',
        'age' => 'integer',

        'date_of_registration' => 'date',
        'edd' => 'date',
        'anc_visit_1' => 'date',
        'anc_visit_2' => 'date',
        'anc_visit_3' => 'date',
        'anc_visit_4' => 'date',
        'date_of_delivery' => 'date',
        'pnc_visit_1' => 'date',
        'pnc_visit_2' => 'date',

        'tracked_before_anc1' => 'boolean',
        'tracked_before_anc2' => 'boolean',
        'tracked_before_anc3' => 'boolean',
        'tracked_before_anc4' => 'boolean',
        'delivery_kits_received' => 'boolean',
        'fp_interest_postpartum' => 'boolean',
        'fp_given' => 'boolean',
        'fp_paid' => 'boolean',
        'insurance_satisfaction' => 'boolean',
        'anc_paid' => 'boolean',
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

    public function phcStaff()
    {
        return $this->belongsTo(Phc::class, 'phc_id');
    }

    // --- AUTO-CALCULATION LOGIC ---
    public static function boot()
    {
        parent::boot();

        static::saving(function ($patient) {
            $count = collect([
                $patient->anc_visit_1, $patient->anc_visit_2, $patient->anc_visit_3, $patient->anc_visit_4
            ])->filter()->count();

            $patient->anc_visits_count = $count;
            $patient->anc4_completed = $count >= 4;
            $patient->pnc_completed = !empty($patient->pnc_visit_1) && !empty($patient->pnc_visit_2);

            $now = Carbon::now();
            $edd = $patient->edd ? Carbon::parse($patient->edd) : null;
            $dateOfDelivery = $patient->date_of_delivery ? Carbon::parse($patient->date_of_delivery) : null;

            $patient->alert = "Up to date";
            $patient->post_edd_followup_status = "On Track";

            if ($edd && $now->gt($edd) && empty($dateOfDelivery)) {
                $patient->alert = "Follow-up delivery (Overdue)";
                $patient->post_edd_followup_status = "Missed Follow-up";
            } elseif (!empty($dateOfDelivery) && !$patient->pnc_completed) {
                $patient->alert = "Schedule PNC Visit 1/2";
                $patient->post_edd_followup_status = "PNC Pending";
            } elseif ($count < 4) {
                $patient->alert = "Needs ANC " . ($count + 1) . " Visit";
                $patient->post_edd_followup_status = "ANC Incomplete";
            }
        });
    }
}
