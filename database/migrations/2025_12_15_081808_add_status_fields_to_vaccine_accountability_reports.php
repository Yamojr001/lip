<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vaccine_accountability_reports', function (Blueprint $table) {
            $table->timestamp('approved_at')->nullable()->after('status');
            $table->timestamp('rejected_at')->nullable()->after('approved_at');
            $table->text('rejected_reason')->nullable()->after('rejected_at');
            $table->text('revision_notes')->nullable()->after('rejected_reason');
            // Update the enum status to include pending_revision
            DB::statement("ALTER TABLE vaccine_accountability_reports MODIFY status ENUM('draft', 'submitted', 'approved', 'rejected', 'pending_revision') DEFAULT 'draft'");
        });
    }

    public function down(): void
    {
        Schema::table('vaccine_accountability_reports', function (Blueprint $table) {
            $table->dropColumn(['approved_at', 'rejected_at', 'rejected_reason', 'revision_notes']);
            DB::statement("ALTER TABLE vaccine_accountability_reports MODIFY status ENUM('draft', 'submitted', 'approved', 'rejected') DEFAULT 'draft'");
        });
    }
};