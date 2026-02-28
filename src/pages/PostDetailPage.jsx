import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostDetail from '../PostDetail';
import { supabase } from '../supabaseClient';

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) {
      setLoading(false);
      setError('게시글 ID가 없습니다.');
      return;
    }
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('posts')
        .select(`
          *,
          schedules!posts_schedule_id_fkey ( * )
        `)
        .eq('id', Number(postId))
        .eq('is_delete', 'X')
        .maybeSingle();
      if (err) {
        setError(err.message);
        setPost(null);
      } else if (data) {
        setPost(data);
      } else {
        setError('게시글을 찾을 수 없습니다.');
        setPost(null);
      }
      setLoading(false);
    };
    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <span className="font-black text-gray-400">로딩 중...</span>
      </div>
    );
  }
  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-600 font-bold">{error || '게시글을 찾을 수 없습니다.'}</p>
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
    <PostDetail
      post={post}
      onBack={() => navigate(-1)}
      onUpdateSuccess={() => navigate('/community')}
    />
  );
}
