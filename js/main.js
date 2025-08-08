const deleting = 0;
const pointing = 1;
const drawingpath = 2;
const drawingpoint = 3;
// Saving each thirty secs
let SAVE_INTERVAL = 15;

let CURRENTLY_DOING = pointing;

let GLOBALColor = "#fcc907";

let	DELETING_POINTS = false;

let SWITCHING_CONNECTION = false;

let LAST_X = null;



class App {
	
	constructor() {

        this.exporter = new Exporter(this);

		let elementToInsert;

		this.trueIndicator = document.createElement("div");
		

		// let colorchanger = document.getElementById("colorvalue");

		this.output = document.querySelector(".allsvgcontainer");

		this.outputdragzone = document.querySelector("#dragtarget");

		this.outputContainer = document.querySelector(".result");


		this.insertbeforeit = document.getElementById("insertbeforeit")

		this.dragIndicator = document.getElementById("indicator");

		// let dragPathBool = false;
		// let dragPointBool = false;

		// line
		this.typeToInsert = 0;


		this.firstZone = document.querySelector(".emptyfordraggingstart");

		this.lastZone = document.querySelector(".emptyfordraggingend");

		this.lineNameZone = document.querySelector(".linename");




		// new buttons

		this.asideContainer = document.getElementById("asidecontainer");

		let pointerButton = document.getElementById("bPointer");
		let editPathButton = document.getElementById("bEdit");
		let editPointButton = document.getElementById("bEditPath");
		let deleteButton = document.getElementById("bDelete");

		// let importButton = document.getElementById("bImport");
		this.exportButton = document.getElementById("bExport");
		this.printButton = document.getElementById("bPrint");

		this.infoButton = document.getElementById("bInfo");


		this.resetButton = document.getElementById("bReset");
		this.saveButton = document.getElementById("bSave");
		this.openButton = document.getElementById("bOpen");

		// "windows" -> info and settings popups 

		this.aboutWindow = document.getElementById('about');

		// hidden zone for printing a clean thing

		this.hiddenPrintZone = document.getElementById("printmodeonlyImg");

		// hidden input for files

		this.fileInput = document.createElement('input');

		// element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));

		this.fileInput.setAttribute('type', 'file');

		this.fileInput.style.display = 'none';

		this.fileInput.setAttribute('accept', '.json');

		document.body.appendChild(this.fileInput);

		// Initialize EventManager
		this.eventManager = new EventManager(this);
		this.eventManager.initializeEvents();

		// Bind methods that need to be bound
		this.saveLocalStorage = this.saveLocalStorage.bind(this);
		this.loadLocalStorage = this.loadLocalStorage.bind(this);
	}

	// Download method for saving files
	download(filename, text) {
		var element = document.createElement('a');
		element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
		element.setAttribute('download', filename);
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	}

	ChangeSVGColors(value = null){
			if(!value){GLOBALColor = "#0f0";}
			else{GLOBALColor = value;}

			let svgs = document.querySelectorAll(".img svg path"); 
			for (let i = svgs.length - 1; i >= 0; i--) {
				svgs[i].style.stroke = GLOBALColor;
			}
			svgs = document.querySelectorAll(".img g .endpoint :last-child"); 
				
			for (let i = svgs.length - 1; i >= 0; i--) {
				svgs[i].style.fill = GLOBALColor;
			}
		}







	addDraggingEvent(event){



			this.outputdragzone.ondragend = whenDeDragging;
			
			let elements = this.outputdragzone.querySelectorAll(".block img");
			for (let i = elements.length - 1; i >= 0; i--) {
				let element = elements[i];
				element.draggable = false;
			
			}
		}



	whenDeDragging(event){
			// console.log(event.srcElement,event.target)
			dragPathBool = false;
			dragPointBool = false;
		}

