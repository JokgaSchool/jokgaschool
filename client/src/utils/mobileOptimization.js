// 모바일 터치 이벤트 최적화
export const initializeMobileOptimization = () => {
  // 더블탭 줌 방지
  document.addEventListener('touchstart', (event) => {
    if (event.touches.length > 1) {
      event.preventDefault();
    }
  }, { passive: false });

  // 모바일 스크롤 성능 최적화
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
};

// 모바일 네비게이션 스크롤 처리
export const handleMobileNavigation = () => {
  let lastScroll = 0;
  const navbar = document.querySelector('aside');
  
  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > lastScroll && currentScroll > 50) {
      // 아래로 스크롤 시 네비게이션 숨김
      navbar.style.transform = 'translateY(100%)';
    } else {
      // 위로 스크롤 시 네비게이션 표시
      navbar.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
  }, { passive: true });
};
