const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const progressBar = document.getElementById('progressBar');
const filterBtns = document.querySelectorAll('.filter-btn');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let filter = 'all';

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    render();
}

function render() {
    taskList.innerHTML = '';
    const filtered = tasks.filter(t => {
        if (filter === 'active') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
    });

    filtered.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        li.innerHTML = `
            <span>${task.text}</span>
            <button onclick="toggleTask(${tasks.indexOf(task)})">${task.completed ? 'Undo' : 'Done'}</button>
            <button onclick="deleteTask(${tasks.indexOf(task)})">Delete</button>
        `;
        taskList.appendChild(li);
    });

    const completedCount = tasks.filter(t => t.completed).length;
    const progress = tasks.length ? (completedCount / tasks.length) * 100 : 0;
    progressBar.style.width = `${progress}%`;
}

window.toggleTask = (index) => {
    tasks[index].completed = !tasks[index].completed;
    saveTasks();
};

window.deleteTask = (index) => {
    tasks.splice(index, 1);
    saveTasks();
};

addTaskBtn.addEventListener('click', () => {
    if (!taskInput.value) return;
    tasks.push({ text: taskInput.value, completed: false });
    taskInput.value = '';
    saveTasks();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filter = e.target.dataset.filter;
        render();
    });
});

render();