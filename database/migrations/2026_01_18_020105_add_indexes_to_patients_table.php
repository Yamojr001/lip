<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $indexes = DB::select("SELECT indexname FROM pg_indexes WHERE tablename = 'patients'");
            $existingIndexes = array_map(fn($idx) => $idx->indexname, $indexes);
            
            $newIndexes = [
                'patients_lga_id_index' => 'lga_id',
                'patients_ward_id_index' => 'ward_id',
                'patients_phc_id_index' => 'phc_id',
                'patients_edd_index' => 'edd',
                'patients_place_of_delivery_index' => 'place_of_delivery',
                'patients_delivery_outcome_index' => 'delivery_outcome',
                'patients_phone_number_index' => 'phone_number',
            ];
            
            foreach ($newIndexes as $indexName => $column) {
                if (!in_array($indexName, $existingIndexes)) {
                    $table->index($column);
                }
            }
        });
    }

    public function down(): void
    {
        // No action needed - indexes will remain
    }
};
