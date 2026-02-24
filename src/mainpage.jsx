import React, { useState, useEffect } from 'react';
import { 
  Map, ChevronRight, Search, Building2, Star, 
  CheckCircle, Compass, Home, MessageSquareText, Users, Globe, X, Send, BarChart3, ShieldCheck, Zap, Lock
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { hashPassword, isValidUserId, isPasswordValid } from './authUtils';

const AGENCY_COLORS = ['bg-orange-50', 'bg-blue-50', 'bg-green-50', 'bg-amber-50', 'bg-sky-50'];

const MainPage = ({ onStartBuilder, onStartExplorer, onStartCommunity, onStartReviewBoard, onAgencyClick }) => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [agencyForm, setAgencyForm] = useState({
    company_name: '',
    user_id: '',
    user_pw: '',
    company_kakao_link: '',
    company_email: ''
  });
  const [agencyLogoFile, setAgencyLogoFile] = useState(null);
  const [agencyLogoPreview, setAgencyLogoPreview] = useState(null);
  const [agencySubmitting, setAgencySubmitting] = useState(false);
  const [agencyError, setAgencyError] = useState('');
  const [agencySuccess, setAgencySuccess] = useState(false);
  const [activeAgencies, setActiveAgencies] = useState([]);

  useEffect(() => {
    const fetchAgencies = async () => {
      const { data } = await supabase.from('agency_user').select('user_no, company_name, company_kakao_link, company_logo_url').eq('status', 'ACTIVE').order('user_no');
      setActiveAgencies(data || []);
    };
    fetchAgencies();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans relative">
      
      {/* --- [B2B 파트너 제안 모달] --- */}
      {isContactOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsContactOpen(false)} />
          <div className="relative bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <button onClick={() => setIsContactOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
              <X size={24} className="text-gray-400" />
            </button>
            <div className="flex flex-col lg:flex-row">
              {/* 모달 좌측: 가치 제안 (학습 내용 반영) */}
              <div className="lg:w-1/2 bg-gmg-camel p-10 text-white leading-tight">
                <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Partner</div>
                <h2 className="text-3xl font-black mb-6">몽골 여행사<br/>성공 파트너,<br/>Go몽골</h2>
                <div className="space-y-5">
                  <div className="flex gap-4">
                    <Zap size={20} className="shrink-0 text-orange-200"/>
                    <p className="text-sm opacity-90 font-medium">
                      <b>손쉬운 고객 연결:</b><br/>고객이 직접 일정표와 함께 상담 신청
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <ShieldCheck size={20} className="shrink-0 text-orange-200"/>
                    <p className="text-sm opacity-90 font-medium">
                      <b>브랜드 신뢰도:</b><br/>Go몽골 인증 마크 부여
                    </p>
                  </div>
                </div>
              </div>
              {/* 모달 우측: 빠른 회원가입 폼 */}
              <div className="lg:w-1/2 p-10 bg-white">
                <h3 className="text-xl font-black text-gray-800 mb-6">빠른 회원가입하고 입점하기</h3>
                <form
                  className="space-y-4"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!agencyForm.company_name.trim()) { setAgencyError('회사명을 입력하세요.'); return; }
                    if (!isValidUserId(agencyForm.user_id)) { setAgencyError('ID는 영문·숫자 3~20자로 입력하세요.'); return; }
                    if (!isPasswordValid(agencyForm.user_pw)) { setAgencyError('비밀번호는 영문+숫자 조합 8자 이상이어야 합니다.'); return; }
                    setAgencyError('');
                    setAgencySubmitting(true);
                    try {
                      let companyLogoUrl = null;
                      if (agencyLogoFile) {
                        const ext = agencyLogoFile.name.split('.').pop()?.toLowerCase() || 'png';
                        const path = `${agencyForm.user_id.trim()}-${Date.now()}.${ext}`;
                        const { error: uploadErr } = await supabase.storage.from('company-logo').upload(path, agencyLogoFile, { upsert: false });
                        if (uploadErr) throw uploadErr;
                        const { data: urlData } = supabase.storage.from('company-logo').getPublicUrl(path);
                        companyLogoUrl = urlData?.publicUrl ?? null;
                      }
                      const hashedPw = hashPassword(agencyForm.user_pw);
                      const { error } = await supabase.from('agency_user').insert([{
                        company_name: agencyForm.company_name.trim(),
                        user_id: agencyForm.user_id.trim(),
                        user_pw: hashedPw,
                        company_email: (agencyForm.company_email || '').trim() || '',
                        company_kakao_link: (agencyForm.company_kakao_link || '').trim() || null,
                        company_logo_url: companyLogoUrl
                      }]);
                      if (error) throw error;
                      setAgencyForm({ company_name: '', user_id: '', user_pw: '', company_kakao_link: '', company_email: '' });
                      setAgencyLogoFile(null);
                      setAgencyLogoPreview(null);
                      setAgencyError('');
                      setAgencySuccess(true);
                      setTimeout(() => {
                        setAgencySuccess(false);
                        setIsContactOpen(false);
                      }, 1800);
                    } catch (err) {
                      console.error(err);
                      setAgencyError(err?.code === '23505' ? '이미 사용 중인 ID입니다.' : (err?.message || '제출에 실패했습니다.'));
                    } finally {
                      setAgencySubmitting(false);
                    }
                  }}
                >
                  <input
                    type="text"
                    required
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-gmg-camel"
                    placeholder="회사명 *"
                    value={agencyForm.company_name}
                    onChange={(e) => setAgencyForm(f => ({ ...f, company_name: e.target.value }))}
                  />
                  <input
                    type="text"
                    required
                    maxLength={20}
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-gmg-camel"
                    placeholder="ID (영문·숫자 3~20자) *"
                    value={agencyForm.user_id}
                    onChange={(e) => setAgencyForm(f => ({ ...f, user_id: e.target.value.replace(/[^a-zA-Z0-9]/g, '') }))}
                  />
                  <div className="relative">
                    <input
                      type="password"
                      required
                      className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 pr-12 text-sm font-bold focus:ring-2 focus:ring-gmg-camel"
                      placeholder="비밀번호 (영문+숫자 8자 이상) *"
                      value={agencyForm.user_pw}
                      onChange={(e) => setAgencyForm(f => ({ ...f, user_pw: e.target.value }))}
                    />
                    <Lock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300" />
                  </div>
                  <input
                    type="url"
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-gmg-camel"
                    placeholder="카카오톡 채팅방 링크"
                    value={agencyForm.company_kakao_link}
                    onChange={(e) => setAgencyForm(f => ({ ...f, company_kakao_link: e.target.value }))}
                  />
                  <input
                    type="email"
                    className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-gmg-camel"
                    placeholder="회사 이메일 (선택)"
                    value={agencyForm.company_email}
                    onChange={(e) => setAgencyForm(f => ({ ...f, company_email: e.target.value }))}
                  />
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1.5">회사 로고 (선택)</label>
                    <div className="flex items-center gap-3">
                      <label className="shrink-0 w-14 h-14 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 cursor-pointer hover:border-gmg-camel transition-colors">
                        {agencyLogoPreview ? (
                          <img src={agencyLogoPreview} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <Building2 size={20} className="text-gray-400" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setAgencyLogoFile(file);
                              setAgencyLogoPreview(URL.createObjectURL(file));
                            } else {
                              setAgencyLogoFile(null);
                              if (agencyLogoPreview) URL.revokeObjectURL(agencyLogoPreview);
                              setAgencyLogoPreview(null);
                            }
                          }}
                        />
                      </label>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-500">이미지 선택 시 가입 후 로고로 표시됩니다.</p>
                        {agencyLogoFile && (
                          <button
                            type="button"
                            onClick={() => { setAgencyLogoFile(null); if (agencyLogoPreview) URL.revokeObjectURL(agencyLogoPreview); setAgencyLogoPreview(null); }}
                            className="text-[10px] font-bold text-red-500 mt-0.5"
                          >
                            제거
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {agencySuccess && (
                    <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-center">
                      <p className="text-sm font-black text-green-700">회원가입이 완료되었습니다.</p>
                      <p className="text-xs font-bold text-green-600 mt-1">입점 검토 후 연락드리겠습니다.</p>
                    </div>
                  )}
                  {agencyError && <p className="text-xs font-black text-red-500">{agencyError}</p>}
                  <button
                    type="submit"
                    disabled={agencySubmitting || agencySuccess}
                    className="w-full bg-gmg-camel text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-100 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-50"
                  >
                    {agencySubmitting ? '가입 중...' : <>회원가입 완료 <Send size={18} /></>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- [PC 전용 사이드바] --- */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 sticky top-0 h-screen p-8 justify-between z-50">
        <div className="space-y-10">
          <div className="flex items-center gap-2 text-gmg-camel">
            <Compass size={32} />
            <span className="text-2xl font-black italic tracking-tighter uppercase font-sans">GoMongol</span>
          </div>
          <nav className="space-y-2">
            <div className="flex items-center gap-3 p-4 bg-gmg-bg text-gmg-camel rounded-2xl font-black cursor-pointer shadow-sm shadow-orange-100/50 transition-all">
              <Home size={20} /> <span>홈</span>
            </div>
            <div onClick={onStartCommunity} className="flex items-center gap-3 p-4 text-gray-400 hover:text-gmg-camel hover:bg-orange-50/50 rounded-2xl transition-all font-bold cursor-pointer">
              <Users size={20} /> <span>동행찾기 게시판</span>
            </div>
            <div onClick={onStartReviewBoard} className="flex items-center gap-3 p-4 text-gray-400 hover:text-gmg-camel hover:bg-orange-50/50 rounded-2xl transition-all font-bold cursor-pointer">
              <MessageSquareText size={20} /> <span>여행 후기 게시판</span>
            </div>
          </nav>
        </div>
        <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-loose">
          Made by Go몽골<br/>
          <span className="hover:text-gmg-camel cursor-pointer underline transition-colors" onClick={() => setIsContactOpen(true)}>빠른 회원가입하고 입점하기</span> | Terms
        </div>
      </aside>

      {/* --- 메인 콘텐츠 영역 --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-white lg:bg-transparent">
        
        {/* 모바일 헤더 (Guest 전용) */}
        <header className="lg:hidden flex justify-center items-center px-6 py-8 bg-white border-b border-gray-100 sticky top-0 z-40">
          <h1 className="text-2xl font-black text-gmg-camel tracking-tighter cursor-default">Go몽골</h1>
        </header>

        <div className="max-w-4xl mx-auto w-full px-6 py-10 lg:py-20">
          {/* 1. Hero Section */}
          <section className="mb-12 lg:mb-20 text-center lg:text-left">
            <h2 className="text-3xl lg:text-5xl font-black text-gray-900 leading-tight">
              몽골 여행,<br />
              <span className="text-gmg-green underline decoration-wavy decoration-orange-200 underline-offset-8">시작이 막막하신가요?</span>
            </h2>
            <p className="mt-6 text-gray-500 text-sm lg:text-lg font-medium italic">가장 쉬운 일정 준비, Go몽골과 함께하세요.</p>
          </section>

          {/* 2. Main CTAs */}
          <div className="space-y-4 mb-16 lg:mb-24">
            {/* [메인] 일정 만들기 */}
            <button 
              onClick={onStartBuilder} 
              className="w-full bg-gmg-camel text-white p-7 lg:p-10 rounded-[2.5rem] flex items-center justify-between shadow-xl shadow-orange-100 hover:scale-[1.01] transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-5 text-left">
                <div className="bg-white/20 p-4 rounded-2xl"><Map size={32} /></div>
                <div>
                  <span className="block text-xl lg:text-3xl font-black">일정 만들고, 견적 상담받기</span>
                  <span className="text-sm opacity-90 font-medium tracking-tight italic">나만의 취향저격 루트 생성</span>
                </div>
              </div>
              <ChevronRight size={32} className="opacity-70" />
            </button>

            {/* [3단 그리드] 높이 조정 완료된 콤팩트 버전 */}
            <div className="grid grid-cols-3 gap-3 lg:gap-4">
              <button 
                onClick={onStartExplorer} 
                className="bg-white border-2 border-orange-50 py-4 lg:py-6 rounded-[1.8rem] lg:rounded-[2.5rem] flex flex-col items-center justify-center gap-1.5 shadow-sm hover:border-gmg-camel transition-all active:scale-95"
              >
                <div className="bg-orange-50 p-2 lg:p-3 rounded-xl lg:rounded-2xl">
                  <Search size={18} className="text-gmg-camel" />
                </div>
                <span className="text-[10px] lg:text-sm font-black text-gray-600 tracking-tighter">몽골 둘러보기</span>
              </button>
              
              <button 
                onClick={onStartCommunity} 
                className="bg-white border-2 border-gmg-green/10 py-4 lg:py-6 rounded-[1.8rem] lg:rounded-[2.5rem] flex flex-col items-center justify-center gap-1.5 shadow-sm hover:border-gmg-green transition-all active:scale-95"
              >
                <div className="bg-gmg-green/5 p-2 lg:p-3 rounded-xl lg:rounded-2xl">
                  <Users size={18} className="text-gmg-green" />
                </div>
                <span className="text-[10px] lg:text-sm font-black text-gray-600 tracking-tighter">동행 모집하기</span>
              </button>
              
              <button onClick={onStartReviewBoard} className="bg-white border-2 border-blue-50 py-4 lg:py-6 rounded-[1.8rem] lg:rounded-[2.5rem] flex flex-col items-center justify-center gap-1.5 shadow-sm hover:border-blue-400 transition-all active:scale-95">
                <div className="bg-blue-50 p-2 lg:p-3 rounded-xl lg:rounded-2xl">
                  <MessageSquareText size={18} className="text-blue-400" />
                </div>
                <span className="text-[10px] lg:text-sm font-black text-gray-600 tracking-tighter">여행후기 등록</span>
              </button>
            </div>
          </div>

          {/* 3. 인증 여행사 섹션 */}
          <section className="mb-24">
            <div className="flex justify-between items-end mb-8 px-1">
              <h3 className="text-2xl font-black text-gray-800">Go몽골 인증 여행사 ✅</h3>
              <span className="text-xs text-gray-400 font-bold border-b border-gray-200 pb-0.5 cursor-pointer">전체보기</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
              {activeAgencies.length === 0 ? (
                <p className="text-sm text-gray-400 font-bold py-8 text-center col-span-full">등록된 인증 여행사가 없습니다.</p>
              ) : (
                activeAgencies.map((agency, i) => (
                  <div
                    key={agency.user_no}
                    role="button"
                    onClick={() => onAgencyClick && onAgencyClick(agency)}
                    className="bg-white p-7 lg:p-8 rounded-[2.8rem] border border-gray-50 shadow-sm transition-all flex flex-col gap-4 hover:shadow-md cursor-pointer hover:border-gmg-camel/30"
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden ${agency.company_logo_url ? 'bg-white border border-gray-100' : AGENCY_COLORS[i % AGENCY_COLORS.length]}`}>
                        {agency.company_logo_url ? (
                          <img src={agency.company_logo_url} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <Building2 size={24} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-gray-800 lg:text-lg">{agency.company_name}</h4>
                          <CheckCircle size={16} className="text-blue-500 fill-blue-500 text-white" />
                        </div>
                        {agency.company_kakao_link && <span className="text-[10px] font-bold text-gmg-camel">견적 상담</span>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* 4. Footer */}
          <footer className="py-20 border-t border-gray-100 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="space-y-2">
              <p className="text-[12px] font-black text-gray-300 uppercase tracking-[0.2em]">
                Made by Go몽골 | <span onClick={() => setIsContactOpen(true)} className="cursor-pointer hover:text-gmg-camel underline transition-colors">빠른 회원가입하고 입점하기</span>
              </p>
              <p className="text-[11px] text-gray-200 font-medium">© 2026 GoMongol. All rights reserved. <span className="ml-2 hover:underline cursor-pointer">사업자정보확인</span></p>
            </div>
            <div className="flex gap-8">
              {['Instagram', 'Blog', 'Kakao'].map(sns => (
                <span key={sns} className="text-[11px] font-black text-gray-300 hover:text-gmg-camel cursor-pointer uppercase tracking-widest transition-colors">{sns}</span>
              ))}
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default MainPage;