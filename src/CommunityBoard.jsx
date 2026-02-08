import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, MessageCircle, Users, Calendar, 
  Hash, Plus, Clock, Home, Compass, MessageSquareText
} from 'lucide-react';
import { supabase } from './supabaseClient';

const CommunityBoard = ({ onBack, onStartBuilder, onPostClick }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 1. [추가] DB에서 가져온 지역 마스터 정보를 저장할 상태
  const [regionNames, setRegionNames] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // [로직 변경] 지역 마스터 테이블과 게시글 데이터를 동시에 가져옵니다.
        const [regionsRes, postsRes] = await Promise.all([
          supabase.from('master_regions').select('id, region_name'),
          supabase
            .from('posts')
            .select(`
              *,
              schedules!posts_schedule_id_fkey (*) 
            `) 
            .order('created_at', { ascending: false })
        ]);

        if (regionsRes.error) throw regionsRes.error;
        if (postsRes.error) throw postsRes.error;

        // [추가] 지역 정보를 {1: '고비...', 2: '중부...'} 형태의 객체로 변환
        const nameMap = regionsRes.data.reduce((acc, curr) => {
          acc[curr.id] = curr.region_name;
          return acc;
        }, {});
        
        setRegionNames(nameMap);
        setPosts(postsRes.data || []);
      } catch (e) {
        console.error('데이터 로드 실패:', e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getTimeAgo = (date) => {
    const start = new Date(date);
    const end = new Date();
    const diff = (end - start) / 1000 / 60;
    if (diff < 60) return `${Math.floor(diff)}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    return `${Math.floor(diff / 1440)}일 전`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case '출발 확정': return 'bg-gmg-green text-white';
      case '항공권 발권완료': return 'bg-blue-500 text-white';
      case '투어사 확정': return 'bg-orange-400 text-white';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans max-w-[1920px] mx-auto text-gray-800">
      {/* --- 사이드바 생략 (디자인 동일) --- */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 sticky top-0 h-screen p-8 justify-between z-50">
        <div className="space-y-10">
          <div className="flex items-center gap-2 text-gmg-camel cursor-pointer" onClick={onBack}>
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
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-100 sticky top-0 z-40 lg:px-10 lg:py-8 lg:bg-transparent lg:border-none">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl lg:text-3xl font-black text-gray-800">동행 찾기 🐪</h1>
          </div>
          <button onClick={onStartBuilder} className="hidden lg:flex items-center gap-2 bg-gmg-green text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-green-100 hover:scale-105 transition-all">
            <Plus size={18} /> 동행 글올리기
          </button>
        </header>

        <div className="p-6 lg:px-10 lg:pb-20">
          {isLoading ? (
            <div className="text-center py-20 font-black text-gray-300 animate-pulse text-xl italic">데이터를 불러오는 중...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
              {posts.map(post => {
                const isAllAges = post.target_ages?.length >= 5 || post.target_ages?.includes('나이 무관');

                return (
                  <div key={post.id} onClick={() => onPostClick(post)} className="group flex flex-col cursor-pointer bg-white rounded-[2.5rem] shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 text-left overflow-hidden">
                    <div className="p-6 lg:p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight shadow-sm ${getStatusColor(post.status)}`}>
                          {post.status}
                        </span>
                        <div className="flex flex-col items-end gap-0.5">
                          <span className="text-gray-300 text-[10px] font-bold flex items-center gap-1"><Clock size={12} /> {getTimeAgo(post.created_at)}</span>
                          <span className="text-gray-400 text-[10px] font-black italic">by {post.nickname}</span>
                        </div>
                      </div>

                      <h3 className="font-black text-gray-800 text-lg lg:text-xl leading-snug mb-3 line-clamp-2 group-hover:text-gmg-camel transition-colors">{post.title}</h3>

                      <div className="flex gap-4 mb-5 text-[11px] font-black text-gray-400">
                        <div className="flex items-center gap-1.5"><Calendar size={13} className="text-gmg-camel" /><span>{post.schedules?.start_date?.replace(/-/g, '.')}</span></div>
                        <div className="flex items-center gap-1.5"><Users size={13} className="text-gmg-camel" /><span><b className="text-gray-800">{post.current_people}</b>/{post.schedules?.people}명</span></div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg text-[9px] font-black border border-gray-200/50">{post.target_gender === '무관' ? '성별무관' : post.target_gender}</span>
                        {isAllAges ? <span className="bg-orange-50 text-gmg-camel px-2.5 py-1 rounded-lg text-[9px] font-black border border-orange-100">나이 무관</span> : post.target_ages?.map(age => <span key={age} className="bg-orange-50 text-gmg-camel px-2.5 py-1 rounded-lg text-[9px] font-black border border-orange-100">{age}</span>)}
                      </div>

                      <div className="mt-auto space-y-4 pt-4 border-t border-gray-50">
                        <div className="flex flex-wrap gap-2">
                          {/* [핵심 변경] 하드코딩된 상수 대신 regionNames 객체에서 실시간 조회 */}
                          {post.schedules?.regions?.map(regionId => (
                            <span key={regionId} className="text-[10px] font-black text-gmg-green opacity-60">
                              # {regionNames[regionId] || '로딩 중...'}
                            </span>
                          ))}
                        </div>

                        <button onClick={(e) => { e.stopPropagation(); if (post.chat_link) window.open(post.chat_link, '_blank'); }} disabled={!post.chat_link} className={`w-full py-4 rounded-2xl font-black text-xs lg:text-sm flex items-center justify-center gap-2 transition-all ${post.chat_link ? 'bg-gmg-camel text-white shadow-lg shadow-orange-100 active:scale-95' : 'bg-gray-200 text-gray-300'}`}>
                          <MessageCircle size={16} /> {post.chat_link ? '오픈채팅 참여하기' : '채팅방 개설 전'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <button onClick={onStartBuilder} className="fixed bottom-8 right-8 lg:hidden w-14 h-14 bg-gmg-green text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all z-50 hover:scale-110"><Plus size={28} /></button>
    </div>
  );
};

export default CommunityBoard;