import React from 'react';
import { Compass, Users, Map, User, ChevronRight } from 'lucide-react';

// 1. props로 onStartBuilder를 받아옵니다.
const MainPage = ({ onStartBuilder }) => {
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
        <p className="mt-3 text-gray-500 text-sm">
          가장 쉬운 일정 준비, Go몽골과 함께하세요.
        </p>
      </section>

      {/* 3. Main CTAs */}
      <div className="px-6 space-y-4">
        {/* 일정 만들기 버튼 - onClick 연결 완료 */}
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
              <span className="text-sm opacity-90">취향대로 코스 고르고 바로 견적받기</span>
            </div>
          </div>
          <ChevronRight size={24} className="opacity-70" />
        </button>

        {/* 동행 찾기 버튼 */}
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

      {/* 4. Popular Courses Preview */}
      <section className="mt-10 px-6 pb-24">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-bold text-gray-800">지금 인기 있는 코스 🔥</h3>
          <span className="text-xs text-gray-400 font-medium cursor-pointer">더보기</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {/* 코스 카드 1 */}
          <div className="min-w-[200px] bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="w-full h-24 bg-orange-50 rounded-lg mb-3 flex items-center justify-center text-3xl">
              🐪
            </div>
            <h4 className="font-bold text-gray-700">남고비 정석 6일</h4>
            <div className="mt-2 flex gap-1 flex-wrap">
              <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">#사막</span>
              <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">#별보기</span>
            </div>
          </div>
          {/* 코스 카드 2 */}
          <div className="min-w-[200px] bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="w-full h-24 bg-green-50 rounded-lg mb-3 flex items-center justify-center text-3xl">
              🌿
            </div>
            <h4 className="font-bold text-gray-700">중부 힐링 5일</h4>
            <div className="mt-2 flex gap-1 flex-wrap">
              <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">#온천</span>
              <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-500">#승마</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom Navigation Bar */}
      <nav className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 px-8 py-3 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col items-center gap-1 text-gmg-camel cursor-pointer">
          <Compass size={24} />
          <span className="text-[10px] font-bold">홈</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-300 cursor-pointer">
          <Map size={24} />
          <span className="text-[10px]">내 일정</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-300 cursor-pointer">
          <Users size={24} />
          <span className="text-[10px]">커뮤니티</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-300 cursor-pointer">
          <User size={24} />
          <span className="text-[10px]">마이</span>
        </div>
      </nav>
    </div>
  );
};

export default MainPage;