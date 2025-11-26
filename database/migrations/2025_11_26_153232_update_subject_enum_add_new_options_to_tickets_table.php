<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Paso 1: Agregar una nueva columna temporal como TEXT
        Schema::table('tickets', function (Blueprint $table) {
            $table->text('subject_temp')->nullable()->after('support_id');
        });
        
        // Paso 2: Copiar datos de subject a subject_temp
        DB::statement('UPDATE tickets SET subject_temp = subject');
        
        // Paso 3: Eliminar la columna subject original
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn('subject');
        });
        
        // Paso 4: Actualizar valores específicos en subject_temp
        DB::table('tickets')
            ->where('subject_temp', 'Configuración')
            ->update(['subject_temp' => 'Configuración ó Escaner']);
        
        // Paso 5: Mapear cualquier valor no reconocido a 'Otros'
        $validSubjects = [
            'Mantenimiento Preventivo',
            'Manchas',
            'Atascos',
            'Configuración ó Escaner',
            'Código de Error',
            'Remoto',
            'Servicio de Ingeniería',
            'Solicitud de Toner',
            'Otros'
        ];
        
        DB::table('tickets')
            ->whereNotIn('subject_temp', $validSubjects)
            ->update(['subject_temp' => 'Otros']);
        
        // Paso 6: Crear la nueva columna subject con el ENUM correcto
        DB::statement("ALTER TABLE tickets ADD COLUMN subject ENUM(
            'Mantenimiento Preventivo',
            'Manchas',
            'Atascos',
            'Configuración ó Escaner',
            'Código de Error',
            'Remoto',
            'Servicio de Ingeniería',
            'Solicitud de Toner',
            'Otros'
        ) NOT NULL DEFAULT 'Otros' AFTER support_id");
        
        // Paso 7: Copiar datos de subject_temp a subject
        DB::statement('UPDATE tickets SET subject = subject_temp');
        
        // Paso 8: Eliminar la columna temporal
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn('subject_temp');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Agregar columna temporal
        Schema::table('tickets', function (Blueprint $table) {
            $table->text('subject_temp')->nullable()->after('support_id');
        });
        
        // Copiar datos
        DB::statement('UPDATE tickets SET subject_temp = subject');
        
        // Eliminar columna subject
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn('subject');
        });
        
        // Revertir valores
        DB::table('tickets')
            ->where('subject_temp', 'Configuración ó Escaner')
            ->update(['subject_temp' => 'Configuración']);
        
        // Crear columna con ENUM anterior
        DB::statement("ALTER TABLE tickets ADD COLUMN subject ENUM(
            'Mantenimiento Preventivo',
            'Manchas',
            'Atascos',
            'Configuración',
            'Código de Error',
            'Remoto',
            'Servicio de Ingeniería',
            'Solicitud de Toner',
            'Otros'
        ) NOT NULL DEFAULT 'Otros' AFTER support_id");
        
        // Copiar datos de vuelta
        DB::statement('UPDATE tickets SET subject = subject_temp');
        
        // Eliminar columna temporal
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropColumn('subject_temp');
        });
    }
};
