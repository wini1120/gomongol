-- ============================================================
-- 여행후기(travel_review) 관리용 테이블 (Supabase SQL Editor에서 실행)
-- ============================================================

-- 1) 여행사 소개글·로고 컬럼 추가 (agency_user 이미 있는 경우)
ALTER TABLE agency_user ADD COLUMN IF NOT EXISTS company_intro TEXT;
ALTER TABLE agency_user ADD COLUMN IF NOT EXISTS company_logo_url TEXT;

-- 2) 여행후기 메인 테이블
CREATE TABLE IF NOT EXISTS travel_review (
  id                BIGSERIAL PRIMARY KEY,
  agency_user_id    BIGINT REFERENCES agency_user(user_no) ON DELETE SET NULL,
  agency_name_other TEXT,                   -- 기타(미등록) 여행사명
  title             TEXT NOT NULL,
  nights            INT NOT NULL DEFAULT 1,
  people            INT NOT NULL DEFAULT 1,
  region            TEXT NOT NULL,           -- '고비' | '홉스골' | '중부'
  description       TEXT,
  thumbnail_url     TEXT,
  writer_nickname   TEXT,
  reviewed_after_use BOOLEAN DEFAULT false,
  travel_user_id    BIGINT REFERENCES travel_user(user_no) ON DELETE SET NULL,
  is_delete         CHAR(1) NOT NULL DEFAULT 'X',
  deleted_at        TIMESTAMPTZ,
  deleted_reason    TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- [이미 travel_review가 있는 경우] 컬럼 추가는 supabase_travel_review_extra.sql 실행
ALTER TABLE travel_review ADD COLUMN IF NOT EXISTS writer_nickname TEXT;
ALTER TABLE travel_review ADD COLUMN IF NOT EXISTS reviewed_after_use BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_travel_review_agency ON travel_review(agency_user_id);
CREATE INDEX IF NOT EXISTS idx_travel_review_created ON travel_review(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_travel_review_region ON travel_review(region);

-- 3) 후기 사진 테이블 (최대 5장, sort_order 1이 썸네일)
CREATE TABLE IF NOT EXISTS review_photo (
  id                BIGSERIAL PRIMARY KEY,
  travel_review_id  BIGINT NOT NULL REFERENCES travel_review(id) ON DELETE CASCADE,
  image_url         TEXT NOT NULL,          -- Supabase Storage public URL
  sort_order        INT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_review_photo_review ON review_photo(travel_review_id);

-- 4) RLS
ALTER TABLE travel_review ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_photo ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_travel_review" ON travel_review;
DROP POLICY IF EXISTS "anon_insert_travel_review" ON travel_review;
DROP POLICY IF EXISTS "anon_update_travel_review" ON travel_review;
CREATE POLICY "anon_select_travel_review" ON travel_review FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_travel_review" ON travel_review FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_travel_review" ON travel_review FOR UPDATE TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_review_photo" ON review_photo;
DROP POLICY IF EXISTS "anon_insert_review_photo" ON review_photo;
CREATE POLICY "anon_select_review_photo" ON review_photo FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_review_photo" ON review_photo FOR INSERT TO anon WITH CHECK (true);

-- 5) Storage 버킷 review-photos 업로드/읽기 허용 (버킷 생성 후 아래 정책 실행)
-- Supabase Dashboard > Storage > New bucket: review-photos, Public 체크 후 생성
DROP POLICY IF EXISTS "anon_upload_review_photos" ON storage.objects;
DROP POLICY IF EXISTS "anon_read_review_photos" ON storage.objects;
CREATE POLICY "anon_upload_review_photos" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'review-photos');
CREATE POLICY "anon_read_review_photos" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'review-photos');

-- ============================================================
-- 사진 업로드: Supabase Dashboard > Storage > New bucket
-- 이름: review-photos, Public bucket 체크 후 생성
-- ============================================================
