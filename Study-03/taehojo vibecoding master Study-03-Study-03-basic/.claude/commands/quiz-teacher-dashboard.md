# 선생님 통합 대시보드

선생님 모드의 모든 분석을 순서대로 실행하여 클래스 전체 현황을 한 번에 파악합니다.
각 단계는 이전 단계의 성공 여부와 무관하게 가능한 범위에서 계속 실행합니다.
단, 데이터 자체가 없으면 전체를 중단하고 등록 안내를 출력합니다.

---

## 실행 헤더

```
╔══════════════════════════════════════════╗
║       퀴즈 선생님 대시보드               ║
║       실행 일시: YYYY-MM-DD              ║
╚══════════════════════════════════════════╝
```

---

## 인수 파싱

`$ARGUMENTS`를 확인하세요.

| 인수 | 동작 |
|------|------|
| (없음) | 전체 5단계 순서대로 실행 |
| `scores` | PHASE 2만 실행 (랭킹) |
| `weak` | PHASE 3만 실행 (취약점) |
| `compare` | PHASE 4만 실행 (비교) |
| `report {이름}` | PHASE 5만 실행 (개인 리포트) |
| `summary` | PHASE 1 + PHASE 2만 실행 |

---

## 사전 검사 — students/ 디렉토리 확인

`students/` 디렉토리와 그 안의 JSON 파일 존재 여부를 확인하세요.

**데이터가 전혀 없는 경우 전체 중단:**
```
╔══════════════════════════════════════════╗
║  ⚠️  등록된 학생 데이터가 없습니다       ║
╚══════════════════════════════════════════╝

먼저 학생과 점수를 등록하세요:

  /quiz-teacher-register [학생명] [점수] [정답/총문제] [모드]

예시:
  /quiz-teacher-register 김민준 85 7/10 full
  /quiz-teacher-register 이수아 120 9/10 speed
  /quiz-teacher-register 박지호 72 6/10 category 한국사
```

**데이터가 있으면** 계속 진행하고 아래를 출력하세요:
```
  사전 검사 완료
  등록 학생: N명 | 점수 보유: N명 | 총 게임 기록: N회
  ─────────────────────────────────────────────────
```

---

## PHASE 1 — 클래스 현황 스냅샷

`students/` 내 모든 JSON 파일을 읽어 기본 현황을 요약하세요.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHASE 1 / 5 — 클래스 현황 스냅샷
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  등록 학생 수     : N명
  점수 기록 있는 학생: N명
  총 게임 횟수     : N회
  클래스 최고 점수 : N점 ({이름}, YYYY-MM-DD)
  클래스 평균 점수 : N.N점
  클래스 평균 정답률: N.N%

  학생 목록
  ┌──────┬──────────────┬──────┬─────────┬───────────┐
  │ 번호 │ 학생명       │ 기록 │ 최고점  │ 최근 플레이│
  ├──────┼──────────────┼──────┼─────────┼───────────┤
  │  1   │ (이름)       │ N회  │  N점    │ YYYY-MM-DD│
  │  2   │ (이름)       │ N회  │  N점    │ YYYY-MM-DD│
  │  ...                                              │
  └──────┴──────────────┴──────┴─────────┴───────────┘
```

PHASE 1 완료 후: `  ✅ PHASE 1 완료`

---

## PHASE 2 — 점수 랭킹

모든 학생을 최고 점수 기준 내림차순으로 정렬하여 순위표를 출력하세요.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHASE 2 / 5 — 점수 랭킹 (최고 점수 기준)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  순위  학생명       최고점   평균점  정답률  연속  플레이
  ─────────────────────────────────────────────────────
  🥇 1  (이름)       N점      N.N점  N.N%   N회   N회
  🥈 2  (이름)       N점      N.N점  N.N%   N회   N회
  🥉 3  (이름)       N점      N.N점  N.N%   N회   N회
     4  (이름)       N점      N.N점  N.N%   N회   N회
    ...
```

PHASE 2 완료 후: `  ✅ PHASE 2 완료`

---

## PHASE 3 — 취약 영역 클래스 분석

