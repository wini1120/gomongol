import React, { useState } from 'react';
import { 
  Map, ChevronRight, Search, Building2, Star, 
  CheckCircle, Compass, Home, MessageSquareText, Users, Globe, X, Send, BarChart3, ShieldCheck, Zap
} from 'lucide-react';

const MainPage = ({ onStartBuilder, onStartExplorer, onStartCommunity }) => {
  const [isContactOpen, setIsContactOpen] = useState(false); // 파트너 문의 모달 상태

  // 위니님이 학습시킨 실제 파트너 여행사 데이터
  const agencies = [
    { id: 1, name: "이지조이트래블", rating: 4.9, reviews: 128, color: "bg-orange-50", desc: "고비 사막 투어 전문 | 한국어 가이드 배정" },
    { id: 2, name: "고비트래블", rating: 4.8, reviews: 95, color: "bg-blue-50", desc: "프리미엄 럭셔리 게르 | 최신 스타리아 보유" },
    { id: 3, name: "푸제투어", rating: 4.7, reviews: 210, color: "bg-green-50", desc: "북부 홉스굴 전문 | 승마 트레킹 특화" },
  ];

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
              {/* 모달 우측: 신청 폼 */}
              <div className="lg:w-1/2 p-10 bg-white">
                <h3 className="text-xl font-black text-gray-800 mb-6">입점 문의하기</h3>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <input type="text" className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-gmg-camel" placeholder="여행사 이름" />
                  <input type="text" className="w-full bg-gray-50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-gmg-camel" placeholder="담당자 연락처 (카톡 ID 등)" />
                  <button className="w-full bg-gmg-camel text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-100 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">신청 완료하기 <Send size={18} /></button>
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
            <div className="flex items-center gap-3 p-4 text-gray-400 hover:text-gmg-camel hover:bg-orange-50/50 rounded-2xl transition-all font-bold cursor-pointer">
              <MessageSquareText size={20} /> <span>여행 후기 게시판</span>
            </div>
          </nav>
        </div>
        <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-loose">
          Made by Go몽골<br/>
          <span className="hover:text-gmg-camel cursor-pointer underline transition-colors" onClick={() => setIsContactOpen(true)}>Contact Us</span> | Terms
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
              
              <button className="bg-white border-2 border-blue-50 py-4 lg:py-6 rounded-[1.8rem] lg:rounded-[2.5rem] flex flex-col items-center justify-center gap-1.5 shadow-sm hover:border-blue-400 transition-all active:scale-95">
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
              {agencies.map(agency => (
                <div key={agency.id} className="bg-white p-7 lg:p-8 rounded-[2.8rem] border border-gray-50 shadow-sm hover:shadow-md transition-all flex flex-col gap-4">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 ${agency.color} rounded-2xl flex items-center justify-center shrink-0`}>
                      <Building2 size={24} className="text-gray-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-black text-gray-800 lg:text-lg">{agency.name}</h4>
                        <CheckCircle size={16} className="text-blue-500 fill-blue-500 text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Star size={14} className="text-orange-400 fill-orange-400" />
                        <span className="text-sm font-bold text-gray-600">{agency.rating}</span>
                        <span className="text-[10px] text-gray-300 font-bold uppercase ml-1 tracking-tighter">Reviews {agency.reviews}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Footer */}
          <footer className="py-20 border-t border-gray-100 text-center lg:text-left flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="space-y-2">
              <p className="text-[12px] font-black text-gray-300 uppercase tracking-[0.2em]">
                Made by Go몽골 | <span onClick={() => setIsContactOpen(true)} className="cursor-pointer hover:text-gmg-camel underline transition-colors">Contact Us</span>
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