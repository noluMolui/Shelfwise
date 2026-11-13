# ShelfWise

**Smart Inventory Management for Small Businesses**

ShelfWise is a web-based inventory management platform designed to help small businesses manage their products, monitor stock levels, organise supplier information and make informed purchasing decisions.

The goal is to replace scattered spreadsheets and handwritten inventory records with one centralised, reliable and easy-to-use platform.

---

## Project Overview

Many small businesses still rely on manual methods to manage their inventory. This makes it difficult to monitor available stock, identify products that need replenishment, track stock movements and maintain supplier information.

ShelfWise aims to simplify these processes by providing a centralised platform where businesses can manage their inventory and gain better visibility into their stock levels and inventory value.

### Our Objectives

- Simplify product and inventory management.
- Improve stock accuracy through recorded stock movements.
- Identify products that are running low.
- Centralise supplier information.
- Provide meaningful insights through a business dashboard.
- Apply secure authentication and business-level data access.

---

## Core Features

### 1. Product Management
- Add, view, edit and archive products.
- Maintain product names, SKUs, categories and selling prices.
- Search and organise product catalogues.
- Associate products with suppliers.

### 2. Stock Management
- Record incoming and outgoing stock.
- Automatically update available stock quantities.
- Maintain a historical record of stock movements.
- Prevent outgoing stock movements from exceeding available quantities.

### 3. Low-Stock Alerts
- Configure minimum stock thresholds for products.
- Identify products at or below their defined thresholds.
- Display low-stock products for easy monitoring.

### 4. Supplier Management
- Add, view, edit and manage supplier records.
- Store supplier contact information.
- Associate suppliers with products.

### 5. Business Dashboard
- View total products.
- Monitor overall inventory value.
- Identify low-stock products.
- View recent stock activity.
- Access important inventory management sections from one place.

---

## Technology Stack

ShelfWise uses the following technologies:

| Technology | Purpose |
|---|---|
| React | Frontend development |
| TypeScript | Type safety and maintainable code |
| Vite | Development environment and build tooling |
| Tailwind CSS | Responsive user interface styling |
| Supabase | Backend services and authentication |
| PostgreSQL | Relational database |
| Vitest | Automated testing |
| React Testing Library | Component testing |
| GitHub Actions | Continuous Integration |
| GitHub | Version control and collaboration |
| Vercel | Application hosting and deployment |

---

## System Architecture

ShelfWise follows a modern full-stack web application architecture.

1. **Frontend:** React and TypeScript provide the user interface.
2. **Backend:** Supabase provides backend services and authentication.
3. **Database:** PostgreSQL stores business, user, product, supplier and stock movement information.
4. **Security:** Supabase Row-Level Security (RLS) enforces business-level data access and permissions.
5. **Testing:** Vitest and React Testing Library support automated testing.
6. **Deployment:** Vercel hosts the application and integrates with GitHub.

---

## User Roles

ShelfWise supports two primary user roles:

**Business Owner**
- Manage business inventory.
- Create, update and archive products.
- Manage suppliers.
- Record and review stock movements.
- Access business dashboard information.
- Manage permitted business settings and staff access.

**Staff Member**
- View permitted product information.
- Access inventory listings.
- Record authorised stock movements.
- View relevant stock information.

Each user belongs to one business in the initial release. Users must not be able to access another business's records.

---

## Database Structure

The proposed database consists of five main entities:

- **Business:** Stores business information.
- **UserProfile:** Stores user profiles and assigned business roles.
- **Product:** Stores product details, prices, quantities and supplier associations.
- **Supplier:** Stores supplier information and contact details.
- **StockMovement:** Maintains a historical record of incoming and outgoing stock transactions.

Database relationships, constraints and Row-Level Security policies ensure that inventory records remain associated with the correct business.

---

## Design Direction

ShelfWise follows a clean, professional and practical design approach.

| Design Element | Colour / Specification |
|---|---|
| Primary | Deep Navy `#17324D` |
| Secondary | Teal `#16A6A1` |
| Background | Light Gray `#F5F7FA` |
| Main Text | `#17212B` |
| Typography | Inter |
| Icons | Lucide |

The application is designed as a responsive web platform, supporting desktop, tablet and mobile browser experiences.

---

## Security and Data Protection

Security is an important part of ShelfWise's development.

The application aims to implement:

- Supabase Authentication for account management.
- Email verification during registration.
- PostgreSQL Row-Level Security (RLS).
- Business-level data isolation.
- Role-based permissions.
- Frontend and backend input validation.
- Secure environment variable management.
- Protection of sensitive credentials and API keys.
- HTTPS for deployed application traffic.

