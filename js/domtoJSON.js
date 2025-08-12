
class Exporter{

	constructor(parent){

		this.parent = parent;

	}




	// Should work, designed only for the line's container
	exportJSON(){
	let lineNameContainer = this.parent.outputdragzone.querySelector(".linename .connectionline");

    let lineNumber = lineNameContainer.children[1];


	let lineColor = getComputedStyle(lineNumber).color;
	// if it's actually not the tram-color tricks -> I use color when using trams
	if(lineColor == "transparent" || lineColor == "rgb(35, 31, 32)" || lineColor == "rgb(255, 255, 255)" ){lineColor = getComputedStyle(lineNumber).backgroundColor;}


    lineNumber = lineNumber.getAttribute("value");

    let lineType = lineNameContainer.getAttribute("type")


    let parts = []
    let partsDOM = this.parent.output.children;
    
    // Skipping dragzones 
    for (var i = 1; i <=  partsDOM.length - 2; i++) {
    	let DOMpart = partsDOM[i];

    	let partType = DOMpart.className.split(" ")[1]

    	
    	// If point:
    	if ( partType == "point" ){

    		let stationContainer = DOMpart.children[1];

    		let stationName = stationContainer.innerText;

    		let stationType = DOMpart.children[0].getAttribute("name");

    		let stationHasConnection = DOMpart.className.search("connected") != -1;

    		let DOMconnections = DOMpart.children[2].querySelectorAll(".connectionpoint");

    		let stationConnections = [];

    		// console.log(DOMconnections);

    		for (var j = 0; j < DOMconnections.length; j++) {
    			let DOMconnection = DOMconnections[j];
    				// console.error(DOMconnection);
    			if( DOMconnection.className.search("line") != -1 ){
    				stationConnections.push( DOMconnection.className );
    			}
    		}


    		parts.push({"name":stationName,"type":stationType,"connected":stationHasConnection,"connections":stationConnections});

    	}

    	else if ( partType == "line" ){

			let isDashed = DOMpart.classList.contains("dashed");
			parts.push(isDashed ? "block-dashed" : "block");
			


    	}


    }

    // return JSON.stringify(
	return {"line":[lineType,lineNumber,lineColor],"parts":parts}


    	// );
	}




