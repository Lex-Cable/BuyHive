# BuyHive

**A multi-vendor e-commerce marketplace connecting customers with independent sellers and businesses.**

BuyHive is designed to make it easier for customers to discover and purchase products from a wide range of sellers through one convenient marketplace. Sellers can register, submit products for review, manage their listings and fulfil orders through a dedicated Seller Portal.

BuyHive operates as a marketplace intermediary rather than a traditional retailer that owns all the inventory. Its planned operating model includes product inspection, coordinated fulfilment, customer support, payment processing and seller payouts.

> **Project status:** BuyHive is under development. This README describes the intended product and architecture. A feature should be considered available only when it has been implemented, configured and tested in the project.

## Contents

- [Project vision](#project-vision)
- [How BuyHive works](#how-buyhive-works)
- [Platform areas](#platform-areas)
- [Product categories](#product-categories)
- [Key marketplace workflows](#key-marketplace-workflows)
- [Technology stack](#technology-stack)
- [Project scope](#project-scope)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Development guidelines](#development-guidelines)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Project vision

BuyHive aims to provide a trusted online marketplace where customers can browse products across multiple categories while sellers manage their own product listings and orders.

The platform is intended to:

- Bring products from different sellers together in one searchable marketplace.
- Give sellers a dedicated place to register and manage their listings.
- Use an approval and inspection process before products are published.
- Coordinate product collection, inspection and delivery after an order is placed.
- Keep customer communication within BuyHive instead of exposing customers' private contact details to sellers.
- Support multiple payment methods, subject to provider availability and configuration.
- Gather customer feedback after an order has actually been received.

## How BuyHive works

BuyHive connects three parts of a marketplace transaction: the customer, the seller and BuyHive's marketplace operations.

1. A seller registers through the Seller Portal and completes the required profile and verification steps.
2. The seller submits a product listing with its category, description, photographs, price, availability and other relevant details.
3. The product goes through BuyHive's required review and pre-listing inspection process. Only approved products are eligible to be published.
4. A customer discovers the product, adds it to a cart and checks out through BuyHive.
5. The seller is notified and prepares the ordered product. BuyHive coordinates the collection and the second inspection before dispatch.
6. Once the product passes inspection, BuyHive coordinates delivery or the agreed collection process.
7. After delivery or collection is confirmed, the customer can provide feedback about the product and shopping experience.
8. Seller proceeds and BuyHive's commission are reconciled under the applicable settlement and payout rules.

### Marketplace business model

- Sellers determine the advertised selling price of their products.
- BuyHive earns a commission from qualifying completed transactions.
- The proposed commission range is **10–15%**, but the final rate and any category-specific arrangements have not yet been fixed.
- The intended approach is to deduct the applicable commission from the seller's proceeds rather than unexpectedly adding it to the advertised product price.
- Refunds, cancellations, disputes, payment-provider fees and settlement timing must be accounted for in the final transaction and payout rules.

## Platform areas

### 1. Customer marketplace

The customer-facing website is intended to include the following areas:

| Area | Purpose |
|---|---|
| Public landing page | Introduces BuyHive, explains how it works and highlights selected products and marketplace information. |
| Customer registration and login | Allows customers to create and access their accounts. |
| Shopping dashboard | Provides the main product discovery and shopping experience. |
| Shop by Category | Lets customers explore the marketplace's product categories and subcategories. |
| Deals and Offers | Displays valid promotions and discounted products. |
| Shop by Occasion | Groups relevant products for events and special occasions. |
| Shop by Location | Helps customers discover products available in selected locations. |
| Trending Products | Highlights products using genuine marketplace activity. |
| New Arrivals | Shows recently approved and published products. |
| Product listing and details | Provides product discovery, specifications, images, prices and availability. |
| Cart and checkout | Allows customers to review items, choose fulfilment and submit an order. |
| Order confirmation, history and tracking | Shows order details and fulfilment progress. |
| Wishlist | Lets customers save products for later. |
| Coupons and Rewards | Provides eligible promotional codes and loyalty benefits. |
| Feedback and Satisfaction | Collects feedback after confirmed delivery or collection. |
| Customer support and contact | Provides help, enquiries and order-related support. |
| About BuyHive | Explains the marketplace and its purpose. |

The landing page may show preview carousels. The authenticated shopping dashboard is intended to provide the full interactive carousels for **Shop by Category, Deals and Offers, Shop by Occasion, Shop by Location, Trending and New Arrivals**.

### 2. Seller Portal

The Seller Portal is part of the BuyHive website but has its own seller registration, login and authenticated workspace.

Planned seller features include:

- Seller registration and verification status.
- Seller dashboard and activity overview.
- List New Product and My Products.
- Product inspection status and feedback.
- Seller-specific order management.
- Sales reports.
- Earnings and commission breakdowns.
- Payments and payout history.
- Messages and announcements from BuyHive.
- Reviews, ratings and seller performance information.
- Promotions and discounts.
- Seller account settings and support.

Sellers should only be able to access their own listings, orders and financial records.

### 3. Separate management website

The internal BuyHive management and administration website is **outside the scope of this current website build** and is planned as a separate application. Internal management tools for seller approvals, inspection-team operations, field agents, disputes, finance and marketplace administration should not be exposed as public customer or seller pages.

The current application should be designed so that a separate authorized management system can integrate with its backend and data model in the future.

## Product categories

The initial marketplace catalogue contains these 17 main categories:

1. Electronics
2. Fashion and Clothing
3. Beauty and Personal Care
4. Home, Furniture and Living
5. Baby, Kids and Maternity
6. Sports, Fitness and Outdoor
7. Automotive and Motorcycles
8. Books, Stationery and Office
9. Hardware, Tools and Construction
10. Jewellery, Luxury and Gifts
11. Pets and Pet Supplies
12. Music, Art and Entertainment
13. Garden, Agriculture and Farming
14. Travel and Luggage
15. Renewable Energy and Solar Equipment
16. Health and Wellness Products
17. Handmade, African and Artisan Products

Categories and subcategories should be database-driven so they can be expanded and maintained without rewriting frontend components. Product restrictions and verification requirements should apply where relevant.

## Key marketplace workflows

### Product listing and two-stage inspection

BuyHive's quality-control model is designed around two physical inspection stages:

**Stage 1 — Before a product is listed**

- The seller submits a product listing.
- BuyHive arranges an inspection at the seller's premises or an agreed safe meeting location.
- An authorized inspector checks the physical product against the submitted listing and records findings and supporting evidence.
- The product is published only after the required approval.
- After approval, the seller keeps the product until an order is placed; BuyHive does not need to store every approved product in its own warehouse.

**Stage 2 — After purchase, before dispatch**

- The seller prepares the ordered product.
- BuyHive coordinates collection through its field operations arrangements.
- The product is inspected again to confirm that it matches the approved listing and order.
- Products that pass can proceed to packaging and delivery or the agreed collection process.
- Products that fail are held while the issue is investigated and resolved.

Inspection records are intended to include the product and order references, inspector reference, date and time, checklist, findings, outcome and relevant photographs.

### Customer privacy

BuyHive manages the customer relationship and coordinates customer communication. Sellers should receive only the operational information they need to prepare and hand over an order. They should not receive customers' private names, phone numbers, email addresses or private delivery addresses through the seller interface.

Public product pages should focus on the product, its brand where applicable, specifications, price, availability and relevant BuyHive inspection status. They should not expose a private seller's personal identity or contact details.

### Delivery and store collection

Customers are intended to be able to select an available delivery or collection option during checkout. BuyHive coordinates the relevant fulfilment process and provides order-status updates. Tracking information must reflect real recorded status changes; the application must not display invented GPS positions or delivery events.

### Customer feedback and satisfaction

Feedback becomes available only after the customer has actually received the product:

- **Store collection:** a secure collection code or authorized collection confirmation records that the customer has collected the order.
- **Delivery:** a delivery confirmation records that the order has reached the customer.

The feedback experience can ask about product quality, accuracy, packaging, payment convenience, delivery or collection, and the overall shopping experience. Customers may leave ratings, comments, suggestions or a complaint. Feedback should be linked to an eligible purchase and must not be requested simply because payment was made.

### Payments, commissions and payouts

The intended payment options include M-Pesa, supported debit and credit cards (including Visa and Mastercard), PayPal and other payment providers that may be configured for the relevant market. Only payment methods that have been properly integrated and enabled should be offered at checkout.

Payment status must be verified through the relevant provider. Seller payouts are separate from customer payment collection and should follow the agreed completion, refund, dispute and settlement rules. Live payment processing requires valid provider credentials and appropriate provider arrangements.

## Technology stack

The intended application stack is:

| Layer | Technology |
|---|---|
| Backend | PHP and Laravel |
| Frontend | Vue 3 and TypeScript |
| Application integration | Inertia.js |
| Styling | Tailwind CSS |
| Build tooling | Vite and Node.js/npm |
| Database | MySQL |
| Authentication | Laravel Fortify with Laravel session-based browser authentication |

**Authentication note:** The current specification uses Laravel Fortify and session-based browser authentication. Laravel Sanctum is not the selected authentication approach for this project.

Exact framework and package versions should be confirmed against the versions installed in the repository and their compatibility requirements.

## Project scope

The current project is focused on:

- The public BuyHive landing page.
- Customer authentication and shopping experience.
- Product discovery and shopping transactions.
- The Seller Portal and seller workflows.
- Backend support for product approval, inspection records, fulfilment, payments, feedback and rewards.

The separate internal management website, including its administrative dashboards and field-operations interfaces, is planned for a later stage. Do not add visible management or administrator links to the current customer or seller interfaces.

## Getting started

The following steps describe a typical local setup for a Laravel and Vue project. Confirm the actual scripts and installed packages in this repository before running commands, as the project may evolve during development.

### Prerequisites

Install the following tools:

- Git
- PHP (a version supported by the Laravel version in the repository)
- Composer
- MySQL
- Node.js and npm
- Visual Studio Code or another code editor

PHP extensions required by the installed Laravel version and database driver must also be enabled.

### 1. Clone the repository

```bash
git clone <YOUR_BUYHIVE_REPOSITORY_URL>
cd BuyHive
```

Replace `<YOUR_BUYHIVE_REPOSITORY_URL>` with the repository's actual HTTPS or SSH clone URL. The local folder name may differ depending on the clone command.

### 2. Install backend dependencies

```bash
composer install
```

### 3. Install frontend dependencies

```bash
npm install
```

### 4. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Create a MySQL database for the project, then update the database settings in `.env`:

```dotenv
APP_NAME=BuyHive
APP_ENV=local
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=buyhive
DB_USERNAME=your_database_username
DB_PASSWORD=your_database_password
```

Use your own local database credentials. Never commit real passwords, API keys or payment credentials to GitHub.

### 5. Generate the application key

```bash
php artisan key:generate
```

### 6. Run database migrations

```bash
php artisan migrate
```

If the project contains seeders intended for local development, you may also run:

```bash
php artisan db:seed
```

Only use `php artisan migrate:fresh --seed` when you intentionally want to drop and recreate the local database. It deletes existing database tables and data.

### 7. Start the application

In one terminal, start Laravel:

```bash
php artisan serve
```

In another terminal, start the frontend development server:

```bash
npm run dev
```

Open the local URL printed by Laravel, commonly `http://127.0.0.1:8000`.

If the repository defines a combined development script, follow the project's own setup documentation instead.

## Configuration

Some features require external services and credentials before they can operate in a live environment.

Examples include:

- Database connection details.
- Mail provider configuration for verification and notifications.
- M-Pesa Daraja credentials and callback configuration.
- Card payment gateway credentials.
- PayPal credentials, if enabled.
- File storage configuration for uploaded images and documents.
- Any configured maps, location or messaging services.

Use local or sandbox modes for development and testing. Clearly identify simulated transactions and never treat them as real payments.

## Development guidelines

- Keep backend business rules in Laravel, not only in frontend code.
- Validate prices, stock, coupons, payment status and permissions on the server.
- Keep customer and seller access separate.
- Enforce seller ownership checks for products, orders and financial information.
- Keep customer personal information private from sellers.
- Do not publish products before required approval and inspection.
- Do not trigger feedback before confirmed delivery or collection.
- Keep commission rates configurable; the final rate has not been decided.
- Do not expose internal management tools in the customer or seller interface.
- Reuse existing components and functionality when adding features.
- Update this README when setup steps, supported services or project capabilities change.

## Testing

Run Laravel's automated tests with:

```bash
php artisan test
```

Build the frontend to check for production compilation issues:

```bash
npm run build
```

Run any additional static analysis, formatting or lint commands defined in the repository's `composer.json` and `package.json`.

Critical areas to test include authentication and authorization, seller data isolation, product submissions, inspection status transitions, cart and checkout calculations, payment verification, order fulfilment, feedback eligibility, commission calculations and payout records.

## Roadmap

The planned development sequence is:

1. Laravel, Vue, Inertia and MySQL project foundation.
2. Customer and seller authentication.
3. Public landing page and BuyHive design system.
4. Customer shopping dashboard and carousel sections.
5. Product categories, search, listings and product details.
6. Cart, checkout and payment-provider integrations.
7. Customer order history and tracking.
8. Seller Portal and product management.
9. Product inspection and fulfilment workflows.
10. Seller sales, earnings and payouts.
11. Customer feedback, coupons and rewards.
12. Testing, security review and deployment preparation.
13. Separate internal management website in a future project.

This roadmap is a plan, not a claim that every feature is currently implemented.

## Contributing

Contributions, ideas and constructive feedback are welcome.

Before submitting changes:

1. Check the existing project structure and conventions.
2. Keep changes focused and avoid breaking existing functionality.
3. Add or update tests for new behaviour.
4. Do not commit secrets, credentials, customer information or private seller documents.
5. Update documentation when behaviour or setup instructions change.

For substantial changes, open an issue or discuss the proposed approach before starting implementation.

## License

A license has not yet been specified. Until a license is added to this repository, all rights remain with the project owner and permission should be obtained before copying, distributing or reusing the project code.

---

**BuyHive — Discover products. Shop with confidence.**


## React storefront and Laravel API integration

The customer and seller experience remains the existing React + TypeScript application at the repository root. Laravel remains the system of record for authentication, marketplace rules, persistence, inspection, orders, payments and seller operations. The Laravel Vue/Inertia pages are not the customer storefront.

### Local development

Run MySQL from XAMPP, then start Laravel from a PowerShell terminal:

```powershell
cd C:\Users\elite\BuyHive\laravel-app
php -S 127.0.0.1:8010 -t public public/index.php
```

In a second terminal, start the React application:

```powershell
cd C:\Users\elite\BuyHive
npm install
npm run dev
```

Open `http://localhost:3000`. Vite proxies `/api/*` requests to the Laravel development server on `127.0.0.1:8010`. The PHP built-in server command above is a temporary workaround for the current Herd PHP 8.5 `artisan serve` cURL startup issue; it does not change the Laravel application.

### Current integration scope

- The React storefront requests `GET /api/catalog` from Laravel on startup.
- Laravel applies the existing public-listing rule: the seller must be approved and the product must have passed Stage-1 inspection, be published and not paused.
- The API response deliberately omits seller names, email addresses, phone numbers and private seller references.
- If Laravel is unavailable, the React app keeps its local demo catalogue so the existing UI can still be reviewed.
- Category identifiers are mapped to the React storefront's existing taxonomy IDs.

### Not yet integrated

Customer and seller login/registration, persistent carts, checkout/order creation, payments, order tracking, feedback, wishlist, support, and seller dashboard mutations still need dedicated session-authenticated API endpoints and frontend service wiring. Existing demo-mode behaviour must not be mistaken for live backend transactions. Payment provider credentials and live webhooks also remain separate configuration work.

The Laravel Vue/Inertia placeholder pages remain in place for now; this change does not delete or replace them.


## React storefront and Laravel session API

The root React + TypeScript application is the customer-facing storefront and seller portal. Laravel is the backend system of record. React calls Laravel through the `/api` Vite proxy during local development. Authentication uses Laravel's first-party session cookie and CSRF protection; Sanctum and Passport are not used.

### Local setup

Start MySQL in XAMPP. In a terminal, prepare the Laravel database (run migrations only if they have not already been applied):

```powershell
cd C:\Users\elite\BuyHive\laravel-app
php artisan migrate
php artisan db:seed
php artisan storage:link
php -S 127.0.0.1:8010 -t public public/index.php
```

In another terminal:

```powershell
cd C:\Users\elite\BuyHive
npm install
npm run dev
```

Open `http://localhost:3000`. The root Vite server forwards `/api/*` to Laravel on port 8010. The PHP built-in server command is a temporary workaround for the current Herd PHP 8.5 `artisan serve` cURL startup issue.

### Connected workflows in this integration phase

- Customer and seller registration/login use Laravel sessions, role checks and server-side validation.
- Session identity is rehydrated from Laravel on page load; local storage no longer acts as an authentication source.
- Public product listings come from Laravel and retain the approved-seller + Stage-1 inspection gate.
- Customer cart items are persisted in Laravel; checkout creates an order and commission/earning ledger entries server-side.
- Seller product creation is persisted in Laravel; images are decoded, MIME-checked and stored on the public disk.
- Order history is loaded from Laravel for the signed-in customer.
- Collection confirmation is validated server-side and seller earnings are released only after the required inspection and receipt conditions.
- Customer wishlist, address book, profile, rewards and support actions use authenticated Laravel endpoints.
- Seller profile, product stock/pause/resubmission, order preparation, message-read and payout-request actions use authenticated Laravel endpoints.

### Important integration boundaries

- Payment initiation is currently sandbox-only. The API does not claim that a real M-Pesa/card/PayPal charge has occurred. Production checkout is blocked until a real provider adapter and credentials are configured.
- M-Pesa callback handling requires the configured callback HMAC secret; this is a BuyHive integration guard, not a complete Daraja callback adapter.
- Collection codes are exposed only to the owning customer after payment and Stage-2 inspection have reached ready-for-collection. Production SMS/email delivery and the separate field-operations verification remain to be configured.
- Seller KRA/document verification still requires a private document-upload and management review workflow. Payout account details are encrypted and saved as unverified until the management/finance verification process is implemented. No funds are transferred by the payout-request endpoint.
- Seller dashboard product, order, earnings and messaging data is loaded from Laravel. Promotions and production finance settlement remain deferred until their business rules and providers are configured.
- The separate management/inspection system remains a signed machine-to-machine integration and is not exposed as a customer/admin portal.


### Additional seller account and fulfilment safeguards

- Seller business profile edits now persist to the authenticated seller profile.
- Payout account details are encrypted at rest by Laravel's encrypted model cast; the account is marked unverified when changed.
- Payout requests lock and attach only currently available, unassigned earnings in one database transaction. A request is recorded as pending; no funds are transferred by this endpoint.
- Seller order views expose only anonymized order references and that seller's own line items, not customer contact or delivery address details.
- Customer collection codes are returned only to the owning customer after payment and Stage-2 inspection have reached the ready-for-collection state.
- Checkout now selects the correct base inventory row when an item has no variation, and successful payment reconciliation clears the reserved quantity without restoring sold stock.
