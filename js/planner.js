let taskCounter = 0;

document.addEventListener('DOMContentLoaded', function () {
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const storedTasks = loadTasksFromLocalStorage();
    taskCounter = storedTasks.length + 1;

    storedTasks.forEach(task => addTask(task.taskTitle, task.startTime, task.hours, task.minutes, task.date, task.note, task.subtasks));

    function addTask(taskTitle = '', startTime = '', hours = '01', minutes = '00', date = '', note = '', subtasks = []) {
        if (taskTitle.trim() === '' && taskInput.value.trim() === '') {
            showAlert('Please enter a task.');
            return;
        }

        const taskText = taskTitle || taskInput.value.trim();
        const li = document.createElement('li');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const defaultDate = date || tomorrow.toISOString().split('T')[0];

        li.innerHTML = `
            <div class="task-main">
                <span class="task-title">${taskCounter}. ${taskText}</span>
                <br>
                <div class="task-time">
                    <label>Start Time: <input type="time" class="start-time" value="${startTime}"></label>
                    <label>Expected Duration: 
                        <select class="expected-hours">
                            ${generateHoursOptions(hours)}
                        </select>
                        <select class="expected-minutes">
                            ${generateMinutesOptions(minutes)}
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
                <textarea placeholder="Add a note">${note}</textarea>
            </div>
            <ul class="subtask-list">
                ${subtasks.map(subtask => `<li class="subtask"><span class="subtask-title">${subtask}</span> <button class="delete" onclick="deleteSubtask(this)"><i class="fas fa-times" style="color: red;"></i></button><hr></li>`).join('')}
            </ul>
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

    function generateHoursOptions(selectedHour) {
        let options = '';
        for (let h = 1; h <= 12; h++) {
            const hour = h.toString().padStart(2, '0');
            options += `<option value="${hour}" ${selectedHour === hour ? 'selected' : ''}>${hour}h</option>`;
        }
        return options;
    }

    function generateMinutesOptions(selectedMinute) {
        let options = '';
        for (let m = 0; m < 60; m += 5) {
            const minute = m.toString().padStart(2, '0');
            options += `<option value="${minute}" ${selectedMinute === minute ? 'selected' : ''}>${minute}m</option>`;
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
        const tasks = [];
        taskList.querySelectorAll('li').forEach(li => {
            const taskTitle = li.querySelector('.task-title') ? li.querySelector('.task-title').textContent : '';
            const startTime = li.querySelector('.start-time') ? li.querySelector('.start-time').value : '';
            const hours = li.querySelector('.expected-hours') ? li.querySelector('.expected-hours').value : '';
            const minutes = li.querySelector('.expected-minutes') ? li.querySelector('.expected-minutes').value : '';
            const date = li.querySelector('input[type="date"]') ? li.querySelector('input[type="date"]').value : '';
            const note = li.querySelector('.note textarea') ? li.querySelector('.note textarea').value : '';
            const subtasks = [];
            li.querySelectorAll('.subtask').forEach(subtask => {
                if (subtask.querySelector('.subtask-title')) {
                    subtasks.push(subtask.querySelector('.subtask-title').textContent);
                }
            });
            tasks.push({ taskTitle, startTime, hours, minutes, date, note, subtasks });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasksFromLocalStorage() {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    }

    window.addTask = addTask;
    window.editTask = editTask;
    window.deleteTask = deleteTask;
    window.toggleComplete = toggleComplete;
    window.addSubtask = addSubtask;
    window.deleteSubtask = deleteSubtask;
    window.closeAlert = closeAlert;

    // Clear local storage after downloading or uploading tasks
    window.clearTasksAfterAction = function() {
        localStorage.removeItem('tasks');
        taskList.innerHTML = '';
        taskCounter = 1;
    };
});