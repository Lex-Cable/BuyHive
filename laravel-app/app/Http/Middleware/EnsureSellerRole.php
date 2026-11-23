<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureSellerRole
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user || !$user->isSeller() || !$user->sellerProfile) {
            return redirect('/seller/login')->with('error', 'Seller account authentication required.');
        }
        return $next($request);
    }
}
