import React from 'react';
import { 
  ChevronLeft, MessageCircle, Users, Calendar, 
  Hash, Plus, Clock, Home, Compass, MessageSquareText, Globe 
} from 'lucide-react';

const CommunityBoard = ({ onBack }) => {
  // 샘플 데이터 (데이터가 많아도 그리드 덕분에 시원하게 보입니다)
  const posts = [
    { id: 1, status: "동행 미확정", title: "6월 중순 남고비 5박 6일 같이 가실 분! 20대 환영", timeAgo: "2시간 전", nickname: "고비요정", date: "2026.06.15", people: "2/4", regions: ["남고비", "중부"], chatLink: "#" },
    { id: 2, status: "항공발권 완료", title: "홉스굴 북부 코스 7박 8일 동행 1분 더 모십니다", timeAgo: "1일 전", nickname: "북부마스터", date: "2026.07.10", people: "5/6", regions: ["북부/홉스굴"], chatLink: "#" },
    { id: 3, status: "출발 확정", title: "몽골 은하수 출사 여행 가실 분 계신가요? 장비 환영", timeAgo: "2일 전", nickname: "카메라맨", date: "2026.08.05", people: "3/4", regions: ["남고비", "테를지"], chatLink: "#" },
    { id: 4, status: "투어사 확정", title: "이미 예약 완료! 인원 충원해서 투어비 낮춰봐요", timeAgo: "3일 전", nickname: "이지조이", date: "2026.06.20", people: "4/6", regions: ["중부/힐링"], chatLink: "#" },
    { id: 5, status: "동행 미확정", title: "여자 3명인데 한 분 더 채워서 델리카 타고 싶어요", timeAgo: "5시간 전", nickname: "초원소녀", date: "2026.09.01", people: "3/4", regions: ["남고비"], chatLink: "#" },
    { id: 6, status: "항공발권 완료", title: "울란바토르 시내 투어 및 근교 짧게 가실 분?", timeAgo: "12시간 전", nickname: "단기여행자", date: "2026.05.20", people: "1/4", regions: ["테를지"], chatLink: "#" },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case '출발 확정': return 'bg-gmg-green text-white';
      case '항공발권 완료': return 'bg-blue-500 text-white';
      case '투어사 확정': return 'bg-orange-400 text-white';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      
      {/* --- [PC 전용] 좌측 사이드바 (MainPage와 동일) --- */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 sticky top-0 h-screen p-8 justify-between z-50">
        <div className="space-y-10">
          <div className="flex items-center gap-2 text-gmg-camel">
            <Compass size={32} />
            <span className="text-2xl font-black italic tracking-tighter uppercase">GoMongol</span>
          </div>
          <nav className="space-y-2">
            <div onClick={onBack} className="flex items-center gap-3 p-4 text-gray-400 hover:text-gmg-camel hover:bg-orange-50/50 rounded-2xl transition-all font-bold cursor-pointer">
              <Home size={20} /> <span>홈</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gmg-bg text-gmg-camel rounded-2xl font-black cursor-pointer shadow-sm shadow-orange-100/50">
              <Users size={20} /> <span>동행찾기 게시판</span>
            </div>
            <div className="flex items-center gap-3 p-4 text-gray-400 hover:text-gmg-camel hover:bg-orange-50/50 rounded-2xl transition-all font-bold cursor-pointer">
              <MessageSquareText size={20} /> <span>여행 후기 게시판</span>
            </div>
          </nav>
        </div>
        <div className="text-[10px] text-gray-300 font-bold uppercase tracking-widest leading-loose">
          Made by Go몽골<br/>Contact Us | Terms
        </div>
      </aside>

      {/* --- 메인 콘텐츠 피드 --- */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Header (모바일 뒤로가기 포함) */}
        <header className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100 sticky top-0 z-40 lg:px-10 lg:py-8 lg:bg-transparent lg:border-none">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl lg:text-3xl font-black text-gray-800">동행 찾기 🐪</h1>
          </div>
          <button className="hidden lg:flex items-center gap-2 bg-gmg-green text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-green-100 hover:scale-105 transition-all">
            <Plus size={18} /> 동행 글올리기
          </button>
        </header>

        {/* 게시글 리스트 그리드 */}
        <div className="p-6 lg:px-10 lg:pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
            {posts.map(post => (
              <div key={post.id} className="bg-white p-5 lg:p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-1">
                
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${getStatusColor(post.status)}`}>
                      {post.status}
                    </span>
                    <span className="text-gray-300 text-[10px] font-bold flex items-center gap-1">
                      <Clock size={12} /> {post.timeAgo}
                    </span>
                  </div>

                  <h3 className="font-black text-gray-800 text-base lg:text-lg leading-tight mb-4 line-clamp-2">
                    {post.title}
                  </h3>

                  <div className="flex flex-wrap gap-3 text-[11px] text-gray-400 font-bold mb-6">
                    <span className="flex items-center gap-1"><Calendar size={13} className="opacity-60"/> {post.date}</span>
                    <span className="flex items-center gap-1"><Users size={13} className="opacity-60"/> {post.people}</span>
                    <span className="ml-auto text-gray-300 font-medium">by {post.nickname}</span>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 mb-5 border-t border-gray-50 pt-4">
                    {post.regions.map(region => (
                      <div key={region} className="bg-gmg-green/5 text-gmg-green px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1">
                        <Hash size={10} /> {region}
                      </div>
                    ))}
                  </div>

                  <button className="w-full bg-gmg-camel text-white py-3.5 rounded-2xl font-black text-xs lg:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-100 active:scale-95 transition-all">
                    <MessageCircle size={16} /> 오픈채팅 참여하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 모바일 전용 플로팅 버튼 */}
      <button className="fixed bottom-8 right-8 lg:hidden w-14 h-14 bg-gmg-green text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all z-50">
        <Plus size={28} />
      </button>
    </div>
  );
};

export default CommunityBoard;