9
// Globals
var seat_available = false;

function initSeats()
{
	$.getJSON("http://127.0.0.1:5000/api/v1/seats", function(data) {
		//seat_available = data[0]['available']}
		
		if (seat_available){
			$('#seatInfo').text("Seat Available");
		}

		else{
			$('seatInfo').text("Seat Unavailable");
		}
	)
}


