async function uploadToGoogleDrive(format) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (tasks.length === 0) {
        showAlert('No tasks to upload.');
        return;
    }

    let fileContent, mimeType, fileName;

    if (format === 'txt') {
        fileName = 'daily_planner.txt';
        mimeType = 'text/plain';
        let txtContent = "Daily Planner Tasks:\n\n";
        tasks.forEach((task, index) => {
            txtContent += `${index + 1}. ${task.taskTitle}\n`;
            txtContent += `   Date: ${task.date}\n`;
            txtContent += `   Start Time: ${task.startTime}\n`;
            txtContent += `   Duration: ${task.hours}h ${task.minutes}m\n`;
            txtContent += `   Note: ${task.note}\n`;
            if (task.subtasks.length > 0) {
                txtContent += "   Subtasks:\n";
                task.subtasks.forEach((subtask, subIndex) => {
                    txtContent += `      ${index + 1}.${subIndex + 1} ${subtask}\n`;
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
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { text-align: center; }
                .task { margin-bottom: 20px; }
                .task-title { font-weight: bold; }
                .subtask { margin-left: 20px; }
                .completed { text-decoration: line-through; }
            </style>
        </head>
        <body>
            <h1>Daily Planner</h1>
        `;
        tasks.forEach((task, index) => {
            htmlContent += `
            <div class="task">
                <p class="task-title">${index + 1}. ${task.taskTitle}</p>
                <p>Date: ${task.date}</p>
                <p>Start Time: ${task.startTime}</p>
                <p>Duration: ${task.hours}h ${task.minutes}m</p>
                <p>Note: ${task.note}</p>
                ${task.subtasks.length > 0 ? '<p>Subtasks:</p>' : ''}
                <ul>
            `;
            task.subtasks.forEach((subtask) => {
                htmlContent += `<li class="subtask"><input type="checkbox"> ${subtask}</li>`;
            });
            htmlContent += `
                </ul>
            </div>
            `;
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

    const accessToken = gapi.auth.getToken().access_token;
    try {
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
            body: form
        });
        const file = await response.json();
        console.log('File uploaded to Google Drive with ID:', file.id);
    } catch (error) {
        console.error('Error uploading file to Google Drive:', error);
    }
}
