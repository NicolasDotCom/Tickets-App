<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Support;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    /* public function index()
    {
        $tickets = Ticket::with(['customer', 'support'])->latest()->paginate(10);
        return Inertia::render('Tickets/Index', [
            'tickets' => $tickets
        ]);
    } */

    public function index(Request $request) {
        $search = $request->query('search');

        $tickets = Ticket::with(['customer', 'support'])
                   ->when($search, function ($query, $search) {
                        $query->where('description', 'like', "%{$search}%")
                              ->orWhere('status', 'like', "%{$search}%")
                              ->orWhereHas('customer', function ($q) use ($search) {
                                    $q->where('name', 'like', "%{$search}%");
                                })
                                ->orWhereHas('support', function ($q) use ($search) {
                                    $q->where('name', 'like', "%{$search}%");
                                });
                   })
                   ->latest()
                   ->paginate(10)
                   ->withQueryString();

         return Inertia::render('Tickets/Index', [
            'tickets' => $tickets,
         ]);
    }
    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $customers = Customer::select('id', 'name')->get();
        $supports = Support::select('id', 'name')->get();

        return Inertia::render('Tickets/Create', [
            'customers' => $customers,
            'supports' => $supports
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'customer_id' => 'required|exists:customers,id',
                'support_id' => 'nullable|exists:supports,id',
                'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx,mp4,avi,mov|max:10240', // 10MB máximo
                'equipment_category' => 'nullable|string|max:100',
                'equipment_name' => 'nullable|string|max:255',
                'equipment_serial' => 'nullable|string|max:100',
                'equipment_area' => 'nullable|string|max:100',
                'description' => 'required|string',
                'status' => 'required|in:open,in progress,closed'
            ]);

            // Manejar la subida del archivo
            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('tickets/attachments', $fileName, 'public');
                $validated['attachment'] = $filePath;
            }

            Ticket::create($validated);
            return redirect()
                ->route('tickets.index')
                ->with('success', '¡Ticket creado exitosamente!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error inesperado: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Ticket $ticket)
    {
        $customers = Customer::select('id', 'name')->get();
        $supports = Support::select('id', 'name')->get();

        return Inertia::render('Tickets/Edit', [
            'ticket' => $ticket->load(['customer', 'support']),
            'customers' => $customers,
            'supports' => $supports
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Ticket $ticket)
    {
        try {
            $validated = $request->validate([
                //'customer_id' => 'required|exists:customers,id', // No permitimos cambiar el cliente
                'support_id' => 'nullable|exists:supports,id',
                'attachment' => 'nullable|file|mimes:jpg,jpeg,png,pdf,doc,docx,mp4,avi,mov|max:10240',
                'equipment_category' => 'nullable|string|max:100',
                'equipment_name' => 'nullable|string|max:255',
                'equipment_serial' => 'nullable|string|max:100',
                'equipment_area' => 'nullable|string|max:100',
                'description' => 'required|string',
                'status' => 'required|in:open,in progress,closed'
            ]);

            // Manejar la subida del archivo si se proporciona uno nuevo
            if ($request->hasFile('attachment')) {
                // Eliminar el archivo anterior si existe
                if ($ticket->attachment && \Storage::disk('public')->exists($ticket->attachment)) {
                    \Storage::disk('public')->delete($ticket->attachment);
                }
                
                $file = $request->file('attachment');
                $fileName = time() . '_' . $file->getClientOriginalName();
                $filePath = $file->storeAs('tickets/attachments', $fileName, 'public');
                $validated['attachment'] = $filePath;
            }

            $ticket->update($validated);

            return redirect()
                ->route('tickets.index')
                ->with('success', '¡Ticket actualizado exitosamente!');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'No se pudo actualizar el registro: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    /* public function destroy(Ticket $ticket)
    {
        try {
            $ticket->delete();
            return redirect()->route('tickets.index')->with('success', 'Registry deleted successfully');
        } catch (\Exception $e) {
            return redirect()
            ->back()
            ->with('error', 'Could not delete the record: ' . $e->getMessage());
        }
    } */
}
