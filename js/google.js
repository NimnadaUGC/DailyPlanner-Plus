function onGAPILoad() {
    google.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: handleCredentialResponse,
    });
    google.accounts.id.prompt(); // Display the One Tap prompt
}

function handleCredentialResponse(response) {
    const token = response.credential;
    gapi.load('client', initGAPIClient);

    function initGAPIClient() {
        gapi.client.init({
            clientId: config.googleClientId,
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
        }).then(() => {
            gapi.auth.setToken({ access_token: token });
        }).catch(error => {
            console.error('Error initializing Google API client:', error);
        });
    }
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
        console.log('Spreadsheet created:', response);
        return response;
    }).catch(error => {
        console.error('Error creating Google Sheet:', error);
    });
}

function downloadGoogleSheet() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    createGoogleSheet(tasks).then(response => {
        const url = `https://docs.google.com/spreadsheets/d/${response.result.spreadsheetId}/export?format=xlsx`;
        window.open(url);
    });
}

function uploadToGoogleDrive() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    createGoogleSheet(tasks).then(response => {
        console.log('Sheet created in your Google Drive');
    });
}

// Ensure the GIS script is loaded before initializing
document.addEventListener('DOMContentLoaded', onGAPILoad);