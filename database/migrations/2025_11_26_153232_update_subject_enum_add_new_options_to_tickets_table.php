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
        // Primero obtener todos los valores distintos actuales
        $subjects = DB::table('tickets')->select('subject')->distinct()->pluck('subject');
        
        // Crear un mapeo de valores antiguos a nuevos
        $mapping = [
            'Configuración' => 'Configuración ó Escaner',
        ];
        
        // Actualizar registros usando el mapeo
        foreach ($mapping as $old => $new) {
            DB::table('tickets')
                ->where('subject', $old)
                ->update(['subject' => $new]);
        }
        
        // Modificar la columna con el nuevo ENUM incluyendo tanto valores antiguos como nuevos
        DB::statement("ALTER TABLE tickets MODIFY COLUMN subject ENUM(
            'Mantenimiento Preventivo',
            'Manchas',
            'Atascos',
            'Configuración',
            'Configuración ó Escaner',
            'Código de Error',
            'Remoto',
            'Servicio de Ingeniería',
            'Solicitud de Toner',
            'Otros'
        ) NOT NULL");
        
        // Actualizar todos los tickets con 'Configuración' a 'Configuración ó Escaner'
        DB::table('tickets')
            ->where('subject', 'Configuración')
            ->update(['subject' => 'Configuración ó Escaner']);
            
        // Finalmente, modificar la columna al ENUM final sin el valor antiguo
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
        // Revertir los valores al formato anterior
        DB::table('tickets')
            ->where('subject', 'Configuración ó Escaner')
            ->update(['subject' => 'Configuración']);

        // Volver al enum anterior
        DB::statement("ALTER TABLE tickets MODIFY COLUMN subject ENUM(
            'Atascos',
            'Manchas',
            'Configuración',
            'Código de Error',
            'Solicitud de Toner',
            'Servicio de Ingeniería',
            'Otros'
        ) NOT NULL");
    }
};
