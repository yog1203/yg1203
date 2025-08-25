# Book Store Admin (Roles + Tailwind + Charts)
Generated: 2025-08-25

## Roles
- **admin**: full access (Users, Distributor, Store, Store→Distributor, Reader Types, Reader Assignments).
- **distributor**: Store→Distributor, Reader Assignments, Distributors, Stores, Dashboard.
- **user**: Dashboard read-only.
> Frontend hides routes by role (no tokens/hashing by your request).

## Local run
1) DB
```bash
psql "postgres://USER:PASS@HOST:5432/DBNAME" -f db.sql
```
2) Backend
```bash
cd backend
cp .env.example .env     # set DATABASE_URL; USE_SSL=false locally
npm install
npm start                # http://localhost:5000
```
3) Frontend
```bash
cd ../bookstore-frontend
cp .env.example .env     # VITE_API_URL=http://localhost:5000
npm install
npm run dev              # http://localhost:5173
```
Logins:
- admin@example.com / admin123
- dist@example.com / dist123
- user@example.com / user123
# yg1203
