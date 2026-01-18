<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('child_nutrition_logs', function (Blueprint $table) {
            $table->string('client_number')->nullable();
            $table->string('visit_type')->nullable(); // N (New) or R (Revisit)
            
            // Breastfeeding status
            $table->string('breastfeeding_status')->nullable(); // exclusive_bf, bf_with_water, partial_bf, stopped_bf
            $table->boolean('exclusive_bf')->default(false);
            $table->boolean('bf_with_water')->default(false);
            $table->boolean('partial_bf')->default(false);
            $table->boolean('stopped_bf')->default(false);
            
            // MUAC indicator for children >6 months
            $table->boolean('muac_indicator_used')->default(false);
            
            // Nutritional Status
            $table->string('nutritional_status_line')->nullable(); // above_the_line, below_the_line
            
            // Age categories for supplements
            $table->boolean('age_0_5_months')->default(false);
            $table->boolean('age_6_11_months')->default(false);
            $table->boolean('age_12_59_months')->default(false);
            
            // Vitamin A supplement details
            $table->string('vitamin_a_dose')->nullable(); // dose amount given
            
            // Deworming tablet details (for children 12-59 months)
            $table->boolean('deworming_eligible')->default(false);
            
            // CMAM (Community-based Management of Acute Malnutrition)
            $table->boolean('cmam_referred')->default(false);
            $table->boolean('cmam_admitted')->default(false);
            $table->string('cmam_admission_type')->nullable(); // OTP, SC
            
            // Severe Acute Malnutrition (SAM)
            $table->boolean('sam_eligible')->default(false);
            $table->boolean('sam_referred_to_otp')->default(false);
            $table->string('sam_outcome')->nullable(); // Recovered (Re), Defaulted (Df), Died (Dth), Non-Recovered (Nr)
        });
    }

    public function down(): void
    {
        Schema::table('child_nutrition_logs', function (Blueprint $table) {
            $table->dropColumn([
                'client_number', 'visit_type',
                'breastfeeding_status', 'exclusive_bf', 'bf_with_water', 'partial_bf', 'stopped_bf',
                'muac_indicator_used', 'nutritional_status_line',
                'age_0_5_months', 'age_6_11_months', 'age_12_59_months',
                'vitamin_a_dose', 'deworming_eligible',
                'cmam_referred', 'cmam_admitted', 'cmam_admission_type',
                'sam_eligible', 'sam_referred_to_otp', 'sam_outcome'
            ]);
        });
    }
};
