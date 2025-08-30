<?php

namespace App\Http\Controllers;

use App\Models\Support;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SupportController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view support')->only(['index']);
        $this->middleware('permission:create support')->only(['create', 'store']);
        $this->middleware('permission:edit support')->only(['edit', 'update']);
        $this->middleware('permission:delete support')->only(['destroy']);
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');

        $supports = Support::query()
            ->withCount('tickets')
            ->when($search, function ($query, $search) {
                 $query->where('name', 'like', "%{$search}%")
                       ->orWhere('email', 'like', "%{$search}%")
                       ->orWhere('phone', 'like', "%{$search}%")
                       ->orWhere('speciality', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Supports/Index', [
            'supports' => $supports
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Supports/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:supports,email',
                'phone' => 'nullable|string|max:20',
                'speciality' => 'required|string|in:Impresoras,Sistemas',
            ]);
            Support::create($validated);
            return redirect()
                ->route('supports.index')
                ->with('success', 'Registry created successfully!');
        } catch (\Exception $e) {
            return redirect()
            ->back()
            ->with('error', 'Could not create record: ' . $e->getMessage());
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
    public function edit(Support $support)
    {
        return Inertia::render('Supports/Edit',[
            'support' => $support->only('id', 'name', 'email', 'phone', 'speciality')
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Support $support)
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => ['required', 'email', Rule::unique('supports', 'email')->ignore($support->id)],
                'phone' => 'nullable|string|max:20',
                'speciality' => 'required|string|in:Impresoras,Sistemas',
            ]);
            $support->update($validated);

            return redirect()
                ->route('supports.index')
                ->with('success', 'Registry updated successfully!');
        } catch (\Exception $e) {
            return redirect()
            ->back()
            ->with('error', 'Could not create record: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Support $support)
    {
        try {
            if($support->tickets()->exists()){
                return redirect()
                    ->back()
                    ->with('error', 'Cannot delete this support because there are tickets assigned to them.');
            }

            $support->delete();

            return redirect()
            ->route('supports.index')
            ->with('success', 'Support and their tickets successfully deleted.');
        } catch (\Exception $e) {
            return redirect()
                ->back()
                ->with('error', 'Could not delete client: ' . $e->getMessage());
        }
    }
}
