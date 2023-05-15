class VehicleMng {
	constructor() {
		this.vehicles = {};
		this.selectedVehicle = null;
	}

	getVehicleStopMsg() {
		if (!this.selectedVehicle) return null;
		return { type: 'stopVehicle', id: this.selectedVehicle.id };
	}

	getVehicleResumeMsg() {
		if (!this.selectedVehicle) return null;
		return { type: 'resumeVehicle', id: this.selectedVehicle.id };
	}

	updateVehicleObjects(vehicleData) {
		let id = null,
			pos = null;
		for (let i in vehicleData.added) {
			id = vehicleData.added[i];
			pos = vehicleData.data[id].position;
			let typeId = vehicleData.data[id].typeId;
			this.vehicles[id] = new Vehicle(id, pos[0], pos[1], typeId);
			this.vehicles[id].addTo(stage);
		}
		for (let i in vehicleData.removed) {
			id = vehicleData.removed[i];
			if (this.selectedVehicle && id == this.selectedVehicle.id) {
				this.selectedVehicle = null;
				document.querySelector('#vehicleOptions').style.display = 'none';
				network.resetMark();
				closeOptions();
			}

			this.vehicles[id].removeFrom(stage);
			delete this.vehicles[id];
		}
	}

	drawVehicles(vehicleData) {
		let id = null,
			data = null;

		for (let i in vehicleData.all) {
			id = vehicleData.all[i];
			data = vehicleData.data[id];
			this.vehicles[id].move(data.position[0], data.position[1], data.angle, network.offset);
		}
		two.update();
	}

	clearNetwork() {
		for (const id in this.vehicles) {
			this.vehicles[id].removeFrom(stage);

			delete this.vehicles[id];
		}
		two.update();
	}

	drawOptions(vehicle, pathId) {
		if (this.selectedVehicle) this.selectedVehicle.deselect();
		vehicle.select();
		this.selectedVehicle = vehicle;

		document.querySelector('#vehicleOptions').style.display = 'block';
		document.querySelector('#vehicleOptionId').innerHTML = vehicle.id;
		document.querySelector('#vehicleOptionType').innerHTML = vehicle.typeId;
		document.querySelector('#vehicleOptionsPath').innerHTML = 'None';
		document.querySelector('#newDestVehicleBtn').classList.add('hidden');
		if (pathId) {
			document.querySelector('#vehicleOptionsPath').innerHTML = pathId;
			document.querySelector('#newDestVehicleBtn').classList.remove('hidden');
		}
	}
}
