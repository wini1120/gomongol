import React, { useState } from 'react';
import { ChevronLeft, Users, Calendar, Moon, MapPin, CheckCircle2, Clock, MessageCircle, Search, Hash } from 'lucide-react';

const ItineraryBuilder = ({ onBack }) => {
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    people: 4,
    startDate: '',
    nights: 5,
    selectedRegions: [], 
    spots: []
  });

  const regionData = [
    { 
      id: 'gobi', 
      name: '남고비 사막 코스', 
      travelTime: '8~10시간',
      desc: '지평선과 은하수, 낙타 트레킹', 
      icon: '🐪',
      spots: ['바가 가쯔링 촐로', '차강 소브라가', '욜린암', '홍고링 엘스', '바얀작', '엉긴 사원', '만달고비']
    },
    { 
      id: 'central', 
      name: '중부 힐링 코스', 
      travelTime: '3~5시간',
      desc: '초원, 야생마, 온천과 폭포', 
      icon: '🌿',
      spots: ['테를지 국립공원', '미니고비 (엘승타사르하이)', '쳉헤르 온천', '오기 호수', '카라코롬 (에르덴조 사원)', '어르헝 폭포']
    },
    { 
      id: 'khuvsgul', 
      name: '홉스굴 북부 코스', 
      travelTime: '12~14시간',
      desc: '푸른 진주 호수와 순록 부족', 
      icon: '💎',
      spots: ['홉스굴 호수', '오랑 터거 (화산 분화구)', '테르힝 차강 호수', '볼강', '무릉', '신이데르 마을']
    }
  ];

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => (step === 1 ? onBack() : setStep(prev => prev - 1));

  const toggleRegion = (regionId) => {
    setFormData(prev => {
      const isSelected = prev.selectedRegions.includes(regionId);
      const newRegions = isSelected 
        ? prev.selectedRegions.filter(id => id !== regionId) 
        : [...prev.selectedRegions, regionId];
      const removedRegion = regionData.find(r => r.id === regionId);
      const newSpots = isSelected 
        ? prev.spots.filter(s => !removedRegion.spots.includes(s))
        : prev.spots;
      return { ...prev, selectedRegions: newRegions, spots: newSpots };
    });
  };

  const toggleSpot = (spot) => {
    setFormData(prev => ({
      ...prev,
      spots: prev.spots.includes(spot) 
        ? prev.spots.filter(s => s !== spot) 
        : [...prev.spots, spot]
    }));
  };

  const getButtonState = () => {
    if (step === 1) return { text: '다음 단계로', disabled: !formData.startDate, isActive: !!formData.startDate };
    if (step === 2) {
      if (formData.selectedRegions.length === 0) return { text: '지역을 선택해주세요', disabled: true, isActive: false };
      if (formData.spots.length === 0) return { text: '장소를 골라주세요', disabled: true, isActive: false };
      return { text: '최종 일정 확인하기', disabled: false, isActive: true };
    }
    return null; // Step 3는 하단 버튼 구조가 다름
  };

  const btn = getButtonState();

  return (
    <div className="flex flex-col min-h-screen bg-gmg-bg font-sans max-w-md mx-auto shadow-2xl overflow-hidden relative text-gray-800 pb-20">
      
      {/* Header */}
      <header className="flex items-center px-4 py-5 bg-white border-b border-gray-100">
        <button onClick={prevStep} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold pr-8">
          {step === 1 ? '여행 기본 정보' : step === 2 ? '지역 및 스팟 선택' : '나의 맞춤 일정표'}
        </h1>
      </header>

      {/* Progress Bar (Step 3에서는 숨김) */}
      {step < 3 && (
        <div className="w-full h-1.5 bg-gray-100">
          <div className="h-full bg-gmg-camel transition-all duration-500 ease-out" style={{ width: `${(step / 2) * 100}%` }} />
        </div>
      )}

      <main className="flex-1 px-6 py-8 overflow-y-auto">
        {step === 1 && (
          /* --- STEP 1: 인원 / 날짜 --- */
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4">
            <section>
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 mb-4 uppercase tracking-widest"><Users size={14} /> 여행 인원</label>
                <div className="flex items-center justify-between bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
                    <button onClick={() => setFormData(p => ({...p, people: Math.max(1, p.people - 1)}))} className="w-14 h-14 rounded-2xl border-2 border-gray-100 text-2xl font-bold text-gray-300">-</button>
                    <div className="text-center"><span className="text-4xl font-black">{formData.people}</span><span className="ml-2 text-gray-400 font-bold text-lg">명</span></div>
                    <button onClick={() => setFormData(p => ({...p, people: p.people + 1}))} className="w-14 h-14 rounded-2xl border-2 border-gmg-camel text-2xl font-bold text-gmg-camel">+</button>
                </div>
            </section>
            <section className="grid grid-cols-2 gap-4">
                <div>
                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 mb-4 uppercase tracking-widest"><Calendar size={14} /> 출발일</label>
                    <input type="date" className="w-full bg-white p-4 rounded-2xl border border-gray-50 shadow-sm text-sm focus:outline-none" onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                </div>
                <div>
                    <label className="flex items-center gap-2 text-xs font-black text-gray-400 mb-4 uppercase tracking-widest"><Moon size={14} /> 여행 기간</label>
                    <select className="w-full bg-white p-4 rounded-2xl border border-gray-50 shadow-sm text-sm focus:outline-none appearance-none" value={formData.nights} onChange={(e) => setFormData({...formData, nights: parseInt(e.target.value)})}>
                        {[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => <option key={n} value={n}>{n}박 {n+1}일</option>)}
                    </select>
                </div>
            </section>
          </div>
        )}

        {step === 2 && (
          /* --- STEP 2: 지역 및 스팟 --- */
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
            <section>
                <label className="flex items-center gap-2 text-xs font-black text-gray-400 mb-4 uppercase tracking-widest"><MapPin size={14} /> 지역 선택</label>
                <div className="grid gap-4">
                    {regionData.map(r => (
                        <button key={r.id} onClick={() => toggleRegion(r.id)} className={`relative text-left p-5 rounded-3xl border-2 transition-all ${formData.selectedRegions.includes(r.id) ? 'border-gmg-camel bg-orange-50/50 scale-[1.02]' : 'border-white bg-white shadow-sm'}`}>
                            <div className="absolute top-4 right-4 bg-white/80 px-2 py-1 rounded-full border border-gray-100 text-[10px] font-bold text-gray-500">UB에서 {r.travelTime}</div>
                            <div className="flex justify-between items-start"><span className="text-3xl">{r.icon}</span>{formData.selectedRegions.includes(r.id) && <CheckCircle2 className="text-gmg-camel mt-8" size={24} fill="white" />}</div>
                            <div className="mt-3 font-extrabold text-lg">{r.name}</div>
                            <div className="text-xs text-gray-400 mt-1">{r.desc}</div>
                        </button>
                    ))}
                </div>
            </section>
            {formData.selectedRegions.length > 0 && (
                <div className="space-y-8 mt-10 animate-in slide-in-from-bottom-4">
                    {regionData.filter(r => formData.selectedRegions.includes(r.id)).map(region => (
                        <section key={region.id}>
                            <label className="text-xs font-black text-gmg-green mb-3 block">📍 {region.name} 추천 스팟</label>
                            <div className="flex flex-wrap gap-2">
                                {region.spots.map(spot => (
                                    <button key={spot} onClick={() => toggleSpot(spot)} className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all ${formData.spots.includes(spot) ? 'bg-gmg-green text-white shadow-md scale-105' : 'bg-white text-gray-500 border border-gray-100'}`}>{spot}</button>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            )}
          </div>
        )}

        {step === 3 && (
          /* --- STEP 3: 최종 일정표 요약 (Winnie's Design) --- */
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* 상단 요약 바 */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 flex justify-around items-center">
                <div className="text-center"><span className="block text-[10px] text-gray-400 font-bold mb-1 uppercase">출발</span><span className="text-sm font-black">{formData.startDate.replace(/-/g, '.')}</span></div>
                <div className="w-px h-8 bg-gray-100" />
                <div className="text-center"><span className="block text-[10px] text-gray-400 font-bold mb-1 uppercase">인원</span><span className="text-sm font-black">{formData.people}명</span></div>
                <div className="w-px h-8 bg-gray-100" />
                <div className="text-center"><span className="block text-[10px] text-gray-400 font-bold mb-1 uppercase">기간</span><span className="text-sm font-black">{formData.nights}박 {formData.nights+1}일</span></div>
            </div>

            <h3 className="text-2xl font-black text-gray-800 px-2 mt-8">
                위니님의 <span className="text-gmg-camel">몽골 여행</span> 제안서
            </h3>

            {/* 지역별 카드 리스트 */}
            <div className="space-y-4">
                {regionData.filter(r => formData.selectedRegions.includes(r.id)).map(region => (
                    <div key={region.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <div className="flex justify-between items-center mb-5">
                            <h4 className="text-lg font-black text-gray-800 flex items-center gap-2">
                                <span className="text-2xl">{region.icon}</span> {region.name}
                            </h4>
                            <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-1 rounded-lg font-bold">UB에서 {region.travelTime}</span>
                        </div>
                        
                        {/* 선택한 스팟들 해시태그 나열 */}
                        <div className="flex flex-wrap gap-2">
                            {region.spots.filter(s => formData.spots.includes(s)).map(spot => (
                                <span key={spot} className="bg-gmg-bg text-gmg-green px-3 py-1.5 rounded-xl text-xs font-bold border border-gmg-green/10 flex items-center gap-1">
                                    <Hash size={10} className="opacity-50" /> {spot}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* 안내 문구 */}
            <p className="text-center text-xs text-gray-400 font-medium py-4">
                위 일정은 투어사 사정에 따라 소폭 변경될 수 있습니다.
            </p>
          </div>
        )}
      </main>

      {/* Footer Buttons */}
      <footer className="fixed bottom-0 w-full max-w-md bg-white/90 backdrop-blur-xl p-6 border-t border-gray-50 z-50">
        {step < 3 ? (
            <button 
                onClick={nextStep} 
                disabled={btn.disabled} 
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all ${btn.isActive ? 'bg-gmg-camel text-white shadow-xl shadow-orange-200/50' : 'bg-gray-100 text-gray-300'}`}
            >
                {btn.text}
            </button>
        ) : (
            <div className="flex gap-3">
                <button 
                    onClick={() => alert('투어사에 상담을 요청했습니다! (오픈채팅 연결 예정)')}
                    className="flex-1 bg-gmg-camel text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-200/50 flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                    <MessageCircle size={20} /> 견적 상담하기
                </button>
                <button 
                    onClick={() => alert('동행 찾기 게시판으로 이동합니다!')}
                    className="flex-1 bg-white border-2 border-gmg-green text-gmg-green py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                    <Search size={20} /> 동행 찾기
                </button>
            </div>
        )}
      </footer>
    </div>
  );
};

export default ItineraryBuilder;