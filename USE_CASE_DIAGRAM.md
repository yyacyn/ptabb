# PT ABB Company Profile & Dashboard — Use Case Diagram

This document contains the official UML Use Case Diagram for the PT. ABB Website v2.0 application and Dashboard system.

## Use Case Diagram

```mermaid
flowchart LR
    classDef guestStyle fill:#3b82f6,color:#fff,stroke:#1d4ed8,stroke-width:2px;
    classDef hrStyle fill:#10b981,color:#fff,stroke:#047857,stroke-width:2px;
    classDef superStyle fill:#8b5cf6,color:#fff,stroke:#6d28d9,stroke-width:2px;
    classDef crewStyle fill:#ec4899,color:#fff,stroke:#be185d,stroke-width:2px;
    classDef prStyle fill:#f97316,color:#fff,stroke:#c2410c,stroke-width:2px;
    classDef ucStyle fill:#ffffff,stroke:#3b82f6,stroke-width:2px,color:#1e293b;

    subgraph System["PT ABB Company Profile & Dashboard"]
        style System fill:#dbeafe,stroke:#3b82f6,stroke-width:2px,color:#1e3a8a

        %% Guest Use Cases (Public Site)
        UC_Careers(["Browse careers"]):::ucStyle
        UC_Chatbot(["Use chatbot"]):::ucStyle
        UC_Fleet(["Browse fleet"]):::ucStyle
        UC_Contact(["Submit contact form"]):::ucStyle
        UC_Profile(["Browse company profile"]):::ucStyle

        %% Authentication Use Case
        UC_Login(["Login"]):::ucStyle

        %% Admin Use Cases
        UC_CorpJobs(["Manage Corporate Jobs (Darat)"]):::ucStyle
        UC_Popups(["Manage Sitewide Pop-ups & Warnings"]):::ucStyle
        UC_Users(["Manage system users"]):::ucStyle
        UC_Clients(["Manage clients & partners"]):::ucStyle
        UC_FleetSpecs(["Manage Fleet specs & Voyage data"]):::ucStyle
        UC_CrewJobs(["Manage Vessel Crew Jobs (Laut)"]):::ucStyle
        UC_News(["Manage News & Press Releases"]):::ucStyle

        %% Include Relationships to Login
        UC_CorpJobs -.->|include| UC_Login
        UC_Popups -.->|include| UC_Login
        UC_Users -.->|include| UC_Login
        UC_Clients -.->|include| UC_Login
        UC_FleetSpecs -.->|include| UC_Login
        UC_CrewJobs -.->|include| UC_Login
        UC_News -.->|include| UC_Login
    end

    %% Actors Left
    Guest["👤 Guest"]:::guestStyle

    %% Actors Right
    HRAdmin["👤 HR Admin"]:::hrStyle
    SuperAdmin["👤 Super Admin"]:::superStyle
    CrewAdmin["👤 Crew Admin"]:::crewStyle
    PRAdmin["👤 PR Admin"]:::prStyle

    %% Connections - Guest
    Guest --- UC_Careers
    Guest --- UC_Chatbot
    Guest --- UC_Fleet
    Guest --- UC_Contact
    Guest --- UC_Profile

    %% Connections - HR Admin
    HRAdmin --- UC_CorpJobs
    HRAdmin --- UC_Popups
    HRAdmin --- UC_Login

    %% Connections - Super Admin
    SuperAdmin --- UC_Users
    SuperAdmin --- UC_Clients
    SuperAdmin --- UC_FleetSpecs
    SuperAdmin --- UC_Popups
    SuperAdmin --- UC_CorpJobs
    SuperAdmin --- UC_CrewJobs
    SuperAdmin --- UC_News
    SuperAdmin --- UC_Login

    %% Connections - Crew Admin
    CrewAdmin --- UC_CrewJobs
    CrewAdmin --- UC_Login

    %% Connections - PR Admin
    PRAdmin --- UC_News
    PRAdmin --- UC_Clients
    PRAdmin --- UC_Login
```

---

## Specification Summary Table

| Actor | Role / Scope | Primary Use Cases | Included Dependencies |
|---|---|---|---|
| **Guest** | Unauthenticated Public Visitor | Browse careers, Use chatbot, Browse fleet, Submit contact form, Browse company profile | None |
| **HR Admin** | Human Resources Admin | Manage Corporate Jobs (Darat), Manage Sitewide Pop-ups & Warnings | Include `Login` |
| **Crew Admin** | Maritime Crew Admin | Manage Vessel Crew Jobs (Laut) | Include `Login` |
| **PR Admin** | Public Relations Admin | Manage News & Press Releases, Manage clients & partners | Include `Login` |
| **Super Admin** | Full System Administrator | Manage system users, Manage Fleet specs & Voyage data, Manage clients & partners, Sitewide pop-ups, Corporate & Crew jobs, News | Include `Login` |

---

## Key Business Rules Mapping (`BR-01` to `BR-06`)

1. **`BR-01` (Role-Based Access Control)**: Enforced across all admin use cases (`Manage Users`, `Manage Corporate Jobs`, `Manage Vessel Crew Jobs`, `Manage News`, `Manage Fleet`).
2. **`BR-02` (IMO Uniqueness)**: Enforced inside `Manage Fleet specs & Voyage data`.
3. **`BR-03` (News Slug Generation)**: Enforced inside `Manage News & Press Releases`.
4. **`BR-04` (Department Message Scoping)**: HRD messages filtered from Crew & PR admins inside `Submit contact form` / Dashboard inbox review.
5. **`BR-05` (AI Chatbot Fallback)**: Enforced in `Use chatbot`.
6. **`BR-06` (Active Popup Limit)**: Max 1 active popup per type enforced in `Manage Sitewide Pop-ups & Warnings`.
