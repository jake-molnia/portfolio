function initializeSkillBars() {
    const skillBars = document.querySelectorAll('.skill-bar');
    skillBars.forEach(bar => {
      const skill = bar.getAttribute('data-skill');
      bar.style.width = '0%';
      setTimeout(() => {
        bar.style.width = `${skill}%`;
      }, 500);
    });
  }