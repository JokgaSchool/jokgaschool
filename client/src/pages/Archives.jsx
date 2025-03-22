// import React, { useContext } from 'react';
// import styles from '../styles/Notice.module.css';
// import { AuthContext } from '../AuthContext.jsx';

// function MainContent() {
//   const { user, isAuthenticated } = useContext(AuthContext);

//   return (
//     <section className="content">
//       <div className={styles['home-header']}>
//         {isAuthenticated === true ? <h1 id="username">{user.user_handle} 님에게 공개하는 나의 업적</h1> : <h1>업적</h1>}
//       </div>

//       <div className={styles['notice-section']}>
//         <div className={styles['section-header']}>
//           <h2>2025</h2>
//         </div>
//         <div className={styles['item-grid']}>
//           <div className={styles['item-card']}>
//             <h3>없어요</h3>
//             <p>네 없어요</p>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// export default MainContent;

import React from "react";
import styles from "../styles/message.module.css";
import { FaLink } from "react-icons/fa";

function MainContent() {
  const projectsByYear = {
    2025: {
      3: [
        {
          title: "이룬게 없어요!!",
          date: "2025-03-14",
          description: "태어난 김에 사니까 이룬게 없지ㅠ",
          links: [],
        },
      ],
    },
  };

  const sortedYears = Object.entries(projectsByYear)
    .sort(([yearA], [yearB]) => yearB - yearA);

  return (
    <section className="content">
      {sortedYears.map(([year, months]) => (
        <div key={year} className={styles.yearSection}>
          <h2 className={styles.yearTitle}>{year} 업적</h2>
          {Object.entries(months)
            .sort(([monthA], [monthB]) => monthB - monthA) // 월 내림차순 정렬
            .map(([month, projects]) => (
              <div key={month} className={styles.monthSection}>
                <h3 className={styles.monthTitle}>{month}월</h3>
                <div className={styles.grid}>
                  {projects
                    .sort((a, b) => new Date(b.date) - new Date(a.date)) // 날짜 내림차순 정렬
                    .map((project, index) => (
                      <div key={index} className={styles.card}>
                        <p className={styles.cardDate}>{project.date}</p>
                        <h3 className={styles.cardTitle}>{project.title}</h3>
                        <p className={styles.cardDescription}>{project.description}</p>
                        {project.links && project.links.length > 0 && (
                          <div className={styles.cardLinks}>
                            {project.links.map((link, linkIndex) => (
                              <a
                                key={linkIndex}
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.cardLink}
                              >
                                <FaLink className={styles.cardLinkIcon} />{" "}
                                <span className={styles.cardLinkText}>{link}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      ))}
    </section>
  );
}

export default MainContent;
