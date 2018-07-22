var headerCollapsed = false;

document.addEventListener("DOMContentLoaded", function(event) { 
  var header = document.getElementById('header-bar');
  var content = document.getElementById('content');
  content.addEventListener('scroll', function() {
    if (headerCollapsed) {
      if (content.scrollTop == 0) {
        header.style.top = '0'; 
        content.style.top = '156px'; 
        content.scrollTop = 0;
        headerCollapsed = !headerCollapsed;
      }
    } else {
      if (content.scrollTop > 0) {
        header.style.top = '-108px';
        content.style.top = '48px';
        headerCollapsed = !headerCollapsed;
      }
    }
  });
});