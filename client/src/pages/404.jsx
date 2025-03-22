import React from 'react';
import logo from '../assets/img/logo_background.svg';
import styles from '../styles/404.module.css';

function MainContent() {
  return (
    <section className={styles.errorPage}>
      <img src={logo} alt="louis1618" className={styles.logo_img} />
      <h1>404 | 페이지를 찾을 수 없습니다</h1>
      <button className={styles.button}>
        <a href="/home">홈으로 가기</a>
      </button>
    </section>
  );
}

export default MainContent;
