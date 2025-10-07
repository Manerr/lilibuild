const deleting = 0;
const pointing = 1;
const drawingpath = 2;
const drawingpoint = 3;
const drawingbranch = 4;
// Saving each thirty secs
let SAVE_INTERVAL = 15;

let CURRENTLY_DOING = pointing;


let DELETING_POINTS = false;

let SWITCHING_CONNECTION = false;

let LAST_X = null;


// ligne12JSON = DEBUG_LINE;

class App {

	constructor() {

		//Default blocks btw
		this.DEFAULT_COLOR = "rgb(13, 140, 93)";

		this.line = new Object();

		this.line.color = "rgb(13, 140, 93)";
		this.line.name = "12";
		this.line.type = "metro";
		this.line.custom = false;

		this.forghostimg = new Image();
		this.forghostimg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAJUlEQVR4AeyTsQ0AAAyCSP8/uvEGN4MHOBA4ynkAMpBBMhrw4AEAAP//uBwiawAAAAZJREFUAwBJIAAhJFoqZwAAAABJRU5ErkJggg==";

		this.exporter = new Exporter(this);


		this.trueIndicator = document.createElement("div");


		// let colorchanger = document.getElementById("colorvalue");

		this.output = document.querySelector(".allsvgcontainer");

		this.outputdragzone = document.getElementById("dragtarget");

		this.outputContainer = document.getElementById("result");


		this.insertbeforeit = document.getElementById("insertbeforeit")

		this.dragIndicator = document.getElementById("indicator");

		this.typeToInsert = 0;

		this.firstZone = document.querySelector(".emptyfordraggingstart");

		this.lastZone = document.querySelector(".emptyfordraggingend");

		this.lineNameZone = document.querySelector(".linename");




		// new buttons
		this.asideContainer = document.getElementById("asidecontainer");

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
		this.exportPopup = document.getElementById('export-format');


		// custom line div
		this.customColorInput = document.getElementById("custom-color");
		this.customLineText = document.getElementById("custom-line-input");

		this.customLineTypeGroup = document.getElementById("custom-switch-group");

		this.customLineValidate = document.getElementById("custom-line-validate");


		// hidden zone for printing a clean thing
		this.hiddenPrintZone = document.getElementById("printmodeonlyImg");

		// hidden input for files
		this.fileInput = document.createElement('input');

		this.fileInput.setAttribute('type', 'file');
		this.fileInput.style.display = 'none';
		this.fileInput.setAttribute('accept', '.json');

		document.body.appendChild(this.fileInput);


		this.eventManager = new EventManager(this);

		this.eventManager.initializeEvents();

		this.saveLocalStorage = this.saveLocalStorage.bind(this);
		this.loadLocalStorage = this.loadLocalStorage.bind(this);

		this.svgFILTER = document.getElementById("trams-filter");

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

	ChangeSVGColors(value = null) {
		
		if (!value) { this.line.color = "#0f0"; } else { this.line.color = value; }

		let svgs = document.querySelectorAll(".img svg path");
		for (let i = svgs.length - 1; i >= 0; i--) {
			svgs[i].style.stroke = this.line.color;
		}
		svgs = document.querySelectorAll(".img g .endpoint :last-child");

		for (let i = svgs.length - 1; i >= 0; i--) {
			svgs[i].style.fill = this.line.color;
		}
		if (this.customColorInput) {
			this.customColorInput.value = this.line.color[0] == "#" ? this.line.color : rgbStringToHex(this.line.color);
		}

		main.svgFILTER.querySelectorAll("feFlood").forEach((el)=>{
			// console.log(el);
			el.setAttribute("flood-color",main.line.color);
		})




	}


	whenDeDragging(event) {
		return ;
	}

	removeIndicator(event = null) {
		// return
		if (this.trueIndicator.parentElement) {
			this.output.removeChild(this.trueIndicator);
		}
	}

	// basically a drawing function
	outputOnmousemove(event) {

		
		// Not in drawing mode
		if (CURRENTLY_DOING == deleting || CURRENTLY_DOING == pointing) {
			this.removeIndicator();
			return;
		}

		let mouseX = event.clientX;
		let mouseY = event.clientY;

		let target = event.target;
		let className = target.className;


		// trying to get the parentelement if it's one of the children : if it's the container -> return

		if (className == "name" || className == "img" || className == "name terminus" || className == "connection") {
			target = target.parentElement;
		}


		// console.log(target);

		let nodeName = target.nodeName;

		if (className == "allsvgcontainer" || nodeName == "SPAN" || nodeName == "img") {
			return
		}

		let bbox = target.getBoundingClientRect();

		let targetLeft = bbox.x;
		let targetRight = bbox.x + bbox.width;

		let targetMid = (targetLeft + targetRight) / 2;

		let targetMidY = (bbox.y + bbox.height / 2) 



		if (CURRENTLY_DOING == drawingpath && this.trueIndicator.className != "indicator line") {
			this.trueIndicator.innerHTML = pathHTML.replace(this.DEFAULT_COLOR, this.line.color);
			this.trueIndicator.className = "indicator line";
		} else if (CURRENTLY_DOING == drawingpoint && this.trueIndicator.className != "indicator point") {
			this.trueIndicator.innerHTML = editedpointHTML.replace(this.DEFAULT_COLOR, this.line.color);
			this.trueIndicator.className = "indicator point";
		}
		if (CURRENTLY_DOING == drawingbranch && this.trueIndicator.className != "indicator line branch") {
			this.trueIndicator.innerHTML = pathBranchHTML.replaceAll(this.DEFAULT_COLOR, this.line.color);
			this.trueIndicator.className = "indicator line branch";
		}


		if (target == this.trueIndicator) { return }

		// BRANCH LOGIC - wip

		if(target.classList.contains("branch")){

			let rigthBranchTop = target.nextElementSibling.firstChild;
			let rigthBranchBottom = target.nextElementSibling.lastChild;
 
				// console.log(target);

			let parent = target.parent;

			// ADDING ON THE LEFT PART OF A BRANCH (one of the two sperated parts) ->
			// between it or even inside at the right of a innercontainer:  





			if(mouseX > targetMid){	
				
				// this.output.removeChild(this.indicator);
				

				// if(mouseY < targetMidY){
				// 	rigthBranchTop.insertBefore(this.trueIndicator, rigthBranchTop.	firstChild);
				// }
				// else rigthBranchBottom.insertBefore(this.trueIndicator, rigthBranchBottom.firstChild);
			
			}

		}



		try {

			if (mouseX > targetMid) {
				if (target.nextElementSibling && target.nextElementSibling != this.trueIndicator) {
					
					
					this.output.insertBefore(this.trueIndicator, target.nextElementSibling);
				}
			} else {
				if (target.previousElementSibling && target.previousElementSibling != this.trueIndicator) {
					this.output.insertBefore(this.trueIndicator, target);
				}
			}

		} catch (error) {

		}


	}

	outputOnclick(event) {

		if (CURRENTLY_DOING == deleting || CURRENTLY_DOING == pointing) {
			return;
		}

		let toAdd;

		if (CURRENTLY_DOING == drawingpath) {
			toAdd = document.createElement("div");

			toAdd.className = "blockcontainer line";

			toAdd.draggable = "true";

			toAdd.innerHTML = pathHTML.replace(this.DEFAULT_COLOR, this.line.color);
		}
		else if (CURRENTLY_DOING == drawingbranch) {

			
			toAdd = document.createElement("div");

			toAdd.className = "blockcontainer branch";

			toAdd.draggable = "true";

			toAdd.innerHTML = pathBranchHTML.replace(this.DEFAULT_COLOR, this.line.color);


		} else if (CURRENTLY_DOING == drawingpoint) {
			toAdd = document.createElement("div");

			toAdd.className = "blockcontainer point";

			toAdd.draggable = "true";

			toAdd.innerHTML = pointHTML.replace(this.DEFAULT_COLOR, this.line.color);


		}


		if (toAdd) { 
			this.output.insertBefore(toAdd, this.trueIndicator);
			this.removeIndicator(); 
			this.manageGradients();
		}

		toAdd = null;

	}

	manageGradients(){
		
		let elementstoScan = this.output.children;

		// console.log(elementstoScan);

		let len = elementstoScan.length - 1;
		for (let i = 1; i < len ; i++) {
			const part = elementstoScan[i];
			
			if(part.classList.contains("blockcontainer") && part.classList.contains("line")) {
				this._managegradientPartBased(part,i,len);
			}
			else if(part.classList.contains("innercontainer")){

				this._clearInnerGradients(part.childNodes[0].childNodes);
				this._clearInnerGradients(part.childNodes[1].childNodes);

				if(i != len - 1){
					this._managegradientPartBased(part.childNodes[0].firstChild,i,len);
					this._managegradientPartBased(part.childNodes[1].firstChild,i,len);
				}
				else{
					this._managegradientPartBased(part.childNodes[0].lastChild,i,len);
					this._managegradientPartBased(part.childNodes[1].lastChild,i,len);

				}
			}

				
		}


	}

	_clearInnerGradients(nodes){
		nodes.forEach((part)=>{
			if(part.classList.contains("endgradient") || part.classList.remove("startgradient")){
				part.classList.remove("endgradient");
				part.classList.remove("startgradient");
			}
		});
	}

	_managegradientPartBased(part,i,len){

		if(!part) return;

		if(i == 1) part.classList.add("startgradient");
        else if(i == len - 1)part.classList.add("endgradient");
		else{
			if(part.classList.contains("endgradient") || part.classList.remove("startgradient")){
				part.classList.remove("endgradient");
				part.classList.remove("startgradient");
			}
		}
	}

	//For all connectionline at once -> gonna check if there's need to remove too, at the end;
	manageAutoConnectionLines_Margin(connectionLines){

		

		let firstLine;

		if(connectionLines.length) firstLine = connectionLines[0]
		else firstLine = connectionLines;

		//Next .line element		
		let nextPart = firstLine.parentElement.parentElement.nextElementSibling;
		let max = 0;


		if(!nextPart || !nextPart.classList.contains("line")) return;


		for (let index = 0; index < connectionLines.length; index++) {
			const connectionLine = connectionLines[index];
			


			let countConnections = connectionLine.childElementCount;
			
			if(max < countConnections) max = countConnections; 
			if(countConnections < 4 ) continue
			
		}


		if(max > 3){

			nextPart.classList.add("bigger")

			if(max == 4){
				nextPart.classList.add("bigger1");
				nextPart.classList.remove("bigger2");
				nextPart.classList.remove("bigger3");
				nextPart.classList.remove("bigger4");
			}
			else if(max == 5){
				nextPart.classList.add("bigger2");
				nextPart.classList.remove("bigger3");
				nextPart.classList.remove("bigger4");
			}
			else if(max == 6){
				nextPart.classList.add("bigger3");
				nextPart.classList.remove("bigger4");
			}
			else nextPart.classList.add("bigger4");		

		}
		
		else nextPart.classList.remove("bigger");


	}


	manageAllConnectionsMargins(){

		let connections = this.output.querySelectorAll(".allsvgcontainer .connection");

		for (let index = 0; index < connections.length; index++) {
			const connectionLines = connections[index].children;

			this.manageAutoConnectionLines_Margin(connectionLines);

		}

	}

	saveLocalStorage() {

		// return;

		// this.removeIndicator();
		window.localStorage.lilibuild = this.exporter.exportJSON();
	}


	loadLocalStorage() {
		// this.outputdragzone.style.visibility = "visible";
		// return;

		if (window.localStorage.lilibuild == undefined || window.localStorage.lilibuild == 'undefined') {
			window.localStorage.lilibuild = ligne12JSON;

		}

		try {
			this.exporter.importJSON(JSON.parse(window.localStorage.lilibuild));
		} catch (e) {
			alert("Error on loading saved data - happens on first launch or when this error: "+e.toString());
			this.saveLocalStorage();
			// document.location.reload();
		}

		this._sanitizeBlocks();



	}

	open() {
		this.fileInput.click();
	}

	exportPicture(event = null, format = 1) {
		this.showExportFormatPopup();
	}

	showExportFormatPopup() {
		const formatOptions = this.exportPopup.querySelectorAll('.format-option');

		formatOptions.forEach(option => option.classList.remove('selected'));
		this.exportPopup.style.display = 'flex';

		this.eventManager.bindExportFormatPopupEvents(this.exportPopup, formatOptions);
	}

	hideforExport() {
		document.body.style.overflow = "visible";
		this.output.style.overflowX = "visible";
		this.outputContainer.style.overflowX = "visible";
		this.outputdragzone.style.overflowY = "hidden";
		this.outputdragzone.style.minWidth = this.outputdragzone.scrollWidth + "px";
		this.outputContainer.style.maxWidth = "unset";
	}

	showafterExport() {
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

		if (format == 0) {
			promised = htmlToImage.toPng(this.outputdragzone);
			filename += ".png";
		} else if (format == 1) {
			promised = htmlToImage.toSvg(this.outputdragzone);
			filename += ".svg";
		} else if (format == 2) {
			promised = htmlToImage.toJpeg(this.outputdragzone);
			filename += ".jpg";
		}

		if (!promised) {
			console.error("Failed to create image");
			return;
		}

		promised.then(function(dataUrl) {
			let mimeType;
			switch (format) {
				case 0:
					mimeType = "image/png";
					break;
				case 1:
					mimeType = "image/svg+xml";
					break;
				case 2:
					mimeType = "image/jpeg";
					break;
				default:
					mimeType = "image/png";
			}
			this.downloadFile(filename, dataUrl, mimeType);
		}.bind(this)).catch(function(error) {
			console.error("Error exporting picture:", error);
		});
		promised.finally(function() {
			this.showafterExport();

		}.bind(this));
	}

	downloadFile(filename, content, type = "text/plain") {
		try {
			let fileBlob;

			if (content.startsWith('data:')) {
				let tempLink = document.createElement("a");
				tempLink.download = filename;
				tempLink.href = content;
				tempLink.click();
				return;
			}

			fileBlob = new Blob([content], { type: type });

			let tempLink = document.createElement("a");

			tempLink.download = filename;
			tempLink.href = URL.createObjectURL(fileBlob);

			tempLink.click();


			URL.revokeObjectURL(tempLink.href);
			document.removeChild(tempLink);
		} catch (error) {
			console.error("Error downloading file:", error);
		}
	}


	preparePrint(event) {

		this.hideforExport();
		let promised = htmlToImage.toSvg(document.getElementById("dragtarget"));

		promised.then(function(dataUrl) {


			this.hiddenPrintZone.src = dataUrl;
			this.hiddenPrintZone.onload = function() { print() };

		}.bind(this))
		promised.finally(function() {

			this.showafterExport();

		}.bind(this));




	}

	tryImport() {
		this.exporter.importJSON(JSON.parse(ligne7bis))
	}

	// Output drag end handler
	outputOndragend(event) {
		let element = event.srcElement;
		// let deltaX = (event.pageX - LAST_X);
		let nodes = this.output.children;
		let currentX = event.offsetX;
		let beforeElement = null;
		let afterElement = null;

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
		this.manageGradients();

		this.manageAllConnectionsMargins();

		return;
	}

	showCustomPrompt = function({ title = "Select a line", type = "metro" } = {}) {


		return new Promise((resolve) => {

			

			if(arguments[0].showCustomLine){
				
				document.body.classList.add("showcustomfield");
			
				this.customLineText.value = this.line.name;
			
			}
			else if(document.body.classList.contains("showcustomfield")) document.body.classList.remove("showcustomfield");
			

			const promptWindow = document.getElementById("custom-prompt-window");
			const titleElem = document.getElementById("customPromptTitle");
			const choicesGrid = document.getElementById("customPromptChoices");

			titleElem.textContent = title;
			choicesGrid.onclick = function(event) {
				let origine = event.target;
				let value = origine.dataset.value;


				if (value) {
					promptWindow.style.display = "none";
					resolve(value);
				} else {
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

			this.customLineValidate.onclick = function(){
				let name = this.customLineText.value;

				if(!name) return;
				this.line.color = this.customColorInput.value;
				this.line.name = name;
				this.line.type = this.customLineTypeGroup.querySelector(".selected").getAttribute("data-type");
				this.ChangeSVGColors(this.line.color);
				promptWindow.style.display = "none";		
				resolve("custom");
			}.bind(this);


		});
	}.bind(this);


	manageKeyboard(event){

		let key = event.key;

		if(key == "Escape"){
			
			if(this.custompromptWindow.style.display && this.custompromptWindow.style.display != "none" ) this.custompromptWindow.style.display = "none";
			else if( this.aboutWindow.style.display != "none" ) this.aboutWindow.style.display = "none";
			else if( this.exportPopup.style.display != "none" ) this.exportPopup.style.display = "none";

		}
		

	}

	hideDragGhost(data){
		
		data.setDragImage(this.forghostimg,0,0);
	}


	// Not the best names chosen - handle missing subparts (for ex when you drag branches you dont drag the subcontainer containing elements so you cant anymore draw "on" it)
	_sanitizeBlocks(){

		let parts = this.output.childNodes;
		
		for (let index = 1; index < parts.length - 1; index++) {
			
			const element = parts[index];
			let className = element.className;
			let classList = element.classList;

			let nextElement = element.nextElementSibling;

			let previousElement = element.previousElementSibling;

			if(className == "innercontainer"){

				// if(element.style.alignItems) element.style.alignItems = "end";

				// Mix together 2 innercontainers - why would you need 2?
				if(nextElement && nextElement.className == "innercontainer"){

					nextElement.children[0].childNodes.forEach((el)=>{element.children[0].append(el)});
					nextElement.children[1].childNodes.forEach((el)=>{element.children[1].append(el)});
					nextElement.remove();
				}
				else if(nextElement && nextElement.classList.contains("branch") && !nextElement.classList.contains("branchreverse") ){
					element.children[0].style.justifyContent = "flex-end";
					element.children[1].style.justifyContent = "flex-end";
				}
				else if(previousElement && previousElement.classList.contains("branchreverse") ){
					element.children[0].style.justifyContent = "flex-start";
					element.children[1].style.justifyContent = "flex-start";
				}
				if(previousElement && previousElement.classList.contains("branchreverse") && nextElement && nextElement.classList.contains("branch") && !nextElement.classList.contains("branchreverse") ){
					console.log("Wut");
					element.children[0].style.justifyContent = "space-around";
					element.children[1].style.justifyContent = "space-around";
				}
				

			}
			else if(classList.contains("branch")){

				if( classList.contains("branchreverse")){

					// Element is branch to right
					if( !nextElement ){
						let innerLinescontiguousToBranch = document.createElement("div");
						innerLinescontiguousToBranch.className = "innercontainer";
						innerLinescontiguousToBranch.innerHTML = innerLinesHTML.replaceAll("rgb(13, 140, 93)",this.line.color);
						this.output.appendChild(innerLinescontiguousToBranch);
						this._initSortableJSBranches();
					}
					else if(nextElement.className != "innercontainer"){
						let innerLinescontiguousToBranch = document.createElement("div");
						innerLinescontiguousToBranch.className = "innercontainer";
						innerLinescontiguousToBranch.innerHTML = innerLinesHTML.replaceAll("rgb(13, 140, 93)",this.line.color);

						this.output.insertBefore(innerLinescontiguousToBranch,nextElement);
						this._initSortableJSBranches();
					}
					
				}
				else{

					// Element is branch to left
					if( !previousElement || (previousElement && previousElement.className != "innercontainer") ){
						let innerLinescontiguousToBranch = document.createElement("div");
						innerLinescontiguousToBranch.className = "innercontainer";
						innerLinescontiguousToBranch.innerHTML = innerLinesHTML.replaceAll("rgb(13, 140, 93)",this.line.color);
						this.output.insertBefore(innerLinescontiguousToBranch,element);
						this._initSortableJSBranches();

					}
				}
					


			}
			


			
		}


		// if(destination){

		// 	let innerLinescontiguousToBranch = document.createElement("div");
		// 	innerLinescontiguousToBranch.className = "innercontainer";
		// 	innerLinescontiguousToBranch.innerHTML = innerLinesHTML.replaceAll("rgb(13, 140, 93)",this.line.color);


		// 	if(!destination.classList.contains("branchreverse")){
		// 		this.output.insertBefore(innerLinescontiguousToBranch,destination);
		// 	}
		// 	else{
		// 		let next = destination.nextElementSibling;
		// 		if(!next) this.output.insertBefore(innerLinescontiguousToBranch,lastZone)
		// 		else this.output.insertBefore(innerLinescontiguousToBranch,next);

		// 	}

		// }
	}

	_manageDrawingSortable(type){

		let toAdd;

		if (type == "drawingpath") {
			toAdd = document.createElement("div");

			toAdd.className = "blockcontainer line";

			toAdd.draggable = "true";

			toAdd.innerHTML = pathHTML.replace(this.DEFAULT_COLOR, this.line.color);
		}
		else if (type == "drawingbranch") {

			
			toAdd = document.createElement("div");

			toAdd.className = "blockcontainer branch";

			toAdd.draggable = "true";

			toAdd.innerHTML = pathBranchHTML.replace(this.DEFAULT_COLOR, this.line.color);


		} else if (type == "drawingbranchreverse") {
			
			toAdd = document.createElement("div");

			toAdd.className = "blockcontainer branch branchreverse";

			toAdd.draggable = "true";

			toAdd.innerHTML = pathBranchHTML.replace(this.DEFAULT_COLOR, this.line.color);


		} else if (type == "drawingpoint") {
			toAdd = document.createElement("div");

			toAdd.className = "blockcontainer point";

			toAdd.draggable = "true";

			toAdd.innerHTML = pointHTML.replace(this.DEFAULT_COLOR, this.line.color);


		}

		
		return toAdd;

	}

	onSortableJSChoosing(e){
		
		
		let currentlyDraggingElement = e.dragged;
		let currentlyDraggingElementTo = e.to;


		let type = currentlyDraggingElement.getAttribute("type");

		if(!type) type = currentlyDraggingElement.classList[1];

		if(type == "branch" || type == "drawingbranch" || type == "drawingbranchreverse"){
			if(currentlyDraggingElementTo.classList.contains("branchtop") || currentlyDraggingElementTo.classList.contains("branchbottom")) return false;
		} 


	}
	
	// OnDragend new "version"
	onSortableJSUpdate(e){

		let cloning = e.clone;
		let destination = e.item;

		
		if(cloning.parentElement && cloning.parentElement.id == "dragelements" ){
			
			let type = cloning.getAttribute("type");

			let realElement = this._manageDrawingSortable(type);	
			if(realElement) destination.replaceWith(realElement);

		}
		// //Updating current elements
		// else if(destination.classList.contains("branch")){
		// 	this._initSortableJSBranches();

		// }
		this._sanitizeBlocks();


	}


	onSortableJSEnd(e){
		this.manageGradients();
	}

	onSortableJSDRAWING(e){
		this.manageGradients();
	}

	_initSortableJSBranches(){
		document.querySelectorAll('.innercontainer .allsvgcontainer').forEach(branchContainer => {
			Sortable.create(branchContainer, {
				animation: 150,
				handle: ['.blockcontainer',".indicator"],
				group: 'metro',
				ghostClass: "ghost",
				draggable: '.blockcontainer',
				swapThreshold: 1,
				preventOnFilter: true,
				setData: this.hideDragGhost.bind(this),
				onSort: this.onSortableJSUpdate.bind(this),
				onEnd: this.onSortableJSEnd.bind(this),
				onMove: this.onSortableJSChoosing.bind(this)
			});
		});

	}

	initSortableJS(){

		Sortable.create(this.output, {
		animation: 150, 
		handle: ['.blockcontainer',".indicator",'.innercontainer','.emptyfordraggingstart, .emptyfordraggingend'],
		group: 'metro', 
		draggable: '.blockcontainer',
		// filter: '.emptyfordraggingstart, .emptyfordraggingend', 
		preventOnFilter: true,
		swapThreshold: 1,
		ghostClass: "ghost",
		setData: this.hideDragGhost.bind(this),
		onEnd: this.onSortableJSEnd.bind(this),
		onMove: this.onSortableJSChoosing.bind(this),
		onSort: this.onSortableJSUpdate.bind(this),
		});

		this._initSortableJSBranches();


		Sortable.create(document.getElementById("dragelements"), {
		animation: 150, 
		handle: ['.indicator','.emptyfordraggingstart, .emptyfordraggingend'],
		// group: 'metro', 
		group: { name: "metro", pull: 'clone'},
		draggable: '.indicator',
		// filter: '.emptyfordraggingstart, .emptyfordraggingend', 
		preventOnFilter: true,
		swapThreshold: 1,
		ghostClass: "ghost",
		setData: this.hideDragGhost.bind(this),
		onEnd: this.onSortableJSDRAWING.bind(this),
		onMove: this.onSortableJSChoosing.bind(this)

		});

	}

}


window.main = new App();