import React, { useState } from 'react';
import MainPage from './mainpage';
import ItineraryBuilder from './itinerarybuilder';
import Explorer from './explorer';
import CommunityBoard from './CommunityBoard';
import PostDetail from './PostDetail';
import { Analytics } from "@vercel/analytics/react";

function App() {
  const [view, setView] = useState('main'); 
  const [selectedPost, setSelectedPost] = useState(null);
  
  // 데이터 업데이트 시 목록 새로고침을 위한 '키' 상태
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setView('postDetail');
  };

  // 수정 완료 시 호출되는 함수
  const handleUpdateSuccess = () => {
    // 1. 게시판 데이터를 다시 불러오도록 키를 변경
    setRefreshKey(prev => prev + 1);
    // 2. 상세페이지에서는 수정사항을 보여주기 위해 상태 유지 or 목록으로 이동
    setView('community'); 
    setSelectedPost(null);
  };

  const navigateToMain = () => {
    setSelectedPost(null);
    setView('main');
  };

  return (
    <div className="min-h-screen bg-gmg-bg font-sans">
      {view === 'main' && (
        <MainPage 
          onStartBuilder={() => { setSelectedPost(null); setView('builder'); }} 
          onStartExplorer={() => setView('explorer')} 
          onStartCommunity={() => setView('community')} 
        />
      )}

      {view === 'builder' && (
        <ItineraryBuilder 
          onBack={navigateToMain} 
          onSaveSuccess={() => { setRefreshKey(prev => prev + 1); setView('community'); }} 
        />
      )}

      {view === 'explorer' && (
        <Explorer 
          onBack={navigateToMain} 
          onStartBuilder={() => { setSelectedPost(null); setView('builder'); }} 
        />
      )}

      {view === 'community' && (
        <CommunityBoard 
          key={refreshKey} // 이 키가 바뀌면 게시판이 다시 로드됩니다
          onBack={navigateToMain} 
          onStartBuilder={() => { setSelectedPost(null); setView('builder'); }} 
          onPostClick={handlePostClick} 
        />
      )}

      {view === 'postDetail' && (
        <PostDetail 
          post={selectedPost} 
          onBack={() => setView('community')} 
          onUpdateSuccess={handleUpdateSuccess} // 수정 성공 핸들러
        />
      )}
    </div>
  );
}

export default App;