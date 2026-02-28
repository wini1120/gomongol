import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReviewDetail from '../ReviewDetail';
import { supabase } from '../supabaseClient';

const REVIEW_SELECT = [
  '*',
  'agency_user:agency_user_id ( user_no, company_name, company_kakao_link, company_logo_url )',
  'review_photo ( image_url, sort_order )'
].join(', ');

export default function ReviewDetailPage() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!reviewId) {
      setLoading(false);
      setError('후기 ID가 없습니다.');
      return;
    }
    const fetchReview = async () => {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('travel_review')
        .select(REVIEW_SELECT)
        .eq('id', Number(reviewId))
        .eq('is_delete', 'X')
        .maybeSingle();
      if (err) {
        setError(err.message);
        setReview(null);
      } else if (data) {
        setReview(data);
      } else {
        setError('후기를 찾을 수 없습니다.');
        setReview(null);
      }
      setLoading(false);
    };
    fetchReview();
  }, [reviewId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="font-black text-gray-400">로딩 중...</span>
      </div>
    );
  }
  if (error || !review) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-600 font-bold">{error || '후기를 찾을 수 없습니다.'}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-6 py-3 rounded-xl bg-gmg-camel text-white font-black"
        >
          뒤로
        </button>
      </div>
    );
  }

  return (
    <ReviewDetail
      review={review}
      onBack={() => navigate(-1)}
      onAgencyClick={(agency) => agency?.user_no && navigate('/agency/' + agency.user_no)}
    />
  );
}
