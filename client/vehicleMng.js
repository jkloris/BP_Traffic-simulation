class VehicleMng {
	constructor() {
		this.vehicles = {};
		this.selectedVehicle = null;
	}

	updateVehicleObjects(vehicleData) {
		let id = null,
			pos = null;
		for (let i in vehicleData.added) {
			id = vehicleData.added[i];
			pos = vehicleData.data[id].position;
			this.vehicles[id] = new Vehicle(id, pos[0], pos[1]);
			this.vehicles[id].addTo(stage);
		}
		for (let i in vehicleData.removed) {
			id = vehicleData.removed[i];
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
}
