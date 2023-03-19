class PathMng {
	selected = null;
	constructor() {}

	select(obj, id) {
		this.deselect();
		this.selected = { obj: obj, id: id };
		obj.stroke = 'orange';
		two.update();
	}

	deselect() {
		if (!this.selected) return;
		this.selected.obj.stroke = 'black';
		this.selected = null;
		two.update();
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

	getMaxSpeedMsg() {
		if (!this.selected) return null;
		const input = document.querySelector('#pathMaxSpeedInput');
		const speed = input.value > 1 ? input.value : 1;
		return { type: 'pathMaxSpeed', value: speed, id: this.selected.id };
	}

	closePathOptions() {
		document.querySelector('#pathOptions').style.display = 'none';
		closeOptions();
	}
}