	importJSON( object = null ){


	let lineNameContainer = this.parent.outputdragzone.querySelector(".linename .connectionline");

	let lineTypeBox = lineNameContainer.children[0];
	let lineNumberBox = lineNameContainer.children[1];

	let lineType = object.line[0];
	// console.log(lineType);
	let lineNumber = object.line[1];
	// console.log(lineNumber);
	let lineColor = object.line[2];
	// console.log(lineColor);


    lineNumberBox.setAttribute("value",lineNumber);

    
    // Line number
    if( lineNumber[1] == "B" ){
    	lineNumber = lineNumber[0]+"   ";
    	lineNameContainer.children[1].setAttribute("bis","bis");
    }

    // Set the line's name/number
    lineNameContainer.setAttribute("type",lineType);
    lineNumberBox.setAttribute("truename",lineNumber);
    lineNumberBox.className = object.line[0] + " connectionpoint line"+object.line[1];

	// Set the full line's color 
	GLOBALColor = lineColor;
	this.parent.ChangeSVGColors(GLOBALColor);

	// Set the line type's icon
	switch (lineType){
			
		case "metro":
			lineTypeBox.src = "blocks/connections/pointM.svg";
		break;
		case "RER":
			lineTypeBox.src = "blocks/connections/pointRER.svg";
		break;
		case "Train":
			lineTypeBox.src = "blocks/connections/pointTrain.svg";
		break;
		case "Tram":
			lineTypeBox.src = "blocks/connections/pointTram.svg";
			lineNumberBox.style.backgroundImage = "url('blocks/connections/trams/" + lineNumber.substring(0,lineNumber.length-1) + lineNumber.substring(lineNumber.length-1).toUpperCase() + ".svg')";

		break;

	}

	// Clear all existing parts 

	for (let i = this.parent.output.children.length - 2; i >= 1; i--) {
		this.parent.output.removeChild(this.parent.output.children[i]);
	}

	// console.log(object);			
	// console.log(object.parts);
	// console.log(object.parts.length);


	// Now it get back all the parts (here the blocks)

	for (var i = 0; i < object.parts.length ; i++) {
		let DOMpart = object.parts[i];
		let toAdd;

		// console.log(DOMpart);			


		// If block
		if ( typeof DOMpart == "string" ){


			toAdd = document.createElement("div");
			this.parent.output.insertBefore(toAdd,this.parent.lastZone);
			toAdd.className = "blockcontainer line";
			toAdd.draggable = "true";
			if (DOMpart === "block-dashed") {
				toAdd.classList.add("dashed");
			}
			toAdd.innerHTML = pathHTML.replace("#fcc907",GLOBALColor);
			toAdd = null;


			


		}

		// If point
		else{

			let pointType = DOMpart.type;
			let isConnected = DOMpart.connected;

			toAdd = document.createElement("div");
			this.parent.output.insertBefore(toAdd,this.parent.lastZone);
			
			toAdd.className = "blockcontainer point";
			toAdd.draggable = "true";
			toAdd.innerHTML = pointHTML.replace("#fcc907",GLOBALColor).replace("Station",DOMpart.name);

			let newPointImg = toAdd.children[0];
			let newPointImgContainer = newPointImg.children[0];
			let newPointName = toAdd.children[1];
			let newPointConnection = toAdd.querySelector(".connection");

			newPointImg.setAttribute("name",pointType);

			if( pointType == "pointterminus" ){
				newPointName.className = "name terminus";
				newPointImg.innerHTML = pointTerminus.replace("#fcc907",GLOBALColor)
			}
			if( pointType == "pointempty" ){
				newPointName.className = "name";
				newPointImg.innerHTML = pointEmpty.replace("#fcc907",GLOBALColor)
			}
			if( pointType == "pointcorr" ){
				newPointName.className = "name";
				newPointImg.innerHTML = pointCorr.replace("#fcc907",GLOBALColor)
			}






			if( isConnected ){
				toAdd.className += " connected";

				let addedMetro = false;
				let addedRER = false;
				let addedTrain = false;
				let addedTram = false;
				

				for (var y = DOMpart.connections.length - 1; y >= 0; y--) {
					let localConnection = DOMpart.connections[y];

					let localType = localConnection.split(" ")[0];

					let trueNumber = localConnection.split(" ")[2].split("line")[1];


					// Add connection rows
					if( localType == "RER" && !addedRER ){
						let newConnectionLine = document.createElement("div");
						
						if( !addedMetro ){
							newPointConnection.insertBefore(newConnectionLine,newPointConnection.firstElementChild);
						}
						else{
							newPointConnection.insertBefore(newConnectionLine,newPointConnection.firstElementChild.nextElementSibling);							
						}
						

						newConnectionLine.className = "connectionline";
						newConnectionLine.setAttribute("type","RER");
						// newConnectionLine.innerHTML='<button class="connectionpoint addConnection"></button>';						
						addedRER = true;

					}
					if( localType == "metro" && !addedMetro ){
						let newConnectionLine = document.createElement("div");
						
						if(addedRER || addedTram || addedTrain){
							newPointConnection.insertBefore(newConnectionLine,newPointConnection.firstElementChild);
						}
						else{
							newPointConnection.insertBefore(newConnectionLine,newPointConnection.lastElementChild);
						}

						newConnectionLine.className = "connectionline";
						newConnectionLine.setAttribute("type","metro");
						// newConnectionLine.innerHTML='<button class="connectionpoint addConnection"></button>';						
						addedMetro = true;
					}
					if( localType == "Train" && !addedTrain ){
						let newConnectionLine = document.createElement("div");
						if( addedTram ){
							newPointConnection.insertBefore(newConnectionLine,newPointConnection.lastElementChild.previousElementSibling);
						}
						else{
							newPointConnection.insertBefore(newConnectionLine,newPointConnection.lastElementChild);
						}

						newConnectionLine.className = "connectionline";
						newConnectionLine.setAttribute("type","Train");
						// newConnectionLine.innerHTML='<button class="connectionpoint addConnection"></button>';						
						addedTrain = true;

					}
					if( localType == "Tram" && !addedTram ){
						let newConnectionLine = document.createElement("div");
						newPointConnection.insertBefore(newConnectionLine,newPointConnection.lastElementChild);
						newConnectionLine.className = "connectionline";
						newConnectionLine.setAttribute("type","Tram");
						// newConnectionLine.innerHTML='<button class="connectionpoint addConnection"></button>';						
						addedTram = true;
					}

					// Add connections
					let newConnectionNumber = document.createElement("span");
					let linetoInsert = newPointConnection.querySelector("[type="+ localType + "]");
					linetoInsert.insertBefore( newConnectionNumber , linetoInsert.lastElementChild);
					newConnectionNumber.className = localConnection;
					newConnectionNumber.setAttribute("value",trueNumber);
					newConnectionNumber.setAttribute("truename",trueNumber);

					if ( localType == "Tram" ){
						newConnectionNumber.style.backgroundImage = "url('blocks/connections/trams/t" + trueNumber.slice(1) + ".svg')";
					}

					// Now local orders : 

					let numericOrder;

					if( localType == "metro" ){

					numericOrder = parseInt(trueNumber);

					if(numericOrder == null || !numericOrder || numericOrder < 1 || numericOrder > 19 ){
						continue;
					}

					if( trueNumber == "3B" || numericOrder > 3 ){
						numericOrder += 1;
						if(trueNumber == "3B"){
							newConnectionNumber.setAttribute("bis","bis");
							newConnectionNumber.setAttribute("truename","3    ");
						}

					}
					if( trueNumber == "7B" || numericOrder > 8 ){
						numericOrder += 1;
						if(trueNumber == "7B"){
							newConnectionNumber.setAttribute("bis","bis");
							newConnectionNumber.setAttribute("truename","7   ");
						}
					}
					
						newConnectionNumber.style.order = numericOrder;

					}
					// Case RER
					else if (localType == "RER"){


						if( trueNumber.length !=1  ||  trueNumber.charCodeAt(0)<65 || trueNumber.charCodeAt(0) > 69 ){continue;}
						numericOrder = trueNumber.charCodeAt(0);


						newConnectionNumber.style.order = numericOrder - 65;
					}

					// Case Train 
					else if (localType == "Train"){

						let lines = ["H","J","K","L","N","P","R","U","V"];


						if( trueNumber.length !=1  ||  lines.indexOf(trueNumber) == -1 ){continue;}
						numericOrder = lines.indexOf(trueNumber)


						newConnectionNumber.style.order = numericOrder;
					}

					else if (localType == "Tram" ){

						trueNumber = trueNumber.slice(1);
						
						let numericOrder = parseInt(trueNumber);
						if(!numericOrder || numericOrder < 1 || numericOrder > 13){continue;}
						if( trueNumber == "3B" || trueNumber > 3 ){
							numericOrder++;
						}

						newConnectionNumber.style.order = numericOrder;

						
						
					}












				}


				// After creating all connection lines, adjust bottom padding based on number of rows
				let maxConnectionLines = newPointConnection.childElementCount - 1; // exclude addConnectionLine button
				switch(maxConnectionLines){
					case 2:
						if(!this.parent.output.classList.contains("pad2")) this.parent.output.classList.add("pad2");
						break;
					case 3:
						if(!this.parent.output.classList.contains("pad3")) this.parent.output.classList.add("pad3");
						break;
					case 4:
						if(!this.parent.output.classList.contains("pad4")) this.parent.output.classList.add("pad4");
						break;
					case 5:
						if(!this.parent.output.classList.contains("pad5")) this.parent.output.classList.add("pad5");
						break;
				}


			}
		

			toAdd = null;


		}



		toAdd = null;

		DOMpart = null;

	}



}



}








