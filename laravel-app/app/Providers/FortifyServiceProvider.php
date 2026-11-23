<?php

namespace App\Providers;

use App\Models\CustomerProfile;
use App\Models\SellerProfile;
use App\Models\User;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use Laravel\Fortify\Contracts\LoginResponse;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Fortify::loginView(fn (Request $request) => Inertia::render(
            $request->is('seller*') ? 'Seller/Login' : 'Customer/Login'
        ));

        Fortify::registerView(fn (Request $request) => Inertia::render(
            $request->is('seller*') ? 'Seller/Register' : 'Customer/Register'
        ));

        Fortify::requestPasswordResetLinkView(fn () => Inertia::render('Auth/ForgotPassword'));
        Fortify::verifyEmailView(fn () => Inertia::render('Auth/VerifyEmail'));

        // Role-aware redirect after Fortify session login
        $this->app->singleton(LoginResponse::class, fn () => new class implements LoginResponse {
            public function toResponse($request)
            {
                $user = $request->user();
                $target = $user?->isSeller() ? '/seller/dashboard' : '/dashboard';
                return redirect()->intended($target);
            }
        });

        // Separate Customer vs Seller Registration via Fortify
        $this->app->singleton(CreatesNewUsers::class, fn () => new class implements CreatesNewUsers {
            public function create(array $input): User
            {
                $role = ($input['account_role'] ?? 'customer') === 'seller' ? 'seller' : 'customer';

                Validator::make($input, [
                    'name' => ['required', 'string', 'max:255'],
                    'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
                    'phone' => ['required', 'string', 'max:32'],
                    'password' => ['required', 'string', Password::min(8)->mixedCase()->numbers(), 'confirmed'],
                ])->validate();

                $user = User::create([
                    'name' => $input['name'],
                    'email' => $input['email'],
                    'phone' => $input['phone'],
                    'password' => Hash::make($input['password']),
                    'primary_role' => $role,
                ]);

                if ($role === 'seller') {
                    SellerProfile::create([
                        'user_id' => $user->id,
                        'seller_type' => $input['seller_type'] ?? 'individual',
                        'business_name' => $input['business_name'] ?? $input['name'],
                        'location_id' => $input['location_id'] ?? 47,
                        'town' => $input['town'] ?? 'Nairobi',
                        'business_description' => $input['business_description'] ?? '',
                        'verification_status' => 'pending_verification',
                    ]);
                } else {
                    CustomerProfile::create([
                        'user_id' => $user->id,
                        'loyalty_points' => 150,
                    ]);
                }

                return $user;
            }
        });

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->email . '|' . $request->ip());
        });
    }
}