전체 학생의 카테고리별 평균 정답률을 계산하고 취약 영역을 찾으세요.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHASE 3 / 5 — 취약 영역 클래스 분석
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  카테고리별 클래스 평균 정답률
  ┌──────────────┬─────────┬──────────────────────┬──────┐
  │ 카테고리     │ 평균    │ 시각화               │ 판정 │
  ├──────────────┼─────────┼──────────────────────┼──────┤
  │ 한국사       │ N.N%    │ [████████████░░░░░░] │ 양호 │
  │ 세계지리     │ N.N%    │ [████████░░░░░░░░░░] │ 주의 │
  │ 과학         │ N.N%    │ [████░░░░░░░░░░░░░░] │ 취약 │
  │ 예술과 문화  │ N.N%    │ [██████████████████] │ 양호 │
  └──────────────┴─────────┴──────────────────────┴──────┘

  학생별 취약 카테고리 매트릭스
  ┌──────────────┬──────────┬──────────┬────────────┬──────────────┐
  │ 학생명       │ 한국사   │ 세계지리 │ 과학       │ 예술과 문화  │
  ├──────────────┼──────────┼──────────┼────────────┼──────────────┤
  │ (이름)       │ ✅ N.N%  │ ⚠️ N.N%  │ ❌ N.N%    │ ✅ N.N%      │
  └──────────────┴──────────┴──────────┴────────────┴──────────────┘
  (✅ 양호 70%↑  ⚠️ 주의 50~70%  ❌ 취약 50%↓)

  클래스 보충 학습 권장 우선순위:
    1순위: {카테고리명} — N명 취약
    2순위: {카테고리명} — N명 취약
```

PHASE 3 완료 후: `  ✅ PHASE 3 완료`

---

## PHASE 4 — 학생 간 비교 (상위 vs 하위)

점수 기준 상위 학생과 하위 학생을 비교하여 격차를 분석하세요.
(학생이 2명 미만이면 이 PHASE는 건너뜁니다)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHASE 4 / 5 — 학생 간 비교 (상위 ↔ 하위)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  비교 대상: 상위 학생 {이름} vs 하위 학생 {이름}
  (3명 이상인 경우 중간 학생도 포함)

  항목            │ {상위 이름} │ {중간 이름} │ {하위 이름}
  ────────────────┼─────────────┼─────────────┼─────────────
  최고 점수       │   N점 ★     │   N점       │   N점
  평균 정답률     │   N.N% ★    │   N.N%      │   N.N%
  최장 연속       │   N회 ★     │   N회       │   N회
  강점 카테고리   │ {카테고리}  │ {카테고리}  │ {카테고리}
  약점 카테고리   │ {카테고리}  │ {카테고리}  │ {카테고리}

  점수 격차 분석:
    최고 ↔ 최하 점수 차: N점
    평균 정답률 차: N.N%p
    격차 평가: [격차 큼 / 고른 분포 / 양호]
```

PHASE 4 완료 후: `  ✅ PHASE 4 완료`  
건너뜀: `  ⏭️ PHASE 4 건너뜀 — 비교 대상 학생 부족`

---

## PHASE 5 — 개인 리포트 요약 (전체 학생)

각 학생의 핵심 지표를 1줄로 요약하세요.
(개별 상세 리포트는 `/quiz-teacher-report {학생명}` 명령어로 확인 가능)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PHASE 5 / 5 — 학생별 1줄 요약
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [{이름1}]  최고 N점 | 평균 N.N점 | 정답률 N.N% | 강점: {카테고리} | 약점: {카테고리}
  [{이름2}]  최고 N점 | 평균 N.N점 | 정답률 N.N% | 강점: {카테고리} | 약점: {카테고리}
  ...
  [미기록학생] 점수 기록 없음 — /quiz-teacher-register {이름} 로 입력 필요
