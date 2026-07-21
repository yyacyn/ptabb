# Technical Proposal: PT. ABB Website v2.0 Rebuild
### From Legacy PHP to Laravel + Inertia.js + React

| Field | Value |
|---|---|
| **Prepared By** | Fauzy (IT Intern) |
| **Date** | July 21, 2026 |
| **For** | [Mentor Name], IT Department |
| **Document Type** | Internal Technical Proposal |

---

## Executive Summary

The current PT. ABB corporate website has been successfully serving its purpose — it works, it's live, and it gets the job done. **This proposal does not argue that the website is broken.** Instead, it argues that rebuilding it with a modern architecture will deliver **measurable improvements** in performance, maintainability, security, and developer productivity — while providing a structured, high-value learning project for the internship period.

---

## 1. Current State Assessment

### What Works Well ✅

- **Functional:** All pages render correctly, CRUD operations work, chatbot responds.
- **Database Design:** Well-normalized MySQL schema with proper foreign keys and indexes.
- **Content Management:** Admin panel covers fleet, news, careers, clients, and notifications.
- **AI Integration:** RAG chatbot with triple-layer fallback is a genuine differentiator.

### Where It Falls Short ⚠️

| Area | Current Issue | Business Impact |
|---|---|---|
| **Architecture** | No framework, no MVC separation. Each PHP file is simultaneously a controller, a view, and a router. | Any new developer joining the team needs hours to understand the flow. Changes to shared logic risk breaking unrelated pages. |
| **Code Duplication** | Database connection, session checks, and path resolution are copy-pasted across 20+ files. | A single security fix (e.g., session hardening) must be applied in 20+ places manually. |
| **Frontend** | Raw HTML with inline `<style>` and `<script>` blocks. No component reuse. | Adding a new page means copying 200+ lines of boilerplate. The chatbot widget alone is 780 lines embedded in `footer.php`. |
| **API Design** | 3 ad-hoc endpoints with no standardized request/response format, no versioning, no rate limiting. | Cannot safely expose APIs to third-party integrations or mobile apps. |
| **Security** | No CSRF protection on any form. No rate limiting. Error display enabled. DB credentials hardcoded. | Vulnerable to cross-site request forgery attacks. A single exposed error message could leak internal paths. |
| **Testing** | Zero automated tests. | Every change requires manual browser testing across all pages. No regression safety net. |
| **SEO & Performance** | Full page reloads on every navigation. No lazy loading, no image optimization, no caching headers. | Slower perceived performance, higher bounce rates, lower Google ranking potential. |

### Technical Debt Inventory

```
File                          Lines    Concern
─────────────────────────────────────────────────────────
admin/manage-fleet.php         44,057   Monolithic file handling UI + CRUD + validation
admin/dashboard.php            26,623   Mixed concerns: stats, popups, toggle logic
includes/footer.php            787      Contains entire chatbot (HTML + CSS + JS)
admin/manage-news.php          27,299   Embedded CKEditor config + upload logic
pages/fleet.php                746      Leaflet init + ship cards + modals in one file
─────────────────────────────────────────────────────────
Total admin code:              ~180K    Difficult to audit, test, or extend
```

---

## 2. Proposed Architecture: v2.0

### Stack Recommendation

| Layer | Current (v1) | Proposed (v2) | Why |
|---|---|---|---|
| **Backend** | Vanilla PHP (page-controller) | **Laravel 13** | MVC framework with routing, middleware, Eloquent ORM, validation, CSRF — all built-in. Same PHP language as legacy, minimal learning curve for the team. |
| **Frontend** | Vanilla PHP + HTML + inline JS | **React 18** via **Inertia.js v2** | Component-based UI with SPA-like navigation. Inertia eliminates the need for a separate API layer — React pages receive props directly from Laravel controllers. |
| **Styling** | Inline CSS, raw HTML | **Tailwind CSS v3** with `@tailwindcss/forms` | Utility-first CSS framework. Consistent design tokens, responsive by default, no custom CSS files to maintain. |
| **Database** | Raw PDO queries | **Eloquent ORM** with migrations | Migration-based schema versioning, model relationships, query builder. Database schema becomes version-controlled alongside code. |
| **Auth** | Manual session + bcrypt | **Laravel Breeze** (Inertia/React scaffold) + **Sanctum** | Username-based authentication with CSRF protection, session management, and rate limiting out-of-the-box. RBAC via `role` enum on users table. |
| **Build Tools** | None (raw PHP includes) | **Vite 8** + `laravel-vite-plugin` | Hot module replacement (HMR) during development, optimized production bundles with code splitting. |
| **Testing** | None | **PHPUnit** | Automated test suite covering authentication, registration, profile management, and page rendering. |
| **Admin Panel** | Custom PHP pages (~180K lines) | **Inertia/React pages** with RBAC middleware | Role-gated CRUD operations replacing the legacy monolithic admin. |

