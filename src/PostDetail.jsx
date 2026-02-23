import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, MessageCircle, Calendar, Users, 
  MapPin, Clock, Tag, Map, Target, Smile, Moon, Info, Hash,
  MoreVertical, Edit2, AlertTriangle, X, Lock, Send, Check, RotateCcw, Plus, ExternalLink, Copy,
  Trash2 // 삭제 아이콘 추가
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { comparePassword } from './authUtils';

const PostDetail = ({ post, onBack, onUpdateSuccess }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showChatConfirmModal, setShowChatConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false); // 삭제 확인 모달 상태 추가
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputUserId, setInputUserId] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [reportReason, setReportReason] = useState('');

  // 마스터 데이터 상태
  const [masterRegions, setMasterRegions] = useState([]);
  const [masterSpots, setMasterSpots] = useState([]);
  const [showSpotPickerFor, setShowSpotPickerFor] = useState(null);

  // 편집용 입력 데이터 상태
  const [editForm, setEditForm] = useState({
    title: post?.title || '',
    status: post?.status || '',
    target_gender: post?.target_gender || '무관',
    target_ages: post?.target_ages || [],
    current_people: post?.current_people || 1,
    total_people: post?.schedules?.people || 1,
    description: post?.description || '',
    chat_link: post?.chat_link || '',
    start_date: post?.schedules?.start_date || '',
    nights: post?.schedules?.nights || 0,
    regions: post?.schedules?.regions || [], 
    spots: post?.schedules?.spots || {}     
  });

  const isFormValid = 
    editForm.title.trim() !== '' &&
    editForm.target_ages.length > 0 &&
    editForm.start_date !== '' &&
    editForm.nights > 0 &&
    editForm.total_people > 0;

  useEffect(() => {
    const fetchMasterData = async () => {
      const { data: regions } = await supabase.from('master_regions').select('*').order('id');
      const { data: spots } = await supabase.from('master_spots').select('*');
      setMasterRegions(regions || []);
      setMasterSpots(spots || []);
    };
    fetchMasterData();

    if (post) {
      setEditForm({
        title: post.title,
        status: post.status,
        target_gender: post.target_gender,
        target_ages: post.target_ages || [],
        current_people: post.current_people,
        total_people: post.schedules?.people,
        description: post.description,
        chat_link: post.chat_link,
        start_date: post.schedules?.start_date,
        nights: post.schedules?.nights,
        regions: post.schedules?.regions || [],
        spots: post.schedules?.spots || {}
      });
    }
  }, [post]);

  if (!post) return null;

  const formatDate = (dateString) => dateString?.replace(/-/g, '.') || '';

  const validateKakaoLink = (link) => {
    if (!link) return true; 
    const kakaoPattern = /^https:\/\/open\.kakao\.com\/(o|me)\/[a-zA-Z0-9]+/;
    return kakaoPattern.test(link);
  };

  const handleCopyPostLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('게시글 링크가 클립보드에 복사되었습니다! 친구들에게 공유해 보세요.');
    } catch (err) {
      alert('링크 복사에 실패했습니다.');
    }
  };

  const handleEditConfirm = async () => {
    const userId = inputUserId.trim();
    if (!userId || !inputPassword) {
      alert('아이디와 비밀번호를 모두 입력하세요.');
      return;
    }
    try {
      const { data: user, error } = await supabase
        .from('travel_user')
        .select('user_no, user_pw')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      if (!user) {
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
        setInputPassword('');
        return;
      }
      if (Number(post.travel_user_id) !== Number(user.user_no)) {
        alert('이 게시글의 작성자만 수정할 수 있습니다.');
        setInputPassword('');
        return;
      }
      if (!comparePassword(inputPassword, user.user_pw)) {
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
        setInputPassword('');
        return;
      }
      setShowPasswordModal(false);
      setInputUserId('');
      setInputPassword('');
      setIsEditing(true);
    } catch (e) {
      console.error(e);
      alert('확인 중 오류가 발생했습니다.');
    }
  };

  // --- 게시글 삭제(논리 삭제) 처리 ---
  const handleDeletePost = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_delete: 'O' }) // 논리 삭제 처리
        .eq('id', post.id);

      if (error) throw error;

      alert('게시글이 성공적으로 삭제되었습니다.');
      setIsEditing(false);
      setShowDeleteConfirmModal(false);
      if (onUpdateSuccess) onUpdateSuccess(); // 목록 새로고침 트리거
    } catch (e) {
      alert('삭제 중 오류가 발생했습니다: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeUpdate = async () => {
    setIsSubmitting(true);
    try {
      if (editForm.chat_link) {
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
      }

      const { error: postError } = await supabase
        .from('posts')
        .update({
          title: editForm.title,
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
          nights: parseInt(editForm.nights),
          regions: editForm.regions,
          spots: editForm.spots
        })
        .eq('id', post.schedule_id);

      if (scheduleError) throw scheduleError;

      alert('정보가 수정되었습니다.');
      setIsEditing(false);
      setShowChatConfirmModal(false);
      if (onUpdateSuccess) onUpdateSuccess();
    } catch (e) {
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveTrigger = () => {
    if (!validateKakaoLink(editForm.chat_link)) {
      alert('올바른 카카오톡 오픈채팅 링크 형식이 아닙니다.');
      return;
    }
    if (!editForm.chat_link) setShowChatConfirmModal(true);
    else executeUpdate();
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

  const toggleRegion = (regionId) => {
    setEditForm(prev => {
      const exists = prev.regions.includes(regionId);
      const newRegions = exists ? prev.regions.filter(r => r !== regionId) : [...prev.regions, regionId];
      const newSpots = { ...prev.spots };
      if (exists) delete newSpots[String(regionId)];
      else newSpots[String(regionId)] = [];
      return { ...prev, regions: newRegions, spots: newSpots };
    });
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
          {isEditing ? (
            <input 
              className="w-full text-3xl md:text-4xl font-black text-gray-900 leading-tight bg-gray-50 p-4 rounded-2xl border-2 border-dashed border-gray-200 focus:border-gmg-camel outline-none" 
              value={editForm.title} 
              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
              placeholder="제목을 입력하세요"
            />
          ) : (
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">{post.title}</h2>
          )}
        </div>

        {/* 2. 모집 대상 */}
        {isEditing ? (
          <div className="space-y-4 mb-8">
            <section className="p-6 rounded-[2.5rem] border bg-orange-50/30 border-orange-100 shadow-sm">
              <h3 className="font-black text-lg text-gray-800 flex items-center gap-2 mb-6"><Target size={20} className="text-gmg-camel" /> 모집 성별</h3>
              <div className="flex gap-2">
                {['무관', '남성', '여성'].map(g => (
                  <button key={g} onClick={() => setEditForm({...editForm, target_gender: g})} className={`flex-1 py-3 rounded-xl text-xs font-black border transition-all ${editForm.target_gender === g ? 'bg-white border-gmg-camel text-gmg-camel shadow-sm' : 'bg-white/50 border-gray-100 text-gray-400'}`}>
                    {g}
                  </button>
                ))}
              </div>
            </section>
            <section className="p-6 rounded-[2.5rem] border bg-orange-50/30 border-orange-100 shadow-sm">
              <h3 className="font-black text-lg text-gray-800 flex items-center gap-2 mb-6"><Users size={20} className="text-gmg-camel" /> 모집 연령대</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ageOptions.map(age => (
                  <button key={age} onClick={() => {
                    const newAges = editForm.target_ages.includes(age) ? editForm.target_ages.filter(a => a !== age) : [...editForm.target_ages, age];
                    setEditForm({...editForm, target_ages: newAges});
                  }} className={`py-3 rounded-xl text-[10px] font-black border transition-all ${editForm.target_ages.includes(age) ? 'bg-white border-gmg-camel text-gmg-camel shadow-sm' : 'bg-white/50 border-gray-100 text-gray-400'}`}>
                    {age}
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <section className="mb-8 p-6 rounded-[2.5rem] border bg-gray-50/50 border-gray-100">
            <h3 className="font-black text-lg text-gray-800 flex items-center gap-2 mb-6"><Target size={20} className="text-gmg-camel" /> 모집 대상</h3>
            <div className="flex flex-wrap gap-2">
               <span className="bg-orange-50 text-gmg-camel px-4 py-2 rounded-2xl text-xs font-black border border-orange-100 flex items-center gap-1"><Hash size={12} /> {post.target_gender === '무관' ? '성별 무관' : post.target_gender}</span>
               {post.target_ages?.map(age => <span key={age} className="bg-orange-50 text-gmg-camel px-4 py-2 rounded-2xl text-xs font-black border border-orange-100 flex items-center gap-1"><Hash size={12} /> {age}</span>)}
            </div>
          </section>
        )}

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

        {/* 4. 상세 여행 경로 */}
        <section className="mb-12">
          <h3 className="font-black text-xl text-gray-800 flex items-center gap-2 mb-6">
            <MapPin size={22} className="text-gmg-green" /> 상세 여행 경로
          </h3>
          {isEditing && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {masterRegions.map(reg => (
                <button 
                  key={reg.id} 
                  onClick={() => toggleRegion(reg.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${editForm.regions.includes(reg.id) ? 'bg-gmg-green text-white border-gmg-green shadow-md' : 'bg-gray-50 text-gray-400 border-gray-100'}`}
                >
                  {reg.icon} {reg.region_name}
                </button>
              ))}
            </div>
          )}
          <div className="space-y-6">
            {editForm.regions.length === 0 ? (
              <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
                <p className="text-sm font-bold text-gray-400 italic">멤버들과 여행 경로를 논의 중이에요</p>
              </div>
            ) : (
              editForm.regions.map((regionId, idx) => {
                const regionInfo = masterRegions.find(r => r.id === regionId);
                const spotList = editForm.spots?.[String(regionId)] || [];
                return (
                  <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{regionInfo?.icon || '📍'}</span>
                        <h4 className="font-black text-xl text-gray-800 tracking-tight">{regionInfo?.region_name || '알 수 없는 지역'}</h4>
                      </div>
                      {isEditing && (
                        <button onClick={() => toggleRegion(regionId)} className="p-2 text-gray-300 hover:text-red-400"><X size={20}/></button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {spotList.map((spot, sIdx) => (
                        <span key={sIdx} className="bg-gray-50/80 text-gray-600 px-5 py-3 rounded-2xl text-xs font-black border border-gray-100 flex items-center gap-1">
                          <Hash size={12} className="text-gray-300" /> {spot}
                          {isEditing && (
                            <button onClick={() => {
                              const newSpots = {...editForm.spots};
                              newSpots[String(regionId)] = newSpots[String(regionId)].filter((_, i) => i !== sIdx);
                              setEditForm({...editForm, spots: newSpots});
                            }} className="ml-1 text-gray-300 hover:text-gray-600"><X size={12}/></button>
                          )}
                        </span>
                      ))}
                      {isEditing && (
                        <div className="w-full relative">
                          <button onClick={() => setShowSpotPickerFor(showSpotPickerFor === regionId ? null : regionId)} className="w-full mt-2 py-3 border-2 border-dashed border-gray-100 rounded-2xl text-gray-300 hover:border-gmg-green hover:text-gmg-green flex items-center justify-center transition-all">
                            <Plus size={16}/>
                          </button>
                          {showSpotPickerFor === regionId && (
                            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-[60] p-4 max-h-48 overflow-y-auto grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1">
                              {masterSpots.filter(s => s.region_id === regionId).map(s => (
                                <button key={s.id} onClick={() => {
                                  const newSpots = {...editForm.spots};
                                  if(!newSpots[String(regionId)].includes(s.spot_name)) {
                                    newSpots[String(regionId)] = [...newSpots[String(regionId)], s.spot_name];
                                    setEditForm({...editForm, spots: newSpots});
                                  }
                                  setShowSpotPickerFor(null);
                                }} className="p-2 text-[10px] font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gmg-green hover:text-white transition-colors">
                                  {s.spot_name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* 5. 팀 소개 */}
        <section className="mb-12 space-y-8">
          <div>
            <h3 className="font-black text-xl text-gray-800 flex items-center gap-2 mb-6"><Smile size={22} className="text-gmg-camel" /> 팀 소개 및 오픈채팅</h3>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <textarea className="w-full bg-orange-50/30 border border-orange-100 p-6 rounded-[2rem] text-sm font-medium h-40 outline-none focus:ring-2 focus:ring-gmg-camel" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})}/>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <MessageCircle size={20} className="text-gmg-camel"/>
                      <input className="bg-transparent border-none w-full text-xs font-bold outline-none" placeholder="오픈채팅 주소 입력" value={editForm.chat_link} onChange={(e) => setEditForm({...editForm, chat_link: e.target.value})}/>
                    </div>
                    <button onClick={() => window.open('https://open.kakao.com/o/g', '_blank')} className="bg-yellow-400 text-yellow-900 px-5 py-4 rounded-2xl font-black text-xs flex items-center gap-2 shadow-sm active:scale-95 transition-all">게시 <ExternalLink size={14}/></button>
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
            <div className="flex gap-3">
              {/* [신규 추가] 게시글 삭제하기 버튼 */}
              <button 
                onClick={() => setShowDeleteConfirmModal(true)} 
                className="flex-1 py-5 bg-red-500 text-white rounded-[2rem] font-black text-lg shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                <Trash2 size={24} /> 삭제하기
              </button>
              
              {/* 변경사항 저장하기 버튼 */}
              <button 
                onClick={handleSaveTrigger} 
                disabled={isSubmitting || !isFormValid} 
                className={`flex-[2] py-5 text-white rounded-[2rem] font-black text-lg shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all ${isFormValid ? 'bg-gmg-green shadow-green-100' : 'bg-gray-300 cursor-not-allowed shadow-none'}`}
              >
                <Check size={24} /> {isSubmitting ? '저장 중...' : '저장하기'}
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={() => post.chat_link && window.open(post.chat_link, '_blank')} 
                disabled={!post.chat_link} 
                className={`flex-[4] py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all ${post.chat_link ? 'bg-gmg-camel text-white shadow-xl shadow-orange-100 active:scale-95' : 'bg-gray-200 text-gray-400'}`}
              >
                <MessageCircle size={24} /> {post.chat_link ? '오픈채팅 참여하기' : '채팅방 개설 전'}
              </button>
              
              <button 
                onClick={handleCopyPostLink}
                className="flex-1 py-5 bg-gray-50 text-gray-500 rounded-[2rem] border border-gray-100 flex items-center justify-center active:scale-95 transition-all hover:bg-gray-100 shadow-sm"
                title="게시글 링크 복사"
              >
                <Copy size={24} />
              </button>
            </div>
          )}
        </div>
      </footer>

      {/* --- 모달 영역 --- */}

      {/* [신규 추가] 게시글 삭제 확인 모달 */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Trash2 size={24}/></div>
              <h3 className="text-lg font-black text-gray-800 leading-tight">게시글을 삭제할까요?</h3>
              <p className="text-xs text-gray-400 font-bold leading-relaxed text-center">
                삭제된 게시글은 다시 복구할 수 없으며,<br/>목록에서 즉시 사라집니다.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowDeleteConfirmModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-xl font-black text-sm">아니오</button>
              <button onClick={handleDeletePost} className="flex-[2] py-4 bg-red-500 text-white rounded-xl font-black text-sm">네, 삭제할게요</button>
            </div>
          </div>
        </div>
      )}

      {showChatConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-50 text-gmg-camel rounded-2xl flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24}/></div>
              <h3 className="text-lg font-black text-gray-800 leading-tight">오픈채팅 링크가<br/>입력되지 않았습니다.</h3>
              <p className="text-xs text-gray-400 font-bold leading-relaxed">이대로 저장하시겠습니까?</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowChatConfirmModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-xl font-black text-sm">아니오</button>
              <button onClick={executeUpdate} className="flex-[2] py-4 bg-gmg-camel text-white rounded-xl font-black text-sm">네</button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-xs rounded-[2.5rem] p-8 space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-50 text-gmg-camel rounded-2xl flex items-center justify-center mx-auto mb-4"><Lock size={24}/></div>
              <h3 className="text-lg font-black text-gray-800">편집 권한 확인</h3>
              <p className="text-xs text-gray-400 font-bold">게시글 작성 시 사용한 아이디와 비밀번호를 입력하세요.</p>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="아이디" autoComplete="username" className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-gmg-camel" value={inputUserId} onChange={(e) => setInputUserId(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleEditConfirm()} />
              <input type="password" placeholder="비밀번호" autoComplete="current-password" className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-gmg-camel" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleEditConfirm()} />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-xl font-black text-sm">취소</button>
              <button onClick={handleEditConfirm} className="flex-[2] py-4 bg-gmg-camel text-white rounded-xl font-black text-sm">확인</button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-sm rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative">
            <button onClick={() => setShowReportModal(false)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500"><X size={24}/></button>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-gray-800">게시글 신고</h3>
              <p className="text-xs text-gray-400 font-bold">부적절하거나 허위 정보가 포함된 경우 신고해 주세요.</p>
            </div>
            <textarea maxLength={300} placeholder="신고 사유를 작성해 주세요." className="w-full h-40 bg-gray-50 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-red-500 resize-none" value={reportReason} onChange={(e) => setReportReason(e.target.value)}/>
            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] font-black text-gray-300">{reportReason.length}/300</span>
              <button onClick={handleReportSubmit} disabled={isSubmitting} className="bg-red-500 text-white px-8 py-4 rounded-xl font-black text-sm flex items-center gap-2 active:scale-95 transition-all">
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