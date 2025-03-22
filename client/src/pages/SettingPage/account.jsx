import React, { useContext, useState } from 'react';
import { Navigate } from 'react-router-dom';
import styles from '../../styles/settings.module.css';
import { AuthContext } from '../../AuthContext.jsx';

function MainContent() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!isAuthenticated) return <Navigate to={`/auth/login`} />;

  const handleDeleteAccount = async () => {
    if (!password) {
      setError('비밀번호를 입력해주세요');
      return;
    }
    
    setIsDeleting(true);
    try {
      const response = await fetch('/api/deleteUser', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || '탈퇴 실패');
      } else {
        setSuccessMessage('회원 탈퇴가 완료되었습니다.');
        setTimeout(() => {
          logout();
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError('서버 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmClick = () => {
    setShowConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
    setPassword('');
    setError('');
  };

  return (
    <section className={styles['content']}>
      <div className={styles['settings-container']}>
        <div className={`${styles['settings-card']} ${styles['profile-card']}`}>
          <div className={styles['card-header']}>
            <h2>프로필</h2>
          </div>
          <div className={styles['card-content']}>
            <div className={styles['profile-info']}>
              <div className={styles['info-group']}>
                <label>핸들</label>
                <div className={styles['info-value']}>{user.user_handle}</div>
              </div>
              <div className={styles['info-group']}>
                <label>이름</label>
                <div className={styles['info-value']}>{user.display_name}</div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles['settings-card']} ${styles['permissions-card']}`}>
          <div className={styles['card-header']}>
            <h2>권한</h2>
          </div>
          <div className={styles['card-content']}>
            <div className={styles['info-group']}>
              <label>액세스</label>
              <div className={`${styles['info-value']} ${styles['badge']}`}>{user.rank}</div>
            </div>
          </div>
        </div>

        <div className={`${styles['settings-card']} ${styles['danger-card']}`}>
          <div className={styles['card-header']}>
            <h2>회원 탈퇴</h2>
          </div>
          <div className={styles['card-content']}>
            {!showConfirmation ? (
              <div className={styles['danger-zone']}>
                <p className={styles['warning-text']}>
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  계정 삭제 후 일부 데이터를 제외한 모든 데이터가 제거됩니다.
                </p>
                <button 
                  onClick={handleConfirmClick} 
                  className={styles['danger-button']}
                >
                  회원 탈퇴 진행
                </button>
              </div>
            ) : (
              <div className={styles['confirmation-form']}>
                <p className={styles['confirmation-text']}>계정 삭제를 확인하려면 비밀번호를 입력하세요.</p>
                <div className={styles['input-group']}>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className={styles['input-field']}
                    disabled={isDeleting}
                  />
                {error && (
                  <div className={styles['error-message']}>
                    <i className="fa-solid fa-circle-exclamation"></i>
                    {error}
                  </div>
                )}
                {successMessage && (
                  <div className={styles['success-message']}>
                    <i className="fa-solid fa-circle-check"></i>
                    {successMessage}
                  </div>
                )}
                  <div className={styles['button-group']}>
                    <button 
                      onClick={handleCancelDelete} 
                      className={styles['cancel-button']}
                      disabled={isDeleting}
                    >
                      취소
                    </button>
                    <button 
                      onClick={handleDeleteAccount} 
                      className={styles['confirm-delete-button']}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <span className={styles['loading-spinner']}>
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        </span>
                      ) : '탈퇴 확인'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default MainContent;
