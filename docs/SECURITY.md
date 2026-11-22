# SpeederSpider - Security & Authorization Specification

**Project:** SpeederSpider Automotive Digital Platform  
**Document Classification:** Technical Security & Compliance Specification

---

## 1. Security Architecture & Threat Model

SpeederSpider processes customer contact enquiries and manages internal workshop inventory. The security architecture adheres to defense-in-depth principles:
1. **Network & Transport:** Strict HTTPS, HSTS, Secure Cookies (`HttpOnly`, `SameSite=Lax`, `Secure`).
2. **Authentication:** Supabase Auth (JWT session management, secure refresh tokens, email verification).
3. **Authorization:** Server-side role validation (`OWNER`, `MANAGER`, `STAFF`) coupled with database-level Row Level Security (RLS).
4. **Data Isolation:** Zero public exposure of inventory quantities, supplier costs, customer message phone numbers, or administrative credentials.
5. **Secret Protection:** Strict segregation of client (`NEXT_PUBLIC_`) and server (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) environment variables.

---

## 2. Multi-Role Permission Matrix

| Operation / Scope | Public Visitor | STAFF | MANAGER | OWNER |
|---|---|---|---|---|
| View Published Services & Portfolio | Allowed | Allowed | Allowed | Allowed |
| View Draft Services & Portfolio | Denied | Denied | Allowed | Allowed |
| Create / Edit Services & Portfolio | Denied | Denied | Allowed | Allowed |
| Delete Services & Portfolio | Denied | Denied | Denied | Allowed |
| Submit Public Contact Enquiry | Allowed (Rate-limited) | Allowed | Allowed | Allowed |
| View Customer Contact Enquiries | Denied | View Only | View & Update | Full Access |
| Update Enquiry Status / Notes | Denied | Allowed | Allowed | Allowed |
| View Inventory Items & Stock Levels | Denied | View Only | Full Access | Full Access |
| Log Stock In / Stock Out Transaction | Denied | Allowed | Allowed | Allowed |
| Create / Delete Inventory Items | Denied | Denied | Allowed | Allowed |
| Perform Manual Stock Adjustments | Denied | Denied | Allowed (Logged) | Allowed (Logged) |
| Manage Staff Accounts & Roles | Denied | Denied | Denied | Allowed |
| View Security Audit Logs | Denied | Denied | Denied | Allowed |

---

## 3. Server-Side Protection & Validation

### 3.1 Input Validation & Sanitization
* All contact form submissions pass through strict schema validation (Zod/TypeScript):
  * Email format verification and length checks.
  * Phone number format normalization (accepting UAE and international formats).
  * HTML sanitization to prevent Cross-Site Scripting (XSS).
* Zero direct SQL string interpolation; parameterized queries only.

### 3.2 Anti-Spam & Rate Limiting
* Server-side in-memory or Redis-based rate limiting on `/api/contact` (max 5 requests per IP per 15 minutes).
* Honeypot field in contact forms to trap automated bots silently without interrupting human visitors.

### 3.3 Security Headers Configuration
In `next.config.ts`:
* `X-Frame-Options: DENY` (Clickjacking prevention).
* `X-Content-Type-Options: nosniff` (MIME sniffing prevention).
* `Referrer-Policy: strict-origin-when-cross-origin`.
* `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`.
* `Content-Security-Policy`: Restricts scripts, styles, frames, and images to trusted domains.
