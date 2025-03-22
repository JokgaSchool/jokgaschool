import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import styles from '../styles/sidebar.module.css';
import { AuthContext } from '../AuthContext.jsx';
import logo from '../assets/img/logo_background.svg';

function Sidebar({ isMobileMenuOpen, toggleMobileMenu }) {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const redirectUrl = encodeURIComponent(location.pathname);

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setShowPopup(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const positionUserPopup = () => {
    const userButton = document.querySelector(`.${styles['user-button']}`);
    const userPopup = document.querySelector(`.${styles['user-popup']}`);
    
    if (userButton && userPopup) {
      const buttonRect = userButton.getBoundingClientRect();
      
      userPopup.style.bottom = `${window.innerHeight - buttonRect.top}px`;
      userPopup.style.left = `${buttonRect.left}px`;
      
      if (buttonRect.left < 10) {
        userPopup.style.left = '10px';
      }
      
      if (buttonRect.left + userPopup.offsetWidth > window.innerWidth) {
        userPopup.style.left = `${window.innerWidth - userPopup.offsetWidth - 10}px`;
      }
    }
  };

  const togglePopup = () => {
    const newPopupState = !showPopup;
    setShowPopup(newPopupState);
    
    if (newPopupState) {
      setTimeout(positionUserPopup, 0);
    }
  };

  const handleLogout = () => {
    logout();
    setShowPopup(false);
  };

  const handleMobileLinkClick = () => {
    toggleMobileMenu(false);
  };

  return (
    <>
      {isMobileMenuOpen && <div className="mobile-overlay" onClick={toggleMobileMenu}></div>}

      <aside className={`${styles['sidebar']} ${isMobileMenuOpen ? styles['mobile-open'] : ''}`}>
        <div className={styles['logo-container']}>
          <a href="/home" className={styles['logo-link']}>
            <img src={logo} alt="louis1618" className={styles['logo_img']} />
          </a>
        </div>

        <nav className={styles['side-nav']}>
          <NavLink
            to="/home"
            className={({ isActive }) =>
              isActive || window.location.pathname.startsWith('/home')
                ? styles.active
                : ''
            }
            onClick={handleMobileLinkClick}
          >
            <i className="fa-solid fa-house fa-lg"></i> 홈
          </NavLink>
          <NavLink 
            to="/search" 
            className={({ isActive }) => (isActive ? styles.active : '')}
            onClick={handleMobileLinkClick}
          >
          <i class="fa-solid fa-magnifying-glass fa-lg"></i> 검색
          </NavLink>
          <NavLink
            to="/direct"
            className={({ isActive }) => (isActive ? styles.active : '')}
            onClick={handleMobileLinkClick}
          >
            <i class="fa-solid fa-paper-plane fa-lg"></i> 메세지 
          </NavLink>
          <NavLink
            to="/archives"
            className={({ isActive }) => (isActive ? styles.active : '')}
            onClick={handleMobileLinkClick}
          >
            <i className="fa-solid fa-star fa-lg"></i> 업적
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => (isActive ? styles.active : '')}
            onClick={handleMobileLinkClick}
          >
            <i className="fa-solid fa-circle-info fa-lg"></i> 소개
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => (isActive ? styles.active : '')}
            onClick={handleMobileLinkClick}
          >
            <i className="fa-solid fa-gear fa-lg"></i> 설정
          </NavLink>
        </nav>

        <div className={styles['quick-links']}>
          {isAuthenticated ? (
            <div className={`${styles['user-button']} ${styles['authenticated']}`} onClick={togglePopup} ref={popupRef}>
              <i className="fa-solid fa-user fa-xl"></i>
              <div className={styles['user-info']}>
                {user.display_name && <span className={styles['user-display-name']}>{user.display_name}</span>}
                {user.user_handle && <span className={styles['user-handle']}>@{user.user_handle}</span>}
              </div>

              {showPopup && (
                <div className={styles['user-popup']}>
                  <div className={styles['user-popup-header']}>
                    <div className={styles['user-popup-avatar']}>
                      {user.display_name ? user.display_name.charAt(0).toUpperCase() : <i className="fa-solid fa-user"></i>}
                    </div>
                    <div className={styles['user-popup-info']}>
                      <span className={styles['user-popup-name']}>{user.display_name}</span>
                      <span className={styles['user-popup-handle']}>@{user.user_handle}</span>
                    </div>
                  </div>
                  <div className={styles['user-popup-buttons']}>
                    <button onClick={() => navigate("/posts/view/67d9ada93caf86de0ac011de")}>
                      <i className="fa-solid fa-user"></i>
                      프로필 보기
                    </button>
                    <button onClick={() => navigate("/settings")}>
                      <i className="fa-solid fa-gear"></i>
                      계정 관리
                    </button>
                    <button onClick={handleLogout}>
                      <i className="fa-solid fa-right-from-bracket"></i>
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <NavLink 
              className={`${styles['user-button']} ${styles['unauthenticated']}`} 
              to={`/auth/login?redirect=${redirectUrl}`}
              onClick={handleMobileLinkClick}
            >
              <i className="fa-solid fa-user-large fa-lg"></i> 로그인
            </NavLink>
          )}
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div 
          className={styles['mobile-overlay']} 
          onClick={toggleMobileMenu}
        ></div>
      )}
    </>
  );
}

export default Sidebar;
