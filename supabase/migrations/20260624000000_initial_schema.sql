-- BreathPrint AI — Supabase schema migration
-- Run via: supabase db push  OR  apply in Supabase SQL editor

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  sex TEXT NOT NULL CHECK (sex IN ('male', 'female', 'other')),
  smoking_status TEXT NOT NULL CHECK (smoking_status IN ('never', 'former', 'current')),
  device_model TEXT,
  consent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Screening sessions
CREATE TABLE IF NOT EXISTS screenings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  breath_audio_url TEXT,
  cough_audio_url TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  pm25_ugm3 DOUBLE PRECISION,
  exposure_dose_weekly DOUBLE PRECISION,
  symptoms_json JSONB NOT NULL DEFAULT '{}',
  pef_value INTEGER,
  device_info TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'uploading', 'analyzing', 'complete', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Analysis results
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  screening_id UUID NOT NULL REFERENCES screenings(id) ON DELETE CASCADE UNIQUE,
  risk_score INTEGER NOT NULL CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_band TEXT NOT NULL CHECK (risk_band IN ('low', 'moderate', 'high', 'very_high')),
  explanation_text TEXT,
  explanation_bullets JSONB NOT NULL DEFAULT '[]',
  time_events_json JSONB NOT NULL DEFAULT '[]',
  exposure_delta_pct DOUBLE PRECISION,
  referral_level TEXT NOT NULL CHECK (referral_level IN ('monitor', 'ios', 'pulmonologist')),
  model_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Personalized acoustic baseline (rolling per user)
CREATE TABLE IF NOT EXISTS baselines (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  avg_risk_score DOUBLE PRECISION NOT NULL DEFAULT 0,
  avg_exposure_dose DOUBLE PRECISION NOT NULL DEFAULT 0,
  screening_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_screenings_user_id ON screenings(user_id);
CREATE INDEX IF NOT EXISTS idx_screenings_created_at ON screenings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_results_screening_id ON results(screening_id);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own screenings"
  ON screenings FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own results"
  ON results FOR SELECT USING (
    screening_id IN (SELECT id FROM screenings WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own baseline"
  ON baselines FOR ALL USING (auth.uid() = user_id);

-- Storage bucket (run in Supabase dashboard or via API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('audio-recordings', 'audio-recordings', false);

-- Storage policy example:
-- CREATE POLICY "Users upload own audio"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'audio-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
