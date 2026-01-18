<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Child extends Model
{
    use HasFactory;

    protected $fillable = [
        'unique_id',
        'patient_id',
        'phc_id',
        'lga_id',
        'ward_id',
        'child_name',
        'date_of_birth',
        'sex',
        'birth_weight',
        'place_of_birth',
        'mother_name',
        'mother_phone',
        'father_name',
        'father_phone',
        'address',
        'community',
        'bcg_received', 'bcg_date',
        'hep0_received', 'hep0_date',
        'opv0_received', 'opv0_date',
        'penta1_received', 'penta1_date',
        'pcv1_received', 'pcv1_date',
        'opv1_received', 'opv1_date',
        'rota1_received', 'rota1_date',
        'ipv1_received', 'ipv1_date',
        'penta2_received', 'penta2_date',
        'pcv2_received', 'pcv2_date',
        'rota2_received', 'rota2_date',
        'opv2_received', 'opv2_date',
        'penta3_received', 'penta3_date',
        'pcv3_received', 'pcv3_date',
        'opv3_received', 'opv3_date',
        'rota3_received', 'rota3_date',
        'ipv2_received', 'ipv2_date',
        'measles1_received', 'measles1_date',
        'yellow_fever_received', 'yellow_fever_date',
        'vitamin_a1_received', 'vitamin_a1_date',
        'measles2_received', 'measles2_date',
        'vitamin_a2_received', 'vitamin_a2_date',
        'nutrition_status',
        'alert',
        'remarks',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'birth_weight' => 'decimal:2',
        'bcg_received' => 'boolean',
        'bcg_date' => 'date',
        'hep0_received' => 'boolean',
        'hep0_date' => 'date',
        'opv0_received' => 'boolean',
        'opv0_date' => 'date',
        'penta1_received' => 'boolean',
        'penta1_date' => 'date',
        'pcv1_received' => 'boolean',
        'pcv1_date' => 'date',
        'opv1_received' => 'boolean',
        'opv1_date' => 'date',
        'rota1_received' => 'boolean',
        'rota1_date' => 'date',
        'ipv1_received' => 'boolean',
        'ipv1_date' => 'date',
        'penta2_received' => 'boolean',
        'penta2_date' => 'date',
        'pcv2_received' => 'boolean',
        'pcv2_date' => 'date',
        'rota2_received' => 'boolean',
        'rota2_date' => 'date',
        'opv2_received' => 'boolean',
        'opv2_date' => 'date',
        'penta3_received' => 'boolean',
        'penta3_date' => 'date',
        'pcv3_received' => 'boolean',
        'pcv3_date' => 'date',
        'opv3_received' => 'boolean',
        'opv3_date' => 'date',
        'rota3_received' => 'boolean',
        'rota3_date' => 'date',
        'ipv2_received' => 'boolean',
        'ipv2_date' => 'date',
        'measles1_received' => 'boolean',
        'measles1_date' => 'date',
        'yellow_fever_received' => 'boolean',
        'yellow_fever_date' => 'date',
        'vitamin_a1_received' => 'boolean',
        'vitamin_a1_date' => 'date',
        'measles2_received' => 'boolean',
        'measles2_date' => 'date',
        'vitamin_a2_received' => 'boolean',
        'vitamin_a2_date' => 'date',
    ];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function phc()
    {
        return $this->belongsTo(Phc::class);
    }

    public function lga()
    {
        return $this->belongsTo(Lga::class);
    }

    public function ward()
    {
        return $this->belongsTo(Ward::class);
    }

    public function nutritionLogs()
    {
        return $this->hasMany(ChildNutritionLog::class);
    }

    public function getAgeInMonthsAttribute()
    {
        return Carbon::parse($this->date_of_birth)->diffInMonths(now());
    }

    public function getAgeDisplayAttribute()
    {
        $dob = Carbon::parse($this->date_of_birth);
        $years = $dob->diffInYears(now());
        $months = $dob->diffInMonths(now()) % 12;
        
        if ($years > 0) {
            return "{$years}y {$months}m";
        }
        return "{$months} months";
    }

    public function getNextDueVaccineAttribute()
    {
        $ageInWeeks = Carbon::parse($this->date_of_birth)->diffInWeeks(now());
        $ageInMonths = $this->age_in_months;
        
        $schedule = [
            ['age_weeks' => 0, 'vaccines' => ['BCG', 'HepB0', 'OPV0'], 'fields' => ['bcg_received', 'hep0_received', 'opv0_received']],
            ['age_weeks' => 6, 'vaccines' => ['Penta1', 'PCV1', 'OPV1', 'Rota1', 'IPV1'], 'fields' => ['penta1_received', 'pcv1_received', 'opv1_received', 'rota1_received', 'ipv1_received']],
            ['age_weeks' => 10, 'vaccines' => ['Penta2', 'PCV2', 'Rota2', 'OPV2'], 'fields' => ['penta2_received', 'pcv2_received', 'rota2_received', 'opv2_received']],
            ['age_weeks' => 14, 'vaccines' => ['Penta3', 'PCV3', 'OPV3', 'Rota3', 'IPV2'], 'fields' => ['penta3_received', 'pcv3_received', 'opv3_received', 'rota3_received', 'ipv2_received']],
            ['age_months' => 9, 'vaccines' => ['Measles1', 'Yellow Fever', 'Vitamin A'], 'fields' => ['measles1_received', 'yellow_fever_received', 'vitamin_a1_received']],
            ['age_months' => 15, 'vaccines' => ['Measles2', 'Vitamin A2'], 'fields' => ['measles2_received', 'vitamin_a2_received']],
        ];

        foreach ($schedule as $stage) {
            $isEligible = isset($stage['age_weeks']) 
                ? $ageInWeeks >= $stage['age_weeks']
                : $ageInMonths >= $stage['age_months'];
            
            if ($isEligible) {
                foreach ($stage['fields'] as $i => $field) {
                    if (!$this->$field) {
                        return $stage['vaccines'][$i];
                    }
                }
            }
        }
        
        return null;
    }

    public function getVaccinationProgressAttribute()
    {
        $totalVaccines = 16;
        $received = 0;
        
        $vaccineFields = [
            'bcg_received', 'hep0_received', 'opv0_received',
            'penta1_received', 'pcv1_received', 'opv1_received', 'rota1_received', 'ipv1_received',
            'penta2_received', 'pcv2_received', 'rota2_received', 'opv2_received',
            'penta3_received', 'pcv3_received', 'opv3_received', 'rota3_received', 'ipv2_received',
            'measles1_received', 'yellow_fever_received', 'vitamin_a1_received',
            'measles2_received', 'vitamin_a2_received',
        ];
        
        foreach ($vaccineFields as $field) {
            if ($this->$field) {
                $received++;
            }
        }
        
        return round(($received / $totalVaccines) * 100);
    }

    public static function boot()
    {
        parent::boot();

        static::saving(function ($child) {
            $latestLog = $child->nutritionLogs()->latest('visit_date')->first();
            if ($latestLog) {
                if ($latestLog->muac_status === 'SAM' || $latestLog->weight_for_height === 'Severely Wasted') {
                    $child->nutrition_status = 'SAM';
                    $child->alert = 'Critical: Severe Acute Malnutrition';
                } elseif ($latestLog->muac_status === 'MAM' || $latestLog->weight_for_height === 'Wasted') {
                    $child->nutrition_status = 'MAM';
                    $child->alert = 'Warning: Moderate Acute Malnutrition';
                } elseif ($latestLog->weight_for_height === 'Overweight' || $latestLog->weight_for_height === 'Obese') {
                    $child->nutrition_status = 'Overweight';
                    $child->alert = 'Monitor: Overweight';
                } else {
                    $child->nutrition_status = 'Normal';
                    $child->alert = null;
                }
            }
            
            $nextVaccine = $child->next_due_vaccine;
            if ($nextVaccine && !$child->alert) {
                $child->alert = "Due for {$nextVaccine} vaccination";
            }
        });
    }
}
