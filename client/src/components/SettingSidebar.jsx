import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from '../styles/settings.module.css';
import { useContext } from 'react';
import { AuthContext } from '../AuthContext.jsx';

function SettingSidebar({ isMobileMenuOpen, toggleMobileMenu }) {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const goToMainMenu = () => {
    toggleMobileMenu(false);
    navigate('/home');
  };

  const handleMobileLinkClick = () => {
    toggleMobileMenu(false);
  };
  return (
    <>
      <aside className={`${styles['settings-sidebar']} ${isMobileMenuOpen ? styles['mobile-open'] : ''}`}>
            <button className={styles['main-menu-button']} onClick={goToMainMenu}>
              <i className="fa-solid fa-arrow-left"></i>
              메인 메뉴로 돌아가기
            </button>

            <div className={styles['logo-container']}>
              <span className={styles['header_title']}>설정</span>
              <span className={styles['header_subtitle']}>ALPHA</span>
            </div>

            <nav className={styles['side-nav']}>
              {isAuthenticated ? (
                <NavLink to="/settings/account" className={({ isActive }) => (isActive ? styles.active : '')} onClick={handleMobileLinkClick}>
                  <i className="fa-solid fa-user-large fa-lg"></i> 계정 설정
                </NavLink>
              ) : (
                <NavLink 
                  to="/auth/login" 
                  className={({ isActive }) => `${isActive ? styles.active : ''} ${styles.locked}`}
                  onClick={handleMobileLinkClick}
                >
                  <i className="fa-solid fa-lock fa-lg"></i> <strong>로그인 하세요</strong>
                </NavLink>
              )}


              <NavLink to="/settings/preferences" className={({ isActive }) => (isActive ? styles.active : '')} onClick={handleMobileLinkClick}>
                <i className="fa-solid fa-window-restore fa-lg"></i> 환경설정
              </NavLink>
            </nav>
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

export default SettingSidebar;
