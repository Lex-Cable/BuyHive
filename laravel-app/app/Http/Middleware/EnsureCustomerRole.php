<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCustomerRole
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || !$user->isCustomer()) {
            abort(403, 'Customer account required. Seller sessions cannot access customer-only routes directly.');
        }
        return $next($request);
    }
}
