document.addEventListener('DOMContentLoaded', function () {
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');

    const downloadModal = document.getElementById('download-modal');
    const uploadModal = document.getElementById('upload-modal');
    const editTaskModal = document.getElementById('edit-task-modal');
    const clearAllTasksButton = document.getElementById('clear-all-tasks');
    const downloadButton = document.getElementById('download-button');
    const uploadButton = document.getElementById('upload-button');
    const closeButtons = document.querySelectorAll('.close');
    let currentEditTask = null;

    downloadButton.onclick = function () {
        downloadModal.style.display = 'block';
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
        showAlert('Are you sure you want to clear all tasks?', () => {
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
                <span class="task-title">${taskNumber}. ${taskText}</span>
                <br>
                <div class="task-time">
                    <label>Date: <input type="date" value="${defaultDate}"></label>
                    <br>
                    <label>Start Time: <input type="time" class="start-time" value="${startTime}"></label>
                    <br>
                    <label>Expected Duration: 
                        <select class="expected-hours">
                            ${generateHoursOptions(hours)}
                        </select>
                        <select class="expected-minutes">
                            ${generateMinutesOptions(minutes)}
                        </select>
                    </label>
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
                ${subtasks.map((subtask, index) => `<li class="subtask"><span class="subtask-title">${taskNumber}.${index + 1} ${subtask}</span> <i class="fas fa-trash delete" onclick="deleteSubtask(this)" style="color: red;"></i></li>`).join('')}
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
            const editTaskInput = document.getElementById('edit-task-input');
    
            // Set the value and inherit font
            editTaskInput.value = taskTitle.textContent.split('. ')[1];
            editTaskInput.style.fontFamily = getComputedStyle(document.body).fontFamily;
    
            // Common styles for both light and dark modes
            editTaskInput.style.padding = '10px';
            editTaskInput.style.borderRadius = '5px';
            editTaskInput.style.borderStyle = 'solid';
            editTaskInput.style.borderWidth = '1px';
            editTaskInput.style.width = '100%'; // Make the input full width
            editTaskInput.style.boxSizing = 'border-box'; // Ensure padding is included in the width
    
            // Check if dark mode is active
            const isDarkMode = document.body.classList.contains('dark-mode');
    
            if (isDarkMode) {
                editTaskInput.style.backgroundColor = '#333'; // Dark background
                editTaskInput.style.color = '#fff'; // Light text color
                editTaskInput.style.borderColor = '#666'; // Dark border
            } else {
                editTaskInput.style.backgroundColor = '#fff'; // Light background
                editTaskInput.style.color = '#000'; // Dark text color
                editTaskInput.style.borderColor = '#ccc'; // Light border
            }
    
            // Display the modal
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
            const newTaskNumber = index + 1;
            const taskTitle = li.querySelector('.task-title');
            if (taskTitle) {
                // Ensure taskTitle is not null before accessing its textContent
                taskTitle.textContent = `${newTaskNumber}. ${taskTitle.textContent.split('. ')[1]}`;
            }
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
            const taskNumber = button.closest('li').dataset.taskNumber;
            const subtaskNumber = ul.children.length + 1;
            subtaskLi.className = 'subtask';
            subtaskLi.innerHTML = `<span class="subtask-title">${taskNumber}.${subtaskNumber} ${subtaskValue}</span> <i class="fas fa-trash delete" onclick="deleteSubtask(this)" style="color: red;"></i>`;
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
            // Only include fields that have data
            if (task.taskTitle.trim()) {
                txtContent += `${task.taskTitle}\n`;
            }
            if (task.date.trim()) {
                txtContent += `   Date: ${task.date}\n`;
            }
            if (task.startTime.trim()) {
                txtContent += `   Start Time: ${task.startTime}\n`;
            }
            if (task.hours.trim() || task.minutes.trim()) {
                txtContent += `   Duration: ${task.hours ? `${task.hours}h` : ''} ${task.minutes ? `${task.minutes}m` : ''}\n`;
            }
            if (task.note.trim()) {
                txtContent += `   Note: ${task.note}\n`;
            }
            if (task.subtasks.length > 0) {
                txtContent += "   Subtasks:\n";
                task.subtasks.forEach((subtask) => {
                    if (subtask.trim()) {
                        txtContent += `      - ${subtask}\n`;
                    }
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
                body {
                    font-family: 'Arial', sans-serif;
                    padding: 20px;
                    background-color: #f9f9f9;
                    color: #333;
                    margin: 0;
                }
                h1 {
                    text-align: center;
                    color: #4a90e2;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 2.5em;
                    margin-bottom: 30px;
                }
                .task {
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                    margin-bottom: 20px;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                }
                .task h2 {
                    font-size: 1.5em;
                    margin-bottom: 10px;
                    display: flex;
                    align-items: center;
                }
                .task h2 input[type="checkbox"] {
                    margin-right: 15px;
                    transform: scale(1.5);
                }
                .task p {
                    margin: 5px 0;
                    font-size: 1.1em;
                }
                .label {
                    font-weight: bold;
                    color: #555;
                }
                .emphasis {
                    color: #d9534f;
                }
                .highlight {
                    background-color: #ffeb3b;
                    padding: 2px 5px;
                    border-radius: 3px;
                }
                .note {
                    font-style: italic;
                    color: #777;
                }
                ul {
                    list-style-type: none;
                    padding-left: 0;
                    margin-top: 10px;
                }
                ul li {
                    font-size: 1.1em;
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                }
                ul li input[type="checkbox"] {
                    margin-right: 15px;
                    transform: scale(1.2);
                }
                h3 {
                    margin-top: 15px;
                    font-size: 1.3em;
                    color: #333;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <h1>Daily Planner</h1>
        `;
    
        tasks.forEach((task) => {
            htmlContent += `<div class="task">`;
            
            if (task.taskTitle.trim()) {
                htmlContent += `<h2><input type="checkbox" class="task-checkbox">${task.taskTitle}</h2>`;
            }
            if (task.date.trim()) {
                htmlContent += `<p class="label">Date: <span class="emphasis">${task.date}</span></p>`;
            }
            if (task.startTime.trim()) {
                htmlContent += `<p class="label">Start Time: <span class="emphasis">${task.startTime}</span></p>`;
            }
            if (task.hours.trim() || task.minutes.trim()) {
                htmlContent += `<p class="label">Duration: <span class="highlight">${task.hours ? `${task.hours}h` : ''} ${task.minutes ? `${task.minutes}m` : ''}</span></p>`;
            }
            if (task.note.trim()) {
                htmlContent += `<p class="label">Note: <span class="note">${task.note}</span></p>`;
            }
            if (task.subtasks.length > 0) {
                htmlContent += '<h3>Subtasks:</h3><ul>' + task.subtasks.map(subtask => subtask.trim() ? `<li><input type="checkbox" class="subtask-checkbox">${subtask}</li>` : '').join('') + '</ul>';
            }
            
            htmlContent += `</div>`;
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
    }

    window.addTask = addTask;
    window.editTask = editTask;
    window.deleteTask = deleteTask;
    window.toggleComplete = toggleComplete;
    window.addSubtask = addSubtask;
    window.deleteSubtask = deleteSubtask;
    window.getTasksArray = getTasksArray;

    window.downloadTxt = downloadTxt;
    window.downloadHtml = downloadHtml;
});