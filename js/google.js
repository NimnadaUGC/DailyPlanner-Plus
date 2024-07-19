function onGAPILoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        clientId: config.googleClientId,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
    }).then(() => {
        gapi.auth2.getAuthInstance().signIn().then(() => {
            console.log('Google API client initialized');
            document.querySelectorAll('.google-buttons button').forEach(button => {
                button.disabled = false;
            });
        }).catch(error => {
            console.error('Error during sign-in:', error);
        });
    }).catch(error => {
        console.error('Error initializing Google API client:', error);
    });
}

function createGoogleSheet(tasks) {
    const spreadsheet = {
        properties: {
            title: 'Daily Planner',
        },
        sheets: [
            {
                properties: {
                    title: 'Tasks',
                },
                data: [
                    {
                        startRow: 0,
                        startColumn: 0,
                        rowData: tasks.map(task => ({
                            values: [
                                { userEnteredValue: { stringValue: task.taskTitle } },
                                { userEnteredValue: { stringValue: task.startTime } },
                                { userEnteredValue: { stringValue: task.hours } },
                                { userEnteredValue: { stringValue: task.minutes } },
                                { userEnteredValue: { stringValue: task.date } },
                                { userEnteredValue: { stringValue: task.note } },
                                { userEnteredValue: { stringValue: task.subtasks.join(', ') } },
                            ],
                        })),
                    },
                ],
            },
        ],
    };

    return gapi.client.sheets.spreadsheets.create({
        resource: spreadsheet,
    }).then(response => {
        return response.result.spreadsheetId;
    }).catch(error => {
        console.error('Error creating Google Sheet:', error);
    });
}

function downloadGoogleSheet() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    createGoogleSheet(tasks).then(spreadsheetId => {
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
        window.open(url);
    });
}

function uploadToGoogleDrive() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    createGoogleSheet(tasks).then(spreadsheetId => {
        console.log('Sheet created in your Google Drive');
    });
}

// Ensure the GIS script is loaded before initializing
document.addEventListener('DOMContentLoaded', () => {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = onGAPILoad;
    document.body.appendChild(script);
});