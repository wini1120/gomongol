-- ============================================================
-- 회사 로고 저장용 Storage 버킷 (Supabase SQL Editor에서 실행)
-- ============================================================
-- 1) 버킷 생성 (이미 있으면 에러 무시 후 2번만 실행)
-- Dashboard → Storage → New bucket → 이름: company-logo, Public: 켜기
-- 또는 아래로 생성:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'company-logo',
  'company-logo',
  true,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2) 익명(비로그인) 업로드 허용 — 입점 가입 폼에서 로고 업로드용
DROP POLICY IF EXISTS "anon_insert_company_logo" ON storage.objects;
CREATE POLICY "anon_insert_company_logo"
  ON storage.objects FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'company-logo');

-- 3) 공개 읽기는 public 버킷이면 별도 정책 없이 가능
