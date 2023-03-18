class TLightMng {
	selected = null;
	constructor() {}

	fillOptions(states, logicType) {
		document.querySelector('#tLightOptions').style.display = 'block';
		document.querySelector('#logicType').innerHTML = logicType;

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

	getStateSetMsg() {
		if (!this.selected) return null;

		let state = document.querySelector('#statusInput');
		let dur = document.querySelector('#durationInput');

		let rows = document.querySelectorAll('#tlightTable > tbody > tr');
		let ri = 0;
		for (let r of rows) {
			if (r.className == 'selectedRow') break;
			ri += 1;
		}
		if (ri == rows.length) return null;

		const msg = { type: 'trafficLightStateUpdate', id: this.selected, state: state.value, duration: dur.value, index: ri };
		if (state && dur) return msg;

		return null;
	}

	getStateDelMsg() {
		if (!this.selected) return null;

		let rows = document.querySelectorAll('#tlightTable > tbody > tr');
		if (rows.length < 2) return null;

		let ri = 0;
		for (let r of rows) {
			if (r.className == 'selectedRow') break;
			ri += 1;
		}
		if (ri == rows.length) return null;

		const msg = { type: 'trafficLightStateDel', id: this.selected, index: ri };
		return msg;
	}

	getStateAddMsg() {
		if (!this.selected) return null;

		let state = document.querySelector('#statusInput');
		let dur = document.querySelector('#durationInput');

		const msg = { type: 'trafficLightStateAdd', id: this.selected, state: state.value, duration: dur.value };
		if (state && dur) return msg;

		return null;
	}
}
