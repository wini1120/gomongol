import React, { useState, useEffect } from 'react';
import { ChevronLeft, MapPin, Sparkles, ArrowRight, X, Info, Route, MousePointer2 } from 'lucide-react';
import { supabase } from './supabaseClient';

const Explorer = ({ onBack, onStartBuilder }) => {
  const [spots, setSpots] = useState([]); 
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [activeRegion, setActiveRegion] = useState(0); // 0: 전체, 1: 고비, 2: 중부, 3: 홉스골
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 핀 없는 깨끗한 배경 이미지 경로
  const mapImageUrl = "/mongol_map_clean.png"; 

  const regionConfigs = {
    0: { name: '전체보기', scale: 1, x: 50, y: 50, color: '#64748b' },
    1: { name: '남부 고비', scale: 2.2, x: 55, y: 80, color: '#f59e0b' },
    2: { name: '중부 초원', scale: 1.8, x: 55, y: 55, color: '#10b981' },
    3: { name: '북부 홉스굴', scale: 2.5, x: 45, y: 25, color: '#0ea5e9' },
  };

  useEffect(() => {
    const fetchSpots = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('master_spots').select('*');
        if (error) throw error;
        setSpots(data || []);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };
    fetchSpots();
  }, []);

  return (
    <div className="h-screen w-full bg-[#E0F2FE] relative overflow-hidden font-sans">
      
      {/* 1. 배경 지도 레이어 (줌 효과 포함) */}
      <div 
        className="absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
        style={{
          transform: `scale(${regionConfigs[activeRegion].scale})`,
          transformOrigin: `${regionConfigs[activeRegion].x}% ${regionConfigs[activeRegion].y}%`,
          filter: selectedSpot ? 'blur(12px) brightness(0.9)' : 'none'
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <img src={mapImageUrl} className="w-full h-full object-contain p-10 select-none opacity-80" alt="Clean Map" />
          
          {!isLoading && spots.map((spot) => {
            // 현재 활성화된 지역의 핀만 보여주거나, 전체보기일 때는 대표 핀만 노출
            const isVisible = activeRegion === 0 ? spot.is_representative : activeRegion === spot.region_id;
            const pinScale = 1 / Math.sqrt(regionConfigs[activeRegion].scale);
            
            return (isVisible && (
              <button
                key={spot.id}
                onClick={() => setSelectedSpot(spot)}
                className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 z-30"
                style={{ left: `${spot.x_coord}%`, top: `${spot.y_coord}%`, transform: `translate(-50%, -50%) scale(${pinScale})` }}
              >
                <div className="flex flex-col items-center group">
                  <div className={`w-5 h-5 rounded-full border-2 transition-all shadow-lg flex items-center justify-center bg-white border-green-800 group-hover:scale-125`}>
                    <div className="w-2 h-2 bg-green-800 rounded-full" />
                  </div>
                  <div className="mt-1.5 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded shadow-sm border border-white/50">
                    <span className="text-[10px] font-black text-green-950 whitespace-nowrap tracking-tighter uppercase">
                      {spot.spot_name}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          )}
        </div>
      </div>

      {/* 2. 상단 지역 선택 네비게이터 (Glassmorphism) */}
      <nav className="absolute top-6 inset-x-0 mx-auto w-[92%] max-w-xl z-50">
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-2xl rounded-full px-4 py-2 flex items-center justify-between">
          <button onClick={onBack} className="p-2 hover:bg-white/50 rounded-full transition-colors"><ChevronLeft size={20}/></button>
          <div className="flex gap-1 overflow-x-auto no-scrollbar mx-2">
            {Object.entries(regionConfigs).map(([id, config]) => (
              <button key={id} onClick={() => { setActiveRegion(Number(id)); setSelectedSpot(null); }}
                className={`px-4 py-2 rounded-full text-[11px] font-black transition-all ${activeRegion === Number(id) ? 'bg-green-900 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-green-800'}`}>
                {config.name}
              </button>
            ))}
          </div>
          <div className="w-10" /> {/* 밸런스용 여백 */}
        </div>
      </nav>

      {/* 3. 플로팅 정보 카드 */}
      <div className={`absolute transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] z-[100] 
        ${isMobile 
          ? `bottom-0 inset-x-0 w-full ${selectedSpot ? 'translate-y-0' : 'translate-y-full'}` 
          : `top-1/2 -translate-y-1/2 right-10 w-96 ${selectedSpot ? 'translate-x-0 opacity-100' : 'translate-x-20 opacity-0 pointer-events-none'}`}`}>
        
        {selectedSpot && (
          <div className="bg-white/80 backdrop-blur-3xl border border-white shadow-[0_32px_64px_rgba(0,0,0,0.1)] rounded-[3rem] p-10 relative">
            <button onClick={() => setSelectedSpot(null)} className="absolute top-8 right-8 p-2 bg-gray-100/50 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"><X size={20}/></button>
            <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest">
              <MapPin size={12} /> {regionConfigs[selectedSpot.region_id]?.name}
            </div>
            <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">{selectedSpot.spot_name}</h2>
            <p className="text-[15px] text-gray-500 font-medium leading-relaxed mb-10 italic">"{selectedSpot.spot_name}에서 잊지 못할 몽골의 순간을 기록하세요."</p>
            
            <div className="bg-sky-50/50 p-6 rounded-[2rem] border border-sky-100 mb-10">
                <div className="flex items-center gap-3 mb-2 text-sky-600">
                    <Sparkles size={18} /><span className="text-[11px] font-black uppercase tracking-widest">Travel Tip</span>
                </div>
                <p className="text-[13px] font-bold text-sky-900 leading-snug">이 지역은 밤하늘의 은하수가 가장 아름답게 보이는 명소입니다.</p>
            </div>

            <button onClick={onStartBuilder} className="w-full py-5 bg-green-900 text-white rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
              이 장소 포함하기 <ArrowRight size={22} />
            </button>
          </div>
        )}
      </div>

      {/* 안내 배지 */}
      {!selectedSpot && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-40 animate-bounce">
          <div className="bg-white/50 backdrop-blur-md px-6 py-3 rounded-full border border-white shadow-lg flex items-center gap-3">
            <MousePointer2 size={16} className="text-green-900" />
            <span className="text-[11px] font-black text-green-900 uppercase tracking-widest">지도를 탐험하고 스팟을 발견하세요</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explorer;