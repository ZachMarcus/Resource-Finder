   /*
    * Global variables 
    * 
    */
  var API_KEY = "AIzaSyAXrIT_Y0Diusx9r9osN1QgBdEY4m5yjcE";
  // printerList is an array of Printer Objects
  var map;
  var myLatLng
  var NUMBER_PRINTERS_REC = 3;
  var MAX_NUM_DESTINATIONS = 25;
  var printerStatus = 0;
  var global_dmResponse = {
	  "destinationAddresses": [],
	  "originAddresses": [],
	  "rows": []
	  }
  var lock = false;
  
  $(document).ready(function(){
	
  });
  
/*
 * initGeolocation()
 * Starts the geolocation funcitons. 
 *  
 */  
  function initGeolocation() {
	  console.log("Hello world");	
	  
	  $.getJSON("http://127.0.0.1:5000/api/v1/printers", function(data) {
		    printerStatus = data;
		});
	
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
      for (var i = 0; i < (printerList.length)/MAX_NUM_DESTINATIONS; i++){
	      dms.Request = {
	    		  origins:[myLatLng],
	    		  destinations: printerLocations(i*25),// List of Destinations
	    		  travelMode: "WALKING",
	    		  unitSystem: google.maps.UnitSystem.IMPERIAL // Use FREEDOOMM units!
	      }
	      
	      dms.getDistanceMatrix(dms.Request, dmsCallback);
      }
      
      
    }
    //else map.panTo(myLatlng);
    
}
 /* 
  * Callback for the distance matrix service.
  * Takes a DistanceMatrixResponse and a DistanceMatrixStatus
  */
  function dmsCallback(dmResponse, dmStatus){
	  console.log(dmStatus);
	  console.log(dmResponse);
	  
	  
	  if(!lock){ //Todo: Change to a while loop?
		  lock = true;
		  global_dmResponse.destinationAddresses.push.apply(global_dmResponse.destinationAddresses, dmResponse.destinationAddresses);
		  global_dmResponse.originAddresses.push.apply(global_dmResponse.originAddresses, dmResponse.originAddresses);
		  global_dmResponse.rows.push.apply(global_dmResponse.rows, dmResponse.rows);
		  lock = false
	  }
	  
	  
	  global_dmResponse.sortedElements = [];
	  
	  for (index in global_dmResponse.rows) {
		  global_dmResponse.sortedElements.push(dmsResponseRowHandler(global_dmResponse.rows[index]));
	  }
	  
	  console.log("You should go to " + global_dmResponse.destinationAddresses[global_dmResponse.sortedElements[0][0].locationIndex]);
	  
	  shortListLocations = genShortList(global_dmResponse);
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
		  console.log(p1);
		  console.log(p2);
		  if (p1.status == "ZERO_RESULTS"){
			  return 1000;
		  } else if (p2.status == "ZERO_RESULTS"){
			  return 1000;
		  } else {
			  return p1.duration.value - p2.duration.value;
			  }})
	  
	  return ElementsList;
  }
  
  /*
   * Takes a printer and places a marker on the map with an infowindow. 
   *  
   */
  function setMarkers(printer, index) {
	  var myLatLng = new google.maps.LatLng(printer.Latitude, printer.Longitude);
	  //console.log(printerStatus);
	  
	  if(printerStatus == 0){
		  console.error("Error: printerStatus not set");
	  }
	  //console.log(printer);
	  printer.status = printerStatus.printers[printer.IPAddress];
	  
	  var printerQuery = "Printer: " + printer.status["deviceName"] + "<br>" 
	  					+ "Ink Status: " + printer.status["inkStatus"] + "<br>"
	  					+ "Max Paper Supply: " + printer.status["paperSupply"]
	  
	  //console.log("Printer Query: ");
	  //console.log(printerQuery);
	  
	  var markerPlace = {
			  location: myLatLng,
			  query: printer.DeviceLocation 
	  }
	  var markerOptions = {
			  title: printer.DeviceName,
			  position: myLatLng,
			  place: markerPlace,
	    	  map: map,
	    	  icon: "images/printer.png"
	  }
      var marker = new google.maps.Marker(markerOptions)
	  
	  // Pop up window with more information about the printers
	  var windowOptions = {
		  content: printerQuery,
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
    function printerLocations(initIndex){
  	  var locations = [];
  	  var numRuns;
  	  if((printerList.length - initIndex) > MAX_NUM_DESTINATIONS)
  		  numRuns = MAX_NUM_DESTINATIONS;
  	  else numRuns = printerList.length % MAX_NUM_DESTINATIONS
  	  for (var i = initIndex; i < numRuns + initIndex; i++){
  		  locations.push(new google.maps.LatLng(printerList[i].Latitude, printerList[i].Longitude));
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
  