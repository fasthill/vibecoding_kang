/*══════════════════════════════════════════════════════════
  MY TASKS — script.js
  구조 순서:
  1. 설정·상수
  2. 상태
  3. DOM 참조
  4. 유틸리티
  5. 초기화
  6. 이벤트 연결
  7. 핸들러 (추가·토글·삭제·수정·필터·정렬·내보내기/가져오기)
  8. 드래그 앤 드롭
  9. 렌더
  10. 대시보드
  11. 테마
  12. 피드백 (토스트·Shake·공지)
  13. 영속성 (localStorage)
══════════════════════════════════════════════════════════*/

/* ──────────────────────────────────────────────────────
   1. 설정 & 상수
   ────────────────────────────────────────────────────── */

/** localStorage 키 */
const STORAGE_KEY  = 'my-tasks';
const FILTER_KEY   = 'my-tasks-filter';
const THEME_KEY    = 'my-tasks-theme';
const SORT_KEY     = 'my-tasks-sort';

/** 유효한 카테고리 정의 */
const CATEGORIES = {
  work:     { label: '업무' },
  personal: { label: '개인' },
  study:    { label: '공부' },
};

/** 유효한 필터 목록 */
const FILTER_KEYS = ['all', 'work', 'personal', 'study'];

/** 유효한 정렬 옵션 */
const SORT_KEYS = ['manual', 'date-desc', 'date-asc', 'category', 'completion'];

/**
 * 오늘의 격언 목록
 * 날짜 기반으로 하루 한 개가 고정 표시됩니다.
 */
const QUOTES = [
  '"큰 일은 작은 일들이 모여 이루어진다." — 반 고흐',
  '"오늘 할 수 있는 일을 내일로 미루지 말라." — 벤저민 프랭클린',
  '"시작이 반이다." — 아리스토텔레스',
  '"성공은 준비와 기회가 만나는 곳에 있다." — 세네카',
  '"천 리 길도 한 걸음부터." — 노자',
  '"완벽을 기다리지 말고 지금 시작하라." — 조지 패튼',
  '"집중은 중요한 것을 말하는 것이 아니라 중요하지 않은 것에 아니오라 말하는 것이다." — 스티브 잡스',
  '"실천 없는 비전은 그저 꿈이다." — 조엘 바커',
  '"하루하루를 마지막인 것처럼 살아라." — 스티브 잡스',
  '"지식은 힘이다." — 프랜시스 베이컨',
  '"모든 전문가는 한때 초보자였다." — 헬렌 헤이스',
  '"실패는 성공의 어머니다." — 토마스 에디슨',
  '"포기하지 마라. 처음에는 어렵겠지만 점점 쉬워진다." — 이소벨 마닌',
  '"꿈을 크게 가져라, 그러나 작게 시작하라." — 이스탄불 속담',
  '"중요한 것은 속도가 아니라 방향이다." — 괴테',
  '"나는 내 미래를 예측할 수 없다. 나는 그것을 창조할 것이다." — 에이브러햄 링컨',
  '"어제는 역사이고, 내일은 미스터리이며, 오늘은 선물이다." — 빌 키인',
  '"성공은 최종 목표가 아니며, 실패는 치명적이지 않다." — 윈스턴 처칠',
  '"당신이 할 수 있다고 생각하든, 없다고 생각하든 맞다." — 헨리 포드',
  '"행동 없는 생각은 아무것도 아니다." — 에밀 졸라',
  '"변화하지 않으면 성장할 수 없다." — 조지 버나드 쇼',
  '"가장 좋은 시간은 지금이다." — 오비디우스',
  '"위대한 일은 충동이 아니라 작은 것들의 축적으로 이루어진다." — 빈센트 반 고흐',
  '"한 번에 한 걸음씩." — 한국 속담',
  '"오늘의 노력이 내일의 성공이 된다." — 이름 없는 현인',
];

/**
 * 완료율에 따른 응원 메시지
 * @param {number} pct  0~100
 * @param {number} total 전체 할 일 수
 * @returns {string}
 */
function getEncouragement(pct, total) {
  if (total === 0)   return '오늘의 할 일을 추가해보세요!';
  if (pct === 100)   return '모든 할 일 완료! 정말 대단해요!';
  if (pct >= 75)     return '거의 다 왔어요! 마지막 힘을 내봐요!';
  if (pct >= 50)     return '절반 이상 완료! 잘 하고 있어요!';
  if (pct >= 25)     return '좋은 시작이에요! 계속 진행해봐요!';
  return '시작이 반이에요! 파이팅!';
}

/* ──────────────────────────────────────────────────────
   2. 상태
   ────────────────────────────────────────────────────── */

