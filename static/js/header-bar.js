var headerCollapsed = false;

document.addEventListener("DOMContentLoaded", function(event) { 
  var header = document.getElementById('header-bar');
  var content = document.getElementById('content');

  var onScroll = function(e) {
    if (headerCollapsed) {
      if (content.scrollTop == 0 && e.deltaY < 0) {        
        header.style.top = '0'; 
        content.style.top = '156px'; 
        headerCollapsed = !headerCollapsed;
      }
    } else {
      if (e.deltaY > 0) {
        header.style.top = '-108px';
        content.style.top = '48px';
        headerCollapsed = !headerCollapsed;
      }
    }
  };

  content.addEventListener('wheel', onScroll);
});