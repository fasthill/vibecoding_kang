// ========================================
// 로컬 데이터 관리자
// ========================================
class LocalDataManager {
  saveGameResult(result) {
    const history = this.getGameHistory();
    history.push({ ...result, timestamp: new Date().toISOString() });
    try {
      localStorage.setItem('quizGameHistory', JSON.stringify(history));
    } catch (e) {
      console.warn('저장 실패:', e);
    }
  }

  getGameHistory() {
    try {
      return JSON.parse(localStorage.getItem('quizGameHistory') || '[]');
    } catch {
      return [];
    }
  }

  getBestScore() {
    const history = this.getGameHistory();
    if (!history.length) return 0;
    return Math.max(...history.map(h => h.totalScore));
  }

  getPlayCount() {
    return this.getGameHistory().length;
  }

  getAverageScore() {
    const history = this.getGameHistory();
    if (!history.length) return 0;
    return Math.round(history.reduce((a, h) => a + h.totalScore, 0) / history.length);
  }

  getBestStreak() {
    const history = this.getGameHistory();
    if (!history.length) return 0;
    return Math.max(...history.map(h => h.longestStreak || 0));
  }

  getCategoryStats() {
    const stats = {};
    this.getGameHistory().forEach(game => {
      if (!game.categoryScores) return;
      Object.entries(game.categoryScores).forEach(([cat, s]) => {
        if (!stats[cat]) stats[cat] = { correct: 0, total: 0 };
        stats[cat].correct += s.correct || 0;
        stats[cat].total  += s.total  || 0;
      });
    });
    return stats;
  }

  getLeaderboard(type = 'allTime') {
    const now     = new Date();
    let filtered  = this.getGameHistory();
    if (type === 'daily') {
      const today = now.toDateString();
      filtered = filtered.filter(h => new Date(h.timestamp).toDateString() === today);
    } else if (type === 'weekly') {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(h => new Date(h.timestamp) >= weekAgo);
    }
    return filtered.sort((a, b) => b.totalScore - a.totalScore).slice(0, 10);
  }

  getRecentGames(count = 10) {
    return this.getGameHistory()
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, count);
  }

  clearHistory() {
    localStorage.removeItem('quizGameHistory');
  }
}

const localDataManager = new LocalDataManager();

// ========================================
// 점수 관리자
// ========================================
class ScoreManager {
  constructor() {
    this.scoreLog = [];
  }

  getConsecutiveBonus(consecutiveCorrect) {
    if (consecutiveCorrect >= 10) return 5;
    if (consecutiveCorrect >= 7)  return 3;
    if (consecutiveCorrect >= 5)  return 2;
    if (consecutiveCorrect >= 3)  return 1;
    return 0;
  }

  calculateScore(isCorrect, timeSpent, consecutiveCorrect, hintUsed) {
    let score = 0;
    const breakdown = { base: 0, timeBonus: 0, noHintBonus: 0, comboBonus: 0 };

    if (isCorrect) {
      score += 10;
      breakdown.base = 10;

      if (timeSpent < 10) {
        score += 3;
        breakdown.timeBonus = 3;
      }

      if (!hintUsed) {
        score += 2;
        breakdown.noHintBonus = 2;
      }

      const comboBonus = this.getConsecutiveBonus(consecutiveCorrect);
      score += comboBonus;
      breakdown.comboBonus = comboBonus;
    }

    this.scoreLog.push({ score, breakdown, isCorrect, timeSpent });
    return { score, breakdown };
  }

  reset() {
    this.scoreLog = [];
  }
}

// ========================================
// 타이머 관리자
// ========================================
class TimerManager {
  constructor(onTick, onTimeout) {
    this.onTick = onTick;
    this.onTimeout = onTimeout;
    this.interval = null;
    this.elapsed = 0;
    this.limit = null;
  }

  start(limit = null) {
    this.limit = limit;
    this.interval = setInterval(() => {
      this.elapsed++;
      this.onTick(this.elapsed, this.limit);
      if (this.limit && this.elapsed >= this.limit) {
        this.stop();
        this.onTimeout();
      }
    }, 1000);
  }

