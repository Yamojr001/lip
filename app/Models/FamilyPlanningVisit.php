<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FamilyPlanningVisit extends Model
{
    use HasFactory;

    protected $fillable = [
        'patient_id',
        'phc_id',
        'visit_date',
        'client_card_number',
        'sex',
        'age_range',
        'marital_status',
        'acceptor_type',
        'blood_pressure',
        'oral_pills',
        'oral_pills_type',
        'oral_pills_status',
        'oral_pills_cycles',
        'injectable',
        'injectable_type',
        'injectable_status',
        'injectable_doses',
        'iud',
        'iud_status',
        'iud_action',
        'condoms',
        'condoms_type',
        'condoms_direction',
        'condoms_quantity',
        'implants',
        'implants_type',
        'implants_direction',
        'voluntary_sterilization',
        'sterilization_type',
        'natural_methods',
        'cycle_beads',
        'natural_method_other',
        'referred',
        'referred_to',
        'notes',
    ];

    protected $casts = [
        'visit_date' => 'date',
        'oral_pills' => 'boolean',
        'oral_pills_cycles' => 'integer',
        'injectable' => 'boolean',
        'injectable_doses' => 'integer',
        'iud' => 'boolean',
        'condoms' => 'boolean',
        'condoms_quantity' => 'integer',
        'implants' => 'boolean',
        'voluntary_sterilization' => 'boolean',
        'natural_methods' => 'boolean',
        'cycle_beads' => 'boolean',
        'referred' => 'boolean',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function phc()
    {
        return $this->belongsTo(Phc::class);
    }

    public function getAgeRangeFromAge($age)
    {
        $ranges = ['10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49'];
        foreach ($ranges as $range) {
            [$min, $max] = explode('-', $range);
            if ($age >= (int)$min && $age <= (int)$max) {
                return $range;
            }
        }
        return null;
    }
}
