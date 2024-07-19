document.addEventListener('DOMContentLoaded', function() {
    const themeToggle = document.getElementById('theme-toggle');

    themeToggle.addEventListener('change', function() {
        if (themeToggle.checked) {
            document.body.classList.add('dark-mode');
            document.querySelector('header').classList.add('dark-mode');
            document.querySelector('footer').classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.querySelector('header').classList.remove('dark-mode');
            document.querySelector('footer').classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        document.querySelector('header').classList.add('dark-mode');
        document.querySelector('footer').classList.add('dark-mode');
        themeToggle.checked = true;
    } else {
        document.body.classList.remove('dark-mode');
        document.querySelector('header').classList.remove('dark-mode');
        document.querySelector('footer').classList.remove('dark-mode');
        themeToggle.checked = false;
    }
});
