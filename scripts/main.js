document.addEventListener('DOMContentLoaded', () => {
  createRainAnimation();
  setupLogoFlicker();
  animateWelcomeSection().then(() => {
      document.getElementById('content-container').style.opacity = '1';
      setupExpandableCards();
      animateContentSections();
  });
  initializeThemeSwitch();
  setupSmoothScrolling();
  setupProjectCardEffects();
  setupMobileMenu();
  setupScrollAnimations();
  animateTexts();
});

function initializeThemeSwitch() {
  const toggleSwitch = document.querySelector('.theme-switch input[type="checkbox"]');
  toggleSwitch.addEventListener('change', switchTheme, false);

  function switchTheme(e) {
    if (e.target.checked) {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    }    
  }

  const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : null;
  if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'light') {
      toggleSwitch.checked = true;
    }
  }
}
