let googleAPIReady = false;

async function onGAPILoad() {
    try {
        google.accounts.id.initialize({ client_id: config.googleClientId, callback: handleCredentialResponse });
        google.accounts.id.prompt();

        await gapi.load('client:auth2');
        await gapi.client.init({
            apiKey: config.apiKey,
            clientId: config.googleClientId,
            discoveryDocs: config.discoveryDocs,
            scope: config.scopes
        });
        console.log('Google API client initialized.');

        await gapi.client.load('sheets', 'v4');
        console.log('Google Sheets API loaded successfully.');

        googleAPIReady = true;
    } catch (error) {
        console.error('Failed to initialize the Google APIs:', error);
    }
}

function handleCredentialResponse(response) {
    console.log('Credentials received:', response);
}

async function createGoogleSheet(tasks) {
    if (!googleAPIReady) {
        console.error('Google Sheets API is not ready. Please wait...');
        await onGAPILoad();
    }

    try {
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
        const response = await gapi.client.sheets.spreadsheets.create({ resource: spreadsheetBody });
        console.log('Spreadsheet created with ID:', response.result.spreadsheetId);
        return response.result.spreadsheetId;
    } catch (error) {
        console.error('Error creating spreadsheet:', error);
        return null;
    }
}

async function downloadGoogleSheet() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (tasks.length === 0) {
        console.log('No tasks to download.');
        return;
    }

    const spreadsheetId = await createGoogleSheet(tasks);
    if (spreadsheetId) {
        const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
        window.open(url);
    }
}

async function uploadToGoogleDrive() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (tasks.length === 0) {
        console.log('No tasks to upload.');
        return;
    }

    const spreadsheetId = await createGoogleSheet(tasks);
    if (spreadsheetId) {
        console.log('Spreadsheet uploaded to Google Drive with ID:', spreadsheetId);
    }
}