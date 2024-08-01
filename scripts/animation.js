async function animateWelcomeSection() {
    const titleElement = document.getElementById('typewriter-text');
    const subtitleElement = document.getElementById('subtitle');
    const titleText = "Welcome to my digital realm";
  
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