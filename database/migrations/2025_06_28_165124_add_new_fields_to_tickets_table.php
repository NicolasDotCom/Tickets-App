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
        Schema::table('tickets', function (Blueprint $table) {
            $table->string('attachment')->nullable()->after('support_id');
            $table->string('equipment_category')->nullable()->after('attachment');
            $table->string('equipment_name')->nullable()->after('equipment_category');
            $table->string('equipment_serial')->nullable()->after('equipment_name');
            $table->string('equipment_area')->nullable()->after('equipment_serial');
            $table->text('description')->change(); // Cambiar a TEXT para más espacio
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn([
                'attachment',
                'equipment_category',
                'equipment_name',
                'equipment_serial',
                'equipment_area'
            ]);
            $table->string('description')->change(); // Volver a STRING
        });
    }
};
