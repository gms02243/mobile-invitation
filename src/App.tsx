import { useState, useEffect, useRef } from 'react';
import './index.css';
import { weddingData } from './data';
import weddingMainImg from './assets/main.jpg';

declare global {
  interface Window {
    naver?: any;
  }
}

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [gear, setGear] = useState<'P' | 'R' | 'N' | 'D'>('P');
  
  const [isCopied, setIsCopied] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [isSlideTransitioning, setIsSlideTransitioning] = useState(true);
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const sliderTrackRef = useRef<HTMLDivElement | null>(null);

  const galleryPhotos = Array.from({ length: 8 }, (_, i) => `${import.meta.env.BASE_URL}pic/${i + 1}.jpg`);
  // 처음-끝 사진 간 쭈루룩 역전행 애니메이션 없이 자연스럽게 순조로운 무한 루프 슬라이딩을 위한 클론 배열
  const loopPhotos = [galleryPhotos[galleryPhotos.length - 1], ...galleryPhotos, galleryPhotos[0]];

  const handleCopyPhone = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(id);
    setTimeout(() => setCopiedPhone(null), 2500);
  };

  const handleCopyAccount = (bank: string, account: string, id: string) => {
    navigator.clipboard.writeText(`${bank} ${account}`);
    setCopiedAccount(id);
    setTimeout(() => setCopiedAccount(null), 2500);
  };

  const handleSwipeMove = (currentX: number) => {
    touchEndXRef.current = currentX;
    if (touchStartXRef.current !== null && sliderTrackRef.current && selectedPhoto !== null) {
      const diff = currentX - touchStartXRef.current;
      // 손가락 이동에 맞춰 옆 사진이 실시간으로 따라오는 1:1 반응형 물리 슬라이더
      sliderTrackRef.current.style.transform = `translate3d(calc(-${selectedPhoto * 100}% + ${diff}px), 0, 0)`;
      sliderTrackRef.current.style.transition = 'none';
    }
  };

  const handleSwipeEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null && selectedPhoto !== null) {
      const distance = touchStartXRef.current - touchEndXRef.current;
      const minSwipeDistance = 25; // 25px 이상 스와이프 시 부드러운 관성 애니메이션 발동
      if (Math.abs(distance) > minSwipeDistance) {
        setIsSlideTransitioning(true);
        if (sliderTrackRef.current) {
          sliderTrackRef.current.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
        }
        if (distance > 0) {
          setSelectedPhoto((prev) => (prev !== null && prev < loopPhotos.length - 1 ? prev + 1 : prev));
        } else {
          setSelectedPhoto((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
        }
      } else if (sliderTrackRef.current) {
        setIsSlideTransitioning(true);
        sliderTrackRef.current.style.transform = `translate3d(-${selectedPhoto * 100}%, 0, 0)`;
        sliderTrackRef.current.style.transition = 'transform 0.35s ease-out';
      }
    } else if (sliderTrackRef.current && selectedPhoto !== null) {
      setIsSlideTransitioning(true);
      sliderTrackRef.current.style.transform = `translate3d(-${selectedPhoto * 100}%, 0, 0)`;
      sliderTrackRef.current.style.transition = 'transform 0.35s ease-out';
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // 무한 루프 가장자리(클론 0 또는 9)에 도달했을 때, 브라우저 이벤트 간섭이나 연속 터치로 onTransitionEnd가 누락되더라도 절대 멈추거나 먹통이 되지 않도록 보장하는 안전 복구 타이머
  useEffect(() => {
    if (selectedPhoto === 0) {
      const timer = setTimeout(() => {
        setIsSlideTransitioning(false);
        setSelectedPhoto(galleryPhotos.length);
      }, 550);
      return () => clearTimeout(timer);
    } else if (selectedPhoto === loopPhotos.length - 1) {
      const timer = setTimeout(() => {
        setIsSlideTransitioning(false);
        setSelectedPhoto(1);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [selectedPhoto, galleryPhotos.length, loopPhotos.length]);

  // 모달 열림 시 배경 웹페이지 스크롤 원천 차단 (iOS Safari 및 일반 브라우저 완벽 대응)
  useEffect(() => {
    if (selectedPhoto !== null) {
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.documentElement.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.touchAction = originalTouchAction;
        document.documentElement.style.overflow = '';
      };
    }
  }, [selectedPhoto]);


  // 이전 스크롤 위치와 N/P 기어 전환 타이머를 저장하기 위한 useRef
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const parkTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);

      // 스크롤 발생 시 진행 중인 중립(N) 및 파킹(P) 대기 타이머 초기화
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      if (parkTimeout.current) clearTimeout(parkTimeout.current);

      // 1. 스크롤 방향 감지하여 R 또는 D로 즉시 변경
      if (currentScroll > lastScrollY.current) {
        setGear('D'); // 화면을 내리면 Drive
      } else if (currentScroll < lastScrollY.current) {
        setGear('R'); // 화면을 올리면 Reverse
      }
      
      lastScrollY.current = currentScroll;

      // 2. 스크롤 멈춤 감지: 150ms 동안 추가 스크롤이 없으면 우선 N(중립)으로 변경
      scrollTimeout.current = setTimeout(() => {
        setGear('N');

        // 3. N 상태 유지 1초(1000ms) 동안 움직임이 없으면 P(파킹)로 자동 변속
        parkTimeout.current = setTimeout(() => {
          setGear('P');
        }, 1000);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      if (parkTimeout.current) clearTimeout(parkTimeout.current);
    };
  }, []);

  // PC 웹 및 모바일 환경 전반 우클릭(롱프레스) 및 컨텍스트 메뉴 차단
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // 스크롤 진행도에 따라 0km에서 페이지 끝 116km까지 증가 (결혼일 1월 16일 기념)
  const maxScroll = typeof document !== 'undefined'
    ? Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - window.innerHeight
    : 0;
  const scrollProgress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
  const distance = Math.round(scrollProgress * 116);

  // iOS 바운스(음수 스크롤) 팽창/떨림 방지를 위해 0 이상으로 클램핑
  const clampedScrollY = Math.max(0, scrollY);
  const heroOpacity = Math.max(0, 1 - clampedScrollY / 320);
  const heroTranslate = clampedScrollY * 0.22;

  // KST(한국 표준시 UTC+9) 기준 현재 날짜와 2027년 1월 16일 간의 D-day 계산
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const kst = new Date(utc + (9 * 60 * 60 * 1000));
  const todayKst = new Date(kst.getFullYear(), kst.getMonth(), kst.getDate()).getTime();
  const weddingDateKst = new Date(2027, 0, 16).getTime(); // 2027년 1월 16일 자정
  const diffDays = Math.ceil((weddingDateKst - todayKst) / (1000 * 60 * 60 * 24));
  let ddayString = `D-${diffDays}`;
  if (diffDays === 0) ddayString = 'D-DAY';
  else if (diffDays < 0) ddayString = `D+${Math.abs(diffDays)}`;


  return (
    <>
      <div className="display-container" onContextMenu={(e) => e.preventDefault()}>
        {/* 1. 인포테인먼트 상단 상태바 */}
      <header className="status-bar">
        <div className="status-left">
          <span className="speed-num">{distance}</span>
          <span className="speed-unit">km</span>
        </div>
        
        {/* 기어 표시 영역 (P R N D - P 파킹 시 강렬한 레드 하이라이트) */}
        <div className="status-center">
          <span className={gear === 'P' ? 'gear-active gear-p-active' : 'gear-inactive'}>P</span>
          <span className={gear === 'R' ? 'gear-active' : 'gear-inactive'}>R</span>
          <span className={gear === 'N' ? 'gear-active' : 'gear-inactive'}>N</span>
          <span className={gear === 'D' ? 'gear-active' : 'gear-inactive'}>D</span>
        </div>
        
        {/* 우상단 프로포즈링과 READY 일체감 있는 뱃지 레이아웃 */}
        <div className="status-right">
          <div className="ready-badge">
            <span className="ring-icon-wrapper">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                <circle cx="12" cy="16" r="6" stroke="currentColor" strokeWidth="2.4" />
                <path d="M7.5 7.5L10 4H14L16.5 7.5L12 11.5L7.5 7.5Z" fill="currentColor" stroke="currentColor" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="ready-label">READY</span>
          </div>
        </div>
      </header>

      <main>
        {/* 2. 메인 커버 섹션 (스크롤 전 딱 맞는 100vh 반응형 & 스크롤 시 Fade Out) */}
        <section 
          className="section hero-section"
          style={{ 
            opacity: heroOpacity, 
            transform: `translate3d(0, ${heroTranslate}px, 0)`,
            transition: 'none',
            willChange: 'transform, opacity'
          }}
        >
          <div className="hero-wrapper">
            <img src={weddingMainImg} className="hero-img" />
          </div>
          
          <h1 className="serif-title" style={{ fontSize: '27px', marginBottom: '20px' }}>
            박재훈 <span style={{ color: 'var(--wedding-accent)', fontSize: '20px', margin: '0 4px' }}>&</span> 박정은
          </h1>

          {/* 부모님 성함 안내 (각 줄 사이 및 하단 간격 충분히 띄움) */}
          <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '14px', color: '#555', marginBottom: '26px', textAlign: 'center' }}>
            <div style={{ marginBottom: '9px' }}>
              <span style={{ color: '#666' }}>박헌기 · 최미애</span>
              <span style={{ fontSize: '13px', color: '#888', margin: '0 6px' }}>의 장남</span>
              <strong style={{ color: 'var(--wedding-text)', fontWeight: '700' }}>재훈</strong>
            </div>
            <div>
              <span style={{ color: '#666' }}>박남규 · 김현숙</span>
              <span style={{ fontSize: '13px', color: '#888', margin: '0 6px' }}>의 차녀</span>
              <strong style={{ color: 'var(--wedding-text)', fontWeight: '700' }}>정은</strong>
            </div>
          </div>

          <div style={{ fontSize: '14px', color: '#777', letterSpacing: '0.5px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span>{weddingData.dateDisplay}</span>
            <strong style={{ color: '#555', fontSize: '15px' }}>{weddingData.location.name}</strong>
          </div>
        </section>

        {/* 3. 인사말 섹션 */}
        <section className="section" style={{ backgroundColor: '#F8F6F0' }}>
          <h2 className="serif-title">초대합니다</h2>
          <p className="serif-text">
            서로가 마주 보며 다진 약속을<br/>
            함께 증명해 주시는 자리가 되었으면 합니다.<br/><br/>
            저희 두 사람의 새로운 출발선에<br/>
            소중한 분들을 모시고자 하오니<br/>
            부디 오셔서 축복해 주시면 감사하겠습니다.
          </p>
        </section>

        {/* 4. 달력 및 일정 안내 */}
        <section className="section">
          <h2 className="serif-title">Wedding Day</h2>
          <div className="calendar-widget">
            {/* 2027년 상단 정중앙 배치 */}
            <div className="calendar-top-year">
              2027
            </div>

            {/* 하단 1월 표시 및 시간 안내 유지 */}
            <div className="calendar-header">
              <div className="cal-title-left">
                <span className="cal-month">1월</span>
                <span className="cal-month-eng">JANUARY</span>
              </div>
              <div className="cal-date-badge">
                <i className="fa-solid fa-heart" style={{ color: 'var(--wedding-accent)', fontSize: '12px' }}></i>
                <span>1월 16일 토요일 오후 14:00</span>
              </div>
            </div>

            {/* 정렬 및 간격이 일정한 캘린더 그리드 */}
            <div className="calendar-grid">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => {
                let dayColor = '#888';
                if (idx === 0) dayColor = '#D97373';      // 일요일: 로즈 레드
                else if (idx === 6) dayColor = '#7392B7'; // 토요일: 블루 그레이
                return (
                  <div key={day} className="cal-day" style={{ color: dayColor }}>
                    {day}
                  </div>
                );
              })}
              {/* 2027년 1월 1일은 금요일(인덱스 5)이므로 시작 전 5개의 빈 셀 추가 */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={`empty-${i}`} className="cal-date empty-cell" />
              ))}
              {Array.from({ length: 31 }, (_, i) => i + 1).map(date => {
                const dayOfWeek = (date - 1 + 5) % 7; // 0: 일요일, 6: 토요일
                const isSunday = dayOfWeek === 0;
                const isSaturday = dayOfWeek === 6;
                const isHoliday = date === 1; // 1월 1일 신정 공휴일 반영

                let numColor = 'var(--wedding-text)';
                if (isSunday || isHoliday) numColor = '#D97373'; // 일요일 및 신정 공휴일 로즈 레드
                else if (isSaturday) numColor = '#7392B7';

                return (
                  <div key={date} className="cal-date">
                    {date === 16 ? (
                      <div className="cal-highlight">{date}</div>
                    ) : (
                      <span style={{ color: numColor, fontWeight: isSunday || isSaturday || isHoliday ? '500' : '400' }}>
                        {date}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div> {/* calendar-widget 끝 */}

          {/* 달력 외부 아래에 위치한 모던 미니멀리스트 D-Day 섹션 */}
          <div className="dday-section-minimal">
            <span className="dday-label-minimal">WEDDING DAY</span>
            <div className="dday-number-minimal">{ddayString}</div>
            <p className="dday-text-minimal">
              {diffDays > 0 ? (
                <>재훈 & 정은의 결혼식까지 <span>{diffDays}일</span> 남았습니다.</>
              ) : diffDays === 0 ? (
                <>오늘, 두 사람이 부부로서 첫걸음을 내딛습니다.</>
              ) : (
                <>행복한 부부가 된 지 <span>{Math.abs(diffDays)}일</span>째 되는 날입니다.</>
              )}
            </p>
          </div>
        </section>

        {/* 5. 웨딩 갤러리 (우리의 순간들 - 8컷 스튜디오 로고 및 라이트박스 갤러리) */}
        <section className="section" style={{ backgroundColor: '#F8F6F0' }}>
          <h2 className="serif-title">우리의 순간들</h2>
          <div className="gallery-grid">
            {galleryPhotos.map((photoSrc, idx) => (
              <div 
                key={idx} 
                className="photo-item"
                onClick={() => {
                  setIsSlideTransitioning(false);
                  setSelectedPhoto(idx + 1); // loopPhotos 기준 실제 사진 인덱스 (1 ~ 8)로 시작
                }}
              >
                <img 
                  src={photoSrc} 
                  alt={`웨딩 사진 ${idx + 1}`} 
                  className="photo-img"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>

        {/* 6. 오시는 길 */}
        <section className="section">
          <h2 className="serif-title">오시는 길</h2>
          <div className="navi-card" style={{ textAlign: 'left' }}>
            {/* 목적지 설정 상단바 */}
            <div className="navi-status-bar">
              <div className="navi-pulse-icon">
                <i className="fa-solid fa-compass"></i>
              </div>
              <div className="navi-status-text">
                <strong className="navi-main-text">목적지가 설정되었습니다</strong>
              </div>
            </div>
            
            {/* 목적지 정보 (블록 처리 없이 깔끔한 디자인 & 복사 아이콘 적용) */}
            <div className="navi-dest-info">
              <div className="dest-title">
                <h3 className="dest-main-name">{weddingData.location.name}</h3>
                <span className="dest-building">{weddingData.location.building}</span>
              </div>
              
              <div 
                className="address-copy-row"
                onClick={() => {
                  navigator.clipboard.writeText(weddingData.location.address);
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 2500);
                }}
                title="터치하여 주소 복사"
              >
                <i className="fa-solid fa-location-dot address-pin" style={{ color: 'var(--wedding-accent)' }}></i>
                <span className="address-text">{weddingData.location.address}</span>
                {isCopied ? (
                  <span className="copied-inline">
                    <i className="fa-solid fa-check check-ani"></i>
                    <span>복사완료!</span>
                  </span>
                ) : (
                  <span className="copy-icon-btn">
                    <i className="fa-regular fa-copy"></i>
                  </span>
                )}
              </div>
            </div>

            {/* 고해상도 정적 지도 캡처 이미지 (클릭 시 네이버 지도 이동) */}
            <div className="navi-map-wrapper">
              <a href={weddingData.location.mapUrl} target="_blank" rel="noopener noreferrer" className="static-map-link">
                <img src="/map_capture.jpg" alt="오시는 길 지도" className="static-map-img" />
                <div className="map-overlay-button">
                  <i className="fa-solid fa-map-location-dot"></i>
                  <span>네이버 지도로 길찾기</span>
                </div>
              </a>
            </div>

            {/* 상세 교통편 안내 */}
            <div className="transport-list">
              {weddingData.location.transport.map((item, idx) => (
                <div key={idx} className="transport-item">
                  <div className="transport-icon" style={{ backgroundColor: `${item.color}18`, color: item.color }}>
                    <i className={`fa-solid ${item.icon}`}></i>
                  </div>
                  <div className="transport-content">
                    <strong style={{ color: item.color }}>{item.type}</strong>
                    <p style={{ whiteSpace: 'pre-line', marginTop: '4px' }}>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. 마음 전하실 곳 (처음부터 열려있는 직관적 계좌 안내) */}
        <section className="section" style={{ backgroundColor: '#F8F6F0', paddingBottom: '100px' }}>
          <h2 className="serif-title">마음 전하실 곳</h2>
          <p className="serif-text" style={{ marginBottom: '30px', color: '#666', fontSize: '14px' }}>
            참석이 어려우신 분들을 위해<br />
            계좌번호를 안내해 드립니다.<br />
            넓은 양해 부탁드립니다.
          </p>
          
          <div className="account-container">
            {/* 신랑 및 신랑측 부모님 계좌 & 연락처 */}
            <div className="account-box">
              {/* 신랑 계좌 */}
              <div className="account-person">
                <div className="account-header">
                  <div className="account-title-row">
                    <span className="account-tag groom-tag">신랑</span>
                    <strong className="account-name">{weddingData.groom.name}</strong>
                  </div>
                  <div 
                    className="phone-badge" 
                    onClick={() => handleCopyPhone(weddingData.groom.phone, 'groom')}
                    title="터치하여 전화번호 복사"
                  >
                    <span style={{ fontFamily: 'Pretendard, sans-serif', letterSpacing: '0.5px' }}>{weddingData.groom.phone}</span>
                    {copiedPhone === 'groom' ? (
                      <span className="copied-inline" style={{ marginLeft: '6px', color: 'var(--wedding-accent)', display: 'inline-flex', alignItems: 'center' }}>
                        <i className="fa-solid fa-check check-ani" style={{ fontSize: '14px' }}></i>
                      </span>
                    ) : (
                      <span className="copy-icon-btn" style={{ marginLeft: '6px' }}>
                        <i className="fa-regular fa-copy" style={{ fontSize: '14px' }}></i>
                      </span>
                    )}
                  </div>
                </div>
                <div className="account-details">
                  <div className="bank-info">
                    <span className="bank-name">{weddingData.groom.bank}</span>
                    <span className="account-num">{weddingData.groom.account}</span>
                  </div>
                  <button 
                    className="btn-copy-account"
                    onClick={() => handleCopyAccount(weddingData.groom.bank, weddingData.groom.account, 'groom')}
                  >
                    {copiedAccount === 'groom' ? (
                      <>
                        <i className="fa-solid fa-check" style={{ color: 'var(--wedding-accent)', marginRight: '5px' }}></i>
                        복사완료
                      </>
                    ) : (
                      <>
                        <i className="fa-regular fa-copy" style={{ marginRight: '5px' }}></i>
                        계좌복사
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 신랑측 부모님 계좌 */}
              {weddingData.groom.parents.map((parent, idx) => {
                const id = `groom_parent_${idx}`;
                return (
                  <div key={idx} className="account-person" style={{ paddingTop: '16px', borderTop: '1px dashed #EAE6DF' }}>
                    <div className="account-header">
                      <div className="account-title-row">
                        <span className="account-tag groom-tag">{parent.relation}</span>
                        <strong className="account-name">{parent.name}</strong>
                      </div>
                      <div 
                        className="phone-badge" 
                        onClick={() => handleCopyPhone(parent.phone, id)}
                        title="터치하여 전화번호 복사"
                      >
                        <span style={{ fontFamily: 'Pretendard, sans-serif', letterSpacing: '0.5px' }}>{parent.phone}</span>
                        {copiedPhone === id ? (
                          <span className="copied-inline" style={{ marginLeft: '6px', color: 'var(--wedding-accent)', display: 'inline-flex', alignItems: 'center' }}>
                            <i className="fa-solid fa-check check-ani" style={{ fontSize: '14px' }}></i>
                          </span>
                        ) : (
                          <span className="copy-icon-btn" style={{ marginLeft: '6px' }}>
                            <i className="fa-regular fa-copy" style={{ fontSize: '14px' }}></i>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="account-details">
                      <div className="bank-info">
                        <span className="bank-name">{parent.bank}</span>
                        <span className="account-num">{parent.account}</span>
                      </div>
                      <button 
                        className="btn-copy-account"
                        onClick={() => handleCopyAccount(parent.bank, parent.account, id)}
                      >
                        {copiedAccount === id ? (
                          <>
                            <i className="fa-solid fa-check" style={{ color: 'var(--wedding-accent)', marginRight: '5px' }}></i>
                            복사완료
                          </>
                        ) : (
                          <>
                            <i className="fa-regular fa-copy" style={{ marginRight: '5px' }}></i>
                            계좌복사
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 신부 및 신부측 부모님 계좌 & 연락처 */}
            <div className="account-box" style={{ marginTop: '20px' }}>
              {/* 신부 계좌 */}
              <div className="account-person">
                <div className="account-header">
                  <div className="account-title-row">
                    <span className="account-tag bride-tag">신부</span>
                    <strong className="account-name">{weddingData.bride.name}</strong>
                  </div>
                  <div 
                    className="phone-badge" 
                    onClick={() => handleCopyPhone(weddingData.bride.phone, 'bride')}
                    title="터치하여 전화번호 복사"
                  >
                    <span style={{ fontFamily: 'Pretendard, sans-serif', letterSpacing: '0.5px' }}>{weddingData.bride.phone}</span>
                    {copiedPhone === 'bride' ? (
                      <span className="copied-inline" style={{ marginLeft: '6px', color: 'var(--wedding-accent)', display: 'inline-flex', alignItems: 'center' }}>
                        <i className="fa-solid fa-check check-ani" style={{ fontSize: '14px' }}></i>
                      </span>
                    ) : (
                      <span className="copy-icon-btn" style={{ marginLeft: '6px' }}>
                        <i className="fa-regular fa-copy" style={{ fontSize: '14px' }}></i>
                      </span>
                    )}
                  </div>
                </div>
                <div className="account-details">
                  <div className="bank-info">
                    <span className="bank-name">{weddingData.bride.bank}</span>
                    <span className="account-num">{weddingData.bride.account}</span>
                  </div>
                  <button 
                    className="btn-copy-account"
                    onClick={() => handleCopyAccount(weddingData.bride.bank, weddingData.bride.account, 'bride')}
                  >
                    {copiedAccount === 'bride' ? (
                      <>
                        <i className="fa-solid fa-check" style={{ color: 'var(--wedding-accent)', marginRight: '5px' }}></i>
                        복사완료
                      </>
                    ) : (
                      <>
                        <i className="fa-regular fa-copy" style={{ marginRight: '5px' }}></i>
                        계좌복사
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* 신부측 부모님 계좌 */}
              {weddingData.bride.parents.map((parent, idx) => {
                const id = `bride_parent_${idx}`;
                return (
                  <div key={idx} className="account-person" style={{ paddingTop: '16px', borderTop: '1px dashed #EAE6DF' }}>
                    <div className="account-header">
                      <div className="account-title-row">
                        <span className="account-tag bride-tag">{parent.relation}</span>
                        <strong className="account-name">{parent.name}</strong>
                      </div>
                      <div 
                        className="phone-badge" 
                        onClick={() => handleCopyPhone(parent.phone, id)}
                        title="터치하여 전화번호 복사"
                      >
                        <span style={{ fontFamily: 'Pretendard, sans-serif', letterSpacing: '0.5px' }}>{parent.phone}</span>
                        {copiedPhone === id ? (
                          <span className="copied-inline" style={{ marginLeft: '6px', color: 'var(--wedding-accent)', display: 'inline-flex', alignItems: 'center' }}>
                            <i className="fa-solid fa-check check-ani" style={{ fontSize: '14px' }}></i>
                          </span>
                        ) : (
                          <span className="copy-icon-btn" style={{ marginLeft: '6px' }}>
                            <i className="fa-regular fa-copy" style={{ fontSize: '14px' }}></i>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="account-details">
                      <div className="bank-info">
                        <span className="bank-name">{parent.bank}</span>
                        <span className="account-num">{parent.account}</span>
                      </div>
                      <button 
                        className="btn-copy-account"
                        onClick={() => handleCopyAccount(parent.bank, parent.account, id)}
                      >
                        {copiedAccount === id ? (
                          <>
                            <i className="fa-solid fa-check" style={{ color: 'var(--wedding-accent)', marginRight: '5px' }}></i>
                            복사완료
                          </>
                        ) : (
                          <>
                            <i className="fa-regular fa-copy" style={{ marginRight: '5px' }}></i>
                            계좌복사
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 8. 청첩장 링크 공유 및 하단 푸터 */}
        <section className="section" style={{ backgroundColor: '#ECE8DF', padding: '60px 24px 70px', borderTop: '1px solid var(--car-border)' }}>
          <h2 className="serif-title" style={{ fontSize: '22px', marginBottom: '16px' }}>초대장 공유하기</h2>
          <p className="serif-text" style={{ fontSize: '13px', color: '#666', marginBottom: '28px', lineHeight: '1.6' }}>
            소중한 지인분들께 모바일 청첩장을<br />간편하게 공유해 보세요.
          </p>
          
          <div className="share-btn-container">
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button 
                className="btn-share btn-share-native"
                onClick={() => {
                  navigator.share({
                    title: '[결혼합니다] 박재훈 ♥ 박정은',
                    url: window.location.href,
                  }).catch(() => {});
                }}
              >
                <i className="fa-regular fa-paper-plane" style={{ marginRight: '8px', fontSize: '15px' }}></i>
                카카오톡·문자 공유하기
              </button>
            )}

            <button 
              className="btn-share btn-share-copy"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setIsLinkCopied(true);
                setTimeout(() => setIsLinkCopied(false), 3000);
              }}
            >
              {isLinkCopied ? (
                <>
                  <i className="fa-solid fa-check check-ani" style={{ color: 'var(--wedding-accent)', marginRight: '8px', fontSize: '15px' }}></i>
                  <span style={{ color: 'var(--wedding-text)', fontWeight: '700' }}>청첩장 주소 복사완료!</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-link" style={{ marginRight: '8px', fontSize: '15px' }}></i>
                  청첩장 링크 주소 복사
                </>
              )}
            </button>
          </div>
        </section>
      </main>
      </div>

      {/* 사진 크게 보기 모달 (100% 화면 꽉차는 풀스크린 & 옆 사진 실시간 미리보기 슬라이드 트랙) */}
      {selectedPhoto !== null && (
        <div 
          className="lightbox-overlay" 
          onClick={() => setSelectedPhoto(null)}
        >
          {/* 우상단 독립 닫기 버튼 */}
          <button 
            className="lightbox-close-btn"
            onMouseDown={(e) => e.stopPropagation()}
            onMouseUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhoto(null);
            }}
            aria-label="닫기"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          {/* 화면 전체를 품는 슬라이더 뷰포트 영역 */}
          <div 
            className="lightbox-slider-viewport"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => {
              touchStartXRef.current = e.targetTouches[0].clientX;
              touchEndXRef.current = null;
              setIsSlideTransitioning(false);
              if (sliderTrackRef.current) {
                sliderTrackRef.current.style.transition = 'none';
              }
            }}
            onTouchMove={(e) => {
              handleSwipeMove(e.targetTouches[0].clientX);
            }}
            onTouchEnd={handleSwipeEnd}
            onMouseDown={(e) => {
              touchStartXRef.current = e.clientX;
              touchEndXRef.current = null;
              setIsSlideTransitioning(false);
              if (sliderTrackRef.current) {
                sliderTrackRef.current.style.transition = 'none';
              }
            }}
            onMouseMove={(e) => {
              if (touchStartXRef.current !== null) {
                handleSwipeMove(e.clientX);
              }
            }}
            onMouseUp={handleSwipeEnd}
            onMouseLeave={() => {
              touchStartXRef.current = null;
              touchEndXRef.current = null;
              if (sliderTrackRef.current && selectedPhoto !== null) {
                setIsSlideTransitioning(true);
                sliderTrackRef.current.style.transform = `translate3d(-${selectedPhoto * 100}%, 0, 0)`;
                sliderTrackRef.current.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
              }
            }}
          >
            <div 
              ref={sliderTrackRef}
              className="lightbox-slider-track"
              onTransitionEnd={() => {
                if (selectedPhoto === 0) {
                  // 첫번째 클론(마지막 사진)에 도착하면 실제 마지막 사진(인덱스 8)으로 애니메이션 없이 순간 이동
                  setIsSlideTransitioning(false);
                  setSelectedPhoto(galleryPhotos.length);
                } else if (selectedPhoto === loopPhotos.length - 1) {
                  // 마지막 클론(첫번째 사진)에 도착하면 실제 첫번째 사진(인덱스 1)으로 애니메이션 없이 순간 이동
                  setIsSlideTransitioning(false);
                  setSelectedPhoto(1);
                }
              }}
              style={{
                transform: `translate3d(-${selectedPhoto * 100}%, 0, 0)`,
                transition: isSlideTransitioning ? 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
              }}
            >
              {loopPhotos.map((photoSrc, idx) => (
                <div key={idx} className="lightbox-slide">
                  <img 
                    src={photoSrc} 
                    alt={`웨딩 사진 ${idx}`} 
                    className="lightbox-img"
                  />
                </div>
              ))}
            </div>

            {/* 좌우 사이드 플로팅 전환 버튼 (사진 수직 중간 배치) */}
            <button 
              className="lightbox-side-btn lightbox-side-prev"
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (selectedPhoto !== null) {
                  setIsSlideTransitioning(true);
                  if (sliderTrackRef.current) {
                    sliderTrackRef.current.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
                  }
                  if (selectedPhoto === 0) {
                    setSelectedPhoto(galleryPhotos.length - 1);
                  } else {
                    setSelectedPhoto(selectedPhoto - 1);
                  }
                }
              }}
              aria-label="이전 사진"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button 
              className="lightbox-side-btn lightbox-side-next"
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (selectedPhoto !== null) {
                  setIsSlideTransitioning(true);
                  if (sliderTrackRef.current) {
                    sliderTrackRef.current.style.transition = 'transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
                  }
                  if (selectedPhoto === loopPhotos.length - 1) {
                    setSelectedPhoto(2);
                  } else {
                    setSelectedPhoto(selectedPhoto + 1);
                  }
                }
              }}
              aria-label="다음 사진"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