let tasks        = loadTasks();               // 할 일 목록 (배열)
let activeFilter = loadFilter();              // 'all' | 'work' | 'personal' | 'study'
let sortBy       = loadSort();                // 'manual' | 'date-desc' | ...
let isDark       = localStorage.getItem(THEME_KEY) === 'dark';
let searchQuery  = '';                        // 실시간 검색어
let lastAddedId  = null;                      // 추가 애니메이션 대상 id
let editingId    = null;                      // 현재 인라인 편집 중인 task id
let lastDeleted  = null;                      // Undo용: { task, index }

// 드래그 앤 드롭
let dragSrcId    = null;                      // 드래그 시작 항목 id
let dragOverId   = null;                      // 현재 드롭 대상 id

/* ──────────────────────────────────────────────────────
   3. DOM 참조
   ────────────────────────────────────────────────────── */

const taskInput         = document.getElementById('taskInput');
const categorySelect    = document.getElementById('categorySelect');
const addBtn            = document.getElementById('addBtn');
const taskList          = document.getElementById('taskList');
const emptyMsg          = document.getElementById('emptyMsg');
const filterRow         = document.getElementById('filterRow');
const themeToggle       = document.getElementById('themeToggle');
const searchInput       = document.getElementById('searchInput');
const searchClearBtn    = document.getElementById('searchClearBtn');
const clearCompletedBtn = document.getElementById('clearCompletedBtn');
const remainingBadge    = document.getElementById('remainingBadge');
const sortSelect        = document.getElementById('sortSelect');
const exportBtn         = document.getElementById('exportBtn');
const importBtn         = document.getElementById('importBtn');
const importFile        = document.getElementById('importFile');
const srAnnounce        = document.getElementById('srAnnounce');

/* ──────────────────────────────────────────────────────
   4. 유틸리티
   ────────────────────────────────────────────────────── */

/**
 * 디바운스 — 연속 호출 시 마지막 호출만 실행
 * @param {Function} fn    대상 함수
 * @param {number}   delay 지연(ms)
 */
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** 검색 렌더를 150ms 디바운스로 묶어 100+개 항목도 부드럽게 처리 */
const debouncedRender = debounce(render, 150);

/**
 * HTML 특수문자 이스케이프 (XSS 방지)
 * innerHTML로 삽입하는 검색 하이라이트에 사용
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * 검색어에 매칭된 텍스트를 <mark>로 감쌉니다.
 * 매칭이 없으면 HTML 이스케이프된 원문 반환
 */
function highlightText(text, query) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return escapeHtml(text);
  return (
    escapeHtml(text.slice(0, idx)) +
    `<mark>${escapeHtml(text.slice(idx, idx + query.length))}</mark>` +
    escapeHtml(text.slice(idx + query.length))
  );
}

/**
 * 생성 시각 → "N분 전" 형식 상대 시간
 */
function timeAgo(isoString) {
  const diff = Math.floor((Date.now() - new Date(isoString)) / 1000);
  if (diff < 60)          return '방금 전';
  if (diff < 3600)        return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400)       return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 86400 * 30)  return `${Math.floor(diff / 86400)}일 전`;
  if (diff < 86400 * 365) return `${Math.floor(diff / (86400 * 30))}개월 전`;
  return `${Math.floor(diff / (86400 * 365))}년 전`;
}

/**
 * category 값 정규화 — 유효하지 않은 값은 'work' 기본값으로 변환
 */
function normalizeCategory(category) {
  return category in CATEGORIES ? category : 'work';
}

/**
 * 오늘 날짜 기반으로 격언 인덱스를 결정 (하루 고정)
 */
function getTodayQuote() {
  const dayIndex = Math.floor(Date.now() / 86400000) % QUOTES.length;
  return QUOTES[dayIndex];
}

/* ──────────────────────────────────────────────────────
   5. 초기화
   ────────────────────────────────────────────────────── */

applyTheme();
applyFilterUI();
sortSelect.value = sortBy;
render();

/* ──────────────────────────────────────────────────────
   6. 이벤트 연결
   ────────────────────────────────────────────────────── */

// 새 할 일 추가
addBtn.addEventListener('click', handleAdd);
taskInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAdd(); });

// 카테고리 필터
filterRow.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;
  setFilter(btn.dataset.filter);
});

// 다크 모드 토글
themeToggle.addEventListener('change', toggleTheme);

// 검색 (디바운스 적용)
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim();
  searchClearBtn.style.display = searchQuery ? '' : 'none';
  debouncedRender();
});

searchClearBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  searchClearBtn.style.display = 'none';
  searchInput.focus();
  render();
});

// 완료된 항목 일괄 삭제
clearCompletedBtn.addEventListener('click', handleClearCompleted);

// 정렬 변경
sortSelect.addEventListener('change', () => {
  sortBy = sortSelect.value;
  saveSortPref();
  render();
});

