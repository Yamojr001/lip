<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NutritionReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'phc_id',
        'user_id',
        'year',
        'month',
        
        // Total children screened
        'total_children_screened',
        
        // Age 6-23 months (by gender)
        'age_6_23_male_screened',
        'age_6_23_female_screened',
        
        // Age 24-59 months (by gender)
        'age_24_59_male_screened',
        'age_24_59_female_screened',
        
        // Normal children identified
        'age_6_23_male_normal',
        'age_6_23_female_normal',
        'age_24_59_male_normal',
        'age_24_59_female_normal',
        
        // MAM children identified
        'age_6_23_male_mam',
        'age_6_23_female_mam',
        'age_24_59_male_mam',
        'age_24_59_female_mam',
        
        // SAM children identified
        'age_6_23_male_sam',
        'age_6_23_female_sam',
        'age_24_59_male_sam',
        'age_24_59_female_sam',
        
        // New SAM in this outreach
        'new_sam_this_outreach',
        
        // SAM referred to OTP
        'sam_referred_otp',
        
        // Oedema/SAM with complications referred to SC
        'oedema_sam_complications_male',
        'oedema_sam_complications_female',
        
        // Oedema total by gender
        'oedema_total_male',
        'oedema_total_female',
        
        // SAM with complications referred to SC by gender
        'sam_complications_male_sc',
        'sam_complications_female_sc',
        
        // Albendazole
        'albendazole_12_23_male',
        'albendazole_12_23_female',
        'albendazole_24_59_male',
        'albendazole_24_59_female',
        
        // Vitamin A Supplementation (VAS)
        'vas_6_11_first_dose_male',
        'vas_6_11_first_dose_female',
        'vas_12_59_second_dose_male',
        'vas_12_59_second_dose_female',
        
        // RUTF given
        'rutf_given',
        
        // MNP given
        'mnp_given',
        
        // Exclusive breastfeeding (0-6 months)
        'exclusive_breastfeeding_0_6',
        
        // Pregnant women and caregivers counselled
        'miycf_counselled_pregnant_women',
        'miycf_counselled_caregivers',
        
        'comments',
        'submitted',
        'submitted_at',
    ];

    protected $casts = [
        'submitted' => 'boolean',
        'submitted_at' => 'datetime',
    ];

    /**
     * Get the months as array
     */
    public static function getMonths()
    {
        return [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    }

    /**
     * Get the years range
     */
    public static function getYears()
    {
        $currentYear = date('Y');
        return range($currentYear - 5, $currentYear + 1);
    }

    /**
     * Relationship with PHC
     */
    public function phc()
    {
        return $this->belongsTo(Phc::class);
    }

    /**
     * Relationship with User
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Calculate total for age group 6-23 months
     */
    public function getAge6_23TotalScreenedAttribute()
    {
        return $this->age_6_23_male_screened + $this->age_6_23_female_screened;
    }

    /**
     * Calculate total for age group 24-59 months
     */
    public function getAge24_59TotalScreenedAttribute()
    {
        return $this->age_24_59_male_screened + $this->age_24_59_female_screened;
    }

    /**
     * Calculate total normal children
     */
    public function getTotalNormalAttribute()
    {
        return $this->age_6_23_male_normal + $this->age_6_23_female_normal +
               $this->age_24_59_male_normal + $this->age_24_59_female_normal;
    }

    /**
     * Calculate total MAM children
     */
    public function getTotalMamAttribute()
    {
        return $this->age_6_23_male_mam + $this->age_6_23_female_mam +
               $this->age_24_59_male_mam + $this->age_24_59_female_mam;
    }

    /**
     * Calculate total SAM children
     */
    public function getTotalSamAttribute()
    {
        return $this->age_6_23_male_sam + $this->age_6_23_female_sam +
               $this->age_24_59_male_sam + $this->age_24_59_female_sam;
    }

    /**
     * Calculate total oedema
     */
    public function getTotalOedemaAttribute()
    {
        return $this->oedema_total_male + $this->oedema_total_female;
    }

    /**
     * Calculate total albendazole given
     */
    public function getTotalAlbendazoleAttribute()
    {
        return $this->albendazole_12_23_male + $this->albendazole_12_23_female +
               $this->albendazole_24_59_male + $this->albendazole_24_59_female;
    }

    /**
     * Calculate total VAS given
     */
    public function getTotalVasAttribute()
    {
        return $this->vas_6_11_first_dose_male + $this->vas_6_11_first_dose_female +
               $this->vas_12_59_second_dose_male + $this->vas_12_59_second_dose_female;
    }

    /**
     * Calculate total MIYCF counselled
     */
    public function getTotalMiycfCounselledAttribute()
    {
        return $this->miycf_counselled_pregnant_women + $this->miycf_counselled_caregivers;
    }
}