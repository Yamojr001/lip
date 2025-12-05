<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('nutrition_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('phc_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->year('year');
            $table->string('month'); // January, February, etc.
            
            // Total children screened
            $table->integer('total_children_screened')->default(0);
            
            // Age 6-23 months (by gender)
            $table->integer('age_6_23_male_screened')->default(0);
            $table->integer('age_6_23_female_screened')->default(0);
            
            // Age 24-59 months (by gender)
            $table->integer('age_24_59_male_screened')->default(0);
            $table->integer('age_24_59_female_screened')->default(0);
            
            // Normal children identified
            $table->integer('age_6_23_male_normal')->default(0);
            $table->integer('age_6_23_female_normal')->default(0);
            $table->integer('age_24_59_male_normal')->default(0);
            $table->integer('age_24_59_female_normal')->default(0);
            
            // MAM children identified
            $table->integer('age_6_23_male_mam')->default(0);
            $table->integer('age_6_23_female_mam')->default(0);
            $table->integer('age_24_59_male_mam')->default(0);
            $table->integer('age_24_59_female_mam')->default(0);
            
            // SAM children identified
            $table->integer('age_6_23_male_sam')->default(0);
            $table->integer('age_6_23_female_sam')->default(0);
            $table->integer('age_24_59_male_sam')->default(0);
            $table->integer('age_24_59_female_sam')->default(0);
            
            // New SAM in this outreach
            $table->integer('new_sam_this_outreach')->default(0);
            
            // SAM referred to OTP
            $table->integer('sam_referred_otp')->default(0);
            
            // Oedema/SAM with complications referred to SC
            $table->integer('oedema_sam_complications_male')->default(0);
            $table->integer('oedema_sam_complications_female')->default(0);
            
            // Oedema total by gender
            $table->integer('oedema_total_male')->default(0);
            $table->integer('oedema_total_female')->default(0);
            
            // SAM with complications referred to SC by gender
            $table->integer('sam_complications_male_sc')->default(0);
            $table->integer('sam_complications_female_sc')->default(0);
            
            // Albendazole
            $table->integer('albendazole_12_23_male')->default(0);
            $table->integer('albendazole_12_23_female')->default(0);
            $table->integer('albendazole_24_59_male')->default(0);
            $table->integer('albendazole_24_59_female')->default(0);
            
            // Vitamin A Supplementation (VAS)
            $table->integer('vas_6_11_first_dose_male')->default(0);
            $table->integer('vas_6_11_first_dose_female')->default(0);
            $table->integer('vas_12_59_second_dose_male')->default(0);
            $table->integer('vas_12_59_second_dose_female')->default(0);
            
            // RUTF given
            $table->integer('rutf_given')->default(0);
            
            // MNP given
            $table->integer('mnp_given')->default(0);
            
            // Exclusive breastfeeding (0-6 months)
            $table->integer('exclusive_breastfeeding_0_6')->default(0);
            
            // Pregnant women and caregivers counselled
            $table->integer('miycf_counselled_pregnant_women')->default(0);
            $table->integer('miycf_counselled_caregivers')->default(0);
            
            // Additional fields
            $table->text('comments')->nullable();
            $table->boolean('submitted')->default(false);
            $table->timestamp('submitted_at')->nullable();
            
            // Unique constraint to prevent duplicate monthly reports
            $table->unique(['phc_id', 'year', 'month']);
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nutrition_reports');
    }
};