```

PHASE 5 완료 후: `  ✅ PHASE 5 완료`

---

## PHASE 6 — HTML 리포트 저장

PHASE 1~5에서 수집한 모든 데이터를 하나의 HTML 파일로 저장하세요.

**저장 경로**: `teacher-dashboard-YYYYMMDD.html`  
**절대 경로**: `C:\Users\ict\PycharmProjects\VibeCoding\Study-03\taehojo vibecoding master Study-03-Study-03-basic\teacher-dashboard-YYYYMMDD.html`  
**파일명 예시**: `teacher-dashboard-20260416.html`  
> `index.html`, `questions.js`, `style.css`와 동일한 폴더에 저장됩니다.

### HTML 파일 구조

아래 전체 HTML 템플릿을 실제 데이터로 채워서 파일로 저장하세요.
`{{변수}}` 형태의 플레이스홀더를 실제 값으로 모두 교체해야 합니다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>퀴즈 선생님 대시보드 — {{DATE}}</title>
  <style>
    :root {
      --primary: #667eea;
      --secondary: #764ba2;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --bg: #f8f9ff;
      --card: #ffffff;
      --text: #1f2937;
      --text-sub: #6b7280;
      --border: #e5e7eb;
      --radius: 16px;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      min-height: 100vh;
      padding: 24px 16px;
    }
    .wrapper { max-width: 960px; margin: 0 auto; }

    /* 헤더 */
    .header {
      text-align: center;
      color: #fff;
      margin-bottom: 28px;
    }
    .header h1 { font-size: 2rem; font-weight: 800; letter-spacing: -0.5px; }
    .header p  { margin-top: 6px; opacity: 0.85; font-size: 0.95rem; }

    /* 카드 공통 */
    .card {
      background: var(--card);
      border-radius: var(--radius);
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10);
    }
    .card-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text);
      margin-bottom: 16px;
      padding-bottom: 10px;
      border-bottom: 2px solid var(--border);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-title .badge {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: #fff;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 20px;
    }

    /* 요약 통계 그리드 */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 12px;
    }
    .stat-box {
      background: var(--bg);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    .stat-box .value {
      font-size: 1.6rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .stat-box .label {
      font-size: 0.78rem;
      color: var(--text-sub);
      margin-top: 4px;
    }

    /* 랭킹 테이블 */
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th {
      background: var(--bg);
      padding: 10px 12px;
      text-align: left;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-sub);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    td { padding: 12px; border-bottom: 1px solid var(--border); color: var(--text); }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #faf9ff; }
    .rank-medal { font-size: 1.2rem; }
    .rank-num { color: var(--text-sub); font-weight: 600; font-size: 0.85rem; }
    .student-name { font-weight: 700; }
    .score-val { font-weight: 700; color: var(--primary); }

    /* 카테고리 바 */
    .cat-row { margin-bottom: 14px; }
    .cat-row:last-child { margin-bottom: 0; }
    .cat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .cat-name { font-weight: 600; font-size: 0.9rem; color: var(--text); }
    .cat-meta { font-size: 0.82rem; color: var(--text-sub); }
    .bar-track {
      height: 10px;
      background: var(--border);
      border-radius: 99px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      border-radius: 99px;
      transition: width 0.6s ease;
    }
    .bar-good    { background: linear-gradient(90deg, #10b981, #34d399); }
    .bar-warning { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
    .bar-danger  { background: linear-gradient(90deg, #ef4444, #f87171); }
    .judge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 700;
    }
    .judge-good    { background: #d1fae5; color: #065f46; }
    .judge-warning { background: #fef3c7; color: #92400e; }
    .judge-danger  { background: #fee2e2; color: #991b1b; }

    /* 취약 매트릭스 */
    .matrix-table th, .matrix-table td {
      text-align: center;
      padding: 10px 8px;
    }
    .matrix-table td:first-child { text-align: left; font-weight: 600; }
    .cell-good    { color: #059669; font-weight: 600; }
    .cell-warning { color: #d97706; font-weight: 600; }
    .cell-danger  { color: #dc2626; font-weight: 600; }
    .cell-none    { color: var(--text-sub); }

    /* 비교 테이블 */
    .compare-winner { color: var(--primary); font-weight: 700; }
    .compare-winner::after { content: " ★"; font-size: 0.8em; }

    /* 개인 요약 리스트 */
    .student-summary {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      padding: 14px;
      border-radius: 12px;
      background: var(--bg);
      margin-bottom: 10px;
    }
    .student-summary:last-child { margin-bottom: 0; }
    .stu-name {
      font-weight: 700;
      font-size: 1rem;
      color: var(--text);
      min-width: 80px;
    }
    .stu-tag {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 0.78rem;
      font-weight: 600;
    }
    .tag-score  { background: #ede9fe; color: #5b21b6; }
    .tag-acc    { background: #d1fae5; color: #065f46; }
    .tag-strong { background: #fef3c7; color: #92400e; }
    .tag-weak   { background: #fee2e2; color: #991b1b; }
    .tag-none   { background: var(--border); color: var(--text-sub); }

    /* 푸터 */
    .footer {
      text-align: center;
      color: rgba(255,255,255,0.7);
      font-size: 0.8rem;
      margin-top: 16px;
      padding-bottom: 8px;
    }

    /* 반응형 */
    @media (max-width: 600px) {
      .header h1 { font-size: 1.4rem; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      table { font-size: 0.8rem; }
      th, td { padding: 8px 6px; }
    }
  </style>
</head>
<body>
<div class="wrapper">

  <!-- 헤더 -->
  <div class="header">
    <h1>퀴즈 선생님 대시보드</h1>
    <p>기준 일시: {{DATE}} &nbsp;|&nbsp; 등록 학생: {{STUDENT_COUNT}}명 &nbsp;|&nbsp; 총 게임: {{TOTAL_GAMES}}회</p>
  </div>

  <!-- PHASE 1: 클래스 요약 통계 -->
  <div class="card">
    <div class="card-title">
      <span>클래스 현황 스냅샷</span>
      <span class="badge">PHASE 1</span>
    </div>
    <div class="stats-grid">
      <div class="stat-box">
        <div class="value">{{STUDENT_COUNT}}</div>
        <div class="label">등록 학생</div>
      </div>
      <div class="stat-box">
        <div class="value">{{TOTAL_GAMES}}</div>
        <div class="label">총 게임 횟수</div>
      </div>
      <div class="stat-box">
        <div class="value">{{CLASS_BEST_SCORE}}</div>
        <div class="label">클래스 최고점</div>
      </div>
      <div class="stat-box">
        <div class="value">{{CLASS_AVG_SCORE}}</div>
        <div class="label">클래스 평균점</div>
      </div>
      <div class="stat-box">
        <div class="value">{{CLASS_AVG_ACC}}%</div>
        <div class="label">평균 정답률</div>
      </div>
    </div>
  </div>

  <!-- PHASE 2: 점수 랭킹 -->
  <div class="card">
    <div class="card-title">
      <span>점수 랭킹</span>
      <span class="badge">PHASE 2</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>순위</th>
          <th>학생명</th>
          <th>최고점</th>
          <th>평균점</th>
          <th>정답률</th>
          <th>연속</th>
          <th>플레이</th>
        </tr>
      </thead>
      <tbody>
        <!-- 아래 <tr> 블록을 학생 수만큼 반복하세요 -->
        <!-- 1위: <td>🥇</td>, 2위: <td>🥈</td>, 3위: <td>🥉</td>, 4위~: <td class="rank-num">N위</td> -->
        {{RANKING_ROWS}}
        <!--
          행 예시:
          <tr>
            <td><span class="rank-medal">🥇</span></td>
            <td class="student-name">김민준</td>
            <td class="score-val">120점</td>
            <td>98.0점</td>
            <td>90.0%</td>
            <td>8회</td>
            <td>3회</td>
          </tr>
        -->
      </tbody>
    </table>
  </div>

  <!-- PHASE 3: 취약 영역 분석 -->
  <div class="card">
    <div class="card-title">
      <span>취약 영역 클래스 분석</span>
      <span class="badge">PHASE 3</span>
    </div>

    <!-- 카테고리별 클래스 평균 정답률 바 -->
    <!-- 아래 .cat-row 블록을 카테고리 수만큼 반복하세요 -->
    <!-- bar-fill 클래스: 70%↑ → bar-good, 50~70% → bar-warning, 50%↓ → bar-danger -->
    <!-- judge 클래스: judge-good / judge-warning / judge-danger -->
    {{CATEGORY_BARS}}
    <!--
      블록 예시:
      <div class="cat-row">
        <div class="cat-header">
          <span class="cat-name">한국사</span>
          <span class="cat-meta">N.N% <span class="judge judge-good">양호</span></span>
        </div>
        <div class="bar-track">
          <div class="bar-fill bar-good" style="width: N.N%"></div>
        </div>
      </div>
    -->

    <!-- 학생별 취약 매트릭스 -->
    <table class="matrix-table" style="margin-top: 20px;">
      <thead>
        <tr>
          <th style="text-align:left">학생명</th>
          <th>한국사</th>
          <th>세계지리</th>
          <th>과학</th>
          <th>예술과 문화</th>
        </tr>
      </thead>
      <tbody>
        <!-- 아래 <tr> 블록을 학생 수만큼 반복하세요 -->
        <!-- cell 클래스: cell-good(✅ 70%↑) / cell-warning(⚠️ 50~70%) / cell-danger(❌ 50%↓) / cell-none(-) -->
        {{MATRIX_ROWS}}
        <!--
          행 예시:
          <tr>
            <td>김민준</td>
            <td class="cell-good">✅ 80%</td>
            <td class="cell-warning">⚠️ 60%</td>
            <td class="cell-danger">❌ 40%</td>
            <td class="cell-good">✅ 75%</td>
          </tr>
        -->
      </tbody>
    </table>
    <p style="font-size:0.78rem; color:#6b7280; margin-top:10px;">
      ✅ 양호(70%↑) &nbsp; ⚠️ 주의(50~70%) &nbsp; ❌ 취약(50%↓) &nbsp; — 데이터 없음
    </p>
  </div>

  <!-- PHASE 4: 학생 간 비교 -->
  <div class="card">
    <div class="card-title">
      <span>학생 간 비교 (상위 ↔ 하위)</span>
      <span class="badge">PHASE 4</span>
    </div>
    <table>
      <thead>
        <tr>
          <th>항목</th>
          {{COMPARE_HEADERS}}
          <!-- 예시: <th>김민준(1위)</th><th>이수아(2위)</th><th>박지호(최하위)</th> -->
        </tr>
      </thead>
      <tbody>
        {{COMPARE_ROWS}}
        <!--
          행 예시 (최고값인 셀에 compare-winner 클래스):
          <tr>
            <td>최고 점수</td>
            <td class="compare-winner">120점</td>
            <td>98점</td>
            <td>72점</td>
          </tr>
          <tr>
            <td>평균 정답률</td>
            <td class="compare-winner">90.0%</td>
            <td>78.0%</td>
            <td>65.0%</td>
          </tr>
          <tr>
            <td>최장 연속</td>
            <td class="compare-winner">8회</td>
            <td>5회</td>
            <td>3회</td>
          </tr>
          <tr>
            <td>강점 카테고리</td>
            <td>한국사</td>
            <td>세계지리</td>
            <td>과학</td>
          </tr>
          <tr>
            <td>약점 카테고리</td>
            <td>예술과 문화</td>
            <td>한국사</td>
            <td>세계지리</td>
          </tr>
        -->
      </tbody>
    </table>
    <!-- 학생이 1명 이하면 이 카드 전체를 아래로 교체하세요: -->
    <!-- <p style="color:#6b7280; text-align:center; padding: 20px 0;">비교할 학생이 2명 이상이어야 합니다.</p> -->
  </div>

  <!-- PHASE 5: 학생별 1줄 요약 -->
  <div class="card">
    <div class="card-title">
      <span>학생별 1줄 요약</span>
      <span class="badge">PHASE 5</span>
    </div>
    {{STUDENT_SUMMARIES}}
    <!--
      블록 예시:
      <div class="student-summary">
        <span class="stu-name">김민준</span>
        <span class="stu-tag tag-score">최고 120점</span>
        <span class="stu-tag tag-acc">정답률 90.0%</span>
        <span class="stu-tag tag-strong">강점: 한국사</span>
        <span class="stu-tag tag-weak">약점: 예술과 문화</span>
      </div>
      점수 없는 학생:
      <div class="student-summary">
        <span class="stu-name">홍길동</span>
        <span class="stu-tag tag-none">점수 기록 없음</span>
      </div>
    -->
  </div>

</div><!-- /.wrapper -->

<div class="footer">
  퀴즈 선생님 대시보드 &nbsp;|&nbsp; 생성 일시: {{DATE}} &nbsp;|&nbsp; VibeCoding Study-03
</div>

</body>
</html>
```

