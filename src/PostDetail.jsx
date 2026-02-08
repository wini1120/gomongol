import React, { useState } from 'react';
import { 
  ChevronLeft, MessageCircle, Calendar, Users, 
  MapPin, Clock, Tag, Map, Target, Smile, Moon, Info, Hash,
  MoreVertical, Edit2, AlertTriangle, X, Lock, Send
} from 'lucide-react';
import { supabase } from './supabaseClient';

const PostDetail = ({ post, onBack, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const [inputPassword, setInputPassword] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!post) return null;

  const formatDate = (dateString) => dateString?.replace(/-/g, '.');

  // 수정 확인 로직
  const handleEditConfirm = () => {
    if (String(inputPassword) === String(post.password)) {
      setShowPasswordModal(false);
      setInputPassword('');
      onEdit(post);
    } else {
      alert('비밀번호가 일치하지 않습니다.');
      setInputPassword('');
    }
  };

  // 신고 제출 로직
  const handleReportSubmit = async () => {
    if (reportReason.trim().length < 5) {
      alert('신고 사유를 좀 더 상세히 적어주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('reports')
        .insert([{ post_id: post.id, reason: reportReason }]);

      if (error) throw error;
      
      alert('신고가 정상적으로 접수되었습니다.');
      setShowReportModal(false);
      setReportReason('');
    } catch (e) {
      alert('신고 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white max-w-[1920px] mx-auto relative">
      {/* --- 1. 상단 고정 헤더 --- */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-5 flex items-center justify-between z-40 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <span className="font-black text-gray-800 italic tracking-widest text-sm uppercase">Post Details</span>
        </div>

        {/* 우측 메뉴 버튼 */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical size={24} className="text-gray-400" />
          </button>

          {/* 드롭다운 메뉴 */}
          {showMenu && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <button 
                onClick={() => { setShowPasswordModal(true); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Edit2 size={16} /> 수정하기
              </button>
              <button 
                onClick={() => { setShowReportModal(true); setShowMenu(false); }}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-gray-50"
              >
                <AlertTriangle size={16} /> 신고하기
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 pb-32 text-left">
        {/* 기존 제목 섹션 */}
        <div className="space-y-6 mb-10">
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${
              post.status === '출발 확정' ? 'bg-gmg-green' : 'bg-gmg-camel'
            }`}>
              {post.status}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">{post.title}</h2>
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

        {/* 모집 대상 */}
        <section className="mb-8">
          <h3 className="font-black text-xl text-gray-800 flex items-center gap-2 mb-6">
             <Target size={22} className="text-gmg-camel" /> 모집 대상
          </h3>
          <div className="flex flex-wrap gap-2">
             <span className="bg-orange-50 text-gmg-camel px-4 py-2 rounded-2xl text-xs font-black border border-orange-100 flex items-center gap-1">
                <Hash size={12} strokeWidth={3} /> {post.target_gender === '무관' ? '성별 무관' : post.target_gender}
             </span>
             {post.target_ages?.map(age => (
               <span key={age} className="bg-orange-50 text-gmg-camel px-4 py-2 rounded-2xl text-xs font-black border border-orange-100 flex items-center gap-1">
                  <Hash size={12} strokeWidth={3} /> {age}
               </span>
             ))}
          </div>
        </section>

        {/* 요약 정보 그리드 */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100/50 space-y-2">
            <Calendar className="text-gmg-camel" size={18} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Departure</p>
            <p className="font-black text-gray-800 text-sm">{formatDate(post.schedules?.start_date)}</p>
          </div>
          <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100/50 space-y-2">
            <Moon className="text-gmg-camel" size={18} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Duration</p>
            <p className="font-black text-gray-800 text-sm">{post.schedules?.nights}박 {post.schedules?.nights + 1}일</p>
          </div>
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

        {/* 경로 및 팀소개 (기존 유지) */}
        <section className="mb-12">
          <h3 className="font-black text-xl text-gray-800 flex items-center gap-2 mb-6">
             <MapPin size={22} className="text-gmg-green" /> 상세 여행 경로
          </h3>
          <div className="space-y-6">
            {post.schedules?.regions?.map((region) => (
              <div key={region} className="relative pl-8 border-l-2 border-dashed border-gray-100 last:border-0 pb-6">
                <div className="absolute -left-[11px] top-0 w-5 h-5 bg-white border-4 border-gmg-green rounded-full shadow-sm" />
                <h4 className="font-black text-gray-800 text-lg">{region}</h4>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h3 className="font-black text-xl text-gray-800 flex items-center gap-2 mb-6">
             <Smile size={22} className="text-gmg-camel" /> 우리 팀을 소개합니다
          </h3>
          <div className="bg-orange-50/30 border border-orange-100/50 p-8 rounded-[2.5rem]">
            <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
              {post.description || "팀 소개 글이 작성되지 않았습니다."}
            </p>
          </div>
        </section>
      </div>

      {/* 하단 고정 액션 바 */}
      <footer className="fixed bottom-0 w-full bg-white/80 backdrop-blur-xl p-6 border-t border-gray-50 z-50">
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => post.chat_link && window.open(post.chat_link, '_blank')}
            disabled={!post.chat_link}
            className={`w-full py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all ${
              post.chat_link ? 'bg-gmg-camel text-white shadow-xl shadow-orange-100 active:scale-95' : 'bg-gray-200 text-gray-400'
            }`}
          >
            <MessageCircle size={24} /> {post.chat_link ? '오픈채팅 참여하기' : '채팅방 개설 전'}
          </button>
        </div>
      </footer>

      {/* --- [모달 1] 비밀번호 확인 --- */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-50 text-gmg-camel rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock size={24}/></div>
              <h3 className="text-lg font-black text-gray-800">비밀번호 확인</h3>
              <p className="text-xs text-gray-400 font-bold">글 작성 시 설정한<br/>비밀번호 4자리를 입력해 주세요.</p>
            </div>
            <input 
              type="password" maxLength={4} autoFocus
              className="w-full bg-gray-50 border-none rounded-xl p-4 text-center text-2xl font-black tracking-[1rem] outline-none focus:ring-2 focus:ring-gmg-camel"
              value={inputPassword} onChange={(e) => setInputPassword(e.target.value.replace(/[^0-9]/g, ''))}
              onKeyDown={(e) => e.key === 'Enter' && handleEditConfirm()}
            />
            <div className="flex gap-2">
              <button onClick={() => { setShowPasswordModal(false); setInputPassword(''); }} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-xl font-black text-sm">취소</button>
              <button onClick={handleEditConfirm} className="flex-[2] py-4 bg-gmg-camel text-white rounded-xl font-black text-sm px-8">확인</button>
            </div>
          </div>
        </div>
      )}

      {/* --- [모달 2] 신고하기 --- */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative">
            <button onClick={() => setShowReportModal(false)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500"><X size={24}/></button>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-800">게시글 신고</h3>
              <p className="text-xs text-gray-400 font-bold">부적절한 내용이 포함되어 있나요?</p>
            </div>
            <textarea 
              maxLength={300} placeholder="신고 사유를 상세히 작성해 주세요. (최대 300자)"
              className="w-full h-40 bg-gray-50 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 resize-none"
              value={reportReason} onChange={(e) => setReportReason(e.target.value)}
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-300">{reportReason.length} / 300</span>
              <button 
                onClick={handleReportSubmit} disabled={isSubmitting}
                className="bg-red-500 text-white px-8 py-4 rounded-xl font-black text-sm flex items-center gap-2 active:scale-95 transition-all"
              >
                <Send size={16}/> {isSubmitting ? '제출 중...' : '신고 제출'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;