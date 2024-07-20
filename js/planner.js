let taskCounter = 0;

document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    taskCounter = loadTasksFromLocalStorage().length + 1;

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

    function clearAllTasks() {
        localStorage.removeItem('tasks');
        taskList.innerHTML = '';
        taskCounter = 1;
    }

    // Call this function after tasks are successfully uploaded or downloaded
    function handleTasksProcessed() {
        clearAllTasks();
        showAlert('Tasks have been processed and cleared.');
    }

    // Integration with download/upload functions to be defined or adjusted accordingly
    // Example: call handleTasksProcessed() after successful upload/download

    function generateHoursOptions() {
        let options = '';
        for (let h = 1; h <= 12; h++) {
            options += `<option value="${h}">${h}h</option>`;
        }
        return options;
    }

    function generateMinutesOptions() {
        let options = '';
        for (let m = 0; m < 60; m += 5) {
            options += `<option value="${m}">${m}m</option>`;
        }
        return options;
    }

    function editTask(button) {
        const li = button.closest('li');
        const taskTitle = li.querySelector('.task-title');
        const newValue = prompt('Edit task:', taskTitle.textContent.split('. ')[1]);
        if (newValue) {
            taskTitle.textContent = `${li.dataset.taskNumber}. ${newValue}`;
            saveTasksToLocalStorage();
        }
    }

    function deleteTask(button) {
        const li = button.closest('li');
        li.remove();
        saveTasksToLocalStorage();
    }

    function toggleComplete(button) {
        const li = button.closest('li');
        li.classList.toggle('completed');
        saveTasksToLocalStorage();
    }

    function addSubtask(button) {
        const subtaskInput = button.previousElementSibling;
        if (subtaskInput.value.trim()) {
            const ul = button.closest('li').querySelector('.subtask-list');
            const subtaskLi = document.createElement('li');
            subtaskLi.innerHTML = `<span>${subtaskInput.value.trim()}</span> <button onclick="deleteSubtask(this)">Remove</button>`;
            ul.appendChild(subtaskLi);
            subtaskInput.value = '';
            saveTasksToLocalStorage();
        }
    }

    function deleteSubtask(button) {
        const li = button.closest('li');
        li.remove();
        saveTasksToLocalStorage();
    }

    function showAlert(message) {
        alert(message); // Simplified alert for clarity
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
});