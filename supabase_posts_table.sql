-- ============================================================
-- posts 테이블 재구성 SQL (Supabase SQL Editor에서 실행)
-- ============================================================
-- travel_user, schedules에는 데이터가 들어가는데 posts에만 안 들어가는 경우
-- 컬럼/제약조건 불일치일 수 있으므로 아래 순서로 실행하세요.
-- ============================================================

-- 1) 기존 posts 테이블이 있다면 삭제 (reports 테이블이 post_id FK로 참조 중이면 CASCADE로 함께 제거됨)
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS posts CASCADE;

-- 2) posts 테이블 생성 (앱에서 insert하는 컬럼과 동일하게 구성)
CREATE TABLE posts (
  id                BIGSERIAL PRIMARY KEY,
  schedule_id       BIGINT NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  schedule_uuid     UUID,
  status            TEXT NOT NULL DEFAULT '모집 중',
  title             TEXT NOT NULL,
  description       TEXT,
  chat_link         TEXT,
  current_people    INT NOT NULL DEFAULT 1,
  target_ages       JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_gender     TEXT NOT NULL DEFAULT '무관',
  nickname          TEXT NOT NULL,
  travel_user_id    BIGINT REFERENCES travel_user(user_no),
  is_delete         CHAR(1) NOT NULL DEFAULT 'X',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3) 인덱스 (게시판 목록 조회·필터용)
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_posts_is_delete ON posts(is_delete);
CREATE INDEX idx_posts_schedule_id ON posts(schedule_id);
CREATE INDEX idx_posts_travel_user_id ON posts(travel_user_id);

-- 4) RLS 활성화 (anon이 읽기/쓰기 가능하도록 정책 필요 시)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 기존 정책이 있으면 제거 후 생성 (스크립트 재실행 시 오류 방지)
DROP POLICY IF EXISTS "anon_select_posts" ON posts;
DROP POLICY IF EXISTS "anon_insert_posts" ON posts;
DROP POLICY IF EXISTS "anon_update_posts" ON posts;

CREATE POLICY "anon_select_posts"
  ON posts FOR SELECT TO anon USING (true);

CREATE POLICY "anon_insert_posts"
  ON posts FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "anon_update_posts"
  ON posts FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- 5) reports 테이블 재생성 (신고 기능 사용 시)
CREATE TABLE reports (
  id        BIGSERIAL PRIMARY KEY,
  post_id   BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reason    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_insert_reports" ON reports;
CREATE POLICY "anon_insert_reports" ON reports FOR INSERT TO anon WITH CHECK (true);
