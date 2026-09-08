document.addEventListener('DOMContentLoaded', () => {
    // State Management
    let tasks = JSON.parse(localStorage.getItem('zenith_tasks')) || [
        {
            id: '1',
            title: 'Design high-conversion landing page',
            category: 'Work',
            priority: 'Urgent',
            dueDate: new Date().toISOString().split('T')[0],
            description: 'Focus on clean glassmorphism and clear CTAs.',
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: '2',
            title: 'Morning workout & cardio session',
            category: 'Health',
            priority: 'High',
            dueDate: new Date().toISOString().split('T')[0],
            description: '30 mins HIIT running + stretching routine.',
            completed: true,
            createdAt: new Date().toISOString()
        },
        {
            id: '3',
            title: 'Read 2 chapters of Clean Code',
            category: 'Study',
            priority: 'Medium',
            dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
            description: 'Study chapter on meaningful names and functions.',
            completed: false,
            createdAt: new Date().toISOString()
        }
    ];

    let currentFilter = 'all';
    let currentCategory = null;
    let currentSearch = '';
    let currentSort = 'date-desc';

    // DOM Elements
    const tasksListEl = document.getElementById('tasks-list');
    const emptyStateEl = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const taskModal = document.getElementById('task-modal');
    const analyticsModal = document.getElementById('analytics-modal');
    const taskForm = document.getElementById('task-form');
    const taskModalTitle = document.getElementById('modal-title');
    const taskIdInput = document.getElementById('task-id');
    const taskTitleInput = document.getElementById('task-title');
    const taskCategoryInput = document.getElementById('task-category');
    const taskPriorityInput = document.getElementById('task-priority');
    const taskDueDateInput = document.getElementById('task-duedate');
    const taskDescInput = document.getElementById('task-desc');
    const sortSelect = document.getElementById('sort-select');
    const sectionTitleEl = document.getElementById('section-title');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeTextEl = document.getElementById('theme-text');
    
    // Counters
    const countAllEl = document.getElementById('count-all');
    const countTodayEl = document.getElementById('count-today');
    const countUrgentEl = document.getElementById('count-urgent');
    const countCompletedEl = document.getElementById('count-completed');
    
    // Stats
    const statTotalEl = document.getElementById('stat-total');
    const statCompletedEl = document.getElementById('stat-completed');
    const statPendingEl = document.getElementById('stat-pending');
    const statRateEl = document.getElementById('stat-rate');

    // Buttons
    const openModalBtn = document.getElementById('open-modal-btn');
    const emptyCreateBtn = document.getElementById('empty-create-btn');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    const analyticsBtn = document.getElementById('analytics-btn');
    const analyticsCloseBtn = document.getElementById('analytics-close-btn');
    const analyticsDoneBtn = document.getElementById('analytics-done-btn');
    const exportBtn = document.getElementById('export-btn');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');

    // Init App
    function init() {
        initTheme();
        setupEventListeners();
        render();
    }

    // Theme Handler
    function initTheme() {
        const savedTheme = localStorage.getItem('zenith_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
        updateThemeButton(savedTheme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('zenith_theme', newTheme);
        updateThemeButton(newTheme);
    }

    function updateThemeButton(theme) {
        themeTextEl.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }

    // Save to LocalStorage
    function saveTasks() {
        localStorage.setItem('zenith_tasks', JSON.stringify(tasks));
    }

    // Event Listeners
    function setupEventListeners() {
        // Navigation filters
        document.querySelectorAll('.sidebar .nav-item[data-filter]').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.sidebar .nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                currentFilter = item.getAttribute('data-filter');
                currentCategory = null;
                render();
            });
        });

        // Category filters
        document.querySelectorAll('#category-filters .nav-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('.sidebar .nav-item').forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                currentCategory = item.getAttribute('data-category');
                currentFilter = 'category';
                render();
            });
        });

        // Search & Sort
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value.toLowerCase().trim();
            renderTasks();
        });

        sortSelect.addEventListener('change', (e) => {
            currentSort = e.target.value;
            renderTasks();
        });

        // Modal Controls
        openModalBtn.addEventListener('click', () => openTaskModal());
        emptyCreateBtn.addEventListener('click', () => openTaskModal());
        modalCloseBtn.addEventListener('click', closeTaskModal);
        modalCancelBtn.addEventListener('click', closeTaskModal);
        taskModal.addEventListener('click', (e) => {
            if (e.target === taskModal) closeTaskModal();
        });

        // Form Submit
        taskForm.addEventListener('submit', handleTaskSubmit);

        // Analytics Modal
        analyticsBtn.addEventListener('click', openAnalyticsModal);
        analyticsCloseBtn.addEventListener('click', closeAnalyticsModal);
        analyticsDoneBtn.addEventListener('click', closeAnalyticsModal);
        analyticsModal.addEventListener('click', (e) => {
            if (e.target === analyticsModal) closeAnalyticsModal();
        });

        // Export
        exportBtn.addEventListener('click', exportTasksData);

        // Clear Completed
        clearCompletedBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete all completed tasks?')) {
                tasks = tasks.filter(t => !t.completed);
                saveTasks();
                render();
            }
        });

        // Theme Toggle
        themeToggleBtn.addEventListener('click', toggleTheme);

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
            if (e.key === 'Escape') {
                closeTaskModal();
                closeAnalyticsModal();
            }
        });
    }

    // Modal Functions
    function openTaskModal(task = null) {
        taskForm.reset();
        if (task) {
            taskModalTitle.textContent = 'Edit Task';
            taskIdInput.value = task.id;
            taskTitleInput.value = task.title;
            taskCategoryInput.value = task.category;
            taskPriorityInput.value = task.priority;
            taskDueDateInput.value = task.dueDate;
            taskDescInput.value = task.description || '';
        } else {
            taskModalTitle.textContent = 'Create New Task';
            taskIdInput.value = '';
            taskDueDateInput.value = new Date().toISOString().split('T')[0];
        }
        taskModal.classList.remove('hidden');
        taskTitleInput.focus();
    }

    function closeTaskModal() {
        taskModal.classList.add('hidden');
    }

    function handleTaskSubmit(e) {
        e.preventDefault();
        const id = taskIdInput.value;
        const title = taskTitleInput.value.trim();
        const category = taskCategoryInput.value;
        const priority = taskPriorityInput.value;
        const dueDate = taskDueDateInput.value;
        const description = taskDescInput.value.trim();

        if (!title) return;

        if (id) {
            // Edit
            tasks = tasks.map(t => t.id === id ? { ...t, title, category, priority, dueDate, description } : t);
        } else {
            // Create
            const newTask = {
                id: Date.now().toString(),
                title,
                category,
                priority,
                dueDate,
                description,
                completed: false,
                createdAt: new Date().toISOString()
            };
            tasks.unshift(newTask);
        }

        saveTasks();
        closeTaskModal();
        render();
    }

    // Render Engine
    function render() {
        updateCounts();
        updateStats();
        updateSectionTitle();
        renderTasks();
    }

    function updateCounts() {
        const todayStr = new Date().toISOString().split('T')[0];
        countAllEl.textContent = tasks.length;
        countTodayEl.textContent = tasks.filter(t => t.dueDate === todayStr).count || tasks.filter(t => t.dueDate === todayStr).length;
        countUrgentEl.textContent = tasks.filter(t => t.priority === 'Urgent').length;
        countCompletedEl.textContent = tasks.filter(t => t.completed).length;
    }

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        statTotalEl.textContent = total;
        statCompletedEl.textContent = completed;
        statPendingEl.textContent = pending;
        statRateEl.textContent = `${rate}%`;
    }

    function updateSectionTitle() {
        if (currentFilter === 'all') sectionTitleEl.textContent = 'All Tasks';
        else if (currentFilter === 'today') sectionTitleEl.textContent = 'Tasks Due Today';
        else if (currentFilter === 'urgent') sectionTitleEl.textContent = 'Urgent Tasks';
        else if (currentFilter === 'completed') sectionTitleEl.textContent = 'Completed Tasks';
        else if (currentFilter === 'category') sectionTitleEl.textContent = `${currentCategory} Tasks`;
    }

    function renderTasks() {
        const todayStr = new Date().toISOString().split('T')[0];

        // Filter
        let filtered = tasks.filter(task => {
            if (currentFilter === 'today' && task.dueDate !== todayStr) return false;
            if (currentFilter === 'urgent' && task.priority !== 'Urgent') return false;
            if (currentFilter === 'completed' && !task.completed) return false;
            if (currentFilter === 'category' && task.category !== currentCategory) return false;

            if (currentSearch) {
                const matchTitle = task.title.toLowerCase().includes(currentSearch);
                const matchDesc = task.description && task.description.toLowerCase().includes(currentSearch);
                if (!matchTitle && !matchDesc) return false;
            }
            return true;
        });

        // Sort
        filtered.sort((a, b) => {
            if (currentSort === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
            if (currentSort === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
            if (currentSort === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
            if (currentSort === 'priority') {
                const ranks = { Urgent: 4, High: 3, Medium: 2, Low: 1 };
                return ranks[b.priority] - ranks[a.priority];
            }
            return 0;
        });

        // Render HTML
        tasksListEl.innerHTML = '';
        if (filtered.length === 0) {
            emptyStateEl.classList.remove('hidden');
            return;
        }
        emptyStateEl.classList.add('hidden');

        filtered.forEach(task => {
            const card = document.createElement('div');
            card.className = `task-card ${task.completed ? 'completed' : ''}`;
            
            const priorityClass = `priority-${task.priority.toLowerCase()}`;

            card.innerHTML = `
                <div class="task-card-header">
                    <span class="task-category-tag">${task.category}</span>
                    <span class="task-priority-tag ${priorityClass}">${task.priority}</span>
                </div>
                <h3 class="task-title">${escapeHTML(task.title)}</h3>
                ${task.description ? `<p class="task-desc">${escapeHTML(task.description)}</p>` : ''}
                <div class="task-card-footer">
                    <div class="task-duedate">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        <span>${formatDate(task.dueDate)}</span>
                    </div>
                    <div class="task-actions">
                        <button class="action-icon-btn toggle-status" title="${task.completed ? 'Mark incomplete' : 'Mark complete'}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                ${task.completed ? '<polyline points="20 6 9 17 4 12"/>' : '<circle cx="12" cy="12" r="9"/>'}
                            </svg>
                        </button>
                        <button class="action-icon-btn edit-task" title="Edit task">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button class="action-icon-btn delete delete-task" title="Delete task">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                </div>
            `;

            // Event listeners on card actions
            card.querySelector('.toggle-status').addEventListener('click', () => {
                tasks = tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t);
                saveTasks();
                render();
            });

            card.querySelector('.edit-task').addEventListener('click', () => {
                openTaskModal(task);
            });

            card.querySelector('.delete-task').addEventListener('click', () => {
                if (confirm('Delete this task?')) {
                    tasks = tasks.filter(t => t.id !== task.id);
                    saveTasks();
                    render();
                }
            });

            tasksListEl.appendChild(card);
        });
    }

    // Analytics Modal Handling
    function openAnalyticsModal() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Ring progress
        const ring = document.getElementById('analytics-ring');
        const circumference = 2 * Math.PI * 50;
        const offset = circumference - (rate / 100) * circumference;
        ring.style.strokeDashoffset = offset;

        document.getElementById('analytics-percentage').textContent = `${rate}%`;
        document.getElementById('analytics-completed-text').textContent = `${completed} of ${total} tasks completed successfully.`;
        
        const statusText = rate === 100 && total > 0 ? 'Outstanding! All tasks completed!' : rate >= 50 ? 'Great progress! Keep it up.' : 'Let\'s get things done!';
        document.getElementById('analytics-status-text').textContent = statusText;

        // Category Breakdown
        const breakdownEl = document.getElementById('category-breakdown');
        breakdownEl.innerHTML = '';
        const categories = ['Work', 'Personal', 'Study', 'Health'];
        
        categories.forEach(cat => {
            const catTotal = tasks.filter(t => t.category === cat).length;
            const catCompleted = tasks.filter(t => t.category === cat && t.completed).length;
            const item = document.createElement('div');
            item.className = 'breakdown-item';
            item.innerHTML = `
                <span><strong>${cat}</strong></span>
                <span>${catCompleted} / ${catTotal} completed</span>
            `;
            breakdownEl.appendChild(item);
        });

        analyticsModal.classList.remove('hidden');
    }

    function closeAnalyticsModal() {
        analyticsModal.classList.add('hidden');
    }

    // Export Data
    function exportTasksData() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `zenith_tasks_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    }

    // Helpers
    function formatDate(dateStr) {
        if (!dateStr) return '';
        const options = { month: 'short', day: 'numeric' };
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', options);
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag));
    }

    // Run App
    init();
});
