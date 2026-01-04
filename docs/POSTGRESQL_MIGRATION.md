# PostgreSQL Migration Guide for 8Stro

This guide explains how to migrate the 8Stro application from the local SQLite database to a production-ready PostgreSQL database (e.g., Supabase, RDS, Railway).

## 1. Set up Supabase (Free tier recommended)

1.  Go to: [https://supabase.com](https://supabase.com)
2.  Create a new project.
3.  Navigate to **Settings** -> **Database**.
4.  Copy the **Connection String** (Transaction Mode is recommended for serverless access, but Session Mode works for this backend).

## 2. Update Environment Variables

Update your `.env` file (or your deployment platform's environment variables) with the connection string.

**Format:**
```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
```

**Note:** The backend automatically handles `postgres://` to `postgresql://` conversion and appends `sslmode=require` if needed.

## 3. Run Migrations

To initialize the tables in the new PostgreSQL database, you need to run the `init_db` function.

**Option A: Manual Script (Local)**
From the `backend` directory:
```bash
# Ensure venv is active
source venv/bin/activate
# Run initialization
python -c "from app.database import init_db; init_db()"
```

**Option B: Deployment (Docker)**
The application automatically attempts to run `init_db()` on startup (see `main.py`).
```python
@app.on_event("startup")
async def startup_event():
    init_db()
```
This ensures that whenever you deploy to a new environment with a fresh `DATABASE_URL`, the tables will be created automatically.

## 4. Verify Connection

To verify the connection is working:

1.  Start the backend: `npm run dev` (frontend) + backend server.
2.  Check logs for "Database initialized".
3.  Access the `/api/test-db` endpoint (if available) or check `/health`.

## 5. Data Migration (Optional)

If you have existing data in `charts.db` (SQLite) that you want to move to PostgreSQL, you will need to use a tool like `pgloader` or a custom script to export data from SQLite and import it into Postgres.

**Example using `sqlite3` dump (Basic):**
```bash
sqlite3 charts.db .dump > dump.sql
# Then edit dump.sql to be Postgres compatible and pipe to psql
```
*Note: Since this is an MVP, starting fresh in production is often easier.*
