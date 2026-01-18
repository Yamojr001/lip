<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            // PNC Visit 1 - Comprehensive fields
            $table->string('pnc1_attendance_timing')->nullable(); // 12hrs, N (Next day), 12b (12 hours before), R (Regular)
            $table->string('pnc1_associated_problems')->nullable();
            $table->string('pnc1_mother_visit_timing')->nullable(); // 2-3 days, 4-7 days, >7 days
            $table->string('pnc1_newborn_visit_timing')->nullable();
            $table->string('pnc1_newborn_sex')->nullable();
            
            // Maternal Care - PNC1
            $table->boolean('pnc1_breastfeeding_counseling')->default(false);
            $table->boolean('pnc1_nutrition_counseling')->default(false);
            $table->boolean('pnc1_family_planning_counseling')->default(false);
            $table->boolean('pnc1_cord_care_counseling')->default(false);
            $table->boolean('pnc1_temperature_check')->default(false);
            $table->boolean('pnc1_blood_pressure_check')->default(false);
            $table->boolean('pnc1_pv_examination')->default(false);
            $table->boolean('pnc1_breast_examination')->default(false);
            $table->boolean('pnc1_anemia_check')->default(false);
            $table->boolean('pnc1_iron_folate_given')->default(false);
            $table->boolean('pnc1_vitamin_a_given')->default(false);
            
            // Newborn Care - PNC1
            $table->boolean('pnc1_newborn_temp_check')->default(false);
            $table->boolean('pnc1_newborn_weight_check')->default(false);
            $table->boolean('pnc1_newborn_cord_check')->default(false);
            $table->boolean('pnc1_newborn_skin_check')->default(false);
            $table->boolean('pnc1_newborn_eye_check')->default(false);
            $table->boolean('pnc1_newborn_feeding_check')->default(false);
            $table->string('pnc1_neonatal_complications')->nullable();
            $table->boolean('pnc1_kmc_initiated')->default(false);
            
            // Outcome - PNC1
            $table->string('pnc1_outcome')->nullable(); // NT (Not Treated), T (Treated), A (Admitted)
            $table->boolean('pnc1_referred_out')->default(false);
            $table->string('pnc1_transportation_out')->nullable();

            // PNC Visit 2 - Same structure
            $table->string('pnc2_attendance_timing')->nullable();
            $table->string('pnc2_associated_problems')->nullable();
            $table->string('pnc2_mother_visit_timing')->nullable();
            $table->string('pnc2_newborn_visit_timing')->nullable();
            $table->boolean('pnc2_breastfeeding_counseling')->default(false);
            $table->boolean('pnc2_nutrition_counseling')->default(false);
            $table->boolean('pnc2_family_planning_counseling')->default(false);
            $table->boolean('pnc2_cord_care_counseling')->default(false);
            $table->boolean('pnc2_temperature_check')->default(false);
            $table->boolean('pnc2_blood_pressure_check')->default(false);
            $table->boolean('pnc2_pv_examination')->default(false);
            $table->boolean('pnc2_breast_examination')->default(false);
            $table->boolean('pnc2_anemia_check')->default(false);
            $table->boolean('pnc2_iron_folate_given')->default(false);
            $table->boolean('pnc2_vitamin_a_given')->default(false);
            $table->boolean('pnc2_newborn_temp_check')->default(false);
            $table->boolean('pnc2_newborn_weight_check')->default(false);
            $table->boolean('pnc2_newborn_cord_check')->default(false);
            $table->boolean('pnc2_newborn_skin_check')->default(false);
            $table->boolean('pnc2_newborn_eye_check')->default(false);
            $table->boolean('pnc2_newborn_feeding_check')->default(false);
            $table->string('pnc2_neonatal_complications')->nullable();
            $table->boolean('pnc2_kmc_initiated')->default(false);
            $table->string('pnc2_outcome')->nullable();
            $table->boolean('pnc2_referred_out')->default(false);
            $table->string('pnc2_transportation_out')->nullable();

            // PNC Visit 3 - Same structure
            $table->string('pnc3_attendance_timing')->nullable();
            $table->string('pnc3_associated_problems')->nullable();
            $table->string('pnc3_mother_visit_timing')->nullable();
            $table->string('pnc3_newborn_visit_timing')->nullable();
            $table->boolean('pnc3_breastfeeding_counseling')->default(false);
            $table->boolean('pnc3_nutrition_counseling')->default(false);
            $table->boolean('pnc3_family_planning_counseling')->default(false);
            $table->boolean('pnc3_cord_care_counseling')->default(false);
            $table->boolean('pnc3_temperature_check')->default(false);
            $table->boolean('pnc3_blood_pressure_check')->default(false);
            $table->boolean('pnc3_pv_examination')->default(false);
            $table->boolean('pnc3_breast_examination')->default(false);
            $table->boolean('pnc3_anemia_check')->default(false);
            $table->boolean('pnc3_iron_folate_given')->default(false);
            $table->boolean('pnc3_vitamin_a_given')->default(false);
            $table->boolean('pnc3_newborn_temp_check')->default(false);
            $table->boolean('pnc3_newborn_weight_check')->default(false);
            $table->boolean('pnc3_newborn_cord_check')->default(false);
            $table->boolean('pnc3_newborn_skin_check')->default(false);
            $table->boolean('pnc3_newborn_eye_check')->default(false);
            $table->boolean('pnc3_newborn_feeding_check')->default(false);
            $table->string('pnc3_neonatal_complications')->nullable();
            $table->boolean('pnc3_kmc_initiated')->default(false);
            $table->string('pnc3_outcome')->nullable();
            $table->boolean('pnc3_referred_out')->default(false);
            $table->string('pnc3_transportation_out')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $columns = [
                'pnc1_attendance_timing', 'pnc1_associated_problems', 'pnc1_mother_visit_timing', 
                'pnc1_newborn_visit_timing', 'pnc1_newborn_sex',
                'pnc1_breastfeeding_counseling', 'pnc1_nutrition_counseling', 'pnc1_family_planning_counseling',
                'pnc1_cord_care_counseling', 'pnc1_temperature_check', 'pnc1_blood_pressure_check',
                'pnc1_pv_examination', 'pnc1_breast_examination', 'pnc1_anemia_check',
                'pnc1_iron_folate_given', 'pnc1_vitamin_a_given',
                'pnc1_newborn_temp_check', 'pnc1_newborn_weight_check', 'pnc1_newborn_cord_check',
                'pnc1_newborn_skin_check', 'pnc1_newborn_eye_check', 'pnc1_newborn_feeding_check',
                'pnc1_neonatal_complications', 'pnc1_kmc_initiated', 'pnc1_outcome',
                'pnc1_referred_out', 'pnc1_transportation_out',
                
                'pnc2_attendance_timing', 'pnc2_associated_problems', 'pnc2_mother_visit_timing', 
                'pnc2_newborn_visit_timing',
                'pnc2_breastfeeding_counseling', 'pnc2_nutrition_counseling', 'pnc2_family_planning_counseling',
                'pnc2_cord_care_counseling', 'pnc2_temperature_check', 'pnc2_blood_pressure_check',
                'pnc2_pv_examination', 'pnc2_breast_examination', 'pnc2_anemia_check',
                'pnc2_iron_folate_given', 'pnc2_vitamin_a_given',
                'pnc2_newborn_temp_check', 'pnc2_newborn_weight_check', 'pnc2_newborn_cord_check',
                'pnc2_newborn_skin_check', 'pnc2_newborn_eye_check', 'pnc2_newborn_feeding_check',
                'pnc2_neonatal_complications', 'pnc2_kmc_initiated', 'pnc2_outcome',
                'pnc2_referred_out', 'pnc2_transportation_out',
                
                'pnc3_attendance_timing', 'pnc3_associated_problems', 'pnc3_mother_visit_timing', 
                'pnc3_newborn_visit_timing',
                'pnc3_breastfeeding_counseling', 'pnc3_nutrition_counseling', 'pnc3_family_planning_counseling',
                'pnc3_cord_care_counseling', 'pnc3_temperature_check', 'pnc3_blood_pressure_check',
                'pnc3_pv_examination', 'pnc3_breast_examination', 'pnc3_anemia_check',
                'pnc3_iron_folate_given', 'pnc3_vitamin_a_given',
                'pnc3_newborn_temp_check', 'pnc3_newborn_weight_check', 'pnc3_newborn_cord_check',
                'pnc3_newborn_skin_check', 'pnc3_newborn_eye_check', 'pnc3_newborn_feeding_check',
                'pnc3_neonatal_complications', 'pnc3_kmc_initiated', 'pnc3_outcome',
                'pnc3_referred_out', 'pnc3_transportation_out',
            ];
            $table->dropColumn($columns);
        });
    }
};
