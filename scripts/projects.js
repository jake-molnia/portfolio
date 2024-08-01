function setupProjectCardEffects() {
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      card.addEventListener('mouseover', () => addGlitchEffect(card));
      card.addEventListener('mouseout', () => removeGlitchEffect(card));
    });
  }
  
  function addGlitchEffect(element) {
    element.style.animation = 'glitch 0.3s infinite';
  }
  
  function removeGlitchEffect(element) {
    element.style.animation = 'none';
  }