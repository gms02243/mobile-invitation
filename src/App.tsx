import { useState, useEffect } from 'react';
import './index.css';

export default function App() {
  const [scrollY, setScrollY] = useState(0);
  const [gear, setGear] = useState<'P' | 'D'>('P');

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);
      setGear(currentScroll > 50 ? 'D' : 'P');
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 1월 16일을 상징하는 1.16km에서 시작
  const distance = (1.16 + scrollY / 10000).toFixed(2);

  return (
    <div className="display-container">
      {/* 1. 인포테인먼트 상단 상태바 */}
      <header className="status-bar">
        <div className="status-left">
          <span className="speed-num">{distance}</span>
          <span className="speed-unit">km</span>
        </div>
        <div className="status-center">
          <span className={gear === 'P' ? 'gear-active' : 'gear-inactive'}>P</span>
          <span className={gear === 'D' ? 'gear-active' : 'gear-inactive'}>D</span>
        </div>
        <div className="status-right">
          <i className="fa-solid fa-leaf" style={{ marginRight: '4px' }}></i>
          READY
        </div>
      </header>

      <main>
        {/* 2. 메인 커버 섹션 */}
        <section className="section">
          <div className="hero-wrapper">
            {/* 청첩장_앞면-2.png 웨딩카 이미지를 여기에 배치 */}
            <span style={{ color: '#888' }}>웨딩카 메인 이미지 (아치형 프레임)</span>
          </div>
          <h1 className="serif-title" style={{ fontSize: '28px', marginBottom: '12px' }}>
            가상신랑 <span style={{ color: 'var(--wedding-accent)', fontSize: '20px' }}>&</span> 가상신부
          </h1>
          <p style={{ fontSize: '15px', color: '#777', letterSpacing: '1px' }}>
            2027년 1월 16일 토요일 낮 12시 30분<br/>
            서울 웨딩 컨벤션 2층 그랜드홀
          </p>
        </section>

        {/* 3. 인사말 섹션 (청첩장 감성 추가) */}
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
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>2027. 01</div>
            <div className="calendar-grid">
              {/* 요일 헤더 */}
              {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                <div key={day} className="cal-day">{day}</div>
              ))}
              {/* 날짜 더미 데이터 (1월 16일 강조) */}
              {Array.from({ length: 31 }, (_, i) => i + 1).map(date => (
                <div key={date} className="cal-date">
                  {date === 16 ? (
                    <div className="cal-highlight">{date}</div>
                  ) : (
                    date
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. 웨딩 갤러리 (차량 디스플레이 앨범 컨셉 + 부드러운 UI) */}
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

        {/* 6. 오시는 길 (내비게이션 컨셉 융합) */}
        <section className="section">
          <h2 className="serif-title">오시는 길</h2>
          <div className="navi-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
              <i className="fa-solid fa-location-dot" style={{ color: 'var(--wedding-accent)', fontSize: '20px' }}></i>
              <span style={{ fontSize: '16px', fontWeight: '600' }}>목적지가 설정되었습니다</span>
            </div>
            
            <div style={{ padding: '20px', backgroundColor: '#F9F8F6', borderRadius: '12px', marginBottom: '20px' }}>
              <strong style={{ fontSize: '18px', display: 'block', marginBottom: '8px' }}>서울 웨딩 컨벤션</strong>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                서울특별시 강남구 테헤란로 123<br/>
                지하철 2호선 역삼역 3번 출구 도보 5분
              </p>
            </div>

            {/* 지도 영역 (청첩장_뒷면.png 이미지 또는 카카오맵 삽입) */}
            <div style={{ width: '100%', height: '200px', backgroundColor: '#EAE6DF', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
              내비게이션 지도 영역
            </div>
          </div>
        </section>

        {/* 7. 마음 전하실 곳 (차량 설정 메뉴 리스트 형태) */}
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
