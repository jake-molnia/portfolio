document.addEventListener('DOMContentLoaded', () => {
  // Animate skill bars
  const skillBars = document.querySelectorAll('.skill-bar');
  skillBars.forEach(bar => {
      const skill = bar.getAttribute('data-skill');
      bar.style.width = '0%';
      setTimeout(() => {
          bar.style.width = `${skill}%`;
      }, 500);
  });

  // Smooth scrolling for navigation
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href');
          const targetElement = document.querySelector(targetId);
          targetElement.scrollIntoView({ behavior: 'smooth' });
      });
  });

  // Add glitch effect to project cards on hover
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
      card.addEventListener('mouseover', () => addGlitchEffect(card));
      card.addEventListener('mouseout', () => removeGlitchEffect(card));
  });

  function addGlitchEffect(element) {
      element.style.animation = 'glitch 0.3s infinite';
  }

  function removeGlitchEffect(element) {
      element.style.animation = 'none';
  }

  // Add glitch animation
  const style = document.createElement('style');
  style.textContent = `
      @keyframes glitch {
          0% {
              transform: translate(0);
          }
          20% {
              transform: translate(-5px, 5px);
          }
          40% {
              transform: translate(-5px, -5px);
          }
          60% {
              transform: translate(5px, 5px);
          }
          80% {
              transform: translate(5px, -5px);
          }
          100% {
              transform: translate(0);
          }
      }
  `;
  document.head.appendChild(style);

  // Mobile menu toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
  });

  // Intersection Observer for scroll animations
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('animate-in');
          }
      });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
  });
});