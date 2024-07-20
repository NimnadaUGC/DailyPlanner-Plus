// Global variable to hold Google API client loaded status
let googleAPIReady = false;

function onGAPILoad() {
    google.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: handleCredentialResponse
    });

    google.accounts.id.prompt();

    // Load the client library and initialize it
    gapi.load('client:auth2', () => {
        gapi.client.init({
            apiKey: config.apiKey,
            clientId: config.googleClientId,
            discoveryDocs: config.discoveryDocs,
            scope: config.scopes
        }).then(() => {
            console.log('Google API client initialized.');
            loadSheetsAPI();
        }, (error) => {
            console.error('Error initializing Google API client:', error);
        });
    });
}

function loadSheetsAPI() {
    gapi.client.load('sheets', 'v4').then(() => {
        console.log('Google Sheets API loaded.');
        googleAPIReady = true;
    }, (error) => {
        console.error('Error loading Google Sheets API:', error);
    });
}

function createGoogleSheet(tasks) {
    if (!googleAPIReady) {
        console.error('Google Sheets API is not ready.');
        return;
    }

    const spreadsheetBody = {
        properties: { title: 'Daily Planner Tasks' },
        sheets: [{
            properties: { title: 'Tasks' },
            data: [{
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
                        { userEnteredValue: { stringValue: task.subtasks.join(', ') } }
                    ]
                }))
            }]
        }]
    };

    return gapi.client.sheets.spreadsheets.create({ resource: spreadsheetBody }).then(response => {
        console.log('Spreadsheet created with ID:', response.result.spreadsheetId);
        return response.result.spreadsheetId;
    }, error => {
        console.error('Error creating spreadsheet:', error);
    });
}

function downloadGoogleSheet() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (tasks.length === 0) {
        console.log('No tasks to download.');
        return;
    }
    createGoogleSheet(tasks).then(spreadsheetId => {
        if (spreadsheetId) {
            const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
            window.open(url);
        }
    });
}

function uploadToGoogleDrive() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (tasks.length === 0) {
        console.log('No tasks to upload.');
        return;
    }
    createGoogleSheet(tasks).then(spreadsheetId => {
        if (spreadsheetId) {
            console.log('Spreadsheet uploaded to Google Drive with ID:', spreadsheetId);
        }
    });
}
