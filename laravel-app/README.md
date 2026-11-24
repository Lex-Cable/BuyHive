# BUYHIVE — Multi-Vendor E-Commerce Marketplace

Laravel 12, PHP 8.5-compatible dependency lock, Vue 3, TypeScript, Inertia.js, Fortify and MySQL.

The repository contains a root Vite preview application and the Laravel application in `laravel-app/`. The Laravel application is the server-backed implementation; the root preview is a separate front-end experience.

## 1. Architecture and privacy boundaries

- **Authentication:** Laravel Fortify session-based browser authentication, CSRF protection and encrypted session cookies. No Sanctum or Passport is installed.
- **Role isolation:** `EnsureCustomerRole` and `EnsureSellerRole` protect customer and seller routes.
- **Separate management system:** no internal admin, inspection-staff or field-operations dashboard is included. The app exposes HMAC-protected integration endpoints for a future separate management application.
- **Two-stage inspection:** Stage 1 controls pre-listing publication; Stage 2 holds order items until pre-dispatch inspection passes.
- **Customer privacy:** customer-facing product projections omit seller personal names, phone numbers, email addresses and home addresses.
- **Seller privacy:** seller order projections expose anonymized order references and fulfilment instructions, not customer identity or contact details.

## 2. Laravel application structure

- `app/Http/Controllers/` — customer, seller and management-integration controllers
- `app/Http/Middleware/` — customer/seller role guards, HMAC integration signature verification and Inertia shared props
- `app/Models/` — Eloquent models for accounts, catalog, carts, orders, inspection, payments, commissions, payouts and feedback
- `app/Policies/` — product ownership and customer order ownership policies
- `app/Providers/` — application and Fortify providers
- `app/Services/` — checkout, commission, inspection, payment transaction and feedback eligibility services
- `config/` — Laravel runtime configuration and BuyHive marketplace configuration
- `database/migrations/` — marketplace schema plus Laravel session, cache, queue and password-reset tables
- `database/seeders/` — category taxonomy and all 47 Kenyan counties
- `resources/js/` — Vue 3 and Inertia entry point and pages
- `routes/` — customer/seller web routes and signed management integration API routes
- `tests/Feature/` — backend feature tests

## 3. Local installation

From PowerShell:

```powershell
cd C:\Users\elite\BuyHive\laravel-app
composer install
npm install
Copy-Item .env.example .env
php artisan key:generate
```

Edit `.env` and configure the MySQL database credentials. Keep real API secrets out of Git. The default payment configuration is sandbox-oriented.

Run the migrations and seeders once:

```powershell
php artisan migrate --seed
```

The `DatabaseSeeder` runs both `KenyaLocationSeeder` and `CategorySeeder`; do not run them again separately on the same database unless they are made idempotent first.

## 4. Development and validation

Run the Laravel backend:

```powershell
php artisan serve
```

In a second terminal, run the Laravel Vue/Inertia development server:

```powershell
cd C:\Users\elite\BuyHive\laravel-app
npm run dev
```

Useful validation commands:

```powershell
composer validate --no-check-publish
composer check-platform-reqs
php artisan route:list
php artisan test
npm run build
```

The GitHub Actions workflow checks the root frontend, builds the Laravel Vue/Inertia frontend, validates PHP syntax and Composer dependencies, boots Laravel, lists routes, and runs feature tests against an in-memory SQLite database. CI uses PHP 8.5 to match the committed dependency lock.

## 5. Current implementation boundaries

The Laravel bootstrap, runtime configuration, model classes, migration support tables and test harness are present. The CI suite currently verifies role separation, Stage-1 listing eligibility, Stage-2 inspection release, feedback eligibility and commission calculation.

Some Inertia routes do not yet have their dedicated production screens. The resolver intentionally displays an explicit placeholder instead of throwing a missing-component error. Those customer and seller workflows still need their individual UI implementations.

The payment service currently records local payment transactions and reconciles callbacks. Live provider API requests, provider-specific callback authentication/signature verification and production payment certification must be completed before enabling real-money payments. Do not set sandbox payments to false until those integrations have been independently tested.

## 6. Production readiness checklist

1. Set `APP_ENV=production`, `APP_DEBUG=false`, and use a strong unique `APP_KEY`.
2. Configure HTTPS/TLS and `SESSION_SECURE_COOKIE=true`.
3. Configure production database, mail, queue, private file storage and backups.
4. Complete and test all dedicated customer and seller Inertia screens.
5. Implement and verify live payment-provider requests and callback authentication.
6. Run `npm run build`, `php artisan config:cache`, `php artisan route:cache` and `php artisan view:cache`.
7. Configure supervised queue workers and monitoring.
8. Complete security review and end-to-end checkout, fulfilment, refund and payout testing before launch.