  pause() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  resume() {
    if (!this.interval) {
      this.start(this.limit);
    }
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  reset() {
    this.stop();
    this.elapsed = 0;
  }

  getElapsed() {
    return this.elapsed;
  }
}

// ========================================
// 게임 모드 설정
// ========================================
const gameModes = {
  full:     { questions: 40, timeLimit: null, label: '전체 도전 모드' },
  category: { questions: 10, timeLimit: null, label: '카테고리별 모드' },
  speed:    { questions: 20, timeLimit: 15,   label: '스피드 퀴즈 모드' }
};

// ========================================
// 전역 상태
// ========================================
const scoreManager = new ScoreManager();
let timerManager = null;
let gameQuestions = [];
let selectedMode = 'full';
let selectedCategory = '한국사';
let selectedDifficulty = 'all';

let gameState = {
  currentQuestionIndex: 0,
  score: 0,
  correctAnswers: 0,
  answers: [],
  categoryScores: {},
  isAnswered: false,
  hintsRemaining: 3,
  hintUsedThisQuestion: false,
  consecutiveCorrect: 0,
  longestStreak: 0,
  isPaused: false,
  responseTimes: [],
  scoreBreakdowns: []
};

// ========================================
// DOM 요소
// ========================================
const startScreen   = document.getElementById('startScreen');
const quizScreen    = document.getElementById('quizScreen');
const resultScreen  = document.getElementById('resultScreen');
const startBtn      = document.getElementById('startBtn');
const nextBtn       = document.getElementById('nextBtn');
const restartBtn    = document.getElementById('restartBtn');
const feedbackModal = document.getElementById('feedbackModal');
const pauseOverlay  = document.getElementById('pauseOverlay');
const hintBtn       = document.getElementById('hintBtn');
const pauseBtn      = document.getElementById('pauseBtn');
const resumeBtn     = document.getElementById('resumeBtn');

// ========================================
// 모드 선택 UI
// ========================================
document.querySelectorAll('.mode-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    selectedMode = card.dataset.mode;

    const categorySelectArea  = document.getElementById('categorySelectArea');
    const categoriesPreview   = document.getElementById('categoriesPreview');

    if (selectedMode === 'category') {
      categorySelectArea.style.display = 'block';
      categoriesPreview.style.display  = 'none';
    } else {
      categorySelectArea.style.display = 'none';
      categoriesPreview.style.display  = 'flex';
    }
  });
});

document.querySelectorAll('.category-chip.selectable').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.category-chip.selectable').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    selectedCategory = chip.dataset.category;
  });
});

// ========================================
// 문제 준비 (모드별 셔플 + 슬라이싱)
// ========================================
function prepareQuestions() {
  let pool = [...quizQuestions];

  if (selectedMode === 'category') {
    pool = pool.filter(q => q.category === selectedCategory);
  }

  if (selectedDifficulty !== 'all') {
    pool = pool.filter(q => q.difficulty === selectedDifficulty);
  }

  // Fisher-Yates 셔플
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const count = gameModes[selectedMode].questions;
  return pool.slice(0, Math.min(count, pool.length));
}

// ========================================
// 게임 초기화
// ========================================
function initGame() {
  gameQuestions = prepareQuestions();

  const categories = [...new Set(gameQuestions.map(q => q.category))];
  const categoryScores = {};
  categories.forEach(cat => {
    categoryScores[cat] = { correct: 0, total: 0 };
  });

  gameState = {
    currentQuestionIndex: 0,
    score: 0,
    correctAnswers: 0,
    answers: [],
    categoryScores,
    isAnswered: false,
    hintsRemaining: 3,
    hintUsedThisQuestion: false,
    consecutiveCorrect: 0,
    longestStreak: 0,
    isPaused: false,
    responseTimes: [],
    scoreBreakdowns: []
  };

  scoreManager.reset();

  // 타이머 초기화
  timerManager = new TimerManager(
    (elapsed, limit) => updateTimerUI(elapsed, limit),
    () => handleTimeout()
  );

  // 화면 전환
  startScreen.classList.remove('active');
  quizScreen.classList.add('active');
  resultScreen.classList.remove('active');
  feedbackModal.classList.remove('show');
  pauseOverlay.classList.remove('show');

  // 스피드 모드: 타이머 바 표시
  document.getElementById('timerBarContainer').style.display =
    selectedMode === 'speed' ? 'flex' : 'none';

  updateHintBtn();
  loadQuestion();
}

