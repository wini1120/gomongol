import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AgencyDetail from '../AgencyDetail';
import { supabase } from '../supabaseClient';

export default function AgencyDetailPage() {
  const { agencyId } = useParams();
  const navigate = useNavigate();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!agencyId) {
      setLoading(false);
      setError('여행사 ID가 없습니다.');
      return;
    }
    const fetchAgency = async () => {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('agency_user')
        .select('user_no, company_name, company_kakao_link, company_logo_url, company_intro')
        .eq('user_no', Number(agencyId))
        .maybeSingle();
      if (err) {
        setError(err.message);
        setAgency(null);
      } else if (data) {
        setAgency(data);
      } else {
        setError('여행사를 찾을 수 없습니다.');
        setAgency(null);
      }
      setLoading(false);
    };
    fetchAgency();
  }, [agencyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="font-black text-gray-400">로딩 중...</span>
      </div>
    );
  }
  if (error || !agency) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-600 font-bold">{error || '여행사를 찾을 수 없습니다.'}</p>
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
    <AgencyDetail
      agency={agency}
      onBack={() => navigate(-1)}
      onReviewClick={(review) => navigate(`/review/${review.id}`)}
    />
  );
}
