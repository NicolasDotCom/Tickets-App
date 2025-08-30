<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Support;
use App\Models\Customer;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('role:admin');
    }

    public function index(Request $request)
    {
        $search = $request->query('search');

        $users = User::with('roles')
            ->when($search, function ($query, $search) {
                $query->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        $roles = Role::all();
        return Inertia::render('Users/Create', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|min:6|confirmed',
                'role' => 'required|exists:roles,name',
                'phone' => 'nullable|string|max:20',
                'speciality' => 'nullable|in:Impresoras,Sistemas',
                'name_user' => 'nullable|string|max:255',
            ]);
            
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);
            
            $user->assignRole($validated['role']);
            
            // Si el rol es 'support', crear automáticamente un registro en la tabla supports
            if ($validated['role'] === 'support') {
                Support::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'] ?? '', // Usar el teléfono proporcionado o vacío
                    'speciality' => $validated['speciality'] ?? 'Sistemas', // Usar especialidad seleccionada o Sistemas por defecto
                ]);
            }
            
            // Si el rol es 'customer', crear automáticamente un registro en la tabla customers
            if ($validated['role'] === 'customer') {
                Customer::create([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'name_user' => $validated['name_user'] ?? $validated['name'], // Usar name_user proporcionado o el nombre como fallback
                    'phone' => $validated['phone'] ?? '',
                ]);
            }
            
            $successMessage = 'Usuario creado exitosamente.';
            if ($validated['role'] === 'support') {
                $successMessage .= ' Se ha creado automáticamente el perfil de soporte técnico.';
            } elseif ($validated['role'] === 'customer') {
                $successMessage .= ' Se ha creado automáticamente el perfil de cliente.';
            }
            
            return redirect()
                ->route('users.index')
                ->with('success', $successMessage);
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Error al crear el usuario: ' . $e->getMessage());
        }
    }

    public function edit(User $user)
    {
        $roles = Role::all();
        
        // Buscar si existe un soporte asociado con este email
        $support = Support::where('email', $user->email)->first();
        
        // Buscar si existe un customer asociado con este email
        $customer = Customer::where('email', $user->email)->first();
        
        return Inertia::render('Users/Edit', [
            'user' => $user->load('roles'),
            'roles' => $roles,
            'support' => $support,
            'customer' => $customer,
        ]);
    }

    public function update(Request $request, User $user)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $user->id,
                'role' => 'required|exists:roles,name',
                'phone' => 'nullable|string|max:20',
                'speciality' => 'nullable|in:Impresoras,Sistemas',
                'name_user' => 'nullable|string|max:255',
            ]);
            
            // Obtener el rol anterior
            $previousRole = $user->roles->first()->name ?? null;
            
            $user->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
            ]);
            
            $user->syncRoles([$validated['role']]);
            
            // Manejar cambios de rol relacionados con support
            if ($validated['role'] === 'support' && $previousRole !== 'support') {
                // Si cambió a support, crear registro en supports si no existe
                $existingSupport = Support::where('email', $validated['email'])->first();
                if (!$existingSupport) {
                    Support::create([
                        'name' => $validated['name'],
                        'email' => $validated['email'],
                        'phone' => $validated['phone'] ?? '',
                        'speciality' => $validated['speciality'] ?? 'Sistemas',
                    ]);
                }
            } elseif ($previousRole === 'support' && $validated['role'] !== 'support') {
                // Si dejó de ser support, eliminar registro de supports
                Support::where('email', $user->email)->delete();
            } elseif ($validated['role'] === 'support') {
                // Si sigue siendo support, actualizar datos
                Support::where('email', $user->email)->update([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'] ?? '',
                    'speciality' => $validated['speciality'] ?? 'Sistemas',
                ]);
            }
            
            // Manejar cambios de rol relacionados con customer
            if ($validated['role'] === 'customer' && $previousRole !== 'customer') {
                // Si cambió a customer, crear registro en customers si no existe
                $existingCustomer = Customer::where('email', $validated['email'])->first();
                if (!$existingCustomer) {
                    Customer::create([
                        'name' => $validated['name'],
                        'email' => $validated['email'],
                        'name_user' => $validated['name_user'] ?? $validated['name'],
                        'phone' => $validated['phone'] ?? '',
                    ]);
                }
            } elseif ($previousRole === 'customer' && $validated['role'] !== 'customer') {
                // Si dejó de ser customer, eliminar registro de customers
                Customer::where('email', $user->email)->delete();
            } elseif ($validated['role'] === 'customer') {
                // Si sigue siendo customer, actualizar datos
                Customer::where('email', $user->email)->update([
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'name_user' => $validated['name_user'] ?? $validated['name'],
                    'phone' => $validated['phone'] ?? '',
                ]);
            }
            
            return redirect()
                ->route('users.index')
                ->with('success', 'Usuario actualizado exitosamente.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Error al actualizar el usuario: ' . $e->getMessage());
        }
    }

    public function destroy(User $user) {
        try {
            // Si el usuario tiene rol de support, eliminar también su registro de supports
            if ($user->hasRole('support')) {
                Support::where('email', $user->email)->delete();
            }
            
            // Si el usuario tiene rol de customer, eliminar también su registro de customers
            if ($user->hasRole('customer')) {
                Customer::where('email', $user->email)->delete();
            }
            
            $user->delete();

            return redirect()
                ->route('users.index')
                ->with('success', 'Usuario eliminado exitosamente.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Error al eliminar el usuario: ' . $e->getMessage());
        }
    }
}
