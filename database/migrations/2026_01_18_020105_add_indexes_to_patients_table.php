<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->index('lga_id', 'patients_lga_id_index');
            $table->index('ward_id', 'patients_ward_id_index');
            $table->index('health_facility_id', 'patients_health_facility_id_index');
            $table->index('edd', 'patients_edd_index');
            $table->index('place_of_delivery', 'patients_place_of_delivery_index');
            $table->index('delivery_outcome', 'patients_delivery_outcome_index');
            $table->index('phone_number', 'patients_phone_number_index');
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $table->dropIndex('patients_lga_id_index');
            $table->dropIndex('patients_ward_id_index');
            $table->dropIndex('patients_health_facility_id_index');
            $table->dropIndex('patients_edd_index');
            $table->dropIndex('patients_place_of_delivery_index');
            $table->dropIndex('patients_delivery_outcome_index');
            $table->dropIndex('patients_phone_number_index');
        });
    }
};