Stock movements are maintained as historical audit records to preserve inventory activity.

---

## Testing and Quality Assurance

The project uses automated testing and continuous integration to improve reliability.

Testing will cover:

- Product creation, editing and search.
- Duplicate SKU validation.
- Incoming and outgoing stock movements.
- Insufficient stock validation.
- Low-stock threshold calculations.
- Supplier management.
- Dashboard calculations.
- Authentication and user permissions.
- Cross-business data isolation.
- Responsive layouts.
- Loading, empty, error and offline states.

GitHub Actions will automate relevant checks during development and pull request reviews.

---

## Development Workflow

ShelfWise follows a structured software development process:

1. Product Requirements Document (PRD).
2. UI/UX design using Google Stitch.
3. Implementation plan (MASTER.md).
4. Feature development.
5. Automated and manual testing.
6. Code reviews and pull requests.
7. Continuous Integration.
8. Deployment and final verification.

Team members are expected to contribute through individual GitHub branches, commits, issues and reviewed pull requests.

---

## Future Enhancements

The following features may be considered after the initial release:

- CSV import and export.
- Product images.
- Barcode scanning.
- Advanced inventory reports.
- Additional inventory analytics.

These enhancements are outside the initial MVP scope.

---

## Getting Started

### Prerequisites

- Node.js 24 LTS or newer.
- npm.
- Git.
- Docker Desktop.

### 1. Install dependencies

```powershell
npm install
```

### 2. Start local Supabase

```powershell
npx supabase start
```

Copy `.env.example` to `.env`, then set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` using the local values printed by `npx supabase status`.

```powershell
Copy-Item .env.example .env
```

### 3. Apply the database migration

```powershell
npx supabase db reset
```

### 4. Create a local owner account

Create an owner account at `http://127.0.0.1:5173/signup`. The signup form sends `full_name` and `business_name` as Supabase Auth metadata; the database trigger creates the business and owner profile. With the local stack running, confirmation emails can be opened in Inbucket at `http://127.0.0.1:54324`.

### 5. Run the app

```powershell
npm run dev
```

Open `http://127.0.0.1:5173/signup` to create an account, or `/login` to sign in. If email confirmation is enabled, confirm the signup from Inbucket. Product management is available to signed-in business owners.

For a development-only S4 Add screen preview without Supabase, open `http://127.0.0.1:5173/preview/s4`. It uses sample values and never saves changes; this route is not included in production builds.

### 6. Run tests and checks

```powershell
npm test
npm run check
```

### Production deployment prerequisites

- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Vercel environment variables, then redeploy.
- Apply `supabase/migrations/20261112180000_s4_product_foundation.sql` to the production Supabase project.
- Set the Supabase Auth Site URL and allowed redirect URLs to the deployed app URL.

Never commit `.env`, real API keys, passwords, or a Supabase service-role key. Only placeholders belong in `.env.example`.

---

## Project Team

**Product Owner**

Thandokuhle Maphanga — [@Thandokuhle18](https://github.com/Thandokuhle18)

**Tech Lead & Backend Developer**

Noluthando Molui — [@noluMolui](https://github.com/noluMolui)

**Designer & Frontend Developer**

Qiyaam Moodley — [@qiyaammoodley-droid](https://github.com/qiyaammoodley-droid)

**Frontend Developer**

Tswarelo Madonsela — [@Tshwarelo-gif](https://github.com/Tshwarelo-gif)

**QA Lead & DevOps**

Nyiko Vumani — [@nyikogivenvumani-web](https://github.com/nyikogivenvumani-web)

---

## Project Information

| Detail | Information |
|---|---|
| Project Name | ShelfWise |
| Project Type | Full-Stack Web Application |
| Course | AI Software Developer |
| Facilitator | Mnelisi Maswanganyi |
| Repository | [GitHub – ShelfWise](https://github.com/noluMolui/Shelfwise.git) |
|stitch link| | https://stitch.google.com/projects/5614692859162487904 |
| Deployment | Vercel |
| Database | Supabase PostgreSQL |
| Initial Release | MVP |

---

## Project Status

**Current Stage:** Initial Development

ShelfWise is being developed as a collaborative software engineering project, with a focus on delivering a functional, secure and well-tested inventory management platform.

The initial release prioritises the essential inventory management workflows before introducing additional functionality.

---

*Built collaboratively by the ShelfWise development team.*
