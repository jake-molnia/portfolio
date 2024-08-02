async function animateWelcomeSection() {
    const titleElement = document.getElementById('typewriter-text');
    const subtitleElement = document.getElementById('subtitle');
    const titleText = "Grab a espresso, stay a while.";
  
    await typeWriter(titleElement, titleText, 50);
    await new Promise(resolve => setTimeout(resolve, 500));
    subtitleElement.classList.add('fade-in');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  function typeWriter(element, text, speed = 50) {
    return new Promise(resolve => {
      let i = 0;
      function type() {
        if (i < text.length) {
          element.innerHTML += text.charAt(i);
          i++;
          setTimeout(type, speed);
        } else {
          resolve();
        }
      }
      type();
    });
  }
  
  function animateContentSections() {
    const sections = document.querySelectorAll('#content-container > section');
    sections.forEach((section, index) => {
      setTimeout(() => {
        section.classList.add('slide-in');
      }, index * 300);
    });
  }
  
  async function animateTexts() {
    const elements = document.querySelectorAll('.typewriter');
    for (let element of elements) {
      const text = element.getAttribute('data-text');
      await typeWriter(element, text);
    }
  }

function setupLogoFlicker() {
  const letters = document.querySelectorAll('.logo .letter');
  
  function randomFlicker() {
      letters.forEach(letter => {
          letter.classList.remove('flicker', 'strong-flicker');
      });

      const randomIndex = Math.floor(Math.random() * letters.length);
      const randomLetter = letters[randomIndex];
      
      if (Math.random() > 0.7) {
          randomLetter.classList.add('strong-flicker');
      } else {
          randomLetter.classList.add('flicker');
      }
  }

  setInterval(randomFlicker, 350);  // Adjust timing as needed

  letters.forEach(letter => {
      letter.addEventListener('mouseover', () => {
          letter.classList.add('strong-flicker');
      });
      letter.addEventListener('mouseout', () => {
          letter.classList.remove('strong-flicker');
      });
  });
}

function createRainAnimation() {
  const rainContainer = document.querySelector('.rain-container');
  const raindropsCount = 100; // Adjust this number for more or fewer raindrops

  for (let i = 0; i < raindropsCount; i++) {
      const raindrop = document.createElement('div');
      raindrop.classList.add('raindrop');
      
      // Randomize raindrop properties
      raindrop.style.left = `${Math.random() * 100}%`;
      raindrop.style.animationDuration = `${Math.random() * 1 + 0.5}s`; // Between 0.5 and 1.5 seconds
      raindrop.style.opacity = Math.random() * 0.3 + 0.1; // Between 0.1 and 0.4
      raindrop.style.animationDelay = `${Math.random() * 2}s`; // Delay up to 2 seconds

      rainContainer.appendChild(raindrop);
  }
}