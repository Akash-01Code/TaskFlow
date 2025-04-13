
        // DOM Elements
        const taskForm = document.getElementById('taskForm');
        const taskInput = document.getElementById('taskInput');
        const tasksContainer = document.getElementById('tasksContainer');
        const tasksCount = document.getElementById('tasksCount');
        const clearCompletedBtn = document.getElementById('clearCompleted');
        const filterBtns = document.querySelectorAll('.filter-btn');

        // App State
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let currentFilter = 'all';

        // Initialize App
        document.addEventListener('DOMContentLoaded', () => {
            renderTasks();
            updateTasksCount();

            // Event Listeners
            taskForm.addEventListener('submit', addTask);
            clearCompletedBtn.addEventListener('click', clearCompletedTasks);
            
            filterBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentFilter = btn.getAttribute('data-filter');
                    renderTasks();
                });
            });
        });

        // Add new task
        function addTask(e) {
            e.preventDefault();
            
            const taskText = taskInput.value.trim();
            if (!taskText) return;
            
            const newTask = {
                id: Date.now().toString(),
                text: taskText,
                completed: false,
                createdAt: new Date()
            };
            
            tasks.unshift(newTask);
            saveTasksToLocalStorage();
            
            taskInput.value = '';
            renderTasks();
            updateTasksCount();
        }

        // Delete task
        function deleteTask(taskId) {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasksToLocalStorage();
            renderTasks();
            updateTasksCount();
        }

        // Toggle task completion
        function toggleTaskCompletion(taskId) {
            tasks = tasks.map(task => {
                if (task.id === taskId) {
                    return { ...task, completed: !task.completed };
                }
                return task;
            });
            saveTasksToLocalStorage();
            renderTasks();
            updateTasksCount();
        }

        // Edit task
        function editTask(taskId) {
            const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);
            const task = tasks.find(t => t.id === taskId);
            
            const currentText = taskElement.querySelector('.task-text').textContent;
            
            // Create edit form
            const editForm = document.createElement('form');
            editForm.classList.add('edit-form');
            
            editForm.innerHTML = `
                <input type="text" class="edit-input" value="${currentText}" required>
                <button type="submit" class="save-btn">Save</button>
                <button type="button" class="cancel-btn">Cancel</button>
            `;
            
            // Replace task text with edit form
            taskElement.querySelector('.task-text').replaceWith(editForm);
            
            // Focus on input
            const editInput = editForm.querySelector('.edit-input');
            editInput.focus();
            editInput.setSelectionRange(0, editInput.value.length);
            
            // Save changes
            editForm.addEventListener('submit', e => {
                e.preventDefault();
                const newText = editInput.value.trim();
                if (!newText) return;
                
                // Update task
                tasks = tasks.map(t => {
                    if (t.id === taskId) {
                        return { ...t, text: newText };
                    }
                    return t;
                });
                
                saveTasksToLocalStorage();
                renderTasks();
            });
            
            // Cancel edit
            editForm.querySelector('.cancel-btn').addEventListener('click', () => {
                renderTasks();
            });
        }

        // Clear completed tasks
        function clearCompletedTasks() {
            tasks = tasks.filter(task => !task.completed);
            saveTasksToLocalStorage();
            renderTasks();
            updateTasksCount();
        }

        // Render tasks
        function renderTasks() {
            let filteredTasks = [...tasks];
            
            if (currentFilter === 'active') {
                filteredTasks = tasks.filter(task => !task.completed);
            } else if (currentFilter === 'completed') {
                filteredTasks = tasks.filter(task => task.completed);
            }
            
            if (filteredTasks.length === 0) {
                tasksContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-clipboard-list empty-icon"></i>
                        <p class="empty-text">No ${currentFilter === 'all' ? '' : currentFilter} tasks found</p>
                        <p class="empty-subtext">Add a new task to get started</p>
                    </div>
                `;
                return;
            }
            
            tasksContainer.innerHTML = '';
            
            filteredTasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.classList.add('task');
                if (task.completed) {
                    taskElement.classList.add('completed');
                }
                taskElement.setAttribute('data-id', task.id);
                
                taskElement.innerHTML = `
                    <div class="checkbox ${task.completed ? 'checked' : ''}"></div>
                    <div class="task-text">${task.text}</div>
                    <div class="task-actions">
                        <button class="task-btn edit-btn" title="Edit">
                            <i class="fas fa-pen"></i>
                        </button>
                        <button class="task-btn delete-btn" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                
                tasksContainer.appendChild(taskElement);
                
                // Event listeners for task actions
                taskElement.querySelector('.checkbox').addEventListener('click', () => {
                    toggleTaskCompletion(task.id);
                });
                
                taskElement.querySelector('.edit-btn').addEventListener('click', () => {
                    editTask(task.id);
                });
                
                taskElement.querySelector('.delete-btn').addEventListener('click', () => {
                    deleteTask(task.id);
                });
            });
        }

        // Update tasks count
        function updateTasksCount() {
            const activeTasks = tasks.filter(task => !task.completed).length;
            tasksCount.textContent = `${activeTasks} task${activeTasks !== 1 ? 's' : ''} left`;
        }

        // Save tasks to local storage
        function saveTasksToLocalStorage() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    