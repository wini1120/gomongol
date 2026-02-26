import React, { useState, useEffect } from 'react';
import { ChevronLeft, Upload, X, Lock, User } from 'lucide-react';
import { supabase } from './supabaseClient';
import { hashPassword, comparePassword, isValidUserId, isPasswordValid } from './authUtils';

const REGIONS = [
  { value: '고비', label: '고비' },
  { value: '홉스골', label: '홉스골' },
  { value: '중부', label: '중부' },
];

const MAX_PHOTOS = 5;
const AGENCY_OTHER = 'other';

const ReviewWrite = ({ onBack, onSuccess }) => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [authUser, setAuthUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ userId: '', userPw: '' });
  const [signupForm, setSignupForm] = useState({ userId: '', userPw: '', userName: '', nickname: '' });
  const [authLoading, setAuthLoading] = useState(false);

  const [form, setForm] = useState({
    agency_user_id: '',
    agency_name_other: '',
    title: '',
    nights: 1,
    people: 1,
    regions: ['고비'],
    description: '',
    writer_nickname: '',
    reviewed_after_use: true,
  });
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const { data, error: e } = await supabase
        .from('agency_user')
        .select('user_no, company_name')
        .in('status', ['ACTIVE', 'DONE'])
        .order('company_name');
      if (e) {
        console.error(e);
        setAgencies([]);
      } else {
        setAgencies(data || []);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleFileChange = (e) => {
    const chosen = Array.from(e.target.files || []);
    const combined = [...files, ...chosen].slice(0, MAX_PHOTOS);
    setFiles(combined);
    const newPreviews = combined.map((f) => URL.createObjectURL(f));
    filePreviews.forEach((url) => URL.revokeObjectURL(url));
    setFilePreviews(newPreviews);
  };

  const removeFile = (index) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    const nextPreviews = next.map((f) => URL.createObjectURL(f));
    filePreviews.forEach((url) => URL.revokeObjectURL(url));
    setFilePreviews(nextPreviews);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidUserId(loginForm.userId)) {
      setError('ID는 영문·숫자 3~20자로 입력해 주세요.');
      return;
    }
    if (!isPasswordValid(loginForm.userPw)) {
      setError('비밀번호는 영문+숫자 8자 이상이어야 합니다.');
      return;
    }
    setAuthLoading(true);
    try {
      const { data, error: err } = await supabase.from('travel_user').select('user_no, user_id, user_pw, nickname').eq('user_id', loginForm.userId.trim()).maybeSingle();
      if (err) throw err;
      if (!data || !comparePassword(loginForm.userPw, data.user_pw)) {
        setError('ID 또는 비밀번호가 맞지 않습니다.');
        return;
      }
      setAuthUser({ user_no: data.user_no, user_id: data.user_id, nickname: data.nickname || '' });
      setForm((f) => ({ ...f, writer_nickname: (data.nickname || '').trim() || f.writer_nickname }));
    } catch (err) {
      console.error(err);
      setError(err?.message || '로그인에 실패했습니다.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidUserId(signupForm.userId)) {
      setError('ID는 영문·숫자 3~20자로 입력해 주세요.');
      return;
    }
    if (!isPasswordValid(signupForm.userPw)) {
      setError('비밀번호는 영문+숫자 8자 이상이어야 합니다.');
      return;
    }
    const nick = (signupForm.nickname || '').trim();
    if (nick.length < 2 || nick.length > 10) {
      setError('닉네임은 2~10자로 입력해 주세요.');
      return;
    }
    setAuthLoading(true);
    try {
      const hashedPw = hashPassword(signupForm.userPw);
      const { data, error: err } = await supabase.from('travel_user').insert([{
        user_id: signupForm.userId.trim(),
        user_pw: hashedPw,
        nickname: nick,
        user_name: (signupForm.userName || '').trim() || nick,
      }]).select('user_no, user_id, nickname').single();
      if (err) throw err;
      setAuthUser({ user_no: data.user_no, user_id: data.user_id, nickname: data.nickname || '' });
      setForm((f) => ({ ...f, writer_nickname: nick }));
    } catch (err) {
      console.error(err);
      setError(err?.code === '23505' ? '이미 사용 중인 ID입니다.' : (err?.message || '회원가입에 실패했습니다.'));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!authUser?.user_no) {
      setError('로그인이 필요합니다.');
      return;
    }
    const isOtherAgency = form.agency_user_id === AGENCY_OTHER;
    if (!form.agency_user_id) {
      setError('여행사를 선택하거나 기타를 입력해 주세요.');
      return;
    }
    if (isOtherAgency && !(form.agency_name_other || '').trim()) {
      setError('미등록 여행사명을 입력해 주세요.');
      return;
    }
    if (!form.title.trim()) {
      setError('제목을 입력해 주세요.');
      return;
    }
    if (files.length === 0) {
      setError('사진을 1장 이상 첨부해 주세요.');
      return;
    }
    if (!form.regions?.length) {
      setError('여행 지역을 최소 1개 선택해 주세요.');
      return;
    }
    const nick = (form.writer_nickname || '').trim();
    if (nick.length < 2 || nick.length > 10) {
      setError('작성자 닉네임은 2~10자로 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const { data: reviewRow, error: insertErr } = await supabase
        .from('travel_review')
        .insert({
          agency_user_id: isOtherAgency ? null : Number(form.agency_user_id),
          agency_name_other: isOtherAgency ? (form.agency_name_other || '').trim() || null : null,
          title: form.title.trim(),
          nights: Number(form.nights) || 1,
          people: Number(form.people) || 1,
          region: Array.isArray(form.regions) && form.regions.length ? form.regions.join(',') : '고비',
          description: (form.description || '').trim() || null,
          thumbnail_url: null,
          writer_nickname: (form.writer_nickname || '').trim() || null,
          reviewed_after_use: !!form.reviewed_after_use,
          travel_user_id: authUser.user_no,
        })
        .select('id')
        .single();
      if (insertErr) throw insertErr;
      const reviewId = reviewRow.id;

      const prefix = `review-${reviewId}-${Date.now()}`;
      let thumbnailUrl = null;
      const photoRows = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
        const path = `${prefix}-${i}.${ext || 'jpg'}`;
        const { error: uploadErr } = await supabase.storage.from('review-photos').upload(path, file, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from('review-photos').getPublicUrl(path);
        const url = urlData?.publicUrl || '';
        if (i === 0) thumbnailUrl = url;
        photoRows.push({ travel_review_id: reviewId, image_url: url, sort_order: i + 1 });
      }

      await supabase.from('travel_review').update({ thumbnail_url: thumbnailUrl }).eq('id', reviewId);
      if (photoRows.length) {
        await supabase.from('review_photo').insert(photoRows);
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err?.message || '저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="font-black text-gray-400 italic">로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center gap-3 px-6 py-5">
          <button type="button" onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <img src="/gomongol_logo.png" alt="Go몽골" className="h-6 w-auto object-contain hidden sm:block" />
          <h1 className="text-xl font-black text-gray-800">여행 후기 작성</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 pb-24">
        {!authUser ? (
          <div className="space-y-6">
            <p className="text-sm text-gray-600">후기 작성은 로그인이 필요해요. 동행찾기에서 쓰는 계정으로 로그인하거나 새로 가입하세요.</p>
            {/* 로그인 / 회원가입 탭 */}
            <div className="flex rounded-2xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setError(''); }}
                className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${authMode === 'login' ? 'bg-white text-gmg-camel shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setError(''); }}
                className={`flex-1 py-3 rounded-xl text-sm font-black transition-all ${authMode === 'signup' ? 'bg-white text-gmg-camel shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                회원가입
              </button>
            </div>
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase mb-1">ID</label>
                  <input type="text" value={loginForm.userId} onChange={(e) => setLoginForm((f) => ({ ...f, userId: e.target.value.replace(/[^a-zA-Z0-9]/g, '') }))} placeholder="영문·숫자 3~20자" className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-base font-bold outline-none focus:ring-2 focus:ring-gmg-camel" maxLength={20} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase mb-1">비밀번호</label>
                  <div className="relative">
                    <input type="password" value={loginForm.userPw} onChange={(e) => setLoginForm((f) => ({ ...f, userPw: e.target.value }))} placeholder="영문+숫자 8자 이상" className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-base font-bold outline-none focus:ring-2 focus:ring-gmg-camel pr-12" />
                    <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  </div>
                </div>
                {error && <p className="text-sm font-black text-red-500">{error}</p>}
                <button type="submit" disabled={authLoading} className="w-full h-12 rounded-2xl bg-gmg-camel text-white font-black disabled:opacity-50">{authLoading ? '로그인 중...' : '로그인'}</button>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase mb-1">ID *</label>
                  <input type="text" value={signupForm.userId} onChange={(e) => setSignupForm((f) => ({ ...f, userId: e.target.value.replace(/[^a-zA-Z0-9]/g, '') }))} placeholder="영문·숫자 3~20자" className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-base font-bold outline-none focus:ring-2 focus:ring-gmg-camel" maxLength={20} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase mb-1">비밀번호 *</label>
                  <input type="password" value={signupForm.userPw} onChange={(e) => setSignupForm((f) => ({ ...f, userPw: e.target.value }))} placeholder="영문+숫자 8자 이상" className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-base font-bold outline-none focus:ring-2 focus:ring-gmg-camel" />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase mb-1">닉네임 * (2~10자)</label>
                  <input type="text" value={signupForm.nickname} onChange={(e) => setSignupForm((f) => ({ ...f, nickname: e.target.value }))} placeholder="후기·동행찾기에서 표시될 이름" className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-base font-bold outline-none focus:ring-2 focus:ring-gmg-camel" maxLength={10} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 uppercase mb-1">이름 (선택)</label>
                  <input type="text" value={signupForm.userName} onChange={(e) => setSignupForm((f) => ({ ...f, userName: e.target.value }))} placeholder="실명 또는 별명" className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-base font-bold outline-none focus:ring-2 focus:ring-gmg-camel" />
                </div>
                {error && <p className="text-sm font-black text-red-500">{error}</p>}
                <button type="submit" disabled={authLoading} className="w-full h-12 rounded-2xl bg-gmg-camel text-white font-black disabled:opacity-50">{authLoading ? '가입 중...' : '회원가입'}</button>
              </form>
            )}
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase mb-2">여행사 선택 *</label>
            <select
              value={form.agency_user_id}
              onChange={(e) => setForm((f) => ({ ...f, agency_user_id: e.target.value, agency_name_other: e.target.value === AGENCY_OTHER ? f.agency_name_other : '' }))}
              className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-gmg-camel"
            >
              <option value="">선택하세요</option>
              {agencies.map((a) => (
                <option key={a.user_no} value={a.user_no}>{a.company_name}</option>
              ))}
              <option value={AGENCY_OTHER}>기타 (미등록 여행사)</option>
            </select>
            {form.agency_user_id === AGENCY_OTHER && (
              <input
                type="text"
                value={form.agency_name_other}
                onChange={(e) => setForm((f) => ({ ...f, agency_name_other: e.target.value }))}
                placeholder="여행사명 직접 입력"
                className="mt-2 w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-base font-bold outline-none focus:ring-2 focus:ring-gmg-camel"
                maxLength={100}
              />
            )}
            {agencies.length === 0 && form.agency_user_id !== AGENCY_OTHER && (
              <p className="text-xs text-amber-600 font-bold mt-1">인증된 여행사가 없으면 기타를 선택 후 여행사명을 입력하세요.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase mb-2">작성자 닉네임 *</label>
            <input
              type="text"
              value={form.writer_nickname}
              onChange={(e) => setForm((f) => ({ ...f, writer_nickname: e.target.value }))}
              placeholder="후기에 표시될 이름 (2~10자, 실명 아님)"
              className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-base font-bold outline-none focus:ring-2 focus:ring-gmg-camel"
              maxLength={10}
            />
            <p className="text-[10px] text-gray-400 mt-1">실제 이름 없이 필명만 표시되어 신뢰도를 높여요.</p>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase mb-2">제목 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="예: 남고비 사막 완주"
              className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-gmg-camel"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase mb-2">사진 (최대 5장, 첫 사진이 썸네일) *</label>
            <div className="flex flex-wrap gap-3">
              {filePreviews.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeFile(i)} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70">
                    <X size={14} />
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-gmg-camel text-white text-[9px] font-black rounded">대표</span>}
                </div>
              ))}
              {files.length < MAX_PHOTOS && (
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-gmg-camel hover:bg-orange-50/30 transition-colors">
                  <Upload size={24} className="text-gray-400" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2">몇 박 며칠</label>
              <select
                value={form.nights}
                onChange={(e) => setForm((f) => ({ ...f, nights: Number(e.target.value) }))}
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-gmg-camel"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n}박 {n + 1}일</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2">인원 수</label>
              <select
                value={form.people}
                onChange={(e) => setForm((f) => ({ ...f, people: Number(e.target.value) }))}
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-gmg-camel"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n}명</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase mb-2">여행 지역 (복수 선택 가능)</label>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => {
                const selected = form.regions.includes(r.value);
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => {
                      setForm((f) => ({
                        ...f,
                        regions: selected ? f.regions.filter((x) => x !== r.value) : [...f.regions, r.value],
                      }));
                    }}
                    className={`h-12 px-5 rounded-2xl border text-sm font-black transition-all ${selected ? 'bg-gmg-camel text-white border-gmg-camel' : 'bg-white border-gray-200 text-gray-600 hover:border-gmg-camel'}`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
            {form.regions.length === 0 && <p className="text-xs text-amber-600 font-bold mt-1">최소 1개 지역을 선택해 주세요.</p>}
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
            <input
              type="checkbox"
              id="reviewed_after_use"
              checked={form.reviewed_after_use}
              onChange={(e) => setForm((f) => ({ ...f, reviewed_after_use: e.target.checked }))}
              className="mt-1 rounded border-gray-300 text-gmg-camel focus:ring-gmg-camel"
            />
            <label htmlFor="reviewed_after_use" className="text-sm font-bold text-gray-700 cursor-pointer">
              해당 여행사를 이용한 뒤 작성한 후기예요. (체크 시 ‘이용 후 작성’으로 표시되어 더 신뢰돼요.)
            </label>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase mb-2">후기 내용 (선택)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="여행 코스나 느낌을 자유롭게 적어 주세요."
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-gmg-camel resize-none"
            />
          </div>

          {error && <p className="text-sm font-black text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 rounded-2xl bg-gmg-camel text-white font-black text-base shadow-lg shadow-orange-100 disabled:opacity-50"
          >
            {submitting ? '등록 중...' : '후기 등록하기'}
          </button>
        </form>
        )}
      </main>
    </div>
  );
};

export default ReviewWrite;