### 플레이스홀더 치환 규칙

| 플레이스홀더 | 치환 내용 |
|-------------|-----------|
| `{{DATE}}` | 오늘 날짜 `YYYY-MM-DD` |
| `{{STUDENT_COUNT}}` | 등록 학생 수 |
| `{{TOTAL_GAMES}}` | 총 게임 기록 수 |
| `{{CLASS_BEST_SCORE}}` | 클래스 최고 점수 (숫자만) |
| `{{CLASS_AVG_SCORE}}` | 클래스 평균 점수 (소수점 1자리) |
| `{{CLASS_AVG_ACC}}` | 클래스 평균 정답률 (소수점 1자리) |
| `{{RANKING_ROWS}}` | PHASE 2 랭킹 `<tr>` 행 목록 |
| `{{CATEGORY_BARS}}` | PHASE 3 카테고리 `.cat-row` 블록 목록 |
| `{{MATRIX_ROWS}}` | PHASE 3 취약 매트릭스 `<tr>` 행 목록 |
| `{{COMPARE_HEADERS}}` | PHASE 4 비교 헤더 `<th>` 목록 |
| `{{COMPARE_ROWS}}` | PHASE 4 비교 `<tr>` 행 목록 |
| `{{STUDENT_SUMMARIES}}` | PHASE 5 `.student-summary` 블록 목록 |

