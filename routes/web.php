<?php

use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserRoleController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Rutas accesibles para todos los usuarios autenticados
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('tickets', TicketController::class);
    
    // Rutas para documentos de tickets
    Route::get('/ticket-documents/{document}/download', [TicketController::class, 'downloadDocument'])
        ->name('ticket-documents.download');
    Route::delete('/ticket-documents/{document}', [TicketController::class, 'deleteDocument'])
        ->name('ticket-documents.destroy');
});

// Rutas accesibles para usuarios autenticados con permisos específicos
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('customers', CustomerController::class);
    Route::resource('supports', SupportController::class);
});

Route::middleware(['auth', 'verified', 'role:admin'])->group(function (){
    // Exportación de tickets
    Route::get('dashboard/export-tickets', [DashboardController::class, 'exportTickets'])->name('dashboard.export-tickets');
    
    //roles
    Route::get('/roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('/roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::get('/roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('/roles', [RoleController::class, 'store'])->name('roles.store');

    //permisos
    Route::get('/users/roles', [UserRoleController::class, 'index'])->name('users.roles.index');
    Route::put('/users/roles', [UserRoleController::class, 'update'])->name('users.roles.update');

    Route::resource('users', UserController::class);

    // Registro habilitado solo para admin
    Route::get('/register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [RegisteredUserController::class, 'store']);
});


require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