### Why Inertia.js Instead of a Separate SPA + API?

A separate SPA (e.g., Next.js) with a Laravel API backend was considered but rejected in favor of Inertia.js for the following reasons:

1. **No API to build or maintain.** Controllers return Inertia responses directly — no JSON serialization, no API versioning, no CORS configuration.
2. **Server-side routing.** Routes, middleware, and authorization live in Laravel where they belong. No client-side router duplication.
3. **Simpler deployment.** Single application, single server, single deploy. No separate frontend hosting or build pipeline.
4. **Full Laravel ecosystem.** Form requests, policies, middleware, and Eloquent all work naturally with Inertia — no adapter layer needed.

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    BROWSER (Client)                       │
│                                                          │
│   React Components (JSX)                                 │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│   │ Welcome  │ │ Fleet    │ │ Careers  │ │ Admin     │  │
│   │ Page     │ │ Page     │ │ Page     │ │ Dashboard │  │
│   └────┬─────┘ └────┬─────┘ └────┬─────┘ └─────┬─────┘  │
│        └─────────────┴───────────┴──────────────┘        │
│                          │                                │
│              Inertia.js (XHR, no full reload)             │
└──────────────────────────┬───────────────────────────────┘
                           │
┌──────────────────────────┴───────────────────────────────┐
│                   LARAVEL 13 (Server)                     │
│                                                          │
│   Middleware Stack:                                       │
│   HandleInertiaRequests → CSRF → Auth → RateLimit        │
│                                                          │
│   ┌────────────────┐  ┌────────────────┐                 │
│   │  Controllers   │  │  Form Requests │                 │
│   │  (Inertia      │  │  (Validation)  │                 │
│   │   responses)   │  │                │                 │
│   └───────┬────────┘  └────────────────┘                 │
│           │                                              │
│   ┌───────┴────────┐  ┌────────────────┐                 │
│   │  Eloquent ORM  │  │  Policies /    │                 │
│   │  (Models)      │  │  RBAC Guards   │                 │
│   └───────┬────────┘  └────────────────┘                 │
└───────────┼──────────────────────────────────────────────┘
            │
