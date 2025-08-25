const deleting = 0;
const pointing = 1;
const drawingpath = 2;
const drawingpoint = 3;
// Saving each thirty secs
let SAVE_INTERVAL = 15;

let CURRENTLY_DOING = pointing;

let GLOBALColor = "rgb(13, 140, 93)";

let	DELETING_POINTS = false;

let SWITCHING_CONNECTION = false;

let LAST_X = null;



class App {
	
	constructor() {

		//Default blocks btw
		this.DEFAULT_COLOR = "rgb(13, 140, 93)";


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
		this.githubButton = document.getElementById("bGithub");

		// "windows" -> info / forms and settings popups 

		this.aboutWindow = document.getElementById('about');
		this.choicesGrid = document.getElementById("customPromptChoices");
		this.custompromptWindow = document.getElementById('custom-prompt-window');


		// hidden zone for printing a clean thing

		this.hiddenPrintZone = document.getElementById("printmodeonlyImg");

		// hidden input for files

		this.fileInput = document.createElement('input');

		// element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));

		this.fileInput.setAttribute('type', 'file');

		this.fileInput.style.display = 'none';

		this.fileInput.setAttribute('accept', '.json');

		document.body.appendChild(this.fileInput);

		this.eventManager = new EventManager(this);
		this.eventManager.initializeEvents();

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
				this.trueIndicator.innerHTML = pathHTML.replace(this.DEFAULT_COLOR,GLOBALColor);
				this.trueIndicator.className = "indicator line";
			}

			else if( CURRENTLY_DOING == drawingpoint && this.trueIndicator.className != "indicator point" ){
				this.trueIndicator.innerHTML = editedpointHTML.replace(this.DEFAULT_COLOR,GLOBALColor);
				this.trueIndicator.className = "indicator point";
			}



			if(target == this.trueIndicator){return}
			// console.log(target);

