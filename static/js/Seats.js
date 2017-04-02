9
// Globals
var seat_available = true;

function initSeats()
{
	console.log("initSeats()")
	
	$.getJSON("http://127.0.0.1:5000/api/v1/seats", 
			function(data) {
				seat_available = data[0]['available'];
				setSeatStatus();
			});
}

function setSeatStatus(){
	console.log("Set Seat Status");
	
	if (seat_available){
		$('#seatInfo').text("Seat 1: Available");
		$('#seatInfo').css('background-color', 'green')
	}

	else{
		$('#seatInfo').text("Seat Unavailable");
		$('#seatInfo').css('background-color', 'red')
	}
}

