document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const taskForm = document.getElementById('task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskCategoryInput = document.getElementById('task-category');
    const taskPriorityInput = document.getElementById('task-priority');
    const taskDueDateInput = document.getElementById('task-duedate');
    const tasksListEl = document.getElementById('tasks-list');
    const emptyStateEl = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const sortSelect = document.getElementById('sort-select');
    const activeViewTitle = document.getElementById('active-view-title');
    const currentDateEl = document.getElementById('current-date');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');

    const countAllEl = document.getElementById('count-all');
    const countActiveEl = document.getElementById('count-active');
    const countCompletedEl = document.getElementById('count-completed');

    const navItems = document.querySelectorAll('.nav-item');

    // Application State
    let tasks = JSON.parse(localStorage.getItem('zenith_tasks')) || [
        {
            id: '1',
            title: 'Welcome to Zenith Task Manager 🎉',
            category: 'Personal',
            priority: 'high',
            dueDate: new Date().toISOString().split('T')[0],
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            title: 'Review project requirements & design system',
            category: 'Work',
            priority: 'medium',
            dueDate: '',
            completed: false,
            createdAt: new Date(Date.now() - 3600000).toISOString()
        }
    ];

    let currentFilter = 'all';
    let currentCategory = null;
    let searchQuery = '';
    let currentSort = 'date-added';

    // Initialize Date display
    const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
    currentDateEl.textContent = new Date().toLocaleDateString('en-US', options);

    // Save to LocalStorage
    function saveTasks() {
        localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
    }

    // Render application
    function render() {
        updateCounts();
        
        // Filter tasks
        let filteredTasks = tasks.filter(task => {
            // View filter (all, active, completed)
            if (currentFilter === 'active' && task.completed) return false;
            if (currentFilter === 'completed' && !task.completed) return false;

            // Category filter
            if (currentCategory && task.category !== currentCategory) return false;

            // Search filter
            if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

            return true;
        });

        // Sort tasks
        filteredTasks.sort((a, b) => {
            if (currentSort === 'date-added') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (currentSort === 'due-date') {
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            } else if (currentSort === 'priority') {
                const priorityWeight = { high: 3, medium: 2, low: 1 };
                return priorityWeight[b.priority] - priorityWeight[a.priority];
            }
        });

        // Render HTML
        tasksListEl.innerHTML = '';

        if (filteredTasks.length === 0) {
            emptyStateEl.classList.remove('hidden');
        } else {
            emptyStateEl.classList.add('hidden');
            filteredTasks.forEach(task => {
                const card = document.createElement('div');
                card.className = `task-card ${task.completed ? 'completed' : ''}`;
                card.innerHTML = `
                    <div class="task-left">
                        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                        <div class="task-details">
                            <span class="task-title">${escapeHtml(task.title)}</span>
                            <div class="task-meta">
                                <span class="tag tag-${task.category.toLowerCase()}">${task.category}</span>
                                <span class="priority-badge priority-${task.priority}">${task.priority.toUpperCase()}</span>
                                ${task.dueDate ? `<span>📅 ${task.dueDate}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="action-btn delete" data-id="${task.id}" title="Delete Task">🗑️</button>
                    </div>
                `;
                tasksListEl.appendChild(card);
            });
        }
    }

    // Update Sidebar Counts
    function updateCounts() {
        countAllEl.textContent = tasks.length;
        countActiveEl.textContent = tasks.filter(t => !t.completed).length;
        countCompletedEl.textContent = tasks.filter(t => t.completed).length;
    }

    // Helper to sanitize text
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event Listeners: Add Task
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = taskTitleInput.value.trim();
        if (!title) return;

        const newTask = {
            id: Date.now().toString(),
            title,
            category: taskCategoryInput.value,
            priority: taskPriorityInput.value,
            dueDate: taskDueDateInput.value,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
        saveTasks();
        render();

        // Reset form
        taskTitleInput.value = '';
        taskDueDateInput.value = '';
        taskPriorityInput.value = 'medium';
        taskTitleInput.focus();
    });

    // Event Listeners: Task list actions (toggle & delete)
    tasksListEl.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        if (!id) return;

        if (e.target.classList.contains('task-checkbox')) {
            const task = tasks.find(t => t.id === id);
            if (task) {
                task.completed = e.target.checked;
                saveTasks();
                render();
            }
        } else if (e.target.classList.contains('delete') || e.target.closest('.delete')) {
            const deleteBtn = e.target.closest('.delete') || e.target;
            const taskId = deleteBtn.dataset.id;
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            render();
        }
    });

    // Navigation Filtering
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            if (item.dataset.filter) {
                currentFilter = item.dataset.filter;
                currentCategory = null;
                activeViewTitle.textContent = item.dataset.filter.charAt(0).toUpperCase() + item.dataset.filter.slice(1) + ' Tasks';
            } else if (item.dataset.category) {
                currentCategory = item.dataset.category;
                currentFilter = 'all';
                activeViewTitle.textContent = currentCategory + ' Tasks';
            }

            render();
        });
    });

    // Search Input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
    });

    // Sort Select
    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        render();
    });

    // Clear Completed
    clearCompletedBtn.addEventListener('click', () => {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        render();
    });

    // Initial Render
    render();
});
