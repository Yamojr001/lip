<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChildNutritionLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'child_id',
        'phc_id',
        'recorded_by',
        'visit_date',
        'age_in_months',
        'weight',
        'height',
        'muac',
        'weight_for_age',
        'height_for_age',
        'weight_for_height',
        'muac_status',
        'vitamin_a_given',
        'deworming_given',
        'iron_supplement_given',
        'feeding_practice',
        'referred_for_treatment',
        'referral_reason',
        'counseling_given',
        'remarks',
        'next_visit_date',
        'client_number',
        'visit_type',
        'breastfeeding_status',
        'exclusive_bf',
        'bf_with_water',
        'partial_bf',
        'stopped_bf',
        'muac_indicator_used',
        'nutritional_status_line',
        'age_0_5_months',
        'age_6_11_months',
        'age_12_59_months',
        'vitamin_a_dose',
        'deworming_eligible',
        'cmam_referred',
        'cmam_admitted',
        'cmam_admission_type',
        'sam_eligible',
        'sam_referred_to_otp',
        'sam_outcome',
    ];

    protected $casts = [
        'visit_date' => 'date',
        'next_visit_date' => 'date',
        'weight' => 'decimal:2',
        'height' => 'decimal:2',
        'muac' => 'decimal:1',
        'vitamin_a_given' => 'boolean',
        'deworming_given' => 'boolean',
        'iron_supplement_given' => 'boolean',
        'referred_for_treatment' => 'boolean',
    ];

    public function child()
    {
        return $this->belongsTo(Child::class);
    }

    public function phc()
    {
        return $this->belongsTo(Phc::class);
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public static function calculateMuacStatus($muac)
    {
        if ($muac < 11.5) {
            return 'SAM';
        } elseif ($muac < 12.5) {
            return 'MAM';
        }
        return 'Normal';
    }
}
