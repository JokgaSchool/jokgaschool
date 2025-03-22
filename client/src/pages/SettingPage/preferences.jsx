import React, { useState } from 'react';
import styles from '../../styles/settings.module.css';

function MainContent() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
    document.body.classList.toggle('dark-mode', !isDarkMode);
  };

  return (
    <section className={styles['content']}>
      <div className={styles['settings-container']}>
        {/* 테마 설정 카드 */}
        <div className={`${styles['settings-card']} ${styles['theme-card']}`}>
          <div className={styles['card-header']}>
            <h2>테마 설정</h2>
          </div>
          <div className={styles['card-content']}>
            <div className={styles['theme-section']}>
              <div className={styles['info-group']}>
                <label>다크 모드</label>
                <p className={styles['setting-description']}>
                  현재 개발 중인 기능입니다
                </p>
                <button 
                  className={`${styles['theme-toggle-btn']} ${isDarkMode ? styles['dark'] : ''}`}
                  onClick={toggleTheme}
                >
                  <i className={`fa-solid ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
                  <span>{isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 알림 설정 카드 */}
        <div className={`${styles['settings-card']} ${styles['notifications-card']}`}>
          <div className={styles['card-header']}>
            <h2>알림 설정</h2>
          </div>
          <div className={styles['card-content']}>
            <div className={styles['info-group']}>
              <label>알림</label>
              <p className={styles['setting-description']}>
                현재 개발 중인 기능입니다
              </p>
              <button className={`${styles['setting-button']} ${styles['disabled']}`} disabled>
                <i className="fa-solid fa-bell"></i>
                <span>알림 설정</span>
              </button>
            </div>
          </div>
        </div>

        {/* 언어 설정 카드 */}
        <div className={`${styles['settings-card']} ${styles['language-card']}`}>
          <div className={styles['card-header']}>
            <h2>언어 설정</h2>
          </div>
          <div className={styles['card-content']}>
            <div className={styles['info-group']}>
              <label>표시 언어</label>
              <p className={styles['setting-description']}>
                현재 개발 중인 기능입니다
              </p>
              <button className={`${styles['setting-button']} ${styles['disabled']}`} disabled>
                <i className="fa-solid fa-language"></i>
                <span>언어 변경</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MainContent;
