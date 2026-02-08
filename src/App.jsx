import React, { useState } from 'react';
import MainPage from './mainpage';
import ItineraryBuilder from './itinerarybuilder';
import Explorer from './explorer';
import CommunityBoard from './CommunityBoard';
import PostDetail from './PostDetail';

function App() {
  const [view, setView] = useState('main'); 
  const [selectedPost, setSelectedPost] = useState(null);

  // 게시판에서 글 클릭 시 호출
  const handlePostClick = (post) => {
    setSelectedPost(post);
    setView('postDetail');
  };

  // 상세 페이지에서 비밀번호 확인 후 수정 진입 시 호출
  const handleEdit = (post) => {
    // selectedPost에 데이터가 있는 상태로 builder로 이동
    setView('builder');
  };

  const navigateToMain = () => {
    setSelectedPost(null);
    setView('main');
  };

  return (
    <div className="min-h-screen bg-gmg-bg font-sans">
      {/* 1. 메인 페이지 */}
      {view === 'main' && (
        <MainPage 
          onStartBuilder={() => { setSelectedPost(null); setView('builder'); }} 
          onStartExplorer={() => setView('explorer')} 
          onStartCommunity={() => setView('community')} 
        />
      )}

      {/* 2. 일정 만들기 (신규 작성 및 수정 겸용) */}
      {view === 'builder' && (
        <ItineraryBuilder 
          onBack={navigateToMain} 
          onSaveSuccess={() => setView('community')} 
          editData={selectedPost} // 수정할 데이터를 props로 전달
        />
      )}

      {/* 3. 몽골 둘러보기 */}
      {view === 'explorer' && (
        <Explorer 
          onBack={navigateToMain} 
          onStartBuilder={() => { setSelectedPost(null); setView('builder'); }} 
        />
      )}

      {/* 4. 동행 찾기 게시판 */}
      {view === 'community' && (
        <CommunityBoard 
          onBack={navigateToMain} 
          onStartBuilder={() => { setSelectedPost(null); setView('builder'); }} 
          onPostClick={handlePostClick} 
        />
      )}

      {/* 5. 게시글 상세 페이지 */}
      {view === 'postDetail' && (
        <PostDetail 
          post={selectedPost} 
          onBack={() => setView('community')} 
          onEdit={handleEdit} // 수정 핸들러 전달
        />
      )}
    </div>
  );
}

export default App;