# 🌌 Astra — 인생 데이터 분석 서비스

생년월일시와 출생지를 입력하면 출생 차트(natal chart)를 계산하고,
AI가 당신의 인생 흐름을 7가지 렌즈로 분석해주는 웹 서비스입니다.

> "별의 위치로 읽는 나만의 인생 리포트"

🔗 **[astra-astrology-rust.vercel.app](https://astra-astrology-rust.vercel.app)**

---

## ✨ 주요 기능

| 섹션 | 설명 |
|------|------|
| ◉ 내 인생의 큰 파도 | 토성·천왕성 기준, 삶이 통째로 뒤집히는 시기 분석 |
| ◎ 나의 10년 인생 지도 | 목성 12년 사이클 기준, 10년 단위 에너지 흐름 |
| ✦ 내가 빛나는 자리 | 10하우스·중천 기준, 타고난 직업 재능과 맞는 환경 |
| ☁ 마음 일기예보 | 12하우스·토성 스퀘어 기준, 에너지가 낮아지는 패턴 |
| ◈ 차곡차곡 재물운 | 2·8하우스 기준, 2025~2030 연도별 금전 흐름 |
| ♥ 사랑이 머무는 계절 | 5·7하우스·금성 기준, 연도별 연애운 흐름 |
| ◷ 2026년 가이드 | 트랜짓 데이터 기준, 2026년 상·하반기 흐름 예측 |

---

## 🛠 기술 스택

### Frontend
| 기술 | 용도 |
|------|------|
| React 19 + Vite 5 | UI 프레임워크 |
| React Router v7 | 페이지 라우팅 |
| Framer Motion | 애니메이션 |
| Axios | API 통신 |
| Canvas API | 별자리 배경 (Star Map) |
| Google Fonts | Cormorant Garamond + Noto Sans KR |

### Backend
| 기술 | 용도 |
|------|------|
| Node.js + Express 5 | REST API 서버 |
| Swiss Ephemeris (WASM) | 행성 위치·출생 차트 계산 |
| Groq SDK (llama-3.3-70b) | AI 인생 분석 생성 |
| CORS | Vercel ↔ Render 크로스 오리진 처리 |

### 인프라
| | |
|--|--|
| **Frontend 배포** | Vercel |
| **Backend 배포** | Render |
| **소스 관리** | GitHub |

---

## 🏗 프로젝트 구조

```
astra-astrology/
├── index.js              # Express 앱 진입점
├── routes/
│   └── chart.js          # API 라우터
├── src/
│   ├── natalChart.js     # 출생 차트 계산 (Swiss Ephemeris)
│   ├── transit.js        # 트랜짓 계산
│   ├── claudeApi.js      # Groq API 호출 + 검증
│   └── prompts/
│       ├── fortune.js    # 인생 분석 프롬프트
│       └── utils.js      # 한국어 변환 유틸
└── client/               # React 프론트엔드
    └── src/
        ├── pages/
        │   ├── InputForm.jsx   # 생년월일 입력
        │   ├── Chart.jsx       # 출생 차트 시각화
        │   └── Analysis.jsx    # AI 분석 결과
        └── components/
            ├── StarBackground.jsx  # Canvas 별자리 배경
            └── ReportCard.jsx      # 로딩 애니메이션
```

---

## 🚀 로컬 실행

```bash
# 1. 저장소 클론
git clone https://github.com/hyeya418/astra-astrology.git
cd astra-astrology

# 2. 환경변수 설정
cp .env.example .env
# .env에 GROQ_API_KEY 입력

# 3. 백엔드 실행 (포트 3000)
npm install
npm run dev

# 4. 프론트엔드 실행 (포트 5173)
cd client
npm install
npm run dev
```

### 환경변수

```env
GROQ_API_KEY=your_groq_api_key
```

> Groq API 키는 [console.groq.com](https://console.groq.com) 에서 무료로 발급받을 수 있어요.

---

## 📡 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/chart/natal` | 출생 차트 계산 |
| POST | `/chart/analyze/fortune` | 인생 분석 (7섹션) |
| POST | `/chart/analyze/synastry` | 궁합 분석 |

---

## 🧠 AI 프롬프트 설계

- **Chain of Thought**: 7섹션을 작성하기 전 내부적으로 핵심 진단을 먼저 도출
- **전담 렌즈 시스템**: 각 섹션에 담당 행성/하우스와 금지 영역을 명시해 중복 방지
- **다중 검증**: 섹션 완성도 + 금지 표현 + 섹션 간 구절 중복을 validator로 자동 검사
- **한국어 정제**: 한자·영어가 섞인 응답을 자동으로 필터링

---

Made with ☕ and ✨
