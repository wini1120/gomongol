import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, MessageCircle, Users, Calendar, 
  Hash, Plus, Clock, Home, Compass, MessageSquareText,
  Search, ChevronDown, Filter, ChevronRight, RotateCcw, X
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { comparePassword } from './authUtils';

const AGE_ORDER = ['20대', '30대', '40대', '50대', '60대 이상', '나이 무관'];

const CommunityBoard = ({ onBack, onStartBuilder, onPostClick, onGoToReviewBoard }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [regionNames, setRegionNames] = useState({});
  
  // --- 검색 및 필터 상태 관리 ---
  const [searchType, setSearchType] = useState('title'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('전체');
  const [selectedAge, setSelectedAge] = useState('전체');
  const [selectedRegions, setSelectedRegions] = useState([]); // 다중 선택
  const [myPostsUserId, setMyPostsUserId] = useState(null); // 내 게시글 모드일 때 travel_user.user_no
  const [showMyPostsModal, setShowMyPostsModal] = useState(false);
  const [myPostsIdInput, setMyPostsIdInput] = useState('');
  const [myPostsPwInput, setMyPostsPwInput] = useState('');
  const [myPostsModalError, setMyPostsModalError] = useState('');
  const [myPostsChecking, setMyPostsChecking] = useState(false);

  // --- 페이지네이션 상태 ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 9;

  const genderOptions = ['전체', '남성', '여성']; 
  const ageOptions = ['전체', '20대', '30대', '40대', '50대', '60대 이상'];

  useEffect(() => {
    const fetchRegions = async () => {
      const { data } = await supabase.from('master_regions').select('id, region_name');
      if (data) {
        const nameMap = data.reduce((acc, curr) => {
          acc[curr.id] = curr.region_name;
          return acc;
        }, {});
        setRegionNames(nameMap);
      }
    };
    fetchRegions();
  }, []);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGender('전체');
    setSelectedAge('전체');
    setSelectedRegions([]);
    setMyPostsUserId(null);
    setCurrentPage(1);
  };

  const toggleRegion = (id) => {
    setSelectedRegions(prev => prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]);
  };

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const hasRegionFilter = selectedRegions.length > 0;
      const schedulesSelector = hasRegionFilter
        ? `schedules!posts_schedule_id_fkey!inner ( * )`
        : `schedules!posts_schedule_id_fkey ( * )`;

      let query = supabase
        .from('posts')
        .select(`
          *,
          ${schedulesSelector}
        `, { count: 'exact' })
        .eq('is_delete', 'X');

      if (myPostsUserId != null) {
        query = query.eq('travel_user_id', myPostsUserId);
      }

      if (searchQuery) {
        query = query.ilike(searchType, `%${searchQuery}%`);
      }

      if (selectedGender !== '전체') {
        const dbGender = selectedGender === '남성' ? '남성만' : '여성만';
        query = query.or(`target_gender.eq.${dbGender},target_gender.eq.무관`);
      }

      if (hasRegionFilter && selectedRegions.length > 0) {
        const regionIds = selectedRegions.map(r => Number(r));
        query = query.overlaps('schedules.regions', regionIds);
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const useClientAgeFilter = selectedAge !== '전체';
      const fetchFrom = useClientAgeFilter ? 0 : from;
      const fetchTo = useClientAgeFilter ? 199 : to;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(fetchFrom, fetchTo);

      if (error) throw error;

      let list = data || [];
      if (useClientAgeFilter) {
        list = list.filter((p) => {
          const ages = p.target_ages;
          if (!ages || !Array.isArray(ages)) return false;
          return ages.includes(selectedAge);
        });
        const totalFiltered = list.length;
        list = list.slice(from, to);
        setPosts(list);
        setTotalCount(totalFiltered);
      } else {
        setPosts(list);
        setTotalCount(count || 0);
      }
    } catch (e) {
      console.error('로드 실패:', e);
    } finally {
      setIsLoading(false);
    }
  }, [searchType, searchQuery, selectedGender, selectedAge, selectedRegions, currentPage, myPostsUserId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGender, selectedAge, selectedRegions, myPostsUserId]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleMyPostsSubmit = async () => {
    const id = myPostsIdInput.trim();
    const pw = myPostsPwInput;
    if (!id || !pw) {
      setMyPostsModalError('아이디와 비밀번호를 입력하세요.');
      return;
    }
    setMyPostsChecking(true);
    setMyPostsModalError('');
    try {
      const { data: user, error } = await supabase.from('travel_user').select('user_no, user_pw').eq('user_id', id).maybeSingle();
      if (error) throw error;
      if (!user) {
        setMyPostsModalError('아이디 또는 비밀번호가 일치하지 않습니다.');
        return;
      }
      if (!comparePassword(pw, user.user_pw)) {
        setMyPostsModalError('아이디 또는 비밀번호가 일치하지 않습니다.');
        return;
      }
      setMyPostsUserId(user.user_no);
      setShowMyPostsModal(false);
      setMyPostsIdInput('');
      setMyPostsPwInput('');
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
      setMyPostsModalError('확인 중 오류가 발생했습니다.');
    } finally {
      setMyPostsChecking(false);
    }
  };

  const getTimeAgo = (date) => {
    const start = new Date(date);
    const end = new Date();
    const diff = (end - start) / 1000 / 60;
    if (diff < 60) return `${Math.floor(diff)}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    return `${Math.floor(diff / 1440)}일 전`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case '출발 확정': return 'bg-gmg-green text-white';
      case '항공권 발권완료': return 'bg-blue-500 text-white';
      case '투어사 확정': return 'bg-orange-400 text-white';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans max-w-[1920px] mx-auto text-gray-800">
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 sticky top-0 h-screen p-8 justify-between z-50">
        <div className="space-y-10">
          <div className="flex items-center gap-2 text-gmg-camel cursor-pointer" onClick={onBack}>
            <Compass size={32} />
            <span className="text-2xl font-black italic tracking-tighter uppercase">GoMongol</span>
          </div>
          <nav className="space-y-2">
            <div onClick={onBack} className="flex items-center gap-3 p-4 text-gray-400 hover:text-gmg-camel hover:bg-orange-50/50 rounded-2xl transition-all font-bold cursor-pointer">
              <Home size={20} /> <span>홈</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gmg-bg text-gmg-camel rounded-2xl font-black cursor-pointer shadow-sm shadow-orange-100/50">
              <Users size={20} /> <span>동행찾기 게시판</span>
            </div>
            <div onClick={onGoToReviewBoard} className="flex items-center gap-3 p-4 text-gray-400 hover:text-gmg-camel hover:bg-orange-50/50 rounded-2xl transition-all font-bold cursor-pointer">
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
              <h1 className="text-xl lg:text-3xl font-black text-gray-800">동행 찾기 🐪</h1>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <button
                type="button"
                onClick={() => { setShowMyPostsModal(true); setMyPostsModalError(''); setMyPostsIdInput(''); setMyPostsPwInput(''); }}
                className="h-12 px-5 rounded-2xl font-black text-sm border-2 border-gray-200 bg-white text-gray-700 hover:border-gmg-camel hover:text-gmg-camel hover:bg-orange-50/50 transition-all"
              >
                내 글 찾기
              </button>
              <button
                onClick={onStartBuilder}
                className="h-12 px-6 rounded-2xl font-black text-sm bg-gmg-green text-white shadow-lg shadow-green-100 hover:scale-105 transition-all flex items-center gap-2"
              >
                <Plus size={18} /> 동행 글올리기
              </button>
            </div>
          </div>

          <div className="px-6 pb-6 space-y-4">
            {/* 1. 검색바 */}
            <div className="flex gap-2 max-w-2xl">
              <div className="relative min-w-[100px]">
                <select 
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full h-11 bg-gray-100 border-none rounded-2xl px-4 text-xs font-black appearance-none outline-none focus:ring-2 focus:ring-gmg-camel/20"
                >
                  <option value="title">제목</option>
                  <option value="nickname">별명</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input 
                  type="text" 
                  placeholder="검색어를 입력하세요"
                  className="w-full h-11 bg-gray-100 border-none rounded-2xl pl-12 pr-4 text-sm font-bold outline-none focus:ring-2 focus:ring-gmg-camel/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* 2. 필터 - 1행: 필터 아이콘 + 지역(다중) + 성별 + 연령(컴팩트) + 초기화 */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 shrink-0 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                  <Filter size={11} className="text-gmg-camel" />
                  <span className="text-[9px] font-black text-gray-400 uppercase">Filters</span>
                </div>

                {/* 지역 다중 선택 */}
                <div className="flex flex-wrap gap-1 shrink-0">
                  {Object.entries(regionNames).map(([id, name]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleRegion(id)}
                      className={`h-7 px-2.5 rounded-lg text-[10px] font-black border transition-all ${selectedRegions.includes(id) ? 'bg-gmg-camel text-white border-gmg-camel' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'}`}
                    >
                      {name}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1 shrink-0 bg-white p-1 rounded-lg border border-gray-100">
                  {genderOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedGender(opt)}
                      className={`h-6 px-2.5 rounded-md text-[9px] font-black transition-all ${selectedGender === opt ? 'bg-gmg-green text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                {/* 연령 컴팩트: 한 줄 작은 칩 */}
                <div className="flex flex-wrap gap-1 shrink-0 bg-white p-1 rounded-lg border border-gray-100">
                  {ageOptions.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedAge(opt)}
                      className={`h-6 px-2 rounded-md text-[9px] font-black transition-all whitespace-nowrap ${selectedAge === opt ? 'bg-gmg-camel text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                      {opt === '전체' ? '연령전체' : opt}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="h-7 px-3 flex items-center gap-1 shrink-0 bg-white border border-dashed border-gray-200 rounded-lg text-gray-400 text-[9px] font-black hover:bg-gray-50"
                >
                  <RotateCcw size={10} /> 초기화
                </button>
              </div>

            {/* 내 게시글 모드 배너 */}
            {myPostsUserId != null && (
              <div className="flex items-center justify-between mt-2 py-2 px-3 bg-orange-50 rounded-xl border border-orange-100">
                <span className="text-xs font-black text-gmg-camel">내 게시글만 보는 중</span>
                <button type="button" onClick={() => { setMyPostsUserId(null); setCurrentPage(1); }} className="text-[10px] font-black text-gray-500 hover:text-gray-700 underline">전체 보기</button>
              </div>
            )}
          </div>
        </header>

        <div className="p-6 lg:px-10 flex-1">
          {isLoading ? (
            <div className="text-center py-20 font-black text-gray-300 animate-pulse text-xl italic tracking-widest">LOADING...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-32 space-y-4">
              <div className="bg-gray-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto text-gray-300"><Search size={32} /></div>
              <p className="font-black text-gray-400">조건에 맞는 검색 결과가 없습니다.</p>
              <button onClick={handleResetFilters} className="text-gmg-camel font-black text-xs underline underline-offset-4">필터 초기화하기</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 mb-12">
                {posts.map(post => {
                  const isAllAges = post.target_ages?.length >= 5 || post.target_ages?.includes('나이 무관');

                  return (
                    <div key={post.id} onClick={() => onPostClick(post)} className="group flex flex-col cursor-pointer bg-white rounded-[2.5rem] shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 text-left overflow-hidden">
                      <div className="p-6 lg:p-8 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tight shadow-sm ${getStatusColor(post.status)}`}>
                            {post.status}
                          </span>
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-gray-300 text-[10px] font-bold flex items-center gap-1"><Clock size={12} /> {getTimeAgo(post.created_at)}</span>
                            <span className="text-gray-400 text-[10px] font-black italic">by {post.nickname}</span>
                          </div>
                        </div>

                        <h3 className="font-black text-gray-800 text-lg lg:text-xl leading-snug mb-3 line-clamp-2 group-hover:text-gmg-camel transition-colors">{post.title}</h3>

                        <div className="flex gap-4 mb-5 text-[11px] font-black text-gray-400">
                          <div className="flex items-center gap-1.5"><Calendar size={13} className="text-gmg-camel" /><span>{post.schedules?.start_date?.replace(/-/g, '.')}</span></div>
                          <div className="flex items-center gap-1.5"><Users size={13} className="text-gmg-camel" /><span><b className="text-gray-800">{post.current_people}</b>/{post.schedules?.people || 0}명</span></div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5 mb-6">
                          <span className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg text-[9px] font-black border border-gray-200/50">{post.target_gender === '무관' ? '성별무관' : post.target_gender}</span>
                          {isAllAges ? <span className="bg-orange-50 text-gmg-camel px-2.5 py-1 rounded-lg text-[9px] font-black border border-orange-100">나이 무관</span> : [...(post.target_ages || [])].sort((a, b) => AGE_ORDER.indexOf(a) - AGE_ORDER.indexOf(b)).map(age => <span key={age} className="bg-orange-50 text-gmg-camel px-2.5 py-1 rounded-lg text-[9px] font-black border border-orange-100">{age}</span>)}
                        </div>

                        <div className="mt-auto space-y-4 pt-4 border-t border-gray-50">
                          <div className="flex flex-wrap gap-2">
                            {post.schedules?.regions?.map(regionId => (
                              <span key={regionId} className="text-[10px] font-black text-gmg-green opacity-60">
                                # {regionNames[regionId] || '로딩 중...'}
                              </span>
                            ))}
                          </div>

                          <button onClick={(e) => { e.stopPropagation(); if (post.chat_link) window.open(post.chat_link, '_blank'); }} disabled={!post.chat_link} className={`w-full py-4 rounded-2xl font-black text-xs lg:text-sm flex items-center justify-center gap-2 transition-all ${post.chat_link ? 'bg-gmg-camel text-white shadow-lg shadow-orange-100 active:scale-95' : 'bg-gray-200 text-gray-300'}`}>
                            <MessageCircle size={16} /> {post.chat_link ? '참여하기' : '채팅방 개설 전'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pb-20">
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${
                        currentPage === i + 1 
                        ? 'bg-gmg-camel text-white shadow-lg shadow-orange-100 scale-110' 
                        : 'bg-white text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* 모바일: 내 글 찾기 + 동행 글올리기 한 줄 정렬 */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 flex items-center justify-end gap-3 z-50">
        <button
          type="button"
          onClick={() => { setShowMyPostsModal(true); setMyPostsModalError(''); setMyPostsIdInput(''); setMyPostsPwInput(''); }}
          className="h-12 px-5 rounded-2xl font-black text-sm border-2 border-gray-200 bg-white text-gray-700 shadow-xl"
        >
          내 글 찾기
        </button>
        <button onClick={onStartBuilder} className="h-12 px-5 rounded-2xl font-black text-sm bg-gmg-green text-white shadow-2xl flex items-center gap-2">
          <Plus size={20} /> 동행 글올리기
        </button>
      </div>

      {/* 내 글 찾기 모달 */}
      {showMyPostsModal && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={() => !myPostsChecking && setShowMyPostsModal(false)}>
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-black text-gray-800">내 글 찾기</h3>
              <button type="button" onClick={() => !myPostsChecking && setShowMyPostsModal(false)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"><X size={20} /></button>
            </div>
            <p className="text-xs text-gray-500 font-bold mb-4">게시글 작성 시 사용한 아이디와 비밀번호를 입력하세요.</p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">아이디</label>
                <input type="text" placeholder="아이디" value={myPostsIdInput} onChange={e => setMyPostsIdInput(e.target.value)} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-gmg-camel" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">비밀번호</label>
                <input type="password" placeholder="비밀번호" value={myPostsPwInput} onChange={e => setMyPostsPwInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleMyPostsSubmit()} className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm font-bold outline-none focus:ring-2 focus:ring-gmg-camel" />
              </div>
            </div>
            {myPostsModalError && <p className="text-xs font-black text-red-500 mb-3">{myPostsModalError}</p>}
            <button type="button" onClick={handleMyPostsSubmit} disabled={myPostsChecking} className="w-full h-12 bg-gmg-camel text-white rounded-xl font-black text-sm disabled:opacity-50">
              {myPostsChecking ? '확인 중...' : '내 글 보기'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CommunityBoard;