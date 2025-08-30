<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Support;
use App\Models\Ticket;
use App\Models\User;
use App\Exports\TicketsExport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    public function index()
    {
        $userId = Auth::id();
        $user = User::find($userId);

        // Inicializar consulta base
        $query = Ticket::with(['customer', 'support']);

        // Aplicar filtros según el rol del usuario
        if ($user && $user->hasRole('support')) {
            // Técnico de soporte: solo tickets asignados a él
            $support = Support::where('email', $user->email)->first();
            if ($support) {
                $query->where('support_id', $support->id);
            } else {
                $query->whereRaw('1 = 0'); // No mostrar tickets si no tiene registro de support
            }
        } elseif ($user && $user->hasRole('customer')) {
            // Cliente: solo sus propios tickets
            $customer = Customer::where('email', $user->email)->first();
            if ($customer) {
                $query->where('customer_id', $customer->id);
            } else {
                $query->whereRaw('1 = 0'); // No mostrar tickets si no tiene registro de customer
            }
        }
        // Para admin: ver todos los tickets (sin filtro adicional)

        // Obtener métricas de tickets
        $ticketsAbiertos = (clone $query)->where('status', 'Open')->count();
        $ticketsEnProgreso = (clone $query)->where('status', 'In Progress')->count();
        $ticketsCerrados = (clone $query)->where('status', 'Closed')->count();
        $totalTickets = $ticketsAbiertos + $ticketsEnProgreso + $ticketsCerrados;

        // Obtener últimos 5 tickets creados
        $ultimosTickets = (clone $query)
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($ticket) {
                // Traducir estado a español para consistencia en frontend
                $estadoTraducido = match($ticket->status) {
                    'Open' => 'Abierto',
                    'In Progress' => 'En Progreso', 
                    'Closed' => 'Cerrado',
                    default => $ticket->status
                };

                return [
                    'id' => $ticket->id,
                    'numero_ticket' => '#' . str_pad($ticket->id, 4, '0', STR_PAD_LEFT),
                    'tecnico_asignado' => $ticket->support ? $ticket->support->name : 'Sin asignar',
                    'estado' => $estadoTraducido,
                    'created_at' => $ticket->created_at->setTimezone(config('app.timezone'))->format('d/m/Y')
                ];
            });

        // Datos para la gráfica de barras
        $graficaData = [
            ['status' => 'Abiertos', 'cantidad' => $ticketsAbiertos, 'fill' => '#ef4444'],
            ['status' => 'En Progreso', 'cantidad' => $ticketsEnProgreso, 'fill' => '#f97316'],
            ['status' => 'Cerrados', 'cantidad' => $ticketsCerrados, 'fill' => '#22c55e']
        ];

        // Debug temporal
        $isAdmin = $user && $user->hasRole('admin');
        $allTicketsData = $isAdmin ? $this->getAllTicketsForExport() : [];
        
        return Inertia::render('Dashboard', [
            'metricas' => [
                'tickets_abiertos' => $ticketsAbiertos,
                'tickets_en_progreso' => $ticketsEnProgreso,
                'tickets_cerrados' => $ticketsCerrados,
                'total_tickets' => $totalTickets
            ],
            'graficaData' => $graficaData,
            'ultimosTickets' => $ultimosTickets,
            'userRole' => $user ? $user->roles->first()?->name : null,
            'allTickets' => $allTicketsData
        ]);
    }

    /**
     * Obtener todos los tickets disponibles para exportación (solo para admin)
     */
    private function getAllTicketsForExport()
    {
        return Ticket::with(['customer', 'support'])
            ->get()
            ->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'description' => $ticket->description,
                    'status' => $ticket->status, // Mantener estado original para filtros
                    'customer' => $ticket->customer ? [
                        'name' => $ticket->customer->name
                    ] : null,
                    'support' => $ticket->support ? [
                        'name' => $ticket->support->name
                    ] : null,
                    'created_at' => $ticket->created_at ? $ticket->created_at->setTimezone(config('app.timezone'))->format('d/m/Y H:i') : '',
                    'brand' => $ticket->brand,
                    'model' => $ticket->model,
                    'serial' => $ticket->serial,
                ];
            });
    }

    /**
     * Exportar tickets seleccionados a Excel
     */
    public function exportTickets(Request $request)
    {
        // Verificar que el usuario sea admin
        $user = User::find(Auth::id());
        if (!$user || !$user->hasRole('admin')) {
            abort(403, 'No tienes permisos para exportar tickets.');
        }

        $ticketIds = $request->input('ticket_ids', []);
        
        // Si se envía "all", exportar todos los tickets
        if ($ticketIds === 'all') {
            $ticketIds = Ticket::pluck('id')->toArray();
        } elseif (is_string($ticketIds)) {
            // Si viene como string separado por comas, convertir a array
            $ticketIds = explode(',', $ticketIds);
            $ticketIds = array_map('intval', array_filter($ticketIds));
        }
        
        $export = new TicketsExport($ticketIds);
        $csvContent = $export->toCsv();
        
        $fileName = 'tickets_export_' . now()->format('Y-m-d_H-i-s') . '.csv';
        
        return response($csvContent)
            ->header('Content-Type', 'text/csv; charset=utf-8')
            ->header('Content-Disposition', 'attachment; filename="' . $fileName . '"')
            ->header('Pragma', 'no-cache')
            ->header('Cache-Control', 'must-revalidate, post-check=0, pre-check=0')
            ->header('Expires', '0');
    }
}
