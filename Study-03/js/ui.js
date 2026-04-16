const ui = {
  // 화면 전환
  showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
  },

  // 시작 화면 렌더링 (카테고리 버튼 동적 생성)
  renderStart() {
    const categoryGrid = document.getElementById('category-grid');
    categoryGrid.innerHTML = '';

    const categories = game.getCategories();
    const labels = { all: '전체', 한국사: '한국사', 세계사: '세계사', 과학: '과학', 상식: '상식' };
    const icons = { all: '📚', 한국사: '🏛️', 세계사: '🌍', 과학: '🔬', 상식: '💡' };

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'category-btn';
      btn.dataset.category = cat;

      const count = cat === 'all'
        ? QUIZ_DATA.length
        : QUIZ_DATA.filter(q => q.category === cat).length;

      btn.innerHTML = `
        <span class="cat-icon">${icons[cat] || '📖'}</span>
        <span class="cat-name">${labels[cat] || cat}</span>
        <span class="cat-count">${count}문제</span>
      `;

      btn.addEventListener('click', () => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        document.getElementById('selected-category').textContent = labels[cat] || cat;
        document.getElementById('start-btn').dataset.category = cat;
      });

      categoryGrid.appendChild(btn);
    });

    // 첫 번째(전체) 선택 기본값
    categoryGrid.querySelector('.category-btn').click();
    this.showScreen('start-screen');
  },

  // 퀴즈 문제 렌더링
  renderQuestion(question, index, total) {
    // 진행률 업데이트
    const progress = ((index) / total) * 100;
    document.getElementById('progress-bar').style.width = progress + '%';
    document.getElementById('progress-text').textContent = `${index + 1} / ${total}`;

    // 카테고리 & 난이도 배지
    document.getElementById('q-category').textContent = question.category;
    const diffEl = document.getElementById('q-difficulty');
    const diffMap = { easy: '쉬움', medium: '보통', hard: '어려움' };
    diffEl.textContent = diffMap[question.difficulty];
    diffEl.className = `badge difficulty-${question.difficulty}`;

    // 문제 텍스트
    document.getElementById('question-text').textContent = question.question;

    // 선택지 렌더링
    const optionsList = document.getElementById('options-list');
    optionsList.innerHTML = '';

    question.options.forEach((option, i) => {
      const li = document.createElement('li');
      li.className = 'option-item';

      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="option-num">${['①', '②', '③', '④'][i]}</span><span class="option-text">${option}</span>`;
      btn.addEventListener('click', () => game.handleAnswer(i));

      li.appendChild(btn);
      optionsList.appendChild(li);
    });

    // 피드백 영역 숨김
    document.getElementById('feedback-area').classList.add('hidden');
    document.getElementById('next-btn').classList.add('hidden');

    this.showScreen('quiz-screen');
  },

  // 정답/오답 피드백 표시
  showFeedback(question, selectedIndex, isCorrect) {
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach((btn, i) => {
      btn.disabled = true;
      if (i === question.correctAnswer) {
        btn.classList.add('correct');
      } else if (i === selectedIndex && !isCorrect) {
        btn.classList.add('incorrect');
      }
    });

    const feedbackArea = document.getElementById('feedback-area');
    feedbackArea.className = `feedback-area ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`;

    const icon = isCorrect ? '✓' : '✗';
    const title = isCorrect ? '정답입니다!' : '오답입니다';
    feedbackArea.innerHTML = `
      <div class="feedback-header">
        <span class="feedback-icon">${icon}</span>
        <strong>${title}</strong>
      </div>
      <p class="feedback-explanation">${question.explanation}</p>
    `;

    feedbackArea.classList.remove('hidden');
    document.getElementById('next-btn').classList.remove('hidden');
  },

  // 결과 화면 렌더링
  renderResult({ score, correctCount, total, answers, category }) {
    const percentage = Math.round((correctCount / total) * 100);

    // 등급 계산
    let grade, gradeClass, gradeMsg;
    if (percentage >= 90) { grade = 'S'; gradeClass = 'grade-s'; gradeMsg = '완벽합니다! 천재급 실력이에요!'; }
    else if (percentage >= 80) { grade = 'A'; gradeClass = 'grade-a'; gradeMsg = '훌륭합니다! 상위권 실력이에요!'; }
    else if (percentage >= 70) { grade = 'B'; gradeClass = 'grade-b'; gradeMsg = '잘 하셨어요! 평균 이상입니다!'; }
    else if (percentage >= 60) { grade = 'C'; gradeClass = 'grade-c'; gradeMsg = '괜찮아요! 조금 더 공부해봐요!'; }
    else { grade = 'D'; gradeClass = 'grade-d'; gradeMsg = '아쉽네요! 다시 도전해봐요!'; }

    document.getElementById('result-grade').textContent = grade;
    document.getElementById('result-grade').className = `result-grade ${gradeClass}`;
    document.getElementById('result-message').textContent = gradeMsg;
    document.getElementById('result-score').textContent = score;
    document.getElementById('result-correct').textContent = `${correctCount} / ${total}`;
    document.getElementById('result-percentage').textContent = `${percentage}%`;

    // 오답 목록 렌더링
    const wrongList = document.getElementById('wrong-list');
    wrongList.innerHTML = '';
    const wrongAnswers = answers.filter(a => !a.isCorrect);

    if (wrongAnswers.length === 0) {
      wrongList.innerHTML = '<li class="all-correct">모든 문제를 맞혔습니다! 🎉</li>';
    } else {
      wrongAnswers.forEach(a => {
        const li = document.createElement('li');
        li.className = 'wrong-item';
        li.innerHTML = `
          <p class="wrong-question">${a.question}</p>
          <p class="wrong-answer">정답: ${game.questions.find(q => q.question === a.question)?.options[a.correct] || ''}</p>
        `;
        wrongList.appendChild(li);
      });
    }

    this.showScreen('result-screen');
  }
};
