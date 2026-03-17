// Scroll-triggered effects for playground cards
document.addEventListener('DOMContentLoaded', function() {
  const cards = document.querySelectorAll('.playground-card');
  
  // Create intersection observer for scroll effects
  const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        
        // Add subtle scale animation on scroll into view
        entry.target.style.animation = 'cardEnter 0.6s ease-out forwards';
      }
    });
  }, observerOptions);
  
  cards.forEach(card => {
    observer.observe(card);
  });
});
