/* =====================
   ToDoアプリ app.js
   Day 1 of 30 — 2026-06-11
   ===================== */

'use strict';

// ---- 状態 -----------------------------------------------------------------

/** @type {{ id: number, text: string, done: boolean }[]} */
let tasks = loadTasks();
let currentFilter = 'all';   // 'all' | 'active' | 'done'

// ---- DOM 参照 --------------------------------------------------------------

const taskInput    = document.getElementById('taskInput');
const addBtn       = document.getElementById('addBtn');
const taskList     = document.getElementById('taskList');
const emptyState   = document.getElementById('emptyState');
const taskCount    = document.getElementById('taskCount');
const clearDoneBtn = document.getElementById('clearDoneBtn');
const filterBtns   = document.querySelectorAll('.filter-btn');

// ---- 初期化 ----------------------------------------------------------------

render();
taskInput.focus();

// ---- イベント --------------------------------------------------------------

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

clearDoneBtn.addEventListener('click', () => {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  render();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filterBtns.forEach(b => b.classList.toggle('active', b === btn));
    render();
  });
});

// ---- 機能 ------------------------------------------------------------------

function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.focus();
    return;
  }

  tasks.unshift({
    id:   Date.now(),
    text,
    done: false,
  });

  taskInput.value = '';
  taskInput.focus();

  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

// ---- 描画 ------------------------------------------------------------------

function getFilteredTasks() {
  if (currentFilter === 'active') return tasks.filter(t => !t.done);
  if (currentFilter === 'done')   return tasks.filter(t =>  t.done);
  return tasks;
}

function render() {
  const filtered = getFilteredTasks();

  // タスク数（全件 / 未完了）
  const activeCount = tasks.filter(t => !t.done).length;
  taskCount.textContent = `未完了 ${activeCount} 件`;

  // リスト描画
  taskList.innerHTML = '';

  filtered.forEach(task => {
    const li = createTaskElement(task);
    taskList.appendChild(li);
  });

  // 空ステート
  emptyState.classList.toggle('visible', filtered.length === 0);
}

/**
 * @param {{ id: number, text: string, done: boolean }} task
 * @returns {HTMLLIElement}
 */
function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = `task-item${task.done ? ' done' : ''}`;
  li.dataset.id = task.id;

  // チェックボタン
  const checkBtn = document.createElement('button');
  checkBtn.className = 'check-btn';
  checkBtn.setAttribute('aria-label', task.done ? '未完了に戻す' : '完了にする');
  checkBtn.innerHTML = `
    <svg viewBox="0 0 12 9">
      <polyline points="1 4.5 4.5 8 11 1"/>
    </svg>`;
  checkBtn.addEventListener('click', () => toggleTask(task.id));

  // テキスト
  const span = document.createElement('span');
  span.className = 'task-text';
  span.textContent = task.text;

  // 削除ボタン
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.setAttribute('aria-label', 'タスクを削除');
  deleteBtn.innerHTML = `
    <svg viewBox="0 0 24 24">
      <line x1="18" y1="6"  x2="6"  y2="18"/>
      <line x1="6"  y1="6"  x2="18" y2="18"/>
    </svg>`;
  deleteBtn.addEventListener('click', () => deleteTask(task.id));

  li.appendChild(checkBtn);
  li.appendChild(span);
  li.appendChild(deleteBtn);

  return li;
}

// ---- 永続化（localStorage） ------------------------------------------------

function saveTasks() {
  try {
    localStorage.setItem('todo_tasks', JSON.stringify(tasks));
  } catch (e) {
    console.warn('保存に失敗しました:', e);
  }
}

function loadTasks() {
  try {
    const raw = localStorage.getItem('todo_tasks');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}