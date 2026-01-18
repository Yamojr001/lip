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
        Schema::create('vaccine_accountability_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('phc_id')->constrained('phcs')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('month_year');
            $table->date('reporting_date');
            
            // Vaccine Utilization Summary (JSON)
            $table->json('vaccine_utilization');
            
            // Discarded Doses (JSON)
            $table->json('discarded_doses');
            
            // Devices Utilization (JSON)
            $table->json('devices_utilization');
            
            // Device Status (JSON)
            $table->json('device_status');
            
            // Signatures
            $table->string('health_officer_name');
            $table->string('health_officer_signature');
            $table->string('head_of_unit_name');
            $table->string('head_of_unit_signature');
            $table->string('phone_number');
            $table->date('submission_date');
            
            // Status
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft');
            
            // Auto-calculated fields
            $table->integer('total_doses_used')->default(0);
            $table->integer('total_doses_discarded')->default(0);
            $table->decimal('vaccine_wastage_rate', 5, 2)->default(0);
            $table->integer('stock_out_count')->default(0);
            
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index(['phc_id', 'month_year']);
            $table->index('status');
            $table->index('reporting_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vaccine_accountability_reports');
    }
};