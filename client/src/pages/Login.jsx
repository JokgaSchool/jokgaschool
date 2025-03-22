import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styles from '../styles/auth.module.css';
import logo from '../assets/img/logo_background.svg';
import { AuthContext } from '../AuthContext.jsx';

function Login() {
  const [userHandle, setUserHandle] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect') || '/home'; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await login(userHandle, password);
      if (result.success) {
        navigate(redirect, { replace: true });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.querySelector(`.${styles.container}`).classList.add(styles.fadeIn);
  }, []);

  if (isAuthenticated) {
    navigate(redirect);
    return null;
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header2}>
          <img src={logo} alt="louis1618" className={styles.logo_img} />
        </div>

        <h1 className={styles.title}>로그인</h1>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="userHandle">아이디</label>
            <div className={styles.inputWrapper}>
              <i className="fa-solid fa-user"></i>
              <input
                type="text"
                id="userHandle"
                value={userHandle}
                onChange={(e) => setUserHandle(e.target.value)}
                placeholder="아이디를 입력하세요"
                required
              />
            </div>
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password">비밀번호</label>
            <div className={styles.inputWrapper}>
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>
          </div>
          
          {error && (
            <div className={styles.errorMessage}>
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}
          
          <button 
            className={`${styles.custombutton} ${isLoading ? styles.loading : ''}`} 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i>
                처리 중...
              </>
            ) : '로그인'}
          </button>
        </form>
        
        <div className={styles.signupLink}>
          <p>
            계정이 없으신가요? <Link to="/auth/signup">회원가입</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
