<?php
// File: database/migrations/2025_11_01_999999_create_final_patients_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            
            // --- Core Patient Info and Foreign Keys (Normalized) ---
            $table->string('unique_id')->unique(); // e.g., KMC/DGN/001
            
            // Foreign Keys
            $table->foreignId('phc_id')->constrained('phcs')->onDelete('cascade'); // PHC of the staff recording
            $table->foreignId('lga_id')->nullable()->constrained('lgas')->onDelete('set null');
            $table->foreignId('ward_id')->nullable()->constrained('wards')->onDelete('set null');
            $table->foreignId('health_facility_id')->nullable()->constrained('phcs')->onDelete('set null'); // Facility where she registers

            // Personal & Contact Info
            $table->string('woman_name');
            $table->unsignedTinyInteger('age');
            $table->enum('literacy_status', ['Literate', 'Not literate'])->default('Literate');
            $table->string('phone_number', 20)->nullable();
            $table->string('husband_name')->nullable();
            $table->string('husband_phone', 20)->nullable();
            $table->string('community');
            $table->text('address'); 
            
            // Pregnancy Info
            $table->unsignedTinyInteger('gravida')->nullable();
            $table->unsignedTinyInteger('age_of_pregnancy_weeks')->nullable();
            $table->unsignedTinyInteger('parity')->nullable();
            $table->date('date_of_registration');
            $table->date('edd'); // Expected Date of Delivery
            
            // Family Planning Interest (Single field)
            $table->enum('fp_interest', ['Yes', 'No'])->nullable();
            
            // ANC Visits 1-8 with comprehensive tracking
            for ($i = 1; $i <= 8; $i++) {
                $table->date("anc_visit_{$i}_date")->nullable();
                $table->boolean("tracked_before_anc{$i}")->default(false);
                $table->boolean("anc{$i}_paid")->default(false);
                $table->decimal("anc{$i}_payment_amount", 10, 2)->nullable();
                
                // Services received during ANC visit
                $table->boolean("anc{$i}_urinalysis")->default(false);
                $table->boolean("anc{$i}_iron_folate")->default(false);
                $table->boolean("anc{$i}_mms")->default(false);
                $table->boolean("anc{$i}_sp")->default(false);
                $table->boolean("anc{$i}_sba")->default(false);
                
                // HIV Testing
                $table->enum("anc{$i}_hiv_test", ['Yes', 'No'])->nullable();
                $table->boolean("anc{$i}_hiv_result_received")->default(false);
                $table->enum("anc{$i}_hiv_result", ['Positive', 'Negative'])->nullable();
            }
            
            $table->unsignedTinyInteger('additional_anc_count')->nullable();
            
            // Delivery Details
            $table->enum('place_of_delivery', ['Home', 'Health Facility', 'Traditional Attendant'])->nullable();
            $table->boolean('delivery_kits_received')->default(false);
            $table->enum('type_of_delivery', ['Normal (Vaginal)', 'Cesarean Section', 'Assisted', 'Breech'])->nullable();
            $table->enum('complication_if_any', ['No complication', 'Hemorrhage', 'Eclampsia', 'Sepsis', 'Other'])->nullable();
            $table->enum('delivery_outcome', ['Live birth', 'Stillbirth', 'Miscarriage'])->nullable();
            $table->enum('mother_alive', ['Yes', 'No'])->nullable();
            $table->enum('mother_status', ['Admitted', 'Referred to other facility', 'Discharged home'])->nullable();
            $table->date('date_of_delivery')->nullable();
            
            // Postnatal Checkup (PNC) - Updated to 3 visits
            $table->date('pnc_visit_1')->nullable();
            $table->date('pnc_visit_2')->nullable();
            $table->date('pnc_visit_3')->nullable();
            
            // Insurance & Payments - Enhanced
            $table->enum('health_insurance_status', ['Yes', 'No', 'Not Enrolled'])->default('Not Enrolled');
            $table->enum('insurance_type', ['Kachima', 'NHIS', 'Others'])->nullable();
            $table->string('insurance_other_specify')->nullable();
            $table->boolean('insurance_satisfaction')->default(false);
            
            // Family Planning - Updated structure
            $table->boolean('fp_using')->default(false);
            $table->boolean('fp_male_condom')->default(false);
            $table->boolean('fp_female_condom')->default(false);
            $table->boolean('fp_pill')->default(false);
            $table->boolean('fp_injectable')->default(false);
            $table->boolean('fp_implant')->default(false);
            $table->boolean('fp_iud')->default(false);
            $table->boolean('fp_other')->default(false);
            $table->string('fp_other_specify')->nullable();
            
            // Child Immunization - New comprehensive structure
            $table->string('child_name')->nullable();
            $table->date('child_dob')->nullable();
            $table->enum('child_sex', ['Male', 'Female'])->nullable();
            
            // Vaccines - At Birth
            $table->boolean('bcg_received')->default(false);
            $table->date('bcg_date')->nullable();
            $table->boolean('hep0_received')->default(false);
            $table->date('hep0_date')->nullable();
            $table->boolean('opv0_received')->default(false);
            $table->date('opv0_date')->nullable();
            
            // 6 Weeks
            $table->boolean('penta1_received')->default(false);
            $table->date('penta1_date')->nullable();
            $table->boolean('pcv1_received')->default(false);
            $table->date('pcv1_date')->nullable();
            $table->boolean('opv1_received')->default(false);
            $table->date('opv1_date')->nullable();
            $table->boolean('rota1_received')->default(false);
            $table->date('rota1_date')->nullable();
            $table->boolean('ipv1_received')->default(false);
            $table->date('ipv1_date')->nullable();
            
            // 10 Weeks
            $table->boolean('penta2_received')->default(false);
            $table->date('penta2_date')->nullable();
            $table->boolean('pcv2_received')->default(false);
            $table->date('pcv2_date')->nullable();
            $table->boolean('rota2_received')->default(false);
            $table->date('rota2_date')->nullable();
            $table->boolean('opv2_received')->default(false);
            $table->date('opv2_date')->nullable();
            
            // 14 Weeks
            $table->boolean('penta3_received')->default(false);
            $table->date('penta3_date')->nullable();
            $table->boolean('pcv3_received')->default(false);
            $table->date('pcv3_date')->nullable();
            $table->boolean('opv3_received')->default(false);
            $table->date('opv3_date')->nullable();
            $table->boolean('rota3_received')->default(false);
            $table->date('rota3_date')->nullable();
            $table->boolean('ipv2_received')->default(false);
            $table->date('ipv2_date')->nullable();
            
            // 9 Months
            $table->boolean('measles_received')->default(false);
            $table->date('measles_date')->nullable();
            $table->boolean('yellow_fever_received')->default(false);
            $table->date('yellow_fever_date')->nullable();
            $table->boolean('vitamin_a_received')->default(false);
            $table->date('vitamin_a_date')->nullable();
            
            // 15 Months
            $table->boolean('mcv2_received')->default(false);
            $table->date('mcv2_date')->nullable();
            
            // Auto-Calculated/System Fields
            $table->unsignedTinyInteger('anc_visits_count')->default(0);
            $table->boolean('anc4_completed')->default(false);
            $table->boolean('pnc_completed')->default(false);
            $table->string('post_edd_followup_status')->nullable();
            $table->string('alert')->nullable();
            
            // Notes
            $table->text('remark')->nullable();
            $table->text('comments')->nullable();
            
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['phc_id', 'created_at']);
            $table->index(['lga_id', 'ward_id']);
            $table->index('unique_id');
            $table->index('date_of_registration');
        });
    }

    public function down(): void {
        Schema::dropIfExists('patients');
    }
};