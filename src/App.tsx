import { useState, useEffect, useRef } from 'react';
import './index.css';
import { weddingData } from './data';

declare global {
  interface Window {
    naver?: any;
  }
}

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [gear, setGear] = useState<'P' | 'R' | 'N' | 'D'>('P');
  
  // 네이버 지도 및 주소 복사 관련 상태
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
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
  
  // 이전 스크롤 위치와 타이머를 저장하기 위한 useRef
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);

      // 1. 스크롤 방향 감지하여 R 또는 D로 변경
      if (currentScroll > lastScrollY.current) {
        setGear('D'); // 화면을 내리면 Drive
      } else if (currentScroll < lastScrollY.current) {
        setGear('R'); // 화면을 올리면 Reverse
      }
      
      lastScrollY.current = currentScroll;

      // 2. 스크롤 멈춤 감지 (150ms 동안 추가 스크롤이 없으면 P로 변경)
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      scrollTimeout.current = setTimeout(() => {
        setGear('P');
      }, 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, []);

  // 스크롤 진행도에 따라 0km에서 페이지 끝 116km까지 증가 (결혼일 1월 16일 기념)
  const maxScroll = typeof document !== 'undefined'
    ? Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) - window.innerHeight
    : 0;
  const scrollProgress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
  const distance = Math.round(scrollProgress * 116);

  return (
    <div className="display-container">
      {/* 1. 인포테인먼트 상단 상태바 */}
      <header className="status-bar">
        <div className="status-left">
          <span className="speed-num">{distance}</span>
          <span className="speed-unit">km</span>
        </div>
        
        {/* 기어 표시 영역 (P R N D) */}
        <div className="status-center">
          <span className={gear === 'P' ? 'gear-active' : 'gear-inactive'}>P</span>
          <span className={gear === 'R' ? 'gear-active' : 'gear-inactive'}>R</span>
          <span className={gear === 'N' ? 'gear-active' : 'gear-inactive'}>N</span>
          <span className={gear === 'D' ? 'gear-active' : 'gear-inactive'}>D</span>
        </div>
        
        {/* 아이콘을 웨딩 반지(fa-ring)로 변경 */}
        <div className="status-right">
          <i className="fa-solid fa-ring" style={{ marginRight: '6px' }}></i>
          READY
        </div>
      </header>

      <main>
        {/* 2. 메인 커버 섹션 */}
        <section className="section">
          <div className="hero-wrapper">
            <span style={{ color: '#888' }}>웨딩카 메인 이미지 (아치형 프레임)</span>
          </div>
          <h1 className="serif-title" style={{ fontSize: '28px', marginBottom: '12px' }}>
            박재훈 <span style={{ color: 'var(--wedding-accent)', fontSize: '20px' }}>&</span> 박정은
          </h1>
          <p style={{ fontSize: '15px', color: '#777', letterSpacing: '1px', lineHeight: '1.6' }}>
            {weddingData.dateDisplay}<br/>
            <strong style={{ color: '#555' }}>{weddingData.location.name}</strong>
          </p>
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
            {/* 고급스러운 캘린더 헤더 */}
            <div className="calendar-header">
              <div className="cal-title-left">
                <span className="cal-year">2027</span>
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

                let numColor = 'var(--wedding-text)';
                if (isSunday) numColor = '#D97373';
                else if (isSaturday) numColor = '#7392B7';

                return (
                  <div key={date} className="cal-date">
                    {date === 16 ? (
                      <div className="cal-highlight">{date}</div>
                    ) : (
                      <span style={{ color: numColor, fontWeight: isSunday || isSaturday ? '500' : '400' }}>
                        {date}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. 웨딩 갤러리 */}
        <section className="section" style={{ backgroundColor: '#F8F6F0' }}>
          <h2 className="serif-title">우리의 순간들</h2>
          <div className="gallery-grid">
            <div className="photo">웨딩 사진 1 (가로형 메인)</div>
            <div className="photo">웨딩 사진 2</div>
            <div className="photo">웨딩 사진 3</div>
            <div className="photo">웨딩 사진 4</div>
            <div className="photo">웨딩 사진 5</div>
            <div className="photo">웨딩 사진 6</div>
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
                <span className="copy-icon-btn">
                  {isCopied ? (
                    <i className="fa-solid fa-check check-ani"></i>
                  ) : (
                    <i className="fa-regular fa-copy"></i>
                  )}
                </span>
                {isCopied && <span className="copied-toast">복사완료!</span>}
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
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. 마음 전하실 곳 */}
        <section className="section" style={{ backgroundColor: '#F8F6F0', paddingBottom: '100px' }}>
          <h2 className="serif-title">마음 전하실 곳</h2>
          <div style={{ width: '100%', backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid var(--car-border)' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid var(--car-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600' }}>신랑측 계좌번호</span>
              <i className="fa-solid fa-chevron-down" style={{ color: '#CCC' }}></i>
            </div>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600' }}>신부측 계좌번호</span>
              <i className="fa-solid fa-chevron-down" style={{ color: '#CCC' }}></i>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
