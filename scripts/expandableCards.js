function setupExpandableCards() {
    const cards = document.querySelectorAll('.skill-card, .project-card');
    let overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);
  
    let expandedCardContainer = document.createElement('div');
    expandedCardContainer.classList.add('expanded-card-container');
    document.body.appendChild(expandedCardContainer);
  
    cards.forEach(card => {
      card.classList.add('jitter-on-hover');
      
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        openExpandedCard(card);
      });
  
      card.addEventListener('mouseenter', () => {
        card.style.animation = 'jitter 0.3s infinite';
      });
  
      card.addEventListener('mouseleave', () => {
        card.style.animation = 'none';
      });
    });
  
    overlay.addEventListener('click', closeExpandedCard);
  
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeExpandedCard();
      }
    });
  
    function openExpandedCard(card) {
      const cardContent = card.innerHTML;
      expandedCardContainer.innerHTML = cardContent;
      const detailsElement = expandedCardContainer.querySelector('.skill-details, .project-details');
      if (detailsElement) {
        detailsElement.style.display = 'block';
      }
      
      overlay.style.display = 'block';
      expandedCardContainer.classList.add('active');
      document.body.classList.add('modal-open');
    }
  
    function closeExpandedCard() {
      overlay.style.display = 'none';
      expandedCardContainer.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  }