	whenDragging(event){

			// console.log(deleting == CURRENTLY_DOING);
			if( CURRENTLY_DOING == 0){return false;}
			// changecolors();

			let isemptyzone = false;
			
			// let target = event.fromElement;
			let element = event.srcElement;


			// let twoChoices










			let target = event.toElement;
			let name = target.className;


			if( name == "name" || name == "img" ){
				target = target.parentElement;
			}

			// if(  name == "emptyfordraggingstart" || name == "emptyfordraggingend"){
			// 	isemptyzone = true;
			// }



			if( target.className.indexOf("block") == -1 && !isemptyzone){
				return
			}


				console.log(target);



			
			let cursorX = event.clientX;

			let subWidth = target.clientWidth/2; 

			let objectX = target.getBoundingClientRect().left;

			// console.log(objectX,cursorX);


			if( cursorX > ( objectX + subWidth ) ){
				insertingBefore = false;
				console.log("On right!");
			}
			else{
				insertingBefore = true;
				console.log("On left!");
			}



			if(  name == "emptyfordraggingstart"){
				insertingBefore = false;
			}
			else if(  name == "emptyfordraggingend"){
				insertingBefore = true;
			}


		}


		//Has to be completely rewritten (like the full app lol)
	manageClick(event){

			let currentElement = event.target;
			let currentType = currentElement.name;

			if(!currentType){
				currentType = currentElement.getAttribute("name");
			}

			if(CURRENTLY_DOING && currentType == "path"){

				if(currentElement.parentElement.classList.contains("dashed")) currentElement.parentElement.classList.remove("dashed");
				else currentElement.parentElement.classList.add("dashed");

			}




			

			if( CURRENTLY_DOING == drawingpath || CURRENTLY_DOING == drawingpoint ){
				this.outputOnclick(event);
				return;
			}




			let trueCurrentElement = currentElement.parentElement;


			if(CURRENTLY_DOING == deleting){


				// Deleting a single connection
				if ( currentElement.className.search("connectionpoint") != -1 && currentElement.className.search("addConnection") == -1 ){
					currentElement.remove();
					return;
				}
				// Deleting connection type
				if ( currentElement.className == "connectionType" ){
					currentElement.parentElement.remove();
					return;
				}


				if(trueCurrentElement.className != "blockcontainer line this.insertbeforeit"){this.output.removeChild(trueCurrentElement);}
				if(this.output.childElementCount == 1){
					this.insertbeforeit.style.display = "block";
				}
				return;

			}

			if(SWITCHING_CONNECTION && currentType && currentType.indexOf("point") != -1 && currentElement.type != "submit" ){

				console.log(currentType);

					if(trueCurrentElement.className == "blockcontainer point"){
						trueCurrentElement.className = "blockcontainer point connected";
						if( currentType != "pointterminus" ){


							currentElement.innerHTML = pointCorr.replace("#fcc907",GLOBALColor);
							currentElement.setAttribute("name","pointcorr");
							// currentElement.setname = "pointcorr";
						}
						// }

					}
					else{
						trueCurrentElement.className = "blockcontainer point";
					}


			}

			//then you're not deleting but interacting
			else if(!DELETING_POINTS){

				// Managaing connection type
				if( currentElement.className=="connectionType" ){
					if( currentElement.parentElement.getAttribute("type") == "metro" ){
						currentElement.parentElement.setAttribute("type","RER");
						currentElement.src = "blocks/connections/pointRER.svg"; 
					}
					else if ( currentElement.parentElement.getAttribute("type") == "RER" ) {
						currentElement.parentElement.setAttribute("type","Transilien");
						currentElement.src = "blocks/connections/pointTrain.svg"; 
					}
					else if ( currentElement.parentElement.getAttribute("type") == "Transilien" ) {
						currentElement.parentElement.setAttribute("type","Tram");
						currentElement.src = "blocks/connections/pointTram.svg"; 
					}
					else if ( currentElement.parentElement.getAttribute("type") == "Tram" ) {
						currentElement.parentElement.setAttribute("type","metro");
						currentElement.src = "blocks/connections/pointM.svg"; 
					}
				}
				// Adding new connection
				else if( currentElement.className=="connectionpoint addConnection" ||  (currentElement.className.indexOf("connectionpoint") !=-1 && currentElement.className.indexOf("addConnection") == -1 && currentElement.parentElement.parentElement.className == "linename") ){
					let line = prompt("(BETA) Nouvelle connection? Entrez la ligne à rajouter");

					if(line){
						line = line.toUpperCase();

					}

					// line = Math.floor( Math.random() * 18 + 1 );
					let parentType = currentElement.parentElement.getAttribute("type");
					console.log(parentType);
					if(parentType == "Tram" ){
						line = "T"+line;
					}

					if(line && currentElement.parentElement.querySelector(".line"+line) == null){


						let newConnection = document.createElement("span");
						newConnection.setAttribute("bis","");
						newConnection.className = currentElement.parentElement.getAttribute("type")+" connectionpoint line"+line;
						newConnection.setAttribute("value",line);
						newConnection.setAttribute("truename",line);

						let numericOrder;

						// Case metro

						
						if( parentType == "metro" ){

						let numericOrder = parseInt(line);

						if(numericOrder == null || !numericOrder || numericOrder < 1 || numericOrder > 19 ){
							return;
						}

						if( line == "3B" || numericOrder > 3 ){
							numericOrder += 1;
							if(line == "3B"){
								newConnection.setAttribute("bis","bis");
								newConnection.setAttribute("truename","3    ");
							}

						}
						if( line == "7B" || numericOrder > 8 ){
							numericOrder += 1;
							if(line == "7B"){
								newConnection.setAttribute("bis","bis");
								newConnection.setAttribute("truename","7   ");
							}
						}
						
							newConnection.style.order = numericOrder;

						}
						// Case RER
						else if (parentType == "RER"){


							if( line.length !=1  ||  line.charCodeAt(0)<65 || line.charCodeAt(0) > 69 ){return;}
							numericOrder = line.charCodeAt(0);


							newConnection.style.order = numericOrder - 65;
						}

						// Case Transilien 
						else if (parentType == "Transilien"){

							let lines = ["H","J","K","L","N","P","R","U"];


							if( line.length !=1  ||  lines.indexOf(line) == -1 ){return;}
							numericOrder = lines.indexOf(line)


							newConnection.style.order = numericOrder;
						}

						else if (parentType == "Tram" ){

							line = line.slice(1);
							
							let numericOrder = parseInt(line);
							if(!numericOrder || numericOrder < 1 || numericOrder > 13){return;}
							if( line == "3B" || line > 3 ){
								numericOrder++;
							}

							newConnection.style.order = numericOrder;
							newConnection.setAttribute("value","t" + line);
							newConnection.setAttribute("truename","t" + line);
							newConnection.style.backgroundImage = "url('blocks/connections/trams/t" + line + ".svg')";
							newConnection.className = currentElement.parentElement.getAttribute("type")+" connectionpoint lineT"+line;

							
							
						}




						// consolef.log(currentElement);
						
						// CURRENTLY JUST CHANGING CURRENT LINE'S
						if(currentElement.parentElement.parentElement.className == "linename" && currentElement.className.indexOf("addConnection") != -1){
							let cleaningElements = document.querySelectorAll(".linename .connectionpoint");
							for (let i = cleaningElements.length - 1; i >= 0; i--) {
								let el = cleaningElements[i];
								if(el.className.indexOf("addConnection") == -1 ){currentElement.parentElement.removeChild(el);}
							}
						}

						currentElement.parentElement.insertBefore(newConnection,currentElement);
						let newColor = getComputedStyle(newConnection).color;

						// console.log(newColor);

						// if it's actually not the tram-color tricks -> I use color when using trams
						if(newColor == "transparent" || newColor == "rgb(35, 31, 32)" || newColor == "rgb(255, 255, 255)" ){newColor = getComputedStyle(newConnection).backgroundColor;}


						if(currentElement.parentElement.parentElement.className == "linename" && currentElement.className.indexOf("addConnection") != -1){
							this.ChangeSVGColors(newColor);					
						}
						// CURRENTLY JUST CHANGING CURRENT LINE'S
						if(currentElement.className.indexOf("connectionpoint") !=-1 && currentElement.className.indexOf("addConnection") == -1 ){
							this.ChangeSVGColors(newColor);
							currentElement.parentElement.removeChild(currentElement);
						}





					}
				}
				// Adding new connection line
				else if( currentElement.className=="connectionpoint addConnectionLine" ){
					let newConnectionLine = document.createElement("div");
					newConnectionLine.className = "connectionline";
					newConnectionLine.setAttribute("type","metro");
					// <span class="connectionpoint emptyforhovering" value="0"></span>\
					newConnectionLine.innerHTML='<img src="blocks/connections/pointM.svg" class="connectionType" />\
					<button class="connectionpoint addConnection"></button>';
					currentElement.parentElement.insertBefore(newConnectionLine,currentElement);
					
				}



				//type is a station point
				else if( currentType && currentType.indexOf("point") != -1  ){
					
					// console.log(currentType);


					switch(currentType){

						case "pointterminus" :
							if(currentElement.parentElement.className == "blockcontainer point" ){ 
								currentElement.parentElement.className = "blockcontainer point connected";
								return;
							}


							currentElement.innerHTML = pointEmpty.replace("#fcc907",GLOBALColor);
							currentElement.setAttribute("name","pointempty");


							currentElement.parentElement.querySelector(".name").className = "name";
							currentElement.parentElement.className = "blockcontainer point";
							break;
						case "pointempty" :
							currentElement.innerHTML = pointCorr.replace("#fcc907",GLOBALColor);
							currentElement.setAttribute("name","pointcorr");
							currentElement.parentElement.querySelector(".name").className = "name";
							currentElement.parentElement.className = "blockcontainer point connected";
							break;
						case "pointcorr" :
								// console.warn(currentElement)
							// First of the line... 
							if( trueCurrentElement.previousElementSibling.previousElementSibling == null  ){
								currentElement.innerHTML = pointTerminus.replace("#fcc907",GLOBALColor);
								currentElement.setAttribute("name","pointterminus");
								// currentElement.src = "blocks/pointterminusLeft.svg";
							}
							if( trueCurrentElement.nextElementSibling.nextElementSibling == null  ){
								currentElement.innerHTML = pointTerminus.replace("#fcc907",GLOBALColor);
								currentElement.setAttribute("name","pointterminus");
								// currentElement.src = "blocks/pointterminusRight.svg";
							}
							else{
								currentElement.innerHTML = pointTerminus.replace("#fcc907",GLOBALColor);
								currentElement.setAttribute("name","pointterminus");
				

								// currentElement.src = "blocks/pointterminus.svg";
							}
							// currentElement.name = "pointterminus";

							currentElement.parentElement.querySelector(".name").className = "name terminus";
							currentElement.parentElement.className = "blockcontainer point";
							break;
					}


				}



			}
		}


















