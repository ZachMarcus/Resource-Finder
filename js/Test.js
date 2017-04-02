
$(document).ready(function(){
		
	});

   /*
    * Global variables 
    * 
    */
  var API_KEY = "AIzaSyAXrIT_Y0Diusx9r9osN1QgBdEY4m5yjcE";
  // printerList is an array of Printer Objects
  var map;
  var myLatLng
  var NUMBER_PRINTERS_REC = 3;
  
/*
 * initGeolocation()
 * Starts the geolocation funcitons. 
 *  
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
 
  function errorCallback() {
	  console.log("Error with locaiton tracking...")
  }
  
  /*
   * Callback function for the navigator.geolocation.watchPosition() function. 
   */
  function successCallback(position) {
	
    myLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    // To be run the first time the callback is called. (Creates the map object)
    if(map == undefined) {
      var myOptions = {
        zoom: 15,
        center: myLatLng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }
      map = new google.maps.Map(document.getElementById("map"), myOptions);
      printerList.forEach(setMarkers);
      
      /* 
       * Figure out where we want to travel to. 
       */
      dms  = new google.maps.DistanceMatrixService();
      dms.Request = {
    		  origins:[myLatLng],
    		  destinations: printerLocations(),// List of Destinations
    		  travelMode: "WALKING",
    		  unitSystem: google.maps.UnitSystem.IMPERIAL // Use FREEDOOMM units!
      }
      
      dms.getDistanceMatrix(dms.Request, dmsCallback);

      
      
    }
    //else map.panTo(myLatlng);
    
}
 /* 
  * Callback for the distance matrix service.
  * Takes a DistanceMatrixResponse and a DistanceMatrixStatus
  */
  function dmsCallback(dmResponse, dmStatus){
	  console.log("dmResponse");
	  console.table(dmResponse);
	  
	  dmResponse.sortedElements = [];
	  
	  for (index in dmResponse.rows) {
		  dmResponse.sortedElements.push(dmsResponseRowHandler(dmResponse.rows[index]));
	  }
	  
	  console.log("You should go to " + dmResponse.destinationAddresses[dmResponse.sortedElements[0][0].locationIndex]);
	  
	  shortListLocations = genShortList(dmResponse);
	  console.log("Console List: " );
	  console.log(shortListLocations);
	  /* 
       * Get directions to go to the place we want to go. 
       */
      directionService = new google.maps.DirectionsService();
      
      // Plot directions for each address in shortListLocations
      for (printer in shortListLocations){
	      // Create Request
    	  directionService.request = {
	    		  origin:myLatLng,
	    		  destination: shortListLocations[printer], // Destination (LatLng)
	    		  travelMode: "WALKING",
	    		  unitSystem: google.maps.UnitSystem.IMPERIAL // Use FREEDOOMM units!
	      }
	      directionService.route(directionService.request, dsCallback)
      }
  }
  
  /*
   * 
   */
  function dsCallback(dsResult, dsStatus){
	  var DirectionsRendererOptions = {
		  directions: dsResult,
		  map: map
	  }
	  renderer = new google.maps.DirectionsRenderer(DirectionsRendererOptions);
  }
  
  /*
   * Takes in a dmsResponseRow and runs the element handler on each element. Returns a list of sorted elements
   * 
   */
  function dmsResponseRowHandler(row){
	  for (index in row.elements) {
		  row.elements[index].locationIndex = index;
	  }
	  sortedElements = sortElements(row.elements);
	  
	  return sortedElements;
  }
  
  /*
   * Sorts the list of elements based on the value of the duration object. Closest object will be in the 0 index. 
   * 
   * List of Elements => List of Elements 
   */
  function sortElements(ElementsList) {
	  
	  ElementsList.sort(function(p1, p2){
		  return p1.duration.value - p2.duration.value});
	  
	  return ElementsList;
  }
  
  /*
   * Takes a printer and places a marker on the map with an infowindow. 
   *  
   */
  function setMarkers(printer, index) {
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
  
  /*
   * Access the printerList object and produces a list of google.maps.LatLngs. 
   * printerList => [google.maps.LatLngs]
   */
    function printerLocations(){
  	  var locations = [];
  	  for (index in printerList){
  		  locations.push(new google.maps.LatLng(printerList[index].Latitude, printerList[index].Longitude));
  	  }
  	  return locations
    }
    
/*
 *  
 * 
 */
  function genShortList(dmResponse){
	  var locations = [];
	  for (index = 0; index < NUMBER_PRINTERS_REC; index++){
		  printer = printerList[dmResponse.sortedElements[0][index].locationIndex];
		  locations.push(new google.maps.LatLng(printer.Latitude, printer.Longitude));
	  }
	  return locations
  }
  