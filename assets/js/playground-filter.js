document.addEventListener('DOMContentLoaded', function() {
  const filterLinks = document.querySelectorAll('.filter-link');
  const cards = document.querySelectorAll('.playground-card');
  
  // Get filter from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const activeFilter = urlParams.get('filter') || 'all';
  
  // Set active filter link
  filterLinks.forEach(link => {
    if (link.dataset.filter === activeFilter) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
  
  // Filter cards
  function applyFilter(filter) {
    cards.forEach(card => {
      if (filter === 'all' || card.dataset.discipline === filter) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }
  
  // Apply initial filter
  applyFilter(activeFilter);
  
  // Add click handlers to filter links
  filterLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const filter = this.dataset.filter;
      
      // Update URL
      if (filter === 'all') {
        window.history.pushState({}, '', '/playground/');
      } else {
        window.history.pushState({}, '', `/playground/?filter=${filter}`);
      }
      
      // Update active state
      filterLinks.forEach(l => l.classList.remove('active'));
      this.classList.add('active');
      
      // Apply filter
      applyFilter(filter);
    });
  });
});
