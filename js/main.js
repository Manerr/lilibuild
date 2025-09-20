const deleting = 0;
const pointing = 1;
const drawingpath = 2;
const drawingpoint = 3;
// Saving each thirty secs
let SAVE_INTERVAL = 15;

let CURRENTLY_DOING = pointing;


let DELETING_POINTS = false;

let SWITCHING_CONNECTION = false;

let LAST_X = null;



class App {

	constructor() {

		//Default blocks btw
		this.DEFAULT_COLOR = "rgb(13, 140, 93)";

		this.line = new Object();

		this.line.color = "rgb(13, 140, 93)";
		this.line.name = "12";
		this.line.type = "metro";
		this.line.custom = false;

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

		let target = event.target;
		let className = target.className;

		// trying to get the parentelement if it's one of the children : if it's the container -> return

		if (className == "name" || className == "img" || className == "name terminus" || className == "connection") {
			target = target.parentElement;
		}

		let nodeName = target.nodeName;

		if (className == "allsvgcontainer" || nodeName == "SPAN" || nodeName == "img") {
			return
		}

		let bbox = target.getBoundingClientRect();

		let targetLeft = bbox.x;
		let targetRight = bbox.x + bbox.width;

		let targetMid = (targetLeft + targetRight) / 2;


		if (CURRENTLY_DOING == drawingpath && this.trueIndicator.className != "indicator line") {
			this.trueIndicator.innerHTML = pathHTML.replace(this.DEFAULT_COLOR, this.line.color);
			this.trueIndicator.className = "indicator line";
		} else if (CURRENTLY_DOING == drawingpoint && this.trueIndicator.className != "indicator point") {
			this.trueIndicator.innerHTML = editedpointHTML.replace(this.DEFAULT_COLOR, this.line.color);
			this.trueIndicator.className = "indicator point";
		}



		if (target == this.trueIndicator) { return }
		// console.log(target);

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


		} else if (CURRENTLY_DOING == drawingpoint) {
			toAdd = document.createElement("div");

			toAdd.className = "blockcontainer point";

			toAdd.draggable = "true";

			toAdd.innerHTML = pointHTML.replace(this.DEFAULT_COLOR, this.line.color);


		}


		if (toAdd) { 
			this.output.insertBefore(toAdd, this.trueIndicator); 
			this.manageGradients();
		}

		toAdd = null;

	}

	manageGradients(){
		
		let elementstoScan = this.output.children;
		let len = elementstoScan.length - 1;
		for (let i = 1; i < len - 1; i++) {
			const part = elementstoScan[i];
			
			if(part.classList[0] == "blockcontainer" && part.classList[1] == "line") {
				if(i == 1) part.classList.add("startgradient");
            	else if(i == len - 2)part.classList.add("endgradient");
				else{
					if(part.classList.contains("endgradient") || part.classList.remove("startgradient")){
						part.classList.remove("endgradient");
						part.classList.remove("startgradient");
					}
				}

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


		if(!nextPart.classList.contains("line")) return;


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
		this.removeIndicator();
		window.localStorage.lilibuild = JSON.stringify(this.exporter.exportJSON());
	}


	loadLocalStorage() {

		if (window.localStorage.lilibuild == undefined) {
			window.localStorage.lilibuild = ligne12JSON;

		}

		try {
			this.exporter.importJSON(JSON.parse(window.localStorage.lilibuild));
		} catch (e) {
			console.warn("Error on loading saved data - happens on first launch or when this error",e);
			this.saveLocalStorage();
		}



	}

	open() {
		this.fileInput.click();
	}

	exportPicture(event = null, format = 1) {
		this.showExportFormatPopup();
	}

	showExportFormatPopup() {
		const exportPopup = document.getElementById('export-format');
		const formatOptions = exportPopup.querySelectorAll('.format-option');

		formatOptions.forEach(option => option.classList.remove('selected'));
		exportPopup.style.display = 'flex';

		this.eventManager.bindExportFormatPopupEvents(exportPopup, formatOptions);
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

		if(key == "Escape" && this.custompromptWindow.style.display && this.custompromptWindow.style.display != "none" ) this.custompromptWindow.style.display = "none";

	}

}


window.main = new App();