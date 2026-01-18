<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->string('decision_seeking_care')->nullable();
            $table->string('mode_of_booking')->nullable();
            $table->string('location_type')->nullable();
            $table->string('disability_if_any')->nullable();
            
            $table->boolean('active_mgmt_labour')->default(false);
            
            $table->string('mother_delivery_location')->nullable();
            
            $table->string('baby_outcome')->nullable();
            $table->string('baby_delivery_location')->nullable();
            $table->decimal('baby_weight_kg', 4, 2)->nullable();
            $table->string('baby_sex')->nullable();
            
            $table->string('delivery_attendant')->nullable();
            $table->string('attendant_name')->nullable();
            
            $table->boolean('newborn_dried')->default(false);
            $table->boolean('newborn_cord_clamped')->default(false);
            $table->boolean('newborn_skin_to_skin')->default(false);
            $table->boolean('newborn_breastfed_1hr')->default(false);
            $table->boolean('newborn_eye_care')->default(false);
            $table->boolean('newborn_vitamin_k')->default(false);
            $table->boolean('newborn_bcg')->default(false);
            $table->boolean('newborn_opv0')->default(false);
            $table->boolean('newborn_hep_b0')->default(false);
            
            $table->boolean('referred_from_other_facility')->default(false);
            $table->string('referring_facility_name')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn([
                'decision_seeking_care',
                'mode_of_booking',
                'location_type',
                'disability_if_any',
                'active_mgmt_labour',
                'mother_delivery_location',
                'baby_outcome',
                'baby_delivery_location',
                'baby_weight_kg',
                'baby_sex',
                'delivery_attendant',
                'attendant_name',
                'newborn_dried',
                'newborn_cord_clamped',
                'newborn_skin_to_skin',
                'newborn_breastfed_1hr',
                'newborn_eye_care',
                'newborn_vitamin_k',
                'newborn_bcg',
                'newborn_opv0',
                'newborn_hep_b0',
                'referred_from_other_facility',
                'referring_facility_name',
            ]);
        });
    }
};