		// onDragOver={e => {
		//     e.dataTransfer.dropEffect = "move";
		//     e.preventDefault()
		// }}
		// onDragEnter={e => {
		//     e.preventDefault()
		// }}


	removeIndicator(event = null){
			// return
			if(this.trueIndicator.parentElement){
					this.output.removeChild(this.trueIndicator);
			}
		}














		// basically a drawing function
	outputOnmousemove(event){
			// Not in drawing mode
			if( CURRENTLY_DOING == deleting || CURRENTLY_DOING == pointing ){
				this.removeIndicator();
				return;
			}
			
			let mouseX = event.clientX;

			let target = event.target;
			let className = target.className;

			// trying to get the parentelement if it's one of the children : if it's the container -> return

			if( className == "name" || className == "img" || className == "name terminus" || className == "connection" ){
				target = target.parentElement;
			}

			let nodeName = target.nodeName;

			if( className == "allsvgcontainer" || nodeName == "SPAN" || nodeName == "img"){
				return
			}
			// console.log(target);

			let bbox = target.getBoundingClientRect();

			let targetLeft = bbox.x;
			let targetRight = bbox.x + bbox.width;
			
			let targetMid = ( targetLeft + targetRight ) / 2;


			if( CURRENTLY_DOING == drawingpath && this.trueIndicator.className != "indicator line" ){
				this.trueIndicator.innerHTML = pathHTML.replace("#fcc907",GLOBALColor);
				this.trueIndicator.className = "indicator line";
			}

			else if( CURRENTLY_DOING == drawingpoint && this.trueIndicator.className != "indicator point" ){
				this.trueIndicator.innerHTML = editedpointHTML.replace("#fcc907",GLOBALColor);
				this.trueIndicator.className = "indicator point";
			}



			if(target == this.trueIndicator){return}
			// console.log(target);


			if( mouseX > targetMid ){
				if( target.nextElementSibling && target.nextElementSibling != this.trueIndicator ){
					this.output.insertBefore(this.trueIndicator,target.nextElementSibling);
				}
			}
			else{
				if( target.previousElementSibling && target.previousElementSibling != this.trueIndicator ){
					this.output.insertBefore(this.trueIndicator,target);
				}
			}



		}



