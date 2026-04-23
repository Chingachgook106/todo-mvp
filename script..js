// == 1. STORAGE LAYER (Слой хранения) ==
// Этот слой ничего не знает о приложении. Его задача — просто читать и писать.
// Он изолирован. Если завтра мы захотим хранить задачи в базе данных,
// мы просто перепишем эти две функции, а остальное трогать не будем.

const STORAGE_KEY = 'todo_tasks_v1'; // Ключ для localStorage

// Сохраняет массив задач в localStorage
function saveTasks(tasks) {
    // Преобразуем массив объектов в строку (JSON)
    const tasksJSON = JSON.stringify(tasks);
    localStorage.setItem(STORAGE_KEY, tasksJSON);
}

// Загружает задачи из localStorage
// Если данных нет, возвращает пустой массив
function loadTasks() {
    const tasksJSON = localStorage.getItem(STORAGE_KEY);
    return tasksJSON ? JSON.parse(tasksJSON) : [];
}


// == 2. CORE / TASK MANAGER (Ядро логики) ==
// Это "мозг" приложения. Здесь живёт состояние (список задач)
// и правила, по которым оно меняется.

let tasks = []; // Состояние приложения (живёт в памяти)

// Инициализация: при запуске подгружаем задачи из хранилища
tasks = loadTasks();

// --- Методы для изменения состояния ---
function addTask(text) {
    const newTask = {
        id: Date.now(), // Простой способ создать уникальный ID
        text: text,
        completed: false
    };
    tasks.push(newTask);
    saveTasks(tasks); // Сохраняем изменения
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks(tasks);
    }
}

function deleteTask(id) {
    // Создаём новый массив без удалённой задачи
    tasks = tasks.filter(t => t.id !== id);
    saveTasks(tasks);
}

// Метод для получения данных (чтобы UI мог их отрисовать)
function getTasks() {
    return tasks;
}


// == 3. RENDERING (Отрисовка) ==
//  Этот слой отвечает только за то, чтобы данные из Core превратились в HTML на экране. Он не принимает решений.

const taskListElement = document.querySelector('#task-list'); // Ссылка на <ul> или <div>

function render() {
    // 1. Получаем актуальные данные из Core
    const currentTasks = getTasks();

    // 2. Очищаем текущий список на экране, чтобы не было дублей
    taskListElement.innerHTML = '';

    // 3. Проходим по каждой задаче и создаём HTML-элемент для неё
    currentTasks.forEach(task => {
        // Создаём элемент списка <li>
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : ''; // Добавляем класс, если задача выполнена

        // Создаём текст задачи (можно обернуть в <span>)
        const taskText = document.createElement('span');
        taskText.textContent = task.text;
        li.appendChild(taskText);

        // Создаём чекбокс для выполнения
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        li.appendChild(checkbox);

        // Создаём кнопку удаления
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Удалить';
        li.appendChild(deleteButton);

        // Добавляем готовый элемент в список на странице
        taskListElement.appendChild(li);
    });
}


// == 4. CONTROLLER (Связующий слой) ==
// Этот слой "слушает" пользователя и связывает его действия с логикой.
// Он знает и про UI, и про Core, но сам ничего не меняет.

const addTaskInput = document.querySelector('#new-task-input');
const addTaskButton = document.querySelector('#add-task-button');

// --- Обработчик добавления задачи ---
addTaskButton.addEventListener('click', () => {
    const taskText = addTaskInput.value.trim(); // Убираем лишние пробелы

    if (taskText !== '') {
        // 1. Вызываем логику из Core
        addTask(taskText);

        // 2. Очищаем поле ввода
        addTaskInput.value = '';

        // 3. Просим UI обновиться
        render();
    }
});


// --- Обработчик кликов по списку задач (чекбокс и кнопка) ---
taskListElement.addEventListener('click', (event) => {
    const target = event.target;
    const listItem = target.closest('li'); // Находим родительский <li>
    
    if (!listItem) return; // Если кликнули не по элементу списка, выходим

    const taskId = parseInt(listItem.dataset.taskId); // Получаем ID задачи из data-атрибута

    if (target.type === 'checkbox') {
        // Если кликнули по чекбоксу — вызываем логику переключения статуса
        toggleTask(taskId);
        render(); // Обновляем UI
    } else if (target.tagName === 'BUTTON') {
        // Если кликнули по кнопке — вызываем логику удаления
        deleteTask(taskId);
        render(); // Обновляем UI
    }
});


// == Точка входа (Инициализация приложения) ==
// Этот код выполнится один раз при загрузке страницы.
document.addEventListener('DOMContentLoaded', () => {
    // При старте приложения сразу рисуем то, что есть в хранилище
    render();
});