import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import { AuthContext } from '../AuthContext.jsx';
import '../styles/Layout.css';

function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const redirectUrl = encodeURIComponent(location.pathname);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      setShowPopup(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };
  
  const handleLogout = () => {
    logout();
    setShowPopup(false);
  };

  return (
    <div className="container">
      <div className="layout_header-container">
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          <i className={`fa-solid ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        <div className="header-user-info_ui">
          {isAuthenticated ? (
            <div className="user-button" onClick={togglePopup} ref={popupRef}> 
              <i className="fa-solid fa-user fa-lg"></i>

              {showPopup && (
                <div className="user-popup">
                  <div className='user-info'>
                    {user.display_name && <span className='user-display-name'>{user.display_name}</span>}
                    {user.user_handle && <span className='user-handle'>@{user.user_handle}</span>}
                  </div>
                  <button onClick={() => navigate("/settings")}>계정 관리</button>
                  <button onClick={handleLogout}>로그아웃</button>
                </div>
              )}
            </div>
          ) : (
            <NavLink 
              className="user-button_login" 
              to={`/auth/login?redirect=${redirectUrl}`}
            >
              <i className="fa-solid fa-user-large fa-lg"></i> 로그인
            </NavLink>
          )}
        </div>
      </div>

      <div className="main-content">
        <Sidebar isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
