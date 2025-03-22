import React from "react";
import styles from "../styles/Project.module.css";
import { FaLink } from "react-icons/fa";

function MainContent() {
  const projectsByYear = {
    "개발 중인 기능": {
      "검색 기능": [
        {
          title: "검색 기능",
          date: "2025-03-23",
          description: "게시물, 사용자 등을 검색할 수 있는 기능입니다",
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
          <h2 className={styles.yearTitle}>{year}</h2>
          {Object.entries(months)
            .sort(([monthA], [monthB]) => monthB - monthA) // 월 내림차순 정렬
            .map(([month, projects]) => (
              <div key={month} className={styles.monthSection}>
                <h3 className={styles.monthTitle}>{month}</h3>
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
