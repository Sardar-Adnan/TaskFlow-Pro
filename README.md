# TaskFlow Pro 🚀

> **A Modern, Full-Stack Project Management & Team Collaboration SaaS Platform**

TaskFlow Pro is an enterprise-grade project management application designed to help organizations plan projects, assign tasks, manage teams, and track real-time progress from a single centralized platform. Built with a bespoke design, role-based workflows, automated notification signals, and interactive task discussions.

---

## 🔗 Live Application & Credentials

* **Frontend App**: [https://task-flow-pro-lemon.vercel.app](https://task-flow-pro-lemon.vercel.app)
* **Backend API**: `https://TaskProAlpha.pythonanywhere.com/api/`
* **GitHub Repository**: [https://github.com/Sardar-Adnan/TaskFlow-Pro](https://github.com/Sardar-Adnan/TaskFlow-Pro)

### 🔐 Demo Credentials
| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@taskflowpro.com` | `admin123` | Full system control, user & project management |
| **Project Manager** | `pm1@taskflow.com` | `testpass123` | Project scope, task assignment, team management |
| **Team Member** | `testmem1@taskflow.com` | `testpass123` | Task execution, status updates, discussions |

---

## ✨ Key Features & System Portals

TaskFlow Pro features three distinct role-based portals with strict RBAC enforcement:

### 👑 1. Administrator Portal (`/admin`)
* **User Management**: Create, update, search, filter, and remove users across roles (`admin`, `pm`, `member`).
* **Project Management**: Create projects, assign Project Managers, set start/end dates, priorities, and statuses.
* **System Monitoring**: Company-wide dashboard stats, project progress tracking, and global activity audit feed.

### 👔 2. Project Manager Portal (`/manager`)
* **Project Workspace**: View and manage assigned projects and team membership.
* **Task Management**: Create tasks, set priorities (Low, Medium, High), due dates, and assign to team members.
* **Kanban Task Board**: Interactive 4-column status pipeline (**To Do**, **In Progress**, **Review**, **Completed**).
* **Collaboration**: Participate in task discussions and receive activity notifications.

### 👥 3. Team Member Portal (`/member`)
* **Task Execution**: View assigned projects and personal task workload.
* **Status Updates**: Progress tasks through workflow stages (**To Do → In Progress → Review → Completed**).
* **Task Discussions**: Dedicated threaded communication for each task.
* **Profile Settings**: Manage bio, phone number, and change passwords securely.

### ⚡ 4. Platform Engine Features
* **Automated Notifications**: Django Signals automatically alert users on task assignments, status changes, new comments, and project additions.
* **Real-time Badge Polling**: Background polling (30s interval) keeps unread notification badges up to date.
* **Global Search & Filter**: Instant search across projects and tasks with filter parameters.
* **Activity Audit Log**: System-wide event logging recording actions, targets, timestamps, and users.
* **Dark / Light Mode**: Seamless dark mode support across all portals.

---

## 🛠️ Technology Stack

### **Frontend**
* **Framework**: React (Vite)
* **Styling**: Tailwind CSS v3
* **Icons**: Lucide React
* **HTTP Client**: Axios with JWT Interceptors
* **Routing**: React Router v6 (Protected Role Guards)
* **Notifications**: React Hot Toast

### **Backend**
* **Framework**: Django 4.2 + Django REST Framework (DRF)
* **Authentication**: SimpleJWT (JSON Web Tokens)
* **Database**: SQLite (Local / PythonAnywhere) / PostgreSQL (Neon)
* **Signals**: Django `post_save` signals for automated notification dispatching
* **CORS**: `django-cors-headers`

---

## 📁 Project Structure

```text
TaskFlow-Pro/
├── backend/                  # Django REST Framework Backend
│   ├── config/               # Project configuration & settings
│   ├── users/                # User model, auth views, & RBAC permissions
│   ├── projects/             # Project, Task, Discussion & ActivityLog models
│   ├── notifications/        # Notification model, views & Django signals
│   └── manage.py
├── frontend/                 # React (Vite) Frontend Application
│   ├── src/
│   │   ├── components/       # Modal, StatusBadge, Discussion, ActivityTimeline
│   │   ├── context/          # AuthContext, ThemeContext, NotificationContext
│   │   ├── layouts/          # DashboardLayout (Sidebar, Header, Dropdown)
│   │   ├── pages/            # Admin, Manager, Member, Auth & Shared pages
│   │   └── services/         # Axios API service endpoints
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## 🚀 Local Installation & Setup Guide

### Prerequisites
* **Python** 3.10+
* **Node.js** 18+ & **npm**

### 1. Clone Repository
```bash
git clone https://github.com/Sardar-Adnan/TaskFlow-Pro.git
cd TaskFlow-Pro
```

### 2. Backend Setup
```bash
cd backend

# Create & activate virtual environment
python -m venv venv
# On Windows: venv\Scripts\activate | On Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create initial admin user
python -c "import django; django.setup(); from users.models import User; User.objects.filter(email='admin@taskflowpro.com').exists() or User.objects.create_superuser(email='admin@taskflowpro.com', name='Admin User', password='admin123', role='admin')"

# Start Django development server
python manage.py runserver
```
The Django backend API will be available at `http://localhost:8000/api/`.

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend

# Install npm packages
npm install

# Start Vite dev server
npm run dev
```
The React frontend will be available at `http://localhost:5173/`.

---

## 📑 Key API Endpoints Summary

| Endpoint | Method | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login/` | `POST` | Public | Obtain JWT Access & Refresh Tokens |
| `/api/auth/me/` | `GET`, `PUT` | Authenticated | Get or update current user profile |
| `/api/auth/change-password/` | `PUT` | Authenticated | Change user password |
| `/api/users/` | `GET`, `POST` | Admin | List or create users |
| `/api/projects/` | `GET`, `POST` | Role-filtered | List or create projects |
| `/api/projects/<id>/tasks/` | `GET`, `POST` | Role-filtered | Project task management |
| `/api/tasks/<id>/status/` | `PATCH` | Role-filtered | Update task status pipeline |
| `/api/tasks/<id>/discussions/`| `GET`, `POST` | Project members | Threaded task comments |
| `/api/notifications/` | `GET` | Authenticated | User notifications list |
| `/api/activity/` | `GET` | Authenticated | Activity log audit feed |
| `/api/dashboard/stats/` | `GET` | Authenticated | Role-specific dashboard stats |

---

## 📜 License
This project was developed as part of an Internship Evaluation Task for **TaskFlow Pro**. All rights reserved.
