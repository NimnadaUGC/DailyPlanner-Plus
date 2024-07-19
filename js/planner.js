
// Ensure DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    
    // Function to add a task to the list
    function addTask() {
        const taskValue = taskInput.value.trim();
        if (taskValue) {
            const li = document.createElement('li');
            li.textContent = taskValue;
            taskList.appendChild(li);
            taskInput.value = '';
            // Optionally, save to Google Drive here using the API key from config
            console.log('Google API Key:', config.googleApiKey);
        }
    }
    
    // Expose the addTask function to global scope to be callable from HTML
    window.addTask = addTask;
});
    