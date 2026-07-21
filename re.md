# Technical Proposal: PT. ABB Website v2.0 Rebuild
### From Legacy PHP to a Modern Full-Stack Architecture

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
Let's be honest about what the current system does right:

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
| **Frontend** | Vanilla PHP + HTML + inline JS | **Next.js (React)** or **Nuxt.js (Vue)** | Component-based UI, SSR for SEO, automatic code splitting |
| **Backend** | Vanilla PHP (page-controller) | **Laravel** (PHP) or **Express.js** (Node) | MVC framework with routing, middleware, ORM, validation, CSRF |
| **Database** | Raw PDO queries | **Eloquent ORM** (Laravel) or **Prisma** (Node) | Migration-based schema management, query builder, relationships |
| **AI Chatbot** | Inline PHP with cURL | **Dedicated service module** with queue support | Isolated, testable, extensible (easy to add vector search later) |
| **Auth** | Manual session + bcrypt | **Laravel Sanctum** or **NextAuth.js** | Token-based auth, CSRF out-of-the-box, role middleware |
| **Admin Panel** | Custom PHP pages | **Filament** (Laravel) or **AdminJS** | Auto-generated CRUD, built-in role management, audit logs |

### Architecture Diagram

```
                    ┌─────────────────────────────────┐
                    │         FRONTEND (SPA/SSR)       │
                    │   React.js                       │
                    │   ┌──────┐ ┌──────┐ ┌────────┐  │
                    │   │Fleet │ │News  │ │Careers │  │
                    │   │Page  │ │Page  │ │Page    │  │
                    │   └──┬───┘ └──┬───┘ └───┬────┘  │
                    └──────┼────────┼─────────┼───────┘
                           │        │         │
                           ▼        ▼         ▼
                    ┌─────────────────────────────────┐
                    │       REST / GraphQL API          │
                    │   Laravel / Express.js            │
                    │                                   │
                    │   Middleware: Auth, CSRF, Rate     │
                    │   Limiting, Logging, Validation   │
                    │                                   │
                    │   ┌──────────┐  ┌──────────────┐  │
                    │   │ RAG Chat │  │ Admin CRUD   │  │
                    │   │ Service  │  │ Controllers  │  │
                    │   └────┬─────┘  └──────┬───────┘  │
                    └────────┼───────────────┼─────────┘
                             │               │
                    ┌────────┼───────────────┼─────────┐
                    │        ▼               ▼         │
                    │   ┌─────────┐   ┌───────────┐    │
                    │   │ MySQL   │   │ OpenRouter │    │
                    │   │ (ORM)   │   │ LLM API   │    │
                    │   └─────────┘   └───────────┘    │
                    └──────────────────────────────────┘
```

---

## 3. What the Rebuild Achieves (Business Value)

### 3.1 For the Company

| Benefit | Explanation |
|---|---|
| **Faster feature delivery** | Adding a new page in Next.js: create 1 component file. Current system: copy 200+ lines of boilerplate, manually wire paths, duplicate session checks. |
| **Stronger security posture** | Frameworks provide CSRF, XSS, and SQL injection protection by default. The current system relies on developer discipline for every single query. |
| **Mobile-ready API** | A proper REST API means a future mobile app can consume the same backend without rewriting anything. |
| **SEO performance** | Server-side rendering (SSR) ensures Google can index dynamic content (fleet details, news articles) that client-side JS currently hides. |
| **Easier onboarding** | A new developer can understand Laravel's MVC convention in a day. Understanding 16 custom admin PHP files takes a week. |

### 3.2 For the Intern (Me)

| Benefit | Explanation |
|---|---|
| **Structured learning** | Building with a framework teaches industry-standard patterns (MVC, middleware, ORM, migrations) that are directly transferable to any future job. |
| **Portfolio value** | "Rebuilt a corporate website from vanilla PHP to Laravel/Next.js" is significantly more impressive on a resume than "maintained existing PHP pages." |
| **Productive use of internship time** | Rather than waiting for small bug reports, I would have a continuous, high-impact project with clear milestones. |

---

## 4. Migration Strategy (Zero Downtime)

The rebuild does **not** require taking the current site offline. The strategy is:

### Phase 1: Backend API (Weeks 1-3)
- Set up Laravel/Express project alongside existing code
- Create API endpoints that read from the **same MySQL database**
- Both old site and new API coexist, sharing the same data

### Phase 2: Frontend Pages (Weeks 3-6)
- Rebuild public pages one-by-one in Next.js/Nuxt.js
- Each page can be deployed independently via reverse proxy routing
- Old pages remain live until their replacement is verified

### Phase 3: Admin Panel (Weeks 6-8)
- Rebuild admin using Filament (Laravel) or a React admin framework
- Migrate admin users to new auth system
- Deprecate old admin panel

### Phase 4: AI Chatbot v2 (Week 8+)
- Extract chatbot into a dedicated service module
- Add conversation history (multi-turn context)
- Prepare vector search infrastructure for Advanced RAG

```
Week  1   2   3   4   5   6   7   8
      ├───┴───┴───┤
      Backend API
                  ├───┴───┴───┤
                  Frontend Pages
                              ├───┴───┤
                              Admin Panel
                                      ├──▶
                                      Chatbot v2
```

---

## 5. Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Rebuild takes longer than internship period | Medium | Phase 1 (API) alone is a complete, demonstrable deliverable. Each phase is independently valuable. |
| Mentor unfamiliar with proposed stack | Low | Laravel is PHP — same language, same MySQL. The learning curve is minimal for a PHP developer. |
| Current site breaks during migration | Very Low | Zero-downtime strategy: both systems run in parallel on the same database. |
| Over-engineering for a corporate website | Low | The proposal uses mainstream, well-documented frameworks — not experimental tech. These are industry defaults. |

---

## 6. What If the Answer Is "No"?

Even if a full rebuild is not approved, the research behind this proposal identifies **incremental improvements** that can be applied to the current codebase:

1. **Extract chatbot into a standalone JS/PHP module** (decouple from `footer.php`)
2. **Add CSRF tokens** to all admin forms
3. **Move DB credentials to `.env`** (already partially done)
4. **Create a simple router** to centralize path resolution
5. **Add basic API versioning** (`/api/v1/chat.php`)

These are all achievable within the current architecture and would still constitute meaningful intern contributions.

---

## 7. Summary

| Question | Answer |
|---|---|
| Is the current site broken? | **No.** It works. |
| Could it be significantly better? | **Yes.** In security, maintainability, performance, and developer experience. |
| Is a rebuild risky? | **No.** Parallel migration with zero downtime. Each phase is independently deployable. |
| What's the intern's ask? | **Approval to start Phase 1** (Backend API in Laravel/Express) as a structured project for the remaining internship period. |

> *"The best time to modernize a codebase is before it becomes too expensive to maintain."*

---

**Next Step:** If this proposal is of interest, I can prepare a detailed technical specification for Phase 1 (Backend API) within 2 working days, including endpoint contracts, database migration scripts, and a testing plan.