// ========================================
// 문제 로드
// ========================================
function loadQuestion() {
  const question = gameQuestions[gameState.currentQuestionIndex];

  gameState.isAnswered          = false;
  gameState.hintUsedThisQuestion = false;

  // 타이머 리셋 후 시작
  timerManager.reset();
  timerManager.start(gameModes[selectedMode].timeLimit);

  updateProgress();

  document.getElementById('categoryBadge').textContent  = question.category;
  document.getElementById('questionText').textContent   = question.question;
  document.getElementById('questionTimer').textContent  = '0s';

  // 선택지 생성
  const optionsContainer = document.getElementById('optionsContainer');
  optionsContainer.innerHTML = '';
  question.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className     = 'option-btn';
    button.textContent   = option;
    button.dataset.index = index;
    button.onclick       = () => handleAnswer(index);
    optionsContainer.appendChild(button);
  });

  updateComboDisplay();
  updateHintBtn();
}

// ========================================
// 답변 처리
// ========================================
function handleAnswer(selectedIndex) {
  if (gameState.isAnswered || gameState.isPaused) return;

  gameState.isAnswered = true;
  const timeSpent = timerManager.getElapsed();
  timerManager.stop();

  const question  = gameQuestions[gameState.currentQuestionIndex];
  const isCorrect = selectedIndex === question.correctAnswer;

  gameState.responseTimes.push(timeSpent);
  gameState.categoryScores[question.category].total++;

  if (isCorrect) {
    gameState.correctAnswers++;
    gameState.consecutiveCorrect++;
    if (gameState.consecutiveCorrect > gameState.longestStreak) {
      gameState.longestStreak = gameState.consecutiveCorrect;
    }
    gameState.categoryScores[question.category].correct++;
  } else {
    gameState.consecutiveCorrect = 0;
  }

  const { score, breakdown } = scoreManager.calculateScore(
    isCorrect,
    timeSpent,
    isCorrect ? gameState.consecutiveCorrect : 0,
    gameState.hintUsedThisQuestion
  );

  gameState.score += score;
  gameState.scoreBreakdowns.push(breakdown);
  gameState.answers.push({
    questionId: question.id,
    selected: selectedIndex,
    correct: question.correctAnswer,
    isCorrect, timeSpent, score, breakdown
  });

  showAnswerFeedback(selectedIndex, question.correctAnswer, isCorrect);
  document.getElementById('currentScore').textContent = gameState.score;

  setTimeout(() => {
    showFeedback(isCorrect, question.explanation, breakdown, score);
  }, 800);
}

// ========================================
// 시간 초과 처리
// ========================================
function handleTimeout() {
  if (gameState.isAnswered) return;

  gameState.isAnswered = true;
  gameState.consecutiveCorrect = 0;

  const question = gameQuestions[gameState.currentQuestionIndex];
  const timeSpent = gameModes[selectedMode].timeLimit;

  gameState.responseTimes.push(timeSpent);
  gameState.categoryScores[question.category].total++;

  const { score, breakdown } = scoreManager.calculateScore(false, timeSpent, 0, false);
  gameState.scoreBreakdowns.push(breakdown);
  gameState.answers.push({
    questionId: question.id,
    selected: -1,
    correct: question.correctAnswer,
    isCorrect: false,
    timeSpent, score: 0, breakdown
  });

  // 정답 표시
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(btn => btn.classList.add('disabled'));
  buttons[question.correctAnswer].classList.add('correct');

  setTimeout(() => {
    showFeedback(false, question.explanation, breakdown, 0, true);
  }, 300);
}

// ========================================
// 힌트 기능 (오답 2개 제거)
// ========================================
function useHint() {
  if (gameState.hintsRemaining <= 0 || gameState.isAnswered || gameState.isPaused) return;

  const question    = gameQuestions[gameState.currentQuestionIndex];
  const correctIndex = question.correctAnswer;

  const wrongButtons = [];
  document.querySelectorAll('.option-btn').forEach((btn, index) => {
    if (index !== correctIndex && !btn.classList.contains('hint-eliminated')) {
      wrongButtons.push({ btn, index });
    }
  });

  // 무작위 2개 선택
  for (let i = wrongButtons.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wrongButtons[i], wrongButtons[j]] = [wrongButtons[j], wrongButtons[i]];
  }

  wrongButtons.slice(0, 2).forEach(({ btn }) => {
    btn.classList.add('disabled', 'hint-eliminated');
  });

  gameState.hintsRemaining--;
  gameState.hintUsedThisQuestion = true;
  updateHintBtn();
}

