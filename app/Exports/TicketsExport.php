<?php

namespace App\Exports;

use App\Models\Ticket;
use Illuminate\Support\Collection;

class TicketsExport
{
    protected $ticketIds;

    public function __construct(array $ticketIds = [])
    {
        $this->ticketIds = $ticketIds;
    }

    /**
     * Generar CSV simple para exportación
     */
    public function toCsv()
    {
        $query = Ticket::with(['customer', 'support']);
        
        if (!empty($this->ticketIds)) {
            $query->whereIn('id', $this->ticketIds);
        }
        
        $tickets = $query->get();
        
        // Usar output buffering para capturar el CSV
        ob_start();
        $output = fopen('php://output', 'w');
        
        // Agregar BOM para UTF-8
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));
        
        // Encabezados
        fputcsv($output, [
            'ID',
            'Número de Ticket',
            'Asunto',
            'Cliente',
            'Técnico Asignado',
            'Estado',
            'Fecha de Creación',
            'Marca',
            'Modelo',
            'Número de Serie',
            'Fecha de Cierre'
        ]);
        
        // Datos
        foreach ($tickets as $ticket) {
            fputcsv($output, [
                $ticket->id,
                '#' . str_pad($ticket->id, 4, '0', STR_PAD_LEFT),
                $ticket->subject ?? 'Sin asunto',
                $ticket->customer ? $ticket->customer->name : 'Sin asignar',
                $ticket->support ? $ticket->support->name : 'Sin asignar',
                match($ticket->status) {
                    'Open' => 'Abierto',
                    'In Progress' => 'En Progreso',
                    'Closed' => 'Cerrado',
                    default => $ticket->status
                },
                $ticket->created_at ? $ticket->created_at->setTimezone(config('app.timezone'))->format('d/m/Y H:i') : '',
                $ticket->brand ?? 'N/A',
                $ticket->model ?? 'N/A',
                $ticket->serial ?? 'N/A',
                $ticket->closed_at ? $ticket->closed_at->setTimezone(config('app.timezone'))->format('d/m/Y H:i') : 'No cerrado'
            ]);
        }
        
        fclose($output);
        $csvContent = ob_get_clean();
        
        return $csvContent;
    }
}