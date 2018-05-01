document.addEventListener("DOMContentLoaded", function(event) { 
	var updateTimer = function () {
		var daysElement = document.getElementById('days');
		var hoursElement = document.getElementById('hours');
		var minutesElement = document.getElementById('minutes');
		var secondsElement = document.getElementById('seconds');

		var currentDate = new Date();
		var weddingDate = new Date(2019, 2, 27, 15, 00, 00);
		var differenceSec = (weddingDate.getTime() - currentDate.getTime()) / 1000;

		var days = Math.floor(differenceSec / 86400);
		differenceSec -= days * 86400;

		// calculate (and subtract) whole hours
		var hours = Math.floor(differenceSec / 3600) % 24;
		differenceSec -= hours * 3600;

		// calculate (and subtract) whole minutes
		var minutes = Math.floor(differenceSec / 60) % 60;
		differenceSec -= minutes * 60;

		// what's left is seconds
		var seconds = Math.floor(differenceSec % 60);  // in theory the modulus is not required

		daysElement.textContent = days;
		hoursElement.textContent = hours;
		minutesElement.textContent = minutes;
		secondsElement.textContent = seconds;
	}

	updateTimer();
	window.setInterval(updateTimer, 1000);
});