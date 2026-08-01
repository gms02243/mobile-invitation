export const weddingData = {
  groom: {
    name: "박재훈",
    phone: "010-1234-5678",
    bank: "국민은행",
    account: "123-456-7890",
  },
  bride: {
    name: "박정은",
    phone: "010-9876-5432",
    bank: "신한은행",
    account: "987-654-3210",
  },
  date: "2027-01-16T12:30:00",
  dateDisplay: "2027년 1월 16일 토요일 낮 12시 30분",
  location: {
    name: "아펠가모 선릉 4층",
    building: "한신인터밸리24빌딩",
    address: "서울특별시 강남구 테헤란로 322",
    detailAddress: "한신인터밸리24빌딩 4층",
    tel: "02-564-0100",
    lat: 37.5031, // 아펠가모 선릉 위도
    lng: 127.0483, // 아펠가모 선릉 경도
    transport: [
      { type: "지하철", icon: "fa-train-subway", color: "#2B90D9", text: "2호선 및 수인분당선 선릉역 4번 출구 도보 1분 \n(IBK기업은행 지나 맥도날드 건물 4층)" },
      { type: "버스", icon: "fa-bus", color: "#56A662", text: "선릉역·한신인터밸리 정류장 하차 (간선/지선/광역 노선 다수)" },
      { type: "주차안내", icon: "fa-square-parking", color: "#E08031", text: "한신인터밸리24빌딩 지하주차장 이용 (하객 2시간 무료 주차 확인권 제공)" },
    ]
  },
  // 네이버 클라우드 플랫폼(NCP) Dynamic Map Client ID
  naverClientId: import.meta.env.VITE_NAVER_CLIENT_ID || "YOUR_NAVER_CLIENT_ID",
};