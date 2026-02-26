-- ============================================================
-- 여행후기 추가 기능 (로그인 연동, 기타 여행사, 신고·삭제 기록)
-- Supabase SQL Editor에서 실행 (travel_review 테이블 존재 시)
-- ============================================================

-- 1) travel_review 확장
-- 기타(미등록) 여행사 허용: agency_user_id NULL 허용, 직접 입력 여행사명
ALTER TABLE travel_review ALTER COLUMN agency_user_id DROP NOT NULL;
ALTER TABLE travel_review ADD COLUMN IF NOT EXISTS agency_name_other TEXT;
ALTER TABLE travel_review ADD COLUMN IF NOT EXISTS travel_user_id BIGINT REFERENCES travel_user(user_no) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_travel_review_travel_user ON travel_review(travel_user_id);

-- 삭제 시 사유·일시 기록 (운영자 수동 삭제 또는 추후 관리 기능용)
ALTER TABLE travel_review ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE travel_review ADD COLUMN IF NOT EXISTS deleted_reason TEXT;

-- 2) 후기 신고 테이블
CREATE TABLE IF NOT EXISTS review_report (
  id                BIGSERIAL PRIMARY KEY,
  travel_review_id  BIGINT NOT NULL REFERENCES travel_review(id) ON DELETE CASCADE,
  reporter_user_id  BIGINT REFERENCES travel_user(user_no) ON DELETE SET NULL,
  reason            TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_review_report_review ON review_report(travel_review_id);
CREATE INDEX IF NOT EXISTS idx_review_report_status ON review_report(status);

ALTER TABLE review_report ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_review_report" ON review_report;
DROP POLICY IF EXISTS "anon_insert_review_report" ON review_report;
CREATE POLICY "anon_select_review_report" ON review_report FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_review_report" ON review_report FOR INSERT TO anon WITH CHECK (true);

-- ============================================================
-- 운영자 삭제 예시 (실행 시 아래에서 숫자만 바꿔서 사용)
/*
UPDATE travel_review
SET is_delete = 'Y', deleted_at = NOW(), deleted_reason = '신고 접수: 비방·허위'
WHERE id = 1;
*/
-- ============================================================