// 내보내기 / 가져오기
exportBtn.addEventListener('click', handleExport);
importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', (e) => {
  if (e.target.files[0]) handleImport(e.target.files[0]);
});

// 드래그 앤 드롭 (이벤트 위임 — taskList 하나에서 모두 처리)
taskList.addEventListener('dragstart', onDragStart);
taskList.addEventListener('dragover',  onDragOver);
taskList.addEventListener('dragleave', onDragLeave);
taskList.addEventListener('drop',      onDrop);
taskList.addEventListener('dragend',   onDragEnd);

/* ── 키보드 단축키 ── */
document.addEventListener('keydown', (e) => {
  // Alt+N: 새 할 일 입력창 포커스
  if (e.altKey && (e.key === 'n' || e.key === 'N')) {
    e.preventDefault();
    taskInput.focus(); taskInput.select();
    announce('입력창으로 이동했습니다.');
    return;
  }
  // Alt+1~4: 필터 전환
  if (e.altKey && ['1','2','3','4'].includes(e.key)) {
    e.preventDefault();
    const filters = ['all', 'work', 'personal', 'study'];
    setFilter(filters[parseInt(e.key) - 1]);
    return;
  }
  // Alt+D: 다크 모드 토글
  if (e.altKey && (e.key === 'd' || e.key === 'D')) {
    e.preventDefault();
    toggleTheme();
    return;
  }
  // Alt+Z: 최근 삭제 복구
  if (e.altKey && (e.key === 'z' || e.key === 'Z')) {
    e.preventDefault();
    undoDelete();
    return;
  }
});

/* ──────────────────────────────────────────────────────
   7. 핸들러
   ────────────────────────────────────────────────────── */

/** 할 일 추가 */
function handleAdd() {
  const text     = taskInput.value.trim();
  const category = categorySelect.value;

  // 빈 입력 처리
  if (!text) {
    shakeElement(taskInput);
    taskInput.focus();
    return;
  }

  // 중복 확인 (같은 카테고리 내 미완료 항목과 텍스트가 동일할 때 경고)
  const duplicate = tasks.find(
    (t) => !t.completed &&
           normalizeCategory(t.category) === category &&
           t.text.toLowerCase() === text.toLowerCase()
  );
  if (duplicate) {
    const ok = confirm(
      `"${text}" 항목이 [${CATEGORIES[category].label}] 카테고리에 이미 있습니다.\n그래도 추가할까요?`
    );
    if (!ok) { taskInput.focus(); return; }
  }

  const task = {
    id:        crypto.randomUUID(),
    text,
    category,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  lastAddedId = task.id;
  tasks.unshift(task);
  saveTasks();
  render();

  taskInput.value = '';
  taskInput.focus();
  announce(`"${text}" 할 일이 추가되었습니다.`);
  showToast('할 일이 추가되었습니다.', 'success');
}

/** 완료 토글 */
function handleToggle(id) {
  const target     = tasks.find((t) => t.id === id);
  const completing = target && !target.completed; // 미완료 → 완료 전환인지

  tasks = tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t
  );
  saveTasks();

  announce(completing
    ? `"${target.text}" 완료로 표시되었습니다.`
    : `"${target.text}" 완료 취소되었습니다.`
  );

  if (completing) {
    // 완료 체크 시 펄스 애니메이션 → 이후 하단으로 정렬 이동
    const li = taskList.querySelector(`[data-id="${id}"]`);
    if (li) {
      li.classList.add('completing');
      li.addEventListener('animationend', () => render(), { once: true });
      return;
    }
  }
  render();
}

/** 할 일 삭제 (애니메이션 → 상태 업데이트 → Undo 제공) */
function handleDelete(id) {
  const task      = tasks.find((t) => t.id === id);
  const taskIndex = tasks.findIndex((t) => t.id === id);
  if (!task) return;

  const li = taskList.querySelector(`[data-id="${id}"]`);

  const commit = () => {
    // Undo를 위해 삭제된 항목과 원래 위치 저장
    lastDeleted = { task, index: taskIndex };

    tasks = tasks.filter((t) => t.id !== id);
    saveTasks();
    render();
    announce(`"${task.text}" 삭제되었습니다. Alt+Z로 복구 가능합니다.`);
    showUndoToast(`"${task.text.length > 20 ? task.text.slice(0, 20) + '…' : task.text}" 삭제됨`);
  };

  if (li) {
    li.classList.add('removing');
    li.addEventListener('animationend', commit, { once: true });
  } else {
    commit();
  }
}

