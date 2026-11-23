# BUYHIVE — Multi-Vendor E-Commerce Marketplace (Laravel + Vue 3 + Inertia + Fortify + MySQL)

This directory contains the complete **PHP 8.3 / Laravel 12+ / Vue 3 + TypeScript + Inertia.js + Laravel Fortify + MySQL** source codebase for **BuyHive**.

> **Environment Note**: Because the Google AI Studio preview container runs Node.js/Vite without PHP, Composer, or MySQL binaries, the live interactive preview on port 3000 mirrors every BuyHive customer & seller workflow in `/src/`, while `/laravel-app/` holds the authentic Laravel + Vue/Inertia + Fortify + MySQL backend & frontend source code ready for local/production PHP hosting.

## 1. Architecture & Privacy Boundaries
- **Authentication**: Laravel Fortify session-based browser authentication (`SESSION_DRIVER=database`, encrypted cookies, CSRF protection). **No Sanctum or Passport is installed or used.**
- **Role Isolation**: `EnsureCustomerRole` and `EnsureSellerRole` strictly separate Buyer and Seller routes.
- **No Internal Admin UI**: Management, inspection staff, and field-ops portals live in a separate project. This repository exposes only headless HMAC-signed integration endpoints (`/api/integration/management/*`) via `VerifyManagementIntegrationSignature`.
- **Two-Stage Physical Inspection**:
  - **Stage 1 (Pre-Listing)**: `Product::scopePubliclyListable()` ensures listings cannot go live until `stage_one_status = approved` and the seller's `verification_status = approved`.
  - **Stage 2 (Pre-Dispatch)**: `InspectionWorkflowService::recordStageTwoOutcome()` verifies collected items prior to dispatch and supports failure holds.
- **Seller & Customer Privacy**:
  - Customer endpoints never return seller personal names, emails, phones, or home addresses.
  - Seller order endpoints (`SellerPortalController::orders`) return anonymized order references and fulfilment instructions only.

## 2. Folder Structure
- `app/Http/Controllers/` — Customer, Seller, and Management Integration controllers
- `app/Http/Middleware/` — `EnsureCustomerRole`, `EnsureSellerRole`, `VerifyManagementIntegrationSignature`
- `app/Models/` — Eloquent models (`User`, `Product`, `Order`, `SellerProfile`, `SellerOrderItem`, etc.)
- `app/Policies/` — `ProductPolicy`, `OrderPolicy`
- `app/Providers/FortifyServiceProvider.php` — Role-aware Fortify login/register & rate limits
- `app/Services/` — `CheckoutService`, `CommissionService`, `InspectionWorkflowService`, `PaymentGatewayService`, `FeedbackEligibilityService`
- `config/buyhive.php` — Configurable commission rates, payment provider toggles, feedback policy
- `database/migrations/` — Normalized MySQL schema (35+ tables)
- `database/seeders/` — `CategorySeeder` (17 categories + subcategories), `KenyaLocationSeeder` (all 47 counties)
- `resources/js/` — Vue 3 + TypeScript + Inertia.js pages
- `routes/` — `web.php` & `api.php`
- `tests/Feature/` — Automated PHPUnit tests

## 3. Installation Guide
```bash
cd laravel-app
composer install
npm install
cp .env.example .env
php artisan key:generate
# Configure MySQL credentials & M-Pesa Daraja / Stripe / PayPal keys in .env
php artisan migrate --seed
php artisan db:seed --class=CategorySeeder
php artisan db:seed --class=KenyaLocationSeeder
```

## 4. Local Development & Testing
```bash
php artisan serve
npm run dev
php artisan queue:work
php artisan test
```

## 5. Production Deployment Checklist
1. Set `APP_ENV=production`, `APP_DEBUG=false`, and `BUYHIVE_SANDBOX_PAYMENTS=false`.
2. Configure HTTPS/TLS and `SESSION_SECURE_COOKIE=true`.
3. Run `npm run build`, `php artisan config:cache`, `php artisan route:cache`, `php artisan view:cache`.
4. Run Supervisor for `php artisan queue:work` to process notifications and payment reconciliation jobs.
5. Configure M-Pesa Daraja webhook callback URL to `https://your-domain/api/webhooks/mpesa`.