### 저장 및 검증

1. 위 HTML을 실제 데이터로 치환한 뒤 `teacher-dashboard-YYYYMMDD.html`로 저장하세요.
2. 저장 후 파일 크기(바이트)가 1000 이상인지 확인하세요.
3. `</html>` 태그가 파일 마지막에 존재하는지 확인하세요.

```
[PHASE 6] ✅ HTML 리포트 저장 완료

  파일명  : teacher-dashboard-YYYYMMDD.html
  저장 위치: C:\Users\ict\PycharmProjects\VibeCoding\Study-03\taehojo vibecoding master Study-03-Study-03-basic\
  파일 크기: N KB
  열기 방법: 파일 탐색기에서 더블클릭 또는 브라우저로 드래그
```

실패 시:
```
[PHASE 6] ❌ HTML 저장 실패
  원인: (오류 내용)
  조치: 디렉토리 쓰기 권한을 확인하세요.
```

---

## 최종 요약 보고서

```
╔══════════════════════════════════════════╗
║       선생님 대시보드 — 최종 요약        ║
║       기준 일시: YYYY-MM-DD              ║
╠══════════════════════════════════════════╣
║                                          ║
║  단계별 실행 결과                        ║
║  PHASE 1 클래스 스냅샷    : ✅           ║
║  PHASE 2 점수 랭킹        : ✅           ║
║  PHASE 3 취약 영역 분석   : ✅           ║
║  PHASE 4 학생 간 비교     : ✅ / ⏭️     ║
║  PHASE 5 개인 요약        : ✅           ║
║  PHASE 6 HTML 리포트 저장 : ✅           ║
║                                          ║
║  클래스 현황                             ║
║  등록 학생: N명  총 게임: N회            ║
║  평균 점수: N.N점  평균 정답률: N.N%     ║
║                                          ║
║  오늘의 클래스 이슈                      ║
║  ⚠️ 취약 카테고리: {카테고리명}          ║
║  ⚠️ 미기록 학생: {이름} 외 N명          ║
║                                          ║
╠══════════════════════════════════════════╣
║  다음 단계 추천 명령어                   ║
║                                          ║
║  점수 더 보기:                           ║
║    /quiz-teacher-scores accuracy         ║
║                                          ║
║  취약 학생 집중 분석:                    ║
║    /quiz-teacher-weak {학생명}           ║
║                                          ║
║  개인 상세 리포트:                       ║
║    /quiz-teacher-report {학생명}         ║
║                                          ║
║  학생 비교:                              ║
║    /quiz-teacher-compare {이름1} {이름2} ║
║                                          ║
║  새 점수 입력:                           ║
║    /quiz-teacher-register {이름} [점수]  ║
╚══════════════════════════════════════════╝
```
