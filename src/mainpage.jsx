import React from 'react';
import { Compass, Users, Map, User, ChevronRight, Search } from 'lucide-react';

const MainPage = ({ onStartBuilder, onStartExplorer }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gmg-bg font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative text-gray-800">
      
      {/* 1. Header */}
      <header className="flex justify-between items-center px-6 py-5 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-black text-gmg-camel tracking-tighter cursor-default">Go몽골</h1>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <User size={24} className="text-gray-600" />
        </button>
      </header>

      {/* 2. Hero Section */}
      <section className="px-6 py-8 bg-gradient-to-b from-white to-gmg-bg">
        <h2 className="text-3xl font-bold text-gray-800 leading-tight">
          몽골 여행,<br />
          <span className="text-gmg-green">시작이 막막하신가요?</span>
        </h2>
        <p className="mt-3 text-gray-500 text-sm">가장 쉬운 일정 준비, Go몽골과 함께하세요.</p>
      </section>

      {/* 3. Main CTAs - 순서 변경 완료! */}
      <div className="px-6 space-y-4">
        
        {/* [1순위] 일정 만들기 & 견적 상담 (메인 전환 버튼) */}
        <button 
          onClick={onStartBuilder} 
          className="w-full bg-gmg-camel hover:bg-[#C29262] text-white p-6 rounded-2xl flex items-center justify-between shadow-lg shadow-orange-100 transition-all transform active:scale-95"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="bg-white/20 p-3 rounded-xl">
              <Map size={28} />
            </div>
            <div>
              <span className="block text-lg font-bold">일정 만들고, 견적 상담받기</span>
              <span className="text-sm opacity-90">코스 고르고 바로 견적받기</span>
            </div>
          </div>
          <ChevronRight size={24} className="opacity-70" />
        </button>

        {/* [2순위] 몽골 투어 둘러보기 (정보 탐색 버튼) */}
        <button 
          onClick={onStartExplorer} 
          className="w-full bg-white border-2 border-orange-100 hover:bg-orange-50/30 text-gray-800 p-6 rounded-2xl flex items-center justify-between transition-all transform active:scale-95 shadow-sm"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="bg-orange-100/50 p-3 rounded-xl">
              <Search size={28} className="text-gmg-camel" />
            </div>
            <div>
              <span className="block text-lg font-bold">몽골 투어 둘러보기</span>
              <span className="text-sm text-gray-500 font-normal">어디로 갈지 고민된다면 먼저 구경하기</span>
            </div>
          </div>
          <ChevronRight size={24} className="opacity-30" />
        </button>

        {/* [3순위] 동행 찾기 */}
        <button 
          className="w-full bg-white border-2 border-gmg-green hover:bg-gray-50 text-gmg-green p-6 rounded-2xl flex items-center justify-between transition-all transform active:scale-95 shadow-sm"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="bg-gmg-green/10 p-3 rounded-xl">
              <Users size={28} />
            </div>
            <div>
              <span className="block text-lg font-bold">동행 찾기</span>
              <span className="text-sm text-gray-500 font-normal">마음 맞는 사람들과 n분의 1 하기</span>
            </div>
          </div>
          <ChevronRight size={24} className="opacity-70" />
        </button>
      </div>

      {/* 4. Bottom Nav Bar 등은 기존과 동일... */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 px-8 py-3 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col items-center gap-1 text-gmg-camel cursor-pointer"><Compass size={24} /><span className="text-[10px] font-bold">홈</span></div>
        <div className="flex flex-col items-center gap-1 text-gray-300 cursor-pointer"><Map size={24} /><span className="text-[10px]">내 일정</span></div>
        <div className="flex flex-col items-center gap-1 text-gray-300 cursor-pointer"><Users size={24} /><span className="text-[10px]">커뮤니티</span></div>
        <div className="flex flex-col items-center gap-1 text-gray-300 cursor-pointer"><User size={24} /><span className="text-[10px]">마이</span></div>
      </nav>
    </div>
  );
};

export default MainPage;