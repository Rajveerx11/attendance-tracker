# Attendance Tracker

A minimal, stable attendance tracking web application for college students.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (Auth + PostgreSQL)
- **Styling**: Vanilla CSS

## Features

- Track attendance per subject (Theory / Practical)
- Mark Present, Absent, or No Class
- View attendance history
- Date-wise attendance lookup
- Edit existing attendance records
- Simple task management

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/attendance-tracker.git
cd attendance-tracker
npm install
```

### 2. Configure Supabase

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set up the database

Run the SQL in `supabase_setup.sql` in your Supabase SQL Editor.

### 4. Run locally

```bash
npm run dev
```

## Deployment

This app is deployed on Vercel. Set the following environment variables in Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## License

MIT