function updateHintBtn() {
  const hintCount = document.getElementById('hintCount');
  if (hintCount) hintCount.textContent = gameState.hintsRemaining;
  if (hintBtn) {
    hintBtn.disabled = gameState.hintsRemaining <= 0 || gameState.isAnswered;
    hintBtn.classList.toggle('depleted', gameState.hintsRemaining <= 0);
  }
}

// ========================================
// 일시정지
// ========================================
function togglePause() {
  if (gameState.isAnswered) return;

  gameState.isPaused = !gameState.isPaused;

  if (gameState.isPaused) {
    timerManager.pause();
    pauseOverlay.classList.add('show');
  } else {
    pauseOverlay.classList.remove('show');
    timerManager.resume();
  }
}

// ========================================
// 타이머 UI 업데이트
// ========================================
function updateTimerUI(elapsed, limit) {
  const questionTimer = document.getElementById('questionTimer');
  if (questionTimer) questionTimer.textContent = `${elapsed}s`;

  if (limit) {
    const remaining  = limit - elapsed;
    const timerText  = document.getElementById('timerText');
    const timerBar   = document.getElementById('timerBar');
    const pct        = (remaining / limit) * 100;

    if (timerText) timerText.textContent = remaining;
    if (timerBar) {
      timerBar.style.width  = `${pct}%`;
      timerBar.className    =
        'timer-bar' + (pct <= 33 ? ' danger' : pct <= 66 ? ' warning' : '');
    }
  }
}

// ========================================
// 콤보 표시
// ========================================
function updateComboDisplay() {
  const comboDisplay = document.getElementById('comboDisplay');
  if (!comboDisplay) return;

  if (gameState.consecutiveCorrect >= 3) {
    comboDisplay.textContent = `🔥 ${gameState.consecutiveCorrect} 연속!`;
    comboDisplay.classList.add('active');
  } else {
    comboDisplay.textContent = '';
    comboDisplay.classList.remove('active');
  }
}

// ========================================
// 답변 피드백 UI
// ========================================
function showAnswerFeedback(selectedIndex, correctIndex, isCorrect) {
  const buttons = document.querySelectorAll('.option-btn');
  buttons.forEach(btn => btn.classList.add('disabled'));

  if (isCorrect) {
    buttons[selectedIndex].classList.add('correct');
  } else {
    buttons[selectedIndex].classList.add('incorrect');
    buttons[correctIndex].classList.add('correct');
  }
}

// ========================================
// 피드백 모달 표시
// ========================================
function showFeedback(isCorrect, explanation, breakdown, earnedScore, isTimeout = false) {
  const feedbackIcon        = document.getElementById('feedbackIcon');
  const feedbackTitle       = document.getElementById('feedbackTitle');
  const feedbackExplanation = document.getElementById('feedbackExplanation');
  const feedbackScore       = document.getElementById('feedbackScore');

  feedbackIcon.className = `feedback-icon ${isCorrect ? 'correct' : 'incorrect'}`;
  feedbackTitle.textContent = isTimeout ? '⏰ 시간 초과!' :
                              isCorrect  ? '정답입니다!'  : '틀렸습니다';
  feedbackExplanation.textContent = explanation;

  if (isCorrect && breakdown && earnedScore > 0) {
    const details = [];
    if (breakdown.base)       details.push(`기본 ${breakdown.base}점`);
    if (breakdown.timeBonus)  details.push(`빠른 답변 +${breakdown.timeBonus}점`);
    if (breakdown.noHintBonus) details.push(`노힌트 +${breakdown.noHintBonus}점`);
    if (breakdown.comboBonus) details.push(`콤보 +${breakdown.comboBonus}점`);

    feedbackScore.innerHTML =
      `<span class="score-earned">+${earnedScore}점</span>` +
      (details.length > 1 ? `<span class="score-detail">${details.join(' · ')}</span>` : '');
  } else {
    feedbackScore.innerHTML = '';
  }

  feedbackModal.classList.add('show');
}

