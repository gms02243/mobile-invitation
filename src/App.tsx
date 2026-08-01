import { useState, useEffect, useRef } from 'react';
import './index.css';
import { weddingData } from './data';
import weddingCarImg from './assets/wedding-car.jpg';

declare global {
  interface Window {
    naver?: any;
  }
}

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [gear, setGear] = useState<'P' | 'R' | 'N' | 'D'>('P');
  
  // 네이버 지도 및 주소/계좌/연락처 복사 관련 상태
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const initMap = () => {
      if (window.naver && window.naver.maps && mapContainerRef.current) {
        try {
          const { lat, lng, name } = weddingData.location;
          const center = new window.naver.maps.LatLng(lat, lng);
          const map = new window.naver.maps.Map(mapContainerRef.current, {
            center: center,
            zoom: 16,
            zoomControl: false,
          });
          new window.naver.maps.Marker({
            position: center,
            map: map,
            title: name,
          });
          setIsMapLoaded(true);
        } catch (err) {
          console.error("네이버 지도 초기화 오류:", err);
          setMapError(true);
        }
      }
    };

    if (window.naver && window.naver.maps) {
      initMap();
      return;
    }

    const clientId = weddingData.naverClientId;
    if (!clientId || clientId === "YOUR_NAVER_CLIENT_ID") {
      setMapError(true);
      return;
    }

    const scriptId = "naver-map-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
      script.async = true;
      script.onload = () => {
        initMap();
      };
      script.onerror = () => {
        setMapError(true);
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", initMap);
    }
  }, []);
  
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
            <img src={weddingCarImg} alt="빈티지 웨딩카 메인 아치" className="hero-img" />
          </div>
          
          <h1 className="serif-title" style={{ fontSize: '27px', marginBottom: '20px' }}>
            박재훈 <span style={{ color: 'var(--wedding-accent)', fontSize: '20px', margin: '0 4px' }}>&</span> 박정은
          </h1>

          {/* 부모님 성함 안내 (각 줄 사이 및 하단 간격 충분히 띄움) */}
          <div style={{ fontFamily: "'Nanum Myeongjo', serif", fontSize: '14px', color: '#555', marginBottom: '26px', textAlign: 'center' }}>
            <div style={{ marginBottom: '9px' }}>
              <span style={{ color: '#666' }}>박헌기 · 최미애</span>
              <span style={{ fontSize: '13px', color: '#888', margin: '0 6px' }}>의 아들</span>
              <strong style={{ color: 'var(--wedding-text)', fontWeight: '700' }}>재훈</strong>
            </div>
            <div>
              <span style={{ color: '#666' }}>박남규 · 김현숙</span>
              <span style={{ fontSize: '13px', color: '#888', margin: '0 6px' }}>의 딸</span>
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

        {/* 5. 웨딩 갤러리 (가로형 메인 없이 총 4개의 웨딩 사진 배치) */}
        <section className="section" style={{ backgroundColor: '#F8F6F0' }}>
          <h2 className="serif-title">우리의 순간들</h2>
          <div className="gallery-grid">
            <div className="photo">웨딩 사진 1</div>
            <div className="photo">웨딩 사진 2</div>
            <div className="photo">웨딩 사진 3</div>
            <div className="photo">웨딩 사진 4</div>
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

            {/* 네이버 지도 영역 */}
            <div className="navi-map-wrapper">
              <div ref={mapContainerRef} id="naver-map" className="map-view">
                {(!isMapLoaded || mapError) && (
                  <div className="map-fallback">
                    <div className="fallback-icon">
                      <i className="fa-solid fa-map-location-dot"></i>
                    </div>
                    <strong>아펠가모 선릉 (Pin 위치 설정됨)</strong>
                    <p>
                      실시간 네이버 지도를 표시하시려면<br />
                      <b>src/data.ts</b>의 <code>naverClientId</code>에<br />
                      발급받으신 NCP Client ID를 입력해 주세요.
                    </p>
                  </div>
                )}
              </div>
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
            {/* 신랑측 계좌 & 연락처 */}
            <div className="account-box">
              <div className="account-header">
                <div className="account-title-row">
                  <span className="account-tag groom-tag">신랑측</span>
                  <strong className="account-name">{weddingData.groom.name}</strong>
                </div>
                <div 
                  className="phone-badge" 
                  onClick={() => {
                    navigator.clipboard.writeText(weddingData.groom.phone);
                    setCopiedPhone('groom');
                    setTimeout(() => setCopiedPhone(null), 2500);
                  }}
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
                  onClick={() => {
                    navigator.clipboard.writeText(`${weddingData.groom.bank} ${weddingData.groom.account}`);
                    setCopiedAccount('groom');
                    setTimeout(() => setCopiedAccount(null), 2500);
                  }}
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

            {/* 신부측 계좌 & 연락처 */}
            <div className="account-box" style={{ marginTop: '16px' }}>
              <div className="account-header">
                <div className="account-title-row">
                  <span className="account-tag bride-tag">신부측</span>
                  <strong className="account-name">{weddingData.bride.name}</strong>
                </div>
                <div 
                  className="phone-badge" 
                  onClick={() => {
                    navigator.clipboard.writeText(weddingData.bride.phone);
                    setCopiedPhone('bride');
                    setTimeout(() => setCopiedPhone(null), 2500);
                  }}
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
                  onClick={() => {
                    navigator.clipboard.writeText(`${weddingData.bride.bank} ${weddingData.bride.account}`);
                    setCopiedAccount('bride');
                    setTimeout(() => setCopiedAccount(null), 2500);
                  }}
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
          </div>
        </section>
      </main>
    </div>
  );
}
