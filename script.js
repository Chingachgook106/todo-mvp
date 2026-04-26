// == 1. STORAGE LAYER (Слой хранения) ==
const STORAGE_KEY = 'todo_tasks_v1';

function saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
    const tasksJSON = localStorage.getItem(STORAGE_KEY);
    return tasksJSON ? JSON.parse(tasksJSON) : [];
}


// == 2. CORE / TASK MANAGER (Ядро логики) ==
let tasks = loadTasks();
let currentFilter = 'all'; // Состояние фильтра

function addTask(text) {
    const newTask = {
        id: Date.now(),
        text: text,
        completed: false
    };
    tasks.push(newTask);
    saveTasks(tasks);
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks(tasks);
    }
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
}

function updateTask(id, newText) {
    const task = tasks.find(t => t.id === id);
    if (task && newText.trim() !== '') {
        task.text = newText.trim();
        saveTasks(tasks);
    }
}

function clearCompleted() {
    tasks = tasks.filter(t => !t.completed);
    saveTasks(tasks);
}

function getFilteredTasks() {
    if (currentFilter === 'active') {
        return tasks.filter(t => !t.completed);
    }
    if (currentFilter === 'completed') {
        return tasks.filter(t => t.completed);
    }
    return tasks;
}


// == 3. RENDERING (Отрисовка) ==
const taskListElement = document.querySelector('#task-list');
const counterElement = document.querySelector('#tasks-counter');

function render() {
    const filteredTasks = getFilteredTasks();
    
    // Очистка списка
    taskListElement.innerHTML = '';

    if (filteredTasks.length === 0) {
        const message = document.createElement('div');
        message.className = 'empty-message';
        message.textContent = tasks.length === 0 ? 'Список пуст. Добавьте первую задачу!' : 'Нет задач в этой категории';
        taskListElement.appendChild(message);
    } else {
        // Отрисовка задач
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            li.dataset.taskId = task.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;

            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = task.text;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Удалить';

            li.append(checkbox, span, deleteBtn);
            taskListElement.appendChild(li);
        });
    }

    // Обновление счетчика
    const activeCount = tasks.filter(t => !t.completed).length;
    counterElement.textContent = `Осталось задач: ${activeCount}`;
}


// == 4. CONTROLLER (Связующий слой) ==
const addTaskInput = document.querySelector('#new-task-input');
const addTaskButton = document.querySelector('#add-task-button');
const clearCompletedButton = document.querySelector('#clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');

// Очистка выполненных
clearCompletedButton.addEventListener('click', () => {
    clearCompleted();
    render();
});

// Добавление через кнопку
addTaskButton.addEventListener('click', () => {
    const text = addTaskInput.value.trim();
    if (text) {
        addTask(text);
        addTaskInput.value = '';
        render();
    }
});

// Добавление через Enter
addTaskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTaskButton.click();
    }
});

// Делегирование событий для списка
taskListElement.addEventListener('click', (event) => {
    const target = event.target;
    const listItem = target.closest('li');
    if (!listItem) return;

    const id = Number(listItem.dataset.taskId);

    if (target.classList.contains('task-checkbox')) {
        toggleTask(id);
        render();
    } else if (target.classList.contains('delete-btn')) {
        deleteTask(id);
        render();
    } else if (target.classList.contains('task-text')) {
        // РЕДАКТИРОВАНИЕ
        const currentText = target.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'edit-input';
        input.value = currentText;

        target.replaceWith(input);
        input.focus();

        const saveEdit = () => {
            updateTask(id, input.value);
            render();
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
    }
});

// Обработка фильтров
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Убираем активный класс у всех
        filterButtons.forEach(b => b.classList.remove('active'));
        // Добавляем нажатому
        btn.classList.add('active');
        
        currentFilter = btn.dataset.filter;
        render();
    });
});


// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    render();
});