import React, { useState, useRef } from 'react';
import { 
  ChevronLeft, Users, Calendar, Moon, MapPin, 
  CheckCircle2, AlertCircle, MessageCircle, 
  Search, Hash, ChevronDown, Compass, Building2, Star, Info, Shuffle, Copy, CheckCircle, ArrowRight, Target, Smile, Lock, Send,
  PenTool, ExternalLink 
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { supabase } from './supabaseClient';
import { hashPassword, isValidUserId, isPasswordValid } from './authUtils';

const ItineraryBuilder = ({ onBack, onSaveSuccess }) => {
  const [step, setStep] = useState(1);
  const contentRef = useRef(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [savedSchedule, setSavedSchedule] = useState(null); 

  const [formData, setFormData] = useState({
    people: 4,
    startDate: '',
    nights: 5,
    selectedRegions: [], // 이제 숫자 ID 배열 [1, 2]
    spots: {} // 이제 숫자 ID를 키로 하는 객체 {"1": [], "2": []}
  });

  // [수정] DB의 master_regions 테이블 ID와 일치하도록 변경
  const regionData = [
    { 
      id: 1, // gobi -> 1
      name: '고비 사막 코스', 
      travelTime: '8~10시간',
      desc: '지평선과 은하수, 낙타 트레킹', 
      icon: '🐪',
      spots: ['바가 가쯔링 촐로', '차강 소브라가', '욜린암', '홍고링 엘스', '바얀작', '엉긴 사원', '만달고비']
    },
    { 
      id: 2, // central -> 2
      name: '중부 힐링 코스', 
      travelTime: '3~5시간',
      desc: '초원, 야생마, 온천과 폭포', 
      icon: '🌿',
      spots: ['테를지 국립공원', '미니고비 (엘승타사르하이)', '쳉헤르 온천', '오기 호수', '카라코롬 (에르덴조 사원)', '어르헝 폭포']
    },
    { 
      id: 3, // khuvsgul -> 3
      name: '홉스굴 북부 코스', 
      travelTime: '12~14시간',
      desc: '푸른 진주 호수와 순록 부족', 
      icon: '💎',
      spots: ['홉스굴 호수', '오랑 터거 (화산 분화구)', '테르힝 차강 호수', '볼강', '무릉', '신이데르 마을']
    }
  ];

  const partnerAgencies = [
    { id: 1, name: "이지조이트래블", rating: 4.9, reviews: 128, color: "bg-orange-50" },
    { id: 2, name: "고비트래블", rating: 4.8, reviews: 95, color: "bg-blue-50" },
    { id: 3, name: "푸제투어", rating: 4.7, reviews: 210, color: "bg-green-50" },
  ];

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => (step === 1 ? onBack() : setStep(prev => prev - 1));

  // [수정] 지역 토글 시 숫자 ID 사용
  const toggleRegion = (regionId) => {
    setFormData(prev => {
      const isSelected = prev.selectedRegions.includes(regionId);
      const newRegions = isSelected 
        ? prev.selectedRegions.filter(id => id !== regionId) 
        : [...prev.selectedRegions, regionId];
      
      const newSpots = { ...prev.spots };
      if (isSelected) {
        delete newSpots[String(regionId)]; 
      } else {
        newSpots[String(regionId)] = []; 
      }

      return { ...prev, selectedRegions: newRegions, spots: newSpots };
    });
  };

  // [수정] 스팟 토글 시 숫자 ID를 키로 사용
  const toggleSpot = (regionId, spot) => {
    setFormData(prev => {
      const currentRegionSpots = prev.spots[String(regionId)] || [];
      const newRegionSpots = currentRegionSpots.includes(spot)
        ? currentRegionSpots.filter(s => s !== spot)
        : [...currentRegionSpots, spot];

      return {
        ...prev,
        spots: {
          ...prev.spots,
          [String(regionId)]: newRegionSpots
        }
      };
    });
  };

  const handleExportImage = async () => {
    if (contentRef.current === null) return;
    try {
      const dataUrl = await toPng(contentRef.current, { 
        cacheBust: true, 
        backgroundColor: '#ffffff',
        style: { padding: '40px', borderRadius: '0px' }
      });
      const link = document.createElement('a');
      link.download = `GoMongol_Wishlist.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('이미지 저장 실패:', err);
    }
  };

  const handleConsulting = async () => {
    await handleExportImage();
    setStep(4);
  };

  // [수정] 저장 시 신규 스키마(ID 기반) 적용
  const handleSaveForCommunity = async () => {
    if (!formData.startDate) {
        alert('출발 날짜를 먼저 선택해주세요!');
        setStep(1);
        return;
    }
    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('schedules')
        .insert([{
          start_date: formData.startDate,
          nights: Math.max(1, formData.nights || 1),
          people: formData.people,
          regions: formData.selectedRegions, // 숫자 배열 [1, 2]
          spots: formData.spots // {"1": [], "2": []}
        }])
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        setSavedSchedule(data); 
        setStep(5);
      }
    } catch (error) {
      console.error('일정 저장 에러:', error);
      alert('일정 저장 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const getButtonState = () => {
    if (step === 1) return { text: '다음 단계로', disabled: !formData.startDate, isActive: !!formData.startDate };
    if (step === 2) {
      if (formData.selectedRegions.length === 0)
        return { text: '지역을 1개 이상 선택해주세요', disabled: true, isActive: false };
      return { text: '위시리스트 확인하기', disabled: false, isActive: true };
    }
    return { text: '', disabled: false, isActive: true };
  };

  const btn = getButtonState();

  return (
    <div className="flex flex-col min-h-screen bg-gmg-bg font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative text-gray-800">
      
      {step < 5 && (
        <>
            <header className="flex items-center px-4 py-5 bg-white border-b border-gray-100 sticky top-0 z-50">
                <button onClick={prevStep} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft size={24} className="text-gray-600" />
                </button>
                <h1 className="flex-1 text-center text-lg font-bold pr-8">
                {step === 1 ? '여행 기본 정보' : step === 2 ? '지역 및 스팟 선택' : step === 3 ? '위시리스트 확인' : '상담 여행사 선택'}
                </h1>
            </header>

            <div className="w-full h-1.5 bg-gray-100">
                <div className="h-full bg-gmg-camel transition-all duration-500 ease-out" style={{ width: `${(step / 4) * 100}%` }} />
            </div>
        </>
      )}

      <main className={`flex-1 overflow-y-auto ${step < 5 ? 'px-6 py-8 pb-40' : ''}`}>
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <section>
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 mb-4 uppercase tracking-widest">
                <Users size={14} /> 여행 인원
              </label>
              <div className="flex items-center justify-between bg-white p-5 rounded-3xl shadow-sm border border-gray-50">
                <button onClick={() => setFormData(p => ({...p, people: Math.max(1, p.people - 1)}))} className="w-12 h-12 rounded-2xl border-2 border-gray-100 text-xl font-bold text-gray-300">-</button>
                <div className="text-center">
                  <span className="text-4xl font-black text-gray-800">{formData.people}</span>
                  <span className="ml-2 text-gray-400 font-bold text-lg">명</span>
                </div>
                <button onClick={() => setFormData(p => ({...p, people: p.people + 1}))} className="w-12 h-12 rounded-2xl border-2 border-gmg-camel text-xl font-bold text-gmg-camel">+</button>
              </div>
            </section>

            <section className="space-y-5 text-left">
              <div className="w-full">
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">
                  <Calendar size={14} /> 출발일
                </label>
                <div className="relative text-left">
                    <input 
                      type="date" 
                      min={new Date().toISOString().slice(0, 10)}
                      className="w-full bg-white p-4 pr-12 rounded-2xl border border-gray-100 shadow-sm text-base font-bold focus:outline-none appearance-none block min-h-[60px]" 
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})} 
                      value={formData.startDate}
                    />
                    <Calendar size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-gmg-camel pointer-events-none opacity-50" />
                </div>
                <p className="text-[10px] text-gray-400 font-bold mt-1">오늘 이후 날짜만 선택 가능합니다</p>
              </div>

              <div className="w-full">
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 mb-3 uppercase tracking-widest">
                  <Moon size={14} /> 여행 기간
                </label>
                <div className="flex items-center gap-2 min-h-[60px]">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={2}
                    placeholder="1"
                    className="w-14 h-14 text-center text-base font-bold rounded-2xl border-2 border-gray-200 bg-white focus:outline-none focus:border-gmg-camel"
                    value={formData.nights === 0 ? '' : String(formData.nights)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      if (raw === '') {
                        setFormData(prev => ({ ...prev, nights: 0 }));
                        return;
                      }
                      const v = parseInt(raw, 10);
                      if (v >= 1 && v <= 99) setFormData(prev => ({ ...prev, nights: v }));
                    }}
                  />
                  <span className="text-gray-600 font-bold">박</span>
                  <input
                    type="text"
                    readOnly
                    className="w-14 h-14 text-center text-base font-bold rounded-2xl border border-gray-100 bg-gray-50 text-gray-800"
                    value={(formData.nights || 1) + 1}
                  />
                  <span className="text-gray-600 font-bold">일</span>
                </div>
                <p className="text-[10px] text-gray-400 font-bold mt-1">1~99박까지 입력 가능 (일 수는 자동 계산)</p>
              </div>
            </section>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 text-left">
            <section>
              <label className="flex items-center gap-2 text-xs font-black text-gray-400 mb-4 uppercase tracking-widest">
                <MapPin size={14} /> 지역 선택 (중복 가능)
              </label>
              <div className="grid gap-4">
                {regionData.map(r => (
                  <button key={r.id} onClick={() => toggleRegion(r.id)} className={`relative text-left p-5 rounded-3xl border-2 transition-all ${formData.selectedRegions.includes(r.id) ? 'border-gmg-camel bg-orange-50 scale-[1.02]' : 'border-white bg-white shadow-sm'}`}>
                    <div className="absolute top-4 right-4 bg-white/80 px-2 py-1 rounded-full border border-gray-100 text-[10px] font-bold text-gray-500">UB에서 {r.travelTime}</div>
                    <div className="flex justify-between items-start"><span className="text-3xl">{r.icon}</span>{formData.selectedRegions.includes(r.id) && <CheckCircle2 className="text-gmg-camel mt-8" size={24} fill="white" />}</div>
                    <div className="mt-3 font-extrabold text-lg">{r.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{r.desc}</div>
                  </button>
                ))}
              </div>
            </section>
            {formData.selectedRegions.length > 0 && (
              <div className="space-y-8 mt-10 text-left">
                {regionData.filter(r => formData.selectedRegions.includes(r.id)).map(region => (
                  <section key={region.id}>
                    <label className="text-xs font-black text-gmg-green mb-3 block">📍 {region.name} 세부 스팟 (선택)</label>
                    <div className="flex flex-wrap gap-2">
                      {region.spots.map(spot => (
                        <button key={spot} 
                          onClick={() => toggleSpot(region.id, spot)}
                          className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${formData.spots[String(region.id)]?.includes(spot) ? 'bg-gmg-green text-white shadow-md scale-105' : 'bg-white text-gray-500 border border-gray-100'}`}
                        >
                          {spot}
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="pr-1 overflow-visible">
            <div ref={contentRef} className="animate-in fade-in zoom-in-95 duration-500 bg-white p-7 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-visible text-left">
              <div className="flex items-center gap-2 mb-6 opacity-80">
                  <Compass size={20} className="text-gmg-camel" />
                  <span className="text-xl font-black text-gmg-camel italic tracking-tighter uppercase">GoMongol</span>
              </div>
              <h3 className="text-2xl font-black text-gray-800 leading-tight mb-8">여행자님의<br/><span className="text-gmg-camel font-black">몽골 여행 위시리스트</span></h3>
              <section className="mb-8 text-left">
                  <h4 className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-1">기본 정보</h4>
                  <div className="bg-gray-50 p-5 rounded-[1.5rem] border border-gray-100 flex justify-around items-center">
                      <div className="text-center"><span className="block text-[10px] text-gray-400 font-bold mb-1 uppercase">출발일</span><span className="text-sm font-black">{formData.startDate.replace(/-/g, '.')}</span></div>
                      <div className="w-px h-8 bg-gray-200" />
                      <div className="text-center"><span className="block text-[10px] text-gray-400 font-bold mb-1 uppercase">인원</span><span className="text-sm font-black">{formData.people}명</span></div>
                      <div className="w-px h-8 bg-gray-200" />
                      <div className="text-center"><span className="block text-[10px] text-gray-400 font-bold mb-1 uppercase">기간</span><span className="text-sm font-black">{(formData.nights || 1)}박 {(formData.nights || 1) + 1}일</span></div>
                  </div>
              </section>
              <section className="text-left">
                  <h4 className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest flex items-center gap-1">투어 정보</h4>
                  <div className="space-y-4">
                      {regionData.filter(r => formData.selectedRegions.includes(r.id)).map(region => (
                          <div key={region.id} className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 relative">
                              <h4 className="text-base font-black text-gray-800 flex items-center gap-2 mb-4"><span>{region.icon}</span> {region.name}</h4>
                              <div className="flex flex-wrap gap-2">
                                  {region.spots.filter(s => formData.spots[String(region.id)]?.includes(s)).map(spot => (
                                      <span key={spot} className="bg-gmg-bg text-gmg-green px-3 py-1.5 rounded-xl text-[11px] font-bold border border-gmg-green/10 flex items-center gap-1"><Hash size={10} className="opacity-50" /> {spot}</span>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              </section>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-orange-50 p-6 rounded-[2rem] border border-orange-100/50 flex gap-4 items-start text-left">
              <div className="bg-white p-2 rounded-xl text-gmg-camel shadow-sm"><Info size={20} /></div>
              <div className="space-y-1">
                <p className="text-sm font-black text-gray-800">이미지 저장이 완료되었습니다!</p>
                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">원하시는 여행사를 선택한 후 위시리스트 이미지를 전송해 주세요.</p>
              </div>
            </div>
            <div className="space-y-3">
              {partnerAgencies.map(agency => (
                <button key={agency.id} onClick={() => alert(`${agency.name} 연결`)} className="w-full bg-white p-5 rounded-[2rem] border border-gray-50 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4 text-left">
                    <div className={`w-12 h-12 ${agency.color} rounded-2xl flex items-center justify-center`}><Building2 size={24} className="text-gray-300 opacity-50" /></div>
                    <div className="text-left"><h4 className="font-black text-gray-800">{agency.name}</h4><div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold"><Star size={10} className="text-orange-400 fill-orange-400" />{agency.rating}</div></div>
                  </div>
                  <div className="bg-gmg-camel text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5"><MessageCircle size={14} /> 상담</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && savedSchedule && (
            <PostCreationForm 
                scheduleData={savedSchedule}
                isSaving={isSaving}
                onBack={() => setStep(3)} 
                onComplete={async (postData) => {
                    setIsSaving(true);
                    try {
                        const hashedPw = hashPassword(postData.userPw);
                        const { data: newUser, error: userError } = await supabase
                            .from('travel_user')
                            .insert([{
                                user_id: postData.userId.trim(),
                                user_pw: hashedPw,
                                nickname: postData.nickname.trim(),
                                user_name: postData.userName.trim()
                            }])
                            .select('user_no')
                            .single();
                        if (userError) throw userError;
                        if (!newUser?.user_no) throw new Error('유저 생성 실패');

                        const { error: postError } = await supabase
                            .from('posts')
                            .insert([{
                                schedule_id: savedSchedule.id,
                                schedule_uuid: savedSchedule.schedule_uuid,
                                status: postData.status,
                                title: postData.title,
                                description: postData.description,
                                chat_link: postData.chatLink || null,
                                current_people: postData.currentPeople,
                                target_ages: postData.targetAges,
                                target_gender: postData.targetGender,
                                nickname: postData.nickname.trim(),
                                travel_user_id: newUser.user_no
                            }]);
                        if (postError) throw postError;

                        onSaveSuccess();
                        setTimeout(() => alert('🎊 동행 모집글이 게시되었습니다!'), 0);
                    } catch (e) {
                        console.error('글 작성 에러:', e);
                        const msg = e?.message || e?.error_description || (typeof e === 'string' ? e : JSON.stringify(e));
                        if (e?.code === '23505') alert('이미 사용 중인 아이디입니다.');
                        else alert('저장 실패: ' + msg);
                    } finally {
                        setIsSaving(false);
                    }
                }}
            />
        )}
      </main>

      {step < 5 && (
        <footer className="fixed bottom-0 w-full max-w-md bg-white/90 backdrop-blur-xl p-6 border-t border-gray-50 z-50">
            {step < 3 ? (
                <button onClick={nextStep} disabled={btn.disabled} className={`w-full py-5 rounded-2xl font-black text-lg shadow-2xl transition-all ${btn.isActive ? 'bg-gmg-camel text-white shadow-orange-200/50' : 'bg-gray-100 text-gray-300'}`}>{btn.text}</button>
            ) : step === 3 ? (
                <div className="flex gap-3">
                    <button onClick={handleConsulting} className="flex-1 bg-gmg-camel text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-orange-200/50 flex items-center justify-center gap-2 active:scale-95 transition-all"><MessageCircle size={18} /> 견적 상담하기</button>
                    <button 
                    onClick={handleSaveForCommunity} 
                    disabled={isSaving}
                    className="flex-1 bg-white border-2 border-gmg-green text-gmg-green py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    >
                    {isSaving ? "저장 중..." : <><Search size={18} /> 동행 찾기</>}
                    </button>
                </div>
            ) : (
                <button onClick={() => setStep(3)} className="w-full py-5 bg-white border-2 border-gray-100 text-gray-400 rounded-2xl font-black text-lg">위시리스트 다시 확인</button>
            )}
        </footer>
      )}
    </div>
  );
};

const PostCreationForm = ({ scheduleData, isSaving, onComplete, onBack }) => {
    const [postData, setPostData] = useState({
      title: '',
      status: '모집 중',
      currentPeople: 1,
      description: '',
      targetAges: [],
      targetGender: '무관',
      userId: '',
      userPw: '',
      userName: '',
      nickname: '',
      chatLink: ''
    });
    const [userIdChecked, setUserIdChecked] = useState(false);
    const [userIdDuplicate, setUserIdDuplicate] = useState(false);
    const [userIdCheckLoading, setUserIdCheckLoading] = useState(false);

    const ageOptions = ['20대', '30대', '40대', '50대', '60대 이상'];
    const statusOptions = ['모집 중', '출발 확정', '항공권 발권완료'];

    const handleUserIdCheck = async () => {
      const id = postData.userId.trim();
      if (!isValidUserId(id)) {
        alert('아이디는 영문·숫자 3~20자로 입력해 주세요.');
        return;
      }
      setUserIdCheckLoading(true);
      setUserIdChecked(false);
      setUserIdDuplicate(false);
      try {
        const { data, error } = await supabase.from('travel_user').select('user_no').eq('user_id', id).maybeSingle();
        if (error) throw error;
        if (data) {
          setUserIdDuplicate(true);
          return;
        }
        setUserIdChecked(true);
      } catch (e) {
        console.error(e);
        alert('중복 확인 중 오류가 발생했습니다.');
      } finally {
        setUserIdCheckLoading(false);
      }
    };

    const isFormValid =
      postData.title.trim().length >= 5 &&
      postData.description.trim() !== '' &&
      postData.targetAges.length > 0 &&
      isValidUserId(postData.userId) &&
      userIdChecked &&
      isPasswordValid(postData.userPw) &&
      postData.userName.trim() !== '' &&
      postData.nickname.trim() !== '';
  
    return (
      <div className="animate-in slide-in-from-right-10 duration-500 bg-white min-h-screen">
        <header className="flex items-center px-4 py-5 bg-white border-b border-gray-100 sticky top-0 z-[60]">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={24} /></button>
          <h1 className="flex-1 text-center text-lg font-black pr-8">모집 상세 정보</h1>
        </header>
  
        <div className="px-6 py-8 space-y-10 pb-40 text-left">
          <section>
             <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest italic"><PenTool size={14}/> 00. Post Title * (5글자 이상)</label>
             <input type="text" placeholder="매력적인 모집 공고 제목 (5글자 이상)" className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-gmg-camel" value={postData.title} onChange={(e) => setPostData({...postData, title: e.target.value})} />
             {postData.title.trim().length > 0 && postData.title.trim().length < 5 && (
               <p className="text-[10px] text-red-500 font-bold mt-1">제목은 5글자 이상 입력해 주세요.</p>
             )}
          </section>

          <section>
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest italic"><Target size={14}/> 01. Status</label>
            <div className="grid grid-cols-3 gap-2">
              {statusOptions.map(opt => (
                <button key={opt} onClick={() => setPostData({...postData, status: opt})} className={`py-3 rounded-xl text-[10px] font-bold border-2 ${postData.status === opt ? 'border-gmg-camel bg-orange-50 text-gmg-camel' : 'border-gray-50 bg-white text-gray-400'}`}>{opt}</button>
              ))}
            </div>
          </section>
  
          <section>
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest italic"><Users size={14}/> 02. Current Members</label>
            <div className="bg-gray-50 p-6 rounded-[2rem] flex items-center justify-between border border-gray-100">
              <div className="flex flex-col">
                <span className="text-sm font-black text-gray-800">현재 확정 인원</span>
                <span className="text-[10px] text-gray-400 font-bold">총 {scheduleData?.people}명 중</span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setPostData(p => ({...p, currentPeople: Math.max(1, p.currentPeople - 1)}))} className="w-10 h-10 rounded-xl bg-white border font-black">-</button>
                <span className="font-black text-xl text-gmg-camel w-6 text-center">{postData.currentPeople}</span>
                <button onClick={() => setPostData(p => ({...p, currentPeople: Math.min(scheduleData?.people || 1, p.currentPeople + 1)}))} className="w-10 h-10 rounded-xl bg-white border font-black">+</button>
              </div>
            </div>
          </section>
  
          <section>
            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest italic"><Smile size={14}/> 03. About Our Group *</label>
            <textarea maxLength={300} placeholder="자기소개 및 여행 스타일 (300자 이내)" className="w-full h-32 bg-gray-50 rounded-[1.5rem] p-5 text-sm font-medium outline-none resize-none focus:ring-2 focus:ring-gmg-green" value={postData.description} onChange={(e) => setPostData({...postData, description: e.target.value})} />
            <div className="text-right text-[10px] text-gray-300 font-bold mt-2">{postData.description.length} / 300</div>
          </section>
  
          <section className="space-y-6 text-left">
            <div>
              <label className="text-[10px] font-black text-gray-400 mb-3 block uppercase tracking-widest italic">04. Age *</label>
              <div className="flex flex-wrap gap-2">
                {ageOptions.map(age => (
                  <button key={age} onClick={() => setPostData(prev => ({...prev, targetAges: prev.targetAges.includes(age) ? prev.targetAges.filter(a => a !== age) : [...prev.targetAges, age]}))} className={`px-4 py-2 rounded-xl text-[10px] font-black ${postData.targetAges.includes(age) ? 'bg-gmg-green text-white' : 'bg-gray-100 text-gray-400'}`}>{age}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-400 mb-3 block uppercase tracking-widest italic">05. Gender</label>
              <div className="flex gap-2">
                {['남성만', '여성만', '무관'].map(g => (
                  <button key={g} onClick={() => setPostData({...postData, targetGender: g})} className={`flex-1 py-3 rounded-xl text-[10px] font-black border-2 ${postData.targetGender === g ? 'border-gmg-green bg-green-50 text-gmg-green' : 'border-gray-50 bg-white text-gray-400'}`}>{g}</button>
                ))}
              </div>
            </div>
          </section>
  
          <section className="space-y-4 pt-4 border-t border-dashed border-gray-100 text-left">
            <div>
              <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest italic">06. 아이디 *</label>
              <input
                type="text"
                placeholder="영문·숫자 3~20자"
                maxLength={20}
                autoComplete="username"
                className="w-full bg-white border rounded-xl p-4 text-sm font-bold outline-none focus:border-gmg-camel"
                value={postData.userId}
                onChange={(e) => { setPostData({ ...postData, userId: e.target.value.replace(/[^a-zA-Z0-9]/g, '') }); setUserIdChecked(false); setUserIdDuplicate(false); }}
              />
              <div className="flex gap-2 mt-2 items-center flex-wrap">
                <button
                  type="button"
                  onClick={handleUserIdCheck}
                  disabled={userIdCheckLoading || !isValidUserId(postData.userId)}
                  className="px-4 py-2 rounded-xl text-xs font-black border-2 border-gmg-camel text-gmg-camel hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {userIdCheckLoading ? '확인 중...' : '중복확인'}
                </button>
                {userIdChecked && <span className="text-xs font-black text-green-600">사용가능</span>}
                {userIdDuplicate && <span className="text-xs font-black text-red-500">중복된 ID가 존재합니다.</span>}
              </div>
              <p className="text-[10px] text-gray-400 font-bold mt-1 ml-1">중복확인 후 게시글 올리기가 가능합니다</p>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest italic">07. 비밀번호 *</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="영문+숫자 조합 8자 이상"
                  autoComplete="new-password"
                  className="w-full bg-white border rounded-xl p-4 text-sm font-bold outline-none focus:border-gmg-camel"
                  value={postData.userPw}
                  onChange={(e) => setPostData({ ...postData, userPw: e.target.value })}
                />
                <Lock size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300" />
              </div>
              <p className="text-[10px] text-gray-400 font-bold mt-1 ml-1">영문과 숫자를 모두 포함 8자 이상</p>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest italic">08. 이름 *</label>
              <input type="text" placeholder="실명 또는 닉네임" className="w-full bg-white border rounded-xl p-4 text-sm font-bold outline-none focus:border-gmg-camel" value={postData.userName} onChange={(e) => setPostData({ ...postData, userName: e.target.value })} />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest italic">09. 게시글 표시 닉네임 *</label>
              <input type="text" placeholder="게시판에 보일 별명" className="w-full bg-white border rounded-xl p-4 text-sm font-bold outline-none focus:border-gmg-camel" value={postData.nickname} onChange={(e) => setPostData({ ...postData, nickname: e.target.value })} />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 mb-2 block uppercase tracking-widest italic">10. KakaoTalk Link</label>
              <div className="flex gap-2">
                <input type="text" placeholder="오픈채팅방 링크 (https://...)" className="flex-1 bg-white border rounded-xl p-4 text-sm font-bold outline-none focus:border-gmg-camel" value={postData.chatLink} onChange={(e) => setPostData({ ...postData, chatLink: e.target.value })} />
                <button
                  onClick={() => window.open('https://open.kakao.com/o/g', '_blank')}
                  className="bg-yellow-400 text-yellow-900 px-4 rounded-xl font-black text-[10px] flex items-center gap-1 shadow-sm hover:bg-yellow-300 transition-all"
                >
                  개설 <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </section>
        </div>
  
        <footer className="fixed bottom-0 w-full max-w-md bg-white/90 backdrop-blur-xl p-6 border-t border-gray-50 z-[70]">
          {!isFormValid && !isSaving && (
            <p className="text-[10px] text-gray-400 font-bold mb-2 text-center">제목(5글자↑), 소개, 연령, 아이디 사용가능, 비밀번호(영문+숫자 8자↑), 이름, 닉네임을 모두 입력해 주세요.</p>
          )}
          <button 
            type="button"
            onClick={() => { onComplete(postData).catch(err => { console.error(err); alert('저장 실패: ' + (err?.message || String(err))); }); }} 
            disabled={!isFormValid || isSaving}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-xl
              ${isFormValid && !isSaving ? 'bg-gmg-camel text-white shadow-orange-100 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
          >
            {isSaving ? '저장 중...' : <><Send size={20} /> 모집 게시글 올리기</>}
          </button>
        </footer>
      </div>
    );
  };

export default ItineraryBuilder;