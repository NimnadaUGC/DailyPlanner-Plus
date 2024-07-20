function onGAPILoad() {
    google.accounts.id.initialize({
        client_id: config.googleClientId,
        callback: handleCredentialResponse
    });

    google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('The Google One Tap prompt was not displayed:', notification);
        }
    });

    gapi.load('client:auth2', initClient);
}

function initClient() {
    gapi.client.init({
        apiKey: config.apiKey,
        clientId: config.googleClientId,
        discoveryDocs: config.discoveryDocs,
        scope: config.scopes
    }).then(function () {
        console.log('Google API client initialized.');
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    }, function (error) {
        console.error('Failed to initialize the Google API client:', error);
    });
}

function handleCredentialResponse(response) {
    console.log('Google Token ID Received:', response.credential);
    gapi.load('client:auth2', () => {
        gapi.client.init({
            apiKey: config.apiKey,
            clientId: config.googleClientId,
            discoveryDocs: config.discoveryDocs,
            scope: config.scopes
        }).then(() => {
            console.log('GAPI client initialized.');
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        });
    });
}

function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        console.log('User is signed in.');
    } else {
        console.log('User is not signed in.');
    }
}

function createGoogleSheet(tasks) {
    const spreadsheet = {
        properties: {
            title: 'Daily Planner',
        },
        sheets: [{
            properties: {
                title: 'Tasks',
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
                    ],
                })),
            }],
        }]
    };

    return gapi.client.sheets.spreadsheets.create({ resource: spreadsheet })
        .then(response => {
            console.log('Spreadsheet created with ID:', response.result.spreadsheetId);
            return response.result.spreadsheetId;
        })
        .catch(error => {
            console.error('Error creating Google Sheet:', error);
        });
}

function downloadGoogleSheet() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    createGoogleSheet(tasks).then(spreadsheetId => {
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
        window.open(url);
        clearTasksAfterAction();
    });
}

function uploadToGoogleDrive() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    createGoogleSheet(tasks).then(spreadsheetId => {
        console.log('Sheet created and uploaded to your Google Drive with ID:', spreadsheetId);
        clearTasksAfterAction();
    });
}