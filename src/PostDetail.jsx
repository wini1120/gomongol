import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, MessageCircle, Calendar, Users, 
  MapPin, Clock, Tag, Map, Target, Smile, Moon, Info, Hash,
  MoreVertical, Edit2, AlertTriangle, X, Lock, Send, Check, RotateCcw
} from 'lucide-react';
import { supabase } from './supabaseClient';

const PostDetail = ({ post, onBack, onUpdateSuccess }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [reportReason, setReportReason] = useState('');

  // 편집용 입력 데이터 상태
  const [editForm, setEditForm] = useState({
    status: post?.status || '',
    target_gender: post?.target_gender || '무관',
    target_ages: post?.target_ages || [],
    current_people: post?.current_people || 1,
    total_people: post?.schedules?.people || 1,
    description: post?.description || '',
    chat_link: post?.chat_link || '',
    start_date: post?.schedules?.start_date || '',
    nights: post?.schedules?.nights || 0
  });

  useEffect(() => {
    if (post) {
      setEditForm({
        status: post.status,
        target_gender: post.target_gender,
        target_ages: post.target_ages || [],
        current_people: post.current_people,
        total_people: post.schedules?.people,
        description: post.description,
        chat_link: post.chat_link,
        start_date: post.schedules?.start_date,
        nights: post.schedules?.nights
      });
    }
  }, [post]);

  if (!post) return null;

  const formatDate = (dateString) => dateString?.replace(/-/g, '.') || '';

  const validateKakaoLink = (link) => {
    const kakaoPattern = /^https:\/\/open\.kakao\.com\/(o|me)\/[a-zA-Z0-9]+/;
    return kakaoPattern.test(link);
  };

  const handleEditConfirm = () => {
    if (String(inputPassword) === String(post.password)) {
      setShowPasswordModal(false);
      setInputPassword('');
      setIsEditing(true);
    } else {
      alert('비밀번호가 일치하지 않습니다.');
      setInputPassword('');
    }
  };

  const handleUpdate = async () => {
    if (!validateKakaoLink(editForm.chat_link)) {
      alert('올바른 카카오톡 오픈채팅 링크 형식이 아닙니다.\n(https://open.kakao.com/...)');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: existingPost } = await supabase
        .from('posts')
        .select('id')
        .eq('chat_link', editForm.chat_link)
        .neq('id', post.id)
        .maybeSingle();

      if (existingPost) {
        alert('이미 등록된 채팅방입니다.');
        setIsSubmitting(false);
        return;
      }

      const { error: postError } = await supabase
        .from('posts')
        .update({
          status: editForm.status,
          target_gender: editForm.target_gender,
          target_ages: editForm.target_ages,
          current_people: editForm.current_people,
          description: editForm.description,
          chat_link: editForm.chat_link
        })
        .eq('id', post.id);

      if (postError) throw postError;

      const { error: scheduleError } = await supabase
        .from('schedules')
        .update({ 
          people: editForm.total_people,
          start_date: editForm.start_date,
          nights: parseInt(editForm.nights)
        })
        .eq('id', post.schedule_id);

      if (scheduleError) throw scheduleError;

      alert('정보가 수정되었습니다.');
      setIsEditing(false);
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (e) {
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
      alert('신고가 접수되었습니다.');
      setShowReportModal(false);
      setReportReason('');
    } catch (e) {
      alert('신고 접수 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ageOptions = ["20대", "30대", "40대", "50대", "60대 이상"];
  const statusOptions = ["모집 중", "출발 확정", "항공권 발권완료", "투어사 확정", "모집 마감"];

  // 지역별 아이콘 매핑 함수
  const getRegionEmoji = (region) => {
    const r = region.toLowerCase();
    if (r.includes('gobi') || r.includes('사막')) return '🐪';
    if (r.includes('central') || r.includes('힐링')) return '🌿';
    if (r.includes('khuvsgul') || r.includes('북부')) return '💎';
    return '📍';
  };

  return (
    <div className="min-h-screen bg-white max-w-[1920px] mx-auto relative">
      <header className="sticky top-0 bg-white/90 backdrop-blur-md px-6 py-5 flex items-center justify-between z-40 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={isEditing ? () => setIsEditing(false) : onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            {isEditing ? <X size={24} /> : <ChevronLeft size={24} />}
          </button>
          <span className="font-black text-gray-800 italic tracking-widest text-sm uppercase">
            {isEditing ? "Edit Details" : "Post Details"}
          </span>
        </div>
        {!isEditing && (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical size={24} className="text-gray-400" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                <button onClick={() => { setShowPasswordModal(true); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                  <Edit2 size={16} /> 정보수정
                </button>
                <button onClick={() => { setShowReportModal(true); setShowMenu(false); }} className="w-full flex items-center gap-2 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors border-t border-gray-50">
                  <AlertTriangle size={16} /> 신고하기
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10 pb-32 text-left">
        {/* 1. 상태 및 제목 */}
        <div className="space-y-6 mb-10">
          <div>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {statusOptions.map(opt => (
                  <button key={opt} onClick={() => setEditForm({...editForm, status: opt})} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${editForm.status === opt ? 'bg-gmg-green text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white ${post.status === '출발 확정' || post.status === '모집 마감' ? 'bg-gmg-green' : 'bg-gmg-camel'}`}>
                {post.status}
              </span>
            )}
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">{post.title}</h2>
        </div>

        {/* 2. 모집 대상 */}
        <section className="mb-8 p-6 bg-gray-50/50 rounded-[2.5rem] border border-gray-100">
          <h3 className="font-black text-lg text-gray-800 flex items-center gap-2 mb-6"><Target size={20} className="text-gmg-camel" /> 모집 대상</h3>
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                {['무관', '남성', '여성'].map(g => (
                  <button key={g} onClick={() => setEditForm({...editForm, target_gender: g})} className={`flex-1 py-3 rounded-xl text-xs font-black border transition-all ${editForm.target_gender === g ? 'bg-orange-50 border-gmg-camel text-gmg-camel' : 'bg-white border-gray-100 text-gray-400'}`}>
                    {g}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ageOptions.map(age => (
                  <button key={age} onClick={() => {
                    const newAges = editForm.target_ages.includes(age) ? editForm.target_ages.filter(a => a !== age) : [...editForm.target_ages, age];
                    setEditForm({...editForm, target_ages: newAges});
                  }} className={`py-3 rounded-xl text-[10px] font-black border transition-all ${editForm.target_ages.includes(age) ? 'bg-orange-50 border-gmg-camel text-gmg-camel' : 'bg-white border-gray-100 text-gray-400'}`}>
                    {age}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
               <span className="bg-orange-50 text-gmg-camel px-4 py-2 rounded-2xl text-xs font-black border border-orange-100 flex items-center gap-1"><Hash size={12} /> {post.target_gender === '무관' ? '성별 무관' : post.target_gender}</span>
               {post.target_ages?.map(age => <span key={age} className="bg-orange-50 text-gmg-camel px-4 py-2 rounded-2xl text-xs font-black border border-orange-100 flex items-center gap-1"><Hash size={12} /> {age}</span>)}
            </div>
          )}
        </section>

        {/* 3. 인원 및 일정 현황 */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100/50 space-y-2">
            <Calendar className="text-gmg-camel" size={18} /><p className="text-[10px] font-black text-gray-400 uppercase">Departure</p>
            {isEditing ? (
              <input type="date" className="w-full bg-white border border-gray-200 rounded-lg p-1 font-black text-xs outline-none" value={editForm.start_date} onChange={(e) => setEditForm({...editForm, start_date: e.target.value})}/>
            ) : (
              <p className="font-black text-gray-800 text-sm">{formatDate(post.schedules?.start_date)}</p>
            )}
          </div>
          <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100/50 flex flex-col justify-center">
            <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Members Status</p>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input type="number" className="w-12 bg-white border border-gray-200 rounded-lg p-1 text-center font-black text-sm" value={editForm.current_people} onChange={(e) => setEditForm({...editForm, current_people: parseInt(e.target.value)})}/>
                <span className="text-gray-300">/</span>
                <input type="number" className="w-12 bg-white border border-gray-200 rounded-lg p-1 text-center font-black text-sm" value={editForm.total_people} onChange={(e) => setEditForm({...editForm, total_people: parseInt(e.target.value)})}/>
              </div>
            ) : (
              <p className="font-black text-gray-800 text-sm"><span className="text-gmg-camel">{post.current_people}</span><span className="text-gray-300 mx-1">/</span><span>{post.schedules?.people || 0}명</span></p>
            )}
          </div>
          <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100/50 space-y-2">
            <Moon className="text-gmg-camel" size={18} /><p className="text-[10px] font-black text-gray-400 uppercase">Duration</p>
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input type="number" className="w-12 bg-white border border-gray-200 rounded-lg p-1 text-center font-black text-sm" value={editForm.nights} onChange={(e) => setEditForm({...editForm, nights: e.target.value})}/>
                <span className="text-xs font-black text-gray-800">박</span>
              </div>
            ) : (
              <p className="font-black text-gray-800 text-sm">{post.schedules?.nights || 0}박 {(post.schedules?.nights || 0) + 1}일</p>
            )}
          </div>
        </section>

        {/* 4. [중요] 상세 여행 경로 - JSON 구조에 맞춘 정밀 매핑 */}
        {!isEditing && (
          <section className="mb-12">
            <h3 className="font-black text-xl text-gray-800 flex items-center gap-2 mb-6">
              <MapPin size={22} className="text-gmg-green" /> 상세 여행 경로
            </h3>
            <div className="space-y-6">
              {post.schedules?.regions?.map((region, idx) => {
                // regions 배열의 원소(ex: "gobi")를 키로 사용하여 spots 객체에서 해당 장소들만 추출
                const spotList = post.schedules?.spots?.[region] || [];
                
                return (
                  <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getRegionEmoji(region)}</span>
                      <h4 className="font-black text-xl text-gray-800 uppercase tracking-tight">{region}</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {spotList.length > 0 ? (
                        spotList.map((spot, sIdx) => (
                          <span key={sIdx} className="bg-gray-50/80 text-gray-600 px-5 py-3 rounded-2xl text-xs font-black border border-gray-100 flex items-center gap-1">
                            <Hash size={12} className="text-gray-300" /> {spot}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">상세 스팟 정보가 없습니다.</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 5. 팀 소개 및 오픈채팅 */}
        <section className="mb-12 space-y-8">
          <div>
            <h3 className="font-black text-xl text-gray-800 flex items-center gap-2 mb-6"><Smile size={22} className="text-gmg-camel" /> 팀 소개 및 오픈채팅</h3>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <textarea className="w-full bg-orange-50/30 border border-orange-100 p-6 rounded-[2rem] text-sm font-medium h-40 outline-none" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})}/>
                  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <MessageCircle size={20} className="text-gmg-camel"/>
                    <input className="bg-transparent border-none w-full text-xs font-bold outline-none" placeholder="오픈채팅 주소 입력" value={editForm.chat_link} onChange={(e) => setEditForm({...editForm, chat_link: e.target.value})}/>
                  </div>
                </>
              ) : (
                <div className="bg-orange-50/30 border border-orange-100/50 p-8 rounded-[2.5rem]">
                  <p className="text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">{post.description || "소개글이 없습니다."}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      <footer className="fixed bottom-0 w-full bg-white/80 backdrop-blur-xl p-6 border-t border-gray-50 z-50">
        <div className="max-w-3xl mx-auto">
          {isEditing ? (
            <button onClick={handleUpdate} disabled={isSubmitting} className="w-full py-5 bg-gmg-green text-white rounded-[2rem] font-black text-lg shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
              <Check size={24} /> {isSubmitting ? '저장 중...' : '변경사항 저장하기'}
            </button>
          ) : (
            <button onClick={() => post.chat_link && window.open(post.chat_link, '_blank')} disabled={!post.chat_link} className={`w-full py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all ${post.chat_link ? 'bg-gmg-camel text-white shadow-xl shadow-orange-100 active:scale-95' : 'bg-gray-200 text-gray-400'}`}>
              <MessageCircle size={24} /> {post.chat_link ? '오픈채팅 참여하기' : '채팅방 개설 전'}
            </button>
          )}
        </div>
      </footer>

      {/* 비밀번호 확인 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-50 text-gmg-camel rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock size={24}/></div>
              <h3 className="text-lg font-black text-gray-800">편집 권한 확인</h3>
              <p className="text-xs text-gray-400 font-bold">비밀번호 4자리를 입력하세요.</p>
            </div>
            <input type="password" maxLength={4} autoFocus className="w-full bg-gray-50 border-none rounded-xl p-4 text-center text-2xl font-black tracking-[1rem] outline-none focus:ring-2 focus:ring-gmg-camel" value={inputPassword} onChange={(e) => setInputPassword(e.target.value.replace(/[^0-9]/g, ''))} onKeyDown={(e) => e.key === 'Enter' && handleEditConfirm()}/>
            <div className="flex gap-2">
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-xl font-black text-sm">취소</button>
              <button onClick={handleEditConfirm} className="flex-[2] py-4 bg-gmg-camel text-white rounded-xl font-black text-sm">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;