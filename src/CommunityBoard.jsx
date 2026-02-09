import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, MessageCircle, Users, Calendar, 
  Hash, Plus, Clock, Home, Compass, MessageSquareText,
  Search, ChevronDown, Filter, ChevronRight, RotateCcw
} from 'lucide-react';
import { supabase } from './supabaseClient';

const CommunityBoard = ({ onBack, onStartBuilder, onPostClick }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [regionNames, setRegionNames] = useState({});
  
  // --- 검색 및 필터 상태 관리 ---
  const [searchType, setSearchType] = useState('title'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('전체');
  const [selectedAge, setSelectedAge] = useState('전체');
  const [selectedRegion, setSelectedRegion] = useState('전체');

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
    setSelectedRegion('전체');
    setCurrentPage(1);
  };

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const schedulesSelector = selectedRegion !== '전체' 
        ? `schedules!posts_schedule_id_fkey!inner ( * )` 
        : `schedules!posts_schedule_id_fkey ( * )`;

      let query = supabase
        .from('posts')
        .select(`
          *,
          ${schedulesSelector}
        `, { count: 'exact' })
        .eq('is_delete', 'X');

      if (searchQuery) {
        query = query.ilike(searchType, `%${searchQuery}%`);
      }

      if (selectedGender !== '전체') {
        const dbGender = selectedGender === '남성' ? '남성만' : '여성만';
        query = query.or(`target_gender.eq.${dbGender},target_gender.eq.무관`);
      }

      if (selectedAge !== '전체') {
        query = query.or(`target_ages.cs.{"${selectedAge}"},target_ages.cs.{"나이 무관"}`);
      }

      if (selectedRegion !== '전체') {
        query = query.filter('schedules.regions', 'cs', `{${selectedRegion}}`);
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      setPosts(data || []);
      setTotalCount(count || 0);
    } catch (e) {
      console.error('로드 실패:', e);
    } finally {
      setIsLoading(false);
    }
  }, [searchType, searchQuery, selectedGender, selectedAge, selectedRegion, currentPage]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGender, selectedAge, selectedRegion]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

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
            <div className="flex items-center gap-3 p-4 text-gray-400 hover:text-gmg-camel hover:bg-orange-50/50 rounded-2xl transition-all font-bold cursor-pointer">
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
            <button onClick={onStartBuilder} className="hidden lg:flex items-center gap-2 bg-gmg-green text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-green-100 hover:scale-105 transition-all">
              <Plus size={18} /> 동행 글올리기
            </button>
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

            {/* 2. 필터 레이아웃 - 1행: 퀵 필터 아이콘 + 지역 + 성별 */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-1.5 shrink-0 bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                  <Filter size={12} className="text-gmg-camel" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Filters</span>
                </div>
                
                <select 
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className={`h-9 shrink-0 px-3 py-1 rounded-xl text-[11px] font-black border transition-all outline-none ${selectedRegion !== '전체' ? 'bg-gmg-camel text-white border-gmg-camel shadow-sm' : 'bg-white text-gray-500 border-gray-100'}`}
                >
                  <option value="전체">모든 지역</option>
                  {Object.entries(regionNames).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>

                <div className="flex gap-1 shrink-0 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                  {genderOptions.map(opt => (
                    <button 
                      key={opt}
                      onClick={() => setSelectedGender(opt)}
                      className={`h-7 px-4 rounded-lg text-[10px] font-black transition-all ${selectedGender === opt ? 'bg-gmg-green text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
            </div>

            {/* 3. 필터 레이아웃 - 2행: 연령대 + 초기화 */}
            <div className="flex items-center gap-2">
                {/* PC 버전: 버튼 그룹 */}
                <div className="hidden lg:flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
                    {ageOptions.map(opt => (
                        <button 
                        key={opt}
                        onClick={() => setSelectedAge(opt)}
                        className={`h-7 px-4 rounded-lg text-[10px] font-black transition-all ${selectedAge === opt ? 'bg-gmg-camel text-white shadow-sm' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                        {opt}
                        </button>
                    ))}
                </div>

                {/* 모바일 버전: 드롭다운 */}
                <div className="lg:hidden relative flex-1">
                    <select 
                    value={selectedAge}
                    onChange={(e) => setSelectedAge(e.target.value)}
                    className={`w-full h-11 px-4 rounded-2xl text-[12px] font-black border transition-all appearance-none outline-none ${selectedAge !== '전체' ? 'bg-orange-50 border-gmg-camel text-gmg-camel' : 'bg-white border-gray-100 text-gray-500'}`}
                    >
                    <option value="전체">연령대 선택</option>
                    {ageOptions.slice(1).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <button 
                    onClick={handleResetFilters}
                    className="h-11 lg:h-9 px-4 flex items-center gap-1.5 shrink-0 bg-white border border-dashed border-gray-200 rounded-2xl lg:rounded-xl text-gray-400 text-[10px] font-black active:scale-95 transition-all hover:bg-gray-50"
                >
                    <RotateCcw size={12} /> <span>초기화</span>
                </button>
            </div>
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
                          {isAllAges ? <span className="bg-orange-50 text-gmg-camel px-2.5 py-1 rounded-lg text-[9px] font-black border border-orange-100">나이 무관</span> : post.target_ages?.map(age => <span key={age} className="bg-orange-50 text-gmg-camel px-2.5 py-1 rounded-lg text-[9px] font-black border border-orange-100">{age}</span>)}
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

      <button onClick={onStartBuilder} className="fixed bottom-8 right-8 lg:hidden w-14 h-14 bg-gmg-green text-white rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-all z-50 hover:scale-110"><Plus size={28} /></button>
    </div>
  );
};

export default CommunityBoard;