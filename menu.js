let menus = document.querySelectorAll("details .menu-button");
let outside = document.querySelector("#app");

function closeMenus(exceptone=null){
	// console.log("called by",exceptone)
	for (var i = menus.length - 1; i >= 0; i--) {
		if(menus[i] !== exceptone){
			menus[i].parentElement.open = false;
		}

	}

}

outside.onclick = function(e){closeMenus()};


for (var i = menus.length - 1; i >= 0; i--) {
	menus[i].onclick = function(e){
		closeMenus(e.srcElement);
	}

}
