import React, { useState } from 'react';
import MainPage from './mainpage';
import ItineraryBuilder from './itinerarybuilder';
import Explorer from './explorer';
import CommunityBoard from './CommunityBoard'; // 1. 게시판 컴포넌트 임포트

function App() {
  // 'main', 'builder', 'explorer', 'community' 4가지 상태로 관리합니다.
  const [view, setView] = useState('main'); 

  return (
    <div className="min-h-screen bg-gmg-bg font-sans">
      {/* 2. 메인 페이지: 동행찾기 시작 함수 추가 */}
      {view === 'main' && (
        <MainPage 
          onStartBuilder={() => setView('builder')} 
          onStartExplorer={() => setView('explorer')} 
          onStartCommunity={() => setView('community')} 
        />
      )}

      {/* 3. 일정 만들기 */}
      {view === 'builder' && (
        <ItineraryBuilder onBack={() => setView('main')} />
      )}

      {/* 4. 몽골 둘러보기 */}
      {view === 'explorer' && (
        <Explorer 
          onBack={() => setView('main')} 
          onStartBuilder={() => setView('builder')} 
        />
      )}

      {/* 5. [신규] 동행 찾기 게시판 */}
      {view === 'community' && (
        <CommunityBoard onBack={() => setView('main')} />
      )}
    </div>
  );
}

export default App;