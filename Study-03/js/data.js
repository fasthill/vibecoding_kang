const QUIZ_DATA = [
  // ==================== 한국사 ====================
  {
    id: 1,
    category: "한국사",
    difficulty: "easy",
    question: "조선을 건국한 왕은?",
    options: ["이성계", "왕건", "이방원", "세종"],
    correctAnswer: 0,
    explanation: "이성계는 1392년 위화도 회군 이후 고려를 무너뜨리고 조선을 건국했습니다."
  },
  {
    id: 2,
    category: "한국사",
    difficulty: "easy",
    question: "한글을 창제한 조선의 왕은?",
    options: ["태종", "태조", "세종", "성종"],
    correctAnswer: 2,
    explanation: "세종대왕은 1443년 훈민정음(한글)을 창제하고 1446년 반포했습니다."
  },
  {
    id: 3,
    category: "한국사",
    difficulty: "medium",
    question: "임진왜란이 시작된 연도는?",
    options: ["1582년", "1592년", "1602년", "1612년"],
    correctAnswer: 1,
    explanation: "임진왜란은 1592년 일본의 도요토미 히데요시가 조선을 침략하며 시작되었습니다."
  },
  {
    id: 4,
    category: "한국사",
    difficulty: "medium",
    question: "3·1 운동이 일어난 연도는?",
    options: ["1917년", "1918년", "1919년", "1920년"],
    correctAnswer: 2,
    explanation: "3·1 운동은 1919년 3월 1일 일제 강점기에 일어난 독립운동입니다."
  },
  {
    id: 5,
    category: "한국사",
    difficulty: "medium",
    question: "고려를 건국한 인물은?",
    options: ["궁예", "왕건", "견훤", "김부식"],
    correctAnswer: 1,
    explanation: "왕건은 918년 고려를 건국하고 936년 후삼국을 통일했습니다."
  },
  {
    id: 6,
    category: "한국사",
    difficulty: "hard",
    question: "조선시대 과거 시험 중 문관을 뽑는 시험은?",
    options: ["무과", "잡과", "소과", "문과(대과)"],
    correctAnswer: 3,
    explanation: "문과(대과)는 조선시대 문관을 선발하는 최고 과거 시험으로, 합격자는 관직에 나아갈 수 있었습니다."
  },
  {
    id: 7,
    category: "한국사",
    difficulty: "hard",
    question: "신라의 삼국통일을 완성한 왕은?",
    options: ["태종 무열왕", "문무왕", "신문왕", "경덕왕"],
    correctAnswer: 1,
    explanation: "문무왕은 676년 당나라 세력을 몰아내고 삼국통일을 완성했습니다."
  },
  {
    id: 8,
    category: "한국사",
    difficulty: "easy",
    question: "대한민국 임시정부가 수립된 도시는?",
    options: ["베이징", "상하이", "충칭", "도쿄"],
    correctAnswer: 1,
    explanation: "대한민국 임시정부는 1919년 4월 11일 중국 상하이에서 수립되었습니다."
  },
  {
    id: 9,
    category: "한국사",
    difficulty: "medium",
    question: "6·25 전쟁이 발발한 연도는?",
    options: ["1948년", "1949년", "1950년", "1951년"],
    correctAnswer: 2,
    explanation: "6·25 전쟁(한국전쟁)은 1950년 6월 25일 북한의 남침으로 시작되었습니다."
  },
  {
    id: 10,
    category: "한국사",
    difficulty: "hard",
    question: "조선 후기 실학자로 '목민심서'를 저술한 인물은?",
    options: ["이익", "박지원", "정약용", "홍대용"],
    correctAnswer: 2,
    explanation: "정약용(다산)은 조선 후기 대표적인 실학자로 목민심서, 경세유표 등 수많은 저서를 남겼습니다."
  },

  // ==================== 세계사 ====================
  {
    id: 11,
    category: "세계사",
    difficulty: "easy",
    question: "프랑스 혁명이 시작된 연도는?",
    options: ["1776년", "1789년", "1799년", "1815년"],
    correctAnswer: 1,
    explanation: "프랑스 혁명은 1789년 바스티유 감옥 습격 사건을 기점으로 시작되었습니다."
  },
  {
    id: 12,
    category: "세계사",
    difficulty: "easy",
    question: "제1차 세계대전이 시작된 계기가 된 사건은?",
    options: ["히틀러 집권", "사라예보 사건", "러시아 혁명", "베르사유 조약"],
    correctAnswer: 1,
    explanation: "1914년 사라예보에서 오스트리아 황태자 프란츠 페르디난트가 암살된 사건이 제1차 세계대전의 직접적 계기가 되었습니다."
  },
  {
    id: 13,
    category: "세계사",
    difficulty: "medium",
    question: "로마를 건국했다고 전해지는 인물은?",
    options: ["카이사르", "아우구스투스", "로물루스", "레무스"],
    correctAnswer: 2,
    explanation: "로마는 기원전 753년 로물루스에 의해 건국되었다고 전해집니다."
  },
  {
    id: 14,
    category: "세계사",
    difficulty: "medium",
    question: "중국 최초의 통일 왕조를 세운 황제는?",
    options: ["한고조", "진시황", "당태종", "한무제"],
    correctAnswer: 1,
    explanation: "진시황(영정)은 기원전 221년 중국을 최초로 통일하고 황제 칭호를 사용했습니다."
  },
  {
    id: 15,
    category: "세계사",
    difficulty: "easy",
    question: "미국 독립선언서가 채택된 연도는?",
    options: ["1774년", "1775년", "1776년", "1777년"],
    correctAnswer: 2,
    explanation: "미국 독립선언서는 1776년 7월 4일 대륙회의에서 채택되었습니다."
  },
  {
    id: 16,
    category: "세계사",
    difficulty: "hard",
    question: "오스만 제국의 수도로 이스탄불의 이전 이름은?",
    options: ["아테네", "콘스탄티노플", "앙카라", "알렉산드리아"],
    correctAnswer: 1,
    explanation: "이스탄불은 로마 제국 시대 콘스탄티노플로 불렸으며, 1453년 오스만 제국이 정복한 후 수도가 되었습니다."
  },
  {
    id: 17,
    category: "세계사",
    difficulty: "medium",
    question: "제2차 세계대전을 종식시킨 원폭이 투하된 일본 도시 두 곳은?",
    options: ["도쿄, 오사카", "히로시마, 나가사키", "교토, 나고야", "요코하마, 고베"],
    correctAnswer: 1,
    explanation: "1945년 8월 6일 히로시마, 8월 9일 나가사키에 원자폭탄이 투하되었습니다."
  },
  {
    id: 18,
    category: "세계사",
    difficulty: "hard",
    question: "마그나카르타(대헌장)가 서명된 연도는?",
    options: ["1066년", "1215년", "1265년", "1348년"],
    correctAnswer: 1,
    explanation: "마그나카르타는 1215년 영국 존 왕이 귀족들의 압력으로 서명한 문서로, 왕권을 제한하는 내용을 담고 있습니다."
  },
  {
    id: 19,
    category: "세계사",
    difficulty: "medium",
    question: "인류 역사상 최대 영토를 지배한 제국은?",
    options: ["로마 제국", "몽골 제국", "대영 제국", "오스만 제국"],
    correctAnswer: 1,
    explanation: "몽골 제국은 13~14세기에 약 3,300만 km²의 영토를 지배하며 역사상 가장 넓은 연속 영토를 가진 제국이었습니다."
  },
  {
    id: 20,
    category: "세계사",
    difficulty: "hard",
    question: "베를린 장벽이 무너진 연도는?",
    options: ["1987년", "1988년", "1989년", "1990년"],
    correctAnswer: 2,
    explanation: "베를린 장벽은 1989년 11월 9일 무너졌으며, 이는 냉전 종식의 상징적인 사건이었습니다."
  },

  // ==================== 과학 ====================
  {
    id: 21,
    category: "과학",
    difficulty: "easy",
    question: "물의 화학식은?",
    options: ["CO2", "H2O", "NaCl", "O2"],
    correctAnswer: 1,
    explanation: "물(H2O)은 수소 2개와 산소 1개로 이루어진 화합물입니다."
  },
  {
    id: 22,
    category: "과학",
    difficulty: "easy",
    question: "태양계에서 가장 큰 행성은?",
    options: ["토성", "천왕성", "목성", "해왕성"],
    correctAnswer: 2,
    explanation: "목성은 태양계에서 가장 큰 행성으로, 질량이 다른 모든 행성을 합친 것의 2배 이상입니다."
  },
  {
    id: 23,
    category: "과학",
    difficulty: "medium",
    question: "빛의 속도는 약 초속 몇 km인가?",
    options: ["약 30만 km", "약 3만 km", "약 300만 km", "약 3천 km"],
    correctAnswer: 0,
    explanation: "빛의 속도는 진공에서 약 초속 30만 km(약 299,792,458 m/s)입니다."
  },
  {
    id: 24,
    category: "과학",
    difficulty: "medium",
    question: "인체에서 가장 큰 기관(장기)은?",
    options: ["간", "폐", "피부", "뇌"],
    correctAnswer: 2,
    explanation: "피부는 인체에서 가장 큰 기관으로, 성인 기준 약 1.5~2m²의 면적을 차지합니다."
  },
  {
    id: 25,
    category: "과학",
    difficulty: "easy",
    question: "원소 주기율표를 만든 과학자는?",
    options: ["뉴턴", "아인슈타인", "멘델레예프", "다윈"],
    correctAnswer: 2,
    explanation: "드미트리 멘델레예프는 1869년 원소를 원자량 순서로 배열한 주기율표를 만들었습니다."
  },
  {
    id: 26,
    category: "과학",
    difficulty: "hard",
    question: "DNA의 이중나선 구조를 발견한 과학자들은?",
    options: ["파스퇴르와 코흐", "왓슨과 크릭", "퀴리 부부", "다윈과 월리스"],
    correctAnswer: 1,
    explanation: "제임스 왓슨과 프랜시스 크릭은 1953년 DNA의 이중나선 구조를 발견하고 네이처지에 발표했습니다."
  },
  {
    id: 27,
    category: "과학",
    difficulty: "medium",
    question: "지구의 자전 주기는?",
    options: ["약 12시간", "약 24시간", "약 365일", "약 30일"],
    correctAnswer: 1,
    explanation: "지구는 약 24시간(정확히는 약 23시간 56분)을 주기로 자전합니다."
  },
  {
    id: 28,
    category: "과학",
    difficulty: "hard",
    question: "상대성 이론을 발표한 과학자는?",
    options: ["막스 플랑크", "닐스 보어", "알베르트 아인슈타인", "베르너 하이젠베르크"],
    correctAnswer: 2,
    explanation: "알베르트 아인슈타인은 1905년 특수상대성이론, 1915년 일반상대성이론을 발표했습니다."
  },
  {
    id: 29,
    category: "과학",
    difficulty: "medium",
    question: "소금의 화학명은?",
    options: ["탄산나트륨", "수산화나트륨", "염화나트륨", "질산나트륨"],
    correctAnswer: 2,
    explanation: "소금(식염)의 화학명은 염화나트륨(NaCl)으로, 나트륨(Na)과 염소(Cl)로 이루어진 이온 결합 화합물입니다."
  },
  {
    id: 30,
    category: "과학",
    difficulty: "hard",
    question: "인체의 혈액형 분류 중 ABO식 혈액형에서 만능 공혈자(모든 혈액형에게 수혈 가능)는?",
    options: ["A형", "B형", "AB형", "O형"],
    correctAnswer: 3,
    explanation: "O형은 적혈구 표면에 항원이 없어 모든 혈액형에 수혈이 가능한 만능 공혈자입니다."
  },

  // ==================== 상식 ====================
  {
    id: 31,
    category: "상식",
    difficulty: "easy",
    question: "올림픽은 몇 년마다 열리는가?",
    options: ["2년", "3년", "4년", "5년"],
    correctAnswer: 2,
    explanation: "하계 올림픽과 동계 올림픽은 각각 4년마다 개최됩니다."
  },
  {
    id: 32,
    category: "상식",
    difficulty: "easy",
    question: "세계에서 가장 높은 산은?",
    options: ["K2", "에베레스트", "킬리만자로", "마터호른"],
    correctAnswer: 1,
    explanation: "에베레스트(해발 8,849m)는 히말라야 산맥에 위치한 세계 최고봉입니다."
  },
  {
    id: 33,
    category: "상식",
    difficulty: "medium",
    question: "세계에서 가장 넓은 나라는?",
    options: ["캐나다", "미국", "중국", "러시아"],
    correctAnswer: 3,
    explanation: "러시아는 약 1,710만 km²의 면적으로 세계에서 가장 넓은 나라입니다."
  },
  {
    id: 34,
    category: "상식",
    difficulty: "easy",
    question: "빛의 삼원색이 아닌 것은?",
    options: ["빨강(Red)", "초록(Green)", "파랑(Blue)", "노랑(Yellow)"],
    correctAnswer: 3,
    explanation: "빛의 삼원색은 빨강(R), 초록(G), 파랑(B)입니다. 노랑은 색의 삼원색(CMYK)에서 사용됩니다."
  },
  {
    id: 35,
    category: "상식",
    difficulty: "medium",
    question: "셰익스피어의 4대 비극이 아닌 것은?",
    options: ["햄릿", "오셀로", "로미오와 줄리엣", "리어왕"],
    correctAnswer: 2,
    explanation: "셰익스피어의 4대 비극은 햄릿, 오셀로, 맥베스, 리어왕입니다. 로미오와 줄리엣은 별개의 작품입니다."
  },
  {
    id: 36,
    category: "상식",
    difficulty: "medium",
    question: "음악에서 '도레미파솔라시' 계이름을 만든 사람은?",
    options: ["바흐", "모차르트", "귀도 다레초", "베토벤"],
    correctAnswer: 2,
    explanation: "11세기 이탈리아 수도사 귀도 다레초(Guido d'Arezzo)가 음계 이름 체계를 만들었습니다."
  },
  {
    id: 37,
    category: "상식",
    difficulty: "hard",
    question: "노벨상을 수여하는 스웨덴 기관이 아닌 것은?",
    options: ["스웨덴 왕립과학원", "스웨덴 한림원", "카롤린스카 연구소", "노르웨이 노벨위원회"],
    correctAnswer: 3,
    explanation: "노벨 평화상만 노르웨이 오슬로에서 수여됩니다. 나머지 상은 스웨덴 기관에서 수여합니다."
  },
  {
    id: 38,
    category: "상식",
    difficulty: "medium",
    question: "지구에서 달까지의 평균 거리는 약 얼마인가?",
    options: ["약 38만 km", "약 150만 km", "약 3.8만 km", "약 1억 km"],
    correctAnswer: 0,
    explanation: "지구에서 달까지의 평균 거리는 약 38만 4,400km입니다."
  },
  {
    id: 39,
    category: "상식",
    difficulty: "easy",
    question: "1년은 몇 초인가? (윤년 제외)",
    options: ["약 1,000만 초", "약 3,000만 초", "약 3,153만 초", "약 5,000만 초"],
    correctAnswer: 2,
    explanation: "1년(365일)은 365 × 24 × 60 × 60 = 31,536,000초 ≈ 약 3,153만 초입니다."
  },
  {
    id: 40,
    category: "상식",
    difficulty: "hard",
    question: "모나리자를 그린 화가는 누구인가?",
    options: ["미켈란젤로", "라파엘로", "레오나르도 다빈치", "보티첼리"],
    correctAnswer: 2,
    explanation: "모나리자는 이탈리아 르네상스 거장 레오나르도 다빈치가 1503~1519년 사이에 그린 작품입니다."
  }
];
