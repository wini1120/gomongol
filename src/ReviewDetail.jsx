import React, { useState } from 'react';
import { ChevronLeft, Star, Calendar, Users, MapPin, Flag } from 'lucide-react';
import { supabase } from './supabaseClient';

const REGION_LABELS = { 고비: '#고비', 홉스골: '#홉스골', 중부: '#중부' };
const parseRegions = (regionStr) => (regionStr || '').split(',').map((r) => r.trim()).filter(Boolean);
const getAgencyName = (r) => r.agency_user?.company_name || r.agency_name_other || '여행사';
const hasAgencyLink = (r) => !!r.agency_user?.user_no;

const ReviewDetail = ({ review, onBack, onAgencyClick }) => {
  const agency = review.agency_user || {};
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const photos = (review.review_photo || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  const periodText = `${review.nights}박 ${review.nights + 1}일`;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center gap-3 px-6 py-5">
          <button type="button" onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-black text-gray-800 truncate flex-1">여행 후기</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto pb-24">
        <div className="bg-white rounded-b-[2rem] overflow-hidden shadow-sm">
          {photos.length > 0 ? (
            <div className="aspect-[4/3] bg-gray-100">
              <img src={photos[0].image_url} alt="" className="w-full h-full object-cover" />
            </div>
          ) : review.thumbnail_url ? (
            <div className="aspect-[4/3] bg-gray-100">
              <img src={review.thumbnail_url} alt="" className="w-full h-full object-cover" />
            </div>
          ) : null}

          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-gray-600">{review.writer_nickname || '익명'}</span>
              {review.reviewed_after_use && (
                <span className="px-2 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-black">이용 후 작성</span>
              )}
            </div>
            <h2 className="text-xl font-black text-gray-800">{review.title}</h2>
            <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500">
              <span className="flex items-center gap-1.5"><Calendar size={16} className="text-gmg-camel" /> {periodText}</span>
              <span className="flex items-center gap-1.5"><Users size={16} className="text-gmg-camel" /> {review.people}명</span>
              <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gmg-camel" /> {parseRegions(review.region).join(', ') || review.region}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => hasAgencyLink(review) && onAgencyClick(agency)}
                disabled={!hasAgencyLink(review)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-800 text-sm font-black border border-amber-100 disabled:opacity-70"
              >
                <Star size={16} className="text-amber-500" />
                {getAgencyName(review)}{!hasAgencyLink(review) && review.agency_name_other ? ' (미등록)' : ''}
              </button>
              <button
                type="button"
                onClick={() => setShowReport(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100 hover:bg-red-100"
              >
                <Flag size={16} /> 신고하기
              </button>
            </div>
            {review.description && <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{review.description}</p>}
            <div className="flex flex-wrap gap-2">
              {parseRegions(review.region).map((r) => (
                <span key={r} className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-500 text-xs font-black">{REGION_LABELS[r] || r}</span>
              ))}
            </div>
          </div>
        </div>

        {photos.length > 1 && (
          <div className="mt-4 p-6 pt-0">
            <p className="text-xs font-black text-gray-400 uppercase mb-3">추가 사진</p>
            <div className="grid grid-cols-3 gap-2">
              {photos.slice(1).map((p, i) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                  <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

      {/* 신고 모달 */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-black text-gray-800 mb-2">후기 신고</h3>
            <p className="text-xs text-gray-500 mb-4">허위·비방·부적절한 후기라면 사유를 적어 주세요.</p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="신고 사유 (선택)"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-gmg-camel resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => { setShowReport(false); setReportReason(''); }} className="flex-1 py-3 rounded-xl border border-gray-200 font-bold text-gray-600">취소</button>
              <button
                type="button"
                onClick={async () => {
                  setReportSubmitting(true);
                  try {
                    const { error } = await supabase.from('review_report').insert([{ travel_review_id: review.id, reason: (reportReason || '').trim() || '신고 접수' }]);
                    if (error) throw error;
                    alert('신고가 접수되었습니다.');
                    setShowReport(false);
                    setReportReason('');
                  } catch (err) {
                    console.error(err);
                    alert('신고 접수에 실패했습니다.');
                  } finally {
                    setReportSubmitting(false);
                  }
                }}
                disabled={reportSubmitting}
                className="flex-1 py-3 rounded-xl bg-red-100 text-red-800 font-black disabled:opacity-50"
              >
                {reportSubmitting ? '접수 중...' : '신고 접수'}
              </button>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
};

export default ReviewDetail;