		outputOnclick(event){
			console.log("ok!");
			if( CURRENTLY_DOING == deleting || CURRENTLY_DOING == pointing ){
				return;
			}

			let toAdd;

			if(CURRENTLY_DOING == drawingpath){
				toAdd = document.createElement("div");

				toAdd.className = "blockcontainer line";

				toAdd.draggable = "true";

				toAdd.innerHTML = pathHTML.replace("#fcc907",GLOBALColor);

			}	
			else if(CURRENTLY_DOING == drawingpoint){
				toAdd = document.createElement("div");

				toAdd.className = "blockcontainer point";

				toAdd.draggable = "true";

				toAdd.innerHTML = pointHTML.replace("#fcc907",GLOBALColor);

			}


				if(toAdd){this.output.insertBefore(toAdd,this.trueIndicator);}

			toAdd = null;


		}




	saveLocalStorage(){
			this.removeIndicator();
			window.localStorage.lilibuild = JSON.stringify( this.exporter.exportJSON() );
		}


	loadLocalStorage(){
			try{
				this.exporter.importJSON( JSON.parse( window.localStorage.lilibuild ) );
			}
			catch(e){
				this.saveLocalStorage();
			}


		} 






	



		open() {
			this.fileInput.click();
		}




				

		exportPicture(event = null,format = 1){
			this.showExportFormatPopup();
		}

