let logo = document.getElementById("logo");


window.addEventListener('scroll', function() {
	var value = window.scrollY * 0.1;
	logo.style.transform = `rotate(${value}deg)`; 
});