┌───────────┴──────────────────────────────────────────────┐
│                    MySQL Database                         │
│                                                          │
│   users · fleets · fleet_categories · careers · news     │
│   news_categories · clients · contacts · contact_info    │
│   notifications · pages · page_views · settings          │
│   visitor_analytics · voyage_waypoints                   │
│                                                          │
│   17 migrations — fully version-controlled               │
└──────────────────────────────────────────────────────────┘
```

---

## 3. What the Rebuild Achieves (Business Value)

### 3.1 For the Company

| Benefit | Explanation |
|---|---|
| **Faster feature delivery** | Adding a new page: create 1 controller method + 1 React component. Current system: copy 200+ lines of boilerplate, manually wire paths, duplicate session checks. |
| **Stronger security posture** | Laravel provides CSRF, XSS, and SQL injection protection by default. The current system relies on developer discipline for every single query. |
| **Mobile-ready API** | While Inertia handles the web frontend, Laravel's architecture makes it trivial to add API routes for a future mobile app without rewriting anything. |
| **Testability** | PHPUnit test suite catches regressions before deployment. No more manual browser testing for core flows. |
| **Easier onboarding** | A new developer can understand Laravel's MVC convention in a day. Understanding 16 custom admin PHP files takes a week. |

### 3.2 For the Intern (Me)

| Benefit | Explanation |
|---|---|
| **Structured learning** | Building with a framework teaches industry-standard patterns (MVC, middleware, ORM, migrations) that are directly transferable to any future job. |
| **Portfolio value** | "Rebuilt a corporate maritime website from vanilla PHP to Laravel + React" is significantly more impressive on a resume than "maintained existing PHP pages." |
| **Productive use of internship time** | Rather than waiting for small bug reports, I would have a continuous, high-impact project with clear milestones. |

---

## 4. Security Improvements (v1 → v2)

| Threat | Current (v1) | Proposed (v2) |
|---|---|---|
| **CSRF** | ❌ No protection on any form | ✅ Automatic CSRF tokens via Laravel middleware |
| **SQL Injection** | ⚠️ Manual escaping, inconsistent | ✅ Eloquent parameterized queries by default |
| **XSS** | ⚠️ Manual `htmlspecialchars()` | ✅ React auto-escapes output. Blade `{{ }}` escapes server-side. |
| **Auth Brute Force** | ❌ No rate limiting | ✅ `RateLimiter` with 5-attempt lockout per username+IP |
| **Session Fixation** | ⚠️ Manual session regeneration | ✅ Automatic session regeneration on login |
| **Credential Storage** | ❌ Hardcoded in PHP files | ✅ `.env` file excluded from version control |
| **Error Disclosure** | ❌ Full stack traces in production | ✅ `APP_DEBUG=false` in production, structured error logging |

---

## 5. Migration Strategy (Zero Downtime)

The rebuild does **not** require taking the current site offline. Both systems run in parallel on the same MySQL database.

### Phase 1: Foundation (Weeks 1–2)
- Scaffold Laravel 13 project with Inertia.js + React + Tailwind CSS
- Create Eloquent migrations for all 15+ tables from legacy schema
- Build seeders to reproduce production data
- Set up username-based authentication with RBAC roles (`super_admin`, `hr_admin`, `crew_admin`, `pr_admin`)
- Establish PHPUnit test suite for auth and registration flows

### Phase 2: Public Pages (Weeks 3–5)
- Rebuild public pages as React components: Welcome, Fleet, News, Careers, Clients, Contact
- Implement Leaflet-based voyage map for fleet detail pages
- Add SEO meta tags and structured data
- Optimize images and implement lazy loading

### Phase 3: Admin Panel (Weeks 5–7)
- Build RBAC-gated admin dashboard with role-based navigation
- Implement CRUD for: Fleets, News, Careers, Clients, Notifications, Settings
- Add form validation via Laravel Form Requests
- Deprecate legacy admin panel

### Phase 4: AI Chatbot v2 (Week 8+)
- Extract chatbot into a dedicated service module
- Add conversation history (multi-turn context)
- Prepare vector search infrastructure for Advanced RAG

```
Week  1   2   3   4   5   6   7   8
      ├───┴───┤
      Foundation & Auth
                ├───┴───┴───┤
                Public Pages
                            ├───┴───┤
                            Admin Panel
                                    ├──▶
                                    Chatbot v2
```

### Key Design Decisions

1. **Monolith over microservices.** A single Laravel app is simpler to deploy, debug, and maintain for a small team.
2. **Username over email for auth.** Legacy system uses usernames. Migration preserves existing admin credentials.
3. **Tailwind over custom CSS.** Consistent design system without maintaining separate stylesheets.
4. **Seeder-based data migration.** All legacy production data captured in `DatabaseSeeder.php` for reproducible deployments.

---

## 6. Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Rebuild takes longer than internship period | Medium | Phase 1 (Foundation) alone is a complete, demonstrable deliverable. Each phase is independently valuable. |
| Mentor unfamiliar with proposed stack | Low | Laravel is PHP — same language, same MySQL. Inertia.js is a thin layer, not a paradigm shift. |
| Current site breaks during migration | Very Low | Zero-downtime strategy: both systems run in parallel on the same database. |
| Over-engineering for a corporate website | Low | The proposal uses mainstream, well-documented frameworks — not experimental tech. These are industry defaults. |

---

## 7. What If the Answer Is "No"?

Even if a full rebuild is not approved, the research behind this proposal identifies **incremental improvements** that can be applied to the current codebase:

1. **Extract chatbot into a standalone JS/PHP module** (decouple from `footer.php`)
2. **Add CSRF tokens** to all admin forms
3. **Move DB credentials to `.env`** (already partially done)
4. **Create a simple router** to centralize path resolution
5. **Add basic API versioning** (`/api/v1/chat.php`)

These are all achievable within the current architecture and would still constitute meaningful intern contributions.

---

## 8. Summary

| Question | Answer |
|---|---|
| Is the current site broken? | **No.** It works. |
| Could it be significantly better? | **Yes.** In security, maintainability, performance, and developer experience. |
| What stack is proposed? | **Laravel 13 + Inertia.js v2 + React 18 + Tailwind CSS v3 + Vite 8** |
| Is a rebuild risky? | **No.** Parallel migration with zero downtime. Each phase is independently deployable. |
| What's the intern's ask? | **Approval to start Phase 1** (Foundation & Auth) as a structured project for the remaining internship period. |

> *"The best time to modernize a codebase is before it becomes too expensive to maintain."*

---

