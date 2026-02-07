import React, { useState } from 'react';
import MainPage from './mainpage';
import ItineraryBuilder from './itinerarybuilder';
import Explorer from './explorer';
import CommunityBoard from './CommunityBoard';

function App() {
  // 'main', 'builder', 'explorer', 'community' 상태 관리
  const [view, setView] = useState('main'); 

  return (
    <div className="min-h-screen bg-gmg-bg font-sans">
      {/* 1. 메인 페이지 */}
      {view === 'main' && (
        <MainPage 
          onStartBuilder={() => setView('builder')} 
          onStartExplorer={() => setView('explorer')} 
          onStartCommunity={() => setView('community')} 
        />
      )}

      {/* 2. 일정 만들기: 완료(onSaveSuccess) 시 community 뷰로 전환 */}
      {view === 'builder' && (
        <ItineraryBuilder 
          onBack={() => setView('main')} 
          onSaveSuccess={() => setView('community')} 
        />
      )}

      {/* 3. 몽골 둘러보기 */}
      {view === 'explorer' && (
        <Explorer 
          onBack={() => setView('main')} 
          onStartBuilder={() => setView('builder')} 
        />
      )}

      {/* 4. 동행 찾기 게시판 */}
      {view === 'community' && (
        <CommunityBoard 
          onBack={() => setView('main')} 
          onStartBuilder={() => setView('builder')} 
        />
      )}
    </div>
  );
}

export default App;