let logo = document.getElementById("logo");

window.addEventListener('scroll', function() {
	// Rotación suave basada en scroll con multiplicador más pequeño
	var scrollRotation = window.scrollY * 0.02;
	
	// Agregar un efecto de wobble/oscilación divertida
	var wobble = Math.sin(window.scrollY * 0.01) * 5;
	
	// Combinar rotación del scroll con wobble
	var totalRotation = scrollRotation + wobble;
	
	logo.style.transform = `rotate(${totalRotation}deg)`;
});

