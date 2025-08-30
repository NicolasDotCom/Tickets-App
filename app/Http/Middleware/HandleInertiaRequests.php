<?php

namespace App\Http\Middleware;

use App\Models\Customer;
use App\Models\Support;
use App\Models\Ticket;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $totalCustomers = Customer::count();
        $totalTickets = Ticket::count();
        $totalSupports = Support::count();

        $technicalSupportSpeciality = Support::query()
            ->select('speciality', DB::raw('count(*) as count'))
            ->groupBy('speciality')
            ->get()
            ->mapWithKeys(function($item){
                return [$item->speciality => $item->count];
            })->all();
        //dd($technicalSupportSpeciality);

        $ticketByStatus = Ticket::query()
             ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get()
            ->mapWithKeys(function($item){
                return [$item->status => $item->count];
            })->all();
        //dd($ticketByStatus);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                'roles' => $request->user()?->getRoleNames() ?? [],
                'permissions' => $request->user()?->getAllPermissions()->pluck('name') ?? []
            ],
            'ziggy' => fn (): array => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'warning' => $request->session()->get('warning'),
                'info' => $request->session()->get('info'),
            ],
            'totalCustomers' => $totalCustomers,
            'totalTickets' => $totalTickets,
            'totalSupports' => $totalSupports,
            'technicalSupportSpeciality' => $technicalSupportSpeciality,
            'ticketByStatus' => $ticketByStatus
        ];
    }
}
