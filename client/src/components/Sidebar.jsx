import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';
import { AuthContext } from '../AuthContext';
import logo from '../assets/img/logo_background.svg';

function Sidebar() {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

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
    <aside>
      <div className="logo">
        <a href="/home">
          <img src={logo} alt="Yoonsuck" className="logo_img" />
        </a>
      </div>
      <nav className="side-nav">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive || window.location.pathname.startsWith('/home')
              ? 'active'
              : ''
          }
        >
          <i className="fa-solid fa-house fa-lg"></i> 홈
        </NavLink>
        <NavLink to="/vote" className={({ isActive }) => (isActive ? 'active' : '')}>
          <i className="fa-solid fa-square-poll-horizontal fa-xl"></i> 투표 조회
        </NavLink>
        <NavLink
          to="/message"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <i className="fa-solid fa-comments fa-lg"></i> 메세지 보내기
        </NavLink>
        <NavLink
          to="/notice"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <i className="fas fa-user-group fa-lg"></i> 공지사항
        </NavLink>
        <NavLink
          to="/webproxy"
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
        <i class="fa-solid fa-server fa-xl"></i> 웹 프록시
        </NavLink>
      </nav>
      <div className="quick-links">
        {isAuthenticated ? (
          <div className="user-button" onClick={togglePopup} ref={popupRef}>
            <i className="fa-solid fa-user-large fa-lg"></i> {user.username}
            {showPopup && (
              <div className="user-popup">
                <button onClick={() => alert('아직 안만들었으니까 기다리셈')}>
                  설정
                </button>
                <button onClick={handleLogout}>로그아웃</button>
              </div>
            )}
          </div>
        ) : (
          <NavLink className='user-button' to="/login">
            <i className="fa-solid fa-user-large fa-lg"></i> 로그인
          </NavLink>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;