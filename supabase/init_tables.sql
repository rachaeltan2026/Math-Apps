-- Supabase / Postgres schema for Teacher Attendance & Workshop Registration
-- Run this in the Supabase SQL editor (Project -> SQL Editor -> New query)

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  school text,
  grade_level text,
  role text DEFAULT 'teacher',
  created_at timestamptz DEFAULT now()
);

-- Workshops table
CREATE TABLE IF NOT EXISTS workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  date date,
  time text,
  location text,
  instructor text,
  capacity integer DEFAULT 20 CHECK (capacity >= 0),
  status text DEFAULT 'Open',
  attendance_open timestamptz,
  attendance_close timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workshop_id uuid NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  status text DEFAULT 'Registered',
  registration_date timestamptz DEFAULT now(),
  confirmation_id text,
  UNIQUE (user_id, workshop_id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  check_in_time timestamptz,
  check_out_time timestamptz,
  status text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Feedback forms table
CREATE TABLE IF NOT EXISTS feedback_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id uuid NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  form_title text,
  questions jsonb,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Feedback responses table
CREATE TABLE IF NOT EXISTS feedback_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_form_id uuid NOT NULL REFERENCES feedback_forms(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  responses jsonb,
  submitted_at timestamptz DEFAULT now()
);

-- Useful indexes
CREATE INDEX IF NOT EXISTS idx_registrations_workshop_id ON registrations(workshop_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user_id ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_workshops_date ON workshops(date);
