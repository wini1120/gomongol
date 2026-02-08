import React, { useState } from 'react';
import MainPage from './mainpage';
import ItineraryBuilder from './itinerarybuilder';
import Explorer from './explorer';
import CommunityBoard from './CommunityBoard';
import PostDetail from './PostDetail'; // [추가] 상세 페이지 컴포넌트

function App() {
  // 'main', 'builder', 'explorer', 'community', 'postDetail' 상태 관리
  const [view, setView] = useState('main'); 
  const [selectedPost, setSelectedPost] = useState(null); // [추가] 클릭한 게시글 저장

  // [추가] 게시판에서 글 클릭 시 호출할 함수
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setView('postDetail');
  };

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

      {/* 2. 일정 만들기 */}
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

      {/* 4. 동행 찾기 게시판: onPostClick 추가 */}
      {view === 'community' && (
        <CommunityBoard 
          onBack={() => setView('main')} 
          onStartBuilder={() => setView('builder')} 
          onPostClick={handlePostClick} 
        />
      )}

      {/* 5. [신규] 게시글 상세 페이지 */}
      {view === 'postDetail' && (
        <PostDetail 
          post={selectedPost} 
          onBack={() => setView('community')} 
        />
      )}
    </div>
  );
}

export default App;