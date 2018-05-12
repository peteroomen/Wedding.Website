document.addEventListener("DOMContentLoaded", function(event) { 
  var header = document.getElementById('header-bar');
  var content = document.getElementById('content');
  content.addEventListener('scroll', function() {
    var scrollTop = content.scrollTop;
    if (scrollTop > 48) {
      header.style.top = '-108px';
      content.style.top = '48px';
    } else {
      header.style.top = '0';
      content.style.top = '156px';
    }
  });
});