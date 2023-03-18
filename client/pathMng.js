class PathMng {
	selected = null;
	constructor() {}

	select(obj) {
		this.deselect();
		this.selected = obj;
		obj.stroke = 'orange';
	}

	deselect() {
		if (!this.selected) return;
		this.selected.stroke = 'black';
		this.selected = null;
	}

	fillOptions(event) {
		document.querySelector('#pathOptions').style.display = 'block';

		const id = document.querySelector('#pathId');
		const street = document.querySelector('#pathStreetName');
		const maxSpeed = document.querySelector('#pathMaxSpeed');
		const avgSpeed = document.querySelector('#pathAvgSpeed');

		id.innerHTML = event['id'];
		street.innerHTML = event['streetName'];
		maxSpeed.innerHTML = event['maxSpeed'];
		avgSpeed.innerHTML = event['averageSpeed'];
	}
}
