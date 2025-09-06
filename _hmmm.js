
        const switchGroup = document.querySelector('#custom-line .custom-switch-group');
        const switches = switchGroup ? switchGroup.querySelectorAll('.custom-switch') : [];
        const input = document.getElementById('custom-line-input');
        const validateBtn = document.getElementById('validate-custom-btn');
        let selectedType = 'metro';

        switches.forEach(btn => {
            btn.onclick = function() {
                switches.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedType = btn.getAttribute('data-type');
            };
        });

        validateBtn.onclick = () => {
            const lineValue = input.value.trim();
            if (!lineValue) {
                input.focus();
                return;
            }
            this.onCustomLineSelected && this.onCustomLineSelected({ type: selectedType, value: lineValue });
        };




        		this.eventManager.onCustomLineSelected = function(data) {
			// Ajout effectif de la ligne custom dans la grille
			const { type, value } = data;
			// Vérification simple
			if (!type || !value) return;

			let lineNameZone = document.querySelector('.linename');
			if (!lineNameZone) return;

			let connectionLine = document.createElement('div');
			connectionLine.className = 'connectionline';
			connectionLine.setAttribute('type', type);


			let icon = document.createElement('img');
			if (type === 'metro') icon.src = 'blocks/connections/pointM.svg';
			else if (type === 'RER') icon.src = 'blocks/connections/pointRER.svg';
			else if (type === 'Train') icon.src = 'blocks/connections/pointTrain.svg';
			icon.className = 'connectionType';
			connectionLine.appendChild(icon);

			// Ajoute le span de la ligne
			let span = document.createElement('span');
			span.className = type + ' connectionpoint line' + value;
			span.setAttribute('value', value);
			span.setAttribute('truename', value);
			connectionLine.appendChild(span);

			// Ajoute le bouton addConnection
			let addBtn = document.createElement('button');
			addBtn.className = 'addConnection';
			connectionLine.appendChild(addBtn);

			// Ajoute la nouvelle ligne dans la grille
			lineNameZone.appendChild(connectionLine);
		};
