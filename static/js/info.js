function initMaps() {
    var ceremonyMap = new google.maps.Map(document.getElementById('ceremony-map'), {
      center: {lat: -37.651978, lng: 176.2050228},
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.HYBRID
    });

    var receptionMap = new google.maps.Map(document.getElementById('reception-map'), {
      center: {lat: -37.6965403, lng: 176.2841225},
      zoom: 17,
      mapTypeId: google.maps.MapTypeId.HYBRID
    });

    var ceremonyMarker = new google.maps.Marker({
      position: {lat: -37.651699, lng: 176.205385},
      map: ceremonyMap
    });

    var receptionMarker = new google.maps.Marker({
      position: {lat: -37.696562, lng: 176.285045},
      map: receptionMap
    });
}