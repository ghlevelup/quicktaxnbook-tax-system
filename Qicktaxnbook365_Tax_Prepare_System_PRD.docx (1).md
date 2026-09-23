# **Qicktaxnbook365 Tax Prepare System \- Product Requirements Document (PRD) and TimeLine** 

Product Requirements Document

## **1\. Summary**

The Tax Office Platform is a **centralized tax practice management system** . Every client, every tax year, every document, every conversation, and every signature lives inside a single **Case/Ticket**, not inside an individual preparer's inbox.

### **2\. Goals**

* One central case per client per tax year \- nothing lives in personal accounts.  
* Give clients a self-serve portal: upload docs, track status, review drafts, ask questions, approve, e-sign.  
* Give preparers a single workspace: pipeline, tasks, documents, messaging, e-sign requests.  
* Give admins full visibility: workload, bottlenecks, audit trail, branding, billing.  
* Support **seamless reassignment** of a case to a new preparer with zero data loss.  
* Support **multi-year history** per client (2024, 2025, 2026 returns all linked to one client, each its own case).  
* White-label so each firm's clients only ever see the firm's brand.

## **3\. Roles Overview**

| Role | Who | Primary Surface |
| :---- | :---- | :---- |
| **Client** | The taxpayer (individual or business) | Client Portal (web \+ mobile-responsive) |
| **Team (Preparer/Staff)** | Preparers, reviewers, support staff | Team Workspace |
| **Admin** | Firm owner / office manager | Admin Dashboard |

A single person can hold Team \+ Admin roles (e.g., owner who also prepares returns).

## **4\. The Pipeline (Case Lifecycle)**

Every case moves through one standard pipeline. Admins can customize stage names/automations per firm.

