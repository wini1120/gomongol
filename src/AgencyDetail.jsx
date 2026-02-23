import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Building2, Star, CheckCircle, X } from 'lucide-react';
import { supabase } from './supabaseClient';

const parseRegions = (regionStr) => (regionStr || '').split(',').map((r) => r.trim()).filter(Boolean);
const getPhotoList = (review) => {
  const photos = review.review_photo || [];
  const sorted = [...photos].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const urls = sorted.map((p) => p.image_url).filter(Boolean);
  if (urls.length) return urls;
  if (review.thumbnail_url) return [review.thumbnail_url];
  return ['https://placehold.co/800x500/e2e8f0/94a3b8?text=No+Image'];
};

const AgencyDetail = ({ agency, onBack, onReviewClick }) => {
  const [intro, setIntro] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalReview, setModalReview] = useState(null);
  const [modalPhotoIndex, setModalPhotoIndex] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!agency?.user_no) {
        setLoading(false);
        return;
      }
      const { data: agencyRow } = await supabase
        .from('agency_user')
        .select('company_intro')
        .eq('user_no', agency.user_no)
        .single();
      setIntro(agencyRow?.company_intro || '');

      const { data: list } = await supabase
        .from('travel_review')
        .select(`
          *,
          review_photo ( image_url, sort_order )
        `)
        .eq('agency_user_id', agency.user_no)
        .eq('is_delete', 'X')
        .order('created_at', { ascending: false });
      setReviews(list || []);
      setLoading(false);
    };
    load();
  }, [agency?.user_no]);

  const hasKakao = agency?.company_kakao_link;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3 min-w-0">
            <button type="button" onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-black text-gray-800 truncate">여행사 상세</h1>
          </div>
          <a
            href={hasKakao || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className={`shrink-0 flex items-center gap-2 h-11 px-5 rounded-2xl font-black text-sm transition-all ${hasKakao ? 'bg-gmg-camel text-white shadow-lg shadow-orange-100 hover:scale-105' : 'bg-gray-200 text-gray-400 pointer-events-none'}`}
          >
            <MessageCircle size={18} /> 견적 상담하러 가기
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-6 pb-24">
        <section className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0">
              <Building2 size={24} className="text-gmg-camel" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-gray-800">{agency?.company_name}</h2>
                <CheckCircle size={18} className="text-blue-500 fill-blue-500 text-white" />
              </div>
              <p className="text-xs font-bold text-gray-500">Go몽골 인증 여행사</p>
            </div>
          </div>
          <h3 className="text-sm font-black text-gray-500 uppercase mb-3">여행사 소개</h3>
          {loading ? (
            <p className="text-gray-400 text-sm">로딩 중...</p>
          ) : intro ? (
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{intro}</p>
          ) : (
            <p className="text-gray-400 text-sm">등록된 소개글이 없습니다.</p>
          )}
        </section>

        <section className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100">
          <h3 className="text-sm font-black text-gray-500 uppercase mb-4">여행사 후기</h3>
          {loading ? (
            <p className="text-gray-400 text-sm">로딩 중...</p>
          ) : reviews.length === 0 ? (
            <p className="text-gray-400 text-sm">아직 등록된 후기가 없습니다.</p>
          ) : (
            <ul className="space-y-4">
              {reviews.map((review) => {
                const thumb = review.thumbnail_url || review.review_photo?.[0]?.image_url;
                return (
                  <li key={review.id}>
                    <button
                      type="button"
                      onClick={() => { setModalReview({ ...review, agency_user: agency }); setModalPhotoIndex(0); }}
                      className="w-full text-left flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-gmg-camel/30 hover:bg-orange-50/30 transition-all"
                    >
                      {thumb && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          <img src={thumb} alt="" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-gray-800 truncate">{review.title}</p>
                        <p className="text-xs font-bold text-gray-500 mt-0.5">{review.nights}박 {review.nights + 1}일 · {(review.region || '').split(',').map((r) => r.trim()).filter(Boolean).join(', ') || review.region}</p>
                      </div>
                      <Star size={16} className="text-amber-400 fill-amber-400 shrink-0 mt-1" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>

      {/* 후기 상세 모달 - ReviewBoard와 동일 레이아웃 */}
      {modalReview && (() => {
        const photos = getPhotoList(modalReview);
        const reviewAgency = modalReview.agency_user || agency;
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

              <div className="relative bg-gray-900 flex-none w-full h-[39vh] overflow-hidden">
                <img src={photos[modalPhotoIndex]} alt="" className="absolute inset-0 w-full h-full object-contain" />
                <div className="absolute bottom-5 left-4 right-14">
                  <h2 className="text-white font-extrabold text-xl lg:text-2xl drop-shadow-md line-clamp-2">{modalReview.title}</h2>
                </div>
                {photos.length > 1 && (
                  <>
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {photos.map((_, i) => (
                        <span key={i} className={`w-2 h-2 rounded-full ${i === modalPhotoIndex ? 'bg-white' : 'bg-white/50'}`} />
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
                    <span className="absolute bottom-2 right-3 text-white/90 text-xs font-bold">{modalPhotoIndex + 1} / {photos.length}</span>
                  </>
                )}
              </div>

              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
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
                    onClick={(e) => { e.stopPropagation(); setModalReview(null); }}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 text-amber-800 text-sm font-black border border-amber-100"
                  >
                    <Star size={14} className="text-amber-500" />
                    {reviewAgency?.company_name || agency?.company_name || '여행사'}
                  </button>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
                  {modalReview.description ? (
                    <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{modalReview.description}</div>
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

export default AgencyDetail;
