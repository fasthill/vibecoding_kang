# 퀴즈 게임 통계 관리

script.js와 questions.js를 읽고, 퀴즈 게임의 통계를 분석하거나 관리하세요.

## 인수 파싱

`$ARGUMENTS`를 확인하세요.

| 인수 | 동작 |
|------|------|
| (없음) | 전체 통계 요약 출력 |
| `category` | 카테고리별 정답률 상세 분석 |
| `difficulty` | 난이도별 정답률 상세 분석 |
| `trend` | 최근 10회 게임 추이 분석 |
| `reset` | 통계 초기화 방법 안내 |

작업 시작 전 첫 줄에 아래 형식으로 모드를 표시하세요.

```
통계 모드: [전체 요약 / 카테고리 분석 / 난이도 분석 / 추이 분석 / 초기화 안내]
```

---

## Step 1 — 데이터 구조 파악

script.js를 읽고 `LocalDataManager`의 구조와 localStorage 키를 확인하세요.

- localStorage 키: `quizGameHistory`
- 게임 결과 필드: `totalScore`, `timestamp`, `categoryScores`, `longestStreak`

questions.js를 읽고 카테고리 목록과 문제 수를 파악하세요.

현황을 아래 형식으로 출력하세요.

```
--- 데이터 구조 확인 ---
LocalDataManager 메서드 : (존재하는 주요 메서드 목록)
저장 키                 : quizGameHistory
게임 결과 필드          : totalScore, timestamp, categoryScores, longestStreak
questions.js 카테고리   : (카테고리1 N개, 카테고리2 N개, ...)
```

---

## Step 2 — 통계 분석 (모드별)

### 모드: 전체 요약 (인수 없음)

script.js의 `LocalDataManager` 메서드를 기반으로 통계 계산 로직을 설명하고, 실제 게임 플레이 시 확인할 수 있는 통계 항목을 안내하세요.

```
--- 전체 통계 항목 ---
총 플레이 횟수  : getPlayCount()로 계산
최고 점수      : getBestScore()로 계산
평균 점수      : getAverageScore()로 계산
최장 연속 정답 : getBestStreak()로 계산
카테고리 정답률 : getCategoryStats()로 계산
```

통계 확인 방법을 안내하세요.

```
--- 통계 확인 방법 ---
브라우저 콘솔에서 아래 명령어로 현재 통계를 확인할 수 있습니다.

const dm = new LocalDataManager();

// 전체 게임 기록
dm.getGameHistory();

// 핵심 통계
console.table({
  플레이횟수: dm.getPlayCount(),
  최고점수:   dm.getBestScore(),
  평균점수:   dm.getAverageScore(),
  최장연속:   dm.getBestStreak()
});

// 카테고리별 정답률
console.table(dm.getCategoryStats());
```

---

### 모드: 카테고리 분석 (`category`)

questions.js에서 카테고리별 문제 수를 집계하고, getCategoryStats() 반환 구조를 설명하세요.

```
--- 카테고리별 문제 현황 (questions.js 기준) ---
카테고리     | 전체 | easy | medium | hard
-------------|------|------|--------|-----
(카테고리1)  |  N개 |   N  |    N   |   N
(카테고리2)  |  N개 |   N  |    N   |   N
...

--- 카테고리 통계 확인 방법 ---
const dm = new LocalDataManager();
const stats = dm.getCategoryStats();
// stats 구조: { 카테고리명: { correct: N, total: N } }

Object.entries(stats).forEach(([cat, s]) => {
  const rate = s.total ? Math.round(s.correct / s.total * 100) : 0;
  console.log(`${cat}: ${s.correct}/${s.total} (${rate}%)`);
});
```

---

### 모드: 난이도 분석 (`difficulty`)

questions.js에서 전체 난이도 분포를 집계하고, 시각화하세요.

```
--- 난이도 분포 (questions.js 기준) ---
easy   : N개 (N%) | ■■■■■
medium : N개 (N%) | ■■■■■■■■■■
hard   : N개 (N%) | ■■■■■

--- 난이도별 정답률 확인 방법 ---
const dm = new LocalDataManager();
const history = dm.getGameHistory();

const diffStats = { easy: {c:0,t:0}, medium: {c:0,t:0}, hard: {c:0,t:0} };
history.forEach(game => {
  if (!game.difficultyScores) return;
  Object.entries(game.difficultyScores).forEach(([d, s]) => {
    diffStats[d].c += s.correct || 0;
    diffStats[d].t += s.total  || 0;
  });
});
console.table(diffStats);
```

---

### 모드: 추이 분석 (`trend`)

최근 게임 결과를 시계열로 확인하는 방법을 안내하세요.

```
--- 최근 게임 추이 확인 방법 ---
const dm = new LocalDataManager();
const recent = dm.getRecentGames(10);

recent.forEach((game, i) => {
  const date = new Date(game.timestamp).toLocaleDateString('ko-KR');
  console.log(`${i+1}회 | ${date} | 점수: ${game.totalScore} | 연속: ${game.longestStreak || 0}`);
});
```

---

### 모드: 초기화 안내 (`reset`)

통계 초기화 방법과 주의사항을 안내하세요.

```
--- 통계 초기화 안내 ---
⚠️  초기화하면 모든 게임 기록이 삭제됩니다. 복구할 수 없습니다.

초기화 방법 (브라우저 콘솔):
  const dm = new LocalDataManager();
  dm.clearHistory();  // localStorage에서 quizGameHistory 삭제

또는 직접 삭제:
  localStorage.removeItem('quizGameHistory');

초기화 확인:
  dm.getPlayCount();  // 0 반환되면 초기화 완료
```

---

## Step 3 — 개선 제안

script.js의 현재 통계 기능을 검토하고, 추가하면 유용한 통계 항목을 제안하세요.

```
--- 통계 기능 개선 제안 ---
현재 구현된 통계: (목록)

추가 권장 통계:
  1. 난이도별 정답률 (difficultyScores 필드 추가 필요)
  2. 문제별 오답률 (questionStats 필드 추가 필요)
  3. 세션별 소요 시간 (duration 필드 추가 필요)
  4. 카테고리별 최고 점수 추이

구현 위치: script.js > LocalDataManager > saveGameResult() 메서드에
           위 필드를 함께 저장하면 됩니다.
```
