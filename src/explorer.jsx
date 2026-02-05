import React, { useState } from 'react';
import { ChevronLeft, MapPin, Clock, Star, ArrowRight, Sparkles } from 'lucide-react';

const Explorer = ({ onBack, onStartBuilder }) => {
  const [activeRegion, setActiveRegion] = useState('gobi');

  const regionDetails = {
    gobi: {
      name: '남고비 사막',
      tagline: '지평선의 끝, 붉은 절벽과 은하수',
      img: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=80&w=800',
      spots: [
        { name: '차강 소브라가', desc: '몽골의 그랜드 캐니언이라 불리는 형형색색의 절벽', tip: '일몰 때가 가장 예뻐요' },
        { name: '욜린암', desc: '한여름에도 얼음이 남아있는 거대한 협곡', tip: '말 트레킹 코스로 추천' },
        { name: '홍고링 엘스', desc: '노래하는 모래 언덕, 세계 3대 사막의 위엄', tip: '맨발로 올라가보세요' }
      ]
    },
    central: {
      name: '중부 초원',
      tagline: '푸른 초원 위 야생마와 온천 힐링',
      img: 'https://images.unsplash.com/photo-1536431311719-398b6704d4cc?auto=format&fit=crop&q=80&w=800',
      spots: [
        { name: '테를지 국립공원', desc: '기암괴석과 푸른 초원이 어우러진 휴양지', tip: '거북이 바위는 필수 인증샷' },
        { name: '쳉헤르 온천', desc: '밤하늘의 별을 보며 즐기는 야외 노천탕', tip: '피로 회복에 최고예요' }
      ]
    },
    khuvsgul: {
      name: '홉스굴 북부',
      tagline: '어머니의 바다, 푸른 진주 홉스굴 호수',
      img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
      spots: [
        { name: '홉스굴 호수', desc: '세계에서 가장 맑은 민물 호수 중 하나', tip: '보트 투어를 꼭 해보세요' },
        { name: '순록 마을', desc: '차탕족의 순록 문화', tip: '순록과 사진 찍기 가능' }
      ]
    }
  };

  const current = regionDetails[activeRegion];

  return (
    <div className="min-h-screen bg-white font-sans max-w-md mx-auto shadow-2xl relative flex flex-col text-gray-800">
      
      {/* 1. Header */}
      <header className="flex items-center px-4 py-5 bg-white sticky top-0 z-50 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="flex-1 text-center text-lg font-black pr-8">몽골 투어 둘러보기</h1>
      </header>

      {/* 2. Region Tabs */}
      <div className="flex px-6 gap-6 border-b border-gray-50 overflow-x-auto no-scrollbar bg-white">
        {Object.keys(regionDetails).map((key) => (
          <button 
            key={key} 
            onClick={() => setActiveRegion(key)} 
            className={`py-4 text-sm font-black transition-all whitespace-nowrap ${
              activeRegion === key ? 'text-gmg-camel border-b-2 border-gmg-camel' : 'text-gray-300'
            }`}
          >
            {regionDetails[key].name}
          </button>
        ))}
      </div>

      <main className="flex-1 pb-32">
        {/* 3. Hero Image */}
        <div className="relative h-64 overflow-hidden">
          <img src={current.img} alt={current.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-6 left-6 text-white">
            <h2 className="text-3xl font-black mb-1">{current.name}</h2>
            <p className="text-sm font-medium opacity-90">{current.tagline}</p>
          </div>
        </div>

        {/* 4. Spots List */}
        <section className="px-6 py-8 space-y-10">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin size={14} /> 주요 방문 스팟
          </h3>
          
          {current.spots.map((spot, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-gray-50">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-gmg-camel" />
              <h4 className="text-lg font-bold text-gray-800 mb-2">{spot.name}</h4>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">{spot.desc}</p>
              <div className="bg-orange-50 p-3 rounded-xl inline-flex items-center gap-2">
                <Sparkles size={12} className="text-gmg-camel" />
                <span className="text-[11px] font-bold text-gmg-camel">Tip: {spot.tip}</span>
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* 5. Bottom CTA (텍스트 고정: 나만의 일정표 만들기) */}
      <footer className="fixed bottom-0 w-full max-w-md bg-white/90 backdrop-blur-xl p-6 border-t border-gray-50 z-50">
        <button 
          onClick={onStartBuilder} 
          className="w-full py-5 bg-gmg-camel text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-200/50 flex items-center justify-center gap-2 active:scale-95 transition-all"
        >
          나만의 일정표 만들기 <ArrowRight size={20} />
        </button>
      </footer>
    </div>
  );
};

export default Explorer;