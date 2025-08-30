<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Support;
use App\Models\Ticket;
use App\Models\TicketDocument;
use App\Models\User;
use App\Helpers\DateHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view ticket')->only(['index', 'show']);
        $this->middleware('permission:create ticket')->only(['create', 'store']);
        $this->middleware('permission:edit ticket')->only(['edit', 'update', 'deleteDocument']);
        $this->middleware('permission:view ticket')->only(['downloadDocument']);
    }
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
        $userId = Auth::id();
        $user = User::find($userId);

        $query = Ticket::with(['customer', 'support'])
                       ->withCount('documents');

        // Si el usuario es técnico de soporte, solo mostrar tickets asignados a él
        if ($user && $user->hasRole('support')) {
            // Buscar el registro de support asociado al usuario autenticado
            $support = Support::where('email', $user->email)->first();
            if ($support) {
                $query->where('support_id', $support->id);
            } else {
                // Si no tiene registro de support, no mostrar ningún ticket
                $query->whereRaw('1 = 0');
            }
        }
        // Si el usuario es cliente, solo mostrar tickets que él ha creado
        elseif ($user && $user->hasRole('customer')) {
            // Buscar el registro de customer asociado al usuario autenticado
            $customer = Customer::where('email', $user->email)->first();
            if ($customer) {
                $query->where('customer_id', $customer->id);
            } else {
                // Si no tiene registro de customer, no mostrar ningún ticket
                $query->whereRaw('1 = 0');
            }
        }

        $tickets = $query->when($search, function ($query, $search) {
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
        $userId = Auth::id();
        $user = User::find($userId);

        // Si el usuario es cliente, solo mostrar sus datos
        if ($user && $user->hasRole('customer')) {
            $customer = Customer::where('email', $user->email)->first();
            if (!$customer) {
                abort(403, 'No tienes un perfil de cliente asociado.');
            }
            
            $customers = collect([$customer]);
            $supports = Support::select('id', 'name')->get();
            $companies = collect([$customer->name]);

            return Inertia::render('Tickets/Create', [
                'customers' => $customers,
                'supports' => $supports,
                'companies' => $companies,
                'isCustomer' => true,
                'preselectedCustomer' => $customer
            ]);
        }

        // Para administradores y soporte, mostrar todos los datos
        $customers = Customer::select('id', 'name', 'name_user')->get();
        $supports = Support::select('id', 'name')->get();
        // Cambiar para que companies sea el campo 'name' (nombre de la empresa)
        $companies = Customer::select('name')->distinct()->pluck('name');

        return Inertia::render('Tickets/Create', [
            'customers' => $customers,
            'supports' => $supports,
            'companies' => $companies,
            'isCustomer' => false
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $userId = Auth::id();
        $user = User::find($userId);

        // Si el usuario es cliente, verificar que solo cree tickets para él mismo
        if ($user && $user->hasRole('customer')) {
            $customer = Customer::where('email', $user->email)->first();
            if (!$customer) {
                return redirect()->back()->with('error', 'No tienes un perfil de cliente asociado.');
            }
            
            // Verificar que el customer_id enviado corresponda al cliente autenticado
            if ($request->customer_id != $customer->id) {
                return redirect()->back()->with('error', 'No puedes crear tickets para otros clientes.');
            }
        }

        try {
            $validated = $request->validate([
                'customer_id' => 'required|exists:customers,id',
                'support_id' => 'nullable|exists:supports,id',
                'description' => 'required|string',
                'phone' => 'required|string|max:20',
                'address' => 'required|string|max:255',
                'brand' => 'required|string|max:100',
                'model' => 'required|string|max:100',
                'serial' => 'required|string|max:100',
                'status' => 'required|in:Open,In Progress,Closed',
                'documents.*' => 'nullable|file|max:10240|mimes:pdf,doc,docx,txt,jpg,jpeg,png,xlsx,xls'
            ]);

            // Crear el ticket con timestamp correcto
            $validated['created_at'] = DateHelper::nowColombia();
            $validated['updated_at'] = DateHelper::nowColombia();
            $ticket = Ticket::create($validated);

            // Procesar archivos si existen
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $file) {
                    $originalName = $file->getClientOriginalName();
                    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $filePath = $file->storeAs('ticket-documents', $fileName, 'public');

                    TicketDocument::create([
                        'ticket_id' => $ticket->id,
                        'original_name' => $originalName,
                        'file_name' => $fileName,
                        'file_path' => $filePath,
                        'mime_type' => $file->getMimeType(),
                        'file_size' => $file->getSize()
                    ]);
                }
            }

            return redirect()
                ->route('tickets.index')
                ->with('success', 'Ticket creado exitosamente!');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Ocurrió un error inesperado: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Ticket $ticket)
    {
        $userId = Auth::id();
        $user = User::find($userId);

        // Si el usuario es técnico de soporte, verificar que el ticket esté asignado a él
        if ($user && $user->hasRole('support')) {
            $support = Support::where('email', $user->email)->first();
            if (!$support || $ticket->support_id !== $support->id) {
                abort(403, 'No tienes autorización para ver este ticket.');
            }
        }
        // Si el usuario es cliente, verificar que el ticket sea suyo
        elseif ($user && $user->hasRole('customer')) {
            $customer = Customer::where('email', $user->email)->first();
            if (!$customer || $ticket->customer_id !== $customer->id) {
                abort(403, 'No tienes autorización para ver este ticket.');
            }
        }

        $ticket->load(['customer', 'support', 'documents']);
        
        return Inertia::render('Tickets/Show', [
            'ticket' => $ticket
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Ticket $ticket)
    {
        $userId = Auth::id();
        $user = User::find($userId);

        // Si el usuario es técnico de soporte, verificar que el ticket esté asignado a él
        if ($user && $user->hasRole('support')) {
            $support = Support::where('email', $user->email)->first();
            if (!$support || $ticket->support_id !== $support->id) {
                abort(403, 'No tienes autorización para editar este ticket.');
            }
        }
        // Si el usuario es cliente, verificar que el ticket sea suyo
        elseif ($user && $user->hasRole('customer')) {
            $customer = Customer::where('email', $user->email)->first();
            if (!$customer || $ticket->customer_id !== $customer->id) {
                abort(403, 'No tienes autorización para editar este ticket.');
            }
        }

        $customers = Customer::select('id', 'name')->get();
        $supports = Support::select('id', 'name')->get();

        return Inertia::render('Tickets/Edit', [
            'ticket' => $ticket->load(['customer', 'support', 'documents']),
            'customers' => $customers,
            'supports' => $supports
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Ticket $ticket)
    {
        $userId = Auth::id();
        $user = User::find($userId);

        // Si el usuario es técnico de soporte, verificar que el ticket esté asignado a él
        if ($user && $user->hasRole('support')) {
            $support = Support::where('email', $user->email)->first();
            if (!$support || $ticket->support_id !== $support->id) {
                return redirect()->back()->with('error', 'No tienes autorización para editar este ticket.');
            }
        }
        // Si el usuario es cliente, verificar que el ticket sea suyo
        elseif ($user && $user->hasRole('customer')) {
            $customer = Customer::where('email', $user->email)->first();
            if (!$customer || $ticket->customer_id !== $customer->id) {
                return redirect()->back()->with('error', 'No tienes autorización para editar este ticket.');
            }
        }

        try {
            $validated = $request->validate([
                //'customer_id' => 'required|exists:customers,id',
                'support_id' => 'nullable|exists:supports,id',
                'description' => 'required|string|min:1',
                'phone' => 'nullable|string|max:20',
                'address' => 'nullable|string|max:255',
                'brand' => 'nullable|string|max:100',
                'model' => 'nullable|string|max:100',
                'serial' => 'nullable|string|max:100',
                'status' => 'required|in:Open,In Progress,Closed',
                'documents.*' => 'nullable|file|max:10240|mimes:pdf,doc,docx,txt,jpg,jpeg,png,xlsx,xls'
            ]);

            // Asignar valores por defecto si están vacíos
            $validated['phone'] = $validated['phone'] ?: 'No especificado';
            $validated['address'] = $validated['address'] ?: 'No especificado';
            $validated['brand'] = $validated['brand'] ?: 'No especificado';
            $validated['model'] = $validated['model'] ?: 'No especificado';
            $validated['serial'] = $validated['serial'] ?: 'No especificado';

            $ticket->update($validated);

            // Procesar nuevos archivos si existen
            if ($request->hasFile('documents')) {
                foreach ($request->file('documents') as $file) {
                    $originalName = $file->getClientOriginalName();
                    $fileName = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $filePath = $file->storeAs('ticket-documents', $fileName, 'public');

                    TicketDocument::create([
                        'ticket_id' => $ticket->id,
                        'original_name' => $originalName,
                        'file_name' => $fileName,
                        'file_path' => $filePath,
                        'mime_type' => $file->getMimeType(),
                        'file_size' => $file->getSize()
                    ]);
                }
            }

            return redirect()
                ->route('tickets.index')
                ->with('success', 'Ticket actualizado exitosamente!');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'No se pudo actualizar el ticket: ' . $e->getMessage());
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

    /**
     * Download ticket document
     */
    public function downloadDocument(TicketDocument $document)
    {
        $userId = Auth::id();
        $user = User::find($userId);
        $ticket = $document->ticket;

        // Si el usuario es técnico de soporte, verificar que el ticket esté asignado a él
        if ($user && $user->hasRole('support')) {
            $support = Support::where('email', $user->email)->first();
            if (!$support || $ticket->support_id !== $support->id) {
                abort(403, 'No tienes autorización para descargar este documento.');
            }
        }
        // Si el usuario es cliente, verificar que el ticket sea suyo
        elseif ($user && $user->hasRole('customer')) {
            $customer = Customer::where('email', $user->email)->first();
            if (!$customer || $ticket->customer_id !== $customer->id) {
                abort(403, 'No tienes autorización para descargar este documento.');
            }
        }

        $filePath = storage_path('app/public/' . $document->file_path);
        
        if (!file_exists($filePath)) {
            return redirect()->back()->with('error', 'El archivo no existe.');
        }

        return response()->download($filePath, $document->original_name);
    }

    /**
     * Delete ticket document
     */
    public function deleteDocument(TicketDocument $document)
    {
        $userId = Auth::id();
        $user = User::find($userId);
        $ticket = $document->ticket;

        // Si el usuario es técnico de soporte, verificar que el ticket esté asignado a él
        if ($user && $user->hasRole('support')) {
            $support = Support::where('email', $user->email)->first();
            if (!$support || $ticket->support_id !== $support->id) {
                return redirect()->back()->with('error', 'No tienes autorización para eliminar este documento.');
            }
        }
        // Si el usuario es cliente, verificar que el ticket sea suyo
        elseif ($user && $user->hasRole('customer')) {
            $customer = Customer::where('email', $user->email)->first();
            if (!$customer || $ticket->customer_id !== $customer->id) {
                return redirect()->back()->with('error', 'No tienes autorización para eliminar este documento.');
            }
        }

        try {
            // Eliminar archivo del storage
            if (Storage::disk('public')->exists($document->file_path)) {
                Storage::disk('public')->delete($document->file_path);
            }
            
            // Eliminar registro de la base de datos
            $document->delete();
            
            return redirect()->back()->with('success', 'Documento eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Error al eliminar el documento: ' . $e->getMessage());
        }
    }
}
