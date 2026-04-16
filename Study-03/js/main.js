document.addEventListener('DOMContentLoaded', () => {
  // 시작 화면 초기화
  ui.renderStart();

  // 게임 시작 버튼
  document.getElementById('start-btn').addEventListener('click', (e) => {
    const category = e.currentTarget.dataset.category || 'all';
    game.initGame(category);
  });

  // 다음 문제 버튼
  document.getElementById('next-btn').addEventListener('click', () => {
    game.nextQuestion();
  });

  // 다시 하기 버튼
  document.getElementById('retry-btn').addEventListener('click', () => {
    game.initGame(game.selectedCategory);
  });

  // 처음으로 버튼
  document.getElementById('home-btn').addEventListener('click', () => {
    ui.renderStart();
  });
});
