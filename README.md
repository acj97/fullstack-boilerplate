# DurianPay Dashboard

A full-stack payment dashboard — Go backend + React frontend.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Go | 1.21+ |
| Node.js | 20+ |
| npm | 10+ |
| Make | any |
| GCC / CGO | required (SQLite uses cgo) |

> macOS: GCC ships with Xcode Command Line Tools (`xcode-select --install`).

---

## Project Structure

```
fullstack-boilerplate/
├── backend/        Go API server
├── frontend/       React + Vite app
├── openapi.yaml    API specification (source of truth)
└── Makefile        Root convenience targets
```

---

## Environment Setup

### Backend

```bash
cd backend
cp env.sample .env
```

Edit `.env`:

```env
HTTP_ADDR=:8080
OPENAPIYAML_LOCATION=../openapi.yaml
JWT_SECRET=<generate with: make gen-secret>
JWT_EXPIRED=24h
```

Generate a secret:

```bash
cd backend && make gen-secret   # prints a random base64 secret
```

Copy the output into `JWT_SECRET` in your `.env`.

### Frontend

```bash
cd frontend
cp .env.example .env
```

`.env` should contain:

```env
VITE_API_BASE_URL=http://localhost:8080
```

---

## Build & Start

### Run both together (recommended)

From the repo root:

```bash
make dev
```

This starts the backend on `localhost:8080` and the frontend dev server on `localhost:5173` concurrently.

### Run separately

```bash
make be   # backend only
make fe   # frontend only (installs deps then starts vite)
```

### Backend only (manual)

```bash
cd backend
make run      # go run with CGO_ENABLED=1
make build    # compile → bin/mygolangapp
```

### Frontend only (manual)

```bash
cd frontend
npm install
npm run dev
npm run build   # production build → dist/
```

---

## Seed Data

Seed runs **automatically on first start** — no manual step required.

On startup, if the tables are empty the server inserts:

**Users**

| Email | Password | Role |
|-------|----------|------|
| cs@test.com | password | cs |
| operation@test.com | password | operation |

**Payments** — 30 rows covering Indonesian merchants (Tokopedia, Shopee, Gojek, Grab, Traveloka, Bukalapak, OVO, Dana, LinkAja, Blibli, Lazada, Tiket.com, Alfamart, Indomaret, BCA, Mandiri, BRI, BNI, CIMB Niaga, Permata Bank, Xendit, Midtrans, Doku, iPaymu, Nicepay, Espay, Veritrans, 2C2P, PayPro, Cashlez) with a mix of `completed`, `processing`, and `failed` statuses and `created_at` dates spanning the past 75 days.

To reseed from scratch, delete `backend/dashboard.db` and restart the server:

```bash
rm backend/dashboard.db && make be
```

---

## Running Tests

### Backend

```bash
cd backend
go test ./...
```

### Frontend

```bash
cd frontend
npm run lint   # ESLint
```

---

## API Documentation

The full API spec is at [`openapi.yaml`](openapi.yaml) (OpenAPI 3.0.3).

To explore interactively, paste `openapi.yaml` into [editor.swagger.io](https://editor.swagger.io).

### Base URL

```
http://localhost:8080
```

### Endpoints

#### `POST /dashboard/v1/auth/login`

Authenticate and receive a JWT token.

**Request body**
```json
{
  "email": "cs@test.com",
  "password": "password"
}
```

**Response `200`**
```json
{
  "email": "cs@test.com",
  "role": "cs",
  "token": "eyJhbGci..."
}
```

**Response `401`**
```json
{ "code": "unauthorized", "message": "missing or invalid token" }
```

---

#### `GET /dashboard/v1/payments`

List payments. Requires `Authorization: Bearer <token>` header.

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `completed` \| `processing` \| `failed` |
| `sort` | string | Sort field with optional `-` prefix for descending. Valid fields: `created_at`, `amount`. Example: `-created_at` |
| `search` | string | Case-insensitive partial match on merchant name |
| `page` | integer | Page number, 1-indexed (default: `1`) |
| `page_size` | integer | Items per page, max 100 (default: `10`) |

**Response `200`**
```json
{
  "payments": [
    {
      "id": "1",
      "merchant_name": "Tokopedia",
      "amount": "150000",
      "status": "completed",
      "created_at": "2026-04-29T06:21:35Z"
    }
  ],
  "total": 30,
  "page": 1,
  "page_size": 10
}
```

**Response `401`**
```json
{ "code": "unauthorized", "message": "missing or invalid token" }
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend language | Go 1.25 |
| HTTP router | go-chi/chi v5 |
| Database | SQLite (mattn/go-sqlite3, CGO) |
| Auth | golang-jwt/jwt v5, bcrypt |
| OpenAPI codegen | oapi-codegen v2 |
| Frontend framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State management | Zustand (persisted to localStorage) |
| Forms | React Hook Form |
| Routing | React Router v6 |

---

## Login

After starting the app, open [http://localhost:5173](http://localhost:5173) and log in with:

- **Email:** `cs@test.com`
- **Password:** `password`

---

## Regenerating OpenAPI Types

If you modify `openapi.yaml`, regenerate the Go types and server interface:

```bash
cd backend && make openapi-gen
```

This updates `backend/internal/openapigen/openapi.gen.go`.
