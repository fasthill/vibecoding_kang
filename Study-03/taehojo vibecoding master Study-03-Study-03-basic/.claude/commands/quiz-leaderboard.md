# 퀴즈 순위 시스템 관리

script.js와 questions.js를 읽고, 퀴즈 게임의 순위(리더보드) 시스템을 분석하거나 관리하세요.

## 인수 파싱

`$ARGUMENTS`를 확인하세요.

| 인수 | 동작 |
|------|------|
| (없음) | 전체 기간 TOP 10 순위 출력 및 분석 |
| `daily` | 오늘의 순위 분석 |
| `weekly` | 이번 주 순위 분석 |
| `category [카테고리명]` | 특정 카테고리 특화 순위 분석 |
| `audit` | 리더보드 시스템 코드 검토 및 개선 제안 |

작업 시작 전 첫 줄에 아래 형식으로 모드를 표시하세요.

```
리더보드 모드: [전체 순위 / 일간 순위 / 주간 순위 / 카테고리 순위 / 시스템 감사]
```

---

## Step 1 — 리더보드 구조 파악

script.js를 읽고 `LocalDataManager.getLeaderboard()` 구현을 확인하세요.

- 지원 타입: `allTime`, `daily`, `weekly`
- 정렬 기준: `totalScore` 내림차순
- 반환 개수: 상위 10개

구조를 아래 형식으로 출력하세요.

```
--- 리더보드 구조 확인 ---
getLeaderboard 타입 : allTime / daily / weekly
정렬 기준          : totalScore 내림차순
반환 개수          : 10개
저장 키            : quizGameHistory (localStorage)
게임 결과 필드     : totalScore, timestamp, categoryScores, longestStreak
```

---

## Step 2 — 순위 확인 (모드별)

### 모드: 전체 순위 / 일간 순위 / 주간 순위

해당 기간의 순위를 조회하는 브라우저 콘솔 명령과 출력 예시를 제공하세요.

```
--- [전체 / 오늘 / 이번 주] TOP 10 순위 확인 방법 ---

브라우저 콘솔에서 실행:

const dm = new LocalDataManager();
const board = dm.getLeaderboard('allTime');  // 또는 'daily', 'weekly'

console.log('순위 | 점수 | 연속 | 날짜');
board.forEach((entry, i) => {
  const date = new Date(entry.timestamp).toLocaleDateString('ko-KR');
  const streak = entry.longestStreak || 0;
  console.log(`${i+1}위  | ${entry.totalScore}점 | ${streak}연속 | ${date}`);
});
```

예상 출력 형식:

```
순위 | 점수  | 연속 | 날짜
-----|-------|------|----------
 1위 | 850점 |  7연속 | 2026.4.16
 2위 | 720점 |  5연속 | 2026.4.15
 3위 | 680점 |  4연속 | 2026.4.14
...
```

---

### 모드: 카테고리 순위 (`category [카테고리명]`)

`$ARGUMENTS`에서 카테고리명을 추출하고, 해당 카테고리 특화 순위 분석을 안내하세요.

```
--- [카테고리명] 특화 순위 확인 방법 ---

브라우저 콘솔에서 실행:

const dm = new LocalDataManager();
const history = dm.getGameHistory();
const target = '(카테고리명)';

// 해당 카테고리 점수 기준 정렬
const ranked = history
  .filter(g => g.categoryScores && g.categoryScores[target])
  .map(g => ({
    score:     g.categoryScores[target].correct || 0,
    total:     g.categoryScores[target].total   || 0,
    rate:      g.categoryScores[target].total
               ? Math.round(g.categoryScores[target].correct / g.categoryScores[target].total * 100)
               : 0,
    timestamp: g.timestamp
  }))
  .sort((a, b) => b.score - a.score || b.rate - a.rate)
  .slice(0, 10);

console.log(`[${target}] 카테고리 TOP 10`);
ranked.forEach((r, i) => {
  const date = new Date(r.timestamp).toLocaleDateString('ko-KR');
  console.log(`${i+1}위 | ${r.score}/${r.total} (${r.rate}%) | ${date}`);
});
```

---

### 모드: 시스템 감사 (`audit`)

script.js의 리더보드 관련 코드를 검토하고 품질을 평가하세요.

#### 검토 항목

**[1] 동점 처리 로직**
- 동점 시 추가 기준(연속 정답, 시간 등)이 있는가?
- 현재: `totalScore` 단일 기준 → 동점 시 순서 불정확

**[2] 기간 필터 정확성**
- `daily`: `toDateString()` 비교 — 타임존 영향 없는가?
- `weekly`: `7 * 24 * 60 * 60 * 1000` ms 계산 — 정확한가?

**[3] 데이터 무결성**
- `totalScore` 필드가 없는 기록이 있을 경우 정렬 오류 가능성은?
- `timestamp` 파싱 실패 시 예외 처리가 있는가?

**[4] 확장성**
- 기록이 많아질 경우 `slice(0, 10)` 전에 전체 정렬하는 비효율 존재?

검토 결과를 아래 형식으로 출력하세요.

```
--- 리더보드 시스템 감사 결과 ---
[1] 동점 처리  : ✅ 처리됨 / ⚠️ 미처리 (설명)
[2] 기간 필터  : ✅ 정확 / ⚠️ 개선 필요 (설명)
[3] 무결성     : ✅ 안전 / ⚠️ 취약점 있음 (설명)
[4] 확장성     : ✅ 충분 / ⚠️ 개선 권장 (설명)

개선 권고:
  우선순위 1: (설명 및 수정 예시)
  우선순위 2: (설명 및 수정 예시)
```

---

## Step 3 — 순위 시스템 개선 제안

현재 리더보드 시스템을 분석하고, 추가하면 유용한 기능을 제안하세요.

```
--- 순위 시스템 개선 제안 ---

현재 구현:
  ✅ allTime / daily / weekly 타입 지원
  ✅ totalScore 기준 TOP 10 정렬
  ✅ LocalDataManager로 통합 관리

추가 권장 기능:

  1. 동점 처리 개선
     정렬 기준: totalScore → longestStreak → timestamp (최신)
     수정 위치: script.js > getLeaderboard()
     코드 예시:
       .sort((a, b) =>
         b.totalScore - a.totalScore ||
         (b.longestStreak || 0) - (a.longestStreak || 0) ||
         new Date(b.timestamp) - new Date(a.timestamp)
       )

  2. 카테고리별 리더보드 타입 추가
     수정 위치: script.js > getLeaderboard(type, category)

  3. 순위 변동 표시 (이전 순위 대비 ▲▼)
     저장 위치: 각 게임 결과에 prevRank 필드 추가

  4. 리더보드 내보내기
     기능: JSON 파일로 다운로드
     활용: 기록 백업, 공유
```

---

## Step 4 — 최종 요약

```
--- 리더보드 관리 요약 ---
모드           : [실행된 모드]
확인 기간      : [전체 / 오늘 / 이번 주 / 카테고리]
시스템 상태    : ✅ 정상 / ⚠️ 개선 권고
주요 개선 사항 : N건
```
