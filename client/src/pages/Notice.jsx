import React, { useContext } from 'react';
import '../styles/Notice.css';
import { AuthContext } from '../AuthContext';

function MainContent() {
  const { user, isAuthenticated} = useContext(AuthContext);

  return (
    <section className="content">
      <div className="home-header">
        {isAuthenticated === true ? <h1 id="username">{user.username} 어서오고</h1> : <h1>로그인 안하면 삐질 수도 있는데 이래도 안해줄거야?</h1>}
      </div>

      <div className="notice-section">
        <div className="section-header">
          <h2>공지사항</h2>
        </div>
        <div className="item-grid">
          <div className="item-card">
            <h3>이거슨 공지사항이다</h3>
            <p>개발 중임</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MainContent;