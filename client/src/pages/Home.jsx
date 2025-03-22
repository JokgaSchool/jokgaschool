import React, { useState, useEffect, useRef, useCallback, useContext } from "react";
import styles from "../styles/Home.module.css";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import avator from "../assets/img/user-avatar.svg";
import { AuthContext } from "../AuthContext.jsx";
import { Helmet } from 'react-helmet';

import ReactMarkdown from "react-markdown";
import ReactMarkdownEditorLite from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import MarkdownIt from 'markdown-it';
const mdParser = new MarkdownIt();

const MainContent = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "all";
  const initialQuery = searchParams.get("query") || "";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [posts, setPosts] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const [tagInput, setTagInput] = useState("");
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    tags: [],
    rank: user?.rank?.toString() || "1",
  });
  const rankMapping = {
    1: "따까리",
    2: "잡담",
    3: "개발",
    4: "포트폴리오",
    5: "공지"
  };
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessage2, setErrorMessage2] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [allPostsLoaded, setAllPostsLoaded] = useState(false);
  const [page, setPage] = useState(1); // 페이지 번호
  const observer = useRef(null);
  const observing = useRef(false);
  const [skipAnimation, setSkipAnimation] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [displaySearchQuery, setDisplaySearchQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const searchInputRef = useRef(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const indicatorRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const activeButton = document.querySelector(`.${styles.tab}.${styles.active}`);
    if (activeButton && indicatorRef.current) {
      if (skipAnimation) {
        indicatorRef.current.style.transition = 'none';
      }
      
      const translateX = activeButton.offsetLeft;
      indicatorRef.current.style.transform = `translateX(${translateX}px)`;
      indicatorRef.current.style.width = `${activeButton.offsetWidth}px`;
      
      if (skipAnimation) {
        indicatorRef.current.offsetHeight;
        indicatorRef.current.style.transition = 'transform 0.3s cubic-bezier(0.645, 0.045, 0.355, 1)';
        setSkipAnimation(false);
      }
    }
  }, [activeTab, skipAnimation]);

  useEffect(() => {
    // observing.current 상태 리셋
    observing.current = false;
  }, [activeTab]);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    const fetchPosts = async () => {
      if (observing.current || searchPerformed) return;
      observing.current = true;
      setIsLoading(true);
  
      const rankFilter = rankMapping[activeTab] || "";
  
      try {
        const response = await fetch(`/api/posts?page=${page}&limit=10&rank=${rankFilter}`);
        const data = await response.json();
  
        if (response.status === 500) {
          setPosts([]);
          setErrorMessage(data.message || "오류가 발생했습니다. 새로고침하여 다시 시도해주세요.");
        } else {
          if (data.length === 0) {
            setAllPostsLoaded(true);
          } else {
            setPosts((prevPosts) => {
              const updatedPosts = [...prevPosts, ...data];
  
              const seenIds = new Set();
              const uniquePosts = updatedPosts.filter((post) => {
                if (seenIds.has(post._id)) return false;
                seenIds.add(post._id);
                return true;
              });
  
              return uniquePosts;
            });
          }
          setErrorMessage("");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        setErrorMessage("서버로부터 데이터를 가져오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
        observing.current = false;
      }
    };
  
    if (!searchPerformed) {
      fetchPosts();
    }
  }, [page, activeTab, searchPerformed, refreshTrigger]);
  
  const handleIntersection = useCallback((entries) => {
    if (entries[0].isIntersecting && !isLoading && !allPostsLoaded && !searchPerformed) {
      setPage(prev => prev + 1);
    }
  }, [isLoading, allPostsLoaded, searchPerformed]);
  
  const targetRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
  
      if (!node || posts.length === 0 || allPostsLoaded || searchPerformed) return;
  
      observer.current = new IntersectionObserver(handleIntersection, {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      });
  
      observer.current.observe(node);
    },
    [handleIntersection, posts.length, allPostsLoaded, searchPerformed],
  );

  const sortPosts = (posts) => {
    return posts.sort((a, b) => {
      const rankA = parseInt(a.rank, 10);
      const rankB = parseInt(b.rank, 10);
  
      if (rankA !== rankB) {
        return rankB - rankA;
      }
  
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const handleTabChange = (tab) => {
    if (tab === activeTab) {
      return;
    }
    
    setSkipAnimation(false);
    setActiveTab(tab);
    setSearchParams({ tab });
    setPage(1);
    setPosts([]);
    setAllPostsLoaded(false);
    
    if (searchPerformed) {
      setSearchQuery("");
      setSearchResults([]);
      setSearchPerformed(false);
    }
    
    if (observer.current) observer.current.disconnect(); 
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (!value.trim()) {
      setSearchPerformed(false);
      setSearchResults([]);
      setErrorMessage("");
      if (searchParams.get("query")) {
        setSearchParams({ tab: activeTab });
      }
    }
  };

  // 검색 실행 함수 수정
  const performSearch = async (query) => {
    if (!query.trim()) {
      clearSearch();
      setIsSearching(false); // 빈 검색어일 때 isSearching 상태 초기화
      return;
    }
    
    setIsSearching(true); // 검색 시작 시 상태 설정
    setIsLoading(true);
    setSearchPerformed(true);
    setDisplaySearchQuery(query);
    
    try {
      const response = await fetch(`/api/posts/search?query=${encodeURIComponent(query)}`);
      
      if (response.status === 500) {
        throw new Error('검색 중 오류가 발생했습니다');
      }
      
      const data = await response.json();
      
      // 검색 결과 업데이트
      setSearchResults(data);
      setErrorMessage(data.length === 0 ? "검색 결과가 없습니다" : "");
      
      // URL 파라미터 업데이트
      setSearchParams({ tab: activeTab, query: query });
    } catch (error) {
      setErrorMessage(error.message);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
      setIsSearching(false); // 검색 완료 시 상태 초���화
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      clearSearch();
      return;
    }
    performSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setDisplaySearchQuery("");
    setSearchResults([]);
    setSearchPerformed(false);
    setErrorMessage("");
    setSearchParams({ tab: activeTab });
    setPage(1);
    setPosts([]);
    setAllPostsLoaded(false);
    setIsSearching(false);
    setRefreshTrigger(prev => prev + 1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handlePopupToggle = () => {
    setShowPopup(!showPopup);
    setPreviewMode(false);
    setErrorMessage2("");
    
    if (!showPopup) {
      setNewPost({
        title: "",
        description: "",
        tags: [],
        rank: user?.rank?.toString() || "1",
      });
      setTagInput(""); // 태그 입력 초기화
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost((prevPost) => ({
      ...prevPost,
      [name]: value,
    }));
  };

  // handleTagsChange 함수 수정
  const handleTagsChange = (e) => {
    const inputValue = e.target.value;
    setTagInput(inputValue);
    
    // 띄어쓰기로 구분된 태그 배열 생성
    const tags = inputValue.split(/\s+/).filter(tag => tag !== "");
    
    setNewPost((prevPost) => ({
      ...prevPost,
      tags: tags,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPost.title.trim().length < 2) {
      setErrorMessage2("제목은 최소 2자 이상이어야 합니다.");
      return;
    }
    
    if (newPost.description.trim().length < 10) {
      setErrorMessage2("내용은 최소 10자 이상이어야 합니다.");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage2("");
    
    try {
      const response = await fetch("/api/rposts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newPost, rank: parseInt(newPost.rank, 10) }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setPosts((prevPosts) => [data, ...prevPosts]);
        setShowPopup(false);
        setErrorMessage("");
        setErrorMessage2("");
      } else if (response.status === 403) {
        navigate("/auth/login");
        alert("로그인 후 이용하세요.");
      } else {
        setErrorMessage2(data.message || "알 수 없는 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage2("서버 응답을 처리하는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditorChange = ({ text }) => {
    setNewPost((prevPost) => ({
      ...prevPost,
      description: text,
    }));
  };

  const togglePreviewMode = () => {
    setPreviewMode(!previewMode);
  };

  const generateSlug = (title) => {
    return title
      .replace(/[^\w가-힣\s-]+/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase()
  }; 

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffDay > 0) {
      return `${diffDay}일 전`;
    } else if (diffHour > 0) {
      return `${diffHour}시간 전`;
    } else if (diffMin > 0) {
      return `${diffMin}분 전`;
    } else {
      return '방금 전';
    }
  };

  const filteredPosts = searchPerformed 
    ? searchResults 
    : (activeTab === "all"
      ? sortPosts(posts)
      : sortPosts(
          posts.filter((post) => {
            const rank = parseInt(post.rank, 10);
            if (activeTab === "portfolio") return rank === 4;
            if (activeTab === "dev") return rank === 3;
            if (activeTab === "others") return rank !== 4 && rank !== 3;

            return false;
          })
    ));

  return (
    <section className="content">
      <Helmet>
        <title>{'Louis1618 | Blog'}</title>
      </Helmet>
      <div className={styles["posts-layout-list"]}>
        <div className={styles["community-header"]}>
          {isAuthenticated && user.rank >= 1 && (
            <div className={styles["create-post-button"]} onClick={handlePopupToggle}>
              <img src={avator} alt="사용자 아바타" />
              <span>포스트 작성하기</span>
            </div>
          )}
          
          <form onSubmit={handleSearchSubmit} className={styles["search-form"]}>
            <div className={styles["search-input-container"]}>
              <input
                type="text"
                placeholder="포스트 검색..."
                value={searchQuery}
                onChange={handleSearchInputChange}
                className={styles["search-input"]}
                ref={searchInputRef}
              />
              {searchQuery && (
                <button 
                  type="button" 
                  className={styles["clear-search"]}
                  onClick={clearSearch}
                  aria-label="검색 초기화"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              )}
              <button 
                type="submit" 
                className={styles["search-button"]}
                disabled={isSearching}
                aria-label="검색"
              >
                {isSearching ? (
                  <i className="fa-solid fa-spinner fa-spin"></i>
                ) : (
                  <i className="fa-solid fa-search"></i>
                )}
              </button>
            </div>
          </form>
        </div>

        {errorMessage && <div className={styles["error-message"]}>{errorMessage}</div>}

        {!errorMessage && (
          <>
            <div className={styles["community-tabs"]}>
              <button 
                className={`${styles.tab} ${activeTab === "all" ? styles.active : ""}`} 
                onClick={() => handleTabChange("all")}
              >
                전체
              </button>
              <button 
                className={`${styles.tab} ${activeTab === "portfolio" ? styles.active : ""}`} 
                onClick={() => handleTabChange("portfolio")}
              >
                포트폴리오
              </button>
              <button 
                className={`${styles.tab} ${activeTab === "dev" ? styles.active : ""}`} 
                onClick={() => handleTabChange("dev")}
              >
                개발내역
              </button>
              <button 
                className={`${styles.tab} ${activeTab === "others" ? styles.active : ""}`} 
                onClick={() => handleTabChange("others")}
              >
                기타
              </button>
              <div className={styles["tab-indicator"]} ref={indicatorRef}></div>
            </div>

            {searchPerformed && (
              <div className={styles["search-status"]}>
                <div className={styles["search-info"]}>
                  <span>
                    <strong>"{displaySearchQuery}"</strong>에 대한 검색 결과: 
                    <strong> {searchResults.length > 0 ? searchResults.length : 0}</strong>개
                  </span>
                  <button 
                    className={styles["back-to-posts"]}
                    onClick={clearSearch}
                  >
                    <i className="fa-solid fa-arrow-left"></i> 모든 포스트 보기
                  </button>
                </div>
              </div>
            )}

            <div className={styles["community-posts"]}>
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
                  <NavLink 
                    to={`/posts/view/${post._id}/${generateSlug(post.title)}`} 
                    key={post._id} 
                    className={styles["post-item"]}
                    style={{animationDelay: `${index * 0.05}s`}}
                  >
                    <div className={styles["post-header"]}>
                      {post.d_author && post.author && (
                        <div className={styles["post-author"]}>
                          <i className={`fas fa-user ${styles["author-avatar"]}`}></i>
                          <span>{post.d_author} (@{post.author})</span>
                        </div>
                      )}
                      {post.createdAt && 
                        <span className={styles["post-date"]}>{formatDate(post.createdAt)}</span>
                      }
                    </div>

                    <h2 className={styles["post-title"]}>{post.title}</h2>
                    <div className={styles["post-description"]}>
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]} 
                        rehypePlugins={[rehypeRaw]}
                        skipHtml={false} 
                        disallowedElements={['script']}
                      >
                        {post.description}
                      </ReactMarkdown>
                    </div>

                    <div className={styles["post-footer"]}>
                      <div className={styles["post-tags"]}>
                        {post.tags && post.tags.map((tag) => (
                          <span key={tag} className={styles.tag}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                      {post.rank && 
                        <span className={`${styles["post-rank"]} ${styles[`rank-${post.rank}`]}`}>
                          {rankMapping[post.rank] || "알 수 없음"}
                        </span>
                      }
                    </div>
                  </NavLink>
                ))
              ) : (
                !isLoading && searchPerformed ? (
                  <div className={styles["no-search-results"]}>
                    <i className="fa-solid fa-search fa-2x"></i>
                    <p>검색 결과가 없습니다.</p>
                    <p className={styles["search-suggestion"]}>다른 키워드로 검색해보세요.</p>
                  </div>
                ) : (
                  <p className={styles["no-posts-message"]}> </p>
                )
              )}
              
              {!allPostsLoaded && !searchPerformed && (
                <div ref={targetRef} className={styles["loading-indicator"]}>
                  <svg className={styles.loader} viewBox="25 25 50 50">
                    <circle r="20" cy="50" cx="50"></circle>
                  </svg>
                </div>
              )}
              
              {allPostsLoaded && filteredPosts.length > 0 && !searchPerformed && (
                <div className={styles["end-messages"]}>
                  <p className={styles["all-posts-message"]}>모든 포스트를 확인했습니다.</p>
                  <p className={styles["additional-message"]}>더 이상 표시할 포스트가 없네요ㅠ</p>
                </div>
              )}
            </div>
          </>
        )}

        {showPopup && (
          <div className={styles["popup-overlay"]} onClick={(e) => {
            if (e.target.className === styles["popup-overlay"]) handlePopupToggle();
          }}>
            <div className={styles["popup-container"]}>
              <div className={styles["popup-header"]}>
                <h2>{previewMode ? "미리보기" : "포스트 작성"}</h2>
                <div className={styles["popup-controls"]}>
                  <button 
                    className={`${styles["preview-toggle"]} ${previewMode ? styles.active : ''}`} 
                    onClick={togglePreviewMode}
                    title={previewMode ? "편집 모드로 전환" : "미리보기 모드로 전환"}
                  >
                    <i className={`fa-solid ${previewMode ? 'fa-edit' : 'fa-eye'}`}></i>
                    {previewMode ? " 편집" : " 미리보기"}
                  </button>
                  <button className={styles["close-popup"]} onClick={handlePopupToggle}>
                    <i className="fa-solid fa-times"></i>
                  </button>
                </div>
              </div>

              {previewMode ? (
                <div className={styles["post-preview"]}>
                  <h1 className={styles["preview-title"]}>{newPost.title || "제목 없음"}</h1>
                  <div className={styles["preview-meta"]}>
                  <span className={styles["preview-author"]}>
                      {user?.display_name || "사용자"} (@{user?.user_handle || "사용자"})
                    </span>
                    <span className={styles["preview-date"]}>방금 전</span>
                  </div>
                  <div className={styles["preview-content"]}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]} 
                      rehypePlugins={[rehypeRaw]}
                      skipHtml={false} 
                      disallowedElements={['script']}
                    >
                      {newPost.description || "내용을 입력해주세요..."}
                    </ReactMarkdown>
                  </div>
                  <div className={styles["preview-footer"]}>
                    <div className={styles["preview-tags"]}>
                      {newPost.tags.length > 0 ? (
                        newPost.tags.map((tag) => (
                          <span key={tag} className={styles.tag}>#{tag}</span>
                        ))
                      ) : (
                        <span className={styles["no-tags"]}>태그 없음</span>
                      )}
                    </div>
                    <span className={`${styles["preview-rank"]} ${styles[`rank-${newPost.rank}`]}`}>
                      {rankMapping[newPost.rank] || "알 수 없음"}
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className={styles["form-group"]}>
                    <label htmlFor="title">
                      <i className="fa-solid fa-heading"></i> 제목
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={newPost.title}
                      onChange={handleInputChange}
                      placeholder="제목을 입력하세요"
                      required
                    />
                  </div>
                  
                  <div className={styles["form-group"]}>
                    <label htmlFor="description">
                      <i className="fa-solid fa-align-left"></i> 내용
                      <span className={styles["markdown-hint"]}>마크다운 지원</span>
                    </label>
                    <div className={styles["editor-container"]}>
                      <ReactMarkdownEditorLite
                        ref={editorRef}
                        value={newPost.description || ""}
                        onChange={handleEditorChange}
                        style={{ height: "300px" }}
                        renderHTML={(text) => mdParser.render(text)}
                        placeholder="내용을 입력하세요..."
                        className={styles["custom-editor"]}
                      />
                    </div>
                  </div>
                  
                  <div className={styles["editor-help"]}>
                    <details>
                      <summary>마크다운 사용법</summary>
                      <div className={styles["markdown-help"]}>
                        <div className={styles["help-item"]}>
                          <code># 제목</code>
                          <span>제목 (H1)</span>
                        </div>
                        <div className={styles["help-item"]}>
                          <code>## 제목</code>
                          <span>부제목 (H2)</span>
                        </div>
                        <div className={styles["help-item"]}>
                          <code>**텍스트**</code>
                          <span>굵은 글씨</span>
                        </div>
                        <div className={styles["help-item"]}>
                          <code>*텍스트*</code>
                          <span>기울임꼴</span>
                        </div>
                        <div className={styles["help-item"]}>
                          <code>[링크](URL)</code>
                          <span>하이퍼링크</span>
                        </div>
                        <div className={styles["help-item"]}>
                          <code>```코드```</code>
                          <span>코드 블록</span>
                        </div>
                        <div className={styles["help-item"]}>
                          <code>- 항목</code>
                          <span>목록</span>
                        </div>
                        <div className={styles["help-item"]}>
                          <code> 인용</code>
                          <span>인용구</span>
                        </div>
                      </div>
                    </details>
                  </div>
                  
                  <div className={styles["form-group"]}>
                    <label htmlFor="tags">
                      <i className="fa-solid fa-tags"></i> 태그
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={tagInput}
                      onChange={handleTagsChange}
                      placeholder="태그를 띄어쓰기로 구분하여 입력하세요 (예: web development react)"
                    />
                    {newPost.tags.length > 0 && (
                      <div className={styles["tag-preview"]}>
                        {newPost.tags.map((tag) => (
                          <span key={tag} className={styles.tag}>#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className={styles["form-group"]}>
                    <label htmlFor="rank">
                      <i className="fa-solid fa-star"></i> 카테고리
                    </label>
                    <select 
                      id="rank" 
                      name="rank" 
                      value={newPost.rank} 
                      onChange={handleInputChange}
                      className={`${styles["rank-select"]} ${styles[`rank-${newPost.rank}`]}`}
                    >
                      {Object.entries(rankMapping)
                        .filter(([value]) => parseInt(value, 10) <= user?.rank)
                        .map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))
                      }
                    </select>
                  </div>

                  {errorMessage2 && (
                    <div className={styles["error-message2"]}>
                      <i className="fa-solid fa-circle-exclamation"></i>
                      {errorMessage2}
                    </div>
                  )}
                  
                  <div className={styles["form-actions"]}>
                    <button type="button" className={styles["cancel-button"]} onClick={handlePopupToggle}>
                      취소
                    </button>
                    <button 
                      type="submit" 
                      className={`${styles["submit-button"]} ${isLoading ? styles.loading : ''}`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                          제출 중...
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-paper-plane"></i>
                          포스트 제출
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default MainContent;