/** 완료된 항목 일괄 삭제 */
function handleClearCompleted() {
  const count = tasks.filter((t) => t.completed).length;
  if (count === 0) {
    showToast('완료된 항목이 없습니다.', 'info');
    return;
  }
  if (!confirm(`완료된 항목 ${count}개를 모두 삭제할까요?`)) return;

  tasks = tasks.filter((t) => !t.completed);
  lastDeleted = null; // 일괄 삭제는 단일 Undo 지원 불가
  saveTasks();
  render();
  announce(`완료된 항목 ${count}개가 삭제되었습니다.`);
  showToast(`완료된 항목 ${count}개를 삭제했습니다.`, 'success');
}

/** 최근 삭제 항목 복구 */
function undoDelete() {
  if (!lastDeleted) {
    showToast('복구할 항목이 없습니다.', 'info');
    return;
  }
  const { task, index } = lastDeleted;
  // 원래 위치에 삽입 (배열 범위 초과 방지)
  tasks.splice(Math.min(index, tasks.length), 0, task);
  lastDeleted = null;
  saveTasks();
  render();
  announce(`"${task.text}" 복구되었습니다.`);
  showToast(`"${task.text.slice(0, 20)}" 복구됨`, 'success');
}

/** 필터 변경 */
function setFilter(filter) {
  if (!FILTER_KEYS.includes(filter)) return;
  activeFilter = filter;
  saveFilter();
  applyFilterUI();
  render();
}

