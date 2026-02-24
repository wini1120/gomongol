-- ============================================================
-- 여행사 유저(agency_user) 테이블 생성 (Supabase SQL Editor에서 실행)
-- ============================================================
-- 비밀번호는 travel_user와 동일하게 앱에서 bcrypt 해시 후
-- user_pw 컬럼에 저장합니다. DB에는 해시 문자열만 저장.
-- ============================================================

-- 1) 테이블 생성
CREATE TABLE IF NOT EXISTS agency_user (
  user_no              BIGSERIAL PRIMARY KEY,   -- 유저넘버 (자동 증가)
  user_id              TEXT NOT NULL UNIQUE,    -- 로그인 ID (중복 불가)
  user_pw              TEXT NOT NULL,           -- 로그인 PW (앱에서 bcrypt 해시 후 저장)
  company_name         TEXT NOT NULL,           -- 회사명
  company_email        TEXT NOT NULL,           -- 회사 이메일
  company_kakao_link   TEXT,                    -- 회사 카카오톡 채널 링크 (선택)
  company_logo_url     TEXT,                    -- 회사 로고 이미지 URL (선택, 상담 여행사 선택 등에 표시)
  status              TEXT NOT NULL DEFAULT 'RECEIVED',  -- RECEIVED(접수) | ACTIVE(활동중) | DONE(활동중단)
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- 2) 인덱스
CREATE INDEX IF NOT EXISTS idx_agency_user_user_id ON agency_user(user_id);
CREATE INDEX IF NOT EXISTS idx_agency_user_company_email ON agency_user(company_email);
CREATE INDEX IF NOT EXISTS idx_agency_user_status ON agency_user(status);

-- [이미 agency_user 테이블이 있는 경우] status 컬럼만 추가하려면 아래만 실행:
-- ALTER TABLE agency_user ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'RECEIVED';

-- 3) RLS 활성화
ALTER TABLE agency_user ENABLE ROW LEVEL SECURITY;

-- 4) 정책 (재실행 시 기존 정책 제거 후 생성)
DROP POLICY IF EXISTS "anon_insert_agency_user" ON agency_user;
DROP POLICY IF EXISTS "anon_select_agency_user" ON agency_user;

-- anon: 여행사 회원가입(insert) 허용
CREATE POLICY "anon_insert_agency_user"
  ON agency_user FOR INSERT
  TO anon
  WITH CHECK (true);

-- anon: 로그인/조회(select) 허용 (ID·PW 검증 시 필요)
CREATE POLICY "anon_select_agency_user"
  ON agency_user FOR SELECT
  TO anon
  USING (true);

-- ============================================================
-- 참고: 비밀번호 해시 처리
-- ============================================================
-- DB에는 해시만 저장합니다. 앱에서 가입/비밀번호 변경 시
-- bcrypt.hashSync(plainPassword, 10) 결과를 user_pw에 insert/update 하세요.
-- 로그인 검증 시 bcrypt.compareSync(입력값, user_pw) 사용 (travel_user와 동일).
