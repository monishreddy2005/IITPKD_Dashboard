# IITPKD Dashboard

A comprehensive data visualization and management dashboard for **IIT Palakkad**. This platform enables tracking, analyzing, and reporting across various institutional domains including Research, Academics, Placements, and Innovation.

---

## 🚀 Key Features

- **Analytics Dashboards**: Interactive visualizations using `Recharts` for:
  - **Research & ICSR**: Funded projects, consultancy, MoUs, and patents.
  - **Student Data**: Enrollment trends, demographics, and academic status.
  - **Placements & Internships**: Tracking packages, companies, and student outcomes.
  - **Innovation & Entrepreneurship**: Startup incubation (TECHIN, IPTIF) and programs.
  - **Administrative Stats**: Grievance redressal (IGRC), gender equality (ICC), and environmental tracking (EWD).
- **Secure Data Upload**: Role-based access for stakeholders to upload CSV data with automatic validation and upsert logic.
- **Unified Schema**: Centralized PostgreSQL database managing complex institutional data relationships.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) (Vite)
- **Styling**: Vanilla CSS (Custom premium designs)
- **Charts**: [Recharts](https://recharts.org/)
- **State Management**: React Hooks (useState, useEffect)
- **API Client**: Axios

### Backend
- **Framework**: [Flask](https://flask.palletsprojects.com/) (Python)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: JWT (JSON Web Tokens) with Bcrypt hashing
- **Drivers**: Psycopg2

---

## 📦 Project Structure

```text
IITPKD_Dashboard/
├── Backend/                 # Flask API and business logic
│   ├── app/                 # Blueprint-organized modules (auth, research, upload, etc.)
│   ├── requirements.txt     # Python dependencies
│   └── run.py               # Entry point for backend
├── Frontend/                # React application
│   ├── src/                 # Components, services, and assets
│   ├── package.json         # Node.js dependencies
│   └── vite.config.js       # Vite configuration
├── Database_Schema/         # SQL scripts for database initialization
└── tests/                   # Sample CSV data and testing resources
```

---

## ⚙️ Getting Started

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup
1. Navigate to `/Backend`:
   ```bash
   cd Backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/macOS
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up `.env` file with `DATABASE_URL` and `JWT_SECRET_KEY`.
5. Start the server:
   ```bash
   python run.py
   ```

### Frontend Setup
1. Navigate to `/Frontend`:
   ```bash
   cd Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Database Initialization
Apply the schemas located in `/Database_Schema`:
```bash
psql -d iitpkd_dashboard_database -f Database_Schema/schema.sql
# ... and other specialized sql files as needed
```

---

## 🔐 Security

- **JWT Authentication**: Secure access to analytics and upload functions.
- **SQL Injection Protection**: Parameterized queries via `Psycopg2`.
- **Whitelisted Uploads**: Only authorized tables can be updated via the dashboard.

---

## 📄 License
Internal use for **Indian Institute of Technology Palakkad**.
