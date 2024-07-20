function onGAPILoad() {
    google.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: handleCredentialResponse
    });

    google.accounts.id.prompt();

    // Load the auth2 library and Google Sheets API
    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: config.apiKey,
        clientId: config.googleClientId,
        discoveryDocs: config.discoveryDocs,
        scope: config.scopes
    })
    .then(function () {
        console.log('Google API client initialized.');
        // Load the Google Sheets API explicitly
        return gapi.client.load('sheets', 'v4');
    })
    .then(function() {
        console.log('Google Sheets API loaded successfully.');
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }, function(error) {
        console.error('Failed to load Google Sheets API:', error);
    });
}

function handleCredentialResponse(response) {
    console.log('Credential response received:', response);
}

function updateSigninStatus(isSignedIn) {
    console.log('Sign-in status updated:', isSignedIn ? 'Signed in' : 'Signed out');
}

function createGoogleSheet(tasks) {
    if (!gapi.client.sheets) {
        console.error('Google Sheets API is not available.');
        return;
    }

    const spreadsheetBody = {
        properties: {
            title: 'Daily Planner Tasks'
        },
        sheets: [{
            properties: {
                title: 'Tasks'
            },
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
                        { userEnteredValue: { stringValue: task.subtasks.join(', ') } },
                    ]
                }))
            }]
        }]
    };

    return gapi.client.sheets.spreadsheets.create({ resource: spreadsheetBody })
        .then(response => {
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