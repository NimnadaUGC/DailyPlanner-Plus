async function uploadToGoogleDrive(format) {
    const tasks = getTasksArray();
    if (tasks.length === 0) {
        showAlert('No tasks to upload.');
        return;
    }

    let fileContent, mimeType, fileName;

    if (format === 'txt') {
        fileName = 'daily_planner.txt';
        mimeType = 'text/plain';
        let txtContent = "Daily Planner Tasks:\n\n";
        tasks.forEach((task) => {
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
        fileContent = new Blob([txtContent], { type: mimeType });
    } else {
        fileName = 'daily_planner.html';
        mimeType = 'text/html';
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
        fileContent = new Blob([htmlContent], { type: mimeType });
    }

    const metadata = {
        name: fileName,
        mimeType: mimeType
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', fileContent);

    try {
        // Use the gapi.auth2 instance to get the token
        const authInstance = gapi.auth2.getAuthInstance();
        const user = authInstance.currentUser.get();
        const accessToken = user.getAuthResponse().access_token;

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
            body: form
        });
        const file = await response.json();
        console.log('File uploaded to Google Drive with ID:', file.id);
        showAlert('File successfully uploaded to Google Drive.');
    } catch (error) {
        console.error('Error uploading file to Google Drive:', error);
        showAlert('Failed to upload to Google Drive. Please try again.');
    }
}