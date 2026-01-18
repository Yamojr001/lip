<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('child_nutrition_logs', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
            $table->foreignId('phc_id')->constrained('phcs')->onDelete('cascade');
            $table->foreignId('recorded_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->date('visit_date');
            $table->unsignedTinyInteger('age_in_months');
            
            $table->decimal('weight', 5, 2);
            $table->decimal('height', 5, 2)->nullable();
            $table->decimal('muac', 4, 1)->nullable();
            
            $table->enum('weight_for_age', ['Normal', 'Underweight', 'Severely Underweight', 'Overweight'])->nullable();
            $table->enum('height_for_age', ['Normal', 'Stunted', 'Severely Stunted', 'Tall'])->nullable();
            $table->enum('weight_for_height', ['Normal', 'Wasted', 'Severely Wasted', 'Overweight', 'Obese'])->nullable();
            $table->enum('muac_status', ['Normal', 'MAM', 'SAM'])->nullable();
            
            $table->boolean('vitamin_a_given')->default(false);
            $table->boolean('deworming_given')->default(false);
            $table->boolean('iron_supplement_given')->default(false);
            
            $table->enum('feeding_practice', ['Exclusive Breastfeeding', 'Mixed Feeding', 'Formula Only', 'Complementary Feeding'])->nullable();
            $table->boolean('referred_for_treatment')->default(false);
            $table->string('referral_reason')->nullable();
            
            $table->text('counseling_given')->nullable();
            $table->text('remarks')->nullable();
            
            $table->date('next_visit_date')->nullable();
            
            $table->timestamps();
            
            $table->index(['child_id', 'visit_date']);
            $table->index(['phc_id', 'visit_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('child_nutrition_logs');
    }
};