// ========================================
// 다음 문제
// ========================================
function nextQuestion() {
  feedbackModal.classList.remove('show');
  gameState.currentQuestionIndex++;

  if (gameState.currentQuestionIndex < gameQuestions.length) {
    loadQuestion();
  } else {
    endGame();
  }
}

// ========================================
// 진행률 업데이트
// ========================================
function updateProgress() {
  const current = gameState.currentQuestionIndex + 1;
  const total   = gameQuestions.length;

  document.getElementById('currentQuestion').textContent = current;
  document.getElementById('totalQuestions').textContent  = total;
  document.getElementById('currentScore').textContent    = gameState.score;

  const progressFill = document.getElementById('progressFill');
  if (progressFill) progressFill.style.width = `${(current / total) * 100}%`;
}

// ========================================
// 게임 종료
// ========================================
function endGame() {
  if (timerManager) timerManager.stop();

  const total   = gameQuestions.length;
  const avgTime = gameState.responseTimes.length > 0
    ? Math.round((gameState.responseTimes.reduce((a, b) => a + b, 0) / gameState.responseTimes.length) * 10) / 10
    : 0;

  localDataManager.saveGameResult({
    totalScore:     gameState.score,
    correctAnswers: gameState.correctAnswers,
    totalQuestions: total,
    accuracy:       Math.round((gameState.correctAnswers / total) * 100),
    avgTime,
    longestStreak:  gameState.longestStreak,
    mode:           selectedMode,
    selectedCategory,
    categoryScores: gameState.categoryScores
  });

  quizScreen.classList.remove('active');
  resultScreen.classList.add('active');
  displayResults();
  displayResultLeaderboard();
}

// ========================================
// 결과 표시
// ========================================
function displayResults() {
  const total    = gameQuestions.length;
  const accuracy = Math.round((gameState.correctAnswers / total) * 100);
  const avgTime  = gameState.responseTimes.length > 0
    ? Math.round(
        (gameState.responseTimes.reduce((a, b) => a + b, 0) / gameState.responseTimes.length) * 10
      ) / 10
    : 0;

  document.getElementById('resultModeLabel').textContent = gameModes[selectedMode].label;
  document.getElementById('finalScore').textContent      = gameState.score;
  document.getElementById('correctCount').textContent    = `${gameState.correctAnswers} / ${total}`;
  document.getElementById('accuracyRate').textContent    = `${accuracy}%`;
  document.getElementById('avgTime').textContent         = `${avgTime}s`;
  document.getElementById('longestStreak').textContent   = gameState.longestStreak;

  // 카테고리별 결과
  const categoryResults = document.getElementById('categoryResults');
  categoryResults.innerHTML = '';

  for (const [category, scores] of Object.entries(gameState.categoryScores)) {
    if (scores.total === 0) continue;

    const catAccuracy = Math.round((scores.correct / scores.total) * 100);
    const div = document.createElement('div');
    div.className = 'category-result';
    div.innerHTML = `
      <span class="category-name">${category}</span>
      <div class="category-bar-wrap">
        <div class="category-bar-fill" style="width:${catAccuracy}%"></div>
      </div>
      <span class="category-score">${scores.correct} / ${scores.total}</span>
    `;
    categoryResults.appendChild(div);
  }

  // 점수 분석
  const totalBase       = gameState.scoreBreakdowns.reduce((a, b) => a + b.base, 0);
  const totalTimeBonus  = gameState.scoreBreakdowns.reduce((a, b) => a + b.timeBonus, 0);
  const totalNoHint     = gameState.scoreBreakdowns.reduce((a, b) => a + b.noHintBonus, 0);
  const totalCombo      = gameState.scoreBreakdowns.reduce((a, b) => a + b.comboBonus, 0);

  document.getElementById('breakdownDetails').innerHTML = `
    <div class="breakdown-item"><span>기본 점수</span><span>${totalBase}점</span></div>
    <div class="breakdown-item"><span>빠른 답변 보너스</span><span>+${totalTimeBonus}점</span></div>
    <div class="breakdown-item"><span>노힌트 보너스</span><span>+${totalNoHint}점</span></div>
    <div class="breakdown-item"><span>콤보 보너스</span><span>+${totalCombo}점</span></div>
    <div class="breakdown-item total">
      <span>최종 합계</span><span>${gameState.score}점</span>
    </div>
  `;
}

