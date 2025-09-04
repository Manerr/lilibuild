class EventManager {
	constructor(app) {
		this.app = app;
		this.boundMethods = new Map();
	}



	// Initialize all event listeners
	initializeEvents() {
		this.bindOutputEvents();
		this.bindButtonEvents();
		this.bindWindowEvents();
		this.bindFileEvents();
		this.bindExportEvents();
		this.bindConnectionsEvents();
		this.bindCustomLineEvents();
	}

	// Bind custom line UI events - soon
	bindCustomLineEvents() {


	}

	// Bind output/drag zone events
	bindOutputEvents() {
		// Output drag zone events
		this.app.outputdragzone.onclick = this.manageClick.bind(this.app);
		this.app.outputdragzone.ondragend = this.app.whenDeDragging.bind(this.app);

		// Output container events
		this.app.output.ondragend = this.app.outputOndragend.bind(this.app);
		this.app.output.onmouseleave = this.app.removeIndicator.bind(this.app);
		this.app.output.onmousemove = this.app.outputOnmousemove.bind(this.app);


	}

	// Bind button events
	bindButtonEvents() {
		// Aside container events (mode switching)
		this.app.asideContainer.onclick = (event) => {
			let target = event.target;

			if (target.name) {
				let buttons = target.parentElement.querySelectorAll(".switch");
				for (let i = buttons.length - 1; i >= 0; i--) {
					buttons[i].className = "modern switch";
				}

				target.className = "selected modern switch";
				CURRENTLY_DOING = target.value;

				if (CURRENTLY_DOING == deleting) {
					document.body.className = "deleting";
				} else if (document.body.className.length) {
					document.body.className = "";
				}
			}
		};

		// Reset button
		this.app.resetButton.onclick = () => {
			if (confirm("[Are you sure to reset the app's state and delete saved data?\nIt's only useful if you think something is broken.")) {
				// Bypass saving on reload
				window.onbeforeunload = undefined;
				window.onpagehide = undefined;
				localStorage.removeItem("lilibuild");
				localStorage.lilibuild = ligne12JSON;
				document.location.reload();
			}
		};

		// Save button
		this.app.saveButton.onclick = () => {
			this.app.download(dumbLineName() + ".json", JSON.stringify(this.app.exporter.exportJSON()));
		};

		// Open button
		this.app.openButton.onclick = () => {
			this.app.open();
		};

		// Export button
		this.app.exportButton.onclick = this.app.exportPicture.bind(this.app);

		// Info button
		this.app.infoButton.onclick = () => {
			this.app.aboutWindow.style.display = "flex";
		};

		// Print button
		this.app.printButton.onclick = this.app.preparePrint.bind(this.app);
	}



	// Bind window events
	bindWindowEvents() {
		// Window load event
		window.onload = this.onloadEvent.bind(this);

		// Auto-save interval wtf is this not always working 
		setInterval(function() {
			this.app.saveLocalStorage();
		}.bind(this), 1000 * SAVE_INTERVAL)

		document.onbeforeunload = function() {
			// console.log(this.app);
			this.app.saveLocalStorage();
		}.bind(this);

		window.onpagehide = function(e) {
			// console.log(this.app);
			this.app.saveLocalStorage();

			e.preventDefault();

			return false;
		}.bind(this);

	}

	onloadEvent() {
		this.app.loadLocalStorage();
	}

	bindFileEvents() {
		this.app.fileInput.oninput = function() {
			let file = this.app.fileInput.files[0];
			if(!file) return;
			file.text().then(function(result) {
				this.app.exporter.importJSON(JSON.parse(result));
			}.bind(this));
		}.bind(this);
	}


	// Bind export format popup events
	bindExportEvents() {
		// This will be called when showExportFormatPopup is invoked
		// The actual event binding happens dynamically in showExportFormatPopup
	}

	// Method to handle export format popup events (called from showExportFormatPopup)
	bindExportFormatPopupEvents(exportPopup, formatOptions) {
		// Handle format selection
		formatOptions.forEach(option => {
			option.onclick = () => {
				// Remove previous selection
				formatOptions.forEach(opt => opt.classList.remove('selected'));
				// Add current selection
				option.classList.add('selected');

				// Get selected format
				const format = parseInt(option.getAttribute('data-format'));

				// Close popup
				exportPopup.style.display = 'none';

				// Export with selected format
				this.app.performExport(format);
			};
		});

		// Close popup when clicking outside
		exportPopup.onclick = (e) => {
			if (e.target === exportPopup) {
				exportPopup.style.display = 'none';
			}
		};
	}

	// Clean up all event listeners
	// cleanup(){
	//     // Remove all event listeners
	//     this.app.outputdragzone.onclick = null;
	//     this.app.outputdragzone.ondragend = null;
	//     this.app.output.ondragend = null;
	//     this.app.output.onmouseleave = null;
	//     this.app.output.onmousemove = null;

	//     this.app.asideContainer.onclick = null;
	//     this.app.resetButton.onclick = null;
	//     this.app.saveButton.onclick = null;
	//     this.app.openButton.onclick = null;
	//     this.app.exportButton.onclick = null;
	//     this.app.infoButton.onclick = null;
	//     this.app.printButton.onclick = null;

	//     window.onload = null;
	//     window.onbeforeunload = null;

	//     this.app.fileInput.oninput = null;

	//     // Clear bound methods cache
	//     this.boundMethods.clear();
	// }

	manageClick(event) {

		let currentElement = event.target;
		let currentType = currentElement.name;

		if (!currentType) {
			currentType = currentElement.getAttribute("name");
		}

		if (CURRENTLY_DOING == pointing && currentType == "path") {

			if (currentElement.parentElement.classList.contains("dashed")) currentElement.parentElement.classList.remove("dashed");
			else currentElement.parentElement.classList.add("dashed");

		}






		if (CURRENTLY_DOING == drawingpath || CURRENTLY_DOING == drawingpoint) {
			this.outputOnclick(event);
			return;
		}




		let trueCurrentElement = currentElement.parentElement;


		if (CURRENTLY_DOING == deleting) {


			// Deleting a single connection
			if (currentElement.className.search("connectionpoint") != -1 && currentElement.className.search("addConnection") == -1) {
				currentElement.remove();
				return;
			}
			// Deleting connection type
			if (currentElement.className == "connectionType") {
				currentElement.parentElement.remove();
				return;
			}


			if (trueCurrentElement.className != "blockcontainer line this.insertbeforeit") { 
				this.output.removeChild(trueCurrentElement); 
				this.manageGradients();
			}
			if (this.output.childElementCount == 1) {
				this.insertbeforeit.style.display = "block";
			}
			return;

		}

		if (SWITCHING_CONNECTION && currentType && currentType.indexOf("point") != -1 && currentElement.type != "submit") {

			console.log(currentType);

			if (trueCurrentElement.className == "blockcontainer point") {
				trueCurrentElement.className = "blockcontainer point connected";
				if (currentType != "pointterminus") {


					currentElement.innerHTML = pointCorr.replace("rgb(13, 140, 93)", this.line.color);
					currentElement.setAttribute("name", "pointcorr");
					// currentElement.setname = "pointcorr";
				}
				// }

			} else {
				trueCurrentElement.className = "blockcontainer point";
			}


		}

		//then you're not deleting but interacting
		else if (!DELETING_POINTS) {

			// console.log(currentElement.children);

			// Managaing connection type
			if (currentElement.className == "connectionType") {
				if (currentElement.parentElement.getAttribute("type") == "metro") {
					currentElement.parentElement.setAttribute("type", "RER");
					currentElement.src = "blocks/connections/pointRER.svg";
				} else if (currentElement.parentElement.getAttribute("type") == "RER") {
					currentElement.parentElement.setAttribute("type", "Train");
					currentElement.src = "blocks/connections/pointTrain.svg";
				} else if (currentElement.parentElement.getAttribute("type") == "Train") {
					currentElement.parentElement.setAttribute("type", "Tram");
					currentElement.src = "blocks/connections/pointTram.svg";
				} else if (currentElement.parentElement.getAttribute("type") == "Tram") {
					currentElement.parentElement.setAttribute("type", "metro");
					currentElement.src = "blocks/connections/pointM.svg";
				}
			} else if (currentElement.className == "addConnection" || (currentElement.className.indexOf("connectionpoint") != -1 && currentElement.className.indexOf("addConnection") == -1 && currentElement.parentElement.parentElement.className == "linename")) {
				const lineNameContainer = currentElement.parentElement; // .connectionline in .linename
				this.showCustomPrompt({ type: "connection" }).then((line) => {
					if (!line) return;

					let transportType;
					let clickedButton = this.choicesGrid.querySelector(`[data-value="${line}"]`);
					if (clickedButton) {
						let spanElement = clickedButton.querySelector('span');
						if (spanElement) {
							transportType = spanElement.classList[1];
						} else {
							// Some choices (e.g., Tram icons) may not have a span with classes
							if ((line + "").toUpperCase().startsWith("T")) transportType = "Tram";
							if(!this.output.classList.contains("tramstyle")) this.output.classList.add("tramstyle");
						}
					}
					if (!transportType) {
						const upper = (line + "").toUpperCase();
						const trainLines = ["H", "J", "K", "L", "N", "P", "R", "U", "V"];
						if (upper.length === 1 && upper >= 'A' && upper <= 'E') transportType = "RER";
						else if (upper.length === 1 && trainLines.includes(upper)) transportType = "Train";
						else if (upper.startsWith("T")) transportType = "Tram";
						else transportType = "metro";
						


					}

					const lineTypeBox = lineNameContainer.children[0];
					lineNameContainer.setAttribute("type", transportType);
					switch (transportType) {
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
							break;
					}

					if(transportType != "Tram" && this.output.classList.contains("tramstyle")) this.output.classList.remove("tramstyle");

					if (line && lineNameContainer.querySelector(".line" + line) == null) {
						let newConnection = document.createElement("span");
						newConnection.setAttribute("bis", "");
						newConnection.className = transportType + " connectionpoint line" + line;
						newConnection.setAttribute("value", line);
						newConnection.setAttribute("truename", line);
						let numericOrder;
						// Case metro
						if (transportType == "metro") {
							let numericOrder = parseInt(line);
							if (numericOrder == null || !numericOrder || numericOrder < 1 || numericOrder > 19) {
								return;
							}
							if (line == "3B" || numericOrder > 3) {
								numericOrder += 1;
								if (line == "3B") {
									newConnection.setAttribute("bis", "bis");
									newConnection.setAttribute("truename", "3    ");
								}
							}
							if (line == "7B" || numericOrder > 8) {
								numericOrder += 1;
								if (line == "7B") {
									newConnection.setAttribute("bis", "bis");
									newConnection.setAttribute("truename", "7   ");
								}
							}
							newConnection.style.order = numericOrder;
						}
						// Case RER
						else if (transportType == "RER") {
							if (line.length != 1 || line.charCodeAt(0) < 65 || line.charCodeAt(0) > 69) { return; }
							numericOrder = line.charCodeAt(0);
							newConnection.style.order = numericOrder - 65;
						}
						// Case Train 
						else if (transportType == "Train") {
							let lines = ["H", "J", "K", "L", "N", "P", "R", "U", "V"];
							if (line.length != 1 || lines.indexOf(line) == -1) { return; }
							numericOrder = lines.indexOf(line)
							newConnection.style.order = numericOrder;
						} else if (transportType == "Tram") {
							let tramNum = line.replace(/^[Tt]/, "");
							let numericOrder = parseInt(tramNum);
							if (!numericOrder || numericOrder < 1 || numericOrder > 14) { return; }
							if (tramNum == "3B" || tramNum > 3) {
								numericOrder++;
							}
							newConnection.style.order = numericOrder;
							// Normalize tram value to lowercase (tX)
							newConnection.setAttribute("value", line.toLowerCase());
							newConnection.setAttribute("truename", line.toLowerCase());
							newConnection.style.backgroundImage = "url('blocks/connections/trams/" + line.substring(0, line.length - 1).toLowerCase() + line.substring(line.length - 1).toUpperCase() + ".svg')";
							newConnection.className = transportType + " connectionpoint line" + line;
						}
						// CURRENTLY JUST CHANGING CURRENT LINE'S
						if (lineNameContainer.parentElement.className == "linename" && currentElement.className.indexOf("addConnection") != -1) {
							let cleaningElements = document.querySelectorAll(".linename .connectionpoint");
							for (let i = cleaningElements.length - 1; i >= 0; i--) {
								let el = cleaningElements[i];
								if (el.className.indexOf("addConnection") == -1) { currentElement.parentElement.removeChild(el); }
							}
						}
						lineNameContainer.insertBefore(newConnection, currentElement);
						let newColor = getComputedStyle(newConnection).color;
						if (newColor == "transparent" || newColor == "rgb(35, 31, 32)" || newColor == "rgb(255, 255, 255)") {
							newColor = getComputedStyle(newConnection).backgroundColor;
						}
						if (lineNameContainer.parentElement.className == "linename" && currentElement.className.indexOf("addConnection") != -1) {
							this.ChangeSVGColors(newColor);
						}
						if (currentElement.className.indexOf("connectionpoint") != -1 && currentElement.className.indexOf("addConnection") == -1) {
							this.ChangeSVGColors(newColor);
							currentElement.parentElement.removeChild(currentElement);
						}
					}
				});
			}
			// Adding new connection line or managing connections
			else if (currentElement.className == "connectionpoint addConnectionLine") {

				// if(currentElement.parentElement.childElementCount > 4 ) return;

				// Show custom prompt to choose transport type and line directly
				this.showCustomPrompt({
					type: "connection"
				}).then(function(line) {
					if (!line) return;


					// Extract transport type from the clicked button's span class
					let clickedButton = this.choicesGrid.querySelector(`[data-value="${line}"]`);
					if (!clickedButton) return;

					let spanElement = clickedButton.querySelector('span');

					// console.log(clickedButton);


					// Extract transport type from class (e.g., "connectionpoint metro line1" -> "metro")
					// let classList = spanElement.className.split(' ');
					let transportType;

					if (spanElement) {
						transportType = spanElement.classList[1];
					}
					//No classes for them (they're not using the connection point style)
					else {
						transportType = "Tram";
					}

					// Map transport type to correct SVG file
					let svgFile;
					switch (transportType) {
						case "metro":
							svgFile = "blocks/connections/pointM.svg";
							break;
						case "RER":
							svgFile = "blocks/connections/pointRER.svg";
							break;
						case "Train":
							svgFile = "blocks/connections/pointTrain.svg";
							break;
						case "Tram":
							svgFile = "blocks/connections/pointTram.svg";
							break;
					}

					// Check if this transport type line already exists
					let existingLine = currentElement.parentElement.querySelector(".connectionline[type='" + transportType + "']");

					if (!existingLine) {
						// Create new line if it doesn't exist
						let newConnectionLine = document.createElement("div");
						newConnectionLine.className = "connectionline";
						newConnectionLine.setAttribute("type", transportType);


						//Small piece of code that adds some padding on the bottom to be sure there's no y overflow (css has to bee fixedddddd)
						let maxConnectionLines = currentElement.parentElement.childElementCount

						switch (maxConnectionLines) {
							case 2:
								if (!this.output.classList.contains("pad2")) this.output.classList.add("pad2");
								break;
							case 3:
								if (!this.output.classList.contains("pad3")) this.output.classList.add("pad3");
								break;
							case 4:
								if (!this.output.classList.contains("pad4")) this.output.classList.add("pad4");
								break;
							case 5:
								if (!this.output.classList.contains("pad5")) this.output.classList.add("pad5");
								break;
						}


						currentElement.parentElement.insertBefore(newConnectionLine, currentElement);

						// Add the connection directly to the new line
						this.eventManager.addConnectionToLine(newConnectionLine, line, transportType);
					} else {
						// Line already exists, add the connection directly
						this.eventManager.addConnectionToLine(existingLine, line, transportType);
					}
				}.bind(this));

			}



			//type is a station point
			else if (currentType && currentType.indexOf("point") != -1) {

				// console.log(currentType);


				switch (currentType) {

					case "pointterminus":
						if (currentElement.parentElement.className == "blockcontainer point") {
							currentElement.parentElement.className = "blockcontainer point connected";
							return;
						}


						currentElement.innerHTML = pointEmpty.replace(this.DEFAULT_COLOR, this.line.color);
						currentElement.setAttribute("name", "pointempty");


						currentElement.parentElement.querySelector(".name").className = "name";
						currentElement.parentElement.className = "blockcontainer point";
						break;
					case "pointempty":
						currentElement.innerHTML = pointCorr.replace(this.DEFAULT_COLOR, this.line.color);
						currentElement.setAttribute("name", "pointcorr");
						currentElement.parentElement.querySelector(".name").className = "name";
						currentElement.parentElement.className = "blockcontainer point connected";
						break;
					case "pointcorr":
						// console.warn(currentElement)
						// First of the line... 
						if (trueCurrentElement.previousElementSibling.previousElementSibling == null) {
							currentElement.innerHTML = pointTerminus.replace(this.DEFAULT_COLOR, this.line.color);
							currentElement.setAttribute("name", "pointterminus");
							// currentElement.src = "blocks/pointterminusLeft.svg";
						}
						if (trueCurrentElement.nextElementSibling.nextElementSibling == null) {
							currentElement.innerHTML = pointTerminus.replace(this.DEFAULT_COLOR, this.line.color);
							currentElement.setAttribute("name", "pointterminus");
							// currentElement.src = "blocks/pointterminusRight.svg";
						} else {
							currentElement.innerHTML = pointTerminus.replace(this.DEFAULT_COLOR, this.line.color);
							currentElement.setAttribute("name", "pointterminus");


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

	bindConnectionsEvents() {


		this.app.choicesGrid.onclick = function(event) {
			let origine = event.target;
			let value = origine.dataset.value;

			// alert(origine,value);

			this.custompromptWindow.style.display = "none";

			if (value) {
				resolve(value);
			} else {
				resolve(null);
			}

		}.bind(this.app);

	}

	// Helper method to add a connection to a specific line
	addConnectionToLine(connectionLine, line, transportType) {
		if (line && connectionLine.querySelector(".line" + line) == null) {
			let newConnection = document.createElement("span");
			newConnection.setAttribute("bis", "");
			newConnection.className = transportType + " connectionpoint line" + line;
			newConnection.setAttribute("value", line);
			newConnection.setAttribute("truename", line);
			let numericOrder;

			// Case metro
			if (transportType == "metro") {
				let numericOrder = parseInt(line);
				if (numericOrder == null || !numericOrder || numericOrder < 1 || numericOrder > 19) {
					return;
				}
				if (line == "3B" || numericOrder > 3) {
					numericOrder += 1;
					if (line == "3B") {
						newConnection.setAttribute("bis", "bis");
						newConnection.setAttribute("truename", "3   ");
					}
				}
				if (line == "7B" || numericOrder > 8) {
					numericOrder += 1;
					if (line == "7B") {
						newConnection.setAttribute("bis", "bis");
						newConnection.setAttribute("truename", "7   ");
					}
				}
				newConnection.style.order = numericOrder;
			}
			// Case RER
			else if (transportType == "RER") {
				if (line.length != 1 || line.charCodeAt(0) < 65 || line.charCodeAt(0) > 69) { return; }
				numericOrder = line.charCodeAt(0);
				newConnection.style.order = numericOrder - 65;
			}
			// Case Train 
			else if (transportType == "Train") {
				let lines = ["H", "J", "K", "L", "N", "P", "R", "U", "V"];
				if (line.length != 1 || lines.indexOf(line) == -1) { return; }
				numericOrder = lines.indexOf(line)
				newConnection.style.order = numericOrder;
			} else if (transportType == "Tram") {
				let tramNum = line.replace("T", "");
				let numericOrder = parseInt(tramNum);
				if (!numericOrder || numericOrder < 1 || numericOrder > 14) { return; }
				if (tramNum == "3B" || tramNum > 3) {
					numericOrder++;
				}
				newConnection.style.order = numericOrder;
				newConnection.setAttribute("value", line.toLowerCase());
				newConnection.setAttribute("truename", line.toLowerCase());
				newConnection.style.backgroundImage = "url('blocks/connections/trams/" + line.substring(0, line.length - 1).toLowerCase() + line.substring(line.length - 1).toUpperCase() + ".svg')";
				newConnection.className = transportType + " connectionpoint line" + line;
			}

			// Insert the new connection before the addConnection button
			let addButton = connectionLine.querySelector(".addConnection");
			if (addButton) {
				connectionLine.insertBefore(newConnection, addButton);
			} else {
				connectionLine.appendChild(newConnection);
			}

			// Apply color changes if needed
			let newColor = getComputedStyle(newConnection).color;
			if (newColor == "transparent" || newColor == "rgb(35, 31, 32)" || newColor == "rgb(255, 255, 255)") {
				newColor = getComputedStyle(newConnection).backgroundColor;
			}

			// Change SVG colors if this is in a linename container
			if (connectionLine.parentElement.className == "linename") {
				this.ChangeSVGColors(newColor);
			}
		}
	}


}