		showExportFormatPopup() {
			const exportPopup = document.getElementById('export-format');
			const formatOptions = exportPopup.querySelectorAll('.format-option');
			
			formatOptions.forEach(option => option.classList.remove('selected'));
				exportPopup.style.display = 'flex';
			
			this.eventManager.bindExportFormatPopupEvents(exportPopup, formatOptions);
		}

		performExport(format) {
			document.body.style.overflow = "visible";
			this.output.style.overflowX = "visible";
			this.outputContainer.style.overflowX = "visible";
			this.outputContainer.style.maxWidth = "unset";
			let promised;
			let filename;

			if( format == 0){
				promised = htmlToImage.toPng(document.getElementById("dragtarget"));
				filename = "mynewline.png";
			} 
			else if( format == 1 ){
				promised = htmlToImage.toSvg(document.getElementById("dragtarget"));
				filename = "mynewline.svg";
			}
			else if( format == 2 ){
				promised = htmlToImage.toJpeg(document.getElementById("dragtarget"));
				filename = "mynewline.jpg";
			}

			if( !promised ){
				console.error("Failed to create image");
				return;
			}

			promised.then(function (dataUrl) {
				let mimeType;
				switch(format) {
					case 0: mimeType = "image/png"; break;
					case 1: mimeType = "image/svg+xml"; break;
					case 2: mimeType = "image/jpeg"; break;
					default: mimeType = "image/png";
				}
				this.downloadFile(filename, dataUrl, mimeType); 
			}.bind(this)).catch(function(error) {
				console.error("Error exporting picture:", error);
			});
			promised.finally(function(){

				document.body.style.overflow = "";
				this.output.style.overflowX = "";
				this.outputContainer.style.overflowX = "";
				this.outputContainer.style.maxWidth = "";


			}.bind(this) );
		}

