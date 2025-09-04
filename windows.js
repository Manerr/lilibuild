let WindowCloser = document.querySelectorAll(".close-button");

for (var i = WindowCloser.length - 1; i >= 0; i--) {
	WindowCloser[i].onclick = function(event){this.parentElement.parentElement.style.display="none";}
}