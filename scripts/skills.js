function initializeSkillsAnimation() {
  const skillsContainer = document.querySelector('.skills-container');
  const skillsWrapper = document.querySelector('.skills-wrapper');
  const skillItems = document.querySelectorAll('.skill-item');
  const prevButton = document.querySelector('.skill-nav-button.prev');
  const nextButton = document.querySelector('.skill-nav-button.next');
  let currentSkillIndex = 0;

  function updateSkillPosition() {
    skillsWrapper.style.transform = `translateY(-${currentSkillIndex * 100}%)`;
    updateButtonStates();
  }

  function updateButtonStates() {
    prevButton.disabled = currentSkillIndex === 0;
    nextButton.disabled = currentSkillIndex === skillItems.length - 1;
  }

  function showPreviousSkill() {
    if (currentSkillIndex > 0) {
      currentSkillIndex--;
      updateSkillPosition();
    }
  }

  function showNextSkill() {
    if (currentSkillIndex < skillItems.length - 1) {
      currentSkillIndex++;
      updateSkillPosition();
    }
  }

  prevButton.addEventListener('click', showPreviousSkill);
  nextButton.addEventListener('click', showNextSkill);

  // Optional: Enable keyboard navigation
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowUp') {
      showPreviousSkill();
    } else if (event.key === 'ArrowDown') {
      showNextSkill();
    }
  });

  updateButtonStates();
}

document.addEventListener('DOMContentLoaded', initializeSkillsAnimation);