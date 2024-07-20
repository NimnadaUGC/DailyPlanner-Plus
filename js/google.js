// Assumes the global `config` object contains necessary API keys and client IDs
document.addEventListener('DOMContentLoaded', function() {
    loadGoogleAPI();
});

function loadGoogleAPI() {
    gapi.load('client:auth2', initializeGAPI);
}

function initializeGAPI() {
    gapi.client.init({
        apiKey: config.apiKey,
        clientId: config.googleClientId,
        discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
    }).then(function () {
        console.log("Google API initialized successfully");
        checkAuthStatus();
    }, function(error) {
        console.error("Error loading GAPI client for API", error);
    });
}

function checkAuthStatus() {
    // Check if the user is already signed in
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
    updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
}

function updateSignInStatus(isSignedIn) {
    if (isSignedIn) {
        console.log("User is signed in.");
    } else {
        console.log("User is not signed in.");
        gapi.auth2.getAuthInstance().signIn();
    }
}

function uploadToGoogleDrive() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    createGoogleSheet(tasks).then(sheetId => {
        console.log('Google Sheet created with ID:', sheetId);
        handleTasksProcessed(); // Clear tasks after upload
    }).catch(error => {
        console.error("Failed to create Google Sheet", error);
    });
}

function downloadGoogleSheet() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    createGoogleSheet(tasks).then(sheetId => {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
        window.open(url);
        handleTasksProcessed(); // Clear tasks after download
    }).catch(error => {
        console.error("Failed to download Google Sheet", error);
    });
}

function createGoogleSheet(tasks) {
    const body = {
        properties: { title: 'Task Sheet' },
        sheets: [{
            properties: { title: 'Tasks' },
            data: [{
                startRow: 0,
                startColumn: 0,
                rowData: tasks.map(task => ({
                    values: [
                        { userEnteredValue: { stringValue: task.taskTitle }},
                        { userEnteredValue: { stringValue: task.startTime }},
                        { userEnteredValue: { stringValue: task.hours }},
                        { userEnteredValue: { stringValue: task.minutes }},
                        { userEnteredValue: { stringValue: task.date }},
                        { userEnteredValue: { stringValue: task.note }},
                        { userEnteredValue: { stringValue: task.subtasks.join(', ') }},
                    ]
                }))
            }]
        }]
    };

    return gapi.client.sheets.spreadsheets.create({ resource: body }).then(response => response.result.spreadsheetId);
}

// Placeholder function to simulate the clearing of tasks
function handleTasksProcessed() {
    console.log("Tasks have been processed and cleared.");
    // Assuming there's a global function in planner.js or similar
    if (typeof clearAllTasks === 'function') {
        clearAllTasks();
    }
}