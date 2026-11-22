# SpeederSpider - API & Server Operations Reference

**Project:** SpeederSpider Automotive Digital Platform  
**Document Classification:** API & Server Actions Technical Specification

---

## 1. REST Endpoints

### 1.1 `POST /api/contact`
Receives public customer contact form submissions, validates payloads, saves records into `contact_messages`, and dispatches notification emails.

* **Access:** Public (Rate-limited, anti-spam honeypot enabled)
* **Request Headers:** `Content-Type: application/json`
* **Request Payload:**
```json
{
  "customerName": "Ahmed Al-Maktoum",
  "email": "ahmed@example.ae",
  "phone": "+971501234567",
  "serviceId": "b1b2c3d4-...",
  "message": "Enquiring about ceramic coating for Mercedes G63",
  "preferredLanguage": "en",
  "hpToken": ""
}
```
* **Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Enquiry received successfully. Our workshop team will contact you shortly."
}
```
* **Validation Failure (400 Bad Request):**
```json
{
  "success": false,
  "errors": [
    { "field": "phone", "message": "Please enter a valid phone number" }
  ]
}
```
* **Rate Limited (429 Too Many Requests):**
```json
{
  "success": false,
  "message": "Too many requests. Please try again after 15 minutes or message via WhatsApp directly."
}
```

### 1.2 `GET /api/health`
System diagnostic healthcheck verifying database connectivity.
* **Access:** Public / Monitoring services
* **Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-11-22T16:59:00.000Z",
  "database": "connected"
}
```

---

## 2. Server Actions (Next.js Server Actions)

Administrative actions execute exclusively on the server using authenticated Supabase sessions:

### 2.1 Services Actions (`src/lib/actions/services.ts`)
* `createService(formData: ServiceInput)` - Restricted to `OWNER`, `MANAGER`
* `updateService(id: string, formData: Partial<ServiceInput>)` - Restricted to `OWNER`, `MANAGER`
* `togglePublishService(id: string)` - Restricted to `OWNER`, `MANAGER`
* `deleteService(id: string)` - Restricted to `OWNER`

### 2.2 Portfolio Actions (`src/lib/actions/portfolio.ts`)
* `createProject(data: ProjectInput)` - Restricted to `OWNER`, `MANAGER`
* `updateProject(id: string, data: Partial<ProjectInput>)` - Restricted to `OWNER`, `MANAGER`
* `deleteProject(id: string)` - Restricted to `OWNER`

### 2.3 Inventory Actions (`src/lib/actions/inventory.ts`)
* `logStockTransaction(itemId: string, type: 'stock_in'|'stock_out', qty: number, reason: string)` - Permitted for `STAFF`, `MANAGER`, `OWNER`
* `adjustStockLevel(itemId: string, newQty: number, mandatoryReason: string)` - Restricted to `MANAGER`, `OWNER`
* `createInventoryItem(data: ItemInput)` - Restricted to `MANAGER`, `OWNER`
* `archiveInventoryItem(id: string)` - Restricted to `OWNER`

### 2.4 Enquiry Actions (`src/lib/actions/enquiries.ts`)
* `updateEnquiryStatus(id: string, status: EnquiryStatus, internalNotes?: string)` - Permitted for `STAFF`, `MANAGER`, `OWNER`
