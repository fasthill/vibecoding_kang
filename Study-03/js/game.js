const GameState = {
  IDLE: 'idle',
  PLAYING: 'playing',
  FEEDBACK: 'feedback',
  FINISHED: 'finished'
};

const game = {
  state: GameState.IDLE,
  questions: [],
  currentIndex: 0,
  score: 0,
  correctCount: 0,
  selectedCategory: 'all',
  answers: [],

  // 게임 초기화
  initGame(category = 'all') {
    this.selectedCategory = category;
    this.questions = this._loadQuestions(category);
    this.currentIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.answers = [];
    this.state = GameState.PLAYING;
    this.loadQuestion();
  },

  // 문제 로드 (카테고리 필터링 + 셔플)
  _loadQuestions(category) {
    let filtered = category === 'all'
      ? [...QUIZ_DATA]
      : QUIZ_DATA.filter(q => q.category === category);
    return this._shuffle(filtered);
  },

  // 배열 셔플 (Fisher-Yates)
  _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  // 현재 문제 로드 및 UI 표시
  loadQuestion() {
    if (this.currentIndex >= this.questions.length) {
      this.endGame();
      return;
    }
    const question = this.questions[this.currentIndex];
    ui.renderQuestion(question, this.currentIndex, this.questions.length);
  },

  // 답변 처리
  handleAnswer(selectedIndex) {
    if (this.state !== GameState.PLAYING) return;

    this.state = GameState.FEEDBACK;
    const question = this.questions[this.currentIndex];
    const isCorrect = selectedIndex === question.correctAnswer;

    if (isCorrect) {
      this.correctCount++;
      this.score += this._calcScore(question.difficulty);
    }

    this.answers.push({
      question: question.question,
      selected: selectedIndex,
      correct: question.correctAnswer,
      isCorrect
    });

    ui.showFeedback(question, selectedIndex, isCorrect);
  },

  // 난이도별 점수 계산
  _calcScore(difficulty) {
    const scoreMap = { easy: 10, medium: 20, hard: 30 };
    return scoreMap[difficulty] || 10;
  },

  // 다음 문제로 이동
  nextQuestion() {
    this.currentIndex++;
    this.state = GameState.PLAYING;
    this.loadQuestion();
  },

  // 게임 종료 처리
  endGame() {
    this.state = GameState.FINISHED;
    ui.renderResult({
      score: this.score,
      correctCount: this.correctCount,
      total: this.questions.length,
      answers: this.answers,
      category: this.selectedCategory
    });
  },

  // 카테고리 목록 반환
  getCategories() {
    return ['all', ...new Set(QUIZ_DATA.map(q => q.category))];
  }
};
