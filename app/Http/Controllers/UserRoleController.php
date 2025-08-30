<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserRoleController extends Controller
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

        $roles = Role::all();

        return Inertia::render('User/Roles', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'roles' => 'required|array',
            'roles.*' => 'string|exists:roles,name',
        ]);

        foreach ($validated['roles'] as $userId => $roleName) {
            $user = User::find($userId);
            if ($user) {
                $user->syncRoles([$roleName]);
            }
        }

        return redirect()
            ->route('users.roles.index')
            ->with('success', 'User roles updated successfully!');
    }
}
