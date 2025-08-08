class EventManager {
    constructor(app) {
        this.app = app;
        this.boundMethods = new Map();
    }

    // Bind a method to the app instance and cache it
    bindMethod(methodName) {
        if (!this.boundMethods.has(methodName)) {
            this.boundMethods.set(methodName, this.app[methodName].bind(this.app));
        }
        return this.boundMethods.get(methodName);
    }

    // Initialize all event listeners
    initializeEvents() {
        this.bindOutputEvents();
        this.bindButtonEvents();
        this.bindWindowEvents();
        this.bindFileEvents();
        this.bindExportEvents();
    }

    // Bind output/drag zone events
    bindOutputEvents() {
        // Output drag zone events
        this.app.outputdragzone.onclick = this.bindMethod('manageClick');
        this.app.outputdragzone.ondragend = this.bindMethod('whenDeDragging');

        // Output container events
        this.app.output.ondragend = this.bindMethod('outputOndragend');
        this.app.output.onmouseleave = this.bindMethod('removeIndicator');
        this.app.output.onmousemove = this.bindMethod('outputOnmousemove');
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
                document.location.reload();
            }
        };

        // Save button
        this.app.saveButton.onclick = () => {
            this.app.download("line" + document.querySelector(".linename span").getAttribute("value") + ".json", JSON.stringify(this.app.exporter.exportJSON()));
        };

        // Open button
        this.app.openButton.onclick = () => {
            this.app.open();
        };

        // Export button
        this.app.exportButton.onclick = this.bindMethod('exportPicture');

        // Info button
        this.app.infoButton.onclick = () => {
            this.app.aboutWindow.style.display = "flex";
        };

        // Print button
        this.app.printButton.onclick = this.bindMethod('preparePrint');
    }

    // Bind window events
    bindWindowEvents() {
        // Window load event
        window.onload = this.bindMethod('loadLocalStorage');

        // Auto-save interval wtf is this not always working 
        setInterval(function(){
            this.app.saveLocalStorage();
        }.bind(this), 1000 * SAVE_INTERVAL)

        document.onbeforeunload = function (){
            console.log(this.app);
            this.app.saveLocalStorage();
        }.bind(this);

        window.onpagehide = function (e){
            console.log(this.app);
            this.app.saveLocalStorage();

            e.preventDefault();

            return false;
        }.bind(this);

    }

    bindFileEvents() {
        this.app.fileInput.oninput = function(){
            console.log(this.app.fileInput.files[0]);
            this.app.fileInput.files[0].text().then(function(result){
                this.app.exporter.importJSON(JSON.parse(result));
            });
        };
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
    cleanup() {
        // Remove all event listeners
        this.app.outputdragzone.onclick = null;
        this.app.outputdragzone.ondragend = null;
        this.app.output.ondragend = null;
        this.app.output.onmouseleave = null;
        this.app.output.onmousemove = null;
        
        this.app.asideContainer.onclick = null;
        this.app.resetButton.onclick = null;
        this.app.saveButton.onclick = null;
        this.app.openButton.onclick = null;
        this.app.exportButton.onclick = null;
        this.app.infoButton.onclick = null;
        this.app.printButton.onclick = null;
        
        window.onload = null;
        window.onbeforeunload = null;
        
        this.app.fileInput.oninput = null;
        
        // Clear bound methods cache
        this.boundMethods.clear();
    }
} 