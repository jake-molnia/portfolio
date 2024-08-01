document.addEventListener('DOMContentLoaded', () => {
  animateWelcomeSection().then(() => {
    document.getElementById('content-container').style.opacity = '1';
    setupExpandableCards();
    animateContentSections();
  });
  initializeSkillBars();
  setupSmoothScrolling();
  setupProjectCardEffects();
  setupMobileMenu();
  setupScrollAnimations();
  animateTexts();
});