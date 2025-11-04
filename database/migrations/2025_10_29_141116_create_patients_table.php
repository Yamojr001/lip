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
            $table->string('woman_name'); // FIX: This column must exist for the insert to work
            $table->unsignedTinyInteger('age');
            $table->enum('literacy_status', ['Literate', 'Illiterate', 'Not sure'])->default('Not sure');
            $table->string('phone_number', 20)->nullable();
            $table->string('husband_name')->nullable();
            $table->string('husband_phone', 20)->nullable();
            $table->string('community');
            $table->string('address'); 
            
            // Pregnancy Info
            $table->unsignedTinyInteger('gravida')->nullable();
            $table->unsignedTinyInteger('parity')->nullable();
            $table->date('date_of_registration');
            $table->date('edd'); // Expected Date of Delivery
            
            // ANC Visits and Tracking
            $table->date('anc_visit_1')->nullable();
            $table->boolean('tracked_before_anc1')->default(false);
            $table->date('anc_visit_2')->nullable();
            $table->boolean('tracked_before_anc2')->default(false);
            $table->date('anc_visit_3')->nullable();
            $table->boolean('tracked_before_anc3')->default(false);
            $table->date('anc_visit_4')->nullable();
            $table->boolean('tracked_before_anc4')->default(false);
            $table->unsignedTinyInteger('additional_anc_count')->nullable(); // Count
            
            // Delivery Details
            $table->string('place_of_delivery')->nullable();
            $table->boolean('delivery_kits_received')->default(false);
            $table->string('type_of_delivery')->nullable(); 
            $table->string('delivery_outcome')->nullable(); 
            $table->date('date_of_delivery')->nullable();
            
            // Postpartum & PNC
            $table->string('child_immunization_status')->nullable(); 
            $table->boolean('fp_interest_postpartum')->default(false);
            $table->boolean('fp_given')->default(false);
            $table->boolean('fp_paid')->default(false);
            $table->decimal('fp_payment_amount', 10, 2)->nullable();
            $table->text('fp_reason_not_given')->nullable();
            $table->date('pnc_visit_1')->nullable();
            $table->date('pnc_visit_2')->nullable();

            // Insurance & Payments
            $table->string('health_insurance_status')->nullable();
            $table->boolean('insurance_satisfaction')->nullable();
            $table->boolean('anc_paid')->default(false);
            $table->decimal('anc_payment_amount', 10, 2)->nullable();
            
            // Auto-Calculated/System Fields (Used in the Model's boot() method)
            $table->unsignedTinyInteger('anc_visits_count')->default(0);
            $table->boolean('anc4_completed')->default(false);
            $table->boolean('pnc_completed')->default(false);
            $table->string('post_edd_followup_status')->nullable();
            $table->string('alert')->nullable();
            
            // Notes
            $table->text('remark')->nullable();
            $table->text('comments')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('patients');
    }
};