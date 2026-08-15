export const weddingData = {
  groom: {
    name: "박재훈",
    phone: "010-2303-2946",
    bank: "우리은행",
    account: "1002-160-766706",
    parents: [
      {
        relation: "아버지",
        name: "박헌기",
        phone: "010-2329-2946",
        bank: "신한은행",
        account: "818-04-290015",
      },
      {
        relation: "어머니",
        name: "최미애",
        phone: "010-8459-2946",
        bank: "농협은행",
        account: "778-02-446031",
      },
    ],
  },
  bride: {
    name: "박정은",
    phone: "010-7465-9165",
    bank: "신한은행",
    account: "110-389-295651",
    parents: [
      {
        relation: "아버지",
        name: "박남규",
        phone: "010-5201-2590",
        bank: "신한은행",
        account: "110-041-590227",
      },
      {
        relation: "어머니",
        name: "김현숙",
        phone: "010-6397-3264",
        bank: "신한은행",
        account: "110-086-068723",
      },
    ],
  },
  date: "2027-01-16T14:00:00",
  dateDisplay: "2027년 1월 16일 토요일, 오후 14시 00분",
  location: {
    name: "아펠가모 선릉 4층",
    building: "한신인터밸리24빌딩",
    address: "서울특별시 강남구 테헤란로 322",
    detailAddress: "한신인터밸리24빌딩 4층",
    tel: "02-564-0100",
    lat: 37.5031, // 아펠가모 선릉 위도
    lng: 127.0483, // 아펠가모 선릉 경도
    mapUrl: "https://map.naver.com/p/entry/place/868917441?c=19.25,0,0,0,dh&placePath=%2Fhome%3Ffrom%3Dmap%26fromPanelNum%3D1%26additionalHeight%3D76%26timestamp%3D202608151341%26locale%3Dko%26svcName%3Dmap_pcv5",
    transport: [
      { type: "지하철", icon: "fa-train-subway", color: "#2B90D9", text: "2호선 및 수인분당선 선릉역 4번 출구 도보 1분\n(IBK기업은행 지나 맥도날드 건물 4층)" },
      { type: "버스", icon: "fa-bus", color: "#56A662", text: "선릉역·한신인터밸리 정류장 하차\n(간선 / 지선 / 광역 / 직행 노선 다수 운행)" },
      { type: "주차안내", icon: "fa-square-parking", color: "#E08031", text: "한신인터밸리24빌딩 지하주차장 이용\n(하객 2시간 무료 주차 확인권 제공)" },
    ]
  }
};