**Diagram reference:** [https://markdownviewer.pages.dev/api/image/3qI815JsLExgLs4YRCCy82EQ](https://markdownviewer.pages.dev/api/image/3qI815JsLExgLs4YRCCy82EQ)

Each stage change is timestamped and logged in the audit trail, and is visible to Admin in real time (who is where, who owns the next action, what's overdue).

## **5\. Client Journey (End-to-End Flow)**

**Diagram reference:** [https://markdownviewer.pages.dev/api/image/4nfaDitRcIh8CAqFxkAeyUoZ](https://markdownviewer.pages.dev/api/image/4nfaDitRcIh8CAqFxkAeyUoZ)

**Client Portal capabilities (recap):**

* Passwordless login (email or phone \+ OTP)  
* Branded onboarding (new) / verified portal link (returning)  
* Dashboard: status per tax year \+ missing-item count  
* Upload/download documents (with notes)  
* View required-document checklist  
* View current task/status  
* View draft return  
* Message the preparer (thread attached to the case)  
* Client user will can access multiple entittes  
* Approve draft return  
* E-sign engagement letter \+ Form 8879 (joint/spouse shared session)  
* Pay invoices (Stripe)  
* Book appointments  
* View full communication/document history across all years

## **6\. Team (Preparer/Staff) Journey**

**Diagram reference:** [https://markdownviewer.pages.dev/api/image/J7wFAhA8MtpYdzVx2sraND0G](https://markdownviewer.pages.dev/api/image/J7wFAhA8MtpYdzVx2sraND0G)

**Team capabilities (recap):**

* Individual login  
* "My Clients" / workload dashboard  
* Document review (mark received/missing, request more)  
* Send e-sign requests (8879, engagement letter, extra docs)  
* Book appointments on client's behalf; view team calendar  
* Handle Voice-AI-captured follow-ups  
* Move cases through pipeline (signing auto-advances stage)  
* Task lists from templates, per engagement  
* Message clients from the client record (visible to whole team, not personal inbox)  
* Upload final return, mark final, auto-extract key figures (AGI, CTC, EIC, QBI)

## **7\. Admin Journey**

**Diagram reference:** [https://markdownviewer.pages.dev/api/image/iRxVRCDeKG4LXdg\_ZOdnCgOU](https://markdownviewer.pages.dev/api/image/iRxVRCDeKG4LXdg_ZOdnCgOU)

**Admin capabilities (recap):**

* Team management (invite, assign roles, deactivate; unlimited seats)  
* White-label branding (logo, colors, domain, sender email)  
* Bulk client import with validation  
* Document-request templates \+ automatic reminders  
* Payments setup (Stripe connect, invoicing, auto follow-up)  
* Scheduled reporting (firm snapshots)  
* Workload & health view (capacity per preparer, overdue/stuck files)  
* Voice AI settings (greeting, hours, languages, escalation rules, call logs)  
* Full audit log  
* Pipeline stage/automation configuration \+ templates  
* Email/SMS templates \+ usage dashboard  
* **Reassignment**: transfer a case (and 100% of its history) from one preparer to another instantly

## **8\. Critical Cross-Cutting Flow \- Reassignment (No Data Loss)**

This is the client's \#1 stated requirement, so it gets its own diagram.

**Diagram reference:** [https://markdownviewer.pages.dev/api/image/NpxHZh2Nfzvlb-8Oq0u8nj9B](https://markdownviewer.pages.dev/api/image/NpxHZh2Nfzvlb-8Oq0u8nj9B)

Nothing is deleted or hidden \- reassignment only changes the **owner pointer**; every document, message, task, draft, and signature stays attached to the case forever.

## **11\. Functional Requirements**

### **11.1 Authentication & Access**

* FR-1: Passwordless OTP login (email or SMS) for clients.  
* FR-2: Email/password \+ mandatory MFA (TOTP or SMS) for Team/Admin.  
* FR-3: Role-based access control (RBAC): Client sees only own cases; Team sees only assigned cases (+ shared visibility settings); Admin sees everything in the firm.  
* FR-4: Firm-level data isolation (multi-tenant) \- Firm A can never see Firm B's data.

### **11.2 Case & Pipeline**

* FR-5: Create a Case automatically when a new tax year starts for an existing client, or manually for a new client.  
* FR-6: Configurable pipeline stages per firm, with default template pre-loaded.  
* FR-7: Stage transitions can be manual (drag/drop or button) or automatic (e.g., signature completion auto-advances stage).  
* FR-8: Reassignment of a Case to a different preparer preserves all linked data and logs the change.

### **11.3 Documents**

* FR-9: Client can upload documents against specific document-request line items.  
* FR-10: Team can mark each requested document as Received/Missing and message the client about it.  
* FR-11: Version history retained for re-uploaded/replaced documents.  
* FR-12: Documents stored encrypted at rest; download links expire/are access-controlled.

### **11.4 Communication**

* FR-13: Every message thread is bound to a Case (not a personal inbox); visible to all Team members with case access.  
* FR-14: Email \+ SMS notifications for key events (doc requested, draft ready, signature needed, invoice due).

### **11.5 Draft Review & Approval**

* FR-16: Preparer uploads a Draft Return file to the Case; client is notified.  
* FR-17: Client can view the draft in-portal, request changes (with comments), or approve.  
* FR-18: Once approved, system triggers the e-signature request automatically.

### **11.6 E-Signature**

* FR-19: Support Form 8879 and Engagement Letter e-signing, including joint/spouse shared signing session.  
* FR-20: Signed documents stored in the Case permanently, with a certificate/audit trail (IP, timestamp, signer identity).  
* FR-21: Signature completion auto-advances the pipeline stage.

### **11.7 Payments**

* FR-22: Admin connects the firm's Stripe account (Stripe Connect).  
* FR-23: Admin/Team creates invoices per Case; client pays in-portal.  
* FR-24: Automatic payment reminders for unpaid invoices.  
* FR-25: Payment status visible on the Case and in Admin reporting.

### **11.8 Reporting & Admin Tools**

* FR-26: Workload view \- cases per preparer, overdue items, stuck stages.  
* FR-27: Scheduled firm-level reports (e.g., weekly digest).  
* FR-28: Full audit log: who accessed/edited what, when.  
* FR-29: Bulk client import (CSV) with column mapping \+ validation errors surfaced before commit.  
* FR-30: Document-request and task templates, reusable across cases.

### **11.9 Final Filing**

* FR-31: Preparer uploads final accepted/e-filed return; marks Case Final.  
* FR-32: System auto-extracts key figures (AGI, CTC, EIC, QBI) from the final return for reporting (via OCR/parsing).

## **13\. Payments \- How Money Is Received**

* **Processor:** Stripe (Stripe Connect \- Standard or Express accounts), so each firm has its **own** Stripe account and receives payouts directly; the platform never custodies client funds.  
* **Flow:** Admin connects Stripe (OAuth) → Team/Admin creates an Invoice on a Case → client sees "Pay Now" in the portal → Stripe Checkout/Payment Element handles card/ACH → webhook (payment\_intent.succeeded) updates Invoice \+ Case status → receipt emailed automatically.  
* **Fees:** Platform can optionally take an application fee per transaction via Stripe Connect's application\_fee\_amount (for SaaS monetization) \- decide model (flat SaaS subscription vs. take-rate) before build.  
* **Methods supported:** Card, ACH/bank debit (via Stripe ACH), optionally Apple Pay/Google Pay through Stripe's Payment Element.  
* **No PCI burden on us:** Stripe Elements/Checkout keeps raw card data off our servers entirely (SAQ-A scope only).

A **Case** is the **complete workspace/file for one client for one tax year**.

For example:

Client: John Smith

Tax Year: 2026

Case: John Smith \- 2026 Tax Return

Everything related to that tax return stays inside that Case:

* Client information  
* Required documents  
* Uploaded documents  
* Tasks  
* Messages  
* Draft return  
* Client review  
* Approval  
* E-signatures  
* Invoice/payment  
* Audit history  
* Final return

So:

**Case \= the main container/workspace for a client's tax-year process.**

**Task \= an individual action inside a Case.**

The PRD specifically says every client, tax year, document, conversation, and signature lives inside a single Case/Ticket.

## **8-Week Build Plan**

### **Week 1 \- Authentication & User Management**

* Client OTP login  
* Team/Admin authentication  
* Role-based access control  
* Client, Team, Admin roles  
* Protected routes  
* Session management  
* Multi-tenant foundation

### **Week 2 \- Client & Case Management**

* Client creation and profile  
* Create a new Case  
* Case connected to a specific tax year  
* Case assignment to a preparer  
* Case detail/workspace  
* Organize client information inside the Case  
* Case status and basic history

**Main goal:** Build the core **Client → Case** structure first.

### **Week 3 \- Document Management**

* Client document upload  
* Team document upload  
* Document-request checklist  
* Required / Missing / Received status  
* Document categories  
* Download documents  
* Document version history  
* Secure document access

**Main goal:** Everything related to documents should belong to the Case.

### **Week 4 \- Pipeline & Task Management**

* Case pipeline  
* Pipeline stages  
* Move Case between stages  
* Create and assign tasks  
* Task status  
* Task templates  
* Case-level task list  
* Basic activity/audit tracking

**Main goal:** Manage the entire Case workflow from one place.

### **Week 5 \- Communication & Draft Review**

* Case-based client/team messaging  
* Message history  
* Email/SMS notifications  
* Document-request reminders  
* Draft return upload  
* Client draft review  
* Request changes  
* Client approval  
* Automatic Case status updates

**Main goal:** Keep all communication and draft-review activity inside the Case.

### **Week 6 \- E-Signature & Payments**

* Engagement Letter e-sign  
* Form 8879 e-sign  
* Joint/spouse signing  
* Signature audit trail  
* Signed document storage  
* Automatic stage advancement after signing  
* Stripe Connect  
* Invoice creation  
* Client payment  
* Payment status

### **Week 7 \- Admin, Reassignment & White-Label**

* Admin dashboard  
* Team management  
* Case workload  
* Case reassignment  
* Preserve complete Case history during reassignment  
* Audit log  
* Firm branding  
* Logo/colors  
* Custom domain  
* Pipeline/document-request templates

### **Week 8 \- Voice AI, Final Filing & Production**

* Voice AI integration  
* Call transcripts  
* Follow-up task creation  
* Appointment booking  
* Final return upload  
* Mark Case as final  
* Basic OCR/data extraction  
* Security testing  
* Permission testing  
* Multi-tenant testing  
* Bug fixing  
* Production deployment