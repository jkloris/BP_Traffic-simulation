class Vehicle {
	constructor(id, x, y) {
		this.id = id;
		this.width = 2.5;
		this.height = 6;

        let car = two.makeRoundedRectangle(x, y, this.width, this.height, this.width - 2);
		let window = two.makeRectangle(x, y, this.width, this.height - 2);
		let roof = two.makeRectangle(x, y, this.width - 0.5, this.width - 0.3);

		car.linewidth = 0.1;
		window.linewidth = 0.1;
		roof.linewidth = 0.1;
		car.fill = '#' + ((Math.random() * 0xffffff) << 0).toString(16);
		roof.fill = car.fill;
		window.fill = 'rgba(0,0,0, 0.5)';

		this.obj = { car: car, roof: roof, window: window };
	}
	move(x, y, angle, offset = { x: 0, y: 0 }) {
		this.obj.car.translation.x = x + offset.x;
		this.obj.roof.translation.x = x + offset.x;
		this.obj.window.translation.x = x + offset.x;

		this.obj.car.translation.y = -y + offset.y;
		this.obj.roof.translation.y = -y + offset.y;
		this.obj.window.translation.y = -y + offset.y;

		this.obj.car.rotation = (Math.PI * angle) / 180;
		this.obj.roof.rotation = (Math.PI * angle) / 180;
		this.obj.window.rotation = (Math.PI * angle) / 180;
	}

	select() {
		this.obj.car.stroke = 'red';
		this.obj.car.linewidth = 1;
		two.update();
	}
	deselect() {
		this.obj.car.stroke = 'black';
		this.obj.car.linewidth = 0.1;
		two.update();
	}

	removeFrom(stage) {
		stage.remove(this.obj.car);
		stage.remove(this.obj.roof);
		stage.remove(this.obj.window);

		two.remove(this.obj.car);
		two.remove(this.obj.roof);
		two.remove(this.obj.window);
	}

	addTo(stage) {
		stage.add(this.obj.car);
		stage.add(this.obj.window);
		stage.add(this.obj.roof);
	}
};