		downloadFile(filename,content,type = "text/plain"){
			try {
				let fileBlob;
				
				// Si c'est un data URL (commence par "data:"), on le traite différemment
				if (content.startsWith('data:')) {
					// Pour les data URLs, on peut les utiliser directement
					let tempLink = document.createElement("a");
					tempLink.download = filename;
					tempLink.href = content;
					tempLink.click();
					return;
				}
				
				// Pour les autres types de contenu
				fileBlob = new Blob([content],{type:type});
			
				let tempLink = document.createElement("a");
			
				tempLink.download = filename;
				tempLink.href = URL.createObjectURL(fileBlob);
			
				tempLink.click();
			
			
				URL.revokeObjectURL(tempLink.href);
				// document.removeChild(tempLink);
			} catch (error) {
				console.error("Error downloading file:", error);
			}
		}
		

		preparePrint(event){

			document.body.style.overflow = "visible";
			this.output.style.overflowX = "visible";
			this.outputContainer.style.overflowX = "visible";
			this.outputContainer.style.maxWidth = "unset";
			let promised = htmlToImage.toSvg(document.getElementById("dragtarget"));

			promised.then(function (dataUrl) { 


				this.hiddenPrintZone.src = dataUrl;
				this.hiddenPrintZone.onload = function(){print()};

			}.bind(this))
			promised.finally(function(){

				document.body.style.overflow = "";
				this.output.style.overflowX = "";
				this.outputContainer.style.overflowX = "";
				this.outputContainer.style.maxWidth = "";


			}.bind(this));




		}

		tryImport(){
			this.exporter.importJSON(JSON.parse(ligne7bis))
		}

		// Output drag end handler
		outputOndragend(event) {
			let element = event.srcElement;
			let deltaX = (event.pageX - LAST_X);
			let nodes = this.output.children;
			let currentX = event.offsetX;
			let beforeElement = null;
			let afterElement = null;

			// element.offsetLeft - this.output.offsetLeft
			currentX = event.clientX;

			for (let i = nodes.length - 1; i >= 0; i--) {
				let node = nodes[i];
				let leftX = node.getBoundingClientRect().left;
				let rightX = leftX + node.offsetWidth;
				let midX = (rightX + leftX) / 2;

				if (currentX < 0) {
					currentX = 1;
				}

				if (currentX >= leftX && currentX <= rightX) {
					if (currentX > midX) {
						afterElement = node;
					} else {
						beforeElement = node;
					}
				}
			}

			if (afterElement && afterElement.className == "emptyfordraggingend") {
				this.output.insertBefore(element, afterElement.previousElementSibling);
				return;
			} else if (beforeElement && beforeElement.className == "emptyfordraggingstart") {
				this.output.insertBefore(element, beforeElement.nextElementSibling);
				return;
			}

			// Himself!
			if (afterElement == element) {
				return;
			}
			// Himself!
			if (beforeElement == element) {
				return;
			}

			if (beforeElement == null && afterElement != null) {
				beforeElement = afterElement.nextElementSibling;
			} else if (afterElement == null && beforeElement == null) {
				return;
			}

			this.output.insertBefore(element, beforeElement);
			return;
		}
	}


window.main = new App();