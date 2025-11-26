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
        // Paso 1: Convertir la columna ENUM a VARCHAR temporalmente
        DB::statement("ALTER TABLE tickets MODIFY COLUMN subject VARCHAR(255) NOT NULL");
        
        // Paso 2: Actualizar valores específicos que necesiten ser cambiados
        DB::table('tickets')
            ->where('subject', 'Configuración')
            ->update(['subject' => 'Configuración ó Escaner']);
        
        // Paso 3: Mapear cualquier valor no reconocido a 'Otros'
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
            ->whereNotIn('subject', $validSubjects)
            ->update(['subject' => 'Otros']);
        
        // Paso 4: Convertir la columna de vuelta a ENUM con los nuevos valores
        DB::statement("ALTER TABLE tickets MODIFY COLUMN subject ENUM(
            'Mantenimiento Preventivo',
            'Manchas',
            'Atascos',
            'Configuración ó Escaner',
            'Código de Error',
            'Remoto',
            'Servicio de Ingeniería',
            'Solicitud de Toner',
            'Otros'
        ) NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Convertir a VARCHAR temporalmente
        DB::statement("ALTER TABLE tickets MODIFY COLUMN subject VARCHAR(255) NOT NULL");
        
        // Revertir los valores al formato anterior
        DB::table('tickets')
            ->where('subject', 'Configuración ó Escaner')
            ->update(['subject' => 'Configuración']);

        // Volver al enum anterior
        DB::statement("ALTER TABLE tickets MODIFY COLUMN subject ENUM(
            'Mantenimiento Preventivo',
            'Manchas',
            'Atascos',
            'Configuración',
            'Código de Error',
            'Remoto',
            'Servicio de Ingeniería',
            'Solicitud de Toner',
            'Otros'
        ) NOT NULL");
    }
};
