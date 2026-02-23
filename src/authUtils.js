import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/** 비밀번호를 해시합니다. (회원가입/게시글 작성 시 사용) */
export function hashPassword(plainPassword) {
  return bcrypt.hashSync(plainPassword, SALT_ROUNDS);
}

/** 입력 비밀번호와 저장된 해시가 일치하는지 검사합니다. (수정/삭제 권한 확인 시 사용) */
export function comparePassword(plainPassword, hashedPassword) {
  if (!hashedPassword) return false;
  return bcrypt.compareSync(plainPassword, hashedPassword);
}

/** 유저 ID 형식 검증: 영문(대소문자) + 숫자, 3~20자 (보편적인 로그인 ID 형식) */
export function isValidUserId(userId) {
  if (!userId || typeof userId !== 'string') return false;
  return /^[a-zA-Z0-9]{3,20}$/.test(userId.trim());
}

/** 비밀번호: 8자 이상, 영문 + 숫자 조합 */
export function isPasswordValid(password) {
  if (!password || typeof password !== 'string' || password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  return hasLetter && hasDigit;
}
