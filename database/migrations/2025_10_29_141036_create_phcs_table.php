<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('phcs', function (Blueprint $table) {
            $table->id();
            
            // Core Facility Info
            $table->string('clinic_name')->unique();
            
            // Location Foreign Keys
            $table->foreignId('lga_id')->constrained('lgas')->onDelete('cascade');
            $table->foreignId('ward_id')->constrained('wards')->onDelete('cascade');
            
            // New Required Fields (from form/controller)
            $table->string('address'); // NOT NULL by default
            $table->string('email')->nullable(); 
            $table->string('contact_phone', 15); // NOT NULL by default
            $table->string('incharge_name'); // NOT NULL by default

            // JSON Fields (Require Eloquent Casting in the Model)
            $table->json('anc_schedule')->nullable(); 
            $table->json('images')->nullable(); 

            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('phcs');
    }
};