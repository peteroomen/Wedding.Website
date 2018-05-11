function initMaps() {
	console.log('initializing the maps...');
    map = new google.maps.Map(document.getElementById('ceremony-map'), {
      center: {lat: -37.651978, lng: 176.2050228},
      zoom: 17
    });
    map = new google.maps.Map(document.getElementById('reception-map'), {
      center: {lat: -37.6965403, lng: 176.2841225},
      zoom: 17
    });
}