/** 필터 버튼 UI 동기화 (aria-pressed 포함) */
function applyFilterUI() {
  filterRow.querySelectorAll('.filter-btn').forEach((btn) => {
    const active = btn.dataset.filter === activeFilter;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

/* ──────────────────────────────────────────────────────
   인라인 수정
   ────────────────────────────────────────────────────── */

/** 더블클릭 시 해당 항목을 편집 모드로 전환 */
function enterEditMode(id) {
  if (editingId === id) return; // 이미 편집 중
  editingId = id;

  const li   = taskList.querySelector(`[data-id="${id}"]`);
  const task = tasks.find((t) => t.id === id);
  if (!li || !task) return;

  li.classList.add('editing');
  li.setAttribute('aria-label', `"${task.text}" 편집 중`);

  const body = li.querySelector('.task-body');
  body.innerHTML = '';

  // 편집 입력 행
  const editRow       = document.createElement('div');
  editRow.className   = 'edit-row';

  const editInput     = document.createElement('input');
  editInput.type      = 'text';
  editInput.className = 'edit-input';
  editInput.value     = task.text;
  editInput.maxLength = 200;
  editInput.setAttribute('aria-label', '할 일 수정 입력');

  const editSelect    = document.createElement('select');
  editSelect.className = 'edit-category-select';
  editSelect.setAttribute('aria-label', '카테고리 변경');
  Object.entries(CATEGORIES).forEach(([key, { label }]) => {
    const opt       = document.createElement('option');
    opt.value       = key;
    opt.textContent = label;
    if (key === normalizeCategory(task.category)) opt.selected = true;
    editSelect.appendChild(opt);
  });

  const actions     = document.createElement('div');
  actions.className = 'edit-actions';

  const saveBtn       = document.createElement('button');
  saveBtn.className   = 'edit-save-btn';
  saveBtn.textContent = '저장';
  saveBtn.setAttribute('aria-label', '수정 저장');

  const cancelBtn       = document.createElement('button');
  cancelBtn.className   = 'edit-cancel-btn';
  cancelBtn.textContent = '취소';
  cancelBtn.setAttribute('aria-label', '수정 취소');

  const hint       = document.createElement('span');
  hint.className   = 'edit-hint';
  hint.textContent = 'Enter 저장 · ESC 취소';
  hint.setAttribute('aria-hidden', 'true');

  actions.appendChild(saveBtn);
  actions.appendChild(cancelBtn);
  editRow.appendChild(editInput);
  editRow.appendChild(editSelect);
  editRow.appendChild(actions);
  body.appendChild(editRow);
  body.appendChild(hint);

  const doSave   = () => saveEdit(id, editInput.value, editSelect.value);
  const doCancel = () => cancelEdit();

  saveBtn.addEventListener('click', doSave);
  cancelBtn.addEventListener('click', doCancel);
  editInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter')  { e.preventDefault(); doSave(); }
    if (e.key === 'Escape') { e.preventDefault(); doCancel(); }
  });

  editInput.focus();
  editInput.select();
}

/** 수정 저장 */
function saveEdit(id, newText, newCategory) {
  const text = newText.trim();
  if (!text) { shakeElement(document.querySelector(`[data-id="${id}"] .edit-input`)); return; }

  tasks = tasks.map((t) =>
    t.id === id ? { ...t, text, category: newCategory } : t
  );
  editingId = null;
  saveTasks();
  render();
  showToast('수정되었습니다.', 'success');
  announce('할 일이 수정되었습니다.');
}

/** 수정 취소 */
function cancelEdit() {
  editingId = null;
  render();
}

/* ──────────────────────────────────────────────────────
   내보내기 / 가져오기
   ────────────────────────────────────────────────────── */

/** JSON 파일로 현재 데이터 내보내기 */
function handleExport() {
  if (tasks.length === 0) {
    showToast('내보낼 할 일이 없습니다.', 'info');
    return;
  }

  const payload = {
    version:    1,
    exportedAt: new Date().toISOString(),
    tasks,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `my-tasks-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  announce(`할 일 ${tasks.length}개를 파일로 내보냈습니다.`);
  showToast(`${tasks.length}개 할 일을 내보냈습니다.`, 'success');
}

/**
 * JSON 파일에서 데이터 가져오기
 * - 파일 파싱·검증
 * - 현재 데이터가 있으면 교체(자동 백업) 또는 병합 선택
 * @param {File} file
 */
function handleImport(file) {
  // 파일 input 초기화 (같은 파일 재선택 허용)
  importFile.value = '';

  const reader = new FileReader();
  reader.onerror = () => showToast('파일 읽기 오류가 발생했습니다.', 'error');

  reader.onload = (e) => {
    let parsed;
    try {
      parsed = JSON.parse(e.target.result);
    } catch {
      showToast('JSON 형식이 올바르지 않습니다.', 'error');
      return;
    }

    // 배열 직접 또는 래퍼 객체({ tasks: [...] }) 모두 지원
    const raw = Array.isArray(parsed) ? parsed : (parsed?.tasks ?? null);
    if (!Array.isArray(raw)) {
      showToast('지원하지 않는 파일 형식입니다.', 'error');
      return;
    }

    // 각 항목 유효성 검사 및 정규화
    const importedTasks = raw
      .filter((t) => t && typeof t.text === 'string' && t.text.trim())
      .map((t) => ({
        id:        typeof t.id === 'string' ? t.id : crypto.randomUUID(),
        text:      t.text.trim().slice(0, 200),
        category:  normalizeCategory(t.category),
        completed: Boolean(t.completed),
        createdAt: t.createdAt && !isNaN(Date.parse(t.createdAt))
                     ? t.createdAt
                     : new Date().toISOString(),
      }));

    if (importedTasks.length === 0) {
      showToast('가져올 유효한 데이터가 없습니다.', 'error');
      return;
    }

    if (tasks.length > 0) {
      // 현재 데이터가 있을 때: 교체 or 병합 선택
      const replace = confirm(
        `가져올 데이터: ${importedTasks.length}개\n현재 데이터: ${tasks.length}개\n\n` +
        `[확인] 현재 데이터를 자동 백업 후 교체합니다.\n` +
        `[취소] 현재 데이터와 병합합니다 (ID 중복 제외).`
      );

      if (replace) {
        // 자동 백업 후 교체
        handleExport();            // 현재 데이터 백업 다운로드
        tasks = importedTasks;
      } else {
        // 병합: 기존 ID와 겹치지 않는 항목만 추가
        const existingIds = new Set(tasks.map((t) => t.id));
        const newOnes     = importedTasks.filter((t) => !existingIds.has(t.id));
        tasks = [...tasks, ...newOnes];
        showToast(`${newOnes.length}개 병합됨 (중복 ${importedTasks.length - newOnes.length}개 건너뜀)`, 'info');
      }
    } else {
      tasks = importedTasks;
    }

    saveTasks();
    render();
    if (tasks.length > 0) {
      announce(`${importedTasks.length}개의 할 일을 가져왔습니다.`);
      showToast(`${importedTasks.length}개 할 일을 가져왔습니다.`, 'success');
    }
  };

  reader.readAsText(file);
}

/* ──────────────────────────────────────────────────────
   8. 드래그 앤 드롭 (manual 정렬 전용)
   ────────────────────────────────────────────────────── */

/** dragstart — 드래그 핸들에서만 시작 허용 */
function onDragStart(e) {
  const handle = e.target.closest('.drag-handle');
  if (!handle) { e.preventDefault(); return; }

  const li = handle.closest('.task-item');
  if (!li) return;

  dragSrcId = li.dataset.id;
  li.classList.add('is-dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', dragSrcId);

  // 드래그 이미지: 항목 전체 모양 유지
  try {
    e.dataTransfer.setDragImage(li, 24, li.offsetHeight / 2);
  } catch (_) { /* 구형 브라우저 호환 */ }
}

/** dragover — 드롭 가능 여부 표시 */
function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  const li = e.target.closest('.task-item');
  if (!li || li.dataset.id === dragSrcId) return;

  // 기존 인디케이터 제거
  taskList.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach((el) => {
    el.classList.remove('drag-over-top', 'drag-over-bottom');
  });

  // 마우스 위치에 따라 위/아래 표시
  const rect  = li.getBoundingClientRect();
  const half  = rect.top + rect.height / 2;
  const above = e.clientY < half;
  li.classList.add(above ? 'drag-over-top' : 'drag-over-bottom');
  dragOverId = li.dataset.id;
}

/** dragleave — 인디케이터 제거 */
function onDragLeave(e) {
  const li = e.target.closest('.task-item');
  if (li) li.classList.remove('drag-over-top', 'drag-over-bottom');
}

/** drop — 배열 재정렬 */
function onDrop(e) {
  e.preventDefault();

  const li = e.target.closest('.task-item');
  if (!li || !dragSrcId || dragSrcId === li.dataset.id) return;

  const srcIdx  = tasks.findIndex((t) => t.id === dragSrcId);
  const dstIdx  = tasks.findIndex((t) => t.id === li.dataset.id);
  if (srcIdx === -1 || dstIdx === -1) return;

  // 위치에 따라 앞/뒤 삽입 결정
  const rect    = li.getBoundingClientRect();
  const insertAfter = e.clientY >= rect.top + rect.height / 2;
  const finalDst = insertAfter ? dstIdx : dstIdx;

  const [moved] = tasks.splice(srcIdx, 1);
  const adjustedDst = srcIdx < finalDst ? finalDst : finalDst + (insertAfter ? 1 : 0);
  tasks.splice(Math.min(adjustedDst, tasks.length), 0, moved);

  saveTasks();
  render();
}

/** dragend — 모든 드래그 상태 초기화 */
function onDragEnd() {
  taskList.querySelectorAll('.task-item').forEach((el) => {
    el.classList.remove('is-dragging', 'drag-over-top', 'drag-over-bottom');
  });
  dragSrcId  = null;
  dragOverId = null;
}

/* ──────────────────────────────────────────────────────
   9. 렌더 (목록)
   ────────────────────────────────────────────────────── */

/**
 * 필터·검색어·정렬을 적용한 표시용 배열 반환
 * 항상 미완료 항목이 먼저 오고, 각 그룹 내에서 sortBy에 따라 정렬됩니다.
 */
function getVisibleTasks() {
  const q = searchQuery.toLowerCase();

  // 1. 카테고리 필터 + 검색어 필터
  const filtered = tasks.filter((t) => {
    const matchCat    = activeFilter === 'all' || normalizeCategory(t.category) === activeFilter;
    const matchSearch = !q || t.text.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  // 2. 미완료/완료 그룹 분리
  const incomplete = filtered.filter((t) => !t.completed);
  const complete   = filtered.filter((t) =>  t.completed);

  // 3. 정렬 함수 적용
  const sortFn = getSortFn();
  return [...incomplete.sort(sortFn), ...complete.sort(sortFn)];
}

/**
 * 현재 sortBy에 맞는 비교 함수 반환
 * 'manual'과 'completion'은 tasks 배열 원래 순서를 유지(stable sort, () => 0)
 */
function getSortFn() {
  switch (sortBy) {
    case 'date-desc': return (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
    case 'date-asc':  return (a, b) => new Date(a.createdAt) - new Date(b.createdAt);
    case 'category': {
      const order = { work: 0, personal: 1, study: 2 };
      return (a, b) =>
        (order[normalizeCategory(a.category)] ?? 9) -
        (order[normalizeCategory(b.category)] ?? 9);
    }
    default: return () => 0; // 'manual' / 'completion': 삽입 순서 유지
  }
}

/** 메인 렌더 함수 */
function render() {
  // innerHTML 초기화 (이전 항목 제거)
  taskList.innerHTML = '';
  renderDashboard();

  const sorted = getVisibleTasks();

  if (sorted.length === 0) {
    emptyMsg.classList.add('visible');
    emptyMsg.textContent = searchQuery
      ? `"${searchQuery}"에 해당하는 할 일이 없습니다.`
      : '할 일이 없습니다. 추가해보세요!';
    return;
  }
  emptyMsg.classList.remove('visible');

  // DocumentFragment로 한 번에 DOM에 삽입 (reflow 최소화)
  const frag = document.createDocumentFragment();

  sorted.forEach((task) => {
    const li      = document.createElement('li');
    li.className  = 'task-item' + (task.completed ? ' completed' : '');
    li.dataset.id = task.id;
    li.setAttribute('role', 'listitem');
    li.setAttribute('aria-label',
      `${task.completed ? '완료: ' : ''}[${CATEGORIES[normalizeCategory(task.category)].label}] ${task.text}`
    );

    // 추가 애니메이션 (lastAddedId와 일치할 때만)
    if (task.id === lastAddedId) li.classList.add('adding');

    /* ── 드래그 핸들 (manual 정렬일 때만 표시) ── */
    if (sortBy === 'manual') {
      const handle = document.createElement('span');
      handle.className = 'drag-handle';
      handle.draggable = true;
      handle.setAttribute('aria-hidden', 'true');
      handle.setAttribute('title', '드래그하여 순서 변경');
      li.appendChild(handle);
    }

    /* ── 체크박스 ── */
    const checkbox     = document.createElement('input');
    checkbox.type      = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked   = task.completed;
    checkbox.setAttribute('aria-label', task.completed ? '완료 취소' : '완료로 표시');
    checkbox.addEventListener('change', () => handleToggle(task.id));

    /* ── 카테고리 태그 ── */
    const catKey      = normalizeCategory(task.category);
    const tag         = document.createElement('span');
    tag.className     = `category-tag ${catKey}`;
    tag.textContent   = CATEGORIES[catKey].label;
    tag.setAttribute('aria-label', `카테고리: ${CATEGORIES[catKey].label}`);

    /* ── 본문 (텍스트 + 메타) ── */
    const body    = document.createElement('div');
    body.className = 'task-body';

    const textSpan     = document.createElement('span');
    textSpan.className = 'task-text';
    textSpan.title     = '더블클릭으로 수정';
    textSpan.setAttribute('role', 'button');
    textSpan.setAttribute('aria-label', `${task.text} — 더블클릭하여 수정`);
    textSpan.addEventListener('dblclick', () => enterEditMode(task.id));

    // 검색어 하이라이트 또는 일반 텍스트
    if (searchQuery && task.text.toLowerCase().includes(searchQuery.toLowerCase())) {
      textSpan.innerHTML = highlightText(task.text, searchQuery);
    } else {
      textSpan.textContent = task.text;
    }

    const meta       = document.createElement('span');
    meta.className   = 'task-meta';
    meta.textContent = timeAgo(task.createdAt);
    meta.setAttribute('aria-label', `추가된 시각: ${new Date(task.createdAt).toLocaleString('ko-KR')}`);

    body.appendChild(textSpan);
    body.appendChild(meta);

    /* ── 삭제 버튼 ── */
    const deleteBtn     = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '&#10005;';
    deleteBtn.setAttribute('aria-label', `"${task.text}" 삭제`);
    deleteBtn.addEventListener('click', () => handleDelete(task.id));

    li.appendChild(checkbox);
    li.appendChild(tag);
    li.appendChild(body);
    li.appendChild(deleteBtn);
    frag.appendChild(li);
  });

  taskList.appendChild(frag); // 단일 DOM 삽입
  lastAddedId = null;
}

/* ──────────────────────────────────────────────────────
   10. 대시보드
   ────────────────────────────────────────────────────── */

/** 대시보드 전체 업데이트 (render() 호출 시마다 실행) */
function renderDashboard() {
  const total     = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const remaining = total - completed;
  const pct       = total === 0 ? 0 : Math.round((completed / total) * 100);

  // 전체 진행률
  document.getElementById('dashSummary').textContent  = `${completed}/${total} 완료 (${pct}%)`;
  document.getElementById('progressFill').style.width = `${pct}%`;
  document.querySelector('.progress-track').setAttribute('aria-valuenow', pct);

  // 응원 메시지
  document.getElementById('dashEncourage').textContent = getEncouragement(pct, total);

  // 오늘 추가된 할 일 수
  const todayStr   = new Date().toDateString();
  const todayCount = tasks.filter(
    (t) => new Date(t.createdAt).toDateString() === todayStr
  ).length;
  document.getElementById('dashTodayNum').textContent = todayCount;

  // 카테고리별 미니 통계
  ['work', 'personal', 'study'].forEach((cat) => {
    const catTasks     = tasks.filter((t) => normalizeCategory(t.category) === cat);
    const catCompleted = catTasks.filter((t) => t.completed).length;
    const elId = `cat${cat.charAt(0).toUpperCase() + cat.slice(1)}Prog`;
    document.getElementById(elId).textContent = `${catCompleted}/${catTasks.length}`;
  });

  // 오늘의 격언
  document.getElementById('dashQuote').textContent = getTodayQuote();

  // 남은 할 일 배지 (0이면 숨김)
  remainingBadge.textContent  = remaining;
  remainingBadge.style.display = remaining > 0 ? 'inline-flex' : 'none';

  // 완료 삭제 버튼 노출 여부
  clearCompletedBtn.style.display = completed > 0 ? '' : 'none';
}

/* ──────────────────────────────────────────────────────
   11. 테마
   ────────────────────────────────────────────────────── */

/** data-theme 속성 적용 및 토글 스위치 동기화 */
function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  themeToggle.checked = isDark;
}

/** 다크/라이트 모드 전환 */
function toggleTheme() {
  isDark = !isDark;
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  applyTheme();
  announce(isDark ? '다크 모드로 전환됨' : '라이트 모드로 전환됨');
  showToast(isDark ? '다크 모드로 전환했습니다.' : '라이트 모드로 전환했습니다.', 'info');
}

/* ──────────────────────────────────────────────────────
   12. 피드백 (토스트 · Shake · 스크린리더 공지)
   ────────────────────────────────────────────────────── */

/**
 * 일반 토스트 알림
 * @param {string} message 표시할 메시지
 * @param {'info'|'success'|'error'|'warn'} type 색상 테마
 * @param {number} duration 표시 시간(ms), 기본 2500
 */
function showToast(message, type = 'info', duration = 2500) {
  const container = document.getElementById('toastContainer');
  const toast     = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // 두 번의 rAF로 transition 활성화 후 클래스 추가
  requestAnimationFrame(() =>
    requestAnimationFrame(() => toast.classList.add('toast-show'))
  );

  setTimeout(() => dismissToast(toast), duration);
}

/**
 * 되돌리기 버튼이 포함된 토스트 알림 (삭제 시 사용)
 * @param {string} message
 */
function showUndoToast(message) {
  const container = document.getElementById('toastContainer');
  const toast     = document.createElement('div');
  toast.className = 'toast toast-info';

  const text    = document.createElement('span');
  text.textContent = message;

  const undoBtn = document.createElement('button');
  undoBtn.className   = 'toast-undo-btn';
  undoBtn.textContent = '되돌리기';
  undoBtn.setAttribute('aria-label', '삭제 취소');

  toast.appendChild(text);
  toast.appendChild(undoBtn);
  container.appendChild(toast);

  requestAnimationFrame(() =>
    requestAnimationFrame(() => toast.classList.add('toast-show'))
  );

  // 4초 후 자동 사라짐
  const timer = setTimeout(() => dismissToast(toast), 4000);

  // 되돌리기 클릭 시 즉시 실행 후 토스트 닫기
  undoBtn.addEventListener('click', () => {
    clearTimeout(timer);
    dismissToast(toast);
    undoDelete();
  });
}

/** 토스트 사라짐 처리 */
function dismissToast(toast) {
  toast.classList.remove('toast-show');
  toast.addEventListener('transitionend', () => toast.remove(), { once: true });
}

/**
 * 빈 입력 등 오류 피드백 — 요소 흔들기 애니메이션
 * @param {HTMLElement|null} el
 */
function shakeElement(el) {
  if (!el) return;
  el.style.transition = 'transform 0.08s ease';
  const steps = [7, -7, 5, -5, 2, -2, 0];
  let i = 0;
  const next = () => {
    if (i >= steps.length) { el.style.transform = ''; el.style.transition = ''; return; }
    el.style.transform = `translateX(${steps[i++]}px)`;
    setTimeout(next, 55);
  };
  next();
}

/**
 * 스크린 리더용 즉시 공지 (aria-live="polite")
 * @param {string} message
 */
function announce(message) {
  srAnnounce.textContent = ''; // 리셋
  // 다음 프레임에서 설정해야 동일 메시지도 다시 읽힘
  requestAnimationFrame(() => { srAnnounce.textContent = message; });
}

/* ──────────────────────────────────────────────────────
   13. 영속성
   ────────────────────────────────────────────────────── */

/** tasks 배열을 localStorage에 저장 */
function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    // 저장 공간 부족(QuotaExceededError) 등 예외 처리
    showToast('저장 공간이 부족합니다. 일부 항목을 삭제해주세요.', 'error');
  }
}

/** tasks 배열을 localStorage에서 로드 (파싱 오류 시 빈 배열 반환) */
function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    // 각 항목의 필수 필드 보정 (구버전 데이터 호환)
    return Array.isArray(parsed)
      ? parsed.map((t) => ({
          id:        t.id        ?? crypto.randomUUID(),
          text:      t.text      ?? '',
          category:  normalizeCategory(t.category),
          completed: Boolean(t.completed),
          createdAt: t.createdAt ?? new Date().toISOString(),
        })).filter((t) => t.text.trim())
      : [];
  } catch {
    return [];
  }
}

function saveFilter() { localStorage.setItem(FILTER_KEY, activeFilter); }
function loadFilter() {
  const v = localStorage.getItem(FILTER_KEY);
  return FILTER_KEYS.includes(v) ? v : 'all';
}

function saveSortPref() { localStorage.setItem(SORT_KEY, sortBy); }
function loadSort() {
  const v = localStorage.getItem(SORT_KEY);
  return SORT_KEYS.includes(v) ? v : 'date-desc';
}
