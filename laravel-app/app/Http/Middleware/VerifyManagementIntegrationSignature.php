<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyManagementIntegrationSignature
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = (string) config('buyhive.management_webhook_secret');
        $signature = (string) $request->header('X-BuyHive-Signature');

        if ($secret === '' || !hash_equals(hash_hmac('sha256', $request->getContent(), $secret), $signature)) {
            abort(401, 'Invalid BuyHive Management System HMAC signature.');
        }

        return $next($request);
    }
}
