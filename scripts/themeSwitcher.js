function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.setAttribute('data-theme', themeName);
}

function toggleTheme() {
    if (localStorage.getItem('theme') === 'light') {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

(function () {
    if (localStorage.getItem('theme') === 'light') {
        setTheme('light');
        document.getElementById('theme-toggle-checkbox').checked = true;
    } else {
        setTheme('dark');
        document.getElementById('theme-toggle-checkbox').checked = false;
    }
})();

document.getElementById('theme-toggle-checkbox').addEventListener('change', function() {
    toggleTheme();
});