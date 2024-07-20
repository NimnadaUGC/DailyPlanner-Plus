let taskCounter = 0;

document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const loadedTasks = loadTasksFromLocalStorage();
    taskCounter = loadedTasks.length + 1;
    loadedTasks.forEach(task => addTask(task.taskTitle));

    function addTask(taskValue = '') {
        if (taskValue.trim() === '' && taskInput.value.trim() === '') {
            showAlert('Please enter a task.');
            return;
        }
        const taskText = taskValue || taskInput.value.trim();
        const li = document.createElement('li');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const defaultDate = tomorrow.toISOString().split('T')[0];

        li.innerHTML = `
            <div class="task-main">
                <span class="task-title">${taskCounter}. ${taskText}</span>
                <br>
                <div class="task-time">
                    <label>Start Time: <input type="time" class="start-time"></label>
                    <label>Expected Duration: 
                        <select class="expected-hours">
                            ${generateHoursOptions()}
                        </select>
                        <select class="expected-minutes">
                            ${generateMinutesOptions()}
                        </select>
                    </label>
                </div>
                <input type="date" value="${defaultDate}">
                <div class="task-actions">
                    <button class="edit" onclick="editTask(this)"><i class="fas fa-pencil-alt" style="color: orange;"></i></button>
                    <button class="delete" onclick="deleteTask(this)"><i class="fas fa-times" style="color: red;"></i></button>
                    <button class="complete" onclick="toggleComplete(this)"><i class="fas fa-check" style="color: green;"></i></button>
                </div>
            </div>
            <div class="note">
                <textarea placeholder="Add a note"></textarea>
            </div>
            <ul class="subtask-list"></ul>
            <div class="subtask-input">
                <input type="text" placeholder="Add subtask">
                <button onclick="addSubtask(this)">Add Subtask</button>
            </div>
        `;
        li.dataset.taskNumber = taskCounter; // Store the task number for subtasks
        taskList.appendChild(li);
        taskInput.value = '';
        taskCounter++;
        saveTasksToLocalStorage();
    }

    function generateHoursOptions() {
        let options = '';
        for (let h = 1; h <= 12; h++) {
            const hour = h.toString().padStart(2, '0');
            options += `<option value="${hour}">${hour}h</option>`;
        }
        return options;
    }

    function generateMinutesOptions() {
        let options = '';
        for (let m = 0; m < 60; m += 5) {
            const minute = m.toString().padStart(2, '0');
            options += `<option value="${minute}">${minute}m</option>`;
        }
        return options;
    }

    function editTask(button) {
        const li = button.closest('li');
        const taskTitle = li.querySelector('.task-title');
        if (taskTitle) {
            const newValue = prompt('Edit task:', taskTitle.textContent.split('. ')[1]);
            if (newValue) {
                const taskNumber = li.dataset.taskNumber;
                taskTitle.textContent = `${taskNumber}. ${newValue}`;
                saveTasksToLocalStorage();
            }
        }
    }

    function deleteTask(button) {
        const li = button.closest('li');
        if (li) {
            li.remove();
            saveTasksToLocalStorage();
        }
    }

    function toggleComplete(button) {
        const li = button.closest('li');
        if (li) {
            li.classList.toggle('completed');
            saveTasksToLocalStorage();
        }
    }

    function addSubtask(button) {
        const subtaskInput = button.previousElementSibling;
        const subtaskValue = subtaskInput.value.trim();
        if (subtaskValue) {
            const ul = button.closest('li').querySelector('.subtask-list');
            const subtaskLi = document.createElement('li');
            const taskNumber = button.closest('li').dataset.taskNumber;
            const subtaskNumber = ul.children.length + 1;
            subtaskLi.className = 'subtask';
            subtaskLi.innerHTML = `<span class="subtask-title">${taskNumber}.${subtaskNumber}</span> ${subtaskValue} <button class="delete" onclick="deleteSubtask(this)"><i class="fas fa-times" style="color: red;"></i></button><hr>`;
            ul.appendChild(subtaskLi);
            subtaskInput.value = '';
            saveTasksToLocalStorage();
        }
    }

    function deleteSubtask(button) {
        const subtaskLi = button.closest('li');
        if (subtaskLi) {
            subtaskLi.remove();
            saveTasksToLocalStorage();
        }
    }

    function showAlert(message) {
        const alertBox = document.createElement('div');
        alertBox.className = 'custom-alert';
        alertBox.innerHTML = `
            <p>${message}</p>
            <button onclick="closeAlert(this)">OK</button>
        `;
        document.body.appendChild(alertBox);
        alertBox.style.display = 'block';
        if (document.body.classList.contains('dark-mode')) {
            alertBox.classList.add('dark-mode');
        }
    }

    function closeAlert(button) {
        const alertBox = button.closest('.custom-alert');
        if (alertBox) {
            alertBox.remove();
        }
    }

    function saveTasksToLocalStorage() {
        const tasks = Array.from(taskList.querySelectorAll('li')).map(li => {
            return {
                taskTitle: li.querySelector('.task-title').textContent.split('. ')[1],
                startTime: li.querySelector('.start-time').value,
                hours: li.querySelector('.expected-hours').value,
                minutes: li.querySelector('.expected-minutes').value,
                date: li.querySelector('input[type="date"]').value,
                note: li.querySelector('.note textarea').value,
                subtasks: Array.from(li.querySelectorAll('.subtask-list span')).map(span => span.textContent)
            };
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasksFromLocalStorage() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => addTask(task.taskTitle));
    }

    loadTasksFromLocalStorage();

    window.addTask = addTask;
    window.editTask = editTask;
    window.deleteTask = deleteTask;
    window.toggleComplete = toggleComplete;
    window.addSubtask = addSubtask;
    window.deleteSubtask = deleteSubtask;
    window.closeAlert = closeAlert;

});