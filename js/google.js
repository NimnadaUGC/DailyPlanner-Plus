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

    try {
        const accessToken = gapi.auth.getToken().access_token;
        if (!accessToken) {
            showAlert('Google Drive authorization failed. Please try again.');
            return;
        }

        showAlert('Uploading to Google Drive...');

        const response = await gapi.client.drive.files.create({
            resource: metadata,
            media: {
                mimeType: mimeType,
                body: fileContent
            },
            fields: 'id'
        });

        if (response.status === 200) {
            showAlert('File uploaded successfully!');
            console.log('File uploaded to Google Drive with ID:', response.result.id);
        } else {
            throw new Error('Upload failed.');
        }
    } catch (error) {
        console.error('Error uploading file to Google Drive:', error);
        showAlert('Failed to upload to Google Drive.');
    }
}