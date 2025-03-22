
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/auth.module.css';
import logo from '../assets/img/logo_background.svg';

function Signup() {
  const [DisplayName, setDisplayName] = useState('');
  const [userHandle, setUserHandle] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const navigate = useNavigate();

  const validateInputs = () => {
    if (DisplayName.length > 30) {
      setError('이름은 최대 30자까지 가능합니다.');
      return false;
    }
  
    const userHandleRegex = /^[a-zA-Z0-9가-힣_]{1,15}$/;
    if (!userHandleRegex.test(userHandle)) {
      setError('아이디는 영문, 숫자, 한글, 밑줄(_)만 사용 가능하며 최대 15자입니다.');
      return false;
    }
  
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('비밀번호는 최소 8자, 영문/숫자/특수문자(@$!%*#?&)를 포함해야 합니다.');
      return false;
    }
  
    if (password !== passwordCheck) {
      setError('비밀번호가 일치하지 않습니다.');
      return false;
    }
  
    return true;
  };  

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');
    
    if (formStep === 1) {
      if (DisplayName && userHandle) {
        const userHandleRegex = /^[a-zA-Z0-9가-힣_]{1,15}$/;
        if (!userHandleRegex.test(userHandle)) {
          setError('아이디는 영문, 숫자, 한글, 밑줄(_)만 사용 가능하며 최대 15자입니다.');
          return;
        }
        if (DisplayName.length > 30) {
          setError('이름은 최대 30자까지 가능합니다.');
          return;
        }
        setFormStep(2);
      } else {
        setError('모든 필드를 입력해주세요.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateInputs()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ DisplayName, userHandle, password }),
      });
      const data = await response.json();
      if (response.ok) {
        navigate('/auth/login');
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.querySelector(`.${styles.container}`).classList.add(styles.fadeIn);
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header2}>
          <img src={logo} alt="louis1618" className={styles.logo_img} />
        </div>

        <h1 className={styles.title}>회원가입</h1>
        
        <div className={styles.stepIndicator}>
          <div className={`${styles.step} ${formStep >= 1 ? styles.active : ''}`}>
            <span>1</span>
            <p>기본 정보</p>
          </div>
          <div className={styles.stepConnector}></div>
          <div className={`${styles.step} ${formStep >= 2 ? styles.active : ''}`}>
            <span>2</span>
            <p>보안 설정</p>
          </div>
        </div>

        {formStep === 1 ? (
          <form onSubmit={handleNextStep} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="DisplayName">이름</label>
              <div className={styles.inputWrapper}>
                <i className="fa-solid fa-user"></i>
                <input
                  type="text"
                  id="DisplayName"
                  value={DisplayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="userHandle">아이디</label>
              <div className={styles.inputWrapper}>
                <i className="fa-solid fa-at"></i>
                <input
                  type="text"
                  id="userHandle"
                  value={userHandle}
                  onChange={(e) => setUserHandle(e.target.value)}
                  placeholder="사용할 아이디를 입력하세요"
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

            <button className={styles.custombutton} type="submit">
              다음 단계
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className={`${styles.form} ${styles.slideIn}`}>
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

            <div className={styles.inputGroup}>
              <label htmlFor="password_check">비밀번호 확인</label>
              <div className={styles.inputWrapper}>
                <i className="fa-solid fa-shield"></i>
                <input
                  type="password"
                  id="password_check"
                  value={passwordCheck}
                  onChange={(e) => setPasswordCheck(e.target.value)}
                  placeholder="비밀번호를 다시 입력하세요"
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

            <div className={styles.buttonGroup}>
              <button 
                type="button" 
                className={styles.backButton}
                onClick={() => setFormStep(1)}
              >
                <i className="fa-solid fa-arrow-left"></i>
                이전
              </button>
              
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
                ) : '회원가입'}
              </button>
            </div>
          </form>
        )}

        <div className={styles.signupLink}>
          <p>계정이 있으신가요? <Link to="/auth/login">로그인</Link></p>
        </div>
      </div>
    </main>
  );
}

export default Signup;
