import React, { useState } from 'react';
import MainPage from './mainpage';
import ItineraryBuilder from './itinerarybuilder';
import Explorer from './explorer';
import CommunityBoard from './CommunityBoard';
import PostDetail from './PostDetail';
import ReviewBoard from './ReviewBoard';
import ReviewWrite from './ReviewWrite';
import ReviewDetail from './ReviewDetail';
import AgencyDetail from './AgencyDetail';
import { Analytics } from "@vercel/analytics/react";
import { X } from 'lucide-react';

function App() {
  const [view, setView] = useState('main'); 
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [showExplorerPreparingModal, setShowExplorerPreparingModal] = useState(false);
  
  // 데이터 업데이트 시 목록 새로고침을 위한 '키' 상태
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setView('postDetail');
  };

  const handleReviewClick = (review) => {
    setSelectedReview(review);
    setView('reviewDetail');
  };

  const handleAgencyClick = (agency) => {
    setSelectedAgency(agency);
    setView('agencyDetail');
  };

  // 수정 완료 시 호출되는 함수
  const handleUpdateSuccess = () => {
    setRefreshKey(prev => prev + 1);
    setView('community'); 
    setSelectedPost(null);
  };

  const navigateToMain = () => {
    setSelectedPost(null);
    setSelectedReview(null);
    setSelectedAgency(null);
    setView('main');
  };

  return (
    <div className="min-h-screen bg-gmg-bg font-sans">
      {view === 'main' && (
        <MainPage 
          onStartBuilder={() => { setSelectedPost(null); setView('builder'); }} 
          onStartExplorer={() => setShowExplorerPreparingModal(true)} 
          onStartCommunity={() => setView('community')} 
          onStartReviewBoard={() => setView('reviewBoard')}
          onAgencyClick={handleAgencyClick}
        />
      )}

      {/* 몽골 둘러보기 준비 중 모달 */}
      {showExplorerPreparingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowExplorerPreparingModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setShowExplorerPreparingModal(false)} className="absolute top-4 right-4 p-1.5 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} className="text-gray-400" />
            </button>
            <p className="text-lg font-black text-gray-800 mt-2">현재 준비 중입니다.</p>
            <p className="text-sm text-gray-500 mt-2">몽골 둘러보기 서비스는 곧 만나보실 수 있어요.<br />조금만 기다려 주세요!</p>
            <button
              type="button"
              onClick={() => setShowExplorerPreparingModal(false)}
              className="mt-6 w-full py-3 rounded-xl bg-gmg-camel text-white font-black text-sm"
            >
              확인
            </button>
          </div>
        </div>
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
          onGoToReviewBoard={() => setView('reviewBoard')}
        />
      )}

      {view === 'postDetail' && (
        <PostDetail 
          post={selectedPost} 
          onBack={() => setView('community')} 
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}

      {view === 'reviewBoard' && (
        <ReviewBoard 
          key={refreshKey}
          onBack={navigateToMain}
          onStartReviewWrite={() => setView('reviewWrite')}
          onReviewClick={handleReviewClick}
          onAgencyClick={handleAgencyClick}
          onGoToCommunity={() => setView('community')}
        />
      )}

      {view === 'reviewWrite' && (
        <ReviewWrite 
          onBack={() => setView('reviewBoard')}
          onSuccess={() => { setRefreshKey(prev => prev + 1); setView('reviewBoard'); }}
        />
      )}

      {view === 'reviewDetail' && selectedReview && (
        <ReviewDetail 
          review={selectedReview}
          onBack={() => { setSelectedReview(null); setView('reviewBoard'); }}
          onAgencyClick={() => { setSelectedAgency(selectedReview.agency_user); setView('agencyDetail'); }}
        />
      )}

      {view === 'agencyDetail' && selectedAgency && (
        <AgencyDetail 
          agency={selectedAgency}
          onBack={() => { setSelectedAgency(null); setView('main'); }}
          onReviewClick={handleReviewClick}
        />
      )}
    </div>
  );
}

export default App;