// ========================================
// 게임 재시작
// ========================================
function restartGame() {
  if (timerManager) timerManager.stop();
  resultScreen.classList.remove('active');
  document.getElementById('dashboardScreen').classList.remove('active');
  startScreen.classList.add('active');
}

// ========================================
// 이벤트 리스너
// ========================================
startBtn.addEventListener('click', initGame);
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', restartGame);
hintBtn.addEventListener('click', useHint);
pauseBtn.addEventListener('click', togglePause);
resumeBtn.addEventListener('click', togglePause);

// ========================================
// 난이도 선택 UI
// ========================================
document.querySelectorAll('.diff-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.diff-chip').forEach(c => c.classList.remove('selected'));
    chip.classList.add('selected');
    selectedDifficulty = chip.dataset.difficulty;
  });
});

// ========================================
// 다크모드
// ========================================
let isDarkMode = localStorage.getItem('quizDarkMode') === 'true';

function applyDarkMode() {
  document.body.classList.toggle('dark-mode', isDarkMode);
  const btn = document.getElementById('darkModeBtn');
  if (btn) btn.textContent = isDarkMode ? '☀️' : '🌙';
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode;
  localStorage.setItem('quizDarkMode', isDarkMode);
  applyDarkMode();
}

document.getElementById('darkModeBtn').addEventListener('click', toggleDarkMode);
applyDarkMode();

// ========================================
// 결과 공유 (클립보드)
// ========================================
function shareResult() {
  const accuracy   = Math.round((gameState.correctAnswers / gameQuestions.length) * 100);
  const modeLabel  = gameModes[selectedMode]?.label || selectedMode;

  const text = [
    '🎯 퀴즈 게임 결과',
    `모드: ${modeLabel}`,
    `점수: ${gameState.score}점`,
    `정답: ${gameState.correctAnswers}/${gameQuestions.length} (${accuracy}%)`,
    `최장 연속: ${gameState.longestStreak}개`,
    '',
    '퀴즈 게임에 도전해보세요!'
  ].join('\n');

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById('shareBtn');
    if (!btn) return;
    const original = btn.textContent;
    btn.textContent = '✅ 복사됨!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 2000);
  }).catch(() => {
    alert('클립보드 복사가 지원되지 않는 환경입니다.');
  });
}

document.getElementById('shareBtn').addEventListener('click', shareResult);

