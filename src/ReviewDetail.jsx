import React from 'react';
import { ChevronLeft, Star, Calendar, Users, MapPin } from 'lucide-react';

const REGION_LABELS = { 고비: '#고비', 홉스골: '#홉스골', 중부: '#중부' };
const parseRegions = (regionStr) => (regionStr || '').split(',').map((r) => r.trim()).filter(Boolean);

const ReviewDetail = ({ review, onBack, onAgencyClick }) => {
  const agency = review.agency_user || {};
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
            <h2 className="text-xl font-black text-gray-800">{review.title}</h2>
            <div className="flex flex-wrap gap-4 text-sm font-bold text-gray-500">
              <span className="flex items-center gap-1.5"><Calendar size={16} className="text-gmg-camel" /> {periodText}</span>
              <span className="flex items-center gap-1.5"><Users size={16} className="text-gmg-camel" /> {review.people}명</span>
              <span className="flex items-center gap-1.5"><MapPin size={16} className="text-gmg-camel" /> {parseRegions(review.region).join(', ') || review.region}</span>
            </div>
            <button
              type="button"
              onClick={() => agency.user_no && onAgencyClick(agency)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-800 text-sm font-black border border-amber-100"
            >
              <Star size={16} className="text-amber-500" />
              {agency.company_name || '여행사'}
            </button>
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
      </main>
    </div>
  );
};

export default ReviewDetail;
