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
		selectableTable();
	}
}