			try {
	
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
	
			} catch (error) {
				
			}


		}



		outputOnclick(event){
			// console.log("ok!");
			if( CURRENTLY_DOING == deleting || CURRENTLY_DOING == pointing ){
				return;
			}

			let toAdd;

			if(CURRENTLY_DOING == drawingpath){
				toAdd = document.createElement("div");

				toAdd.className = "blockcontainer line";

				toAdd.draggable = "true";

				toAdd.innerHTML = pathHTML.replace(this.DEFAULT_COLOR,GLOBALColor);

			}	
			else if(CURRENTLY_DOING == drawingpoint){
				toAdd = document.createElement("div");

				toAdd.className = "blockcontainer point";

				toAdd.draggable = "true";

				toAdd.innerHTML = pointHTML.replace(this.DEFAULT_COLOR,GLOBALColor);

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

		hideforExport(){
			document.body.style.overflow = "visible";
			this.output.style.overflowX = "visible";
			this.outputContainer.style.overflowX = "visible";
			this.outputdragzone.style.overflowY = "hidden";
			this.outputdragzone.style.minWidth = this.outputdragzone.scrollWidth + "px";
			this.outputContainer.style.maxWidth = "unset";
		}

		showafterExport(){
			document.body.style.overflow = "";
			this.output.style.overflowX = "";
			this.outputContainer.style.overflowX = "";
			this.outputdragzone.style.overflowY = "";
			this.outputdragzone.style.minWidth = "";
			this.outputContainer.style.maxWidth = "";
		}

		performExport(format) {

			this.hideforExport();

			let promised;
			let filename;
			
			filename = dumbLineName();

			if( format == 0){
				promised = htmlToImage.toPng(this.outputdragzone);
				filename += ".png";
			} 
			else if( format == 1 ){
				promised = htmlToImage.toSvg(this.outputdragzone);
				filename += ".svg";
			}
			else if( format == 2 ){
				promised = htmlToImage.toJpeg(this.outputdragzone);
				filename += ".jpg";
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
				this.showafterExport();

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

			this.hideforExport();
			let promised = htmlToImage.toSvg(document.getElementById("dragtarget"));

			promised.then(function (dataUrl) { 


				this.hiddenPrintZone.src = dataUrl;
				this.hiddenPrintZone.onload = function(){print()};

			}.bind(this))
			promised.finally(function(){

				this.showafterExport();

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

		showCustomPrompt = function({ title = "Select a line", type = "metro" } = {}) {

			// const choices = //{
			//     // metro: 
			// 	[
			//         { value: "1", label: "1" ,type :"metro"}, { value: "2", label: "2" ,type :"metro"}, { value: "3", label: "3" ,type :"metro"}, { value: "3B", label: "3B" ,type :"metro"},
			//         { value: "4", label: "4" ,type :"metro"}, { value: "5", label: "5" ,type :"metro"}, { value: "6", label: "6" ,type :"metro"}, { value: "7", label: "7" ,type :"metro"}, { value: "7B", label: "7B" },
			//         { value: "8", label: "8" ,type :"metro"}, { value: "9", label: "9" ,type :"metro"}, { value: "10", label: "10" ,type :"metro"}, { value: "11", label: "11" ,type :"metro"}, { value: "12", label: "12" ,type :"metro"}, { value: "13", label: "13" ,type :"metro"}, { value: "14", label: "14" ,type :"metro"}, { value: "15", label: "15" ,type :"metro"}, { value: "16", label: "16" ,type :"metro"}, { value: "17", label: "17" ,type :"metro"}, { value: "18", label: "18" ,type :"metro"}, { value: "19", label: "19" ,type :"metro"}
			//     // ],
			//     // RER: [
			//         ,{ value: "A", label: "A" ,type :"rer"}, { value: "B", label: "B" ,type :"rer"}, { value: "C", label: "C" ,type :"rer"}, { value: "D", label: "D" ,type :"rer"}, { value: "E", label: "E" ,type :"rer"}
			//     // ],
			//     // Train: [
			//         ,{ value: "H", label: "H" ,type :"Train"}, { value: "J", label: "J" ,type :"Train"}, { value: "K", label: "K" ,type :"Train"}, { value: "L", label: "L" ,type :"Train"}, { value: "N", label: "N" ,type :"Train"}, { value: "P", label: "P" ,type :"Train"}, { value: "R", label: "R" ,type :"Train"}, { value: "U", label: "U" ,type :"Train"},{ value: "V", label: "V" ,type :"Train"}
			//     // ],
			//     // Tram: [
			//         ,{ value: "T1", label: "T1", icon: "blocks/connections/trams/t1.svg" },
			//         { value: "T2", label: "T2", icon: "blocks/connections/trams/t2.svg" },
			//         { value: "T3A", label: "T3A", icon: "blocks/connections/trams/t3A.svg" },
			//         { value: "T3B", label: "T3B", icon: "blocks/connections/trams/t3B.svg" },
			//         { value: "T4", label: "T4", icon: "blocks/connections/trams/t4.svg" },
			//         { value: "T5", label: "T5", icon: "blocks/connections/trams/t5.svg" },
			//         { value: "T6", label: "T6", icon: "blocks/connections/trams/t6.svg" },
			//         { value: "T7", label: "T7", icon: "blocks/connections/trams/t7.svg" },
			//         { value: "T8", label: "T8", icon: "blocks/connections/trams/t8.svg" },
			//         { value: "T9", label: "T9", icon: "blocks/connections/trams/t9.svg" },
			//         { value: "T10", label: "T10", icon: "blocks/connections/trams/t10.svg" },
			//         { value: "T11", label: "T11", icon: "blocks/connections/trams/t11.svg" },
			//         { value: "T12", label: "T12", icon: "blocks/connections/trams/t12.svg" },
			//         { value: "T13", label: "T13", icon: "blocks/connections/trams/t13.svg" },
			//         { value: "T14", label: "T14", icon: "blocks/connections/trams/t14.svg" },
			//     ]
			// // };
		
			return new Promise((resolve) => {
		
				const promptWindow = document.getElementById("custom-prompt-window");
				const titleElem = document.getElementById("customPromptTitle");
				const choicesGrid = document.getElementById("customPromptChoices");
		
				titleElem.textContent = title;
				choicesGrid.onclick = function(event){
					let origine = event.target;
					let value = origine.dataset.value;
		


		
					if(value) {
						promptWindow.style.display = "none";
						resolve(value);
					}
					else{
						resolve(null);
					}
		
				}
		
		
				promptWindow.style.display = "flex";
		
				// Close on background click
				promptWindow.onclick = function(e) {
					if (e.target === promptWindow) {
						promptWindow.style.display = "none";
						resolve(null);
					}
				};
				// Close on X button
				const closeBtn = promptWindow.querySelector(".close-button");
				closeBtn.onclick = function() {
					promptWindow.style.display = "none";
					resolve(null);
				};
			});
		};


	}


window.main = new App();