function onGAPILoad() {
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        clientId: config.googleClientId,
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
    }).then(function () {
        gapi.auth2.getAuthInstance().signIn();
    }).catch(function (error) {
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
    }).catch(function (error) {
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

gapi.load('client:auth2', onGAPILoad);
