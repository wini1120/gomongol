import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, Home, Users, MessageSquareText, Compass, Plus, Star, X,
} from 'lucide-react';
import { supabase } from './supabaseClient';

const REGION_LABELS = { 고비: '#고비', 홉스골: '#홉스골', 중부: '#중부' };
const parseRegions = (regionStr) => (regionStr || '').split(',').map((r) => r.trim()).filter(Boolean);

const getPhotoList = (review) => {
  const photos = review.review_photo || [];
  const sorted = [...photos].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const urls = sorted.map((p) => p.image_url).filter(Boolean);
  if (urls.length) return urls;
  if (review.thumbnail_url) return [review.thumbnail_url];
  return ['https://placehold.co/800x500/e2e8f0/94a3b8?text=No+Image'];
};

const ReviewBoard = ({ onBack, onStartReviewWrite, onReviewClick, onAgencyClick, onGoToCommunity }) => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalReview, setModalReview] = useState(null);
  const [modalPhotoIndex, setModalPhotoIndex] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('travel_review')
        .select(`
          *,
          agency_user:agency_user_id ( user_no, company_name, company_kakao_link, company_logo_url ),
          review_photo ( image_url, sort_order )
        `)
        .eq('is_delete', 'X')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('travel_review fetch error', error);
        setReviews([]);
      } else {
        setReviews(data || []);
      }
      setIsLoading(false);
    };
    fetch();
  }, []);

  const getThumbnail = (review) => {
    const photos = review.review_photo || [];
    const sorted = [...photos].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return sorted[0]?.image_url || review.thumbnail_url || 'https://placehold.co/800x500/e2e8f0/94a3b8?text=No+Image';
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans max-w-[1920px] mx-auto text-gray-800">
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 sticky top-0 h-screen p-8 justify-between z-50">
        <div className="space-y-10">
          <div className="flex items-center gap-2 text-gmg-camel cursor-pointer" onClick={onBack}>
            <img src="/gomongol_logo.png" alt="Go몽골" className="h-9 w-auto object-contain" />
            <span className="text-2xl font-black italic tracking-tighter uppercase">GoMongol</span>
          </div>
          <nav className="space-y-2">
            <div onClick={onBack} className="flex items-center gap-3 p-4 text-gray-400 hover:text-gmg-camel hover:bg-orange-50/50 rounded-2xl transition-all font-bold cursor-pointer">
              <Home size={20} /> <span>홈</span>
            </div>
            <div onClick={onGoToCommunity ?? onBack} className="flex items-center gap-3 p-4 text-gray-400 hover:text-gmg-camel hover:bg-orange-50/50 rounded-2xl transition-all font-bold cursor-pointer">
              <Users size={20} /> <span>동행찾기 게시판</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gmg-bg text-gmg-camel rounded-2xl font-black cursor-pointer shadow-sm shadow-orange-100/50">
              <MessageSquareText size={20} /> <span>여행 후기 게시판</span>
            </div>
          </nav>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40 lg:px-4">
          <div className="flex items-center justify-between px-6 py-5 lg:py-8">
            <div className="flex items-center gap-3">
              <button onClick={onBack} className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-2xl lg:text-4xl font-extrabold text-gray-800 tracking-tight">여행 후기 ✨</h1>
            </div>
            <button
              onClick={onStartReviewWrite}
              className="h-12 px-6 rounded-2xl font-black text-sm bg-gmg-camel text-white shadow-lg shadow-orange-100 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus size={18} /> 후기 작성하기
            </button>
          </div>
        </header>

        <div className="p-6 lg:px-10 flex-1">
          {isLoading ? (
            <div className="text-center py-20 font-black text-gray-300 animate-pulse text-xl italic tracking-widest">LOADING...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-32 space-y-4">
              <div className="bg-gray-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto text-gray-300"><MessageSquareText size={32} /></div>
              <p className="font-black text-gray-400">등록된 여행 후기가 없습니다.</p>
              <button onClick={onStartReviewWrite} className="text-gmg-camel font-black text-sm underline underline-offset-4">첫 후기 작성하기</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 mb-12">
              {reviews.map((review) => {
                const thumb = getThumbnail(review);
                const agency = review.agency_user || {};
                const periodText = `${review.nights}박 ${review.nights + 1}일`;
                const regionList = parseRegions(review.region);
                return (
                  <div
                    key={review.id}
                    onClick={() => { setModalReview(review); setModalPhotoIndex(0); }}
                    className="group flex flex-col cursor-pointer bg-white rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 text-left overflow-hidden"
                  >
                    <div className="relative h-40 overflow-hidden bg-gray-100">
                      <img src={thumb} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); agency.user_no && onAgencyClick(agency); }}
                        className="absolute top-4 right-4 px-2.5 py-1 rounded-lg bg-white/95 text-gray-800 text-[10px] font-black shadow-sm hover:bg-white"
                      >
                        {agency.company_name || '여행사'}
                      </button>
                      <div className="absolute bottom-2 left-2 right-2">
                        <h3 className="text-white font-extrabold text-lg lg:text-xl drop-shadow-md line-clamp-2">{review.title}</h3>
                      </div>
                    </div>
                    <div className="p-3 flex flex-col min-h-0">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase">기간</p>
                          <p className="text-xs font-black text-gray-800">{periodText}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">여행지</p>
                          <div className="flex flex-wrap gap-1">
                            {regionList.map((r) => (
                              <span key={r} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-black">{REGION_LABELS[r] || r}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.description && (
                        <p className="text-[11px] text-gray-500 leading-snug line-clamp-2 mt-2">
                          {review.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 후기 상세 모달 */}
      {modalReview && (() => {
        const photos = getPhotoList(modalReview);
        const agency = modalReview.agency_user || {};
        const periodText = `${modalReview.nights}박 ${modalReview.nights + 1}일`;
        const regionList = parseRegions(modalReview.region);
        return (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
            onClick={() => setModalReview(null)}
          >
            <div
              className="relative bg-white w-full max-w-lg h-[90vh] flex flex-col rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setModalReview(null)}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
              >
                <X size={20} />
              </button>

              {/* 사진 슬라이드 - 고정 비율 3:4 (이미지 3 / 하단 4), 제목 좌측 하단 오버레이 */}
              <div className="relative bg-gray-900 flex-none w-full h-[39vh] overflow-hidden">
                <img
                  src={photos[modalPhotoIndex]}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <div className="absolute bottom-5 left-4 right-14">
                  <h2 className="text-white font-extrabold text-xl lg:text-2xl drop-shadow-md line-clamp-2">{modalReview.title}</h2>
                </div>
                {photos.length > 1 && (
                  <>
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {photos.map((_, i) => (
                        <span
                          key={i}
                          className={`w-2 h-2 rounded-full transition-colors ${i === modalPhotoIndex ? 'bg-white' : 'bg-white/50'}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setModalPhotoIndex((i) => (i - 1 + photos.length) % photos.length); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setModalPhotoIndex((i) => (i + 1) % photos.length); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60"
                    >
                      <ChevronRight size={24} />
                    </button>
                    <span className="absolute bottom-2 right-3 text-white/90 text-xs font-bold">
                      {modalPhotoIndex + 1} / {photos.length}
                    </span>
                  </>
                )}
              </div>

              {/* 하단 상세 후기 - 고정 비율(2/3), 스크롤은 후기 내용만 */}
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                {/* 일정: 기간/인원/여행지 - 항상 노출, 스크롤 밖에 고정 */}
                <div className="flex-none p-4 pb-2">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="bg-gray-50 rounded-xl px-3 py-3 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">기간</p>
                      <p className="text-sm font-bold text-gray-800">{periodText}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl px-3 py-3 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">인원</p>
                      <p className="text-sm font-bold text-gray-800">{modalReview.people}명</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl px-3 py-3 border border-gray-100">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">여행지</p>
                      <p className="text-sm font-bold text-gray-800 leading-tight">{regionList.join(', ')}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); agency.user_no && onAgencyClick(agency); setModalReview(null); }}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 text-sm font-black border border-amber-100"
                  >
                    <Star size={14} className="text-amber-500" />
                    {agency.company_name || '여행사'}
                  </button>
                </div>
                {/* 후기 내용만 스크롤 */}
                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                  {modalReview.description ? (
                    <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                      {modalReview.description}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">작성된 후기 내용이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ReviewBoard;
