import React, { useState, useEffect } from 'react';
import { weddingData } from './data';

export default function App() {
  const [dDay, setDDay] = useState<number>(0);

  // D-Day 실시간 계산 함수
  useEffect(() => {
    const targetDate = new Date(weddingData.date).getTime();
    const today = new Date().getTime();
    const diff = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
    setDDay(diff);
  }, []);

  // 계좌번호 복사 함수
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('계좌번호가 복사되었습니다.');
  };

  return (
    <div className="mobile-container">
      {/* 1. 커버 섹션 */}
      <section className="section">
        <p style={{ letterSpacing: '4px', fontSize: '12px', color: 'var(--accent-color)', marginBottom: '12px' }}>
          SAVE THE DATE
        </p>
        <h1 style={{ fontSize: '28px', fontWeight: 300, marginBottom: '16px' }}>
          {weddingData.groom.name} & {weddingData.bride.name}
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          {weddingData.dateDisplay}
        </p>
      </section>

      {/* 2. 초대글 */}
      <section className="section" style={{ backgroundColor: 'var(--secondary-bg)' }}>
        <h2 className="section-title">소중한 분들을 초대합니다</h2>
        <p style={{ fontSize: '14px', lineHeight: '1.8', color: 'var(--text-secondary)' }}>
          서로가 마주 보며 다진 약속을<br />
          함께 증명해 주시는 자리가 되었으면 합니다.<br /><br />
          평소 저희를 아껴주시는 모든 분들을 모시고<br />
          사랑의 결실을 맺고자 하오니<br />
          부디 오셔서 축복해 주시면 감사하겠습니다.
        </p>
      </section>

      {/* 3. D-Day 카운트다운 */}
      <section className="section">
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>결혼식까지 남은 시간</p>
        <div style={{ fontSize: '48px', color: 'var(--accent-color)', fontWeight: 600, margin: '10px 0' }}>
          D-{dDay > 0 ? dDay : 'Day'}
        </div>
      </section>

      {/* 4. 예식장 안내 */}
      <section className="section" style={{ backgroundColor: 'var(--secondary-bg)' }}>
        <h2 className="section-title">오시는 길</h2>
        <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{weddingData.location.name}</h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          {weddingData.location.address}
        </p>
        
        {/* 지도 영역 (이후 카카오맵 API 연결할 위치) */}
        <div style={{
          width: '100%',
          height: '200px',
          backgroundColor: '#e0e0e0',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666',
          marginBottom: '20px'
        }}>
          지도가 들어갈 영역입니다
        </div>
      </section>

      {/* 5. 마음 전하실 곳 */}
      <section className="section">
        <h2 className="section-title">마음 전하실 곳</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 신랑측 */}
          <div style={{ padding: '20px', background: 'var(--secondary-bg)', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '8px' }}>신랑측 계좌</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {weddingData.groom.bank} {weddingData.groom.account}<br />
              (예금주: {weddingData.groom.name})
            </p>
            <button 
              onClick={() => handleCopy(`${weddingData.groom.bank} ${weddingData.groom.account}`)}
              style={{
                marginTop: '12px',
                padding: '6px 16px',
                border: '1px solid var(--accent-color)',
                background: 'transparent',
                color: 'var(--accent-color)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              계좌번호 복사
            </button>
          </div>

          {/* 신부측 */}
          <div style={{ padding: '20px', background: 'var(--secondary-bg)', borderRadius: '8px' }}>
            <h4 style={{ marginBottom: '8px' }}>신부측 계좌</h4>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {weddingData.bride.bank} {weddingData.bride.account}<br />
              (예금주: {weddingData.bride.name})
            </p>
            <button 
              onClick={() => handleCopy(`${weddingData.bride.bank} ${weddingData.bride.account}`)}
              style={{
                marginTop: '12px',
                padding: '6px 16px',
                border: '1px solid var(--accent-color)',
                background: 'transparent',
                color: 'var(--accent-color)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              계좌번호 복사
            </button>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer style={{ padding: '40px 20px', textAlign: 'center', fontSize: '12px', color: '#aaa' }}>
        Copyright © 2026. All Rights Reserved.
      </footer>
    </div>
  );
}