// ========================================
// 결과 화면 리더보드 표시
// ========================================
function displayResultLeaderboard() {
  const leaderboard  = localDataManager.getLeaderboard('allTime');
  const container    = document.getElementById('resultLeaderboard');
  if (!container) return;

  if (!leaderboard.length) {
    container.innerHTML = '<p class="no-records">아직 기록이 없습니다.</p>';
    return;
  }

  const medals = ['🥇', '🥈', '🥉'];
  const now    = Date.now();

  container.innerHTML = leaderboard.map((entry, i) => {
    const rank       = medals[i] || `${i + 1}위`;
    const date       = new Date(entry.timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    const modeLabel  = (gameModes[entry.mode]?.label || entry.mode).replace(' 모드', '');
    const isCurrent  = Math.abs(now - new Date(entry.timestamp).getTime()) < 5000;

    return `
      <div class="leaderboard-item ${isCurrent ? 'current' : ''}">
        <span class="lb-rank">${rank}</span>
        <span class="lb-score">${entry.totalScore}점</span>
        <span class="lb-detail">${entry.accuracy}% · ${modeLabel}</span>
        <span class="lb-date">${date}</span>
      </div>`;
  }).join('');
}

// ========================================
// 대시보드
// ========================================
const dashboardScreen = document.getElementById('dashboardScreen');

function showDashboard() {
  startScreen.classList.remove('active');
  resultScreen.classList.remove('active');
  dashboardScreen.classList.add('active');
  renderDashboard();
}

function hideDashboard() {
  dashboardScreen.classList.remove('active');
  startScreen.classList.add('active');
}

function renderDashboard() {
  document.getElementById('totalPlays').textContent    = localDataManager.getPlayCount();
  document.getElementById('dashBestScore').textContent = localDataManager.getBestScore();
  document.getElementById('dashAvgScore').textContent  = localDataManager.getAverageScore();
  document.getElementById('dashBestStreak').textContent= localDataManager.getBestStreak();

  // 카테고리별 정답률
  const catStats     = localDataManager.getCategoryStats();
  const catContainer = document.getElementById('dashCategoryStats');
  if (!Object.keys(catStats).length) {
    catContainer.innerHTML = '<p class="no-records">플레이 기록이 없습니다.</p>';
  } else {
    catContainer.innerHTML = Object.entries(catStats).map(([cat, s]) => {
      const acc = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0;
      return `
        <div class="category-result">
          <span class="category-name">${cat}</span>
          <div class="category-bar-wrap">
            <div class="category-bar-fill" style="width:${acc}%"></div>
          </div>
          <span class="category-score">${acc}%</span>
        </div>`;
    }).join('');
  }

  // 최근 게임 기록
  const recent          = localDataManager.getRecentGames(10);
  const recentContainer = document.getElementById('dashRecentGames');
  if (!recent.length) {
    recentContainer.innerHTML = '<p class="no-records">최근 기록이 없습니다.</p>';
  } else {
    recentContainer.innerHTML = recent.map((g, i) => {
      const date      = new Date(g.timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      const modeLabel = (gameModes[g.mode]?.label || g.mode).replace(' 모드', '');
      return `
        <div class="history-item">
          <span class="hist-num">${i + 1}</span>
          <span class="hist-score">${g.totalScore}점</span>
          <span class="hist-accuracy">${g.accuracy}%</span>
          <span class="hist-mode">${modeLabel}</span>
          <span class="hist-date">${date}</span>
        </div>`;
    }).join('');
  }

  // 전체 순위
  const leaderboard  = localDataManager.getLeaderboard('allTime');
  const lbContainer  = document.getElementById('dashLeaderboard');
  const medals       = ['🥇', '🥈', '🥉'];
  if (!leaderboard.length) {
    lbContainer.innerHTML = '<p class="no-records">기록이 없습니다.</p>';
  } else {
    lbContainer.innerHTML = leaderboard.map((entry, i) => {
      const rank      = medals[i] || `${i + 1}위`;
      const date      = new Date(entry.timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
      const modeLabel = (gameModes[entry.mode]?.label || entry.mode).replace(' 모드', '');
      return `
        <div class="leaderboard-item">
          <span class="lb-rank">${rank}</span>
          <span class="lb-score">${entry.totalScore}점</span>
          <span class="lb-detail">${entry.accuracy}% · ${modeLabel}</span>
          <span class="lb-date">${date}</span>
        </div>`;
    }).join('');
  }
}

function clearHistory() {
  if (!confirm('모든 게임 기록을 삭제하시겠습니까?')) return;
  localDataManager.clearHistory();
  renderDashboard();
}

document.getElementById('statsBtn').addEventListener('click', showDashboard);
document.getElementById('dashboardBackBtn').addEventListener('click', hideDashboard);
document.getElementById('clearHistoryBtn').addEventListener('click', clearHistory);
document.getElementById('statsResultBtn').addEventListener('click', () => {
  resultScreen.classList.remove('active');
  showDashboard();
});

document.addEventListener('keydown', (e) => {
  if (quizScreen.classList.contains('active')) {
    // ESC: 일시정지 토글
    if (e.key === 'Escape') {
      togglePause();
      return;
    }

    if (gameState.isPaused) return;

    if (!gameState.isAnswered) {
      // 1-4: 답변 선택
      if (e.key >= '1' && e.key <= '4') {
        const index   = parseInt(e.key) - 1;
        const buttons = document.querySelectorAll('.option-btn');
        if (buttons[index] && !buttons[index].classList.contains('disabled')) {
          handleAnswer(index);
        }
      }
      // H: 힌트 사용
      if (e.key === 'h' || e.key === 'H') {
        useHint();
      }
    }

    // Enter: 다음 문제 (피드백 모달이 열려있을 때)
    if (feedbackModal.classList.contains('show') && e.key === 'Enter') {
      nextQuestion();
    }
  }
});
