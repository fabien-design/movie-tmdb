document.addEventListener('DOMContentLoaded', function() {
  document.addEventListener('click', function(e) {
    const target = e.target;
    console.log(target);
    const results = document.querySelector('.search-results');
    
    if (!results) return;
    
    if (!target.closest('.search-container')) {
      results.style.display = 'none';
    } else {
      results.style.display = 'block';
    }
  });
});