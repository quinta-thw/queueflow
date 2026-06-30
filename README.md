# QueueFlow — USIU Smart Queue Management System

> Queue Less. Do More.

A full-stack queue management system built with **Django REST Framework** (backend) and **React + Tailwind CSS** (frontend).

---

## Project Structure

```
queue system/
├── backend/          ← Django REST API
└── frontend/         ← React (Vite) app
```

---

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create a superuser (staff admin)
python manage.py createsuperuser

# Seed sample services (optional — run in Django shell)
python manage.py shell -c "
from services.models import Service
services = [
    ('Registrar', 'registrar', 'Transcript requests, enrollment letters, academic records', 'Block A, Room 101'),
    ('Finance Office', 'finance', 'Fee payments, financial aid, invoices', 'Block B, Ground Floor'),
    ('Health Clinic', 'health', 'Medical consultations, prescriptions', 'Health Centre'),
    ('Student Affairs', 'student_affairs', 'Student welfare, clubs, counseling', 'Admin Block'),
    ('ICT Support', 'ict', 'Password reset, email setup, tech support', 'Library Building'),
    ('Library', 'library', 'Book issues, printing, research assistance', 'Main Library'),
    ('Admissions', 'admissions', 'Applications, transfers, documentation', 'Admin Block'),
    ('Cafeteria', 'cafeteria', 'Meal plans, catering bookings', 'Student Centre'),
]
for name, icon, desc, loc in services:
    Service.objects.get_or_create(name=name, defaults={'icon': icon, 'description': desc, 'location': loc})
print('Services seeded!')
"

# Start the backend server
python manage.py runserver
```

Backend runs at: http://127.0.0.1:8000

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Creating a Staff Account

Staff accounts must be created via the Django admin panel or shell:

```bash
python manage.py shell -c "
from accounts.models import CustomUser
user = CustomUser.objects.create_user(
    username='staff1',
    email='staff@usiu.ac.ke',
    password='staffpass123',
    first_name='Jane',
    last_name='Doe',
    role='staff',
    department='Registrar',
    staff_id='STF/001'
)
print('Staff account created!')
"
```

Then sign in at http://localhost:5173/signin → switch to **Staff** tab.

---

## Pages & Features

### Student
| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Marketing landing page |
| Sign In | `/signin` | Student or Staff login |
| Sign Up | `/signup` | 3-step student registration |
| Dashboard | `/student` | Queue stats, active services, recent activity |
| Services | `/student/services` | Browse & join queues |
| My Ticket | `/student/ticket` | Live queue position tracker |
| Alerts | `/student/alerts` | Notifications & announcements |
| Profile | `/student/profile` | Edit profile, change password |

### Staff
| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/staff` | Queue overview, call next, open/close |
| Queue Management | `/staff/queues` | Full ticket management per queue |
| Reports | `/staff/reports` | Analytics, charts, feedback summary |
| Profile | `/staff/profile` | Edit profile, change password |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/student/` | Student registration |
| POST | `/api/auth/login/` | Login (student or staff) |
| POST | `/api/auth/logout/` | Logout + blacklist token |
| GET | `/api/auth/me/` | Current user profile |
| GET | `/api/services/` | List all services |
| GET | `/api/queues/queues/` | Today's queues |
| POST | `/api/queues/queues/join/` | Join a queue |
| POST | `/api/queues/queues/{id}/call_next/` | Call next ticket (staff) |
| POST | `/api/queues/queues/{id}/open/` | Open queue (staff) |
| POST | `/api/queues/queues/{id}/close/` | Close queue (staff) |
| GET | `/api/queues/tickets/` | List tickets |
| POST | `/api/queues/tickets/{id}/cancel/` | Cancel ticket |
| POST | `/api/queues/tickets/{id}/complete/` | Mark complete (staff) |
| GET | `/api/notifications/` | List notifications |
| POST | `/api/notifications/broadcast/` | Broadcast to all students (staff) |
| POST | `/api/feedback/` | Submit feedback |
| GET | `/api/feedback/summary/` | Feedback summary (staff) |

---

## Tech Stack

**Backend**
- Python / Django 4.x
- Django REST Framework
- JWT Auth (simplejwt)
- SQLite (development) — swap to PostgreSQL for production

**Frontend**
- React 18 + Vite
- Tailwind CSS 3
- React Router v6
- Axios (with JWT interceptors)
- Lucide React (icons)
- React Hot Toast (notifications)
