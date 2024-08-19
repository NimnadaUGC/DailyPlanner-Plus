document.addEventListener('DOMContentLoaded', function () {
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    let taskCounter = 1;

    const downloadModal = document.getElementById('download-modal');
    const uploadModal = document.getElementById('upload-modal');
    const editTaskModal = document.getElementById('edit-task-modal');
    const clearAllTasksButton = document.getElementById('clear-all-tasks');
    const downloadButton = document.getElementById('download-button');
    const uploadButton = document.getElementById('upload-button');
    const authorizeButton = document.getElementById('authorize-button');
    const closeButtons = document.querySelectorAll('.close');
    let currentEditTask = null;

    downloadButton.onclick = function () {
        downloadModal.style.display = 'block';
    };

    authorizeButton.onclick = function () {
        handleAuthClick();
    };

    uploadButton.onclick = function () {
        uploadModal.style.display = 'block';
    };

    closeButtons.forEach(button => {
        button.onclick = function () {
            downloadModal.style.display = 'none';
            uploadModal.style.display = 'none';
            editTaskModal.style.display = 'none';
        };
    });

    window.onclick = function (event) {
        if (event.target === downloadModal) {
            downloadModal.style.display = 'none';
        }
        if (event.target === uploadModal) {
            uploadModal.style.display = 'none';
        }
        if (event.target === editTaskModal) {
            editTaskModal.style.display = 'none';
        }
    };

    clearAllTasksButton.onclick = function () {
        showAlert('Are you sure you want to clear all tasks? This action cannot be undone.', () => {
            clearAllTasks();
        });
    };

    document.getElementById('save-task-button').onclick = function () {
        if (currentEditTask) {
            const newValue = document.getElementById('edit-task-input').value.trim();
            if (newValue) {
                const taskNumber = currentEditTask.dataset.taskNumber;
                currentEditTask.querySelector('.task-title').textContent = `${taskNumber}. ${newValue}`;
            }
            editTaskModal.style.display = 'none';
        }
    };

    function addTask(taskTitle = '', startTime = '', hours = '01', minutes = '00', date = '', note = '', subtasks = [], taskNumber = null) {
        if (taskTitle.trim() === '' && taskInput.value.trim() === '') {
            showAlert('Please enter a task.');
            return;
        }

        const taskText = taskTitle || taskInput.value.trim();
        const li = document.createElement('li');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const defaultDate = date || tomorrow.toISOString().split('T')[0];

        taskNumber = taskNumber || taskList.children.length + 1;

        li.innerHTML = `
            <div class="task-main">
                <span class="task-title">${taskText}</span>
                <input type="checkbox" class="task-checkbox">
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
                    <label>Date: <input type="date" value="${defaultDate}"></label>
                </div>
                <div class="task-actions">
                    <button class="edit" onclick="editTask(this)"><i class="fas fa-pencil-alt" style="color: orange;"></i> Edit</button>
                    <button class="delete" onclick="deleteTask(this)"><i class="fas fa-trash-alt" style="color: red;"></i> Delete</button>
                </div>
            </div>
            <div class="note">
                <textarea placeholder="Add a note">${note}</textarea>
            </div>
            <ul class="subtask-list">
                ${subtasks.map(subtask => `<li class="subtask"><span class="subtask-title">${subtask}</span> <input type="checkbox" class="subtask-checkbox"><i class="fas fa-trash delete" onclick="deleteSubtask(this)" style="color: red;"></i></li>`).join('')}
            </ul>
            <div class="subtask-input">
                <input type="text" placeholder="Add subtask">
                <button onclick="addSubtask(this)">Add Task</button>
            </div>
        `;
        li.dataset.taskNumber = taskNumber;
        taskList.appendChild(li);
        taskInput.value = '';
        renumberTasks();
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
            currentEditTask = li;
            document.getElementById('edit-task-input').value = taskTitle.textContent;
            editTaskModal.style.display = 'block';
        }
    }

    function deleteTask(button) {
        showAlert('Are you sure you want to delete this task?', () => {
            const li = button.closest('li');
            if (li) {
                li.remove();
                renumberTasks();
            }
        });
    }

    function renumberTasks() {
        const tasks = document.querySelectorAll('#task-list li');
        tasks.forEach((li, index) => {
            const taskTitle = li.querySelector('.task-title');
            const newTaskNumber = index + 1;
            taskTitle.textContent = taskTitle.textContent.split('. ')[1];
            li.dataset.taskNumber = newTaskNumber;
        });
    }

    function toggleComplete(button) {
        const li = button.closest('li');
        if (li) {
            li.classList.toggle('completed');
        }
    }

    function addSubtask(button) {
        const subtaskInput = button.previousElementSibling;
        const subtaskValue = subtaskInput.value.trim();
        if (subtaskValue) {
            const ul = button.closest('li').querySelector('.subtask-list');
            const subtaskLi = document.createElement('li');
            const subtaskNumber = ul.children.length + 1;
            subtaskLi.className = 'subtask';
            subtaskLi.innerHTML = `<span class="subtask-title">${subtaskValue}</span> <input type="checkbox" class="subtask-checkbox"><i class="fas fa-trash delete" onclick="deleteSubtask(this)" style="color: red;"></i>`;
            ul.appendChild(subtaskLi);
            subtaskInput.value = '';
        }
    }

    function deleteSubtask(button) {
        const subtaskLi = button.closest('li');
        if (subtaskLi) {
            subtaskLi.remove();
        }
    }

    function showAlert(message, callback) {
        const alertBox = document.createElement('div');
        alertBox.className = 'custom-alert';
        alertBox.innerHTML = `
            <p>${message}</p>
            <button id="alert-ok">OK</button>
            <button id="alert-cancel">Cancel</button>
        `;
        document.body.appendChild(alertBox);
        alertBox.style.display = 'block';
        if (document.body.classList.contains('dark-mode')) {
            alertBox.classList.add('dark-mode');
        }
        document.getElementById('alert-ok').onclick = function () {
            alertBox.remove();
            if (callback) callback();
        };
        document.getElementById('alert-cancel').onclick = function () {
            alertBox.remove();
        };
    }

    function downloadTxt() {
        const tasks = getTasksArray();
        if (tasks.length === 0) {
            showAlert('No tasks to download.');
            return;
        }

        let txtContent = "Daily Planner Tasks:\n\n";
        tasks.forEach((task) => {
            txtContent += `${task.taskTitle}\n`;
            txtContent += `   Date: ${task.date}\n`;
            txtContent += `   Start Time: ${task.startTime}\n`;
            txtContent += `   Duration: ${task.hours}h ${task.minutes}m\n`;
            txtContent += `   Note: ${task.note}\n`;
            if (task.subtasks.length > 0) {
                txtContent += "   Subtasks:\n";
                task.subtasks.forEach((subtask) => {
                    txtContent += `      - ${subtask}\n`;
                });
            }
            txtContent += "\n";
        });

        const blob = new Blob([txtContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily_planner_${getFormattedDate()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function downloadHtml() {
        const tasks = getTasksArray();
        if (tasks.length === 0) {
            showAlert('No tasks to download.');
            return;
        }

        let htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Daily Planner</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4; color: #333; }
                h1 { text-align: center; }
                h2 { margin-top: 20px; color: #4a90e2; }
                p { margin: 5px 0; font-size: 1.1em; }
                ul { list-style-type: none; padding-left: 20px; }
                .task-title { font-weight: bold; font-size: 1.2em; }
                .subtask-title { font-style: italic; }
                input[type="checkbox"] { margin-right: 10px; }
                .subtask { margin-left: 20px; }
                .task-checkbox { transform: scale(1.3); }
                .subtask-checkbox { transform: scale(1.1); }
            </style>
        </head>
        <body>
            <h1>Daily Planner</h1>
        `;

        tasks.forEach((task) => {
            htmlContent += `
            <div class="task">
                <h2><input type="checkbox" class="task-checkbox">${task.taskTitle}</h2>
                <p><strong>Date:</strong> ${task.date}</p>
                <p><strong>Start Time:</strong> ${task.startTime}</p>
                <p><strong>Duration:</strong> ${task.hours}h ${task.minutes}m</p>
                <p><strong>Note:</strong> <em>${task.note}</em></p>
                ${task.subtasks.length > 0 ? '<h3>Subtasks:</h3><ul>' + task.subtasks.map(subtask => `<li><input type="checkbox" class="subtask-checkbox">${subtask}</li>`).join('') + '</ul>' : ''}
            </div>
            `;
        });

        htmlContent += `
        </body>
        </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `daily_planner_${getFormattedDate()}.html`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function getFormattedDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getTasksArray() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(li => {
            const taskTitle = li.querySelector('.task-title') ? li.querySelector('.task-title').textContent : '';
            const startTime = li.querySelector('.start-time') ? li.querySelector('.start-time').value : '';
            const hours = li.querySelector('.expected-hours') ? li.querySelector('.expected-hours').value : '';
            const minutes = li.querySelector('.expected-minutes') ? li.querySelector('.expected-minutes').value : '';
            const date = li.querySelector('input[type="date"]') ? li.querySelector('input[type="date"]').value : '';
            const note = li.querySelector('.note textarea') ? li.querySelector('.note textarea').value : '';
            const subtasks = [];
            li.querySelectorAll('.subtask').forEach(
                subtask => {
                    if (subtask.querySelector('.subtask-title')) {
                        subtasks.push(subtask.querySelector('.subtask-title').textContent);
                    }
                }
            );
            tasks.push({ taskTitle, startTime, hours, minutes, date, note, subtasks });
        });
        return tasks;
    }

    function clearAllTasks() {
        taskList.innerHTML = '';
        taskCounter = 1;
    }

    window.addTask = addTask;
    window.editTask = editTask;
    window.deleteTask = deleteTask;
    window.toggleComplete = toggleComplete;
    window.addSubtask = addSubtask;
    window.deleteSubtask = deleteSubtask;

    window.downloadTxt = downloadTxt;
    window.downloadHtml = downloadHtml;

    async function handleAuthClick() {
        try {
            await gapi.load('client:auth2');
            await gapi.auth2.init({
                client_id: config.googleClientId
            });

            const authInstance = gapi.auth2.getAuthInstance();
            if (authInstance) {
                await authInstance.signIn();
                document.getElementById('upload-button').disabled = false;
                showAlert('Google Drive authorized. You can now upload your files.');
            } else {
                throw new Error('Google Auth Instance not initialized');
            }
        } catch (error) {
            console.error('Error during authentication:', error);
            showAlert('Failed to authorize Google Drive.');
        }
    }
});