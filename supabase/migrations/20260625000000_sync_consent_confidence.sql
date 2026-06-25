-- BreathPrint AI — sync, consent detail, confidence, and RLS fixes
-- Follows 20260624000000_initial_schema.sql. Idempotent (safe to re-run).

-- ── Consent detail (WS4): persist WHICH consents were granted, not just a timestamp ──
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS consent_research BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consent_pdpa BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consent_audio BOOLEAN NOT NULL DEFAULT FALSE;

-- ── Confidence (WS1): every result carries a model confidence ──
ALTER TABLE results
  ADD COLUMN IF NOT EXISTS confidence DOUBLE PRECISION;

-- ── CRITICAL (WS3): the initial schema only had a SELECT policy on `results`,
--    so client inserts/upserts were blocked (403). Add INSERT + UPDATE scoped to
--    the owning user via the screening's user_id. ──
DROP POLICY IF EXISTS "Users can insert own results" ON results;
CREATE POLICY "Users can insert own results"
  ON results FOR INSERT
  WITH CHECK (
    screening_id IN (SELECT id FROM screenings WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own results" ON results;
CREATE POLICY "Users can update own results"
  ON results FOR UPDATE
  USING (
    screening_id IN (SELECT id FROM screenings WHERE user_id = auth.uid())
  )
  WITH CHECK (
    screening_id IN (SELECT id FROM screenings WHERE user_id = auth.uid())
  );

-- ── Storage bucket for audio (private — playback via signed URLs) ──
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio-recordings', 'audio-recordings', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Users manage own audio" ON storage.objects;
CREATE POLICY "Users manage own audio"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'audio-recordings' AND owner = auth.uid())
  WITH CHECK (bucket_id = 'audio-recordings' AND owner = auth.uid());
