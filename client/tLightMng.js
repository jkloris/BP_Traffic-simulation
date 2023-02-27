class TLightMng {
	selected = null;
	constructor() {}

	fillOptions(states) {
		document.querySelector('#tLightOptions').style.display = 'block';
		let tbody = document.querySelector('#tlightTableBody');
		tbody.innerHTML = '';
		for (const [i, s] of Object.entries(states)) {
			let tr = document.createElement('tr');
			let num = document.createElement('td');
			let state = document.createElement('td');
			let duration = document.createElement('td');
			state.innerHTML = s.state;
			duration.innerHTML = s.duration;
			num.innerHTML = i;

			tr.append(num, state, duration);
			tbody.append(tr);
		}
		this.selectableTable();
        console.log(network.trafficLights)
	}

	selectableTable() {
		let rows = document.querySelectorAll('#tlightTable > tbody > tr');
		let statusInput = document.querySelector('#statusInput');
		let durationInput = document.querySelector('#durationInput');

		rows.forEach((r) =>
			r.addEventListener('click', (e) => {
				e.stopPropagation();
				console.log(e.currentTarget);
				statusInput.value = e.currentTarget.querySelector(':nth-child(2)').innerHTML;
				durationInput.value = e.currentTarget.querySelector(':nth-child(3)').innerHTML;

				rows.forEach((rw) => rw.classList.remove('selectedRow'));
				e.currentTarget.classList.add('selectedRow');
			})
		);
	}
}
