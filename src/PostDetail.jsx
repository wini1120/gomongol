import React from 'react';
import { 
  ChevronLeft, MessageCircle, Calendar, Users, 
  MapPin, Clock, Tag, Map, Target, Smile, Moon, Info, Hash 
} from 'lucide-react';

const PostDetail = ({ post, onBack }) => {
  if (!post) return null;

  // 날짜 포맷팅 (YYYY.MM.DD)
  const formatDate = (dateString) => {
    return dateString?.replace(/-/g, '.');
  };

  return (
    <div className="min-h-screen bg-white max-w-[1920px] mx-auto">
      {/* --- 1. 상단 고정 헤더 --- */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-5 flex items-center gap-4 z-40 border-b border-gray-100">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <span className="font-black text-gray-800 italic tracking-widest text-sm uppercase">Post Details</span>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 pb-32 text-left">
        
        {/* --- 2. 제목 및 작성자 섹션 --- */}
        <div className="space-y-6 mb-10">
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${
              post.status === '출발 확정' ? 'bg-gmg-green' : 'bg-gmg-camel'
            }`}>
              {post.status}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
            {post.title}
          </h2>
          <div className="flex items-center gap-3 py-4 border-b border-gray-50">
            <div className="w-10 h-10 bg-gmg-bg rounded-full flex items-center justify-center font-black text-gmg-camel border border-orange-100">
              {post.nickname?.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-black text-gray-800 text-sm">@{post.nickname}</span>
              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                <Clock size={10} className="inline mr-1" /> {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* --- 3. 모집 대상 섹션 (해시태그) --- */}
        <section className="mb-8">
          <h3 className="font-black text-xl text-gray-800 flex items-center gap-2 mb-6">
             <Target size={22} className="text-gmg-camel" /> 모집 대상
          </h3>
          <div className="flex flex-wrap gap-2">
             {/* 성별 해시태그: '무관'일 경우 '#성별 무관'으로 출력 */}
             <span className="bg-orange-50 text-gmg-camel px-4 py-2 rounded-2xl text-xs font-black border border-orange-100 flex items-center gap-1">
                <Hash size={12} strokeWidth={3} /> 
                {post.target_gender === '무관' ? '성별 무관' : post.target_gender}
             </span>
             {/* 연령대 해시태그들 */}
             {post.target_ages?.map(age => (
               <span key={age} className="bg-orange-50 text-gmg-camel px-4 py-2 rounded-2xl text-xs font-black border border-orange-100 flex items-center gap-1">
                  <Hash size={12} strokeWidth={3} /> {age}
               </span>
             ))}
          </div>
        </section>

        {/* --- 4. 핵심 요약 정보 그리드 (Departure, Duration, Members) --- */}
        {/*  */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {/* Departure */}
          <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100/50 space-y-2">
            <Calendar className="text-gmg-camel" size={18} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Departure</p>
            <p className="font-black text-gray-800 text-sm">{formatDate(post.schedules?.start_date)}</p>
          </div>

          {/* Duration */}
          <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100/50 space-y-2">
            <Moon className="text-gmg-camel" size={18} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Duration</p>
            <p className="font-black text-gray-800 text-sm">{post.schedules?.nights}박 {post.schedules?.nights + 1}일</p>
          </div>

          {/* Members Status */}
          <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100/50 space-y-2">
            <Users className="text-gmg-camel" size={18} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Members Status</p>
            <p className="font-black text-gray-800 text-sm">
              <span className="text-gmg-camel">{post.current_people}</span>
              <span className="text-gray-300 mx-1">/</span>
              <span>{post.schedules?.people}명</span>
            </p>
          </div>
        </section>

        {/* --- 5. 상세 여행 경로 섹션 --- */}
        <section className="mb-12">
          <h3 className="font-black text-xl text-gray-800 flex items-center gap-2 mb-6">
             <MapPin size={22} className="text-gmg-green" /> 상세 여행 경로
          </h3>
          <div className="space-y-6">
            {post.schedules?.regions?.map((region, idx) => (
              <div key={region} className="relative pl-8 border-l-2 border-dashed border-gray-100 last:border-0 pb-6">
                <div className="absolute -left-[11px] top-0 w-5 h-5 bg-white border-4 border-gmg-green rounded-full shadow-sm" />
                <div className="space-y-3">
                  <h4 className="font-black text-gray-800 text-lg flex items-center gap-2">{region}</h4>
                  <div className="flex flex-wrap gap-2">
                    {post.schedules?.spots?.map(spot => (
                      <span key={spot} className="bg-white px-4 py-2 rounded-2xl text-[11px] font-bold text-gray-500 border border-gray-100 shadow-sm transition-colors hover:border-gmg-green/30">
                        {spot}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- 6. 팀 소개글 섹션 --- */}
        <section className="mb-12">
          <h3 className="font-black text-xl text-gray-800 flex items-center gap-2 mb-6">
             <Smile size={22} className="text-gmg-camel" /> 우리 팀을 소개합니다
          </h3>
          <div className="bg-orange-50/30 border border-orange-100/50 p-8 rounded-[2.5rem] relative">
            <Info size={40} className="absolute -top-5 -right-2 text-orange-100 opacity-50" />
            <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap relative z-10">
              {post.description || "팀 소개 글이 작성되지 않았습니다."}
            </p>
          </div>
        </section>

      </div>

      {/* --- 7. 하단 고정 액션 바 --- */}
      <footer className="fixed bottom-0 w-full bg-white/80 backdrop-blur-xl p-6 border-t border-gray-50 z-50">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => post.chat_link && window.open(post.chat_link, '_blank')}
            disabled={!post.chat_link}
            className={`w-full py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all ${
              post.chat_link 
              ? 'bg-gmg-camel text-white shadow-xl shadow-orange-100 active:scale-95' 
              : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            <MessageCircle size={24} /> 
            {post.chat_link ? '오픈채팅 참여하기' : '채팅방 개설 전'}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default PostDetail;