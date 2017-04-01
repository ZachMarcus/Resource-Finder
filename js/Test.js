

  var map; 
  var API_KEY = "AIzaSyAXrIT_Y0Diusx9r9osN1QgBdEY4m5yjcE";
  
  
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

  $(document).ready(function(){
		
	});
  
  
  function successCallback(position) {
	
    var myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    if(map == undefined) {
      var myOptions = {
        zoom: 15,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      map = new google.maps.Map(document.getElementById("map"), myOptions);
      var marker = new google.maps.Marker({
    	  position: myLatlng,
    	  map: map})
    }
    else map.panTo(myLatlng);
    
}
  