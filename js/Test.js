// Stuff
  var map; 
  function initGeolocation() {
    if (navigator && navigator.geolocation) {
    var watchId = navigator.geolocation.watchPosition(successCallback, 
                                                      errorCallback,
                                                      {enableHighAccuracy:true,timeout:60000,maximumAge:0});

    } else {
      console.log('Geolocation is not supported');
    }
  }
 
  function errorCallback() {}

  function successCallback(position) {
    var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    if(map == undefined) {
      var myOptions = {
        zoom: 15,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      map = new google.maps.Map(document.getElementById("map"), myOptions);
    }
    else map.panTo(myLatlng);
}