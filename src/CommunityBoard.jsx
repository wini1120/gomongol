import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, MessageCircle, Users, Calendar, 
  Hash, Plus, Clock, Home, Compass, MessageSquareText, Globe 
} from 'lucide-react';
import { supabase } from './supabaseClient';

const CommunityBoard = ({ onBack, onStartBuilder }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. 수파베이스 실시간 데이터 가져오기 (Join 포함)
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            schedules!posts_schedule_id_fkey (*) 
          `) // <--- 이 부분이 수정되었습니다! 명시적으로 fkey를 지정함
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (e) {
        console.error('로드 실패:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // 2. 시간 변환 함수
  const getTimeAgo = (date) => {
    const start = new Date(date);
    const end = new Date();
    const diff = (end - start) / 1000 / 60;
    if (diff < 60) return `${Math.floor(diff)}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    return `${Math.floor(diff / 1440)}일 전`;
  };

  // 3. 기존의 상태별 색상 로직
  const getStatusColor = (status) => {
    switch(status) {
      case '출발 확정': return 'bg-gmg-green text-white';
      case '항공권 발권완료': return 'bg-blue-500 text-white';
      case '투어사 확정': return 'bg-orange-400 text-white';
      default: return 'bg-gray-100 text-gray-400';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans max-w-[1920px] mx-auto">
      
      {/* --- [PC 전용] 좌측 사이드바 --- */}
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
        
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100 sticky top-0 z-40 lg:px-10 lg:py-8 lg:bg-transparent lg:border-none">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl lg:text-3xl font-black text-gray-800">동행 찾기 🐪</h1>
          </div>
          <button 
            onClick={onStartBuilder}
            className="hidden lg:flex items-center gap-2 bg-gmg-green text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-green-100 hover:scale-105 transition-all"
          >
            <Plus size={18} /> 동행 글올리기
          </button>
        </header>

        {/* 게시글 리스트 그리드 */}
        <div className="p-6 lg:px-10 lg:pb-20">
          {isLoading ? (
            <div className="text-center py-20 font-black text-gray-300 animate-pulse text-xl italic">데이터를 불러오는 중...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
              {posts.map(post => (
                <div key={post.id} className="bg-white p-5 lg:p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between transition-all hover:shadow-md hover:-translate-y-1">
                  
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-tight ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                      <span className="text-gray-300 text-[10px] font-bold flex items-center gap-1">
                        <Clock size={12} /> {getTimeAgo(post.created_at)}
                      </span>
                    </div>

                    <h3 className="font-black text-gray-800 text-base lg:text-lg leading-tight mb-4 line-clamp-2">
                      {post.title}
                    </h3>

                    <div className="flex flex-wrap gap-3 text-[11px] text-gray-400 font-bold mb-6">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} className="opacity-60"/> {post.schedules?.start_date?.replace(/-/g, '.')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={13} className="opacity-60"/> {post.current_people}/{post.schedules?.people}명
                      </span>
                      <span className="ml-auto text-gray-300 font-medium italic">by {post.nickname}</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-5 border-t border-gray-50 pt-4">
                      {post.schedules?.regions?.map(region => (
                        <div key={region} className="bg-gmg-green/5 text-gmg-green px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1">
                          <Hash size={10} /> {region}
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => window.open(post.chat_link, '_blank')}
                      className="w-full bg-gmg-camel text-white py-3.5 rounded-2xl font-black text-xs lg:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-100 active:scale-95 transition-all"
                    >
                      <MessageCircle size={16} /> 오픈채팅 참여하기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <button 
        onClick={onStartBuilder}
        className="fixed bottom-8 right-8 lg:hidden w-14 h-14 bg-gmg-green text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all z-50"
      >
        <Plus size={28} />
      </button>
    </div>
  );
};

export default CommunityBoard;