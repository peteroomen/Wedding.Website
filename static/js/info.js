function initMaps() {
    var ceremonyMap = new google.maps.Map(document.getElementById('ceremony-map'), {
      center: {lat: -41.349215, lng: 173.147959},
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.HYBRID
    });

    var ceremonyMarker = new google.maps.Marker({
      position: {lat: -41.349215, lng: 173.147959},
      map: ceremonyMap
    });
}