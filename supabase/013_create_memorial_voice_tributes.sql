-- Normalized voice tribute storage linked to memorials.
-- Keeps existing ai_voice_moods JSON workflow intact via sync trigger.

CREATE TABLE IF NOT EXISTS public.memorial_voice_tributes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  memorial_id uuid NOT NULL REFERENCES public.memorials(id) ON DELETE CASCADE,
  profile_key text NOT NULL DEFAULT 'voice1',
  profile_label text NULL,
  mood text NOT NULL CHECK (mood IN ('longing', 'excited', 'stressed', 'frustrated')),
  audio_url text NOT NULL,
  source text NULL DEFAULT 'memorials.ai_voice_moods',
  CONSTRAINT memorial_voice_tributes_memorial_profile_mood_unique UNIQUE (memorial_id, profile_key, mood)
);

CREATE INDEX IF NOT EXISTS memorial_voice_tributes_memorial_idx
  ON public.memorial_voice_tributes(memorial_id);

CREATE INDEX IF NOT EXISTS memorial_voice_tributes_memorial_profile_idx
  ON public.memorial_voice_tributes(memorial_id, profile_key);

ALTER TABLE public.memorial_voice_tributes ENABLE ROW LEVEL SECURITY;

-- Public can read tributes for public memorials; owners can always read.
DROP POLICY IF EXISTS "Voice tributes are viewable for public memorials or owners" ON public.memorial_voice_tributes;
CREATE POLICY "Voice tributes are viewable for public memorials or owners"
ON public.memorial_voice_tributes
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.memorials m
    WHERE m.id = memorial_id
      AND (m.visibility = 'public' OR m.user_id = auth.uid())
  )
);

-- Only memorial owners can write.
DROP POLICY IF EXISTS "Owners can insert voice tributes" ON public.memorial_voice_tributes;
CREATE POLICY "Owners can insert voice tributes"
ON public.memorial_voice_tributes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.memorials m
    WHERE m.id = memorial_id
      AND m.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Owners can update voice tributes" ON public.memorial_voice_tributes;
CREATE POLICY "Owners can update voice tributes"
ON public.memorial_voice_tributes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.memorials m
    WHERE m.id = memorial_id
      AND m.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Owners can delete voice tributes" ON public.memorial_voice_tributes;
CREATE POLICY "Owners can delete voice tributes"
ON public.memorial_voice_tributes
FOR DELETE
USING (
  EXISTS (
    SELECT 1
    FROM public.memorials m
    WHERE m.id = memorial_id
      AND m.user_id = auth.uid()
  )
);

CREATE OR REPLACE FUNCTION public.sync_memorial_voice_tributes(
  p_memorial_id uuid,
  p_ai_voice_moods jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_mood text;
  v_mood_audio text;
  v_profile_key text;
  v_profile_obj jsonb;
  v_mood_obj jsonb;
  v_profile_label text;
BEGIN
  DELETE FROM public.memorial_voice_tributes
  WHERE memorial_id = p_memorial_id;

  IF p_ai_voice_moods IS NULL OR jsonb_typeof(p_ai_voice_moods) <> 'object' THEN
    RETURN;
  END IF;

  -- New format:
  -- { version: 2, profiles: { voice1: { label, moods: { longing, excited, ... } } } }
  IF (p_ai_voice_moods ? 'profiles') AND jsonb_typeof(p_ai_voice_moods->'profiles') = 'object' THEN
    FOR v_profile_key, v_profile_obj IN
      SELECT key, value
      FROM jsonb_each(p_ai_voice_moods->'profiles')
    LOOP
      v_profile_label := NULLIF(v_profile_obj->>'label', '');
      v_mood_obj := CASE
        WHEN jsonb_typeof(v_profile_obj->'moods') = 'object' THEN v_profile_obj->'moods'
        ELSE v_profile_obj
      END;

      FOREACH v_mood IN ARRAY ARRAY['longing', 'excited', 'stressed', 'frustrated']
      LOOP
        v_mood_audio := NULLIF(v_mood_obj->>v_mood, '');
        IF v_mood_audio IS NOT NULL THEN
          INSERT INTO public.memorial_voice_tributes (
            memorial_id,
            profile_key,
            profile_label,
            mood,
            audio_url
          )
          VALUES (
            p_memorial_id,
            v_profile_key,
            v_profile_label,
            v_mood,
            v_mood_audio
          )
          ON CONFLICT (memorial_id, profile_key, mood) DO UPDATE
          SET
            profile_label = EXCLUDED.profile_label,
            audio_url = EXCLUDED.audio_url,
            updated_at = now();
        END IF;
      END LOOP;
    END LOOP;

    RETURN;
  END IF;

  -- Legacy format:
  -- { longing, excited, stressed, frustrated }
  FOREACH v_mood IN ARRAY ARRAY['longing', 'excited', 'stressed', 'frustrated']
  LOOP
    v_mood_audio := NULLIF(p_ai_voice_moods->>v_mood, '');
    IF v_mood_audio IS NOT NULL THEN
      INSERT INTO public.memorial_voice_tributes (
        memorial_id,
        profile_key,
        profile_label,
        mood,
        audio_url
      )
      VALUES (
        p_memorial_id,
        'voice1',
        'Voice 1',
        v_mood,
        v_mood_audio
      )
      ON CONFLICT (memorial_id, profile_key, mood) DO UPDATE
      SET
        profile_label = EXCLUDED.profile_label,
        audio_url = EXCLUDED.audio_url,
        updated_at = now();
    END IF;
  END LOOP;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_sync_memorial_voice_tributes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  PERFORM public.sync_memorial_voice_tributes(NEW.id, NEW.ai_voice_moods);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_memorial_voice_tributes_sync ON public.memorials;
CREATE TRIGGER trg_memorial_voice_tributes_sync
AFTER INSERT OR UPDATE OF ai_voice_moods ON public.memorials
FOR EACH ROW
EXECUTE FUNCTION public.trg_sync_memorial_voice_tributes();

-- Backfill existing rows
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT id, ai_voice_moods
    FROM public.memorials
  LOOP
    PERFORM public.sync_memorial_voice_tributes(r.id, r.ai_voice_moods);
  END LOOP;
END;
$$;
