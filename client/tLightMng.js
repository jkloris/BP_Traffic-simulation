class TLightMng {
	selected = null;
	constructor() {}

	fillOptions(states) {
		document.querySelector('#vehicleOptions').style.display = 'none';
		document.querySelector('#tLightOptions').style.display = 'block';
		let tbody = document.querySelector('#tlightTableBody');
		tbody.innerHTML = '';
		for (const [i, s] of Object.entries(states)) {
			let tr = document.createElement('tr');
			let num = document.createElement('td');
			let state = document.createElement('td');
			let duration = document.createElement('td');
			state.innerHTML = s.state.replace(/G/g, 'g');
			duration.innerHTML = s.duration;
			num.innerHTML = i;

			tr.append(num, state, duration);
			tbody.append(tr);
		}
		this.selectableTable();
	}

	selectableTable() {
		let rows = document.querySelectorAll('#tlightTable > tbody > tr');
		let statusInput = document.querySelector('#statusInput');
		let durationInput = document.querySelector('#durationInput');

		rows.forEach((r) =>
			r.addEventListener('click', (e) => {
				e.stopPropagation();
				statusInput.value = e.currentTarget.querySelector(':nth-child(2)').innerHTML;
				durationInput.value = e.currentTarget.querySelector(':nth-child(3)').innerHTML;

				rows.forEach((rw) => rw.classList.remove('selectedRow'));
				e.currentTarget.classList.add('selectedRow');
			})
		);
	}

	getStateMsg() {
		if (!this.selected) return null;

		let cell = document.querySelector('.selectedRow :nth-child(2)');
		if (cell) return { type: 'trafficLightState', id: this.selected, state: cell.innerHTML };

		return null;
	}
}
