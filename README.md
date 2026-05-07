# BookEasy — Branch Appointment Booking

Book branch appointments in a few clicks. Select a branch, pick a date and time slot, fill in your details, and get a confirmation email.

---

## Quick Start

### Option A — Docker (recommended)

> Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) to be running.

```bash
cd appointment-booking-system
docker compose up --build
```

Open **http://localhost:3000**

```bash
# Stop
docker compose down
```

---

### Option B — Local development

> Requires Node.js 22+

**Terminal 1 — Backend**
```bash
cd appointment-booking-system/backend
npm install
npm run dev
```

**Terminal 2 — Frontend**
```bash
cd appointment-booking-system/frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

## API

Base URL: `http://localhost:3001/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/branches` | List all branches |
| GET | `/slots?branchId=&date=YYYY-MM-DD` | Available time slots |
| GET | `/bookings` | List all bookings |
| POST | `/bookings` | Create a booking |
| DELETE | `/bookings/:id` | Cancel a booking |
| GET | `/health` | Health check |

### Create a booking (POST /bookings)

```json
{
  "branchId": "1",
  "date": "2026-06-15",
  "timeSlot": "10:00",
  "customerName": "Tshepo Ninja",
  "customerEmail": "tshepo@example.com",
  "customerPhone": "0667778888"
}
```

---

## Stack

- **Frontend** — React 18, Vite, TypeScript, Tailwind CSS
- **Backend** — Node.js 22, Express, TypeScript
- **Database** — SQLite (`node:sqlite`, persisted to `backend/data/appointments.db`)
- **Email** — Simulated via [Ethereal Mail](https://ethereal.email/) — click the preview link after booking
- **Container** — Docker + nginx

