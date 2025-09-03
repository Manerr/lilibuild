function dumbLineName(){
	return "line" + document.querySelector(".linename span").getAttribute("value");
}

function rgbStringToHex(string){
	return "#" + string.slice(4).split(",").map((i)=>parseInt(i).toString(16).padStart(2,"0")).join().replaceAll(",","");
}