// let ligne7bis = '{"line":["metro","7B","rgb(117, 205, 137)"],"parts":[{"name":"Terminus 1","type":"pointterminus","connected":false,"connections":[]},"block",{"name":"Station 1","type":"pointempty","connected":false,"connections":[]},"block",{"name":"Station 2","type":"pointcorr","connected":false,"connections":[]},"block",{"name":"Terminus 2","type":"pointterminus","connected":false,"connections":[]}]}';
// let ligne7bis = '{"line":["Tram","t3B","rgb(245, 127, 258)"],"parts":[{"name":"Terminus 1","type":"pointterminus","connected":false,"connections":[]},"block",{"name":"Station 1","type":"pointempty","connected":false,"connections":[]},"block",{"name":"Station 2","type":"pointcorr","connected":false,"connections":[]},"block",{"name":"Terminus 2","type":"pointterminus","connected":false,"connections":[]}]}'
// importJSON(JSON.parse(ligne7bis));

let ligne7bis = '{"line":["metro","7B","rgb(117, 205, 137)"],"parts":[{"name":"Terminus 1","type":"pointterminus","connected":true,"connections":["RER connectionpoint lineA","RER connectionpoint lineC"]},"block",{"name":"Station 1","type":"pointempty","connected":false,"connections":[]},"block",{"name":"Station 2","type":"pointcorr","connected":true,"connections":\
["Tram connectionpoint lineT4","metro connectionpoint line7B","RER connectionpoint lineA","metro connectionpoint line7","metro connectionpoint line8","metro connectionpoint line3B","Train connectionpoint lineJ","RER connectionpoint lineE"]},"block",{"name":"Terminus 2","type":"pointterminus","connected":false,"connections":[]}]}';


ligne7bis = '{"line":["metro","1","rgb(117, 205, 137)"],"parts":[{"name":"Terminus 1","type":"pointterminus","connected":true,"connections":["RER connectionpoint lineC","RER connectionpoint lineA"]},"block",{"name":"Station 1","type":"pointempty","connected":false,"connections":[]},"block",{"name":"Station 2","type":"pointcorr","connected":true,"connections":["metro connectionpoint line3B","metro connectionpoint line8","metro connectionpoint line7","metro connectionpoint line7B","RER connectionpoint lineE","RER connectionpoint lineA","Train connectionpoint lineJ","Tram connectionpoint lineT4"]},"block",{"name":"Terminus 2","type":"pointterminus","connected":false,"connections":[]},"block","block","block","block",{"name":"Station","type":"pointterminus","connected":true,"connections":["metro connectionpoint line1","Train connectionpoint lineH","Tram connectionpoint lineT2","Tram connectionpoint lineT4","Tram connectionpoint lineT3B"]}]}';