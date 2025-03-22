import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { marked } from 'marked';
import styles from '../styles/PostDetail.module.css';
import { Helmet } from 'react-helmet';

const PostDetail = () => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const { id, title } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/${id}/${title}`);
        if (!response.ok) {
          throw new Error('Post not found');
        }
        const data = await response.json();
        setPost(data);
        setIsLoading(false);

        const commentsResponse = await fetch(`/api/comments/${id}`);
        if (!commentsResponse.ok) {
          throw new Error('Comments not found');
        }
        const commentsData = await commentsResponse.json();
        
        const sortedComments = commentsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setComments(sortedComments);
      } catch (err) {
        setIsLoading(false);
        setError('해당 포스트는 존재하지 않습니다. 잠시 후 홈으로 이동합니다...');
        setTimeout(() => {
          navigate('/home');
        }, 1000);
      }
    };

    fetchPost();
  }, [id, title, navigate]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }
    
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId: id, content }),
      });
      if (!response.ok) {
        if (response.status === 400) {
          return alert('비정상적인 행동이 감지되었습니다.');
        } else if (response.status === 401) {
          return alert('관리자 외 댓글을 작성할 수 없는 게시물 입니다.');
        } else if (response.status === 404) {
          navigate('/auth/login');
          return alert('로그인 후 이용하세요.');
        } else {
          return alert('알 수 없는 오류가 발생했습니다.');
        }
      }

      const newComment = await response.json();
      setComments([newComment, ...comments]);
      setContent('');
    } catch (err) {
      setError('댓글을 추가할 수 없습니다');
    }
  };

  return (
    <section className={styles['content']}>
      <Helmet>
        <title>{post ? post.title + ' - Louis1618 | Blog': ''}</title>
        <meta name="title" content={post ? post.title : '개발 제목 포스트 블로그 제목 로드 실패'} />
        <meta name="description" content={post ? post.description : '개발 제목 포스트 블로그 제목 로드 실패'} />
        <meta name="keywords" content={post?.tags?.length ? post.tags.join(', ') : ''} />
      </Helmet>
      <div className={styles['post-layout']}>
        <div className={styles['post-detail']}>
          {error ? (
            <div className={styles['error-message']}>
              <p>{error}</p>
            </div>
          ) : isLoading ? (
            <div className={styles['loading-container']}>
              <svg className={styles.loader} viewBox="25 25 50 50">
                <circle r="20" cy="50" cx="50"></circle>
              </svg>
            </div>
          ) : (
            <>
              <button className={styles['back-button']} onClick={handleBackClick} aria-label="뒤로 가기">
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              
              <header className={styles['post-header']}>
                <h1 className={styles['post-title']}>{post.title}</h1>
                <div className={styles['post-meta']}>
                  <div className={styles['author-info']}>
                    <span className={styles['author-name']}>{post.d_author} (@{post.author})</span>
                  </div>
                  <time className={styles['post-date']}>{new Date(post.createdAt).toLocaleString()}</time>
                </div>
              </header>

              <div
                className={styles['post-content']}
                dangerouslySetInnerHTML={{ __html: marked(post.description) }}
              />

              <div className={styles['post-tags']}>
                {post.tags && post.tags.map(tag => (
                  <span key={tag} className={styles['tag']}>#{tag}</span>
                ))}
              </div>

              <div className={styles['post-comments']}>
                <h2 className={styles['comments-title']}>댓글</h2>
                
                <div className={styles['add-comment']}>
                  <form onSubmit={handleAddComment}>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="이 게시물에 댓글을 남겨보세요"
                      required
                      className={styles['comment-textarea']}
                    />
                    <button type="submit" className={styles['comment-submit']}>게시</button>
                  </form>
                </div>

                <div className={styles['comments-list']}>
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment._id} className={styles['comment']}>
                        <div className={styles['comment-header']}>
                          <span className={styles['comment-author']}>
                            {comment.displayname} <span className={styles['author-handle']}>@{comment.author}</span>
                          </span>
                          <time className={styles['comment-date']}>{new Date(comment.createdAt).toLocaleString()}</time>
                        </div>
                        <p className={styles['comment-content']}>{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className={styles['no-comments']}>아직 댓글이 없습니다. 첫 댓글을 작성해보세요!</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default PostDetail;