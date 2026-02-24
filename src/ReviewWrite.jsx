import React, { useState, useEffect } from 'react';
import { ChevronLeft, Upload, X, Compass, Home } from 'lucide-react';
import { supabase } from './supabaseClient';

const REGIONS = [
  { value: '고비', label: '고비' },
  { value: '홉스골', label: '홉스골' },
  { value: '중부', label: '중부' },
];

const MAX_PHOTOS = 5;

const ReviewWrite = ({ onBack, onSuccess }) => {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    agency_user_id: '',
    title: '',
    nights: 1,
    people: 1,
    regions: ['고비'],
    description: '',
  });
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const { data, error: e } = await supabase
        .from('agency_user')
        .select('user_no, company_name')
        .in('status', ['ACTIVE', 'DONE'])
        .order('company_name');
      if (e) {
        console.error(e);
        setAgencies([]);
      } else {
        setAgencies(data || []);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleFileChange = (e) => {
    const chosen = Array.from(e.target.files || []);
    const combined = [...files, ...chosen].slice(0, MAX_PHOTOS);
    setFiles(combined);
    const newPreviews = combined.map((f) => URL.createObjectURL(f));
    filePreviews.forEach((url) => URL.revokeObjectURL(url));
    setFilePreviews(newPreviews);
  };

  const removeFile = (index) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    const nextPreviews = next.map((f) => URL.createObjectURL(f));
    filePreviews.forEach((url) => URL.revokeObjectURL(url));
    setFilePreviews(nextPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.agency_user_id) {
      setError('여행사를 선택해 주세요.');
      return;
    }
    if (!form.title.trim()) {
      setError('제목을 입력해 주세요.');
      return;
    }
    if (files.length === 0) {
      setError('사진을 1장 이상 첨부해 주세요.');
      return;
    }
    if (!form.regions?.length) {
      setError('여행 지역을 최소 1개 선택해 주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const { data: reviewRow, error: insertErr } = await supabase
        .from('travel_review')
        .insert({
          agency_user_id: Number(form.agency_user_id),
          title: form.title.trim(),
          nights: Number(form.nights) || 1,
          people: Number(form.people) || 1,
          region: Array.isArray(form.regions) && form.regions.length ? form.regions.join(',') : '고비',
          description: (form.description || '').trim() || null,
          thumbnail_url: null,
        })
        .select('id')
        .single();
      if (insertErr) throw insertErr;
      const reviewId = reviewRow.id;

      const prefix = `review-${reviewId}-${Date.now()}`;
      let thumbnailUrl = null;
      const photoRows = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
        const path = `${prefix}-${i}.${ext || 'jpg'}`;
        const { error: uploadErr } = await supabase.storage.from('review-photos').upload(path, file, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = supabase.storage.from('review-photos').getPublicUrl(path);
        const url = urlData?.publicUrl || '';
        if (i === 0) thumbnailUrl = url;
        photoRows.push({ travel_review_id: reviewId, image_url: url, sort_order: i + 1 });
      }

      await supabase.from('travel_review').update({ thumbnail_url: thumbnailUrl }).eq('id', reviewId);
      if (photoRows.length) {
        await supabase.from('review_photo').insert(photoRows);
      }

      onSuccess();
    } catch (err) {
      console.error(err);
      setError(err?.message || '저장에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="font-black text-gray-400 italic">로딩 중...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center gap-3 px-6 py-5">
          <button type="button" onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <img src="/gomongol_logo.png" alt="Go몽골" className="h-6 w-auto object-contain hidden sm:block" />
          <h1 className="text-xl font-black text-gray-800">여행 후기 작성</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-500 uppercase mb-2">여행사 선택 *</label>
            <select
              value={form.agency_user_id}
              onChange={(e) => setForm((f) => ({ ...f, agency_user_id: e.target.value }))}
              className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-gmg-camel"
              required
            >
              <option value="">선택하세요</option>
              {agencies.map((a) => (
                <option key={a.user_no} value={a.user_no}>{a.company_name}</option>
              ))}
            </select>
            {agencies.length === 0 && (
              <p className="text-xs text-amber-600 font-bold mt-1">인증된 여행사가 없습니다. 메인에서 입점 문의를 이용해 주세요.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase mb-2">제목 *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="예: 남고비 사막 완주"
              className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-gmg-camel"
              maxLength={200}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase mb-2">사진 (최대 5장, 첫 사진이 썸네일) *</label>
            <div className="flex flex-wrap gap-3">
              {filePreviews.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeFile(i)} className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70">
                    <X size={14} />
                  </button>
                  {i === 0 && <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-gmg-camel text-white text-[9px] font-black rounded">대표</span>}
                </div>
              ))}
              {files.length < MAX_PHOTOS && (
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-gmg-camel hover:bg-orange-50/30 transition-colors">
                  <Upload size={24} className="text-gray-400" />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2">몇 박 며칠</label>
              <select
                value={form.nights}
                onChange={(e) => setForm((f) => ({ ...f, nights: Number(e.target.value) }))}
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-gmg-camel"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n}박 {n + 1}일</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase mb-2">인원 수</label>
              <select
                value={form.people}
                onChange={(e) => setForm((f) => ({ ...f, people: Number(e.target.value) }))}
                className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-gmg-camel"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n}명</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase mb-2">여행 지역 (복수 선택 가능)</label>
            <div className="flex flex-wrap gap-2">
              {REGIONS.map((r) => {
                const selected = form.regions.includes(r.value);
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => {
                      setForm((f) => ({
                        ...f,
                        regions: selected ? f.regions.filter((x) => x !== r.value) : [...f.regions, r.value],
                      }));
                    }}
                    className={`h-12 px-5 rounded-2xl border text-sm font-black transition-all ${selected ? 'bg-gmg-camel text-white border-gmg-camel' : 'bg-white border-gray-200 text-gray-600 hover:border-gmg-camel'}`}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
            {form.regions.length === 0 && <p className="text-xs text-amber-600 font-bold mt-1">최소 1개 지역을 선택해 주세요.</p>}
          </div>

          <div>
            <label className="block text-xs font-black text-gray-500 uppercase mb-2">후기 내용 (선택)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="여행 코스나 느낌을 자유롭게 적어 주세요."
              rows={4}
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-gmg-camel resize-none"
            />
          </div>

          {error && <p className="text-sm font-black text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 rounded-2xl bg-gmg-camel text-white font-black text-base shadow-lg shadow-orange-100 disabled:opacity-50"
          >
            {submitting ? '등록 중...' : '후기 등록하기'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ReviewWrite;
