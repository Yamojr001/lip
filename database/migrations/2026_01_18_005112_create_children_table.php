<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('children', function (Blueprint $table) {
            $table->id();
            $table->string('unique_id')->unique();
            
            $table->foreignId('patient_id')->nullable()->constrained('patients')->onDelete('set null');
            $table->foreignId('phc_id')->constrained('phcs')->onDelete('cascade');
            $table->foreignId('lga_id')->nullable()->constrained('lgas')->onDelete('set null');
            $table->foreignId('ward_id')->nullable()->constrained('wards')->onDelete('set null');
            
            $table->string('child_name');
            $table->date('date_of_birth');
            $table->enum('sex', ['Male', 'Female']);
            $table->decimal('birth_weight', 5, 2)->nullable();
            $table->string('place_of_birth')->nullable();
            
            $table->string('mother_name');
            $table->string('mother_phone', 20)->nullable();
            $table->string('father_name')->nullable();
            $table->string('father_phone', 20)->nullable();
            $table->text('address');
            $table->string('community')->nullable();
            
            $table->boolean('bcg_received')->default(false);
            $table->date('bcg_date')->nullable();
            $table->boolean('hep0_received')->default(false);
            $table->date('hep0_date')->nullable();
            $table->boolean('opv0_received')->default(false);
            $table->date('opv0_date')->nullable();
            
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
            
            $table->boolean('penta2_received')->default(false);
            $table->date('penta2_date')->nullable();
            $table->boolean('pcv2_received')->default(false);
            $table->date('pcv2_date')->nullable();
            $table->boolean('rota2_received')->default(false);
            $table->date('rota2_date')->nullable();
            $table->boolean('opv2_received')->default(false);
            $table->date('opv2_date')->nullable();
            
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
            
            $table->boolean('measles1_received')->default(false);
            $table->date('measles1_date')->nullable();
            $table->boolean('yellow_fever_received')->default(false);
            $table->date('yellow_fever_date')->nullable();
            $table->boolean('vitamin_a1_received')->default(false);
            $table->date('vitamin_a1_date')->nullable();
            
            $table->boolean('measles2_received')->default(false);
            $table->date('measles2_date')->nullable();
            $table->boolean('vitamin_a2_received')->default(false);
            $table->date('vitamin_a2_date')->nullable();
            
            $table->enum('nutrition_status', ['Normal', 'MAM', 'SAM', 'Overweight'])->default('Normal');
            $table->string('alert')->nullable();
            $table->text('remarks')->nullable();
            
            $table->timestamps();
            
            $table->index(['phc_id', 'created_at']);
            $table->index(['patient_id']);
            $table->index('unique_id');
            $table->index('mother_phone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('children');
    }
};
