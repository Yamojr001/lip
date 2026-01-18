<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            for ($i = 1; $i <= 8; $i++) {
                $table->boolean("anc{$i}_pcv")->default(false)->after("anc{$i}_sp");
                $table->boolean("anc{$i}_td")->default(false)->after("anc{$i}_pcv");
            }
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            $columns = [];
            for ($i = 1; $i <= 8; $i++) {
                $columns[] = "anc{$i}_pcv";
                $columns[] = "anc{$i}_td";
            }
            $table->dropColumn($columns);
        });
    }
};
