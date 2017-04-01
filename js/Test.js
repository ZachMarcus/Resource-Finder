
$(document).ready(function(){
		
	});

  var map; 
  var API_KEY = "AIzaSyAXrIT_Y0Diusx9r9osN1QgBdEY4m5yjcE";
  
/*
 * initGeolocation() 
 */  
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
      printerList.forEach(setMarkers);
    }
    //else map.panTo(myLatlng);
    
}
  
  function setMarkers(printer, index) {
	  console.log("LatLon: " + printer)
	  var myLatLng = new google.maps.LatLng(printer.Latitude, printer.Longitude);
	  var markerPlace = {
			  location: myLatLng,
			  query: printer.Description
	  }
	  var markerOptions = {
			  title: printer.Description,
			  position: myLatLng,
			  place: markerPlace,
	    	  map: map,
	    	  icon: "images/printer.png"
	  }
      var marker = new google.maps.Marker(markerOptions)
	  
	  // Pop up window with more information about the printers
	  var windowOptions = {
		  content: printer.Description,
		  position: myLatLng
	  }
	  var infoWindow = new google.maps.InfoWindow(windowOptions);
	  
	  marker.addListener('click', function() {
		    infoWindow.open(map, marker);
		  });
	  
  }
  