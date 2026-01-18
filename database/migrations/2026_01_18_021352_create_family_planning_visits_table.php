<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('family_planning_visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained()->onDelete('cascade');
            $table->foreignId('phc_id')->nullable()->constrained('phcs')->onDelete('set null');
            
            $table->date('visit_date');
            $table->string('client_card_number', 50)->nullable();
            $table->enum('sex', ['Male', 'Female'])->default('Female');
            $table->enum('age_range', ['10-14', '15-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49'])->nullable();
            $table->enum('marital_status', ['Single', 'Married', 'Divorced', 'Widowed'])->nullable();
            $table->enum('acceptor_type', ['New', 'Revisit'])->default('New');
            $table->string('blood_pressure', 20)->nullable();
            
            $table->boolean('oral_pills')->default(false);
            $table->string('oral_pills_type', 50)->nullable();
            $table->enum('oral_pills_status', ['New', 'RV'])->nullable();
            $table->integer('oral_pills_cycles')->nullable();
            
            $table->boolean('injectable')->default(false);
            $table->string('injectable_type', 50)->nullable();
            $table->enum('injectable_status', ['New', 'RV'])->nullable();
            $table->integer('injectable_doses')->nullable();
            
            $table->boolean('iud')->default(false);
            $table->enum('iud_status', ['New', 'RV'])->nullable();
            $table->enum('iud_action', ['Insertion', 'Removal'])->nullable();
            
            $table->boolean('condoms')->default(false);
            $table->enum('condoms_type', ['Male', 'Female', 'Both'])->nullable();
            $table->enum('condoms_direction', ['IN', 'OUT'])->nullable();
            $table->integer('condoms_quantity')->nullable();
            
            $table->boolean('implants')->default(false);
            $table->string('implants_type', 50)->nullable();
            $table->enum('implants_direction', ['IN', 'OUT'])->nullable();
            
            $table->boolean('voluntary_sterilization')->default(false);
            $table->enum('sterilization_type', ['Male', 'Female'])->nullable();
            
            $table->boolean('natural_methods')->default(false);
            $table->boolean('cycle_beads')->default(false);
            $table->string('natural_method_other', 100)->nullable();
            
            $table->boolean('referred')->default(false);
            $table->string('referred_to', 200)->nullable();
            
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->index(['patient_id', 'visit_date']);
            $table->index('phc_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('family_planning_visits');
    }
};
